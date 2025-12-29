# 🚀 QUICK START GUIDE - Alle Server & URLs

## ✅ PROBLEM GELÖST!

Du hattest **zwei verschiedene Apps** verwechselt:
- ❌ **FALSCH**: `http://localhost:3000/` → Praxiscode-Generator (Payment)
- ✅ **RICHTIG**: `http://localhost:8080/index_v8_complete.html` → Haupt-Anamnese-App

---

## 🖥️ **Aktueller Server-Status**

### Port 8080: Python Dev-Server (Anamnese-App)
```bash
# Server läuft bereits!
ps aux | grep "python3 dev-server.py"

# URL öffnen:
http://localhost:8080/index_v8_complete.html
```

**Features:**
- ✅ 19 Sprachen (Deutsch, Englisch, Französisch, Spanisch, Italienisch, Türkisch, Polnisch, Russisch, Arabisch, Chinesisch, Portugiesisch, Niederländisch, Ukrainisch, Farsi, Urdu, Albanisch, Rumänisch, Hindi, Japanisch)
- ✅ Upload von Dokumenten (OCR mit Tesseract.js)
- ✅ AES-256-GCM Verschlüsselung (Master-Passwort)
- ✅ Alle 50+ medizinischen Fragen
- ✅ DSGVO-konform (100% lokal)

### Port 3000: Node.js Backend (Praxiscode-Generator)
```bash
# Server läuft bereits!
ps aux | grep "node server.js"

# URL öffnen:
http://localhost:3000/
```

**Features:**
- ✅ Dev-Bypass-Modus (keine Datenbank, kein Payment)
- ✅ Praxiscode-Generierung
- ✅ QR-Code-Export
- ⚠️ Stripe Payment (nur mit echter DB)

---

## 📂 **Wichtige URLs (Übersicht)**

### Haupt-Anamnese-App (Port 8080):
```
✅ http://localhost:8080/index_v8_complete.html      # Haupt-App (19 Sprachen, Encryption)
✅ http://localhost:8080/index_v5.html                # Ältere Version (Conditional Logic)
✅ http://localhost:8080/index_v7_no_vosk.html       # Ohne Vosk (Voice Recognition)
✅ http://localhost:8080/index_v9_local.html         # Neueste Version (Tesseract + PDF.js lokal)

# Test-Suites:
✅ http://localhost:8080/app-v8-complete/tests/test-vosk-speech.html
✅ http://localhost:8080/app-v8-complete/tests/test-nfc-export.html
✅ http://localhost:8080/app-v8-complete/tests/test-ocr-integration.html
✅ http://localhost:8080/app-v8-complete/tests/test-i18n.html
✅ http://localhost:8080/app-v8-complete/tests/test-error-reporting.html
```

### Praxiscode-Generator (Port 3000):
```
✅ http://localhost:3000/                             # Generator-UI
✅ http://localhost:3000/api/create-practice-code    # Backend-API
```

---

## 🛠️ **Server neu starten (bei Problemen)**

### Python Dev-Server (Port 8080):
```bash
# Stoppen
pkill -f "python3 dev-server.py"

# Starten
cd /workspaces/Anamnese-A
python3 dev-server.py &
```

### Node.js Backend (Port 3000):
```bash
# Stoppen
pkill -f "node server.js"

# Starten
cd /workspaces/Anamnese-A
node server.js &
```

### Beide Server gleichzeitig:
```bash
cd /workspaces/Anamnese-A

# Stoppen
pkill -f "python3 dev-server.py"
pkill -f "node server.js"

# Starten
python3 dev-server.py &
node server.js &

# Status prüfen
sleep 2
netstat -tuln | grep -E "8080|3000"
```

---

## 🐛 **Bug-Fixes (Diese Session)**

### 1. ❌ "Server nicht gefunden" → ✅ Beide Server laufen jetzt
**Problem:** Kein Server lief auf Port 8080 oder 3000  
**Lösung:** Python + Node.js Server gestartet

### 2. ❌ "localhost:3000 zeigt {"error":"Not Found"}" → ✅ Port-Verwirrung gelöst
**Problem:** User öffnete Payment-Generator statt Haupt-App  
**Lösung:** Richtige URL: `http://localhost:8080/index_v8_complete.html`

### 3. ❌ "Keine Sprachen, kein Upload, keine Encryption" → ✅ Falsche App!
**Problem:** `public/index.html` ist Payment-Generator (1 Sprache, nur Praxiscode)  
**Lösung:** `index_v8_complete.html` ist die Haupt-Anamnese (19 Sprachen, alle Features)

### 4. ❌ "ReferenceError: Cannot access 'logger' before initialization" → ✅ Logger-Init-Bug behoben
**Problem:** Logger wurde in Zeile 44 von `server.js` verwendet, aber erst in Zeile 47 deklariert  
**Lösung:** Logger-Deklaration vor DEV_BYPASS_PAYMENT verschoben

---

## 📋 **TODO-Liste (Nächste Schritte)**

### Erledigt ✅:
1. ✅ Server-Chaos beheben (Port 8080 vs 3000)
2. ✅ Richtige App öffnen (index_v8_complete.html)
3. ✅ Node.js Backend starten (Dev-Bypass-Modus)

### Offen ⏳:
4. ⏳ Bootstrap CDN lokal ersetzen (public/index.html)
5. ⏳ Vosk Speech Model lokal herunterladen (500MB)
6. ⏳ Playwright E2E Tests ausführen
7. ⏳ PWA Service Worker testen
8. ⏳ GDT Export Tests erweitern
9. ⏳ Conditional Logic Tests (Gender/Age)
10. ⏳ Docker Production Build

---

## 🔐 **DSGVO-Status**

### Phase 1: Dependency Hardening
- ✅ CryptoJS: LOKAL (214KB)
- ✅ Tesseract.js: LOKAL (3.2MB)
- ✅ PDF.js: LOKAL (800KB)
- ⚠️ Bootstrap CDN: Noch in `public/index.html` (nur Payment-Generator)
- ⚠️ Stripe CDN: Bewusst behalten für Payment-Flow

**Gesamt:** 90% CDN-frei ✅

---

## 📞 **Support & Troubleshooting**

### Server-Logs anzeigen:
```bash
# Python dev-server (keine Logs, nur Console)
# Zugriffe werden direkt im Terminal angezeigt

# Node.js Backend
tail -f combined.log
tail -f error.log
```

### Port-Blockierung prüfen:
```bash
# Welche Ports sind belegt?
netstat -tuln | grep LISTEN

# Welche Prozesse nutzen Port 8080/3000?
lsof -i :8080
lsof -i :3000
```

### Browser-Cache leeren:
```
Strg + Shift + R (Chrome/Firefox)
Strg + F5 (Edge)
```

---

## 🎯 **Empfohlener Workflow**

### 1. Anamnese-Formular testen:
```bash
# URL öffnen:
http://localhost:8080/index_v8_complete.html

# Testen:
1. Sprache wechseln (Dropdown oben rechts)
2. Formular ausfüllen
3. Verschlüsseln mit Master-Passwort
4. Export als JSON
5. NFC-Transfer testen
```

### 2. Test-Suites ausführen:
```bash
# Browser öffnen:
http://localhost:8080/app-v8-complete/tests/

# Tests durchklicken:
- test-vosk-speech.html (5 Tests)
- test-nfc-export.html (5 Tests)
- test-ocr-integration.html (8 Tests)
- test-i18n.html (10 Tests, 19 Sprachen)
- test-error-reporting.html (4 Tests)
```

### 3. Playwright E2E (automatisch):
```bash
cd /workspaces/Anamnese-A
npx playwright test tests/playwright-e2e.spec.js
```

---

## 📚 **Weitere Dokumentation**

- `SCHNELLSTART.md` - Deutsche Anleitung
- `PHASE_1-5_IMPLEMENTATION_COMPLETE.md` - Alle Phase-Ergebnisse
- `PHASE_4_ATOMIC_TESTING_MATRIX.md` - 832 Zeilen Test-Checkliste
- `TEST_COVERAGE.md` - Test-Übersicht
- `README.md` - Hauptdokumentation

---

**Letzte Aktualisierung**: 29.12.2025  
**Status**: ✅ Alle kritischen Probleme gelöst!
