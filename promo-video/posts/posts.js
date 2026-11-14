/* Masahif al-Maghrib, stills for social media, in the video's look.
   index.html?lang=ar&post=carousel-3 draws one post; window.POST holds its
   size and window.ready resolves once its fonts and pictures are in.
   Posts: carousel-1 … carousel-7 (1080×1350), cover-full, cover-teaser and
   story (1080×1920). The facts are the site's own (era data files). */
(() => {
  const Q = new URLSearchParams(location.search);
  const LANG = Q.get('lang') === 'en' ? 'en' : 'ar';
  const RTL = LANG === 'ar';
  const POST = Q.get('post') || 'carousel-1';
  document.documentElement.lang = LANG;
  document.documentElement.dir = RTL ? 'rtl' : 'ltr';
  const SITE = '/';                       // plates come straight from the site
  const ERA = Object.fromEntries(ERAS.map(e => [e.key, e]));

  const LOGO = (size = 44) => `<svg class="logo" width="${size}" height="${size}" viewBox="0 0 64 64"><g fill="none" stroke="#e0b75a" stroke-width="3.2" stroke-linejoin="round">` +
    '<rect x="17" y="17" width="30" height="30"/><rect x="17" y="17" width="30" height="30" transform="rotate(45 32 32)"/></g>' +
    '<circle cx="32" cy="32" r="4.2" fill="#e0b75a"/></svg>';
  const PIN = '<svg viewBox="0 0 24 24"><path d="M12 22s7-6.6 7-12.2A7 7 0 0 0 5 9.8C5 15.4 12 22 12 22z" fill="none" stroke="#e9c879" stroke-width="1.8"/><circle cx="12" cy="9.8" r="2.6" fill="#e9c879"/></svg>';
  const ARROW = `<svg viewBox="0 0 48 48"><path d="${RTL ? 'M38 24H10M20 13L9 24l11 11' : 'M10 24h28M28 13l11 11-11 11'}" fill="none" stroke="#e9c879" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const CHECK = '<svg viewBox="0 0 24 24" width="26" height="26" style="vertical-align:-5px;margin-inline-end:8px"><path d="M4 12.5l5 5 11-11" fill="none" stroke="#1b1510" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  // ---------------------------------------------------------------- words
  const IMG = {
    murtada: SITE + 'muwahhidun/plates/mt-juz1.jpg',
    yaqub: SITE + 'marini/plates/mc-fatiha.jpg',
    aqsa: SITE + 'marini/plates/aq-saffat.jpg',
    green: SITE + 'wattasi/plates/gr-text.jpg',
    mansur: '../assets/mansur-colophon-wide.jpg',
    mansurTall: '../assets/mansur-colophon-tall.jpg',
  };
  const T = {
    ar: {
      brand: 'مصاحف المغرب', url: 'masahif-al-maghrib.com',
      cover: { kicker: 'مصاحف المغرب', title: 'خمسة مصاحف مغربية نفيسة', sub: 'من مراكش والرباط إلى القدس والإسكوريال وميونخ', swipe: 'اسحب' },
      today: 'اليوم:',
      items: [
        { key: 'murtada', era: 'muwahhidun', date: '654هـ / 1256م', title: 'ربعة الخليفة المرتضى بخط يده',
          body: 'نسخها الخليفة الموحدي أبو حفص عمر المرتضى بيده في مراكش، وفي خاتمة جزئها الثاني: <span class="quote">«وكتبه بخط يده الفانية»</span>.',
          today: 'خزانة ابن يوسف بمراكش، والمكتبة الوطنية بالرباط', credit: 'الصورة: خزانة ابن يوسف 432/1 (الجزء الأول)، عن د. محمد عبد الحفيظ خبطة',
          img: IMG.murtada, pos: '50% 30%' },
        { key: 'yaqub', era: 'marini', date: '705هـ / 1306م', title: 'مصحف خزانة السلطان أبي يعقوب يوسف',
          body: 'كُتب على الرق برسم خزانة السلطان المريني، وكان في اثني عشر جزءاً لم يبق منها إلا الأول والأخير.',
          today: 'ميونخ، مكتبة الدولة البافارية', credit: 'الصورة: مكتبة الدولة البافارية، Cod.arab. 2، ملك عام',
          img: IMG.yaqub, pos: '50% 40%' },
        { key: 'aqsa', era: 'marini', date: '745هـ / 1344–1345م', title: 'الربعة المغربية بخط السلطان أبي الحسن',
          body: 'نسخها السلطان المريني أبو الحسن بيده وحبّسها على المسجد الأقصى، وبقي بخطه خمسة وعشرون جزءاً من ثلاثين.',
          today: 'القدس، المتحف الإسلامي بالمسجد الأقصى', credit: 'الصورة: عن د. محمد عبد الحفيظ خبطة، بدقة منخفضة',
          img: IMG.aqsa, pos: '50% 46%' },
        { key: 'green', era: 'wattasi', date: 'القرن التاسع الهجري', title: 'المصحف الأخضر',
          body: 'ورقه مصبوغ كله بالأخضر فلا يظهر منه لونه الطبيعي، وكتابته بالفضة، ويُنسب إلى العهد الوطاسي.',
          today: 'الرباط، المكتبة الوطنية', credit: 'الصورة: المكتبة الوطنية بالرباط 1304، عن د. محمد عبد الحفيظ خبطة',
          img: IMG.green, pos: '50% 42%' },
        { key: 'mansur', era: 'saadi', date: '1008هـ / 1599م', title: 'مصحف خزانة السلطان أحمد المنصور',
          body: 'كُتب لخزانة المنصور الذهبي في جامع الديوان من قصوره بمراكش، وخاتمته بالذهب على اللازورد.',
          today: 'الإسكوريال، المكتبة الملكية', credit: 'الصورة: Patrimonio Nacional، الإسكوريال، المكتبة الملكية، Árabe 1340',
          img: IMG.mansur, pos: '50% 50%' },
      ],
      guide: { title: 'مصاحف المغرب', sub: 'دليل مصوَّر للمصاحف المؤرَّخة في عصور المغرب، من الأدارسة إلى العلويين',
        stats: [['12', 'قرنًا'], ['7', 'عصور'], ['+60', 'مصحفًا']],
        byline: 'من إعداد الخطاط والباحث <b>إبراهيم حسني إدريسي</b>', chips: ['موثّق المصادر', 'عربي · English'],
        credit: 'تطوير الموقع: خالد بن جلون، مطوّر من فاس' },
      coverFull: { title: 'مصاحف المغرب', sub: 'اثنا عشر قرنًا · سبعة عصور · أكثر من ستين مصحفًا' },
      coverTeaser: { title: 'مصحف بخط سلطان المغرب', title2: 'في المسجد الأقصى', sub: 'الربعة المغربية بخط السلطان أبي الحسن المريني · 745هـ / 1345م' },
      story: { kicker: 'دليل مصوَّر', title: 'مصاحف المغرب', sub: 'المصاحف المؤرَّخة في عصور المغرب، موثّقة المصادر، بالعربية والإنجليزية', cta: 'زوروا الدليل' },
    },
    en: {
      brand: 'Masahif al-Maghrib', url: 'masahif-al-maghrib.com',
      cover: { kicker: 'Masahif al-Maghrib', title: 'Five treasures of Moroccan Qur’an manuscripts', sub: 'From Marrakesh and Rabat to Jerusalem, El Escorial and Munich', swipe: 'Swipe' },
      today: 'Today:',
      items: [
        { key: 'murtada', era: 'muwahhidun', date: '654 AH / 1256 CE', title: 'The rabʿa of the Caliph al-Murtada, in his own hand',
          body: 'Copied by the Almohad caliph Abu Hafs ʿUmar al-Murtada himself, in Marrakesh. The colophon of volume 2 reads: “written by his own mortal hand.”',
          today: 'Ibn Yusuf Library, Marrakesh, and the National Library, Rabat', credit: 'Image: Ibn Yusuf Library 432/1 (vol. 1), after Dr Mohamed Abdelhafid Khabta',
          img: IMG.murtada, pos: '50% 30%' },
        { key: 'yaqub', era: 'marini', date: '705 AH / 1306 CE', title: 'The Qur’an of Sultan Abu Yaʿqub Yusuf',
          body: 'Written on parchment for the Marinid sultan’s library, in twelve volumes. Only the first and the last survive.',
          today: 'Munich, Bavarian State Library', credit: 'Image: Bavarian State Library, Cod.arab. 2, public domain',
          img: IMG.yaqub, pos: '50% 40%' },
        { key: 'aqsa', era: 'marini', date: '745 AH / 1344–1345 CE', title: 'The Maghribi rabʿa of Sultan Abu al-Hasan',
          body: 'Copied by the Marinid sultan in his own hand and endowed to al-Aqsa Mosque. Twenty-five of its thirty volumes in his hand survive.',
          today: 'Jerusalem, Islamic Museum of al-Aqsa Mosque', credit: 'Image: after Dr Mohamed Abdelhafid Khabta, at low resolution',
          img: IMG.aqsa, pos: '50% 46%' },
        { key: 'green', era: 'wattasi', date: '9th century AH', title: 'The Green Qur’an',
          body: 'Its paper is dyed entirely green, so that none of its natural colour shows, and the text is written in silver. It is attributed to the Wattasid period.',
          today: 'Rabat, National Library', credit: 'Image: National Library, Rabat, 1304, after Dr Mohamed Abdelhafid Khabta',
          img: IMG.green, pos: '50% 42%' },
        { key: 'mansur', era: 'saadi', date: '1008 AH / 1599 CE', title: 'The Qur’an of Sultan Ahmad al-Mansur',
          body: 'Written for al-Mansur’s library, in the mosque of his palaces in Marrakesh. Its colophon is in gold on lapis blue.',
          today: 'El Escorial, Royal Library', credit: 'Image: Patrimonio Nacional, Real Biblioteca del Monasterio de El Escorial, Árabe 1340',
          img: IMG.mansur, pos: '50% 50%' },
      ],
      guide: { title: 'Masahif al-Maghrib', sub: 'An illustrated guide to the dated Qur’ans of Morocco, from the Idrisids to the Alaouites',
        stats: [['12', 'centuries'], ['7', 'dynasties'], ['60+', 'Qur’ans']],
        byline: 'Prepared by calligrapher and manuscript researcher <b>Ibrahim Hassani Idrissi</b>', chips: ['Fully sourced', 'English · عربي'],
        credit: 'Website development: Khalid Benjelloun, developer from Fez' },
      coverFull: { title: 'Masahif al-Maghrib', sub: '12 centuries · 7 dynasties · 60+ Qur’ans' },
      coverTeaser: { title: 'A Moroccan sultan’s Qur’an, in his own hand', title2: 'at al-Aqsa Mosque', sub: 'The Maghribi rabʿa of the Marinid sultan Abu al-Hasan · 745 AH / 1345 CE' },
      story: { kicker: 'An illustrated guide', title: 'Masahif al-Maghrib', sub: 'The dated Qur’ans of Morocco, fully sourced, in Arabic and English', cta: 'Visit the guide' },
    },
  }[LANG];

  // ---------------------------------------------------------------- pieces
  const frame = document.getElementById('frame');
  const nb = s => (RTL ? s : s.replace(/\b(al-[^\s,.;:”’]+)/g, '<span class="nw">$1</span>'));
  function el(tag, cls, parent, html) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    (parent || frame).appendChild(e);
    return e;
  }
  const at = (e, css) => { Object.assign(e.style, css); return e; };
  function ground(w, h, { backdrop, glowY = 0.34 } = {}) {
    at(frame, { width: w + 'px', height: h + 'px' });
    if (backdrop) at(el('div', 'backdrop'), { backgroundImage: `url(${backdrop})` });
    el('div', 'pattern', frame, `<svg width="${w}" height="${h}"><defs><pattern id="zl" width="150" height="150" patternUnits="userSpaceOnUse" x="${(w / 2 - 75) % 150}" y="0">
      <g fill="none" stroke="rgba(233,200,121,0.075)" stroke-width="1.6"><rect x="45" y="45" width="60" height="60"/><rect x="45" y="45" width="60" height="60" transform="rotate(45 75 75)"/>
      <path d="M75 32.6V0M75 117.4V150M32.6 75H0M117.4 75H150"/><circle cx="75" cy="75" r="9"/></g></pattern></defs><rect width="100%" height="100%" fill="url(#zl)"/></svg>`);
    at(el('div', 'glow'), { background: `radial-gradient(${w * 0.62}px ${w * 0.62}px at 50% ${h * glowY}px, rgba(233,190,110,.16), transparent 70%)` });
    el('div', 'vignette');
  }
  const mark = (top, parent) => at(el('div', 'mark', parent, `${LOGO()}<span class="name">${T.brand}</span><span class="sep"></span><span class="url">${T.url}</span>`), { top: top + 'px' });
  function card(src, x, y, w, h, { pos = '50% 50%', rot = 0, z = 1 } = {}) {
    const c = at(el('div', 'card'), { left: (x - w / 2) + 'px', top: y + 'px', width: w + 'px', height: h + 'px', transform: `rotate(${rot}deg)`, zIndex: z });
    at(el('img', '', c), { objectPosition: pos }).src = src;
    return c;
  }
  const text = (cls, html, top, extra = {}) => at(el('div', 'center ' + cls, frame, html), { top: top + 'px', ...extra });
  const fan = (cy, big, [a, b, c]) => {   // three cards, the middle one in front
    const side = big * 0.8, dx = big * 0.62;
    card(a.src, 540 - dx, cy - side * 1.27 / 2 + 30, side, side * 1.27, { pos: a.pos, rot: -8 });
    card(c.src, 540 + dx, cy - side * 1.27 / 2 + 30, side, side * 1.27, { pos: c.pos, rot: 8 });
    card(b.src, 540, cy - big * 1.25 / 2, big, big * 1.25, { pos: b.pos, z: 2 });
  };
  function phone(src, x, y, w, rot, z) {
    const h = w * 2.1;
    const p = at(el('div', 'phone'), { left: (x - w / 2) + 'px', top: y + 'px', width: w + 'px', height: h + 'px', transform: `rotate(${rot}deg)`, zIndex: z,
      borderRadius: (w * 0.155) + 'px' });
    const s = at(el('div', 'screen', p), { borderRadius: (w * 0.125) + 'px', background: '#1d1712' });
    el('img', '', s).src = src;
    at(el('div', 'island', p), { width: (w * 0.26) + 'px', marginLeft: -(w * 0.13) + 'px', height: (w * 0.075) + 'px', top: (w * 0.05) + 'px' });
    return p;
  }

  // ---------------------------------------------------------------- posts
  const BUILD = {
    // 1: the hook, three of the five in a fan
    'carousel-1'() {
      ground(1080, 1350);
      mark(58);
      fan(500, 400, [{ src: IMG.mansurTall, pos: '50% 30%' }, { src: IMG.aqsa, pos: '50% 46%' }, { src: IMG.green, pos: '50% 42%' }]);
      const col = at(el('div', 'layer'), { top: '830px', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 70px', textAlign: 'center' });
      at(el('div', 'title', col, T.cover.title), { fontSize: RTL ? '84px' : '76px' });
      at(el('div', 'sub', col, T.cover.sub), { marginTop: '22px' });
      el('div', 'swipe', frame, `<span>${T.cover.swipe}</span>${ARROW}`);
    },
    // 7: the guide itself
    'carousel-7'() {
      ground(1080, 1350, { glowY: 0.3 });
      const G = T.guide;
      at(el('div', 'biglogo', frame, LOGO(120)), { top: '96px', marginLeft: '-60px' });
      text('title', G.title, 236, { fontSize: RTL ? '108px' : '96px', whiteSpace: 'nowrap' });
      text('sub', G.sub, 390, { left: '120px', right: '120px' });
      const st = at(el('div', 'stats'), { top: '540px' });
      G.stats.forEach(([n, l]) => el('div', 's', st, `<div class="n">${n}</div><div class="l">${l}</div>`));
      const eras = at(el('div', 'eras'), { top: '770px' });
      ERAS.forEach(e => el('div', 'e', eras, `<div class="bar" style="background:${e.color};box-shadow:0 0 16px ${e.color}55"></div><div class="nm" style="color:${e.color}">${e[LANG]}</div>`));
      text('byline', G.byline, 880, { left: '110px', right: '110px' });
      at(el('div', 'urlpill solid', frame, T.url), { top: '1010px' });
      const chips = at(el('div', 'chips'), { top: '1150px' });
      G.chips.forEach((c, i) => el('div', 'chip', chips, (i === 0 ? CHECK : '') + c));
      at(el('div', 'credit', frame, G.credit), { bottom: '44px' });
    },
    // a video cover for the full cut
    'cover-full'() {
      ground(1080, 1920, { glowY: 0.4 });
      mark(268);
      fan(720, 440, [{ src: IMG.mansurTall, pos: '50% 30%' }, { src: IMG.aqsa, pos: '50% 46%' }, { src: IMG.green, pos: '50% 42%' }]);
      at(el('div', 'biglogo', frame, LOGO(96)), { top: '1080px', marginLeft: '-48px' });
      text('title', T.coverFull.title, 1190, { fontSize: RTL ? '128px' : '96px', whiteSpace: 'nowrap' });
      text('sub', T.coverFull.sub, 1380, { fontSize: '38px', color: 'var(--gold3)' });
      at(el('div', 'urlpill', frame, T.url), { top: '1490px' });
    },
    // a video cover for the teaser: its opening line
    'cover-teaser'() {
      ground(1080, 1920, { backdrop: IMG.aqsa, glowY: 0.3 });
      mark(268);
      card(IMG.aqsa, 540, 370, 600, 669, { pos: '50% 46%' });
      const col = at(el('div', 'layer'), { top: '1096px', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 60px', textAlign: 'center' });
      at(el('div', 'title', col, `${T.coverTeaser.title}<br><span style="color:var(--gold3)">${nb(T.coverTeaser.title2)}</span>`), { fontSize: RTL ? '76px' : '68px' });
      at(el('div', 'sub', col, nb(T.coverTeaser.sub)), { fontSize: '30px', color: 'var(--ink2)', marginTop: '26px' });
      at(el('div', 'urlpill flow', col, T.url), { fontSize: '34px', marginTop: '40px' });
    },
    // a story: the guide on two phones, room at the bottom for a link sticker
    story() {
      ground(1080, 1920, { glowY: 0.45 });
      mark(212);
      text('kicker', T.story.kicker, 330);
      text('title', T.story.title, 388, { fontSize: RTL ? '118px' : '104px', whiteSpace: 'nowrap' });
      text('sub', T.story.sub, 560, { left: '110px', right: '110px' });
      const other = LANG === 'ar' ? 'en' : 'ar';
      phone(`../build/ui/${other}/home.png`, RTL ? 400 : 680, 760, 330, RTL ? -7 : 7, 1);
      phone(`../build/ui/${LANG}/home.png`, RTL ? 650 : 430, 720, 350, RTL ? 4 : -4, 2);
      text('kicker', T.story.cta, 1530, { fontSize: RTL ? '40px' : '30px', color: 'var(--gold2)' });
      at(el('div', 'urlpill solid', frame, T.url), { top: '1600px' });
    },
  };
  // 2–6: one Qur'an each, in order of date
  T.items.forEach((it, i) => {
    BUILD[`carousel-${i + 2}`] = () => {
      ground(1080, 1350, { backdrop: it.img });
      mark(58);
      el('div', 'count', frame, `${i + 1}/${T.items.length}`);
      const e = ERA[it.era];
      const col = at(el('div', 'layer'), { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '138px 70px 0' });
      at(el('div', 'era', col, `<i></i>${e[LANG]}<span class="d">· ${it.date}</span>`), { color: e.color });
      at(el('div', 'title', col, nb(it.title)), { fontSize: RTL ? '58px' : '54px', textAlign: 'center', marginTop: '26px' });
      const c = at(el('div', 'card', col), { position: 'relative', width: '940px', height: '590px', marginTop: '30px', flex: 'none' });
      at(el('img', '', c), { objectPosition: it.pos }).src = it.img;
      at(el('div', 'body', col, nb(it.body)), { textAlign: 'center', marginTop: '34px' });
      el('div', 'today', col, `${PIN}<span>${T.today} ${nb(it.today)}</span>`).style.marginTop = '18px';
      at(el('div', 'credit', frame, it.credit), { bottom: '30px' });
    };
  });

  const build = BUILD[POST];
  if (!build) throw new Error('unknown post ' + POST);
  build();
  window.POST = { w: frame.offsetWidth, h: frame.offsetHeight, posts: Object.keys(BUILD) };
  window.ready = (async () => {
    const faces = ['800 60px KufiVar', '700 60px KufiVar', '600 30px KufiVar', '700 60px Amiri', '400 30px "IBM Plex Sans Arabic"',
      '500 30px "IBM Plex Sans Arabic"', '600 30px "IBM Plex Sans Arabic"', '400 30px Plex', '500 30px Plex', '600 30px Plex',
      '700 60px SerifVar', '600 60px SerifVar'];
    await Promise.all(faces.map(f => document.fonts.load(f, RTL ? 'مصاحف المغرب abc 123' : 'Masahif al-Maghrib 123')));
    await document.fonts.ready;
    await Promise.all([...document.images].map(i => (i.complete ? i.decode().catch(() => {}) : new Promise(r => { i.onload = i.onerror = r; }).then(() => i.decode().catch(() => {})))));
    const bgs = [...document.querySelectorAll('.backdrop')].map(b => b.style.backgroundImage.slice(5, -2));
    await Promise.all(bgs.map(src => new Promise(r => { const i = new Image(); i.onload = i.onerror = r; i.src = src; })));
    return true;
  })();
})();
