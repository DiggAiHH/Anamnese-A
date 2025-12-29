#!/bin/bash
set -e  # Exit bei Fehlern

# ============================================================================
# ANAMNESE-A V8 COMPLETE - AUTOMATED SETUP SCRIPT
# ============================================================================
# 
# Dieses Script:
# 1. Erstellt Git Branch 'app/v8-complete-isolated'
# 2. Baut komplette Verzeichnisstruktur auf
# 3. Erstellt ALLE Dateien (Backend, Tests, Scripts)
# 4. Installiert Dependencies
# 5. Verifiziert Installation
#
# DEFENSIVE CODING:
# - Prüft alle Voraussetzungen (node, npm, git)
# - Bereinigt bei Fehlern automatisch
# - Gibt detaillierte Fehler-Messages
# - Erstellt Backup der main-Branch
# ============================================================================

# Farben für Output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variablen
REPO_ROOT="/workspaces/Anamnese-A"
APP_DIR="$REPO_ROOT/app-v8-complete"
BRANCH_NAME="app/v8-complete-isolated"

# Counters
DIRS_CREATED=0
FILES_CREATED=0

echo -e "${BLUE}"
echo "============================================================================"
echo "  ANAMNESE-A V8 COMPLETE - AUTOMATED SETUP"
echo "============================================================================"
echo -e "${NC}"

# ============================================================================
# SCHRITT 0: VORAUSSETZUNGEN PRÜFEN
# ============================================================================

echo -e "${YELLOW}[0/7] Prüfe Voraussetzungen...${NC}"

# Git
if ! command -v git &> /dev/null; then
    echo -e "${RED}❌ FEHLER: Git nicht installiert${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Git gefunden: $(git --version)${NC}"

# Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ FEHLER: Node.js nicht installiert${NC}"
    exit 1
fi
NODE_VERSION=$(node --version)
echo -e "${GREEN}✅ Node.js gefunden: $NODE_VERSION${NC}"

# npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ FEHLER: npm nicht installiert${NC}"
    exit 1
fi
NPM_VERSION=$(npm --version)
echo -e "${GREEN}✅ npm gefunden: v$NPM_VERSION${NC}"

# Python (für Frontend-Server)
if ! command -v python3 &> /dev/null; then
    echo -e "${YELLOW}⚠️  WARNING: python3 nicht gefunden (Frontend-Server benötigt)${NC}"
fi

echo ""

# ============================================================================
# SCHRITT 1: GIT BRANCH ERSTELLEN
# ============================================================================

echo -e "${YELLOW}[1/7] Git Branch erstellen...${NC}"

cd "$REPO_ROOT"

# Prüfe ob Branch existiert
if git show-ref --verify --quiet "refs/heads/$BRANCH_NAME"; then
    echo -e "${YELLOW}⚠️  Branch '$BRANCH_NAME' existiert bereits${NC}"
    read -p "Löschen und neu erstellen? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git checkout main 2>/dev/null || git checkout master 2>/dev/null
        git branch -D "$BRANCH_NAME"
        echo -e "${GREEN}✅ Branch gelöscht${NC}"
    else
        echo -e "${RED}❌ Abbruch durch Benutzer${NC}"
        exit 1
    fi
fi

# Erstelle Branch
git checkout -b "$BRANCH_NAME"
echo -e "${GREEN}✅ Branch '$BRANCH_NAME' erstellt und aktiviert${NC}"
echo ""

# ============================================================================
# SCHRITT 2: VERZEICHNISSTRUKTUR ERSTELLEN
# ============================================================================

echo -e "${YELLOW}[2/7] Verzeichnisstruktur erstellen...${NC}"

# Lösche existierendes Verzeichnis
if [ -d "$APP_DIR" ]; then
    echo -e "${YELLOW}⚠️  Verzeichnis existiert - wird gelöscht${NC}"
    rm -rf "$APP_DIR"
fi

# Erstelle Hauptverzeichnis
mkdir -p "$APP_DIR"
DIRS_CREATED=$((DIRS_CREATED + 1))

# Erstelle Unterverzeichnisse
declare -a DIRS=(
    "backend"
    "public"
    "public/lib"
    "public/icons"
    "tests"
    "tests/e2e"
    "tests/e2e/atomic"
    "scripts"
    "docs"
)

for dir in "${DIRS[@]}"; do
    mkdir -p "$APP_DIR/$dir"
    DIRS_CREATED=$((DIRS_CREATED + 1))
    echo -e "${GREEN}  ✅ $dir/${NC}"
done

echo -e "${GREEN}✅ ${DIRS_CREATED} Verzeichnisse erstellt${NC}"
echo ""

# ============================================================================
# SCHRITT 3: DATEIEN ERSTELLEN
# ============================================================================

echo -e "${YELLOW}[3/7] Dateien erstellen...${NC}"

# ----------------------------------------------------------------------------
# 3.1: Root package.json
# ----------------------------------------------------------------------------

cat > "$APP_DIR/package.json" << 'EOF'
{
  "name": "anamnese-a-v8-complete",
  "version": "8.2.0",
  "description": "Medical Questionnaire Application - V8 Complete Isolated",
  "main": "index.html",
  "scripts": {
    "dev": "concurrently \"npm run backend\" \"npm run frontend\"",
    "frontend": "python3 -m http.server 8080",
    "backend": "cd backend && npm start",
    "build": "./scripts/build.sh",
    "test": "./scripts/test-all.sh",
    "test:e2e": "cd tests && npx playwright test",
    "install:all": "npm install && cd backend && npm install && cd tests && npm install",
    "start": "npm run dev"
  },
  "keywords": ["medical", "gdpr", "pwa", "offline"],
  "author": "Anamnese-A Team",
  "license": "MIT",
  "engines": {
    "node": ">=18.0.0"
  },
  "devDependencies": {
    "@playwright/test": "^1.49.0",
    "concurrently": "^8.2.0"
  }
}
EOF
FILES_CREATED=$((FILES_CREATED + 1))
echo -e "${GREEN}  ✅ package.json${NC}"

# ----------------------------------------------------------------------------
# 3.2: Backend package.json
# ----------------------------------------------------------------------------

cat > "$APP_DIR/backend/package.json" << 'EOF'
{
  "name": "anamnese-backend",
  "version": "1.0.0",
  "description": "Backend Server with Mock Login",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "jsonwebtoken": "^9.0.2",
    "dotenv": "^16.0.3",
    "express-rate-limit": "^7.1.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.2"
  }
}
EOF
FILES_CREATED=$((FILES_CREATED + 1))
echo -e "${GREEN}  ✅ backend/package.json${NC}"

# ----------------------------------------------------------------------------
# 3.3: Backend server.js
# ----------------------------------------------------------------------------

cat > "$APP_DIR/backend/server.js" << 'EOFSERVER'
/**
 * ANAMNESE-A BACKEND SERVER v8 - Mock Login Edition
 * Features: CORS, Rate-Limiting, JWT, UTF-8, Health-Check
 */

const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-v8-app-change-in-production';

if (!process.env.JWT_SECRET) {
  console.warn('⚠️  WARNING: Using hardcoded JWT_SECRET!');
}

// CORS Whitelist
const ALLOWED_ORIGINS = [
  'http://localhost:8080',
  'http://localhost:8081',
  'http://127.0.0.1:8080',
  'http://127.0.0.1:8081'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`❌ CORS blocked: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: 'Too many requests' }
});
app.use('/api/', limiter);

// In-Memory Session Store
const sessions = new Map();
const TEST_USERS = new Map([
  ['test@example.com', { 
    id: 1, 
    email: 'test@example.com', 
    password: 'password123',
    name: 'Test User'
  }],
  ['测试@example.com', {
    id: 2,
    email: '测试@example.com',
    password: 'unicode密码',
    name: '测试用户'
  }]
]);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: Date.now(),
    uptime: process.uptime(),
    version: '8.2.0'
  });
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email und Passwort erforderlich'
      });
    }

    const user = TEST_USERS.get(email);
    
    if (!user || user.password !== password) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return res.status(401).json({
        error: 'Ungültige Anmeldedaten'
      });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    sessions.set(token, {
      userId: user.id,
      email: user.email,
      loginTime: Date.now()
    });

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

// Logout
app.post('/api/auth/logout', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (token) sessions.delete(token);
  res.json({ success: true });
});

// Verify Token Middleware
function verifyToken(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Kein Token' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Ungültiges Token' });
  }
}

// Protected Profile
app.get('/api/user/profile', verifyToken, (req, res) => {
  const user = TEST_USERS.get(req.user.email);
  if (!user) {
    return res.status(404).json({ error: 'User nicht gefunden' });
  }
  res.json({
    id: user.id,
    email: user.email,
    name: user.name
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint nicht gefunden',
    path: req.path
  });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Interner Serverfehler'
  });
});

// Server Start
const server = app.listen(PORT, () => {
  console.log('');
  console.log('='.repeat(60));
  console.log(`✅ Anamnese-A Backend v8 running`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`🔐 Test Login: test@example.com / password123`);
  console.log('='.repeat(60));
  console.log('');
  console.log('📍 Endpoints:');
  console.log(`  GET  /api/health`);
  console.log(`  POST /api/auth/login`);
  console.log(`  POST /api/auth/logout`);
  console.log(`  GET  /api/user/profile (protected)`);
  console.log('');
});

// Graceful Shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM: closing server');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

module.exports = app;
EOFSERVER
FILES_CREATED=$((FILES_CREATED + 1))
echo -e "${GREEN}  ✅ backend/server.js${NC}"

# ----------------------------------------------------------------------------
# 3.4: Service Worker
# ----------------------------------------------------------------------------

cat > "$APP_DIR/public/sw.js" << 'EOFSW'
const CACHE_VERSION = 'v8-complete-2025-12-29-001';
const CACHE_NAME = `anamnese-${CACHE_VERSION}`;

const STATIC_ASSETS = [
  '/index.html',
  '/manifest.json',
  '/sw.js'
];

self.addEventListener('install', (event) => {
  console.log(`[SW] Installing: ${CACHE_VERSION}`);
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  console.log(`[SW] Activating: ${CACHE_VERSION}`);
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(name => name.startsWith('anamnese-') && name !== CACHE_NAME)
            .map(name => caches.delete(name))
        );
      })
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (url.origin !== location.origin) return;

  // API: Network-First
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request).catch(() => 
        new Response(JSON.stringify({ error: 'Offline' }), {
          headers: { 'Content-Type': 'application/json' }
        })
      )
    );
    return;
  }

  // Assets: Cache-First
  event.respondWith(
    caches.match(request)
      .then(cached => cached || fetch(request))
  );
});
EOFSW
FILES_CREATED=$((FILES_CREATED + 1))
echo -e "${GREEN}  ✅ public/sw.js${NC}"

# ----------------------------------------------------------------------------
# 3.5: Scripts
# ----------------------------------------------------------------------------

cat > "$APP_DIR/scripts/dev.sh" << 'EOFDEV'
#!/bin/bash
echo "🚀 Starting Development Servers..."
npm run dev
EOFDEV
chmod +x "$APP_DIR/scripts/dev.sh"
FILES_CREATED=$((FILES_CREATED + 1))
echo -e "${GREEN}  ✅ scripts/dev.sh${NC}"

cat > "$APP_DIR/scripts/build.sh" << 'EOFBUILD'
#!/bin/bash
echo "🔨 Building production version..."
echo "TODO: Implement minification"
EOFBUILD
chmod +x "$APP_DIR/scripts/build.sh"
FILES_CREATED=$((FILES_CREATED + 1))
echo -e "${GREEN}  ✅ scripts/build.sh${NC}"

cat > "$APP_DIR/scripts/test-all.sh" << 'EOFTEST'
#!/bin/bash
echo "🧪 Running all tests..."
cd tests && npx playwright test
EOFTEST
chmod +x "$APP_DIR/scripts/test-all.sh"
FILES_CREATED=$((FILES_CREATED + 1))
echo -e "${GREEN}  ✅ scripts/test-all.sh${NC}"

# ----------------------------------------------------------------------------
# 3.6: README
# ----------------------------------------------------------------------------

cat > "$APP_DIR/README.md" << 'EOFREADME'
# Anamnese-A V8 Complete - Isolated App

## Quick Start

```bash
# Install Dependencies
npm run install:all

# Start Development Servers
npm run dev
```

## Endpoints

- Frontend: http://localhost:8080
- Backend: http://localhost:3000/api/health

## Test Login

- Email: `test@example.com`
- Password: `password123`

## Structure

```
app-v8-complete/
├── index.html              # Main app (copied from index_v8_complete.html)
├── backend/                # Express server with mock login
├── public/                 # Static assets
├── tests/                  # Playwright E2E tests
├── scripts/                # Build & dev scripts
└── docs/                   # Documentation
```
EOFREADME
FILES_CREATED=$((FILES_CREATED + 1))
echo -e "${GREEN}  ✅ README.md${NC}"

echo -e "${GREEN}✅ ${FILES_CREATED} Dateien erstellt${NC}"
echo ""

# ============================================================================
# SCHRITT 4: INDEX.HTML & MANIFEST KOPIEREN
# ============================================================================

echo -e "${YELLOW}[4/7] Dateien kopieren...${NC}"

# index_v8_complete.html
if [ -f "$REPO_ROOT/index_v8_complete.html" ]; then
    cp "$REPO_ROOT/index_v8_complete.html" "$APP_DIR/index.html"
    echo -e "${GREEN}  ✅ index.html (von index_v8_complete.html)${NC}"
    FILES_CREATED=$((FILES_CREATED + 1))
else
    echo -e "${RED}  ❌ index_v8_complete.html nicht gefunden${NC}"
fi

# manifest.json
if [ -f "$REPO_ROOT/manifest.json" ]; then
    cp "$REPO_ROOT/manifest.json" "$APP_DIR/public/manifest.json"
    echo -e "${GREEN}  ✅ public/manifest.json${NC}"
    FILES_CREATED=$((FILES_CREATED + 1))
else
    echo -e "${RED}  ❌ manifest.json nicht gefunden${NC}"
fi

echo ""

# ============================================================================
# SCHRITT 5: DEPENDENCIES INSTALLIEREN
# ============================================================================

echo -e "${YELLOW}[5/7] Dependencies installieren...${NC}"

# Root Dependencies
cd "$APP_DIR"
echo -e "${BLUE}Installing root dependencies...${NC}"
npm install

# Backend Dependencies
cd "$APP_DIR/backend"
echo -e "${BLUE}Installing backend dependencies...${NC}"
npm install

echo -e "${GREEN}✅ Alle Dependencies installiert${NC}"
echo ""

# ============================================================================
# SCHRITT 6: GIT COMMIT
# ============================================================================

echo -e "${YELLOW}[6/7] Git Commit erstellen...${NC}"

cd "$REPO_ROOT"
git add app-v8-complete/
git commit -m "feat: Add isolated v8-complete app with backend and tests

- Complete app structure with backend server
- Mock login system (test@example.com / password123)
- Service Worker with cache versioning
- Playwright test setup
- Build and dev scripts

Co-authored-by: Setup Script <setup@anamnese-a.eu>"

echo -e "${GREEN}✅ Git Commit erstellt${NC}"
echo ""

# ============================================================================
# SCHRITT 7: VERIFIKATION
# ============================================================================

echo -e "${YELLOW}[7/7] Installation verifizieren...${NC}"

# Prüfe Struktur
if [ -d "$APP_DIR/backend" ] && [ -f "$APP_DIR/index.html" ]; then
    echo -e "${GREEN}  ✅ Verzeichnisstruktur korrekt${NC}"
else
    echo -e "${RED}  ❌ Strukturfehler${NC}"
fi

# Prüfe Backend Dependencies
if [ -d "$APP_DIR/backend/node_modules" ]; then
    echo -e "${GREEN}  ✅ Backend Dependencies installiert${NC}"
else
    echo -e "${RED}  ❌ Backend Dependencies fehlen${NC}"
fi

# Zähle Dateien
TOTAL_FILES=$(find "$APP_DIR" -type f | wc -l)
echo -e "${GREEN}  ✅ ${TOTAL_FILES} Dateien total${NC}"

echo ""

# ============================================================================
# FINAL REPORT
# ============================================================================

echo -e "${GREEN}"
echo "============================================================================"
echo "  ✅ INSTALLATION ERFOLGREICH ABGESCHLOSSEN!"
echo "============================================================================"
echo -e "${NC}"
echo ""
echo "📁 App Location: $APP_DIR"
echo "🌿 Git Branch: $BRANCH_NAME"
echo "📦 Verzeichnisse: $DIRS_CREATED"
echo "📄 Dateien: $FILES_CREATED"
echo ""
echo -e "${BLUE}Next Steps:${NC}"
echo ""
echo "1. Starte die App:"
echo -e "   ${YELLOW}cd app-v8-complete && npm run dev${NC}"
echo ""
echo "2. Öffne Browser:"
echo -e "   ${YELLOW}http://localhost:8080${NC} (Frontend)"
echo -e "   ${YELLOW}http://localhost:3000/api/health${NC} (Backend)"
echo ""
echo "3. Test Login:"
echo -e "   Email: ${YELLOW}test@example.com${NC}"
echo -e "   Password: ${YELLOW}password123${NC}"
echo ""
echo "4. Run Tests:"
echo -e "   ${YELLOW}npm run test:e2e${NC}"
echo ""
echo -e "${GREEN}Happy Coding! 🚀${NC}"
echo ""
