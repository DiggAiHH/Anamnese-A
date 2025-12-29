/**
 * OCR-GDPR Integration Example
 * Zeigt wie man gdpr-anonymizer.js mit dem bestehenden OCR-Modul integriert
 */

// ============================================================================
// INTEGRATION 1: OCR-Processing mit Anonymisierung
// ============================================================================

async function processOCRWithAnonymization(file, options = {}) {
    console.log('[OCR-GDPR] Start processing:', file.name);
    
    try {
        // 1. Consent einholen (DSGVO Art. 6)
        const consent = confirm(
            'Möchten Sie personenbezogene Daten in diesem Dokument anonymisieren?\n\n' +
            '✅ Empfohlen für medizinische Dokumente\n' +
            '📋 Dictionary wird für Rückverfolgbarkeit gespeichert\n' +
            '🔒 Alle Daten bleiben lokal auf Ihrem Gerät'
        );
        
        if (!consent) {
            console.log('[OCR-GDPR] Anonymisierung abgelehnt');
            return await processOCRNormal(file);
        }
        
        // 2. OCR-Verarbeitung mit Tesseract
        const ocrResult = await Tesseract.recognize(file, 'deu', {
            logger: m => console.log('[Tesseract]', m)
        });
        
        // 3. Anonymisierung mit GDPR-Modul
        const anonymized = GDPR_ANONYMIZER.anonymizeOCRResult(
            ocrResult.data.text,
            {
                aggressiveMode: options.aggressiveMode || true,
                preserveStructure: options.preserveStructure !== false
            }
        );
        
        // 4. Statistiken anzeigen
        console.log('[OCR-GDPR] PII detected:', anonymized.detectedPII.length);
        console.log('[OCR-GDPR] PII by type:', anonymized.stats.byType);
        
        // 5. Dokument speichern (mit Original + Anonymisiert)
        const document = {
            id: 'ocr_' + Date.now(),
            filename: file.name,
            filesize: file.size,
            fileType: file.type,
            uploadDate: new Date().toISOString(),
            
            // OCR-Daten
            originalText: ocrResult.data.text,
            confidence: ocrResult.data.confidence,
            words: ocrResult.data.words.length,
            
            // Anonymisierte Daten
            anonymizedText: anonymized.anonymizedText,
            detectedPII: anonymized.detectedPII,
            piiCount: anonymized.detectedPII.length,
            piiTypes: Object.keys(anonymized.stats.byType),
            
            // DSGVO Compliance
            gdprCompliant: true,
            anonymizationVersion: '1.0.0',
            consentGiven: true,
            consentTimestamp: new Date().toISOString()
        };
        
        // 6. Speichern in localStorage (verschlüsselt)
        const encrypted = await encryptData(
            JSON.stringify(document),
            getEncryptionKey()
        );
        localStorage.setItem(document.id, encrypted);
        
        // 7. Dictionary exportieren (optional)
        if (confirm('Möchten Sie das Dictionary jetzt exportieren?')) {
            GDPR_ANONYMIZER.exportDictionaryToFile();
        }
        
        // 8. Return result
        return {
            success: true,
            document: document,
            statistics: {
                piiDetected: anonymized.detectedPII.length,
                ocrConfidence: ocrResult.data.confidence,
                processingTime: Date.now() - document.uploadDate
            }
        };
        
    } catch (error) {
        console.error('[OCR-GDPR] Error:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// ============================================================================
// INTEGRATION 2: Batch-Verarbeitung für mehrere Dokumente
// ============================================================================

async function batchProcessOCRDocuments(files) {
    console.log('[OCR-GDPR-Batch] Processing', files.length, 'documents');
    
    const results = [];
    const allTexts = [];
    
    // 1. OCR für alle Dokumente
    for (const file of files) {
        try {
            const ocrResult = await Tesseract.recognize(file, 'deu');
            allTexts.push({
                id: 'doc_' + Date.now() + '_' + Math.random(),
                filename: file.name,
                text: ocrResult.data.text,
                confidence: ocrResult.data.confidence
            });
        } catch (error) {
            console.error('[OCR-GDPR-Batch] Error processing', file.name, error);
        }
    }
    
    // 2. Batch-Anonymisierung (konsistente Pseudonyme über alle Dokumente!)
    const anonymized = GDPR_ANONYMIZER.anonymizeBatch(allTexts);
    
    // 3. Speichern
    for (const result of anonymized) {
        const document = {
            id: result.id,
            filename: result.filename,
            originalText: result.text,
            anonymizedText: result.anonymizedText,
            detectedPII: result.detectedPII,
            uploadDate: new Date().toISOString()
        };
        
        const encrypted = await encryptData(
            JSON.stringify(document),
            getEncryptionKey()
        );
        localStorage.setItem(result.id, encrypted);
        
        results.push({
            filename: result.filename,
            piiCount: result.detectedPII.length,
            success: true
        });
    }
    
    // 4. Dictionary exportieren
    console.log('[OCR-GDPR-Batch] Exporting dictionary...');
    GDPR_ANONYMIZER.exportDictionaryToFile();
    
    // 5. Audit-Report generieren
    const audit = GDPR_ANONYMIZER.generateAuditReport();
    console.log('[OCR-GDPR-Batch] Audit:', audit);
    
    return {
        success: true,
        processed: results.length,
        totalPII: results.reduce((sum, r) => sum + r.piiCount, 0),
        results: results
    };
}

// ============================================================================
// INTEGRATION 3: UI-Komponenten für OCR-Anonymisierung
// ============================================================================

function createOCRAnonymizationUI() {
    const container = document.getElementById('ocr-container');
    
    const html = `
        <div class="ocr-anonymization-panel">
            <h3>📄 OCR-Dokumentenverarbeitung</h3>
            
            <!-- File Upload -->
            <div class="upload-section">
                <label for="ocr-file-input">Dokument hochladen:</label>
                <input 
                    type="file" 
                    id="ocr-file-input" 
                    accept="image/*,application/pdf"
                    multiple
                >
                <button onclick="processOCRFiles()">🔍 OCR & Anonymisieren</button>
            </div>
            
            <!-- Options -->
            <div class="options-section">
                <label>
                    <input type="checkbox" id="aggressive-mode" checked>
                    Aggressive Mode (erkennt auch unsichere PII)
                </label>
                <label>
                    <input type="checkbox" id="auto-export-dict" checked>
                    Dictionary automatisch exportieren
                </label>
            </div>
            
            <!-- Progress -->
            <div class="progress-section" style="display: none;">
                <progress id="ocr-progress" max="100" value="0"></progress>
                <span id="ocr-status">Processing...</span>
            </div>
            
            <!-- Results -->
            <div class="results-section" style="display: none;">
                <h4>✅ Ergebnisse</h4>
                <div id="ocr-results-list"></div>
                
                <div class="stats">
                    <div class="stat-card">
                        <span class="label">Dokumente:</span>
                        <span id="stat-docs" class="value">0</span>
                    </div>
                    <div class="stat-card">
                        <span class="label">PII erkannt:</span>
                        <span id="stat-pii" class="value">0</span>
                    </div>
                    <div class="stat-card">
                        <span class="label">Durchschnitt Confidence:</span>
                        <span id="stat-confidence" class="value">0%</span>
                    </div>
                </div>
                
                <div class="actions">
                    <button onclick="exportAllDocuments()">
                        💾 Alle exportieren
                    </button>
                    <button onclick="GDPR_ANONYMIZER.exportDictionaryToFile()">
                        🔑 Dictionary exportieren
                    </button>
                    <button onclick="GDPR_ANONYMIZER.exportAuditReport()">
                        📊 Audit-Report exportieren
                    </button>
                </div>
            </div>
        </div>
        
        <style>
            .ocr-anonymization-panel {
                padding: 20px;
                background: #f5f5f5;
                border-radius: 8px;
                margin: 20px 0;
            }
            
            .upload-section, .options-section, .progress-section, .results-section {
                margin: 15px 0;
            }
            
            .stats {
                display: flex;
                gap: 15px;
                margin: 15px 0;
            }
            
            .stat-card {
                flex: 1;
                padding: 15px;
                background: white;
                border-radius: 6px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            
            .stat-card .label {
                display: block;
                font-size: 12px;
                color: #666;
                margin-bottom: 5px;
            }
            
            .stat-card .value {
                display: block;
                font-size: 24px;
                font-weight: bold;
                color: #2196F3;
            }
            
            .actions {
                display: flex;
                gap: 10px;
                margin-top: 15px;
            }
            
            .actions button {
                flex: 1;
                padding: 10px;
                border: none;
                border-radius: 6px;
                background: #2196F3;
                color: white;
                cursor: pointer;
                font-size: 14px;
            }
            
            .actions button:hover {
                background: #1976D2;
            }
            
            progress {
                width: 100%;
                height: 30px;
            }
            
            #ocr-results-list {
                max-height: 300px;
                overflow-y: auto;
                background: white;
                padding: 10px;
                border-radius: 6px;
            }
            
            .result-item {
                padding: 10px;
                margin: 5px 0;
                background: #f9f9f9;
                border-left: 4px solid #4CAF50;
                border-radius: 4px;
            }
            
            .result-item.error {
                border-left-color: #F44336;
            }
        </style>
    `;
    
    container.innerHTML = html;
}

// ============================================================================
// INTEGRATION 4: Event Handlers
// ============================================================================

async function processOCRFiles() {
    const fileInput = document.getElementById('ocr-file-input');
    const files = Array.from(fileInput.files);
    
    if (files.length === 0) {
        alert('Bitte wählen Sie mindestens eine Datei aus');
        return;
    }
    
    // Show progress
    document.querySelector('.progress-section').style.display = 'block';
    document.querySelector('.results-section').style.display = 'none';
    
    const progressBar = document.getElementById('ocr-progress');
    const statusText = document.getElementById('ocr-status');
    
    const results = [];
    let totalPII = 0;
    let totalConfidence = 0;
    
    // Process each file
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Update progress
        progressBar.value = (i / files.length) * 100;
        statusText.textContent = `Processing ${i + 1}/${files.length}: ${file.name}`;
        
        // Process
        const aggressiveMode = document.getElementById('aggressive-mode').checked;
        const result = await processOCRWithAnonymization(file, { aggressiveMode });
        
        if (result.success) {
            results.push(result);
            totalPII += result.statistics.piiDetected;
            totalConfidence += result.statistics.ocrConfidence;
        }
    }
    
    // Hide progress, show results
    document.querySelector('.progress-section').style.display = 'none';
    document.querySelector('.results-section').style.display = 'block';
    
    // Update stats
    document.getElementById('stat-docs').textContent = results.length;
    document.getElementById('stat-pii').textContent = totalPII;
    document.getElementById('stat-confidence').textContent = 
        (totalConfidence / results.length).toFixed(1) + '%';
    
    // Display results
    const resultsList = document.getElementById('ocr-results-list');
    resultsList.innerHTML = results.map(r => `
        <div class="result-item">
            <strong>${r.document.filename}</strong>
            <br>
            📄 ${r.document.words} Wörter
            | 🔐 ${r.statistics.piiDetected} PII
            | ✅ ${r.statistics.ocrConfidence.toFixed(1)}% Confidence
        </div>
    `).join('');
    
    // Auto-export dictionary?
    if (document.getElementById('auto-export-dict').checked) {
        setTimeout(() => {
            GDPR_ANONYMIZER.exportDictionaryToFile();
        }, 500);
    }
}

function exportAllDocuments() {
    const documents = [];
    
    // Collect all OCR documents from localStorage
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('ocr_')) {
            try {
                const encrypted = localStorage.getItem(key);
                const decrypted = decryptData(encrypted, getEncryptionKey());
                const doc = JSON.parse(decrypted);
                documents.push(doc);
            } catch (error) {
                console.error('Error loading document:', key, error);
            }
        }
    }
    
    // Export as JSON
    const exportData = {
        version: '1.0.0',
        exportDate: new Date().toISOString(),
        documentCount: documents.length,
        documents: documents,
        dictionary: GDPR_ANONYMIZER.exportDictionary(true)
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
        type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ocr-export-' + Date.now() + '.json';
    a.click();
    
    console.log('[OCR-GDPR] Exported', documents.length, 'documents');
}

// ============================================================================
// INTEGRATION 5: Encryption Helper Functions
// ============================================================================

async function encryptData(data, key) {
    // Use existing encryption.js module
    if (typeof window.encryptData === 'function') {
        return window.encryptData(data, key);
    }
    
    // Fallback: Basic implementation
    try {
        const encrypted = CryptoJS.AES.encrypt(data, key).toString();
        return encrypted;
    } catch (error) {
        console.error('[Encryption] Error:', error);
        throw error;
    }
}

async function decryptData(encryptedData, key) {
    // Use existing encryption.js module
    if (typeof window.decryptData === 'function') {
        return window.decryptData(encryptedData, key);
    }
    
    // Fallback: Basic implementation
    try {
        const bytes = CryptoJS.AES.decrypt(encryptedData, key);
        const decrypted = bytes.toString(CryptoJS.enc.Utf8);
        return decrypted;
    } catch (error) {
        console.error('[Decryption] Error:', error);
        throw error;
    }
}

function getEncryptionKey() {
    // Get encryption key from sessionStorage (set by login-ui.js)
    let key = sessionStorage.getItem('encryptionKey');
    
    if (!key) {
        // Prompt for master password
        const password = prompt(
            '🔒 Bitte geben Sie Ihr Master-Passwort ein:\n\n' +
            '(Minimum 16 Zeichen)'
        );
        
        if (!password || password.length < 16) {
            throw new Error('Master-Passwort erforderlich (mindestens 16 Zeichen)');
        }
        
        // Derive key from password
        key = CryptoJS.SHA256(password).toString();
        sessionStorage.setItem('encryptionKey', key);
    }
    
    return key;
}

// ============================================================================
// INITIALIZATION
// ============================================================================

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initOCRGDPR);
} else {
    initOCRGDPR();
}

function initOCRGDPR() {
    console.log('[OCR-GDPR] Initializing integration...');
    
    // Create UI
    if (document.getElementById('ocr-container')) {
        createOCRAnonymizationUI();
    }
    
    // Log status
    console.log('[OCR-GDPR] GDPR Anonymizer available:', 
        typeof window.GDPR_ANONYMIZER !== 'undefined');
    console.log('[OCR-GDPR] Tesseract available:', 
        typeof Tesseract !== 'undefined');
    console.log('[OCR-GDPR] CryptoJS available:', 
        typeof CryptoJS !== 'undefined');
    
    console.log('[OCR-GDPR] Integration ready ✅');
}

// ============================================================================
// EXPORT for use in other modules
// ============================================================================

window.OCR_GDPR_INTEGRATION = {
    processOCRWithAnonymization,
    batchProcessOCRDocuments,
    createOCRAnonymizationUI,
    processOCRFiles,
    exportAllDocuments
};
