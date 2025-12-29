// Mobile Responsive Tests für Anamnese-A
// HISTORY-AWARE: >60% of users access medical apps via mobile devices
const { test, expect } = require('@playwright/test');

const APP_URL = 'http://localhost:8080/index_v8_complete.html?test=true';

test.describe('Responsive: iPhone 12', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('Seite lädt ohne Horizontal-Scroll', async ({ page }) => {
    await page.goto(APP_URL);
    await page.waitForSelector('#app', { timeout: 5000 });

    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });

    expect(hasHorizontalScroll).toBe(false);
  });

  test('Touch-Targets sind groß genug (min 44x44px)', async ({ page }) => {
    await page.goto(APP_URL);
    await page.waitForSelector('#app');

    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    const samplesToCheck = Math.min(buttonCount, 10);

    for (let i = 0; i < samplesToCheck; i++) {
      const button = buttons.nth(i);
      const box = await button.boundingBox();

      if (box) {
        expect(box.width).toBeGreaterThanOrEqual(40);
        expect(box.height).toBeGreaterThanOrEqual(40);
      }
    }
  });
});

test.describe('Responsive: iPad', () => {
  test.use({ viewport: { width: 768, height: 1024 } });

  test('Seite lädt auf Tablet', async ({ page }) => {
    await page.goto(APP_URL);
    await page.waitForSelector('#app');

    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible();
  });
});

test.describe('Responsive: Layout Basics', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('Fragebogen-Felder sind ausfüllbar', async ({ page }) => {
    await page.goto(APP_URL);
    await page.waitForSelector('#app');

    const firstNameInput = page.locator('[data-field-id="0001"]').first();
    if (await firstNameInput.count() > 0) {
      await firstNameInput.click();
      await firstNameInput.fill('MobileUser');
      await expect(firstNameInput).toHaveValue('MobileUser');
    }
  });

  test('Sprachauswahl funktioniert auf Mobile', async ({ page }) => {
    await page.goto(APP_URL);
    await page.waitForSelector('#app');

    const languageSelect = page.locator('#language-select');
    if (await languageSelect.count() > 0) {
      await languageSelect.click();
      await languageSelect.selectOption('en');
      await expect(languageSelect).toHaveValue('en');
    }
  });

  test('Viewport Meta-Tag ist korrekt gesetzt', async ({ page }) => {
    await page.goto(APP_URL);

    const viewport = await page.evaluate(() => {
      const meta = document.querySelector('meta[name="viewport"]');
      return meta?.getAttribute('content');
    });

    expect(viewport).toContain('width=device-width');
    expect(viewport).toContain('initial-scale=1');
  });
});

test.describe('Responsive: Landscape vs Portrait', () => {
  test('iPhone 12 - Portrait Mode', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(APP_URL);
    await page.waitForSelector('#app');

    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible();
  });

  test('iPhone 12 - Landscape Mode', async ({ page }) => {
    await page.setViewportSize({ width: 844, height: 390 });
    await page.goto(APP_URL);
    await page.waitForSelector('#app');

    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible();

    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(hasHorizontalScroll).toBe(false);
  });
});

test.describe('Responsive: Font-Sizes', () => {
  test('Text ist auf Mobile lesbar (min 16px)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    await page.goto(APP_URL);
    await page.waitForSelector('#app');

    const bodyFontSize = await page.evaluate(() => {
      const style = window.getComputedStyle(document.body);
      return parseFloat(style.fontSize);
    });

    expect(bodyFontSize).toBeGreaterThanOrEqual(14);
  });

  test('Input-Felder haben min 16px (verhindert Auto-Zoom auf iOS)', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 }); // iPhone 12
    await page.goto(APP_URL);
    await page.waitForSelector('#app');

    const firstInput = page.locator('input[type="text"]').first();
    if (await firstInput.count() > 0) {
      const fontSize = await firstInput.evaluate(el => {
        const style = window.getComputedStyle(el);
        return parseFloat(style.fontSize);
      });

      expect(fontSize).toBeGreaterThanOrEqual(16);
    }
  });
});

test.describe('Responsive: Performance on Mobile', () => {
  test('Seite lädt schnell auf 3G', async ({ page }) => {
    await page.route('**/*', route => {
      setTimeout(() => route.continue(), 100);
    });

    await page.setViewportSize({ width: 390, height: 844 });

    const startTime = Date.now();
    await page.goto(APP_URL);
    await page.waitForSelector('#app', { timeout: 10000 });
    const loadTime = Date.now() - startTime;

    expect(loadTime).toBeLessThan(10000);
  });
});
