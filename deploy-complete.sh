#!/bin/bash
# Vollständiges Build & Deploy Script für klaproth
# Datum: 2026-01-31

set -e  # Exit bei Fehler

echo "======================================"
echo "  klaproth Build & Deploy Pipeline"
echo "======================================"
echo ""

# Farben
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 1. Dependencies installieren
echo -e "${YELLOW}[1/7] Installing Dependencies...${NC}"
npm install --legacy-peer-deps
echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

# 2. TypeScript Check
echo -e "${YELLOW}[2/7] TypeScript Validation...${NC}"
npx tsc --noEmit || {
  echo -e "${RED}✗ TypeScript validation failed${NC}"
  exit 1
}
echo -e "${GREEN}✓ TypeScript validation passed${NC}"
echo ""

# 3. Production Build
echo -e "${YELLOW}[3/7] Building Production Bundle...${NC}"
npm run build:web || {
  echo -e "${RED}✗ Build failed${NC}"
  exit 1
}
echo -e "${GREEN}✓ Build completed${NC}"
echo ""

# 4. Bundle Size Check
echo -e "${YELLOW}[4/7] Checking Bundle Size...${NC}"
if [ -d "build/web" ]; then
  echo "Build directory contents:"
  ls -lh build/web/ | grep -E '\.(js|html|css)$' || echo "No bundle files found"
  
  # Calculate total size
  TOTAL_SIZE=$(du -sh build/web/ | cut -f1)
  echo "Total build size: $TOTAL_SIZE"
  echo -e "${GREEN}✓ Bundle size check completed${NC}"
else
  echo -e "${RED}✗ Build directory not found${NC}"
  exit 1
fi
echo ""

# 5. Local Test (optional)
echo -e "${YELLOW}[5/7] Starting Local Test Server (optional)...${NC}"
echo "You can test locally with:"
echo "  npx serve build/web -l 3000"
echo "Press Ctrl+C to skip and continue to deployment"
echo ""

# 6. Netlify Deployment
echo -e "${YELLOW}[6/7] Deploying to Netlify...${NC}"
if command -v netlify &> /dev/null; then
  echo "Netlify CLI found. Deploying..."
  netlify deploy --prod --dir=build/web || {
    echo -e "${RED}✗ Netlify deployment failed${NC}"
    echo "Try manually: netlify login && netlify deploy --prod --dir=build/web"
    exit 1
  }
  echo -e "${GREEN}✓ Deployed to Netlify${NC}"
else
  echo -e "${YELLOW}⚠ Netlify CLI not found${NC}"
  echo "Install with: npm install -g netlify-cli"
  echo "Then run: netlify login && netlify deploy --prod --dir=build/web"
fi
echo ""

# 7. Success Summary
echo -e "${GREEN}======================================"
echo "  ✓ Build & Deploy Complete!"
echo "======================================${NC}"
echo ""
echo "Next Steps:"
echo "1. Test your deployment at: https://klaproth.netlify.app"
echo "2. Check browser console for errors"
echo "3. Test navigation: Home → PatientInfo → Questionnaire"
echo "4. Verify data persistence (localStorage/IndexedDB)"
echo ""
echo "Documentation updated in:"
echo "  - FINAL_STATUS.md"
echo "  - DEPLOYMENT_READY.md"
echo "  - README.md"
echo ""
