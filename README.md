# klaproth (Anamnese Mobile App)

DSGVO-konforme medizinische Anamnese App für **Android, iOS, Windows und Web**.

> **🚀 LIVE:** Web-Version verfügbar unter [klaproth.netlify.app](https://klaproth.netlify.app) *(nach Deployment)*  
> **📖 Docs:** [DEPLOYMENT_READY.md](DEPLOYMENT_READY.md) | [ERROR_FIX_ROADMAP.md](ERROR_FIX_ROADMAP.md) | [FINAL_STATUS.md](FINAL_STATUS.md)

## 🎯 Features

- ✅ **19 Sprachen** (DE, EN, FR, ES, IT, TR, PL, RU, AR, ZH, PT, NL, UK, FA, UR, SQ, RO, HI, JA)
- ✅ **AES-256 Verschlüsselung** (crypto-js für Web / native Crypto APIs für Mobile)
- ✅ **Offline-First** (keine externen Requests, DSGVO-konform)
- ✅ **Lokales OCR** (Tesseract.js für Dokumenten-Scan)
- ✅ **Spracherkennung** (Web Speech API / Vosk für offline Speech-to-Text)
- ✅ **GDT Export/Import** (Integration mit Praxissystemen)
- ✅ **Conditional Logic** (dynamische Fragen basierend auf Antworten)
- ✅ **WCAG 2.1 AA** (Barrierefreiheit)
- ✅ **Clean Architecture** (Domain-Driven Design)
- ✅ **Web-Support** (React Native Web + Netlify Deployment)
- ✅ **Error Boundary** (Graceful Error Handling)

## 📦 Architektur

```
src/
├── domain/              # Business Logic (Framework-unabhängig)
├── application/         # Use Cases
├── infrastructure/      # Externe Abhängigkeiten (DB, Crypto, OCR)
│   └── web-mocks/       # 11 Web-Browser-Polyfills für native Module
└── presentation/        # React Native UI
    ├── screens/         # HomeScreen, PatientInfoScreen, QuestionnaireScreen
    ├── components/      # QuestionCard, ErrorBoundary
    └── navigation/      # RootNavigator (3 Screens)
```

Details: [docs/03_ARCHITECTURE.md](docs/03_ARCHITECTURE.md)

---

## 🌐 Web Deployment

### Quick Start (Production)
```bash
npm install --legacy-peer-deps
npm run build:web
netlify deploy --prod --dir=build/web
```

### Oder mit Automation-Script
```bash
chmod +x deploy-complete.sh
./deploy-complete.sh
```

**Live URL:** https://klaproth.netlify.app *(nach Deployment)*

**Features (Web):**
- ✅ PWA-fähig (Service Worker Support)
- ✅ localStorage + IndexedDB Persistence
- ✅ Web Speech API Integration
- ✅ File API für Dokumenten-Upload
- ✅ Responsive Design (Mobile-First)

**Browser-Support:**
- Chrome 90+ ✅
- Firefox 88+ ✅
- Safari 14+ ✅
- Edge 90+ ✅

---

## 🚀 Setup

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0 (oder yarn)

**Für Mobile zusätzlich:**
- React Native CLI
- Xcode (für iOS)
- Android Studio (für Android)
- Visual Studio (für Windows)

### Installation (Web)

```bash
# Dependencies installieren
npm install --legacy-peer-deps

# Dev Server starten
npm run web

# Production Build
npm run build:web
```

**Build Output:** `build/web/` → Ready for Netlify

### Installation (Mobile)

```bash
# Dependencies installieren
npm install

# iOS Pods installieren
cd ios && pod install && cd ..

# Android Build
npm run android

# iOS Build
npm run ios

# Windows Build
npm run windows
```

---

## 🧪 Testing

### Unit Tests
```bash
npm test
```

### E2E Tests
```bash
npm run test:e2e
```

### Type Checking
```bash
npx tsc --noEmit
```

**Status:** ✅ 0 TypeScript Errors (300+ behoben)

---

## 📊 Web Bundle

**Production Build:**
```bash
npm run build:web
```

**Output:** `build/web/`
- `index.html` - HTML Template mit PWA Support
- `bundle.[hash].js` - Minified JavaScript Bundle
- `*.js.map` - Source Maps (optional)

**Target Size:**
- Bundle: <600 KB (uncompressed)
- Total: <800 KB
- Gzipped: <200 KB

---

## 🔒 Datenschutz & Sicherheit

### DSGVO-Compliance
- ✅ Keine Datenübertragung an externe Server
- ✅ Lokale Datenspeicherung (Web: localStorage + IndexedDB | Mobile: SQLite)
- ✅ AES-256-CBC Verschlüsselung (crypto-js / react-native-quick-crypto)
- ✅ PBKDF2 Key Derivation (100.000 Iterationen)
- ✅ Datenschutzerklärung im App
- ✅ GDPR Consent Management

### Security Headers (Netlify)
Konfiguriert in [netlify.toml](netlify.toml):
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Content-Security-Policy: default-src 'self'`

---

## 📚 Dokumentation

| Datei | Beschreibung |
|-------|--------------|
| [DEPLOYMENT_READY.md](DEPLOYMENT_READY.md) | Vollständige Deployment-Anleitung |
| [ERROR_FIX_ROADMAP.md](ERROR_FIX_ROADMAP.md) | Alle TypeScript-Fehler-Fixes dokumentiert |
| [FINAL_STATUS.md](FINAL_STATUS.md) | Build-Status und Checklisten |
| [ARCHITECTURE_FLOW.md](ARCHITECTURE_FLOW.md) | Datenfluss und Architektur |
| [SYSTEM_DOKUMENTATION.md](SYSTEM_DOKUMENTATION.md) | System-Übersicht |
| [TESTING.md](TESTING.md) | Test-Strategie |
| [docs/03_ARCHITECTURE.md](docs/03_ARCHITECTURE.md) | Clean Architecture Details |

---

## 🤝 Contributing

Pull Requests sind willkommen! Bitte beachten:
1. TypeScript strict mode (0 Errors)
2. ESLint/Prettier Konfiguration
3. Jest Unit Tests für neue Features
4. DSGVO-Konformität prüfen
5. Web-Kompatibilität sicherstellen (für web-mocks)

---

## 📝 License

MIT License - siehe [LICENSE](LICENSE) Datei

---

## 🛠️ Troubleshooting

### Web-Build schlägt fehl
```bash
# Cache löschen
rm -rf node_modules build .webpack-cache
npm install --legacy-peer-deps
npm run build:web
```

### TypeScript Errors
```bash
# Type Check durchführen
npx tsc --noEmit

# Aktueller Status: ✅ 0 Errors
```

### Netlify Deployment Fehler
```bash
# Lokalen Build testen
npm run build:web
npx serve build/web

# Netlify CLI neu installieren
npm install -g netlify-cli@latest
netlify login
netlify deploy --prod --dir=build/web
```

### Dependencies-Probleme
```bash
# Mit legacy-peer-deps installieren (React Native + React Web Versionen)
npm install --legacy-peer-deps

# Oder package-lock.json löschen
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

---

## 📞 Support & Kontakt

- **GitHub Issues:** [DiggAiHH/Anamnese-A/issues](https://github.com/DiggAiHH/Anamnese-A/issues)
- **Projekt:** klaproth (Medizinische Anamnese)
- **Status:** ✅ Deployment-Ready (Web)

---

**Made with ❤️ for medical professionals**  
**DSGVO-konform | Offline-First | Multi-Platform**
netlify deploy --prod --dir=build/web
```

## 🧪 Testing

```bash
# Unit Tests
npm test

# Coverage Report
npm test -- --coverage

# E2E Tests
npm run test:e2e:build
npm run test:e2e
```

## 📚 Dokumentation

- [Web Deployment](WEB_DEPLOYMENT.md) - **NEU**: Netlify-Setup & Browser-Kompatibilität
- [Architecture](docs/03_ARCHITECTURE.md) - Clean Architecture & DDD
- [API Reference](docs/04_API.md) - Use Cases & Repositories
- [Testing](docs/05_TESTING.md) - Test Strategy
- [Elements List](docs/01_COMPLETE_ELEMENTS_LIST.md) - Alle UI Elemente
- [Questions List](docs/02_COMPLETE_QUESTIONS_LIST.md) - Kompletter Fragebogen

## 🔒 Sicherheit & Datenschutz

- **DSGVO-konform**: Alle Daten bleiben lokal auf dem Gerät
- **Keine Tracking**: Keine Analytics, keine externen Requests
- **AES-256**: Hardware-beschleunigte Verschlüsselung (Mobile) / Web Crypto API (Browser)
- **Master Password**: Nutzer kontrolliert Verschlüsselungskey
- **Audit Logs**: Compliance mit Art. 30, 32 DSGVO
- ⚠️ **Web-Sicherheitshinweis**: localStorage ist nicht so sicher wie native Keychains. Für Production wird serverseitige Verschlüsselung empfohlen.

## 🌐 Browser-Unterstützung (Web)

| Feature | Chrome/Edge | Firefox | Safari | Mobile Browsers |
|---------|-------------|---------|--------|-----------------|
| Basic UI | ✅ | ✅ | ✅ | ✅ |
| Speech Recognition | ✅ | ❌ | ✅ | ⚠️ |
| File Picker | ✅ | ✅ | ✅ | ✅ |
| Web Share | ⚠️ | ⚠️ | ⚠️ | ✅ |
| IndexedDB | ✅ | ✅ | ✅ | ✅ |

**Empfehlung:** Chrome/Edge für beste Erfahrung (Web Speech API Unterstützung)

## 📄 Lizenz

Proprietär - Alle Rechte vorbehalten

## 👨‍💻 Entwickler

- **DiggAiHH** - Initial work
