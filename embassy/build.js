// PDF yig'ish: repo ildizidan `node embassy/build.js` (PNG ko'rinish uchun: --png)
const http = require('http'), fs = require('fs'), path = require('path');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..');
const TYPES = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
const OUT = [
  ['en', 'Travel-Across-America-EN.pdf'],
  ['uz', 'Amerika-boylab-sayohat-UZ.pdf']
];

const server = http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (p.endsWith('/')) p += 'index.html';
  const f = path.join(ROOT, p);
  if (!f.startsWith(ROOT) || !fs.existsSync(f)) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
});

server.listen(0, async () => {
  const port = server.address().port;
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const shots = process.argv.includes('--png');
  for (const [lang, file] of OUT) {
    await page.goto(`http://127.0.0.1:${port}/embassy/?lang=${lang}`, { waitUntil: 'networkidle' });
    await page.waitForFunction(() => window.__ready && document.fonts.status === 'loaded');
    await page.evaluate(() => Promise.all([...document.images].map(i => i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r; }))));
    // Har sahifada footer'gacha qolgan bo'sh joy (mm). Manfiy bo'lsa, kontent sig'magan.
    const fit = await page.evaluate(() => [...document.querySelectorAll('.page')].map(p => {
      const pf = p.querySelector('.pf'), prev = pf.previousElementSibling;
      const limit = p.getBoundingClientRect().bottom - parseFloat(getComputedStyle(p).paddingBottom);
      const over = pf.getBoundingClientRect().bottom - limit;
      const gap = pf.getBoundingClientRect().top - prev.getBoundingClientRect().bottom;
      return +((over > 0.5 ? -over : gap) / 3.7795).toFixed(1);
    }));
    console.log(lang, 'free mm per page:', fit.join(', '));
    await page.pdf({ path: path.join(__dirname, file), format: 'A4', printBackground: true, preferCSSPageSize: true });
    if (shots) {
      const dir = process.env.SHOT_DIR || __dirname;
      const pages = await page.$$('.page');
      for (let k = 0; k < pages.length; k++) await pages[k].screenshot({ path: path.join(dir, `${lang}-p${k + 1}.png`) });
    }
    console.log('wrote', file);
  }
  await browser.close();
  server.close();
});
