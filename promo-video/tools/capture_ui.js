// Screenshots of the real site on a phone, for the "features" and "cta" scenes.
//   node tools/capture_ui.js            (Playwright must be resolvable: NODE_PATH or a local install)
// Writes build/ui/<lang>/*.png at 3x pixel density.
const path = require('path');
const fs = require('fs');
const { execFileSync } = require('child_process');
const { chromium } = require('playwright');
const { serve } = require('./serve');

const SITE = path.resolve(__dirname, '..', '..');
const OUT = path.resolve(__dirname, '..', 'build', 'ui');
const VIEW = { width: 393, height: 852 };

// wait for the images on or near the screen (lazy ones further away never load)
async function settle(page, ms = 400) {
  await page.evaluate(() => {
    const near = i => { const r = i.getBoundingClientRect(); return r.bottom > -600 && r.top < innerHeight + 600; };
    const waits = [...document.images].filter(i => !i.complete && near(i))
      .map(i => new Promise(r => { i.addEventListener('load', r); i.addEventListener('error', r); }));
    return Promise.race([Promise.all(waits), new Promise(r => setTimeout(r, 5000))]);
  });
  await page.waitForTimeout(ms);
}

async function capture(browser, base, lang) {
  const dir = path.join(OUT, lang);
  fs.mkdirSync(dir, { recursive: true });
  const prefix = lang === 'en' ? '/en' : '';
  const ctx = await browser.newContext({ viewport: VIEW, deviceScaleFactor: 3, isMobile: true,
    hasTouch: true, colorScheme: 'light', locale: lang === 'en' ? 'en-US' : 'ar-MA' });
  const page = await ctx.newPage();

  // home: the hero, and the era cards further down
  await page.goto(`${base}${prefix}/`, { waitUntil: 'networkidle' });
  await settle(page);
  await page.screenshot({ path: path.join(dir, 'home.png') });
  const erasTop = await page.evaluate(() => {
    const e = document.querySelector('.eras'); return e ? e.getBoundingClientRect().top + scrollY : 900;
  });
  await page.evaluate(y => scrollTo(0, y - 140), erasTop);
  await settle(page, 600);
  await page.screenshot({ path: path.join(dir, 'home-eras.png') });

  // the Marinid page: the card of Abu Yaʿqub Yusuf's Qur'an, top to bottom
  await page.goto(`${base}${prefix}/marini/`, { waitUntil: 'networkidle' });
  await page.addStyleTag({ content: '*{scroll-behavior:auto!important}' });   // jumps, not glides
  const cardTop = await page.evaluate(() => document.querySelector('#yaqub').getBoundingClientRect().top + scrollY);
  for (let y = cardTop - 200; y < cardTop + 2600; y += 300) {
    await page.evaluate(v => scrollTo(0, v), y);
    await settle(page, 120);
  }
  await page.evaluate(() => document.querySelector('#yaqub').scrollIntoView());
  await settle(page, 800);
  // render everything (the site skips off-screen cards with content-visibility)
  // and keep the sticky bar out of the long shot; it is captured on its own
  const hide = await page.addStyleTag({ content:
    '*{content-visibility:visible!important} header.top{visibility:hidden!important}' });
  await page.evaluate(() => Promise.race([
    Promise.all([...document.querySelectorAll('#yaqub img')].map(i => {
      i.loading = 'eager';
      return i.complete && i.naturalWidth ? null
        : new Promise(r => { i.addEventListener('load', r); i.addEventListener('error', r); });
    })),
    new Promise(r => setTimeout(r, 8000))]));
  await settle(page, 600);
  // card-relative measures: images loading above the card move it on the page
  const measure = () => page.evaluate(() => {
    const a = document.querySelector('#yaqub');
    const top = a.getBoundingClientRect().top;
    const rel = e => e.getBoundingClientRect();
    const strip = a.querySelector('.strip');
    return { top, bottom: Math.max(rel(a).bottom, strip ? rel(strip).bottom : 0) - top,
      links: rel(a.querySelector('.links')).top - top, strip: (strip ? rel(strip).top : rel(a).bottom) - top,
      linksBox: (b => [b.left, b.top - top, b.width, b.height])(rel(a.querySelector('.links'))),
      plate: (b => [b.left, b.top - top, b.width, b.height])(rel(a.querySelector('.strip .plate img') || a)),
      header: document.querySelector('header.top').offsetHeight };
  });
  let box = await measure();
  const pad = box.header + 14;            // a little of the page above the card
  // one tall picture, shot a screen at a time (a single full-page shot leaves
  // some images undecoded) and stitched with ImageMagick
  const tiles = [];
  for (let k = -pad; k < box.bottom + 24; k += 600) {
    await page.evaluate(k => {
      const e = document.querySelector('#yaqub');
      scrollTo({ top: e.getBoundingClientRect().top + scrollY + k, behavior: 'instant' });
    }, k);
    await settle(page, 350);
    box = await measure();
    const file = path.join(dir, `card-tile-${tiles.length}.png`);
    await page.screenshot({ path: file });
    tiles.push({ file, offset: Math.round((pad - box.top) * 3) });
  }
  const height = Math.ceil(pad + box.bottom + 24);
  const args = ['-size', `${VIEW.width * 3}x${height * 3}`, 'xc:#f3ebdb'];
  for (const t of tiles) args.push(t.file, '-geometry', `+0+${t.offset}`, '-composite');
  execFileSync('convert', [...args, path.join(dir, 'card.png')]);
  tiles.forEach(t => fs.unlinkSync(t.file));
  await hide.evaluate(e => e.remove());
  await page.evaluate(() => scrollTo(0, 0));
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(dir, 'header.png'), clip: { x: 0, y: 0, width: VIEW.width, height: box.header } });
  fs.writeFileSync(path.join(dir, 'card.json'), JSON.stringify({
    cssWidth: VIEW.width, cssHeight: height, scale: 3, header: box.header,
    links: pad + box.links, strip: pad + box.strip,
    linksBox: [box.linksBox[0], pad + box.linksBox[1], box.linksBox[2], box.linksBox[3]],
    plate: [box.plate[0], pad + box.plate[1], box.plate[2], box.plate[3]] }, null, 1));

  // the image viewer on a sample of that card, fitted and then zoomed
  await page.evaluate(() => document.querySelector('#yaqub .strip').scrollIntoView({ block: 'center' }));
  await settle(page, 500);
  await page.click('#yaqub .strip .plate[data-open="yaqub:3"] img');
  await page.waitForTimeout(900);
  await settle(page, 900);
  await page.screenshot({ path: path.join(dir, 'viewer.png') });
  // on phones the viewer zooms by pinching, so the scene zooms the plate itself;
  // it needs to know where the plate and the image stage sit on the screen
  const geo = await page.evaluate(() => {
    const r = e => { const b = e.getBoundingClientRect(); return [b.left, b.top, b.width, b.height]; };
    const lb = document.querySelector('#lb');
    return { img: r(lb.querySelector('#lbStage img') || lb.querySelector('img')), stage: r(lb.querySelector('#lbStage')),
      src: (lb.querySelector('#lbStage img') || lb.querySelector('img')).currentSrc };
  });
  fs.writeFileSync(path.join(dir, 'viewer.json'), JSON.stringify(geo, null, 1));
  await ctx.close();
}

(async () => {
  const { server, url } = await serve(SITE);
  const browser = await chromium.launch();
  try {
    for (const lang of ['ar', 'en']) await capture(browser, url, lang);
  } finally {
    await browser.close();
    server.close();
  }
  console.log('ui screenshots in', OUT);
})();
