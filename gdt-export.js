// GDT Export Module - GDT 3.0/3.1 Compliant Export
// Implements secure, GDPR-compliant export for Medatixx, CGM, and Quincy systems
// All exports are local-only (no cloud transfer)

// GDT Format Constants
const GDT_CONSTANTS = {
    FIELD_LENGTH_SIZE: 3,        // LLL - 3 digits for field length
    FIELD_ID_SIZE: 4,            // FKKK - 4 digits for field identifier
    CRLF_SIZE: 2,                // CR+LF line ending size
    FIELD_HEADER_SIZE: 7         // LLL + FKKK
};

// GDT Field Identifiers (Feldkennungen) according to GDT 3.1 specification
const GDT_FIELDS = {
    // Header and Control Fields
    SATZLAENGE: '8000',          // Record length
    SATZART: '8100',             // Record type
    SATZIDENTIFIKATION: '8315',  // Record identification
    
    // Patient Identification (with pseudonymization option)
    PATIENT_NR: '3000',          // Patient number (can be pseudonymized)
    PATIENT_NAME: '3101',        // Patient surname
    PATIENT_VORNAME: '3102',     // Patient first name
    PATIENT_GEBURTSDATUM: '3103',// Patient date of birth
    PATIENT_GESCHLECHT: '3110',  // Patient gender (1=male, 2=female)
    PATIENT_TITEL: '3104',       // Patient title (Dr., Prof., etc.)
    KRANKENKASSE: '3105',        // Health insurance company
    VERSICHERTENNR: '3108',      // Insurance number
    VERSICHERTENSTATUS: '3109',  // Insurance status (1=member, 3=family, 5=pensioner)
    
    // Address Data
    PATIENT_STRASSE: '3107',     // Street
    PATIENT_PLZ: '3112',         // Postal code
    PATIENT_ORT: '3106',         // City
    PATIENT_TELEFON: '3622',     // Phone number
    PATIENT_EMAIL: '3626',       // Email address
    PATIENT_LAND: '3114',        // Country code
    
    // Medical Data
    ANAMNESE: '6200',            // Medical history text
    DIAGNOSE: '6205',            // Diagnosis
    DIAGNOSE_ICD10: '6001',      // ICD-10 diagnosis code
    MEDIKATION: '6210',          // Current medication
    ALLERGIEN: '6220',           // Allergies
    BEFUND: '6300',              // Medical findings
    LABOR_WERT: '8410',          // Laboratory value
    LABOR_KENNUNG: '8411',       // Laboratory identifier
    VORBEFUND: '6220',           // Previous findings
    
    // Timestamps
    ERSTELLUNGSDATUM: '8418',    // Creation date (YYYYMMDD)
    ERSTELLUNGSZEIT: '8419',     // Creation time (HHMMSS)
    
    // System and Practice Information
    PRAXIS_ID: '0201',           // Practice identification
    BSNR: '0203',                // Practice BSNR (Betriebsstättennummer)
    LANR: '0212',                // Physician LANR (Lebenslange Arztnummer)
    ARZT_NAME: '0211',           // Physician name
    SOFTWARE_ID: '0102',         // Software identification
    
    // End of record
    ENDE_KENNZEICHEN: '8205'     // End marker
};

// Validation functions for GDT fields
const GDT_VALIDATORS = {
    // Validate date format (DDMMYYYY)
    validateDate: function(dateStr) {
        if (!dateStr || dateStr.length !== 8) return false;
        const day = parseInt(dateStr.substring(0, 2));
        const month = parseInt(dateStr.substring(2, 4));
        const year = parseInt(dateStr.substring(4, 8));
        
        if (month < 1 || month > 12) return false;
        if (day < 1 || day > 31) return false;
        if (year < 1900 || year > 2100) return false;
        
        // Validate actual date
        const date = new Date(year, month - 1, day);
        return date.getFullYear() === year && 
               date.getMonth() === month - 1 && 
               date.getDate() === day;
    },
    
    // Validate LANR (9 digits with check digit)
    validateLANR: function(lanr) {
        if (!lanr || lanr.length !== 9) return false;
        if (!/^\d{9}$/.test(lanr)) return false;
        
        // Calculate check digit (Modulo 11 method)
        const digits = lanr.split('').map(d => parseInt(d));
        let sum = 0;
        for (let i = 0; i < 8; i++) {
            sum += digits[i] * (i + 2);
        }
        const checkDigit = sum % 11;
        return checkDigit === digits[8];
    },
    
    // Validate BSNR (9 digits)
    validateBSNR: function(bsnr) {
        return bsnr && /^\d{9}$/.test(bsnr);
    },
    
    // Validate postal code (5 digits for Germany)
    validatePLZ: function(plz) {
        return plz && /^\d{5}$/.test(plz);
    },
    
    // Validate insurance number (10 characters)
    validateVersichertenNr: function(nr) {
        return nr && /^[A-Z]\d{9}$/.test(nr);
    },
    
    // Validate ICD-10 code
    validateICD10: function(code) {
        return code && /^[A-Z]\d{2}(\.\d{1,2})?$/.test(code);
    },
    
    // Validate gender code (1=male, 2=female, 3=unknown, 4=diverse)
    validateGender: function(gender) {
        return ['1', '2', '3', '4'].includes(gender);
    },
    
    // Validate insurance status
    validateVersichertenStatus: function(status) {
        return ['1', '3', '5'].includes(status); // 1=member, 3=family, 5=pensioner
    }
};

// GDT Record Types (Satzarten)
const GDT_RECORD_TYPES = {
    STAMMDATEN: '6301',          // Master data (patient information)
    ANAMNESE_DATEN: '6302',      // Anamnesis data
    BEFUND_DATEN: '6310',        // Findings data
    DOKUMENTATION: '6311'        // Documentation
};

// Configuration object for GDT export
const gdtExportConfig = {
    exportDirectory: null,       // Will be set via File System Access API
    pseudonymizeData: true,      // Default: pseudonymize sensitive data
    includeFullName: false,      // Default: don't include full name
    includeAddress: false,       // Default: don't include address
    includeContactData: false,   // Default: don't include contact data
    includeInsuranceData: false, // Default: don't include insurance data
    includeMedicalCodes: false,  // Default: don't include ICD-10 codes
    practiceId: '',              // To be configured by practice
    bsnr: '',                    // Practice BSNR (Betriebsstättennummer)
    lanr: '',                    // Physician LANR (Lebenslange Arztnummer)
    softwareId: 'Anamnese-A-v1.0', // Software identification
    consentGiven: false,         // Patient consent for export
    auditLogging: true,          // Enable audit logging
    validateBeforeExport: true   // Validate data before export
};

// Pseudonymization function - creates consistent pseudonym from patient ID
// Uses Web Crypto API SHA-256 for secure hashing
async function pseudonymizePatientIdAsync(patientData) {
    const input = `${patientData.firstName}-${patientData.lastName}-${patientData.dateOfBirth}`;
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    // Take first 10 digits from hex hash for 10-digit patient ID
    return hashHex.substring(0, 10).toUpperCase();
}

// Synchronous version - WARNING: Uses basic hashing, not cryptographically secure
// This is ONLY for UI synchronous contexts and testing. Production exports should use async version.
// For production, modify exportGDT to be async and use pseudonymizePatientIdAsync
function pseudonymizePatientId(patientData) {
    // WARNING: This is a fallback for synchronous contexts only
    // Prefer pseudonymizePatientIdAsync for production use
    console.warn('Using synchronous pseudonymization. Consider using pseudonymizePatientIdAsync for better security.');
    
    const input = `${patientData.firstName}-${patientData.lastName}-${patientData.dateOfBirth}`;
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
        const char = input.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString().padStart(10, '0');
}

// Format GDT field according to specification
// Format: LLLFKKK<data>
// LLL = length (3 digits), FKKK = field identifier (4 digits), <data> = field content
function formatGDTField(fieldId, content) {
    const contentStr = String(content || '');
    const length = (3 + 4 + contentStr.length).toString().padStart(3, '0');
    return `${length}${fieldId}${contentStr}`;
}

// Format date to GDT format (DDMMYYYY)
function formatGDTDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}${month}${year}`;
}

// Format date to GDT timestamp format (YYYYMMDD)
function formatGDTTimestamp(date = new Date()) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}${month}${day}`;
}

// Format time to GDT format (HHMMSS)
function formatGDTTime(date = new Date()) {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${hours}${minutes}${seconds}`;
}

// Validate form data before GDT export
function validateFormData(formData) {
    const errors = [];
    
    // Validate date of birth
    if (formData.dateOfBirth) {
        const gdtDate = formatGDTDate(formData.dateOfBirth);
        if (!GDT_VALIDATORS.validateDate(gdtDate)) {
            errors.push('Ungültiges Geburtsdatum');
        }
    }
    
    // Validate LANR if provided
    if (gdtExportConfig.lanr && !GDT_VALIDATORS.validateLANR(gdtExportConfig.lanr)) {
        errors.push('Ungültige LANR (Lebenslange Arztnummer)');
    }
    
    // Validate BSNR if provided
    if (gdtExportConfig.bsnr && !GDT_VALIDATORS.validateBSNR(gdtExportConfig.bsnr)) {
        errors.push('Ungültige BSNR (Betriebsstättennummer)');
    }
    
    // Validate postal code if provided
    if (formData.postalCode && !GDT_VALIDATORS.validatePLZ(formData.postalCode)) {
        errors.push('Ungültige Postleitzahl (muss 5 Ziffern sein)');
    }
    
    // Validate insurance number if provided
    if (formData.insuranceNumber && !GDT_VALIDATORS.validateVersichertenNr(formData.insuranceNumber)) {
        errors.push('Ungültige Versichertennummer (Format: Buchstabe + 9 Ziffern)');
    }
    
    // Validate ICD-10 codes if provided
    if (formData.icd10Codes) {
        const codes = formData.icd10Codes.split(',').map(c => c.trim());
        codes.forEach(code => {
            if (code && !GDT_VALIDATORS.validateICD10(code)) {
                errors.push(`Ungültiger ICD-10 Code: ${code}`);
            }
        });
    }
    
    return {
        isValid: errors.length === 0,
        errors: errors
    };
}

// Generate GDT file content from form data
async function generateGDTContent(formData, recordType = GDT_RECORD_TYPES.STAMMDATEN) {
    const lines = [];
    const now = new Date();
    
    // Header: Record type
    lines.push(formatGDTField(GDT_FIELDS.SATZART, recordType));
    
    // Software identification
    lines.push(formatGDTField(GDT_FIELDS.SOFTWARE_ID, gdtExportConfig.softwareId));
    
    // Practice ID (if configured)
    if (gdtExportConfig.practiceId) {
        lines.push(formatGDTField(GDT_FIELDS.PRAXIS_ID, gdtExportConfig.practiceId));
    }
    
    // Patient identification - use secure async pseudonymization
    let patientId;
    if (gdtExportConfig.pseudonymizeData) {
        patientId = await pseudonymizePatientIdAsync(formData);
        lines.push(formatGDTField(GDT_FIELDS.PATIENT_NR, patientId));
    } else {
        // Use actual patient number if available (requires explicit consent)
        patientId = formData.patientNumber || await pseudonymizePatientIdAsync(formData);
        lines.push(formatGDTField(GDT_FIELDS.PATIENT_NR, patientId));
    }
    
    // Name data (only if consent given and configured)
    if (gdtExportConfig.includeFullName && gdtExportConfig.consentGiven) {
        lines.push(formatGDTField(GDT_FIELDS.PATIENT_NAME, formData.lastName || ''));
        lines.push(formatGDTField(GDT_FIELDS.PATIENT_VORNAME, formData.firstName || ''));
    }
    
    // Date of birth
    if (formData.dateOfBirth) {
        lines.push(formatGDTField(GDT_FIELDS.PATIENT_GEBURTSDATUM, formatGDTDate(formData.dateOfBirth)));
    }
    
    // Gender (1=male, 2=female, 3=unknown, 4=diverse)
    if (formData.gender) {
        let genderCode = '3'; // default unknown
        const genderLower = formData.gender.toLowerCase();
        if (genderLower === 'male' || genderLower === 'männlich') genderCode = '1';
        else if (genderLower === 'female' || genderLower === 'weiblich') genderCode = '2';
        else if (genderLower === 'diverse' || genderLower === 'divers') genderCode = '4';
        
        if (GDT_VALIDATORS.validateGender(genderCode)) {
            lines.push(formatGDTField(GDT_FIELDS.PATIENT_GESCHLECHT, genderCode));
        }
    }
    
    // Insurance data (only if consent given and configured)
    if (gdtExportConfig.includeInsuranceData && gdtExportConfig.consentGiven) {
        if (formData.insuranceCompany) {
            lines.push(formatGDTField(GDT_FIELDS.KRANKENKASSE, formData.insuranceCompany));
        }
        if (formData.insuranceNumber) {
            lines.push(formatGDTField(GDT_FIELDS.VERSICHERTENNR, formData.insuranceNumber));
        }
        if (formData.insuranceStatus && GDT_VALIDATORS.validateVersichertenStatus(formData.insuranceStatus)) {
            lines.push(formatGDTField(GDT_FIELDS.VERSICHERTENSTATUS, formData.insuranceStatus));
        }
    }
    
    // Title (if provided)
    if (formData.title) {
        lines.push(formatGDTField(GDT_FIELDS.PATIENT_TITEL, formData.title));
    }
    
    // Address data (only if consent given and configured)
    if (gdtExportConfig.includeAddress && gdtExportConfig.consentGiven) {
        if (formData.street) {
            lines.push(formatGDTField(GDT_FIELDS.PATIENT_STRASSE, formData.street));
        }
        if (formData.postalCode) {
            lines.push(formatGDTField(GDT_FIELDS.PATIENT_PLZ, formData.postalCode));
        }
        if (formData.city) {
            lines.push(formatGDTField(GDT_FIELDS.PATIENT_ORT, formData.city));
        }
        if (formData.country) {
            lines.push(formatGDTField(GDT_FIELDS.PATIENT_LAND, formData.country));
        }
    }
    
    // Contact data (only if consent given and configured)
    if (gdtExportConfig.includeContactData && gdtExportConfig.consentGiven) {
        if (formData.phone) {
            lines.push(formatGDTField(GDT_FIELDS.PATIENT_TELEFON, formData.phone));
        }
        if (formData.email) {
            lines.push(formatGDTField(GDT_FIELDS.PATIENT_EMAIL, formData.email));
        }
    }
    
    // Practice information
    if (gdtExportConfig.bsnr) {
        lines.push(formatGDTField(GDT_FIELDS.BSNR, gdtExportConfig.bsnr));
    }
    if (gdtExportConfig.lanr) {
        lines.push(formatGDTField(GDT_FIELDS.LANR, gdtExportConfig.lanr));
    }
    
    // Medical data
    if (formData.currentComplaints) {
        lines.push(formatGDTField(GDT_FIELDS.ANAMNESE, formData.currentComplaints));
    }
    if (formData.pastIllnesses) {
        lines.push(formatGDTField(GDT_FIELDS.BEFUND, formData.pastIllnesses));
    }
    if (formData.currentMedications) {
        lines.push(formatGDTField(GDT_FIELDS.MEDIKATION, formData.currentMedications));
    }
    if (formData.allergies) {
        lines.push(formatGDTField(GDT_FIELDS.ALLERGIEN, formData.allergies));
    }
    
    // ICD-10 diagnosis codes (if configured and available)
    if (gdtExportConfig.includeMedicalCodes && formData.icd10Codes) {
        const codes = formData.icd10Codes.split(',').map(c => c.trim());
        codes.forEach(code => {
            if (code && GDT_VALIDATORS.validateICD10(code)) {
                lines.push(formatGDTField(GDT_FIELDS.DIAGNOSE_ICD10, code));
            }
        });
    }
    
    // Timestamps
    lines.push(formatGDTField(GDT_FIELDS.ERSTELLUNGSDATUM, formatGDTTimestamp(now)));
    lines.push(formatGDTField(GDT_FIELDS.ERSTELLUNGSZEIT, formatGDTTime(now)));
    
    // Calculate total record length
    // Sum all line lengths + CRLF for each line
    const contentLength = lines.reduce((sum, line) => sum + line.length + GDT_CONSTANTS.CRLF_SIZE, 0);
    
    // Create length field - note that the length includes itself
    // The length field format is: LLL (3) + FKKK (4) + content
    const lengthValue = contentLength + GDT_CONSTANTS.FIELD_HEADER_SIZE + GDT_CONSTANTS.CRLF_SIZE;
    const lengthField = formatGDTField(GDT_FIELDS.SATZLAENGE, lengthValue.toString());
    
    // Insert length at beginning
    lines.unshift(lengthField);
    
    // Join with CRLF (Windows line ending as per GDT spec)
    return lines.join('\r\n') + '\r\n';
}

// Generate filename according to GDT convention
async function generateGDTFilename(patientData) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    let patientId;
    
    if (gdtExportConfig.pseudonymizeData) {
        patientId = await pseudonymizePatientIdAsync(patientData);
    } else {
        patientId = patientData.patientNumber || 'UNKNOWN';
    }
    
    return `GDT_${patientId}_${timestamp}.gdt`;
}

// Export GDT file (local only)
async function exportGDT(formData, consent = null) {
    // Check if consent is provided
    if (consent && consent.synchronization) {
        gdtExportConfig.consentGiven = true;
    }
    
    try {
        // Validate form data before export (if enabled)
        if (gdtExportConfig.validateBeforeExport) {
            const validation = validateFormData(formData);
            if (!validation.isValid) {
                const errorMsg = 'Validierungsfehler:\n' + validation.errors.join('\n');
                console.error('GDT Export Validation Failed:', validation.errors);
                return { 
                    success: false, 
                    message: errorMsg,
                    validationErrors: validation.errors
                };
            }
        }
        
        // Generate GDT content - now using secure async pseudonymization
        const gdtContent = await generateGDTContent(formData);
        const filename = await generateGDTFilename(formData);
        
        // Log export action (GDPR audit requirement)
        if (gdtExportConfig.auditLogging) {
            await logGDTExport(formData, filename, consent);
        }
        
        // Use File System Access API for local directory selection
        // Fallback to simple download if not supported
        if ('showSaveFilePicker' in window) {
            try {
                const handle = await window.showSaveFilePicker({
                    suggestedName: filename,
                    types: [{
                        description: 'GDT Dateien',
                        accept: { 'text/plain': ['.gdt'] }
                    }]
                });
                
                const writable = await handle.createWritable();
                await writable.write(gdtContent);
                await writable.close();
                
                return { success: true, filename, message: 'GDT-Datei erfolgreich exportiert' };
            } catch (err) {
                if (err.name === 'AbortError') {
                    return { success: false, message: 'Export abgebrochen' };
                }
                throw err;
            }
        } else {
            // Fallback: Download as file
            const blob = new Blob([gdtContent], { type: 'text/plain;charset=iso-8859-1' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            return { success: true, filename, message: 'GDT-Datei heruntergeladen' };
        }
    } catch (error) {
        console.error('GDT Export Error:', error);
        logGDTError(error);
        return { success: false, message: `Export fehlgeschlagen: ${error.message}` };
    }
}

// Audit logging function (GDPR Art. 30, 32)
async function logGDTExport(formData, filename, consent) {
    const auditEntry = {
        timestamp: new Date().toISOString(),
        action: 'GDT_EXPORT',
        filename: filename,
        patientId: gdtExportConfig.pseudonymizeData 
            ? await pseudonymizePatientIdAsync(formData) 
            : (formData.patientNumber || 'N/A'),
        pseudonymized: gdtExportConfig.pseudonymizeData,
        consentGiven: gdtExportConfig.consentGiven,
        consentDetails: consent || null,
        exportConfig: {
            includeFullName: gdtExportConfig.includeFullName,
            includeAddress: gdtExportConfig.includeAddress,
            includeContactData: gdtExportConfig.includeContactData
        },
        userAgent: navigator.userAgent,
        language: navigator.language
    };
    
    // Store audit log in localStorage (in production, use secure backend)
    const auditLog = JSON.parse(localStorage.getItem('gdtAuditLog') || '[]');
    auditLog.push(auditEntry);
    
    // Keep only last 1000 entries
    if (auditLog.length > 1000) {
        auditLog.shift();
    }
    
    localStorage.setItem('gdtAuditLog', JSON.stringify(auditLog));
    
    console.log('GDT Export logged:', auditEntry);
}

// Log GDT export errors
function logGDTError(error) {
    const errorEntry = {
        timestamp: new Date().toISOString(),
        action: 'GDT_EXPORT_ERROR',
        error: error.message,
        stack: error.stack
    };
    
    const errorLog = JSON.parse(localStorage.getItem('gdtErrorLog') || '[]');
    errorLog.push(errorEntry);
    
    // Keep only last 100 errors
    if (errorLog.length > 100) {
        errorLog.shift();
    }
    
    localStorage.setItem('gdtErrorLog', JSON.stringify(errorLog));
}

// Get audit log for review
function getAuditLog(limit = 100) {
    const auditLog = JSON.parse(localStorage.getItem('gdtAuditLog') || '[]');
    return auditLog.slice(-limit);
}

// Export audit log as JSON file (for DSB review)
function exportAuditLog() {
    const auditLog = getAuditLog(1000);
    const blob = new Blob([JSON.stringify(auditLog, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gdt_audit_log_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Clear audit log (requires confirmation)
function clearAuditLog() {
    if (confirm('Möchten Sie das Audit-Log wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.')) {
        localStorage.removeItem('gdtAuditLog');
        localStorage.removeItem('gdtErrorLog');
        return true;
    }
    return false;
}

// Update export configuration
function updateGDTConfig(config) {
    Object.assign(gdtExportConfig, config);
    
    // Save configuration to localStorage
    localStorage.setItem('gdtExportConfig', JSON.stringify(gdtExportConfig));
    
    console.log('GDT Export Configuration updated:', gdtExportConfig);
}

// Load saved configuration
function loadGDTConfig() {
    const savedConfig = localStorage.getItem('gdtExportConfig');
    if (savedConfig) {
        try {
            Object.assign(gdtExportConfig, JSON.parse(savedConfig));
            console.log('GDT Export Configuration loaded:', gdtExportConfig);
        } catch (e) {
            console.error('Error loading GDT configuration:', e);
        }
    }
}

// Initialize on page load
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function() {
        loadGDTConfig();
    });
}
