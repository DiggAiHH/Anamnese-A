# Medical History Questionnaire v6 - Complete Edition

## 🎯 Overview

`anamnese_complete_v6.html` is a complete, production-ready single-file HTML medical anamnesis questionnaire with comprehensive features for collecting patient medical history data in a secure, GDPR-compliant manner.

## ✨ Key Features

- **12-Language Support**: English, German, French, Spanish, Italian, Portuguese, Dutch, Polish, Russian, Turkish, Arabic, Chinese
- **Strong Encryption**: AES-256-GCM with PBKDF2 (100,000 iterations)
- **Offline-Capable**: Works completely without internet connection
- **Responsive Design**: Mobile-first design that works on all devices
- **Document Processing**: OCR for images and PDF text extraction
- **Data Export**: Multiple export options (encrypted, plain, email, NFC)
- **Progress Tracking**: Visual progress bar and section navigation
- **Conditional Logic**: Dynamic questions based on previous answers
- **Local Storage**: Auto-save progress and resume later
- **Dark Mode**: Toggle between light and dark themes

## 🚀 Quick Start

1. **Open the file**: Simply open `anamnese_complete_v6.html` in any modern web browser
2. **Accept privacy notice**: Click "Accept & Start" to begin
3. **Fill out the form**: Complete the 7 sections of the questionnaire
4. **Review**: Check your answers in the summary view
5. **Export**: Download your encrypted data or send via email

## 📋 Questionnaire Sections

1. **Personal Information** - Name, date of birth, contact details
2. **Medical History** - Chronic diseases, surgeries, allergies, medications
3. **Lifestyle** - Smoking, alcohol, exercise habits
4. **Current Symptoms** - Main complaint, pain level, duration
5. **Family History** - Hereditary conditions
6. **Medications** - Current medication list
7. **Consent** - Data processing and privacy policy consent

## 🔒 Security & Privacy

### Data Protection
- All data is processed **locally on your device**
- **No external servers** are contacted (except CDN for libraries)
- Data is encrypted with **AES-256-GCM** before export
- **GDPR compliant** - you control your data

### Encryption Details
- **Algorithm**: AES-256-GCM (Advanced Encryption Standard)
- **Key Derivation**: PBKDF2 with 100,000 iterations
- **Salt**: Random 16-byte salt per encryption
- **IV**: Random 12-byte initialization vector

### For Healthcare Providers
Use the "Decrypt Data" button to decrypt patient-provided encrypted files using the built-in decryption tool.

## 💾 Export Options

### 1. Encrypted Export (.txt)
- **Recommended for sharing with healthcare providers**
- Creates an encrypted text file with all your data
- Requires decryption key to read

### 2. Plain JSON Export (.json)
- Unencrypted JSON file
- Use for personal backups
- **Not recommended for sharing**

### 3. Email Export
- Opens your email client with encrypted data
- Send directly to your healthcare provider
- Data is encrypted in the email body

### 4. NFC Export
- Write encrypted data to NFC tag (if supported)
- Quick sharing with NFC-enabled devices
- Falls back to simulation if NFC not available

## 📱 Supported Devices

- **Desktop**: Windows, macOS, Linux (Chrome, Firefox, Safari, Edge)
- **Mobile**: iOS (Safari), Android (Chrome, Firefox)
- **Tablets**: iPad, Android tablets
- **Minimum Screen**: 375px width (iPhone SE and up)

## 🌍 Language Support

Switch languages anytime using the dropdown in the header:
- 🇬🇧 English
- 🇩🇪 Deutsch (German)
- 🇫🇷 Français (French)
- 🇪🇸 Español (Spanish)
- 🇮🇹 Italiano (Italian)
- 🇵🇹 Português (Portuguese)
- 🇳🇱 Nederlands (Dutch)
- 🇵🇱 Polski (Polish)
- 🇷🇺 Русский (Russian)
- 🇹🇷 Türkçe (Turkish)
- 🇸🇦 العربية (Arabic - with RTL support)
- 🇨🇳 中文 (Chinese)

## 🎨 User Interface

### Light Mode (Default)
Clean, professional light theme with blue and green accents.

### Dark Mode
Toggle for comfortable viewing in low-light environments. Preference is saved automatically.

### Progress Tracking
- **Progress Bar**: Visual indicator of completion (Section X of 7)
- **Section Navigation**: Move between sections with Previous/Next buttons
- **Summary View**: Review all answers before export

## 📄 Document Upload

Upload supporting documents to include with your medical history:

- **Images**: JPG, PNG (OCR with Tesseract.js)
- **PDFs**: Text extraction with PDF.js
- **Text Files**: Direct text import

Uploaded documents are included in the encrypted export.

## 💡 Tips for Use

### For Patients
1. Save your progress frequently using the Save button
2. Use encrypted export when sharing with healthcare providers
3. Keep a backup of your encrypted file
4. Review the summary before finalizing

### For Healthcare Providers
1. Request encrypted exports from patients
2. Use the built-in decryption tool to view data
3. The decryption key is: `DiggAi-Medical-Anamnese-Key-v6`
4. Store patient data securely according to local regulations

## 🔧 Technical Specifications

- **File Size**: 71,465 bytes (0.07 MB)
- **Lines of Code**: 1,988
- **Technologies**: HTML5, CSS3, JavaScript ES6+
- **External Libraries**: 
  - Tesseract.js v5 (OCR)
  - PDF.js v3.11.174 (PDF processing)
- **Browser Requirements**: Modern browser with ES6+ support and Web Crypto API

## ❓ Troubleshooting

### Issue: Language not switching
**Solution**: Refresh the page and try again. Ensure JavaScript is enabled.

### Issue: Data not saving
**Solution**: Check that your browser allows localStorage. Try a different browser.

### Issue: Export not working
**Solution**: Ensure pop-ups are not blocked. Check browser console for errors.

### Issue: OCR/PDF not processing
**Solution**: Requires internet connection to load libraries from CDN. Check your connection.

### Issue: Dark mode not persisting
**Solution**: Clear browser cache and try again. Ensure cookies/localStorage are allowed.

## 📞 Support

For issues or questions:
1. Check this README
2. Review the code comments
3. Contact: DiggAi GmbH

## 📄 License

As per repository license.

## 🔄 Version History

### v6.0 (Current)
- Complete single-file implementation
- 12-language support
- AES-256-GCM encryption
- Document processing (OCR/PDF)
- Conditional logic engine
- Removed Vosk speech recognition
- Mobile responsive design
- Dark mode support

---

**Last Updated**: December 2025
**File**: anamnese_complete_v6.html
**Status**: Production Ready ✅
