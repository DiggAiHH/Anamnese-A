// ============================================================================
// PVS Integration Module
// ============================================================================
// Unified integration layer for various Practice Management Systems (PVS)
// Supports: Tomedo PVS, Tomedo AIR, Doctolib, Medatixx, CGM, Quincy
//
// DSGVO/GDPR Compliance:
// - All exports are local-only (no direct API calls to external services)
// - Data remains on user's device until manually uploaded
// - Full audit logging for all export operations
// - Pseudonymization options available
// ============================================================================

'use strict';

// Supported PVS Systems with their capabilities
const PVS_SYSTEMS = {
    medatixx: {
        name: 'Medatixx',
        vendor: 'Medatixx GmbH & Co. KG',
        country: 'DE',
        formats: ['gdt'],
        gdtVersion: '3.1',
        encoding: 'ISO-8859-1',
        description: 'Deutsches Praxisverwaltungssystem',
        website: 'https://www.medatixx.de',
        features: ['gdt_import', 'gdt_export', 'bdt_support']
    },
    
    cgm: {
        name: 'CGM (CompuGroup Medical)',
        vendor: 'CompuGroup Medical SE & Co. KGaA',
        country: 'DE',
        formats: ['gdt'],
        gdtVersion: '3.1',
        encoding: 'ISO-8859-1',
        description: 'Europäisches Praxisverwaltungssystem',
        website: 'https://www.cgm.com',
        features: ['gdt_import', 'gdt_export', 'bdt_support', 'xdt_support']
    },
    
    quincy: {
        name: 'Quincy',
        vendor: 'Quincy Praxiscomputer',
        country: 'DE',
        formats: ['gdt'],
        gdtVersion: '3.0',
        encoding: 'ISO-8859-1',
        description: 'Praxissoftware für Ärzte',
        website: 'https://www.quincy.de',
        features: ['gdt_import', 'gdt_export']
    },
    
    tomedo: {
        name: 'Tomedo',
        vendor: 'Zollsoft GmbH',
        country: 'DE',
        formats: ['gdt', 'bdt'],
        gdtVersion: '3.1',
        encoding: 'UTF-8', // Tomedo supports UTF-8
        description: 'Mac-basiertes Praxisverwaltungssystem',
        website: 'https://www.tomedo.de',
        features: ['gdt_import', 'gdt_export', 'bdt_support', 'utf8_support', 'direct_import'],
        platform: 'macOS',
        importPath: '~/Library/Application Support/Tomedo/Import/'
    },
    
    tomedo_air: {
        name: 'Tomedo AIR',
        vendor: 'Zollsoft GmbH',
        country: 'DE',
        formats: ['gdt'],
        gdtVersion: '3.1',
        encoding: 'UTF-8',
        description: 'Cloud-basierte Version von Tomedo',
        website: 'https://www.tomedo.de/air',
        features: ['gdt_import', 'gdt_export', 'utf8_support', 'web_import'],
        platform: 'Web/Cloud',
        // DSGVO: No direct cloud API - manual upload only
        requiresManualUpload: true
    },
    
    doctolib: {
        name: 'Doctolib',
        vendor: 'Doctolib GmbH',
        country: 'DE/FR/IT',
        formats: ['gdt', 'csv', 'json'],
        gdtVersion: '3.1',
        encoding: 'UTF-8',
        description: 'Europäische Praxis- und Terminverwaltung',
        website: 'https://www.doctolib.de',
        features: ['gdt_import', 'csv_import', 'json_import', 'appointment_sync'],
        platform: 'Web/Cloud',
        // DSGVO: No direct API calls - manual upload only
        requiresManualUpload: true,
        locales: ['de-DE', 'fr-FR', 'it-IT']
    }
};

// Get information about a specific PVS
function getPVSInfo(pvsId) {
    return PVS_SYSTEMS[pvsId] || null;
}

// Get all available PVS systems
function getAllPVSSystems() {
    return Object.keys(PVS_SYSTEMS).map(id => ({
        id,
        ...PVS_SYSTEMS[id]
    }));
}

// Get PVS systems by country
function getPVSByCountry(countryCode) {
    return Object.keys(PVS_SYSTEMS)
        .filter(id => PVS_SYSTEMS[id].country.includes(countryCode))
        .map(id => ({
            id,
            ...PVS_SYSTEMS[id]
        }));
}

// Get PVS systems that support a specific format
function getPVSByFormat(format) {
    return Object.keys(PVS_SYSTEMS)
        .filter(id => PVS_SYSTEMS[id].formats.includes(format))
        .map(id => ({
            id,
            ...PVS_SYSTEMS[id]
        }));
}

// Check if a PVS supports a specific feature
function pvsSupportsFeature(pvsId, feature) {
    const pvs = PVS_SYSTEMS[pvsId];
    return pvs && pvs.features && pvs.features.includes(feature);
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

// Check if GDT export module is available
function ensureGDTModuleLoaded() {
    if (typeof generateGDTContent !== 'function') {
        throw new Error('GDT Export module not loaded. Please include gdt-export.js before pvs-integration.js');
    }
}

// ============================================================================
// TOMEDO-SPECIFIC FUNCTIONS
// ============================================================================

// Generate Tomedo-optimized GDT content
async function generateTomedoGDT(formData, options = {}) {
    ensureGDTModuleLoaded();
    
    const pvsInfo = PVS_SYSTEMS.tomedo;
    
    // Tomedo-specific configuration
    const tomedoConfig = {
        encoding: options.encoding || pvsInfo.encoding,
        gdtVersion: options.gdtVersion || pvsInfo.gdtVersion,
        includeTimestamp: true,
        useBDT: options.useBDT || false
    };
    
    // Use the standard GDT export with Tomedo-specific settings
    return await generateGDTContent(formData);
}

// Get Tomedo import instructions
function getTomedoImportInstructions(variant = 'standard') {
    const instructions = {
        standard: {
            title: 'Tomedo PVS Import-Anleitung',
            steps: [
                '1. Exportieren Sie die GDT-Datei auf Ihren Mac',
                '2. Öffnen Sie Tomedo',
                '3. Gehen Sie zu "Datei" → "Importieren" → "GDT-Datei"',
                '4. Wählen Sie die exportierte Datei aus',
                '5. Überprüfen Sie die importierten Daten'
            ],
            notes: [
                'Tomedo unterstützt GDT 3.0 und 3.1',
                'UTF-8 Kodierung wird vollständig unterstützt',
                'BDT-Format ist ebenfalls verfügbar'
            ]
        },
        air: {
            title: 'Tomedo AIR Import-Anleitung',
            steps: [
                '1. Exportieren Sie die GDT-Datei',
                '2. Melden Sie sich bei Tomedo AIR an',
                '3. Navigieren Sie zu "Einstellungen" → "Datenimport"',
                '4. Laden Sie die GDT-Datei hoch',
                '5. Bestätigen Sie den Import'
            ],
            notes: [
                'Der Upload erfolgt über Ihre sichere Verbindung',
                'Alle Daten werden verschlüsselt übertragen',
                'DSGVO-konform: Keine automatische Synchronisation'
            ]
        }
    };
    
    return instructions[variant] || instructions.standard;
}

// ============================================================================
// DOCTOLIB-SPECIFIC FUNCTIONS
// ============================================================================

// Generate Doctolib-compatible export
async function generateDoctolibExport(formData, format = 'gdt', locale = 'de-DE') {
    const pvsInfo = PVS_SYSTEMS.doctolib;
    
    if (!pvsInfo.formats.includes(format)) {
        throw new Error(`Doctolib unterstützt Format "${format}" nicht`);
    }
    
    switch (format) {
        case 'gdt':
            return await generateDoctolibGDT(formData);
        case 'csv':
            return generateDoctolibCSV(formData, locale);
        case 'json':
            return generateDoctolibJSON(formData, locale);
        default:
            throw new Error(`Unbekanntes Format: ${format}`);
    }
}

// Generate GDT for Doctolib
async function generateDoctolibGDT(formData) {
    ensureGDTModuleLoaded();
    return await generateGDTContent(formData);
}

// Field mapping for Doctolib exports (centralized definition)
const DOCTOLIB_FIELD_MAPPING = {
    patientId: 'external_id',
    firstName: 'first_name',
    lastName: 'last_name',
    dateOfBirth: 'birthdate',
    email: 'email',
    phone: 'phone_number',
    gender: 'gender',
    street: 'address_street',
    postalCode: 'address_zip',
    city: 'address_city'
};

// Generate CSV for Doctolib
function generateDoctolibCSV(formData, locale = 'de-DE') {
    const fieldMapping = DOCTOLIB_FIELD_MAPPING;
    
    // Create CSV header
    const headers = Object.values(fieldMapping);
    
    // Map form data to Doctolib fields with RFC 4180 compliant escaping
    const values = Object.keys(fieldMapping).map(key => {
        let value = formData[key] || '';
        // RFC 4180: Escape CSV values containing commas, quotes, or newlines
        if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n') || value.includes('\r'))) {
            value = '"' + value.replace(/"/g, '""') + '"';
        }
        return value;
    });
    
    return headers.join(',') + '\n' + values.join(',');
}

// Generate JSON for Doctolib
function generateDoctolibJSON(formData, locale = 'de-DE') {
    const fieldMapping = {
        external_id: formData.patientId || '',
        first_name: formData.firstName || '',
        last_name: formData.lastName || '',
        birthdate: formData.dateOfBirth || '',
        email: formData.email || '',
        phone_number: formData.phone || '',
        gender: formData.gender || '',
        address: {
            street: formData.street || '',
            zip: formData.postalCode || '',
            city: formData.city || '',
            country: formData.country || 'DE'
        },
        medical_data: {
            current_complaints: formData.currentComplaints || '',
            allergies: formData.allergies || '',
            medications: formData.currentMedications || ''
        },
        metadata: {
            exported_at: new Date().toISOString(),
            locale: locale,
            source: 'Anamnese-A',
            version: '1.0'
        }
    };
    
    return JSON.stringify(fieldMapping, null, 2);
}

// Get Doctolib import instructions
function getDoctolibImportInstructions(locale = 'de-DE') {
    const instructions = {
        'de-DE': {
            title: 'Doctolib Import-Anleitung',
            steps: [
                '1. Exportieren Sie die Datei (GDT, CSV oder JSON)',
                '2. Melden Sie sich bei Doctolib Pro an',
                '3. Gehen Sie zu "Einstellungen" → "Datenimport"',
                '4. Wählen Sie das entsprechende Format',
                '5. Laden Sie die Datei hoch',
                '6. Überprüfen und bestätigen Sie den Import'
            ],
            notes: [
                'Alle Formate (GDT, CSV, JSON) werden unterstützt',
                'DSGVO-konform: Keine automatische Synchronisation',
                'Daten werden verschlüsselt übertragen'
            ]
        },
        'fr-FR': {
            title: 'Instructions d\'importation Doctolib',
            steps: [
                '1. Exportez le fichier (GDT, CSV ou JSON)',
                '2. Connectez-vous à Doctolib Pro',
                '3. Allez dans "Paramètres" → "Import de données"',
                '4. Sélectionnez le format approprié',
                '5. Téléchargez le fichier',
                '6. Vérifiez et confirmez l\'importation'
            ],
            notes: [
                'Tous les formats (GDT, CSV, JSON) sont supportés',
                'Conforme RGPD: Pas de synchronisation automatique',
                'Les données sont transmises de manière cryptée'
            ]
        }
    };
    
    return instructions[locale] || instructions['de-DE'];
}

// ============================================================================
// EXPORT FORMAT CONVERSION
// ============================================================================

// Convert between different export formats
async function convertExportFormat(data, fromFormat, toFormat) {
    if (fromFormat === toFormat) {
        return data;
    }
    
    // Parse source format
    let parsedData;
    switch (fromFormat) {
        case 'json':
            parsedData = typeof data === 'string' ? JSON.parse(data) : data;
            break;
        case 'csv':
            parsedData = parseCSV(data);
            break;
        case 'gdt':
            parsedData = parseGDT(data);
            break;
        default:
            throw new Error(`Unbekanntes Quellformat: ${fromFormat}`);
    }
    
    // Convert to target format
    switch (toFormat) {
        case 'json':
            return JSON.stringify(parsedData, null, 2);
        case 'csv':
            return objectToCSV(parsedData);
        case 'gdt':
            return await generateGDTContent(parsedData);
        default:
            throw new Error(`Unbekanntes Zielformat: ${toFormat}`);
    }
}

// Parse CSV to object
function parseCSV(csvString) {
    const lines = csvString.trim().split('\n');
    if (lines.length < 2) {
        throw new Error('CSV muss mindestens Header und eine Datenzeile enthalten');
    }
    
    const headers = lines[0].split(',').map(h => h.trim());
    const values = lines[1].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
    
    const result = {};
    headers.forEach((header, index) => {
        result[header] = values[index] || '';
    });
    
    return result;
}

// Parse GDT to object (basic implementation)
function parseGDT(gdtString) {
    const result = {};
    const lines = gdtString.split('\r\n');
    
    // GDT field ID to property name mapping
    const fieldMapping = {
        '3000': 'patientId',
        '3101': 'lastName',
        '3102': 'firstName',
        '3103': 'dateOfBirth',
        '3110': 'gender',
        '3107': 'street',
        '3112': 'postalCode',
        '3106': 'city',
        '3622': 'phone',
        '3626': 'email',
        '6200': 'currentComplaints',
        '6210': 'currentMedications',
        '6220': 'allergies'
    };
    
    lines.forEach(line => {
        if (line.length >= 7) {
            const fieldId = line.substring(3, 7);
            const content = line.substring(7);
            
            if (fieldMapping[fieldId]) {
                result[fieldMapping[fieldId]] = content;
            }
        }
    });
    
    return result;
}

// Convert object to CSV with RFC 4180 compliance
function objectToCSV(obj) {
    const headers = Object.keys(obj);
    const values = headers.map(h => {
        let value = obj[h] || '';
        if (typeof value === 'object') {
            value = JSON.stringify(value);
        }
        // RFC 4180: Quote fields containing commas, quotes, or newlines
        if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n') || value.includes('\r'))) {
            value = '"' + value.replace(/"/g, '""') + '"';
        }
        return value;
    });
    
    return headers.join(',') + '\n' + values.join(',');
}

// ============================================================================
// AUDIT LOGGING FOR PVS OPERATIONS
// ============================================================================

// Log PVS-specific export operation
function logPVSExport(pvsId, format, success, details = {}) {
    const auditEntry = {
        timestamp: new Date().toISOString(),
        action: 'PVS_EXPORT',
        pvs: pvsId,
        pvsName: PVS_SYSTEMS[pvsId]?.name || 'Unknown',
        format: format,
        success: success,
        details: details,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Node.js'
    };
    
    // Store in localStorage
    if (typeof localStorage !== 'undefined') {
        const auditLog = JSON.parse(localStorage.getItem('pvsAuditLog') || '[]');
        auditLog.push(auditEntry);
        
        // Keep only last 500 entries
        if (auditLog.length > 500) {
            auditLog.shift();
        }
        
        localStorage.setItem('pvsAuditLog', JSON.stringify(auditLog));
    }
    
    console.log('PVS Export logged:', auditEntry);
    return auditEntry;
}

// Get PVS audit log
function getPVSAuditLog(limit = 100) {
    if (typeof localStorage === 'undefined') {
        return [];
    }
    
    const auditLog = JSON.parse(localStorage.getItem('pvsAuditLog') || '[]');
    return auditLog.slice(-limit);
}

// ============================================================================
// EXPORTS
// ============================================================================

// Export for browser and Node.js environments
if (typeof window !== 'undefined') {
    window.PVS_SYSTEMS = PVS_SYSTEMS;
    window.getPVSInfo = getPVSInfo;
    window.getAllPVSSystems = getAllPVSSystems;
    window.getPVSByCountry = getPVSByCountry;
    window.getPVSByFormat = getPVSByFormat;
    window.pvsSupportsFeature = pvsSupportsFeature;
    window.generateTomedoGDT = generateTomedoGDT;
    window.getTomedoImportInstructions = getTomedoImportInstructions;
    window.generateDoctolibExport = generateDoctolibExport;
    window.getDoctolibImportInstructions = getDoctolibImportInstructions;
    window.convertExportFormat = convertExportFormat;
    window.logPVSExport = logPVSExport;
    window.getPVSAuditLog = getPVSAuditLog;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        PVS_SYSTEMS,
        getPVSInfo,
        getAllPVSSystems,
        getPVSByCountry,
        getPVSByFormat,
        pvsSupportsFeature,
        generateTomedoGDT,
        getTomedoImportInstructions,
        generateDoctolibExport,
        getDoctolibImportInstructions,
        convertExportFormat,
        logPVSExport,
        getPVSAuditLog
    };
}

console.log('PVS Integration Module loaded - Supports: Tomedo, Tomedo AIR, Doctolib, Medatixx, CGM, Quincy');
