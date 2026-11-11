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
      $$('.store-chip').forEach(function (c) { c.setAttribute('data-status', st.open ? 'open' : 'closed'); c.setAttribute('title', s.name + ': ' + st.text); });
    }
  }
  function storeCards() {
    $$('[data-status-for]').forEach(function (e) {
      var id = e.getAttribute('data-status-for'), st = status(id); if (!st) return;
      e.textContent = st.text;
      var card = e.closest('[data-store-card]'); if (!card) return;
      $$('.store-card__hours div', card).forEach(function (row) { var dt = row.querySelector('dt'); if (!dt) return; var sun = /sun/i.test(dt.textContent); row.classList.toggle('is-today', st.day === 0 ? sun : !sun); });
    });
  }
  d.addEventListener('click', function (e) {
    var b = e.target.closest('[data-store-set]');
    if (b) { applyStore(b.getAttribute('data-store-set'), true); return; }
    var t = e.target.closest('[data-store-toggle]');
    if (t) { var order = DATA.order || Object.keys(STORES); applyStore(order[(order.indexOf(store()) + 1) % order.length], true); return; }
    var pick = e.target.closest('[data-store-pick]');
    if (pick) applyStore(pick.getAttribute('data-store-pick'), true);
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

  /* ---------- header: scrolled state, mega panels ---------- */
  var header = $('[data-header]');
  var openMega = null;
  function setMega(id) {
    $$('.mega').forEach(function (m) { m.classList.toggle('is-open', m.id === 'mega-' + id); });
    $$('[data-mega]').forEach(function (a) { a.setAttribute('aria-expanded', String(a.getAttribute('data-mega') === id)); });
    openMega = id || null;
  }
  if (header) {
    var closeT = null;
    $$('[data-mega]').forEach(function (a) {
      var id = a.getAttribute('data-mega');
      a.addEventListener('mouseenter', function () { if (FINE) { clearTimeout(closeT); setMega(id); } });
      a.addEventListener('focus', function () { setMega(id); });
      a.addEventListener('click', function (e) { if (!FINE && openMega !== id) { e.preventDefault(); setMega(id); } });
    });
    header.addEventListener('mouseleave', function () { closeT = setTimeout(function () { setMega(null); }, 220); });
    header.addEventListener('mouseenter', function () { clearTimeout(closeT); });
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && openMega) { var a = $('[data-mega="' + openMega + '"]'); setMega(null); if (a) a.focus(); } });
    d.addEventListener('focusin', function (e) { if (openMega && !header.contains(e.target)) setMega(null); });
    d.addEventListener('click', function (e) { if (openMega && !header.contains(e.target)) setMega(null); });
    var q = location.search.match(/[?&]mega=(shop|stores|culture)/); if (q) setMega(q[1]);
  }

  /* ---------- drawer ---------- */
  var drawer = d.getElementById('drawer');
  function drawerOpen(o) {
    if (!drawer) return;
    drawer.hidden = !o; html.classList.toggle('drawer-open', o);
    $$('[data-drawer-open]').forEach(function (b) { b.setAttribute('aria-expanded', String(o)); });
    if (o) { var c = drawer.querySelector('[data-drawer-close]'); if (c) c.focus(); } else { var b = $('[data-drawer-open]'); if (b) b.focus(); }
  }
  d.addEventListener('click', function (e) {
    if (e.target.closest('[data-drawer-open]')) drawerOpen(true);
    else if (e.target.closest('[data-drawer-close]') || (drawer && e.target === drawer)) drawerOpen(false);
  });
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && drawer && !drawer.hidden) drawerOpen(false); });

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
  $$('[data-video-toggle]').forEach(function (b) {
    var v = b.closest('section') && b.closest('section').querySelector('[data-bgvid]');
    if (!v) { b.hidden = true; return; }
    if (RM || SAVE) { b.hidden = true; return; }
    b.addEventListener('click', function () {
      var paused = v.paused || v.hasAttribute('data-user-paused');
      if (paused) { v.removeAttribute('data-user-paused'); v.play().catch(function () {}); } else { v.setAttribute('data-user-paused', ''); v.pause(); }
      var nowPaused = !paused;
      b.setAttribute('aria-pressed', String(nowPaused));
      var s = b.querySelector('span'); if (s) s.textContent = nowPaused ? 'Play film' : 'Pause film';
    });
  });

  /* ---------- 3D letters: pointer lift + rig tilt (fine pointer); chrome shine sweep ---------- */
  var rigWrap = $('[data-letters]');
  if (rigWrap && !RM) {
    var shine = d.getElementById('chrome-shine');
    if (shine && shine.beginElement === undefined) { /* noop */ }
    if (shine) {
      var NS = 'http://www.w3.org/2000/svg';
      [['x1', '-1;1.4;1.4'], ['x2', '0;2.4;2.4']].forEach(function (p) { var an = d.createElementNS(NS, 'animate'); an.setAttribute('attributeName', p[0]); an.setAttribute('values', p[1]); an.setAttribute('keyTimes', '0;.45;1'); an.setAttribute('dur', '6.5s'); an.setAttribute('repeatCount', 'indefinite'); shine.appendChild(an); });
    }
    if (FINE) {
      var rig = $('.ltr3d__rig', rigWrap), letters = $$('.ltr3d__word .ltr', rigWrap), host = rigWrap.closest('section') || rigWrap;
      var target = null;
      host.addEventListener('pointermove', function (e) { target = { x: e.clientX, y: e.clientY }; schedule(); });
      host.addEventListener('pointerleave', function () { target = null; rigWrap.classList.remove('is-live'); rig.style.removeProperty('--rx'); rig.style.removeProperty('--ry'); letters.forEach(function (l) { l.style.removeProperty('--lift'); }); });
      var queued = false;
      var schedule = function () { if (!queued) { queued = true; requestAnimationFrame(function () { queued = false; if (!target) return; rigWrap.classList.add('is-live');
        var r = rig.getBoundingClientRect(); var nx = (target.x - (r.left + r.width / 2)) / (innerWidth / 2), ny = (target.y - (r.top + r.height / 2)) / (innerHeight / 2);
        rig.style.setProperty('--ry', (clamp(nx, -1, 1) * 9).toFixed(2) + 'deg'); rig.style.setProperty('--rx', (6 - clamp(ny, -1, 1) * 6).toFixed(2) + 'deg');
        letters.forEach(function (l) { var b = l.getBoundingClientRect(); var dx = target.x - (b.left + b.width / 2), dy = target.y - (b.top + b.height / 2); var dist = Math.sqrt(dx * dx + dy * dy); var lift = clamp(1 - dist / (r.width * .22), 0, 1); l.style.setProperty('--lift', (lift * 26).toFixed(2)); });
      }); } };
    }
  }

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

  /* ---------- the family wall: gallery light + lens (pointer), signatures written by scroll ---------- */
  var wall = $('[data-wall]');
  if (wall) {
    var frames = $$('[data-frame]', wall);
    if (FINE && !RM) {
      wall.addEventListener('pointermove', function (e) {
        var r = wall.getBoundingClientRect(); wall.classList.add('is-lit');
        wall.style.setProperty('--lx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
        wall.style.setProperty('--ly', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
        frames.forEach(function (f) { var b = f.getBoundingClientRect(); var dx = e.clientX - (b.left + b.width / 2), dy = e.clientY - (b.top + b.height / 2); var k = clamp(1 - Math.sqrt(dx * dx + dy * dy) / 520, 0, 1); f.style.setProperty('--s', (1 + k * .045).toFixed(3)); f.style.setProperty('--b', (.9 + k * .16).toFixed(3)); f.style.zIndex = k > .5 ? 2 : ''; });
      });
      wall.addEventListener('pointerleave', function () { wall.classList.remove('is-lit'); frames.forEach(function (f) { f.style.removeProperty('--s'); f.style.removeProperty('--b'); f.style.zIndex = ''; }); });
    }
  }
  var sigs = $$('[data-sign]');
  if (RM) sigs.forEach(function (s) { s.style.setProperty('--p', '1'); });

  /* ---------- one shared rAF loop: parallax, signatures, cruise, creed, dash, header ---------- */
  var depth = $$('[data-depth]'), cruise = $('[data-cruise]'), creed = $('[data-creed]');
  var car = cruise && $('[data-car]', cruise), lines = creed ? $$('.creed__line', creed) : [];
  var lastY = -1, ticking = false, vel = 0, tapes = $$('.tape__track');
  function frame() {
    ticking = false;
    var y = w.scrollY, vh = innerHeight;
    vel = vel * .8 + Math.abs(y - (lastY < 0 ? y : lastY)) * .2; lastY = y;
    if (header) header.classList.toggle('is-scrolled', y > 40);
    if (dash) { var on = y > (hero ? hero.offsetHeight * .55 : 220); dash.classList.toggle('is-on', on && !html.classList.contains('gate-pending')); }
    if (!RM) {
      depth.forEach(function (el) { var r = el.getBoundingClientRect(); if (r.bottom < -200 || r.top > vh + 200) return; var k = parseFloat(el.getAttribute('data-depth')) || 0; el.style.setProperty('--py', ((r.top + r.height / 2 - vh / 2) * k).toFixed(1) + 'px'); });
      sigs.forEach(function (s) { var r = s.getBoundingClientRect(); if (r.top > vh + 100 || r.bottom < -100) return; s.style.setProperty('--p', clamp((vh * .9 - r.top) / (vh * .45), 0, 1).toFixed(3)); });
      if (cruise) {
        var cr = cruise.getBoundingClientRect(), span = cr.height - vh;
        if (cr.bottom > 0 && cr.top < vh && span > 0) {
          var p = clamp(-cr.top / span, 0, 1); cruise.style.setProperty('--p', p.toFixed(4));
          if (car) { var hop = p > .52 && p < .74 ? -Math.abs(Math.sin((p - .52) / .22 * Math.PI * 3)) * (innerWidth < 760 ? 10 : 22) : 0; car.style.setProperty('--hop', hop.toFixed(1) + 'px'); car.style.setProperty('--roll', (hop ? Math.sin((p - .52) * 40) * .8 : 0).toFixed(2) + 'deg'); }
        }
      }
      if (creed) {
        var kr = creed.getBoundingClientRect(), ks = kr.height - vh;
        if (kr.bottom > 0 && kr.top < vh && ks > 0) {
          var kp = clamp(-kr.top / ks, 0, 1), idx = Math.min(lines.length - 1, Math.floor(kp * (lines.length + .6)));
          lines.forEach(function (l, i) { l.classList.toggle('is-lit', i <= idx && kp > .04); });
          var cur = lines[Math.max(0, idx)]; if (cur) { var cb = cur.getBoundingClientRect(); creed.style.setProperty('--sy', ((cb.top + cb.height / 2) / vh * 100).toFixed(1) + '%'); }
          creed.classList.toggle('is-done', kp > .86);
        }
      }
      if (tapes.length && tapes[0].getAnimations) { var rate = 1 + Math.min(vel, 60) / 10; tapes.forEach(function (t) { t.getAnimations().forEach(function (an) { an.playbackRate = rate; }); }); }
    } else if (creed) { lines.forEach(function (l) { l.classList.add('is-lit'); }); creed.classList.add('is-done'); }
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
  w.addEventListener('scroll', onScroll, { passive: true });
  w.addEventListener('resize', onScroll, { passive: true });
  if (vel !== undefined) setInterval(function () { if (vel > .2) onScroll(); }, 120);

  /* ---------- preview forms: never post ---------- */
  d.addEventListener('submit', function (e) {
    var f = e.target.closest('[data-preview-form]'); if (!f) return;
    e.preventDefault();
    var note = f.querySelector('[data-form-status]');
    if (!f.checkValidity()) { var bad = f.querySelector(':invalid'); if (bad) bad.focus(); if (note) note.textContent = 'Please fill in the required fields.'; return; }
    if (note) { note.textContent = 'Thanks. This is a preview build, so nothing was sent: on the live site this form goes to the Originals team.'; note.classList.add('is-sent'); }
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
  applyStore(store(), false);
  storeCards();
  setInterval(function () { applyStore(store(), false); storeCards(); }, 60000);
  frame();
})();
