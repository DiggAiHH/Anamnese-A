# API Specification for Anamnese-A Licensing & Billing

**Version:** 1.0  
**Date:** 2025-12-24  
**Base URL:** `https://api.anamnese-a.eu`

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [License Management Endpoints](#license-management-endpoints)
4. [Usage Metering Endpoints](#usage-metering-endpoints)
5. [Stripe Webhook Handling](#stripe-webhook-handling)
6. [n8n Workflow Examples](#n8n-workflow-examples)
7. [Error Handling](#error-handling)
8. [Rate Limiting](#rate-limiting)

---

## Overview

This API provides endpoints for:
- **License activation and validation** (offline-capable)
- **Usage receipt submission** (metered billing)
- **Stripe webhook events** (payment status, subscriptions)

**Key Principles:**
- ✅ **No patient data transmission** (only metadata)
- ✅ **EU-only hosting** (GDPR compliant)
- ✅ **HMAC signature verification** (tamper-proof receipts)
- ✅ **Idempotency** (safe retries)

---

## Authentication

### Client Authentication (App → API)

**Method:** Bearer Token (License Token)

```http
Authorization: Bearer LIC-12345-ABCDE-67890-FGHIJ
```

**Token Format:**
- Prefix: `LIC-`
- Structure: `LIC-{UUID}-{CHECKSUM}`
- Length: 50 characters
- Expiry: None (license-based, not token-based)

### Webhook Authentication (Stripe → API)

**Method:** Stripe Signature Verification

```http
Stripe-Signature: t=1703419200,v1=5257a869e7ecebeda32affa62cdca3fa51cad7e77a0e56ff536d0ce8e108d8bd
```

Verify using Stripe SDK:
```javascript
const event = stripe.webhooks.constructEvent(
  req.body,
  req.headers['stripe-signature'],
  process.env.STRIPE_WEBHOOK_SECRET
);
```

---

## License Management Endpoints

### 1. Activate License

**Endpoint:** `POST /api/license/activate`

**Purpose:** Activate a new license token for a clinic.

**Request:**
```json
{
  "token": "LIC-12345-ABCDE-67890-FGHIJ",
  "deviceId": "DEVICE-SHA256-HASH-ANONYMIZED",
  "appVersion": "8.0.0",
  "locale": "de-DE"
}
```

**Response (Success):**
```json
{
  "success": true,
  "licenseData": {
    "token": "LIC-12345-ABCDE-67890-FGHIJ",
    "clinicId": "CLINIC-789",
    "clinicName": "Praxis Dr. Müller",
    "status": "active",
    "activatedAt": "2025-12-24T10:00:00Z",
    "expiresAt": null,
    "features": {
      "gdt_export": true,
      "json_export": true,
      "ocr": true,
      "voice_input": true
    },
    "billingMode": "metered",
    "usageLimit": null
  },
  "offlineValidationToken": "JWT-EYXXXXXX",
  "validUntil": "2026-01-24T10:00:00Z"
}
```

**Response (Error - Invalid Token):**
```json
{
  "success": false,
  "error": "INVALID_TOKEN",
  "message": "License token not found or has been revoked.",
  "code": 404
}
```

**Notes:**
- `offlineValidationToken`: JWT token for offline validation (30-day validity)
- `deviceId`: Optional, anonymized device fingerprint (for fraud prevention)
- Idempotent: Calling multiple times with same token returns same result

---

### 2. Validate License

**Endpoint:** `GET /api/license/validate`

**Purpose:** Check license status (periodic sync, e.g., monthly).

**Request Headers:**
```http
Authorization: Bearer LIC-12345-ABCDE-67890-FGHIJ
```

**Response (Success):**
```json
{
  "success": true,
  "status": "active",
  "expiresAt": null,
  "features": {
    "gdt_export": true,
    "json_export": true
  },
  "billingStatus": "current",
  "nextBillingDate": "2026-01-01T00:00:00Z",
  "offlineValidationToken": "JWT-EYXXXXXX",
  "validUntil": "2026-01-24T10:00:00Z"
}
```

**Response (Payment Issue):**
```json
{
  "success": true,
  "status": "payment_pending",
  "expiresAt": null,
  "billingStatus": "past_due",
  "gracePeriodEnds": "2025-12-31T23:59:59Z",
  "message": "Payment failed. Please update your payment method.",
  "actionRequired": true,
  "actionUrl": "https://billing.anamnese-a.eu/update-payment"
}
```

**Response (Suspended):**
```json
{
  "success": false,
  "status": "suspended",
  "reason": "payment_failure_grace_period_expired",
  "message": "License suspended due to unpaid invoices. Contact billing@anamnese-a.eu",
  "code": 403
}
```

**Notes:**
- Call this endpoint every 30 days (or when app starts with internet)
- App should continue working offline if validation fails (use cached JWT)
- Grace period: 7 days after payment failure

---

### 3. Refresh License (Extend Offline Period)

**Endpoint:** `POST /api/license/refresh`

**Purpose:** Extend offline validation period (e.g., before long trip).

**Request Headers:**
```http
Authorization: Bearer LIC-12345-ABCDE-67890-FGHIJ
```

**Request:**
```json
{
  "extendDays": 90
}
```

**Response:**
```json
{
  "success": true,
  "offlineValidationToken": "JWT-EYXXXXXX-NEW",
  "validUntil": "2026-03-24T10:00:00Z",
  "message": "Offline period extended by 90 days"
}
```

**Notes:**
- Maximum extension: 90 days
- Only allowed if billing is current

---

## Usage Metering Endpoints

### 4. Submit Usage Receipt

**Endpoint:** `POST /api/usage/submit`

**Purpose:** Submit usage receipts for billing (batch or individual).

**Request Headers:**
```http
Authorization: Bearer LIC-12345-ABCDE-67890-FGHIJ
Content-Type: application/json
```

**Request Body:**
```json
{
  "receiptId": "RECEIPT-2025-12-24-001",
  "licenseId": "LIC-12345-ABCDE-67890-FGHIJ",
  "clinicId": "CLINIC-789",
  "generatedAt": "2025-12-24T23:59:59Z",
  "events": [
    {
      "eventId": "EVT-20251224-100001",
      "eventType": "gdt_export",
      "timestamp": "2025-12-24T10:15:23Z",
      "metadata": {
        "exportFormat": "GDT 3.1",
        "fieldCount": 42,
        "language": "de",
        "appVersion": "8.0.0"
      }
    },
    {
      "eventId": "EVT-20251224-100002",
      "eventType": "json_export",
      "timestamp": "2025-12-24T14:32:10Z",
      "metadata": {
        "encrypted": true,
        "fileSize": 15360,
        "language": "en"
      }
    }
  ],
  "signature": "HMAC-SHA256-HEX-STRING"
}
```

**Signature Calculation:**
```javascript
// Client-side (in Anamnese-A app)
const crypto = require('crypto');

function generateSignature(receipt, licenseSecret) {
  const payload = JSON.stringify({
    receiptId: receipt.receiptId,
    licenseId: receipt.licenseId,
    events: receipt.events.map(e => ({
      eventId: e.eventId,
      eventType: e.eventType,
      timestamp: e.timestamp
    }))
  });
  
  return crypto
    .createHmac('sha256', licenseSecret)
    .update(payload)
    .digest('hex');
}
```

**Response (Success):**
```json
{
  "success": true,
  "receiptId": "RECEIPT-2025-12-24-001",
  "recordedEvents": 2,
  "billableEvents": 2,
  "totalCost": 1.00,
  "currency": "EUR",
  "billingCycle": "2025-12",
  "message": "Usage recorded successfully"
}
```

**Response (Duplicate Receipt):**
```json
{
  "success": false,
  "error": "DUPLICATE_RECEIPT",
  "message": "Receipt RECEIPT-2025-12-24-001 has already been submitted",
  "code": 409,
  "originalSubmission": "2025-12-24T23:59:59Z"
}
```

**Response (Invalid Signature):**
```json
{
  "success": false,
  "error": "INVALID_SIGNATURE",
  "message": "Receipt signature verification failed",
  "code": 401
}
```

**Notes:**
- **Idempotent:** Same `receiptId` can be submitted multiple times (deduplicated)
- **Batching:** Can submit up to 1000 events per receipt
- **Retry Logic:** If submission fails, retry with exponential backoff
- **Offline Queue:** App stores receipts locally, submits when online

---

### 5. Get Usage Summary

**Endpoint:** `GET /api/usage/summary`

**Purpose:** Retrieve billing summary for a clinic.

**Request Headers:**
```http
Authorization: Bearer LIC-12345-ABCDE-67890-FGHIJ
```

**Query Parameters:**
- `month` (optional): YYYY-MM format (default: current month)
- `year` (optional): YYYY format (for annual summary)

**Request:**
```http
GET /api/usage/summary?month=2025-12
```

**Response:**
```json
{
  "success": true,
  "licenseId": "LIC-12345-ABCDE-67890-FGHIJ",
  "clinicId": "CLINIC-789",
  "period": {
    "start": "2025-12-01T00:00:00Z",
    "end": "2025-12-31T23:59:59Z"
  },
  "summary": {
    "totalEvents": 412,
    "billableEvents": 412,
    "totalCost": 206.00,
    "currency": "EUR",
    "breakdown": {
      "gdt_export": {
        "count": 380,
        "cost": 190.00
      },
      "json_export": {
        "count": 32,
        "cost": 16.00
      }
    }
  },
  "invoiceStatus": "pending",
  "invoiceDate": "2026-01-01T00:00:00Z",
  "paymentStatus": "current"
}
```

---

## Stripe Webhook Handling

### 6. Stripe Webhook Endpoint

**Endpoint:** `POST /api/webhooks/stripe`

**Purpose:** Receive events from Stripe (payments, subscriptions).

**Request Headers:**
```http
Stripe-Signature: t=1703419200,v1=5257a869e7ecebeda32affa62cdca3fa51cad7e77a0e56ff536d0ce8e108d8bd
Content-Type: application/json
```

**Request Body (Example - Invoice Paid):**
```json
{
  "id": "evt_1234567890",
  "object": "event",
  "type": "invoice.payment_succeeded",
  "data": {
    "object": {
      "id": "in_1234567890",
      "customer": "cus_CLINICXYZ",
      "amount_paid": 20600,
      "currency": "eur",
      "lines": {
        "data": [
          {
            "description": "Anamnese Exports × 412",
            "amount": 20600,
            "quantity": 412
          }
        ]
      },
      "metadata": {
        "licenseId": "LIC-12345-ABCDE-67890-FGHIJ",
        "clinicId": "CLINIC-789"
      }
    }
  }
}
```

**Response:**
```json
{
  "received": true
}
```

**Handled Events:**

| Event Type | Action | Description |
|------------|--------|-------------|
| `customer.subscription.created` | Log + Activate | New subscription created |
| `customer.subscription.updated` | Update status | Subscription tier changed |
| `customer.subscription.deleted` | Deactivate | Subscription canceled |
| `invoice.created` | Notify | New invoice generated |
| `invoice.payment_succeeded` | Activate/Confirm | Payment successful |
| `invoice.payment_failed` | Grace period | Payment failed, send warning |
| `payment_method.updated` | Log | Payment method changed |

**Example Handler (n8n/JavaScript):**

```javascript
// In n8n webhook node
const event = $input.all()[0].json;

switch (event.type) {
  case 'invoice.payment_succeeded':
    // Ensure license is active
    const licenseId = event.data.object.metadata.licenseId;
    await db.licenses.update(licenseId, {
      status: 'active',
      lastPayment: new Date(),
      billingStatus: 'current'
    });
    
    // Send confirmation email
    await sendEmail({
      to: event.data.object.customer_email,
      subject: 'Payment Received - Anamnese-A',
      body: `Your payment of €${event.data.object.amount_paid / 100} has been processed.`
    });
    break;
    
  case 'invoice.payment_failed':
    // Set grace period
    await db.licenses.update(licenseId, {
      status: 'payment_pending',
      gracePeriodEnds: Date.now() + 7 * 24 * 60 * 60 * 1000
    });
    
    // Send warning email
    await sendEmail({
      to: event.data.object.customer_email,
      subject: 'Payment Failed - Action Required',
      body: 'Your payment has failed. Please update your payment method within 7 days.'
    });
    break;
    
  case 'customer.subscription.deleted':
    // Deactivate license
    await db.licenses.update(licenseId, {
      status: 'canceled',
      canceledAt: new Date()
    });
    break;
}

return { received: true };
```

---

## n8n Workflow Examples

### Example 1: License Activation Workflow

**Trigger:** HTTP Webhook - POST `/api/license/activate`

**Workflow Steps:**

1. **Validate Token Format**
   - Check format: `LIC-{UUID}-{CHECKSUM}`
   - Return error if invalid

2. **Query Database**
   - Look up token in `licenses` table
   - Check status (active, suspended, canceled)

3. **Check Clinic Status**
   - Verify clinic is approved
   - Check billing is current

4. **Generate Offline Validation Token**
   ```javascript
   const jwt = require('jsonwebtoken');
   
   const token = jwt.sign(
     {
       licenseId: license.token,
       clinicId: license.clinicId,
       features: license.features,
       iat: Math.floor(Date.now() / 1000),
       exp: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60) // 30 days
     },
     process.env.JWT_SECRET
   );
   ```

5. **Update Last Validation**
   - Set `last_validated` timestamp in database

6. **Return Response**
   - Include license data + JWT token

**JSON Export:**
```json
{
  "name": "License Activation",
  "nodes": [
    {
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "position": [250, 300],
      "parameters": {
        "path": "/api/license/activate",
        "method": "POST"
      }
    },
    {
      "name": "Validate Token Format",
      "type": "n8n-nodes-base.function",
      "position": [450, 300],
      "parameters": {
        "functionCode": "const token = $json.body.token;\nif (!/^LIC-[A-Z0-9-]{40,}$/.test(token)) {\n  throw new Error('Invalid token format');\n}\nreturn $json;"
      }
    },
    {
      "name": "Query Database",
      "type": "n8n-nodes-base.postgres",
      "position": [650, 300],
      "parameters": {
        "query": "SELECT * FROM licenses WHERE token = $1",
        "values": "={{ $json.body.token }}"
      }
    }
  ]
}
```

---

### Example 2: Usage Receipt Processing

**Trigger:** HTTP Webhook - POST `/api/usage/submit`

**Workflow Steps:**

1. **Verify Signature**
   ```javascript
   const crypto = require('crypto');
   const receipt = $json.body;
   const licenseSecret = await getLicenseSecret(receipt.licenseId);
   
   const expectedSignature = crypto
     .createHmac('sha256', licenseSecret)
     .update(JSON.stringify(receipt))
     .digest('hex');
   
   if (receipt.signature !== expectedSignature) {
     throw new Error('Invalid signature');
   }
   ```

2. **Check Duplicate Receipt**
   - Query: `SELECT * FROM usage_receipts WHERE receipt_id = $1`

3. **Insert Receipt**
   - Insert into `usage_receipts` table

4. **Insert Events**
   - Loop through `events` array
   - Insert each into `usage_events` table

5. **Report to Stripe (Metered Billing)**
   ```javascript
   const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
   
   const subscription = await getSubscriptionByLicense(receipt.licenseId);
   
   await stripe.subscriptionItems.createUsageRecord(
     subscription.items.data[0].id,
     {
       quantity: receipt.events.length,
       timestamp: Math.floor(Date.now() / 1000),
       action: 'increment'
     }
   );
   ```

6. **Return Confirmation**

---

## Error Handling

### Standard Error Response Format

```json
{
  "success": false,
  "error": "ERROR_CODE",
  "message": "Human-readable error message",
  "code": 400,
  "details": {
    "field": "token",
    "issue": "Token has expired"
  }
}
```

### Error Codes

| HTTP Code | Error Code | Description |
|-----------|------------|-------------|
| 400 | `INVALID_REQUEST` | Malformed request body |
| 401 | `UNAUTHORIZED` | Missing or invalid auth token |
| 401 | `INVALID_SIGNATURE` | HMAC signature verification failed |
| 403 | `LICENSE_SUSPENDED` | License suspended (payment issue) |
| 404 | `LICENSE_NOT_FOUND` | License token not found |
| 409 | `DUPLICATE_RECEIPT` | Receipt already submitted |
| 429 | `RATE_LIMIT_EXCEEDED` | Too many requests |
| 500 | `INTERNAL_ERROR` | Server error |

---

## Rate Limiting

### Limits

| Endpoint | Rate Limit | Window |
|----------|------------|--------|
| `/api/license/activate` | 5 requests | 1 hour |
| `/api/license/validate` | 10 requests | 1 hour |
| `/api/usage/submit` | 100 requests | 1 hour |
| `/api/usage/summary` | 20 requests | 1 hour |

**Headers (in response):**
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1703423600
```

**Error Response (Rate Limit Exceeded):**
```json
{
  "success": false,
  "error": "RATE_LIMIT_EXCEEDED",
  "message": "Rate limit exceeded. Try again in 1234 seconds.",
  "code": 429,
  "retryAfter": 1234
}
```

---

## Testing

### Test Endpoints (Sandbox)

**Base URL:** `https://sandbox-api.anamnese-a.eu`

**Test License Token:**
```
LIC-TEST-12345-ABCDE-67890-FGHIJ
```

**Test Commands (curl):**

```bash
# Activate license
curl -X POST https://sandbox-api.anamnese-a.eu/api/license/activate \
  -H "Content-Type: application/json" \
  -d '{
    "token": "LIC-TEST-12345-ABCDE-67890-FGHIJ",
    "deviceId": "TEST-DEVICE",
    "appVersion": "8.0.0"
  }'

# Validate license
curl -X GET https://sandbox-api.anamnese-a.eu/api/license/validate \
  -H "Authorization: Bearer LIC-TEST-12345-ABCDE-67890-FGHIJ"

# Submit usage receipt
curl -X POST https://sandbox-api.anamnese-a.eu/api/usage/submit \
  -H "Authorization: Bearer LIC-TEST-12345-ABCDE-67890-FGHIJ" \
  -H "Content-Type: application/json" \
  -d @receipt.json
```

---

## Support

For API integration questions:
- **Documentation:** [https://docs.anamnese-a.eu](https://docs.anamnese-a.eu)
- **Email:** api-support@anamnese-a.eu
- **Slack:** Join our developer Slack

---

**Document Version History:**
- v1.0 (2025-12-24): Initial API specification
