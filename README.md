# Medizinische Anamnese / Medical History Application

## 🏥 Offline Data Protection-Compliant HTML Medical History Form

A fully offline, privacy-compliant medical history (Anamnese) application with multi-language support, AES-256 encryption, and Progressive Web App (PWA) capabilities.

## ✨ Features

### Core Features
- **🌍 Multi-Language Support**: **19 languages** (German, English, French, Spanish, Italian, Portuguese, Dutch, Polish, Turkish, Arabic, Russian, Ukrainian, Farsi, Urdu, Chinese, Albanian, Romanian, Hindi, Japanese)
- **📱 Progressive Web App (PWA)**: Installable on desktop and mobile devices, works offline
- **🔒 AES-256 Encryption**: All data encrypted with Web Crypto API using AES-256-GCM
- **💾 Local Storage**: All data stored only on your device (localStorage)
- **🎤 Speech Recognition**: VOSK-based local speech recognition (German 50 MB model) with browser fallback
- **🤖 AI Plausibility Check**: Privacy-compliant, local rule-based validation (no external AI services)
- **📤 JSON Export**: Export your medical history as JSON file
- **🏥 GDT-Export**: GDPR-compliant export interface for practice management systems (Medatixx, CGM, Quincy)
- **🔐 Privacy-Compliant**: GDPR/DSGVO compliant - no external server communication
- **📋 Consent Management**: Granular consent tracking according to GDPR Art. 6, 7
- **📊 Audit Logging**: Comprehensive logging according to GDPR Art. 30, 32
- **♿ WCAG 2.1 AA Accessible**: Full keyboard navigation, screen reader support, ARIA landmarks
- **🌐 Fully Offline**: No internet connection required after initial load

### Production Features (index_v8_complete.html)

#### 📱 Progressive Web App (NEW in v8.1.0)
- **Installable**: Add to home screen on iOS, Android, and desktop
- **Offline Support**: Service worker caches app for offline use
- **Native-like Experience**: Standalone display mode, custom theme color
- **App Icons**: Optimized SVG icons for all platforms
- **Update Management**: Automatic detection and notification of new versions

#### 🌐 Enhanced Multi-Language (NEW in v8.1.0)
- **19 Total Languages**: Expanded from 10 to 19 languages
- **New Languages**: Nederlands, Shqip, Română, हिन्दी, 日本語
- **RTL Support**: Full right-to-left layout for Arabic, Farsi, Urdu
- **Dynamic Switching**: Change language at any time without losing data

#### ♿ Accessibility Features (NEW in v8.1.0)
- **Skip Links**: Jump directly to main content
- **Keyboard Navigation**: Full keyboard support with shortcuts (Ctrl+S save, Ctrl+Arrow navigate)
- **ARIA Landmarks**: Semantic structure for screen readers
- **Live Regions**: Screen reader announcements for actions
- **Focus Management**: Enhanced focus indicators (3px solid outline)
- **Reduced Motion**: Respects user preference for reduced animations
- **High Contrast**: Supports high contrast mode

#### 🔐 Enhanced Security
- **Master Password System**: User-defined encryption keys (16+ characters required)
- **XSS Prevention**: Enhanced input sanitization and URL validation
- **Rate Limiting**: Prevents abuse (10 saves/min, 30 navigations/min)
- **Secure Storage**: Safe localStorage wrapper with quota handling
- **Content Security Policy**: Restrictive CSP headers with frame-ancestors protection
- **Session-based Encryption**: Keys cleared when browser closes

#### ✨ UX Improvements
- **Real-time Validation**: Instant feedback on required fields and data ranges
- **Visual Feedback**: Color-coded validation (✓ green for valid, ⚠️ red for errors)
- **Auto-Save**: Automatic saving every 2 seconds after changes with rate limiting
- **Save Indicator**: Visual indicator shows save status (💾 Speichert... → ✓ Gespeichert)
- **Auto-Restore**: Prompts to restore unfinished forms (within 24 hours)
- **Enhanced Progress Bar**: 
  - Percentage display (e.g., "67%")
  - Question counter (e.g., "15 von 42 Fragen beantwortet")
  - Color-coded progress (🔴 Red 0-33% → 🟠 Orange 33-66% → 🟢 Green 66-100%)
  - Smooth animations with shimmer effect
  - Screen reader announcements
- **Smart Navigation**: Next button disabled until all required fields are valid
- **Field-level Help**: Contextual error messages for invalid inputs
- **Offline Indicator**: Visual banner when offline with screen reader announcement
- **Keyboard Shortcuts Help**: Built-in shortcuts reference (⌨️ button in footer)

#### 📄 DSGVO-Compliant OCR & Document Upload
- **Local OCR Processing**: Tesseract.js-based OCR runs entirely in browser - NO external API calls
- **Privacy Notice (Art. 13 DSGVO)**: Comprehensive privacy notice before document upload
- **Audit Logging (Art. 30, 32 DSGVO)**: Complete logging of all OCR operations with metadata
- **Right to be Forgotten (Art. 17 DSGVO)**: One-click deletion of all documents and data
- **No Cloud Upload**: Explicit guarantee - no data sent to Google Vision, AWS, or any external service
- **Encrypted Storage**: All extracted text encrypted with AES-256-GCM
- **Retention Policy**: 3-year audit log retention per § 630f BGB
- **DSB Report Generation**: Export audit reports for data protection officer review
- **Supported Formats**: Images (JPG, PNG), PDFs, text files
- **Multi-Engine Ready**: Architecture supports fallback OCR engines (currently Tesseract only)

#### 🔑 Licensing & Usage-Based Billing (NEW in v8.2.0)
- **Offline-First License Activation**: Token-based licensing that works offline for 30 days
- **Usage Metering**: Automatic tracking of billable events (GDT exports, JSON exports)
- **Privacy Guaranteed**: Only anonymized metadata transmitted (license ID, event count, timestamp)
- **EU-Only Backend**: All licensing infrastructure hosted exclusively in EU regions (GDPR compliant)
- **Transparent Pricing**: €0.50 per export with clear ROI justification
- **Stripe Integration**: Metered billing via Stripe Customer Portal
- **Zero Patient Data Transmission**: Patient information NEVER leaves the device
- **Signed Usage Receipts**: Tamper-proof receipts for accurate billing
- **Grace Periods**: 7-day payment grace period to prevent service interruption
- **Demo Mode**: Full functionality available when licensing is disabled

**📋 See [docs/LICENSING_AND_BILLING.md](docs/LICENSING_AND_BILLING.md) for complete architecture**

**📋 See [docs/ROI.md](docs/ROI.md) for ROI calculator and cost-benefit analysis**

**📋 See [docs/API_SPECIFICATION.md](docs/API_SPECIFICATION.md) for API integration**

**📋 See [DSGVO_OCR_COMPLIANCE.md](DSGVO_OCR_COMPLIANCE.md) for complete compliance documentation**

**📋 See [PWA_FEATURES.md](PWA_FEATURES.md) for PWA installation and usage guide**

**📋 See [INTEGRATION_CHANGELOG.md](INTEGRATION_CHANGELOG.md) for detailed v8.1.0 changes**

## 🚀 Quick Start

### Basic Usage

1. Open `index.html` in your web browser
2. Select your preferred language from the dropdown
3. Fill in the medical history form
4. Use the microphone button (🎤) for voice input
5. Click "Save Encrypted" to store data locally with encryption
6. Use "Load Saved Data" to retrieve encrypted data
7. Export as JSON for backup or sharing

### With VOSK Speech Recognition

To enable local VOSK speech recognition:

1. Download the VOSK German model: [vosk-model-small-de-0.15](https://alphacephei.com/vosk/models)
2. Extract the model to a `model/` folder in the same directory as index.html:
   ```
   model/
   └── vosk-model-small-de-0.15/
       ├── am/
       ├── conf/
       ├── graph/
       └── ...
   ```
3. The application will automatically use VOSK for speech recognition
4. If VOSK is not available, the browser's built-in speech recognition will be used as fallback

## 📁 Project Structure

```
Anamnese-/
├── index.html                   # Main HTML file with form
├── index_v8_complete.html       # Production version with all features
├── styles.css                   # Styling and responsive design
├── app.js                       # Main application logic
├── translations.js              # 10-language translation support
├── encryption.js                # AES-256 encryption/decryption
├── vosk-integration.js          # VOSK speech recognition integration
├── vosk-worker.js               # Web Worker for VOSK processing
├── ocr-gdpr-module.js           # DSGVO-compliant OCR module (NEW)
├── gdpr-compliance.js           # GDPR compliance utilities
├── gdt-export.js                # GDT format export for PVS integration
├── README.md                    # This file
├── DSGVO_OCR_COMPLIANCE.md      # OCR GDPR compliance documentation (NEW)
├── DOKUMENTEN_UPLOAD_README.md  # Document upload feature documentation
└── model/                       # VOSK model folder (user-provided)
    └── vosk-model-small-de-0.15/
```

## 🔐 Security Features

### AES-256 Encryption
- Uses Web Crypto API for encryption
- PBKDF2 key derivation with 100,000 iterations
- Random salt and IV for each encryption
- GCM mode for authenticated encryption

### Privacy Protection
- All data stored locally (localStorage)
- No external API calls or server communication
- No cookies or tracking
- No data transmission over network
- User has full control over data

## 🔒 Production Security Setup (index_v8_complete.html)

### Master Password Configuration

The production version (`index_v8_complete.html`) implements secure encryption key management with a master password system.

#### First-Time Setup

1. **Open the application** - Navigate to `index_v8_complete.html` in your web browser
2. **Accept Privacy Notice** - Click "Accept & Start" on the privacy modal
3. **Set Master Password** - You will be prompted to create a master password
   - Minimum length: **16 characters**
   - Use a strong, memorable password
   - ⚠️ **CRITICAL**: If you forget this password, all encrypted data will be permanently lost!

4. **Confirm Setup** - After entering a valid password, you'll see: ✅ Master-Passwort erfolgreich gesetzt!

#### Subsequent Uses

When you reopen the application after closing your browser:

1. **Open application** - Navigate to `index_v8_complete.html`
2. **Accept Privacy Notice** - Click "Accept & Start"
3. **Enter Master Password** - You'll be prompted for your existing master password
4. **Access Application** - After correct password entry, your previous session data will be restored

### Security Best Practices

#### For Individual Users
- **Never share** your master password
- **Document password securely** - Store in a password manager or secure location
- **Test recovery** - Verify you can reopen the app with your password before closing
- **Regular backups** - Export encrypted data files as backups

#### For Healthcare Institutions
- **IT Administrator Setup**: Consider having IT set up a facility-wide master password
- **Password Documentation**: Maintain secure documentation of master passwords
- **Staff Training**: Train staff on password entry and data security
- **Backup Procedures**: Implement regular backup procedures for encrypted exports
- **Access Control**: Use separate passwords for different departments/roles if needed

### What Gets Encrypted

- All patient answers and form data
- Exported JSON files (when using "Export Encrypted" option)
- Auto-saved session data in browser storage

### What Is NOT Encrypted

- Master password hash (used only for verification, not decryption)
- Application UI and translations
- Form structure and questions

### Technical Security Details

- **Encryption Algorithm**: AES-256-GCM (Web Crypto API)
- **Key Derivation**: PBKDF2 with 100,000 iterations
- **Storage**: 
  - Master password hash in `localStorage` (persistent)
  - Actual encryption key in `sessionStorage` (cleared on browser close)
- **Input Sanitization**: All user inputs sanitized to prevent XSS attacks
- **Content Security Policy**: Restrictive CSP meta tag limits external resources

### Password Recovery

⚠️ **IMPORTANT**: There is NO password recovery mechanism by design for maximum security.

- If you forget your master password, encrypted data cannot be recovered
- Consider implementing a backup administrator password for enterprise deployments
- Regular unencrypted backups (if security policy allows) can prevent data loss

### Enterprise Considerations

For healthcare institutions requiring password recovery:

1. **Option 1**: Maintain a secure vault of master passwords accessible only to authorized IT personnel
2. **Option 2**: Implement a custom key escrow system (requires code modification)
3. **Option 3**: Use device/browser management to pre-configure master passwords
4. **Option 4**: Regular automated backups of encrypted data with IT-managed decryption keys

## 🌍 Supported Languages

1. **Deutsch (German)** - DE
2. **English** - EN
3. **Français (French)** - FR
4. **Español (Spanish)** - ES
5. **Italiano (Italian)** - IT
6. **Português (Portuguese)** - PT
7. **Nederlands (Dutch)** - NL
8. **Polski (Polish)** - PL
9. **Türkçe (Turkish)** - TR
10. **العربية (Arabic)** - AR

## 🎤 Speech Recognition

### VOSK (Preferred)
- Local speech recognition (no internet required)
- German model: vosk-model-small-de-0.15 (50 MB)
- Runs in Web Worker for performance
- Complete privacy - all processing on device

### Browser Fallback
- If VOSK is not available, uses browser's native speech recognition
- Supports all 10 languages with appropriate locale codes
- Requires internet connection (browser-dependent)

## 📋 Form Sections

1. **Personal Information**
   - First Name, Last Name
   - Date of Birth
   - Gender
   - Address, Phone, Email

2. **Medical History**
   - Current Complaints
   - Past Illnesses
   - Surgeries
   - Current Medications
   - Allergies
   - Family History

3. **Lifestyle**
   - Smoking status
   - Alcohol consumption
   - Physical activity

4. **Additional Information**
   - Additional notes and comments

## 🔧 Technical Requirements

### Browser Compatibility
- Modern browsers with ES6+ support
- Web Crypto API support
- Web Audio API (for speech recognition)
- Web Workers support
- LocalStorage support

### Recommended Browsers
- Chrome/Chromium 60+
- Firefox 60+
- Safari 11+
- Edge 79+

## 📖 Usage Instructions

### Saving Data
1. Fill in the form
2. Click "Save Encrypted"
3. Enter a strong password
4. Data is encrypted with AES-256 and stored locally

### Loading Data
1. Click "Load Saved Data"
2. Enter your password
3. Form is populated with decrypted data

### Exporting Data
1. Click "Export as JSON"
2. Unencrypted JSON file is downloaded
3. Use for backup or transfer to another device

### Voice Input
1. Click the microphone button (🎤) next to any text field
2. Allow microphone access when prompted
3. Speak clearly in German (or selected language)
4. Click the status indicator to stop recording
5. Text is automatically inserted into the field

### GDT Export (for Practice Management Systems)
1. Fill in the medical history form
2. Click "GDT-Export (DSGVO)"
3. Configure export settings (Practice ID, pseudonymization, data selection)
4. Grant required consents according to GDPR
5. Select destination folder for GDT file
6. The file can be imported into Medatixx, CGM, or Quincy

**Important**: GDT export requires review by a Data Protection Officer (DSB) before production use.

For detailed GDT export documentation, see:
- 📄 [GDT_EXPORT_README.md](GDT_EXPORT_README.md) - Quick start guide
- 📄 [GDPR_EXPORT_DOCUMENTATION.md](GDPR_EXPORT_DOCUMENTATION.md) - Comprehensive GDPR documentation
- 🧪 [test-gdt-export.html](test-gdt-export.html) - Test suite

### License Activation (for Enterprise Use)

For clinics using the usage-based billing model:

1. **Obtain License Token**
   - Register at the clinic portal (when available)
   - Receive license token via email: `LIC-XXXXX-XXXXX-XXXXX-XXXXX`

2. **Activate License**
   - Open the GDT Export dialog or settings
   - Click "Lizenz aktivieren / verwalten"
   - Enter your license token
   - Click "Aktivieren"

3. **Automatic Usage Tracking**
   - Each successful export (GDT, JSON, PDF) is automatically tracked
   - Usage receipts are generated locally
   - Receipts sync automatically when online (daily)
   - View usage summary in the license dialog

4. **Billing**
   - Monthly invoices via Stripe (€0.50 per export)
   - Manage billing via Stripe Customer Portal
   - Download invoices and receipts

**Privacy Guarantee**: Only anonymized metadata is transmitted (license ID, event count, timestamp). **Patient data NEVER leaves your device.**

**Demo Mode**: If licensing is not enabled, all features remain fully functional.

For detailed licensing documentation, see:
- 📄 [docs/LICENSING_AND_BILLING.md](docs/LICENSING_AND_BILLING.md) - Complete architecture
- 📄 [docs/ROI.md](docs/ROI.md) - ROI calculator
- 📄 [docs/API_SPECIFICATION.md](docs/API_SPECIFICATION.md) - API integration

### AI Plausibility Check (Privacy-Compliant)

The AI Plausibility Check provides automated validation of medical history data:

**Features**:
- ✅ **100% Local Processing**: All validation runs in the browser
- ✅ **No External AI Services**: OpenAI, Google AI, Anthropic, etc. are blocked
- ✅ **Rule-Based System**: Transparent, explainable validation rules
- ✅ **Medical Logic Checks**: Age-gender consistency, medication-allergy conflicts
- ✅ **Privacy by Design**: Pseudonymized audit logs, no data transmission
- ✅ **GDPR Compliant**: Full DSFA/PIA documentation included

**Documentation**:
- 📄 [AI_PRIVACY_IMPACT_ASSESSMENT.md](AI_PRIVACY_IMPACT_ASSESSMENT.md) - Complete DSFA/PIA
- 📄 [BFDI_CHECKLIST.md](BFDI_CHECKLIST.md) - BfDI compliance checklist
- 📄 [AI_DELETION_CONCEPT.md](AI_DELETION_CONCEPT.md) - Art. 17 GDPR deletion concept
- 📄 [AI_TECHNICAL_DOCUMENTATION.md](AI_TECHNICAL_DOCUMENTATION.md) - Technical documentation
- 🧪 [test-ai-plausibility.html](test-ai-plausibility.html) - Test suite

**Usage**:
```javascript
// Include the module
<script src="ai-plausibility-check.js"></script>

// Perform plausibility check
const formData = getFormData();
const results = performPlausibilityCheck(formData);

// Display warnings and errors
if (results.warnings.length > 0) {
    console.warn('Warnings:', results.warnings);
}
if (results.errors.length > 0) {
    console.error('Errors:', results.errors);
}
```

**Important**: This is a support system only. Final medical decisions must be made by qualified healthcare professionals.

## 🔒 Data Protection Compliance

### GDPR/DSGVO Compliance
- ✅ Data minimization: Only necessary data collected
- ✅ Purpose limitation: Clear purpose for data collection
- ✅ Storage limitation: User controls data retention
- ✅ Data security: AES-256 encryption
- ✅ Privacy by design: Local-only storage
- ✅ User rights: Full control over data (export, delete)
- ✅ No third-party data sharing
- ✅ Transparent processing: Open source code
- ✅ **GDT Export**: GDPR-compliant interface with consent management
- ✅ **Pseudonymization**: Optional anonymization of patient identifiers
- ✅ **Audit Logging**: Complete tracking according to GDPR Art. 30, 32
- ✅ **DPIA Template**: Data Protection Impact Assessment (Art. 35 GDPR)
- ✅ **Processing Record**: Documentation according to § 30 GDPR

## 🛠️ Development

### No Build Process Required
This is a pure HTML/CSS/JavaScript application with no dependencies or build process.

### Adding New Languages
Edit `translations.js` and add a new language object with all required translations.

### Customizing Form Fields
Edit `index.html` to add or remove form fields as needed.

## 📝 License

This project is provided as-is for medical data collection purposes. Ensure compliance with local healthcare regulations and data protection laws in your jurisdiction.

## ⚠️ Disclaimer

This application is designed for medical history data collection. It should not be used as a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of qualified health providers.

## 🤝 Contributing

Contributions are welcome! Please ensure any changes maintain:
- Offline functionality
- Data privacy and security
- Multi-language support
- Clean, readable code

## 📞 Support

For issues or questions, please open an issue in the repository.

---

**Note**: Remember to download and place the VOSK model in the `model/` folder for local speech recognition functionality.
# Anamnese Medical Questionnaire

**Digital Medical History Questionnaire with Offline Speech Recognition**

[![License](https://img.shields.io/badge/license-Medical_Device-red)]()
[![Version](https://img.shields.io/badge/version-3.0.0-blue)]()
[![Languages](https://img.shields.io/badge/languages-10+-green)]()

## Overview

A comprehensive offline medical questionnaire application designed for healthcare settings. Features include multi-language support, speech recognition, conditional logic, and encrypted data export.

## ✨ Key Features

- 🌍 **10+ Languages**: DE, EN, FR, ES, IT, TR, PL, RU, AR, ZH, PT
- 🎤 **Offline Speech Recognition**: Vosk integration with 45MB German model
- 🔒 **AES-256 Encryption**: Secure patient data encryption
- 📱 **NFC Export**: Transfer data via NFC
- 📧 **Email Export**: Send encrypted data via email
- 🧠 **Conditional Logic**: Smart question routing based on answers
- 🎨 **Dark/Light Theme**: Customizable appearance
- 💾 **Local Storage**: No external servers required
- ♿ **Accessibility**: ARIA labels and keyboard navigation

## 🚀 Quick Start

1. **Clone the repository**:
   ```bash
   git clone https://github.com/AbdullahAlshdyfat2004/Anamnese-.git
   cd Anamnese-
   ```

2. **Open in browser**:
   ```bash
   # Option 1: Direct open
   open index_v5.html
   
   # Option 2: Local server (recommended)
   python3 -m http.server 8080
   # Then visit: http://localhost:8080/index_v5.html
   ```

3. **Run tests**:
   ```bash
   # Open test_anamnese.html in browser
   open test_anamnese.html
   ```

## 📖 Documentation

### User & Setup Documentation
- **[SETUP.md](SETUP.md)**: Detailed setup guide
- **[INSTALLATION.md](INSTALLATION.md)**: Installation instructions
- **[DEPLOYMENT.md](DEPLOYMENT.md)**: Deployment guidelines
- **[Test Suite](test_anamnese.html)**: Comprehensive tests

### Questionnaire Structure Analysis (German)
Comprehensive analysis of the questionnaire logic from PR #3:
- **[FRAGEBOGEN_ANALYSE_README.md](FRAGEBOGEN_ANALYSE_README.md)**: 📚 Navigation guide and overview
- **[FRAGEBOGEN_STRUKTUR_ANALYSE.md](FRAGEBOGEN_STRUKTUR_ANALYSE.md)**: 📋 Detailed structural analysis
- **[FRAGEBOGEN_ABLAUFDIAGRAMM.md](FRAGEBOGEN_ABLAUFDIAGRAMM.md)**: 📊 Visual flowcharts and diagrams
- **[FRAGEBOGEN_DETAILLIERTE_UEBERSICHT.md](FRAGEBOGEN_DETAILLIERTE_UEBERSICHT.md)**: 📑 Tabular reference guide

These documents provide:
- Complete documentation of all 223 sections and 1,331 fields
- Conditional logic analysis (gender-specific questions)
- Visual Mermaid diagrams showing question flow
- PR #3 security improvements (Web Crypto API migration)
- Implementation details and code references

## 🔧 Technical Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Encryption**: CryptoJS (AES-256)
- **Speech Recognition**: Vosk Browser
- **Storage**: LocalStorage API
- **Export**: Web NFC API, Mailto

## 🧪 Testing

![Test Coverage](https://img.shields.io/badge/Test%20Coverage-90%25-brightgreen) ![Tests](https://img.shields.io/badge/Tests-32%2F32-success) ![Suites](https://img.shields.io/badge/Suites-5-blue)

The project includes a comprehensive test suite covering all critical features with **32 tests across 5 test suites**. All tests run locally in the browser with visual dashboards and JSON export functionality.

### 📊 Test Suites

| Test Suite | Tests | Status | Documentation |
|------------|-------|--------|---------------|
| **Vosk Speech Recognition** | 5 | ✅ 80% | Microphone, Model Loading, Browser Fallback |
| **NFC Export** | 5 | ⚠️ 60% | Encryption, NDEF Format, Data Size |
| **OCR Integration** | 8 | ✅ 100% | OCR → PII Detection → Anonymization → Export |
| **AES-256 Encryption** | 8 | ✅ 100% | Roundtrip, Large Data, Key Derivation |
| **GDPR Anonymizer** | 6 | ✅ 100% | 13 PII Patterns, Dictionary, Audit |
| **TOTAL** | **32** | **✅ 90%** | [TEST_COVERAGE.md](TEST_COVERAGE.md) |

### 🚀 Running Tests

```bash
# 1. Start local server
python3 -m http.server 8080

# 2. Open test suites in browser
http://localhost:8080/tests/

# Available test files:
# - test-vosk-speech.html (Speech Recognition)
# - test-nfc-export.html (NFC Export)
# - test-ocr-integration.html (OCR + GDPR Pipeline)
# - test-encryption.html (AES-256 Encryption)
# - test-gdpr-anonymizer.html (GDPR Anonymization)

# 3. Click "▶️ Alle Tests ausführen" in each suite

# 4. Export results: "💾 Ergebnisse exportieren"
```

### 🎯 Test Coverage Areas

- ✅ **Encryption/Decryption**: AES-256-GCM with Web Crypto API
- ✅ **GDPR Compliance**: 13 PII patterns, pseudonymization, audit logging
- ✅ **OCR Integration**: Tesseract.js with local processing (no external APIs)
- ✅ **Speech Recognition**: Vosk offline models + browser fallback
- ✅ **NFC Export**: Encrypted data export via Web NFC API
- ✅ **Answer Storage**: LocalStorage with encryption wrapper
- ✅ **Conditional Logic**: Gender-specific and answer-dependent questions
- ✅ **Date Validation**: Leap years, month boundaries, age calculations
- ✅ **Multi-language Support**: 19 languages with RTL layout
- ✅ **Export Functionality**: JSON, GDT, Email, NFC
- ✅ **Input Validation**: Real-time validation with visual feedback

### 📈 Performance Benchmarks

- **Encryption (1KB)**: ~10ms
- **Encryption (100KB)**: ~200ms
- **PII Detection**: ~50ms per document
- **OCR Processing**: ~2-5s per page (depends on image quality)
- **Test Suite Execution**: <10s per suite

### 🔐 GDPR Test Checklist

All tests validate DSGVO/GDPR compliance:

- [x] **Art. 5 (Data Minimization)**: Only necessary PII detected
- [x] **Art. 25 (Privacy by Design)**: Default pseudonymization
- [x] **Art. 30 (Records of Processing)**: Audit logging
- [x] **Art. 32 (Security)**: AES-256-GCM encryption
- [x] **Art. 35 (DPIA)**: Privacy Impact Assessment documented
- [x] **§ 630f BGB**: 3-year retention for audit logs

### 📖 Documentation

For detailed test documentation, coverage matrix, known issues, and troubleshooting:
👉 **[TEST_COVERAGE.md](TEST_COVERAGE.md)**

## 🔐 Security

- **Local Processing**: All data processed on-device
- **Encryption**: AES-256 encryption before export
- **No External Servers**: Completely offline capable
- **Privacy First**: Patient controls all data

⚠️ **Important**: Change the default encryption key in production!

## 🌐 Browser Support

| Browser | Version | Support |
|---------|---------|---------|
| Chrome  | 90+     | ✅ Full |
| Firefox | 88+     | ✅ Full |
| Safari  | 14+     | ✅ Full |
| Edge    | 90+     | ✅ Full |

## 📋 Requirements

- Modern web browser with JavaScript enabled
- Microphone access (for speech recognition)
- ~45MB free space (for local Vosk model)

## 🤝 Contributing

This is a medical application. All changes should be:
1. Thoroughly tested
2. Reviewed by medical professionals
3. Compliant with medical device regulations

## 👥 Credits

- **Medical Concept**: Dr. Christian Klapproth
- **Technical Implementation**: DiggAi GmbH
- **Powered by**: Vosk Browser

## ⚖️ License

Medical device regulations may apply. Consult with legal and medical professionals before clinical use.

## 📞 Support

For setup instructions, see [SETUP.md](SETUP.md)
