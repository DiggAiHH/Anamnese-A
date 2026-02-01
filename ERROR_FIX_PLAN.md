# 🔧 30-Punkte Fehler- und Verbesserungsplan

**Projekt:** klaproth (Anamnese-A)  
**Datum:** 2026-01-31  
**Status:** 🟡 BEREIT FÜR IMPLEMENTATION

---

## 📊 Fehler-Übersicht

| Kategorie | Anzahl | Priorität |
|-----------|--------|-----------|
| Markdown-Formatierung | ~50 | P3 (Low) |
| TypeScript Web-Config | 2 | P1 (High) |
| Webpack Aliases | 3 | P1 (High) |
| Web-Mock Verbesserungen | 6 | P2 (Medium) |
| Code-Qualität | 10 | P2 (Medium) |
| Test-Abdeckung | 5 | P3 (Low) |
| Performance | 4 | P3 (Low) |

---

## 🚨 P1 - KRITISCH (Build-Blocker)

### 1. TypeScript DOM-Typen fehlen für Web

**Problem:** `tsconfig.json` hat `"lib": ["ES2021"]` ohne DOM-Typen
**Datei:** [tsconfig.json](tsconfig.json)
**Lösung:** Separate `tsconfig.web.json` für Web-Build mit DOM-Typen

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "lib": ["ES2021", "DOM", "DOM.Iterable"]
  }
}
```

### 2. Webpack Path-Aliases fehlen für @-Importe

**Problem:** Webpack hat keine Aliases für `@domain/*`, `@infrastructure/*` etc.
**Datei:** [webpack.config.js](webpack.config.js)
**Lösung:** Path-Aliases hinzufügen

```javascript
alias: {
  // Existing...
  '@domain': path.resolve(__dirname, 'src/domain'),
  '@application': path.resolve(__dirname, 'src/application'),
  '@infrastructure': path.resolve(__dirname, 'src/infrastructure'),
  '@presentation': path.resolve(__dirname, 'src/presentation'),
  '@shared': path.resolve(__dirname, 'src/shared'),
}
```

### 3. Web-Mock für react-native-gesture-handler fehlt

**Problem:** `GestureHandlerRootView` in App.tsx hat keinen Web-Mock
**Datei:** [src/presentation/App.tsx](src/presentation/App.tsx)
**Lösung:** Web-Mock erstellen oder react-native-web-Kompatibilität nutzen

### 4. Web-Mock für react-native-safe-area-context fehlt

**Problem:** `SafeAreaProvider` hat keinen Web-Mock
**Datei:** [src/presentation/App.tsx](src/presentation/App.tsx)
**Lösung:** Web-Mock erstellen

### 5. Web-Mock für @react-navigation fehlt

**Problem:** Navigation Stack hat teilweise Web-Kompatibilitätsprobleme
**Datei:** [src/presentation/navigation/RootNavigator.tsx](src/presentation/navigation/RootNavigator.tsx)
**Lösung:** `@react-navigation/web` verwenden oder Polyfills

---

## ⚠️ P2 - WICHTIG (Funktionalität)

### 6. Web-Mock keychain.ts - Sicherheitswarnung verbessern

**Problem:** localStorage-Warnung nur in console, nicht für User sichtbar
**Datei:** [src/infrastructure/web-mocks/keychain.ts](src/infrastructure/web-mocks/keychain.ts)
**Lösung:** Flag für "isSecureStorage" + UI-Warnung

### 7. Web-Mock voice.ts - Error Handling verbessern

**Problem:** Keine Wiederverbindung bei Fehlern
**Datei:** [src/infrastructure/web-mocks/voice.ts](src/infrastructure/web-mocks/voice.ts)
**Lösung:** Retry-Logic und bessere Fehlerbehandlung

### 8. Web-Mock sqlite.ts - Echte SQL-Queries unterstützen

**Problem:** Mock gibt immer leere Ergebnisse zurück
**Datei:** [src/infrastructure/web-mocks/sqlite.ts](src/infrastructure/web-mocks/sqlite.ts)
**Lösung:** sql.js oder besser implementiertes IndexedDB-Mapping

### 9. Web-Mock fs.ts - Größenbeschränkung

**Problem:** localStorage hat 5-10MB Limit
**Datei:** [src/infrastructure/web-mocks/fs.ts](src/infrastructure/web-mocks/fs.ts)
**Lösung:** Quota-Check + IndexedDB für größere Dateien

### 10. Web-Mock documentPicker.ts - Cancel Detection

**Problem:** Cancel-Event nicht korrekt erkannt
**Datei:** [src/infrastructure/web-mocks/documentPicker.ts](src/infrastructure/web-mocks/documentPicker.ts)
**Lösung:** Bessere Event-Detection

### 11. Web-Mock share.ts - Clipboard Fallback

**Problem:** Clipboard-API braucht HTTPS
**Datei:** [src/infrastructure/web-mocks/share.ts](src/infrastructure/web-mocks/share.ts)
**Lösung:** execCommand-Fallback für HTTP

### 12. DatabaseConnection - Web-Kompatibilität

**Problem:** Direkter Import von react-native-sqlite-storage
**Datei:** [src/infrastructure/persistence/DatabaseConnection.ts](src/infrastructure/persistence/DatabaseConnection.ts)
**Lösung:** Platform-Check oder Dependency Injection

### 13. HomeScreen - TODO-Kommentare

**Problem:** Navigation nicht implementiert
**Datei:** [src/presentation/screens/HomeScreen.tsx](src/presentation/screens/HomeScreen.tsx)
**Lösung:** Navigation-Props nutzen

### 14. App.tsx - console.warn für Success

**Problem:** `console.warn` für Success-Meldung ist irreführend
**Datei:** [src/presentation/App.tsx](src/presentation/App.tsx)
**Lösung:** `console.info` verwenden

### 15. i18n - Fehlende Sprachdateien prüfen

**Problem:** 19 Sprachen versprochen, Status unklar
**Datei:** [src/presentation/i18n/](src/presentation/i18n/)
**Lösung:** Alle Locale-Dateien verifizieren

---

## 📝 P3 - VERBESSERUNGEN (Code-Qualität)

### 16. Markdown-Formatierung in memory_log.md

**Problem:** ~50 Lint-Warnungen (Listen ohne Leerzeilen)
**Datei:** [memory_log.md](memory_log.md)
**Lösung:** Leerzeilen vor/nach Listen einfügen

### 17. Markdown-Formatierung in tasks.md

**Problem:** Listen ohne Leerzeilen
**Datei:** [tasks.md](tasks.md)
**Lösung:** Formatierung korrigieren

### 18. Unused Parameters in Screens

**Problem:** `_` Parameter in HomeScreen nicht optimal
**Datei:** [src/presentation/screens/HomeScreen.tsx](src/presentation/screens/HomeScreen.tsx)
**Lösung:** Props nutzen oder explizit ignorieren

### 19. Error Boundaries fehlen

**Problem:** Keine React Error Boundaries für Crash-Recovery
**Datei:** [src/presentation/App.tsx](src/presentation/App.tsx)
**Lösung:** ErrorBoundary-Komponente hinzufügen

### 20. Loading States fehlen

**Problem:** Keine Loading-Indicator während DB-Init
**Datei:** [src/presentation/App.tsx](src/presentation/App.tsx)
**Lösung:** SplashScreen oder Loading-State

### 21. TypeScript strict Mode Violations

**Problem:** Potenzielle `any`-Types in Mocks
**Datei:** Verschiedene Web-Mocks
**Lösung:** Strikte Typen definieren

### 22. Code Duplication in Repositories

**Problem:** SQLite-Repositories haben ähnlichen Code
**Datei:** [src/infrastructure/persistence/](src/infrastructure/persistence/)
**Lösung:** BaseRepository-Klasse extrahieren

### 23. Magic Strings

**Problem:** Hardcodierte Farben, Texte
**Datei:** [src/presentation/screens/HomeScreen.tsx](src/presentation/screens/HomeScreen.tsx)
**Lösung:** Theme-System oder Konstanten

### 24. Missing JSDoc in Web-Mocks

**Problem:** Einige Funktionen ohne Dokumentation
**Datei:** Web-Mocks
**Lösung:** JSDoc hinzufügen

### 25. Test-Coverage für Web-Mocks

**Problem:** Keine Unit-Tests für Web-Mocks
**Datei:** [src/infrastructure/web-mocks/](src/infrastructure/web-mocks/)
**Lösung:** Tests hinzufügen

---

## 🚀 DEPLOYMENT (Netlify)

### 26. Dependencies installieren

**Kommando:**
```bash
cd /workspaces/Anamnese-A
npm install --legacy-peer-deps
```

### 27. Web-Build erstellen

**Kommando:**
```bash
npm run build:web
```

**Erwartetes Ergebnis:** `build/web/` Verzeichnis mit Bundle

### 28. Build lokal testen

**Kommando:**
```bash
npx serve build/web
```

**Prüfen:** http://localhost:3000 lädt ohne Fehler

### 29. Netlify CLI installieren & Login

**Kommando:**
```bash
npm install -g netlify-cli
netlify login
```

### 30. Deploy zu Netlify

**Kommando:**
```bash
netlify init  # Site: klaproth
netlify deploy --prod --dir=build/web
```

**Erwartetes Ergebnis:** https://klaproth.netlify.app live

---

## 📋 Implementierungs-Reihenfolge

### Phase 1: Build-Blocker (P1) - 30 Min
1. tsconfig.web.json erstellen
2. Webpack Aliases hinzufügen
3. Web-Mocks für gesture-handler, safe-area-context erstellen
4. Build testen

### Phase 2: Funktionalität (P2) - 60 Min
5. Web-Mocks verbessern (sqlite, voice, keychain)
6. DatabaseConnection Web-kompatibel machen
7. HomeScreen Navigation implementieren
8. console.warn → console.info

### Phase 3: Code-Qualität (P3) - 30 Min
9. Markdown-Formatierung fixen
10. Error Boundary hinzufügen
11. Loading State hinzufügen
12. Tests für Web-Mocks

### Phase 4: Deployment - 15 Min
13. npm install
14. npm run build:web
15. Lokaler Test
16. netlify deploy

**Gesamtzeit:** ~2-3 Stunden

---

## ✅ Definition of Done

- [ ] `npm run build:web` erfolgreich ohne Fehler
- [ ] `npm run type-check` erfolgreich
- [ ] `npm run lint` zeigt keine Errors
- [ ] Lokaler Test zeigt App ohne Console-Errors
- [ ] Netlify Deploy erfolgreich
- [ ] Live-URL lädt und zeigt HomeScreen
- [ ] Navigation funktioniert (soweit implementiert)
- [ ] Dokumentation aktualisiert

---

## 🔗 Referenz-Dateien

### Zu ändern (P1):
- [tsconfig.json](tsconfig.json) → tsconfig.web.json erstellen
- [webpack.config.js](webpack.config.js) → Aliases hinzufügen

### Zu erstellen (P1):
- `src/infrastructure/web-mocks/gestureHandler.ts`
- `src/infrastructure/web-mocks/safeAreaContext.ts`

### Zu verbessern (P2):
- [src/infrastructure/web-mocks/sqlite.ts](src/infrastructure/web-mocks/sqlite.ts)
- [src/infrastructure/web-mocks/voice.ts](src/infrastructure/web-mocks/voice.ts)
- [src/infrastructure/web-mocks/keychain.ts](src/infrastructure/web-mocks/keychain.ts)

### Zu formatieren (P3):
- [memory_log.md](memory_log.md)
- [tasks.md](tasks.md)

---

## 🤖 Für nächsten Agent

**Start-Befehl:**
```
Implementiere den 30-Punkte-Plan in ERROR_FIX_PLAN.md.
Beginne mit Phase 1 (Build-Blocker).
Aktualisiere memory_log.md und tasks.md nach jeder Phase.
```

**Priorität:** P1 → P2 → P3 → Deploy

**Zeitbudget:** ~2-3 Stunden

---

_Plan erstellt von Senior Architect Agent am 2026-01-31_
