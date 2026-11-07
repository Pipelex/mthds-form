// usage: node shoot.mjs <outdir> <width> <name>=<url> ...   (fullPage screenshots)
import { chromium } from '/Users/lchoquel/repos/Pipelex/_mthds-form--designer-reach-spike/node_modules/playwright/index.mjs';
const [outdir, width, ...rest] = process.argv.slice(2);
const full = !rest.includes('--viewport');
const height = +(process.env.H ?? 800);
const pairs = rest.filter((a) => a !== '--viewport');
const browser = await chromium.launch({ executablePath: '/Users/lchoquel/Library/Caches/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-mac-arm64/chrome-headless-shell' });
const errors = {};
for (const pair of pairs) {
  const i = pair.indexOf('='); const name = pair.slice(0, i), url = pair.slice(i + 1);
  const page = await browser.newPage({ viewport: { width: +width, height }, deviceScaleFactor: 1 });
  page.on('pageerror', (e) => (errors[name] ??= []).push(String(e).slice(0, 300)));
  page.on('console', (m) => { if (m.type() === 'error') (errors[name] ??= []).push(m.text().slice(0, 300)); });
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${outdir}/${name}.png`, fullPage: full });
  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  console.log(name, 'height', h);
  await page.close();
}
await browser.close();
if (Object.keys(errors).length) console.log('ERRORS', JSON.stringify(errors, null, 1));
