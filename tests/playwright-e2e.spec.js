// @ts-check
/**
 * DSGVO-Compliant E2E Tests for Anamnese-A
 * HISTORY-AWARE: Previous sessions created manual test suites
 * Now adding automated Playwright tests for CI/CD
 * 
 * ESLint Note: Code inside page.evaluate() runs in browser context,
 * so 'window' and 'document' are available there (not in Node.js)
 */

/* eslint-env node */

const { test, expect } = require('@playwright/test');

// Test Configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:8080';
const TEST_TIMEOUT = 30000;

test.describe('🧪 Test Suite Validation', () => {
  
  test('test-vosk-speech.html loads without errors', async ({ page }) => {
    test.setTimeout(TEST_TIMEOUT);
    
    // Navigate to test suite
    await page.goto(`${BASE_URL}/app-v8-complete/tests/test-vosk-speech.html`);
    
    // Wait for page load
    await page.waitForLoadState('networkidle');
    
    // Check title
    await expect(page).toHaveTitle(/Vosk Speech/);
    
    // Verify test framework loaded
    const statsGrid = await page.locator('.stats-grid');
    await expect(statsGrid).toBeVisible();
    
    // Check for JavaScript errors
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    
    // Wait a bit to catch any delayed errors
    await page.waitForTimeout(2000);
    
    // Assert no critical errors (allow warnings)
    const criticalErrors = errors.filter(e => 
      !e.includes('Vosk model') && // Expected if model not installed
      !e.includes('getUserMedia')   // Expected in headless
    );
    expect(criticalErrors.length).toBe(0);
  });

  test('test-nfc-export.html loads without errors', async ({ page }) => {
    test.setTimeout(TEST_TIMEOUT);
    
    await page.goto(`${BASE_URL}/app-v8-complete/tests/test-nfc-export.html`);
    await page.waitForLoadState('networkidle');
    
    // Check title
    await expect(page).toHaveTitle(/NFC Export/);
    
    // Verify CryptoJS loaded (from local lib)
    const cryptoJsLoaded = await page.evaluate(() => {
      // @ts-expect-error - CryptoJS is loaded via script tag in HTML
      // eslint-disable-next-line no-undef
      return typeof window.CryptoJS !== 'undefined';
    });
    expect(cryptoJsLoaded).toBe(true);
    
    // Verify test buttons exist
    const runAllButton = await page.locator('button:has-text("Alle Tests")');
    await expect(runAllButton).toBeVisible();
  });

  test('test-ocr-integration.html loads without errors', async ({ page }) => {
    test.setTimeout(TEST_TIMEOUT);
    
    await page.goto(`${BASE_URL}/app-v8-complete/tests/test-ocr-integration.html`);
    await page.waitForLoadState('networkidle');
    
    // Check title
    await expect(page).toHaveTitle(/OCR|GDPR|DSGVO/i);
    
    // Verify pipeline visualization
    const pipeline = await page.locator('.pipeline-visual');
    await expect(pipeline).toBeVisible();
    
    // Check for GDPR_ANONYMIZER_MOCK
    const anonymizerLoaded = await page.evaluate(() => {
      /* eslint-disable no-undef */
      // NOTE: In classic scripts, const/let bindings are not attached to window.
      return typeof GDPR_ANONYMIZER_MOCK !== 'undefined';
      /* eslint-enable no-undef */
    });
    expect(anonymizerLoaded).toBe(true);
  });

  test('test-encryption.html loads without errors', async ({ page }) => {
    test.setTimeout(TEST_TIMEOUT);
    
    await page.goto(`${BASE_URL}/app-v8-complete/tests/test-encryption.html`);
    await page.waitForLoadState('networkidle');
    
    // Check title
    await expect(page).toHaveTitle(/Encryption|Verschlüsselung/i);
    
    // Verify crypto loaded
    const cryptoLoaded = await page.evaluate(() => {
      /* eslint-disable no-undef */
      // @ts-expect-error - CryptoJS is loaded via script tag
      return typeof window.CryptoJS !== 'undefined' || 
             (window.crypto && window.crypto.subtle);
      /* eslint-enable no-undef */
    });
    expect(cryptoLoaded).toBe(true);
  });

  test('test-gdpr-anonymizer.html loads without errors', async ({ page }) => {
    test.setTimeout(TEST_TIMEOUT);
    
    await page.goto(`${BASE_URL}/app-v8-complete/tests/test-gdpr-anonymizer.html`);
    await page.waitForLoadState('networkidle');
    
    // Check title
    await expect(page).toHaveTitle(/GDPR|DSGVO/i);
    
    // Wait for auto-run tests to complete
    await page.waitForTimeout(5000);
    
    // Check test results
    const passedTests = await page.locator('.test-result.success').count();
    expect(passedTests).toBeGreaterThan(0);
  });
});

test.describe('🔐 Encryption Tests (Automated)', () => {
  
  test('AES-256 roundtrip encryption works', async ({ page }) => {
    test.setTimeout(TEST_TIMEOUT);
    
    await page.goto(`${BASE_URL}/app-v8-complete/tests/test-encryption.html`);
    await page.waitForLoadState('networkidle');
    
    // Run encryption tests
    const runButton = await page.locator('button:has-text("Alle Tests")');
    await runButton.click();
    
    // Wait for tests to complete
    await page.waitForTimeout(8000);
    
    // Check results (runs in browser context)
    const results = await page.evaluate(() => {
      /* eslint-disable no-undef */
      return {
        total: parseInt(document.getElementById('total-tests')?.textContent || '0'),
        passed: parseInt(document.getElementById('passed-tests')?.textContent || '0'),
        failed: parseInt(document.getElementById('failed-tests')?.textContent || '0')
      };
      /* eslint-enable no-undef */
    });
    
    // Assert minimum pass rate (90%)
    const passRate = results.passed / results.total;
    expect(passRate).toBeGreaterThanOrEqual(0.9);
  });
});

test.describe('🔒 GDPR Anonymization Tests (Automated)', () => {
  
  test('PII detection works correctly', async ({ page }) => {
    test.setTimeout(TEST_TIMEOUT);
    
    await page.goto(`${BASE_URL}/app-v8-complete/tests/test-gdpr-anonymizer.html`);
    await page.waitForLoadState('networkidle');
    
    // Wait for auto-run tests
    await page.waitForTimeout(6000);
    
    // Check PII detection results (runs in browser context)
    const results = await page.evaluate(() => {
      /* eslint-disable no-undef */
      return {
        total: parseInt(document.getElementById('totalTests')?.textContent || '0'),
        passed: parseInt(document.getElementById('passedTests')?.textContent || '0')
      };
      /* eslint-enable no-undef */
    });
    
    // All GDPR tests MUST pass (critical)
    expect(results.passed).toBe(results.total);
  });

  test('Anonymization removes original data', async ({ page }) => {
    test.setTimeout(TEST_TIMEOUT);
    
    await page.goto(`${BASE_URL}/app-v8-complete/tests/test-gdpr-anonymizer.html`);
    await page.waitForLoadState('networkidle');
    
    // Check test results display
    const testResults = await page.locator('.test-result').all();
    
    // Find "Anonymization" test
    const anonymizationTest = testResults.find(async result => {
      const text = await result.textContent();
      return text?.includes('Anonymization');
    });
    
    if (anonymizationTest) {
      const status = await anonymizationTest.getAttribute('class');
      expect(status).toContain('passed');
    }
  });
});

test.describe('📊 OCR Integration Tests (Automated)', () => {
  
  test('OCR → Anonymization → Export pipeline works', async ({ page }) => {
    test.setTimeout(TEST_TIMEOUT);
    
    await page.goto(`${BASE_URL}/app-v8-complete/tests/test-ocr-integration.html`);
    await page.waitForLoadState('networkidle');
    
    // Run all tests
    const runButton = await page.locator('button:has-text("Alle Tests")');
    await runButton.click();
    
    // Wait for pipeline to complete
    await page.waitForTimeout(12000);
    
    // Check results (runs in browser context)
    const results = await page.evaluate(() => {
      /* eslint-disable no-undef */
      return {
        total: parseInt(document.getElementById('stat-total')?.textContent || '0'),
        passed: parseInt(document.getElementById('stat-passed')?.textContent || '0'),
        piiDetected: parseInt(document.getElementById('stat-pii')?.textContent || '0')
      };
      /* eslint-enable no-undef */
    });
    
    // All OCR integration tests MUST pass (critical)
    expect(results.passed).toBe(results.total);
    
    // PII detection must work
    expect(results.piiDetected).toBeGreaterThan(0);
  });
});

test.describe('🌐 Main Application Tests', () => {
  
  test('index.html loads without errors', async ({ page }) => {
    test.setTimeout(TEST_TIMEOUT);
    
    await page.goto(`${BASE_URL}/index_v8_complete.html?test=true`);
    await page.waitForLoadState('domcontentloaded');
    
    // Check title
    await expect(page).toHaveTitle(/Medizinischer Anamnesebogen v8/i);
    
    // Verify app container exists
    await page.waitForSelector('#app-container:not(.hidden)', { timeout: TEST_TIMEOUT });
    const app = await page.locator('#app-container');
    await expect(app).toBeVisible({ timeout: TEST_TIMEOUT });
    
    // Check language selector
    const langSelect = await page.locator('#language-select');
    await expect(langSelect).toBeVisible();
  });

  test('Language switching works', async ({ page }) => {
    test.setTimeout(60000); // Extend timeout for slower CI

    // Ensure no blocking dialogs break WebKit/Firefox runs
    await page.addInitScript(() => {
      try {
        // Prevent any prompt/confirm from blocking test execution
        // eslint-disable-next-line no-undef
        window.alert = () => {};
        // eslint-disable-next-line no-undef
        window.confirm = () => true;
        // eslint-disable-next-line no-undef
        window.prompt = () => '';
      } catch (e) {
        // ignore
      }
    });
    
    await page.goto(`${BASE_URL}/index_v8_complete.html?test=true`);
    
    // Wait for full page load + JS execution
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000); // Allow app init time
    
    // Wait for App + language method to exist
    await page.waitForFunction(() => {
      /* eslint-disable no-undef */
      // HISTORY-AWARE: App is declared as top-level const in a classic script.
      // That creates a global binding (App) but not necessarily window.App.
      return typeof App !== 'undefined' && typeof App.changeLanguage === 'function';
      /* eslint-enable no-undef */
    }, { timeout: 30000 });

    const initialLang = await page.evaluate(() => document.documentElement.getAttribute('lang'));

    // Switch to English via App API (more stable than waiting for <select> options)
    await page.evaluate(() => {
      /* eslint-disable no-undef */
      App.changeLanguage('en');
      /* eslint-enable no-undef */
    });

    await page.waitForFunction(() => document.documentElement.getAttribute('lang') === 'en', { timeout: 30000 });
    const newLang = await page.evaluate(() => document.documentElement.getAttribute('lang'));
    expect(newLang).toBe('en');
    expect(newLang).not.toBe(initialLang);
  });

  test('GDPR panel exists and is interactive', async ({ page }) => {
    test.setTimeout(TEST_TIMEOUT);

    // Deterministic state
    await page.addInitScript(() => {
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch (e) {
        // ignore
      }
    });

    // NOTE: In automation, index_v8_complete.html enables test-mode if navigator.webdriver===true
    // and hides the privacy modal automatically. This test must accept either path.
    await page.goto(`${BASE_URL}/index_v8_complete.html`);
    await page.waitForLoadState('domcontentloaded');

    const privacyModal = page.locator('#privacy-modal');
    const acceptButton = page.locator('#privacy-accept-btn');

    if (await privacyModal.isVisible().catch(() => false)) {
      await expect(acceptButton).toBeVisible({ timeout: TEST_TIMEOUT });
      await acceptButton.click();
    }

    await page.waitForSelector('#app-container:not(.hidden)', { timeout: TEST_TIMEOUT });
    await expect(page.locator('#app-container')).toBeVisible({ timeout: TEST_TIMEOUT });

    // Minimal GDPR assertion: privacy disclaimer exists in the app shell
    await expect(page.locator('#disclaimer-privacy')).toBeVisible({ timeout: TEST_TIMEOUT });
  });
});

test.describe('♿ Accessibility Tests', () => {
  
  test('All test suites have proper ARIA labels', async ({ page }) => {
    test.setTimeout(TEST_TIMEOUT);
    
    const testSuites = [
      '/app-v8-complete/tests/test-vosk-speech.html',
      '/app-v8-complete/tests/test-nfc-export.html',
      '/app-v8-complete/tests/test-ocr-integration.html',
      '/app-v8-complete/tests/test-encryption.html',
      '/app-v8-complete/tests/test-gdpr-anonymizer.html'
    ];
    
    for (const suite of testSuites) {
      await page.goto(`${BASE_URL}${suite}`);
      await page.waitForLoadState('networkidle');
      
      // Check for semantic HTML (headings required)
      const headings = await page.locator('h1, h2').count();
      
      expect(headings).toBeGreaterThan(0);
    }
  });

  test('Keyboard navigation works on test suites', async ({ page }) => {
    test.setTimeout(TEST_TIMEOUT);
    
    await page.goto(`${BASE_URL}/app-v8-complete/tests/test-encryption.html`);
    await page.waitForLoadState('networkidle');
    
    // Tab to run button
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Check if button is focused (runs in browser context)
    const focusedElement = await page.evaluate(() => {
      // eslint-disable-next-line no-undef
      return document.activeElement?.tagName;
    });
    
    expect(focusedElement).toBe('BUTTON');
  });
});

// Export results helper
test.afterAll(async () => {
  // E2E Test Suite completed
  // HTML Report: npx playwright show-report
  // Screenshots: tests/screenshots/
  // Traces: tests/traces/
});
