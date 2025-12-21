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
                    <span>Adressdaten (Straße, PLZ, Ort)</span>
                </label>
            </div>
            
            <div style="margin: 10px 0;">
                <label style="display: flex; align-items: center; cursor: pointer;">
                    <input type="checkbox" id="gdtIncludeContact" ${gdtExportConfig.includeContactData ? 'checked' : ''}
                        style="margin-right: 10px;">
                    <span>Kontaktdaten (Telefon, E-Mail)</span>
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
            <button id="gdtViewAuditLog" class="btn" style="background: #607D8B; font-size: 12px;">
                📋 Audit-Log anzeigen
            </button>
            <button id="gdtShowDocs" class="btn" style="background: #607D8B; font-size: 12px;">
                📄 DSGVO-Dokumentation
            </button>
        </div>
    `;
    
    modal.appendChild(content);
    document.body.appendChild(modal);
    
    // Handle cancel
    document.getElementById('gdtExportCancel').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    // Handle continue to consent
    document.getElementById('gdtShowConsent').addEventListener('click', async () => {
        // Update configuration
        const config = {
            practiceId: document.getElementById('gdtPracticeId').value,
            pseudonymizeData: document.getElementById('gdtPseudonymize').checked,
            includeFullName: document.getElementById('gdtIncludeFullName').checked,
            includeAddress: document.getElementById('gdtIncludeAddress').checked,
            includeContactData: document.getElementById('gdtIncludeContact').checked
        };
        
        updateGDTConfig(config);
        
        // Close config dialog
        document.body.removeChild(modal);
        
        // Show consent dialog
        await showGDTConsentAndExport(formData);
    });
    
    // Handle audit log view
    document.getElementById('gdtViewAuditLog').addEventListener('click', () => {
        showAuditLogViewer();
    });
    
    // Handle documentation
    document.getElementById('gdtShowDocs').addEventListener('click', () => {
        showGDPRDocumentation();
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
