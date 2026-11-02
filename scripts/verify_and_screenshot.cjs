const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function run() {
  console.log('Starting automated browser audit & screenshot capture...');
  const browser = await chromium.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    args: ['--enable-webgl', '--use-gl=angle', '--ignore-gpu-blocklist', '--no-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });

  const page = await context.newPage();
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('PAGE ERROR:', msg.text());
      consoleErrors.push(msg.text());
    } else {
      console.log(`[Browser ${msg.type()}]:`, msg.text());
    }
  });

  page.on('pageerror', err => {
    console.log('UNCAUGHT PAGE ERROR:', err.message);
    consoleErrors.push(err.message);
  });

  console.log('Navigating to http://localhost:5173/...');
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  const screenshotDir = '/Users/ericmiller/.gemini/antigravity/scratch/antikythera-mechanism/docs/screenshots';
  fs.mkdirSync(screenshotDir, { recursive: true });

  // 1. Front View Screenshot
  console.log('Capturing Front View...');
  await page.click('button[data-cam="front"]');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(screenshotDir, 'front_view.png') });

  // 2. Back View Screenshot
  console.log('Capturing Back View...');
  await page.click('button[data-cam="back"]');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(screenshotDir, 'back_view.png') });

  // 3. Gear Stack View Screenshot
  console.log('Capturing Gear Stack View...');
  await page.click('button[data-cam="gear_stack"]');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(screenshotDir, 'gear_stack.png') });

  // 4. Exploded View Screenshot
  console.log('Capturing Exploded View...');
  await page.click('button[data-cam="exploded"]');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(screenshotDir, 'exploded_view.png') });

  // 5. Test Color-Code and Comets Overlay
  console.log('Enabling Color Code & Comets...');
  await page.click('button[data-tab="comets"]');
  await page.waitForTimeout(500);
  const cometCheck = await page.$('#toggle-comets-vis');
  if (cometCheck) await cometCheck.click();
  await page.click('#toggle-colorcode');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(screenshotDir, 'color_coded_gears_comets.png') });

  // 6. Mobile 390x844 iPhone Viewport
  console.log('Testing Mobile 390x844 responsive layout...');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(screenshotDir, 'mobile_390x844.png') });

  // Restore Desktop Viewport for interactive assertions
  await page.setViewportSize({ width: 1440, height: 900 });

  // 7. Test Crank Transport & Play/Pause
  console.log('Testing Crank Transport...');
  const dateBefore = await page.innerText('#date-display');
  await page.click('#btn-play');
  await page.waitForTimeout(2000);
  const dateDuring = await page.innerText('#date-display');
  console.log(`Date before: ${dateBefore} -> Date during play: ${dateDuring}`);
  if (dateBefore === dateDuring) {
    throw new Error('Crank play did not advance the date!');
  }
  await page.click('#btn-play'); // Pause

  // 8. Test Reverse Crank
  console.log('Testing Reverse Crank...');
  await page.click('#btn-reverse');
  await page.waitForTimeout(2000);
  const dateAfterRev = await page.innerText('#date-display');
  console.log(`Date during play: ${dateDuring} -> Date after reverse: ${dateAfterRev}`);
  await page.click('#btn-play'); // Pause

  // 9. Test Theory Toggles
  console.log('Testing Theory Switching (Wright & Price)...');
  await page.selectOption('#theory-select', 'wright');
  await page.waitForTimeout(500);
  await page.selectOption('#theory-select', 'price');
  await page.waitForTimeout(500);
  await page.selectOption('#theory-select', 'freeth2021');
  await page.waitForTimeout(500);

  // 10. Click through each tab
  const tabs = ['planets', 'moon', 'games', 'eclipses', 'calendar', 'accuracy', 'comets', 'research'];
  for (const t of tabs) {
    await page.click(`button[data-tab="${t}"]`);
    await page.waitForTimeout(200);
  }

  // Copy screenshots to ~/Downloads per standing rule
  const downloadDir = '/Users/ericmiller/Downloads';
  const files = fs.readdirSync(screenshotDir);
  for (const f of files) {
    if (f.endsWith('.png')) {
      fs.copyFileSync(path.join(screenshotDir, f), path.join(downloadDir, `Antikythera_${f}`));
      console.log(`Copied ${f} to ~/Downloads/Antikythera_${f}`);
    }
  }

  await browser.close();

  if (consoleErrors.length > 0) {
    console.error('Browser reported console errors:', consoleErrors);
    process.exit(1);
  }

  console.log('All browser verification tests and screenshot captures PASSED with 0 errors.');
}

run().catch(err => {
  console.error('Verification failed:', err);
  process.exit(1);
});
