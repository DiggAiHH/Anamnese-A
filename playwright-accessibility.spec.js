// Playwright Accessibility Test für index_v8_complete.html
const { test, expect } = require('@playwright/test');

// axe-core für Accessibility-Scan
const { injectAxe, checkA11y } = require('axe-playwright');

test.describe('Accessibility (WCAG) - index_v8_complete.html', () => {
  test('Seite ist barrierefrei laut axe-core', async ({ page }) => {
    await page.goto('http://localhost:8080/index_v8_complete.html');
    await injectAxe(page);
    // Optional: Accessibility-Settings aktivieren (hoher Kontrast, große Schrift)
    // await page.click('text=Barrierefreiheit');
    // await page.check('text=Hoher Kontrast');
    // await page.check('text=Große Schrift');
    await checkA11y(page, null, {
      detailedReport: true,
      detailedReportOptions: { html: true }
    });
  });
});
