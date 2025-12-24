# Development Bypass Mode - Testing Without Payment

## ⚠️ Security Notice

**CRITICAL: This feature is ONLY for development and testing purposes. It must NEVER be enabled in production environments.**

The bypass mode allows you to test all application features (wizard, forms, QR/PDF generation) without requiring actual Stripe payments.

## How It Works

### Security Safeguards

1. **Production Protection**: Bypass mode is **automatically disabled** if `NODE_ENV=production`, regardless of the `DEV_BYPASS_PAYMENT` setting.
2. **Explicit Opt-in**: Bypass must be explicitly enabled via environment variable.
3. **Audit Logging**: All bypass code generations are logged with `dev_bypass` status.
4. **Clear Warnings**: Server logs show prominent warning when bypass is active.

### Backend Behavior

When bypass mode is active:
- `POST /api/create-checkout-session` generates a pseudo-session ID (prefixed with `dev_bypass_`)
- Code is generated immediately using the same logic as Stripe webhooks
- A transaction record is created with status `dev_bypass` and amount `0`
- Response includes `bypass: true` flag
- All input validation and rate limiting still apply

When bypass mode is inactive:
- Normal Stripe checkout flow is used
- Payment is required before code generation
- Standard webhook processing occurs

### Frontend Behavior

When bypass mode is active:
- Stripe SDK is **not initialized** (no unnecessary external connections)
- Payment step shows "⚠️ Testmodus: Keine Zahlung erforderlich"
- Clicking "Zur Zahlung" generates code immediately (no redirect)
- Code display works identically to normal flow

When bypass mode is inactive:
- Stripe SDK is initialized normally
- Payment step shows standard payment amount
- Stripe checkout redirect occurs as expected

## Setup Instructions

### 1. Local Development Setup

Create a `.env` file in the project root:

```bash
# Copy example and edit
cp .env.example .env
```

Edit `.env` and set:

```bash
# IMPORTANT: Set NODE_ENV to development (not production)
NODE_ENV=development

# Enable bypass mode
DEV_BYPASS_PAYMENT=true

# Other required variables
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/anamnese
MASTER_KEY=your_master_key_hex
FRONTEND_URL=http://localhost:3000
ANAMNESE_BASE_URL=http://localhost:8080

# Stripe keys (still required in .env but won't be used in bypass mode)
STRIPE_SECRET_KEY=sk_test_dummy
STRIPE_PUBLISHABLE_KEY=pk_test_dummy
STRIPE_WEBHOOK_SECRET=whsec_dummy
```

### 2. Database Setup

Ensure your database is set up with the required tables:

```bash
npm run setup
```

### 3. Start Server

```bash
# Development mode with auto-reload
npm run dev

# Or standard start
npm start
```

You should see the warning in logs:
```
⚠️  DEV_BYPASS_PAYMENT is ACTIVE - Payment bypass enabled for testing
```

### 4. Test the Application

Open `http://localhost:3000` in your browser. You can now:

1. Choose "Selbst-Test" or "Medizinische Einrichtung"
2. Fill out the wizard as normal
3. At the payment step, you'll see "⚠️ Testmodus: Keine Zahlung erforderlich"
4. Click "Zur Zahlung" and code will be generated immediately
5. QR code and download functions work normally

### 5. Check Bypass Status

You can verify bypass mode is active:

```bash
curl http://localhost:3000/api/bypass-status
# Response: {"bypassEnabled":true}
```

## Testing Different Scenarios

### Test Practice User Flow
```
1. Select "Medizinische Einrichtung"
2. Login with a valid practice UUID
3. Choose mode (practice/patient)
4. Select language
5. Enter patient data (if mode=practice)
6. Generate code without payment
```

### Test Self-Test Flow
```
1. Select "Selbst-Test"
2. Select language (skips practice login and mode selection)
3. Generate code without payment
```

### Verify Database Records

Check that bypass codes are properly stored:

```sql
-- Check generated codes
SELECT practice_id, mode, language, stripe_session_id, created_at 
FROM codes 
WHERE stripe_session_id LIKE 'dev_bypass_%';

-- Check transactions
SELECT practice_id, stripe_session_id, amount_total, status, created_at
FROM transactions 
WHERE status = 'dev_bypass';

-- Check audit log
SELECT practice_id, action, details, created_at
FROM audit_log
WHERE action = 'CODE_GENERATED_BYPASS';
```

## Disabling Bypass Mode

To disable bypass and test real Stripe integration:

1. Edit `.env`:
   ```bash
   DEV_BYPASS_PAYMENT=false
   ```

2. Set real Stripe keys:
   ```bash
   STRIPE_SECRET_KEY=sk_test_YOUR_REAL_KEY
   STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_REAL_KEY
   STRIPE_WEBHOOK_SECRET=whsec_YOUR_REAL_SECRET
   ```

3. Restart the server:
   ```bash
   npm run dev
   ```

4. Test Stripe flow normally

## Production Deployment Checklist

**Before deploying to production, ensure:**

- [ ] `NODE_ENV=production` is set
- [ ] `DEV_BYPASS_PAYMENT=false` or not set at all
- [ ] Real Stripe keys are configured
- [ ] No test/bypass transaction records exist in production database
- [ ] Audit logs are reviewed for any unexpected bypass usage

## Troubleshooting

### Bypass not working?

1. Check server logs for the warning message
2. Verify `.env` has `DEV_BYPASS_PAYMENT=true`
3. Ensure `NODE_ENV` is NOT `production`
4. Check browser console for bypass mode detection
5. Test bypass status endpoint: `/api/bypass-status`

### Bypass working in production?

**This should be impossible** due to the production safeguard. If it happens:
1. Check `NODE_ENV` environment variable
2. Review server startup logs
3. Verify code deployment matches repository

### Frontend not detecting bypass?

1. Check browser console for errors
2. Verify `/api/bypass-status` returns `{"bypassEnabled":true}`
3. Clear browser cache and reload
4. Check network tab for API call responses

## Security Considerations

### Why this is safe:

1. **Production Check**: Code explicitly checks `NODE_ENV !== 'production'`
2. **Explicit Opt-in**: Requires `DEV_BYPASS_PAYMENT=true` in environment
3. **Logged**: All bypass operations are logged with special status
4. **Traceable**: Pseudo-session IDs are prefixed with `dev_bypass_`
5. **Input Validation**: All validation rules still apply
6. **Rate Limiting**: Rate limits are still enforced

### Best Practices:

1. **Never** set `DEV_BYPASS_PAYMENT=true` in production `.env`
2. **Never** commit `.env` file to git (use `.env.example` instead)
3. **Always** review environment variables before deployment
4. **Regularly** audit database for unexpected bypass records
5. **Document** any bypass usage in development notes

## Optional: Dedicated Test Page

For convenience, you can create a dedicated test page that always uses bypass mode:

Create `public/index_nopay.html`:
```html
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test Mode - Praxis-Code-Generator</title>
    <!-- Same head as index.html -->
</head>
<body>
    <!-- Add visible banner -->
    <div style="background: #ff9800; color: white; padding: 10px; text-align: center; font-weight: bold;">
        ⚠️ TESTMODUS - KEINE ZAHLUNG
    </div>
    
    <!-- Same content as index.html -->
    
    <script>
        // Force bypass mode awareness
        bypassMode = true;
    </script>
</body>
</html>
```

Access at: `http://localhost:3000/index_nopay.html`

## Support

For questions or issues:
1. Check this documentation first
2. Review server logs for errors
3. Inspect browser console for frontend errors
4. Check audit logs in database
5. Contact development team

---

**Remember: This feature is ONLY for development and testing. Production use is explicitly blocked by code.**
