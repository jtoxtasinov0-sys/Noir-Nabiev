/* Amerika bo‘ylab 80 kun · presentation engine */
(() => {
  'use strict';

  const D = window.DATA, I = window.I18N, MAP = window.US_MAP;
  const html = document.documentElement;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const G = window.gsap;
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const DECK_Q = matchMedia('(min-width: 1000px) and (min-height: 560px) and (orientation: landscape)');
  if (RM || !G) html.classList.add('is-static');
  const MOTION = !RM && !!G;

  let LANG = html.lang === 'ru' ? 'ru' : 'uz';
  const mode = html.classList.contains('is-deck') ? 'deck' : 'scroll';
  const pad = n => String(n).padStart(2, '0');
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  /* =========================================================
     i18n
     ========================================================= */
  let dynN = 0;
  const key = obj => {
    if (typeof obj === 'string') obj = { uz: obj, ru: obj };
    const k = 'dyn.' + (dynN++);
    I.uz[k] = obj.uz; I.ru[k] = obj.ru != null ? obj.ru : obj.uz;
    return k;
  };
  const tr = k => (I[LANG][k] != null ? I[LANG][k] : (I.uz[k] != null ? I.uz[k] : ''));
  const L = obj => (typeof obj === 'string' ? obj : (obj[LANG] != null ? obj[LANG] : obj.uz));
  const T = (obj, tag = 'span', cls = '') => `<${tag}${cls ? ` class="${cls}"` : ''} data-i18n="${key(obj)}">${L(obj)}</${tag}>`;

  function applyI18n(root = document) {
    $$('[data-i18n]', root).forEach(el => {
      const v = tr(el.dataset.i18n);
      if (v.indexOf('<') > -1) el.innerHTML = v; else el.textContent = v;
    });
    $$('[data-i18n-aria]', root).forEach(el => el.setAttribute('aria-label', tr(el.dataset.i18nAria)));
  }

  /* =========================================================
     numbers
     ========================================================= */
  const NF = {};
  const nf = (v, d) => (NF[d] || (NF[d] = new Intl.NumberFormat('ru-RU', { minimumFractionDigits: 0, maximumFractionDigits: d }))).format(v).replace(/[   ]/g, ' ');
  const unitM = () => (LANG === 'ru' ? 'млн' : 'mln');
  function fmt(v, f, o = {}) {
    const p = o.prefix || '', s = o.suffix || '';
    if (f === 'text') return String(v);
    if (f === 'mln') return p + nf(v, o.live ? 1 : 2) + ' ' + unitM() + s;
    return p + nf(Math.round(v), 0) + s;
  }
  const axis = v => (v >= 1e6 ? nf(v / 1e6, 1) + 'M' : v >= 1e3 ? Math.round(v / 1e3) + 'K' : '0');

  const counters = new Set();
  function countUp(el, delay = 0, dur = 1.8) {
    if (!el || el.dataset.fmt === 'text') return;
    const to = parseFloat(el.dataset.to), f = el.dataset.fmt || 'full';
    const o = { prefix: el.dataset.prefix || '', suffix: el.dataset.suffix || '' };
    counters.add(el);
    if (!MOTION) { el.textContent = fmt(to, f, o); return; }
    const st = { v: 0 };
    G.to(st, {
      v: to, duration: dur, delay, ease: 'power3.out', overwrite: true,
      onUpdate: () => { el.textContent = fmt(st.v, f, Object.assign({ live: true }, o)); },
      onComplete: () => { el.textContent = fmt(to, f, o); }
    });
  }
  function refreshCounters() {
    counters.forEach(el => {
      const f = el.dataset.fmt || 'full';
      el.textContent = fmt(parseFloat(el.dataset.to), f, { prefix: el.dataset.prefix || '', suffix: el.dataset.suffix || '' });
    });
  }

  /* =========================================================
     helpers: images, reveal, visibility
     ========================================================= */
  function hydrate(root) {
    $$('img[data-src]', root || document).forEach(img => {
      img.decoding = 'async';
      img.src = img.dataset.src;
      img.removeAttribute('data-src');
    });
  }

  function lazy(img) {
    if (!img || !img.dataset.lazy) return;
    img.decoding = 'async';
    img.src = img.dataset.lazy;
    img.removeAttribute('data-lazy');
  }

  /* waving US flag: 12 slices of one flag image, each bobbing with a phase offset */
  function flags(root = document) {
    $$('.flag', root).forEach(f => {
      if (f.children.length) return;
      for (let k = 0; k < 12; k++) { const i = document.createElement('i'); i.style.setProperty('--k', k); f.appendChild(i); }
    });
  }
  /* big faint stars in the corners of every slide */
  const STAR = (() => {
    let d = '';
    for (let i = 0; i < 10; i++) {
      const a = (-90 + i * 36) * Math.PI / 180, r = i % 2 ? 18.4 : 48;
      d += (i ? 'L' : 'M') + (50 + r * Math.cos(a)).toFixed(2) + ' ' + (50 + r * Math.sin(a)).toFixed(2);
    }
    return d + 'Z';
  })();
  function decorate() {
    $$('.slide__inner').forEach(inner => {
      if (inner.querySelector('.deco')) return;
      inner.insertAdjacentHTML('afterbegin', `<div class="deco" aria-hidden="true"><svg class="deco__star deco__star--a" viewBox="0 0 100 100"><path d="${STAR}"/></svg><svg class="deco__star deco__star--b" viewBox="0 0 100 100"><path d="${STAR}"/></svg></div>`);
    });
  }

  /* smooth text: every word rises out of a soft blur */
  const TEXTY = '.s1__title, .h2, .lead, .s1__lead, .eyebrow, .finale__txt';
  function splitWords(el) {
    if (el.querySelector('.wd')) return $$('.wd', el);
    const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walk.nextNode()) nodes.push(walk.currentNode);
    nodes.forEach(n => {
      if (!n.nodeValue.trim()) return;
      const frag = document.createDocumentFragment();
      n.nodeValue.split(/(\s+)/).forEach(part => {
        if (!part) return;
        if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
        const w = document.createElement('span'); w.className = 'wd'; w.textContent = part; frag.appendChild(w);
      });
      n.parentNode.replaceChild(frag, n);
    });
    return $$('.wd', el);
  }
  function textIn(el, delay = 0, big = false) {
    if (!el) return null;
    if (!MOTION) { el.style.opacity = 1; return null; }
    const words = splitWords(el);
    G.set(el, { opacity: 1, y: 0 });
    const fl = el.querySelector('.flag');
    if (fl) G.fromTo(fl, { opacity: 0, scale: .3, rotate: -25 }, { opacity: 1, scale: 1, rotate: 0, duration: 1.1, ease: 'back.out(2)', delay, transformOrigin: '0% 100%' });
    /* per-word blur repaints every frame, so phones get the rise and fade without it */
    const from = { opacity: 0, yPercent: big ? 40 : 32 };
    const to = { opacity: 1, yPercent: 0, duration: big ? 1.7 : 1.25, ease: 'power3.out', delay,
      stagger: big ? .11 : Math.min(.06, 1 / words.length), clearProps: 'filter,transform' };
    if (mode === 'deck') { from.filter = `blur(${big ? 16 : 9}px)`; to.filter = 'blur(0px)'; }
    return G.fromTo(words, from, to);
  }

  function reveal(els, delay = 0, opts = {}) {
    els = els instanceof Element ? [els] : Array.from(els || []);
    if (!els.length) return null;
    if (!MOTION) { els.forEach(e => { e.style.opacity = 1; }); return null; }
    const st = opts.stagger != null ? opts.stagger : .1;
    els.forEach((e, i) => {
      const d = delay + i * st;
      if (e.matches(TEXTY)) textIn(e, d);
      else G.fromTo(e, { opacity: 0, y: opts.y != null ? opts.y : 36 },
        { opacity: 1, y: 0, duration: opts.dur || 1.35, ease: 'power3.out', delay: d, overwrite: 'auto', clearProps: opts.keep ? '' : 'transform' });
    });
    return null;
  }

  const seen = new Map();
  const io = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const fn = seen.get(e.target);
      io.unobserve(e.target); seen.delete(e.target);
      if (fn) fn();
    });
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0 }) : null;

  /* run fn now (deck, with delay) or when the element scrolls into view */
  function when(el, fn, delay = 0) {
    if (!el) return;
    if (mode === 'deck' || !io) { if (MOTION && delay) G.delayedCall(delay, fn); else fn(); return; }
    seen.set(el, fn); io.observe(el);
  }
  function revealWhen(els, delay = 0, opts) {
    els = Array.from(els || []);
    if (mode === 'deck') { reveal(els, delay, opts); return; }
    els.forEach(el => when(el, () => reveal(el, 0, opts)));
  }

  /* =========================================================
     SLIDE 1 · intro video morphing into a postcard
     ========================================================= */
  const S1 = {
    played: false, running: false, tl: null,
    init() {
      this.video = $('#introVideo');
      this.frame = $('#pcFrame');
      this.card = $('#postcard');
      this.pass = $('#pass');
      const v = this.video;
      $('#vSound').addEventListener('click', e => {
        e.stopPropagation();
        v.muted = !v.muted;
        if (!v.muted) { v.currentTime = 0; v.play().catch(() => {}); }
        this.syncSound();
      });
      $('#vReplay').addEventListener('click', e => { e.stopPropagation(); v.currentTime = 0; v.play().catch(() => {}); });
      this.frame.addEventListener('click', () => { if (this.running) this.finish(true); });
      v.addEventListener('volumechange', () => this.syncSound());
      this.syncSound();
    },
    syncSound() {
      const use = $('#vSound use');
      if (use) use.setAttribute('href', this.video.muted ? '#i-speaker-slash' : '#i-speaker-high');
    },
    cover() {
      const r = this.card.getBoundingClientRect();
      const W = innerWidth, H = innerHeight;
      const s = Math.max(W / r.width, H / r.height) * 1.002;
      G.set(this.frame, { x: W / 2 - (r.left + r.width / 2), y: H / 2 - (r.top + r.height / 2), scale: s, borderRadius: 0 });
      G.set(this.card, { '--pcb': 0 });
    },
    play() {
      const v = this.video;
      let started = false;
      const go = () => {
        if (started) return; started = true;
        html.classList.remove('is-waiting');
        v.play().then(() => {}).catch(() => this.fallback());
      };
      if (v.readyState >= 3) go();
      else {
        html.classList.add('is-waiting');
        v.addEventListener('canplaythrough', go, { once: true });
        setTimeout(go, 5000);
      }
    },
    fallback() {
      const v = this.video;
      const toEnd = () => { try { v.currentTime = Math.max(0, (v.duration || 2.7) - .05); } catch (e) {} };
      if (v.readyState >= 1) toEnd(); else v.addEventListener('loadedmetadata', toEnd, { once: true });
      if (this.running) this.finish(true);
    },
    intro() {
      this.running = true;
      html.classList.add('is-intro');
      this.cover();
      G.set(this.pass, { opacity: 0 });
      const onResize = () => { if (this.running && !this.morphing) this.cover(); };
      addEventListener('resize', onResize);
      this.video.addEventListener('ended', () => { if (this.running) G.delayedCall(.35, () => this.finish(false)); }, { once: true });
      this.play();
    },
    finish(fast) {
      if (this.morphing) return;
      this.morphing = true;
      const tl = G.timeline({
        onComplete: () => {
          this.running = false; html.classList.remove('is-intro');
          G.set(this.frame, { clearProps: 'transform' });
          idleHydrate();
        }
      });
      tl.to(this.frame, { x: 0, y: 0, scale: 1, borderRadius: '0.8rem', duration: fast ? .8 : 1.4, ease: 'expo.inOut' }, 0)
        .to(this.card, { '--pcb': 1, duration: .6, ease: 'power2.out' }, fast ? .35 : .85)
        .add(() => this.revealCopy(), fast ? .25 : .6)
        .fromTo(this.pass, { opacity: 0, y: 110, rotate: 6 }, { opacity: 1, y: 0, rotate: -4, duration: 1.2, ease: 'expo.out' }, fast ? .5 : 1.05)
        .add(() => html.classList.remove('is-intro'), fast ? .45 : 1.0);
      this.tl = tl;
    },
    revealCopy() {
      html.classList.add('s1-shown');
      if (!MOTION) return;
      const slide = $('#s1');
      textIn($('.s1__title', slide), .05, true);
      reveal($$('.rv', slide), .35, { stagger: .14 });
    },
    enter() {
      if (this.played) return;
      this.played = true;
      if (mode === 'deck' && MOTION && this.allowIntro) { this.intro(); return; }
      /* scroll mode / reduced motion / deep link: everything in place, video plays in its card */
      if (MOTION) {
        this.revealCopy();
        G.fromTo(this.pass, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 1.1, ease: 'expo.out', delay: .4 });
      } else {
        this.pass.style.opacity = 1;
      }
      const v = this.video;
      when(this.card, () => v.play().catch(() => this.fallback()));
      idleHydrate();
    },
    leave() { }
  };

  /* =========================================================
     SLIDE 2 · route map + coverflow + 80-day rail
     ========================================================= */
  const S2 = {
    active: 0, prog: 0, played: false, built: false,
    build() {
      const C = D.cities, svg = $('#map'), P = C.map(c => MAP.pts[c.id]);
      this.P = P;

      /* dot matrix inside the US outline. Land, borders and the ~7000 dots are painted once
         into bitmaps; as vectors they were re-stroked on every frame of the route animation */
      const pts = [];
      let base = '', dotsBmp = '';
      try {
        const ctx = document.createElement('canvas').getContext('2d');
        const shape = new Path2D(MAP.nation);
        const step = 7.4, rowH = step * .866;
        for (let y = 3, row = 0; y < MAP.h; y += rowH, row++) {
          for (let x = (row % 2 ? step / 2 : 0) + 2; x < MAP.w; x += step) {
            if (ctx.isPointInPath(shape, x, y)) pts.push(x, y);
          }
        }
        const k = clamp(Math.ceil((window.devicePixelRatio || 1) * (svg.getBoundingClientRect().width || MAP.w) / MAP.w * 4) / 4, 1, 2.5);
        const paint = draw => {
          const c = document.createElement('canvas');
          c.width = Math.round(MAP.w * k); c.height = Math.round(MAP.h * k);
          const g = c.getContext('2d');
          g.scale(k, k); draw(g);
          return c.toDataURL('image/png');
        };
        base = paint(g => {
          g.fillStyle = 'rgba(19, 27, 53, .035)'; g.fill(shape);
          g.strokeStyle = 'rgba(19, 27, 53, .13)'; g.lineWidth = .7; g.stroke(new Path2D(MAP.borders));
        });
        dotsBmp = paint(g => {
          g.fillStyle = 'rgba(19, 27, 53, .3)'; g.beginPath();
          for (let i = 0; i < pts.length; i += 2) { g.moveTo(pts[i] + 1.25, pts[i + 1]); g.arc(pts[i], pts[i + 1], 1.25, 0, Math.PI * 2); }
          g.fill();
        });
      } catch (e) { base = dotsBmp = ''; }
      let dots = '';
      if (!dotsBmp) for (let i = 0; i < pts.length; i += 2) dots += `M${pts[i].toFixed(1)} ${pts[i + 1].toFixed(1)}h0`;
      const bmp = (cls, href, id) => `<image class="m-bmp ${cls}"${id ? ` id="${id}"` : ''} href="${href}" x="0" y="0" width="${MAP.w}" height="${MAP.h}"/>`;

      /* route: gentle arcs between stops */
      const bow = { alaska: 'w', hawaii: 's' };
      let route = `M${P[0][0]} ${P[0][1]}`;
      const segs = [];
      for (let i = 1; i < P.length; i++) {
        const [x0, y0] = P[i - 1], [x1, y1] = P[i];
        const dx = x1 - x0, dy = y1 - y0, len = Math.hypot(dx, dy) || 1;
        let nx = -dy / len, ny = dx / len;
        const b = bow[C[i].id] || 'n';
        if ((b === 'n' && ny > 0) || (b === 'w' && nx > 0) || (b === 's' && ny < 0)) { nx = -nx; ny = -ny; }
        const k = b === 'n' ? .17 : b === 'w' ? .42 : .26;
        const cx = ((x0 + x1) / 2 + nx * len * k).toFixed(1), cy = ((y0 + y1) / 2 + ny * len * k).toFixed(1);
        route += ` Q${cx} ${cy} ${x1} ${y1}`;
        segs.push(`M${x0} ${y0} Q${cx} ${cy} ${x1} ${y1}`);
      }

      const pins = C.map((c, i) => {
        const [x, y] = P[i];
        const right = x < 880;
        return `<g class="pin" data-i="${i}" transform="translate(${x} ${y})" role="button" tabindex="0" aria-label="${L(c.name)}">
            <circle class="pin-hit" r="16"/>
            <circle class="pin-ring" r="9"/>
            <circle class="pin-dot" r="8.5"/>
            <text class="pin-num">${i + 1}</text>
            <text class="pin-label" x="${right ? 14 : -14}" y="4" text-anchor="${right ? 'start' : 'end'}" data-i18n="${key(c.name)}">${L(c.name)}</text>
          </g>`;
      }).join('');

      svg.innerHTML = `
        <defs>
          <clipPath id="bClip"><circle r="30"/></clipPath>
          <mask id="dotMask" maskUnits="userSpaceOnUse" x="-50" y="-50" width="1075" height="710">
            <rect x="-50" y="-50" width="1075" height="710" fill="#000"/>
            <circle id="dotReveal" cx="${P[0][0]}" cy="${P[0][1]}" r="1300" fill="#fff"/>
          </mask>
        </defs>
        ${base ? bmp('m-land', base) : `<path class="m-land" d="${MAP.nation}"/><path class="m-borders" d="${MAP.borders}"/>`}
        ${dotsBmp ? bmp('m-dots', dotsBmp, 'mDots') : `<path class="m-dots" id="mDots" d="${dots}"/>`}
        <text class="m-inset" x="14" y="476" data-i18n="s2.alaska">${tr('s2.alaska')}</text>
        <text class="m-inset" x="232" y="600" data-i18n="s2.hawaii">${tr('s2.hawaii')}</text>
        <path class="r-plan" d="${route}"/>
        <path class="r-done" id="rDone" d="${route}"/>
        <g id="pins">${pins}</g>
        <g class="bubble" id="bubble" style="opacity:0">
          <line class="b-stem" id="bStem" x1="0" y1="0" x2="0" y2="0"/>
          <g id="bPos"><g id="bBody">
            <circle class="b-bg" r="35"/>
            <image id="bImg" x="-30" y="-30" width="60" height="60" clip-path="url(#bClip)" preserveAspectRatio="xMidYMid slice" href=""/>
            <circle class="b-ring" r="30"/>
          </g></g>
        </g>
        <g class="plane" id="plane" style="opacity:0"><use href="#i-airplane-tilt-fill" x="-11" y="-11" width="22" height="22"/></g>`;

      /* measure legs */
      const ns = 'http://www.w3.org/2000/svg';
      this.cum = [0];
      segs.forEach(s => {
        const p = document.createElementNS(ns, 'path');
        p.setAttribute('d', s); svg.appendChild(p);
        this.cum.push(this.cum[this.cum.length - 1] + p.getTotalLength());
        p.remove();
      });
      this.rDone = $('#rDone');
      this.L = this.rDone.getTotalLength();
      this.rDone.style.strokeDasharray = this.L;
      this.rDone.style.strokeDashoffset = this.L;
      this.plane = $('#plane'); this.bubble = $('#bubble'); this.bBody = $('#bBody'); this.bPos = $('#bPos'); this.bImg = $('#bImg'); this.bStem = $('#bStem');
      this.pins = $$('.pin', svg);

      this.pins.forEach(p => {
        const sel = () => this.select(+p.dataset.i);
        p.addEventListener('click', sel);
        p.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); sel(); } });
      });

      /* coverflow */
      const stage = $('#cfStage');
      stage.innerHTML = C.map((c, i) => `
        <button type="button" class="cf-card" data-i="${i}" aria-label="${L(c.name)}">
          <img data-lazy="assets/img/cities/${c.id}.jpg" alt="" draggable="false">
          <span class="cf-card__shade"></span>
          <span class="cf-card__txt">
            <span class="cf-card__num mono">${pad(i + 1)} / 15</span>
            ${T(c.name, 'span', 'cf-card__name')}
            <span class="cf-card__en mono">${c.en}</span>
          </span>
        </button>`).join('');
      this.cards = $$('.cf-card', stage);
      this.cards.forEach(card => card.addEventListener('click', () => { if (!this.dragged) this.select(+card.dataset.i); }));
      $('#cfPrev').addEventListener('click', () => this.select(this.active - 1));
      $('#cfNext').addEventListener('click', () => this.select(this.active + 1));

      /* drag / swipe on coverflow */
      const cf = $('#cflow');
      let sx = null;
      cf.addEventListener('pointerdown', e => { sx = e.clientX; this.dragged = false; });
      addEventListener('pointerup', e => {
        if (sx == null) return;
        const dx = e.clientX - sx; sx = null;
        if (Math.abs(dx) > 40) { this.dragged = true; this.select(this.active + (dx < 0 ? 1 : -1)); setTimeout(() => { this.dragged = false; }, 60); }
      });

      /* 80-day rail */
      const pos = c => ((c.days[0] - 1) / 79) * 100;
      $('#rail').innerHTML = `<div class="rail__line"></div><div class="rail__fill" id="railFill"></div>
        <span class="rail__end rail__end--a mono" data-i18n="s2.d1">${tr('s2.d1')}</span>
        <span class="rail__end rail__end--b mono" data-i18n="s2.d80">${tr('s2.d80')}</span>` +
        C.map((c, i) => `<button type="button" class="rail__stop" data-i="${i}" style="left:${pos(c).toFixed(2)}%" aria-label="${L(c.name)}"><span class="rail__dot"></span><span class="rail__num mono">${pad(i + 1)}</span></button>`).join('');
      this.stops = $$('.rail__stop');
      this.stops.forEach(s => s.addEventListener('click', () => this.select(+s.dataset.i)));
      this.pos = pos;

      $('#mapReplay').addEventListener('click', () => this.play());
      this.layout(0, true);
      this.built = true;
    },

    draw() {
      this.rDone.style.strokeDashoffset = Math.max(0, this.L - this.prog);
      const p = this.rDone.getPointAtLength(this.prog);
      const q = this.rDone.getPointAtLength(Math.min(this.L, this.prog + 1.5));
      const p0 = this.prog >= this.L - 1.5 ? this.rDone.getPointAtLength(this.L - 1.5) : p;
      const ang = Math.atan2(q.y - p0.y, q.x - p0.x) * 180 / Math.PI + 45;
      this.plane.setAttribute('transform', `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) rotate(${ang.toFixed(1)})`);
    },

    visit(i) {
      this.pins[i].classList.add('is-visited');
      this.stops[i].classList.add('is-visited');
      if (MOTION) G.fromTo(this.pins[i].querySelector('.pin-dot'), { attr: { r: 14 } }, { attr: { r: 8.5 }, duration: .7, ease: 'back.out(3)' });
    },

    /* city photos are 900x1200: fetch and decode only the cards around the active one */
    loadNear(i) {
      this.cards.forEach((el, k) => { if (Math.abs(k - i) <= 2) lazy($('img', el)); });
    },

    /* move bubble, coverflow, caption and rail to stop i */
    layout(i, instant) {
      i = clamp(i, 0, D.cities.length - 1);
      const changed = i !== this.active || instant;
      this.active = i;
      this.loadNear(i);
      const c = D.cities[i], [x, y] = this.P[i];

      this.pins.forEach((p, k) => p.classList.toggle('is-active', k === i));
      this.stops.forEach((s, k) => s.classList.toggle('is-active', k === i));
      $('#railFill').style.width = this.pos(c) + '%';

      /* bubble */
      const below = y < 120;
      const by = below ? y + 58 : y - 58;
      const place = () => {
        this.bImg.setAttribute('href', `assets/img/thumbs/${c.id}.jpg`);
        this.bPos.setAttribute('transform', `translate(${x} ${by})`);
        this.bStem.setAttribute('x1', x); this.bStem.setAttribute('y1', y + (below ? 9 : -9));
        this.bStem.setAttribute('x2', x); this.bStem.setAttribute('y2', by + (below ? -35 : 35));
      };
      if (MOTION && !instant && this.bubble.style.opacity !== '0') {
        G.to(this.bubble, {
          opacity: 0, duration: .18, ease: 'power1.in', onComplete: () => {
            place();
            G.fromTo(this.bubble, { opacity: 0 }, { opacity: 1, duration: .35, ease: 'power2.out' });
            G.fromTo(this.bBody, { scale: .4, transformOrigin: '50% 50%' }, { scale: 1, duration: .6, ease: 'back.out(2.2)' });
          }
        });
      } else { place(); this.bubble.style.opacity = instant && !this.played ? 0 : 1; }

      /* coverflow */
      const cw = this.cards[0].offsetWidth || 230;
      this.cards.forEach((el, k) => {
        const d = k - i, a = Math.abs(d), s = Math.sign(d);
        let tx = 0, tz = 0, ry = 0, sc = 1, op = 1;
        if (a === 1) { tx = .56 * cw; tz = -90; ry = -38; sc = .84; op = .95; }
        else if (a === 2) { tx = .88 * cw; tz = -180; ry = -48; sc = .66; op = .6; }
        else if (a > 2) { tx = 1.02 * cw; tz = -260; ry = -55; sc = .5; op = 0; }
        el.style.transform = `translateX(${(s * tx).toFixed(1)}px) translateZ(${tz}px) rotateY(${s * ry}deg) scale(${sc})`;
        el.style.opacity = op;
        el.style.zIndex = 20 - a;
        el.style.pointerEvents = a > 2 ? 'none' : '';
        el.tabIndex = a > 2 ? -1 : 0;
        el.classList.toggle('is-active', a === 0);
      });

      /* caption */
      if (changed) this.caption(!instant);
    },

    caption(anim) {
      const c = D.cities[this.active];
      const days = $('#capDays'), tag = $('#capTag');
      const set = () => {
        days.textContent = tr('s2.days').replace('{a}', c.days[0]).replace('{b}', c.days[1]) + ' · ' + L(c.name);
        if (!c._tk) c._tk = key(c.tag);
        tag.dataset.i18n = c._tk; tag.textContent = L(c.tag);
      };
      if (MOTION && anim) {
        G.to([days, tag], { opacity: 0, y: -6, duration: .18, ease: 'power1.in', onComplete: () => { set(); G.fromTo([days, tag], { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: .45, ease: 'power2.out', stagger: .05 }); } });
      } else set();
    },

    select(i) {
      i = clamp(i, 0, D.cities.length - 1);
      this.stopTour();
      this.layout(i);
    },

    stopTour() {
      if (this.tl) {
        this.tl.kill(); this.tl = null;
        this.prog = this.L; this.draw();
        this.pins.forEach((p, k) => { p.classList.add('is-visited'); this.stops[k].classList.add('is-visited'); });
        G.set('#dotReveal', { attr: { r: 1300 } });
        G.set('#mDots, .map .m-land, .map .m-borders', { opacity: 1 });
        $('#mDots').removeAttribute('mask');
        if (MOTION) G.to(this.plane, { opacity: 0, duration: .4 }); else this.plane.style.opacity = 0;
      }
    },

    play() {
      if (this.tl) { this.tl.kill(); this.tl = null; }
      this.played = true;
      this.pins.forEach((p, k) => { p.classList.remove('is-visited'); this.stops[k].classList.remove('is-visited'); });
      if (!MOTION) {
        this.prog = this.L; this.draw();
        this.pins.forEach((p, k) => this.visit(k));
        this.layout(0, true); this.bubble.style.opacity = 1; return;
      }
      this.prog = 0; this.draw();
      G.set(this.plane, { opacity: 0 });
      const tl = G.timeline(), mDots = $('#mDots');
      /* the masked ripple only runs on desktop, and the mask is dropped as soon as it is done */
      if (mode === 'deck') {
        mDots.setAttribute('mask', 'url(#dotMask)');
        tl.fromTo('#dotReveal', { attr: { r: 0 } }, { attr: { r: 1300 }, duration: 2.4, ease: 'power2.inOut', onComplete: () => mDots.removeAttribute('mask') }, 0);
      } else tl.fromTo(mDots, { opacity: 0 }, { opacity: 1, duration: 1.4 }, 0);
      tl.fromTo('.map .m-borders, .map .m-land', { opacity: 0 }, { opacity: 1, duration: 1.6 }, .3)
        .call(() => { this.visit(0); this.layout(0); this.bubble.style.opacity = 1; }, null, .7)
        .to(this.plane, { opacity: 1, duration: .3 }, 1.1);
      let t = 1.25;
      for (let i = 1; i < D.cities.length; i++) {
        const seg = this.cum[i] - this.cum[i - 1];
        const dur = clamp(.5 + seg / 620, .7, 1.6);
        tl.to(this, { prog: this.cum[i], duration: dur, ease: 'power1.inOut', onUpdate: () => this.draw() }, t);
        t += dur;
        tl.call(() => { this.visit(i); this.layout(i); }, null, t);
        t += .38;
      }
      tl.to(this.plane, { opacity: 0, duration: .5 }, t)
        .call(() => { this.tl = null; }, null, t + .5);
      this.tl = tl;
    },

    enter() {
      if (!this.built) this.build();
      const slide = $('#s2');
      if (this.played) return;
      revealWhen($$('.rv', slide), .15, { stagger: .09 });
      when($('#map'), () => this.play(), .35);
    },
    leave() { },
    resize() { if (!this.built) return; this.layout(this.active, true); if (this.played) this.bubble.style.opacity = 1; },
    refresh() { if (this.built) this.caption(false); }
  };

  /* =========================================================
     SLIDE 3 · bloggers
     ========================================================= */
  const S3 = {
    played: false,
    enter() {
      const s = $('#s3');
      hydrate(s);
      if (this.played) return;
      this.played = true;
      revealWhen($$('.s3__head .rv', s), .1);
      const cards = $$('.hcard', s);
      cards.forEach((card, k) => when(card, () => {
        if (MOTION) {
          G.fromTo(card, { opacity: 0, y: 70 }, { opacity: 1, y: 0, duration: 1.2, ease: 'expo.out', clearProps: 'transform' });
          G.fromTo(card.querySelector('.hcard__photo img'), { scale: 1.25 }, { scale: 1, duration: 1.8, ease: 'expo.out', clearProps: 'transform' });
          G.fromTo($$('.reels__cell', card), { opacity: 0, y: 26, rotate: (i) => (i % 2 ? 3 : -3) }, { opacity: 1, y: 0, rotate: 0, duration: .9, ease: 'expo.out', stagger: .06, delay: .45, clearProps: 'transform' });
        } else card.style.opacity = 1;
        $$('.count', card).forEach((c, i) => countUp(c, .4 + i * .15, 2));
      }, .25 + k * .18));
      const vs = $('.vs', s);
      when(vs, () => { if (MOTION) G.fromTo(vs, { scale: 0, rotate: -120 }, { scale: 1, rotate: 0, duration: 1.2, ease: 'back.out(1.8)' }); }, .7);
    },
    leave() { }
  };

  /* =========================================================
     SLIDE 4 · stats dashboard
     ========================================================= */
  function noirSeries() {
    const spikes = [[122, 102], [136, 78], [178, 151], [222, 116], [280, 102], [382, 141], [478, 127], [516, 108], [596, 59], [671, 66], [702, 97], [731, 59], [792, 71], [831, 149], [902, 257], [918, 146], [960, 113], [982, 125], [1044, 354], [1152, 125], [1182, 198], [1224, 87], [1502, 189], [1540, 42]]
      .map(([x, k]) => [Math.round((x - 115) / 2.077), k * 1000 - 17000]);
    const N = 740, out = [];
    for (let d = 0; d < N; d++) {
      let v = 15000 + 16000 * Math.exp(-Math.pow((d - 600) / 70, 2)) + 3500 * Math.pow(Math.sin(d * .91) * Math.cos(d * .37), 2);
      spikes.forEach(([sd, k]) => {
        if (d >= sd) v += k * (.82 * Math.exp(-(d - sd) / 2.2) + .18 * Math.exp(-(d - sd) / 16));
      });
      out.push(v);
    }
    const b = [];
    for (let i = 0; i < N; i += 3) b.push(Math.max(...out.slice(i, i + 3)));
    return b;
  }
  const JAV = [1.3, .5, .42, .48, .38, .37, .4, .58, .3, .34, .44, .27, .24, .29, .33, .36, .31, .3, .27, .25, .82, .72, .36, .39, .22, .26, .84, .88, .56, .76, .56, .4, .36, .46, .62, 4.6, 1.02, .76, .6, 1.62, .8, .66, .66, 1.06, .4, .36, .5, .66, .38, .4, .37, .27, .28, .31, .3, .4, .36, .32, .33, .3].map(v => v * 1e6);

  const S4 = {
    played: false, cur: 0, built: false,
    build() {
      const tabs = $('#tabs'), wrap = $('#panels');
      const ava = { noir: 'assets/img/noir/avatar.jpg', javokhir: 'assets/img/javokhir/avatar.jpg' };
      tabs.innerHTML = D.panels.map((p, i) => `
        <button type="button" class="tab" role="tab" id="tab-${p.id}" aria-controls="panel-${p.id}" aria-selected="${i === 0}" data-i="${i}">
          <img data-src="${ava[p.who]}" alt="">${T(p.tab)}<svg class="i"><use href="#i-${p.platform === 'youtube' ? 'youtube-logo' : 'instagram-logo'}"/></svg>
        </button>`).join('');
      wrap.innerHTML = D.panels.map(p => this.panel(p)).join('');
      this.tabs = $$('.tab', tabs);
      this.panels = $$('.panel', wrap);
      this.tabs.forEach(t => t.addEventListener('click', () => this.show(+t.dataset.i)));
      tabs.addEventListener('keydown', e => {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        e.preventDefault(); e.stopPropagation();
        const n = (this.cur + (e.key === 'ArrowRight' ? 1 : -1) + this.tabs.length) % this.tabs.length;
        this.show(n); this.tabs[n].focus();
      });
      this.built = true;
    },

    panel(p) {
      const months = D.months;
      const col = p.who === 'noir' ? 'var(--accent)' : 'var(--sky)';
      const kpis = `<div class="pcell kpis">${p.kpis.map(k => `
          <div class="kpi"><b class="count" data-to="${k.v}" data-fmt="${k.fmt}"${k.suffix ? ` data-suffix="${k.suffix}"` : ''}${k.prefix ? ` data-prefix="${k.prefix}"` : ''}>${k.fmt === 'text' ? k.v : '0'}</b>${T(k.l, 'small')}</div>`).join('')}</div>`;

      let line = '';
      if (p.line) {
        const series = p.line.kind === 'noir' ? noirSeries() : JAV;
        const max = p.line.ticks[p.line.ticks.length - 1];
        const W = 1000, H = 300;
        const pts = series.map((v, i) => [i / (series.length - 1) * W, H - Math.min(v, max) / max * H]);
        const d = 'M' + pts.map(q => q[0].toFixed(1) + ' ' + q[1].toFixed(1)).join(' L');
        let pk = 0; series.forEach((v, i) => { if (v > series[pk]) pk = i; });
        const peakX = pts[pk][0] / W * 100, peakY = pts[pk][1] / H * 100;
        const gid = 'g-' + p.id;
        const xl = p.line.xlabels.map(([f, m, y]) => {
          const lab = p.line.kind === 'noir'
            ? { uz: `${months.uz[m]} ${y}`, ru: `${months.ru[m]} ${y}` }
            : { uz: `${y} ${months.uz[m]}`, ru: `${y} ${months.ru[m]}` };
          return T(lab);
        }).join('');
        line = `<div class="pcell pcell--grow">
          ${T(p.line.title, 'h4')}
          <div class="lchart">
            <div class="lchart__plot">
              <svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true">
                <defs>
                  <linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${col}" stop-opacity=".28"/><stop offset="1" stop-color="${col}" stop-opacity="0"/></linearGradient>
                  <clipPath id="c-${p.id}"><rect class="lchart__clip" x="0" y="-20" width="0" height="${H + 40}"/></clipPath>
                </defs>
                ${p.line.ticks.map(t => `<line class="lchart__grid" x1="0" x2="${W}" y1="${(H - t / max * H).toFixed(1)}" y2="${(H - t / max * H).toFixed(1)}"/>`).join('')}
                <g clip-path="url(#c-${p.id})">
                  <path class="lchart__area" fill="url(#${gid})" d="${d} L${W} ${H} L0 ${H} Z"/>
                  <path class="lchart__line" d="${d}"/>
                </g>
              </svg>
              ${p.line.ticks.map(t => `<span class="lchart__y" style="top:${(100 - t / max * 100).toFixed(2)}%">${axis(t)}</span>`).join('')}
              <span class="lchart__peak" style="left:${peakX.toFixed(2)}%;top:${peakY.toFixed(2)}%"><span>${axis(series[pk])}</span></span>
            </div>
            <div class="lchart__x">${xl}</div>
          </div>
        </div>`;
      }

      const bars = (title, rows, f) => {
        const max = Math.max(...rows.map(r => r[1]));
        return `<div class="pcell">${T(title, 'h4')}<div class="hbars">${rows.map(([lab, v]) => `
            <div class="hbar"><div class="hbar__row">${typeof lab === 'string' ? `<span>${lab}</span>` : T(lab)}<b>${f(v)}</b></div>
            <div class="hbar__bar" style="width:${Math.max(1.5, v / max * 100).toFixed(1)}%"></div></div>`).join('')}</div></div>`;
      };
      const pct = v => nf(v, 1) + '%';
      const mlnT = v => ({ uz: nf(v, 1) + ' mln', ru: nf(v, 1) + ' млн' });

      const videos = p.videos ? `<div class="pcell">${T({ uz: I.uz['s4.videos'], ru: I.ru['s4.videos'] }, 'h4')}
          <div class="vids">${p.videos.map(v => `
            <a class="vid" href="https://www.youtube.com/watch?v=${v.id}" target="_blank" rel="noopener">
              <div class="vid__img"><img data-src="assets/img/yt/${v.id}.jpg" alt=""></div>
              <p class="vid__t">${v.t}</p>
              <p class="vid__v">${nf(v.v, 0)}</p>
            </a>`).join('')}</div></div>` : '';

      const reels = p.reels ? (() => {
        const max = Math.max(...p.reels.items.map(r => r.v));
        return `<div class="pcell">${T(p.reels.title, 'h4')}<div class="hbars">${p.reels.items.map(r => `
            <div class="hbar"><div class="hbar__row">${T(r.t)}<b>${T(mlnT(r.v), 'span')}</b></div>
            <div class="hbar__bar" style="width:${(r.v / max * 100).toFixed(1)}%"></div></div>`).join('')}</div></div>`;
      })() : '';

      const gender = `<div class="pcell">${T({ uz: I.uz['s4.gender'], ru: I.ru['s4.gender'] }, 'h4')}
          <div class="donut">
            <svg viewBox="0 0 100 100" aria-hidden="true">
              <circle class="donut__bg" cx="50" cy="50" r="38" stroke-width="12"/>
              <circle class="donut__f" cx="50" cy="50" r="38" stroke-width="12" pathLength="100" stroke-dasharray="${p.gender.f} 100" stroke-dashoffset="${-p.gender.m}" data-to="${p.gender.f}" data-off="${-p.gender.m}"/>
              <circle class="donut__m" cx="50" cy="50" r="38" stroke-width="12" pathLength="100" stroke-dasharray="${p.gender.m} 100" data-to="${p.gender.m}"/>
            </svg>
            <div class="donut__legend">
              <div><i></i>${T({ uz: I.uz['s4.m'], ru: I.ru['s4.m'] })}<b>${pct(p.gender.m)}</b></div>
              <div><i></i>${T({ uz: I.uz['s4.f'], ru: I.ru['s4.f'] })}<b>${pct(p.gender.f)}</b></div>
            </div>
          </div></div>`;

      const amax = Math.max(...p.age);
      const age = `<div class="pcell pcell--grow">${T({ uz: I.uz['s4.age'], ru: I.ru['s4.age'] }, 'h4')}
          <div class="ages">${p.age.map((v, i) => `
            <div class="age"><span class="age__v">${nf(v, 1)}%</span><span class="age__bar" style="height:${(v / amax * 78).toFixed(1)}%"></span><span class="age__l">${D.ages[i]}</span></div>`).join('')}
          </div></div>`;

      const geo = bars({ uz: I.uz['s4.geo'], ru: I.ru['s4.geo'] }, p.geo.map(([c, v]) => [{ uz: D.countries.uz[c], ru: D.countries.ru[c] }, v]), pct);

      let colA = kpis, colC = geo;
      if (p.id === 'noir-yt') {
        colA += line + videos;
        colC += `<div class="pcell pcell--grow insight"><b>${p.insight.v}</b>${T(p.insight.l, 'p')}</div>`;
      } else if (p.id === 'noir-ig') {
        colA += reels + bars(p.langs.title, p.langs.items, pct);
        colC += bars(p.cities.title, p.cities.items, pct);
      } else {
        colA += line + bars(p.types.title, p.types.items, v => (v >= 1e6 ? nf(v / 1e6, 1) + 'M' : Math.round(v / 1e3) + 'K'));
        colC += reels;
      }

      return `<div class="panel" id="panel-${p.id}" role="tabpanel" aria-labelledby="tab-${p.id}" style="--c:${col}">
          <div class="pcol pcol--a">${colA}</div>
          <div class="pcol">${gender}${age}</div>
          <div class="pcol">${colC}</div>
        </div>`;
    },

    show(i, first) {
      if (i === this.cur && !first) return;
      const prev = this.panels[this.cur];
      this.cur = i;
      this.tabs.forEach((t, k) => { t.setAttribute('aria-selected', k === i); t.tabIndex = k === i ? 0 : -1; });
      const next = this.panels[i];
      hydrate(next);
      if (prev && prev !== next) prev.classList.remove('is-on');
      next.classList.add('is-on');
      this.animate(next);
    },

    animate(panel) {
      const cells = $$('.pcell', panel);
      if (MOTION) G.fromTo(cells, { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: .8, ease: 'expo.out', stagger: .045, clearProps: 'transform' });
      $$('.count', panel).forEach((c, k) => countUp(c, .15 + k * .06, 1.6));
      if (!MOTION) return;
      $$('.lchart__clip', panel).forEach(r => G.fromTo(r, { attr: { width: 0 } }, { attr: { width: 1000 }, duration: 2, ease: 'power2.inOut', delay: .25 }));
      $$('.lchart__peak', panel).forEach(pk => G.fromTo(pk, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: .6, ease: 'back.out(2.5)', delay: 1.6 }));
      $$('.donut__m', panel).forEach(c => G.fromTo(c, { attr: { 'stroke-dasharray': '0 100' } }, { attr: { 'stroke-dasharray': `${c.dataset.to} 100` }, duration: 1.4, ease: 'expo.out', delay: .3 }));
      $$('.donut__f', panel).forEach(c => G.fromTo(c, { attr: { 'stroke-dasharray': '0 100' } }, { attr: { 'stroke-dasharray': `${c.dataset.to} 100` }, duration: 1.2, ease: 'expo.out', delay: .75 }));
      G.fromTo($$('.age__bar', panel), { scaleY: 0 }, { scaleY: 1, duration: 1.1, ease: 'expo.out', stagger: .06, delay: .35 });
      G.fromTo($$('.age__v', panel), { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: .5, stagger: .06, delay: .7 });
      G.fromTo($$('.hbar__bar', panel), { scaleX: 0 }, { scaleX: 1, duration: 1.2, ease: 'expo.out', stagger: .05, delay: .3 });
      G.fromTo($$('.vid', panel), { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: .7, ease: 'expo.out', stagger: .07, delay: .5 });
    },

    enter() {
      if (!this.built) this.build();
      const s = $('#s4');
      hydrate(s);
      if (this.played) return;
      this.played = true;
      revealWhen($$('.s4__head .rv', s), .1);
      const tiles = $$('.ktile', s);
      if (mode === 'deck') {
        reveal(tiles, .2, { stagger: .08 });
        tiles.forEach((t, k) => countUp($('.count', t), .35 + k * .1, 2));
      } else {
        tiles.forEach(t => when(t, () => { reveal(t); countUp($('.count', t), .15, 2); }));
      }
      revealWhen([$('#tabs')], .45);
      when($('#panels'), () => this.show(0, true), .55);
    },
    leave() { }
  };

  /* =========================================================
     SLIDE 5 · scenario: one city, two realities
     ========================================================= */
  const S5 = {
    played: false, built: false,
    build() {
      $('#rules').innerHTML = D.rules.map(r => `<li class="rv"><svg class="i"><use href="#i-${r.icon}"/></svg>${T(r.t)}</li>`).join('');
      $('#season').innerHTML = D.season.map(x => `<div><b>${x.v}</b>${T(x.l, 'small')}</div>`).join('');
      const who = '<span class="tag tag--a">A</span><span class="tag tag--b">B</span>';
      $('#beats').innerHTML = D.beats.map((b, i) => `
        <li class="beat">
          <span class="beat__tc">${b.tc}</span>
          <span class="beat__dot"></span>${i < D.beats.length - 1 ? '<span class="beat__ln"></span>' : ''}
          <div class="beat__body"><div class="beat__head">${T(b.t, 'span', 'beat__t')}<span class="beat__who">${who}</span></div>${T(b.d, 'p', 'beat__d')}</div>
        </li>`).join('');

      /* bank card tilt, mouse only */
      const card = $('#bankcard');
      if (MOTION && matchMedia('(hover: hover) and (pointer: fine)').matches) {
        const role = card.parentElement;
        role.addEventListener('pointermove', e => {
          const r = card.getBoundingClientRect();
          const px = (e.clientX - r.left) / r.width - .5, py = (e.clientY - r.top) / r.height - .5;
          G.to(card, { rotateY: px * 14, rotateX: -py * 14, transformPerspective: 700, duration: .5, ease: 'power2.out' });
        });
        role.addEventListener('pointerleave', () => G.to(card, { rotateY: 0, rotateX: 0, duration: .8, ease: 'expo.out' }));
      }
      this.built = true;
    },
    beat(b, delay) {
      G.fromTo(b, { opacity: 0, x: 18 }, { opacity: 1, x: 0, duration: .8, ease: 'expo.out', delay, clearProps: 'transform' });
      G.fromTo($('.beat__dot', b), { scale: 0 }, { scale: 1, duration: .5, ease: 'back.out(3)', delay: delay + .05 });
      const ln = $('.beat__ln', b);
      if (ln) G.fromTo(ln, { scaleY: 0 }, { scaleY: 1, duration: .5, ease: 'power1.inOut', delay: delay + .2 });
    },
    enter() {
      if (!this.built) this.build();
      const s = $('#s5');
      hydrate(s);
      if (this.played) return;
      this.played = true;
      revealWhen($$('.s5__left > .h2, .s5__left > .lead', s), .1);
      const roles = $$('.rv-role', s);
      when(roles[0], () => {
        if (!MOTION) { roles.forEach(r => { r.style.opacity = 1; }); return; }
        G.fromTo(roles[0], { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 1, ease: 'expo.out', clearProps: 'transform' });
        G.fromTo('#bankcard', { rotateY: -70, rotateX: 12, transformPerspective: 800, x: -30 }, { rotateY: 0, rotateX: 0, x: 0, duration: 1.6, ease: 'expo.out' });
        G.fromTo('.bankcard__shine', { xPercent: -120 }, { xPercent: 140, duration: 1.4, ease: 'power2.inOut', delay: .8 });
        G.fromTo(roles[1], { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 1, ease: 'expo.out', delay: .18, clearProps: 'transform' });
        G.fromTo('.zerocard__amt', { scale: 1.6, opacity: 0 }, { scale: 1, opacity: 1, duration: .9, ease: 'back.out(2)', delay: .5 });
        G.fromTo('.zerocard__cut', { scaleX: 0 }, { scaleX: 1, duration: .6, ease: 'power3.inOut', delay: 1.05 });
      }, .3);
      revealWhen($$('#rules li', s), .7, { stagger: .07, y: 18 });
      revealWhen([$('#season')], 1);

      /* run-sheet: one stagger on desktop, each beat as it scrolls in on phones */
      const board = $('.board', s), beats = $$('.beat', s);
      when(board, () => {
        reveal(board, 0, { y: 50 });
        if (!MOTION) { beats.forEach(b => { b.style.opacity = 1; }); return; }
        if (mode === 'deck') beats.forEach((b, i) => this.beat(b, .4 + i * .26));
      }, .25);
      if (MOTION && mode !== 'deck') beats.forEach(b => when(b, () => this.beat(b, .05)));
    },
    leave() { }
  };

  /* =========================================================
     SLIDES 6-8 · how a brand looks in the show
     ========================================================= */
  const brandSlide = id => ({
    played: false,
    bind(s) {
      if (this.bound) return;
      this.bound = true;
      const main = $('.sb__frame--main img', s);
      $$('.sb__frame:not(.sb__frame--main)', s).forEach(f => f.addEventListener('click', () => {
        const img = $('img', f);
        const a = main.getAttribute('src'), b = img.getAttribute('src'), aAlt = main.alt, bAlt = img.alt;
        if (!a || !b) return;
        const swap = () => { main.src = b; img.src = a; main.alt = bAlt; img.alt = aAlt; f.setAttribute('aria-label', aAlt); };
        if (!MOTION) { swap(); return; }
        G.to([main, img], {
          opacity: 0, duration: .22, ease: 'power1.in', onComplete: () => {
            swap();
            G.fromTo(main, { opacity: 0, scale: 1.06 }, { opacity: 1, scale: 1, duration: .9, ease: 'power3.out', clearProps: 'transform' });
            G.to(img, { opacity: 1, duration: .5 });
          }
        });
      }));
    },
    enter() {
      const s = $(id);
      hydrate(s);
      this.bind(s);
      if (this.played) return;
      this.played = true;
      revealWhen($$('.sb__copy > .rv', s), .1, { stagger: .1 });
      const media = $('.sb__media', s);
      when(media, () => {
        if (!MOTION) { media.style.opacity = 1; return; }
        G.set(media, { opacity: 1 });
        const frames = $$('.sb__frame', s);
        G.fromTo(frames, { clipPath: 'inset(0% 0% 0% 100% round 1.2rem)' }, { clipPath: 'inset(0% 0% 0% 0% round 1.2rem)', duration: 1.4, ease: 'expo.inOut', stagger: .16 });
        G.fromTo($$('.sb__frame img', s), { scale: 1.22 }, { scale: 1, duration: 2.4, ease: 'power3.out', stagger: .16 });
        G.fromTo($$('.sb__cap', s), { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: .9, ease: 'power3.out', delay: 1 });
      }, .15);
    },
    leave() { },
    refresh() { }
  });
  const B1 = brandSlide('#s6'), B2 = brandSlide('#s7'), B3 = brandSlide('#s8');

  /* =========================================================
     SLIDE 9 · partnership + show × Aviasales band
     ========================================================= */
  const S6 = {
    played: false, built: false,
    build() {
      const P = D.partner;
      $('#gets').innerHTML = P.deliverables.map(g => `<li><span class="gets__ic"><svg class="i"><use href="#i-${g.icon}"/></svg></span>${T(g.t)}</li>`).join('');
      $('#scope').innerHTML = P.scope.map((it, i) => `<li><span class="scope__n">${pad(i + 1)}</span><svg class="i"><use href="#i-${it.icon}"/></svg>${T(it.l)}</li>`).join('');
      this.built = true;
    },
    enter() {
      if (!this.built) this.build();
      const s = $('#s9');
      if (this.played) return;
      this.played = true;
      revealWhen($$('.s6__left > .rv', s), .1, { stagger: .14 });
      revealWhen($$('#gets li', s), .75, { stagger: .09, y: 20 });
      const right = $('.s6__right', s);
      when(right, () => { reveal(right, 0, { y: 40 }); reveal($$('#scope li', s), .3, { stagger: .07, y: 14 }); }, .45);

      const band = $('.coband', s);
      const show = $('.cobrand__show', s), x = $('.cobrand__x', s), logo = $('.cobrand__logo', s), yt = $('.yt', s);
      when(band, () => {
        if (!MOTION) { [show, x, logo, yt].forEach(e => { e.style.opacity = 1; }); return; }
        const tl = G.timeline({ delay: mode === 'deck' ? 1.3 : .15 });
        tl.fromTo('.coband__trail', { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.3, ease: 'power2.inOut' })
          .add(() => textIn(show, 0, true), .2)
          .fromTo(x, { opacity: 0, scale: .3, rotate: -90 }, { opacity: .6, scale: 1, rotate: 0, duration: 1.1, ease: 'back.out(2)' }, .7)
          .fromTo(logo, { opacity: 0, x: 40, filter: 'blur(14px)' }, { opacity: 1, x: 0, filter: 'blur(0px)', duration: 1.5, ease: 'power3.out', clearProps: 'filter,transform' }, .9)
          .fromTo(yt, { opacity: 0, y: 30, scale: .8 }, { opacity: 1, y: 0, scale: 1, duration: 1.1, ease: 'back.out(1.8)' }, 1.3)
          .fromTo($('.yt__pole', s), { scaleY: 0 }, { scaleY: 1, duration: .6, ease: 'power3.out' }, 1.8)
          .fromTo($('.flag--yt', s), { scaleX: 0, transformOrigin: '0% 50%' }, { scaleX: 1, duration: 1.1, ease: 'elastic.out(1, .55)' }, 2.1);
      }, 0);
    },
    leave() { },
    refresh() { }
  };

  const MODS = [S1, S2, S3, S4, S5, B1, B2, B3, S6];

  /* =========================================================
     DECK ENGINE
     ========================================================= */
  const slides = $$('.slide');
  let cur = 0, busy = false;

  function updateUI() {
    $$('.prog__seg').forEach((s, i) => { s.classList.toggle('is-done', i < cur); s.classList.toggle('is-current', i === cur); s.setAttribute('aria-current', i === cur ? 'step' : 'false'); });
    $('#curNum').textContent = pad(cur + 1);
    $('#prevBtn').disabled = cur === 0;
    $('#nextBtn').disabled = cur === slides.length - 1;
    if (mode === 'deck') html.dataset.tone = slides[cur].dataset.theme || 'light';
  }

  function setHash(i) { try { history.replaceState(null, '', i ? '#s' + (i + 1) : location.pathname + location.search); } catch (e) {} }

  function enter(i) { try { MODS[i].enter(); } catch (e) { console.error(e); } }

  function go(to) {
    to = clamp(to, 0, slides.length - 1);
    if (mode !== 'deck') { slides[to].scrollIntoView({ behavior: RM ? 'auto' : 'smooth', block: 'start' }); return; }
    if (to === cur || busy) return;
    if (S1.running) S1.finish(true);
    const from = cur, dir = to > from ? 1 : -1, a = slides[from], b = slides[to];
    busy = true; cur = to; updateUI(); setHash(to);
    hydrate(b);
    b.classList.add('is-active', 'is-live');
    MODS[from].leave();
    if (!MOTION) { a.classList.remove('is-active', 'is-live'); busy = false; enter(to); return; }
    G.set(a, { zIndex: 1 }); G.set(b, { zIndex: 2 });
    G.timeline({
      defaults: { duration: 1.05, ease: 'expo.inOut' },
      onComplete: () => {
        a.classList.remove('is-active', 'is-live');
        G.set([a, b, a.firstElementChild, b.firstElementChild], { clearProps: 'zIndex,clipPath,transform,opacity' });
        busy = false;
      }
    })
      .fromTo(b, { clipPath: dir > 0 ? 'inset(100% 0% 0% 0%)' : 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)' }, 0)
      .fromTo(b.firstElementChild, { yPercent: 9 * dir }, { yPercent: 0 }, 0)
      .to(a.firstElementChild, { yPercent: -7 * dir, opacity: .25 }, 0)
      .call(() => enter(to), null, .42);
  }

  function initDeck() {
    /* starting slide from hash */
    const m = /^#s([1-9])$/.exec(location.hash);
    cur = m ? +m[1] - 1 : 0;
    S1.allowIntro = cur === 0;
    slides.forEach((s, i) => { s.classList.toggle('is-active', i === cur); s.classList.toggle('is-live', i === cur); });
    updateUI();
    enter(cur);

    $$('[data-go]').forEach(el => el.addEventListener('click', e => { e.preventDefault(); go(+el.dataset.go); }));
    $('#prevBtn').addEventListener('click', () => go(cur - 1));
    $('#nextBtn').addEventListener('click', () => go(cur + 1));

    addEventListener('keydown', e => {
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      const t = e.target, onButton = t && t.closest && t.closest('button, a, [role="button"], [role="tab"]');
      const k = e.key;
      if (S1.running && /^(Arrow|Page| |Enter)/.test(k)) { e.preventDefault(); S1.finish(true); return; }
      if (k === 'ArrowRight' || k === 'ArrowDown' || k === 'PageDown' || (k === ' ' && !onButton)) { e.preventDefault(); go(cur + 1); }
      else if (k === 'ArrowLeft' || k === 'ArrowUp' || k === 'PageUp') { e.preventDefault(); go(cur - 1); }
      else if (k === 'Home') { e.preventDefault(); go(0); }
      else if (k === 'End') { e.preventDefault(); go(slides.length - 1); }
      else if (k === 'f' || k === 'F') toggleFs();
    });

    /* wheel: one gesture = one slide */
    let locked = false, unlockT = 0, acc = 0, accT = 0;
    const lock = () => { locked = true; clearTimeout(unlockT); unlockT = setTimeout(() => { locked = false; }, 1100); };
    addEventListener('wheel', e => {
      e.preventDefault();
      if (S1.running) { S1.finish(true); lock(); return; }
      if (locked || busy) { clearTimeout(unlockT); unlockT = setTimeout(() => { locked = false; }, 260); return; }
      acc += Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      clearTimeout(accT); accT = setTimeout(() => { acc = 0; }, 180);
      if (Math.abs(acc) > 40) { const d = acc > 0 ? 1 : -1; acc = 0; lock(); go(cur + d); }
    }, { passive: false });

    /* touch swipe (tablets in landscape) */
    let tx = 0, ty = 0;
    addEventListener('touchstart', e => { tx = e.touches[0].clientX; ty = e.touches[0].clientY; }, { passive: true });
    addEventListener('touchend', e => {
      if (e.target.closest && e.target.closest('.cflow, .tabs')) return;
      const dx = e.changedTouches[0].clientX - tx, dy = e.changedTouches[0].clientY - ty;
      if (Math.max(Math.abs(dx), Math.abs(dy)) < 55) return;
      go(cur + (Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 1 : -1) : (dy < 0 ? 1 : -1)));
    }, { passive: true });

    addEventListener('hashchange', () => { const mm = /^#s([1-9])$/.exec(location.hash); if (mm) go(+mm[1] - 1); });
  }

  function initScroll() {
    $$('[data-go]').forEach(el => el.addEventListener('click', e => { e.preventDefault(); go(+el.dataset.go); }));
    if (!io) { slides.forEach((s, i) => { s.classList.add('is-live'); enter(i); }); return; }
    /* images: fetch each slide a screen and a bit before it scrolls in */
    const preIO = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { preIO.unobserve(e.target); hydrate(e.target); }
    }), { rootMargin: '0px 0px 120% 0px' });
    slides.forEach(s => preIO.observe(s));
    /* looping decoration (flags, map pulse, vs ring) only runs while its slide is on screen */
    const liveIO = new IntersectionObserver(es => es.forEach(e => e.target.classList.toggle('is-live', e.isIntersecting)));
    slides.forEach(s => liveIO.observe(s));
    const enterIO = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { enterIO.unobserve(e.target); enter(slides.indexOf(e.target)); }
    }), { rootMargin: '0px 0px -15% 0px' });
    slides.forEach(s => enterIO.observe(s));
    const curIO = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { cur = slides.indexOf(e.target); updateUI(); }
    }), { rootMargin: '-50% 0px -50% 0px' });
    slides.forEach(s => curIO.observe(s));
    const toneIO = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) html.dataset.tone = e.target.dataset.theme || 'light';
    }), { rootMargin: '0px 0px -96% 0px' });
    slides.forEach(s => toneIO.observe(s));
    const m = /^#s([1-9])$/.exec(location.hash);
    if (m) setTimeout(() => slides[+m[1] - 1].scrollIntoView(), 50);
  }

  /* =========================================================
     language, fullscreen, preload
     ========================================================= */
  function setLang(l) {
    if (l === LANG) return;
    LANG = l; html.lang = l;
    try { localStorage.setItem('nn-lang', l); } catch (e) {}
    $$('#lang button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === l)));
    const swap = () => {
      applyI18n(); document.title = tr('meta.title');
      refreshCounters(); S2.refresh(); S6.refresh();
      $$('.pin').forEach((p, i) => p.setAttribute('aria-label', L(D.cities[i].name)));
      $$('.cf-card').forEach((c, i) => c.setAttribute('aria-label', L(D.cities[i].name)));
    };
    const scope = mode === 'deck' ? [slides[cur], $('#bar')] : [document.body];
    const onScreen = el => { const r = el.getBoundingClientRect(); return r.width > 0 && r.bottom > 0 && r.top < innerHeight; };
    const pick = () => scope.flatMap(r => $$('[data-i18n]', r)).filter(onScreen);
    const els = pick().filter(el => parseFloat(getComputedStyle(el).opacity) > .5);
    if (!MOTION || !els.length || !els[0].animate) { swap(); return; }
    const blur = mode === 'deck';
    const kf = (a, b) => [a, b].map(o => (blur ? { opacity: o, filter: `blur(${3 - o * 3}px)` } : { opacity: o }));
    els.forEach(el => el.animate(kf(1, 0), { duration: 170, easing: 'ease-in', fill: 'forwards' }));
    setTimeout(() => {
      swap();
      const fresh = pick();
      els.forEach(el => el.getAnimations().forEach(a => a.cancel()));
      fresh.forEach(el => el.animate(kf(0, 1), { duration: 320, easing: 'cubic-bezier(.16,1,.3,1)' }));
    }, 180);
  }

  function toggleFs() {
    const d = document;
    if (!d.fullscreenElement) { (html.requestFullscreen || html.webkitRequestFullscreen || (() => {})).call(html); }
    else { (d.exitFullscreen || d.webkitExitFullscreen).call(d); }
  }

  let hydrated = false;
  function idleHydrate() {
    if (hydrated) return; hydrated = true;
    const run = () => {
      if (!S2.built) S2.build();
      D.cities.forEach(c => { const im = new Image(); im.src = `assets/img/thumbs/${c.id}.jpg`; });
      /* desktop warms every slide in the background; phones load each slide just before it scrolls in */
      if (mode !== 'deck') return;
      slides.slice(1).forEach((s, k) => setTimeout(() => hydrate(s), k * 350));
      setTimeout(() => $$('img[data-lazy]').forEach(lazy), slides.length * 350);
    };
    if ('requestIdleCallback' in window) requestIdleCallback(run, { timeout: 1500 }); else setTimeout(run, 600);
  }

  /* =========================================================
     boot
     ========================================================= */
  function boot() {
    $$('#lang button').forEach(b => {
      b.setAttribute('aria-pressed', String(b.dataset.lang === LANG));
      b.addEventListener('click', () => setLang(b.dataset.lang));
    });
    applyI18n(); document.title = tr('meta.title');

    const fs = $('#fsBtn');
    if (!(html.requestFullscreen || html.webkitRequestFullscreen)) fs.style.display = 'none';
    fs.addEventListener('click', toggleFs);
    document.addEventListener('fullscreenchange', () => {
      const use = $('#fsBtn use');
      if (use) use.setAttribute('href', document.fullscreenElement ? '#i-corners-in' : '#i-corners-out');
    });

    flags(); decorate();
    S1.init();
    if (mode === 'deck') initDeck(); else initScroll();
    if (mode === 'deck' && cur !== 0) idleHydrate();

    /* switching between phone and desktop layouts needs a fresh layout */
    const onModeChange = () => {
      const want = DECK_Q.matches ? 'deck' : 'scroll';
      if (want !== mode) { setHash(cur); location.reload(); }
    };
    if (DECK_Q.addEventListener) DECK_Q.addEventListener('change', onModeChange); else DECK_Q.addListener(onModeChange);
    let rt = 0;
    addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { onModeChange(); S2.resize(); }, 200); });

    window.__nnReady = true;
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
