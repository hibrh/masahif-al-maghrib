// Stills for social media from posts/index.html: carousel slides, video covers and a story.
//   node tools/posts.js                 (both languages, every post)
//   node tools/posts.js ar carousel-3   (one language, chosen posts)
// Writes out/carousel/<lang>/…, out/covers/… and out/stories/… as JPEG, and each
// carousel as one PDF too (LinkedIn posts a carousel as a document). Needs
// build/ui from capture_ui.js (the story shows the site on two phones) and ImageMagick.
const path = require('path');
const fs = require('fs');
const { execFileSync } = require('child_process');
const { chromium } = require('playwright');
const { serve } = require('./serve');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'out');
const [langArg, ...only] = process.argv.slice(2);
const LANGS = langArg ? [langArg] : ['ar', 'en'];

function target(lang, post) {
  const base = `masahif-al-maghrib-${lang}`;
  const m = post.match(/^carousel-(\d+)$/);
  if (m) return path.join(OUT, 'carousel', lang, `${base}-carousel-${m[1].padStart(2, '0')}.jpg`);
  if (post.startsWith('cover-')) return path.join(OUT, 'covers', `${base}-${post.slice(6)}-cover.jpg`);
  return path.join(OUT, 'stories', `${base}-${post}.jpg`);
}

(async () => {
  const { server, url } = await serve(path.resolve(ROOT, '..'));
  const browser = await chromium.launch({ args: ['--disable-lcd-text', '--font-render-hinting=none', '--force-color-profile=srgb'] });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  page.on('pageerror', e => console.log('pageerror:', e.message));
  page.on('console', m => { if (m.type() === 'error') console.log('console:', m.text()); });
  for (const lang of LANGS) {
    await page.goto(`${url}/promo-video/posts/index.html?lang=${lang}`);
    const all = await page.evaluate(() => window.POST.posts);
    for (const post of only.length ? only : all) {
      await page.goto(`${url}/promo-video/posts/index.html?lang=${lang}&post=${post}`);
      await page.evaluate(() => window.ready);
      const { w, h } = await page.evaluate(() => window.POST);
      await page.setViewportSize({ width: w, height: h });
      await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
      const file = target(lang, post);
      fs.mkdirSync(path.dirname(file), { recursive: true });
      await page.locator('#frame').screenshot({ path: file, type: 'jpeg', quality: 92 });
      console.log(path.relative(ROOT, file), `${w}×${h}`);
    }
    const dir = path.join(OUT, 'carousel', lang);
    if (!only.length && fs.existsSync(dir)) {
      const slides = fs.readdirSync(dir).filter(f => f.endsWith('.jpg')).sort().map(f => path.join(dir, f));
      const pdf = path.join(OUT, 'carousel', `masahif-al-maghrib-${lang}-carousel.pdf`);
      execFileSync('convert', [...slides, '-compress', 'jpeg', '-quality', '90', '-density', '144', pdf]);
      console.log(path.relative(ROOT, pdf), `${slides.length} pages`);
    }
  }
  await browser.close();
  server.close();
})();
