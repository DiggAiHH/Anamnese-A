# Medizinische Anamnese - Complete Single File Application

## 📄 Comprehensive Standalone Version

This is a **complete single-file HTML application** that contains ALL the functionality of the comprehensive medical questionnaire system in one standalone file: `anamnese-single-file.html`

## ✨ Complete Features

- 🏥 **250+ Medical Questions** - Comprehensive questionnaire across all medical specialties
- 🌍 **10 Languages** - Deutsch, English, Français, Español, Italiano, Türkçe, Polski, Русский, العربية, 中文
- 🔀 **Conditional Logic** - Dynamic questions based on previous answers
- 📧 **Email Export** - Send data via email (mailto functionality)
- 🔒 **AES-256 Encryption** - All data encrypted locally with Web Crypto API (PBKDF2 key derivation)
- 💾 **Local Storage** - Data stored only on your device with persistence
- 🎤 **VOSK Speech Recognition** - Offline voice input with VOSK library
- 📤 **JSON Import/Export** - Full data import and export capabilities
- 📊 **Progress Tracking** - Visual progress through questionnaire sections
- 📋 **Answer Summary** - Review all answers in a summary view
- 🔐 **Privacy-First** - GDPR/DSGVO compliant, no external data transmission
- 📱 **Responsive** - Works on desktop, tablet, and mobile
- 🌐 **Mostly Offline** - Only requires CDN for VOSK library (optional)

## 🚀 Quick Start

1. **Download** `anamnese-single-file.html` 
2. **Open** the file in your web browser (Chrome, Firefox, Safari, or Edge)
3. **Start using** - No installation required!

**Note**: The application loads the VOSK speech recognition library from a CDN. For full offline use, you can work without speech recognition or host the VOSK library locally.

## 📊 Comprehensive Medical Coverage

### Included Medical Specialties

1. **Basic Patient Data**
   - Personal information
   - Contact details
   - Birth date and demographics

2. **Ophthalmology** (Eye Complaints)
   - Visual disturbances
   - Eye conditions
   - Vision problems

3. **ENT** (Ear, Nose, Throat)
   - Hearing disorders
   - Nasal conditions
   - Throat and voice problems
   - Ear issues
   - Swallowing difficulties

4. **Psychology/Psychiatry**
   - Depression screening
   - Anxiety disorders
   - Sleep disorders
   - Concentration issues
   - Substance use assessment
   - Suicidal ideation screening

5. **Pediatrics**
   - Birth data and neonatal history
   - Growth and development
   - Vaccination status
   - Chronic pediatric conditions
   - Social and psychological aspects
   - **Specialized Modules**:
     - Neonatology
     - Adolescence
     - Allergology

6. **Internal Medicine**
   - Cardiovascular symptoms
   - Respiratory conditions
   - Gastrointestinal issues
   - Metabolic disorders

7. **Medication Management**
   - Detailed medication categories
   - Drug interactions
   - Current medications

8. **And Many More Specialties...**

### Question Types
- Text input
- Number input
- Single choice (radio buttons)
- Multiple choice (checkboxes)
- Date selection (day/month/year dropdowns)
- Textarea for detailed responses

### Conditional Logic Examples
- Questions appear only if relevant (e.g., pediatric questions only for children)
- Follow-up questions based on previous answers
- Dynamic sections based on age, gender, or specific conditions

## 📋 Usage Instructions

### Navigating the Questionnaire
1. Select your preferred language from the dropdown
2. Answer questions section by section
3. Use "Next" button to proceed to next section
4. Use "Previous" button to go back
5. Track progress with the progress bar at the top

### Key Features

#### Conditional Questions
- Some questions only appear based on your previous answers
- This makes the questionnaire more relevant and efficient
- Example: Pediatric questions only show for younger patients

#### Answer Summary
- View all your answers in the summary box
- Click on any answer to jump to that question
- Review and edit answers easily

#### Voice Input (VOSK)
1. Click the microphone button next to text fields
2. Allow microphone access when prompted
3. Speak clearly in your selected language
4. VOSK processes speech locally (privacy-focused)

### Saving Your Data (Encrypted)
1. Click **"Verschlüsselt Speichern"** (Save Encrypted)
2. Enter a strong password
3. Your data is encrypted with AES-256 and saved locally

### Loading Saved Data
1. Click **"Gespeicherte Daten Laden"** (Load Saved Data)
2. Enter your password
3. Your form is populated with decrypted data

### Exporting Data

#### JSON Export
1. Click "Exportieren" button
2. Download the JSON file with all your answers
3. Use for backup or transfer to another device

#### Email Export
1. Click "Per E-Mail senden" button
2. Your default email client opens with the data
3. Add recipient and send
4. Data is included in the email body (encrypted option available)

### Importing Data
1. Click "Importieren" button
2. Select a previously exported JSON file
3. All answers are restored
4. Continue where you left off

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
- **Size:** ~619 KB
- **Lines:** 12,769
- **Dependencies:** VOSK library from CDN (optional, for speech recognition)
- **Version:** 3.0.0 (Complete Single-File Edition)

## 🔄 Complete Feature Set

### What's Included (Full Version)
- **250+ medical questions** across all specialties
- **444+ field labels** translated in 10 languages
- **Conditional logic** for dynamic question display
- **Email export** functionality (mailto links)
- **VOSK speech recognition** integration
- **Progress tracking** and section navigation
- **Answer summary** with jump-to-question
- **AES-256 encryption** for data storage
- **JSON import/export** for backup/restore
- **Form validation** and error handling
- **Responsive design** for all devices
- **RTL support** for Arabic

### Translations Coverage
All 250+ questions and 444+ field labels are fully translated in:
- 🇩🇪 Deutsch (German)
- 🇬🇧 English
- 🇫🇷 Français (French)
- 🇪🇸 Español (Spanish)
- 🇮🇹 Italiano (Italian)
- 🇹🇷 Türkçe (Turkish)
- 🇵🇱 Polski (Polish)
- 🇷🇺 Русский (Russian)
- 🇸🇦 العربية (Arabic)
- 🇨🇳 中文 (Chinese)

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
