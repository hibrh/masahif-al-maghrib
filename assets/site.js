/* مصاحف المغرب — shared page engine.
   Each era page sets window.ERA_KEY and loads its data.js, which registers ERAS_DATA[key].
   The hub page sets ERA_KEY = 'hub' and loads every ready era's data.js. */
window.ERAS_DATA = window.ERAS_DATA || {};
window.BSB = (id, p) => `https://www.digitale-sammlungen.de/en/view/${id}?page=${p}`;
window.GAL = (ark, f) => `https://gallica.bnf.fr/ark:/12148/${ark}/f${f}.item`;

window.ERAS = [
  {key:'adarisa',    name:'الأدارسة',   gen:'الأدارسة',   rng:'172–375هـ / 788–985م',   a:788,  b:985,  c:'#8a4b2a', path:'adarisa/'},
  {key:'murabitun',  name:'المرابطون',  gen:'المرابطين',  rng:'448–541هـ / 1056–1147م', a:1056, b:1147, c:'#34508f', path:'murabitun/'},
  {key:'muwahhidun', name:'الموحدون',   gen:'الموحدين',   rng:'524–668هـ / 1130–1269م', a:1130, b:1269, c:'#9a3b26', path:'muwahhidun/'},
  {key:'marini',     name:'بنو مرين',   gen:'بني مرين',   rng:'646–869هـ / 1248–1465م', a:1248, b:1465, c:'#1c5444', path:'marini/'},
  {key:'wattasi',    name:'الوطاسيون',  gen:'الوطاسيين',  rng:'876–961هـ / 1472–1554م', a:1472, b:1554, c:'#2a6f72', path:'wattasi/'},
  {key:'saadi',      name:'السعديون',   gen:'السعديين',   rng:'916–1069هـ / 1510–1659م', a:1510, b:1659, c:'#9b2335', path:'saadi/'},
  {key:'alawi',      name:'العلويون',   gen:'العلويين',   rng:'1076هـ / 1666م – اليوم', a:1666, b:2026, c:'#6d3a7d', path:'alawi/'},
];
window.ERAS_READY = window.ERAS_READY || [];
/* plates enlarged with Real-ESRGAN (blended with a plain enlargement); labelled as such under the image */
window.AI_ENH = new Set(['q902-text','alm-colo','alm-text','cor-text','upp-text','ai-r23','ai-r24','g578-colo','g578-text','gh-table','ml-yunus','mt-bl7','mt-juz1','mt-rabat','tn-sad','tn-waqf','aq-juz2','aq-saffat','as-colo','as-text','ic-end','k1081-kufic','pc-colo','gr-text','ak-text','ak-waqf','aq-colo','gl-text','my-text','my-title','q5-text','sf-text','tu-text','dk-end','upp-page']);
const aiNote = p => window.AI_ENH.has(p.f) ? (window.LANG === 'en' ? ' · <i class="ai">AI-enhanced</i>' : ' · <i class="ai">محسّنة بالذكاء الاصطناعي</i>') : '';
/* English names of the eras (the Arabic ones are in ERAS above) */
window.ERAS_EN_NAMES = {
  adarisa:{name:'Idrisids', gen:'Idrisid', rng:'172–375 AH / 788–985 CE'},
  murabitun:{name:'Almoravids', gen:'Almoravid', rng:'448–541 AH / 1056–1147 CE'},
  muwahhidun:{name:'Almohads', gen:'Almohad', rng:'524–668 AH / 1130–1269 CE'},
  marini:{name:'Marinids', gen:'Marinid', rng:'646–869 AH / 1248–1465 CE'},
  wattasi:{name:'Wattasids', gen:'Wattasid', rng:'876–961 AH / 1472–1554 CE'},
  saadi:{name:'Saadians', gen:'Saadian', rng:'916–1069 AH / 1510–1659 CE'},
  alawi:{name:'Alaouites', gen:'Alaouite', rng:'1076 AH / 1666 CE – today'},
};

(function(){
const $ = (s, r=document) => r.querySelector(s);
const el = (tag, attrs={}, html='') => { const e = document.createElement(tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (html) e.innerHTML = html; return e; };
/* page language: 'ar' (default) or 'en'; tr(arabic, english) picks the string for it */
const LANG = window.LANG === 'en' ? 'en' : 'ar', EN = LANG === 'en';
const tr = (a, e) => EN ? e : a;
const FWD = EN ? '→' : '←', BACK = EN ? '←' : '→';
const LAT = s => EN ? String(s) : String(s).replace(/(Cod\.arab\. \d+|Arabe \d+|K \d{3,4}|QUR \d+|ms\. ?[A-Z]?\.? ?\d+[\w./-]*|R\. ?\d+|Or\. ?\d+|Met \d+\.\d+|O\. ?Bj\. ?\d+|O\. ?Vet\. ?\d+|Mscr\.Dresd\.Ea\.\d+|RES\/\d+|A \d{4}|\d{4}\.\d+|Gallica|IIIF|BSB|BnF|MDZ)/g, '<bdi dir="ltr">$1</bdi>');
const ST = EN ? {
  s:{ok:['b-ok','Survives'], no:['b-no','Lost']},
  c:{ok:['b-ok','Complete'], part:['b-part','Incomplete'], unk:['b-mut','Completeness unknown']},
  d:{ok:['b-ok','Fully digitised'], part:['b-part','Partial images'], no:['b-no','Not digitised']},
} : {
  s:{ok:['b-ok','باقٍ'], no:['b-no','مفقود']},
  c:{ok:['b-ok','تام'], part:['b-part','ناقص'], unk:['b-mut','التمام غير معلوم']},
  d:{ok:['b-ok','مرقمن كاملاً'], part:['b-part','صور جزئية'], no:['b-no','غير مرقمن']},
};
const GROUPS = EN ? {surviving:'Surviving, meeting the criteria', lost:'Recorded in the sources, now lost', edge:'On the edge of the criteria'}
  : {surviving:'باقية تستوفي الشرط', lost:'ذكرتها المصادر وضاعت', edge:'على حافة الشرط'};
const badges = st => { const keys = st.s==='no' ? ['s'] : ['s','c','d']; return `<div class="badges">${keys.map(k=>{ const v = ST[k][st[k]]; return `<span class="badge ${v[0]}">${v[1]}</span>`; }).join('')}</div>`; };
const star = '<svg class="star"><use href="#star"/></svg>';
/* Arabic number agreement: f = [one, two, 3–10 (and 0), 11–99] */
const agree = (n, f) => n===1 ? f[0] : n===2 ? f[1] : (n%100>=11 && n%100<=99) ? f[3] : f[2];
const lines = n => EN ? `${n} line${n===1?'':'s'}` : n===1 ? 'سطر واحد' : n===2 ? 'سطران' : `${n} ${agree(n, ['','','أسطر','سطراً'])}`;
/* English counted noun: en(3, 'Qur’an') -> '3 Qur’ans' */
const en = (n, one, many) => `${n} ${n===1 ? one : (many || one + 's')}`;
const ROOT = window.ROOT || '';
/* folder of the era's plates/ relative to the current page ('' on the era page, '../' on a manuscript page) */
const PB = window.PLATE_BASE || '';
/* site credit, shown at the foot of every page; wa = WhatsApp number in international format, digits only */
const WA_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.2a9.8 9.8 0 0 0-8.4 14.8L2.3 21.7l4.8-1.3A9.8 9.8 0 1 0 12 2.2Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M8.6 7.4c.3-.3.8-.3 1 .1l.8 1.8c.1.3 0 .6-.2.8l-.6.6a6.6 6.6 0 0 0 3.6 3.6l.6-.6c.2-.2.5-.3.8-.2l1.8.8c.4.2.4.7.1 1-.9 1-2.2 1.3-3.4.8a10.4 10.4 0 0 1-5.3-5.3c-.5-1.2-.2-2.5.8-3.4Z" fill="currentColor"/></svg>';
/* role: the author's title on the about page and the home-page card; credit: the footer byline, worded by the user */
const AUTHOR = EN ? {name:'Ibrahim Hassani Idrissi', role:'teacher of Maghribi scripts and researcher in manuscripts', credit:'teacher of Maghribi scripts and researcher in manuscripts from Fez', wa:'212681769161'}
  : {name:'إبراهيم حسني إدريسي', role:'أستاذ الخطوط المغربية وباحث في المخطوطات', credit:'أستاذ الخطوط المغربية وباحث في المخطوطات من فاس', wa:'212681769161'};
/* the author's credentials, shown on the about page (<lang root>/about/) and the home-page card, and given to search engines */
const CRED = EN ? {
  cert:'Certificate of Training in the Art of Calligraphy, the Qarawiyyin (2019)',
  award:'Encouragement award of the Mohammed VI Prize for the Art of Maghribi Calligraphy, 19th edition (2025)',
  shows:'Several national and international exhibitions and competitions',
  bio:['<b>Ibrahim Hassani Idrissi</b> is a teacher of Maghribi scripts and a researcher in manuscripts, based in Fez. He holds the Certificate of Training in the Art of Calligraphy from the Qarawiyyin (2019), and received the encouragement award of the Mohammed VI Prize for the Art of Maghribi Calligraphy at its nineteenth edition (2025). He has taken part in several national and international exhibitions and competitions.',
    'His interest in Moroccan Qur’ans and manuscripts, and in the history of their scripts, gave rise to this site: a guide to the dated Qur’ans of Morocco’s eras, with close-ups of their writing.'],
} : {
  cert:'شهادة التكوين في فن الخط، جامع القرويين (2019)',
  award:'الجائزة التشجيعية لجائزة محمد السادس لفن الخط المغربي، الدورة التاسعة عشرة (2025)',
  shows:'مشاركات في معارض ومسابقات وطنية ودولية عدة',
  bio:['<b>إبراهيم حسني إدريسي</b>، أستاذ الخطوط المغربية وباحث في المخطوطات، من فاس. حاصل على شهادة التكوين في فن الخط من جامع القرويين (2019)، وعلى الجائزة التشجيعية لجائزة محمد السادس لفن الخط المغربي في دورتها التاسعة عشرة (2025). وشارك في معارض ومسابقات وطنية ودولية عدة.',
    'يُعنى بالمصاحف والمخطوطات المغربية وتاريخ خطوطها، ومن هذه العناية وُلد هذا الموقع: دليل يجمع المصاحف المؤرخة في عصور المغرب، ويعرض عينات مقرّبة من كتابتها.'],
};
const ABOUT = () => `${ROOT || './'}about/`;
/* the role as a stand-alone line (capitalised in English) */
const ROLE_LINE = EN ? AUTHOR.role[0].toUpperCase() + AUTHOR.role.slice(1) : AUTHOR.role;
const SN = tr('مصاحف المغرب', 'Masahif al-Maghrib');
/* era name in the page language */
const eraName = e => EN ? window.ERAS_EN_NAMES[e.key].name : e.name;
const waLink = AUTHOR.wa ? `https://wa.me/${AUTHOR.wa}` : '';
const byline = () => EN ? `<div class="byline"><span>Prepared by <a href="${ABOUT()}">${AUTHOR.name}</a>, ${AUTHOR.credit}</span><a class="wa" href="${waLink}" target="_blank" rel="noopener" aria-label="Message on WhatsApp">${WA_ICON}WhatsApp</a></div>`
  : `<div class="byline"><span>إعداد <a href="${ABOUT()}">${AUTHOR.name}</a>، ${AUTHOR.credit}</span>${waLink ? `<a class="wa" href="${waLink}" target="_blank" rel="noopener" aria-label="مراسلة على واتساب"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.2a9.8 9.8 0 0 0-8.4 14.8L2.3 21.7l4.8-1.3A9.8 9.8 0 1 0 12 2.2Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M8.6 7.4c.3-.3.8-.3 1 .1l.8 1.8c.1.3 0 .6-.2.8l-.6.6a6.6 6.6 0 0 0 3.6 3.6l.6-.6c.2-.2.5-.3.8-.2l1.8.8c.4.2.4.7.1 1-.9 1-2.2 1.3-3.4.8a10.4 10.4 0 0 1-5.3-5.3c-.5-1.2-.2-2.5.8-3.4Z" fill="currentColor"/></svg>واتساب</a>` : ''}</div>`;

function railHTML(current){
  const chips = ERAS.map(e => {
    const ready = ERAS_READY.includes(e.key);
    const cur = e.key===current ? ' aria-current="page"' : '';
    return `<a href="${ROOT}${e.path}" class="${ready?'':'soon'}" style="--c:${e.c}"${cur}><i></i>${eraName(e)}</a>`;
  }).join('');
  return `<nav class="rail" aria-label="${tr('عصور المغرب', 'Eras of Morocco')}"><div class="wrap"><a class="home" href="${ROOT || './'}"${current==='hub'?' aria-current="page"':''}>${SN}</a>${chips}</div></nav>`;
}

function rulingSVG(r, scale=4.2, k={}){
  const paper = k.paper || 'var(--card)', ink = k.ink || 'var(--ink)', frame = k.frame || 'var(--gold)';
  const w = r.w*scale, h = r.h*scale, pad = 3;
  const tw = w*0.62, th = h*0.66, tx = (w-tw)/2, ty = (h-th)/2;
  let lines = '';
  if (r.n) { const step = r.n>1 ? th/(r.n-1) : 0; for (let q=0;q<r.n;q++){ const y = ty + q*step; lines += `<line x1="${tx}" x2="${tx+tw}" y1="${y}" y2="${y}" stroke="${ink}" stroke-width="${r.n>15?0.8:1.6}" opacity=".7"/>`; } }
  else lines = `<text x="${w/2}" y="${h/2+5}" font-size="16" text-anchor="middle" fill="${ink}" opacity=".6" font-family="IBM Plex Sans Arabic">؟</text>`;
  return `<svg width="${w+pad*2}" height="${h+pad*2}" viewBox="${-pad} ${-pad} ${w+pad*2} ${h+pad*2}" aria-hidden="true"><rect x="0" y="0" width="${w}" height="${h}" fill="${paper}" stroke="${frame}" stroke-width="1.4" ${r.unknown?'stroke-dasharray="4 3"':''}/>${lines}</svg>`;
}

function commonOverlays(){
  return `
<div class="lb" id="lb" role="dialog" aria-modal="true" aria-label="${tr('عارض اللوحة', 'Image viewer')}">
  <div class="lb-bar">
    <span class="ttl" id="lbTtl"></span>
    <button class="btn icon-btn" type="button" id="lbIn" aria-label="${tr('تكبير', 'Zoom in')}">＋</button>
    <button class="btn icon-btn" type="button" id="lbOut" aria-label="${tr('تصغير', 'Zoom out')}">－</button>
    <button class="btn" type="button" id="lbFit">${tr('ملء', 'Fit')}</button>
    <a class="btn" id="lbSrc" target="_blank" rel="noopener"><span class="lbl-long">${tr('في المصدر', 'At the source')} </span>↗</a>
    <button class="btn icon-btn" type="button" id="lbClose" aria-label="${tr('إغلاق', 'Close')}">✕</button>
  </div>
  <div class="lb-stage" id="lbStage">
    <img id="lbImg" alt="">
    <button class="btn icon-btn lb-nav lb-prev" type="button" id="lbPrev" aria-label="${tr('السابقة', 'Previous')}">${EN ? '‹' : '›'}</button>
    <button class="btn icon-btn lb-nav lb-next" type="button" id="lbNext" aria-label="${tr('التالية', 'Next')}">${EN ? '›' : '‹'}</button>
  </div>
  <div class="lb-cap" id="lbCap"></div>
</div>
<div class="pres" id="pres" role="dialog" aria-modal="true" aria-label="${tr('وضع العرض', 'Presentation')}">
  <div class="pres-top">
    <span id="presCount"></span><span class="sp"></span>
    <button class="btn" type="button" id="presFs">${tr('ملء الشاشة', 'Full screen')}</button>
    <button class="btn icon-btn" type="button" id="presClose" aria-label="${tr('إغلاق', 'Close')}">✕</button>
  </div>
  <div class="pres-prog"><i id="presProg"></i></div>
  <div class="slide" id="slide"></div>
  <div class="pres-nav">
    <button class="btn" type="button" id="presPrev">${tr('› السابق', '‹ Previous')}</button>
    <button class="btn" type="button" id="presNext">${tr('التالي ‹', 'Next ›')}</button>
  </div>
</div>`;
}

/* at the top of every era and manuscript page: this page belongs to the whole project */
const projectLink = () => `<a class="proj" href="${ROOT || './'}"><svg aria-hidden="true"><use href="#star"/></svg><span>${tr('جزء من مشروع <b>مصاحف المغرب</b>: المصاحف المؤرَّخة في سبعة عصور، من الأدارسة إلى العلويين', 'Part of the <b>Masahif al-Maghrib</b> project: dated Qur’ans across seven eras, from the Idrisids to the Alaouites')}</span><i aria-hidden="true">${FWD}</i></a>`;

/* link to the same page in the other language (build_hub.ps1 sets window.ALT_URL) */
/* on phones the button shows a short label so the page title keeps its room */
const langLink = () => window.ALT_URL ? (EN ? `<a class="btn lang-btn" href="${window.ALT_URL}" hreflang="ar" lang="ar" data-lang="ar" aria-label="العربية"><span class="lbl-long">العربية</span><span class="lbl-short">عربي</span></a>` : `<a class="btn lang-btn" href="${window.ALT_URL}" hreflang="en" lang="en" data-lang="en" aria-label="English"><span class="lbl-long">English</span><span class="lbl-short">EN</span></a>`) : '';

function header(title, withPres, navLinks){
  return `
<svg width="0" height="0" style="position:absolute" aria-hidden="true">
  <symbol id="star" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.6"><rect x="5" y="5" width="14" height="14"/><rect x="5" y="5" width="14" height="14" transform="rotate(45 12 12)"/></g></symbol>
</svg>
<header class="top">
  <div class="wrap">
    <a class="brand" href="#top"><svg style="color:var(--gold)"><use href="#star"/></svg>${title}</a>
    <nav class="nav" aria-label="${tr('أقسام الصفحة', 'Page sections')}">${navLinks}</nav>
    ${langLink()}
    <button class="btn icon-btn" id="themeBtn" type="button" aria-label="${tr('تبديل المظهر', 'Switch theme')}" title="${tr('تبديل المظهر', 'Switch theme')}">◐</button>
    ${withPres ? `<button class="btn gold" id="presBtn" type="button">▶ <span class="lbl-long">${tr('وضع العرض', 'Presentation')}</span></button>` : ''}
  </div>
</header>`;
}

/* ---------- structured data (schema.org JSON-LD); rendered into #app so the prerendered HTML carries it ---------- */
const SITE = 'https://masahif-al-maghrib.com/';
const plain = s => String(s||'').replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim();
const abs = (path, u) => /^https?:/.test(u) ? u : SITE + path + String(u).replace(/^\.\//,'');
const ldTag = o => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g,'\\u003c')}</script>`;
/* pages of the English version live under /en/; images are shared and stay at the Arabic paths */
const LSITE = SITE + (EN ? 'en/' : '');
const PERSON = {'@type':'Person','@id':SITE+'#author', name:AUTHOR.name, alternateName:tr('Ibrahim Hassani Idrissi', 'إبراهيم حسني إدريسي'), jobTitle:AUTHOR.role, url:LSITE+'about/',
  description:plain(CRED.bio[0]), address:{'@type':'PostalAddress', addressLocality:tr('فاس', 'Fez'), addressCountry:'MA'},
  hasCredential:{'@type':'EducationalOccupationalCredential', name:tr('شهادة التكوين في فن الخط', 'Certificate of Training in the Art of Calligraphy'), credentialCategory:tr('شهادة', 'certificate'), dateCreated:'2019', recognizedBy:{'@type':'CollegeOrUniversity', name:tr('جامعة القرويين', 'University of al-Qarawiyyin')}},
  award:CRED.award, knowsAbout:EN ? ['Maghribi script', 'Arabic calligraphy', 'Islamic manuscripts', 'Moroccan Qur’an manuscripts'] : ['الخط المغربي', 'الخط العربي', 'المخطوطات', 'المصاحف المغربية'],
  sameAs:['https://github.com/hibrh'].concat(waLink?[waLink]:[])};
const WEBSITE = {'@type':'WebSite','@id':LSITE+'#site', url:LSITE, name:SN, alternateName:'Masahif al-Maghrib: dated Qur\u2019an manuscripts of Morocco', inLanguage:LANG, author:{'@id':SITE+'#author'}, publisher:{'@id':SITE+'#author'}};
function ldEra(E){
  const era = ERAS.find(e=>e.key===E.key), url = LSITE + era.path;
  const plateUrl = p => p.url || abs(era.path, `plates/${p.f}.jpg`);
  const item = i => {
    const u = window.MS_PAGES ? url + i.id + '/' : url + '#' + i.id;
    const o = {'@type':'Manuscript','@id':window.MS_PAGES ? u + '#ms' : u, url:u, name:plain(i.title), genre:tr('مصحف', 'Qur’an manuscript'), inLanguage:'ar',
      description:plain([i.dateH, i.short].filter(Boolean).join(tr('، ', ', ')))};
    if (i.y0) o.dateCreated = i.y1 ? `${i.y0}/${i.y1}` : String(i.y0);
    if (i.plates && i.plates.length) o.image = i.plates.slice(0,4).map(plateUrl);
    if (i.links && i.links.length) o.sameAs = i.links.map(l=>l[1]).filter(u=>/^https?:/.test(u));
    return o;
  };
  const page = {'@type':'CollectionPage','@id':url+'#page', url, name:E.name, inLanguage:LANG,
    description:plain(E.card || E.sub), isPartOf:{'@id':LSITE+'#site'}, author:{'@id':SITE+'#author'},
    about:{'@type':'Thing', name:EN ? `Dated Qur’an manuscripts of the ${window.ERAS_EN_NAMES[era.key].gen} era` : 'المصاحف المخطوطة المؤرخة في '+E.name.replace(/^مصاحف /,'عصر ')},
    breadcrumb:{'@type':'BreadcrumbList', itemListElement:[{'@type':'ListItem',position:1,name:SN,item:LSITE},{'@type':'ListItem',position:2,name:E.name,item:url}]},
    mainEntity:{'@type':'ItemList', numberOfItems:E.items.length, itemListElement:E.items.map((i,k)=>({'@type':'ListItem', position:k+1, item:item(i)}))}};
  if (E.hero) page.primaryImageOfPage = {'@type':'ImageObject', url:abs(era.path, E.hero.f), caption:plain(E.hero.alt)};
  return ldTag({'@context':'https://schema.org','@graph':[WEBSITE, PERSON, page]});
}
function ldHub(ready){
  const page = {'@type':'CollectionPage','@id':LSITE+'#page', url:LSITE, name:SN, inLanguage:LANG, isPartOf:{'@id':LSITE+'#site'}, author:{'@id':SITE+'#author'},
    description:tr('المصاحف المؤرَّخة المعروفة الصاحب في عصور المغرب، من الأدارسة إلى العلويين: ما وصلنا منها وما ضاع، وما يُتصفَّح اليوم في مصدره.',
      'Dated Qur’ans of Morocco with a known copyist or patron, from the Idrisids to the Alaouites: the ones that survive, the ones that are lost, and the ones that can be browsed online today.'),
    hasPart:ready.map(e=>({'@type':'CollectionPage','@id':LSITE+e.path+'#page', url:LSITE+e.path, name:eraData(e.key).name}))};
  return ldTag({'@context':'https://schema.org','@graph':[WEBSITE, PERSON, page]});
}

/* ---------- English version: hub/<era>/data.en.js (ERAS_EN[key]) laid over the Arabic data; untranslated fields stay Arabic ---------- */
function localize(E){
  if (!EN || !E) return E;
  if (E._loc) return E._loc;
  const T = (window.ERAS_EN || {})[E.key];
  if (!T) return E;
  const R = T.era || {};
  const X = Object.assign({}, E, R);
  if (E.hero) X.hero = Object.assign({}, E.hero, R.hero || {});
  if (E.tl) X.tl = Object.assign({}, E.tl, {title:(R.tl || {}).title || E.tl.title, rulers:E.tl.rulers.map((r,k)=>Object.assign({}, r, (T.rulers || [])[k] || {}))});
  if (E.anat) { const A = R.anat || {}; X.anat = Object.assign({}, E.anat, A, {points:E.anat.points.map((p,k)=>Object.assign({}, p, (A.points || [])[k] || {}))}); }
  if (E.presEnd) X.presEnd = Object.assign({}, E.presEnd, R.presEnd || {});
  X.refs = T.refs || E.refs;
  const P = T.plates || {}, I = T.items || {};
  X.items = E.items.map(i => {
    const t = I[i.id] || {}, o = Object.assign({}, i);
    for (const k of ['title','short','tl','dateH','dateG','facts','prose','why','text','src','where','noPlates','journeyTitle','journey','ruler']) if (t[k] !== undefined) o[k] = t[k];
    if (i.links) o.links = i.links.map((l,k)=>[(t.links || [])[k] || l[0], l[1]]);
    if (i.colophon) o.colophon = Object.assign({}, i.colophon, t.colophon || {});
    o.plates = (i.plates || []).map(p => Object.assign({}, p, P[p.f] || {}));
    return o;
  });
  X._ordered = false;
  return (E._loc = X);
}
const eraData = k => localize(ERAS_DATA[k]);
/* names of an item in the other languages (English and French), shown under the title of its own page */
const altNames = (key, id) => { const t = (((window.ERAS_EN || {})[key] || {}).items || {})[id] || {}; return {en: t.title || '', fr: t.fr || ''}; };
const ARABIC_TITLE = (key, id) => { const i = ((ERAS_DATA[key] || {}).items || []).find(x => x.id === id); return i ? plain(i.title) : ''; };

/* ================= SHARED: item order, reign line, card markup ================= */
/* chronological order inside each group (surviving, edge, lost); numbers follow the displayed order */
function orderItems(E){
  if (E._ordered) return E.items;
  const mid = i => i.y1 ? (i.y0 + i.y1) / 2 : i.y0, GORD = {surviving:0, edge:1, lost:2};
  E.items.sort((a,b) => (GORD[a.group] - GORD[b.group]) || (mid(a) - mid(b)));
  let nn = 0; E.items.forEach(i => { if (i.group !== 'lost') i.num = ++nn; });
  E._ordered = true;
  return E.items;
}
/* the ruler in whose reign a Qur'an falls, from the timeline bars; i.ruler overrides ('' hides) */
function reignFn(E){
  const RUL = (E.tl && E.tl.rulers) || [];
  const gen = k => EN ? (k.full || k.n) : (k.full || k.n).replace(/^أبو /, 'أبي ');
  const rulerAt = y => RUL.findIndex((k, x) => y >= k.a && (y < k.b || (x === RUL.length - 1 && y <= k.b)));
  const rulerTo = y => RUL.findIndex(k => y > k.a && y <= k.b);
  return i => {
    if (i.ruler !== undefined) return i.ruler;
    const x0 = rulerAt(i.y0), x1 = i.y1 ? rulerTo(i.y1) : x0, r0 = RUL[x0], r1 = RUL[x1];
    if (!r0 || !r1 || x1 - x0 > 1 || r0.faint || r1.faint || !r0.n || !r1.n) return '';
    if (EN) return r0 === r1 ? `In the reign of ${gen(r0)}` : `In the reigns of ${gen(r0)} and ${gen(r1)}`;
    return r0 === r1 ? `في عهد ${gen(r0)}` : `في عهدي ${gen(r0)} و${gen(r1)}`;
  };
}
/* the plate shown as the item's sample: a written page; i.thumb names it, or '' when none of them is a text page */
const samplePlate = i => { const pl = i.plates || [], k = i.thumb === '' ? -1 : i.thumb ? pl.findIndex(p => p.f === i.thumb) : (pl.length ? 0 : -1); return k >= 0 ? {p:pl[k], k} : null; };
/* card of a lost Qur'an (inner HTML of article.lost) */
function lostHTML(i, reign, msLink){
  return `<div class="yr">${i.dateH}</div><h3>${i.title}</h3><div style="font-family:var(--ui);font-size:13px;color:var(--ink3);margin-bottom:8px">${i.dateG}${reign ? ' · ' + reign : ''}</div>${badges(i.status)}<p>${i.text}</p><div class="src">${tr('المصدر', 'Source')}: ${i.src}</div>${msLink ? `<a class="ms-link" href="${i.id}/">${tr('صفحة المصحف', 'Page of this Qur’an')} ${FWD}</a>` : ''}`;
}
/* everything in a surviving / edge card below its head: facts, prose, links, colophon, journey, samples or ruling */
function entryBodyHTML(i){
  const facts = i.facts.map(f=>`<dt>${f[0]}</dt><dd>${LAT(f[1])}</dd>`).join('');
  const prose = i.prose.map(p=>`<p>${p}</p>`).join('') + (i.why ? `<p class="why">${i.why}</p>` : '');
  const links = i.links && i.links.length ? `<div class="links">${i.links.map(l=>`<a href="${l[1]}" target="_blank" rel="noopener">${l[0]}</a>`).join('')}</div>` : '';
  let h = `<div class="entry-body"><dl class="facts">${facts}</dl><div class="prose">${prose}${links}</div></div>`;
  if (i.colophon) {
    const k = i.plates.findIndex(x=>x.f===i.colophon.plate), p = i.plates[k];
    h += `<div class="colophon"><figure data-open="${i.id}:${k}"><img loading="lazy" src="${p.url||`${PB}plates/${p.f}.jpg`}" alt="${p.t}"></figure><div class="tr"><h4>${i.colophon.title}</h4><p class="ar"${EN ? ' lang="ar" dir="rtl"' : ''}>${i.colophon.ar}</p>${EN && i.colophon.tr ? `<p class="en-tr">${i.colophon.tr}</p>` : ''}<p class="gl">${i.colophon.gl}</p></div></div>`;
  }
  if (i.journey) h += `<div class="journey"><h4>${i.journeyTitle||tr('رحلة المصحف', 'The journey of the manuscript')}</h4><div class="jsteps" style="--n:${i.journey.length}">${i.journey.map(j=>`<div class="jstep"><i></i><b>${j[0]}</b><span>${j[1]}</span></div>`).join('')}</div></div>`;
  if (i.plates && i.plates.length) {
    const strip = i.plates.map((p,k)=>{ const hh = p.w/p.h > 2.4 ? 150 : 240; return `<div class="plate" data-open="${i.id}:${k}" tabindex="0" role="button" aria-label="${tr('تكبير', 'Enlarge')}:${p.t}"><img loading="lazy" src="${p.turl||`${PB}plates/${p.f}-t.jpg`}" width="${Math.round(hh*p.w/p.h)}" height="${hh}" style="--h:${hh}px" alt="${p.t}"><div class="figcap"><b>${p.t}</b> · ${LAT(p.loc)}${aiNote(p)}</div></div>`; }).join('');
    h += `<div class="gallery"><div class="gal-title"><span>${tr('عينات من الكتابة عن قرب', 'Close-ups of the script')} (${i.plates.length})</span><span>${tr('اضغط للتكبير', 'Click to enlarge')} ${FWD}</span></div><div class="strip">${strip}</div></div>`;
  } else if (i.ruling) {
    h += EN ? `<div class="ruling">${rulingSVG(i.ruling,4.6)}<p><b>No samples here.</b> ${i.noPlates || 'The manuscript is not digitised, and we found no published image of it.'} The drawing shows the layout of the page: ${i.ruling.n ? lines(i.ruling.n) : 'number of lines not published'}${i.ruling.unknown ? ', dimensions not published' : ''}.</p></div>`
      : `<div class="ruling">${rulingSVG(i.ruling,4.6)}<p><b>لا عينات هنا.</b> ${i.noPlates || 'المصحف غير مرقمن، ولم نجد له صورة منشورة.'} ما تراه رسم لهيئة الصفحة: ${i.ruling.n ? lines(i.ruling.n) : 'عدد الأسطر غير منشور'}${i.ruling.unknown ? '، والمقاس غير منشور' : ''}.</p></div>`;
  }
  return h;
}

/* ================= ERA PAGE ================= */
function renderEra(E){
  const items = orderItems(E);
  const reignOf = reignFn(E);
  const msPages = !!window.MS_PAGES;
  const count = g => items.filter(i=>i.group===g).length;
  const heroFig = E.hero ? `<figure class="hero-fig"><div class="frame"><img src="${/^https?:/.test(E.hero.f) ? E.hero.f : PB + E.hero.f}" width="${E.hero.w}" height="${E.hero.h}" alt="${E.hero.alt}" ${E.hero.open?`data-open="${E.hero.open}"`:''}></div><figcaption>${LAT(E.hero.caption)}</figcaption></figure>`
    : `<figure class="hero-fig"><div class="frame" style="aspect-ratio:16/9;display:grid;place-items:center"><svg viewBox="0 0 200 120" width="70%" aria-hidden="true"><g fill="none" stroke="#c99c45" stroke-width="1.2" opacity=".8"><rect x="70" y="30" width="60" height="60"/><rect x="70" y="30" width="60" height="60" transform="rotate(45 100 60)"/><circle cx="100" cy="60" r="12"/></g></svg></div><figcaption>${E.heroNote||''}</figcaption></figure>`;
  const nav = [`<a href="#tally">${tr('الحصيلة', 'Overview')}</a>`, `<a href="#timeline">${tr('خط الزمن', 'Timeline')}</a>`, `<a href="#corpus">${tr('المصاحف', 'Qur’ans')}</a>`, E.hasScale!==false?`<a href="#scale">${tr('المقاسات', 'Sizes')}</a>`:'', E.anat?`<a href="#anatomy">${tr('تشريح الخط', 'Anatomy of the script')}</a>`:'', `<a href="#sources">${tr('المصادر', 'Sources')}</a>`].join('');
  const html = `${header(E.name, true, nav)}
${railHTML(E.key)}
<div class="hero" id="top"><div class="wrap">
  <div>
    ${projectLink()}
    <div class="eyebrow">${tr('دليل مصوَّر', 'An illustrated guide')} · ${E.range}</div>
    <h1>${E.name}</h1>
    <p class="sub">${E.sub}</p>
    <p class="lede">${E.lede}</p>
    <div class="hero-actions">
      <a class="btn solid" href="#corpus">${tr('تصفح المصاحف', 'Browse the Qur’ans')}</a>
      <button class="btn" type="button" data-pres>▶ ${tr('ابدأ العرض', 'Start the presentation')}</button>
      <a class="btn" href="#tally">${tr('الحصيلة في جدول', 'Overview table')}</a>
    </div>
  </div>
  ${heroFig}
</div></div>
<main>
  <section id="tally"><div class="wrap">
    <div class="sec-head"><div><div class="kicker">${tr('الحصيلة', 'Overview')}</div><h2>${star}${tr('ما الذي نعرفه؟', 'What do we know?')}</h2>
      <p>${EN ? `This guide lists ${en(items.length, 'Qur’an')} in three groups: those that survive and meet the criteria, those recorded in the sources and since lost, and those on the edge of the criteria.`
        : `في هذا الدليل ${agree(items.length, ['مصحف واحد', 'مصحفان', items.length+' مصاحف', items.length+' مصحفاً'])}، والمجموعات ثلاث: ما بقي ويستوفي الشرط، وما ذكرته المصادر ثم ضاع، وما يقف على حافة الشرط.`}</p></div></div>
    <div class="tally" id="tallyTiles"></div>
    <div class="criteria">
      ${EN ? `<div class="note"><h3>Criteria</h3><p>A Qur’an enters the first list when three things hold:</p><ul>
        <li><b>The date of copying is stated explicitly</b> in its colophon or endowment deed, not inferred from its style.</li>
        <li><b>Its owner is known</b>: the copyist, if named, or the person for whom or for whose library it was made.</li>
        <li>It was demonstrably copied <b>${E.realm}</b>.</li></ul>${E.criteriaNote?`<p style="margin-top:10px;font-size:16px;color:var(--ink2)">${E.criteriaNote}</p>`:''}</div>
      <div class="note"><h3>What the badges mean</h3><p style="font-size:16px">Each card carries three badges: does the Qur’an survive? Is it complete? Can it be browsed online?</p>
        <div class="legend"><span class="badge b-ok">Survives</span><span class="badge b-no">Lost</span><span class="badge b-ok">Complete</span><span class="badge b-part">Incomplete</span><span class="badge b-ok">Fully digitised</span><span class="badge b-part">Partial images</span><span class="badge b-no">Not digitised</span><span class="badge b-mut">Unknown</span></div></div>`
      : `<div class="note"><h3>شرط الدليل</h3><p>يدخل المصحف في القائمة الأولى إذا اجتمعت فيه ثلاثة أمور:</p><ul>
        <li>أن يكون <b>تاريخ نسخه مذكوراً صراحة</b> في خاتمته أو وقفيته، لا مستنتجاً من أسلوبه.</li>
        <li>أن يُعرف <b>صاحبه</b>: الناسخ إن ذُكر اسمه، أو من كُتب برسم خزانته أو له.</li>
        <li>أن يثبت أنه نُسخ <b>${E.realm}</b>.</li></ul>${E.criteriaNote?`<p style="margin-top:10px;font-size:16px;color:var(--ink2)">${E.criteriaNote}</p>`:''}</div>
      <div class="note"><h3>دلالة الشارات</h3><p style="font-size:16px">في كل بطاقة ثلاث شارات: هل بقي المصحف؟ هل وصل تاماً؟ هل يمكن تصفحه في الويب؟</p>
        <div class="legend"><span class="badge b-ok">باقٍ</span><span class="badge b-no">مفقود</span><span class="badge b-ok">تام</span><span class="badge b-part">ناقص</span><span class="badge b-ok">مرقمن كاملاً</span><span class="badge b-part">صور جزئية</span><span class="badge b-no">غير مرقمن</span><span class="badge b-mut">غير معلوم</span></div></div>`}
    </div>
    <div style="margin-top:26px" id="matrixWrap"></div>
  </div></section>
  <section id="timeline"><div class="wrap">
    <div class="sec-head"><div><div class="kicker">${tr('خط الزمن', 'Timeline')}</div><h2>${star}${E.tl.title}</h2>
      <p>${tr('الأشرطة عهود أبرز الحكام، والعلامات مواضع المصاحف. العلامة الممتلئة مصحف باقٍ، والمفرغة مصحف مفقود، والخط الأفقي مدة يُحصر فيها مصحف غير مؤرخ.', 'The bars are the reigns of the main rulers and the markers are the Qur’ans. A filled marker is a surviving Qur’an, a hollow one a lost Qur’an, and a horizontal line the span within which an undated Qur’an falls.')}</p></div></div>
    <div class="tl-scroll"><div class="tl" id="tl"></div></div>
    <div class="tl-hint">${tr('اضغط على أي علامة للانتقال إلى بطاقة المصحف. على الهاتف اسحب الخط أفقياً.', 'Click a marker to jump to its card. On a phone, swipe the timeline sideways.')}</div>
  </div></section>
  <section id="corpus"><div class="wrap">
    <div class="sec-head"><div><div class="kicker">${tr('المصاحف', 'The Qur’ans')}</div><h2>${star}${tr('البطاقات والعينات', 'Cards and samples')}</h2>
      <p>${tr('العينات مقاطع مقرَّبة من الكتابة نفسها، لا من الزخارف وصفحات الافتتاح. تُكبَّر كل عينة بالضغط عليها، ويمكن تقريبها وتحريكها، ومنها رابط إلى الصفحة كاملة في المكتبة التي تحفظ المصحف.', 'The samples are close-ups of the writing itself, not of the illumination or the opening pages. Click a sample to enlarge it; you can zoom and pan, and follow a link to the full page at the library that holds the manuscript.')}</p></div></div>
    <div class="filters" id="filters" role="group" aria-label="${tr('تصفية المصاحف', 'Filter the Qur’ans')}"></div>
    <div id="entries"></div>
  </div></section>
  ${E.hasScale!==false ? `<section id="scale"><div class="wrap">
    <div class="sec-head"><div><div class="kicker">${tr('المقاسات والمسطرة', 'Sizes and ruling')}</div><h2>${star}${tr('الصفحات على مقياس واحد', 'The pages at one scale')}</h2>
      <p>${tr('رُسمت الصفحات بنسبها الحقيقية وعلى مقياس واحد، وفي كل منها عدد أسطرها.', 'The pages are drawn in their true proportions and at one scale, each with its number of lines.')}</p></div></div>
    <div class="scale"><div class="scale-row" id="scaleRow"></div><div class="scale-foot">${tr('الإطار المتقطع لمقاس غير منشور، رُسم بنسبته التقريبية فقط.', 'A dashed frame marks unpublished dimensions, drawn only in approximate proportion.')}<span class="m-hint"> ${tr('اسحب الصفوف أفقياً لرؤية المصاحف كلها.', 'Swipe the rows sideways to see all the Qur’ans.')}</span></div></div>
  </div></section>` : ''}
  ${E.anat ? `<section id="anatomy"><div class="wrap">
    <div class="sec-head"><div><div class="kicker">${tr('تشريح الخط', 'Anatomy of the script')}</div><h2>${star}${E.anat.title}</h2><p>${E.anat.intro}</p></div></div>
    <div class="anat${E.anat.w/E.anat.h > 1.8 ? ' wide' : ''}"><div class="anat-scroll"><figure class="anat-fig" id="anatFig"><img src="${PB}${E.anat.f}" width="${E.anat.w}" height="${E.anat.h}" alt="${E.anat.alt}"></figure><p class="m-hint">${tr('اسحب الصورة أفقياً لرؤية الأسطر كاملة.', 'Swipe the image sideways to see the full lines.')}</p></div><ol class="anat-list" id="anatList"></ol></div>
  </div></section>` : ''}
  <section id="sources"><div class="wrap">
    <div class="sec-head"><div><div class="kicker">${tr('المصادر', 'Sources')}</div><h2>${star}${tr('المراجع وحقوق الصور', 'References and image rights')}</h2><p>${tr('كل معلومة في البطاقات مأخوذة من أحد هذه المصادر.', 'Every statement on the cards comes from one of these sources.')}${E.readNote?' '+E.readNote:''}</p></div></div>
    <ul class="refs" id="refs"></ul>
    <div class="note" style="margin-top:26px"><h3>${tr('حدود هذا الدليل', 'Limits of this guide')}</h3><p>${E.limits}</p></div>
    <p class="credits" id="credits"></p>
  </div></section>
</main>
<footer><div class="wrap"><div>${E.name} · ${E.footer}</div><div><a href="${ROOT || './'}">${tr('مصاحف المغرب: كل العصور', 'Masahif al-Maghrib: all eras')}</a></div>${byline()}</div></footer>
${commonOverlays()}${ldEra(E)}`;
  $('#app').innerHTML = html;

  /* tally + matrix */
  const surv = count('surviving'), lost = count('lost'), edge = count('edge'), dig = items.filter(i=>i.status.d==='ok').length;
  const tiles = EN ? [
    [surv, `surviving Qur’an${surv===1?'':'s'} meeting the criteria`],
    [lost, `Qur’an${lost===1?'':'s'} recorded in the sources, with no known trace today`],
    [edge, `Qur’an${edge===1?'':'s'} on the edge of the criteria, included for comparison`],
    [dig, `Qur’an${dig===1?'':'s'} whose surviving parts can be browsed in full at the source`]] : [
    [surv, agree(surv, ['مصحف باقٍ يستوفي الشرط','مصحفان باقيان يستوفيان الشرط','مصاحف باقية تستوفي الشرط','مصحفاً باقياً يستوفي الشرط'])],
    [lost, agree(lost, ['مصحف ذكرته المصادر ولا يُعرف له أثر','مصحفان ذكرتهما المصادر ولا يُعرف لهما أثر','مصاحف ذكرتها المصادر ولا يُعرف لها أثر','مصحفاً ذكرته المصادر ولا يُعرف له أثر'])],
    [edge, agree(edge, ['مصحف على حافة الشرط، أدرجناه للمقارنة','مصحفان على حافة الشرط، أدرجناهما للمقارنة','مصاحف على حافة الشرط، أدرجناها للمقارنة','مصحفاً على حافة الشرط، أدرجناها للمقارنة'])],
    [dig, agree(dig, ['مصحف يُتصفَّح ما بقي منه كاملاً في مصدره','مصحفان يُتصفَّح ما بقي منهما كاملاً في مصدره','مصاحف يُتصفَّح ما بقي منها كاملاً في مصدره','مصحفاً يُتصفَّح ما بقي منه كاملاً في مصدره'])]];
  $('#tallyTiles').innerHTML = tiles.map(t=>`<div class="tile"><div class="n">${t[0]}</div><div class="t">${t[1]}</div></div>`).join('');
  const dot = (cls,txt) => `<span class="dot ${cls}"><i></i>${txt}</span>`;
  const COL = EN ? ['Sample','Qur’an','Date','State','Completeness','Digitisation','Where today','Browse'] : ['نموذج','المصحف','التاريخ','الحال','التمام','الرقمنة','أين اليوم','تصفح'];
  let rows = '';
  for (const g of ['surviving','lost','edge']) {
    const list = items.filter(x=>x.group===g); if (!list.length) continue;
    rows += `<tr class="grp"><td colspan="8">${GROUPS[g]}</td></tr>`;
    for (const i of list) {
      const s = ST.s[i.status.s], c = ST.c[i.status.c], d = ST.d[i.status.d];
      const nil = i.status.s==='no' ? ' class="nil"' : '';
      const browse = i.links && i.links.length && i.status.d!=='no';
      const sp = samplePlate(i), pp = sp && sp.p, pk = sp ? sp.k : -1;
      const thumb = pp ? `<button type="button" class="mx-thumb" data-open="${i.id}:${pk}" aria-label="${tr('عينة', 'Sample')}: ${pp.t}" title="${pp.t}"><img loading="lazy" src="${pp.turl || `${PB}plates/${pp.f}-t.jpg`}" alt=""></button>` : '<span class="mx-none">—</span>';
      rows += `<tr><td class="mx-s${pp ? '' : ' nil'}" data-l="${COL[0]}">${thumb}</td><td class="name"><a href="#${i.id}">${i.short||i.title}<span class="mx-more">${tr('للمزيد عن المصحف', 'More about it')} ${FWD}</span></a></td>
        <td data-l="${COL[2]}">${i.dateH}<br><span style="color:var(--ink3)">${i.dateG}</span></td>
        <td data-l="${COL[3]}">${dot(s[0],s[1])}</td>
        <td data-l="${COL[4]}"${nil}>${i.status.s==='no' ? '—' : dot(c[0],c[1])}</td>
        <td data-l="${COL[5]}"${nil}>${i.status.s==='no' ? '—' : dot(d[0],d[1])}</td>
        <td data-l="${COL[6]}"${nil}>${i.where || (i.status.s==='no' ? tr('مفقود', 'Lost') : '—')}</td>
        <td data-l="${COL[7]}"${browse?'':' class="nil"'}>${browse ? `<a href="${i.links[0][1]}" target="_blank" rel="noopener">${tr('افتح', 'Open')} ↗</a>` : '—'}</td></tr>`;
    }
  }
  $('#matrixWrap').innerHTML = `<table class="matrix"><thead><tr>${COL.map((c,k)=>`<th${k ? '' : ' class="mx-s"'}>${c}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table>`;
  /* a card hidden by the active filter is shown before the link scrolls to it */
  $('#matrixWrap').addEventListener('click', e=>{ const a = e.target.closest('td.name a'); const t = a && document.getElementById(a.hash.slice(1)); if (t && t.closest('[hidden]')) setFilter('all'); });

  /* timeline */
  (function(){
    const T = E.tl, W = 1000, H = 300, x0 = 40, x1 = 940, A = T.a, B = T.b;
    /* time runs right to left in Arabic, left to right in English */
    const X = EN ? y => x0 + (y - A) / (B - A) * (x1 - x0) : y => x1 - (y - A) / (B - A) * (x1 - x0);
    let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${tr('خط زمني للمصاحف', 'Timeline of the Qur’ans')}">`;
    const step = T.step || 20;
    for (let y = Math.ceil(A/step)*step; y <= B; y += step) s += `<line x1="${X(y)}" x2="${X(y)}" y1="34" y2="${H-26}" stroke="var(--line)"/><text x="${X(y)}" y="${H-8}" font-size="12" text-anchor="middle" fill="var(--ink3)">${y}</text>`;
    T.rulers.forEach(k=>{
      const a = X(k.a), b = X(k.b), yy = 14;
      s += `<rect x="${Math.min(a,b)}" y="${yy}" width="${Math.abs(a-b)}" height="22" rx="4" fill="${k.faint?'var(--bg2)':'var(--bar)'}" stroke="var(--card)" stroke-width="1.5"/>`;
      s += k.below ? `<text x="${(a+b)/2}" y="${yy+36}" font-size="11.5" text-anchor="middle" fill="var(--ink2)">${k.n}</text>` : `<text x="${(a+b)/2}" y="${yy+15}" font-size="12" text-anchor="middle" fill="${k.faint?'var(--ink3)':'#f1e2bc'}">${k.n}</text>`;
    });
    const lanes = {surviving:96, edge:170, lost:244}, levels = [-14, 26, -30, 42], placed = {};
    const order = [...items].sort((a,b)=>(a.y1?(a.y0+a.y1)/2:a.y0)-(b.y1?(b.y0+b.y1)/2:b.y0));
    order.forEach(i=>{
      const ly = lanes[i.group];
      const col = i.group==='lost' ? 'var(--ink3)' : (i.group==='edge' ? 'var(--gold)' : 'var(--acc)');
      let g = `<g class="mk" tabindex="0" role="link" data-go="${i.id}"><title>${i.title} — ${i.dateH}</title>`;
      if (i.y1) g += `<line x1="${X(i.y0)}" x2="${X(i.y1)}" y1="${ly}" y2="${ly}" stroke="${col}" stroke-width="6" stroke-linecap="round" opacity=".5"/>`;
      const cx = i.y1 ? X((i.y0+i.y1)/2) : X(i.y0);
      g += `<circle cx="${cx}" cy="${ly}" r="7.5" fill="${i.status.s==='no'?'var(--card)':col}" stroke="${col}" stroke-width="2"/>`;
      const lane = placed[i.group] || (placed[i.group] = []);
      let lv = 0; while (lv < levels.length-1 && lane.some(p=>p.lv===lv && Math.abs(p.x-cx) < 78)) lv++;
      lane.push({x:cx, lv});
      g += `<text x="${cx}" y="${ly+levels[lv]}" font-size="11.5" text-anchor="middle" fill="var(--ink)">${i.tl}</text></g>`;
      s += g;
    });
    /* lane labels in the right margin (anchor "start" is the right edge in Arabic, "end" in English) */
    const la = EN ? 'end' : 'start';
    if (count('surviving')) s += `<text x="${W-4}" y="${lanes.surviving+4}" font-size="12" text-anchor="${la}" fill="var(--acc)">${tr('باقية', 'surviving')}</text>`;
    if (count('edge')) s += `<text x="${W-4}" y="${lanes.edge+4}" font-size="12" text-anchor="${la}" fill="var(--gold)">${tr('على الحافة', 'edge')}</text>`;
    if (count('lost')) s += `<text x="${W-4}" y="${lanes.lost+4}" font-size="12" text-anchor="${la}" fill="var(--ink3)">${tr('مفقودة', 'lost')}</text>`;
    $('#tl').innerHTML = s + '</svg>';
    $('#tl').addEventListener('click', e=>{ const g = e.target.closest('[data-go]'); if (g) goTo(g.dataset.go); });
    $('#tl').addEventListener('keydown', e=>{ const g = e.target.closest('[data-go]'); if (g && (e.key==='Enter'||e.key===' ')) { e.preventDefault(); goTo(g.dataset.go); } });
  })();

  /* entries */
  const box = $('#entries');
  for (const g of ['surviving','edge','lost']) {
    const list = items.filter(i=>i.group===g); if (!list.length) continue;
    box.appendChild(el('h3', {class:'group-title', 'data-group':g}, `${GROUPS[g]} <small>${list.length}</small>`));
    if (g==='lost') {
      const grid = el('div', {class:'lost-grid', 'data-group':g});
      for (const i of list) grid.appendChild(el('article', {class:'lost', id:i.id, 'data-group':g, 'data-s':i.status.s, 'data-d':i.status.d}, lostHTML(i, reignOf(i), msPages)));
      box.appendChild(grid); continue;
    }
    for (const i of list) {
      const a = el('article', {class:'entry', id:i.id, 'data-group':g, 'data-s':i.status.s, 'data-d':i.status.d});
      a.innerHTML = `<div class="entry-head"><div class="num"><span>${i.num}</span></div><div><h3>${i.title}</h3><div class="when"><b>${i.dateH}</b> · ${i.dateG}</div>${reignOf(i) ? `<div class="reign">${reignOf(i)}</div>` : ''}${msPages ? `<a class="ms-link" href="${i.id}/">${tr('صفحة المصحف', 'Page of this Qur’an')} ${FWD}</a>` : ''}</div>${badges(i.status)}</div>
        ${entryBodyHTML(i)}`;
      box.appendChild(a);
    }
  }
  const FILTERS = (EN ? [['all','All'],['surviving','Surviving'],['digital','Digitised'],['lost','Lost'],['edge','On the edge']] : [['all','الكل'],['surviving','الباقية'],['digital','المرقمنة'],['lost','المفقودة'],['edge','على الحافة']]).filter(f=>f[0]==='all'||f[0]==='digital'||count(f[0]));
  $('#filters').innerHTML = FILTERS.map(f=>`<button class="chip" type="button" data-f="${f[0]}" aria-pressed="${f[0]==='all'}">${f[1]}</button>`).join('');
  $('#filters').addEventListener('click', e=>{ const c = e.target.closest('.chip'); if (c) setFilter(c.dataset.f); });

  if (E.hasScale!==false) {
    const list = items.filter(i=>i.ruling).sort((a,b)=>(b.ruling.w*b.ruling.h)-(a.ruling.w*a.ruling.h));
    $('#scaleRow').innerHTML = list.map(i=>`<div class="scale-item">${rulingSVG(i.ruling,5)}<b>${i.short||i.title}</b><span>${i.ruling.unknown?tr('مقاس غير منشور', 'size not published'):i.ruling.w+' × '+i.ruling.h+tr(' سم', ' cm')} · ${i.ruling.n?lines(i.ruling.n):tr('الأسطر ؟', 'lines ?')}</span></div>`).join('');
  }

  if (E.anat) {
    const fig = $('#anatFig'), list = $('#anatList');
    E.anat.points.forEach((p,k)=>{
      fig.appendChild(el('button', {class:'hs', type:'button', style:`right:${100-p.x}%;top:${p.y}%`, 'aria-label':p.t, 'data-k':k}, String(k+1)));
      list.appendChild(el('li', {'data-k':k, tabindex:'0'}, `<span class="k">${k+1}</span><div><b>${p.t}</b><span>${p.d}</span></div>`));
    });
    const on = k => document.querySelectorAll('#anatFig .hs, #anatList li').forEach(n=>n.classList.toggle('on', n.dataset.k==k));
    fig.addEventListener('click', e=>{ const b = e.target.closest('.hs'); if (b) on(b.dataset.k); });
    /* on phones the wide image scrolls sideways: bring the chosen marker (and the image) into view */
    const show = k => {
      const b = fig.querySelector(`.hs[data-k="${k}"]`), sc = fig.parentElement; if (!b) return;
      if (sc && sc.scrollWidth > sc.clientWidth + 1) { const r = b.getBoundingClientRect(), s = sc.getBoundingClientRect(); sc.scrollBy({left:(r.left + r.width/2) - (s.left + s.width/2), behavior:'smooth'}); }
      const f = fig.getBoundingClientRect(); if (f.bottom < 70 || f.top > innerHeight - 70) fig.scrollIntoView({block:'center', behavior:'smooth'});
    };
    list.addEventListener('click', e=>{ const li = e.target.closest('li'); if (li) { on(li.dataset.k); show(li.dataset.k); } });
    list.addEventListener('keydown', e=>{ const li = e.target.closest('li'); if (li && (e.key==='Enter'||e.key===' ')) { e.preventDefault(); on(li.dataset.k); show(li.dataset.k); } });
    on(0);
  }
  $('#refs').innerHTML = E.refs.map(r=>`<li>${r}</li>`).join('');
  /* detection runs on the Arabic data, whose plate captions name the publications */
  const SRC = ERAS_DATA[E.key].items, fromPubs = SRC.some(i => (i.plates||[]).some(p => /عن (خبطة|بونجانينو|سجلماسي)/.test(p.loc || ''))), enhanced = SRC.some(i => (i.plates||[]).some(p => window.AI_ENH.has(p.f)));
  $('#credits').innerHTML = (E.credits === 'لا صور في هذه الصفحة.' || E.credits === 'No images on this page.' ? '' : E.credits) + (fromPubs ? tr(' وبعض الصور منقولة من دراسات منشورة، أغلبها بجودة منخفضة، للتعريف بمصاحف لم تُرقمن؛ ومصدر كل صورة مذكور تحتها، والحقوق لأصحابها والمكتبات التي تحفظ المخطوطات.', ' Some images are reproduced from published studies, mostly at low resolution, to introduce Qur’ans that have not been digitised; the source of each image is given under it, and the rights belong to their owners and to the libraries that hold the manuscripts.') : '') + (enhanced ? tr(' وحُسّنت جودة الصور الضعيفة بالذكاء الاصطناعي (Real-ESRGAN، ممزوجاً بتكبير عادي حتى لا تتغير صور الحروف)، وكل صورة محسّنة معلَّمة تحتها.', ' Weak images were enhanced with AI (Real-ESRGAN, blended with a plain enlargement so that the letter forms do not change), and each enhanced image is marked under it.') : '');

  setupLightbox(id => (items.find(x=>x.id===id)||{}).plates || [], id => items.find(x=>x.id===id));
  setupPresentation(E);
}

function goTo(id){ const t = document.getElementById(id); if (!t) return; if (t.closest('[hidden]')) setFilter('all'); t.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth', block:'start'}); }
function setFilter(f){
  document.querySelectorAll('#filters .chip').forEach(c=>c.setAttribute('aria-pressed', c.dataset.f===f));
  const match = a => f==='all' || (f==='digital' ? a.dataset.d==='ok' : a.dataset.group===f);
  document.querySelectorAll('#entries article').forEach(a=>{ a.hidden = !match(a); });
  document.querySelectorAll('#entries .lost-grid').forEach(g=>{ g.hidden = ![...g.children].some(a=>!a.hidden); });
  document.querySelectorAll('#entries .group-title').forEach(t=>{ t.hidden = ![...document.querySelectorAll(`#entries article[data-group="${t.dataset.group}"]`)].some(a=>!a.hidden); });
}

/* ================= MANUSCRIPT PAGE (one per item: <era>/<id>/) ================= */
/* title, description and preview image of a manuscript page; build_hub.ps1 reads these through the export page */
function msMeta(E, i){
  const era = ERAS.find(e=>e.key===E.key), url = LSITE + era.path + i.id + '/';
  const yr = (plain(i.dateH).match(EN ? /(\d{3,4}) ?AH/ : /(\d{3,4}) ?هـ/) || [])[1];
  /* <title>: search results show about 60 characters, so a long name gives way to the short one, then the era name is dropped */
  const fullName = plain(i.title), shortName = plain(i.short || '');
  const name = fullName.length > 50 && shortName && shortName.length < fullName.length ? shortName : fullName;
  const year = yr && !name.includes(yr) ? (EN ? `${yr} AH` : `${yr}هـ`) : '';
  const named = year ? (/\)$/.test(name) ? `${name}${tr('، ', ', ')}${year}` : `${name} (${year})`) : name;
  let title = `${named} | ${E.name}`;
  if (title.length > 65) title = named;
  if (title.length > 65) { title = title.slice(0, 62); title = title.slice(0, title.lastIndexOf(' ')) + '…'; }
  const body = plain(i.group === 'lost' ? i.text : (i.prose && i.prose[0]) || '');
  let desc = `${plain(i.title)}${tr('، ', ', ')}${plain(i.dateH)}${i.dateG ? ` (${plain(i.dateG)})` : ''}. ${body}`;
  if (desc.length > 230) { desc = desc.slice(0, 230); desc = desc.slice(0, desc.lastIndexOf(' ')) + '…'; }
  const sp = samplePlate(i), p = sp && sp.p, full = q => q.url || SITE + era.path + 'plates/' + q.f + '.jpg';
  return {era:E.key, id:i.id, url, title, desc, img: p ? full(p) : '', w: p ? p.w : 0, h: p ? p.h : 0, alt: p ? plain(`${i.title}: ${p.t}`) : '',
    images:(i.plates || []).map(full)};
}
function ldMs(E, i, m){
  const era = ERAS.find(e=>e.key===E.key), eraUrl = LSITE + era.path;
  const ms = {'@type':'Manuscript','@id':m.url+'#ms', url:m.url, name:plain(i.title), genre:tr('مصحف', 'Qur’an manuscript'), inLanguage:'ar', description:m.desc, isPartOf:{'@id':eraUrl+'#page'}};
  /* other names: the short title, the name in the other language and the French name */
  const alt = altNames(E.key, i.id), A = ARABIC_TITLE(E.key, i.id);
  const names = [i.short && i.short !== i.title ? plain(i.short) : '', EN ? A : alt.en, alt.fr].filter(Boolean);
  if (names.length) ms.alternateName = names;
  if (i.y0) ms.dateCreated = i.y1 ? `${i.y0}/${i.y1}` : String(i.y0);
  if (m.images.length) ms.image = m.images.slice(0,4);
  if (i.links && i.links.length) ms.sameAs = i.links.map(l=>l[1]).filter(u=>/^https?:/.test(u));
  const page = {'@type':'ItemPage','@id':m.url+'#page', url:m.url, name:plain(i.title), inLanguage:LANG, description:m.desc,
    isPartOf:{'@id':LSITE+'#site'}, author:{'@id':SITE+'#author'}, mainEntity:{'@id':m.url+'#ms'},
    breadcrumb:{'@type':'BreadcrumbList', itemListElement:[{'@type':'ListItem',position:1,name:SN,item:LSITE},{'@type':'ListItem',position:2,name:E.name,item:eraUrl},{'@type':'ListItem',position:3,name:plain(i.title),item:m.url}]}};
  if (m.img) page.primaryImageOfPage = {'@type':'ImageObject', url:m.img};
  return ldTag({'@context':'https://schema.org','@graph':[WEBSITE, PERSON, page, ms]});
}
function renderMs(E, id){
  const items = orderItems(E), reignOf = reignFn(E), i = items.find(x=>x.id===id);
  if (!i) return;
  const era = ERAS.find(e=>e.key===E.key), m = msMeta(E, i), reign = reignOf(i), sp = samplePlate(i);
  const blank = svg => `<figure class="hero-fig"><div class="frame ms-blank">${svg}</div><figcaption>${i.group==='lost' ? tr('مصحف ذكرته المصادر ولا يُعرف له أثر اليوم.', 'A Qur’an recorded in the sources, with no known trace today.') : tr('رسم لهيئة الصفحة، إذ لا نعرف صورة منشورة لهذا المصحف.', 'A drawing of the page layout: we know of no published image of this Qur’an.')}</figcaption></figure>`;
  const fig = sp ? `<figure class="hero-fig"><div class="frame"><img src="${sp.p.url || `${PB}plates/${sp.p.f}.jpg`}" width="${sp.p.w}" height="${sp.p.h}" alt="${sp.p.t}" data-open="${i.id}:${sp.k}"></div><figcaption><b>${sp.p.t}</b> · ${LAT(sp.p.loc)}${aiNote(sp.p)}</figcaption></figure>`
    : i.group==='lost' ? blank(`<svg viewBox="0 0 200 200" width="46%" aria-hidden="true"><g fill="none" stroke="#c99c45" stroke-width="2" stroke-dasharray="6 5" opacity=".8"><rect x="50" y="50" width="100" height="100"/><rect x="50" y="50" width="100" height="100" transform="rotate(45 100 100)"/></g><text x="100" y="108" text-anchor="middle" font-size="22" fill="#cbb88f" font-family="Noto Kufi Arabic">${tr('مفقود', 'Lost')}</text></svg>`)
    : i.ruling ? blank(rulingSVG(i.ruling, Math.min(9, 320 / Math.max(i.ruling.w, i.ruling.h)), {paper:'#efe4cc', ink:'#2a1f15', frame:'#c99c45'})) : '';
  const browse = i.links && i.links.length && i.status.d !== 'no' ? `<a class="btn solid" href="${i.links[0][1]}" target="_blank" rel="noopener">${i.links[0][0]} ↗</a>` : '';
  /* the name of this Qur'an in the other languages, under the title */
  const alt = altNames(E.key, i.id), others1 = (EN ? [alt.fr ? `<span lang="fr">${alt.fr}</span>` : '', `<span lang="ar" dir="rtl">${ARABIC_TITLE(E.key, i.id)}</span>`] : [alt.en ? `<span lang="en" dir="ltr">${alt.en}</span>` : '', alt.fr ? `<span lang="fr" dir="ltr">${alt.fr}</span>` : '']).filter(Boolean);
  const card = i.group==='lost'
    ? `<article class="entry" id="${i.id}"><div class="ms-status">${badges(i.status)}</div><div class="entry-body" style="grid-template-columns:1fr"><div class="prose"><p>${i.text}</p><p class="why">${tr('المصدر', 'Source')}: ${i.src}</p></div></div></article>`
    : `<article class="entry" id="${i.id}"><div class="ms-status">${badges(i.status)}</div>${entryBodyHTML(i)}</article>`;
  const k = items.indexOf(i), prev = items[k-1], next = items[k+1];
  const others = items.filter(x=>x!==i).map(x=>{ const s = samplePlate(x); return `<a class="ms-item" href="../${x.id}/"><span class="th">${s ? `<img loading="lazy" src="${s.p.turl || `${PB}plates/${s.p.f}-t.jpg`}" alt="">` : `<svg viewBox="0 0 24 24" width="26" height="26" style="color:var(--gold)"><use href="#star"/></svg>`}</span><span><b>${x.short||x.title}</b><span>${x.dateH}${x.group==='lost' ? ` · ${tr('مفقود', 'lost')}` : ''}</span></span></a>`; }).join('');
  const N = window.ERAS_EN_NAMES[E.key];
  const html = `${header(E.name, false, `<a href="#card">${tr('البطاقة', 'The card')}</a><a href="#more">${tr('مصاحف ' + era.gen, N.gen + ' Qur’ans')}</a>`)}
${railHTML(E.key)}
<div class="hero ms-hero" id="top"><div class="wrap">
  <div>
    ${projectLink()}
    <nav class="crumbs" aria-label="${tr('مسار الصفحة', 'Breadcrumb')}"><a href="${ROOT}">${SN}</a><span aria-hidden="true">${EN ? '›' : '‹'}</span><a href="../">${E.name}</a></nav>
    <div class="eyebrow">${GROUPS[i.group]}</div>
    <h1>${i.title}</h1>
    ${others1.length ? `<p class="alt-names">${others1.join(' · ')}</p>` : ''}
    <p class="sub"><b>${i.dateH}</b> · ${i.dateG}</p>
    ${reign ? `<p class="lede">${reign}</p>` : ''}
    <div class="hero-actions">${browse}<a class="btn" href="../#${i.id}">${tr('البطاقة في صفحة ' + E.name, 'The card on the ' + E.name + ' page')}</a></div>
  </div>
  ${fig}
</div></div>
<main>
  <section id="card"><div class="wrap"><h2 class="sr">${tr('بطاقة المصحف', 'The card')}</h2>${card}</div></section>
  <section id="more"><div class="wrap">
    <div class="sec-head"><div><div class="kicker">${E.name}</div><h2>${star}${tr('مصاحف أخرى من هذا العصر', 'Other Qur’ans of this era')}</h2></div></div>
    <div class="ms-pn">${prev ? `<a class="btn" href="../${prev.id}/">${BACK} ${prev.short||prev.title}</a>` : '<span></span>'}${next ? `<a class="btn" href="../${next.id}/">${next.short||next.title} ${FWD}</a>` : ''}</div>
    <div class="ms-list">${others}</div>
  </div></section>
</main>
<footer><div class="wrap"><div>${E.name} · ${E.footer}</div><div><a href="../">${E.name}</a> · <a href="${ROOT}">${tr('مصاحف المغرب: كل العصور', 'Masahif al-Maghrib: all eras')}</a></div>${byline()}</div></footer>
${commonOverlays()}${ldMs(E, i, m)}`;
  $('#app').innerHTML = html;
  setupLightbox(x => x===i.id ? (i.plates||[]) : [], x => x===i.id ? i : null);
}
/* the export page (build_hub.ps1) reads every manuscript page's metadata from here */
function exportItems(){
  const out = {lang:LANG, items:[], eras:[]};
  ERAS.filter(e=>ERAS_READY.includes(e.key) && ERAS_DATA[e.key]).forEach(e=>{
    const E = eraData(e.key);
    out.eras.push({key:e.key, name:plain(E.name), range:plain(E.range), card:plain(E.card), heroAlt:plain(E.hero ? E.hero.alt : ''), translated:!!(window.ERAS_EN || {})[e.key]});
    orderItems(E).forEach(i=>out.items.push(msMeta(E, i)));
  });
  const pre = el('pre', {id:'export'}); pre.textContent = JSON.stringify(out);
  $('#app').replaceChildren(pre);
}

/* ---------- lightbox ---------- */
function setupLightbox(platesOf, itemOf){
  const LB = {list:[], i:0, s:1, x:0, y:0, fit:1};
  const lb = $('#lb'), lbImg = $('#lbImg'), stage = $('#lbStage');
  const open = (id, k) => { const it = itemOf(id); if (!it) return; LB.list = platesOf(id).map(p=>({it, p})); if (!LB.list.length) return; LB.i = k; LB.ret = document.activeElement; track('open_sample', {manuscript: id, plate: (LB.list[k] && LB.list[k].p.f) || ''}); lb.classList.add('open'); document.body.style.overflow = 'hidden'; if (!(history.state && history.state.ov==='lb')) history.pushState({ov:'lb'}, ''); show(); $('#lbClose').focus(); };
  const show = () => { const {it, p} = LB.list[LB.i]; $('#lbTtl').textContent = `${it.short||it.title} · ${LB.i+1}/${LB.list.length}`; $('#lbCap').innerHTML = `<b>${p.t}</b>: ${LAT(p.c)}<small>${LAT(p.loc)}${aiNote(p)}</small>`; $('#lbSrc').href = p.src || '#'; $('#lbSrc').style.display = p.src ? '' : 'none'; lbImg.onload = fit; lbImg.src = p.url || `${it.base||PB}plates/${p.f}.jpg`; lbImg.alt = p.t; if (lbImg.complete && lbImg.naturalWidth) fit(); const v = LB.list.length>1 ? 'visible':'hidden'; $('#lbPrev').style.visibility = v; $('#lbNext').style.visibility = v; };
  const apply = () => { lbImg.style.transform = `translate(${LB.x}px,${LB.y}px) scale(${LB.s})`; };
  const fit = () => { const r = stage.getBoundingClientRect(), w = lbImg.naturalWidth, h = lbImg.naturalHeight; if (!w) return; LB.fit = Math.min((r.width-24)/w, (r.height-24)/h, 1.6); LB.s = LB.fit; LB.x = -w*LB.s/2; LB.y = -h*LB.s/2; apply(); };
  const zoomAt = (f, cx, cy) => { const r = stage.getBoundingClientRect(); const px = cx - r.left - r.width/2, py = cy - r.top - r.height/2; const ns = Math.max(LB.fit*0.6, Math.min(LB.s*f, 6)); const k = ns/LB.s; LB.x = px - (px - LB.x)*k; LB.y = py - (py - LB.y)*k; LB.s = ns; apply(); };
  const close = fromPop => { if (!lb.classList.contains('open')) return; lb.classList.remove('open'); document.body.style.overflow = ''; lbImg.removeAttribute('src'); if (LB.ret) LB.ret.focus({preventScroll:true}); if (fromPop !== true && history.state && history.state.ov==='lb') history.back(); };
  addEventListener('popstate', ()=>{ if (lb.classList.contains('open')) close(true); });
  const step = d => { LB.i = (LB.i + d + LB.list.length) % LB.list.length; show(); };
  document.addEventListener('click', e=>{ const t = e.target.closest('[data-open]'); if (t && !e.target.closest('.lb')) { const [id,k] = t.dataset.open.split(':'); open(id, +k); } });
  document.addEventListener('keydown', e=>{ if (e.key==='Enter' && e.target.matches && e.target.matches('.plate[data-open]')) { const [id,k] = e.target.dataset.open.split(':'); open(id,+k); } });
  $('#lbClose').onclick = ()=>close(); $('#lbPrev').onclick = ()=>step(-1); $('#lbNext').onclick = ()=>step(1); $('#lbFit').onclick = fit;
  $('#lbIn').onclick = ()=>{ const r = stage.getBoundingClientRect(); zoomAt(1.4, r.left+r.width/2, r.top+r.height/2); };
  $('#lbOut').onclick = ()=>{ const r = stage.getBoundingClientRect(); zoomAt(1/1.4, r.left+r.width/2, r.top+r.height/2); };
  stage.addEventListener('wheel', e=>{ e.preventDefault(); zoomAt(e.deltaY<0?1.15:1/1.15, e.clientX, e.clientY); }, {passive:false});
  stage.addEventListener('dblclick', e=>{ if (e.target.closest('.btn')) return; if (LB.s > LB.fit*1.3) fit(); else zoomAt(2.5, e.clientX, e.clientY); });
  const ptrs = new Map(); let pinch0 = 0, swipeX = null;
  stage.addEventListener('pointerdown', e=>{ if (e.target.closest('.btn')) return; stage.setPointerCapture(e.pointerId); ptrs.set(e.pointerId, {x:e.clientX, y:e.clientY}); swipeX = e.clientX; if (ptrs.size===2) { const [a,b] = [...ptrs.values()]; pinch0 = Math.hypot(a.x-b.x, a.y-b.y); } stage.classList.add('drag'); });
  stage.addEventListener('pointermove', e=>{ if (!ptrs.has(e.pointerId)) return; const prev = ptrs.get(e.pointerId), cur = {x:e.clientX, y:e.clientY}; ptrs.set(e.pointerId, cur);
    if (ptrs.size===2) { const [a,b] = [...ptrs.values()]; const d = Math.hypot(a.x-b.x, a.y-b.y); if (pinch0) zoomAt(d/pinch0, (a.x+b.x)/2, (a.y+b.y)/2); pinch0 = d; return; }
    if (LB.s > LB.fit*1.02) { LB.x += cur.x-prev.x; LB.y += cur.y-prev.y; apply(); } });
  const end = e=>{ if (!ptrs.has(e.pointerId)) return; ptrs.delete(e.pointerId); if (ptrs.size<2) pinch0 = 0; if (!ptrs.size) { stage.classList.remove('drag'); if (LB.s <= LB.fit*1.02 && swipeX!==null && Math.abs(e.clientX-swipeX) > 60) step((e.clientX > swipeX) !== EN ? 1 : -1); swipeX = null; } };
  stage.addEventListener('pointerup', end); stage.addEventListener('pointercancel', end);
  addEventListener('resize', ()=>{ if (lb.classList.contains('open')) fit(); });
  document.addEventListener('keydown', e=>{ if (!lb.classList.contains('open')) return; if (e.key==='Escape') close(); else if (e.key===(EN ? 'ArrowRight' : 'ArrowLeft')) step(1); else if (e.key===(EN ? 'ArrowLeft' : 'ArrowRight')) step(-1); else if (e.key==='+'||e.key==='=') $('#lbIn').click(); else if (e.key==='-') $('#lbOut').click(); });
}

/* ---------- presentation ---------- */
function setupPresentation(E){
  const items = E.items, SL = [{cover:true}];
  const order = [...items.filter(i=>i.group==='surviving'), ...items.filter(i=>i.group==='edge'), ...items.filter(i=>i.group==='lost')];
  for (const i of order) {
    if (i.group==='lost') { SL.push({item:i, lost:true}); continue; }
    if (!i.plates || !i.plates.length) { SL.push({item:i, info:true}); continue; }
    i.plates.forEach((p,k)=>SL.push({item:i, p, first:k===0}));
  }
  SL.push({end:true});
  let SI = 0; const pres = $('#pres'), slide = $('#slide');
  const n = g => items.filter(i=>i.group===g).length;
  const render = () => {
    const s = SL[SI];
    $('#presCount').textContent = `${SI+1} ${tr('من', 'of')} ${SL.length}`;
    $('#presProg').style.width = ((SI+1)/SL.length*100) + '%';
    slide.className = 'slide';
    if (s.cover) { slide.classList.add('cover'); slide.innerHTML = EN ? `<div class="txt"><div class="k">An illustrated guide · ${E.range}</div><h2>${E.name}</h2><p style="max-width:44ch">Dated Qur’ans with a known owner: ${n('surviving')} surviving that meet the criteria, ${n('lost')} recorded in the sources and lost, and ${n('edge')} on the edge of the criteria.</p><p class="d" style="margin-top:10px">Use the arrow keys or swipe to move on →</p></div>`
      : `<div class="txt"><div class="k">دليل مصوَّر · ${E.range}</div><h2>${E.name}</h2><p style="max-width:44ch">المصاحف المؤرخة المعروفة الصاحب: ${n('surviving')} باقية تستوفي الشرط، و${n('lost')} ذكرتها المصادر وضاعت، و${n('edge')} على حافة الشرط.</p><p class="d" style="margin-top:10px">← للتقدم استعمل الأسهم أو اسحب الشاشة</p></div>`; return; }
    if (s.end) { slide.classList.add('cover'); slide.innerHTML = `<div class="txt"><div class="k">${tr('الخلاصة', 'In sum')}</div><h2 style="font-size:clamp(30px,5vw,56px)">${E.presEnd.title}</h2><p style="max-width:52ch">${E.presEnd.text}</p></div>`; return; }
    const i = s.item, head = `<div class="k">${GROUPS[i.group]}</div><h2>${i.title}</h2><div class="d">${i.dateH} · ${i.dateG}</div>`;
    if (s.lost) { slide.innerHTML = `<div class="vis"><svg viewBox="0 0 200 200" width="180" height="180" aria-hidden="true"><g fill="none" stroke="#6b5c48" stroke-width="2" stroke-dasharray="6 5"><rect x="50" y="50" width="100" height="100"/><rect x="50" y="50" width="100" height="100" transform="rotate(45 100 100)"/></g><text x="100" y="108" text-anchor="middle" font-size="22" fill="#9a8a74" font-family="Noto Kufi Arabic">${tr('مفقود', 'Lost')}</text></svg></div><div class="txt">${head}<p>${i.text}</p><p style="font-size:15px;color:#a99a80">${tr('المصدر', 'Source')}: ${i.src}</p></div>`; return; }
    if (s.info) { slide.innerHTML = `<div class="vis">${i.ruling ? rulingSVG(i.ruling, 11, {paper:'#efe4cc', ink:'#2a1f15', frame:'#c99c45'}) : ''}</div><div class="txt">${head}${i.prose.map(p=>`<p>${p}</p>`).join('')}${i.why?`<p style="color:#e9c879">${i.why}</p>`:''}</div>`; return; }
    const p = s.p;
    slide.innerHTML = `<div class="vis"><img src="${p.url||`${PB}plates/${p.f}.jpg`}" alt="${p.t}"></div><div class="txt">${head}<p><b style="color:#f1e2bc">${p.t}.</b> ${LAT(p.c)}</p><p style="font-size:14px;color:#a99a80;font-family:var(--ui)">${LAT(p.loc)}${p.src ? ` · <a style="color:#e9c879" href="${p.src}" target="_blank" rel="noopener">${tr('الصفحة في المصدر', 'The page at the source')} ↗</a>` : ''}</p>${s.first && i.why ? `<p style="font-size:16px;color:#cbb88f">${i.why}</p>`:''}</div>`;
  };
  const openP = () => { SI = 0; track('start_presentation'); pres.classList.add('open'); document.body.style.overflow = 'hidden'; if (!(history.state && history.state.ov==='pres')) history.pushState({ov:'pres'}, ''); render(); $('#presNext').focus(); };
  const closeP = fromPop => { if (!pres.classList.contains('open')) return; pres.classList.remove('open'); document.body.style.overflow = ''; if (document.fullscreenElement) document.exitFullscreen(); if (fromPop !== true && history.state && history.state.ov==='pres') history.back(); };
  addEventListener('popstate', ()=>{ if (pres.classList.contains('open')) closeP(true); });
  const stepP = d => { SI = Math.max(0, Math.min(SL.length-1, SI+d)); render(); };
  const pb = $('#presBtn'); if (pb) pb.onclick = openP;
  document.querySelectorAll('[data-pres]').forEach(b=>b.onclick = openP);
  $('#presClose').onclick = ()=>closeP(); $('#presNext').onclick = ()=>stepP(1); $('#presPrev').onclick = ()=>stepP(-1);
  if (!document.fullscreenEnabled) $('#presFs').style.display = 'none';
  $('#presFs').onclick = ()=>{ if (!document.fullscreenElement) pres.requestFullscreen && pres.requestFullscreen(); else document.exitFullscreen(); };
  let px0 = null;
  slide.addEventListener('pointerdown', e=>{ px0 = e.clientX; });
  slide.addEventListener('pointerup', e=>{ if (px0!==null && Math.abs(e.clientX-px0) > 60) stepP((e.clientX > px0) !== EN ? 1 : -1); px0 = null; });
  const KF = EN ? 'ArrowRight' : 'ArrowLeft', KB = EN ? 'ArrowLeft' : 'ArrowRight';
  document.addEventListener('keydown', e=>{ if (!pres.classList.contains('open')) return; if (e.key==='Escape') closeP(); else if (e.key===KF || e.key===' ' || e.key==='PageDown') { e.preventDefault(); stepP(1); } else if (e.key===KB || e.key==='PageUp') { e.preventDefault(); stepP(-1); } });
  window.__openPres = openP; window.__stepPres = stepP;
}

/* ================= AUTHOR: card on the home page, and the about page (<lang root>/about/) ================= */
const waButton = (label) => `<a class="btn wa-btn" href="${waLink}" target="_blank" rel="noopener">${WA_ICON}${label}</a>`;
function authorCard(){
  return `<section id="author"><div class="wrap"><div class="author-card">
    <div><div class="kicker">${tr('عن المُعِدّ', 'About the author')}</div><h2>${AUTHOR.name}</h2><p class="role">${ROLE_LINE}</p>
      <p class="cred">${CRED.cert} · ${CRED.award}</p></div>
    <div class="author-actions"><a class="btn" href="${ABOUT()}">${tr('عن المُعِدّ', 'About the author')} ${FWD}</a>${waButton(tr('واتساب', 'WhatsApp'))}</div>
  </div></div></section>`;
}
function ldAbout(){
  const url = LSITE + 'about/';
  const page = {'@type':'ProfilePage','@id':url+'#page', url, name:tr('عن المُعِدّ: ', 'About the author: ') + AUTHOR.name, inLanguage:LANG,
    isPartOf:{'@id':LSITE+'#site'}, mainEntity:{'@id':SITE+'#author'},
    breadcrumb:{'@type':'BreadcrumbList', itemListElement:[{'@type':'ListItem',position:1,name:SN,item:LSITE},{'@type':'ListItem',position:2,name:tr('عن المُعِدّ', 'About the author'),item:url}]}};
  return ldTag({'@context':'https://schema.org','@graph':[WEBSITE, PERSON, page]});
}
function renderAbout(){
  const html = `${header(SN, false, '')}
${railHTML('about')}
<div class="hero ms-hero" id="top"><div class="wrap" style="grid-template-columns:1fr">
  <div>
    <nav class="crumbs" aria-label="${tr('مسار الصفحة', 'Breadcrumb')}"><a href="${ROOT || './'}">${SN}</a><span aria-hidden="true">${EN ? '›' : '‹'}</span><span>${tr('عن المُعِدّ', 'About the author')}</span></nav>
    <div class="eyebrow">${tr('عن المُعِدّ', 'About the author')}</div>
    <h1>${AUTHOR.name}</h1>
    <p class="sub">${ROLE_LINE}</p>
  </div>
</div></div>
<main>
  <section><div class="wrap about">
    <div class="about-bio">${CRED.bio.map(p => `<p>${p}</p>`).join('')}</div>
    <div class="note"><h3>${tr('الشهادة والجائزة', 'Certificate and award')}</h3><ul><li>${CRED.cert}</li><li>${CRED.award}</li><li>${CRED.shows}</li></ul></div>
    <div class="about-actions">${waButton(tr('التواصل عبر واتساب', 'Contact on WhatsApp'))}<a class="btn" href="${ROOT || './'}">${tr('تصفح مصاحف المغرب', 'Browse Masahif al-Maghrib')} ${FWD}</a></div>
  </div></section>
</main>
<footer><div class="wrap"><div>${SN}</div>${byline()}</div></footer>
${ldAbout()}`;
  $('#app').innerHTML = html;
}

/* ================= HUB ================= */
function renderHub(){
  /* the published home page carries its prerendered content and no era data, so it is not rendered again */
  if (document.getElementById('eras')) return;
  const ready = ERAS.filter(e=>ERAS_READY.includes(e.key) && ERAS_DATA[e.key]);
  /* the English hub sits in /en/, one level below the era folders that hold the images */
  const AR = window.ASSET_ROOT || '';
  const all = [];
  ready.forEach(e=>eraData(e.key).items.forEach(i=>all.push({e, i})));
  const cnt = (e,g) => ERAS_DATA[e.key] ? ERAS_DATA[e.key].items.filter(i=>i.group===g).length : 0;
  const cards = ERAS.map(e=>{
    const D = eraData(e.key), ok = ERAS_READY.includes(e.key) && D, N = window.ERAS_EN_NAMES[e.key];
    /* plates/hero-card.jpg: a 640 px copy of the era's hero made for this card (tools\make_og.ps1) */
    const band = ok && D.hero ? `<img src="${AR + e.path}plates/hero-card.jpg" alt="" loading="lazy" decoding="async">` : '';
    const counts = ok ? (EN ? `<div class="counts"><span class="badge b-ok">${cnt(e,'surviving')} surviving</span><span class="badge b-no">${cnt(e,'lost')} lost</span><span class="badge b-part">${cnt(e,'edge')} on the edge</span></div>`
      : `<div class="counts"><span class="badge b-ok">${cnt(e,'surviving')} باقية</span><span class="badge b-no">${cnt(e,'lost')} مفقودة</span><span class="badge b-part">${cnt(e,'edge')} على الحافة</span></div>`)
      : `<div class="counts"><span class="badge b-mut">${tr('قيد الإعداد', 'In preparation')}</span></div>`;
    return `<a class="era-card${ok?'':' soon'}" href="${e.path}" style="--c:${e.c}"><div class="band">${band}</div><div class="body"><h3>${D ? D.name : tr('مصاحف '+e.gen, N.gen+' Qur’ans')}</h3><div class="rng">${EN ? N.rng : e.rng}</div>${counts}<p>${D?D.card:''}</p></div><span class="go">${ok ? `${tr('افتح الصفحة', 'Open the page')} ${FWD}` : ''}</span></a>`;
  }).join('');
  const html = `${header(SN, false, `<a href="#eras">${tr('العصور', 'Eras')}</a><a href="#grand">${tr('خط الزمن', 'Timeline')}</a><a href="#method">${tr('الشرط', 'Criteria')}</a>`)}
${railHTML('hub')}
<div class="hero" id="top"><div class="wrap" style="grid-template-columns:1fr">
  <div>
    <div class="eyebrow">${tr('دليل مصوَّر · من الأدارسة إلى العلويين', 'An illustrated guide · from the Idrisids to the Alaouites')}</div>
    <h1>${SN}</h1>
    <p class="sub" style="max-width:46ch">${tr('المصاحف المؤرَّخة المعروفة الصاحب في عصور المغرب: ما وصلنا منها وما ضاع، وما يُتصفَّح اليوم في مصدره. لكل عصر صفحة مستقلة.', 'Dated Qur’an manuscripts of Morocco with a known copyist or patron: the ones that survive, the ones that are lost, and the ones that can be browsed online today. Each era has a page of its own.')}</p>
    <div class="hero-actions"><a class="btn solid" href="#eras">${tr('العصور', 'The eras')}</a><a class="btn" href="#grand">${tr('خط الزمن الجامع', 'The combined timeline')}</a></div>
  </div>
</div></div>
<main>
  <section id="eras"><div class="wrap">
    <div class="sec-head"><div><div class="kicker">${tr('العصور', 'Eras')}</div><h2>${star}${tr('صفحة لكل عصر', 'A page for each era')}</h2><p>${tr('في كل صفحة جدول بحال المصاحف، وخط زمني على عهود الحكام، وبطاقات فيها عينات مقرَّبة من الكتابة، ووضع عرض للتقديم.', 'Each page has a table of the Qur’ans and their state, a timeline set against the reigns of the rulers, cards with close-up samples of the script, and a presentation mode.')}</p></div></div>
    <div class="eras">${cards}</div>
  </div></section>
  <section id="grand"><div class="wrap">
    <div class="sec-head"><div><div class="kicker">${tr('خط الزمن الجامع', 'Combined timeline')}</div><h2>${star}${tr('كل المصاحف على خط واحد', 'All the Qur’ans on one line')}</h2><p>${tr('الأشرطة مدد الدول، والعلامات المصاحف المدرجة في الصفحات الجاهزة. العلامة الممتلئة مصحف باقٍ، والمفرغة مفقود. اضغط على علامة لفتح بطاقتها.', 'The bars are the dynasties and the markers the Qur’ans listed on the era pages. A filled marker is a surviving Qur’an, a hollow one a lost Qur’an. Click a marker to open its page.')}</p></div></div>
    <div class="tl-scroll"><div class="tl" id="gtl" style="min-width:1100px"></div></div><div class="tl-hint">${tr('اضغط على أي علامة لفتح بطاقتها. على الهاتف اسحب الخط أفقياً.', 'Click a marker to open its page. On a phone, swipe the timeline sideways.')}</div>
  </div></section>
  <section id="method"><div class="wrap">
    <div class="sec-head"><div><div class="kicker">${tr('الشرط', 'Criteria')}</div><h2>${star}${tr('ماذا يدخل في الدليل؟', 'What goes into the guide?')}</h2></div></div>
    ${EN ? `<div class="criteria"><div class="note"><h3>Criteria for the first list of each era</h3><ul>
      <li><b>The date of copying is stated explicitly</b> in the colophon or the endowment deed.</li>
      <li><b>The owner is known</b>: the copyist, or the person for whom or for whose library the Qur’an was made.</li>
      <li>It was demonstrably copied <b>in the lands of that dynasty</b>.</li></ul>
      <p style="margin-top:10px;font-size:16px;color:var(--ink2)">Each page has two further sections: Qur’ans recorded in the sources and since lost, and well-known Qur’ans on the edge of the criteria, with what each of them lacks.</p></div>
      <div class="note"><h3>The samples</h3><p style="font-size:17px">The samples are close-ups of the writing itself, taken from Qur’ans digitised by their libraries, from images published under an open licence, or, for Qur’ans with no digitised copy, from studies and books that published them, with the source named under each image. Weak images were enhanced with AI and are marked as such.</p></div></div>`
    : `<div class="criteria"><div class="note"><h3>شرط القائمة الأولى في كل عصر</h3><ul>
      <li>أن يكون <b>تاريخ نسخ المصحف مذكوراً صراحة</b> في خاتمته أو وقفيته.</li>
      <li>أن يُعرف <b>صاحبه</b>: الناسخ، أو من كُتب له أو برسم خزانته.</li>
      <li>أن يثبت أنه نُسخ <b>في بلاد تلك الدولة</b>.</li></ul>
      <p style="margin-top:10px;font-size:16px;color:var(--ink2)">وفي كل صفحة قسمان آخران: مصاحف ذكرتها المصادر ثم ضاعت، ومصاحف مشهورة تقف على حافة الشرط، مع بيان ما ينقصها.</p></div>
      <div class="note"><h3>العينات</h3><p style="font-size:17px">العينات مقاطع مقرَّبة من الكتابة نفسها، مأخوذة من المصاحف المرقمنة في مكتباتها، أو من صور منشورة بترخيص مفتوح، أو من الدراسات والكتب التي نشرت صور المصاحف غير المرقمنة، ومصدر كل صورة مذكور تحتها. وما حُسّنت جودته بالذكاء الاصطناعي معلَّم بذلك.</p></div></div>`}
  </div></section>
  ${authorCard()}
</main>
<footer><div class="wrap"><div>${SN} · ${window.HUB_FOOTER||''}</div><div><a href="https://hibrh.github.io/khizanat-almuwahhidin/">${tr('خزانة الموحدين', 'Khizanat al-Muwahhidin (in Arabic)')}</a></div>${byline()}</div></footer>${ldHub(ready)}`;
  $('#app').innerHTML = html;

  /* grand timeline: time runs right to left in Arabic, left to right in English */
  /* the scale runs to the end of the latest era (the Alaouites reach the present), rounded up to 50 years */
  const W = 1200, H = 260, x0 = 30, x1 = 1170, A = 780, B = Math.max(1920, Math.ceil(Math.max(...ERAS.map(e => e.b)) / 50) * 50);
  const X = EN ? y => x0 + (y - A) / (B - A) * (x1 - x0) : y => x1 - (y - A) / (B - A) * (x1 - x0);
  let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${tr('خط زمني جامع', 'Combined timeline')}">`;
  for (let y = 800; y < B; y += 50) s += `<line x1="${X(y)}" x2="${X(y)}" y1="20" y2="${H-24}" stroke="var(--line)"/><text x="${X(y)}" y="${H-6}" font-size="12" text-anchor="middle" fill="var(--ink3)">${y}</text>`;
  ERAS.forEach((e,k)=>{ const a = X(e.a), b = X(e.b), yy = 24 + (k%2)*28; s += `<rect x="${Math.min(a,b)}" y="${yy}" width="${Math.abs(a-b)}" height="22" rx="4" fill="${e.c}" opacity="${ERAS_READY.includes(e.key)?.95:.35}"/><text x="${(a+b)/2}" y="${yy+15}" font-size="12" text-anchor="middle" fill="#fff">${eraName(e)}</text>`; });
  const lanes = {surviving:120, edge:165, lost:205};
  all.forEach(({e,i})=>{ const cx = i.y1 ? X((i.y0+i.y1)/2) : X(i.y0), ly = lanes[i.group];
    s += `<a href="${e.path}${window.MS_PAGES ? i.id + '/' : '#' + i.id}"><title>${i.title} — ${i.dateH}</title><circle cx="${cx}" cy="${ly}" r="6.5" fill="${i.status.s==='no'?'var(--card)':e.c}" stroke="${e.c}" stroke-width="2"/></a>`; });
  const la = EN ? 'end' : 'start';
  s += `<text x="${W-2}" y="${lanes.surviving+4}" font-size="12" text-anchor="${la}" fill="var(--ink2)">${tr('باقية', 'surviving')}</text><text x="${W-2}" y="${lanes.edge+4}" font-size="12" text-anchor="${la}" fill="var(--ink2)">${tr('على الحافة', 'edge')}</text><text x="${W-2}" y="${lanes.lost+4}" font-size="12" text-anchor="${la}" fill="var(--ink2)">${tr('مفقودة', 'lost')}</text>`;
  $('#gtl').innerHTML = s + '</svg>';
}

/* ---------- analytics (GA4 events; no-ops until build_hub puts the gtag snippet in the page) ---------- */
const track = (name, params={}) => { if (typeof window.gtag === 'function') window.gtag('event', name, Object.assign({era: window.ERA_KEY}, params)); };
function setupTracking(){
  document.addEventListener('click', e=>{
    const a = e.target.closest('a[href^="http"]'); if (!a || a.host === location.host) return;
    const art = a.closest('article[id]'), row = a.closest('tr'), nm = row && row.querySelector('td.name a');
    const ms = art ? art.id : nm ? nm.hash.slice(1) : (window.MS_ID || '');
    if (/wa\.me/.test(a.host)) track('contact_whatsapp', {manuscript: ms});
    else track('open_source', {manuscript: ms, link_domain: a.hostname, link_url: a.href});
  });
}

/* ---------- language: the header button remembers the reader's choice, and the home page then opens in that language.
   Other pages always open in the language of their link, so shared links and search results are never redirected. ---------- */
function setupLang(){
  if (!window.ALT_URL) return;
  document.addEventListener('click', e=>{ const a = e.target.closest('[data-lang]'); if (a) { try { localStorage.setItem('mm-lang', a.dataset.lang); } catch(_) {} } });
  if (window.ERA_KEY !== 'hub') return;
  let pref = null; try { pref = localStorage.getItem('mm-lang'); } catch(e) {}
  if (pref && pref !== LANG) location.replace(window.ALT_URL);
}

/* ---------- theme ---------- */
function setupTheme(){
  const root = document.documentElement; let saved = null;
  try { saved = localStorage.getItem('mm-theme'); } catch(e) {}
  if (saved) root.dataset.theme = saved;
  const b = $('#themeBtn'); if (!b) return;
  b.onclick = ()=>{ const dark = root.dataset.theme ? root.dataset.theme==='dark' : matchMedia('(prefers-color-scheme: dark)').matches; root.dataset.theme = dark ? 'light' : 'dark'; try { localStorage.setItem('mm-theme', root.dataset.theme); } catch(e) {} };
}

document.addEventListener('DOMContentLoaded', ()=>{
  const key = window.ERA_KEY;
  if (key==='hub') renderHub(); else if (key==='about') renderAbout(); else if (key==='__export') exportItems(); else if (window.MS_ID) renderMs(eraData(key), window.MS_ID); else renderEra(eraData(key));
  setupTheme(); setupTracking(); setupLang();
  /* after the first paint, so the layout is not forced while the page is still being built */
  requestAnimationFrame(()=>{
    const cur = document.querySelector('.rail [aria-current]'); if (cur && !cur.classList.contains('home') && cur.scrollIntoView) cur.scrollIntoView({block:'nearest', inline:'center'});
    if (location.hash) { const t = document.getElementById(location.hash.slice(1)); if (t) setTimeout(()=>t.scrollIntoView(), 60); }
  });
});
})();
