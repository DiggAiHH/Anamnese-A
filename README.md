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

- **[SETUP.md](SETUP.md)**: Detailed setup guide
- **[Test Suite](test_anamnese.html)**: Comprehensive tests

## 🔧 Technical Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Encryption**: CryptoJS (AES-256)
- **Speech Recognition**: Vosk Browser
- **Storage**: LocalStorage API
- **Export**: Web NFC API, Mailto

## 🧪 Testing

The project includes a comprehensive test suite covering:

- ✅ Encryption/Decryption
- ✅ Answer Storage
- ✅ Conditional Logic
- ✅ Date Validation
- ✅ Multi-language Support
- ✅ Export Functionality
- ✅ Input Validation

Run tests by opening `test_anamnese.html` in your browser.

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