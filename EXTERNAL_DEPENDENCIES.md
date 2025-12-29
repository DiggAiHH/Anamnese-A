# External Dependencies Audit (DSGVO-Compliance)

**Datum**: 2025-12-29  
**Status**: 🔴 CRITICAL - CDN-Dependencies gefunden

## 🚨 DSGVO-KRITISCHE FUNDE

### 1. Google Fonts (DSGVO-Verstoß)
**Betroffene Dateien**: `public/index_nopay.html`

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
```

**Problem**: Direkte Verbindung zu Google-Servern → IP-Adressen werden übertragen  
**Lösung**: ✅ `fonts.css` mit @fontsource bereits erstellt → in index_nopay.html einbinden

---

### 2. jsDelivr CDN (Bootstrap, Bootstrap Icons)
**Betroffene Dateien**: 
- `public/index_nopay.html`
- `anamnese-single-file.html` (Vosk-Browser)

```html
<!-- index_nopay.html -->
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.2/font/bootstrap-icons.css">

<!-- anamnese-single-file.html -->
<script src="https://cdn.jsdelivr.net/npm/vosk-browser@0.0.9/dist/vosk.js"></script>
```

**Problem**: jsDelivr ist China-owned (Cloudflare) → DSGVO-Risiko  
**Status**: 
- ✅ Bootstrap lokal in `public/lib/bootstrap/` vorhanden
- ✅ Bootstrap Icons lokal in `public/lib/bootstrap-icons/` vorhanden
- ⚠️  Vosk-Browser: Muss lokal heruntergeladen werden (großes WASM-Paket)

**Lösung**:
```bash
# Vosk lokal installieren
cd public/lib
wget https://cdn.jsdelivr.net/npm/vosk-browser@0.0.9/dist/vosk.js
wget https://cdn.jsdelivr.net/npm/vosk-browser@0.0.9/dist/vosk.wasm
# Modelle (Deutsch):
wget https://alphacephei.com/vosk/models/vosk-model-small-de-0.15.zip
```

---

### 3. Tesseract.js (Embedded CDN-URLs)
**Betroffene Dateien**:
- `app-v8-complete/public/lib/tesseract.min.js`
- `app-v8-complete/public/lib/tesseract-worker.min.js`
- `public/lib/tesseract.min.js`

**Problem**: Tesseract.min.js hat hardcoded `https://cdn.jsdelivr.net/npm/tesseract.js@v...` URLs im Minified Code

**Code-Stellen**:
```javascript
// tesseract.min.js Zeile 2
workerPath:"https://cdn.jsdelivr.net/npm/tesseract.js@v".concat(c,"/dist/worker.min.js")

// tesseract-worker.min.js Zeile 2
s||"https://cdn.jsdelivr.net/npm/@tesseract.js-data/".concat(i,m?"/4.0.0_best_int":"/4.0.0")
c=o||"https://cdn.jsdelivr.net/npm/tesseract.js-core@v".concat(h.substring(1))
```

**Lösung**:
1. **Option A (Quick Fix)**: Tesseract.js mit Custom Build neu bauen:
```bash
git clone https://github.com/naptha/tesseract.js
cd tesseract.js
# package.json editieren: URLs ändern
npm run build
```

2. **Option B (Empfohlen)**: Tesseract Worker + Language Data lokal hosten:
```javascript
// In app-init Code:
const worker = await createWorker('deu', 1, {
  workerPath: '/lib/tesseract/worker.min.js',
  langPath: '/lib/tesseract/lang-data',
  corePath: '/lib/tesseract/core'
});
```

---

### 4. CSP-Violation in index_nopay.html
**Problem**: CSP-Header erlaubt explizit Google Fonts + jsDelivr:

```html
<meta http-equiv="Content-Security-Policy" content="
  style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://fonts.googleapis.com; 
  font-src 'self' https://fonts.gstatic.com; 
  script-src 'self' https://js.stripe.com https://cdn.jsdelivr.net;
">
```

**Lösung**: CSP nach Lokalisierung auf `'self'` beschränken:
```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  style-src 'self' 'unsafe-inline';
  script-src 'self' https://js.stripe.com;
  img-src 'self' data: https:;
  connect-src 'self' https://api.stripe.com;
  frame-src https://js.stripe.com https://hooks.stripe.com;
  font-src 'self' data:;
">
```

---

## ✅ BEREITS DSGVO-KONFORM

### 1. index_v8_complete.html
- ✅ Keine CDN-Links
- ✅ Bootstrap lokal
- ✅ CryptoJS lokal
- ✅ Fonts lokal (fonts.css eingebunden)

### 2. app-v8-complete/index.html
- ✅ Keine externen Dependencies gefunden

---

## 📋 AKTIONSPLAN (Priorität)

### Phase 1: KRITISCH (Sofort)
- [ ] **public/index_nopay.html**: Google Fonts entfernen → fonts.css einbinden
- [ ] **public/index_nopay.html**: Bootstrap CDN → lokale Dateien
- [ ] **public/index_nopay.html**: CSP-Header updaten

### Phase 2: WICHTIG (Diese Woche)
- [ ] **anamnese-single-file.html**: Vosk-Browser lokal einbinden
- [ ] **Tesseract.js**: Custom Build mit lokalen Pfaden ODER lokale Worker/Data-Hosting

### Phase 3: MONITORING (Laufend)
- [ ] Pre-commit Hook: `grep -r "cdn\." --include="*.html" --include="*.js"`
- [ ] ESLint Rule: Verbiete `https://` in production builds (außer Stripe/Payment)
- [ ] CI/CD Job: CDN-Scanner (siehe GitHub Actions)

---

## 🔧 QUICK FIX SCRIPT

```bash
#!/bin/bash
# fix-cdn-dependencies.sh

set -e

echo "🧹 Removing CDN dependencies..."

# Fix index_nopay.html
sed -i 's|https://fonts.googleapis.com.*||g' public/index_nopay.html
sed -i 's|https://fonts.gstatic.com.*||g' public/index_nopay.html
sed -i 's|https://cdn.jsdelivr.net/npm/bootstrap@.*|"/lib/bootstrap/css/bootstrap.min.css">|g' public/index_nopay.html
sed -i 's|https://cdn.jsdelivr.net/npm/bootstrap-icons@.*|"/lib/bootstrap-icons/bootstrap-icons.css">|g' public/index_nopay.html

# Add fonts.css
sed -i '/<title>/a\    <link rel="stylesheet" href="fonts.css">' public/index_nopay.html

echo "✅ Done. Please manually verify the changes."
```

---

## 📊 COMPLIANCE-STATUS

| Datei | Google Fonts | CDN (jsDelivr) | Tesseract CDN | Status |
|-------|--------------|----------------|---------------|--------|
| `index_v8_complete.html` | ✅ Keine | ✅ Keine | ⚠️  Embedded | 🟡 OK* |
| `public/index_nopay.html` | 🔴 Ja | 🔴 Ja | ❌ N/A | 🔴 FAIL |
| `anamnese-single-file.html` | ✅ Keine | 🔴 Vosk | ❌ N/A | 🔴 FAIL |
| `app-v8-complete/index.html` | ✅ Keine | ✅ Keine | ⚠️  Embedded | 🟡 OK* |

*Tesseract hat embedded URLs, aber diese werden nur aufgerufen wenn Worker nicht lokal konfiguriert ist.

---

## 🎯 ZIEL-STATUS

**Target**: 🟢 Alle Dateien = `✅ Keine externen Requests`

**ETA**: 1-2 Stunden Arbeit

**Blocker**: Keine (alle Assets bereits vorhanden oder schnell downloadbar)

---

**Nächste Schritte**: 
1. Quick-Fix-Script ausführen
2. Playwright-Test für externe Requests schreiben
3. CI/CD Integration

