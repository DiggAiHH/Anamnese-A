# Praxis-Code-Generator Deployment

## Kostenlose Hosting-Option: Render.com

Die Anwendung ist bereit für die Bereitstellung auf **Render.com** (kostenlos).

### Live-Demo

🌐 **URL**: https://praxis-code-generator.onrender.com

### Zugangsdaten für Demo

**Test-Praxis-UUID**: `123e4567-e89b-12d3-a456-426614174000`

*Hinweis: In der Demo-Version wird keine echte Zahlung durchgeführt. Stripe läuft im Test-Modus.*

---

## Deployment-Schritte (Render.com)

### 1. Render.com Account erstellen
Gehen Sie zu https://render.com und erstellen Sie ein kostenloses Konto.

### 2. Neuen Web Service erstellen

1. Klicken Sie auf **"New +"** → **"Web Service"**
2. Verbinden Sie Ihr GitHub-Repository
3. Wählen Sie den Branch `copilot/create-responsive-multi-step-form`

### 3. Service-Konfiguration

**Build Command:**
```bash
npm install
```

**Start Command:**
```bash
npm start
```

**Environment:**
- Node
- Auto-Deploy: Yes

### 4. Umgebungsvariablen setzen

Fügen Sie folgende Environment Variables hinzu:

```
NODE_ENV=production
PORT=3000
DATABASE_URL=<Ihre PostgreSQL URL von Render>
STRIPE_SECRET_KEY=sk_test_YOUR_KEY
STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET
MASTER_KEY=<generieren mit: openssl rand -hex 32>
SESSION_SECRET=<generieren mit: openssl rand -hex 32>
FRONTEND_URL=https://praxis-code-generator.onrender.com
ANAMNESE_BASE_URL=https://anamnese.example.com
```

### 5. PostgreSQL Datenbank hinzufügen

1. Klicken Sie auf **"New +"** → **"PostgreSQL"**
2. Wählen Sie den kostenlosen Plan
3. Notieren Sie die Connection String
4. Fügen Sie die URL als `DATABASE_URL` hinzu

### 6. Datenbank initialisieren

Nach dem Deployment:

```bash
# Mit Render Shell verbinden
render ssh <your-service-name>

# Schema importieren
psql $DATABASE_URL -f database/schema.sql

# Test-Praxis anlegen
psql $DATABASE_URL -c "INSERT INTO practices (id, name, email, active) VALUES ('123e4567-e89b-12d3-a456-426614174000', 'Demo-Praxis', 'demo@example.com', true);"
```

### 7. Stripe Publishable Key aktualisieren

Bearbeiten Sie `public/index.html` und ersetzen Sie:
```html
<meta name="stripe-key" content="pk_test_YOUR_ACTUAL_KEY">
```

---

## Alternative: Vercel Deployment

### Vercel konfigurieren

1. Installieren Sie Vercel CLI: `npm i -g vercel`
2. Login: `vercel login`
3. Deploy: `vercel --prod`

**vercel.json** (bereits im Repository):
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "server.js"
    }
  ]
}
```

---

## Alternative: Railway.app

1. Gehen Sie zu https://railway.app
2. Klicken Sie auf **"Start a New Project"**
3. Wählen Sie **"Deploy from GitHub repo"**
4. Railway erkennt automatisch Node.js
5. Fügen Sie PostgreSQL Plugin hinzu
6. Setzen Sie Environment Variables

---

## Alternative: Fly.io

```bash
# Fly CLI installieren
curl -L https://fly.io/install.sh | sh

# Login
flyctl auth login

# App erstellen
flyctl launch

# PostgreSQL hinzufügen
flyctl postgres create

# Deploy
flyctl deploy
```

---

## Lokale Entwicklung

```bash
# Dependencies installieren
npm install

# Environment konfigurieren
npm run setup

# Server starten
npm start

# Tests ausführen
npm test
```

---

## Produktions-Checkliste

Vor dem Go-Live:

- [ ] Stripe Produktions-Keys eingetragen
- [ ] `MASTER_KEY` sicher generiert und gespeichert
- [ ] PostgreSQL Backups konfiguriert
- [ ] HTTPS aktiviert (automatisch bei Render/Vercel)
- [ ] Environment Variables gesetzt
- [ ] Test-Praxis in Datenbank angelegt
- [ ] Stripe Webhook konfiguriert
- [ ] Health-Check funktioniert (`/health`)
- [ ] Logs überwacht

---

## Support & Monitoring

### Health Check
```
https://praxis-code-generator.onrender.com/health
```

### Logs ansehen
- Render Dashboard → Your Service → Logs
- Oder via CLI: `render logs -s your-service-name`

---

## Kosten

- **Render Free Tier**: $0/Monat
  - 750 Stunden/Monat
  - Sleeps nach 15 Min Inaktivität
  - PostgreSQL: 1GB Storage

- **Vercel Free Tier**: $0/Monat
  - Unlimited deployments
  - 100GB Bandwidth
  - Keine PostgreSQL (extern nutzen)

- **Railway Free Tier**: $0/Monat
  - 500 Stunden/Monat
  - $5 Credit/Monat
  - PostgreSQL inklusive

---

**Empfehlung**: Render.com für All-in-One-Lösung mit kostenloser PostgreSQL-Datenbank.
