// GDT Export UI Integration
// Provides user interface for GDT export with GDPR compliance

// Show GDT export configuration and consent dialog
async function showGDTExportDialog() {
    // Get form data first to check if there's data to export
    const formData = getFormData();
    
    if (!formData.firstName && !formData.lastName) {
        alert('Bitte füllen Sie zunächst das Formular aus, bevor Sie einen Export durchführen.');
        return;
    }
    
    // Create modal
    const modal = document.createElement('div');
    modal.id = 'gdtExportModal';
    modal.className = 'modal';
    modal.style.display = 'block';
    
    const content = document.createElement('div');
    content.className = 'modal-content';
    content.style.maxWidth = '700px';
    content.style.maxHeight = '90vh';
    content.style.overflowY = 'auto';
    
    content.innerHTML = `
        <h2>GDT-Export Konfiguration</h2>
        <p style="color: #666; margin-bottom: 20px;">
            Konfigurieren Sie den DSGVO-konformen Export für Ihr Praxisverwaltungssystem (Medatixx, CGM, Quincy).
        </p>
        
        <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 15px 0;">
            <strong>⚠️ WICHTIG:</strong> Dieser Export muss vor Produktiveinsatz durch einen 
            Datenschutzbeauftragten geprüft werden!
        </div>
        
        <!-- Template Selection -->
        <div style="margin: 20px 0; padding: 15px; background: #e8f5e9; border-left: 4px solid #4CAF50; border-radius: 4px;">
            <h3 style="font-size: 16px; margin-top: 0;">Export-Vorlagen</h3>
            <p style="font-size: 13px; color: #666; margin-bottom: 10px;">
                Wählen Sie eine vorkonfigurierte Vorlage für Ihr PVS oder Ihren Anwendungsfall:
            </p>
            <select id="gdtTemplateSelect" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; margin-bottom: 10px;">
                <option value="">-- Keine Vorlage / Manuelle Konfiguration --</option>
                <optgroup label="PVS-Systeme">
                    <option value="medatixx_standard">Medatixx Standard</option>
                    <option value="cgm_standard">CGM Standard</option>
                    <option value="quincy_standard">Quincy Standard</option>
                </optgroup>
                <optgroup label="Anwendungsfälle">
                    <option value="complete_export">Vollständiger Export</option>
                    <option value="basic_export">Basis Export</option>
                    <option value="privacy_maximum">Datenschutz Maximal</option>
                    <option value="research_anonymous">Forschung/Statistik</option>
                    <option value="emergency_transfer">Notfall-Übermittlung</option>
                </optgroup>
            </select>
            <button id="gdtLoadTemplate" class="btn" style="background: #4CAF50; color: white; font-size: 13px;">
                Vorlage laden
            </button>
            <button id="gdtSaveTemplate" class="btn" style="background: #2196F3; color: white; font-size: 13px;">
                Aktuelle Einstellungen speichern
            </button>
        </div>
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        
        <!-- Basic Configuration -->
        <div style="margin: 20px 0;">
            <h3 style="font-size: 16px; margin-bottom: 10px;">Grundeinstellungen</h3>
            
            <div style="margin: 10px 0;">
                <label style="display: block; margin-bottom: 5px;">
                    <strong>Praxis-ID:</strong> (für GDT-Export)
                </label>
                <input type="text" id="gdtPracticeId" placeholder="z.B. PRAXIS-12345" 
                    style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;"
                    value="${gdtExportConfig.practiceId || ''}">
                <small style="color: #666;">Identifikation Ihrer Praxis im PVS</small>
            </div>
            
            <div style="margin: 15px 0;">
                <label style="display: flex; align-items: center; cursor: pointer;">
                    <input type="checkbox" id="gdtPseudonymize" ${gdtExportConfig.pseudonymizeData ? 'checked' : ''}
                        style="margin-right: 10px;">
                    <span>
                        <strong>Patientennummer pseudonymisieren</strong> (empfohlen)
                        <br><small style="color: #666;">Hash-basierte Pseudonymisierung für maximalen Datenschutz</small>
                    </span>
                </label>
            </div>
        </div>
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        
        <!-- Data Selection -->
        <div style="margin: 20px 0;">
            <h3 style="font-size: 16px; margin-bottom: 10px;">Datenauswahl (erfordert Einwilligung)</h3>
            <p style="font-size: 13px; color: #666; margin-bottom: 15px;">
                Die folgenden Daten werden nur exportiert, wenn Sie explizit eingewilligt haben:
            </p>
            
            <div style="margin: 10px 0;">
                <label style="display: flex; align-items: center; cursor: pointer;">
                    <input type="checkbox" id="gdtIncludeFullName" ${gdtExportConfig.includeFullName ? 'checked' : ''}
                        style="margin-right: 10px;">
                    <span>Vollständiger Name (Vor- und Nachname)</span>
                </label>
            </div>
            
            <div style="margin: 10px 0;">
                <label style="display: flex; align-items: center; cursor: pointer;">
                    <input type="checkbox" id="gdtIncludeAddress" ${gdtExportConfig.includeAddress ? 'checked' : ''}
                        style="margin-right: 10px;">
                    <span>Adressdaten (Straße, PLZ, Ort, Land)</span>
                </label>
            </div>
            
            <div style="margin: 10px 0;">
                <label style="display: flex; align-items: center; cursor: pointer;">
                    <input type="checkbox" id="gdtIncludeContact" ${gdtExportConfig.includeContactData ? 'checked' : ''}
                        style="margin-right: 10px;">
                    <span>Kontaktdaten (Telefon, E-Mail)</span>
                </label>
            </div>
            
            <div style="margin: 10px 0;">
                <label style="display: flex; align-items: center; cursor: pointer;">
                    <input type="checkbox" id="gdtIncludeInsurance" ${gdtExportConfig.includeInsuranceData ? 'checked' : ''}
                        style="margin-right: 10px;">
                    <span>Versicherungsdaten (Krankenkasse, Versichertennummer)</span>
                </label>
            </div>
            
            <div style="margin: 10px 0;">
                <label style="display: flex; align-items: center; cursor: pointer;">
                    <input type="checkbox" id="gdtIncludeMedicalCodes" ${gdtExportConfig.includeMedicalCodes ? 'checked' : ''}
                        style="margin-right: 10px;">
                    <span>Medizinische Codes (ICD-10 Diagnose-Codes)</span>
                </label>
            </div>
        </div>
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        
        <!-- Advanced Settings -->
        <div style="margin: 20px 0;">
            <h3 style="font-size: 16px; margin-bottom: 10px;">Erweiterte Einstellungen</h3>
            
            <div style="margin: 10px 0;">
                <label style="display: block; margin-bottom: 5px;">
                    <strong>BSNR (Betriebsstättennummer):</strong>
                </label>
                <input type="text" id="gdtBsnr" placeholder="z.B. 123456789 (9 Ziffern)" 
                    style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;"
                    value="${gdtExportConfig.bsnr || ''}" maxlength="9">
                <small style="color: #666;">9-stellige Nummer der Betriebsstätte</small>
            </div>
            
            <div style="margin: 10px 0;">
                <label style="display: block; margin-bottom: 5px;">
                    <strong>LANR (Lebenslange Arztnummer):</strong>
                </label>
                <input type="text" id="gdtLanr" placeholder="z.B. 123456789 (9 Ziffern)" 
                    style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;"
                    value="${gdtExportConfig.lanr || ''}" maxlength="9">
                <small style="color: #666;">9-stellige Arztnummer mit Prüfziffer</small>
            </div>
            
            <div style="margin: 15px 0;">
                <label style="display: flex; align-items: center; cursor: pointer;">
                    <input type="checkbox" id="gdtValidateBeforeExport" ${gdtExportConfig.validateBeforeExport ? 'checked' : ''}
                        style="margin-right: 10px;">
                    <span>
                        <strong>Daten vor Export validieren</strong>
                        <br><small style="color: #666;">Prüft Format und Plausibilität der Daten</small>
                    </span>
                </label>
            </div>
        </div>
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        
        <!-- Legal Information -->
        <div style="margin: 20px 0; padding: 15px; background: #f5f5f5; border-radius: 4px;">
            <h3 style="font-size: 14px; margin-top: 0;">Rechtliche Hinweise (DSGVO)</h3>
            <ul style="font-size: 13px; margin: 10px 0; padding-left: 20px;">
                <li>Alle Daten werden ausschließlich lokal gespeichert</li>
                <li>Kein Cloud-Transfer oder externe Übertragung</li>
                <li>Export erfolgt im GDT 3.0/3.1 Format</li>
                <li>Einwilligung ist jederzeit widerrufbar</li>
                <li>Vollständiges Audit-Logging nach Art. 30, 32 DSGVO</li>
            </ul>
        </div>
        
        <!-- Action Buttons -->
        <div style="display: flex; justify-content: space-between; margin-top: 20px; gap: 10px;">
            <button id="gdtExportCancel" class="btn" style="background: #757575; flex: 1;">
                Abbrechen
            </button>
            <button id="gdtShowConsent" class="btn" style="background: #2196F3; flex: 2;">
                Weiter zur Einwilligung
            </button>
        </div>
        
        <div style="margin-top: 15px; text-align: center;">
            <button id="gdtBatchExport" class="btn" style="background: #FF9800; font-size: 12px;">
                📦 Batch-Export
            </button>
            <button id="gdtImportFile" class="btn" style="background: #009688; font-size: 12px;">
                📥 Import
            </button>
            <button id="gdtViewAuditLog" class="btn" style="background: #607D8B; font-size: 12px;">
                📋 Audit-Log
            </button>
            <button id="gdtShowDocs" class="btn" style="background: #607D8B; font-size: 12px;">
                📄 DSGVO-Doku
            </button>
            <button id="gdtShowFeatures" class="btn" style="background: #607D8B; font-size: 12px;">
                🔍 Browser-Check
            </button>
            <button id="gdtShowPerformance" class="btn" style="background: #607D8B; font-size: 12px;">
                ⚡ Performance
            </button>
        </div>
    `;
    
    modal.appendChild(content);
    document.body.appendChild(modal);
    
    // Handle cancel
    document.getElementById('gdtExportCancel').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    // Handle template loading
    document.getElementById('gdtLoadTemplate').addEventListener('click', () => {
        const templateId = document.getElementById('gdtTemplateSelect').value;
        if (!templateId) {
            alert('Bitte wählen Sie eine Vorlage aus.');
            return;
        }
        
        const result = loadGDTTemplate(templateId);
        if (result.success) {
            // Reload dialog to show updated values
            document.body.removeChild(modal);
            showGDTExportDialog();
            alert(result.message);
        } else {
            alert(result.message);
        }
    });
    
    // Handle template saving
    document.getElementById('gdtSaveTemplate').addEventListener('click', () => {
        const name = prompt('Name der Vorlage:');
        if (!name) return;
        
        const description = prompt('Beschreibung (optional):') || '';
        const result = saveCustomTemplate(name, description);
        
        if (result.success) {
            alert(result.message);
        } else {
            alert(result.message);
        }
    });
    
    // Handle continue to consent
    document.getElementById('gdtShowConsent').addEventListener('click', async () => {
        // Update configuration
        const config = {
            practiceId: document.getElementById('gdtPracticeId').value,
            pseudonymizeData: document.getElementById('gdtPseudonymize').checked,
            includeFullName: document.getElementById('gdtIncludeFullName').checked,
            includeAddress: document.getElementById('gdtIncludeAddress').checked,
            includeContactData: document.getElementById('gdtIncludeContact').checked,
            includeInsuranceData: document.getElementById('gdtIncludeInsurance').checked,
            includeMedicalCodes: document.getElementById('gdtIncludeMedicalCodes').checked,
            bsnr: document.getElementById('gdtBsnr').value,
            lanr: document.getElementById('gdtLanr').value,
            validateBeforeExport: document.getElementById('gdtValidateBeforeExport').checked
        };
        
        updateGDTConfig(config);
        
        // Close config dialog
        document.body.removeChild(modal);
        
        // Show consent dialog
        await showGDTConsentAndExport(formData);
    });
    
    // Handle audit log view
    document.getElementById('gdtViewAuditLog').addEventListener('click', () => {
        // Use enhanced audit viewer if available, fallback to basic
        if (typeof showEnhancedAuditLogViewer !== 'undefined') {
            showEnhancedAuditLogViewer();
        } else {
            showAuditLogViewer();
        }
    });
    
    // Handle documentation
    document.getElementById('gdtShowDocs').addEventListener('click', () => {
        showGDPRDocumentation();
    });
    
    // Handle feature detection
    document.getElementById('gdtShowFeatures').addEventListener('click', () => {
        if (typeof showFeatureDetectionDialog !== 'undefined') {
            showFeatureDetectionDialog();
        } else {
            alert('Feature-Detection nicht verfügbar');
        }
    });
    
    // Handle performance dashboard
    document.getElementById('gdtShowPerformance').addEventListener('click', () => {
        if (typeof showPerformanceDashboard !== 'undefined') {
            showPerformanceDashboard();
        } else {
            alert('Performance-Dashboard nicht verfügbar');
        }
    });
    
    // Handle batch export
    document.getElementById('gdtBatchExport').addEventListener('click', () => {
        if (typeof showBatchExportDialog !== 'undefined') {
            showBatchExportDialog();
        } else {
            alert('Batch-Export nicht verfügbar');
        }
    });
    
    // Handle import
    document.getElementById('gdtImportFile').addEventListener('click', () => {
        if (typeof showGDTImportDialog !== 'undefined') {
            showGDTImportDialog();
        } else {
            alert('Import-Funktion nicht verfügbar');
        }
    });
}

// Show consent dialog and perform export
async function showGDTConsentAndExport(formData) {
    try {
        // Generate patient ID for consent using secure async pseudonymization
        const patientId = await pseudonymizePatientIdAsync(formData);
        
        // Determine which consent types are needed
        const consentTypes = [
            CONSENT_TYPES.DATA_EXPORT,
            CONSENT_TYPES.MEDICAL_HISTORY
        ];
        
        if (gdtExportConfig.includeFullName) {
            consentTypes.push(CONSENT_TYPES.FULL_NAME);
        }
        if (gdtExportConfig.includeAddress) {
            consentTypes.push(CONSENT_TYPES.ADDRESS);
        }
        if (gdtExportConfig.includeContactData) {
            consentTypes.push(CONSENT_TYPES.CONTACT_DATA);
        }
        if (gdtExportConfig.includeInsuranceData) {
            consentTypes.push(CONSENT_TYPES.INSURANCE_DATA);
        }
        if (gdtExportConfig.includeMedicalCodes) {
            consentTypes.push(CONSENT_TYPES.MEDICAL_CODES);
        }
        
        // Request consent
        const consent = await requestConsent(patientId, consentTypes);
        
        // Check if all required consents were granted
        const allGranted = consentTypes.every(type => consent.consents[type]);
        
        if (!allGranted) {
            alert('Nicht alle erforderlichen Einwilligungen wurden erteilt. Export wurde abgebrochen.');
            return;
        }
        
        // Perform export
        const result = await exportGDT(formData, consent);
        
        if (result.success) {
            showExportSuccessDialog(result);
        } else {
            alert(`Export fehlgeschlagen: ${result.message}`);
        }
        
    } catch (error) {
        console.error('GDT Export error:', error);
        alert(`Export abgebrochen: ${error.message}`);
    }
}

// Show export success dialog
function showExportSuccessDialog(result) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    
    const content = document.createElement('div');
    content.className = 'modal-content';
    content.style.maxWidth = '500px';
    
    content.innerHTML = `
        <h2 style="color: #4CAF50;">✓ Export erfolgreich</h2>
        <p>Die GDT-Datei wurde erfolgreich exportiert:</p>
        <div style="background: #f5f5f5; padding: 10px; margin: 15px 0; border-radius: 4px; font-family: monospace;">
            ${result.filename}
        </div>
        <p style="font-size: 13px; color: #666;">
            Der Export wurde im Audit-Log protokolliert und kann jederzeit nachvollzogen werden.
        </p>
        <div style="margin-top: 20px; text-align: center;">
            <button class="btn btn-primary" onclick="this.closest('.modal').remove()">
                Schließen
            </button>
        </div>
    `;
    
    modal.appendChild(content);
    document.body.appendChild(modal);
}

// Show audit log viewer
function showAuditLogViewer() {
    const auditLog = getAuditLog(50);
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    
    const content = document.createElement('div');
    content.className = 'modal-content';
    content.style.maxWidth = '800px';
    content.style.maxHeight = '90vh';
    content.style.overflowY = 'auto';
    
    let logEntries = '';
    if (auditLog.length === 0) {
        logEntries = '<p style="text-align: center; color: #666;">Keine Audit-Log Einträge vorhanden</p>';
    } else {
        logEntries = auditLog.reverse().map(entry => `
            <div style="border: 1px solid #ddd; padding: 10px; margin: 10px 0; border-radius: 4px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                    <strong>${entry.action}</strong>
                    <span style="color: #666; font-size: 12px;">${new Date(entry.timestamp).toLocaleString('de-DE')}</span>
                </div>
                ${entry.filename ? `<div style="font-size: 13px;"><strong>Datei:</strong> ${entry.filename}</div>` : ''}
                <div style="font-size: 13px;"><strong>Patient-ID:</strong> ${entry.patientId}</div>
                ${entry.pseudonymized !== undefined ? `<div style="font-size: 13px;"><strong>Pseudonymisiert:</strong> ${entry.pseudonymized ? 'Ja' : 'Nein'}</div>` : ''}
                ${entry.consentGiven !== undefined ? `<div style="font-size: 13px;"><strong>Einwilligung:</strong> ${entry.consentGiven ? 'Erteilt' : 'Nicht erteilt'}</div>` : ''}
            </div>
        `).join('');
    }
    
    content.innerHTML = `
        <h2>Audit-Log (letzte 50 Einträge)</h2>
        <p style="color: #666; font-size: 13px;">
            Alle GDT-Exporte werden gemäß Art. 30, 32 DSGVO protokolliert.
        </p>
        <div style="margin: 20px 0;">
            ${logEntries}
        </div>
        <div style="display: flex; justify-content: space-between; margin-top: 20px; gap: 10px;">
            <button class="btn" style="background: #607D8B;" onclick="exportAuditLog()">
                📥 Log exportieren
            </button>
            <button class="btn btn-primary" onclick="this.closest('.modal').remove()">
                Schließen
            </button>
        </div>
    `;
    
    modal.appendChild(content);
    document.body.appendChild(modal);
}

// Show GDPR documentation dialog
function showGDPRDocumentation() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    
    const content = document.createElement('div');
    content.className = 'modal-content';
    content.style.maxWidth = '700px';
    content.style.maxHeight = '90vh';
    content.style.overflowY = 'auto';
    
    content.innerHTML = `
        <h2>DSGVO-Dokumentation</h2>
        
        <div style="margin: 20px 0;">
            <h3 style="font-size: 16px;">Verfügbare Dokumente</h3>
            <p style="color: #666; font-size: 13px;">
                Diese Dokumente unterstützen Sie bei der DSGVO-Konformität:
            </p>
            
            <div style="border: 1px solid #ddd; padding: 15px; margin: 10px 0; border-radius: 4px;">
                <h4 style="margin-top: 0;">Verarbeitungsverzeichnis (Art. 30 DSGVO)</h4>
                <p style="font-size: 13px; color: #666;">
                    Dokumentation aller Datenverarbeitungen, Zwecke, Kategorien und Schutzmaßnahmen.
                </p>
                <button class="btn" style="background: #2196F3; font-size: 13px;" onclick="exportProcessingRecord()">
                    📄 Verarbeitungsverzeichnis exportieren
                </button>
            </div>
            
            <div style="border: 1px solid #ddd; padding: 15px; margin: 10px 0; border-radius: 4px;">
                <h4 style="margin-top: 0;">DSFA - Datenschutz-Folgenabschätzung (Art. 35 DSGVO)</h4>
                <p style="font-size: 13px; color: #666;">
                    Bewertung der Risiken und Schutzmaßnahmen für den GDT-Export.
                </p>
                <button class="btn" style="background: #2196F3; font-size: 13px;" onclick="exportDPIATemplate()">
                    📄 DSFA-Vorlage exportieren
                </button>
            </div>
            
            <div style="border: 1px solid #ddd; padding: 15px; margin: 10px 0; border-radius: 4px;">
                <h4 style="margin-top: 0;">Audit-Log</h4>
                <p style="font-size: 13px; color: #666;">
                    Protokoll aller GDT-Exporte für Nachweispflichten gemäß Art. 30, 32 DSGVO.
                </p>
                <button class="btn" style="background: #2196F3; font-size: 13px;" onclick="exportAuditLog()">
                    📄 Audit-Log exportieren
                </button>
            </div>
            
            <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
                <strong>⚠️ Wichtig:</strong> Die vollständige Dokumentation finden Sie in 
                <code>GDPR_EXPORT_DOCUMENTATION.md</code>. Bitte konsultieren Sie vor Produktiveinsatz 
                einen Datenschutzbeauftragten!
            </div>
            
            <h3 style="font-size: 16px; margin-top: 30px;">Checkliste vor Go-Live</h3>
            <ul style="font-size: 13px;">
                <li>☐ DSGVO-Konformität durch unabhängigen DSB prüfen</li>
                <li>☐ Verarbeitungsverzeichnis erstellen und aktualisieren</li>
                <li>☐ DSFA durchführen und dokumentieren</li>
                <li>☐ Feldmapping mit DSB abstimmen</li>
                <li>☐ Log-Lösung mit DSB abstimmen</li>
                <li>☐ Personal schulen</li>
                <li>☐ Einwilligungsvorlagen rechtlich prüfen</li>
                <li>☐ Technische und organisatorische Maßnahmen dokumentieren</li>
            </ul>
        </div>
        
        <div style="text-align: center; margin-top: 20px;">
            <button class="btn btn-primary" onclick="this.closest('.modal').remove()">
                Schließen
            </button>
        </div>
    `;
    
    modal.appendChild(content);
    document.body.appendChild(modal);
}

// Add CSS for info button
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function() {
        // Add btn-info style if not exists
        const style = document.createElement('style');
        style.textContent = `
            .btn-info {
                background: #2196F3;
                color: white;
            }
            .btn-info:hover {
                background: #1976D2;
            }
        `;
        document.head.appendChild(style);
    });
}

// Batch Export Dialog
function showBatchExportDialog() {
    // Sample patient data - in real app, this would come from your data store
    const samplePatients = [
        { id: 'P001', firstName: 'Max', lastName: 'Mustermann', birthDate: '15051980' },
        { id: 'P002', firstName: 'Maria', lastName: 'Musterfrau', birthDate: '20031985' },
        { id: 'P003', firstName: 'Hans', lastName: 'Schmidt', birthDate: '10121975' }
    ];
    
    gdtBatchExport.initialize(samplePatients);
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    
    const content = document.createElement('div');
    content.className = 'modal-content';
    content.style.maxWidth = '800px';
    
    const stats = gdtBatchExport.getStatistics();
    
    content.innerHTML = `
        <h2>📦 Batch-Export</h2>
        <p style="color: #666;">Export mehrerer Patienten gleichzeitig (nur mit Einwilligung)</p>
        
        <div style="background: #e3f2fd; padding: 15px; margin: 15px 0; border-radius: 4px;">
            <strong>Statistik:</strong><br>
            Gesamt: ${stats.totalPatients} | 
            Mit Einwilligung: ${stats.patientsWithConsent} | 
            Ausgewählt: <span id="selectedCount">${stats.selectedPatients}</span>
        </div>
        
        <div style="margin: 15px 0;">
            <button id="selectAll" class="btn" style="background: #4CAF50; font-size: 13px;">
                ✓ Alle auswählen
            </button>
            <button id="selectNone" class="btn" style="background: #f44336; font-size: 13px;">
                ✗ Keine auswählen
            </button>
        </div>
        
        <div style="max-height: 300px; overflow-y: auto; border: 1px solid #ddd; border-radius: 4px; margin: 15px 0;">
            <table style="width: 100%; border-collapse: collapse;">
                <thead style="background: #f5f5f5; position: sticky; top: 0;">
                    <tr>
                        <th style="padding: 10px; text-align: left;">Auswahl</th>
                        <th style="padding: 10px; text-align: left;">Name</th>
                        <th style="padding: 10px; text-align: left;">Geburtsdatum</th>
                        <th style="padding: 10px; text-align: left;">Einwilligung</th>
                    </tr>
                </thead>
                <tbody id="patientList">
                </tbody>
            </table>
        </div>
        
        <div style="margin: 15px 0;">
            <label style="display: block; margin-bottom: 10px;">
                <strong>Export-Modus:</strong>
            </label>
            <select id="exportMode" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                <option value="separate">Separate Dateien (eine pro Patient)</option>
                <option value="combined">Kombinierte Datei (alle Patienten)</option>
            </select>
        </div>
        
        <div id="progressContainer" style="display: none; margin: 15px 0;">
            <div style="background: #f5f5f5; height: 30px; border-radius: 4px; overflow: hidden;">
                <div id="progressBar" style="background: #4CAF50; height: 100%; width: 0%; transition: width 0.3s;"></div>
            </div>
            <p id="progressText" style="text-align: center; margin-top: 5px;">0 / 0</p>
        </div>
        
        <div style="margin-top: 20px; text-align: right;">
            <button id="cancelBatch" class="btn" style="background: #ccc;">Abbrechen</button>
            <button id="startBatchExport" class="btn" style="background: #FF9800; color: white;">
                Export starten
            </button>
        </div>
    `;
    
    modal.appendChild(content);
    document.body.appendChild(modal);
    
    // Render patient list
    function renderPatientList() {
        const tbody = document.getElementById('patientList');
        tbody.innerHTML = '';
        
        gdtBatchExport.patients.forEach(patient => {
            const tr = document.createElement('tr');
            tr.style.background = patient.selected ? '#e8f5e9' : 'white';
            tr.innerHTML = `
                <td style="padding: 10px;">
                    <input type="checkbox" 
                        ${patient.selected ? 'checked' : ''}
                        ${!patient.hasConsent ? 'disabled' : ''}
                        data-patient-id="${patient.id}">
                </td>
                <td style="padding: 10px;">${patient.lastName}, ${patient.firstName}</td>
                <td style="padding: 10px;">${patient.birthDate}</td>
                <td style="padding: 10px;">
                    ${patient.hasConsent ? 
                        '<span style="color: green;">✓ Vorhanden</span>' : 
                        '<span style="color: red;">✗ Keine Einwilligung</span>'}
                </td>
            `;
            tbody.appendChild(tr);
        });
        
        // Update selected count
        document.getElementById('selectedCount').textContent = gdtBatchExport.getSelectedPatients().length;
    }
    
    renderPatientList();
    
    // Event listeners
    document.getElementById('selectAll').addEventListener('click', () => {
        gdtBatchExport.selectAll();
        renderPatientList();
    });
    
    document.getElementById('selectNone').addEventListener('click', () => {
        gdtBatchExport.selectNone();
        renderPatientList();
    });
    
    document.getElementById('patientList').addEventListener('change', (e) => {
        if (e.target.type === 'checkbox') {
            gdtBatchExport.toggleSelection(e.target.dataset.patientId);
            renderPatientList();
        }
    });
    
    document.getElementById('cancelBatch').addEventListener('click', () => {
        if (gdtBatchExport.exportProgress.total > 0) {
            gdtBatchExport.cancelExport();
        }
        document.body.removeChild(modal);
    });
    
    document.getElementById('startBatchExport').addEventListener('click', async () => {
        const mode = document.getElementById('exportMode').value;
        const selected = gdtBatchExport.getSelectedPatients();
        
        if (selected.length === 0) {
            alert('Bitte wählen Sie mindestens einen Patienten aus.');
            return;
        }
        
        document.getElementById('progressContainer').style.display = 'block';
        document.getElementById('startBatchExport').disabled = true;
        
        try {
            const results = await gdtBatchExport.executeBatchExport(mode, (progress) => {
                const percent = (progress.completed / progress.total) * 100;
                document.getElementById('progressBar').style.width = percent + '%';
                document.getElementById('progressText').textContent = 
                    `${progress.completed} / ${progress.total} (${progress.failed} fehlgeschlagen)`;
            });
            
            alert(`Batch-Export abgeschlossen!\n\nErfolgreich: ${results.successful.length}\nFehlgeschlagen: ${results.failed.length}`);
            document.body.removeChild(modal);
        } catch (error) {
            alert('Fehler beim Batch-Export: ' + error.message);
            document.getElementById('startBatchExport').disabled = false;
        }
    });
}

// GDT Import Dialog
function showGDTImportDialog() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    
    const content = document.createElement('div');
    content.className = 'modal-content';
    content.style.maxWidth = '800px';
    
    content.innerHTML = `
        <h2>📥 GDT-Import</h2>
        <p style="color: #666;">Importieren Sie GDT-Dateien von Ihrem Praxisverwaltungssystem</p>
        
        <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 15px 0;">
            <strong>Hinweis:</strong> Import erfordert Patienteneinwilligung für Datenverarbeitung.
        </div>
        
        <div style="margin: 20px 0; padding: 20px; border: 2px dashed #ddd; border-radius: 4px; text-align: center;">
            <input type="file" id="gdtFileInput" accept=".gdt" multiple style="display: none;">
            <button id="selectFileBtn" class="btn" style="background: #009688; color: white; font-size: 16px;">
                📁 GDT-Datei auswählen
            </button>
            <p style="color: #666; margin-top: 10px; font-size: 13px;">
                Unterstützt: .gdt Dateien (GDT 3.0/3.1)
            </p>
        </div>
        
        <div id="importPreview" style="display: none; margin: 20px 0;">
            <h3 style="font-size: 16px; margin-bottom: 10px;">Import-Vorschau</h3>
            <div id="previewContent" style="max-height: 300px; overflow-y: auto; border: 1px solid #ddd; padding: 15px; border-radius: 4px; background: #f9f9f9;">
            </div>
            
            <div style="margin: 15px 0;">
                <label style="display: block; margin-bottom: 5px;"><strong>Import-Modus:</strong></label>
                <select id="importMode" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                    <option value="update">Bestehenden Patienten aktualisieren</option>
                    <option value="create">Neuen Patienten anlegen</option>
                    <option value="review">Nur prüfen (keine Änderungen)</option>
                </select>
            </div>
            
            <div style="margin-top: 20px; text-align: right;">
                <button id="cancelImport" class="btn" style="background: #ccc;">Abbrechen</button>
                <button id="executeImport" class="btn" style="background: #009688; color: white;">
                    Import ausführen
                </button>
            </div>
        </div>
        
        <div id="importResults" style="display: none; margin: 20px 0;">
            <h3 style="font-size: 16px; margin-bottom: 10px;">Import-Ergebnisse</h3>
            <div id="resultsContent" style="padding: 15px; border: 1px solid #ddd; border-radius: 4px;">
            </div>
        </div>
        
        <div style="margin-top: 20px; text-align: right;">
            <button id="closeImport" class="btn" style="background: #ccc;">Schließen</button>
        </div>
    `;
    
    modal.appendChild(content);
    document.body.appendChild(modal);
    
    // File selection
    document.getElementById('selectFileBtn').addEventListener('click', () => {
        document.getElementById('gdtFileInput').click();
    });
    
    document.getElementById('gdtFileInput').addEventListener('change', async (e) => {
        const files = e.target.files;
        if (files.length === 0) return;
        
        try {
            const result = await gdtImporter.importFile(files[0]);
            
            if (result.success) {
                showImportPreview(result);
            } else {
                alert('Import-Fehler: ' + result.error);
            }
        } catch (error) {
            alert('Fehler beim Lesen der Datei: ' + error.message);
        }
    });
    
    function showImportPreview(result) {
        document.getElementById('importPreview').style.display = 'block';
        
        const previewContent = document.getElementById('previewContent');
        let html = '<table style="width: 100%; border-collapse: collapse;">';
        
        for (const [field, value] of Object.entries(result.patient.fields)) {
            html += `
                <tr>
                    <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">${field}</td>
                    <td style="padding: 8px; border-bottom: 1px solid #eee;">${value}</td>
                </tr>
            `;
        }
        
        html += '</table>';
        
        if (result.validation.warnings.length > 0) {
            html += '<div style="background: #fff3cd; padding: 10px; margin-top: 10px; border-radius: 4px;">';
            html += '<strong>Warnungen:</strong><ul style="margin: 5px 0;">';
            result.validation.warnings.forEach(w => {
                html += `<li>${w}</li>`;
            });
            html += '</ul></div>';
        }
        
        previewContent.innerHTML = html;
    }
    
    document.getElementById('cancelImport').addEventListener('click', () => {
        document.getElementById('importPreview').style.display = 'none';
        gdtImporter.clearCurrentImport();
    });
    
    document.getElementById('executeImport').addEventListener('click', () => {
        const mode = document.getElementById('importMode').value;
        const currentImport = gdtImporter.getCurrentImport();
        
        if (!currentImport) {
            alert('Keine Import-Daten vorhanden');
            return;
        }
        
        try {
            const result = gdtImporter.applyImport(currentImport, mode);
            
            document.getElementById('importResults').style.display = 'block';
            document.getElementById('resultsContent').innerHTML = `
                <div style="background: #e8f5e9; padding: 15px; border-radius: 4px;">
                    <strong>✓ Import erfolgreich!</strong><br>
                    Aktion: ${result.action}<br>
                    Felder aktualisiert: ${result.fieldsUpdated}<br>
                    Patient-ID: ${result.patientId}
                </div>
            `;
            
            document.getElementById('importPreview').style.display = 'none';
        } catch (error) {
            alert('Import-Fehler: ' + error.message);
        }
    });
    
    document.getElementById('closeImport').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
}

