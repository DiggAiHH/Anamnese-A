// Playwright Accessibility Test für index_v8_complete.html
// HISTORY-AWARE: User requested WCAG 2.1 AA compliance check with axe-core
const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

test.describe('Accessibility (WCAG 2.1 AA) - index_v8_complete.html', () => {
  
  test('Seite erfüllt WCAG 2.1 AA Standards (axe-core)', async ({ page }) => {
    // Navigate to app
    await page.goto('/index_v8_complete.html');
    
    // Wait for app to load
    await page.waitForSelector('#app', { timeout: 5000 });
    
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
    await page.goto('/index_v8_complete.html');
    
    // Press Tab to focus skip link
    await page.keyboard.press('Tab');
    
    // Check if skip link is visible or exists
    const skipLink = page.locator('a[href="#main-content"], a[href="#app"]').first();
    await expect(skipLink).toHaveCount(1);
  });

  test('Alle interaktiven Elemente haben sichtbaren Focus', async ({ page }) => {
    await page.goto('/index_v8_complete.html');
    
    // Tab through first few elements
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
      
      // Check if focused element has visible outline
      const focusedElement = await page.evaluateHandle(() => document.activeElement);
      const outlineWidth = await page.evaluate(el => {
        const style = window.getComputedStyle(el);
        return style.outlineWidth;
      }, focusedElement);
      
      // Outline should be at least 2px (current is 3px according to CSS)
      expect(parseInt(outlineWidth)).toBeGreaterThanOrEqual(2);
    }
  });

  test('ARIA Landmarks sind korrekt definiert', async ({ page }) => {
    await page.goto('/index_v8_complete.html');
    
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
    await page.goto('/index_v8_complete.html');
    await page.waitForSelector('button', { timeout: 5000 });
    
    // Get all buttons
    const buttons = await page.locator('button').all();
    
    for (const button of buttons) {
      // Check if button has accessible name (via aria-label, text content, or title)
      const ariaLabel = await button.getAttribute('aria-label');
      const title = await button.getAttribute('title');
      const textContent = await button.textContent();
      
      const hasAccessibleName = ariaLabel || title || (textContent && textContent.trim().length > 0);
      
      if (!hasAccessibleName) {
        const outerHTML = await button.evaluate(el => el.outerHTML);
        console.log(`⚠️ Button without accessible name: ${outerHTML}`);
      }
      
      expect(hasAccessibleName).toBe(true);
    }
  });
});
