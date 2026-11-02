const { chromium } = require('playwright');

async function run() {
  console.log('Verifying live production deployment...');
  const browser = await chromium.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    args: ['--enable-webgl', '--use-gl=angle', '--ignore-gpu-blocklist', '--no-sandbox']
  });

  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  const consoleErrors = [];

  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('PAGE ERROR:', msg.text());
      consoleErrors.push(msg.text());
    }
  });

  page.on('pageerror', err => {
    console.log('UNCAUGHT PAGE ERROR:', err.message);
    consoleErrors.push(err.message);
  });

  const prodUrl = 'https://antikythera-mechanism-eight.vercel.app/';
  console.log('Navigating to', prodUrl);
  const resp = await page.goto(prodUrl, { waitUntil: 'networkidle' });
  console.log('Status:', resp.status());

  await page.waitForSelector('#canvas-container canvas', { timeout: 10000 });
  console.log('Canvas active.');

  // Camera presets
  const cams = ['front', 'back', 'gear_stack', 'exploded'];
  for (const c of cams) {
    await page.click(`button[data-cam="${c}"]`);
    await page.waitForTimeout(400);
  }
  console.log('Camera presets verified.');

  // Tabs
  const tabs = ['planets', 'moon', 'games', 'eclipses', 'calendar', 'accuracy', 'comets', 'research'];
  for (const t of tabs) {
    await page.click(`button[data-tab="${t}"]`);
    await page.waitForTimeout(300);
  }
  console.log('All tabs verified.');

  // Crank transport
  const date1 = await page.innerText('#date-display');
  await page.click('#btn-play');
  await page.waitForTimeout(1500);
  const date2 = await page.innerText('#date-display');
  console.log(`Crank play advanced date: ${date1} -> ${date2}`);
  if (date1 === date2) throw new Error('Crank transport failed to advance');
  await page.click('#btn-play');

  await browser.close();

  if (consoleErrors.length > 0) {
    console.error('Console errors found:', consoleErrors);
    process.exit(1);
  }
  console.log('Live production site verified successfully with 0 errors!');
}

run().catch(err => {
  console.error('Verification failed:', err);
  process.exit(1);
});
