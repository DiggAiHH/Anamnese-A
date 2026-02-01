# klaproth - Web Deployment Anleitung

## 🚀 Quick Start

### 1. Dependencies installieren

```bash
cd /workspaces/Anamnese-A
npm install --legacy-peer-deps
```

**Wichtig:** Das `--legacy-peer-deps` Flag ist erforderlich wegen Peer-Dependency-Konflikten zwischen React 18.2.0 und React DOM 18.3.1.

### 2. Entwicklungsserver starten

```bash
npm run web
```

Die App läuft auf: http://localhost:3000

### 3. Production Build erstellen

```bash
npm run build:web
```

Build-Output: `build/web/`

### 4. Build lokal testen

```bash
npx serve build/web
```

---

## 📦 Netlify Deployment

### Methode 1: Netlify CLI (Empfohlen)

```bash
# Netlify CLI installieren (einmalig)
npm install -g netlify-cli

# Bei Netlify anmelden
netlify login

# Projekt initialisieren
netlify init

# Site Name: klaproth
# Build command: npm run build:web
# Publish directory: build/web

# Deployen
netlify deploy --prod --dir=build/web
```

### Methode 2: Netlify Dashboard

1. Gehe zu https://app.netlify.com
2. Klicke auf "Add new site" → "Import an existing project"
3. Wähle dein Git-Repository aus
4. Konfiguration:
   - **Site name:** klaproth
   - **Build command:** `npm run build:web`
   - **Publish directory:** `build/web`
   - **Environment variables:** (keine erforderlich)
5. Klicke auf "Deploy site"

### Methode 3: Drag & Drop

1. Führe `npm run build:web` aus
2. Gehe zu https://app.netlify.com/drop
3. Ziehe den Ordner `build/web` auf die Seite
4. Warte auf Upload und Deployment

---

## 🔧 Automatische Skripte

Zwei Bash-Skripte wurden erstellt, um den Prozess zu automatisieren:

```bash
# Dependencies installieren
bash scripts/install-web-deps.sh

# Build und Deploy
bash scripts/build-and-deploy.sh
```

---

## 📋 Was wurde konfiguriert?

### Dateien erstellt/modifiziert:

1. **package.json**
   - Name: `klaproth`
   - Dependencies: react-native-web, react-dom hinzugefügt
   - DevDependencies: webpack, babel-loader, etc.
   - Scripts: `web`, `build:web`

2. **webpack.config.js**
   - Entry: `src/index.web.tsx`
   - Output: `build/web`
   - Aliases für native Module → Web Mocks

3. **src/index.web.tsx**
   - Web-Einstiegspunkt für React Native

4. **public/index.html**
   - HTML-Template mit Loading-Screen

5. **netlify.toml**
   - Build-Konfiguration
   - SPA-Redirects
   - Security Headers

6. **Web Mocks** (`src/infrastructure/web-mocks/`)
   - keychain.ts - localStorage Fallback
   - voice.ts - Web Speech API
   - fs.ts - localStorage + File API
   - sqlite.ts - IndexedDB Backend
   - documentPicker.ts - Browser File Picker
   - share.ts - Web Share API

---

## ⚠️ Bekannte Einschränkungen (Web)

### Nicht verfügbar im Web:
- ❌ Native Kamera/OCR (react-native-tesseract-ocr)
- ❌ Native Keychain (nutzt localStorage stattdessen)
- ❌ Native File System (nutzt localStorage)
- ❌ Native SQLite (nutzt IndexedDB)

### Eingeschränkt verfügbar:
- ⚠️ Spracherkennung: Nur in Chrome/Edge/Safari (Web Speech API)
- ⚠️ Dokument-Picker: Nur Browser-basierte Dateiauswahl
- ⚠️ Share: Funktioniert nur auf mobilen Browsern mit Web Share API

### Sicherheitshinweise:
- 🔒 localStorage ist **nicht sicher** für sensible Daten!
- 🔒 Für Produktion: Verwende serverseitige Verschlüsselung
- 🔒 HTTPS ist **zwingend erforderlich** für Web Speech API

---

## 🧪 Testing

```bash
# Unit Tests
npm test

# Lint Check
npm run lint

# Type Check
npm run type-check
```

---

## 📁 Projektstruktur (Web-spezifisch)

```
/workspaces/Anamnese-A/
├── src/
│   ├── index.web.tsx                    # Web Entry Point
│   └── infrastructure/
│       └── web-mocks/                   # Native Module Mocks
│           ├── keychain.ts
│           ├── voice.ts
│           ├── fs.ts
│           ├── sqlite.ts
│           ├── documentPicker.ts
│           └── share.ts
├── public/
│   └── index.html                       # HTML Template
├── build/
│   └── web/                             # Build Output (gitignored)
├── scripts/
│   ├── install-web-deps.sh
│   └── build-and-deploy.sh
├── webpack.config.js                    # Webpack Configuration
├── netlify.toml                         # Netlify Configuration
└── .babelrc.web                         # Babel Configuration
```

---

## 🐛 Troubleshooting

### Problem: npm install schlägt fehl
**Lösung:** Verwende `--legacy-peer-deps`:
```bash
npm install --legacy-peer-deps
```

### Problem: Webpack build schlägt fehl
**Lösung:** Prüfe ob alle Dependencies installiert sind:
```bash
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

### Problem: Web Speech API funktioniert nicht
**Lösung:**
- Prüfe ob HTTPS verwendet wird (localhost ist OK)
- Teste in Chrome/Edge (beste Unterstützung)
- Prüfe Browser-Permissions für Mikrofon

### Problem: Build ist zu groß (>1MB)
**Lösung:** Tree-Shaking aktivieren (bereits in webpack.config.js)
```bash
# Analyse der Bundle-Größe
npm install -D webpack-bundle-analyzer
npx webpack-bundle-analyzer build/web/bundle.*.js
```

---

## 📚 Weiterführende Dokumentation

- [React Native Web](https://necolas.github.io/react-native-web/)
- [Netlify Docs](https://docs.netlify.com/)
- [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
- [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)

---

## 🤝 Support

Bei Problemen:
1. Prüfe die [Known Issues](#-bekannte-einschränkungen-web)
2. Schaue in [Troubleshooting](#-troubleshooting)
3. Erstelle ein GitHub Issue

---

**Made with ❤️ by Senior Architect Agent**
**Version:** 2026-01-31
