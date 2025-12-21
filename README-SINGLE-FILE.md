# Medizinische Anamnese - Single File Application

## 📄 Standalone Version

This is a **single-file HTML application** that contains all the functionality of the medical history (Anamnese) application in one standalone file: `anamnese-single-file.html`

## ✨ Features

- 🌍 **10 Languages** - Deutsch, English, Français, Español, Italiano, Português, Nederlands, Polski, Türkçe, العربية
- 🔒 **AES-256 Encryption** - All data encrypted locally with Web Crypto API
- 💾 **Local Storage** - Data stored only on your device
- 🎤 **Speech Recognition** - Browser-based voice input (Chrome, Edge, Safari)
- 📤 **JSON Export** - Export your data as JSON for backup
- 🔐 **Privacy-First** - GDPR/DSGVO compliant, no external servers
- 📱 **Responsive** - Works on desktop, tablet, and mobile
- 🌐 **Fully Offline** - No internet connection required

## 🚀 Quick Start

1. **Download** `anamnese-single-file.html` 
2. **Open** the file in your web browser (Chrome, Firefox, Safari, or Edge)
3. **Start using** - No installation or setup required!

That's it! The application runs entirely in your browser.

## 📋 Usage Instructions

### Filling the Form
1. Select your preferred language from the dropdown
2. Fill in your personal information
3. Complete the medical history sections
4. Add lifestyle information
5. Check the privacy consent checkbox

### Saving Your Data (Encrypted)
1. Click **"Verschlüsselt Speichern"** (Save Encrypted)
2. Enter a strong password
3. Your data is encrypted with AES-256 and saved locally

### Loading Saved Data
1. Click **"Gespeicherte Daten Laden"** (Load Saved Data)
2. Enter your password
3. Your form is populated with decrypted data

### Exporting Data
1. Click **"Als JSON Exportieren"** (Export as JSON)
2. Download the unencrypted JSON file for backup

### Voice Input
1. Click the 🎤 microphone button next to any text field
2. Allow microphone access when prompted
3. Speak clearly in your selected language
4. Click the status indicator to stop recording

## ⌨️ Keyboard Shortcuts

- **Ctrl+S** - Save encrypted
- **Ctrl+L** - Load saved data
- **Ctrl+E** - Export as JSON
- **ESC** - Close modal or stop voice recognition

## 🔐 Security Features

### Encryption
- **Algorithm:** AES-256-GCM (authenticated encryption)
- **Key Derivation:** PBKDF2 with 100,000 iterations
- **Random:** Salt and IV generated for each encryption
- **No Cloud:** All encryption happens locally in your browser

### Privacy
- ✅ All data stored locally (localStorage)
- ✅ No external API calls
- ✅ No cookies or tracking
- ✅ No data transmission over network
- ✅ User has full control over data
- ✅ Open source code (inspectable)

## 🌐 Browser Compatibility

### Recommended Browsers
- Chrome/Chromium 60+
- Firefox 60+
- Safari 11+
- Edge 79+

### Required Features
- Web Crypto API (for encryption)
- LocalStorage (for data persistence)
- Web Speech API (for voice input, optional)

## 📊 Form Sections

1. **Persönliche Daten** (Personal Information)
   - Name, Date of Birth, Gender
   - Address, Phone, Email

2. **Medizinische Vorgeschichte** (Medical History)
   - Current Complaints
   - Past Illnesses
   - Surgeries
   - Current Medications
   - Allergies
   - Family History

3. **Lebensstil** (Lifestyle)
   - Smoking Status
   - Alcohol Consumption
   - Physical Activity

4. **Zusätzliche Informationen** (Additional Information)
   - Additional Notes

## 📝 File Information

- **Filename:** `anamnese-single-file.html`
- **Size:** ~60 KB
- **Lines:** 1,674
- **Dependencies:** None (completely self-contained)

## 🔄 Differences from Multi-File Version

### What's Different
- **Single file** instead of multiple HTML/CSS/JS files
- **Browser Speech API** instead of VOSK (simpler, works in more browsers)
- **No external dependencies** - everything embedded

### What's the Same
- All 10 languages
- AES-256 encryption
- All form fields and functionality
- LocalStorage persistence
- JSON export
- Responsive design

## 🆘 Troubleshooting

### Data Not Saving
- Check if your browser supports localStorage
- Ensure you're not in private/incognito mode
- Check browser console for errors (F12)

### Voice Recognition Not Working
- Ensure your browser supports Web Speech API
- Check microphone permissions in browser settings
- Try Chrome or Edge (best support)

### Wrong Password Error
- Make sure Caps Lock is off
- Try re-entering your password carefully
- Passwords are case-sensitive

## 📞 Support

For issues or questions, please open an issue in the repository.

## ⚠️ Disclaimer

This application is designed for medical history data collection. It should not be used as a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of qualified health providers.

## 📄 License

This project is provided as-is for medical data collection purposes. Ensure compliance with local healthcare regulations and data protection laws in your jurisdiction.

---

**Remember:** Your password is never stored. If you lose your password, you cannot recover your encrypted data. Always keep your password safe and consider exporting unencrypted backups.
