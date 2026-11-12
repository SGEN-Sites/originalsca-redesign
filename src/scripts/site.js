/* site.js: Originals redesign. Vanilla, no dependencies. Every URL comes from the page (#og-data, href, data-*),
   so the same build works at the domain root and under a Pages subpath. Everything degrades: no JS = all content
   visible, links point at the Los Angeles menu; reduced motion = final states, no film, no loops. */
(function () {
  'use strict';
  var d = document, w = window, html = d.documentElement;
  var DATA = {};
  try { DATA = JSON.parse((d.getElementById('og-data') || {}).textContent || '{}'); } catch (e) { DATA = {}; }
  var STORES = DATA.stores || {};
  var RM = w.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var FINE = w.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var SAVE = !!(navigator.connection && navigator.connection.saveData);
  var $$ = function (s, r) { return Array.prototype.slice.call((r || d).querySelectorAll(s)); };
  var $ = function (s, r) { return (r || d).querySelector(s); };
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  var store = function () { var s = html.getAttribute('data-store'); return STORES[s] ? s : (DATA.order ? DATA.order[0] : 'la'); };
  var safeSet = function (k, v) { try { localStorage.setItem(k, v); } catch (e) { /* private mode */ } };

  /* ---------- hours (America/Los_Angeles) ---------- */
  function laNow() {
    try {
      var parts = new Intl.DateTimeFormat('en-US', { timeZone: DATA.tz || 'America/Los_Angeles', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(new Date());
      var o = {}; parts.forEach(function (p) { o[p.type] = p.value; });
      var day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday);
      var hh = parseInt(o.hour, 10) % 24, mm = parseInt(o.minute, 10);
      return { day: day < 0 ? new Date().getDay() : day, min: hh * 60 + mm };
    } catch (e) { var n = new Date(); return { day: n.getDay(), min: n.getHours() * 60 + n.getMinutes() }; }
  }
  var toMin = function (t) { var p = t.split(':'); return +p[0] * 60 + +p[1]; };
  function fmt(t) { var m = toMin(t), h = Math.floor(m / 60), mi = m % 60, ap = h >= 12 ? 'PM' : 'AM'; h = h % 12 || 12; return h + (mi ? ':' + (mi < 10 ? '0' : '') + mi : '') + ' ' + ap; }
  function status(id) {
    var s = STORES[id]; if (!s || !s.hours) return null;
    var now = laNow(), today = s.hours[now.day];
    if (today && now.min >= toMin(today[0]) && now.min < toMin(today[1])) return { open: true, text: 'Open now · until ' + fmt(today[1]), day: now.day };
    if (today && now.min < toMin(today[0])) return { open: false, text: 'Closed · opens ' + fmt(today[0]) + ' today', day: now.day };
    var tm = s.hours[(now.day + 1) % 7];
    return { open: false, text: 'Closed · opens ' + (tm ? fmt(tm[0]) : '') + ' tomorrow', day: now.day };
  }

  /* ---------- store state ---------- */
  function applyStore(id, persist) {
    if (!STORES[id]) return;
    html.setAttribute('data-store', id);
    if (persist) safeSet('og-store', id);
    var s = STORES[id];
    $$('[data-shop]').forEach(function (a) { var k = a.getAttribute('data-shop'); var href = k === 'menu' ? s.menu : (s.cats && s.cats[k]) || s.menu; if (href) a.setAttribute('href', href); });
    $$('[data-store-name]').forEach(function (e) { e.textContent = s.short; });
    $$('[data-store-tel]').forEach(function (a) { a.setAttribute('href', 'tel:' + s.tel); a.setAttribute('aria-label', 'Call ' + s.name + ' ' + s.phone); });
    $$('[data-store-maps]').forEach(function (a) { a.setAttribute('href', s.maps); a.setAttribute('aria-label', 'Directions to ' + s.name); });
    $$('[data-store-set]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-store-set') === id)); });
    var st = status(id);
    if (st) {
      $$('[data-today]').forEach(function (e) { e.textContent = s.short + ' · ' + st.text; });
      $$('[data-status-dot]').forEach(function (e) { var f = e.getAttribute('data-status-dot'); var x = f ? status(f) : st; if (x) e.setAttribute('data-open', x.open ? '1' : '0'); });
    }
  }
  function storeCards() {
    $$('[data-status-for]').forEach(function (e) {
      var id = e.getAttribute('data-status-for'), st = status(id); if (!st) return;
      e.textContent = st.text;
      var card = e.closest('[data-store-card]'); if (!card) return;
      // today's hours row: the store cards' lists, and any other hours list marked data-hours (the home stores)
      $$('.store-card__hours div, [data-hours] > div', card).forEach(function (row) { var dt = row.querySelector('dt'); if (!dt) return; var sun = /sun/i.test(dt.textContent); row.classList.toggle('is-today', st.day === 0 ? sun : !sun); });
    });
  }
  d.addEventListener('click', function (e) {
    var b = e.target.closest('[data-store-set]');
    if (b) applyStore(b.getAttribute('data-store-set'), true);
  });

  /* ---------- 21+ gate ---------- */
  var gate = d.getElementById('gate');
  function openGate() {
    if (!gate) return;
    gate.hidden = false; html.classList.add('gate-pending');
    var f = gate.querySelector('[data-gate]'); if (f) f.focus();
  }
  function closeGate(v) { safeSet('og-age', v); html.classList.remove('gate-pending'); if (gate) gate.hidden = true; var m = d.getElementById('main'); if (m) m.focus({ preventScroll: true }); }
  if (gate) {
    gate.addEventListener('click', function (e) {
      var b = e.target.closest('[data-gate]'); if (!b) return;
      var v = b.getAttribute('data-gate');
      if (v === 'no') { var n = gate.querySelector('[data-gate-no]'); if (n) n.hidden = false; return; }
      closeGate(v);
    });
    gate.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab') return;
      var f = $$('button, a[href]', gate).filter(function (x) { return x.offsetParent !== null; });
      if (!f.length) return;
      if (e.shiftKey && d.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && d.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    });
    if (html.classList.contains('gate-pending')) openGate();
  }

  /* ---------- header: the shop bar ("Nav 4"; markup layout.mjs header(), styles nav.css) ----------
     Transparent over the film and solid ink once the page moves; the category row fades only the edges that hide
     more; More opens one flat panel (on phones it fills the screen, locks the page and keeps focus inside; Escape
     closes it and returns focus to More); a store change from anywhere (this bar, the hero, the store bar) gets a flat
     confirmation and a polite announcement. The store itself (data-store-set, data-shop, live hours) is "store state"
     above; the visitor's saved store is restored before paint by the head script. */
  (function () {
    var nx = d.getElementById('nx');
    var btn = d.getElementById('nx-more-btn'), panel = d.getElementById('nx-more'), scrim = nx && $('.nx-scrim', nx);
    var cats = d.getElementById('nx-cats'), live = d.getElementById('nx-live');
    if (!nx || !btn || !panel || !scrim || !cats) return;
    var PHONE = w.matchMedia('(max-width: 759.98px)');
    var open = false, flashT = 0, ticking = false;

    /* transparent over the film, solid ink once the page moves */
    function paint() { ticking = false; nx.classList.toggle('nx-solid', w.scrollY > 24); }
    w.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(paint); } }, { passive: true });
    paint();

    /* the category row when it scrolls: fade only the edges that hide more */
    function edges() {
      var max = cats.scrollWidth - cats.clientWidth;
      cats.classList.toggle('nx-at-start', cats.scrollLeft < 4);
      cats.classList.toggle('nx-at-end', max - cats.scrollLeft < 4);
    }
    cats.addEventListener('scroll', edges, { passive: true });
    w.addEventListener('resize', edges, { passive: true });
    edges();

    /* More */
    function focusables() {
      return Array.prototype.filter.call(nx.querySelectorAll('a[href], button:not([disabled])'), function (el) { return el.getClientRects().length > 0; });
    }
    function lock(on) {
      html.classList.toggle('nx-lock', on);
      ['main', '.site-footer', '.dash'].forEach(function (s) { var el = d.querySelector(s); if (el) el.inert = on; });
    }
    function setOpen(o, back) {
      open = o;
      btn.setAttribute('aria-expanded', String(o));
      panel.hidden = scrim.hidden = !o;
      nx.classList.toggle('nx-open', o);
      html.classList.toggle('nx-menu-open', o); /* nav.css steps the store bar away while this is on */
      lock(o && PHONE.matches);
      if (o && PHONE.matches) { panel.scrollTop = 0; var first = panel.querySelector('a[href]'); if (first) first.focus(); }
      if (!o && back) btn.focus();
    }
    btn.addEventListener('click', function () { setOpen(!open, false); });
    scrim.addEventListener('click', function () { setOpen(false, false); });
    d.addEventListener('click', function (e) { if (open && !nx.contains(e.target)) setOpen(false, false); });
    d.addEventListener('focusin', function (e) { if (open && !nx.contains(e.target)) setOpen(false, false); });
    d.addEventListener('keydown', function (e) {
      if (!open) return;
      if (e.key === 'Escape') { e.preventDefault(); setOpen(false, true); return; }
      if (e.key !== 'Tab' || !PHONE.matches) return;
      var f = focusables(), i = f.indexOf(d.activeElement);
      if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
    });
    var onBp = function () { if (open) lock(PHONE.matches); edges(); };
    if (PHONE.addEventListener) PHONE.addEventListener('change', onBp); else PHONE.addListener(onBp);

    /* a store change from anywhere: a flat confirmation and a polite announcement */
    new MutationObserver(function (recs) {
      if (recs[0].oldValue === html.getAttribute('data-store')) return;
      nx.classList.remove('nx-flash'); void nx.offsetWidth; nx.classList.add('nx-flash');
      clearTimeout(flashT); flashT = setTimeout(function () { nx.classList.remove('nx-flash'); }, 1600);
      if (cats.scrollLeft > 0) cats.scrollTo({ left: 0, behavior: RM ? 'auto' : 'smooth' });
      var name = nx.querySelector('[data-store-name]');
      if (live && name) live.textContent = 'Shopping: ' + name.textContent;
    }).observe(html, { attributes: true, attributeFilter: ['data-store'], attributeOldValue: true });
  })();

  /* ---------- dash: shows past the hero; hides while typing ---------- */
  var dash = $('[data-dash]');
  var hero = $('[data-hero]') || $('[data-phero]');
  d.addEventListener('focusin', function (e) { if (e.target.matches && e.target.matches('input, textarea, select')) html.classList.add('typing'); });
  d.addEventListener('focusout', function () { html.classList.remove('typing'); });

  /* ---------- reveal, develop, neon, count-up ---------- */
  var io = null;
  if ('IntersectionObserver' in w) {
    io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        el.classList.add('is-in');
        if (el.hasAttribute('data-neon')) el.classList.add('is-on');
        if (el.hasAttribute('data-count')) countUp(el);
        io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    $$('[data-reveal], [data-develop], [data-neon], [data-count]').forEach(function (el) { io.observe(el); });
  } else html.classList.add('reveal-all');
  setTimeout(function () {
    $$('[data-reveal]:not(.is-in), [data-develop]:not(.is-in)').forEach(function (el) { if (el.getBoundingClientRect().top < innerHeight) el.classList.add('is-in'); });
  }, 2500);
  function countUp(el) {
    var n = parseInt(el.getAttribute('data-count'), 10); if (!n || RM) return;
    var t0 = performance.now(), dur = 1600;
    (function step(t) { var k = clamp((t - t0) / dur, 0, 1), e = 1 - Math.pow(1 - k, 3); el.textContent = String(Math.round(n * e)); if (k < 1) requestAnimationFrame(step); })(t0);
  }

  /* ---------- background video (poster first; source only when allowed and in view) ---------- */
  var vids = $$('[data-bgvid]');
  if (vids.length && !RM && !SAVE && 'IntersectionObserver' in w) {
    var vio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var v = en.target;
        if (en.isIntersecting) {
          if (!v.getAttribute('src')) { var small = v.getAttribute('data-src-small'); v.setAttribute('src', small && innerWidth < 760 ? small : v.getAttribute('data-src')); v.load(); }
          if (!v.hasAttribute('data-user-paused')) { var p = v.play(); if (p && p.catch) p.catch(function () { d.addEventListener('pointerdown', function once() { v.play().catch(function () {}); d.removeEventListener('pointerdown', once); }); }); }
        } else if (!v.paused) v.pause();
      });
    }, { rootMargin: '200px 0px' });
    vids.forEach(function (v) { vio.observe(v); });
  }
  /* ---------- home hero, "Into the film" (markup home.mjs, styles hero.css) ----------
     One scroll-driven rAF loop (passive listeners) dives through the central I of the ORIGINALS letters until the film
     is full-bleed, then the headline and the store actions arrive; loop and film pause while the hero is off-screen.
     html.hx-live is set before paint by the home page's head script; mode() follows the reduced-motion setting live
     (reduced: no dive, the end state shows, the film waits for its toggle). Pages without #hx: nothing runs. */
  (function () {
    var hx = d.getElementById('hx');
    if (!hx) return;
    var q = function (s) { return hx.querySelector(s); };
    var stage = q('.hx-stage'), veil = q('.hx-veil'), slot = q('.hx-slot'), rest = q('.hx-rest'), scrim = q('.hx-scrim'),
      film = q('.hx-film'), toggle = q('.hx-toggle'), label = q('.hx-toggle span'), cue = q('.hx-cue'), copy = q('.hx-copy'), h1 = q('.hx-h1');
    var mq = w.matchMedia('(prefers-reduced-motion: reduce)');
    // the wordmark's viewBox (x, y, width) and the dive point: the middle of the central I, measured from its path
    var VB = [115, 134.5, 1691], P = [921, 270], IW = 50.5;
    var live = false, inView = true, want = false, done = false, moved = false;
    var g = {}, p = 0, ps = 0, raf = 0, last = 0;
    var ease = function (a, b, x) { x = clamp((x - a) / (b - a), 0, 1); return x * x * (3 - 2 * x); };

    function measure() {
      var s = slot.getBoundingClientRect(), st = stage.getBoundingClientRect();
      g.w = s.width; g.u = s.width / VB[2];
      g.px = s.left - st.left + (P[0] - VB[0]) * g.u; g.py = s.top - st.top + (P[1] - VB[1]) * g.u;
      g.cx = st.width / 2; g.cy = st.height / 2;
      g.smax = 1.12 * st.width / (IW * g.u); // the I ends wider than the screen
      g.top = hx.getBoundingClientRect().top + w.scrollY;
      g.range = Math.max(1, hx.offsetHeight - stage.offsetHeight);
    }
    function progress() { return clamp((w.scrollY - g.top) / g.range, 0, 1); }

    // t: smoothed scroll progress through the sticky stage, 0..1
    function render(t) {
      var z = ease(.03, .7, t), S = Math.exp(Math.log(g.smax) * z), k = ease(0, 1, z), u = g.u * S;
      var qx = g.px + (g.cx - g.px) * k, qy = g.py + (g.cy - g.py) * k, vs = veil.style;
      vs.setProperty('--ms', (g.w * S).toFixed(1) + 'px');
      vs.setProperty('--mx', (qx - (P[0] - VB[0]) * u).toFixed(1) + 'px');
      vs.setProperty('--my', (qy - (P[1] - VB[1]) * u).toFixed(1) + 'px');
      var vo = 1 - ease(.52, .7, t);
      vs.opacity = vo.toFixed(3);
      vs.visibility = vo <= 0 ? 'hidden' : ''; // nothing left to paint once the mask has dropped away
      scrim.style.opacity = ease(.5, .72, t).toFixed(3);
      film.style.scale = (1.12 - .12 * z).toFixed(4);
      var r = ease(0, .11, t);
      rest.style.opacity = (1 - r).toFixed(3);
      rest.style.visibility = r >= 1 ? 'hidden' : '';
      rest.style.transform = 'translate(' + (qx - g.px).toFixed(1) + 'px,' + (qy - g.py).toFixed(1) + 'px) scale(' + Math.min(S, 3).toFixed(4) + ')';
      if (moved !== t > .035) { moved = !moved; hx.classList.toggle('hx--moved', moved); }
      var on = done ? t > .62 : t > .68; // a little hysteresis so the copy never flickers at the threshold
      if (on !== done) { done = on; hx.classList.toggle('hx--done', on); }
    }

    function loop(now) {
      raf = 0;
      var dt = last ? Math.min(50, now - last) : 16; last = now;
      ps += (p - ps) * (1 - Math.exp(-dt / 85));
      if (Math.abs(p - ps) < .0004) ps = p;
      render(ps);
      if (ps !== p) raf = w.requestAnimationFrame(loop); else last = 0;
    }
    function kick() { if (!raf && live && inView) raf = w.requestAnimationFrame(loop); }
    function onScroll() { if (live) { p = progress(); kick(); } }

    // the film: muted, looping, playing only while the hero is on screen and nobody paused it
    function sync() {
      if (want && inView) { var pr = film.play(); if (pr && pr.catch) pr.catch(function () {}); }
      else if (!film.paused) film.pause();
    }
    function setLabel() {
      var paused = film.paused;
      toggle.setAttribute('data-state', paused ? 'paused' : 'playing');
      label.textContent = paused ? 'Play film' : 'Pause film';
    }
    film.muted = true;
    film.addEventListener('play', setLabel);
    film.addEventListener('pause', setLabel);
    toggle.addEventListener('click', function () { want = film.paused; sync(); });
    toggle.hidden = false;

    function mode() {
      live = !mq.matches;
      html.classList.toggle('hx-live', live);
      if (live) { measure(); p = ps = progress(); render(ps); }
      else {
        [veil, rest, scrim, film].forEach(function (el) { el.removeAttribute('style'); });
        hx.classList.remove('hx--done', 'hx--moved'); done = moved = false;
      }
      html.classList.add('hx-ready');
      want = live && !SAVE; sync(); setLabel();
    }

    // the cue plays the dive (smooth scroll to the end of the stage); from the keyboard it jumps and focuses the headline
    cue.addEventListener('click', function (e) {
      if (!live) return;
      e.preventDefault();
      if (e.detail === 0) { h1.focus({ preventScroll: true }); return; }
      w.scrollTo({ top: g.top + g.range, behavior: 'smooth' });
    });
    // tabbing into the copy while it is still hidden: jump to the end state so the focused control is visible
    copy.addEventListener('focusin', function () {
      if (!live || ps > .97) return;
      w.scrollTo(0, g.top + g.range);
      p = ps = 1; render(1);
    });

    w.addEventListener('scroll', onScroll, { passive: true });
    w.addEventListener('resize', function () { if (live) { measure(); p = ps = progress(); render(ps); } }, { passive: true });
    if ('IntersectionObserver' in w) {
      new IntersectionObserver(function (en) {
        inView = en[0].isIntersecting;
        sync();
        if (inView) { onScroll(); } else if (raf) { w.cancelAnimationFrame(raf); raf = 0; last = 0; }
      }).observe(hx);
    }
    if (mq.addEventListener) mq.addEventListener('change', mode);
    mode();
  })();

  /* ---------- tilt + glint, magnetic buttons (fine pointer only) ---------- */
  if (FINE && !RM) {
    d.addEventListener('pointermove', function (e) {
      var t = e.target.closest && e.target.closest('[data-tilt]');
      if (t) { var r = t.getBoundingClientRect(); var x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; t.style.setProperty('--ty', (x * 8).toFixed(2) + 'deg'); t.style.setProperty('--tx', (-y * 8).toFixed(2) + 'deg'); t.style.setProperty('--mx', ((x + .5) * 100).toFixed(1) + '%'); t.style.setProperty('--my', ((y + .5) * 100).toFixed(1) + '%'); }
      var m = e.target.closest && e.target.closest('[data-magnetic]');
      if (m) { var q = m.getBoundingClientRect(); m.style.translate = ((e.clientX - q.left - q.width / 2) * .18).toFixed(1) + 'px ' + ((e.clientY - q.top - q.height / 2) * .25).toFixed(1) + 'px'; }
    }, { passive: true });
    d.addEventListener('pointerout', function (e) {
      var t = e.target.closest && e.target.closest('[data-tilt]'); if (t && !t.contains(e.relatedTarget)) { t.style.removeProperty('--tx'); t.style.removeProperty('--ty'); }
      var m = e.target.closest && e.target.closest('[data-magnetic]'); if (m && !m.contains(e.relatedTarget)) m.style.translate = '';
    });
  }

  /* ---------- the family wall (home.mjs section 6, styles signature.css section 6): a sideways strip, a digital replica
     of the LA store's portrait wall (one seamless unit of its print repeated). Native scrolling does the moving (trackpad, shift+wheel, touch, the arrow keys once the strip has
     focus); this adds a mouse drag, the prev/next buttons (smooth, instant under reduced motion), the edge fades
     (.is-start / .is-end on the section) and, on fine pointers without reduced motion, the gallery light over the strip.
     There is no wheel handler, so the page's vertical scroll is never taken over. Without JS: a plain scrolling row. ---------- */
  var wall = $('[data-wall]'), wallView = wall && $('[data-wall-view]', wall);
  if (wallView) (function (view) {
    var btns = $('[data-wall-btns]', wall), light = $('.wall__light', wall);
    var prev = $('[data-wall-step="-1"]', wall), next = $('[data-wall-step="1"]', wall), queued = false, drag = null;
    function edges() {
      queued = false;
      var max = view.scrollWidth - view.clientWidth, x = view.scrollLeft, start = x <= 2, end = max - x <= 2;
      wall.classList.toggle('is-start', start); wall.classList.toggle('is-end', end); wall.classList.toggle('is-static', max <= 2);
      if (prev && next) {
        // a button about to be disabled hands keyboard focus to the other one, so focus is never dropped
        if (start && !end && d.activeElement === prev) next.focus();
        if (end && !start && d.activeElement === next) prev.focus();
        prev.disabled = start; next.disabled = end;
      }
    }
    function queue() { if (!queued) { queued = true; requestAnimationFrame(edges); } }
    // one wall, no panels: each click moves 70% of the visible strip, so the last 30% of the view stays in sight as a
    // reference. A step that would stop just short of an end goes all the way, so no click is left to move a few pixels.
    function step(dir) {
      var x = view.scrollLeft, vw = view.clientWidth, max = view.scrollWidth - vw, to = x + dir * vw * .7, snap = vw * .2;
      if (dir > 0 && to > max - snap) to = max;
      if (dir < 0 && to < snap) to = 0;
      view.scrollTo({ left: clamp(to, 0, max), behavior: RM ? 'auto' : 'smooth' });
    }
    if (prev && next) {
      prev.addEventListener('click', function () { step(-1); });
      next.addEventListener('click', function () { step(1); });
    }
    view.addEventListener('scroll', queue, { passive: true });
    if (w.ResizeObserver) { var ro = new ResizeObserver(queue); ro.observe(view); if (view.firstElementChild) ro.observe(view.firstElementChild); }
    else w.addEventListener('resize', queue, { passive: true });
    // a mouse drag scrolls it (touch and pens keep the browser's own panning)
    function drop() { if (drag) { drag = null; view.classList.remove('is-dragging'); } }
    view.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse' || e.button !== 0 || wall.classList.contains('is-static')) return;
      drag = { id: e.pointerId, x: e.clientX, left: view.scrollLeft, on: false };
    });
    view.addEventListener('pointermove', function (e) {
      if (!drag || e.pointerId !== drag.id) return;
      if (!(e.buttons & 1)) { drop(); return; }   // released outside the strip before the drag began
      var dx = e.clientX - drag.x;
      if (!drag.on) {
        if (Math.abs(dx) < 5) return;
        drag.on = true; view.classList.add('is-dragging');
        try { view.setPointerCapture(e.pointerId); } catch (err) { /* the pointer is already gone */ }
      }
      view.scrollLeft = drag.left - dx;
    }, { passive: true });
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(function (t) { view.addEventListener(t, drop); });
    view.addEventListener('dragstart', function (e) { e.preventDefault(); });   // no ghost image
    // the gallery light follows the pointer over the strip (the red look only: flat.css hides .wall__light)
    if (light && FINE && !RM && getComputedStyle(light).display !== 'none') {
      var lamp = light.parentNode;
      lamp.addEventListener('pointermove', function (e) {
        var r = lamp.getBoundingClientRect();
        light.style.setProperty('--lx', Math.round(e.clientX - r.left) + 'px'); light.style.setProperty('--ly', Math.round(e.clientY - r.top) + 'px');
        wall.classList.add('is-lit');
      }, { passive: true });
      lamp.addEventListener('pointerleave', function () { wall.classList.remove('is-lit'); });
    }
    if (btns) btns.hidden = false;
    edges();
  })(wallView);

  /* ---------- the stores (home.mjs section 8, styles stores.css; owner-picked lab option C, "Editorial", 2026-11-12,
     with the owner's "make it scrollable"). Three numbered columns (Los Angeles, San Diego, Originals Clothing) in a
     sideways scroller, the family wall's pattern above. Native scrolling and the CSS x mandatory snap do the moving:
     trackpad, shift+wheel, touch. This block adds:
     - the prev/next buttons and the arrow keys (Home and End too) when the row has focus: one column a step, smooth,
       instant under reduced motion;
     - a mouse drag that follows the pointer with snapping off, then lets go onto the column it was heading for (a
       drag is never a click on the link under it);
     - the edge fades and the buttons' ends (.is-start / .is-end / .is-static on the section);
     - with motion allowed, each column's reveal as it comes into view (.is-armed on the section, .is-in on the column).
     There is no wheel handler, so the page's vertical scroll is never taken over. Without JS: a plain scrolling row,
     the buttons hidden. The live status and today's hours are storeCards()'s, above. ---------- */
  var storesSec = $('[data-stores]'), storesView = storesSec && $('[data-stores-view]', storesSec);
  if (storesView) (function (view) {
    var sec = storesSec, btns = $('[data-stores-btns]', sec), cols = $$('.stores__col', view), queued = false, drag = null, dragged = false;
    var prev = $('[data-stores-step="-1"]', sec), next = $('[data-stores-step="1"]', sec);
    // where the row comes to rest: each column's start against the snap padding, clamped to the scroll range (columns
    // that would all rest at the end are one stop)
    function stops() {
      var max = view.scrollWidth - view.clientWidth, pad = parseFloat(getComputedStyle(view).scrollPaddingLeft) || 0, v0 = view.getBoundingClientRect().left, x = view.scrollLeft;
      return cols.map(function (c) { return clamp(Math.round(c.getBoundingClientRect().left - v0 + x - pad), 0, Math.max(0, max)); })
        .filter(function (s, i, all) { return !i || s > all[i - 1] + 1; });
    }
    function nearest(x, s) { var k = 0; s.forEach(function (v, i) { if (Math.abs(v - x) < Math.abs(s[k] - x)) k = i; }); return k; }
    function go(k, s) { s = s || stops(); view.scrollTo({ left: s[clamp(k, 0, s.length - 1)], behavior: RM ? 'auto' : 'smooth' }); }
    function step(dir) { var s = stops(); go(nearest(view.scrollLeft, s) + dir, s); }
    function edges() {
      queued = false;
      var max = view.scrollWidth - view.clientWidth, x = view.scrollLeft, start = x <= 2, end = max - x <= 2;
      sec.classList.toggle('is-start', start); sec.classList.toggle('is-end', end); sec.classList.toggle('is-static', max <= 2);
      if (prev && next) {
        // a button about to be disabled hands keyboard focus to the other one, so focus is never dropped
        if (start && !end && d.activeElement === prev) next.focus();
        if (end && !start && d.activeElement === next) prev.focus();
        prev.disabled = start; next.disabled = end;
      }
    }
    function queue() { if (!queued) { queued = true; requestAnimationFrame(edges); } }
    if (prev && next) {
      prev.addEventListener('click', function () { step(-1); });
      next.addEventListener('click', function () { step(1); });
    }
    view.addEventListener('keydown', function (e) {
      if (e.target !== view || e.altKey || e.ctrlKey || e.metaKey) return;   // keys inside a column's links stay theirs
      var dir = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (dir) { e.preventDefault(); step(dir); }
      else if (e.key === 'Home' || e.key === 'End') { e.preventDefault(); var s = stops(); go(e.key === 'Home' ? 0 : s.length - 1, s); }
    });
    view.addEventListener('scroll', queue, { passive: true });
    if (w.ResizeObserver) { var ro = new ResizeObserver(queue); ro.observe(view); } else w.addEventListener('resize', queue, { passive: true });
    // a mouse drag (touch and pens keep the browser's own panning and snap)
    function drop() {
      if (!drag) return;
      var g = drag; drag = null;
      if (!g.on) return;
      dragged = true;
      // it rests on the column nearest where the drag left it; a drag that ends still nearest its starting column but
      // past a sixth of a step (140px at most) goes on to the next one in its direction
      var s = stops(), from = nearest(g.left, s), k = nearest(view.scrollLeft, s);
      if (k === from && Math.abs(g.dx) > Math.min(140, (s.length > 1 ? s[1] - s[0] : view.clientWidth) / 6)) k += g.dx < 0 ? 1 : -1;
      view.classList.remove('is-dragging');
      go(k, s);
    }
    view.addEventListener('pointerdown', function (e) {
      dragged = false;
      if (e.pointerType !== 'mouse' || e.button !== 0 || sec.classList.contains('is-static')) return;
      drag = { id: e.pointerId, x: e.clientX, left: view.scrollLeft, on: false, dx: 0 };
    });
    view.addEventListener('pointermove', function (e) {
      if (!drag || e.pointerId !== drag.id) return;
      if (!(e.buttons & 1)) { drop(); return; }   // released outside the row before the drag began
      var dx = e.clientX - drag.x; drag.dx = dx;
      if (!drag.on) {
        if (Math.abs(dx) < 5) return;
        drag.on = true; view.classList.add('is-dragging');
        try { view.setPointerCapture(e.pointerId); } catch (err) { /* the pointer is already gone */ }
      }
      view.scrollLeft = drag.left - dx;
    }, { passive: true });
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(function (t) { view.addEventListener(t, drop); });
    view.addEventListener('click', function (e) { if (dragged) { dragged = false; e.preventDefault(); e.stopPropagation(); } }, true);
    view.addEventListener('dragstart', function (e) { e.preventDefault(); });   // no ghost image of a photo or link
    // the reveal: a column opens as it comes into view (the scroller clips it, so the third shows only when moved in)
    if (!RM && w.IntersectionObserver) {
      var seen = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); seen.unobserve(e.target); } });
      }, { threshold: .2 });
      sec.classList.add('is-armed');
      cols.forEach(function (c) { seen.observe(c); });
    }
    if (btns) btns.hidden = false;
    edges();
  })(storesView);

  /* ---------- Sunday Cruise, "The Roadside Sign" (home.mjs section 7, styles cruise.css; owner-picked lab option B,
     2026-11-12, reference page src/lab/cruise-b.html). The cruise's only scroll loop: a rAF that runs while the section is
     on screen. --p (0 to 1) is the pinned stage's scroll on wide screens, or the road's trip up the screen on phones and
     short screens; it drives the car (in, a stop under the sign, out), the dusk, the sign's glow and the sign's light on
     the paint. Arriving under the sign the car hops three times (by the clock, scaled so its roof stays 8px under the
     lowest panel). The sign switches on once as it comes into view. html.cb-live is set before paint by the home page's
     head script unless reduced motion; this block drops it with reduced motion (now or later) or if it cannot run, and
     the CSS then shows the still scene: the sign lit, every bulb on, the car parked under the sign. ---------- */
  (function (sec) {
    if (!sec) return;
    var mq = w.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches || !html.classList.contains('cb-live')) { html.classList.remove('cb-live'); return; }
    try { boot(); } catch (err) { html.classList.remove('cb-live'); }   // never leave the car off stage or the sign dark

    function boot() {
      var SCENE = w.matchMedia('(min-width: 900px) and (min-height: 760px)');
      var sign = $('[data-cb-sign]', sec), road = $('.cb-road', sec), pole = $('.cb-pole', sec), car = $('.cb-car', sec), body = $('.cb-car__body', sec), shadow = $('.cb-car__shadow', sec);
      if (!sign || !road || !pole || !car || !body) throw new Error('cruise: missing parts');
      var panels = $$('.cb-copy, .cb-cab, .cb-board, .cb-lib', sec);
      var TILT = 2.4, G = { rw: 1, cw: 1, pole: 0, park: 0, hop: 1 }, raf = 0, inView = false, parked = false, hopT = -1, dead = false;
      function lift() { return SCENE.matches ? 10 : 6; }

      function measure() {   // the pole's centre and the parking spot, in the road's own coordinates
        var rr = road.getBoundingClientRect(), pr = pole.getBoundingClientRect();
        G.rw = rr.width || 1; G.cw = car.offsetWidth || 1;
        G.pole = pr.left + pr.width / 2 - rr.left;
        G.park = Math.max(8, Math.min(G.pole - G.cw / 2, G.rw - G.cw - 8));
        // the hop never reaches the sign: its tallest rise (the lift plus the raised nose) stays 8px under the lowest panel
        var held = body.style.transform; body.style.transform = '';
        var roof = body.getBoundingClientRect().top, low = 0;
        body.style.transform = held;
        panels.forEach(function (el) { low = Math.max(low, el.getBoundingClientRect().bottom); });
        var rise = .76 * (lift() + .74 * G.cw * Math.sin(TILT * Math.PI / 180));
        G.hop = clamp((roof - low - 8) / rise, 0, 1);
      }
      function progress() {
        var vh = w.innerHeight;
        if (SCENE.matches) { var r = sec.getBoundingClientRect(), span = r.height - vh; return span > 0 ? clamp(-r.top / span, 0, 1) : 0; }
        var t = road.getBoundingClientRect().top;   // phones: 0 as the road enters at the bottom edge, 1 near the top
        return clamp((vh - t) / (vh * .9), 0, 1);
      }
      function carX(p) {
        var a = -G.cw - 40, b = G.park, c = G.rw + 40, k;
        if (p < .38) { k = p / .38; return a + (b - a) * (1 - Math.pow(1 - k, 3)); }   // rolls in, easing to a stop at the sign
        if (p <= .62) return b;                                                        // parked under the sign
        k = (p - .62) / .38; return b + (c - b) * k * k;                               // pulls away
      }
      function hopAt(t) { return t < 0 || t > 1.26 ? 0 : Math.abs(Math.sin(Math.PI * t / .42)) * Math.exp(-1.5 * t); }   // three hops, each lower

      function tick(now) {
        raf = 0;
        if (dead) return;
        var p = progress(), x = carX(p), isParked = p >= .38 && p <= .62;
        sec.style.setProperty('--p', p.toFixed(4));
        if (isParked && !parked) hopT = now;   // arriving under the sign: the switches hit
        parked = isParked;
        var t = hopT < 0 ? -1 : (now - hopT) / 1000, a = hopAt(t) * G.hop;
        if (t > 1.26) hopT = -1;
        car.style.transform = 'translate3d(' + x.toFixed(1) + 'px,0,0)';
        body.style.transform = a > .002 ? 'translate3d(0,' + (-a * lift()).toFixed(1) + 'px,0) rotate(' + (-a * TILT).toFixed(2) + 'deg)' : '';
        if (shadow) { shadow.style.transform = a > .002 ? 'scaleX(' + (1 - a * .14).toFixed(3) + ')' : ''; shadow.style.opacity = a > .002 ? (.85 - a * .4).toFixed(3) : ''; }
        var g = clamp(1 - Math.abs(x + G.cw / 2 - G.pole) / (G.cw * .8), 0, 1);   // the sign's light on the paint, strongest under the pole
        car.style.setProperty('--cb-gx', ((G.pole - x) / G.cw * 100).toFixed(1) + '%');
        car.style.setProperty('--cb-glint', (g * g * .85).toFixed(3));
        if (hopT >= 0 && inView) kick();
      }
      function kick() { if (!raf && !dead) raf = w.requestAnimationFrame(tick); }

      if ('IntersectionObserver' in w) {
        new IntersectionObserver(function (es) {
          inView = es[0].isIntersecting; sec.classList.toggle('is-vis', inView);
          if (inView) { measure(); kick(); } else if (raf) { w.cancelAnimationFrame(raf); raf = 0; }
        }, { rootMargin: '120px 0px' }).observe(sec);
        var onIO = new IntersectionObserver(function (es) {   // the sign switches on as it comes into view
          if (es[0].isIntersecting) { sign.classList.add('is-on'); onIO.disconnect(); }
        }, { threshold: .3 });
        onIO.observe(sign);
      } else { inView = true; sec.classList.add('is-vis'); sign.classList.add('is-on'); }

      w.addEventListener('scroll', function () { if (inView) kick(); }, { passive: true });
      w.addEventListener('resize', function () { measure(); kick(); }, { passive: true });
      w.addEventListener('load', function () { measure(); kick(); });
      if (w.ResizeObserver) new ResizeObserver(function () { measure(); kick(); }).observe(sec);
      if (d.fonts && d.fonts.ready) d.fonts.ready.then(function () { measure(); kick(); });
      measure(); kick();

      function calm() {   // reduced motion switched on while the page is open: settle into the still scene
        if (!mq.matches) return;
        dead = true; html.classList.remove('cb-live');
        if (raf) { w.cancelAnimationFrame(raf); raf = 0; }
        sec.style.removeProperty('--p');
        ['transform', '--cb-gx', '--cb-glint'].forEach(function (k) { car.style.removeProperty(k); });
        body.style.transform = '';
        if (shadow) { shadow.style.transform = ''; shadow.style.opacity = ''; }
      }
      if (mq.addEventListener) mq.addEventListener('change', calm); else if (mq.addListener) mq.addListener(calm);
    }
  })($('[data-cruise]'));

  /* ---------- lenticular: the home events' carousel (home.mjs section 10, styles lenticular.css; owner request 2026-11-12,
     "use this effect", with a reference link: an original build from the effect's public
     description, not its code). Each card is cut into vertical strips (40-56 on a fine pointer, 24-36 on touch, by its
     width), each a two-faced slice of the black-and-white front and the colour back. The card's --f (0 the front, 1 turned
     over) follows the pointer's sweep across it (64% of its width turns it fully), or turns it over by itself on keyboard
     focus or a tap (touch: the first tap turns it, the next follows the link); lenticular.css turns each strip from --f in
     sequence, with refraction, rib shading, the foil, a tilt toward the pointer and a lift. The carousel: the active card
     in front (hovering a card makes it active), the others scaled down and dimmed; prev/next and the arrow keys (looping),
     drag or swipe, the rail; a live region names the new slide. Reduced motion (now or later): no strips, the colour face
     shown still. No script: the plain row of cards. ---------- */
  $$('[data-lenticular]').forEach(function (root) {
    try { lenticular(root); } catch (err) { root.classList.remove('is-live', 'is-still'); }   // never leave the row half-built
  });
  function lenticular(root) {
    var vp = $('.ln-viewport', root), track = $('.ln-track', root), slides = $$('.ln-slide', root);
    var cards = slides.map(function (sl) { return $('.ln-card', sl); });
    var prevB = $('[data-ln-prev]', root), nextB = $('[data-ln-next]', root), ctrl = $('[data-ln-ctrl]', root), segs = $$('.ln-rail i', root), status = $('[data-ln-status]', root);
    if (!vp || !track || cards.length < 2 || cards.some(function (c) { return !c; })) return;
    var mq = w.matchMedia('(prefers-reduced-motion: reduce)'), fineQ = w.matchMedia('(hover: hover) and (pointer: fine)');
    var TRAVEL = .64, TILT = 14, active = 0, raf = 0, last = 0, drag = null, lastType = 'mouse', swallow = false;
    var S = cards.map(function (c, i) { return { el: c, slide: slides[i], img: $('.ln-art', c), lens: null, n: -1, cw: 0, f: 0, sweep: 0, hover: false, focus: false, tap: false, x: .5, y: .5, rx: 0, ry: 0 }; });
    var still = function () { return mq.matches; };

    function lens(s) {   // the strips, by the card's width; none with reduced motion
      var n = still() ? 0 : Math.round(s.el.offsetWidth / (fineQ.matches ? 6.5 : 9));
      n = n && (fineQ.matches ? clamp(n, 40, 56) : clamp(n, 24, 36));
      if (n === s.n) return;
      if (s.lens) { s.lens.remove(); s.lens = null; }
      s.n = n;
      if (!n) return;
      var el = d.createElement('span'), html = '';
      el.className = 'ln-lens'; el.setAttribute('aria-hidden', 'true');
      for (var k = 0; k < n; k++) html += '<span class="ln-strip" style="--k:' + k + ';--u:' + ((k + .5) / n).toFixed(4) + '"><i></i><i></i></span>';
      el.innerHTML = html;
      s.el.insertBefore(el, s.img ? s.img.nextSibling : s.el.firstChild);
      s.lens = el;
    }
    function geo(s) {   // the artwork's cover box and each strip's width, for the slices
      var cw = s.el.offsetWidth, ch = s.el.offsetHeight, im = s.img, st = s.el.style;
      if (!cw || !ch) return;
      var ar = (im && im.naturalWidth && im.naturalHeight) ? im.naturalWidth / im.naturalHeight : 1.6, bw, bh;
      if (cw / ch > ar) { bw = cw; bh = cw / ar; } else { bh = ch; bw = ch * ar; }
      s.cw = cw;
      st.setProperty('--cw', cw + 'px'); st.setProperty('--bw', bw.toFixed(1) + 'px'); st.setProperty('--bh', bh.toFixed(1) + 'px');
      st.setProperty('--bx', ((cw - bw) / 2).toFixed(1) + 'px'); st.setProperty('--by', ((ch - bh) / 2).toFixed(1) + 'px');
      st.setProperty('--sw', (s.n > 0 ? cw / s.n : 6).toFixed(3) + 'px');
      var src = im && im.complete && im.naturalWidth && (im.currentSrc || im.src);
      if (src) st.setProperty('--ln-art', 'url("' + src + '")');
    }
    function place(dx) {   // centre the active card; when all three fit they sit centred together
      var cs = getComputedStyle(vp), inner = vp.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      var sw = slides[0].offsetWidth, gap = parseFloat(getComputedStyle(track).columnGap) || 0, tw = slides.length * sw + (slides.length - 1) * gap;
      var fits = tw <= inner + 1, tx = fits ? (inner - tw) / 2 : inner / 2 - (active * (sw + gap) + sw / 2);
      track.style.setProperty('--ln-tx', (tx + (dx || 0) * (fits ? .2 : 1)).toFixed(1) + 'px');
    }
    function measure() { S.forEach(function (s) { lens(s); geo(s); }); place(); }
    function setActive(i, o) {
      o = o || {};
      var n = slides.length; i = ((i % n) + n) % n;
      var moved = i !== active; active = i;
      slides.forEach(function (sl, k) { sl.classList.toggle('is-active', k === i); if (k === i) sl.setAttribute('aria-current', 'true'); else sl.removeAttribute('aria-current'); });
      segs.forEach(function (g, k) { g.classList.toggle('is-on', k === i); });
      S.forEach(function (s, k) { if (k !== i) s.tap = false; });
      place();
      if (o.focus) cards[i].focus({ preventScroll: true });
      if (moved && o.say && status) status.textContent = slides[i].getAttribute('aria-label');
      kick();
    }
    function go(dir, o) { o = o || {}; setActive(o.wrap === false ? clamp(active + dir, 0, slides.length - 1) : active + dir, { focus: o.focus, say: true }); }

    function tick(now) {
      raf = 0;
      var dt = last ? Math.min(.05, (now - last) / 1000) : .016, busy = false; last = now;
      S.forEach(function (s) {
        if (!s.n) return;
        var on = s.focus || s.tap, tgt = s.hover ? s.sweep : on ? 1 : 0, k = 1 - Math.exp(-dt / (s.hover ? .08 : .3));
        var trx = s.hover ? (.5 - s.y) * TILT * .6 : 0, tryy = s.hover ? (s.x - .5) * 2 * TILT : on ? -TILT * .35 : 0;
        s.f += (tgt - s.f) * k; s.rx += (trx * s.f - s.rx) * k; s.ry += (tryy * s.f - s.ry) * k;
        if (Math.abs(tgt - s.f) < .001 && Math.abs(trx * s.f - s.rx) < .02 && Math.abs(tryy * s.f - s.ry) < .02) { s.f = tgt; s.rx = trx * tgt; s.ry = tryy * tgt; } else busy = true;
        var st = s.el.style;
        st.setProperty('--f', s.f.toFixed(4));
        st.setProperty('--ln-rx', s.rx.toFixed(2) + 'deg'); st.setProperty('--ln-ry', s.ry.toFixed(2) + 'deg');
        st.setProperty('--fx', ((s.hover ? s.x - .5 : s.f * .25) * s.cw * .6).toFixed(1) + 'px');   // the foil's sheen moves with the pointer
      });
      if (busy) kick(); else last = 0;
    }
    function kick() { if (!raf && !still()) raf = w.requestAnimationFrame(tick); }

    root.addEventListener('pointerdown', function (e) { lastType = e.pointerType || 'mouse'; swallow = false; }, true);
    root.addEventListener('dragstart', function (e) { e.preventDefault(); });   // a drag moves the carousel, never the link or its image
    S.forEach(function (s, i) {
      var c = s.el;
      function at(e) { var r = s.slide.getBoundingClientRect(); s.x = clamp((e.clientX - r.left) / r.width, 0, 1); s.y = clamp((e.clientY - r.top) / r.height, 0, 1); s.sweep = clamp((s.x - (1 - TRAVEL) / 2) / TRAVEL, 0, 1); }
      c.addEventListener('pointerenter', function (e) { if (e.pointerType === 'touch' || (drag && drag.moved)) return; at(e); s.hover = true; if (i !== active) setActive(i); kick(); });
      c.addEventListener('pointermove', function (e) { if (e.pointerType === 'touch' || (drag && drag.moved)) return; at(e); s.hover = true; kick(); }, { passive: true });
      c.addEventListener('pointerleave', function () { s.hover = false; kick(); });
      c.addEventListener('focusin', function () { var kb = true; try { kb = c.matches(':focus-visible'); } catch (e) { /* older browsers */ } if (kb) s.focus = true; if (i !== active) setActive(i); kick(); });
      c.addEventListener('focusout', function () { s.focus = false; kick(); });
      c.addEventListener('click', function (e) {
        if (swallow) { e.preventDefault(); swallow = false; return; }   // the end of a drag, not a click
        if (lastType !== 'touch') return;   // mouse, pen and keyboard: the link works as always
        if (i !== active) { e.preventDefault(); setActive(i, { say: true }); return; }   // a tap on a side card brings it in front
        if (!still() && !s.tap) { e.preventDefault(); s.tap = true; kick(); }   // the first tap turns it over; the next follows its link
      });
    });
    vp.addEventListener('pointerdown', function (e) {
      if ((e.pointerType === 'mouse' && e.button !== 0) || e.target.closest('button')) return;
      drag = { id: e.pointerId, x: e.clientX, y: e.clientY, dx: 0, moved: false };
    });
    w.addEventListener('pointermove', function (e) {
      if (!drag || e.pointerId !== drag.id) return;
      var dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      if (!drag.moved) {
        if (Math.abs(dy) > 12 && Math.abs(dy) > Math.abs(dx)) { drag = null; return; }   // a vertical scroll, not a swipe
        if (Math.abs(dx) < 8) return;
        drag.moved = true; root.classList.add('is-dragging');
        S.forEach(function (s) { s.hover = false; }); kick();
      }
      drag.dx = dx; place(dx);
    }, { passive: true });
    function dragEnd(e) {
      if (!drag || e.pointerId !== drag.id) return;
      var g = drag; drag = null; root.classList.remove('is-dragging');
      if (!g.moved) return;
      swallow = true; w.setTimeout(function () { swallow = false; }, 400);
      if (g.dx < -40) go(1, { wrap: false }); else if (g.dx > 40) go(-1, { wrap: false }); else place();
    }
    w.addEventListener('pointerup', dragEnd); w.addEventListener('pointercancel', dragEnd);
    root.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      e.preventDefault();
      var onCard = !!(d.activeElement && d.activeElement.closest && d.activeElement.closest('.ln-card'));
      go(e.key === 'ArrowRight' ? 1 : -1, { focus: onCard });
    });
    if (prevB) prevB.addEventListener('click', function () { go(-1); });
    if (nextB) nextB.addEventListener('click', function () { go(1); });

    function mode() {   // reduced motion, now or later: no strips, the colour face shown still
      root.classList.toggle('is-still', still());
      if (still()) { if (raf) { w.cancelAnimationFrame(raf); raf = 0; } S.forEach(function (s) { s.f = 0; ['--f', '--ln-rx', '--ln-ry', '--fx'].forEach(function (p) { s.el.style.removeProperty(p); }); }); }
      measure();
    }
    S.forEach(function (s) { if (s.img && !(s.img.complete && s.img.naturalWidth)) s.img.addEventListener('load', function () { geo(s); }); });
    w.addEventListener('resize', measure, { passive: true });
    if (w.ResizeObserver) new ResizeObserver(measure).observe(vp);
    if (mq.addEventListener) mq.addEventListener('change', mode); else if (mq.addListener) mq.addListener(mode);
    if (fineQ.addEventListener) fineQ.addEventListener('change', measure);
    root.classList.add('is-live'); if (ctrl) ctrl.hidden = false;
    mode(); setActive(0);
  }

  /* ---------- one shared rAF loop: parallax, dash (the header, the home hero and the Sunday Cruise keep their own: see "header", "home hero", "Sunday Cruise"; the creed's part was retired 2026-11-12 with it: private/retired/2026-11-12-creed-section/) ---------- */
  var depth = $$('[data-depth]');
  var ticking = false;
  function frame() {
    ticking = false;
    var y = w.scrollY, vh = innerHeight;
    if (dash) { var on = y > (hero ? hero.offsetHeight * .55 : 220); dash.classList.toggle('is-on', on && !html.classList.contains('gate-pending')); }
    if (!RM) {
      depth.forEach(function (el) { var r = el.getBoundingClientRect(); if (r.bottom < -200 || r.top > vh + 200) return; var k = parseFloat(el.getAttribute('data-depth')) || 0; el.style.setProperty('--py', ((r.top + r.height / 2 - vh / 2) * k).toFixed(1) + 'px'); });
    }
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
  w.addEventListener('scroll', onScroll, { passive: true });
  w.addEventListener('resize', onScroll, { passive: true });

  /* ---------- preview forms: never post ---------- */
  d.addEventListener('submit', function (e) {
    var f = e.target.closest('[data-preview-form]'); if (!f) return;
    e.preventDefault();
    var note = f.querySelector('[data-form-status]');
    if (!f.checkValidity()) { var bad = f.querySelector(':invalid'); if (bad) bad.focus(); if (note) note.textContent = 'Please fill in the required fields.'; return; }
    if (note) { note.textContent = 'Thanks. This is a preview build, so nothing was sent: on the live site this form goes to the Originals team.'; note.classList.add('is-sent'); }
  });

  /* ---------- home marquees (the brand logos, the collab tape): a pause / play button for each (WCAG 2.2.2; markup home.mjs,
     styles marquee.css). Each ships hidden and is revealed here; CSS hides it under reduced motion. Its aria-controls names
     the moving box, its data-label the words after Pause / Play; the choice is kept per visitor and per marquee. ---------- */
  $$('[data-marquee-toggle]').forEach(function (bt) {
    var box = d.getElementById(bt.getAttribute('aria-controls') || ''), what = bt.getAttribute('data-label') || 'motion', key = 'og-marquee:' + (box && box.id);
    if (!box) return;
    var set = function (paused, keep) {
      box.classList.toggle('is-paused', paused);
      bt.setAttribute('data-state', paused ? 'paused' : 'playing');
      bt.setAttribute('aria-label', (paused ? 'Play ' : 'Pause ') + what);
      if (keep) safeSet(key, paused ? 'paused' : 'playing');
    };
    var was = null; try { was = localStorage.getItem(key); } catch (e) { was = null; }
    set(was === 'paused', false);
    bt.hidden = false;
    bt.addEventListener('click', function () { set(!box.classList.contains('is-paused'), true); });
  });

  /* ---------- events: flyers trail the pointer across the stage (fine pointer only) ---------- */
  var trail = $('[data-trail]');
  if (trail && FINE && !RM) {
    var pics = []; try { pics = JSON.parse(trail.getAttribute('data-trail') || '[]'); } catch (e) { pics = []; }
    var last = 0, k = 0, live = [];
    trail.addEventListener('pointermove', function (e) {
      if (!pics.length) return; var now = performance.now(); if (now - last < 90) return; last = now;
      var r = trail.getBoundingClientRect(); var im = d.createElement('img'); im.src = pics[k++ % pics.length]; im.alt = ''; im.className = 'trail__pic';
      im.style.left = (e.clientX - r.left) + 'px'; im.style.top = (e.clientY - r.top) + 'px'; im.style.setProperty('--r', ((Math.random() - .5) * 24).toFixed(1) + 'deg');
      trail.appendChild(im); live.push(im); if (live.length > 9) { var o = live.shift(); o.remove(); }
      setTimeout(function () { im.classList.add('is-out'); setTimeout(function () { im.remove(); live = live.filter(function (x) { return x !== im; }); }, 700); }, 900);
    });
  }

  /* ---------- collabs: chips tumble into a pile (simple box physics, no library) ---------- */
  var pile = $('[data-tumble]');
  if (pile && !RM && 'IntersectionObserver' in w) {
    var started = false;
    new IntersectionObserver(function (en, ob) { if (en[0].isIntersecting && !started) { started = true; ob.disconnect(); tumble(pile); } }, { threshold: .3 }).observe(pile);
  }
  function tumble(box) {
    var chips = $$('.chip-fall', box); if (!chips.length) return;
    box.classList.add('is-physics');
    var W = box.clientWidth, H = box.clientHeight, bodies = chips.map(function (c, i) {
      var w0 = c.offsetWidth, h0 = c.offsetHeight;
      return { el: c, w: w0, h: h0, x: Math.random() * (W - w0), y: -h0 - i * 46 - Math.random() * 80, vx: (Math.random() - .5) * 2, vy: 0, r: (Math.random() - .5) * 30, vr: (Math.random() - .5) * 2 };
    });
    var t0 = performance.now();
    (function step(t) {
      var settled = true;
      bodies.forEach(function (b) {
        b.vy += .55; b.x += b.vx; b.y += b.vy; b.r += b.vr;
        if (b.y + b.h > H) { b.y = H - b.h; b.vy *= -.28; b.vx *= .8; b.vr *= .6; b.r *= .9; }
        if (b.x < 0) { b.x = 0; b.vx *= -.5; } if (b.x + b.w > W) { b.x = W - b.w; b.vx *= -.5; }
      });
      for (var i = 0; i < bodies.length; i++) for (var j = i + 1; j < bodies.length; j++) {
        var a = bodies[i], c = bodies[j];
        var ox = Math.min(a.x + a.w, c.x + c.w) - Math.max(a.x, c.x), oy = Math.min(a.y + a.h, c.y + c.h) - Math.max(a.y, c.y);
        if (ox > 0 && oy > 0) { if (oy < ox) { var top = a.y < c.y ? a : c, bot = top === a ? c : a; top.y -= oy; if (top.vy > 0) top.vy *= -.2; top.vx += (top.x < bot.x ? -.3 : .3); } else { var lf = a.x < c.x ? a : c, rt = lf === a ? c : a; lf.x -= ox / 2; rt.x += ox / 2; lf.vx *= -.4; rt.vx *= -.4; } }
      }
      bodies.forEach(function (b) { b.el.style.transform = 'translate(' + b.x.toFixed(1) + 'px,' + b.y.toFixed(1) + 'px) rotate(' + b.r.toFixed(1) + 'deg)'; if (Math.abs(b.vy) > .3 || Math.abs(b.vx) > .2) settled = false; });
      if (!settled && t - t0 < 7000) requestAnimationFrame(step);
    })(t0);
  }

  /* ---------- boot ---------- */
  // ---- the award emblem at the seam (owner request): it lights up gold while it is in view (CSS does the glow)
  (function () {
    var els = d.querySelectorAll('[data-award-lit]'); if (!els.length || !w.IntersectionObserver) return;
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { e.target.classList.toggle('is-lit', e.isIntersecting); }); }, { threshold: .6 });
    [].forEach.call(els, function (el) { io.observe(el); });
  })();

  // (the category fan's script was retired 2026-11-12 with the fan: the category wall needs none; the fan version is in
  // private/retired/2026-11-12-category-fan/)

  // ---- smoke text (owner pick from the title-effects lab): smokeArm(el) splits an element's text into aria-hidden
  // letters parked in data-smoke="wait" (an sr-only copy keeps it readable; the Old English face's joined pairs move as
  // one letter); smokePlay(el) condenses them out of a rising haze in random order, then puts the element's own markup
  // back (so it can be armed again). Both do nothing with reduced motion. Used by the section titles and the deals reel.
  function smokeArm(h) {
    if (RM || !h || h._smoke) return false;
    var label = h.textContent.replace(/\s+/g, ' ').trim(); if (!label) return false;
    var orig = h.innerHTML, units = [], last = 0, PAIRS = /ck|ch|tz|ft|tt|ff|fi|fl|ll|./gsu;
    function rnd(i) { var x = Math.sin(i * 12.9898 + 78.233) * 43758.5453; return x - Math.floor(x); }
    function el(cls, txt) { var e = d.createElement('span'); e.className = cls; if (txt != null) e.textContent = txt; return e; }
    var out = el('fx-split'); out.setAttribute('aria-hidden', 'true');
    (function walk(src, dst, script, black) {
      for (var n = src.firstChild; n; n = n.nextSibling) {
        if (n.nodeType === 3) {
          n.nodeValue.split(/(\s+)/).forEach(function (tok) {
            if (!tok) return;
            if (/^\s+$/.test(tok) || /^[.,;:!?]+$/.test(tok)) { dst.appendChild(d.createTextNode(/^\s+$/.test(tok) ? ' ' : tok)); return; }
            var word = el('fx-w');
            if (script) { word.className = 'fx-w fx-u'; word.textContent = tok; units.push(word); }
            else (black ? tok.match(PAIRS) : Array.from(tok)).forEach(function (ch) { var c = el('fx-c fx-u', ch); word.appendChild(c); units.push(c); });
            dst.appendChild(word);
          });
        } else if (n.nodeType === 1) {
          var c = n.cloneNode(false); c.removeAttribute('id'); dst.appendChild(c);
          walk(n, c, script || n.classList.contains('script'), black || n.classList.contains('chrome-word'));
        }
      }
    })(h, out, false, false);
    var n0 = smokeArm.n || 0;
    units.forEach(function (u, i) {
      var t = rnd(n0 + i + 1) * 900; if (t > last) last = t;
      u.style.setProperty('--d', Math.round(t) + 'ms');
      u.style.setProperty('--sx', ((rnd(n0 + i + 31) - .5) * .5).toFixed(3) + 'em');
      u.style.setProperty('--sk', ((rnd(n0 + i + 57) - .5) * 24).toFixed(1) + 'deg');
    });
    smokeArm.n = n0 + units.length;
    h.textContent = ''; h.appendChild(out); h.appendChild(el('sr-only', label));
    h.setAttribute('data-smoke', 'wait');
    h._smoke = { orig: orig, total: last + 1660 };
    return true;
  }
  function smokePlay(h, done) {
    if (!h || !h._smoke) return;
    w.clearTimeout(h._smokeT);
    h.setAttribute('data-smoke', 'play');
    h._smokeT = w.setTimeout(function () { var o = h._smoke && h._smoke.orig; h._smoke = null; if (o != null) h.innerHTML = o; h.removeAttribute('data-smoke'); if (done) done(); }, h._smoke.total);
  }
  // the section titles: each smokes in when it scrolls into view
  (function () {
    if (RM || !w.IntersectionObserver) return;
    var hs = [].filter.call(d.querySelectorAll('main h2'), function (h) {   // a title holding a link or button is left whole: splitting it would shrink the link's tap area
      return !h.closest('.sr-only, [aria-hidden="true"], dialog') && !h.classList.contains('sr-only') && h.textContent.trim() && !h.querySelector('a, button');
    });
    hs.forEach(function (h) { if (smokeArm(h)) h.removeAttribute('data-reveal'); });   // the smoke replaces the fade-up on these titles
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (!e.isIntersecting) return; io.unobserve(e.target); smokePlay(e.target); });
    }, { threshold: .5, rootMargin: '0px 0px -6% 0px' });
    hs.forEach(function (h) { if (h._smoke) io.observe(h); });
  })();

  // ---- deals reel ("Spotlight Reel", owner-approved lab option B; markup home.mjs section 4, styles deals.css). Wide
  // screens: a short pin (owner requests, 2026-11-12). The section is 80vh of scroll taller than its stage, which sticks,
  // and that scroll does one thing: it docks the opening titles (the neon sign, the heading, the lede) from
  // the middle of the stage into the top of the rail, above the tabs, and undocks them on the way back up. Each title is
  // moved onto an unseen copy of itself laid out in the rail (the lede, which cannot shrink into the rail, cross-fades
  // with its copy); the tabs and the card area fade in as they dock. Once they have docked the picked deal (01 at first)
  // plays its timed sequence; when they undock it waits in its frame, and docking again replays it. A deal changes only
  // when it is picked on the rail or when keyboard focus reaches its button; nothing on a card follows the scroll.
  // Phones and short windows: the cards become a native scroll-snap stack, restyled every frame so the next card waits
  // behind the front one; the swipe and the same tabs pick the front card. The rail is a tablist with manual activation:
  // arrow keys, Home and End move between the tabs, Enter, Space or a click picks one, and a pick never scrolls the page.
  // Each time a card takes the stage (on the stack: becomes the front card) its texts smoke in (smokeArm/smokePlay above).
  // Reduced motion or no JS: nothing here runs and the section stays its still grid (no rail). Pages without the reel:
  // nothing runs.
  (function () {
    var sec = d.querySelector('[data-reel]');
    if (!sec || !w.matchMedia || !w.requestAnimationFrame) return;
    var stage = sec.querySelector('.dl-stage'), reel = sec.querySelector('.dl-reel'), sign = sec.querySelector('.dl-sign');
    var intro = sec.querySelector('.dl-intro'), rail = sec.querySelector('.dl-rail'), list = sec.querySelector('.dl-rail [role="tablist"]'), all = sec.querySelector('.dl-all');
    var head = intro && intro.querySelector('h2'), lede = intro && intro.querySelector('.lede');
    var cards = $$('.dl-card', sec), faces = cards.map(function (c) { return c.querySelector('.dl-face'); }), tabs = $$('.dl-tab', sec), ambs = $$('.dl-amb', sec);
    var gos = cards.map(function (c) { return c.querySelector('.dl-go a'); });
    if (!stage || !reel || !sign || !intro || !rail || !list || !all || !head || !lede || !cards.length) return;
    var TEXTS = '.dl-store, .dl-big, .dl-small, .dl-title, .dl-body';   // the button is not smoked: it rises (deals.css)
    var RMQ = w.matchMedia('(prefers-reduced-motion: reduce)'), WIDE = w.matchMedia('(min-width: 900px) and (min-height: 600px)');
    var DOCK = .9, UNDOCK = .8;   // the pin's progress at which the titles have docked (the deal plays), and below which they have left
    var mode = '', act = -2, sel = 0, raf = 0, rz = 0, seen = false, p = 0, moves = [], dock = null;
    var px = 0, py = 0, tx = 0, ty = 0, praf = 0;
    function css(k, v) { sec.style.setProperty(k, v); }
    function last(es) { return es[es.length - 1]; }
    function ramp(v, a, b) { return clamp((v - a) / (b - a), 0, 1); }
    function ease(t) { return t < .5 ? 2 * t * t : 1 - Math.pow(2 - 2 * t, 2) / 2; }
    function box(e) { var r = e.getBoundingClientRect(); return { l: r.left, t: r.top, w: r.width }; }
    function fs(e) { return parseFloat(getComputedStyle(e).fontSize) || 16; }

    // the rail: the picked deal's tab is selected and is the rail's one tab stop (roving tabindex). Tab from the rail
    // goes into the deal on stage, so the buttons of the deals before it leave the tab order; tabbing on from it still
    // reaches the deals after it, each taking the stage as its button gets focus
    function mark(s) {
      sel = s;
      tabs.forEach(function (t, i) { t.setAttribute('aria-selected', i === s ? 'true' : 'false'); t.tabIndex = i === s ? 0 : -1; });
      gos.forEach(function (g, i) { if (!g) return; if (i < s) g.tabIndex = -1; else g.removeAttribute('tabindex'); });
    }
    function setAct(a) {
      act = a; sec.setAttribute('data-act', String(a));
      if (a >= 0) mark(a);
      // on the reel, the picked deal waits in its frame (is-next) while the titles are not docked
      cards.forEach(function (c, i) { c.classList.toggle('is-on', i === a); c.classList.toggle('is-past', i < a); c.classList.toggle('is-next', mode === 'reel' && a < 0 && i === sel); });
      ambs.forEach(function (m, i) { m.classList.toggle('is-on', i === a); });
      // the card's texts smoke in; one still smoking from its last turn on stage simply plays on
      if (a >= 0) $$(TEXTS, cards[a]).forEach(function (t) { if (smokeArm(t)) smokePlay(t); });
    }

    // the dock: an unseen copy of the titles (aria-hidden) at the top of the rail gives each title its docked place and
    // size; the tabs follow below it in the rail's own flow
    function buildDock() {
      dock = d.createElement('div'); dock.className = 'dl-dock'; dock.setAttribute('aria-hidden', 'true');
      [sign, head, lede].forEach(function (e) {
        var c = e.cloneNode(false);
        ['id', 'style', 'data-smoke', 'data-reveal'].forEach(function (k) { c.removeAttribute(k); });
        c.classList.remove('is-lit');
        c.innerHTML = e._smoke ? e._smoke.orig : e.innerHTML;   // a heading still waiting to smoke in: its own markup
        dock.appendChild(c);
      });
      rail.insertBefore(dock, list);
    }
    // the copy's sizes: the sign and the heading as large as the rail's width allows (at most .55 and .72 of their own),
    // the lede re-set at 14.5px; all smaller together while the copy and the four tabs would not fit above All deals
    // (down to half, the lede to 12px). Then each title's move from its own place onto its copy
    function layout() {
      if (mode !== 'reel' || !dock) return;
      var els = [sign, head, lede], gs = [].slice.call(dock.children);
      els.forEach(function (e) { e.style.transform = ''; });
      var A = els.map(box), wide = rail.getBoundingClientRect().width - 32;
      var fN = fs(sign.children[0]), fS = fs(sign.children[1]), fH = fs(head), fL = fs(lede), k = 1, s = [];
      for (var n = 0; n < 6; n++) {
        s = [Math.min(.55, wide / A[0].w) * k, Math.min(.72, wide / A[1].w) * k, Math.max(12, 14.5 * (.55 + .45 * k)) / fL];
        gs[0].children[0].style.fontSize = fN * s[0] + 'px'; gs[0].children[1].style.fontSize = fS * s[0] + 'px'; gs[0].style.gap = 4 * s[0] + 'px';
        gs[1].style.fontSize = fH * s[1] + 'px'; gs[2].style.fontSize = fL * s[2] + 'px';
        var r0 = rail.getBoundingClientRect().top, room = all.getBoundingClientRect().top - 18 - r0, need = list.getBoundingClientRect().bottom - r0;
        if (need <= room || k <= .5) break;
        k = Math.max(.5, k * Math.max(.75, room / need));
      }
      // (the lede itself, gone by a third of the way, shrinks to the rail's width as it leaves)
      var B = gs.map(box);
      moves = els.map(function (e, i) { return { e: e, x: B[i].l - A[i].l, y: B[i].t - A[i].t, s: i === 2 ? Math.min(s[2], wide / A[2].w) : B[i].w / A[i].w }; });
      apply();
    }
    // one frame of the dock, from the pin's progress p (0 to 1): the titles' moves (eased), the lede's cross-fade, the
    // tabs, All deals and the card area fading in; then the deal: it plays once the titles have docked and goes back to
    // waiting once they leave (UNDOCK sits below DOCK so a pause at the threshold does not flicker)
    function apply() {
      var t = ease(ramp(p, 0, DOCK)), f = ramp(p, .45, DOCK);
      moves.forEach(function (m) {
        m.e.style.transform = t ? 'translate(' + (m.x * t).toFixed(2) + 'px,' + (m.y * t).toFixed(2) + 'px) scale(' + (1 + (m.s - 1) * t).toFixed(4) + ')' : '';
      });
      lede.style.opacity = (1 - ramp(p, 0, .35)).toFixed(3);
      if (dock) dock.children[2].style.opacity = ramp(p, .5, DOCK).toFixed(3);
      list.style.opacity = all.style.opacity = f.toFixed(3);
      list.style.translate = all.style.translate = (40 * (1 - f)).toFixed(1) + 'px 0';
      reel.style.opacity = ramp(p, .5, DOCK).toFixed(3);
      if (act < 0 && p >= DOCK) setAct(sel);
      else if (act >= 0 && p < UNDOCK) setAct(-1);
    }
    function reelFrame() {
      raf = 0; if (mode !== 'reel') return;
      var top = sec.getBoundingClientRect().top + w.pageYOffset, range = Math.max(1, sec.offsetHeight - stage.offsetHeight);
      p = clamp((w.pageYOffset - top) / range, 0, 1);
      apply();
    }
    // the stack: card i sits (i - x) places behind the front card, x being the scroller's position in cards. Only the
    // faces move: the cards themselves are the scroll-snap targets and must keep their layout boxes.
    function stackFrame() {
      raf = 0; if (mode !== 'stack') return;
      var W = cards[0].offsetWidth || 1, x = reel.scrollLeft / W;
      cards.forEach(function (c, i) {
        var k = i - x, s = faces[i].style;
        c.style.zIndex = k >= 0 ? String(10 - i) : '20';
        if (k >= 0) {
          var j = Math.min(k, 3);
          s.transform = 'translate3d(' + (-k * W).toFixed(1) + 'px,' + (j * 16).toFixed(1) + 'px,0) scale(' + (1 - j * .065).toFixed(4) + ')';
          s.opacity = k > 2.6 ? '0' : '1'; s.setProperty('--dim', Math.min(.7, k * .34).toFixed(3));
        } else {   // swiped away: it slides off with the finger, turns and falls
          s.transform = 'translate3d(' + (k * 26).toFixed(1) + 'px,' + (-k * 22).toFixed(1) + 'px,0) rotate(' + (k * 12).toFixed(2) + 'deg)';
          s.opacity = Math.max(0, 1 + k * 1.2).toFixed(3); s.setProperty('--dim', '0');
        }
      });
      if (seen) { var a = clamp(Math.round(x), 0, cards.length - 1); if (a !== act) setAct(a); }
    }
    function frame() { if (!raf && mode) raf = w.requestAnimationFrame(mode === 'reel' ? reelFrame : stackFrame); }

    // picks: a tab, and the keyboard (focus reaching a deal's button takes it on stage). The reel just changes the deal
    // on stage (before the titles have docked, the pick waits in the frame and plays when they dock); the stack slides
    // the deal to the front of its own scroller
    function pick(i, how) {
      if (mode === 'reel') { if (act >= 0) { if (i !== act) setAct(i); } else { mark(i); setAct(-1); } }
      else if (mode === 'stack') reel.scrollTo({ left: i * (cards[0].offsetWidth || 1), behavior: how || 'smooth' });
    }
    tabs.forEach(function (tb, i) {
      tb.addEventListener('click', function () { if (mode) pick(i); });   // a button: no jump, and focus stays on the tab
    });
    if (list) list.addEventListener('keydown', function (e) {
      var i = tabs.indexOf(e.target), n = tabs.length, j = -1;
      if (!mode || i < 0 || e.altKey || e.ctrlKey || e.metaKey) return;
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') j = (i + 1) % n;
      else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') j = (i + n - 1) % n;
      else if (e.key === 'Home') j = 0;
      else if (e.key === 'End') j = n - 1;
      if (j < 0) return;
      e.preventDefault(); tabs[j].focus();   // manual activation: Enter, Space or a click picks the focused tab
    });
    reel.addEventListener('focusin', function (e) {
      if (!mode) return;
      var c = e.target.closest ? e.target.closest('.dl-card') : null, i = cards.indexOf(c);
      if (i < 0 || e.target === c) return;
      if (mode === 'reel' && i !== act) pick(i);
      if (mode === 'stack' && Math.abs(reel.scrollLeft - i * cards[0].offsetWidth) > 2) pick(i, 'instant');
    });
    // keyboard focus on a tab, a deal's button or All deals before the titles have docked: the page goes to the end of
    // the pin, where they have, so the focused control shows and its deal plays (the tabs take no clicks until then)
    sec.addEventListener('focusin', function (e) {
      if (mode !== 'reel' || act >= 0 || !(rail.contains(e.target) || reel.contains(e.target) || all.contains(e.target))) return;
      var key = true; try { key = e.target.matches(':focus-visible'); } catch (x) { /* no :focus-visible: treat it as the keyboard */ }
      if (key) w.scrollTo({ top: Math.ceil(sec.getBoundingClientRect().top + w.pageYOffset + sec.offsetHeight - stage.offsetHeight), behavior: 'instant' });
    });
    w.addEventListener('scroll', function () { if (mode === 'reel') frame(); }, { passive: true });
    reel.addEventListener('scroll', function () { if (mode === 'stack') frame(); }, { passive: true });
    w.addEventListener('resize', function () { frame(); w.clearTimeout(rz); rz = w.setTimeout(function () { layout(); frame(); }, 150); }, { passive: true });
    w.addEventListener('load', function () { layout(); frame(); });
    if (d.fonts && d.fonts.ready) d.fonts.ready.then(function () { layout(); frame(); });

    // the pointer tilts the card, lights its glass and nudges the spotlight
    function pFrame() {
      praf = 0; px += (tx - px) * .12; py += (ty - py) * .12;
      css('--px', px.toFixed(4)); css('--py', py.toFixed(4));
      if (Math.abs(tx - px) > .002 || Math.abs(ty - py) > .002) praf = w.requestAnimationFrame(pFrame);
    }
    stage.addEventListener('pointermove', function (e) {
      if (mode !== 'reel' || e.pointerType === 'touch') return;
      var r = stage.getBoundingClientRect();
      tx = clamp((e.clientX - r.left) / r.width * 2 - 1, -1, 1); ty = clamp((e.clientY - r.top) / r.height * 2 - 1, -1, 1);
      if (act >= 0) { var q = cards[act].getBoundingClientRect(); css('--gx', ((e.clientX - q.left) / q.width * 100).toFixed(1) + '%'); css('--gy', ((e.clientY - q.top) / q.height * 100).toFixed(1) + '%'); }
      sec.classList.add('is-hover');
      if (!praf) praf = w.requestAnimationFrame(pFrame);
    }, { passive: true });
    stage.addEventListener('pointerleave', function () { tx = ty = 0; sec.classList.remove('is-hover'); if (!praf) praf = w.requestAnimationFrame(pFrame); });

    // arrival (IntersectionObserver): the neon sign flickers on when it comes into view (the heading smokes in on its own,
    // as a section title); the stack's front card plays when the stack is in view
    if ('IntersectionObserver' in w) {
      new IntersectionObserver(function (es) { if (last(es).isIntersecting && mode) sign.classList.add('is-lit'); }, { threshold: .5 }).observe(sign);
      new IntersectionObserver(function (es) { if (last(es).isIntersecting && !seen) { seen = true; frame(); } }, { threshold: .4 }).observe(reel);
    } else { seen = true; sign.classList.add('is-lit'); }

    function teardown() {
      mode = ''; act = -2; p = 0; moves = [];
      sec.classList.remove('is-live', 'is-reel', 'is-stack', 'is-hover'); sec.removeAttribute('data-act');
      ['--px', '--py', '--gx', '--gy'].forEach(function (k) { sec.style.removeProperty(k); });
      faces.forEach(function (f) { f.removeAttribute('style'); });
      cards.forEach(function (c) { c.classList.remove('is-on', 'is-past', 'is-next'); c.removeAttribute('style'); c.removeAttribute('role'); });
      [sign, head, lede, list, all, reel].forEach(function (e) { ['transform', 'opacity', 'translate'].forEach(function (k) { e.style.removeProperty(k); }); });
      tabs.forEach(function (t) { t.removeAttribute('aria-selected'); t.removeAttribute('tabindex'); });
      gos.forEach(function (g) { if (g) g.removeAttribute('tabindex'); });
      ambs.forEach(function (m) { m.classList.remove('is-on'); });
      list.removeAttribute('aria-orientation');
      if (dock) { dock.parentNode.removeChild(dock); dock = null; }
    }
    function boot() {
      teardown();
      if (RMQ.matches) return;
      mode = WIDE.matches ? 'reel' : 'stack';
      sec.classList.add('is-live', 'is-' + mode);
      cards.forEach(function (c) { c.setAttribute('role', 'tabpanel'); });
      list.setAttribute('aria-orientation', mode === 'reel' ? 'vertical' : 'horizontal');
      if (mode === 'reel') { buildDock(); mark(sel); setAct(-1); layout(); reelFrame(); }
      else { mark(0); reel.scrollLeft = 0; stackFrame(); }
    }
    [RMQ, WIDE].forEach(function (q) { if (q.addEventListener) q.addEventListener('change', boot); else if (q.addListener) q.addListener(boot); });
    boot();
  })();

  /* ---------- the deals wall (/deals; owner requests 2026-11-12; markup shop.mjs cave(), styles carousel.css): ported from
     an earlier redesign's cave gallery (its site.js [data-cave]). Card i hangs at the angle a = (i - pos) * step on
     a drum of radius R, seen from inside it at the perspective distance P: x = R sin a, z = R (1 - cos a), turned by -a,
     so the side cards come closer and turn in (their outer edges forward) and the centred card, facing front, sits
     furthest back; the ring is endless (modulo the card count). A drag keeps the wall under the pointer, a flick carries
     on a little and the wall settles with a card centred; a click on a side card, the buttons, the arrow keys (while the
     wall has focus) and a sideways trackpad swipe turn it; an up-and-down wheel or swipe stays the page's. Changed in the
     port: no drift (no autoplay: this site has no pause control); the pointer is captured only once a drag begins, so the
     centred card's button stays a plain link; a click on a side card centres it and does not follow its button; only the
     centred card's button is in the tab order; a polite live region names the centred deal; and with reduced motion
     (followed live) the cards stay the flat swipe row the page shows without the script (carousel.css). ---------- */
  $$('[data-cave]').forEach(function (cv) {
    var stage = $('.cave__stage', cv), wall = $('.cave__wall', cv), panels = $$('.cave__panel', cv), n = panels.length;
    if (!n || !stage || !wall || !w.requestAnimationFrame) return;
    var cap = $('.cave__caption', cv), capT = $('.cave__title', cv), capS = $('.cave__sub', cv), num = $('[data-cave-n]', cv), live = $('[data-cave-live]', cv);
    var gos = panels.map(function (p) { return $('a[href]', p); });
    var mq = w.matchMedia('(prefers-reduced-motion: reduce)');
    var on = false, pos = 0, target = null, pw = 0, gap = 0, R = 0, step = 0, dragging = false, raf = 0, last = 0, shown = -1;
    // a card is gone before it wraps round (as on the earlier build); the fade stops short of the neighbours, so with four cards they stay whole
    var END = n / 2 - 0.55, FADE = Math.max(0.2, Math.min(0.6, END - 1));
    var wrap = function (k) { var m = ((k % n) + n) % n; return m >= n / 2 ? m - n : m; };   // into [-n/2, n/2)
    function measure() {
      if (!on) return;
      var W = stage.clientWidth;
      // 3:4 cards, about 78vw on a phone (the neighbours peek), 300-380px wide on wider screens; the drum per card width is
      // the earlier build's (its P = 4h = 3.2w), so a neighbour turns the same 17 degrees
      pw = Math.round(Math.min(W * 0.78, Math.max(300, W * 0.25), 380));
      var ph = Math.round(pw * 4 / 3), P = pw * 3.2;
      gap = Math.round(Math.max(10, pw * 0.044)); R = P * 1.08; step = (pw + gap) / R;
      cv.style.setProperty('--pw', pw + 'px'); cv.style.setProperty('--ph', ph + 'px');
      wall.style.perspective = P + 'px';
      stage.style.height = Math.round(ph * (W < 900 ? 1.28 : 1.34)) + 'px';   // room for the neighbours' near edges and the floor
      paint();
    }
    function paint() {
      for (var i = 0; i < n; i++) {
        var k = wrap(i - pos), a = k * step, z = R * (1 - Math.cos(a)), el = panels[i];
        var op = clamp((END - Math.abs(k)) / FADE, 0, 1);
        el.style.transform = 'translate3d(' + (R * Math.sin(a)).toFixed(1) + 'px,0,' + z.toFixed(1) + 'px) rotateY(' + (-a).toFixed(4) + 'rad)';
        el.style.opacity = op.toFixed(3);
        el.style.visibility = op > 0 ? '' : 'hidden';
        el.style.zIndex = String(100 + Math.round(z / 4));
      }
      var c = ((Math.round(pos) % n) + n) % n;
      if (c === shown) return;
      var first = shown < 0, f = d.activeElement;
      shown = c;
      if (capT) capT.textContent = panels[c].getAttribute('data-title') || '';
      if (capS) capS.textContent = panels[c].getAttribute('data-sub') || '';
      if (num) num.textContent = (c < 9 ? '0' : '') + (c + 1);
      if (cap) { cap.classList.remove('is-new'); void cap.offsetWidth; cap.classList.add('is-new'); }
      if (live && !first) live.textContent = panels[c].getAttribute('aria-label') || '';
      panels.forEach(function (p, j) {
        if (j === c) p.setAttribute('aria-current', 'true'); else p.removeAttribute('aria-current');
        if (gos[j]) { if (j === c) gos[j].removeAttribute('tabindex'); else gos[j].setAttribute('tabindex', '-1'); }
      });
      if (f && f !== stage && stage.contains(f) && !panels[c].contains(f)) stage.focus({ preventScroll: true });   // a button leaving the centre hands focus to the wall
    }
    function tick(now) {
      raf = 0;
      var dt = Math.min(0.05, Math.max(0, (now - last) / 1000)); last = now;
      if (!dragging && target !== null) {
        pos += (target - pos) * (1 - Math.exp(-dt * 9));
        if (Math.abs(target - pos) < 0.0006) { pos = target; target = null; }
      }
      paint();
      if (!dragging && target !== null) raf = w.requestAnimationFrame(tick);
    }
    function settle(t) { target = t; if (!raf) { last = performance.now(); raf = w.requestAnimationFrame(tick); } }
    function go(dir) { if (on) settle((target !== null ? target : Math.round(pos)) + dir); }
    // drag, flick, click. eat: the click a gesture ends in follows no link (after a drag, or on a side card); it lapses
    // at the next press or soon after, so a keyboard Enter on the centred button is never eaten
    var startX = 0, startPos = 0, lastX = 0, lastT = 0, vel = 0, moved = 0, pid = null, held = false, eat = false, eatT = 0;
    function eatNext() { eat = true; clearTimeout(eatT); eatT = setTimeout(function () { eat = false; }, 400); }
    stage.addEventListener('pointerdown', function (e) {
      if (!on || (e.pointerType === 'mouse' && e.button !== 0)) return;
      dragging = true; target = null; held = false; eat = false; pid = e.pointerId;
      startX = lastX = e.clientX; startPos = pos; lastT = performance.now(); vel = 0; moved = 0;
    });
    stage.addEventListener('pointermove', function (e) {
      if (!dragging || e.pointerId !== pid) return;
      if (e.pointerType === 'mouse' && !(e.buttons & 1)) { release(e); return; }   // let go outside the wall before a drag began
      var dx = e.clientX - startX, now = performance.now(), dt = Math.max(8, now - lastT);
      moved = Math.max(moved, Math.abs(dx));
      if (!held) {
        if (moved < 6) return;
        held = true; cv.classList.add('is-dragging');
        try { stage.setPointerCapture(pid); } catch (err) { /* capture is a nicety */ }
      }
      pos = startPos - dx / (pw + gap);
      vel = 0.75 * vel + 0.25 * (-(e.clientX - lastX) / (pw + gap)) / (dt / 1000);
      lastX = e.clientX; lastT = now;
      paint();
    });
    function release(e) {
      if (!dragging || e.pointerId !== pid) return;
      dragging = false; cv.classList.remove('is-dragging');
      if (e.type === 'pointerup' && !held) {   // a click: turn to the card under it
        var hit = d.elementFromPoint(e.clientX, e.clientY), p = hit && hit.closest ? hit.closest('.cave__panel') : null;
        var k = p ? panels.indexOf(p) : -1, c = Math.round(pos);
        if (k >= 0 && k !== shown) eatNext();
        settle(k >= 0 ? c + Math.round(wrap(k - c)) : c);
        return;
      }
      if (held) eatNext();
      if (performance.now() - lastT > 120) vel = 0;   // held still before letting go: no flick
      settle(Math.round(pos + clamp(vel * 0.35, -3, 3)));
    }
    stage.addEventListener('pointerup', release);
    stage.addEventListener('pointercancel', release);
    stage.addEventListener('click', function (e) { if (eat) { e.preventDefault(); e.stopPropagation(); eat = false; } }, true);
    stage.addEventListener('dragstart', function (e) { if (on) e.preventDefault(); });   // no ghost image of a photo or a link
    // a sideways swipe on a trackpad turns it; an up-and-down wheel stays the page's
    var wheelT = 0;
    stage.addEventListener('wheel', function (e) {
      if (!on || Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault(); target = null;
      pos += e.deltaX / (pw + gap); paint();
      clearTimeout(wheelT); wheelT = setTimeout(function () { settle(Math.round(pos)); }, 140);
    }, { passive: false });
    stage.addEventListener('keydown', function (e) {
      if (!on) return;
      if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
    });
    var prev = $('[data-cave-prev]', cv), next = $('[data-cave-next]', cv);
    if (prev) prev.addEventListener('click', function () { go(-1); });
    if (next) next.addEventListener('click', function () { go(1); });
    function boot() {
      if (mq.matches) {   // reduced motion: back to the flat swipe row
        if (!on) return;
        on = false; dragging = false; target = null; shown = -1;
        if (raf) { w.cancelAnimationFrame(raf); raf = 0; }
        cv.classList.remove('cave-on', 'is-dragging');
        ['--pw', '--ph'].forEach(function (k) { cv.style.removeProperty(k); });
        wall.style.removeProperty('perspective'); stage.style.removeProperty('height');
        ['tabindex', 'role', 'aria-label'].forEach(function (k) { stage.removeAttribute(k); });
        panels.forEach(function (p) { ['transform', 'opacity', 'visibility', 'z-index'].forEach(function (k) { p.style.removeProperty(k); }); p.removeAttribute('aria-current'); });
        gos.forEach(function (g) { if (g) g.removeAttribute('tabindex'); });
        return;
      }
      if (!on) {
        on = true; cv.classList.add('cave-on');
        stage.setAttribute('tabindex', '0'); stage.setAttribute('role', 'group');
        stage.setAttribute('aria-label', 'Store deals: use the arrow keys or the buttons to turn the wall');
      }
      measure();
    }
    if (mq.addEventListener) mq.addEventListener('change', boot); else if (mq.addListener) mq.addListener(boot);
    w.addEventListener('resize', measure, { passive: true });
    boot();
  });

  applyStore(store(), false);
  storeCards();
  setInterval(function () { applyStore(store(), false); storeCards(); }, 60000);
  frame();
})();
