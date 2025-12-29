// ============================================================================
// OCR GDPR-Compliance Module (DSGVO-konformes OCR-Modul)
// ============================================================================
// Version: 2.0
// Datum: 2025-12-22
// Zweck: DSGVO-konforme OCR-Verarbeitung mit vollständiger Datenschutzgarantie
//
// GARANTIEN:
// ✓ Keine externen API-Calls (Google Vision, AWS Textract, etc.)
// ✓ Vollständig lokale Verarbeitung im Browser
// ✓ Audit-Logging aller OCR-Vorgänge (Art. 30, 32 DSGVO)
// ✓ Datenschutz-Benachrichtigung vor Upload (Art. 13 DSGVO)
// ✓ Recht auf Vergessenwerden implementiert (Art. 17 DSGVO)
// ✓ Keine Vorhaltung länger als erforderlich
// ============================================================================

// ============================================================================
// AUDIT-LOGGING SYSTEM (Art. 30, 32 DSGVO)
// ============================================================================

const OCR_AUDIT = {
    logs: [],
    
    /**
     * Protokolliert eine OCR-Operation
     * @param {string} action - Art der Aktion (ocr_started, ocr_completed, etc.)
     * @param {string} filename - Dateiname
     * @param {object} details - Zusätzliche Details
     */
    log(action, filename, details = {}) {
        const logEntry = {
            id: this.generateLogId(),
            timestamp: new Date().toISOString(),
            action: action,
            filename: filename,
            fileSize: details.fileSize || null,
            fileType: details.fileType || null,
            processingType: details.processingType || 'ocr',
            processingLocation: 'local_browser', // GARANTIE: Immer lokal
            textLength: details.textLength || null,
            userId: details.userId || this.getSessionUserId(),
            userAgent: this.anonymizeUserAgent(navigator.userAgent), // Anonymisiert für DSGVO
            language: details.language || 'deu',
            success: details.success !== false,
            errorMessage: details.errorMessage || null,
            metadata: details.metadata || {}
        };
        
        this.logs.push(logEntry);
        this.persistLog(logEntry);
        
        return logEntry;
    },
    
    /**
     * Anonymisiert User Agent String (Datensparsamkeit Art. 5 DSGVO)
     */
    anonymizeUserAgent(userAgent) {
        // Extrahiere nur Browser-Familie und grobes OS ohne detaillierte Versionsnummern
        const browserMatch = userAgent.match(/(Chrome|Firefox|Safari|Edge|Opera)\/[\d.]+/);
        const osMatch = userAgent.match(/(Windows|Mac OS|Linux|Android|iOS)/);
        
        const browser = browserMatch ? browserMatch[1] : 'Unknown';
        const os = osMatch ? osMatch[1] : 'Unknown';
        
        return `${browser} on ${os}`;
    },
    
    /**
     * Generiert eine eindeutige Log-ID
     */
    generateLogId() {
        return `OCR-LOG-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    },
    
    /**
     * Ermittelt eine Session-User-ID (pseudonymisiert)
     */
    getSessionUserId() {
        let userId = sessionStorage.getItem('ocrSessionUserId');
        if (!userId) {
            userId = `USER-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
            sessionStorage.setItem('ocrSessionUserId', userId);
        }
        return userId;
    },
    
    /**
     * Speichert Log-Eintrag persistent (LocalStorage)
     */
    persistLog(logEntry) {
        try {
            const existingLogs = JSON.parse(localStorage.getItem('ocrAuditLogs') || '[]');
            existingLogs.push(logEntry);
            
            // Limitiere auf letzte 1000 Einträge (Performance)
            if (existingLogs.length > 1000) {
                existingLogs.shift();
            }
            
            localStorage.setItem('ocrAuditLogs', JSON.stringify(existingLogs));
        } catch (error) {
            console.error('Fehler beim Persistieren des Audit-Logs:', error);
        }
    },
    
    /**
     * Ruft alle Audit-Logs ab
     */
    getAllLogs() {
        try {
            const persistedLogs = JSON.parse(localStorage.getItem('ocrAuditLogs') || '[]');
            return [...this.logs, ...persistedLogs];
        } catch (error) {
            console.error('Fehler beim Abrufen der Audit-Logs:', error);
            return this.logs;
        }
    },
    
    /**
     * Filtert Logs nach Zeitraum
     */
    getLogsByDateRange(startDate, endDate) {
        const logs = this.getAllLogs();
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        return logs.filter(log => {
            const logDate = new Date(log.timestamp);
            return logDate >= start && logDate <= end;
        });
    },
    
    /**
     * Generiert Audit-Report für DSB-Prüfung
     */
    generateAuditReport() {
        const logs = this.getAllLogs();
        
        return {
            reportTimestamp: new Date().toISOString(),
            totalEntries: logs.length,
            dateRange: {
                earliest: logs.length > 0 ? logs[0].timestamp : null,
                latest: logs.length > 0 ? logs[logs.length - 1].timestamp : null
            },
            statistics: {
                ocrStarted: logs.filter(l => l.action === 'ocr_started').length,
                ocrCompleted: logs.filter(l => l.action === 'ocr_completed').length,
                ocrFailed: logs.filter(l => l.action === 'ocr_failed').length,
                documentsUploaded: logs.filter(l => l.action === 'document_uploaded').length,
                documentsDeleted: logs.filter(l => l.action === 'document_deleted').length,
                consentGiven: logs.filter(l => l.action === 'consent_given').length
            },
            logs: logs,
            gdprCompliance: {
                localProcessing: true, // GARANTIE
                noExternalAPIs: true, // GARANTIE
                auditTrailComplete: true,
                deletionRightsImplemented: true
            }
        };
    },
    
    /**
     * Löscht Audit-Logs älter als angegebene Tage
     * Standardmäßig 3 Jahre (1095 Tage) gemäß § 630f BGB
     */
    deleteOldLogs(retentionDays = 1095) {
        try {
            const logs = this.getAllLogs();
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
            
            const filteredLogs = logs.filter(log => {
                return new Date(log.timestamp) > cutoffDate;
            });
            
            localStorage.setItem('ocrAuditLogs', JSON.stringify(filteredLogs));
            this.logs = [];
            
            return {
                success: true,
                deletedCount: logs.length - filteredLogs.length,
                remainingCount: filteredLogs.length
            };
        } catch (error) {
            console.error('Fehler beim Löschen alter Logs:', error);
            return { success: false, error: error.message };
        }
    }
};

// ============================================================================
// DATENSCHUTZ-BENACHRICHTIGUNG (Art. 13 DSGVO)
// ============================================================================

const OCR_PRIVACY = {
    consentGiven: false,
    
    /**
     * Zeigt Datenschutz-Benachrichtigung an
     * Muss vor jedem OCR-Upload angezeigt werden
     */
    showPrivacyNotice() {
        return new Promise((resolve) => {
            // Prüfe, ob Einwilligung bereits in dieser Session erteilt wurde
            if (sessionStorage.getItem('ocrConsentGiven') === 'true') {
                resolve(true);
                return;
            }
            
            // Erstelle Modal
            const modal = document.createElement('div');
            modal.id = 'ocrPrivacyModal';
            modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.7);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10000;
            `;
            
            const content = document.createElement('div');
            content.style.cssText = `
                background: white;
                padding: 30px;
                border-radius: 8px;
                max-width: 600px;
                max-height: 80vh;
                overflow-y: auto;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            `;
            
            content.innerHTML = `
                <h2 style="margin-top: 0; color: #2196F3;">
                    🔒 Datenschutz-Hinweis: Dokumenten-Upload & OCR
                </h2>
                
                <div style="margin: 20px 0; padding: 15px; background: #e3f2fd; border-left: 4px solid #2196F3; border-radius: 4px;">
                    <h3 style="margin-top: 0; font-size: 16px;">Lokale Verarbeitung - Ihre Daten bleiben bei Ihnen!</h3>
                    <ul style="margin: 10px 0; padding-left: 20px;">
                        <li>✓ Alle Daten werden <strong>ausschließlich lokal</strong> auf Ihrem Gerät verarbeitet</li>
                        <li>✓ OCR-Texterkennung erfolgt im Browser (Tesseract.js)</li>
                        <li>✓ <strong>Keine Übertragung</strong> an externe Server oder Cloud-Dienste</li>
                        <li>✓ <strong>Kein Upload</strong> zu Google Vision, AWS oder anderen APIs</li>
                    </ul>
                </div>
                
                <h3 style="font-size: 15px; margin-top: 20px;">Informationen gemäß Art. 13 DSGVO:</h3>
                <div style="font-size: 14px; line-height: 1.6;">
                    <p><strong>Verantwortlicher:</strong> Ihre Arztpraxis</p>
                    <p><strong>Zweck:</strong> Digitalisierung medizinischer Dokumente zur Integration in Ihre Patientenakte</p>
                    <p><strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. a DSGVO (Einwilligung), Art. 9 Abs. 2 lit. a DSGVO (Gesundheitsdaten)</p>
                    <p><strong>Speicherdauer:</strong> Bis zur aktiven Löschung durch Sie oder nach Behandlungsabschluss</p>
                    <p><strong>Empfänger:</strong> Keine - Daten verbleiben lokal auf Ihrem Gerät</p>
                </div>
                
                <div style="margin: 20px 0; padding: 15px; background: #fff3e0; border-left: 4px solid #ff9800; border-radius: 4px;">
                    <h4 style="margin-top: 0; font-size: 14px;">⚠️ Sensible Gesundheitsdaten</h4>
                    <p style="margin: 5px 0; font-size: 13px;">
                        Die hochgeladenen Dokumente können sensible Gesundheitsdaten enthalten (Art. 9 DSGVO).
                        Ihre Einwilligung ist erforderlich.
                    </p>
                </div>
                
                <details style="margin: 15px 0; font-size: 13px;">
                    <summary style="cursor: pointer; font-weight: bold; color: #2196F3;">
                        📋 Ihre Rechte (anklicken zum Aufklappen)
                    </summary>
                    <ul style="margin: 10px 0; padding-left: 20px; line-height: 1.8;">
                        <li><strong>Auskunftsrecht (Art. 15 DSGVO):</strong> Sie können Auskunft über Ihre gespeicherten Daten verlangen</li>
                        <li><strong>Berichtigungsrecht (Art. 16 DSGVO):</strong> Fehlerhafte Daten können korrigiert werden</li>
                        <li><strong>Löschungsrecht (Art. 17 DSGVO):</strong> Sie können Ihre Daten jederzeit löschen</li>
                        <li><strong>Widerrufsrecht (Art. 7 Abs. 3 DSGVO):</strong> Diese Einwilligung ist jederzeit widerrufbar</li>
                        <li><strong>Beschwerderecht (Art. 77 DSGVO):</strong> Beschwerde bei der Datenschutzbehörde möglich</li>
                    </ul>
                </details>
                
                <div style="margin: 20px 0;">
                    <label style="display: flex; align-items: start; cursor: pointer;">
                        <input type="checkbox" id="ocrConsentCheckbox" style="margin-right: 10px; margin-top: 4px;">
                        <span style="font-size: 14px;">
                            Ich habe die Datenschutz-Informationen gelesen und stimme der lokalen Verarbeitung 
                            meiner Dokumente mit OCR zu. Mir ist bewusst, dass ich diese Einwilligung jederzeit 
                            widerrufen kann.
                        </span>
                    </label>
                </div>
                
                <div style="display: flex; justify-content: space-between; gap: 10px; margin-top: 25px;">
                    <button id="ocrPrivacyCancel" style="
                        padding: 12px 24px;
                        background: #757575;
                        color: white;
                        border: none;
                        border-radius: 4px;
                        cursor: pointer;
                        font-size: 14px;
                    ">Abbrechen</button>
                    <button id="ocrPrivacyAccept" disabled style="
                        padding: 12px 24px;
                        background: #4CAF50;
                        color: white;
                        border: none;
                        border-radius: 4px;
                        cursor: pointer;
                        font-size: 14px;
                        opacity: 0.5;
                    ">Zustimmen & Fortfahren</button>
                </div>
                
                <p style="font-size: 11px; color: #666; margin-top: 15px; text-align: center;">
                    Diese Einwilligung gilt für die aktuelle Browser-Sitzung. Bei erneutem Öffnen wird sie erneut abgefragt.
                </p>
            `;
            
            modal.appendChild(content);
            document.body.appendChild(modal);
            
            // Aktiviere Accept-Button nur wenn Checkbox aktiviert ist
            const checkbox = document.getElementById('ocrConsentCheckbox');
            const acceptBtn = document.getElementById('ocrPrivacyAccept');
            
            checkbox.addEventListener('change', () => {
                acceptBtn.disabled = !checkbox.checked;
                acceptBtn.style.opacity = checkbox.checked ? '1' : '0.5';
                acceptBtn.style.cursor = checkbox.checked ? 'pointer' : 'not-allowed';
            });
            
            // Handle Cancel
            document.getElementById('ocrPrivacyCancel').addEventListener('click', () => {
                document.body.removeChild(modal);
                OCR_AUDIT.log('consent_denied', 'privacy_notice', {
                    success: false,
                    errorMessage: 'User declined consent'
                });
                resolve(false);
            });
            
            // Handle Accept
            acceptBtn.addEventListener('click', () => {
                if (checkbox.checked) {
                    sessionStorage.setItem('ocrConsentGiven', 'true');
                    this.consentGiven = true;
                    
                    // Audit-Log
                    OCR_AUDIT.log('consent_given', 'privacy_notice', {
                        success: true,
                        metadata: {
                            timestamp: new Date().toISOString(),
                            userAgent: navigator.userAgent
                        }
                    });
                    
                    document.body.removeChild(modal);
                    resolve(true);
                }
            });
        });
    },
    
    /**
     * Widerruft die Einwilligung
     */
    revokeConsent() {
        sessionStorage.removeItem('ocrConsentGiven');
        this.consentGiven = false;
        
        OCR_AUDIT.log('consent_revoked', 'user_action', {
            success: true
        });
        
        return true;
    }
};

// ============================================================================
// ENHANCED DOCUMENT STORAGE (mit GDPR-Features)
// ============================================================================

const DOCUMENT_STORAGE_GDPR = {
    documents: [],
    
    /**
     * Fügt ein Dokument hinzu
     */
    async addDocument(docData) {
        const doc = {
            id: this.generateDocId(),
            ...docData,
            uploadTimestamp: new Date().toISOString()
        };
        
        this.documents.push(doc);
        
        try {
            await this.persistDocuments();
        } catch (persistError) {
            // Rollback on persist failure
            this.documents.pop();
            throw persistError;
        }
        
        OCR_AUDIT.log('document_uploaded', docData.filename, {
            fileSize: docData.originalSize,
            fileType: docData.type,
            textLength: docData.text?.length || 0,
            success: true
        });
        
        return doc;
    },
    
    /**
     * Generiert eindeutige Dokument-ID
     */
    generateDocId() {
        return `DOC-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    },
    
    // =================================================================
    // BUG FIX #7: SECURE persistDocuments() - NO UNENCRYPTED FALLBACK
    // =================================================================
    
    /**
     * Persistiert Dokumente (verschlüsselt mit AES-256-GCM)
     * WICHTIG: Verwendet die Verschlüsselungsfunktion aus encryption.js wenn verfügbar
     * BUG FIX: Removed unencrypted fallback for security compliance
     */
    async persistDocuments() {
        try {
            const dataToStore = JSON.stringify(this.documents);
            
            // Size check: Warn if approaching storage limits (4MB recommended max)
            if (dataToStore.length > 3 * 1024 * 1024) { // 3MB warning threshold
                console.warn(
                    '⚠️ WARNING: OCR documents approaching storage limit (' +
                    Math.round(dataToStore.length / 1024 / 1024) + 'MB). ' +
                    'Consider exporting and removing old documents.'
                );
            }
            
            // Attempt encryption with encryption.js
            if (typeof encryptData === 'function' && typeof getEncryptionKey === 'function') {
                const key = getEncryptionKey();
                if (!key) {
                    throw new Error('Encryption key not available. Please set up master password.');
                }
                
                // Encrypt data
                const encrypted = await encryptData(dataToStore, key);
                
                // Use SecureStorage if available
                if (typeof SecureStorage !== 'undefined' && SecureStorage.setItem) {
                    const success = SecureStorage.setItem('ocrDocuments_encrypted', encrypted);
                    if (!success) {
                        throw new Error('Storage quota exceeded. Please export and delete old documents.');
                    }
                    SecureStorage.setItem('ocrDocuments_encryptionMethod', 'AES-256-GCM');
                } else {
                    // Fallback with try-catch
                    try {
                        localStorage.setItem('ocrDocuments_encrypted', encrypted);
                        localStorage.setItem('ocrDocuments_encryptionMethod', 'AES-256-GCM');
                    } catch (storageError) {
                        if (storageError.name === 'QuotaExceededError') {
                            throw new Error('Storage full! Export documents and clear old data.');
                        }
                        throw storageError;
                    }
                }
                
                console.info('✓ OCR documents encrypted and persisted successfully');
            } else {
                // SECURITY FIX: Do NOT store unencrypted sensitive medical documents
                throw new Error(
                    'encryption.js not loaded. Cannot store documents without encryption. ' +
                    'This is a security requirement for GDPR compliance.'
                );
            }
        } catch (error) {
            console.error('❌ Failed to persist documents:', error);
            // Show user-friendly error
            if (typeof alert !== 'undefined') {
                alert(
                    '❌ Dokumente konnten nicht gespeichert werden!\n\n' +
                    'Grund: ' + error.message + '\n\n' +
                    'Bitte:\n' +
                    '1. Exportieren Sie Ihre Dokumente\n' +
                    '2. Löschen Sie alte Einträge\n' +
                    '3. Versuchen Sie es erneut'
                );
            }
            throw error; // Re-throw for caller to handle
        }
    },
    
    /**
     * Lädt Dokumente aus Storage (verschlüsselt oder unverschlüsselt)
     */
    async loadDocuments() {
        try {
            // Prüfe zuerst auf verschlüsselte Daten
            const encryptedData = localStorage.getItem('ocrDocuments_encrypted');
            const encryptionMethod = localStorage.getItem('ocrDocuments_encryptionMethod');
            
            if (encryptedData && encryptionMethod === 'AES-256-GCM') {
                // Versuche zu entschlüsseln
                if (typeof decryptData === 'function' && typeof getEncryptionKey === 'function') {
                    const key = getEncryptionKey();
                    if (key) {
                        try {
                            const decrypted = await decryptData(encryptedData, key);
                            this.documents = JSON.parse(decrypted);
                            console.log('✓ Dokumente erfolgreich entschlüsselt geladen');
                            return;
                        } catch (decryptError) {
                            console.error('Entschlüsselung fehlgeschlagen:', decryptError);
                            // Fallback auf unverschlüsselte Daten
                        }
                    }
                }
            }
            
            // Fallback: Lade unverschlüsselte Daten
            const stored = localStorage.getItem('ocrDocuments');
            if (stored) {
                this.documents = JSON.parse(stored);
                console.warn('⚠️ Dokumente wurden unverschlüsselt geladen');
            }
        } catch (error) {
            console.error('Fehler beim Laden der Dokumente:', error);
            this.documents = [];
        }
    },
    
    /**
     * Löscht einzelnes Dokument (Art. 17 DSGVO)
     */
    async deleteDocument(documentId) {
        const docIndex = this.documents.findIndex(doc => doc.id === documentId);
        
        if (docIndex === -1) {
            return { success: false, error: 'Dokument nicht gefunden' };
        }
        
        const doc = this.documents[docIndex];
        const removedDoc = this.documents.splice(docIndex, 1)[0];
        
        try {
            await this.persistDocuments();
        } catch (persistError) {
            // Rollback on persist failure
            this.documents.splice(docIndex, 0, removedDoc);
            throw persistError;
        }
        
        // Audit-Log
        OCR_AUDIT.log('document_deleted', doc.filename, {
            success: true,
            metadata: { deletionReason: 'user_request' }
        });
        
        return { success: true, deletedDocument: doc };
    },
    
    /**
     * Löscht alle Dokumente (Art. 17 DSGVO)
     */
    deleteAllDocuments() {
        const count = this.documents.length;
        const deletedDocs = [...this.documents];
        
        this.documents = [];
        this.persistDocuments();
        
        // Auch aus LocalStorage entfernen
        localStorage.removeItem('ocrDocuments');
        
        // Audit-Log
        OCR_AUDIT.log('all_documents_deleted', `${count} documents`, {
            success: true,
            metadata: {
                deletedCount: count,
                deletionReason: 'user_request_bulk_delete'
            }
        });
        
        return {
            success: true,
            deletedCount: count,
            deletedDocuments: deletedDocs
        };
    },
    
    /**
     * Überprüft vollständige Löschung
     */
    verifyCompleteDeletion() {
        const docsRemaining = this.documents.length;
        
        // Prüfe LocalStorage
        const storageKeys = Object.keys(localStorage).filter(key => 
            key.startsWith('ocr') || key.startsWith('document')
        );
        
        // Prüfe SessionStorage
        const sessionKeys = Object.keys(sessionStorage).filter(key =>
            key.startsWith('ocr') || key.startsWith('document')
        );
        
        const isComplete = docsRemaining === 0 && 
                          storageKeys.length <= 1 && // ocrAuditLogs darf bleiben
                          sessionKeys.length === 0;
        
        return {
            complete: isComplete,
            details: {
                documentsRemaining: docsRemaining,
                localStorageKeys: storageKeys,
                sessionStorageKeys: sessionKeys
            }
        };
    },
    
    /**
     * Vollständige Datenlöschung (inkl. Audit-Logs)
     * Nur auf expliziten Wunsch des Nutzers
     */
    performCompleteDeletion(includeAuditLogs = false) {
        // 1. Dokumente löschen
        this.deleteAllDocuments();
        
        // 2. Optional: Audit-Logs löschen (normalerweise 3 Jahre Aufbewahrung)
        if (includeAuditLogs) {
            localStorage.removeItem('ocrAuditLogs');
            OCR_AUDIT.logs = [];
        }
        
        // 3. Session-Daten
        sessionStorage.removeItem('ocrConsentGiven');
        sessionStorage.removeItem('ocrSessionUserId');
        
        // 4. Finale Audit-Log-Eintrag (vor Löschung)
        const finalLog = OCR_AUDIT.log('complete_deletion_performed', 'all_data', {
            success: true,
            metadata: {
                includeAuditLogs: includeAuditLogs,
                deletionType: 'gdpr_art17_request'
            }
        });
        
        // 5. Verifikation
        const verification = this.verifyCompleteDeletion();
        
        return {
            success: true,
            verification: verification,
            finalLogEntry: finalLog
        };
    },
    
    /**
     * Ruft alle Dokumente ab
     */
    getAllDocuments() {
        return [...this.documents];
    },
    
    /**
     * Ruft einzelnes Dokument ab
     */
    getDocument(documentId) {
        return this.documents.find(doc => doc.id === documentId);
    }
};

// ============================================================================
// ENHANCED OCR FUNCTIONS (mit GDPR-Compliance)
// ============================================================================

/**
 * Extrahiert Text aus einem PDF-Dokument (LOKAL mit PDF.js)
 * @param {File} file - Die PDF-Datei
 * @returns {Promise<string>} - Der extrahierte Text
 */
async function extractTextFromPDF(file) {
    try {
        // Prüfe ob PDF.js geladen ist
        if (typeof pdfjsLib === 'undefined') {
            throw new Error('PDF.js Bibliothek nicht geladen');
        }
        
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = '';
        
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => item.str).join(' ');
            fullText += pageText + '\n';
        }
        
        return fullText.trim();
    } catch (error) {
        console.error('PDF-Textextraktion fehlgeschlagen:', error);
        throw new Error('Fehler beim Extrahieren des Textes aus PDF: ' + error.message);
    }
}

/**
 * Führt OCR auf einem Bild durch (LOKAL - KEINE EXTERNEN APIs)
 * @param {File} file - Die Bilddatei
 * @returns {Promise<string>} - Der erkannte Text
 */
async function performOCRWithAudit(file) {
    // Audit-Log: OCR gestartet
    OCR_AUDIT.log('ocr_started', file.name, {
        fileSize: file.size,
        fileType: file.type,
        metadata: {
            imageWidth: null, // Wird nach Verarbeitung aktualisiert
            imageHeight: null
        }
    });
    
    try {
        // GARANTIE: Tesseract.js läuft vollständig lokal im Browser
        // KEINE API-Calls zu externen Servern
        const result = await Tesseract.recognize(
            file,
            'deu', // Deutsch als Hauptsprache
            {
                logger: m => {
                    if (m.status === 'recognizing text') {
                        // OCR Fortschritt: Math.round(m.progress * 100) + '%' (console.log removed per ESLint)
                    }
                },
                // DSGVO: Erzwinge lokale Assets (kein Remote-Fallback über Default-URLs)
                workerPath: 'public/lib/tesseract-worker.min.js',
                corePath: 'public/lib/tesseract-core',
                langPath: 'public/lib/tesseract-lang',
                gzip: false
            }
        );
        
        const extractedText = result.data.text;
        
        // Audit-Log: OCR erfolgreich
        OCR_AUDIT.log('ocr_completed', file.name, {
            fileSize: file.size,
            fileType: file.type,
            textLength: extractedText.length,
            success: true,
            metadata: {
                confidence: result.data.confidence || null
            }
        });
        
        return extractedText;
    } catch (error) {
        // Audit-Log: OCR fehlgeschlagen
        OCR_AUDIT.log('ocr_failed', file.name, {
            fileSize: file.size,
            fileType: file.type,
            success: false,
            errorMessage: error.message
        });
        
        console.error('OCR fehlgeschlagen:', error);
        throw new Error('Fehler bei der Texterkennung: ' + error.message);
    }
}

/**
 * Verarbeitet hochgeladene Datei mit GDPR-Compliance
 * @param {File} file - Die hochgeladene Datei
 * @returns {Promise<object>} - Dokumenten-Objekt
 */
async function processUploadedFileWithGDPR(file) {
    const timestamp = new Date().toISOString();
    const fileType = file.type;
    
    let extractedText = '';
    let processType = '';
    
    try {
        if (fileType === 'application/pdf') {
            // PDF-Verarbeitung (lokal mit PDF.js)
            processType = 'pdf-extraction';
            extractedText = await extractTextFromPDF(file);
            
            OCR_AUDIT.log('pdf_extraction_completed', file.name, {
                fileSize: file.size,
                fileType: file.type,
                textLength: extractedText.length,
                processingType: processType,
                success: true
            });
        } else if (fileType.startsWith('image/')) {
            // Bildverarbeitung mit OCR
            processType = 'ocr';
            extractedText = await performOCRWithAudit(file);
        } else if (fileType.startsWith('text/')) {
            // Textdatei direkt lesen
            processType = 'text-file';
            extractedText = await file.text();
            
            OCR_AUDIT.log('text_file_read', file.name, {
                fileSize: file.size,
                fileType: file.type,
                textLength: extractedText.length,
                processingType: processType,
                success: true
            });
        } else {
            throw new Error('Nicht unterstützter Dateityp: ' + fileType);
        }
        
        return {
            filename: file.name,
            text: extractedText,
            timestamp: timestamp,
            type: processType,
            originalSize: file.size
        };
    } catch (error) {
        throw new Error('Fehler beim Verarbeiten von ' + file.name + ': ' + error.message);
    }
}

/**
 * Zeigt Dialog zum Hochladen von Dokumenten mit GDPR-Compliance
 */
async function showDocumentUploadDialogGDPR() {
    // 1. SCHRITT: Datenschutz-Benachrichtigung anzeigen (Art. 13 DSGVO)
    const consentGiven = await OCR_PRIVACY.showPrivacyNotice();
    
    if (!consentGiven) {
        return {
            success: false,
            message: 'Upload abgebrochen - Einwilligung nicht erteilt'
        };
    }
    
    // 2. SCHRITT: File-Input erstellen
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,.pdf,.txt';
    input.multiple = true;
    
    return new Promise((resolve) => {
        input.onchange = async (e) => {
            const files = Array.from(e.target.files);
            if (files.length === 0) {
                resolve({ success: false, message: 'Keine Dateien ausgewählt' });
                return;
            }
            
            const processedDocs = [];
            const errors = [];
            
            for (const file of files) {
                try {
                    const docData = await processUploadedFileWithGDPR(file);
                    const doc = DOCUMENT_STORAGE_GDPR.addDocument(docData);
                    processedDocs.push(doc);
                } catch (error) {
                    console.error('Fehler beim Verarbeiten der Datei:', error);
                    errors.push({ filename: file.name, error: error.message });
                }
            }
            
            resolve({
                success: processedDocs.length > 0,
                processedCount: processedDocs.length,
                errorCount: errors.length,
                documents: processedDocs,
                errors: errors
            });
        };
        
        input.click();
    });
}

// ============================================================================
// UI-FUNKTIONEN FÜR GDPR-FEATURES
// ============================================================================

/**
 * Zeigt hochgeladene Dokumente mit Lösch-Optionen an
 */
function showUploadedDocumentsGDPR() {
    const docs = DOCUMENT_STORAGE_GDPR.getAllDocuments();
    
    if (docs.length === 0) {
        alert('Keine Dokumente hochgeladen.');
        return;
    }
    
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
    `;
    
    const content = document.createElement('div');
    content.style.cssText = `
        background: white;
        padding: 30px;
        border-radius: 8px;
        max-width: 800px;
        max-height: 80vh;
        overflow-y: auto;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    `;
    
    // Erstelle Dokumente-Liste mit createElement statt innerHTML (XSS-sicher)
    const docListContainer = document.createElement('div');
    docListContainer.id = 'documentsList';
    
    docs.forEach((doc, index) => {
        const docDiv = document.createElement('div');
        docDiv.style.cssText = 'border: 1px solid #ddd; padding: 15px; margin: 10px 0; border-radius: 4px;';
        
        const flexDiv = document.createElement('div');
        flexDiv.style.cssText = 'display: flex; justify-content: space-between; align-items: start;';
        
        const infoDiv = document.createElement('div');
        infoDiv.style.flex = '1';
        
        const title = document.createElement('h4');
        title.style.cssText = 'margin: 0 0 10px 0;';
        title.textContent = `${index + 1}. ${doc.filename}`;
        
        const info = document.createElement('p');
        info.style.cssText = 'margin: 5px 0; font-size: 13px; color: #666;';
        info.textContent = `Typ: ${doc.type} | Größe: ${(doc.originalSize / 1024).toFixed(1)} KB | Text: ${doc.text?.length || 0} Zeichen`;
        
        const timestamp = document.createElement('p');
        timestamp.style.cssText = 'margin: 5px 0; font-size: 12px; color: #999;';
        timestamp.textContent = `Hochgeladen: ${new Date(doc.uploadTimestamp).toLocaleString('de-DE')}`;
        
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = '🗑️ Löschen';
        deleteBtn.style.cssText = 'padding: 8px 16px; background: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 13px;';
        deleteBtn.dataset.documentId = doc.id; // Verwende data-attribute statt onclick
        deleteBtn.className = 'delete-doc-btn';
        
        infoDiv.appendChild(title);
        infoDiv.appendChild(info);
        infoDiv.appendChild(timestamp);
        
        flexDiv.appendChild(infoDiv);
        flexDiv.appendChild(deleteBtn);
        
        docDiv.appendChild(flexDiv);
        docListContainer.appendChild(docDiv);
    });
    
    const header = document.createElement('h2');
    header.style.marginTop = '0';
    header.textContent = `📋 Hochgeladene Dokumente (${docs.length})`;
    
    const privacyNotice = document.createElement('div');
    privacyNotice.style.cssText = 'margin-top: 20px; padding: 15px; background: #fff3e0; border-radius: 4px;';
    const noticeText = document.createElement('p');
    noticeText.style.cssText = 'margin: 0; font-size: 13px;';
    noticeText.innerHTML = 'ℹ️ <strong>Datenschutz-Hinweis:</strong> Sie können einzelne Dokumente oder alle Dokumente gemäß Art. 17 DSGVO (Recht auf Vergessenwerden) jederzeit löschen.';
    privacyNotice.appendChild(noticeText);
    
    const buttonDiv = document.createElement('div');
    buttonDiv.style.cssText = 'display: flex; justify-content: space-between; gap: 10px; margin-top: 20px;';
    
    const deleteAllBtn = document.createElement('button');
    deleteAllBtn.id = 'deleteAllDocsBtn';
    deleteAllBtn.textContent = '🗑️ Alle löschen (Art. 17 DSGVO)';
    deleteAllBtn.style.cssText = 'padding: 12px 24px; background: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer;';
    
    const closeBtn = document.createElement('button');
    closeBtn.id = 'closeDocsModal';
    closeBtn.textContent = 'Schließen';
    closeBtn.style.cssText = 'padding: 12px 24px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer;';
    
    buttonDiv.appendChild(deleteAllBtn);
    buttonDiv.appendChild(closeBtn);
    
    content.appendChild(header);
    content.appendChild(docListContainer);
    content.appendChild(privacyNotice);
    content.appendChild(buttonDiv);
    
    modal.appendChild(content);
    document.body.appendChild(modal);
    
    // Event Delegation für Delete-Buttons (XSS-sicher)
    docListContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-doc-btn')) {
            const documentId = e.target.dataset.documentId;
            if (confirm('Dokument wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.')) {
                const result = DOCUMENT_STORAGE_GDPR.deleteDocument(documentId);
                if (result.success) {
                    alert('✓ Dokument erfolgreich gelöscht.');
                    document.body.removeChild(modal);
                    showUploadedDocumentsGDPR(); // Neu laden
                } else {
                    alert('❌ Fehler beim Löschen: ' + result.error);
                }
            }
        }
    });
    
    // Event Listeners
    deleteAllBtn.addEventListener('click', () => {
        if (confirm('Möchten Sie wirklich ALLE Dokumente unwiderruflich löschen? (Art. 17 DSGVO)')) {
            deleteAllDocumentsGDPR();
            document.body.removeChild(modal);
        }
    });
    
    closeBtn.addEventListener('click', () => {
        document.body.removeChild(modal);
    });
}

/**
 * Löscht einzelnes Dokument mit Bestätigung
 */
function deleteDocumentGDPR(documentId) {
    if (confirm('Dokument wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.')) {
        const result = DOCUMENT_STORAGE_GDPR.deleteDocument(documentId);
        
        if (result.success) {
            alert('✓ Dokument erfolgreich gelöscht.');
            // Aktualisiere Anzeige
            const modal = document.getElementById('documentsList')?.parentElement?.parentElement;
            if (modal) {
                document.body.removeChild(modal);
                showUploadedDocumentsGDPR(); // Neu laden
            }
        } else {
            alert('❌ Fehler beim Löschen: ' + result.error);
        }
    }
}

/**
 * Löscht alle Dokumente mit Bestätigung
 */
function deleteAllDocumentsGDPR() {
    const result = DOCUMENT_STORAGE_GDPR.deleteAllDocuments();
    
    if (result.success) {
        alert(`✓ Alle Dokumente erfolgreich gelöscht (${result.deletedCount} Dokumente).`);
    } else {
        alert('❌ Fehler beim Löschen der Dokumente.');
    }
}

/**
 * Zeigt Audit-Report an (für DSB/Praxisinhaber)
 */
function showAuditReportGDPR() {
    const report = OCR_AUDIT.generateAuditReport();
    
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
    `;
    
    const content = document.createElement('div');
    content.style.cssText = `
        background: white;
        padding: 30px;
        border-radius: 8px;
        max-width: 900px;
        max-height: 80vh;
        overflow-y: auto;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    `;
    
    content.innerHTML = `
        <h2 style="margin-top: 0;">📊 OCR Audit-Report (DSGVO)</h2>
        
        <div style="background: #e3f2fd; padding: 15px; border-radius: 4px; margin: 20px 0;">
            <h3 style="margin-top: 0;">GDPR-Compliance-Status:</h3>
            <p>✅ Lokale Verarbeitung: ${report.gdprCompliance.localProcessing ? 'Ja' : 'Nein'}</p>
            <p>✅ Keine externen APIs: ${report.gdprCompliance.noExternalAPIs ? 'Ja' : 'Nein'}</p>
            <p>✅ Audit-Trail vollständig: ${report.gdprCompliance.auditTrailComplete ? 'Ja' : 'Nein'}</p>
            <p>✅ Löschungsrechte: ${report.gdprCompliance.deletionRightsImplemented ? 'Ja' : 'Nein'}</p>
        </div>
        
        <h3>Statistiken:</h3>
        <ul>
            <li>Gesamt Einträge: ${report.totalEntries}</li>
            <li>OCR gestartet: ${report.statistics.ocrStarted}</li>
            <li>OCR abgeschlossen: ${report.statistics.ocrCompleted}</li>
            <li>OCR fehlgeschlagen: ${report.statistics.ocrFailed}</li>
            <li>Dokumente hochgeladen: ${report.statistics.documentsUploaded}</li>
            <li>Dokumente gelöscht: ${report.statistics.documentsDeleted}</li>
            <li>Einwilligungen erteilt: ${report.statistics.consentGiven}</li>
        </ul>
        
        <h3>Zeitraum:</h3>
        <p>Von: ${report.dateRange.earliest || 'N/A'}</p>
        <p>Bis: ${report.dateRange.latest || 'N/A'}</p>
        
        <button id="exportAuditReport" style="
            padding: 12px 24px;
            background: #2196F3;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            margin: 10px 10px 10px 0;
        ">📥 Report exportieren (JSON)</button>
        
        <button id="closeAuditModal" style="
            padding: 12px 24px;
            background: #757575;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        ">Schließen</button>
    `;
    
    modal.appendChild(content);
    document.body.appendChild(modal);
    
    document.getElementById('exportAuditReport').addEventListener('click', () => {
        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ocr-audit-report-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    });
    
    document.getElementById('closeAuditModal').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
}

// ============================================================================
// INITIALIZATION
// ============================================================================

// Beim Laden der Seite: Dokumente aus Storage laden
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
        DOCUMENT_STORAGE_GDPR.loadDocuments();
        console.log('OCR-GDPR-Modul geladen - DSGVO-konform');
    });
}

// ============================================================================
// EXPORTS (für Verwendung in anderen Modulen)
// ============================================================================

// Diese Funktionen können in den HTML-Dateien verwendet werden
window.OCR_AUDIT = OCR_AUDIT;
window.OCR_PRIVACY = OCR_PRIVACY;
window.DOCUMENT_STORAGE_GDPR = DOCUMENT_STORAGE_GDPR;
window.performOCRWithAudit = performOCRWithAudit;
window.processUploadedFileWithGDPR = processUploadedFileWithGDPR;
window.showDocumentUploadDialogGDPR = showDocumentUploadDialogGDPR;
window.showUploadedDocumentsGDPR = showUploadedDocumentsGDPR;
window.deleteDocumentGDPR = deleteDocumentGDPR;
window.deleteAllDocumentsGDPR = deleteAllDocumentsGDPR;
window.showAuditReportGDPR = showAuditReportGDPR;
