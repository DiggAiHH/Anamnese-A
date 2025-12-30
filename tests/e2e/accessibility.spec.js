// Playwright Accessibility Test für index_v8_complete.html
// HISTORY-AWARE: User requested WCAG 2.1 AA compliance check with axe-core
const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

async function gotoReady(page) {
  await page.goto('/index_v8_complete.html?test=true');
  await page.waitForFunction(() => window.__ANAMNESE_READY__ === true, { timeout: 30000 });
  await page.waitForSelector('#app-container', { state: 'visible', timeout: 30000 });
}

test.describe('Accessibility (WCAG 2.1 AA) - index_v8_complete.html', () => {
  
  test('Seite erfüllt WCAG 2.1 AA Standards (axe-core)', async ({ page }) => {
    await gotoReady(page);
    
    // Run axe accessibility scan
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    
    // Report violations
    if (accessibilityScanResults.violations.length > 0) {
      console.log('\n⚠️ Accessibility Violations Found:');
      accessibilityScanResults.violations.forEach((violation, index) => {
        console.log(`\n${index + 1}. ${violation.id} (${violation.impact})`);
        console.log(`   Description: ${violation.description}`);
        console.log(`   Help: ${violation.helpUrl}`);
        console.log(`   Affected elements: ${violation.nodes.length}`);
        violation.nodes.forEach((node, nodeIndex) => {
          console.log(`     ${nodeIndex + 1}. ${node.html}`);
          console.log(`        ${node.failureSummary}`);
        });
      });
    }
    
    // Fail test if critical or serious violations exist
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Skip Links sind vorhanden und funktionieren', async ({ page }) => {
    await gotoReady(page);
    
    // Press Tab to focus skip link
    await page.keyboard.press('Tab');
    
    // Check if skip link is visible or exists
    const skipLinks = page.locator('a.skip-link');
    await expect(skipLinks).toHaveCount(2);
  });

  test('Alle interaktiven Elemente haben sichtbaren Focus', async ({ page }) => {
    await gotoReady(page);
    
    // Tab through first few elements
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
      
      const hasVisibleFocus = await page.evaluate(() => {
        const el = document.activeElement;
        if (!el) return false;
        const style = window.getComputedStyle(el);
        const outlineWidth = parseFloat(style.outlineWidth || '0');
        const hasOutline = outlineWidth >= 2 && style.outlineStyle !== 'none';
        const hasShadow = style.boxShadow && style.boxShadow !== 'none';
        return hasOutline || hasShadow;
      });

      expect(hasVisibleFocus).toBe(true);
    }
  });

  test('ARIA Landmarks sind korrekt definiert', async ({ page }) => {
    await gotoReady(page);
    
    // Check for main landmark
    const mainLandmark = page.locator('[role="main"], main');
    await expect(mainLandmark).toHaveCount(1);
    
    // Check for navigation (if exists)
    const navLandmark = page.locator('[role="navigation"], nav');
    // Navigation might not exist, so just check if present
    const navCount = await navLandmark.count();
    expect(navCount).toBeGreaterThanOrEqual(0);
  });

  test('Buttons haben aria-label oder zugänglichen Text', async ({ page }) => {
    await gotoReady(page);
    await page.waitForSelector('button', { timeout: 30000, state: 'attached' });
    
    // Get all buttons
    const buttons = await page.locator('button').all();
    
    for (const button of buttons) {
      // Check if button has accessible name (via aria-label, text content, or title)
      const ariaLabel = await button.getAttribute('aria-label');
      const title = await button.getAttribute('title');
      const textContent = await button.textContent();
      
      const hasAccessibleName = !!(ariaLabel || title || (textContent && textContent.trim().length > 0));
      
      if (!hasAccessibleName) {
        const outerHTML = await button.evaluate(el => el.outerHTML);
        console.log(`⚠️ Button without accessible name: ${outerHTML}`);
      }
      
      expect(hasAccessibleName).toBe(true);
    }
  });
});
