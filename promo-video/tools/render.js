// Render a cut to video, frame by frame, with several browser pages in parallel.
//   node tools/render.js ar [workers] [from-second] [to-second]
//   node tools/render.js ar-teaser 8          (a shorter cut: <lang>-<cut>)
// Writes build/<cut>/video.mp4 (no sound) and build/<cut>/sfx.json (sound cues).
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const { chromium } = require('playwright');
const { serve } = require('./serve');

const ROOT = path.resolve(__dirname, '..');
const [id = 'ar', workersArg = '3', fromArg, toArg] = process.argv.slice(2);
const [lang, cut] = id.split('-');
const QUERY = `lang=${lang}${cut ? '&cut=' + cut : ''}`;
const OUT = path.join(ROOT, 'build', id);
fs.mkdirSync(OUT, { recursive: true });

// x264 at a high quality: these parts are joined without re-encoding
const X264 = ['-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p',
  '-profile:v', 'high', '-level', '4.2', '-g', '60', '-bf', '2', '-colorspace', 'bt709',
  '-color_primaries', 'bt709', '-color_trc', 'bt709', '-color_range', 'tv'];

async function worker(browser, url, idx, frames, fps, file) {
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  page.on('pageerror', e => console.log(`[${idx}] pageerror:`, e.message));
  await page.goto(`${url}/promo-video/scene/index.html?${QUERY}`);
  await page.evaluate(() => window.ready);
  const cdp = await page.context().newCDPSession(page);
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'png', '-i', '-',
    ...X264, '-vf', 'scale=in_range=full:out_range=tv:out_color_matrix=bt709', file], { stdio: ['pipe', 'inherit', 'inherit'] });
  const done = new Promise((res, rej) => ff.on('close', c => (c === 0 ? res() : rej(new Error('ffmpeg ' + c)))));
  const t0 = Date.now();
  for (let n = 0; n < frames.length; n++) {
    const f = frames[n];
    await page.evaluate(t => window.renderFrame(t), f / fps);
    const { data } = await cdp.send('Page.captureScreenshot', { format: 'png', optimizeForSpeed: true });
    if (!ff.stdin.write(Buffer.from(data, 'base64'))) await new Promise(r => ff.stdin.once('drain', r));
    if (n % 150 === 0) console.log(`[${idx}] frame ${f} (${n + 1}/${frames.length}) ${((n + 1) / ((Date.now() - t0) / 1000)).toFixed(1)} fps`);
  }
  ff.stdin.end();
  await done;
  await page.close();
}

(async () => {
  const { server, url } = await serve(path.resolve(ROOT, '..'));
  const browser = await chromium.launch({ args: ['--disable-lcd-text', '--font-render-hinting=none', '--force-color-profile=srgb'] });
  // timing and sound cues come from the scene itself
  const probe = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  await probe.goto(`${url}/promo-video/scene/index.html?${QUERY}`);
  await probe.evaluate(() => window.ready);
  const { duration, fps, sfx } = await probe.evaluate(() => ({ duration: window.DURATION, fps: window.FPS, sfx: window.SFX }));
  await probe.close();
  fs.writeFileSync(path.join(OUT, 'sfx.json'), JSON.stringify({ duration, fps, sfx }, null, 1));
  const total = Math.round(duration * fps);
  const first = fromArg ? Math.round(+fromArg * fps) : 0;
  const last = toArg ? Math.min(total, Math.round(+toArg * fps)) : total;
  const all = Array.from({ length: last - first }, (_, i) => first + i);
  const W = Math.max(1, +workersArg);
  const size = Math.ceil(all.length / W);
  const parts = [];
  const jobs = [];
  for (let i = 0; i < W; i++) {
    const frames = all.slice(i * size, (i + 1) * size);
    if (!frames.length) continue;
    const file = path.join(OUT, `part-${i}.mp4`);
    parts.push(file);
    jobs.push(worker(browser, url, i, frames, fps, file));
  }
  const t0 = Date.now();
  await Promise.all(jobs);
  await browser.close();
  server.close();
  const list = path.join(OUT, 'parts.txt');
  fs.writeFileSync(list, parts.map(p => `file '${p}'`).join('\n'));
  await new Promise((res, rej) => spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy',
    path.join(OUT, 'video.mp4')], { stdio: 'inherit' }).on('close', c => (c === 0 ? res() : rej(new Error('concat ' + c)))));
  parts.forEach(p => fs.unlinkSync(p));
  console.log(`${all.length} frames in ${((Date.now() - t0) / 1000).toFixed(0)} s → ${path.join(OUT, 'video.mp4')}`);
})();
