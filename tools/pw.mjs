// pw.mjs: tiny shared loader for headless Chromium (verification and capture tooling only, never shipped).
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const PW = process.env.PW_CORE || 'playwright-core';
export const { chromium } = require(PW);
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
