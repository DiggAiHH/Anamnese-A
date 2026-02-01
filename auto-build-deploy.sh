#!/bin/bash

# 🚀 Automatisches Build & Deploy Script für Klaproth Web
# Führt alle notwendigen Schritte aus und behebt häufige Probleme automatisch

set -e  # Bei Fehler stoppen

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 KLAPROTH WEB BUILD & DEPLOY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Farben für Output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Funktion für Erfolgsmeldungen
success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# Funktion für Warnungen
warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Funktion für Fehler
error() {
    echo -e "${RED}✗ $1${NC}"
    exit 1
}

# Schritt 1: Verzeichnis prüfen
echo "📂 Schritt 1: Verzeichnis prüfen..."
if [ ! -f "package.json" ]; then
    error "package.json nicht gefunden. Sind Sie im richtigen Verzeichnis?"
fi
success "Verzeichnis OK"
echo ""

# Schritt 2: Node-Modules prüfen
echo "📦 Schritt 2: Dependencies prüfen..."
if [ ! -d "node_modules" ]; then
    warning "node_modules fehlt. Installiere Dependencies..."
    npm install || error "npm install fehlgeschlagen"
fi
success "Dependencies OK"
echo ""

# Schritt 3: Alte Builds entfernen
echo "🧹 Schritt 3: Alte Builds bereinigen..."
rm -rf build/web
rm -rf node_modules/.cache
success "Build-Verzeichnis bereinigt"
echo ""

# Schritt 4: TypeScript-Check (ohne zu stoppen bei Fehlern)
echo "🔍 Schritt 4: TypeScript-Check..."
if npm run type-check 2>/dev/null; then
    success "TypeScript OK"
else
    warning "TypeScript-Fehler gefunden (wird trotzdem gebaut)"
fi
echo ""

# Schritt 5: Webpack-Build
echo "⚙️  Schritt 5: Webpack-Build starten..."
echo "   (Dies kann 30-60 Sekunden dauern...)"
echo ""

if npm run build:web; then
    success "Webpack-Build erfolgreich!"
else
    error "Webpack-Build fehlgeschlagen. Siehe Fehler oben."
fi
echo ""

# Schritt 6: Build-Ausgabe prüfen
echo "✅ Schritt 6: Build-Ausgabe prüfen..."
if [ ! -d "build/web" ]; then
    error "build/web Verzeichnis wurde nicht erstellt"
fi

if [ ! -f "build/web/index.html" ]; then
    error "index.html fehlt in build/web"
fi

# Bundle-Dateien finden
BUNDLE_COUNT=$(find build/web -name "bundle.*.js" | wc -l)
if [ "$BUNDLE_COUNT" -eq 0 ]; then
    error "Keine bundle.js Datei gefunden"
fi

# Größe anzeigen
BUILD_SIZE=$(du -sh build/web | cut -f1)
success "Build-Ausgabe OK (Größe: $BUILD_SIZE)"
echo ""

# Schritt 7: Dateien auflisten
echo "📄 Build-Dateien:"
ls -lh build/web/ | tail -n +2
echo ""

# Schritt 8: Netlify-Check
echo "🌐 Schritt 8: Netlify-Check..."
if command -v netlify &> /dev/null; then
    success "Netlify CLI gefunden"
    
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "✨ BUILD ERFOLGREICH! ✨"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "Nächster Schritt: Deploy zu Netlify"
    echo ""
    echo "Führen Sie aus:"
    echo "  ${GREEN}netlify deploy --prod --dir=build/web${NC}"
    echo ""
    echo "Oder für Draft-Deploy (zum Testen):"
    echo "  ${YELLOW}netlify deploy --dir=build/web${NC}"
    echo ""
    
else
    if npm exec -- netlify --version &> /dev/null; then
        success "Netlify CLI ist lokal via npm exec verfügbar"
        echo ""
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "✨ BUILD ERFOLGREICH! ✨"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo ""
        echo "Nächster Schritt: Deploy zu Netlify"
        echo ""
        echo "Option A (empfohlen, lokal):"
        echo "  ${GREEN}npm run deploy:web:prod${NC}"
        echo ""
        echo "Option B (direkt via npm exec):"
        echo "  ${GREEN}npm exec -- netlify deploy --prod --dir=build/web${NC}"
        echo ""
        echo "Hinweis: ggf. vorher ${YELLOW}npm exec -- netlify login${NC}"
        echo ""
    else
        warning "Netlify CLI nicht gefunden"
        echo ""
        echo "Installieren Sie Netlify CLI (global) ODER nutzen Sie das lokale DevDependency:"
        echo ""
        echo "Global:"
        echo "  npm install -g netlify-cli"
        echo "  netlify login"
        echo "  netlify deploy --prod --dir=build/web"
        echo ""
        echo "Lokal:"
        echo "  npm install"
        echo "  npm run deploy:web:prod"
        echo ""
    fi
fi

# Lokaler Test-Server
echo "💡 Tipp: Lokaler Test vor Deploy:"
echo "  cd build/web && python3 -m http.server 8080"
echo "  Dann öffnen: http://localhost:8080"
echo ""

# Erfolgs-Zusammenfassung
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ ALLE SCHRITTE ABGESCHLOSSEN"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
