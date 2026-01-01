# 🧪 ATOMIC TESTING CHECKLIST - V8 Complete App

## Executive Summary

Diese Checkliste definiert **ALLE** testbaren UI-Elemente der Anamnese-A V8 App. Jedes Element erhält:
1. **Eindeutige Test-ID** (für Playwright-Selektion)
2. **Erwartetes Verhalten** (Was soll passieren?)
3. **Atomic Test** (Minimaler, isolierter Testfall)
4. **Status** (✅ Implemented | ⏳ Pending | ❌ Failed)

---

## SECTION 1: AUTHENTICATION (Login/Logout)

### 1.1 Login Modal

| # | Element | Test-ID | Erwartetes Verhalten | Test-Datei | Status |
|---|---------|---------|----------------------|------------|--------|
| 1.1.1 | Login Button (Header) | `#login-btn` | Öffnet Login-Modal | `login.spec.ts` | ⏳ |
| 1.1.2 | Email Input | `#login-email` | Akzeptiert valide Email | `login.spec.ts` | ⏳ |
| 1.1.3 | Password Input | `#login-password` | Maskiert Passwort (type=password) | `login.spec.ts` | ⏳ |
| 1.1.4 | Submit Button | `#login-submit` | POST /api/auth/login mit Credentials | `login.spec.ts` | ⏳ |
| 1.1.5 | Error Message | `.login-error` | Zeigt "Ungültige Anmeldedaten" bei Fehler | `login.spec.ts` | ⏳ |
| 1.1.6 | Success Redirect | - | Schließt Modal + zeigt User-Badge | `login.spec.ts` | ⏳ |

**Atomic Tests:**
```typescript
// 1.1.1: Login Button öffnet Modal
test('Login button opens modal', async ({ page }) => {
  await page.goto('http://localhost:8080');
  await page.click('#login-btn');
  await expect(page.locator('.login-modal')).toBeVisible();
});

// 1.1.2: Email Input validiert Format
test('Email input validates format', async ({ page }) => {
  await page.goto('http://localhost:8080');
  await page.click('#login-btn');
  await page.fill('#login-email', 'invalid-email');
  await page.click('#login-submit');
  await expect(page.locator('.email-error')).toContainText('Ungültige Email');
});

// 1.1.4: Submit sendet POST-Request
test('Submit sends POST request', async ({ page }) => {
  await page.goto('http://localhost:8080');
  await page.click('#login-btn');
  await page.fill('#login-email', 'user@invalid.test');
  await page.fill('#login-password', 'password123');
  
  const [response] = await Promise.all([
    page.waitForResponse('**/api/auth/login'),
    page.click('#login-submit')
  ]);
  
  expect(response.status()).toBe(200);
  const json = await response.json();
  expect(json.success).toBe(true);
  expect(json.token).toBeTruthy();
});
```

---

## SECTION 2: NAVIGATION (Vor/Zurück/Progress)

| # | Element | Test-ID | Erwartetes Verhalten | Test-Datei | Status |
|---|---------|---------|----------------------|------------|--------|
| 2.1 | Button "Weiter" | `#next-btn` | Navigiert zu nächster Sektion | `navigation.spec.ts` | ⏳ |
| 2.2 | Button "Zurück" | `#prev-btn` | Navigiert zu vorheriger Sektion | `navigation.spec.ts` | ⏳ |
| 2.3 | Progress Bar | `.progress-bar` | Zeigt % der ausgefüllten Sektionen | `navigation.spec.ts` | ⏳ |
| 2.4 | Section Counter | `.section-counter` | Zeigt "Sektion X von Y" | `navigation.spec.ts` | ⏳ |
| 2.5 | Keyboard Nav (→) | - | Pfeil rechts = Weiter | `navigation.spec.ts` | ⏳ |
| 2.6 | Keyboard Nav (←) | - | Pfeil links = Zurück | `navigation.spec.ts` | ⏳ |

**Atomic Tests:**
```typescript
// 2.1: Button "Weiter" navigiert
test('Next button navigates forward', async ({ page }) => {
  await page.goto('http://localhost:8080');
  await page.click('#next-btn');
  await expect(page.locator('.section-counter')).toContainText('2 von');
});

// 2.3: Progress Bar aktualisiert sich
test('Progress bar updates on navigation', async ({ page }) => {
  await page.goto('http://localhost:8080');
  const initialWidth = await page.locator('.progress-bar').evaluate(el => el.style.width);
  await page.click('#next-btn');
  const updatedWidth = await page.locator('.progress-bar').evaluate(el => el.style.width);
  expect(parseInt(updatedWidth)).toBeGreaterThan(parseInt(initialWidth));
});
```

---

## SECTION 3: FORM INPUTS (Alle Eingabefelder)

### 3.1 Persönliche Daten

| # | Element | Test-ID | Erwartetes Verhalten | Test-Datei | Status |
|---|---------|---------|----------------------|------------|--------|
| 3.1.1 | Input "Vorname" | `#firstname` | Nur Buchstaben, max 50 Zeichen | `form-inputs.spec.ts` | ⏳ |
| 3.1.2 | Input "Nachname" | `#lastname` | Nur Buchstaben, max 50 Zeichen | `form-inputs.spec.ts` | ⏳ |
| 3.1.3 | Input "Geburtsdatum" | `#birthdate` | Format DD.MM.YYYY, validiert Alter >0 | `form-inputs.spec.ts` | ⏳ |
| 3.1.4 | Radio "Geschlecht" | `input[name="gender"]` | Nur eine Option wählbar | `form-inputs.spec.ts` | ⏳ |

**Atomic Tests:**
```typescript
// 3.1.1: Vorname validiert Buchstaben
test('Firstname input accepts only letters', async ({ page }) => {
  await page.goto('http://localhost:8080');
  await page.fill('#firstname', 'Test123');
  await page.click('#next-btn');
  await expect(page.locator('.firstname-error')).toContainText('Nur Buchstaben erlaubt');
});

// 3.1.3: Geburtsdatum validiert ungültige Daten
test('Birthdate rejects invalid dates', async ({ page }) => {
  await page.goto('http://localhost:8080');
  await page.fill('#birthdate', '31.02.2020'); // 31. Februar existiert nicht
  await page.click('#next-btn');
  await expect(page.locator('.birthdate-error')).toContainText('Ungültiges Datum');
});
```

### 3.2 Medizinische Angaben

| # | Element | Test-ID | Erwartetes Verhalten | Test-Datei | Status |
|---|---------|---------|----------------------|------------|--------|
| 3.2.1 | Checkbox "Raucher" | `#smoker` | Toggle zwischen Ja/Nein | `form-inputs.spec.ts` | ⏳ |
| 3.2.2 | Textarea "Allergien" | `#allergies` | Max 500 Zeichen | `form-inputs.spec.ts` | ⏳ |
| 3.2.3 | Dropdown "Blutgruppe" | `#bloodtype` | Optionen: A+, A-, B+, B-, AB+, AB-, 0+, 0- | `form-inputs.spec.ts` | ⏳ |

---

## SECTION 4: VERSCHLÜSSELUNG (Save/Load/Export)

| # | Element | Test-ID | Erwartetes Verhalten | Test-Datei | Status |
|---|---------|---------|----------------------|------------|--------|
| 4.1 | Button "Speichern" | `#save-btn` | AES-256 encrypt → localStorage | `encryption.spec.ts` | ⏳ |
| 4.2 | Button "Laden" | `#load-btn` | Decrypt mit Passwort-Prompt | `encryption.spec.ts` | ⏳ |
| 4.3 | Button "Export" | `#export-btn` | JSON-Download | `encryption.spec.ts` | ⏳ |
| 4.4 | Passwort-Input | `#master-password` | Min. 16 Zeichen | `encryption.spec.ts` | ⏳ |
| 4.5 | Brute-Force-Schutz | - | 5 Fehlversuche → 5min Lockout | `encryption.spec.ts` | ⏳ |

**Atomic Tests:**
```typescript
// 4.1: Speichern verschlüsselt Daten
test('Save encrypts data in localStorage', async ({ page }) => {
  await page.goto('http://localhost:8080');
  await page.fill('#firstname', 'Test');
  await page.fill('#master-password', 'SecurePassword123!');
  await page.click('#save-btn');
  
  const encryptedData = await page.evaluate(() => 
    localStorage.getItem('ANAMNESE_ENCRYPTED_DATA')
  );
  
  expect(encryptedData).toBeTruthy();
  expect(encryptedData).not.toContain('Test'); // Muss verschlüsselt sein
});

// 4.5: Brute-Force-Schutz greift
test('Brute-force protection locks after 5 attempts', async ({ page }) => {
  await page.goto('http://localhost:8080');
  
  // Speichere Daten
  await page.fill('#master-password', 'CorrectPassword123!');
  await page.click('#save-btn');
  
  // 5 falsche Versuche
  for (let i = 0; i < 5; i++) {
    await page.fill('#master-password', 'WrongPassword');
    await page.click('#load-btn');
  }
  
  // 6. Versuch sollte blockiert sein
  await page.fill('#master-password', 'AnotherWrong');
  await page.click('#load-btn');
  await expect(page.locator('.error-message')).toContainText('Zu viele Fehlversuche');
});
```

---

## SECTION 5: SPRACHEN (Multi-Language)

| # | Element | Test-ID | Erwartetes Verhalten | Test-Datei | Status |
|---|---------|---------|----------------------|------------|--------|
| 5.1 | Language Dropdown | `#language-select` | 19 Sprachen verfügbar | `navigation.spec.ts` | ⏳ |
| 5.2 | Sprachwechsel | - | Alle Labels ändern sich | `navigation.spec.ts` | ⏳ |
| 5.3 | RTL-Support (Arabisch) | - | Layout spiegelt sich | `navigation.spec.ts` | ⏳ |

**Atomic Tests:**
```typescript
// 5.2: Sprachwechsel ändert alle Labels
test('Language switch updates all labels', async ({ page }) => {
  await page.goto('http://localhost:8080');
  const germanLabel = await page.locator('#next-btn').textContent();
  
  await page.selectOption('#language-select', 'en');
  const englishLabel = await page.locator('#next-btn').textContent();
  
  expect(germanLabel).toContain('Weiter');
  expect(englishLabel).toContain('Next');
});
```

---

## SECTION 6: DARK MODE

| # | Element | Test-ID | Erwartetes Verhalten | Test-Datei | Status |
|---|---------|---------|----------------------|------------|--------|
| 6.1 | Dark Mode Toggle | `#dark-mode-toggle` | Wechselt CSS-Variablen | `navigation.spec.ts` | ⏳ |
| 6.2 | Theme Persistence | - | Präferenz wird gespeichert | `navigation.spec.ts` | ⏳ |

---

## SECTION 7: OFFLINE MODE (PWA)

| # | Element | Test-ID | Erwartetes Verhalten | Test-Datei | Status |
|---|---------|---------|----------------------|------------|--------|
| 7.1 | Service Worker | - | Installiert sich automatisch | `navigation.spec.ts` | ⏳ |
| 7.2 | Offline-Banner | `.offline-banner` | Erscheint bei Netzwerkverlust | `navigation.spec.ts` | ⏳ |
| 7.3 | Cache-Update | - | Benachrichtigt bei neuer Version | `navigation.spec.ts` | ⏳ |

---

## SECTION 8: RATE LIMITING

| # | Element | Test-ID | Erwartetes Verhalten | Test-Datei | Status |
|---|---------|---------|----------------------|------------|--------|
| 8.1 | Rapid Clicking | `#save-btn` | Max 10 Saves/Minute | `navigation.spec.ts` | ⏳ |
| 8.2 | Cooldown Message | `.rate-limit-error` | Zeigt "Bitte warten" | `navigation.spec.ts` | ⏳ |

---

## TEST-COVERAGE MATRIX

| Kategorie | Elemente | Implemented | Pending | Failed |
|-----------|----------|-------------|---------|--------|
| **Authentication** | 6 | 0 | 6 | 0 |
| **Navigation** | 6 | 0 | 6 | 0 |
| **Form Inputs** | 7 | 0 | 7 | 0 |
| **Verschlüsselung** | 5 | 0 | 5 | 0 |
| **Sprachen** | 3 | 0 | 3 | 0 |
| **Dark Mode** | 2 | 0 | 2 | 0 |
| **Offline Mode** | 3 | 0 | 3 | 0 |
| **Rate Limiting** | 2 | 0 | 2 | 0 |
| **TOTAL** | **34** | **0** | **34** | **0** |

**Coverage:** 0% (Start)  
**Ziel:** 100% (alle 34 Tests implementiert)

---

## NEXT STEPS

1. **Implementiere Tests in:** `tests/e2e/atomic/`
2. **Run Tests:** `npm run test:e2e`
3. **Update Status:** Markiere implementierte Tests mit ✅
4. **CI/CD Integration:** GitHub Actions Workflow

---

**Erstellt:** 2025-12-29  
**Version:** 1.0  
**Status:** READY FOR IMPLEMENTATION
