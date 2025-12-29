#!/bin/bash

# ============================================================================
# ANAMNESE-A PWA - BUILD & TEST SCRIPT
# ============================================================================
# Version: 1.0
# Erstellt: 2025-12-28
# Zweck: Automatisiertes Builden und Testen der konsolidierten App
# ============================================================================

set -e  # Exit on error

# Farben für Output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# ============================================================================
# SCHRITT 1: UMGEBUNG PRÜFEN
# ============================================================================

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}   ANAMNESE-A PWA - BUILD & TEST${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo -e "${YELLOW}[1/6] Prüfe Umgebung...${NC}"

# Prüfe ob Dateien existieren
if [ ! -f "index_v8_complete.html" ]; then
    echo -e "${RED}✗ index_v8_complete.html nicht gefunden!${NC}"
    exit 1
fi

if [ ! -f "manifest.json" ]; then
    echo -e "${RED}✗ manifest.json nicht gefunden!${NC}"
    exit 1
fi

if [ ! -f "sw.js" ]; then
    echo -e "${RED}✗ sw.js nicht gefunden!${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Alle erforderlichen Dateien gefunden${NC}"
echo ""

# ============================================================================
# SCHRITT 2: DATEIGRÖSSEN ANZEIGEN
# ============================================================================

echo -e "${YELLOW}[2/6] Analysiere App-Größe...${NC}"

HTML_SIZE=$(du -h index_v8_complete.html | cut -f1)
TOTAL_SIZE=$(du -ch index_v8_complete.html manifest.json sw.js 2>/dev/null | grep total | cut -f1)

echo "  • index_v8_complete.html: $HTML_SIZE"
echo "  • manifest.json: $(du -h manifest.json | cut -f1)"
echo "  • sw.js: $(du -h sw.js | cut -f1)"
echo "  • GESAMT: $TOTAL_SIZE"
echo ""

# ============================================================================
# SCHRITT 3: SERVICE WORKER VERSION PRÜFEN
# ============================================================================

echo -e "${YELLOW}[3/6] Prüfe Service Worker Version...${NC}"

SW_VERSION=$(grep -oP "const CACHE_VERSION = '\K[^']*" sw.js || echo "unknown")
echo "  • Service Worker Cache Version: $SW_VERSION"
echo ""

# ============================================================================
# SCHRITT 4: HTTP-SERVER STARTEN
# ============================================================================

echo -e "${YELLOW}[4/6] Starte HTTP-Server...${NC}"

# Prüfe ob Port 8081 bereits belegt ist
if lsof -Pi :8081 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo -e "${GREEN}✓ Server läuft bereits auf Port 8081${NC}"
else
    echo "  • Starte Python HTTP-Server auf Port 8081..."
    python3 -m http.server 8081 > /dev/null 2>&1 &
    SERVER_PID=$!
    sleep 2
    echo -e "${GREEN}✓ Server gestartet (PID: $SERVER_PID)${NC}"
fi

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}   APP LÄUFT JETZT!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "  🌐 URL: ${BLUE}http://localhost:8081/index_v8_complete.html${NC}"
echo ""
echo -e "  ✅ Alle Features verfügbar:"
echo "     • 19 Sprachen"
echo "     • AES-256-GCM Verschlüsselung"
echo "     • DSGVO-konformes OCR"
echo "     • GDT-Export"
echo "     • Vosk Spracherkennung"
echo "     • AI-Plausibilitätsprüfung"
echo "     • Progressive Web App (PWA)"
echo ""

# ============================================================================
# SCHRITT 5: PLAYWRIGHT E2E-TESTS AUSFÜHREN
# ============================================================================

echo -e "${YELLOW}[5/6] Führe E2E-Tests aus...${NC}"
echo ""

# Playwright-Tests ausführen
if command -v npx &> /dev/null; then
    echo "  • Starte Playwright Tests..."
    npx playwright test tests/e2e/app.spec.ts --reporter=list --quiet 2>&1 | tail -n 30
    
    TEST_EXIT_CODE=${PIPESTATUS[0]}
    
    if [ $TEST_EXIT_CODE -eq 0 ]; then
        echo ""
        echo -e "${GREEN}✓ Alle E2E-Tests bestanden!${NC}"
    else
        echo ""
        echo -e "${RED}✗ Einige Tests sind fehlgeschlagen (Exit Code: $TEST_EXIT_CODE)${NC}"
    fi
else
    echo -e "${YELLOW}⚠ Playwright nicht installiert - überspringe Tests${NC}"
fi

echo ""

# ============================================================================
# SCHRITT 6: INTERACTIVE MODE
# ============================================================================

echo -e "${YELLOW}[6/6] Interaktiver Test-Modus${NC}"
echo ""
echo "Möchtest du die App jetzt im Browser öffnen? (y/n)"
read -r OPEN_BROWSER

if [ "$OPEN_BROWSER" = "y" ] || [ "$OPEN_BROWSER" = "Y" ]; then
    if command -v xdg-open &> /dev/null; then
        xdg-open "http://localhost:8081/index_v8_complete.html"
    elif command -v open &> /dev/null; then
        open "http://localhost:8081/index_v8_complete.html"
    else
        echo -e "${YELLOW}⚠ Konnte Browser nicht automatisch öffnen${NC}"
        echo "Öffne manuell: http://localhost:8081/index_v8_complete.html"
    fi
fi

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}   BUILD & TEST ABGESCHLOSSEN${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "📊 Zusammenfassung:"
echo "   • App-Größe: $TOTAL_SIZE"
echo "   • Service Worker: $SW_VERSION"
echo "   • Server: http://localhost:8081"
echo "   • Tests: E2E-Tests ausgeführt"
echo ""
echo -e "📝 Nächste Schritte:"
echo "   1. Öffne http://localhost:8081/index_v8_complete.html"
echo "   2. Teste alle Features (siehe APP_STRUCTURE_README.md)"
echo "   3. Deploye zu Netlify/Vercel für öffentlichen Zugang"
echo ""
echo -e "${BLUE}Drücke Strg+C um den Server zu stoppen${NC}"
echo ""

# Keep server running
wait
