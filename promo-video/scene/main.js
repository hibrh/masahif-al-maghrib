/* Masahif al-Maghrib, promotional cut.
   Every frame is a pure function of time: window.renderFrame(t) draws the frame
   at t seconds, and window.ready resolves once the timeline, fonts and images
   are in. Open index.html?lang=ar&t=12 for a still, or &play for a preview. */
(() => {
  const Q = new URLSearchParams(location.search);
  const LANG = Q.get('lang') === 'en' ? 'en' : 'ar';
  const CUT = (Q.get('cut') || '').replace(/[^a-z0-9]/g, '');   // '' is the full cut
  const RTL = LANG === 'ar';
  const C = CONTENT[LANG];
  const FWD = RTL ? -1 : 1;                 // reading direction on screen
  const W = 1080, H = 1920, D2R = Math.PI / 180;
  document.documentElement.lang = LANG;
  document.documentElement.dir = RTL ? 'rtl' : 'ltr';

  // ---------------------------------------------------------------- maths
  const clamp = (x, a = 0, b = 1) => (x < a ? a : x > b ? b : x);
  const lerp = (a, b, k) => a + (b - a) * k;
  const E = {
    lin: x => x,
    in2: x => x * x,
    out2: x => 1 - (1 - x) * (1 - x),
    in3: x => x * x * x,
    out3: x => 1 - Math.pow(1 - x, 3),
    io3: x => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),
    io5: x => (x < 0.5 ? 16 * Math.pow(x, 5) : 1 - Math.pow(-2 * x + 2, 5) / 2),
    ioSine: x => -(Math.cos(Math.PI * x) - 1) / 2,
    outBack: x => { const c1 = 1.5, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); },
  };
  const P = (t, a, b, e = E.lin) => e(clamp((t - a) / (b - a)));
  function rand(seed) {
    return () => {
      seed = (seed + 0x6d2b79f5) | 0;
      let r = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
      return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
    };
  }

  // ---------------------------------------------------------------- DOM
  const stage = document.getElementById('stage');
  function el(tag, cls, parent, html) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    (parent || stage).appendChild(e);
    return e;
  }
  // place an element: translate, scale, rotate, opacity (hidden when transparent)
  function put(e, { x = 0, y = 0, s = 1, r = 0, o = 1, ry = 0, blur = 0 } = {}) {
    e.style.transform = `translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,0)` +
      (ry ? ` rotateY(${ry.toFixed(2)}deg)` : '') + (r ? ` rotate(${r.toFixed(3)}deg)` : '') +
      (s !== 1 ? ` scale(${s.toFixed(4)})` : '');
    e.style.opacity = o.toFixed(3);
    e.style.visibility = o > 0.002 ? 'visible' : 'hidden';
    e.style.filter = blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : '';
  }
  const show = (e, on) => { e.style.display = on ? '' : 'none'; };

  const LOGO = (cls = 'logo') => `<svg class="${cls}" viewBox="0 0 64 64"><g fill="none" stroke="#e0b75a" stroke-width="3.2" stroke-linejoin="round">` +
    `<rect class="q1" x="17" y="17" width="30" height="30" pathLength="120"/>` +
    `<rect class="q2" x="17" y="17" width="30" height="30" pathLength="120" transform="rotate(45 32 32)"/></g>` +
    `<circle class="dot" cx="32" cy="32" r="4.2" fill="#e0b75a"/></svg>`;
  const ICON = {
    pin: '<svg class="pin" viewBox="0 0 24 24"><path d="M12 22s7-6.6 7-12.2A7 7 0 0 0 5 9.8C5 15.4 12 22 12 22z" fill="none" stroke="#e9c879" stroke-width="1.8"/><circle cx="12" cy="9.8" r="2.6" fill="#e9c879"/></svg>',
    card: '<svg class="ic" viewBox="0 0 48 48"><rect x="7" y="5" width="34" height="38" rx="4" fill="none" stroke="#e9c879" stroke-width="2.4"/><path d="M14 15h20M14 22h20M14 29h12" stroke="#e9c879" stroke-width="2.4" stroke-linecap="round"/><circle cx="33" cy="33" r="3" fill="#e9c879"/></svg>',
    zoom: '<svg class="ic" viewBox="0 0 48 48"><circle cx="21" cy="21" r="12" fill="none" stroke="#e9c879" stroke-width="2.6"/><path d="M30 30l10 10" stroke="#e9c879" stroke-width="3" stroke-linecap="round"/><path d="M15 21h12M21 15v12" stroke="#e9c879" stroke-width="2.4" stroke-linecap="round"/></svg>',
    link: '<svg class="ic" viewBox="0 0 48 48"><path d="M20 28l8-8" stroke="#e9c879" stroke-width="2.6" stroke-linecap="round"/><path d="M22 14l3-3a8 8 0 0 1 12 12l-3 3M26 34l-3 3a8 8 0 0 1-12-12l3-3" fill="none" stroke="#e9c879" stroke-width="2.6" stroke-linecap="round"/></svg>',
    pen: '<svg class="ic" viewBox="0 0 48 48"><path d="M10 38l4-12L32 8l8 8-18 18-12 4z" fill="none" stroke="#e9c879" stroke-width="2.4" stroke-linejoin="round"/><path d="M28 12l8 8M14 26l8 8" stroke="#e9c879" stroke-width="2.2"/></svg>',
    medal: '<svg class="ic" viewBox="0 0 48 48"><path d="M16 4l8 14 8-14" fill="none" stroke="#e9c879" stroke-width="2.4" stroke-linejoin="round"/><circle cx="24" cy="30" r="12" fill="none" stroke="#e9c879" stroke-width="2.6"/><path d="M24 23l2.2 4.5 5 .7-3.6 3.5.9 5-4.5-2.4-4.5 2.4.9-5-3.6-3.5 5-.7z" fill="#e9c879"/></svg>',
    cap: '<svg class="ic" viewBox="0 0 48 48"><path d="M4 18l20-9 20 9-20 9z" fill="none" stroke="#e9c879" stroke-width="2.4" stroke-linejoin="round"/><path d="M12 22v9c0 3 5.4 6 12 6s12-3 12-6v-9M40 20v12" fill="none" stroke="#e9c879" stroke-width="2.4" stroke-linecap="round"/></svg>',
    lock: '<svg class="lock" viewBox="0 0 24 24"><rect x="5" y="10.5" width="14" height="10" rx="2" fill="#5b4a39"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" fill="none" stroke="#5b4a39" stroke-width="2"/></svg>',
    go: '<svg viewBox="0 0 24 24" width="36" height="36"><path d="M5 12h13M13 6l6 6-6 6" fill="none" stroke="#e9c879" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    check: '<svg viewBox="0 0 24 24" width="28" height="28" style="vertical-align:-5px"><path d="M4 12.5l5 5 11-11" fill="none" stroke="#1b1510" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  };
  const STAR = '<svg viewBox="0 0 64 64"><g fill="none" stroke="#e0b75a" stroke-width="2.6"><rect x="17" y="17" width="30" height="30"/><rect x="17" y="17" width="30" height="30" transform="rotate(45 32 32)"/></g><circle cx="32" cy="32" r="3.6" fill="#e0b75a"/></svg>';

  // ---------------------------------------------------------------- timeline
  let TL, SG, SC, R, NEXT;
  const cue = (si, k) => SG[si].words[Math.min(k, SG[si].words.length - 1)].s;
  const segA = si => SG[si].speechStart;
  // A cut may leave scenes out, so the scenes find their lines by scene name:
  // R.hook (three lines), R.globe, R.eras, R.tre, R.feat, R.author, R.bil (the
  // bilingual line of the call to action, full cut only) and R.visit (the address).
  // NEXT[name] is when the scene after <name> starts.
  function roles() {
    const of = name => SG.map((sg, i) => (sg.scene === name ? i : -1)).filter(i => i >= 0);
    const cta = of('cta');
    R = { hook: of('hook'), globe: of('globe')[0], eras: of('eras')[0], tre: of('treasures')[0],
      feat: of('features')[0], author: of('author')[0], bil: cta.length > 1 ? cta[0] : undefined, visit: cta[cta.length - 1] };
    NEXT = {};
    TL.order.forEach((k, i) => { NEXT[k] = i + 1 < TL.order.length ? SC[TL.order[i + 1]].start : TL.duration; });
  }

  // ---------------------------------------------------------------- background
  function Background() {
    const svg = el('div', '', stage);
    svg.innerHTML = `<svg id="pattern" width="${W + 240}" height="${H + 240}"><defs>
      <pattern id="zl" width="150" height="150" patternUnits="userSpaceOnUse">
        <g fill="none" stroke="rgba(233,200,121,0.075)" stroke-width="1.6">
          <rect x="45" y="45" width="60" height="60"/><rect x="45" y="45" width="60" height="60" transform="rotate(45 75 75)"/>
          <path d="M75 32.6V0M75 117.4V150M32.6 75H0M117.4 75H150"/>
          <circle cx="75" cy="75" r="9"/>
        </g></pattern></defs><rect width="100%" height="100%" fill="url(#zl)"/></svg>`;
    const pat = svg.firstElementChild;
    const glow = el('div', '', stage);
    glow.id = 'glow';
    return {
      update(t, mood) {
        pat.style.transform = `translate(${(-(t * 7) % 150).toFixed(2)}px, ${(-(t * 4) % 150).toFixed(2)}px)`;
        pat.style.opacity = (0.55 * mood.pattern).toFixed(3);
        const gx = 540 + Math.sin(t * 0.21) * 160, gy = 640 + Math.cos(t * 0.17) * 140;
        glow.style.background = `radial-gradient(640px 640px at ${gx.toFixed(1)}px ${gy.toFixed(1)}px, rgba(${mood.tint},${(0.16 * mood.glow).toFixed(3)}), transparent 70%)`;
      },
    };
  }

  // gold dust drifting up through every scene
  function Dust() {
    const cv = el('canvas', '', stage);
    cv.width = W; cv.height = H;
    const ctx = cv.getContext('2d');
    const r = rand(7);
    const parts = Array.from({ length: 110 }, () => ({
      x: r() * W, y: r() * H, v: 10 + r() * 34, a: 18 + r() * 70, f: 0.08 + r() * 0.3,
      ph: r() * 6.28, s: 0.8 + r() * 2.6, al: 0.25 + r() * 0.6, tw: 0.6 + r() * 2.2,
    }));
    const sprite = document.createElement('canvas');
    sprite.width = sprite.height = 64;
    const sc = sprite.getContext('2d');
    const g = sc.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, 'rgba(255,236,190,1)'); g.addColorStop(0.18, 'rgba(244,214,140,0.85)');
    g.addColorStop(0.5, 'rgba(233,190,100,0.18)'); g.addColorStop(1, 'rgba(233,190,100,0)');
    sc.fillStyle = g; sc.fillRect(0, 0, 64, 64);
    return {
      update(t, amount) {
        ctx.clearRect(0, 0, W, H);
        if (amount <= 0.01) return;
        ctx.globalCompositeOperation = 'lighter';
        for (const p of parts) {
          const y = ((p.y - p.v * t) % H + H) % H;
          const x = p.x + Math.sin(t * p.f * 6.28 + p.ph) * p.a;
          const a = p.al * amount * (0.55 + 0.45 * Math.sin(t * p.tw + p.ph * 3));
          if (a <= 0.01) continue;
          const s = p.s * 7;
          ctx.globalAlpha = Math.min(1, a);
          ctx.drawImage(sprite, x - s / 2, y - s / 2, s, s);
        }
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = 'source-over';
      },
    };
  }

  // film grain: a handful of fixed noise frames, one per video frame
  function Grain() {
    const holder = el('div', 'fill', stage);
    holder.id = 'grain';
    const r = rand(99);
    const frames = Array.from({ length: 6 }, () => {
      const c = el('canvas', '', holder);
      c.width = 540; c.height = 960;
      c.style.width = W + 'px'; c.style.height = H + 'px';
      const x = c.getContext('2d');
      const id = x.createImageData(540, 960);
      for (let i = 0; i < id.data.length; i += 4) {
        const v = 128 + (r() - 0.5) * 255;
        id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255;
      }
      x.putImageData(id, 0, 0);
      c.style.display = 'none';
      return c;
    });
    let last = null;
    return {
      update(t) {
        const f = frames[Math.floor(t * 15) % frames.length];   // grain changes every other frame
        if (last && last !== f) last.style.display = 'none';
        f.style.display = '';
        last = f;
      },
    };
  }

  // ---------------------------------------------------------------- globe
  function Globe(LAND, MOROCCO) {
    const cv = el('canvas', '', stage);
    cv.width = W; cv.height = H;
    const g = cv.getContext('2d');
    const land = topojson.feature(LAND, LAND.objects.land);
    const grat = d3.geoGraticule10();
    const proj = d3.geoOrthographic().clipAngle(90).precision(0.35);
    const path = d3.geoPath(proj, g);
    const city = id => CITIES.find(c => c.id === id);
    const FEZ = city('fez').ll;
    const vec = (lon, lat) => [Math.cos(lat * D2R) * Math.cos(lon * D2R), Math.cos(lat * D2R) * Math.sin(lon * D2R), Math.sin(lat * D2R)];
    function arcPoints(to) {
      const ip = d3.geoInterpolate(FEZ, to);
      const dist = d3.geoDistance(FEZ, to);
      const hmax = 0.05 + 0.2 * dist / Math.PI;
      return Array.from({ length: 72 }, (_, i) => {
        const s = i / 71, ll = ip(s), v = vec(ll[0], ll[1]), h = 1 + hmax * Math.sin(Math.PI * s);
        return [v[0] * h, v[1] * h, v[2] * h];
      });
    }
    const ARCS = Object.fromEntries(CITIES.filter(c => c.id !== 'fez').map(c => [c.id, arcPoints(c.ll)]));
    let view;
    function project(v) {               // same rotation as d3's orthographic: centre at view.lon/lat
      const cl = Math.cos(-view.lon * D2R), sl = Math.sin(-view.lon * D2R);
      const x = v[0] * cl - v[1] * sl, y = v[0] * sl + v[1] * cl, z = v[2];
      const cp = Math.cos(view.lat * D2R), sp = Math.sin(view.lat * D2R);
      const x2 = x * cp + z * sp, z2 = -x * sp + z * cp;
      return { X: view.cx + view.R * y, Y: view.cy - view.R * z2, front: x2 > 0 || y * y + z2 * z2 > 1.0 };
    }
    function drawArc(id, p0, p1, alpha) {
      const pts = ARCS[id];
      const n = pts.length - 1;
      const a = Math.floor(p0 * n), b = Math.floor(p1 * n);
      if (b <= a) return null;
      let prev = project(pts[a]);
      g.lineCap = 'round';
      for (let i = a + 1; i <= b; i++) {
        const cur = project(pts[i]);
        if (prev.front && cur.front) {
          const k = (i - a) / Math.max(1, b - a);
          g.strokeStyle = `rgba(244,220,156,${(alpha * (0.18 + 0.82 * k)).toFixed(3)})`;
          g.lineWidth = Math.max(1.2, view.R / 160) * (0.7 + 0.6 * k);
          g.beginPath(); g.moveTo(prev.X, prev.Y); g.lineTo(cur.X, cur.Y); g.stroke();
        }
        prev = cur;
      }
      return prev;
    }
    function glowDot(x, y, r, a) {
      const gr = g.createRadialGradient(x, y, 0, x, y, r * 3.2);
      gr.addColorStop(0, `rgba(255,240,200,${a})`); gr.addColorStop(0.3, `rgba(244,214,140,${a * 0.75})`);
      gr.addColorStop(1, 'rgba(233,190,100,0)');
      g.fillStyle = gr; g.beginPath(); g.arc(x, y, r * 3.2, 0, 6.2832); g.fill();
    }
    return {
      draw(st, t) {
        g.clearRect(0, 0, W, H);
        if (st.alpha <= 0.003) { cv.style.visibility = 'hidden'; return; }
        cv.style.visibility = 'visible';
        view = st;
        proj.translate([st.cx, st.cy]).scale(st.R).rotate([-st.lon, -st.lat]);
        g.save();
        g.globalAlpha = st.alpha;
        const halo = g.createRadialGradient(st.cx, st.cy, st.R * 0.92, st.cx, st.cy, st.R * 1.32);
        halo.addColorStop(0, 'rgba(233,200,121,0.22)'); halo.addColorStop(1, 'rgba(233,200,121,0)');
        g.fillStyle = halo; g.beginPath(); g.arc(st.cx, st.cy, st.R * 1.32, 0, 6.2832); g.fill();
        const sea = g.createRadialGradient(st.cx - st.R * 0.38, st.cy - st.R * 0.42, st.R * 0.05, st.cx, st.cy, st.R);
        sea.addColorStop(0, '#2a2f28'); sea.addColorStop(0.55, '#151814'); sea.addColorStop(1, '#090a08');
        g.fillStyle = sea; g.beginPath(); g.arc(st.cx, st.cy, st.R, 0, 6.2832); g.fill();
        g.beginPath(); path(grat); g.strokeStyle = 'rgba(233,200,121,0.075)'; g.lineWidth = 1; g.stroke();
        g.beginPath(); path(land);
        g.fillStyle = 'rgba(214,170,86,0.19)'; g.fill();
        g.strokeStyle = 'rgba(236,204,130,0.5)'; g.lineWidth = st.R > 200 ? 1.2 : 0.8; g.stroke();
        g.beginPath(); path(MOROCCO);
        g.shadowColor = 'rgba(244,214,140,0.9)'; g.shadowBlur = 8 + 26 * st.glow;
        g.fillStyle = `rgba(236,200,118,${(0.62 + 0.33 * st.glow).toFixed(3)})`; g.fill();
        g.shadowBlur = 0;
        const rim = g.createRadialGradient(st.cx, st.cy, st.R * 0.82, st.cx, st.cy, st.R);
        rim.addColorStop(0, 'rgba(0,0,0,0)'); rim.addColorStop(1, 'rgba(233,200,121,0.16)');
        g.fillStyle = rim; g.beginPath(); g.arc(st.cx, st.cy, st.R, 0, 6.2832); g.fill();
        const fez = project(vec(FEZ[0], FEZ[1]));
        for (const a of st.arcs) {
          const head = drawArc(a.id, a.from || 0, a.p, a.alpha ?? 1);
          if (head && a.p < 0.999 && head.front) glowDot(head.X, head.Y, Math.max(3, st.R / 90), a.alpha ?? 1);
          if (a.p > 0.999 && (a.alpha ?? 1) > 0.01) {
            const c = project(vec(...city(a.id).ll));
            if (!c.front) continue;
            const pulse = ((t - (a.t1 || 0)) % 1.8) / 1.8;
            g.strokeStyle = `rgba(244,220,156,${(0.7 * (1 - pulse) * (a.alpha ?? 1)).toFixed(3)})`;
            g.lineWidth = 2;
            g.beginPath(); g.arc(c.X, c.Y, (st.R / 70) * (1 + 3 * pulse), 0, 6.2832); g.stroke();
            glowDot(c.X, c.Y, Math.max(2.5, st.R / 110), a.alpha ?? 1);
            if (a.label > 0.01 && !city(a.id).quiet) {
              const L = city(a.id).label || [1, -1];
              g.font = RTL ? '700 30px KufiVar' : '600 27px Plex';
              g.textAlign = L[0] > 0 ? 'left' : 'right';
              g.textBaseline = 'middle';
              g.direction = RTL ? 'rtl' : 'ltr';
              const lx = c.X + L[0] * 16, ly = c.Y + L[1] * 24;
              g.globalAlpha = st.alpha * a.label;
              g.lineWidth = 6; g.strokeStyle = 'rgba(10,8,6,0.85)'; g.lineJoin = 'round';
              g.strokeText(city(a.id)[LANG], lx, ly);
              g.fillStyle = '#f4dc9c'; g.fillText(city(a.id)[LANG], lx, ly);
              g.globalAlpha = st.alpha;
            }
          }
        }
        if (fez.front) glowDot(fez.X, fez.Y, Math.max(3, st.R / 70), 0.9 + 0.1 * Math.sin(t * 4));
        g.restore();
      },
    };
  }

  // ---------------------------------------------------------------- captions
  function Captions() {
    el('div', '', stage).id = 'capband';
    const box = el('div', '', stage);
    box.id = 'caption';
    const list = [];
    SG.forEach((seg, si) => {
      seg.chunks.forEach((ch, ci) => {
        const a = seg.words[ch[0]].s - 0.14;
        const next = seg.chunks[ci + 1];
        let b = next ? seg.words[next[0]].s - 0.14 : seg.speechEnd + 0.45;
        if (!next && SG[si + 1]) b = Math.min(b, SG[si + 1].words[0].s - 0.2);
        list.push({ a, b, words: ch.map(i => seg.words[i]) });
      });
    });
    let cur = null, node = null, spans = [];
    return {
      update(t) {
        const c = list.find(x => t >= x.a && t < x.b) || null;
        if (c !== cur) {
          box.innerHTML = '';
          node = null; spans = [];
          if (c) {
            node = el('div', 'chunk', box);
            spans = c.words.map((w, i) => {
              const url = /\.com$/.test(w.t);
              const s = el(url ? 'bdi' : 'span', 'w' + (url ? ' url' : ''), node, w.t);
              if (url) s.dir = 'ltr';
              if (i < c.words.length - 1) node.appendChild(document.createTextNode(' '));
              return s;
            });
          }
          cur = c;
        }
        if (!c) return;
        const k = Math.min(P(t, c.a, c.a + 0.16, E.out3), 1 - P(t, c.b - 0.12, c.b, E.in2));
        node.style.opacity = k.toFixed(3);
        node.style.transform = `translateY(${((1 - P(t, c.a, c.a + 0.22, E.out3)) * 16).toFixed(2)}px)`;
        c.words.forEach((w, i) => {
          const nxt = c.words[i + 1];
          const on = t >= w.s - 0.03;
          const now = on && t < (nxt ? nxt.s - 0.03 : w.e + 0.2);
          spans[i].className = 'w' + (spans[i].classList.contains('url') ? ' url' : '') + (on ? ' on' : '') + (now ? ' now' : '');
        });
      },
    };
  }

  // ---------------------------------------------------------------- scenes
  const scenes = el('div', 'fill', stage);
  scenes.id = 'scenes';
  // full-frame blurred backdrops sit under the globe; every frame starts with
  // them hidden and the scenes on screen raise their own
  const backs = el('div', 'fill', stage);
  const BACKDROPS = [];
  function backdrop(src) {
    const b = el('div', 'backdrop', backs);
    b.style.backgroundImage = `url(${src})`;
    BACKDROPS.push(b);
    return b;
  }

  // 1. three Qur'ans, three cities
  function Hook() {
    const root = el('div', 'fill', scenes);
    const items = C.hook.map((h, i) => {
      const g = el('div', 'fill', root);
      g.style.perspective = '1800px';
      const bd = backdrop(h.bg);
      const card = el('div', 'card', g);
      const img = el('img', '', card);
      img.src = h.img;
      img.style.objectPosition = `${h.focus[0]}% ${h.focus[1]}%`;
      const sheen = el('div', 'sheen', card);
      const ar = h.w / h.h;
      let cw, ch;
      if (ar < 0.75) { cw = 518; ch = 690; } else { ch = Math.min(690, 920 / ar); cw = ch * ar; }
      const cy = 806;
      Object.assign(card.style, { width: cw + 'px', height: ch + 'px', left: (540 - cw / 2) + 'px', top: (cy - ch / 2) + 'px' });
      const loc = el('div', 'loc', g, `<div class="city">${h.name}</div><div class="place">${ICON.pin} ${h.place}</div>`);
      const meta = el('div', 'hookmeta', g, `<b>${h.title}</b><br><bdi>${h.date}</bdi>`);
      meta.style.top = (cy + ch / 2 + 30) + 'px';
      return { g, bd, card, img, sheen, loc, meta, city: loc.children[0], place: loc.children[1] };
    });
    return {
      update(t) {
        const on = t < SC.globe.start + 1.2;
        show(root, on);
        if (!on) return;
        items.forEach((it, i) => {
          const tin = i === 0 ? 0 : segA(R.hook[i]) - 0.32;
          const tout = i < 2 ? segA(R.hook[i + 1]) - 0.32 : SC.globe.start + 0.05;
          const kin = i === 0 ? 1 : P(t, tin, tin + 0.6, E.out3);
          const settle = i === 0 ? P(t, 0, 1.4, E.out3) : 1;
          const kout = P(t, tout, tout + 0.55, E.in3);
          const vis = kin > 0 && kout < 1;
          show(it.g, vis);
          if (!vis) return;
          const o = kin * (1 - kout);
          const x = i === 0 ? 0 : FWD * 300 * (1 - kin);
          const xo = -FWD * 340 * kout;
          put(it.card, {
            x: x + xo, y: i === 0 ? 18 * (1 - settle) : 0,
            s: i === 0 ? 1.04 - 0.04 * settle - 0.08 * kout : 0.92 + 0.08 * kin - 0.08 * kout,
            ry: FWD * 22 * (1 - kin) - FWD * 20 * kout, o,
          });
          const life = P(t, tin, tout + 0.6);
          it.img.style.transform = `scale(${(1.05 + 0.12 * life).toFixed(4)}) translate(${(FWD * -1.5 * life).toFixed(2)}%, ${(-1.2 * life).toFixed(2)}%)`;
          const sw = P(t, tin + 0.5, tin + 1.6, E.io3);
          put(it.sheen, { x: lerp(-700, 700, sw) * -FWD, o: sw > 0 && sw < 1 ? 0.85 : 0 });
          put(it.bd, { s: 1.12 - 0.06 * life, o: 0.62 * o });
          const tc = cue(R.hook[i], C.cues.hook[i]);
          const kc = P(t, tc - 0.12, tc + 0.45, E.out3);
          const kp = P(t, tc + 0.05, tc + 0.6, E.out3);
          put(it.city, { y: 34 * (1 - kc), o: kc * (1 - kout) });
          put(it.place, { y: 20 * (1 - kp), o: kp * (1 - kout) });
          const km = i === 0 ? 1 : P(t, tin + 0.5, tin + 1.0, E.out3);
          put(it.meta, { y: 14 * (1 - km), o: km * (1 - kout) * 0.95 });
        });
      },
    };
  }

  // the globe across the hook and the "scattered" line
  function globeState(t) {
    const mini = RTL ? { cx: 920, cy: 306, R: 74 } : { cx: 160, cy: 306, R: 74 };
    const big = { cx: 540, cy: 716, R: 432 };
    const views = [[16, 33], [-4.5, 37.5], [3, 41]];
    const ids = C.hook.map(h => h.city);
    const cues = [0, 1, 2].map(i => cue(R.hook[i], C.cues.hook[i]));
    // mini globe during the hook, following each city
    let lon = views[0][0], lat = views[0][1];
    for (let i = 1; i < 3; i++) {
      const k = P(t, segA(R.hook[i]) - 0.32, segA(R.hook[i]) + 0.4, E.io3);
      lon = lerp(lon, views[i][0], k); lat = lerp(lat, views[i][1], k);
    }
    let st = { ...mini, lon, lat, alpha: P(t, cues[0] - 0.25, cues[0] + 0.3, E.out2), glow: 0.3, arcs: [] };
    ids.forEach((id, i) => {
      const p = P(t, cues[i] - 0.05, cues[i] + 0.8, E.io3);
      if (p > 0) st.arcs.push({ id, p, t1: cues[i] + 0.8, label: 0 });
    });
    // grow into the big globe and scatter
    const t0 = SC.globe.start;
    const kg = P(t, t0 - 0.1, t0 + 1.1, E.io5);
    if (kg > 0) {
      st.cx = lerp(mini.cx, big.cx, kg); st.cy = lerp(mini.cy, big.cy, kg); st.R = lerp(mini.R, big.R, kg);
      st.lon = lerp(lon, -15, kg) - 6 * P(t, t0 + 1.1, NEXT.globe + 1, E.ioSine);
      st.lat = lerp(lat, 33, kg);
      st.alpha = Math.max(st.alpha, kg);
      const ts = cue(R.globe, C.cues.scatter) - 0.35;
      const tg = cue(R.globe, C.cues.gather) - 0.1;
      const others = CITIES.filter(c => c.id !== 'fez' && !ids.includes(c.id));
      others.forEach((c, j) => {
        const a = ts + j * 0.075;
        const p = P(t, a, a + 0.85, E.io3);
        if (p > 0) st.arcs.push({ id: c.id, p, t1: a + 0.85, label: 0 });
      });
      st.arcs.forEach((a, j) => {
        a.label = P(t, a.t1 - 0.1, a.t1 + 0.35, E.out2) * (1 - P(t, tg, tg + 0.3)) * P(kg, 0.7, 1);
        const back = P(t, tg + j * 0.025, tg + 0.65 + j * 0.025, E.in3);
        a.p = a.p * (1 - back);
      });
      const kq = P(t, tg, tg + 1.0, E.io3);
      st.R = lerp(st.R, 300, kq); st.cy = lerp(st.cy, 760, kq);
      st.alpha *= 1 - 0.68 * kq;
      st.glow = 0.3 + 0.7 * P(t, tg, tg + 0.7, E.out2);
      st.alpha *= 1 - P(t, NEXT.globe, NEXT.globe + 0.7, E.in2);
    }
    return st;
  }

  // the name of the guide, when the line names it
  function Brand() {
    const root = el('div', '', scenes);
    root.id = 'brand';
    const logo = el('div', '', root, LOGO());
    const name = el('div', 'name', root, C.brand);
    const tag = el('div', 'tag', root, `${C.tagline}<br><span>${C.span}</span>`);
    const url = el('div', 'urlpill', root, C.url);
    const q = [...logo.querySelectorAll('rect')], dot = logo.querySelector('circle');
    return {
      update(t) {
        const tb = cue(R.globe, C.cues.brand) - 0.25;
        const tout = NEXT.globe - 0.3;        // gone before the next scene comes in
        const on = t > tb - 0.1 && t < tout + 0.6;
        show(root, on);
        if (!on) return;
        const ko = P(t, tout, tout + 0.45, E.in3);
        const kl = P(t, tb - 0.1, tb + 0.7, E.io3);
        q.forEach(r => r.style.strokeDashoffset = (120 * (1 - kl)).toFixed(2));
        q.forEach(r => r.style.strokeDasharray = '120');
        dot.style.opacity = P(t, tb + 0.5, tb + 0.8).toFixed(3);
        put(logo.firstElementChild, { s: 0.85 + 0.15 * P(t, tb - 0.1, tb + 0.8, E.out3), r: 45 * (1 - kl), o: (1 - ko) });
        logo.firstElementChild.style.transformOrigin = '50% 50%';
        const kn = P(t, tb, tb + 0.6, E.out3);
        put(name, { y: 30 * (1 - kn) - 140 * ko, s: 0.94 + 0.06 * kn, o: kn * (1 - ko), blur: 10 * (1 - kn) });
        const kt = P(t, tb + 0.45, tb + 1.0, E.out3);
        put(tag, { y: 18 * (1 - kt) - 120 * ko, o: kt * (1 - ko) });
        const ku = P(t, tb + 0.7, tb + 1.2, E.out3);
        url.style.transform = `translate(-50%, ${(18 * (1 - ku) - 120 * ko).toFixed(2)}px)`;
        url.style.opacity = (ku * (1 - ko)).toFixed(3);
        put(logo, { y: -140 * ko, o: 1 });
      },
    };
  }

  // 2. twelve centuries, seven dynasties, and the Qur'ans of each
  function Eras() {
    const root = el('div', 'fill', scenes);
    const xs = RTL ? [860, 540, 220] : [220, 540, 860];
    const stats = C.stats.map((s, i) => {
      const d = el('div', 'stat', root, `<div class="n">0</div><div class="l">${s.label}</div>`);
      d.style.left = (xs[i] - 160) + 'px';
      return { d, n: d.firstElementChild, s };
    });
    const X0 = RTL ? 690 : 320, X1 = RTL ? 64 : 950;
    const xOf = y => X0 + (X1 - X0) * (y - 780) / (2030 - 780);
    const TOP = 556, ROW = 84;
    const rows = ERAS.map((e, i) => {
      const r = el('div', 'erarow', root);
      r.style.top = (TOP + i * ROW) + 'px';
      const lab = el('div', 'lab', r, e[LANG]);
      lab.style.color = e.color;
      const yr = el('div', 'yr', r, `${e.a}–${e.key === 'alawi' ? (RTL ? 'اليوم' : 'today') : e.b}`);
      const track = el('div', 'track', r);
      Object.assign(track.style, { left: Math.min(X0, X1) + 'px', width: Math.abs(X1 - X0) + 'px' });
      const bar = el('div', 'bar', r);
      const xa = xOf(e.a), xb = xOf(e.b);
      Object.assign(bar.style, { left: Math.min(xa, xb) + 'px', width: Math.abs(xb - xa) + 'px', background: e.color,
        transformOrigin: RTL ? '100% 50%' : '0 50%', boxShadow: `0 0 18px ${e.color}55` });
      return { r, lab, yr, bar, e };
    });
    const dots = ITEMS.map(([era, y, grp]) => {
      const i = ERAS.findIndex(e => e.key === era);
      const d = el('div', 'dot ' + grp, rows[i].r);
      d.style.left = xOf(y) + 'px';
      d.style.top = '38px';
      const col = ERAS[i].color;
      if (grp === 'surviving') { d.style.background = col; d.style.boxShadow = `0 0 0 3px #14100c, 0 0 16px ${col}`; }
      if (grp === 'lost') { d.style.border = `3px solid ${col}`; d.style.background = '#14100c'; d.style.boxShadow = '0 0 0 2px #14100c'; }
      return { d, grp, y, i };
    });
    const ticks = [800, 1000, 1200, 1400, 1600, 1800, 2000].map(y => {
      const a = el('div', 'axis', root, String(y));
      a.style.left = xOf(y) + 'px';
      return a;
    });
    const axl = el('div', 'axisline', root);
    Object.assign(axl.style, { left: Math.min(X0, X1) + 'px', width: Math.abs(X1 - X0) + 'px' });
    const legend = el('div', '', root);
    legend.id = 'legend';
    const lg = ['surviving', 'lost', 'edge'].map(k => {
      const s = el('span', '', legend, `<i></i>${C.legend[k]}`);
      const i = s.firstElementChild;
      if (k === 'surviving') i.style.background = '#e9c879';
      if (k === 'lost') i.style.border = '3px solid #e9c879';
      if (k === 'edge') { i.style.width = i.style.height = '9px'; i.style.background = 'rgba(241,232,214,.55)'; }
      return s;
    });
    return {
      update(t) {
        if (!SC.eras) { show(root, false); return; }
        const a = SC.eras.start, b = SC.eras.end;
        const on = t > a - 0.2 && t < b + 0.6;
        show(root, on);
        if (!on) return;
        const ko = P(t, b - 0.3, b + 0.35, E.in3);
        stats.forEach((s, i) => {
          const tc = cue(R.eras, C.cues.stats[i]) - 0.12;
          const k = P(t, tc, tc + 0.5, E.outBack);
          const kn = P(t, tc, tc + 1.0, E.out3);
          s.n.textContent = (s.s.plus ? '+' : '') + Math.round(s.s.n * kn);
          put(s.d, { y: 40 * (1 - P(t, tc, tc + 0.5, E.out3)) - 60 * ko, s: 0.7 + 0.3 * k, o: P(t, tc, tc + 0.3) * (1 - ko) });
        });
        rows.forEach((r, i) => {
          const tr = a + 0.25 + i * 0.1;
          const k = P(t, tr, tr + 0.55, E.out3);
          put(r.lab, { x: -FWD * 40 * (1 - k), o: k });
          put(r.yr, { x: -FWD * 40 * (1 - k), o: k * 0.9 });
          const kb = P(t, tr + 0.15, tr + 0.95, E.io3);
          r.bar.style.transform = `scaleX(${kb.toFixed(4)})`;
          r.bar.style.opacity = (0.92 * Math.min(1, kb * 3)).toFixed(3);
          put(r.r, { y: -50 * ko, o: 1 - ko });
        });
        const ts = cue(R.eras, C.cues.surviving) - 0.1, tl = cue(R.eras, C.cues.lost) - 0.1;
        dots.forEach(d => {
          const order = RTL ? (2030 - d.y) : (d.y - 780);
          const t0 = d.grp === 'lost' ? tl : d.grp === 'surviving' ? ts : a + 0.9 + d.i * 0.1;
          const k = P(t, t0 + order * 0.0004, t0 + order * 0.0004 + 0.35, E.outBack);
          put(d.d, { s: d.grp === 'edge' ? k : 0.2 + 0.8 * k + (d.grp !== 'edge' ? 0.5 * (1 - P(t, t0, t0 + 0.6)) * k : 0), o: Math.min(1, k * 1.5) });
        });
        ticks.forEach(x => { x.style.opacity = (P(t, a + 0.5, a + 1.0) * (1 - ko) * 0.9).toFixed(3); });
        axl.style.opacity = (P(t, a + 0.4, a + 1.0) * (1 - ko)).toFixed(3);
        put(lg[0], { o: P(t, ts, ts + 0.4) });
        put(lg[1], { o: P(t, tl, tl + 0.4) });
        put(lg[2], { o: P(t, ts + 0.3, ts + 0.7) });
        put(legend, { o: 1 - ko });
      },
    };
  }

  // 3. treasures: by a caliph's and a sultan's own hand, gold on lapis, silver on green
  function Treasures() {
    const root = el('div', 'fill', scenes);
    root.style.perspective = '1800px';
    const T = C.treasures;
    const bdA = backdrop('img/bg-caliph.jpg');
    const bdB = backdrop('img/bg-gold.jpg');
    const bdC = backdrop('img/bg-green.jpg');
    const mk = (src, w, h, x, y, pos) => {
      const c = el('div', 'card', root);
      Object.assign(c.style, { width: w + 'px', height: h + 'px', left: (x - w / 2) + 'px', top: y + 'px' });
      const i = el('img', '', c);
      i.src = src;
      if (pos) i.style.objectPosition = pos;
      const sh = el('div', 'sheen', c);
      return { c, i, sh };
    };
    const startX = RTL ? 790 : 290, endX = RTL ? 290 : 790;
    const caliph = mk(T.caliph.img, 440, 560, startX, 352, '50% 30%');
    const sultan = mk(T.sultan.img, 440, 560, endX, 352, '50% 40%');
    const lab = (o, x, y) => { const d = el('div', 'tlabel', root, `<div class="a">${o.name}</div><div class="b">${o.note}</div>`); d.style.left = (x - 240) + 'px'; d.style.top = y + 'px'; return d; };
    const lc = lab(T.caliph, startX, 948), ls = lab(T.sultan, endX, 948);
    const gold = mk(T.gold.img, 960, 790, 540, 330, '50% 50%');
    const lgold = lab(T.gold, 540, 1146);
    lgold.style.width = '900px'; lgold.style.left = '90px';
    const green = mk(T.silver.img, 560, 790, 540, 330, '50% 46%');
    const lgreen = lab(T.silver, 540, 1146);
    lgreen.style.width = '900px'; lgreen.style.left = '90px';
    return {
      update(t) {
        if (!SC.treasures) { show(root, false); return; }
        const a = SC.treasures.start, b = SC.treasures.end;
        const on = t > a - 0.2 && t < b + 0.6;
        show(root, on);
        if (!on) return;
        const tc = cue(R.tre, C.cues.caliph) - 0.3, tsu = cue(R.tre, C.cues.sultan) - 0.3;
        const tg = cue(R.tre, C.cues.gold) - 0.28, tv = cue(R.tre, C.cues.silver) - 0.28;
        const ko = P(t, b - 0.3, b + 0.35, E.in3);
        // A: the two hands
        const kA = P(t, tg, tg + 0.55, E.in3);
        [[caliph, lc, tc, 2.5 * -FWD], [sultan, ls, tsu, -2.5 * -FWD]].forEach(([c, l, t0, rot], j) => {
          const tk = j === 0 ? Math.min(t0, a + 0.1) : t0;      // the card; its label waits for the word
          const k = P(t, tk, tk + 0.7, E.out3);
          const away = (j === 0 ? -FWD : FWD) * 520 * kA;
          put(c.c, { x: away, y: 80 * (1 - k), s: 0.9 + 0.1 * k - 0.1 * kA, r: rot * k, o: P(t, tk, tk + 0.35) * (1 - kA) });
          c.i.style.transform = `scale(${(1.04 + 0.08 * P(t, tk, tg + 0.5)).toFixed(4)})`;
          const sw = P(t, t0 + 0.4, t0 + 1.4, E.io3);
          put(c.sh, { x: lerp(-500, 500, sw) * -FWD, o: sw > 0 && sw < 1 ? 0.7 : 0 });
          const kl = P(t, t0 + 0.25, t0 + 0.7, E.out3);
          put(l, { x: away, y: 16 * (1 - kl), o: kl * (1 - kA) });
        });
        put(bdA, { s: 1.1, o: 0.5 * P(t, a, a + 0.6) * (1 - kA) * (1 - ko) });
        // B: gold on lapis
        const kB = P(t, tg, tg + 0.7, E.out3), kBo = P(t, tv, tv + 0.55, E.in3);
        put(gold.c, { x: -FWD * 520 * kBo, s: 0.84 + 0.16 * kB, ry: -FWD * 18 * kBo, o: kB * (1 - kBo) });
        const pan = P(t, tg, tv + 0.6, E.ioSine);
        gold.i.style.transform = `scale(${(1.08 + 0.16 * pan).toFixed(4)}) translateX(${(FWD * (-6 + 12 * pan)).toFixed(2)}%)`;
        const sw = P(t, tg + 0.6, tg + 1.9, E.io3);
        put(gold.sh, { x: lerp(-900, 900, sw) * -FWD, o: sw > 0 && sw < 1 ? 0.9 : 0 });
        const klg = P(t, tg + 0.35, tg + 0.8, E.out3);
        put(lgold, { y: 16 * (1 - klg), o: klg * (1 - kBo) });
        put(bdB, { s: 1.1, o: 0.55 * kB * (1 - kBo) * (1 - ko) });
        // C: silver on green
        const kC = P(t, tv, tv + 0.65, E.out3);
        put(green.c, { x: FWD * 420 * (1 - kC), ry: FWD * 20 * (1 - kC), y: -40 * ko, o: kC * (1 - ko) });
        green.i.style.transform = `scale(${(1.05 + 0.1 * P(t, tv, b + 0.4)).toFixed(4)})`;
        const sw2 = P(t, tv + 0.5, tv + 1.6, E.io3);
        put(green.sh, { x: lerp(-600, 600, sw2) * -FWD, o: sw2 > 0 && sw2 < 1 ? 0.55 : 0 });
        const klv = P(t, tv + 0.35, tv + 0.8, E.out3);
        put(lgreen, { y: 16 * (1 - klv), o: klv * (1 - ko) });
        put(bdC, { s: 1.1, o: 0.55 * kC * (1 - ko) });
      },
    };
  }

  // 4. the site itself, on a phone
  function Features(UIM) {
    const root = el('div', 'fill', scenes);
    root.style.perspective = '2200px';
    const PW = 488, PH = 1028, PX = 540 - PW / 2, PY = 250;
    const phone = el('div', 'phone', root);
    Object.assign(phone.style, { width: PW + 'px', height: PH + 'px', left: PX + 'px', top: PY + 'px' });
    const screen = el('div', 'screen', phone);
    el('div', 'island', phone);
    const SW = PW - 26, SH = PH - 26, k = SW / 393;
    const STATUS = 54;
    const status = el('div', 'status', screen, '<span>9:41</span><span style="letter-spacing:2px">▮▮▮ ◔</span>');
    const view = el('div', 'layer', screen);
    view.style.top = STATUS + 'px';
    const scroll = el('div', 'scroll', view);
    const cardImg = el('img', '', scroll);
    cardImg.src = UI + LANG + '/card.png';
    const header = el('img', '', view);
    header.src = UI + LANG + '/header.png';
    Object.assign(header.style, { position: 'absolute', left: 0, top: 0, width: '100%', zIndex: 2 });
    const viewer = el('div', 'layer', screen);
    viewer.style.background = '#0e0b08';
    viewer.style.zIndex = 3;
    const vimg = el('img', '', viewer);
    vimg.src = UI + LANG + '/viewer.png';
    const V = UIM.viewer, CJ = UIM.card;
    vimg.style.marginTop = STATUS + 'px';
    // the plate itself, sharp, laid over the screenshot so it can be zoomed
    const zbox = el('div', '', viewer);
    Object.assign(zbox.style, { position: 'absolute', left: 0, right: 0, top: (STATUS + V.stage[1] * k) + 'px', height: (V.stage[3] * k) + 'px', overflow: 'hidden' });
    const zimg = el('img', '', zbox);
    zimg.src = '/marini/plates/mc-imran.jpg';
    Object.assign(zimg.style, { position: 'absolute', left: (V.img[0] * k) + 'px', top: ((V.img[1] - V.stage[1]) * k) + 'px',
      width: (V.img[2] * k) + 'px', height: (V.img[3] * k) + 'px', transformOrigin: '42% 52%' });
    const tap = el('div', 'tap', screen);
    const ring = el('div', 'ring', screen);
    const callouts = C.callouts.map((txt, i) => {
      const side = i === 1 ? 's1' : 's0';
      const d = el('div', 'callout ' + side, root, ICON[['card', 'zoom', 'link'][i]] + txt);
      const startSide = (i !== 1) === RTL;   // right-hand column?
      d.style.left = (startSide ? PX + PW + 22 : PX - 22 - 240) + 'px';
      d.style.width = '240px';
      d.style.top = [350, 640, 890][i] + 'px';
      return d;
    });
    return {
      update(t) {
        if (!SC.features) { show(root, false); return; }
        const a = SC.features.start, b = SC.features.end;
        const on = t > a - 0.2 && t < b + 0.6;
        show(root, on);
        if (!on) return;
        const ki = P(t, a, a + 0.8, E.out3), ko = P(t, b - 0.35, b + 0.35, E.in3);
        put(phone, { y: 220 * (1 - ki) + 160 * ko, ry: FWD * 10 * (1 - ki), r: -FWD * 2 * (1 - ki), o: ki * (1 - ko) });
        const ts = cue(R.feat, C.cues.samples) - 0.2, tl = cue(R.feat, C.cues.links) - 0.25;
        const s1 = CJ.strip - 560, s2 = CJ.strip - 390, s3 = CJ.links - 360;
        let y = lerp(0, s1, P(t, a + 0.55, ts, E.io3));
        y = lerp(y, s2, P(t, ts, ts + 0.45, E.io3));
        if (t > tl) y = s3;
        scroll.style.transform = `translateY(${(-y * k).toFixed(2)}px)`;
        // tap a sample, open the viewer, zoom into the gold
        const tt = ts + 0.5;
        const kt = P(t, tt, tt + 0.45, E.out2);
        const px = (CJ.plate[0] + CJ.plate[2] / 2) * k, py = STATUS + (CJ.plate[1] + CJ.plate[3] / 2 - s2) * k;
        tap.style.left = px + 'px'; tap.style.top = py + 'px';
        put(tap, { s: 0.6 + 0.8 * kt, o: kt > 0 && kt < 1 ? 1 - kt : 0 });
        const kv = P(t, tt + 0.3, tt + 0.6, E.out2) * (1 - P(t, tl, tl + 0.35, E.in2));
        put(viewer, { o: kv, s: 0.96 + 0.04 * P(t, tt + 0.3, tt + 0.7, E.out3) });
        status.classList.toggle('dark', kv > 0.5);
        const kz = P(t, tt + 0.85, tl - 0.1, E.io3);
        zimg.style.transform = `scale(${(1 + 1.5 * kz).toFixed(4)})`;
        // the links to the libraries
        const kr = P(t, tl + 0.3, tl + 0.75, E.out3);
        const L = CJ.linksBox;
        Object.assign(ring.style, { left: (L[0] * k - 10) + 'px', top: (STATUS + (L[1] - s3) * k - 10) + 'px', width: (L[2] * k + 20) + 'px', height: (L[3] * k + 20) + 'px' });
        put(ring, { s: 1.12 - 0.12 * kr, o: kr * (1 - ko) });
        const cts = [cue(R.feat, C.cues.card) + 0.15, ts + 0.35, tl + 0.2];
        callouts.forEach((c, i) => {
          const kc = P(t, cts[i], cts[i] + 0.5, E.out3);
          const dx = (i === 1 ? 1 : -1) * FWD * 40 * (1 - kc);
          put(c, { x: dx, o: kc * (1 - ko) });
        });
      },
    };
  }

  // 5. the author
  function Author() {
    const root = el('div', 'fill', scenes);
    const bd = backdrop('img/bg-author.jpg');
    const script = el('img', 'abs', root);
    script.src = 'img/script-gold.png';
    Object.assign(script.style, { width: '1180px', left: '-50px', top: '120px' });
    const A = C.author;
    const card = el('div', '', root);
    card.id = 'authorcard';
    const inn = el('div', 'in', card);
    const kick = el('div', 'kicker', inn, A.kicker);
    const orn = el('div', 'orn', inn, STAR);
    const nm = el('div', 'nm', inn, A.name);
    const role = el('div', 'role', inn, A.role);
    const city = el('div', 'city', inn, `${ICON.pin} ${A.city}`);
    const badges = A.badges.map((bg, i) => {
      const d = el('div', 'badge', inn, ICON[bg.icon] + `<div class="tx">${bg.text}</div>` + (bg.year ? `<div class="yr">${bg.year}</div>` : ''));
      d.style.top = (498 + i * 128) + 'px';
      return d;
    });
    return {
      update(t) {
        if (!SC.author) { show(root, false); return; }
        const a = SC.author.start, b = SC.author.end;
        const on = t > a - 0.2 && t < b + 0.6;
        show(root, on);
        if (!on) return;
        const ki = P(t, a, a + 0.75, E.out3), ko = P(t, b - 0.35, b + 0.35, E.in3);
        put(bd, { s: 1.15 - 0.05 * P(t, a, b), o: 0.42 * ki * (1 - ko) });
        put(script, { y: -120 * P(t, a, b + 0.5), o: 0.16 * ki * (1 - ko) });
        put(card, { y: 50 * (1 - ki) - 40 * ko, s: 0.96 + 0.04 * ki, o: ki * (1 - ko) });
        put(kick, { o: P(t, a + 0.25, a + 0.7) });
        put(orn, { r: 90 * (1 - P(t, a + 0.2, a + 1.0, E.out3)), s: 0.6 + 0.4 * P(t, a + 0.2, a + 0.9, E.outBack), o: P(t, a + 0.2, a + 0.6) });
        const tn = cue(R.author, C.cues.name) - 0.18;
        const kn = P(t, tn, tn + 0.75, E.io3);
        nm.style.clipPath = RTL ? `inset(-20% 0 -20% ${(100 * (1 - kn)).toFixed(2)}%)` : `inset(-20% ${(100 * (1 - kn)).toFixed(2)}% -20% 0)`;
        put(nm, { o: P(t, tn, tn + 0.2), blur: 6 * (1 - kn) });
        const tr = cue(R.author, C.cues.role) - 0.15;
        const kr = P(t, tr, tr + 0.5, E.out3);
        put(role, { y: 16 * (1 - kr), o: kr });
        const tcy = cue(R.author, C.cues.city) - 0.2;
        const kc = P(t, tcy, tcy + 0.5, E.out3);
        put(city, { y: 16 * (1 - kc), s: 0.9 + 0.1 * P(t, tcy, tcy + 0.5, E.outBack), o: kc });
        const ta = cue(R.author, C.cues.award) - 0.15;
        const tb = [cue(R.author, C.cues.teach) - 0.15, cue(R.author, C.cues.grad) - 0.15, ta];   // teaching, diploma, prize
        badges.forEach((d, i) => {
          const k = P(t, tb[i], tb[i] + 0.55, E.out3);
          put(d, { x: -FWD * 50 * (1 - k), o: k });
          const pulse = i === 2 ? Math.max(0, 1 - Math.abs(t - (ta + 0.5)) / 0.6) : 0;
          d.style.boxShadow = `inset 0 0 0 ${1.5 + 1.5 * pulse}px rgba(233,200,121,${(0.22 + 0.6 * pulse).toFixed(3)}), 0 0 ${(40 * pulse).toFixed(1)}px rgba(233,200,121,${(0.35 * pulse).toFixed(3)})`;
        });
      },
    };
  }

  // 6. the guide in both languages, then its address, typed
  function CTA() {
    const root = el('div', 'fill', scenes);
    root.style.perspective = '2200px';
    const mkPhone = (lang, x, r) => {
      const p = el('div', 'phone', root);
      Object.assign(p.style, { width: '402px', height: '843px', left: (x - 201) + 'px', top: '272px', borderRadius: '62px' });
      const s = el('div', 'screen', p);
      s.style.borderRadius = '50px';
      s.style.background = '#1d1712';
      const i = el('img', '', s);
      i.src = UI + lang + '/home.png';
      i.style.width = '100%';
      return { p, r };
    };
    const other = LANG === 'ar' ? 'en' : 'ar';
    const back = mkPhone(other, RTL ? 410 : 670, RTL ? -7 : 7);
    const front = mkPhone(LANG, RTL ? 640 : 440, RTL ? 4 : -4);
    const chips = C.chips.map((txt, i) => el('div', 'chip', root, (i === 0 ? `<span class="ck">${ICON.check}</span>` : '') + txt));
    const brand = el('div', '', root);
    brand.id = 'ctabrand';
    const logo = el('div', '', brand, LOGO());
    const bname = el('div', 'name', brand, C.brand);
    const addr = el('div', '', root);
    addr.id = 'addr';
    addr.innerHTML = `${ICON.lock}<span class="txt"></span><span class="caret"></span><span class="go">${ICON.go}</span>`;
    const txt = addr.querySelector('.txt'), caret = addr.querySelector('.caret'), go = addr.querySelector('.go');
    let laid = false;
    return {
      update(t) {
        const a = SC.cta.start, b = SC.cta.end;
        const on = t > a - 0.2 && t < b + 0.6;
        show(root, on);
        if (!on) return;
        if (!laid) {                // chips are centred as a row, in reading order
          const ws = chips.map(c => c.offsetWidth), gap = 24, tot = ws.reduce((x, y) => x + y, 0) + gap;
          let x = 540 - tot / 2;
          const order = RTL ? [1, 0] : [0, 1];
          order.forEach(i => { chips[i].style.left = x + 'px'; x += ws[i] + gap; });
          laid = true;
        }
        const tv = segA(R.visit) - 0.45;
        const ki = P(t, a, a + 0.8, E.out3), kx = P(t, tv, tv + 0.5, E.in3);
        const bil = R.bil !== undefined;
        show(front.p, bil); show(back.p, bil); chips.forEach(c => show(c, bil));
        const tbil = bil ? cue(R.bil, C.cues.bilingual) - 0.1 : a;
        const kb = P(t, tbil, tbil + 0.7, E.io3);
        put(front.p, { y: 200 * (1 - ki) + 300 * kx, r: front.r * (1 - 0.3 * kb), o: ki * (1 - kx) });
        put(back.p, { x: -FWD * 60 * (1 - P(t, a + 0.15, a + 0.9, E.out3)) + FWD * 30 * kb, y: 240 * (1 - ki) + 300 * kx + 40, s: 0.9 + 0.06 * kb,
          r: back.r * (1 - 0.4 * kb), o: P(t, a + 0.15, a + 0.9, E.out3) * (1 - kx) * (0.75 + 0.25 * kb) });
        chips.forEach((c, i) => {
          const tc = bil ? cue(R.bil, i === 0 ? C.cues.sourced : C.cues.bilingual) - 0.1 : a;
          const k = P(t, tc, tc + 0.45, E.outBack);
          put(c, { y: 30 * (1 - P(t, tc, tc + 0.45, E.out3)) + 60 * kx, s: 0.8 + 0.2 * k, o: P(t, tc, tc + 0.3) * (1 - kx) });
        });
        // the address
        const kbr = P(t, tv, tv + 0.6, E.out3), kend = P(t, b - 0.3, b + 0.3, E.in3);
        const q = [...logo.querySelectorAll('rect')];
        q.forEach(r => { r.style.strokeDasharray = '120'; r.style.strokeDashoffset = (120 * (1 - P(t, tv, tv + 0.8, E.io3))).toFixed(2); });
        put(logo, { y: -20 * (1 - kbr), o: kbr * (1 - kend) });
        put(bname, { y: 24 * (1 - kbr), o: kbr * (1 - kend) });
        const ka = P(t, tv + 0.1, tv + 0.65, E.out3);
        put(addr, { y: 60 * (1 - ka), s: 0.94 + 0.06 * ka, o: ka * (1 - kend) });
        const w = SG[R.visit].words[SG[R.visit].words.length - 1];
        const n = C.url.length;
        const typed = Math.round(n * P(t, w.s - 0.05, w.e - 0.1));
        txt.textContent = C.url.slice(0, typed);
        const typing = typed > 0 && typed < n;
        caret.style.opacity = typing || Math.floor(t * 2.6) % 2 === 0 ? '1' : '0';
        const kp = P(t, w.e, w.e + 0.35, E.out3);
        go.style.transform = `scale(${(1 + 0.18 * Math.sin(Math.PI * kp)).toFixed(4)})`;
        go.style.boxShadow = `0 0 ${(36 * Math.sin(Math.PI * kp)).toFixed(1)}px rgba(233,200,121,${(0.8 * Math.sin(Math.PI * kp)).toFixed(3)})`;
      },
    };
  }

  // 7. credits
  function End() {
    const root = el('div', 'fill', scenes);
    root.id = 'endcard';
    const logo = el('div', '', root, LOGO());
    const name = el('div', 'name', root, C.brand);
    const url = el('div', 'url', root, C.url);
    const rule = el('div', 'rule', root);
    const star = el('div', 'star', root, STAR);
    const role = el('div', 'role', root, C.credits.role);
    const who = el('div', 'who', root, C.credits.name);
    const from = el('div', 'from', root, `${ICON.pin} ${C.credits.from}`);
    const imgs = el('div', 'imgs', root, C.credits.images);
    const q = [...logo.querySelectorAll('rect')];
    return {
      update(t) {
        const a = SC.end.start;
        const on = t > a - 0.1;
        show(root, on);
        if (!on) return;
        const kl = P(t, a, a + 0.9, E.io3);
        q.forEach(r => { r.style.strokeDasharray = '120'; r.style.strokeDashoffset = (120 * (1 - kl)).toFixed(2); });
        put(logo, { s: 0.9 + 0.1 * P(t, a, a + 0.9, E.out3), o: P(t, a, a + 0.3) });
        const f = (e, t0, dy = 18) => { const k = P(t, a + t0, a + t0 + 0.55, E.out3); put(e, { y: dy * (1 - k), o: k }); };
        f(name, 0.25); f(url, 0.45);
        const kr = P(t, a + 0.6, a + 1.2, E.io3);
        rule.style.transform = `scaleX(${kr.toFixed(4)})`;
        put(star, { r: 90 * (1 - kr), s: kr, o: kr });
        f(role, 0.85);
        const kw = P(t, a + 1.0, a + 1.75, E.io3);
        who.style.clipPath = RTL ? `inset(-20% 0 -20% ${(100 * (1 - kw)).toFixed(2)}%)` : `inset(-20% ${(100 * (1 - kw)).toFixed(2)}% -20% 0)`;
        put(who, { o: P(t, a + 1.0, a + 1.2), blur: 5 * (1 - kw) });
        f(from, 1.45); f(imgs, 1.75, 10);
      },
    };
  }

  // the site's mark and address, on screen throughout
  function Mark() {
    const m = el('div', '', stage);
    m.id = 'mark';
    m.innerHTML = `${LOGO()}<span class="name">${C.brand}</span><span class="sep"></span><span class="url">${C.url}</span>`;
    return {
      update(t) {
        const tb = cue(R.globe, C.cues.brand);
        const hide1 = P(t, tb - 0.5, tb - 0.1) * (1 - P(t, NEXT.globe + 0.2, NEXT.globe + 0.7));
        const hide2 = P(t, segA(R.visit) - 0.45, segA(R.visit) - 0.05);
        put(m, { o: (1 - hide1) * (1 - hide2) * 0.92 });
      },
    };
  }

  // ---------------------------------------------------------------- sound cues
  function soundCues() {
    const s = [];
    const add = (t, type, gain = 1) => s.push({ t: +t.toFixed(3), type, gain });
    add(0.05, 'swell', 0.8);
    [1, 2].forEach(i => add(segA(R.hook[i]) - 0.32, 'whoosh', 0.8));
    C.cues.hook.forEach((k, i) => add(cue(R.hook[i], k) - 0.05, 'ping', 0.45));
    add(SC.globe.start - 0.1, 'whoosh', 1);
    add(cue(R.globe, C.cues.scatter) - 0.35, 'scatter', 0.7);
    add(cue(R.globe, C.cues.gather) - 0.1, 'reverse', 0.5);
    add(cue(R.globe, C.cues.brand), 'impact', 0.8);            // on the name, not in the pause before it
    add(cue(R.globe, C.cues.brand) + 0.1, 'shimmer', 0.6);
    if (SC.eras) {
      add(SC.eras.start, 'whoosh', 0.7);
      C.cues.stats.forEach(k => add(cue(R.eras, k) - 0.12, 'tick', 0.8));
      add(cue(R.eras, C.cues.surviving) - 0.1, 'sparkle', 0.6);
      add(cue(R.eras, C.cues.lost) - 0.1, 'sparkle', 0.45);
    }
    if (SC.treasures) {
      add(SC.treasures.start, 'whoosh', 0.7);
      add(cue(R.tre, C.cues.gold) - 0.28, 'whoosh', 0.8);
      add(cue(R.tre, C.cues.gold) + 0.3, 'shimmer', 0.6);
      add(cue(R.tre, C.cues.silver) - 0.28, 'whoosh', 0.7);
    }
    if (SC.features) {
      add(SC.features.start, 'whoosh', 0.8);
      add(cue(R.feat, C.cues.samples) + 0.3, 'tap', 0.9);
      add(cue(R.feat, C.cues.links) + 0.1, 'tick', 0.6);
    }
    if (SC.author) {
      add(SC.author.start, 'whoosh', 0.7);
      add(cue(R.author, C.cues.award) + 0.35, 'shimmer', 0.5);
    }
    if (R.bil !== undefined) {          // the phones come in; without them the address whoosh opens the scene
      add(SC.cta.start, 'whoosh', 0.7);
      [C.cues.sourced, C.cues.bilingual].forEach(k => add(cue(R.bil, k) - 0.1, 'tick', 0.7));
    }
    add(segA(R.visit) - 0.45, 'whoosh', 0.8);
    const w = SG[R.visit].words[SG[R.visit].words.length - 1];
    const n = C.url.length;
    for (let i = 1; i <= n; i++) add(lerp(w.s - 0.05, w.e - 0.1, i / n), 'key', 0.5);
    add(w.e + 0.05, 'tap', 0.9);
    add(SC.end.start, 'whoosh', 0.6);
    add(SC.end.start + 0.05, 'impact', 0.7);
    add(SC.end.start + 1.0, 'shimmer', 0.5);
    return s.sort((x, y) => x.t - y.t);
  }

  // ---------------------------------------------------------------- assembly
  let parts;
  async function boot() {
    const [tl, land, morocco, card, viewer] = await Promise.all([
      fetch(`timeline.${LANG}${CUT ? '-' + CUT : ''}.json`).then(r => r.json()),
      fetch('data/land-50m.json').then(r => r.json()),
      fetch('data/morocco.json').then(r => r.json()),
      fetch(UI + LANG + '/card.json').then(r => r.json()),
      fetch(UI + LANG + '/viewer.json').then(r => r.json()),
    ]);
    TL = tl; SG = TL.segments; SC = TL.scenes;
    roles();
    const bg = Background();
    stage.appendChild(backs);
    const globe = Globe(land, morocco);
    stage.appendChild(scenes);
    const hook = Hook(), brand = Brand(), eras = Eras(), tre = Treasures(), feat = Features({ card, viewer }),
      author = Author(), cta = CTA(), end = End();
    const dust = Dust();
    const caps = Captions();
    const mark = Mark();
    el('div', '', stage).id = 'vignette';
    const grain = Grain();
    const fade = el('div', '', stage);
    fade.id = 'fade';
    parts = { bg, globe, hook, brand, eras, tre, feat, author, cta, end, dust, caps, mark, grain, fade };
    // wait for every face and picture before the first frame
    const faces = ['700 60px Amiri', '400 30px Amiri', '700 60px KufiVar', '800 60px KufiVar', '600 30px KufiVar',
      '400 30px "IBM Plex Sans Arabic"', '500 30px "IBM Plex Sans Arabic"', '600 30px "IBM Plex Sans Arabic"',
      '400 30px Plex', '500 30px Plex', '600 30px Plex', '700 60px SerifVar', '600 60px SerifVar'];
    await Promise.all(faces.map(f => document.fonts.load(f, RTL ? 'مصاحف المغرب abc 123' : 'Masahif al-Maghrib 123')));
    await document.fonts.ready;
    const imgs = [...document.images];
    await Promise.all(imgs.map(i => (i.complete ? i.decode().catch(() => {}) : new Promise(r => { i.onload = i.onerror = r; }).then(() => i.decode().catch(() => {})))));
    const bgs = [...new Set([...document.querySelectorAll('.backdrop')].map(b => b.style.backgroundImage.slice(5, -2)))];
    await Promise.all(bgs.map(src => new Promise(r => { const i = new Image(); i.onload = i.onerror = r; i.src = src; })));
    window.SFX = soundCues();
    window.DURATION = TL.duration;
    window.FPS = TL.fps;
  }

  function mood(t) {
    // how much pattern, glow and dust each moment carries
    const m = { pattern: 1, glow: 1, tint: '233,190,110', dust: 0.7 };
    if (t < SC.hook.end) { m.pattern = 0.5; m.dust = 0.55; }
    if (t >= SC.globe.start && t < NEXT.globe) { m.dust = 0.9; m.glow = 1.3; }
    if (t >= SC.end.start) { m.dust = 1.0; m.glow = 1.4; }
    return m;
  }

  function renderFrame(t) {
    const m = mood(t);
    for (const b of BACKDROPS) { b.style.visibility = 'hidden'; b.style.opacity = '0'; }
    parts.bg.update(t, m);
    parts.globe.draw(globeState(t), t);
    parts.hook.update(t);
    parts.brand.update(t);
    parts.eras.update(t);
    parts.tre.update(t);
    parts.feat.update(t);
    parts.author.update(t);
    parts.cta.update(t);
    parts.end.update(t);
    parts.dust.update(t, m.dust);
    parts.caps.update(t);
    parts.mark.update(t);
    parts.grain.update(t);
    const black = P(t, TL.duration - 0.75, TL.duration - 0.05, E.in2);
    parts.fade.style.opacity = black.toFixed(3);
  }

  window.ready = boot().then(() => {
    window.renderFrame = renderFrame;
    if (Q.has('t')) renderFrame(parseFloat(Q.get('t')));
    if (Q.has('play')) {
      const t0 = performance.now();
      const loop = () => { renderFrame(((performance.now() - t0) / 1000) % TL.duration); requestAnimationFrame(loop); };
      loop();
    }
    return true;
  });
})();
