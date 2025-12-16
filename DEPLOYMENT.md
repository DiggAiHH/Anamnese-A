# Deployment Checklist for Anamnese Medical Questionnaire

## Pre-Deployment Requirements

### 1. Security Configuration ⚠️ CRITICAL

#### Encryption Key
- [ ] **Change the default encryption key in `index_v5.html`**
  - Find: `const ENCRYPTION_KEY = "Your-Secret-Key-Here-Must-Be-32-Bytes";`
  - Replace with a secure 32-byte key
  - **Generate a secure key:**
    ```bash
    # Using OpenSSL (Linux/Mac)
    openssl rand -hex 16
    
    # Using Node.js
    node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
    
    # Or use a password generator for a 32-character string
    ```
  - **Store the key securely** (password manager, secure vault)
  - **Share only with authorized healthcare staff**

#### Security Verification
- [ ] Confirm security warning appears in console if default key is used
- [ ] Test encryption/decryption with new key
- [ ] Document key storage location (secure, not in code repository)
- [ ] Establish key rotation policy if required by regulations

### 2. Vosk Speech Recognition Setup

#### Option A: Local Model (Recommended for Offline)
- [ ] Download Vosk German model:
  ```bash
  cd models/
  wget https://alphacephei.com/vosk/models/vosk-model-small-de-0.15.zip
  ```
- [ ] Verify model file size (~45MB)
- [ ] Test local model loading
- [ ] Confirm voice recognition works

#### Option B: CDN Model (Online Only)
- [ ] Verify internet connectivity
- [ ] Test CDN model fallback
- [ ] Confirm acceptable latency

### 3. Browser Compatibility Testing

Test on target browsers:
- [ ] Chrome/Chromium 90+
- [ ] Firefox 88+
- [ ] Safari 14+ (if applicable)
- [ ] Edge 90+ (if applicable)
- [ ] Mobile browsers (iOS Safari, Chrome Mobile)

Verify features work:
- [ ] Speech recognition
- [ ] NFC export (Android Chrome only)
- [ ] File download
- [ ] Email mailto
- [ ] Local storage
- [ ] Dark/light theme

### 4. Language Configuration

- [ ] Verify all required languages are present:
  - [ ] German (DE) - Primary
  - [ ] English (EN)
  - [ ] French (FR)
  - [ ] Spanish (ES)
  - [ ] Italian (IT)
  - [ ] Turkish (TR)
  - [ ] Polish (PL)
  - [ ] Russian (RU)
  - [ ] Arabic (AR)
  - [ ] Chinese (ZH)
  
- [ ] Test language switching
- [ ] Verify all UI elements translate
- [ ] Check RTL layout for Arabic

### 5. Conditional Logic Verification

Test question routing:
- [ ] Male patients don't see gynecology questions
- [ ] Female patients see gynecology questions
- [ ] Conditional questions based on previous answers
- [ ] Navigation skips hidden sections correctly

### 6. Data Export Testing

Test all export methods:
- [ ] JSON file export (encrypted)
- [ ] JSON file export (raw)
- [ ] NFC export (on supported devices)
- [ ] Email export (mailto link)
- [ ] Decryption tool works with encrypted data

### 7. User Interface Testing

- [ ] Birthday date picker displays correctly
- [ ] All form fields accept input
- [ ] Summary box shows current answers
- [ ] Clicking summary items navigates to questions
- [ ] Progress bar updates correctly
- [ ] Validation messages appear
- [ ] Required field indicators show

## Deployment Steps

### Step 1: Prepare Files

```bash
# Create deployment directory
mkdir anamnese-deployment
cd anamnese-deployment

# Copy required files
cp /path/to/index_v5.html .
cp /path/to/SETUP.md .
cp /path/to/README.md .

# Copy models directory (with Vosk model)
cp -r /path/to/models .

# Optional: Copy test file for validation
cp /path/to/test_anamnese.html .
```

### Step 2: Configure Application

1. **Update encryption key** (see Security Configuration above)
2. **Verify model paths** in `index_v5.html`
3. **Test locally** before deploying

### Step 3: Web Server Setup

#### Option A: Simple HTTP Server (Development/Testing)
```bash
# Python 3
python3 -m http.server 8080

# Node.js
npx http-server -p 8080
```

#### Option B: Production Web Server (Apache/Nginx)

**Apache Configuration:**
```apache
<VirtualHost *:80>
    ServerName anamnese.example.com
    DocumentRoot /var/www/anamnese
    
    <Directory /var/www/anamnese>
        Options -Indexes +FollowSymLinks
        AllowOverride None
        Require all granted
        
        # Security headers
        Header set X-Frame-Options "SAMEORIGIN"
        Header set X-Content-Type-Options "nosniff"
        Header set X-XSS-Protection "1; mode=block"
    </Directory>
    
    # Enable HTTPS (recommended)
    # Include SSL configuration
</VirtualHost>
```

**Nginx Configuration:**
```nginx
server {
    listen 80;
    server_name anamnese.example.com;
    root /var/www/anamnese;
    index index_v5.html;
    
    location / {
        try_files $uri $uri/ =404;
    }
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";
    add_header X-XSS-Protection "1; mode=block";
    
    # Enable HTTPS (recommended)
    # Include SSL configuration
}
```

### Step 4: SSL/TLS Setup (Recommended)

For production environments:
- [ ] Obtain SSL certificate (Let's Encrypt, commercial CA)
- [ ] Configure HTTPS
- [ ] Redirect HTTP to HTTPS
- [ ] Verify SSL configuration (SSLLabs)

### Step 5: Access Control

If restricting access:
- [ ] Configure authentication (Basic Auth, OAuth, etc.)
- [ ] Set up IP whitelisting if needed
- [ ] Configure firewall rules
- [ ] Document access procedures

### Step 6: Backup & Recovery

- [ ] Set up automated backups of configuration
- [ ] Document encryption key storage
- [ ] Create disaster recovery plan
- [ ] Test restoration procedures

## Post-Deployment Validation

### Functional Testing
- [ ] Open application in browser
- [ ] Test language selection
- [ ] Complete a full questionnaire
- [ ] Verify conditional logic works
- [ ] Test voice recognition (if using Vosk)
- [ ] Export data (all methods)
- [ ] Decrypt exported data
- [ ] Test on multiple devices/browsers

### Performance Testing
- [ ] Page load time acceptable
- [ ] Voice recognition latency acceptable
- [ ] Form input responsive
- [ ] No console errors
- [ ] Local storage working

### Security Validation
- [ ] Verify encryption key was changed
- [ ] Check security headers
- [ ] Verify HTTPS (if configured)
- [ ] Test data export encryption
- [ ] Confirm no sensitive data in browser storage

### User Acceptance Testing
- [ ] Train healthcare staff on usage
- [ ] Conduct pilot with real users
- [ ] Gather feedback
- [ ] Document issues/improvements
- [ ] Iterate if needed

## Maintenance & Monitoring

### Regular Checks
- [ ] Monitor browser console for errors
- [ ] Check local storage usage
- [ ] Verify voice model still accessible
- [ ] Test all export methods monthly
- [ ] Review encryption key security

### Updates
- [ ] Keep browser requirements documented
- [ ] Update Vosk models if newer versions available
- [ ] Monitor for CryptoJS security updates
- [ ] Review and update translations

### Backup Schedule
- [ ] Weekly: Configuration backup
- [ ] Monthly: Full application backup
- [ ] After changes: Immediate backup
- [ ] Test restoration quarterly

## Compliance & Regulations

### Medical Device Regulations
- [ ] Consult with legal team
- [ ] Verify compliance with local regulations (e.g., MDR in EU)
- [ ] Document intended use
- [ ] Establish quality management system if required
- [ ] Consider clinical validation requirements

### Data Protection (GDPR/HIPAA)
- [ ] Conduct data protection impact assessment
- [ ] Document data processing activities
- [ ] Establish data retention policies
- [ ] Implement right to erasure
- [ ] Create privacy policy
- [ ] Train staff on data protection

### Accessibility
- [ ] Verify WCAG compliance level
- [ ] Test with screen readers
- [ ] Check keyboard navigation
- [ ] Validate color contrast
- [ ] Document accessibility features

## Support & Documentation

### User Documentation
- [ ] Create user guide for patients
- [ ] Create user guide for healthcare staff
- [ ] Document troubleshooting steps
- [ ] Provide contact information for support

### Technical Documentation
- [ ] Document architecture
- [ ] Create API documentation (if applicable)
- [ ] Document deployment procedures
- [ ] Maintain change log
- [ ] Document known limitations

### Training
- [ ] Train healthcare staff on:
  - [ ] Application usage
  - [ ] Data decryption
  - [ ] Troubleshooting common issues
  - [ ] Security best practices
  - [ ] Privacy requirements

## Rollback Plan

In case of issues:
1. **Immediate Actions:**
   - [ ] Revert to previous version
   - [ ] Notify users of temporary issue
   - [ ] Document the problem

2. **Investigation:**
   - [ ] Identify root cause
   - [ ] Test fix in staging environment
   - [ ] Verify fix resolves issue

3. **Re-deployment:**
   - [ ] Follow deployment checklist
   - [ ] Extra validation testing
   - [ ] Gradual rollout if possible

## Emergency Contacts

Document:
- [ ] Technical support contact
- [ ] Security incident contact
- [ ] Encryption key backup location
- [ ] Server administrator contact
- [ ] Medical device regulatory contact (if applicable)

## Sign-off

Deployment completed by: _____________________ Date: _________

Validated by: _____________________ Date: _________

Approved by: _____________________ Date: _________

---

**Notes:**
- This checklist should be customized for your specific deployment environment
- Always test in a staging environment before production deployment
- Keep this checklist updated as the application evolves
- Document any deviations from this checklist
