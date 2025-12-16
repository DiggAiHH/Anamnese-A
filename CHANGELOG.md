# Changelog

All notable changes to the Anamnese Medical Questionnaire project.

## [3.0.0] - 2024-12-16

### 🎉 Major Release - Complete Rewrite

#### Added

##### Core Features
- **Multi-language Support**: Added support for 10+ languages (DE, EN, FR, ES, IT, TR, PL, RU, AR, ZH, PT)
- **Offline Speech Recognition**: Integrated Vosk with local 45MB German model support
- **AES-256 Encryption**: Secure patient data encryption before export
- **Conditional Question Logic**: Smart question routing based on previous answers
- **Gender-based Routing**: Gynecology questions only shown for female patients
- **Clickable Summary**: Navigate to questions by clicking answers in summary box

##### Export Options
- **JSON File Export**: Both encrypted and raw JSON export
- **NFC Transfer**: Transfer encrypted data via NFC (on supported devices)
- **Email Export**: Send encrypted data via mailto link
- **Decryption Tool**: Built-in tool for healthcare providers to decrypt data

##### User Interface
- **Improved Birthday Picker**: Responsive grid layout with better styling
- **Dark/Light Theme**: Toggle between themes with persistent preference
- **Progress Tracking**: Visual progress bar with section indicators
- **Real-time Validation**: Input validation with helpful error messages
- **Responsive Design**: Mobile-friendly with adaptive layouts

##### Technical Improvements
- **Answer Update Logic**: Answers update instead of append (one answer per question)
- **Local Storage**: Automatic save/restore of questionnaire progress
- **CDN Fallback**: Automatic fallback to CDN if local Vosk model unavailable
- **Configurable Models**: Easy configuration of speech recognition models
- **Security Warnings**: Runtime warnings for default encryption keys

#### Changed

##### Architecture
- Refactored from multi-file to single-file application for easier deployment
- Improved code organization with clear sections and comments
- Enhanced error handling throughout the application
- Better separation of concerns (UI, logic, data)

##### Performance
- Optimized rendering with conditional section checks
- Lazy loading of speech recognition models
- Efficient answer storage and retrieval
- Minimized DOM manipulations

##### Security
- Enhanced encryption key configuration with warnings
- Clear separation of test and production keys
- Security documentation and best practices
- Comprehensive .gitignore to prevent sensitive data commits

#### Fixed
- Incomplete HTML button tag
- Broken answer navigation
- Date picker styling issues
- Conditional logic not applying to all sections
- Missing translation functions
- Answer box showing multiple entries per question
- Inconsistent answer storage behavior

### Documentation

#### Added
- **SETUP.md**: Comprehensive setup and usage guide
- **README.md**: Project overview and quick start
- **DEPLOYMENT.md**: Complete deployment checklist
- **models/README.md**: Vosk model download and configuration
- **CHANGELOG.md**: This file

#### Improved
- Inline code comments with German/English translations
- Security warnings and configuration notes
- Function documentation with JSDoc style
- Examples and usage patterns

### Testing

#### Added
- **test_anamnese.html**: Comprehensive test suite with 28+ tests
- Encryption/decryption tests
- Answer storage and update tests
- Conditional logic tests
- Date validation tests (including leap years)
- Multi-language translation tests
- Export functionality tests
- Input validation tests
- UI consistency tests

### Security

#### Enhanced
- AES-256 encryption implementation
- Runtime warning for default encryption keys
- Clear documentation of security best practices
- Test key separation from production patterns
- .gitignore to prevent accidental data commits

### Compliance

#### Added
- Medical device considerations in documentation
- Data privacy guidelines (GDPR/HIPAA considerations)
- Accessibility features (keyboard navigation, ARIA labels)
- Browser compatibility documentation

## [2.0.0] - Previous Version

### Features
- Basic questionnaire functionality
- Simple German language support
- Local storage of answers
- Basic export to JSON

## [1.0.0] - Initial Release

### Features
- Initial HTML-based questionnaire
- Static question flow
- Manual data export

---

## Upgrade Guide

### From 2.x to 3.0

1. **Backup existing data**: Export any saved questionnaires
2. **Update encryption key**: Change from default in new version
3. **Download Vosk model**: If using speech recognition
4. **Test in staging**: Validate all features before production
5. **Update documentation**: Review new SETUP.md and DEPLOYMENT.md

### Breaking Changes in 3.0

- **File Structure**: Now single-file application (index_v5.html)
- **Encryption Key**: Must be configured (no longer optional)
- **Browser Requirements**: Minimum versions increased (Chrome 90+, Firefox 88+)
- **API Changes**: Answer storage format updated (backward compatible with reading)

### Migration Path

1. Export existing data from 2.x
2. Deploy 3.0 application
3. Configure encryption key
4. Import/convert old data if needed
5. Train users on new features

---

## Future Roadmap

### Planned Features (v3.1)
- [ ] Additional language support
- [ ] Larger Vosk models for improved accuracy
- [ ] PDF export with questionnaire responses
- [ ] Admin dashboard for healthcare providers
- [ ] Batch decryption tool
- [ ] Enhanced analytics and reporting

### Under Consideration
- [ ] Integration with EHR systems
- [ ] Cloud backup option (encrypted)
- [ ] Multi-user collaboration
- [ ] Template customization
- [ ] Questionnaire versioning
- [ ] Audit logging

---

## Support

For issues, questions, or contributions:
- Review [SETUP.md](SETUP.md) for setup help
- Check [DEPLOYMENT.md](DEPLOYMENT.md) for deployment guidance
- Run [test_anamnese.html](test_anamnese.html) to validate functionality
- Review browser console for error messages

## Credits

- **Medical Concept**: Dr. Christian Klapproth
- **Technical Implementation**: DiggAi GmbH
- **Libraries**: CryptoJS, Vosk Browser
- **Contributors**: See Git history for detailed contributions

## License

Medical device regulations may apply. Consult with legal and medical professionals before clinical use.

---

**Version Format**: Major.Minor.Patch (following Semantic Versioning)
- **Major**: Breaking changes, major features
- **Minor**: New features, backward compatible
- **Patch**: Bug fixes, small improvements
