# 📋 COMPLETE TODO LIST - Anamnese-A Project
**Erstellt:** 2025-12-29  
**Branch:** app/v8-complete-isolated  
**Status:** 10 offene Aufgaben

---

## 🎯 ÜBERSICHT

### ✅ ABGESCHLOSSEN (8/18)
1. ✅ Python Server stabilisiert (Port 8080)
2. ✅ Browser-Cache gelöst (Redirect zu index_v8_complete.html)
3. ✅ Sprachdropdown funktioniert (Event-Listener hinzugefügt)
4. ✅ Erweiterte Validierung (Namen, E-Mail, Geburtsdatum)
5. ✅ Standardsprache Deutsch (statt Englisch)
6. ✅ OCR-Anonymisierungs-UI (Modal mit Checkboxen)
7. ✅ Bootstrap/Icons/QRCode lokal (Port 3000 Payment Generator)
8. ✅ Alle 7 Bugfixes in Session 2 dokumentiert

### 🟡 IN PROGRESS (2/18)
9. 🟡 **Playwright Accessibility-Test ausführen**
   - **Status:** Test angelegt, aber hängt bei Ausführung
   - **Problem:** xvfb-run Timeout, Test findet keine Elemente
   - **Nächster Schritt:** Playwright Config anpassen oder Test vereinfachen
   - **Datei:** [tests/e2e/accessibility.spec.js](tests/e2e/accessibility.spec.js)

10. 🟡 **ARIA-Labels/Tooltips Code-Scan**
    - **Status:** Grep-Search läuft für fehlende aria-label/title Attribute
    - **Ziel:** Alle Buttons, Inputs, Select-Elemente mit Accessibility-Attributen versehen
    - **Tools:** grep_search mit Regex

### 📋 PENDING (8/18)

#### ⚙️ ENTWICKLUNG & TESTING
11. **Multi-Dokument-Upload testen**
    - **Beschreibung:** User Testing: Mehrere Dokumente gleichzeitig hochladen
    - **Code-Status:** Bereits implementiert (`input.multiple = true`, Zeile 3159)
    - **OCR-Verarbeitung:** Automatisch bei Upload (Zeile 3113)
    - **Action:** Manuelles Testing durch User

12. **Bootstrap CDN → Lokal (index_v8_complete.html)**
    - **Beschreibung:** CDN-Links in der Hauptanwendung (Port 8080) durch lokale Dateien ersetzen
    - **Status:** Bereits für Payment Generator (Port 3000) erledigt
    - **DSGVO-Relevanz:** ⚠️ HOCH - Externe CDN-Requests an jsdelivr.net (USA)
    - **Dateien:**
      - `index_v8_complete.html` (Zeile ~3800-3900 CDN-Links)
      - CryptoJS, Tesseract.js bereits lokal
    - **Action:** Bootstrap 5.3.2, Bootstrap Icons 1.11.2 lokal einbinden

13. **Vosk Speech Model herunterladen**
    - **Beschreibung:** 500MB deutsches Sprachmodell für Offline-Spracherkennung
    - **URL:** `https://alphacephei.com/vosk/models/vosk-model-small-de-0.15.zip`
    - **Zielverzeichnis:** `/workspaces/Anamnese-A/models/`
    - **Integration:** Vosk Worker (vosk-worker.js) anpassen
    - **Benefit:** Offline Speech-to-Text ohne Google/AWS APIs

14. **Playwright E2E Tests erstellen**
    - **Beschreibung:** End-to-End Tests für kritische User Flows
    - **Test-Szenarien:**
      - ✅ Fragebogen ausfüllen (alle Abschnitte)
      - ✅ Validierung (Namen, E-Mail, Geburtsdatum)
      - ✅ Speichern/Laden mit Verschlüsselung (AES-256)
      - ✅ Export (JSON, GDT)
      - ✅ Sprachenwechsel (19 Sprachen)
      - ✅ Dokument-Upload + OCR + Anonymisierung
    - **Datei:** [tests/e2e/user-flow.spec.js](tests/e2e/user-flow.spec.js) (zu erstellen)

15. **Docker Production Build**
    - **Beschreibung:** Optimiertes Docker-Image mit Multi-Stage Build
    - **Features:**
      - Multi-Stage: npm install → copy libs → prune dev-deps
      - Lokale Dependencies (Bootstrap, Vosk Model)
      - Production CSP Header (kein CDN)
      - Health Check Endpoint
    - **Dateien:**
      - `Dockerfile` (aktualisieren)
      - `docker-compose.yml` (aktualisieren)
      - `.dockerignore` (erstellen)

#### 🔍 QUALITÄT & PERFORMANCE
16. **Lighthouse Performance Audit**
    - **Beschreibung:** Performance, Accessibility, Best Practices, SEO Score messen
    - **Zielwerte:**
      - Performance: >90
      - Accessibility: 100 (WCAG 2.1 AA)
      - Best Practices: >95
      - SEO: >90
    - **Command:** `npx lighthouse http://localhost:8080/index_v8_complete.html --output=html --output-path=lighthouse-report.html`
    - **Action:** Report analysieren und Optimierungen umsetzen

17. **Mobile Responsive Testing**
    - **Beschreibung:** Playwright Device Emulation Tests für verschiedene Bildschirmgrößen
    - **Devices:**
      - iPhone 12 (390x844)
      - iPhone SE (375x667)
      - iPad (768x1024)
      - Android Pixel 5 (393x851)
      - Desktop (1920x1080)
    - **Test-Punkte:**
      - Touch-Target-Größe (min 44x44px)
      - Responsive Layout (keine Horizontal-Scrolls)
      - Keyboard/Voice-Input auf Mobile
    - **Datei:** [tests/e2e/responsive.spec.js](tests/e2e/responsive.spec.js) (zu erstellen)

18. **Screen Reader Testing**
    - **Beschreibung:** Manuelles Testing mit echten Assistive Technologies
    - **Tools:**
      - NVDA (Windows, kostenlos)
      - JAWS (Windows, kommerziell)
      - VoiceOver (macOS, built-in)
      - TalkBack (Android)
    - **Test-Szenarien:**
      - Navigation mit Tab/Pfeiltasten
      - Formular-Ausfüllung nur mit Screenreader
      - Fehlermeldungen werden vorgelesen
      - Live Regions funktionieren (Save-Indicator)
    - **Dokumentation:** [TEST_DOCUMENTATION.md](TEST_DOCUMENTATION.md) aktualisieren

---

## 🚀 PRIORITÄTEN (nach Wichtigkeit)

### 🔥 KRITISCH (DSGVO/Legal)
1. **Bootstrap CDN → Lokal** (Task 12)
   - **Grund:** Externe Requests an jsdelivr.net (CloudFlare, USA)
   - **Risiko:** IP-Leak, DSGVO-Verstoß bei Produktiv-Nutzung
   - **Timeline:** Sofort (vor Deployment)

2. **Lighthouse Audit** (Task 16)
   - **Grund:** Performance-Bottlenecks identifizieren
   - **Risiko:** Schlechte UX auf langsamem Internet/Mobile
   - **Timeline:** 1 Tag

### ⚠️ HOCH (Barrierefreiheit/Testing)
3. **ARIA-Labels/Tooltips** (Task 10)
   - **Grund:** WCAG 2.1 AA Compliance, gesetzliche Pflicht in DE
   - **Risiko:** Unzugänglich für Screenreader-Nutzer
   - **Timeline:** 2-3 Stunden

4. **Playwright E2E Tests** (Task 14)
   - **Grund:** Regression-Prävention, CI/CD Ready
   - **Risiko:** Unentdeckte Bugs bei Feature-Updates
   - **Timeline:** 1-2 Tage

5. **Mobile Responsive Testing** (Task 17)
   - **Grund:** >60% der User nutzen Mobile
   - **Risiko:** Unbenutzbar auf Smartphones
   - **Timeline:** 1 Tag

### 🟢 MITTEL (Features/Optimierung)
6. **Vosk Speech Model** (Task 13)
   - **Grund:** Offline Speech-to-Text ohne Drittanbieter
   - **Risiko:** Feature fehlt, aber nicht kritisch
   - **Timeline:** 1 Stunde (Download) + 2 Stunden (Integration)

7. **Docker Production Build** (Task 15)
   - **Grund:** Einfaches Deployment, Reproduzierbarkeit
   - **Risiko:** Aktueller Docker Build nicht optimiert
   - **Timeline:** 3-4 Stunden

### 🟡 NIEDRIG (Nice-to-Have)
8. **Multi-Dokument-Upload Testing** (Task 11)
   - **Grund:** Code existiert, nur User-Testing fehlt
   - **Risiko:** Minimal, bereits implementiert
   - **Timeline:** 15 Minuten (User Testing)

9. **Screen Reader Testing** (Task 18)
   - **Grund:** Gold-Standard für Accessibility
   - **Risiko:** Automatisierte Tests (axe-core) decken viel ab
   - **Timeline:** 2-3 Stunden (manuell)

10. **Playwright Accessibility-Test fixen** (Task 9)
    - **Grund:** Automatisierte Accessibility-Checks
    - **Risiko:** Kann durch Lighthouse + manuelle Tests ersetzt werden
    - **Timeline:** 1-2 Stunden (Debug)

---

## 📦 NÄCHSTE SCHRITTE (empfohlene Reihenfolge)

### Phase 1: DSGVO-Compliance (2-3 Stunden)
```bash
# 1. Bootstrap/Icons lokal einbinden
npm install --save bootstrap@5.3.2 bootstrap-icons@1.11.2
cp node_modules/bootstrap/dist/css/bootstrap.min.css public/lib/bootstrap/
cp node_modules/bootstrap/dist/js/bootstrap.bundle.min.js public/lib/bootstrap/
cp -r node_modules/bootstrap-icons/font/* public/lib/bootstrap-icons/

# 2. CDN-Links in index_v8_complete.html ersetzen
# (Manual edit oder sed-Script)

# 3. Server neustarten und validieren
curl -s http://localhost:8080/index_v8_complete.html | grep -c "cdn.jsdelivr.net"
# Expected: 0
```

### Phase 2: Accessibility (3-4 Stunden)
```bash
# 1. ARIA-Labels hinzufügen (basierend auf Grep-Ergebnissen)
# (Manual edit in index_v8_complete.html)

# 2. Lighthouse Audit ausführen
npx lighthouse http://localhost:8080/index_v8_complete.html \
  --only-categories=accessibility,performance,best-practices \
  --output=html \
  --output-path=lighthouse-report.html

# 3. Lighthouse-Empfehlungen umsetzen
# (Basierend auf Report)
```

### Phase 3: Testing (1-2 Tage)
```bash
# 1. E2E Tests erstellen
touch tests/e2e/user-flow.spec.js
touch tests/e2e/responsive.spec.js

# 2. Tests ausführen
npx playwright test --project=chromium
npx playwright test --project=mobile-chrome

# 3. Test-Report generieren
npx playwright show-report
```

### Phase 4: Optimierung (1 Tag)
```bash
# 1. Vosk Model downloaden (im Hintergrund)
wget -O models/vosk-model-small-de-0.15.zip \
  https://alphacephei.com/vosk/models/vosk-model-small-de-0.15.zip &

# 2. Docker Build optimieren
docker build -t anamnese-a:production -f Dockerfile .
docker-compose up -d

# 3. Production-Deployment testen
docker exec -it anamnese-a curl localhost:8080/health
```

---

## 🔗 RELEVANTE DATEIEN

### Hauptanwendung
- [index_v8_complete.html](index_v8_complete.html) - Produktions-Version (1.33MB, 29.868 Zeilen)
- [translations.js](translations.js) - 10 Sprachen (erweitert zu 19 in v8)
- [encryption.js](encryption.js) - AES-256 Verschlüsselung
- [ocr-gdpr-module.js](ocr-gdpr-module.js) - DSGVO-konformes OCR

### Testing
- [tests/e2e/accessibility.spec.js](tests/e2e/accessibility.spec.js) - Accessibility-Tests
- [playwright.config.js](playwright.config.js) - Playwright-Konfiguration
- [test-bug-fixes-round2.html](test-bug-fixes-round2.html) - Bugfix-Tests

### Dokumentation
- [BUGFIX_IMPLEMENTATION_REPORT.md](BUGFIX_IMPLEMENTATION_REPORT.md) - Round 1 (7 Bugs)
- [BUGFIX_SESSION_2_REPORT.md](BUGFIX_SESSION_2_REPORT.md) - Round 2 (7 Bugs)
- [TASK_8_BOOTSTRAP_LOCAL_REPORT.md](TASK_8_BOOTSTRAP_LOCAL_REPORT.md) - Bootstrap lokal
- [README.md](README.md) - Projekt-Übersicht
- [TEST_DOCUMENTATION.md](TEST_DOCUMENTATION.md) - Test-Strategie

### Deployment
- [Dockerfile](Dockerfile) - Docker-Image
- [docker-compose.yml](docker-compose.yml) - Multi-Container-Setup
- [server.js](server.js) - Payment Generator Backend (Port 3000)

---

## 📊 CODE-METRIKEN

### Hauptdatei (index_v8_complete.html)
- **Zeilen:** 29.868
- **Größe:** 1.33 MB
- **Sprachen:** 19 (DE, EN, FR, ES, IT, TR, PL, RU, AR, ZH, PT, NL, UK, FA, UR, SQ, RO, HI, JA)
- **Letzte Änderung:** 2025-12-28 19:18 UTC

### Tests
- **Unit Tests:** 3 Dateien (tests/unit/)
- **E2E Tests:** 2 Dateien (tests/e2e/)
- **Coverage:** Nicht gemessen (TODO)

### Dependencies
- **Production:** 18 Packages (Stripe, PostgreSQL, etc.)
- **Development:** 534 Packages (Playwright, ESLint, etc.)
- **Vulnerabilities:** 0

---

## 🎯 SUCCESS CRITERIA

### Minimum Viable Product (MVP)
- [x] Alle 7 Bugfixes aus Session 2 implementiert
- [x] Deutsche Standardsprache
- [x] Erweiterte Validierung (Namen, E-Mail, DOB)
- [x] OCR-Anonymisierungs-UI
- [ ] Bootstrap/Icons lokal (DSGVO)
- [ ] Lighthouse Score >85 (alle Kategorien)
- [ ] Playwright E2E Tests (>80% Coverage)

### Gold Standard
- [ ] WCAG 2.1 AA Compliance (100%)
- [ ] Lighthouse Score >95 (alle Kategorien)
- [ ] Playwright E2E Tests (>95% Coverage)
- [ ] Docker Production Build
- [ ] Vosk Offline Speech Recognition
- [ ] Screen Reader Testing dokumentiert

---

**Erstellt:** 2025-12-29 20:30 UTC  
**Branch:** app/v8-complete-isolated  
**Letzter Update:** Accessibility-Test hängt, ARIA-Scan läuft
