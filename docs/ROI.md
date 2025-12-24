# Return on Investment (ROI) Calculator for Anamnese-A

**Version:** 1.0  
**Date:** 2025-12-24

---

## Executive Summary

Anamnese-A delivers **immediate positive ROI** for medical clinics by:
- **Saving time:** 5-10 minutes per patient (automated data entry)
- **Reducing errors:** Digital validation vs. paper forms
- **Improving efficiency:** Instant GDT export to practice management systems
- **Enhancing patient experience:** Multi-language support, accessibility

**Break-even:** Typically achieved within **1 day** of deployment.

---

## Table of Contents

1. [Cost Structure](#cost-structure)
2. [Time Savings Analysis](#time-savings-analysis)
3. [ROI Calculator](#roi-calculator)
4. [Example Scenarios](#example-scenarios)
5. [Intangible Benefits](#intangible-benefits)
6. [Comparison with Alternatives](#comparison-with-alternatives)

---

## Cost Structure

### Usage-Based Pricing (Metered Billing)

| Item | Price | Notes |
|------|-------|-------|
| **Per Export** | €0.50 | Each completed Anamnese exported (GDT/JSON) |
| **Setup Fee** | €0 | No upfront cost |
| **Monthly Minimum** | €0 | Only pay for usage |
| **License Activation** | €0 | One-time activation, no charge |

**Billing Cycle:** Monthly invoice via Stripe

### Alternative Pricing (Subscription Tiers)

| Tier | Price/Month | Exports Included | Overage |
|------|-------------|------------------|---------|
| **Starter** | €99 | Up to 250 | €0.50/export |
| **Professional** | €249 | Up to 750 | €0.50/export |
| **Enterprise** | €499 | Unlimited | N/A |

**Recommended:** Metered billing for most clinics (transparent, pay-as-you-go).

---

## Time Savings Analysis

### Typical Workflow Comparison

#### Traditional Paper-Based Process

1. **Patient fills paper form** (10-15 min)
2. **Receptionist reviews for completeness** (2-3 min)
3. **Receptionist manually enters data into PVS** (8-12 min)
4. **Doctor reviews paper form during consultation** (2-3 min)
5. **Paper form filed or scanned** (2-3 min)

**Total Time:** 24-36 minutes per patient  
**Staff Cost (@ €30/hour):** €12-18 per patient

#### Anamnese-A Digital Process

1. **Patient fills digital form** (8-12 min) - voice input speeds up
2. **Automatic validation in real-time** (0 min)
3. **One-click GDT export to PVS** (30 sec)
4. **Doctor reviews in PVS during consultation** (0 min extra)
5. **No filing needed (digital)** (0 min)

**Total Time:** 8.5-12.5 minutes per patient  
**Staff Cost (@ €30/hour):** €4.25-6.25 per patient  
**Anamnese-A Cost:** €0.50 per export

**Net Time Saved:** 15.5-23.5 minutes per patient  
**Net Cost Saved:** €7.25-11.25 per patient (after subtracting €0.50)

---

## ROI Calculator

### Formula

```
ROI = (Total Savings - Total Costs) / Total Costs × 100%

Where:
  Total Savings = (Time Saved per Patient × Staff Hourly Rate) × Number of Patients
  Total Costs = Number of Patients × €0.50
```

### Interactive Calculator

#### Input Variables

| Variable | Default | Your Value | Description |
|----------|---------|------------|-------------|
| **Patients per Day** | 20 | _______ | Average new patients completing Anamnese |
| **Working Days per Month** | 20 | _______ | Clinic open days (excluding weekends/holidays) |
| **Time Saved per Patient** | 18 min | _______ | Minutes saved (realistic: 15-20 min) |
| **Staff Hourly Rate** | €30 | €_______ | Average cost of medical assistant/receptionist |
| **Export Cost** | €0.50 | €_______ | Fixed per Anamnese-A |

#### Calculation

**Monthly Usage:**
```
Patients per Month = 20 patients/day × 20 days = 400 patients
```

**Monthly Time Savings:**
```
Total Time Saved = 400 patients × 18 minutes = 7,200 minutes = 120 hours
```

**Monthly Cost Savings (Staff Time):**
```
Labor Cost Savings = 120 hours × €30/hour = €3,600
```

**Monthly Anamnese-A Cost:**
```
Software Cost = 400 patients × €0.50 = €200
```

**Net Monthly Savings:**
```
Net Savings = €3,600 - €200 = €3,400
```

**Monthly ROI:**
```
ROI = (€3,400 / €200) × 100% = 1,700%
```

**Break-Even Time:**
```
Break-even = €200 / (€180/day savings) ≈ 1.1 days
```

### Annual Projection

| Metric | Value |
|--------|-------|
| **Annual Patients** | 4,800 (400/month × 12) |
| **Annual Time Saved** | 1,440 hours |
| **Annual Labor Savings** | €43,200 |
| **Annual Software Cost** | €2,400 |
| **Net Annual Savings** | €40,800 |
| **Annual ROI** | 1,700% |

---

## Example Scenarios

### Scenario 1: Small Practice (10 patients/day)

**Inputs:**
- Patients/day: 10
- Days/month: 20
- Time saved: 15 min/patient
- Staff rate: €25/hour

**Results:**
```
Monthly patients: 200
Monthly time saved: 50 hours
Labor savings: €1,250
Software cost: €100
Net savings: €1,150
ROI: 1,150%
Break-even: 1.6 days
```

**Verdict:** ✅ Strong ROI even for small practices.

---

### Scenario 2: Medium Clinic (30 patients/day)

**Inputs:**
- Patients/day: 30
- Days/month: 22
- Time saved: 20 min/patient
- Staff rate: €35/hour

**Results:**
```
Monthly patients: 660
Monthly time saved: 220 hours
Labor savings: €7,700
Software cost: €330
Net savings: €7,370
ROI: 2,233%
Break-even: 0.9 days
```

**Verdict:** ✅ Exceptional ROI. Pays for itself in < 1 day.

---

### Scenario 3: Large Hospital Outpatient Dept. (100 patients/day)

**Inputs:**
- Patients/day: 100
- Days/month: 22
- Time saved: 18 min/patient
- Staff rate: €40/hour

**Results:**
```
Monthly patients: 2,200
Monthly time saved: 660 hours
Labor savings: €26,400
Software cost: €1,100
Net savings: €25,300
ROI: 2,300%
Break-even: 0.8 days
```

**Verdict:** ✅ Massive cost savings at scale.

---

### Scenario 4: Specialist Practice (Low Volume, High Complexity)

**Inputs:**
- Patients/day: 5
- Days/month: 18
- Time saved: 25 min/patient (complex histories)
- Staff rate: €45/hour

**Results:**
```
Monthly patients: 90
Monthly time saved: 37.5 hours
Labor savings: €1,687
Software cost: €45
Net savings: €1,642
ROI: 3,649%
Break-even: 0.5 days
```

**Verdict:** ✅ Best ROI for complex cases (more time saved).

---

## Intangible Benefits

### 1. **Reduced Errors**
- **Paper forms:** Illegible handwriting, missing fields, misinterpretation
- **Digital forms:** Real-time validation, mandatory fields, structured data
- **Value:** Fewer medical errors = reduced liability + better care

### 2. **Improved Patient Satisfaction**
- **Multi-language support:** 19 languages (inclusive)
- **Accessibility:** Screen readers, keyboard navigation, voice input
- **Convenience:** Fill out at home or in waiting room
- **Value:** Better patient experience = higher retention + referrals

### 3. **GDPR Compliance**
- **Offline-first:** No data breach risk (patient data never online)
- **Audit logging:** Full compliance documentation
- **Encryption:** AES-256 security
- **Value:** Avoid fines (up to €20M or 4% revenue under GDPR)

### 4. **Staff Satisfaction**
- **Less tedious data entry:** More time for patient interaction
- **Reduced frustration:** No more deciphering handwriting
- **Modern tools:** Increased job satisfaction
- **Value:** Lower turnover = reduced recruitment costs

### 5. **Scalability**
- **No marginal cost increase:** Same process for 10 or 1,000 patients
- **Instant deployment:** New staff trained in minutes
- **Multi-location:** Same system across all branches
- **Value:** Growth without proportional overhead increase

### 6. **Environmental Impact**
- **Paperless:** Save 400+ sheets/month (typical clinic)
- **No printing/storage:** Reduced office space needs
- **Value:** Sustainability + cost savings on supplies

---

## Comparison with Alternatives

### Option A: Continue with Paper Forms

| Factor | Paper Forms | Anamnese-A | Winner |
|--------|-------------|------------|--------|
| **Cost** | €12-18/patient (labor) | €0.50/patient | ✅ Anamnese-A |
| **Time** | 24-36 min/patient | 8.5-12.5 min | ✅ Anamnese-A |
| **Errors** | High (illegible, incomplete) | Low (validated) | ✅ Anamnese-A |
| **Accessibility** | Single language | 19 languages | ✅ Anamnese-A |
| **GDPR** | Risky (paper trails) | Compliant | ✅ Anamnese-A |
| **Environment** | Paper waste | Paperless | ✅ Anamnese-A |

**Verdict:** Paper forms are obsolete and expensive.

---

### Option B: Generic Form Builders (Google Forms, Typeform)

| Factor | Generic Tools | Anamnese-A | Winner |
|--------|---------------|------------|--------|
| **Cost** | €10-50/month | €200/month (400 patients) | ➖ Similar |
| **Medical Features** | None (generic) | GDT export, medical validation | ✅ Anamnese-A |
| **Privacy** | Cloud-based (GDPR risk) | Offline-first (no risk) | ✅ Anamnese-A |
| **Customization** | Limited | Full control (open source) | ✅ Anamnese-A |
| **PVS Integration** | Manual copy-paste | Automated GDT | ✅ Anamnese-A |
| **Voice Input** | No | Yes (Vosk local) | ✅ Anamnese-A |

**Verdict:** Generic tools lack medical-specific features and privacy guarantees.

---

### Option C: Custom-Built Solution

| Factor | Custom Software | Anamnese-A | Winner |
|--------|-----------------|------------|--------|
| **Upfront Cost** | €20,000-100,000 | €0 | ✅ Anamnese-A |
| **Development Time** | 6-12 months | Instant | ✅ Anamnese-A |
| **Maintenance** | €500-2,000/month | €0 (open source) | ✅ Anamnese-A |
| **Features** | Depends on dev | Full-featured | ✅ Anamnese-A |
| **Risk** | High (vendor lock-in) | Low (open source) | ✅ Anamnese-A |

**Verdict:** Custom development is only justified for highly specialized needs (>10x cost).

---

## Financial Summary Table

### 5-Year Total Cost of Ownership (TCO)

**Assumptions:** 400 patients/month, €0.50/export

| Year | Anamnese-A Cost | Labor Savings | Net Savings | Cumulative Savings |
|------|-----------------|---------------|-------------|-------------------|
| **1** | €2,400 | €43,200 | €40,800 | €40,800 |
| **2** | €2,400 | €43,200 | €40,800 | €81,600 |
| **3** | €2,400 | €43,200 | €40,800 | €122,400 |
| **4** | €2,400 | €43,200 | €40,800 | €163,200 |
| **5** | €2,400 | €43,200 | €40,800 | €204,000 |

**Total 5-Year Savings:** €204,000 for a medium-sized clinic.

---

## Conclusion

### Key Takeaways

1. **Immediate ROI:** Break-even in less than 2 days for most clinics
2. **Transparent Pricing:** Pay only for what you use (€0.50/export)
3. **Massive Time Savings:** 15-20 min per patient = 100+ hours/month
4. **Cost-Effective:** €200-500/month vs. €3,000-7,000 in labor savings
5. **Risk-Free:** No upfront cost, cancel anytime

### Decision Matrix

| Clinic Type | Patients/Day | Monthly Cost | Monthly Savings | Recommendation |
|-------------|--------------|--------------|-----------------|----------------|
| Small | <15 | €75-150 | €800-1,500 | ✅ Strong ROI |
| Medium | 15-40 | €150-400 | €2,000-5,000 | ✅ Excellent ROI |
| Large | 40-100 | €400-1,000 | €5,000-15,000 | ✅ Exceptional ROI |
| Enterprise | 100+ | €1,000+ | €15,000+ | ✅ Critical efficiency tool |

**Recommendation:** Anamnese-A is a **no-brainer investment** for any clinic handling medical histories.

---

## Next Steps

1. **Try the Demo:** Visit [demo.anamnese-a.eu](https://demo.anamnese-a.eu) (no signup)
2. **Calculate Your ROI:** Use the calculator above with your clinic's data
3. **Request Beta Access:** Email sales@anamnese-a.eu with your details
4. **Schedule a Demo:** Book a 15-minute walkthrough with our team

---

## Appendix: Detailed Cost Breakdown

### Staff Labor Cost Components

| Task | Traditional Time | With Anamnese-A | Time Saved |
|------|------------------|-----------------|------------|
| Patient form filling | 12 min | 10 min | 2 min |
| Receptionist review | 3 min | 0 min | 3 min |
| Manual PVS entry | 10 min | 0.5 min | 9.5 min |
| Doctor review | 3 min | 2 min | 1 min |
| Filing/Scanning | 3 min | 0 min | 3 min |
| **Total** | **31 min** | **12.5 min** | **18.5 min** |

**Note:** Assumes voice input used for 30% of fields, reducing patient time from 15 to 10 min.

---

## Support & Questions

For questions about pricing or ROI calculations:
- **Email:** sales@anamnese-a.eu
- **Phone:** +49 XXX XXXXXXX (Mo-Fr, 9-17 Uhr)
- **Chat:** [Live chat on website](https://anamnese-a.eu)

---

**Document Version History:**
- v1.0 (2025-12-24): Initial ROI calculator and analysis
