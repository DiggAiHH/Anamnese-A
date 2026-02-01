# 🚀 BUILD & DEPLOY - SOFORT AUSFÜHREN

## KRITISCH: TypeScript Language Server neu starten

**WICHTIG:** Bevor Sie mit dem Build beginnen, müssen Sie den TypeScript Language Server neu starten, damit die Änderungen an `tsconfig.json` erkannt werden:

1. In VS Code: `Ctrl+Shift+P` (oder `Cmd+Shift+P` auf Mac)
2. Suchen: "TypeScript: Restart TS Server"
3. Bestätigen und warten Sie 5-10 Sekunden

## 📋 Schritt-für-Schritt Build & Deploy

### Schritt 1: Build ausführen
```bash
cd /workspaces/Anamnese-A
npm run build:web
```

**Erwartete Ausgabe:**
- Webpack kompiliert alle Dateien
- Output: `build/web/` Verzeichnis mit `index.html` und `bundle.[hash].js`
- "Compiled successfully" Meldung

**Bei Fehler:** Siehe Abschnitt "Troubleshooting" unten

### Schritt 2: Build prüfen
```bash
ls -lh build/web/
```

**Erwartung:** 
- `index.html` (ca. 1-2 KB)
- `bundle.[hash].js` (ca. 500 KB - 2 MB)
- Möglicherweise weitere Assets

### Schritt 3: Lokaler Test (optional aber empfohlen)
```bash
cd build/web
python3 -m http.server 8080
```

Dann im Browser: `http://localhost:8080`

**Erwartung:** App lädt und zeigt Home-Screen

### Schritt 4: Netlify Deploy
```bash
cd /workspaces/Anamnese-A
netlify deploy --prod --dir=build/web
```

**Erwartete Ausgabe:**
- "Deploying to live site URL..."
- "Deploy is live!"
- URL: `https://[site-name].netlify.app`

## 🔧 Troubleshooting

### Fehler: "Module 'react' not found"

**Lösung:**
```bash
# TypeScript Server neu starten (siehe oben)
# Dann:
rm -rf node_modules package-lock.json
npm install
npm run build:web
```

### Fehler: "document is not defined"

**Ursache:** `tsconfig.json` hat DOM-Bibliothek nicht geladen

**Lösung:**
1. Öffnen Sie `tsconfig.json`
2. Prüfen Sie, dass `"lib": ["ES2021", "DOM", "DOM.Iterable"]` vorhanden ist
3. TypeScript Server neu starten (siehe oben)
4. `npm run build:web` erneut ausführen

### Fehler: Webpack build fails with module resolution errors

**Lösung:**
```bash
# node_modules bereinigen
rm -rf node_modules/.cache
rm -rf build

# Neu bauen
npm run build:web
```

### Fehler: "netlify: command not found"

**Lösung:**
```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod --dir=build/web
```

### Fehler: Build erfolgreich, aber App lädt nicht

**Diagnose:**
1. Öffnen Sie die Browser-Console (F12)
2. Suchen Sie nach Fehlermeldungen
3. Häufige Ursachen:
   - MIME-Type Fehler: `netlify.toml` prüfen
   - 404 für bundle.js: `publicPath` in `webpack.config.js` prüfen
   - CORS-Fehler: Nicht relevant für statische Assets

**Lösung:**
```bash
# netlify.toml prüfen
cat netlify.toml

# Sollte enthalten:
# [[redirects]]
#   from = "/*"
#   to = "/index.html"
#   status = 200
```

## ✅ Erfolgskriterien

Nach erfolgreichem Deploy sollten Sie sehen:

1. **Terminal:**
   ```
   ✔ Deploy is live!
   Website Draft URL: https://[hash]--[site].netlify.app
   Website URL:       https://[site].netlify.app
   ```

2. **Browser (https://[site].netlify.app):**
   - App lädt ohne Fehler
   - Home-Screen mit 3 Buttons sichtbar
   - Navigation funktioniert (Test mit Button-Klicks)
   - Keine Console-Fehler (außer ggf. Warnungen)

## 📞 Wenn nichts funktioniert

1. **Vollständiger Reset:**
   ```bash
   cd /workspaces/Anamnese-A
   rm -rf node_modules package-lock.json build
   npm install
   npm run build:web
   ls -lh build/web/
   ```

2. **TypeScript Server Status prüfen:**
   - In VS Code: Öffnen Sie eine `.ts` oder `.tsx` Datei
   - Unten rechts sollte "TypeScript" mit Versionsnummer stehen
   - Wenn rot oder Fehler: Server neu starten (siehe oben)

3. **Webpack-Konfiguration validieren:**
   ```bash
   node -e "const config = require('./webpack.config.js'); console.log('Config OK:', !!config.entry)"
   ```
   Sollte ausgeben: `Config OK: true`

4. **Last Resort - Manueller Build:**
   ```bash
   # Falls npm run build:web komplett fehlschlägt
   npx webpack --mode production --config webpack.config.js
   ```

## 🎯 Nächste Schritte nach erfolgreichem Deploy

1. **Testen Sie die Live-App:**
   - Alle 3 Screens besuchen
   - Zurück-Navigation testen
   - Mobile-Ansicht prüfen (F12 → Device Toolbar)

2. **Performance prüfen:**
   - Lighthouse-Score im Browser (F12 → Lighthouse)
   - Ziel: >90 Performance, >95 Accessibility

3. **Dokumentation finalisieren:**
   - `FINAL_STATUS.md` aktualisieren
   - Live-URL eintragen
   - Screenshots erstellen

---

**WICHTIG:** Führen Sie diese Schritte in genau dieser Reihenfolge aus. Bei jedem Fehler: Stoppen, Fehlermeldung lesen, entsprechenden Troubleshooting-Abschnitt konsultieren.
