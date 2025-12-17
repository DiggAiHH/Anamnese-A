# Anamnese Medical Questionnaire - Setup Guide

## Overview
This is a comprehensive offline medical questionnaire application with speech recognition, multi-language support, and encrypted data export.

## Features

### 1. Multi-language Support
The application supports 10+ languages:
- 🇩🇪 German (Deutsch)
- 🇬🇧 English
- 🇫🇷 French (Français)
- 🇪🇸 Spanish (Español)
- 🇮🇹 Italian (Italiano)
- 🇹🇷 Turkish (Türkçe)
- 🇵🇱 Polish (Polski)
- 🇷🇺 Russian (Русский)
- 🇸🇦 Arabic (العربية)
- 🇨🇳 Chinese (中文)

### 2. Conditional Logic
- Questions are shown/hidden based on previous answers
- Example: Gynecology questions only shown for female patients
- Gender-specific question routing

### 3. Data Security
- **AES-256 Encryption**: All answers can be encrypted before export
- **Local Processing**: No data sent to external servers
- **Encrypted Export**: JSON data encrypted on device
- **Decryption Tool**: Built-in decryption for healthcare providers

### 4. Export Options
- **JSON Export**: Encrypted or raw JSON files
- **NFC Transfer**: Transfer data via NFC (if supported by device)
- **Email**: Send encrypted data via email

### 5. Speech Recognition
- **Vosk Integration**: Offline speech recognition
- **45MB German Model**: Optimized for medical terminology
- **Automatic Fallback**: Falls back to CDN if local model unavailable

## Installation

### Basic Setup
1. Clone this repository
2. Open `index_v5.html` in a modern web browser
3. Accept privacy policy to begin

### Vosk Speech Recognition Setup

#### Option 1: Local Model (Recommended for Offline Use)
1. Download the Vosk German model (45MB):
   ```
   https://alphacephei.com/vosk/models/vosk-model-small-de-0.15.zip
   ```

2. Create a `models` directory in the same folder as `index_v5.html`:
   ```
   mkdir models
   ```

3. Extract the downloaded model to the `models` directory:
   ```
   unzip vosk-model-small-de-0.15.zip -d models/
   ```

4. The final structure should be:
   ```
   /
   ├── index_v5.html
   ├── models/
   │   └── vosk-model-small-de-0.15.zip (or extracted folder)
   ├── test_anamnese.html
   └── README.md
   ```

#### Option 2: CDN Model (Automatic Fallback)
If no local model is found, the application automatically uses the CDN-hosted model.

### Running a Local Server
For best performance, especially with local Vosk models, run a local web server:

#### Python 3:
```bash
python3 -m http.server 8080
```

#### Python 2:
```bash
python -m SimpleHTTPServer 8080
```

#### Node.js (with http-server):
```bash
npx http-server -p 8080
```

Then open: `http://localhost:8080/index_v5.html`

## Testing

### Running Tests
1. Open `test_anamnese.html` in your browser
2. Tests will automatically run
3. View results on the page

### Test Coverage
- ✅ Encryption/Decryption (AES-256)
- ✅ Answer Storage (update vs append)
- ✅ Conditional Logic (gender, complaints)
- ✅ Date Validation (leap years, month days)
- ✅ Multi-language Translations
- ✅ Export Functionality (JSON, NFC, Email)
- ✅ UI Consistency
- ✅ Input Validation

## Usage Guide

### For Patients

1. **Select Language**: Choose your preferred language from the dropdown
2. **Fill Basic Data**: Enter name, gender, date of birth
3. **Answer Questions**: Navigate through sections using Next/Back buttons
4. **Use Voice Input** (Optional): Click microphone icon next to input fields
5. **Review Answers**: Click on answers in the summary box to edit
6. **Export Data**: 
   - Click "Export (Encrypted)" for secure export
   - Or use NFC/Email options

### For Healthcare Providers

1. **Receive Encrypted Data**: Get encrypted JSON from patient
2. **Decrypt Data**: 
   - Click "Decrypt Data" button
   - Paste encrypted text
   - View patient answers

## Security Considerations

### Encryption Key
- Default key is set in the code: `ENCRYPTION_KEY`
- **IMPORTANT**: Change this key in production!
- Key should be 32 bytes for AES-256
- Store key securely and share only with authorized healthcare providers

### Recommended Key Management
```javascript
// In production, use a secure key management system
// Example: Generate unique keys per patient/session
const ENCRYPTION_KEY = generateSecureKey(); // Your secure key generation
```

### Data Privacy
- All processing happens locally in the browser
- No data sent to external servers
- Patient controls their own data export

## Browser Compatibility

### Supported Browsers
- ✅ Chrome/Chromium 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

### Required Features
- JavaScript enabled
- Local Storage support
- Web Audio API (for voice recognition)
- Web NFC API (optional, for NFC export)

## Troubleshooting

### Voice Recognition Not Working
1. Ensure microphone permissions are granted
2. Check if local Vosk model is properly installed
3. Try using CDN model (automatically falls back)
4. Check browser console for errors

### Translations Not Showing
1. Verify language is selected in dropdown
2. Check that `APP_DATA.translations` contains the language
3. Clear browser cache and reload

### NFC Export Not Available
- NFC is only supported on Android Chrome
- Use Email or File export as alternative

### Encrypted Data Cannot Be Decrypted
1. Ensure you're using the same encryption key
2. Check that data wasn't modified during transfer
3. Verify encrypted text was completely copied

## Development

### File Structure
```
/
├── index_v5.html          # Main application
├── test_anamnese.html     # Test suite
├── SETUP.md               # This file
├── README.md              # Project overview
└── models/                # Vosk models (optional)
```

### Adding New Questions
1. Edit `APP_DATA.sections` in `index_v5.html`
2. Add translations for all supported languages
3. Add conditions if question is conditional
4. Test thoroughly

### Adding New Languages
1. Add language code to `language_names`
2. Add translations to `translations[lang]`
3. Include at minimum: UI labels, export messages, date labels

## Technical Details

### Technologies Used
- **HTML5**: Application structure
- **CSS3**: Styling with CSS variables for theming
- **Vanilla JavaScript**: No framework dependencies
- **CryptoJS**: AES-256 encryption
- **Vosk**: Offline speech recognition
- **Web NFC API**: NFC data transfer
- **LocalStorage**: Answer persistence

### Architecture
- **Single Page Application**: All functionality in one HTML file
- **Progressive Enhancement**: Works without voice recognition
- **Offline First**: Designed for offline operation
- **Privacy First**: No external data transmission

## Support

For issues or questions:
1. Check this SETUP guide
2. Review test results in `test_anamnese.html`
3. Check browser console for errors
4. Review source code comments

## License

Medical device regulations may apply. Consult with legal and medical professionals before clinical use.

## Credits

- **Medical Concept**: Dr. Christian Klapproth
- **Technical Implementation**: DiggAi GmbH
- **Speech Recognition**: Vosk Browser
- **Encryption**: CryptoJS
