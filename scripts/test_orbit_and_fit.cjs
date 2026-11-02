const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function run() {
  console.log('Testing 3D Orbit, Zoom and Framing in browser...');
  const browser = await chromium.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    args: ['--enable-webgl', '--use-gl=angle', '--ignore-gpu-blocklist', '--no-sandbox']
  });

  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  const errors = [];

  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('CONSOLE ERROR:', msg.text());
      errors.push(msg.text());
    }
  });

  page.on('pageerror', err => {
    console.log('PAGE ERROR:', err.message);
    errors.push(err.message);
  });

  // Navigate to local preview server
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // 1. Verify canvas bounds
  const canvasBox = await page.locator('#canvas-container canvas').boundingBox();
  console.log('Canvas bounding box:', canvasBox);
  if (!canvasBox || canvasBox.width < 500 || canvasBox.height < 500) {
    throw new Error(`Canvas is too small! Got ${JSON.stringify(canvasBox)}`);
  }

  // 2. Test Zoom In (+)
  console.log('Clicking Zoom In (+)...');
  await page.click('#btn-zoom-in');
  await page.waitForTimeout(300);
  await page.click('#btn-zoom-in');
  await page.waitForTimeout(300);

  // 3. Test Zoom Out (-)
  console.log('Clicking Zoom Out (-)...');
  await page.click('#btn-zoom-out');
  await page.waitForTimeout(300);
  await page.click('#btn-zoom-out');
  await page.waitForTimeout(300);

  // 4. Test Fit Frame
  console.log('Clicking Fit Frame...');
  await page.click('#btn-fit-frame');
  await page.waitForTimeout(500);

  // 5. Test 3D Orbit Drag (Turn it around in 3D)
  console.log('Testing 3D Orbit Drag...');
  const centerX = canvasBox.x + canvasBox.width / 2;
  const centerY = canvasBox.y + canvasBox.height / 2;
  
  await page.mouse.move(centerX, centerY);
  await page.mouse.down();
  await page.mouse.move(centerX + 180, centerY - 80, { steps: 15 });
  await page.mouse.up();
  await page.waitForTimeout(800);

  // 6. Test Wheel Zoom
  console.log('Testing Mouse Wheel Zoom...');
  await page.mouse.move(centerX, centerY);
  await page.mouse.wheel(0, -250); // zoom in
  await page.waitForTimeout(500);
  await page.mouse.wheel(0, 150);  // zoom out
  await page.waitForTimeout(500);

  // 7. Capture screenshots
  const screenshotDir = '/Users/ericmiller/.gemini/antigravity/scratch/antikythera-mechanism/docs/screenshots';
  const framedShot = path.join(screenshotDir, 'fit_frame_view.png');
  await page.screenshot({ path: framedShot });
  console.log('Saved screenshot to:', framedShot);

  // Copy to ~/Downloads per standing rule
  fs.copyFileSync(framedShot, '/Users/ericmiller/Downloads/Antikythera_fit_frame_view.png');

  await browser.close();

  if (errors.length > 0) {
    console.error('Errors found:', errors);
    process.exit(1);
  }

  console.log('3D Orbit, Zoom & Framing test PASSED with 0 errors!');
}

run().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
