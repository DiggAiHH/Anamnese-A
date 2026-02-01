# ⚡ SOFORT AUSFÜHREN - 3 BEFEHLE

```bash
chmod +x auto-build-deploy.sh
./auto-build-deploy.sh
npm run deploy:web:prod
```

> Wichtig: **Nicht** `npm netlify` ausführen. Das ist kein gültiger npm-Befehl.
> Falls du lieber ohne npm-script deployen willst: `npm exec -- netlify deploy --prod --dir=build/web`.

## Status: ✅ DEPLOYMENT-READY

Alle Code-Änderungen abgeschlossen. Build-Config korrekt. Nur noch ausführen.

---

## Falls Terminal-Fehler

### Schritt 1: TS Server neu starten

VS Code: `Ctrl+Shift+P` → "TypeScript: Restart TS Server"

### Schritt 2: Build

```bash
npm run build:web
```

### Schritt 3: Deploy

```bash
npm run deploy:web:prod
```

## Erfolg

URL erscheint im Output.
