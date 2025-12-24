# EU-Only Offline-First Licensing & Usage-Based Billing Integration

**Version:** 1.0  
**Date:** 2025-12-24  
**Status:** Design Specification

---

## Table of Contents

1. [Overview](#overview)
2. [Core Principles](#core-principles)
3. [Architecture](#architecture)
4. [Offline-Only Patient Data Handling](#offline-only-patient-data-handling)
5. [Online Components (EU-Only)](#online-components-eu-only)
6. [Usage-Based Pricing Model](#usage-based-pricing-model)
7. [Registration & Approval Workflow](#registration--approval-workflow)
8. [n8n Workflow Specifications](#n8n-workflow-specifications)
9. [Security & GDPR Compliance](#security--gdpr-compliance)
10. [Implementation Guide](#implementation-guide)
11. [EU Hosting Recommendations](#eu-hosting-recommendations)

---

## Overview

This document describes the architecture for adding **licensing and usage-based billing** to the Anamnese-A medical history application while maintaining **absolute privacy** for patient data. The system ensures:

- **Zero patient data transmission**: All patient information stays offline on the clinic's device
- **EU-only infrastructure**: All backend services hosted exclusively in EU regions
- **Usage-based billing**: Charge per successful Anamnese export (GDT, JSON, etc.)
- **GDPR compliance**: Data minimization, purpose limitation, and full audit trail
- **Simple integration**: Minimal changes to existing offline-first application

---

## Core Principles

### 1. **Patient Data Never Goes Online**
- All patient answers, medical history, personal information remain **100% local**
- No cloud storage, no API calls with patient data
- Export files (GDT, JSON) generated and saved locally only

### 2. **EU-Only Backend Services**
- All licensing, billing, and analytics infrastructure hosted in EU (GDPR Art. 44-50)
- Stripe EU instance for payment processing
- n8n workflows hosted on EU servers (e.g., Hetzner, OVH, AWS eu-central-1)

### 3. **Usage-Based Billing**
- Charge per successful export/use of completed Anamnese
- Metered billing using Stripe API or subscription with usage tracking
- Transparent pricing with clear ROI for clinics

### 4. **Offline-First License Activation**
- License tokens work offline after initial activation
- Periodic license verification (configurable, e.g., monthly)
- Grace periods for connectivity issues

### 5. **Data Minimization (GDPR Art. 5)**
- Only transmit: License ID, usage count, timestamp, clinic ID
- No patient identifiers, no medical content
- Pseudonymized analytics only

---

## Architecture

### High-Level Component Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                      CLINIC DEVICE (OFFLINE)                     │
│                                                                   │
│  ┌────────────────────────────────────────────────────────┐    │
│  │         Anamnese-A Web App (index_v8_complete.html)    │    │
│  │                                                          │    │
│  │  ┌──────────────────────────────────────────────────┐  │    │
│  │  │  Patient Data Layer (100% LOCAL)                 │  │    │
│  │  │  - Medical History                               │  │    │
│  │  │  - Personal Information                          │  │    │
│  │  │  - Encrypted Storage (AES-256-GCM)              │  │    │
│  │  │  - Local Export (GDT, JSON)                     │  │    │
│  │  └──────────────────────────────────────────────────┘  │    │
│  │                                                          │    │
│  │  ┌──────────────────────────────────────────────────┐  │    │
│  │  │  Licensing Layer (METADATA ONLY)                 │  │    │
│  │  │  - License Token (offline-capable)              │  │    │
│  │  │  - Usage Counter (local)                        │  │    │
│  │  │  - Signed Usage Receipt Generator               │  │    │
│  │  └──────────────────────────────────────────────────┘  │    │
│  └────────────────────────────────────────────────────────┘    │
│                           │                                      │
│                           │ HTTPS (Metadata Only)                │
│                           ▼                                      │
└─────────────────────────────────────────────────────────────────┘
                            │
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│                   ONLINE SERVICES (EU-ONLY)                      │
│                                                                   │
│  ┌────────────────────────────────────────────────────────┐    │
│  │              n8n Automation Hub (Hetzner EU)           │    │
│  │                                                          │    │
│  │  [Webhook] License Activation                          │    │
│  │  [Webhook] Usage Receipt Submission                    │    │
│  │  [Webhook] Stripe Event Handler                        │    │
│  │  [Workflow] Daily Usage Aggregation                    │    │
│  │  [Workflow] Invoice Generation                         │    │
│  │  [Workflow] Email Notifications                        │    │
│  └────────────────────────────────────────────────────────┘    │
│                           │                                      │
│                           │                                      │
│  ┌────────────────────────▼───────────────────────────────┐    │
│  │          Database (PostgreSQL/Redis - EU)              │    │
│  │  - Clinic Accounts                                     │    │
│  │  - License Tokens                                      │    │
│  │  - Usage Receipts (aggregated, anonymized)            │    │
│  │  - Subscription Status                                 │    │
│  └────────────────────────────────────────────────────────┘    │
│                           │                                      │
│                           │                                      │
│  ┌────────────────────────▼───────────────────────────────┐    │
│  │              Stripe (EU Instance)                      │    │
│  │  - Customer Portal                                     │    │
│  │  - Metered Billing / Subscriptions                    │    │
│  │  - Invoice Generation                                  │    │
│  │  - Payment Processing (EU only)                        │    │
│  └────────────────────────────────────────────────────────┘    │
└───────────────────────────────────────────────────────────────┘
```

---

## Offline-Only Patient Data Handling

### What Stays Offline (100%)

| Data Type | Storage Location | Transmission |
|-----------|------------------|--------------|
| Patient Name | `localStorage` (encrypted) | **NEVER** |
| Date of Birth | `localStorage` (encrypted) | **NEVER** |
| Medical History | `localStorage` (encrypted) | **NEVER** |
| Medications | `localStorage` (encrypted) | **NEVER** |
| Allergies | `localStorage` (encrypted) | **NEVER** |
| Lifestyle Data | `localStorage` (encrypted) | **NEVER** |
| OCR Text | `localStorage` (encrypted) | **NEVER** |
| Exported GDT Files | Local filesystem | **NEVER** |
| Exported JSON Files | Local filesystem | **NEVER** |

### Technical Guarantees

1. **No Network Calls with Patient Data**
   ```javascript
   // ✅ ALLOWED: Usage metadata only
   fetch('/api/usage', {
     method: 'POST',
     body: JSON.stringify({
       licenseId: 'LIC-12345',
       eventType: 'gdt_export',
       timestamp: '2025-12-24T10:00:00Z',
       clinicId: 'CLINIC-789'
     })
   });
   
   // ❌ FORBIDDEN: Patient data
   fetch('/api/usage', {
     method: 'POST',
     body: JSON.stringify({
       patientName: 'John Doe',  // ❌ NO!
       diagnosis: 'Diabetes',     // ❌ NO!
       medications: ['Insulin']   // ❌ NO!
     })
   });
   ```

2. **Content Security Policy (CSP)**
   - Already implemented in `index_v8_complete.html`
   - Prevents unauthorized external connections
   - Audit external script sources

3. **User Notification**
   - Clear UI message: "Your patient data stays on this device"
   - Transparency about what metadata is sent (license ID, usage count)

---

## Online Components (EU-Only)

### 1. License Management Service

**Purpose:** Activate and validate clinic licenses without patient data

**Endpoints:**
- `POST /api/license/activate` - Activate a license token
- `GET /api/license/validate` - Check license status (offline-capable)
- `POST /api/license/refresh` - Refresh license for extended offline period

**Data Transmitted:**
- License Token (UUID)
- Clinic ID (pseudonymized)
- Device Fingerprint (optional, anonymized)
- Last Sync Timestamp

**Data NOT Transmitted:**
- Patient names, DOB, medical data
- Specific patient count
- Export file contents

### 2. Usage Metering Service

**Purpose:** Track billable events (exports) for accurate invoicing

**Endpoints:**
- `POST /api/usage/submit` - Submit usage receipt(s)
- `GET /api/usage/summary` - Get billing summary for clinic

**Usage Receipt Format:**
```json
{
  "receiptId": "RECEIPT-2025-12-24-001",
  "licenseId": "LIC-12345-ABCDE",
  "clinicId": "CLINIC-789",
  "events": [
    {
      "eventId": "EVT-001",
      "eventType": "gdt_export",
      "timestamp": "2025-12-24T10:15:00Z",
      "metadata": {
        "exportFormat": "GDT 3.1",
        "fieldCount": 42
      }
    }
  ],
  "signature": "SHA256-HMAC-signature-here",
  "generatedAt": "2025-12-24T23:59:59Z"
}
```

**Fields Explained:**
- `eventType`: Type of billable event (`gdt_export`, `json_export`, `pdf_export`)
- `timestamp`: When export occurred (UTC)
- `metadata`: Non-patient technical data (format, field count, language)
- `signature`: HMAC signature for tamper-proofing

### 3. Stripe Integration

**Billing Models:**

#### Option A: Metered Billing (Recommended)
- **Pricing:** €0.50 per successful export
- **Billing Cycle:** Monthly
- **Implementation:** Stripe Metered Billing API
- **Benefits:**
  - Pay only for actual usage
  - No upfront commitment
  - Automatic scaling

**Stripe Setup:**
```javascript
// Create metered pricing in Stripe
const price = await stripe.prices.create({
  product: 'prod_AnamneseExports',
  unit_amount: 50, // €0.50 = 50 cents
  currency: 'eur',
  recurring: {
    interval: 'month',
    usage_type: 'metered',
  },
});
```

#### Option B: Subscription Tiers (Alternative)
- **Tier 1:** €99/month - Up to 250 exports
- **Tier 2:** €249/month - Up to 750 exports
- **Tier 3:** €499/month - Unlimited exports
- **Benefits:**
  - Predictable monthly costs
  - Simpler for clinic budgeting

### 4. Stripe Customer Portal

**Purpose:** Self-service billing management for clinics

**Features:**
- View invoices
- Update payment methods
- Change subscription tier
- Download receipts
- Cancel subscription

**Implementation:**
```javascript
// Generate Customer Portal link
const session = await stripe.billingPortal.sessions.create({
  customer: 'cus_ClinicXYZ',
  return_url: 'https://licensing.anamnese-a.eu/dashboard',
});
// Redirect clinic admin to: session.url
```

---

## Usage-Based Pricing Model

### Billable Events

| Event Type | Description | Price (€) |
|------------|-------------|-----------|
| `gdt_export` | GDT file export to PVS | 0.50 |
| `json_export` | JSON export with encryption | 0.50 |
| `pdf_export` | PDF generation (future) | 0.50 |
| `email_export` | Email with encrypted data | 0.50 |

### Non-Billable Events (Free)

- Data entry/editing
- Local storage (save)
- Language changes
- Print preview (no export)
- License validation checks
- OCR processing (local)

### Pricing Rationale

See [ROI.md](./ROI.md) for detailed ROI calculator and clinic cost-benefit analysis.

**Quick Summary:**
- **Cost per export:** €0.50
- **Typical clinic:** 20 patients/day × €0.50 = €10/day
- **Monthly cost:** ~€200 for 400 exports
- **ROI:** Saves 5-10 min/patient = 100-200 min/day = €150-300/day in staff time
- **Break-even:** Day 1 (immediate positive ROI)

---

## Registration & Approval Workflow

### 1. Clinic Registration

**Process:**
1. Clinic visits registration portal: `https://register.anamnese-a.eu`
2. Fills application form:
   - Clinic Name
   - Tax ID / Registration Number
   - Contact Person (Name, Email, Phone)
   - Address (billing + practice)
   - Estimated Monthly Usage
   - Preferred Payment Method
3. Accepts Terms of Service & GDPR Data Processing Agreement
4. Submits application

**Backend (n8n Workflow):**
- Store application in database
- Send confirmation email to clinic
- Notify admin team for review
- Create pending account in Stripe

### 2. Admin Approval

**Manual Review (via Admin Dashboard):**
- Verify clinic credentials (medical license, tax ID)
- Check for fraud indicators
- Approve or reject application

**Automated Actions (n8n):**
- If approved:
  - Generate license token
  - Create Stripe customer
  - Set up subscription/metered billing
  - Send welcome email with license token
  - Enable account
- If rejected:
  - Send rejection email with reason
  - Log decision for compliance

### 3. License Activation

**Clinic Side:**
1. Open Anamnese-A app
2. Go to Settings → License
3. Enter license token: `LIC-12345-ABCDE-67890`
4. Click "Activate"

**App Behavior:**
```javascript
async function activateLicense(token) {
  // 1. Validate token format
  if (!isValidTokenFormat(token)) {
    return { success: false, error: 'Invalid token format' };
  }
  
  // 2. Call activation API
  const response = await fetch('https://api.anamnese-a.eu/license/activate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      token: token,
      deviceId: getDeviceFingerprint(), // Anonymized
      appVersion: '8.0.0'
    })
  });
  
  const result = await response.json();
  
  if (result.success) {
    // 3. Store license locally
    localStorage.setItem('licenseToken', token);
    localStorage.setItem('licenseStatus', 'active');
    localStorage.setItem('licenseExpiry', result.expiresAt);
    localStorage.setItem('licenseData', JSON.stringify(result.licenseData));
    
    return { success: true };
  } else {
    return { success: false, error: result.message };
  }
}
```

### 4. Subscription Management

**Clinic Admin Access:**
- Login to Customer Portal: `https://billing.anamnese-a.eu`
- SSO via Stripe Customer Portal

**Available Actions:**
- View current usage (monthly)
- Download invoices
- Update payment method
- Upgrade/downgrade plan
- Cancel subscription (with notice period)

---

## n8n Workflow Specifications

### Workflow 1: License Provisioning

**Trigger:** Clinic application approved (manual or webhook)

**Steps:**
1. **Generate License Token**
   - Format: `LIC-{UUID}-{CHECKSUM}`
   - Store in database: `licenses` table

2. **Create Stripe Customer**
   ```javascript
   const customer = await stripe.customers.create({
     name: clinic.name,
     email: clinic.contactEmail,
     metadata: {
       clinicId: clinic.id,
       licenseId: licenseToken
     }
   });
   ```

3. **Create Subscription**
   ```javascript
   const subscription = await stripe.subscriptions.create({
     customer: customer.id,
     items: [{ price: 'price_MeteredExport' }],
     billing_cycle_anchor: 'now',
     metadata: {
       licenseId: licenseToken
     }
   });
   ```

4. **Send Welcome Email**
   - Subject: "Welcome to Anamnese-A - Your License is Ready"
   - Body: License token, activation instructions, support contact

5. **Log Event**
   - Audit log: "License provisioned for clinic {clinicId}"

### Workflow 2: Usage Receipt Processing

**Trigger:** POST to `/api/usage/submit`

**Steps:**
1. **Validate Receipt**
   - Check signature (HMAC-SHA256)
   - Verify license is active
   - Check for duplicate receipt IDs

2. **Parse Events**
   ```javascript
   receipt.events.forEach(event => {
     // Extract billable event
     const usageRecord = {
       licenseId: receipt.licenseId,
       clinicId: receipt.clinicId,
       eventType: event.eventType,
       timestamp: event.timestamp,
       receiptId: receipt.receiptId
     };
     
     // Store in database
     db.usage.insert(usageRecord);
   });
   ```

3. **Report to Stripe (Metered Billing)**
   ```javascript
   await stripe.subscriptionItems.createUsageRecord(
     subscriptionItemId,
     {
       quantity: receipt.events.length, // Number of exports
       timestamp: Math.floor(Date.now() / 1000),
       action: 'increment'
     }
   );
   ```

4. **Send Confirmation**
   - Return: `{ success: true, recordedEvents: 5 }`

### Workflow 3: Invoice Generation & Notification

**Trigger:** Stripe webhook `invoice.created`

**Steps:**
1. **Receive Webhook**
   ```javascript
   const invoice = event.data.object;
   const clinicId = invoice.metadata.clinicId;
   ```

2. **Fetch Usage Summary**
   - Query database for events in billing period
   - Generate detailed breakdown

3. **Send Invoice Email**
   - Attach PDF invoice (Stripe-generated)
   - Include usage summary
   - Payment link if unpaid

4. **Update License Status**
   - If payment fails → set license to "payment_pending"
   - After grace period (7 days) → suspend license

### Workflow 4: Stripe Event Handler

**Trigger:** Stripe webhooks

**Handled Events:**
- `customer.subscription.created` → Log new subscription
- `customer.subscription.updated` → Update license status
- `customer.subscription.deleted` → Deactivate license
- `invoice.payment_succeeded` → Activate/reactivate license
- `invoice.payment_failed` → Send payment failure email, set grace period
- `payment_method.updated` → Log payment method change

**Example: Payment Failed Handler**
```javascript
if (event.type === 'invoice.payment_failed') {
  const invoice = event.data.object;
  const licenseId = invoice.metadata.licenseId;
  
  // Update database
  await db.licenses.update(licenseId, {
    status: 'payment_pending',
    gracePeriodEnds: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days
  });
  
  // Send email notification
  await sendEmail({
    to: invoice.customer_email,
    subject: 'Payment Failed - Action Required',
    body: `Your payment for Anamnese-A license ${licenseId} has failed. 
           Please update your payment method within 7 days to avoid service interruption.`
  });
}
```

### Workflow 5: Daily Usage Aggregation

**Trigger:** Cron (daily at 02:00 UTC)

**Steps:**
1. Query all usage receipts from past 24 hours
2. Aggregate by clinic/license
3. Generate summary report
4. Store in analytics database
5. Trigger alerts if unusual patterns (spike/drop in usage)

---

## Security & GDPR Compliance

### 1. Data Minimization (GDPR Art. 5)

**Only collect:**
- License ID (pseudonymized identifier)
- Clinic ID (internal reference)
- Event type (e.g., `gdt_export`)
- Timestamp (UTC)
- Technical metadata (format, version, not patient data)

**Never collect:**
- Patient names or identifiers
- Medical diagnoses
- Medications or allergies
- Personal health information (PHI)
- Export file contents

### 2. Purpose Limitation (GDPR Art. 5)

**Allowed purposes:**
- License activation and validation
- Usage-based billing
- Invoice generation
- Fraud prevention
- Service improvement (aggregated analytics only)

**Prohibited purposes:**
- Marketing based on usage patterns
- Selling data to third parties
- Profiling clinics beyond billing needs

### 3. Storage Limitation (GDPR Art. 5)

**Retention Periods:**
- License data: Active + 3 years after termination (tax law)
- Usage receipts: 7 years (financial records, § 147 AO)
- Audit logs: 3 years (GDPR Art. 30)
- Aggregated analytics: Indefinite (anonymized)

**Deletion Process:**
- After retention period: Automatic purge via cron job
- On request (Art. 17): Manual deletion within 30 days

### 4. Security Measures (GDPR Art. 32)

**Encryption:**
- TLS 1.3 for all API calls
- AES-256 for data at rest (database encryption)
- HMAC-SHA256 for usage receipt signatures

**Authentication:**
- License token: 128-bit entropy UUID
- API keys: Short-lived JWT tokens
- Stripe webhooks: Signature verification

**Access Control:**
- Role-based access (RBAC) for admin dashboard
- Audit logs for all admin actions
- MFA for admin accounts

**Network Security:**
- EU-only servers (Hetzner, AWS eu-central-1)
- No cross-border data transfers (GDPR Art. 44-50)
- DDoS protection (Cloudflare EU or equivalent)

### 5. Data Processing Agreement (DPA)

**Required Clauses:**
- Stripe DPA (EU instance)
- n8n hosting provider DPA
- Cloud infrastructure DPA (AWS, Hetzner, etc.)
- Commitment to GDPR compliance

**Terms of Service:**
- Clinic responsibility for patient data (data controller)
- Anamnese-A responsibility for licensing data (data processor)
- Clear boundaries of data processing

### 6. User Rights (GDPR Art. 12-23)

**Implemented Rights:**
- **Art. 15 (Access):** Clinic can view usage data via portal
- **Art. 16 (Rectification):** Clinic can update account info
- **Art. 17 (Erasure):** Deletion request via support
- **Art. 18 (Restriction):** Pause license without deletion
- **Art. 20 (Portability):** Export usage data as JSON/CSV

### 7. Consent (GDPR Art. 7)

**Registration Consent:**
```
☑ I consent to Anamnese-A GmbH processing the following data 
   for licensing and billing purposes:
   - Clinic name and address
   - Contact email and phone
   - Usage metadata (export counts, timestamps)
   
☑ I understand that patient data is NEVER transmitted to 
   Anamnese-A servers and remains on my local device.

☑ I accept the Terms of Service and Data Processing Agreement.
```

### 8. Breach Notification (GDPR Art. 33-34)

**Incident Response Plan:**
1. Detect breach (monitoring + alerts)
2. Contain breach (isolate affected systems)
3. Assess impact (affected clinics, data types)
4. Notify authorities (within 72 hours)
5. Notify affected clinics (if high risk)
6. Document incident (Art. 33(5))

---

## Implementation Guide

### Phase 1: Client-Side Integration (Week 1-2)

**File:** `index_v8_complete.html`

**Tasks:**
1. Add license activation UI
2. Implement usage counter
3. Generate signed usage receipts
4. Add "offline mode" indicator
5. Add UI copy about data locality

**Code locations:**
- License module: After encryption module (~line 5000)
- UI components: In settings section (~line 15000)
- Export hooks: In GDT/JSON export functions (~line 8000)

### Phase 2: Backend Setup (Week 3-4)

**n8n Installation:**
```bash
# On Hetzner Cloud (EU)
docker run -d \
  --name n8n \
  -p 5678:5678 \
  -e N8N_HOST=automation.anamnese-a.eu \
  -e WEBHOOK_URL=https://automation.anamnese-a.eu \
  -e GENERIC_TIMEZONE=Europe/Berlin \
  -v n8n_data:/home/node/.n8n \
  n8nio/n8n
```

**Database Schema:**
```sql
-- Clinics table
CREATE TABLE clinics (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  tax_id VARCHAR(50),
  status VARCHAR(20) DEFAULT 'pending',
  stripe_customer_id VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Licenses table
CREATE TABLE licenses (
  token VARCHAR(50) PRIMARY KEY,
  clinic_id UUID REFERENCES clinics(id),
  status VARCHAR(20) DEFAULT 'active',
  expires_at TIMESTAMP,
  last_validated TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Usage receipts table
CREATE TABLE usage_receipts (
  receipt_id VARCHAR(50) PRIMARY KEY,
  license_id VARCHAR(50) REFERENCES licenses(token),
  clinic_id UUID REFERENCES clinics(id),
  event_count INT,
  submitted_at TIMESTAMP DEFAULT NOW(),
  signature VARCHAR(128),
  raw_data JSONB
);

-- Usage events table (detailed)
CREATE TABLE usage_events (
  id UUID PRIMARY KEY,
  receipt_id VARCHAR(50) REFERENCES usage_receipts(receipt_id),
  event_type VARCHAR(50),
  timestamp TIMESTAMP,
  metadata JSONB,
  billed BOOLEAN DEFAULT FALSE
);
```

### Phase 3: Stripe Integration (Week 5)

**Setup Steps:**
1. Create Stripe account (EU entity)
2. Enable metered billing
3. Create product: "Anamnese Export"
4. Create price: €0.50 per unit
5. Set up webhooks → n8n
6. Test payment flow (Stripe test mode)

### Phase 4: Testing (Week 6)

**Test Scenarios:**
1. License activation (valid/invalid token)
2. Offline usage (no internet)
3. Usage receipt generation
4. Periodic sync (upload receipts)
5. Stripe billing (metered usage)
6. Payment failure handling
7. License suspension/reactivation
8. Data privacy verification (no PHI transmitted)

### Phase 5: Documentation & Launch (Week 7)

**Deliverables:**
1. Updated README.md
2. Clinic onboarding guide
3. Admin manual
4. API documentation
5. Privacy policy update
6. GDPR compliance checklist
7. ROI calculator spreadsheet

---

## EU Hosting Recommendations

### Recommended Providers (GDPR-Compliant)

#### 1. **n8n Hosting**
- **Hetzner Cloud (Germany)** ⭐ Recommended
  - Region: Falkenstein or Helsinki
  - GDPR-compliant, EU-based
  - Cost: ~€10-30/month
  - Setup: Docker container
  
- **OVH (France)**
  - Region: Gravelines or Strasbourg
  - Alternative to Hetzner
  
- **n8n.cloud (EU Region)**
  - Managed n8n service
  - Select EU region during setup

#### 2. **Database**
- **Hetzner Cloud PostgreSQL**
  - Managed PostgreSQL on Hetzner
  
- **Aiven (EU regions)**
  - Managed PostgreSQL/Redis
  - Frankfurt, Ireland, Amsterdam
  
- **AWS RDS (eu-central-1 - Frankfurt)**
  - Enterprise-grade
  - More expensive

#### 3. **Stripe**
- **Stripe EU**
  - Use: `https://api.stripe.com` (auto-routes to EU)
  - Entity: Stripe Payments Europe Ltd. (Ireland)
  - Ensure "European Economic Area" in settings

#### 4. **File Storage (if needed)**
- **Hetzner Storage Box** (for backups)
- **AWS S3 (eu-central-1)** with encryption
- **Prefer:** No file storage (metadata only)

### Infrastructure Checklist

- [ ] All servers in EU (Germany, France, Ireland, Netherlands)
- [ ] No US-based services (except Stripe EU instance)
- [ ] TLS 1.3 everywhere
- [ ] Firewall rules (EU-only ingress)
- [ ] VPN for admin access (optional)
- [ ] DPA signed with all providers
- [ ] GDPR-compliant monitoring (e.g., Grafana on Hetzner)
- [ ] Automated backups (EU-only storage)

---

## Next Steps

1. **Review this document** with stakeholders (legal, medical, technical)
2. **Implement client-side changes** (Phase 1)
3. **Set up n8n instance** on Hetzner (Phase 2)
4. **Integrate Stripe** and test metered billing (Phase 3)
5. **Create admin dashboard** (optional, future work)
6. **Launch beta** with select clinics
7. **Iterate** based on feedback

---

## Appendices

### A. Glossary

- **PHI:** Protected Health Information (patient data)
- **DPA:** Data Processing Agreement
- **HMAC:** Hash-based Message Authentication Code
- **JWT:** JSON Web Token
- **UUID:** Universally Unique Identifier
- **GDT:** Gerätedatentransfer (German PVS interface format)

### B. Related Documents

- [ROI.md](./ROI.md) - Return on Investment Calculator
- [API_SPECIFICATION.md](./API_SPECIFICATION.md) - Technical API specs
- [GDPR_EXPORT_DOCUMENTATION.md](../GDPR_EXPORT_DOCUMENTATION.md) - Existing GDPR export docs
- [DSGVO_OCR_COMPLIANCE.md](../DSGVO_OCR_COMPLIANCE.md) - OCR compliance

### C. Support Contacts

- **Technical Support:** support@anamnese-a.eu
- **Billing Questions:** billing@anamnese-a.eu
- **GDPR/Privacy:** privacy@anamnese-a.eu
- **Emergency Hotline:** +49 XXX XXXXXXX

---

**Document Version History:**
- v1.0 (2025-12-24): Initial design specification
