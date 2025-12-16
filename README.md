# Medizinische Anamnese / Medical History Application

## 🏥 Offline Data Protection-Compliant HTML Medical History Form

A fully offline, privacy-compliant medical history (Anamnese) application with multi-language support, AES-256 encryption, and local speech recognition.

## ✨ Features

- **🌍 Multi-Language Support**: 10 languages (German, English, French, Spanish, Italian, Portuguese, Dutch, Polish, Turkish, Arabic)
- **🔒 AES-256 Encryption**: All data encrypted with Web Crypto API using AES-256-GCM
- **💾 Local Storage**: All data stored only on your device (localStorage)
- **🎤 Speech Recognition**: VOSK-based local speech recognition (German 50 MB model) with browser fallback
- **📤 JSON Export**: Export your medical history as JSON file
- **🔐 Privacy-Compliant**: GDPR/DSGVO compliant - no external server communication
- **📱 Responsive Design**: Works on desktop, tablet, and mobile devices
- **🌐 Fully Offline**: No internet connection required

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
├── index.html              # Main HTML file with form
├── styles.css              # Styling and responsive design
├── app.js                  # Main application logic
├── translations.js         # 10-language translation support
├── encryption.js           # AES-256 encryption/decryption
├── vosk-integration.js     # VOSK speech recognition integration
├── vosk-worker.js          # Web Worker for VOSK processing
├── README.md               # This file
└── model/                  # VOSK model folder (user-provided)
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