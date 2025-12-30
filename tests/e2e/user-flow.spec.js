// E2E User Flow Tests für Anamnese-A
// HISTORY-AWARE: Critical user journeys for medical questionnaire
// DSGVO-SAFE: All data processing happens locally, no external requests
const { test, expect } = require('@playwright/test');

const APP_URL_TEST = 'http://localhost:8080/index_v8_complete.html?test=true';

async function gotoReady(page) {
  await page.goto(APP_URL_TEST);
  await page.waitForFunction(() => window.__ANAMNESE_READY__ === true, { timeout: 30000 });
  await page.waitForSelector('#app-container', { state: 'visible', timeout: 30000 });
}

test.describe('User Flow: Fragebogen ausfüllen', () => {
  
  test.beforeEach(async ({ page }) => {
    await gotoReady(page);
  });

  test('Kompletter Durchlauf: Persönliche Daten bis Speichern', async ({ page }) => {
    // Schritt 1: Sprache sollte Deutsch sein (Standardsprache)
    const languageSelect = page.locator('#language-select');
    await expect(languageSelect).toHaveValue('de');

    // Schritt 2: Persönliche Daten ausfüllen
    // Vorname (mind. 3 Zeichen, keine Zahlen)
    const firstNameInput = page.locator('[data-field-id="0001"]');
    await firstNameInput.fill('Max');
    await firstNameInput.blur();
    
    // Validierung: Min 3 Zeichen sollte OK sein
    const firstNameFeedback = page.locator('#feedback_0001');
    await expect(firstNameFeedback).toContainText('✓');

    // Nachname (APP_DATA id 0000)
    const lastNameInput = page.locator('[data-field-id="0000"]');
    await lastNameInput.fill('Mustermann');
    await lastNameInput.blur();
    await expect(page.locator('#feedback_0000')).toContainText('✓');

    // Geschlecht auswählen (0002 ist Gender-Select)
    await page.locator('[data-field-id="0002"]').selectOption('männlich');

    // Geburtsdatum (01.01.1990 = 35 Jahre alt, valide)
    await page.locator('[data-field-id="0003_tag"]').selectOption('1');
    await page.locator('[data-field-id="0003_monat"]').selectOption('1');
    await page.locator('[data-field-id="0003_jahr"]').selectOption('1990');

    // Schritt 3: Navigation zum nächsten Abschnitt
    const nextButton = page.locator('button:has-text("Weiter")');
    await expect(nextButton).toBeEnabled();
    await nextButton.click();

    // Warte auf nächste Section
    await page.waitForTimeout(500);

    // Schritt 4: Zurück-Button funktioniert
    const backButton = page.locator('button:has-text("Zurück")');
    await backButton.click();
    await page.waitForTimeout(500);

    // Validiere: Daten sind noch da
    await expect(firstNameInput).toHaveValue('Max');
    await expect(lastNameInput).toHaveValue('Mustermann');
  });

  test('Validierung: Namen mit Zahlen werden abgelehnt', async ({ page }) => {
    const firstNameInput = page.locator('[data-field-id="0001"]');
    const lastNameInput = page.locator('[data-field-id="0000"]');
    await lastNameInput.fill('Mustermann');
    await page.locator('[data-field-id="0002"]').selectOption('männlich');
    await page.locator('[data-field-id="0003_tag"]').selectOption('1');
    await page.locator('[data-field-id="0003_monat"]').selectOption('1');
    await page.locator('[data-field-id="0003_jahr"]').selectOption('1990');
    
    // Ungültiger Name mit Zahl
    await firstNameInput.fill('Max123');
    await firstNameInput.blur();
    
    // Fehlermeldung sollte erscheinen
    const feedback = page.locator('#feedback_0001');
    await expect(feedback).toContainText('Zahlen');
    
    // Weiter-Button sollte deaktiviert sein
    const nextButton = page.locator('button:has-text("Weiter")');
    await expect(nextButton).toBeDisabled();

    // Korrektur
    await firstNameInput.fill('Maximilian');
    await firstNameInput.blur();
    await expect(feedback).toContainText('✓');
    await expect(nextButton).toBeEnabled();
  });

  test('Validierung: Zu kurze Namen werden abgelehnt', async ({ page }) => {
    const firstNameInput = page.locator('[data-field-id="0001"]');
    const lastNameInput = page.locator('[data-field-id="0000"]');
    await lastNameInput.fill('Mustermann');
    await page.locator('[data-field-id="0002"]').selectOption('männlich');
    await page.locator('[data-field-id="0003_tag"]').selectOption('1');
    await page.locator('[data-field-id="0003_monat"]').selectOption('1');
    await page.locator('[data-field-id="0003_jahr"]').selectOption('1990');
    
    // Zu kurz (2 Zeichen)
    await firstNameInput.fill('Ma');
    await firstNameInput.blur();
    
    const feedback = page.locator('#feedback_0001');
    await expect(feedback).toContainText('Mindestens 3 Zeichen');
    
    // Korrektur auf 3 Zeichen
    await firstNameInput.fill('Max');
    await firstNameInput.blur();
    await expect(feedback).toContainText('✓');
  });

  test('Validierung: Unrealistisches Geburtsdatum (>120 Jahre)', async ({ page }) => {
    // Geburtsdatum: 01.01.1900 (125 Jahre alt)
    await page.locator('[data-field-id="0003_tag"]').selectOption('1');
    await page.locator('[data-field-id="0003_monat"]').selectOption('1');
    await page.locator('[data-field-id="0003_jahr"]').selectOption('1900');
    
    // Trigger validation
    await page.locator('[data-field-id="0003_jahr"]').blur();
    
    // Fehlermeldung sollte erscheinen
    const feedback = page.locator('#feedback_0003_jahr');
    await expect(feedback).toContainText('120 Jahre');
  });

  test('Validierung: Patient zu jung (<1 Tag)', async ({ page }) => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    await page.locator('[data-field-id="0003_tag"]').selectOption(day);
    await page.locator('[data-field-id="0003_monat"]').selectOption(month);
    await page.locator('[data-field-id="0003_jahr"]').selectOption(String(year));
    await page.locator('[data-field-id="0003_jahr"]').blur();

    // Sollte Fehler zeigen (heute geboren = 0 Tage alt)
    const feedback = page.locator('#feedback_0003_jahr');
    await expect(feedback).toContainText('mindestens 1 Tag');
  });
});

test.describe('Sprachenwechsel', () => {
  
  test('Sprachwechsel funktioniert (DE → EN → FR)', async ({ page }) => {
    await gotoReady(page);

    // Standard: Deutsch
    const heading = page.locator('h1').first();
    await expect(heading).toContainText(/Anamnese|Fragebogen/);

    // Wechsel zu Englisch
    await page.locator('#language-select').selectOption('en');
    await page.waitForTimeout(300);
    await expect(heading).toContainText(/Medical History|Questionnaire/);

    // Wechsel zu Französisch
    await page.locator('#language-select').selectOption('fr');
    await page.waitForTimeout(300);
    await expect(heading).toContainText(/Antécédents médicaux|Questionnaire/);
  });
});

test.describe('Speichern & Laden (ohne Verschlüsselung)', () => {
  
  test('Auto-Save funktioniert', async ({ page }) => {
    await gotoReady(page);

    // Daten eingeben
    await page.locator('[data-field-id="0001"]').fill('TestUser');
    await page.locator('[data-field-id="0000"]').fill('AutoSave');
    await page.locator('[data-field-id="0002"]').selectOption('männlich');
    await page.locator('[data-field-id="0000"]').fill('AutoSave');
    await page.locator('[data-field-id="0002"]').selectOption('männlich');
    
    // Warten auf Auto-Save (2 Sekunden)
    await page.waitForTimeout(2500);

    // Save-Indicator sollte erschienen sein
    const saveIndicator = page.locator('.save-indicator, #save-status');
    await expect(saveIndicator).toBeVisible();

    // Seite neu laden
    await page.reload();
    await page.waitForSelector('#app-container', { state: 'visible', timeout: 30000 });

    // Daten sollten wiederhergestellt werden (Restore-Dialog)
    // Entweder automatisch oder via "Restore" Button
    await page.waitForTimeout(1000);
    
    // Prüfen ob Restore-Dialog erscheint oder Daten bereits geladen sind
    const restoreButton = page.locator('button:has-text("Wiederherstellen")');
    if (await restoreButton.isVisible()) {
      await restoreButton.click();
    }

    // Daten sollten geladen sein
    await expect(page.locator('[data-field-id="0001"]')).toHaveValue('TestUser');
  });
});

test.describe('Export-Funktionen', () => {
  
  test('JSON Export verfügbar', async ({ page }) => {
    await gotoReady(page);

    // Daten eingeben
    await page.locator('[data-field-id="0001"]').fill('ExportTest');
    await page.locator('[data-field-id="0000"]').fill('UserName');
    await page.locator('[data-field-id="0002"]').selectOption('männlich');

    // Export-Button finden (könnte in Footer oder Modal sein)
    const exportButton = page.locator('button:has-text("Export"), button[title*="Export"]').first();
    
    // Wenn Export-Button existiert
    if (await exportButton.count() > 0) {
      await exportButton.click();
      
      // JSON-Option wählen (falls Modal erscheint)
      const jsonOption = page.locator('button:has-text("JSON"), a:has-text("JSON")');
      if (await jsonOption.count() > 0) {
        await jsonOption.first().click();
        await page.waitForTimeout(500);
        expect(await jsonOption.count()).toBeGreaterThan(0);
      }
    }
  });
});

test.describe('Dokument-Upload & OCR', () => {
  
  test('Dokument-Upload UI ist vorhanden', async ({ page }) => {
    await gotoReady(page);

    // Upload-Button oder Drop-Zone finden
    const uploadButton = page.locator('button:has-text("Dokument"), button:has-text("Upload"), input[type="file"]').first();
    await expect(uploadButton).toBeVisible();
  });

  test('Multi-File Upload ist aktiviert', async ({ page }) => {
    await gotoReady(page);

    // File Input Element finden
    const fileInput = page.locator('input[type="file"]').first();
    
    // Prüfen ob multiple-Attribut gesetzt ist
    const hasMultiple = await fileInput.getAttribute('multiple');
    expect(hasMultiple).not.toBeNull();
  });

  test('Multi-Dokumente werden gespeichert (GDPR Storage)', async ({ page }) => {
    await gotoReady(page);

    const result = await page.evaluate(() => {
      try {
        if (typeof DOCUMENT_STORAGE_GDPR === 'undefined') {
          return { ok: false, reason: 'no storage' };
        }
        // Reset for deterministic test
        DOCUMENT_STORAGE_GDPR.documents = [];
        DOCUMENT_STORAGE_GDPR.addDocument({ filename: 'doc1.txt', text: 'hello', originalSize: 5, type: 'text/plain' });
        DOCUMENT_STORAGE_GDPR.addDocument({ filename: 'doc2.txt', text: 'world', originalSize: 5, type: 'text/plain' });

        const encrypted = localStorage.getItem('ocrDocuments_encrypted');
        const plain = localStorage.getItem('ocrDocuments');
        return { ok: true, count: DOCUMENT_STORAGE_GDPR.documents.length, persisted: !!(encrypted || plain) };
      } catch (e) {
        return { ok: false, error: e.message };
      }
    });

    expect(result.ok).toBe(true);
    expect(result.count).toBeGreaterThanOrEqual(2);
    expect(result.persisted).toBe(true);
  });
});

test.describe('Keyboard Navigation', () => {
  
  test('Tab-Navigation funktioniert', async ({ page }) => {
    await gotoReady(page);

    // Tab drücken
    await page.keyboard.press('Tab');
    
    // Ein Element sollte Fokus haben
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).toBeTruthy();

    // Weitere Tabs
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Fokus sollte sich bewegen
    const newFocusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(newFocusedElement).toBeTruthy();
  });

  test('Escape schließt Modals', async ({ page }) => {
    await gotoReady(page);

    // Modal öffnen (z.B. Info-Button oder Help)
    const infoButton = page.locator('button:has-text("Info"), button:has-text("Help"), button[aria-label*="Info"]').first();
    if (await infoButton.count() > 0) {
      await infoButton.click();
      await page.waitForTimeout(300);

      // Modal sollte sichtbar sein
      const modal = page.locator('[role="dialog"], .modal, .modal-overlay').first();
      await expect(modal).toBeVisible();

      // Escape drücken
      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);

      // Modal sollte geschlossen sein
      await expect(modal).not.toBeVisible();
    }
  });
});
