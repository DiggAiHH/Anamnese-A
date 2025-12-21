/**
 * GDT Batch Export Module
 * Provides batch export functionality for multiple patients
 * GDPR-compliant with individual consent checks
 */

class GDTBatchExport {
    constructor() {
        this.patients = [];
        this.exportProgress = {
            total: 0,
            completed: 0,
            failed: 0,
            cancelled: false
        };
    }

    /**
     * Initialize batch export with patient list
     * @param {Array} patients - List of patient objects
     */
    initialize(patients) {
        this.patients = patients.map(p => ({
            ...p,
            selected: false,
            hasConsent: this.checkPatientConsent(p),
            exportStatus: 'pending'
        }));
    }

    /**
     * Check if patient has required consent
     * @param {Object} patient - Patient data
     * @returns {boolean}
     */
    checkPatientConsent(patient) {
        const consentKey = `gdt_consent_${patient.id || patient.patientId}`;
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
     * Get patients with consent
     * @returns {Array}
     */
    getPatientsWithConsent() {
        return this.patients.filter(p => p.hasConsent);
    }

    /**
     * Get selected patients
     * @returns {Array}
     */
    getSelectedPatients() {
        return this.patients.filter(p => p.selected);
    }

    /**
     * Select all patients with consent
     */
    selectAll() {
        this.patients.forEach(p => {
            if (p.hasConsent) {
                p.selected = true;
            }
        });
    }

    /**
     * Deselect all patients
     */
    selectNone() {
        this.patients.forEach(p => p.selected = false);
    }

    /**
     * Toggle patient selection
     * @param {string} patientId - Patient identifier
     */
    toggleSelection(patientId) {
        const patient = this.patients.find(p => 
            (p.id || p.patientId) === patientId
        );
        if (patient && patient.hasConsent) {
            patient.selected = !patient.selected;
        }
    }

    /**
     * Execute batch export
     * @param {string} mode - 'separate' or 'combined'
     * @param {Function} progressCallback - Called with progress updates
     * @returns {Promise<Object>} Export results
     */
    async executeBatchExport(mode = 'separate', progressCallback) {
        const selectedPatients = this.getSelectedPatients();
        
        if (selectedPatients.length === 0) {
            throw new Error('Keine Patienten ausgewählt');
        }

        this.exportProgress = {
            total: selectedPatients.length,
            completed: 0,
            failed: 0,
            cancelled: false,
            startTime: new Date()
        };

        const results = {
            successful: [],
            failed: [],
            mode: mode
        };

        if (mode === 'separate') {
            // Export each patient to separate file
            for (const patient of selectedPatients) {
                if (this.exportProgress.cancelled) break;

                try {
                    await this.exportSinglePatient(patient);
                    patient.exportStatus = 'success';
                    results.successful.push(patient);
                    this.exportProgress.completed++;
                } catch (error) {
                    patient.exportStatus = 'failed';
                    patient.exportError = error.message;
                    results.failed.push({ patient, error: error.message });
                    this.exportProgress.failed++;
                }

                if (progressCallback) {
                    progressCallback(this.exportProgress);
                }
            }
        } else if (mode === 'combined') {
            // Export all patients to single file
            try {
                await this.exportCombinedFile(selectedPatients, progressCallback);
                selectedPatients.forEach(p => {
                    p.exportStatus = 'success';
                    results.successful.push(p);
                });
                this.exportProgress.completed = selectedPatients.length;
            } catch (error) {
                selectedPatients.forEach(p => {
                    p.exportStatus = 'failed';
                    p.exportError = error.message;
                    results.failed.push({ patient: p, error: error.message });
                });
                this.exportProgress.failed = selectedPatients.length;
            }

            if (progressCallback) {
                progressCallback(this.exportProgress);
            }
        }

        this.exportProgress.endTime = new Date();
        
        // Log batch export to audit
        this.logBatchExport(results);

        return results;
    }

    /**
     * Export single patient
     * @param {Object} patient - Patient data
     */
    async exportSinglePatient(patient) {
        // Use existing GDT export functionality
        if (typeof generateGDTContent !== 'function') {
            throw new Error('GDT Export Modul nicht verfügbar');
        }

        const gdtContent = await generateGDTContent(patient);
        const filename = await generateGDTFilename(patient);

        // Use File System Access API
        if ('showSaveFilePicker' in window) {
            const handle = await window.showSaveFilePicker({
                suggestedName: filename,
                types: [{
                    description: 'GDT-Datei',
                    accept: { 'text/plain': ['.gdt'] }
                }]
            });

            const writable = await handle.createWritable();
            await writable.write(gdtContent);
            await writable.close();
        } else {
            // Fallback: download
            const blob = new Blob([gdtContent], { type: 'text/plain;charset=iso-8859-1' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.click();
            URL.revokeObjectURL(url);
        }
    }

    /**
     * Export combined file for all patients
     * @param {Array} patients - Patient list
     * @param {Function} progressCallback - Progress callback
     */
    async exportCombinedFile(patients, progressCallback) {
        let combinedContent = '';
        let processed = 0;

        for (const patient of patients) {
            if (this.exportProgress.cancelled) break;

            const gdtContent = await generateGDTContent(patient);
            combinedContent += gdtContent + '\r\n';
            
            processed++;
            this.exportProgress.completed = processed;
            
            if (progressCallback) {
                progressCallback(this.exportProgress);
            }
        }

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        const filename = `GDT_Batch_${timestamp}.gdt`;

        // Use File System Access API
        if ('showSaveFilePicker' in window) {
            const handle = await window.showSaveFilePicker({
                suggestedName: filename,
                types: [{
                    description: 'GDT-Datei',
                    accept: { 'text/plain': ['.gdt'] }
                }]
            });

            const writable = await handle.createWritable();
            await writable.write(combinedContent);
            await writable.close();
        } else {
            // Fallback
            const blob = new Blob([combinedContent], { type: 'text/plain;charset=iso-8859-1' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.click();
            URL.revokeObjectURL(url);
        }
    }

    /**
     * Cancel ongoing batch export
     */
    cancelExport() {
        this.exportProgress.cancelled = true;
    }

    /**
     * Log batch export to audit
     * @param {Object} results - Export results
     */
    logBatchExport(results) {
        if (typeof logGDTExport !== 'function') return;

        const duration = this.exportProgress.endTime - this.exportProgress.startTime;
        
        logGDTExport({
            action: 'batch_export',
            timestamp: new Date().toISOString(),
            patientsTotal: this.exportProgress.total,
            patientsSuccess: results.successful.length,
            patientsFailed: results.failed.length,
            mode: results.mode,
            duration: duration,
            cancelled: this.exportProgress.cancelled
        });
    }

    /**
     * Get batch export statistics
     * @returns {Object}
     */
    getStatistics() {
        return {
            totalPatients: this.patients.length,
            patientsWithConsent: this.getPatientsWithConsent().length,
            selectedPatients: this.getSelectedPatients().length,
            progress: this.exportProgress
        };
    }
}

// Create global instance
const gdtBatchExport = new GDTBatchExport();
