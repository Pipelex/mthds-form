import { chromium } from '/Users/lchoquel/repos/Pipelex/_mthds-form--designer-reach-spike/node_modules/playwright/index.mjs';
const dir = process.argv[2];
const browser = await chromium.launch({ executablePath: '/Users/lchoquel/Library/Caches/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-mac-arm64/chrome-headless-shell' });
for (const app of ['invoice','trip','slides']) for (const moment of ['ready','result']) for (const screen of ['desk']) {
  const w = screen === 'phone' ? 375 : 1280, h = screen === 'phone' ? 780 : 800;
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  await page.goto(`file://${dir}/index.html#shot-stage-${app}-${moment}-team-on-light-${screen}`);
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${dir}/G--mockup--${app}--${moment}--light--${w}.png`, fullPage: true });
  await page.close();
}
await browser.close();
