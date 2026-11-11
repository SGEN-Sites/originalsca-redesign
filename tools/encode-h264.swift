// Encodes raw BGRA frames read from stdin into an H.264 MP4 with macOS VideoToolbox (AVAssetWriter), no AI.
// Why: Chromium's MediaRecorder (tools/hero-loop.mjs) delivered about 42% of the bitrate asked for (1.2 Mbps for a
// 3 Mbps target) and smeared the hero's packaging and shelves into blocks. Here the bitrate is honoured and the
// encoder runs offline: H.264 High profile, CABAC, B-frames, a keyframe every 5 s, BT.709 colour tags.
// Usage: <raw BGRA frames on stdin> | encode-h264 <out.mp4> <width> <height> <fps> <frames> <kbps>
// Built by tools/hero-loop-vt.py (swiftc -O tools/encode-h264.swift -o _work/bin/encode-h264).
import AVFoundation
import CoreVideo
import Foundation

func fail(_ msg: String, _ code: Int32) -> Never {
  FileHandle.standardError.write((msg + "\n").data(using: .utf8)!)
  exit(code)
}

let a = CommandLine.arguments
guard a.count == 7, let W = Int(a[2]), let H = Int(a[3]), let FPS = Int32(a[4]), let N = Int(a[5]), let KBPS = Int(a[6]),
  W % 2 == 0, H % 2 == 0
else { fail("usage: encode-h264 <out.mp4> <even width> <even height> <fps> <frames> <kbps>", 2) }

let url = URL(fileURLWithPath: a[1])
try? FileManager.default.removeItem(at: url)
let writer: AVAssetWriter
do { writer = try AVAssetWriter(outputURL: url, fileType: .mp4) } catch { fail("writer: \(error)", 3) }

let settings: [String: Any] = [
  AVVideoCodecKey: AVVideoCodecType.h264,
  AVVideoWidthKey: W,
  AVVideoHeightKey: H,
  AVVideoColorPropertiesKey: [
    AVVideoColorPrimariesKey: AVVideoColorPrimaries_ITU_R_709_2,
    AVVideoTransferFunctionKey: AVVideoTransferFunction_ITU_R_709_2,
    AVVideoYCbCrMatrixKey: AVVideoYCbCrMatrix_ITU_R_709_2,
  ],
  AVVideoCompressionPropertiesKey: [
    AVVideoAverageBitRateKey: KBPS * 1000,
    AVVideoProfileLevelKey: AVVideoProfileLevelH264HighAutoLevel,
    AVVideoH264EntropyModeKey: AVVideoH264EntropyModeCABAC,
    AVVideoAllowFrameReorderingKey: true,
    AVVideoExpectedSourceFrameRateKey: Int(FPS),
    AVVideoMaxKeyFrameIntervalKey: Int(FPS) * 5,
  ],
]
let input = AVAssetWriterInput(mediaType: .video, outputSettings: settings)
input.expectsMediaDataInRealTime = false
let adaptor = AVAssetWriterInputPixelBufferAdaptor(
  assetWriterInput: input,
  sourcePixelBufferAttributes: [
    kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_32BGRA,
    kCVPixelBufferWidthKey as String: W,
    kCVPixelBufferHeightKey as String: H,
  ])
guard writer.canAdd(input) else { fail("cannot add the video input", 3) }
writer.add(input)
guard writer.startWriting() else { fail("startWriting: \(String(describing: writer.error))", 3) }
writer.startSession(atSourceTime: .zero)

let frameBytes = W * H * 4
let stdin = FileHandle.standardInput
var i = 0
while i < N {
  var data = Data(capacity: frameBytes)
  while data.count < frameBytes {
    let chunk = stdin.readData(ofLength: frameBytes - data.count)
    if chunk.isEmpty { break }
    data.append(chunk)
  }
  if data.count < frameBytes { fail("short read at frame \(i): \(data.count) of \(frameBytes) bytes", 4) }
  while !input.isReadyForMoreMediaData { usleep(2000) }
  guard let pool = adaptor.pixelBufferPool else { fail("no pixel buffer pool", 4) }
  var pb: CVPixelBuffer?
  CVPixelBufferPoolCreatePixelBuffer(nil, pool, &pb)
  guard let buf = pb else { fail("no pixel buffer at frame \(i)", 4) }
  CVPixelBufferLockBaseAddress(buf, [])
  let dst = CVPixelBufferGetBaseAddress(buf)!.assumingMemoryBound(to: UInt8.self)
  let stride = CVPixelBufferGetBytesPerRow(buf)
  data.withUnsafeBytes { (src: UnsafeRawBufferPointer) in
    let s = src.bindMemory(to: UInt8.self).baseAddress!
    for y in 0..<H { memcpy(dst + y * stride, s + y * W * 4, W * 4) }
  }
  CVPixelBufferUnlockBaseAddress(buf, [])
  if !adaptor.append(buf, withPresentationTime: CMTime(value: CMTimeValue(i), timescale: FPS)) {
    fail("append failed at frame \(i): \(String(describing: writer.error))", 5)
  }
  i += 1
}
input.markAsFinished()
writer.endSession(atSourceTime: CMTime(value: CMTimeValue(N), timescale: FPS))
let sem = DispatchSemaphore(value: 0)
writer.finishWriting { sem.signal() }
sem.wait()
if writer.status != .completed { fail("finishWriting: \(String(describing: writer.error))", 5) }
print("\(a[1]): \(i) frames \(W)x\(H) at \(FPS) fps, target \(KBPS) kbps")
