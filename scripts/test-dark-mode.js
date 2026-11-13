import puppeteer from 'puppeteer';

async function testThemeToggle() {
  console.log('Testing Dark Mode Toggle live in browser...\n');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.goto('http://localhost:4173/', { waitUntil: 'networkidle0' });

  // 1. Initial State
  const initialClass = await page.evaluate(() => document.documentElement.className);
  const initialBg = await page.evaluate(() => {
    return window.getComputedStyle(document.body).backgroundColor;
  });
  const initialMeta = await page.$eval('meta[name="color-scheme"]', (el) => el.getAttribute('content'));
  console.log(`Initial State:`);
  console.log(`  html.className: "${initialClass}"`);
  console.log(`  body background-color: "${initialBg}"`);
  console.log(`  meta[name="color-scheme"]: "${initialMeta}"\n`);

  // 2. Click Theme Toggle Button
  const toggleBtn = await page.$('button[aria-label="Toggle theme color scheme"]');
  if (!toggleBtn) {
    throw new Error('Theme toggle button not found!');
  }

  console.log('👉 Clicking Theme Toggle Button...');
  await toggleBtn.click();
  await new Promise((r) => setTimeout(r, 200));

  const toggledClass = await page.evaluate(() => document.documentElement.className);
  const toggledBg = await page.evaluate(() => {
    return window.getComputedStyle(document.body).backgroundColor;
  });
  const toggledMeta = await page.$eval('meta[name="color-scheme"]', (el) => el.getAttribute('content'));
  console.log(`After Toggle 1:`);
  console.log(`  html.className: "${toggledClass}"`);
  console.log(`  body background-color: "${toggledBg}"`);
  console.log(`  meta[name="color-scheme"]: "${toggledMeta}"\n`);

  // 3. Click Theme Toggle Button Again
  console.log('👉 Clicking Theme Toggle Button Again...');
  await toggleBtn.click();
  await new Promise((r) => setTimeout(r, 200));

  const revertedClass = await page.evaluate(() => document.documentElement.className);
  const revertedBg = await page.evaluate(() => {
    return window.getComputedStyle(document.body).backgroundColor;
  });
  const revertedMeta = await page.$eval('meta[name="color-scheme"]', (el) => el.getAttribute('content'));
  console.log(`After Toggle 2:`);
  console.log(`  html.className: "${revertedClass}"`);
  console.log(`  body background-color: "${revertedBg}"`);
  console.log(`  meta[name="color-scheme"]: "${revertedMeta}"\n`);

  // 4. Test Settings Modal Theme Controls
  console.log('👉 Opening Settings Modal to test 3-state radio controls...');
  const settingsBtn = await page.$('button[aria-label="Open settings and preferences"]');
  await settingsBtn.click();
  await page.waitForSelector('dialog[open]');

  // Click 'Light' in settings modal
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const lightBtn = btns.find((b) => b.textContent?.includes('Light'));
    if (lightBtn) lightBtn.click();
  });
  await new Promise((r) => setTimeout(r, 200));
  const settingsLightClass = await page.evaluate(() => document.documentElement.className);
  console.log(`Settings Modal 'Light' click -> html.className: "${settingsLightClass}"`);

  // Click 'Dark' in settings modal
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const darkBtn = btns.find((b) => b.textContent?.includes('Dark'));
    if (darkBtn) darkBtn.click();
  });
  await new Promise((r) => setTimeout(r, 200));
  const settingsDarkClass = await page.evaluate(() => document.documentElement.className);
  console.log(`Settings Modal 'Dark' click -> html.className: "${settingsDarkClass}"`);

  // Close settings modal
  await page.evaluate(() => {
    const closeBtn = document.querySelector('button[aria-label="Close settings"]');
    if (closeBtn) closeBtn.click();
  });

  if (initialBg !== toggledBg && toggledBg !== revertedBg && settingsLightClass === '' && settingsDarkClass === 'dark') {
    console.log('\n✅ PASS: Both Header Toggle and Settings Theme Controls work flawlessly!');
  } else {
    console.error('❌ FAIL: Theme settings did not alternate correctly.');
  }

  await browser.close();
}

testThemeToggle().catch((err) => {
  console.error(err);
  process.exit(1);
});
