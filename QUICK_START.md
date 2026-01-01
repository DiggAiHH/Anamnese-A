# Quick Start Guide - Praxis-Code-Generator

## Installation in 5 Minutes

### Prerequisites
- Node.js 18+ installed
- PostgreSQL 14+ installed and running
- Git

### Step 1: Clone and Install (1 minute)

```bash
git clone https://github.com/DiggAiHH/Anamnese-A.git
cd Anamnese-A
npm install
```

### Step 2: Configure (1 minute)

```bash
# Run interactive setup
npm run setup

# OR manually create .env
cp .env.example .env
nano .env  # Edit with your values
```

### Step 3: Database Setup (2 minutes)

```bash
# Create database
sudo -u postgres createdb anamnese

# Import schema
psql -U postgres -d anamnese -f database/schema.sql

# Add test practice (DSGVO-safe dummy address)
psql -U postgres -d anamnese -c "INSERT INTO practices (name, email, active) VALUES ('Test Practice', 'practice@invalid.test', true);"

# Get the practice UUID
psql -U postgres -d anamnese -c "SELECT id FROM practices WHERE email = 'practice@invalid.test';"
```

Copy the UUID - you'll need it to login!

### Step 4: Start Server (1 minute)

```bash
npm start
```

Server runs at `http://localhost:3000`

### Step 5: Test It!

1. Open `http://localhost:3000` in browser
2. Paste your practice UUID from Step 3
3. Follow the wizard to generate a test code

## Docker Quick Start (Even Faster!)

```bash
# Clone repo
git clone https://github.com/DiggAiHH/Anamnese-A.git
cd Anamnese-A

# Set environment variables
cp .env.example .env
nano .env  # Set STRIPE keys and MASTER_KEY

# Start everything
docker-compose up -d

# Add test practice (DSGVO-safe dummy address)
docker-compose exec db psql -U anamnese_user -d anamnese -c \
  "INSERT INTO practices (name, email, active) VALUES ('Test Practice', 'practice@invalid.test', true);"

# Get practice UUID
docker-compose exec db psql -U anamnese_user -d anamnese -c \
  "SELECT id FROM practices WHERE email = 'practice@invalid.test';"
```

Open `http://localhost:3000` and use the UUID to login!

## Stripe Test Mode Setup

1. Sign up at [stripe.com](https://stripe.com)
2. Go to **Developers → API keys**
3. Copy **Publishable key** (starts with `pk_test_`)
4. Copy **Secret key** (starts with `sk_test_`)
5. Update `.env` file
6. Update `public/js/app.js` with Publishable key:
   ```javascript
   const stripe = Stripe('pk_test_YOUR_ACTUAL_KEY');
   ```

### Test Webhook Locally

```bash
# Install Stripe CLI
brew install stripe/stripe-brew/stripe  # Mac
# or download from https://stripe.com/docs/stripe-cli

# Login
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/webhook

# Copy webhook signing secret and add to .env
STRIPE_WEBHOOK_SECRET=whsec_...
```

## Test Payment

Use Stripe test cards:
- **Success**: 4242 4242 4242 4242
- **Declined**: 4000 0000 0000 0002
- **3D Secure**: 4000 0027 6000 3184

Expiry: Any future date
CVC: Any 3 digits
ZIP: Any 5 digits

## Troubleshooting

### Database connection failed
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Check connection string in .env
DATABASE_URL=postgresql://USER:PASS@localhost:5432/anamnese
```

### Stripe error "Invalid API key"
- Make sure you copied the correct key from Stripe Dashboard
- Test keys start with `sk_test_` or `pk_test_`
- Update both `.env` and `public/js/app.js`

### Port already in use
```bash
# Change PORT in .env
PORT=3001
```

### Module not found
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## Development Mode

```bash
# Install nodemon
npm install -g nodemon

# Start with auto-reload
npm run dev
```

## Testing

```bash
# Run basic tests
npm test

# Test encryption
node test-basic.js
```

## Production Deployment

See [PRAXIS_CODE_GENERATOR_README.md](PRAXIS_CODE_GENERATOR_README.md) for detailed deployment instructions.

## Need Help?

- 📖 [Full Documentation](PRAXIS_CODE_GENERATOR_README.md)
- 🔒 [Security Guide](PRAXIS_CODE_SECURITY.md)
- 🐛 [Report Issues](https://github.com/DiggAiHH/Anamnese-A/issues)

---

**Quick Check**: After setup, you should have:
- ✅ PostgreSQL running with `anamnese` database
- ✅ `.env` file with all required variables
- ✅ At least one practice in the database
- ✅ Server running on port 3000
- ✅ Stripe test keys configured

If all boxes are checked, you're ready to go! 🚀
