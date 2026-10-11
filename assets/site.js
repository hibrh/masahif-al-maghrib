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
  {key:'alawi',      name:'العلويون',   gen:'العلويين',   rng:'1076–1330هـ / 1666–1912م', a:1666, b:1912, c:'#6d3a7d', path:'alawi/'},
];
window.ERAS_READY = window.ERAS_READY || [];

(function(){
const $ = (s, r=document) => r.querySelector(s);
const el = (tag, attrs={}, html='') => { const e = document.createElement(tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (html) e.innerHTML = html; return e; };
const LAT = s => String(s).replace(/(Cod\.arab\. \d+|Arabe \d+|K \d{3,4}|QUR \d+|ms\. ?[A-Z]?\.? ?\d+[\w./-]*|R\. ?\d+|Or\. ?\d+|Met \d+\.\d+|O\. ?Bj\. ?\d+|O\. ?Vet\. ?\d+|Mscr\.Dresd\.Ea\.\d+|RES\/\d+|A \d{4}|\d{4}\.\d+|Gallica|IIIF|BSB|BnF|MDZ)/g, '<bdi dir="ltr">$1</bdi>');
const ST = {
  s:{ok:['b-ok','باقٍ'], no:['b-no','مفقود']},
  c:{ok:['b-ok','تام'], part:['b-part','ناقص'], unk:['b-mut','التمام غير معلوم']},
  d:{ok:['b-ok','مرقمن كاملاً'], part:['b-part','صور جزئية'], no:['b-no','غير مرقمن']},
};
const GROUPS = {surviving:'باقية تستوفي الشرط', lost:'ذكرتها المصادر وضاعت', edge:'على حافة الشرط'};
const badges = st => { const keys = st.s==='no' ? ['s'] : ['s','c','d']; return `<div class="badges">${keys.map(k=>{ const v = ST[k][st[k]]; return `<span class="badge ${v[0]}">${v[1]}</span>`; }).join('')}</div>`; };
const star = '<svg class="star"><use href="#star"/></svg>';
/* Arabic number agreement: f = [one, two, 3–10 (and 0), 11–99] */
const agree = (n, f) => n===1 ? f[0] : n===2 ? f[1] : (n%100>=11 && n%100<=99) ? f[3] : f[2];
const lines = n => n===1 ? 'سطر واحد' : n===2 ? 'سطران' : `${n} ${agree(n, ['','','أسطر','سطراً'])}`;
const ROOT = window.ROOT || '';
/* site credit, shown at the foot of every page; wa = WhatsApp number in international format, digits only */
const AUTHOR = {name:'إبراهيم حسني إدريسي', role:'خطاط ومدرّس خطوط عربية من فاس', wa:'212661769161'};
const waLink = AUTHOR.wa ? `https://wa.me/${AUTHOR.wa}` : '';
const byline = () => `<div class="byline"><span>إعداد ${waLink ? `<a href="${waLink}" target="_blank" rel="noopener">${AUTHOR.name}</a>` : `<b>${AUTHOR.name}</b>`}، ${AUTHOR.role}</span>${waLink ? `<a class="wa" href="${waLink}" target="_blank" rel="noopener" aria-label="مراسلة على واتساب"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.2a9.8 9.8 0 0 0-8.4 14.8L2.3 21.7l4.8-1.3A9.8 9.8 0 1 0 12 2.2Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M8.6 7.4c.3-.3.8-.3 1 .1l.8 1.8c.1.3 0 .6-.2.8l-.6.6a6.6 6.6 0 0 0 3.6 3.6l.6-.6c.2-.2.5-.3.8-.2l1.8.8c.4.2.4.7.1 1-.9 1-2.2 1.3-3.4.8a10.4 10.4 0 0 1-5.3-5.3c-.5-1.2-.2-2.5.8-3.4Z" fill="currentColor"/></svg>واتساب</a>` : ''}</div>`;

function railHTML(current){
  const chips = ERAS.map(e => {
    const ready = ERAS_READY.includes(e.key);
    const cur = e.key===current ? ' aria-current="page"' : '';
    return `<a href="${ROOT}${e.path}" class="${ready?'':'soon'}" style="--c:${e.c}"${cur}><i></i>${e.name}</a>`;
  }).join('');
  return `<nav class="rail" aria-label="عصور المغرب"><div class="wrap"><a class="home" href="${ROOT || './'}"${current==='hub'?' aria-current="page"':''}>مصاحف المغرب</a>${chips}</div></nav>`;
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
<div class="lb" id="lb" role="dialog" aria-modal="true" aria-label="عارض اللوحة">
  <div class="lb-bar">
    <span class="ttl" id="lbTtl"></span>
    <button class="btn icon-btn" type="button" id="lbIn" aria-label="تكبير">＋</button>
    <button class="btn icon-btn" type="button" id="lbOut" aria-label="تصغير">－</button>
    <button class="btn" type="button" id="lbFit">ملء</button>
    <a class="btn" id="lbSrc" target="_blank" rel="noopener"><span class="lbl-long">في المصدر </span>↗</a>
    <button class="btn icon-btn" type="button" id="lbClose" aria-label="إغلاق">✕</button>
  </div>
  <div class="lb-stage" id="lbStage">
    <img id="lbImg" alt="">
    <button class="btn icon-btn lb-nav lb-prev" type="button" id="lbPrev" aria-label="السابقة">›</button>
    <button class="btn icon-btn lb-nav lb-next" type="button" id="lbNext" aria-label="التالية">‹</button>
  </div>
  <div class="lb-cap" id="lbCap"></div>
</div>
<div class="pres" id="pres" role="dialog" aria-modal="true" aria-label="وضع العرض">
  <div class="pres-top">
    <span id="presCount"></span><span class="sp"></span>
    <button class="btn" type="button" id="presFs">ملء الشاشة</button>
    <button class="btn icon-btn" type="button" id="presClose" aria-label="إغلاق">✕</button>
  </div>
  <div class="pres-prog"><i id="presProg"></i></div>
  <div class="slide" id="slide"></div>
  <div class="pres-nav">
    <button class="btn" type="button" id="presPrev">› السابق</button>
    <button class="btn" type="button" id="presNext">التالي ‹</button>
  </div>
</div>`;
}

function header(title, withPres, navLinks){
  return `
<svg width="0" height="0" style="position:absolute" aria-hidden="true">
  <symbol id="star" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.6"><rect x="5" y="5" width="14" height="14"/><rect x="5" y="5" width="14" height="14" transform="rotate(45 12 12)"/></g></symbol>
</svg>
<header class="top">
  <div class="wrap">
    <a class="brand" href="#top"><svg style="color:var(--gold)"><use href="#star"/></svg>${title}</a>
    <nav class="nav" aria-label="أقسام الصفحة">${navLinks}</nav>
    <button class="btn icon-btn" id="themeBtn" type="button" aria-label="تبديل المظهر" title="تبديل المظهر">◐</button>
    ${withPres ? '<button class="btn gold" id="presBtn" type="button">▶ <span class="lbl-long">وضع العرض</span></button>' : ''}
  </div>
</header>`;
}

/* ---------- structured data (schema.org JSON-LD); rendered into #app so the prerendered HTML carries it ---------- */
const SITE = 'https://hibrh.github.io/masahif-al-maghrib/';
const plain = s => String(s||'').replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim();
const abs = (path, u) => /^https?:/.test(u) ? u : SITE + path + String(u).replace(/^\.\//,'');
const ldTag = o => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g,'\\u003c')}</script>`;
const PERSON = {'@type':'Person','@id':SITE+'#author', name:AUTHOR.name, alternateName:'Ibrahim Hassani Idrissi', jobTitle:AUTHOR.role, address:{'@type':'PostalAddress', addressLocality:'فاس', addressCountry:'MA'}, sameAs:['https://github.com/hibrh'].concat(waLink?[waLink]:[])};
const WEBSITE = {'@type':'WebSite','@id':SITE+'#site', url:SITE, name:'مصاحف المغرب', alternateName:'Masahif al-Maghrib: dated Qur\u2019an manuscripts of Morocco', inLanguage:'ar', author:{'@id':SITE+'#author'}, publisher:{'@id':SITE+'#author'}};
function ldEra(E){
  const era = ERAS.find(e=>e.key===E.key), url = SITE + era.path;
  const plateUrl = p => p.url || abs(era.path, `plates/${p.f}.jpg`);
  const item = i => {
    const o = {'@type':'Manuscript','@id':url+'#'+i.id, url:url+'#'+i.id, name:plain(i.title), genre:'مصحف', inLanguage:'ar',
      description:plain([i.dateH, i.short].filter(Boolean).join('، '))};
    if (i.y0) o.dateCreated = i.y1 ? `${i.y0}/${i.y1}` : String(i.y0);
    if (i.plates && i.plates.length) o.image = i.plates.slice(0,4).map(plateUrl);
    if (i.links && i.links.length) o.sameAs = i.links.map(l=>l[1]).filter(u=>/^https?:/.test(u));
    return o;
  };
  const page = {'@type':'CollectionPage','@id':url+'#page', url, name:E.name, inLanguage:'ar',
    description:plain(E.card || E.sub), isPartOf:{'@id':SITE+'#site'}, author:{'@id':SITE+'#author'},
    about:{'@type':'Thing', name:'المصاحف المخطوطة المؤرخة في '+E.name.replace(/^مصاحف /,'عصر ')},
    breadcrumb:{'@type':'BreadcrumbList', itemListElement:[{'@type':'ListItem',position:1,name:'مصاحف المغرب',item:SITE},{'@type':'ListItem',position:2,name:E.name,item:url}]},
    mainEntity:{'@type':'ItemList', numberOfItems:E.items.length, itemListElement:E.items.map((i,k)=>({'@type':'ListItem', position:k+1, item:item(i)}))}};
  if (E.hero) page.primaryImageOfPage = {'@type':'ImageObject', url:abs(era.path, E.hero.f), caption:plain(E.hero.alt)};
  return ldTag({'@context':'https://schema.org','@graph':[WEBSITE, PERSON, page]});
}
function ldHub(ready){
  const page = {'@type':'CollectionPage','@id':SITE+'#page', url:SITE, name:'مصاحف المغرب', inLanguage:'ar', isPartOf:{'@id':SITE+'#site'}, author:{'@id':SITE+'#author'},
    description:'المصاحف المؤرَّخة المعروفة الصاحب في عصور المغرب، من الأدارسة إلى العلويين: ما وصلنا منها وما ضاع، وما يُتصفَّح اليوم في مصدره.',
    hasPart:ready.map(e=>({'@type':'CollectionPage','@id':SITE+e.path+'#page', url:SITE+e.path, name:ERAS_DATA[e.key].name}))};
  return ldTag({'@context':'https://schema.org','@graph':[WEBSITE, PERSON, page]});
}

/* ================= ERA PAGE ================= */
function renderEra(E){
  const items = E.items;
  const count = g => items.filter(i=>i.group===g).length;
  const heroFig = E.hero ? `<figure class="hero-fig"><div class="frame"><img src="${E.hero.f}" width="${E.hero.w}" height="${E.hero.h}" alt="${E.hero.alt}" ${E.hero.open?`data-open="${E.hero.open}"`:''}></div><figcaption>${LAT(E.hero.caption)}</figcaption></figure>`
    : `<figure class="hero-fig"><div class="frame" style="aspect-ratio:16/9;display:grid;place-items:center"><svg viewBox="0 0 200 120" width="70%" aria-hidden="true"><g fill="none" stroke="#c99c45" stroke-width="1.2" opacity=".8"><rect x="70" y="30" width="60" height="60"/><rect x="70" y="30" width="60" height="60" transform="rotate(45 100 60)"/><circle cx="100" cy="60" r="12"/></g></svg></div><figcaption>${E.heroNote||''}</figcaption></figure>`;
  const nav = ['<a href="#tally">الحصيلة</a>','<a href="#timeline">خط الزمن</a>','<a href="#corpus">المصاحف</a>', E.hasScale!==false?'<a href="#scale">المقاسات</a>':'', E.anat?'<a href="#anatomy">تشريح الخط</a>':'', '<a href="#sources">المصادر</a>'].join('');
  const html = `${header(E.name, true, nav)}
${railHTML(E.key)}
<div class="hero" id="top"><div class="wrap">
  <div>
    <div class="eyebrow">دليل مصوَّر · ${E.range}</div>
    <h1>${E.name}</h1>
    <p class="sub">${E.sub}</p>
    <p class="lede">${E.lede}</p>
    <div class="hero-actions">
      <a class="btn solid" href="#corpus">تصفح المصاحف</a>
      <button class="btn" type="button" data-pres>▶ ابدأ العرض</button>
      <a class="btn" href="#tally">الحصيلة في جدول</a>
    </div>
  </div>
  ${heroFig}
</div></div>
<main>
  <section id="tally"><div class="wrap">
    <div class="sec-head"><div><div class="kicker">الحصيلة</div><h2>${star}ما الذي نعرفه؟</h2>
      <p>في هذا الدليل ${agree(items.length, ['مصحف واحد', 'مصحفان', items.length+' مصاحف', items.length+' مصحفاً'])}، والمجموعات ثلاث: ما بقي ويستوفي الشرط، وما ذكرته المصادر ثم ضاع، وما يقف على حافة الشرط.</p></div></div>
    <div class="tally" id="tallyTiles"></div>
    <div class="criteria">
      <div class="note"><h3>شرط الدليل</h3><p>يدخل المصحف في القائمة الأولى إذا اجتمعت فيه ثلاثة أمور:</p><ul>
        <li>أن يكون <b>تاريخ نسخه مذكوراً صراحة</b> في خاتمته أو وقفيته، لا مستنتجاً من أسلوبه.</li>
        <li>أن يُعرف <b>صاحبه</b>: الناسخ إن ذُكر اسمه، أو من كُتب برسم خزانته أو له.</li>
        <li>أن يثبت أنه نُسخ <b>${E.realm}</b>.</li></ul>${E.criteriaNote?`<p style="margin-top:10px;font-size:16px;color:var(--ink2)">${E.criteriaNote}</p>`:''}</div>
      <div class="note"><h3>دلالة الشارات</h3><p style="font-size:16px">في كل بطاقة ثلاث شارات: هل بقي المصحف؟ هل وصل تاماً؟ هل يمكن تصفحه في الويب؟</p>
        <div class="legend"><span class="badge b-ok">باقٍ</span><span class="badge b-no">مفقود</span><span class="badge b-ok">تام</span><span class="badge b-part">ناقص</span><span class="badge b-ok">مرقمن كاملاً</span><span class="badge b-part">صور جزئية</span><span class="badge b-no">غير مرقمن</span><span class="badge b-mut">غير معلوم</span></div></div>
    </div>
    <div style="margin-top:26px" id="matrixWrap"></div>
  </div></section>
  <section id="timeline"><div class="wrap">
    <div class="sec-head"><div><div class="kicker">خط الزمن</div><h2>${star}${E.tl.title}</h2>
      <p>الأشرطة عهود أبرز الحكام، والعلامات مواضع المصاحف. العلامة الممتلئة مصحف باقٍ، والمفرغة مصحف مفقود، والخط الأفقي مدة يُحصر فيها مصحف غير مؤرخ.</p></div></div>
    <div class="tl-scroll"><div class="tl" id="tl"></div></div>
    <div class="tl-hint">اضغط على أي علامة للانتقال إلى بطاقة المصحف. على الهاتف اسحب الخط أفقياً.</div>
  </div></section>
  <section id="corpus"><div class="wrap">
    <div class="sec-head"><div><div class="kicker">المصاحف</div><h2>${star}البطاقات والعينات</h2>
      <p>العينات مقاطع مقرَّبة من الكتابة نفسها، لا من الزخارف وصفحات الافتتاح. تُكبَّر كل عينة بالضغط عليها، ويمكن تقريبها وتحريكها، ومنها رابط إلى الصفحة كاملة في المكتبة التي تحفظ المصحف.</p></div></div>
    <div class="filters" id="filters" role="group" aria-label="تصفية المصاحف"></div>
    <div id="entries"></div>
  </div></section>
  ${E.hasScale!==false ? `<section id="scale"><div class="wrap">
    <div class="sec-head"><div><div class="kicker">المقاسات والمسطرة</div><h2>${star}الصفحات على مقياس واحد</h2>
      <p>رُسمت الصفحات بنسبها الحقيقية وعلى مقياس واحد، وفي كل منها عدد أسطرها.</p></div></div>
    <div class="scale"><div class="scale-row" id="scaleRow"></div><div class="scale-foot">الإطار المتقطع لمقاس غير منشور، رُسم بنسبته التقريبية فقط.<span class="m-hint"> اسحب الصفوف أفقياً لرؤية المصاحف كلها.</span></div></div>
  </div></section>` : ''}
  ${E.anat ? `<section id="anatomy"><div class="wrap">
    <div class="sec-head"><div><div class="kicker">تشريح الخط</div><h2>${star}${E.anat.title}</h2><p>${E.anat.intro}</p></div></div>
    <div class="anat${E.anat.w/E.anat.h > 1.8 ? ' wide' : ''}"><div class="anat-scroll"><figure class="anat-fig" id="anatFig"><img src="${E.anat.f}" width="${E.anat.w}" height="${E.anat.h}" alt="${E.anat.alt}"></figure><p class="m-hint">اسحب الصورة أفقياً لرؤية الأسطر كاملة.</p></div><ol class="anat-list" id="anatList"></ol></div>
  </div></section>` : ''}
  <section id="sources"><div class="wrap">
    <div class="sec-head"><div><div class="kicker">المصادر</div><h2>${star}المراجع وحقوق الصور</h2><p>كل معلومة في البطاقات مأخوذة من أحد هذه المصادر.${E.readNote?' '+E.readNote:''}</p></div></div>
    <ul class="refs" id="refs"></ul>
    <div class="note" style="margin-top:26px"><h3>حدود هذا الدليل</h3><p>${E.limits}</p></div>
    <p class="credits" id="credits"></p>
  </div></section>
</main>
<footer><div class="wrap"><div>${E.name} · ${E.footer}</div><div><a href="${ROOT || './'}">مصاحف المغرب: كل العصور</a></div>${byline()}</div></footer>
${commonOverlays()}${ldEra(E)}`;
  $('#app').innerHTML = html;

  /* tally + matrix */
  const surv = count('surviving'), lost = count('lost'), edge = count('edge'), dig = items.filter(i=>i.status.d==='ok').length;
  const tiles = [
    [surv, agree(surv, ['مصحف باقٍ يستوفي الشرط','مصحفان باقيان يستوفيان الشرط','مصاحف باقية تستوفي الشرط','مصحفاً باقياً يستوفي الشرط'])],
    [lost, agree(lost, ['مصحف ذكرته المصادر ولا يُعرف له أثر','مصحفان ذكرتهما المصادر ولا يُعرف لهما أثر','مصاحف ذكرتها المصادر ولا يُعرف لها أثر','مصحفاً ذكرته المصادر ولا يُعرف له أثر'])],
    [edge, agree(edge, ['مصحف على حافة الشرط، أدرجناه للمقارنة','مصحفان على حافة الشرط، أدرجناهما للمقارنة','مصاحف على حافة الشرط، أدرجناها للمقارنة','مصحفاً على حافة الشرط، أدرجناها للمقارنة'])],
    [dig, agree(dig, ['مصحف يُتصفَّح ما بقي منه كاملاً في مصدره','مصحفان يُتصفَّح ما بقي منهما كاملاً في مصدره','مصاحف يُتصفَّح ما بقي منها كاملاً في مصدره','مصحفاً يُتصفَّح ما بقي منه كاملاً في مصدره'])]];
  $('#tallyTiles').innerHTML = tiles.map(t=>`<div class="tile"><div class="n">${t[0]}</div><div class="t">${t[1]}</div></div>`).join('');
  const dot = (cls,txt) => `<span class="dot ${cls}"><i></i>${txt}</span>`;
  let rows = '';
  for (const g of ['surviving','lost','edge']) {
    const list = items.filter(x=>x.group===g); if (!list.length) continue;
    rows += `<tr class="grp"><td colspan="7">${GROUPS[g]}</td></tr>`;
    for (const i of list) {
      const s = ST.s[i.status.s], c = ST.c[i.status.c], d = ST.d[i.status.d];
      const nil = i.status.s==='no' ? ' class="nil"' : '';
      const browse = i.links && i.links.length && i.status.d!=='no';
      rows += `<tr><td class="name"><a href="#${i.id}">${i.short||i.title}</a></td>
        <td data-l="التاريخ">${i.dateH}<br><span style="color:var(--ink3)">${i.dateG}</span></td>
        <td data-l="الحال">${dot(s[0],s[1])}</td>
        <td data-l="التمام"${nil}>${i.status.s==='no' ? '—' : dot(c[0],c[1])}</td>
        <td data-l="الرقمنة"${nil}>${i.status.s==='no' ? '—' : dot(d[0],d[1])}</td>
        <td data-l="أين اليوم"${nil}>${i.where || (i.status.s==='no' ? 'مفقود' : '—')}</td>
        <td data-l="تصفح"${browse?'':' class="nil"'}>${browse ? `<a href="${i.links[0][1]}" target="_blank" rel="noopener">افتح ↗</a>` : '—'}</td></tr>`;
    }
  }
  $('#matrixWrap').innerHTML = `<table class="matrix"><thead><tr><th>المصحف</th><th>التاريخ</th><th>الحال</th><th>التمام</th><th>الرقمنة</th><th>أين اليوم</th><th>تصفح</th></tr></thead><tbody>${rows}</tbody></table>`;

  /* timeline */
  (function(){
    const T = E.tl, W = 1000, H = 300, x0 = 40, x1 = 940, A = T.a, B = T.b;
    const X = y => x1 - (y - A) / (B - A) * (x1 - x0);
    let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="خط زمني للمصاحف">`;
    const step = T.step || 20;
    for (let y = Math.ceil(A/step)*step; y <= B; y += step) s += `<line x1="${X(y)}" x2="${X(y)}" y1="34" y2="${H-26}" stroke="var(--line)"/><text x="${X(y)}" y="${H-8}" font-size="12" text-anchor="middle" fill="var(--ink3)">${y}</text>`;
    T.rulers.forEach(k=>{
      const a = X(k.a), b = X(k.b), yy = 14;
      s += `<rect x="${b}" y="${yy}" width="${a-b}" height="22" rx="4" fill="${k.faint?'var(--bg2)':'var(--bar)'}" stroke="var(--card)" stroke-width="1.5"/>`;
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
    if (count('surviving')) s += `<text x="${W-4}" y="${lanes.surviving+4}" font-size="12" text-anchor="start" fill="var(--acc)">باقية</text>`;
    if (count('edge')) s += `<text x="${W-4}" y="${lanes.edge+4}" font-size="12" text-anchor="start" fill="var(--gold)">على الحافة</text>`;
    if (count('lost')) s += `<text x="${W-4}" y="${lanes.lost+4}" font-size="12" text-anchor="start" fill="var(--ink3)">مفقودة</text>`;
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
      for (const i of list) grid.appendChild(el('article', {class:'lost', id:i.id, 'data-group':g, 'data-s':i.status.s, 'data-d':i.status.d},
        `<div class="yr">${i.dateH}</div><h3>${i.title}</h3><div style="font-family:var(--ui);font-size:13px;color:var(--ink3);margin-bottom:8px">${i.dateG}</div>${badges(i.status)}<p>${i.text}</p><div class="src">المصدر: ${i.src}</div>`));
      box.appendChild(grid); continue;
    }
    for (const i of list) {
      const a = el('article', {class:'entry', id:i.id, 'data-group':g, 'data-s':i.status.s, 'data-d':i.status.d});
      const facts = i.facts.map(f=>`<dt>${f[0]}</dt><dd>${LAT(f[1])}</dd>`).join('');
      const prose = i.prose.map(p=>`<p>${p}</p>`).join('') + (i.why ? `<p class="why">${i.why}</p>` : '');
      const links = i.links && i.links.length ? `<div class="links">${i.links.map(l=>`<a href="${l[1]}" target="_blank" rel="noopener">${l[0]}</a>`).join('')}</div>` : '';
      a.innerHTML = `<div class="entry-head"><div class="num"><span>${i.num}</span></div><div><h3>${i.title}</h3><div class="when"><b>${i.dateH}</b> · ${i.dateG}</div></div>${badges(i.status)}</div>
        <div class="entry-body"><dl class="facts">${facts}</dl><div class="prose">${prose}${links}</div></div>`;
      if (i.colophon) {
        const k = i.plates.findIndex(x=>x.f===i.colophon.plate), p = i.plates[k];
        a.insertAdjacentHTML('beforeend', `<div class="colophon"><figure data-open="${i.id}:${k}"><img loading="lazy" src="${p.url||`plates/${p.f}.jpg`}" alt="${p.t}"></figure><div class="tr"><h4>${i.colophon.title}</h4><p class="ar">${i.colophon.ar}</p><p class="gl">${i.colophon.gl}</p></div></div>`);
      }
      if (i.journey) a.insertAdjacentHTML('beforeend', `<div class="journey"><h4>${i.journeyTitle||'رحلة المصحف'}</h4><div class="jsteps" style="--n:${i.journey.length}">${i.journey.map(j=>`<div class="jstep"><i></i><b>${j[0]}</b><span>${j[1]}</span></div>`).join('')}</div></div>`);
      if (i.plates && i.plates.length) {
        const strip = i.plates.map((p,k)=>{ const hh = p.w/p.h > 2.4 ? 150 : 240; return `<figure class="plate" data-open="${i.id}:${k}" tabindex="0" role="button" aria-label="تكبير: ${p.t}"><img loading="lazy" src="${p.turl||`plates/${p.f}-t.jpg`}" width="${Math.round(hh*p.w/p.h)}" height="${hh}" style="--h:${hh}px" alt="${p.t}"><figcaption><b>${p.t}</b> · ${LAT(p.loc)}</figcaption></figure>`; }).join('');
        a.insertAdjacentHTML('beforeend', `<div class="gallery"><div class="gal-title"><span>عينات من الكتابة عن قرب (${i.plates.length})</span><span>اضغط للتكبير ←</span></div><div class="strip">${strip}</div></div>`);
      } else if (i.ruling) {
        a.insertAdjacentHTML('beforeend', `<div class="ruling">${rulingSVG(i.ruling,4.6)}<p><b>لا عينات هنا.</b> ${i.noPlates || 'المصحف غير مرقمن، ولم نجد له صورة منشورة.'} ما تراه رسم لهيئة الصفحة: ${i.ruling.n ? lines(i.ruling.n) : 'عدد الأسطر غير منشور'}${i.ruling.unknown ? '، والمقاس غير منشور' : ''}.</p></div>`);
      }
      box.appendChild(a);
    }
  }
  const FILTERS = [['all','الكل'],['surviving','الباقية'],['digital','المرقمنة'],['lost','المفقودة'],['edge','على الحافة']].filter(f=>f[0]==='all'||f[0]==='digital'||count(f[0]));
  $('#filters').innerHTML = FILTERS.map(f=>`<button class="chip" type="button" data-f="${f[0]}" aria-pressed="${f[0]==='all'}">${f[1]}</button>`).join('');
  $('#filters').addEventListener('click', e=>{ const c = e.target.closest('.chip'); if (c) setFilter(c.dataset.f); });

  if (E.hasScale!==false) {
    const list = items.filter(i=>i.ruling).sort((a,b)=>(b.ruling.w*b.ruling.h)-(a.ruling.w*a.ruling.h));
    $('#scaleRow').innerHTML = list.map(i=>`<div class="scale-item">${rulingSVG(i.ruling,5)}<b>${i.short||i.title}</b><span>${i.ruling.unknown?'مقاس غير منشور':i.ruling.w+' × '+i.ruling.h+' سم'} · ${i.ruling.n?lines(i.ruling.n):'الأسطر ؟'}</span></div>`).join('');
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
  $('#credits').innerHTML = (E.credits === 'لا صور في هذه الصفحة.' ? '' : E.credits) + (items.some(i => (i.plates||[]).some(p => /عن (خبطة|بونجانينو)/.test(p.loc || ''))) ? ' وبعض الصور منقولة من دراسات منشورة، أغلبها بجودة منخفضة، للتعريف بمصاحف لم تُرقمن؛ ومصدر كل صورة مذكور تحتها، والحقوق لأصحابها والمكتبات التي تحفظ المخطوطات.' : '');

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

/* ---------- lightbox ---------- */
function setupLightbox(platesOf, itemOf){
  const LB = {list:[], i:0, s:1, x:0, y:0, fit:1};
  const lb = $('#lb'), lbImg = $('#lbImg'), stage = $('#lbStage');
  const open = (id, k) => { const it = itemOf(id); if (!it) return; LB.list = platesOf(id).map(p=>({it, p})); if (!LB.list.length) return; LB.i = k; LB.ret = document.activeElement; lb.classList.add('open'); document.body.style.overflow = 'hidden'; if (!(history.state && history.state.ov==='lb')) history.pushState({ov:'lb'}, ''); show(); $('#lbClose').focus(); };
  const show = () => { const {it, p} = LB.list[LB.i]; $('#lbTtl').textContent = `${it.short||it.title} · ${LB.i+1}/${LB.list.length}`; $('#lbCap').innerHTML = `<b>${p.t}</b>: ${LAT(p.c)}<small>${LAT(p.loc)}</small>`; $('#lbSrc').href = p.src || '#'; $('#lbSrc').style.display = p.src ? '' : 'none'; lbImg.onload = fit; lbImg.src = p.url || `${it.base||''}plates/${p.f}.jpg`; lbImg.alt = p.t; if (lbImg.complete && lbImg.naturalWidth) fit(); const v = LB.list.length>1 ? 'visible':'hidden'; $('#lbPrev').style.visibility = v; $('#lbNext').style.visibility = v; };
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
  const end = e=>{ if (!ptrs.has(e.pointerId)) return; ptrs.delete(e.pointerId); if (ptrs.size<2) pinch0 = 0; if (!ptrs.size) { stage.classList.remove('drag'); if (LB.s <= LB.fit*1.02 && swipeX!==null && Math.abs(e.clientX-swipeX) > 60) step(e.clientX > swipeX ? 1 : -1); swipeX = null; } };
  stage.addEventListener('pointerup', end); stage.addEventListener('pointercancel', end);
  addEventListener('resize', ()=>{ if (lb.classList.contains('open')) fit(); });
  document.addEventListener('keydown', e=>{ if (!lb.classList.contains('open')) return; if (e.key==='Escape') close(); else if (e.key==='ArrowLeft') step(1); else if (e.key==='ArrowRight') step(-1); else if (e.key==='+'||e.key==='=') $('#lbIn').click(); else if (e.key==='-') $('#lbOut').click(); });
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
    $('#presCount').textContent = `${SI+1} من ${SL.length}`;
    $('#presProg').style.width = ((SI+1)/SL.length*100) + '%';
    slide.className = 'slide';
    if (s.cover) { slide.classList.add('cover'); slide.innerHTML = `<div class="txt"><div class="k">دليل مصوَّر · ${E.range}</div><h2>${E.name}</h2><p style="max-width:44ch">المصاحف المؤرخة المعروفة الصاحب: ${n('surviving')} باقية تستوفي الشرط، و${n('lost')} ذكرتها المصادر وضاعت، و${n('edge')} على حافة الشرط.</p><p class="d" style="margin-top:10px">← للتقدم استعمل الأسهم أو اسحب الشاشة</p></div>`; return; }
    if (s.end) { slide.classList.add('cover'); slide.innerHTML = `<div class="txt"><div class="k">الخلاصة</div><h2 style="font-size:clamp(30px,5vw,56px)">${E.presEnd.title}</h2><p style="max-width:52ch">${E.presEnd.text}</p></div>`; return; }
    const i = s.item, head = `<div class="k">${GROUPS[i.group]}</div><h2>${i.title}</h2><div class="d">${i.dateH} · ${i.dateG}</div>`;
    if (s.lost) { slide.innerHTML = `<div class="vis"><svg viewBox="0 0 200 200" width="180" height="180" aria-hidden="true"><g fill="none" stroke="#6b5c48" stroke-width="2" stroke-dasharray="6 5"><rect x="50" y="50" width="100" height="100"/><rect x="50" y="50" width="100" height="100" transform="rotate(45 100 100)"/></g><text x="100" y="108" text-anchor="middle" font-size="22" fill="#9a8a74" font-family="Noto Kufi Arabic">مفقود</text></svg></div><div class="txt">${head}<p>${i.text}</p><p style="font-size:15px;color:#a99a80">المصدر: ${i.src}</p></div>`; return; }
    if (s.info) { slide.innerHTML = `<div class="vis">${i.ruling ? rulingSVG(i.ruling, 11, {paper:'#efe4cc', ink:'#2a1f15', frame:'#c99c45'}) : ''}</div><div class="txt">${head}${i.prose.map(p=>`<p>${p}</p>`).join('')}${i.why?`<p style="color:#e9c879">${i.why}</p>`:''}</div>`; return; }
    const p = s.p;
    slide.innerHTML = `<div class="vis"><img src="${p.url||`plates/${p.f}.jpg`}" alt="${p.t}"></div><div class="txt">${head}<p><b style="color:#f1e2bc">${p.t}.</b> ${LAT(p.c)}</p><p style="font-size:14px;color:#a99a80;font-family:var(--ui)">${LAT(p.loc)}${p.src ? ` · <a style="color:#e9c879" href="${p.src}" target="_blank" rel="noopener">الصفحة في المصدر ↗</a>` : ''}</p>${s.first && i.why ? `<p style="font-size:16px;color:#cbb88f">${i.why}</p>`:''}</div>`;
  };
  const openP = () => { SI = 0; pres.classList.add('open'); document.body.style.overflow = 'hidden'; if (!(history.state && history.state.ov==='pres')) history.pushState({ov:'pres'}, ''); render(); $('#presNext').focus(); };
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
  slide.addEventListener('pointerup', e=>{ if (px0!==null && Math.abs(e.clientX-px0) > 60) stepP(e.clientX > px0 ? 1 : -1); px0 = null; });
  document.addEventListener('keydown', e=>{ if (!pres.classList.contains('open')) return; if (e.key==='Escape') closeP(); else if (e.key==='ArrowLeft' || e.key===' ' || e.key==='PageDown') { e.preventDefault(); stepP(1); } else if (e.key==='ArrowRight' || e.key==='PageUp') { e.preventDefault(); stepP(-1); } });
  window.__openPres = openP; window.__stepPres = stepP;
}

/* ================= HUB ================= */
function renderHub(){
  const ready = ERAS.filter(e=>ERAS_READY.includes(e.key) && ERAS_DATA[e.key]);
  const all = [];
  ready.forEach(e=>ERAS_DATA[e.key].items.forEach(i=>all.push({e, i})));
  const cnt = (e,g) => ERAS_DATA[e.key] ? ERAS_DATA[e.key].items.filter(i=>i.group===g).length : 0;
  const cards = ERAS.map(e=>{
    const D = ERAS_DATA[e.key], ok = ERAS_READY.includes(e.key) && D;
    const band = ok && D.hero ? `<img src="${/^https?:/.test(D.hero.f) ? D.hero.f : e.path + D.hero.f}" alt="">` : '';
    const counts = ok ? `<div class="counts"><span class="badge b-ok">${cnt(e,'surviving')} باقية</span><span class="badge b-no">${cnt(e,'lost')} مفقودة</span><span class="badge b-part">${cnt(e,'edge')} على الحافة</span></div>` : '<div class="counts"><span class="badge b-mut">قيد الإعداد</span></div>';
    return `<a class="era-card${ok?'':' soon'}" href="${e.path}" style="--c:${e.c}"><div class="band">${band}</div><div class="body"><h3>${D?D.name:'مصاحف '+e.gen}</h3><div class="rng">${e.rng}</div>${counts}<p>${D?D.card:''}</p></div><span class="go">${ok?'افتح الصفحة ←':''}</span></a>`;
  }).join('');
  const html = `${header('مصاحف المغرب', false, '<a href="#eras">العصور</a><a href="#grand">خط الزمن</a><a href="#method">الشرط</a>')}
${railHTML('hub')}
<div class="hero" id="top"><div class="wrap" style="grid-template-columns:1fr">
  <div>
    <div class="eyebrow">دليل مصوَّر · من الأدارسة إلى العلويين</div>
    <h1>مصاحف المغرب</h1>
    <p class="sub" style="max-width:46ch">المصاحف المؤرَّخة المعروفة الصاحب في عصور المغرب: ما وصلنا منها وما ضاع، وما يُتصفَّح اليوم في مصدره. لكل عصر صفحة مستقلة.</p>
    <div class="hero-actions"><a class="btn solid" href="#eras">العصور</a><a class="btn" href="#grand">خط الزمن الجامع</a></div>
  </div>
</div></div>
<main>
  <section id="eras"><div class="wrap">
    <div class="sec-head"><div><div class="kicker">العصور</div><h2>${star}صفحة لكل عصر</h2><p>في كل صفحة جدول بحال المصاحف، وخط زمني على عهود الحكام، وبطاقات فيها عينات مقرَّبة من الكتابة، ووضع عرض للتقديم.</p></div></div>
    <div class="eras">${cards}</div>
  </div></section>
  <section id="grand"><div class="wrap">
    <div class="sec-head"><div><div class="kicker">خط الزمن الجامع</div><h2>${star}كل المصاحف على خط واحد</h2><p>الأشرطة مدد الدول، والعلامات المصاحف المدرجة في الصفحات الجاهزة. العلامة الممتلئة مصحف باقٍ، والمفرغة مفقود. اضغط على علامة لفتح بطاقتها.</p></div></div>
    <div class="tl-scroll"><div class="tl" id="gtl" style="min-width:1100px"></div></div><div class="tl-hint">اضغط على أي علامة لفتح بطاقتها. على الهاتف اسحب الخط أفقياً.</div>
  </div></section>
  <section id="method"><div class="wrap">
    <div class="sec-head"><div><div class="kicker">الشرط</div><h2>${star}ماذا يدخل في الدليل؟</h2></div></div>
    <div class="criteria"><div class="note"><h3>شرط القائمة الأولى في كل عصر</h3><ul>
      <li>أن يكون <b>تاريخ نسخ المصحف مذكوراً صراحة</b> في خاتمته أو وقفيته.</li>
      <li>أن يُعرف <b>صاحبه</b>: الناسخ، أو من كُتب له أو برسم خزانته.</li>
      <li>أن يثبت أنه نُسخ <b>في بلاد تلك الدولة</b>.</li></ul>
      <p style="margin-top:10px;font-size:16px;color:var(--ink2)">وفي كل صفحة قسمان آخران: مصاحف ذكرتها المصادر ثم ضاعت، ومصاحف مشهورة تقف على حافة الشرط، مع بيان ما ينقصها.</p></div>
      <div class="note"><h3>العينات</h3><p style="font-size:17px">العينات مقاطع مقرَّبة من الكتابة نفسها، مأخوذة من المصاحف المرقمنة في مكتباتها، أو من صور منشورة بترخيص مفتوح. أما المصاحف التي صورها محفوظة الحقوق فنحيل إلى مواضع نشرها.</p></div></div>
  </div></section>
</main>
<footer><div class="wrap"><div>مصاحف المغرب · ${window.HUB_FOOTER||''}</div><div><a href="https://hibrh.github.io/khizanat-almuwahhidin/">خزانة الموحدين</a></div>${byline()}</div></footer>${ldHub(ready)}`;
  $('#app').innerHTML = html;

  /* grand timeline */
  const W = 1200, H = 260, x0 = 30, x1 = 1170, A = 780, B = 1920;
  const X = y => x1 - (y - A) / (B - A) * (x1 - x0);
  let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="خط زمني جامع">`;
  for (let y = 800; y <= 1900; y += 50) s += `<line x1="${X(y)}" x2="${X(y)}" y1="20" y2="${H-24}" stroke="var(--line)"/><text x="${X(y)}" y="${H-6}" font-size="12" text-anchor="middle" fill="var(--ink3)">${y}</text>`;
  ERAS.forEach((e,k)=>{ const a = X(e.a), b = X(e.b), yy = 24 + (k%2)*28; s += `<rect x="${b}" y="${yy}" width="${a-b}" height="22" rx="4" fill="${e.c}" opacity="${ERAS_READY.includes(e.key)?.95:.35}"/><text x="${(a+b)/2}" y="${yy+15}" font-size="12" text-anchor="middle" fill="#fff">${e.name}</text>`; });
  const lanes = {surviving:120, edge:165, lost:205};
  all.forEach(({e,i})=>{ const cx = i.y1 ? X((i.y0+i.y1)/2) : X(i.y0), ly = lanes[i.group];
    s += `<a href="${e.path}#${i.id}"><title>${i.title} — ${i.dateH}</title><circle cx="${cx}" cy="${ly}" r="6.5" fill="${i.status.s==='no'?'var(--card)':e.c}" stroke="${e.c}" stroke-width="2"/></a>`; });
  s += `<text x="${W-2}" y="${lanes.surviving+4}" font-size="12" text-anchor="start" fill="var(--ink2)">باقية</text><text x="${W-2}" y="${lanes.edge+4}" font-size="12" text-anchor="start" fill="var(--ink2)">على الحافة</text><text x="${W-2}" y="${lanes.lost+4}" font-size="12" text-anchor="start" fill="var(--ink2)">مفقودة</text>`;
  $('#gtl').innerHTML = s + '</svg>';
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
  if (key==='hub') renderHub(); else renderEra(ERAS_DATA[key]);
  setupTheme();
  const cur = document.querySelector('.rail [aria-current]'); if (cur && cur.scrollIntoView) cur.scrollIntoView({block:'nearest', inline:'center'});
  if (location.hash) { const t = document.getElementById(location.hash.slice(1)); if (t) setTimeout(()=>t.scrollIntoView(), 60); }
});
})();
