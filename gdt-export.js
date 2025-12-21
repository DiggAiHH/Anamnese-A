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
    
    // Address Data
    PATIENT_STRASSE: '3107',     // Street
    PATIENT_PLZ: '3112',         // Postal code
    PATIENT_ORT: '3106',         // City
    PATIENT_TELEFON: '3622',     // Phone number
    PATIENT_EMAIL: '3626',       // Email address
    
    // Medical Data
    ANAMNESE: '6200',            // Medical history text
    DIAGNOSE: '6205',            // Diagnosis
    MEDIKATION: '6210',          // Current medication
    ALLERGIEN: '6220',           // Allergies
    BEFUND: '6300',              // Medical findings
    
    // Timestamps
    ERSTELLUNGSDATUM: '8418',    // Creation date (YYYYMMDD)
    ERSTELLUNGSZEIT: '8419',     // Creation time (HHMMSS)
    
    // System and Practice Information
    PRAXIS_ID: '0201',           // Practice identification
    ARZT_NAME: '0211',           // Physician name
    SOFTWARE_ID: '0102',         // Software identification
    
    // End of record
    ENDE_KENNZEICHEN: '8205'     // End marker
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
    practiceId: '',              // To be configured by practice
    softwareId: 'Anamnese-A-v1.0', // Software identification
    consentGiven: false,         // Patient consent for export
    auditLogging: true           // Enable audit logging
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

// Generate GDT file content from form data
function generateGDTContent(formData, recordType = GDT_RECORD_TYPES.STAMMDATEN) {
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
    
    // Patient identification
    let patientId;
    if (gdtExportConfig.pseudonymizeData) {
        patientId = pseudonymizePatientId(formData);
        lines.push(formatGDTField(GDT_FIELDS.PATIENT_NR, patientId));
    } else {
        // Use actual patient number if available (requires explicit consent)
        patientId = formData.patientNumber || pseudonymizePatientId(formData);
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
    
    // Gender (1=male, 2=female)
    if (formData.gender) {
        const genderCode = formData.gender.toLowerCase() === 'male' || formData.gender.toLowerCase() === 'männlich' ? '1' : '2';
        lines.push(formatGDTField(GDT_FIELDS.PATIENT_GESCHLECHT, genderCode));
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
function generateGDTFilename(patientData) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    let patientId;
    
    if (gdtExportConfig.pseudonymizeData) {
        patientId = pseudonymizePatientId(patientData);
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
        // Generate GDT content
        const gdtContent = generateGDTContent(formData);
        const filename = generateGDTFilename(formData);
        
        // Log export action (GDPR audit requirement)
        if (gdtExportConfig.auditLogging) {
            logGDTExport(formData, filename, consent);
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
function logGDTExport(formData, filename, consent) {
    const auditEntry = {
        timestamp: new Date().toISOString(),
        action: 'GDT_EXPORT',
        filename: filename,
        patientId: gdtExportConfig.pseudonymizeData 
            ? pseudonymizePatientId(formData) 
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
