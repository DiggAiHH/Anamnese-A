# Copilot Instructions for Anamnese-A

## Project Overview
This is a comprehensive offline medical questionnaire (Anamnese) application designed for healthcare settings. It's a Progressive Web App (PWA) with multi-language support, speech recognition, AES-256 encryption, and GDPR/DSGVO compliance. The application allows patients to fill out medical history forms securely, with all data processed locally on-device without external server communication.

## Tech Stack

### Frontend
- **HTML5**: Single-page application structure
- **CSS3**: Responsive design with CSS variables for theming
- **Vanilla JavaScript**: ES6+ with no framework dependencies
- **Web APIs**: Web Crypto API (encryption), Web Audio API (speech), Web Workers, Service Workers (PWA)

### Backend (for practice code generator)
- **Node.js**: 18.0.0+
- **Express**: 4.18.2
- **PostgreSQL**: Database for practice codes
- **Stripe**: Payment integration

### Key Libraries
- **CryptoJS**: AES-256-GCM encryption
- **Vosk Browser**: Local offline speech recognition (German model)
- **Tesseract.js**: Local OCR processing (no external API calls)

## Coding Guidelines

### JavaScript Style
- Follow ESLint rules defined in `.eslintrc.json`:
  - Use **single quotes** for strings
  - Use **2 spaces** for indentation
  - Always add **semicolons**
  - Unix line breaks
  - Avoid `console.log()` (use `console.warn()` or `console.error()` only)
- Use ES6+ features (const/let, arrow functions, async/await)
- Prefer vanilla JavaScript over external libraries
- Use meaningful variable names (camelCase for variables, UPPER_CASE for constants)

### HTML Structure
- Maintain semantic HTML5 structure
- Use ARIA landmarks and labels for accessibility (WCAG 2.1 AA compliance)
- Support RTL languages (Arabic, Farsi, Urdu)
- Include proper meta tags for PWA functionality

### CSS Conventions
- Use CSS variables for theming (defined in `:root`)
- Mobile-first responsive design
- Support for dark/light themes
- Support for high contrast mode and reduced motion

### File Organization
- Production version: `index_v8_complete.html` (all features integrated)
- Main files: `index.html`, `app.js`, `styles.css`
- Modular JavaScript: separate files for encryption, translations, GDPR, GDT export, OCR
- Tests: `test-*.js` and `test-*.html` files for specific features
- Documentation: Markdown files in root directory

## Project Structure

### Key Files and Directories
```
/
├── index_v8_complete.html      # Production version with all features
├── index.html                   # Main application entry point
├── app.js                       # Core application logic
├── encryption.js                # AES-256 encryption/decryption
├── translations.js              # 19-language translation support
├── gdpr-compliance.js           # GDPR compliance utilities
├── gdt-export.js                # GDT format export for PVS integration
├── ocr-gdpr-module.js           # DSGVO-compliant OCR module
├── ai-plausibility-check.js     # Local rule-based validation
├── server.js                    # Node.js backend for practice codes
├── package.json                 # Node dependencies
├── .eslintrc.json               # ESLint configuration
├── models/                      # Vosk speech recognition models
├── public/                      # Static assets
└── .github/                     # GitHub configuration
```

### Main HTML Files
- `index_v8_complete.html`: Full production version with PWA, accessibility, security
- `index_v5.html`: Earlier version with conditional logic
- `anamnese-single-file.html`: Single-file standalone version
- Test files: `test-*.html` for feature testing

## Medical Compliance Requirements

### GDPR/DSGVO Compliance
- **Privacy by Design**: All data processing happens locally in the browser
- **Data Minimization**: Only collect necessary medical information
- **Encryption**: Mandatory AES-256-GCM encryption for all patient data
- **Consent Management**: Granular consent tracking (Art. 6, 7 GDPR)
- **Audit Logging**: Complete logging for GDPR Art. 30, 32
- **Right to Deletion**: One-click data deletion (Art. 17 GDPR)
- **Data Portability**: JSON export functionality (Art. 20 GDPR)
- **No External APIs**: No data sent to Google, AWS, or any external service
- **Retention Policy**: 3-year audit log retention per § 630f BGB

### Privacy Requirements
- Never add external API calls for data processing
- All AI/ML features must be local rule-based systems
- No tracking, cookies, or analytics
- No third-party scripts or external resources
- Master password system for encryption key management

### Security Best Practices
- Use Web Crypto API for all encryption operations
- PBKDF2 key derivation with 100,000 iterations
- Input sanitization to prevent XSS attacks
- Rate limiting (10 saves/min, 30 navigations/min)
- Content Security Policy headers
- Secure localStorage wrapper with quota handling

## Multi-Language Support

### Supported Languages (19 total)
German, English, French, Spanish, Italian, Portuguese, Dutch, Polish, Turkish, Arabic, Russian, Ukrainian, Farsi, Urdu, Chinese, Albanian, Romanian, Hindi, Japanese

### Translation Guidelines
- All UI text must be in `translations.js` with all 19 languages
- Use translation keys, never hardcode strings
- Support RTL layout for Arabic, Farsi, Urdu
- Date and number formatting must respect locale
- Error messages and help text must be translated

## Testing Guidelines

### Test Files
- `test-basic.js`: Basic functionality tests
- `test-integration.js`: Integration tests
- `test-gdt-export.js`: GDT export tests
- `test-ai-plausibility.html`: AI validation tests
- `test_anamnese.html`: Full application test suite

### Testing Principles
- Test encryption/decryption with various inputs
- Test conditional logic for gender-specific questions
- Test date validation (leap years, month boundaries)
- Test all export formats (JSON, GDT)
- Test multi-language translations
- Test accessibility (keyboard navigation, screen readers)
- Test offline functionality

### Running Tests
- Open `test-*.html` files directly in browser
- Run `npm test` for Node.js backend tests
- Use `npm run lint` for code quality checks

## Building and Running

### Frontend (No Build Required)
```bash
# Serve locally
python3 -m http.server 8080
# or
npx http-server -p 8080

# Open http://localhost:8080/index_v8_complete.html
```

### Backend
```bash
# Install dependencies
npm install

# Setup database
npm run setup

# Start server
npm start

# Development mode
npm run dev
```

## Common Tasks

### Adding New Questions
1. Edit `APP_DATA.sections` in the HTML file
2. Add translations for all 19 languages in `translations.js`
3. Add conditional logic if question is gender/answer-dependent
4. Update tests to cover new questions
5. Document in relevant README files

### Adding New Features
1. Check if feature requires external data transmission (if yes, ensure GDPR compliance)
2. Create modular JavaScript file (e.g., `feature-name.js`)
3. Add tests in `test-feature-name.js` or `.html`
4. Update documentation in appropriate markdown files
5. Ensure accessibility (ARIA labels, keyboard support)
6. Test in all supported browsers

### GDT Export Development
- GDT format is for German practice management systems (Medatixx, CGM, Quincy)
- Use templates in `gdt-export-templates.js`
- All GDT exports require GDPR consent tracking
- Must support pseudonymization option
- Generate audit logs for all exports

### Documentation
- Update README.md for major features
- Create specific docs (e.g., `FEATURE_README.md`) for complex features
- Include code examples and usage instructions
- Document GDPR compliance aspects
- Keep CHANGELOG.md updated

## Important Conventions

### Encryption
- Always use AES-256-GCM mode
- Master password minimum 16 characters
- Store encryption key in sessionStorage (cleared on browser close)
- Store password hash in localStorage (for verification only)
- Never log or expose encryption keys

### Voice Recognition
- Prefer local Vosk models over browser APIs
- Fallback to browser speech recognition if Vosk unavailable
- Support German (primary), plus other languages via browser API
- Check microphone permissions before starting

### Accessibility
- All interactive elements must be keyboard accessible
- Provide skip links to main content
- Use semantic HTML5 elements
- ARIA labels for all form controls
- Support screen reader announcements (live regions)
- Respect user preference for reduced motion

### Progressive Web App
- Service worker in `sw.js` handles offline caching
- Manifest in `manifest.json` defines app metadata
- Update service worker version when deploying changes
- Notify users of available updates

## References

### Key Documentation Files
- `README.md`: Main project documentation
- `SETUP.md`: Installation and configuration guide
- `DSGVO_OCR_COMPLIANCE.md`: OCR GDPR compliance
- `GDPR_EXPORT_DOCUMENTATION.md`: GDT export GDPR docs
- `PWA_FEATURES.md`: PWA installation guide
- `AI_PRIVACY_IMPACT_ASSESSMENT.md`: DSFA/PIA documentation
- `TEST_DOCUMENTATION.md`: Testing procedures

### Medical Standards
- Follow German medical data protection standards (§ 630f BGB)
- Comply with GDPR Articles: 6, 7, 13, 15, 17, 20, 30, 32, 35
- Data Protection Officer (DSB) review required for GDT exports

## Tips for Copilot

### When Suggesting Code
- Prioritize privacy and security
- Always maintain offline-first functionality
- Check if translations are needed
- Consider accessibility requirements
- Avoid adding external dependencies
- Follow existing code patterns in the repository

### When Adding Features
- Verify GDPR compliance first
- Add comprehensive tests
- Update relevant documentation
- Maintain backward compatibility
- Consider mobile/tablet users
- Test in multiple languages

### When Fixing Bugs
- Check if fix maintains encryption/security
- Ensure fix doesn't break offline mode
- Test with different language settings
- Verify accessibility isn't compromised
- Update tests to prevent regression
