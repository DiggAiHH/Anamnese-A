/**
 * GDT Import Module
 * Provides GDT file import and parsing functionality
 * Supports bidirectional synchronization with PVS systems
 * GDPR-compliant with consent checks
 */

class GDTImporter {
    constructor() {
        this.importHistory = [];
        this.currentImport = null;
    }

    /**
     * Parse GDT file content
     * @param {string} content - GDT file content
     * @returns {Object} Parsed patient data
     */
    parseGDTFile(content) {
        const lines = content.split(/\r?\n/);
        const patient = {
            fields: {},
            rawFields: []
        };

        for (const line of lines) {
            if (line.length < 7) continue; // Minimum GDT line length

            // Parse: LLL + FKKK + content
            const length = line.substring(0, 3);
            const fieldId = line.substring(3, 7);
            const fieldContent = line.substring(7);

            patient.rawFields.push({ fieldId, content: fieldContent });

            // Map to readable fields
            this.mapGDTField(patient, fieldId, fieldContent);
        }

        return patient;
    }

    /**
     * Map GDT field to patient object
     * @param {Object} patient - Patient object
     * @param {string} fieldId - GDT field identifier
     * @param {string} content - Field content
     */
    mapGDTField(patient, fieldId, content) {
        const fieldMap = {
            '3000': 'patientId',
            '3101': 'lastName',
            '3102': 'firstName',
            '3103': 'birthDate',
            '3104': 'title',
            '3105': 'insuranceCompany',
            '3106': 'gender',
            '3107': 'street',
            '3108': 'insuranceNumber',
            '3109': 'insuranceStatus',
            '3112': 'postalCode',
            '3113': 'city',
            '3114': 'country',
            '3115': 'phone',
            '6001': 'icd10Code',
            '0203': 'bsnr',
            '0212': 'lanr',
            '8402': 'senderType',
            '8403': 'receiverType'
        };

        const fieldName = fieldMap[fieldId];
        if (fieldName) {
            patient.fields[fieldName] = content.trim();
        }
    }

    /**
     * Validate imported data
     * @param {Object} patient - Parsed patient data
     * @returns {Object} Validation result
     */
    validateImport(patient) {
        const errors = [];
        const warnings = [];

        // Required fields check
        if (!patient.fields.patientId) {
            errors.push('Patienten-ID fehlt');
        }
        if (!patient.fields.lastName) {
            errors.push('Nachname fehlt');
        }
        if (!patient.fields.birthDate) {
            errors.push('Geburtsdatum fehlt');
        }

        // Validate birth date format
        if (patient.fields.birthDate) {
            if (!this.validateDateFormat(patient.fields.birthDate)) {
                errors.push('Ungültiges Datumsformat');
            }
        }

        // Validate postal code
        if (patient.fields.postalCode) {
            if (!/^\d{5}$/.test(patient.fields.postalCode)) {
                warnings.push('PLZ sollte 5 Ziffern haben');
            }
        }

        // Validate BSNR
        if (patient.fields.bsnr) {
            if (!/^\d{9}$/.test(patient.fields.bsnr)) {
                warnings.push('BSNR sollte 9 Ziffern haben');
            }
        }

        // Validate LANR
        if (patient.fields.lanr) {
            if (typeof validateLANR === 'function') {
                if (!validateLANR(patient.fields.lanr)) {
                    warnings.push('LANR-Prüfziffer ungültig');
                }
            }
        }

        // Validate ICD-10
        if (patient.fields.icd10Code) {
            if (!/^[A-Z]\d{2}(\.\d{1,2})?$/.test(patient.fields.icd10Code)) {
                warnings.push('ICD-10 Code Format möglicherweise ungültig');
            }
        }

        return {
            valid: errors.length === 0,
            errors,
            warnings
        };
    }

    /**
     * Validate date format (TTMMJJJJ)
     * @param {string} dateStr - Date string
     * @returns {boolean}
     */
    validateDateFormat(dateStr) {
        if (!/^\d{8}$/.test(dateStr)) return false;

        const day = parseInt(dateStr.substring(0, 2));
        const month = parseInt(dateStr.substring(2, 4));
        const year = parseInt(dateStr.substring(4, 8));

        if (month < 1 || month > 12) return false;
        if (day < 1 || day > 31) return false;
        if (year < 1900 || year > new Date().getFullYear()) return false;

        return true;
    }

    /**
     * Compare imported data with existing patient
     * @param {Object} importedPatient - Imported patient data
     * @param {Object} existingPatient - Existing patient data
     * @returns {Object} Comparison result
     */
    comparePatients(importedPatient, existingPatient) {
        const differences = {};
        const allFields = new Set([
            ...Object.keys(importedPatient.fields),
            ...Object.keys(existingPatient)
        ]);

        for (const field of allFields) {
            const importedValue = importedPatient.fields[field];
            const existingValue = existingPatient[field];

            if (importedValue !== existingValue) {
                differences[field] = {
                    existing: existingValue || '',
                    imported: importedValue || '',
                    conflict: !!(existingValue && importedValue)
                };
            }
        }

        return differences;
    }

    /**
     * Import GDT file
     * @param {File} file - GDT file
     * @returns {Promise<Object>} Import result
     */
    async importFile(file) {
        try {
            const content = await this.readFile(file);
            const patient = this.parseGDTFile(content);
            const validation = this.validateImport(patient);

            this.currentImport = {
                file: file.name,
                timestamp: new Date().toISOString(),
                patient,
                validation
            };

            return {
                success: validation.valid,
                patient,
                validation,
                filename: file.name
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                filename: file.name
            };
        }
    }

    /**
     * Read file content
     * @param {File} file - File object
     * @returns {Promise<string>}
     */
    readFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(new Error('Datei konnte nicht gelesen werden'));
            // Try ISO-8859-1 encoding (GDT standard)
            reader.readAsText(file, 'ISO-8859-1');
        });
    }

    /**
     * Batch import multiple files
     * @param {FileList} files - List of files
     * @param {Function} progressCallback - Progress callback
     * @returns {Promise<Array>} Import results
     */
    async batchImport(files, progressCallback) {
        const results = [];
        let processed = 0;

        for (const file of files) {
            const result = await this.importFile(file);
            results.push(result);
            
            processed++;
            if (progressCallback) {
                progressCallback({
                    total: files.length,
                    processed,
                    current: file.name
                });
            }
        }

        return results;
    }

    /**
     * Apply import (update or create patient)
     * @param {Object} importData - Import data with selected fields
     * @param {string} mode - 'update', 'create', or 'merge'
     * @returns {Object} Result
     */
    applyImport(importData, mode = 'update') {
        // Check consent
        if (!this.checkImportConsent(importData.patient)) {
            throw new Error('Keine Einwilligung für Import vorhanden');
        }

        const result = {
            mode,
            patientId: importData.patient.fields.patientId,
            fieldsUpdated: 0,
            timestamp: new Date().toISOString()
        };

        // Apply based on mode
        if (mode === 'create') {
            // Create new patient (implementation depends on app structure)
            result.action = 'created';
            result.fieldsUpdated = Object.keys(importData.patient.fields).length;
        } else if (mode === 'update' || mode === 'merge') {
            // Update existing patient
            result.action = 'updated';
            result.fieldsUpdated = Object.keys(importData.selectedFields || importData.patient.fields).length;
        }

        // Log import
        this.logImport(result);
        this.importHistory.push(result);

        return result;
    }

    /**
     * Check import consent
     * @param {Object} patient - Patient data
     * @returns {boolean}
     */
    checkImportConsent(patient) {
        const consentKey = `gdt_consent_${patient.fields.patientId}`;
        const consent = localStorage.getItem(consentKey);
        
        if (!consent) return false;
        
        try {
            const consentData = JSON.parse(consent);
            return consentData.dataExport && consentData.timestamp;
        } catch (e) {
            return false;
        }
    }

    /**
     * Log import to audit
     * @param {Object} importResult - Import result
     */
    logImport(importResult) {
        if (typeof logGDTExport !== 'function') return;

        logGDTExport({
            action: 'gdt_import',
            timestamp: importResult.timestamp,
            patientId: importResult.patientId,
            mode: importResult.mode,
            fieldsUpdated: importResult.fieldsUpdated
        });
    }

    /**
     * Get import history
     * @returns {Array}
     */
    getImportHistory() {
        return this.importHistory;
    }

    /**
     * Get current import
     * @returns {Object|null}
     */
    getCurrentImport() {
        return this.currentImport;
    }

    /**
     * Clear current import
     */
    clearCurrentImport() {
        this.currentImport = null;
    }
}

// Create global instance
const gdtImporter = new GDTImporter();
