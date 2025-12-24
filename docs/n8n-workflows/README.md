# n8n Workflows for Anamnese-A Stripe Integration

This directory contains ready-to-use n8n workflow templates for integrating Stripe payment processing with Anamnese-A.

## 📋 Available Workflows

### 1. Stripe Customer Portal Session (`stripe-customer-portal.json`)
Creates a Stripe Customer Portal session for clinics to manage their billing.

**Endpoint:** `POST /api/stripe/create-portal-session`

**Features:**
- Validates license token
- Retrieves Stripe customer ID from database
- Creates Customer Portal session
- Returns portal URL for redirect

**Usage:**
```javascript
const response = await fetch('https://api.anamnese-a.eu/api/stripe/create-portal-session', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer LIC-12345-ABCDE-67890-FGHIJ',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    licenseId: 'LIC-12345-ABCDE-67890-FGHIJ',
    returnUrl: 'https://anamnese-a.eu'
  })
});
```

---

### 2. Stripe Checkout Session (`stripe-checkout-session.json`)
Creates a Stripe Checkout session for initial subscription setup.

**Endpoint:** `POST /api/stripe/create-checkout-session`

**Features:**
- Validates license token
- Creates Stripe customer if needed
- Creates Checkout session with metered pricing
- Supports promotion codes

**Usage:**
```javascript
const response = await fetch('https://api.anamnese-a.eu/api/stripe/create-checkout-session', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer LIC-12345-ABCDE-67890-FGHIJ',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    licenseId: 'LIC-12345-ABCDE-67890-FGHIJ',
    priceId: 'price_XXXXXXXXXXXXXXXXXXXXXXXX',
    successUrl: 'https://anamnese-a.eu?checkout=success',
    cancelUrl: 'https://anamnese-a.eu?checkout=cancel'
  })
});
```

---

### 3. Stripe Webhook Handler (`stripe-webhook-handler.json`)
Handles Stripe webhook events for subscription and payment management.

**Endpoint:** `POST /api/webhooks/stripe`

**Handled Events:**
- `invoice.payment_succeeded` → Activate license, send confirmation email
- `invoice.payment_failed` → Set grace period, send warning email
- `customer.subscription.created` → Save subscription ID
- `customer.subscription.updated` → Update subscription status
- `customer.subscription.deleted` → Deactivate license, send cancellation email

**Features:**
- Verifies Stripe signature
- Updates license status in database
- Sends email notifications
- Logs all events

---

## 🚀 Setup Instructions

### Prerequisites

1. **n8n Installation** (EU-hosted recommended)
   - Hetzner Cloud (Germany): [Setup Guide](https://docs.n8n.io/hosting/installation/docker/)
   - Self-hosted Docker: `docker run -d -p 5678:5678 n8nio/n8n`

2. **Stripe Account** (EU entity)
   - Create account at [stripe.com](https://stripe.com)
   - Set up EU-based business entity

3. **PostgreSQL Database** (EU-hosted)
   - Hetzner, AWS RDS (eu-central-1), or Aiven

4. **SMTP Account** (for emails)
   - SendGrid, Mailgun, or any SMTP provider

### Step 1: Import Workflows

1. Open n8n dashboard
2. Click **"Workflows"** → **"Import from File"**
3. Select each JSON file and import

### Step 2: Configure Credentials

#### PostgreSQL Credential
```yaml
Host: your-database-host.eu
Port: 5432
Database: anamnese_a
User: postgres
Password: your-secure-password
SSL: enabled
```

#### Stripe API Credential
```yaml
API Key: sk_live_YOUR_SECRET_KEY_HERE (Secret Key - replace with actual key)
```

⚠️ **Important:** Use your Stripe **Secret Key** (starts with `sk_live_` for production or `sk_test_` for testing), not Publishable Key

#### SMTP Credential
```yaml
Host: smtp.sendgrid.net
Port: 587
User: apikey
Password: SG.XXXXXXXXXXXXXXXXXXXXXXXX
Secure: STARTTLS
```

### Step 3: Configure Webhooks

#### In n8n:
1. Activate each workflow
2. Copy the webhook URLs (e.g., `https://n8n.anamnese-a.eu/webhook/stripe-portal-session`)

#### In Stripe Dashboard:
1. Go to **Developers** → **Webhooks**
2. Click **"Add endpoint"**
3. Set URL: `https://n8n.anamnese-a.eu/webhook/stripe-webhooks`
4. Select events:
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Copy the **Webhook Signing Secret** (starts with `whsec_`)

### Step 4: Set Environment Variables

In your n8n instance, set:

```bash
STRIPE_WEBHOOK_SECRET=whsec_XXXXXXXXXXXXXXXXXXXXXXXX
SMTP_FROM_EMAIL=billing@anamnese-a.eu
API_BASE_URL=https://api.anamnese-a.eu
```

### Step 5: Update Database Schema

Ensure your PostgreSQL database has the required tables:

```sql
-- Add Stripe-related columns if not exist
ALTER TABLE licenses ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(50);
ALTER TABLE licenses ADD COLUMN IF NOT EXISTS stripe_subscription_id VARCHAR(50);
ALTER TABLE licenses ADD COLUMN IF NOT EXISTS last_payment TIMESTAMP;
ALTER TABLE licenses ADD COLUMN IF NOT EXISTS billing_status VARCHAR(20) DEFAULT 'current';
ALTER TABLE licenses ADD COLUMN IF NOT EXISTS grace_period_ends TIMESTAMP;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_licenses_stripe_customer ON licenses(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_licenses_token ON licenses(token);
```

---

## 🧪 Testing

### Test in Stripe Test Mode

1. **Set Test Keys** in n8n Stripe credential:
   ```
   API Key: sk_test_YOUR_TEST_SECRET_KEY_HERE (replace with actual test key)
   ```

2. **Use Test Cards:**
   - Success: `4242 4242 4242 4242`
   - Decline: `4000 0000 0000 0002`
   - Requires 3D Secure: `4000 0027 6000 3184`

3. **Trigger Test Webhooks** in Stripe Dashboard:
   - Go to **Developers** → **Webhooks** → **Test webhook**
   - Select event type and send

### Test Locally with ngrok

```bash
# Forward local n8n to public URL
ngrok http 5678

# Use ngrok URL in Stripe webhooks
# Example: https://abc123.ngrok.io/webhook/stripe-webhooks
```

---

## 📊 Monitoring

### n8n Execution Logs

View execution history in n8n:
- Click **"Executions"** in left sidebar
- Filter by workflow name
- View detailed logs for each execution

### Stripe Dashboard

Monitor events in Stripe:
- **Dashboard** → **Developers** → **Webhooks** → **View logs**
- Check delivery status and responses

### Database Queries

Check license status:
```sql
SELECT 
  token,
  status,
  stripe_customer_id,
  stripe_subscription_id,
  billing_status,
  last_payment,
  grace_period_ends
FROM licenses
WHERE token = 'LIC-12345-ABCDE-67890-FGHIJ';
```

---

## 🔒 Security Checklist

- [ ] All n8n webhooks use HTTPS
- [ ] Stripe webhook signature verification enabled
- [ ] PostgreSQL connections use SSL
- [ ] API keys stored securely (n8n credentials, not in workflows)
- [ ] SMTP credentials use app-specific passwords
- [ ] Database access restricted to n8n server IP
- [ ] n8n dashboard protected with strong password/2FA
- [ ] Webhook endpoints not publicly documented (use API gateway)

---

## 🌍 EU Compliance

### Recommended Hosting

1. **n8n:** Hetzner Cloud (Germany) or OVH (France)
2. **Database:** AWS RDS (eu-central-1) or Aiven (Frankfurt)
3. **Stripe:** Automatic EU routing (Stripe Payments Europe Ltd., Ireland)

### Data Processing Agreements (DPA)

Sign DPAs with:
- Hetzner (hosting provider)
- AWS (if using RDS)
- Stripe (payment processor)
- Email provider (SendGrid/Mailgun)

---

## 📚 Additional Resources

- [n8n Documentation](https://docs.n8n.io/)
- [Stripe API Reference](https://stripe.com/docs/api)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)
- [Stripe Customer Portal](https://stripe.com/docs/billing/subscriptions/integrating-customer-portal)
- [Stripe Metered Billing](https://stripe.com/docs/billing/subscriptions/usage-based)

---

## 🆘 Troubleshooting

### Webhook Not Receiving Events

1. Check n8n workflow is activated (green toggle)
2. Verify webhook URL is correct in Stripe
3. Check n8n firewall allows incoming traffic
4. Test with `curl`:
   ```bash
   curl -X POST https://n8n.anamnese-a.eu/webhook/stripe-webhooks \
     -H "Content-Type: application/json" \
     -d '{"type": "test"}'
   ```

### Stripe Signature Verification Fails

1. Ensure webhook secret is correct in environment variables
2. Check n8n is receiving raw request body (not parsed JSON)
3. Verify Stripe webhook endpoint uses correct secret

### Database Connection Fails

1. Check PostgreSQL credentials in n8n
2. Verify database server allows connections from n8n IP
3. Test connection with psql:
   ```bash
   psql -h your-db-host.eu -U postgres -d anamnese_a
   ```

### Email Not Sending

1. Verify SMTP credentials
2. Check email provider allows connections from n8n IP
3. Test with manual SMTP client (telnet/openssl s_client)

---

## 🤝 Support

For issues or questions:
- **Email:** support@anamnese-a.eu
- **GitHub Issues:** [DiggAiHH/Anamnese-A](https://github.com/DiggAiHH/Anamnese-A/issues)
- **n8n Community:** [community.n8n.io](https://community.n8n.io/)

---

**Last Updated:** 2025-12-24  
**Version:** 1.0
