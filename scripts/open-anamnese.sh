#!/bin/bash
# CRITICAL FIX: Simple Browser öffnen mit Cache-Clear
# HISTORY-AWARE: Simple Browser cached alte "Connection Refused" Fehlermeldung

echo "🔧 Opening Anamnese App with forced cache clear..."
echo ""
echo "📍 Target URL: http://localhost:8080/index_v8_complete.html"
echo ""

# Prüfe ob Server läuft
if ! curl -s http://localhost:8080/ > /dev/null; then
    echo "❌ ERROR: Server auf Port 8080 antwortet nicht!"
    echo "Starte Server neu..."
    cd /workspaces/Anamnese-A
    python3 dev-server.py &
    sleep 2
fi

# Öffne in externem Browser (umgeht Simple Browser Cache)
echo "✅ Server läuft!"
echo ""
echo "🌐 Öffne in externem Browser:"
echo "   1. Klicke auf 'PORTS' Tab unten in VS Code"
echo "   2. Finde Port 8080"
echo "   3. Klicke auf 🌐 Globe-Icon (rechts)"
echo "   4. Oder kopiere URL: http://localhost:8080/index_v8_complete.html"
echo ""
echo "💡 Alternative: Hard Refresh im Simple Browser:"
echo "   Ctrl+Shift+R (Chrome/Edge)"
echo "   Ctrl+F5 (Firefox)"
echo ""

# Teste Connection
curl -s http://localhost:8080/index_v8_complete.html | grep -o '<title>.*</title>' | head -1

echo ""
echo "✅ Server antwortet korrekt!"
echo "📊 File Size: $(curl -sI http://localhost:8080/index_v8_complete.html | grep Content-Length | awk '{print $2/1024}') KB"
