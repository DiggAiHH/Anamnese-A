// GDPR Compliance Module (DSGVO-Konformität)
// Implements consent management, audit logging, and data protection measures
// According to GDPR Art. 30, 32, 35 (DSGVO Art. 30, 32, 35)

// Consent categories according to GDPR
const CONSENT_TYPES = {
    DATA_EXPORT: 'data_export',
    PATIENT_SYNC: 'patient_sync',
    FULL_NAME: 'full_name',
    ADDRESS: 'address',
    CONTACT_DATA: 'contact_data',
    MEDICAL_HISTORY: 'medical_history',
    INSURANCE_DATA: 'insurance_data',
    MEDICAL_CODES: 'medical_codes'
};

// Consent storage
const consentRecords = {
    records: []
};

// Legal basis according to GDPR Art. 6
const LEGAL_BASIS = {
    CONSENT: 'Art. 6(1)(a) GDPR - Consent',
    CONTRACT: 'Art. 6(1)(b) GDPR - Contract',
    LEGAL_OBLIGATION: 'Art. 6(1)(c) GDPR - Legal obligation',
    VITAL_INTERESTS: 'Art. 6(1)(d) GDPR - Vital interests',
    PUBLIC_INTEREST: 'Art. 6(1)(e) GDPR - Public interest',
    LEGITIMATE_INTERESTS: 'Art. 6(1)(f) GDPR - Legitimate interests'
};

// Data categories for processing record (Verarbeitungsverzeichnis)
const DATA_CATEGORIES = {
    PERSONAL: 'Personenbezogene Daten (Name, Adresse, Kontaktdaten)',
    HEALTH: 'Gesundheitsdaten (Anamnese, Diagnosen, Medikation)',
    SPECIAL: 'Besondere Kategorien (Art. 9 DSGVO - Gesundheitsdaten)'
};

// Processing purposes
const PROCESSING_PURPOSES = {
    MEDICAL_CARE: 'Medizinische Versorgung und Behandlung',
    DOCUMENTATION: 'Medizinische Dokumentation',
    SYSTEM_INTEGRATION: 'Integration mit Praxisverwaltungssystem',
    QUALITY_ASSURANCE: 'Qualitätssicherung'
};

// Data recipients
const DATA_RECIPIENTS = {
    PRACTICE: 'Arztpraxis (intern)',
    PVS: 'Praxisverwaltungssystem (Medatixx, CGM, Quincy)',
    NONE: 'Keine externen Empfänger'
};

// Consent object structure
function createConsentRecord(patientId, consentType, granted = false, details = {}) {
    return {
        id: generateConsentId(),
        patientId: patientId,
        consentType: consentType,
        granted: granted,
        timestamp: new Date().toISOString(),
        details: details,
        legalBasis: LEGAL_BASIS.CONSENT,
        withdrawable: true,
        version: '1.0',
        language: document.getElementById('language')?.value || 'de'
    };
}

// Generate unique consent ID
function generateConsentId() {
    return `CONSENT-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

// Request consent from patient
function requestConsent(patientId, consentTypes = []) {
    return new Promise((resolve, reject) => {
        // Show consent dialog
        showConsentDialog(patientId, consentTypes, (consentData) => {
            if (consentData.granted) {
                // Store consent records
                consentTypes.forEach(type => {
                    const record = createConsentRecord(
                        patientId,
                        type,
                        consentData.consents[type] || false,
                        consentData.details
                    );
                    storeConsentRecord(record);
                });
                
                resolve(consentData);
            } else {
                reject(new Error('Einwilligung nicht erteilt'));
            }
        });
    });
}

// Show consent dialog UI
function showConsentDialog(patientId, consentTypes, callback) {
    const modal = document.createElement('div');
    modal.id = 'gdprConsentModal';
    modal.className = 'modal';
    modal.style.display = 'block';
    
    const content = document.createElement('div');
    content.className = 'modal-content';
    content.style.maxWidth = '600px';
    content.style.padding = '20px';
    
    const translations = getCurrentTranslations();
    
    content.innerHTML = `
        <h2>${translations.consentTitle || 'Einwilligung zur Datenverarbeitung'}</h2>
        <p style="color: #666; margin-bottom: 20px;">
            ${translations.consentIntro || 'Gemäß Art. 6 und Art. 9 DSGVO benötigen wir Ihre ausdrückliche Einwilligung für die folgenden Datenverarbeitungen:'}
        </p>
        
        <div id="consentCheckboxes" style="margin: 20px 0;">
            ${generateConsentCheckboxes(consentTypes, translations)}
        </div>
        
        <div style="margin: 20px 0; padding: 15px; background: #f5f5f5; border-left: 4px solid #2196F3;">
            <h3 style="margin-top: 0; font-size: 14px;">Ihre Rechte:</h3>
            <ul style="font-size: 13px; margin: 10px 0; padding-left: 20px;">
                <li>Widerrufsrecht (Art. 7 DSGVO)</li>
                <li>Auskunftsrecht (Art. 15 DSGVO)</li>
                <li>Berichtigungsrecht (Art. 16 DSGVO)</li>
                <li>Löschungsrecht (Art. 17 DSGVO)</li>
                <li>Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
                <li>Datenübertragbarkeit (Art. 20 DSGVO)</li>
                <li>Widerspruchsrecht (Art. 21 DSGVO)</li>
                <li>Beschwerderecht bei Aufsichtsbehörde (Art. 77 DSGVO)</li>
            </ul>
        </div>
        
        <div style="margin: 15px 0;">
            <label style="display: flex; align-items: start; font-size: 13px;">
                <input type="checkbox" id="confirmUnderstanding" style="margin-right: 10px; margin-top: 3px;">
                <span>Ich bestätige, dass ich die Informationen zur Datenverarbeitung gelesen und verstanden habe.</span>
            </label>
        </div>
        
        <div style="display: flex; justify-content: space-between; margin-top: 20px;">
            <button id="consentCancel" class="btn" style="background: #757575;">Abbrechen</button>
            <button id="consentAccept" class="btn" style="background: #4CAF50;" disabled>Einwilligung erteilen</button>
        </div>
    `;
    
    modal.appendChild(content);
    document.body.appendChild(modal);
    
    // Enable accept button only when understanding is confirmed
    const confirmCheckbox = document.getElementById('confirmUnderstanding');
    const acceptButton = document.getElementById('consentAccept');
    
    confirmCheckbox.addEventListener('change', () => {
        acceptButton.disabled = !confirmCheckbox.checked;
    });
    
    // Handle cancel
    document.getElementById('consentCancel').addEventListener('click', () => {
        document.body.removeChild(modal);
        callback({ granted: false });
    });
    
    // Handle accept
    document.getElementById('consentAccept').addEventListener('click', () => {
        const consents = {};
        consentTypes.forEach(type => {
            const checkbox = document.getElementById(`consent_${type}`);
            consents[type] = checkbox ? checkbox.checked : false;
        });
        
        document.body.removeChild(modal);
        callback({
            granted: true,
            consents: consents,
            details: {
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent,
                language: document.getElementById('language')?.value || 'de'
            }
        });
    });
}

// Generate consent checkbox HTML
function generateConsentCheckboxes(consentTypes, translations) {
    const checkboxes = [];
    
    consentTypes.forEach(type => {
        const label = getConsentLabel(type, translations);
        const description = getConsentDescription(type, translations);
        
        checkboxes.push(`
            <div style="margin: 15px 0; padding: 10px; border: 1px solid #ddd; border-radius: 4px;">
                <label style="display: flex; align-items: start; cursor: pointer;">
                    <input type="checkbox" id="consent_${type}" style="margin-right: 10px; margin-top: 3px;">
                    <div>
                        <strong>${label}</strong>
                        <p style="margin: 5px 0 0 0; font-size: 13px; color: #666;">${description}</p>
                    </div>
                </label>
            </div>
        `);
    });
    
    return checkboxes.join('');
}

// Get consent label for type
function getConsentLabel(type, translations) {
    const labels = {
        [CONSENT_TYPES.DATA_EXPORT]: 'Export in Praxisverwaltungssystem',
        [CONSENT_TYPES.PATIENT_SYNC]: 'Patientendaten-Synchronisierung',
        [CONSENT_TYPES.FULL_NAME]: 'Verwendung von Name und Vorname',
        [CONSENT_TYPES.ADDRESS]: 'Verwendung von Adressdaten',
        [CONSENT_TYPES.CONTACT_DATA]: 'Verwendung von Kontaktdaten',
        [CONSENT_TYPES.MEDICAL_HISTORY]: 'Export medizinischer Anamnese-Daten',
        [CONSENT_TYPES.INSURANCE_DATA]: 'Verwendung von Versicherungsdaten',
        [CONSENT_TYPES.MEDICAL_CODES]: 'Export von ICD-10 Diagnose-Codes'
    };
    return labels[type] || type;
}

// Get consent description
function getConsentDescription(type, translations) {
    const descriptions = {
        [CONSENT_TYPES.DATA_EXPORT]: 'Export Ihrer Daten im GDT-Format zur Übernahme in das Praxisverwaltungssystem (Medatixx, CGM, Quincy). Alle Daten verbleiben lokal.',
        [CONSENT_TYPES.PATIENT_SYNC]: 'Verknüpfung Ihrer Anamnese-Daten mit Ihrer Patientenakte im Praxisverwaltungssystem.',
        [CONSENT_TYPES.FULL_NAME]: 'Ihr vollständiger Name wird in der exportierten Datei gespeichert. Alternativ: Pseudonymisierung.',
        [CONSENT_TYPES.ADDRESS]: 'Ihre Adressdaten (Straße, PLZ, Ort, Land) werden exportiert.',
        [CONSENT_TYPES.CONTACT_DATA]: 'Ihre Kontaktdaten (Telefon, E-Mail) werden exportiert.',
        [CONSENT_TYPES.MEDICAL_HISTORY]: 'Ihre medizinischen Daten (Anamnese, Medikation, Allergien) werden exportiert.',
        [CONSENT_TYPES.INSURANCE_DATA]: 'Ihre Versicherungsdaten (Krankenkasse, Versichertennummer, Status) werden exportiert.',
        [CONSENT_TYPES.MEDICAL_CODES]: 'ICD-10 Diagnose-Codes werden im Export enthalten.'
    };
    return descriptions[type] || '';
}

// Store consent record
function storeConsentRecord(record) {
    const records = JSON.parse(localStorage.getItem('gdprConsentRecords') || '[]');
    records.push(record);
    localStorage.setItem('gdprConsentRecords', JSON.stringify(records));
    
    // Log consent action
    logConsentAction(record);
}

// Get consent records for patient
function getConsentRecords(patientId) {
    const records = JSON.parse(localStorage.getItem('gdprConsentRecords') || '[]');
    return records.filter(r => r.patientId === patientId);
}

// Check if consent is given for specific type
function hasConsent(patientId, consentType) {
    const records = getConsentRecords(patientId);
    const latestConsent = records
        .filter(r => r.consentType === consentType)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
    
    return latestConsent && latestConsent.granted;
}

// Withdraw consent
function withdrawConsent(patientId, consentType) {
    const record = createConsentRecord(patientId, consentType, false, {
        action: 'WITHDRAWAL',
        timestamp: new Date().toISOString()
    });
    
    storeConsentRecord(record);
    logConsentAction(record);
    
    return record;
}

// Log consent action
function logConsentAction(record) {
    const auditEntry = {
        timestamp: new Date().toISOString(),
        action: record.granted ? 'CONSENT_GRANTED' : 'CONSENT_WITHDRAWN',
        consentId: record.id,
        patientId: record.patientId,
        consentType: record.consentType,
        legalBasis: record.legalBasis
    };
    
    const auditLog = JSON.parse(localStorage.getItem('gdprAuditLog') || '[]');
    auditLog.push(auditEntry);
    localStorage.setItem('gdprAuditLog', JSON.stringify(auditLog));
}

// Generate processing record (Verarbeitungsverzeichnis Art. 30 DSGVO)
function generateProcessingRecord() {
    return {
        controller: {
            name: 'Arztpraxis [Name einzutragen]',
            address: '[Adresse einzutragen]',
            contact: '[Kontakt einzutragen]',
            dpo: '[Datenschutzbeauftragter einzutragen]'
        },
        purposes: [
            {
                purpose: PROCESSING_PURPOSES.MEDICAL_CARE,
                legalBasis: LEGAL_BASIS.CONSENT,
                dataCategories: [DATA_CATEGORIES.PERSONAL, DATA_CATEGORIES.HEALTH],
                dataSubjects: 'Patienten',
                recipients: [DATA_RECIPIENTS.PRACTICE, DATA_RECIPIENTS.PVS],
                storage: 'Lokale Speicherung gemäß berufsrechtlicher Aufbewahrungspflichten',
                securityMeasures: [
                    'AES-256 Verschlüsselung',
                    'Lokale Datenspeicherung (keine Cloud)',
                    'Pseudonymisierung bei Export',
                    'Zugriffskontrolle',
                    'Audit-Logging',
                    'Einwilligungsmanagement'
                ],
                dataTransfer: 'Keine Übermittlung in Drittländer'
            }
        ],
        created: new Date().toISOString(),
        version: '1.0'
    };
}

// Export processing record as JSON
function exportProcessingRecord() {
    const record = generateProcessingRecord();
    const blob = new Blob([JSON.stringify(record, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `verarbeitungsverzeichnis_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Generate DPIA template (Datenschutz-Folgenabschätzung Art. 35 DSGVO)
function generateDPIATemplate() {
    return {
        title: 'Datenschutz-Folgenabschätzung (DSFA) - GDT-Export-Schnittstelle',
        date: new Date().toISOString().split('T')[0],
        description: 'Bewertung der Risiken bei der Implementierung der GDT-Export-Schnittstelle für medizinische Anamnese-Daten',
        
        dataProcessing: {
            description: 'Export von medizinischen Anamnese-Daten im GDT-Format zur Übernahme in Praxisverwaltungssysteme',
            dataTypes: ['Personenbezogene Daten', 'Gesundheitsdaten (Art. 9 DSGVO)'],
            scope: 'Alle Patienten der Praxis',
            necessity: 'Medizinische Dokumentation und Behandlung',
            proportionality: 'Erforderlich für Behandlungsprozess'
        },
        
        risks: [
            {
                risk: 'Unbefugter Zugriff auf Gesundheitsdaten',
                likelihood: 'NIEDRIG',
                impact: 'HOCH',
                mitigation: [
                    'AES-256 Verschlüsselung',
                    'Lokale Speicherung (kein Cloud-Transfer)',
                    'Zugriffskontrolle',
                    'Pseudonymisierung'
                ]
            },
            {
                risk: 'Fehlerhafte Patientenzuordnung',
                likelihood: 'MITTEL',
                impact: 'HOCH',
                mitigation: [
                    'Eindeutige Patientenidentifikatoren',
                    'Validierung vor Export',
                    'Audit-Logging aller Exporte'
                ]
            },
            {
                risk: 'Export ohne gültige Einwilligung',
                likelihood: 'NIEDRIG',
                impact: 'HOCH',
                mitigation: [
                    'Einwilligungsmanagement-System',
                    'Dokumentation aller Einwilligungen',
                    'Prüfung vor jedem Export'
                ]
            }
        ],
        
        technicalMeasures: [
            'AES-256-GCM Verschlüsselung',
            'PBKDF2 Key Derivation (100.000 Iterationen)',
            'Lokale Datenspeicherung',
            'Pseudonymisierung sensitiver Daten',
            'Audit-Logging (Art. 30, 32 DSGVO)',
            'Einwilligungsmanagement',
            'GDT 3.0/3.1 Standard-Konformität'
        ],
        
        organizationalMeasures: [
            'Schulung des Praxispersonals',
            'Zugriffsberechtigung nur für autorisiertes Personal',
            'Regelmäßige Überprüfung der Export-Konfiguration',
            'Dokumentation aller Datenverarbeitungen',
            'Datenschutzbeauftragten konsultieren',
            'Einwilligung vor jedem Export einholen'
        ],
        
        conclusion: {
            acceptable: true,
            residualRisk: 'NIEDRIG',
            approval: 'Freigabe durch Datenschutzbeauftragten erforderlich',
            nextReview: 'Jährlich oder bei wesentlichen Änderungen'
        }
    };
}

// Export DPIA template
function exportDPIATemplate() {
    const dpia = generateDPIATemplate();
    const blob = new Blob([JSON.stringify(dpia, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dsfa_gdt_export_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Get current translations (fallback function)
function getCurrentTranslations() {
    // Try to get from global translations object
    if (typeof translations !== 'undefined' && typeof currentLanguage !== 'undefined') {
        return translations[currentLanguage] || {};
    }
    return {};
}

// Export consent documentation
function exportConsentDocumentation(patientId) {
    const records = getConsentRecords(patientId);
    const blob = new Blob([JSON.stringify(records, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `einwilligungen_${patientId}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Initialize GDPR compliance module
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function() {
        console.log('GDPR Compliance Module initialized');
    });
}
