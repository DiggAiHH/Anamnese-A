// AI-Plausibilitätsprüfung (AI Plausibility Check)
// Privacy-Compliant Local Rule-Based Validation System
// DSGVO/GDPR Art. 5, 25, 32 - Privacy by Design
//
// WICHTIG: Dieses Modul arbeitet vollständig lokal/offline
// - KEINE externen API-Aufrufe (OpenAI, Google, etc. verboten)
// - KEINE Übertragung von Patientendaten an Dritte
// - Alle Verarbeitungen erfolgen im Browser des Benutzers
// - Trainingsdaten werden lokal pseudonymisiert

// ============================================================================
// KONFIGURATION
// ============================================================================

const AI_PLAUSIBILITY_CONFIG = {
    // System-Status
    enabled: true,
    offlineOnly: true,  // Erzwingt Offline-Modus
    
    // Logging und Audit
    auditLogging: true,
    detailedLogging: false,
    
    // Prüfungsebenen
    checkLevels: {
        basic: true,        // Basis-Plausibilitätsprüfungen
        medical: true,      // Medizinische Logik-Prüfungen
        statistical: true   // Statistische Anomalie-Erkennung
    },
    
    // Schwellenwerte
    thresholds: {
        minAge: 0,
        maxAge: 120,
        minWeight: 0.5,     // kg
        maxWeight: 500,     // kg
        minHeight: 30,      // cm
        maxHeight: 250      // cm
    }
};

// ============================================================================
// AUDIT LOGGING FÜR AI-ZUGRIFFE
// ============================================================================

const aiAuditLog = {
    entries: [],
    maxEntries: 10000
};

/**
 * Protokolliert jeden AI-Modellzugriff für DSGVO-Compliance
 * @param {string} action - Durchgeführte Aktion
 * @param {object} details - Details zur Prüfung (pseudonymisiert)
 */
function logAIAccess(action, details = {}) {
    if (!AI_PLAUSIBILITY_CONFIG.auditLogging) return;
    
    const entry = {
        id: generateAuditId(),
        timestamp: new Date().toISOString(),
        action: action,
        module: 'AI-Plausibility-Check',
        details: sanitizeForLogging(details),
        result: details.result || 'unknown',
        processingType: 'local-only',
        dataTransfer: 'none'
    };
    
    aiAuditLog.entries.push(entry);
    
    // Begrenzung der Log-Größe (DSGVO Art. 5 - Speicherbegrenzung)
    if (aiAuditLog.entries.length > aiAuditLog.maxEntries) {
        aiAuditLog.entries.shift();
    }
    
    // Speichere Log lokal
    try {
        localStorage.setItem('ai_audit_log', JSON.stringify({
            entries: aiAuditLog.entries.slice(-1000), // Letzte 1000 Einträge
            lastUpdate: new Date().toISOString()
        }));
    } catch (e) {
        console.warn('AI Audit Log konnte nicht gespeichert werden:', e);
    }
    
    if (AI_PLAUSIBILITY_CONFIG.detailedLogging) {
        console.log('[AI-Audit]', entry);
    }
}

/**
 * Bereinigt Daten für Logging (Pseudonymisierung)
 */
function sanitizeForLogging(data) {
    const sanitized = {...data};
    
    // Entferne oder pseudonymisiere persönliche Identifikatoren
    const sensitiveFields = ['firstName', 'lastName', 'email', 'phone', 'address'];
    sensitiveFields.forEach(field => {
        if (sanitized[field]) {
            sanitized[field] = '***PSEUDONYMIZED***';
        }
    });
    
    return sanitized;
}

/**
 * Generiert eindeutige Audit-ID
 */
function generateAuditId() {
    return `AI-AUDIT-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Exportiert AI Audit-Log (für DSB/Aufsichtsbehörde)
 */
function exportAIAuditLog() {
    const logData = {
        exportDate: new Date().toISOString(),
        system: 'Anamnese-AI-Plausibility-Check',
        version: '1.0.0',
        compliance: 'DSGVO Art. 30, 32',
        totalEntries: aiAuditLog.entries.length,
        entries: aiAuditLog.entries
    };
    
    const blob = new Blob([JSON.stringify(logData, null, 2)], {
        type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AI-Audit-Log-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    logAIAccess('audit_log_exported', {
        result: 'success',
        entriesExported: aiAuditLog.entries.length
    });
}

// ============================================================================
// PLAUSIBILITÄTSPRÜFUNG - REGEL-BASIERTES SYSTEM
// ============================================================================

/**
 * Hauptfunktion zur Plausibilitätsprüfung
 * @param {object} formData - Anamnese-Formulardaten
 * @returns {object} Prüfergebnis mit Warnungen und Empfehlungen
 */
function performPlausibilityCheck(formData) {
    logAIAccess('plausibility_check_started', {
        dataFields: Object.keys(formData).length
    });
    
    const results = {
        timestamp: new Date().toISOString(),
        overallStatus: 'valid',
        warnings: [],
        errors: [],
        recommendations: [],
        checksPerformed: []
    };
    
    // Führe verschiedene Prüfungsebenen durch
    if (AI_PLAUSIBILITY_CONFIG.checkLevels.basic) {
        performBasicChecks(formData, results);
    }
    
    if (AI_PLAUSIBILITY_CONFIG.checkLevels.medical) {
        performMedicalLogicChecks(formData, results);
    }
    
    if (AI_PLAUSIBILITY_CONFIG.checkLevels.statistical) {
        performStatisticalChecks(formData, results);
    }
    
    // Bestimme Gesamtstatus
    if (results.errors.length > 0) {
        results.overallStatus = 'invalid';
    } else if (results.warnings.length > 0) {
        results.overallStatus = 'warning';
    }
    
    logAIAccess('plausibility_check_completed', {
        result: results.overallStatus,
        warnings: results.warnings.length,
        errors: results.errors.length,
        recommendations: results.recommendations.length
    });
    
    return results;
}

// ============================================================================
// BASIS-PLAUSIBILITÄTSPRÜFUNGEN
// ============================================================================

/**
 * Führt grundlegende Plausibilitätsprüfungen durch
 */
function performBasicChecks(formData, results) {
    results.checksPerformed.push('basic_validation');
    
    // Altersbereichsprüfung
    if (formData.dateOfBirth) {
        const age = calculateAge(formData.dateOfBirth);
        if (age < AI_PLAUSIBILITY_CONFIG.thresholds.minAge || 
            age > AI_PLAUSIBILITY_CONFIG.thresholds.maxAge) {
            results.errors.push({
                field: 'dateOfBirth',
                type: 'age_out_of_range',
                message: `Alter (${age}) liegt außerhalb des plausiblen Bereichs (${AI_PLAUSIBILITY_CONFIG.thresholds.minAge}-${AI_PLAUSIBILITY_CONFIG.thresholds.maxAge})`,
                severity: 'high'
            });
        }
        
        // Besondere Altersgruppen
        if (age < 18) {
            results.recommendations.push({
                type: 'minor_patient',
                message: 'Patient ist minderjährig - Einwilligung der Erziehungsberechtigten erforderlich'
            });
        }
    }
    
    // Geschlechts-spezifische Prüfungen
    if (formData.gender) {
        checkGenderSpecificConditions(formData, results);
    }
    
    // Numerische Werte prüfen
    checkNumericRanges(formData, results);
}

/**
 * Berechnet Alter aus Geburtsdatum
 */
function calculateAge(dateOfBirth) {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    
    return age;
}

/**
 * Prüft geschlechtsspezifische Bedingungen
 */
function checkGenderSpecificConditions(formData, results) {
    const gender = formData.gender;
    const age = formData.dateOfBirth ? calculateAge(formData.dateOfBirth) : null;
    
    // Schwangerschafts-bezogene Prüfungen
    if (formData.pregnant === 'yes' || formData.pregnancy) {
        if (gender === 'male' || gender === 'männlich' || gender === '1') {
            results.errors.push({
                field: 'pregnant',
                type: 'gender_mismatch',
                message: 'Schwangerschaft bei männlichem Geschlecht ist nicht plausibel',
                severity: 'high'
            });
        }
        
        if (age !== null && (age < 10 || age > 55)) {
            results.warnings.push({
                field: 'pregnant',
                type: 'age_pregnancy_mismatch',
                message: `Schwangerschaft im Alter von ${age} Jahren ist ungewöhnlich`,
                severity: 'medium'
            });
        }
    }
}

/**
 * Prüft numerische Wertebereiche
 */
function checkNumericRanges(formData, results) {
    // Gewicht
    if (formData.weight) {
        const weight = parseFloat(formData.weight);
        if (!isNaN(weight)) {
            if (weight < AI_PLAUSIBILITY_CONFIG.thresholds.minWeight || 
                weight > AI_PLAUSIBILITY_CONFIG.thresholds.maxWeight) {
                results.warnings.push({
                    field: 'weight',
                    type: 'value_out_of_range',
                    message: `Gewicht (${weight} kg) liegt außerhalb des üblichen Bereichs`,
                    severity: 'medium'
                });
            }
        }
    }
    
    // Größe
    if (formData.height) {
        const height = parseFloat(formData.height);
        if (!isNaN(height)) {
            if (height < AI_PLAUSIBILITY_CONFIG.thresholds.minHeight || 
                height > AI_PLAUSIBILITY_CONFIG.thresholds.maxHeight) {
                results.warnings.push({
                    field: 'height',
                    type: 'value_out_of_range',
                    message: `Größe (${height} cm) liegt außerhalb des üblichen Bereichs`,
                    severity: 'medium'
                });
            }
        }
    }
    
    // BMI-Berechnung und Plausibilität
    if (formData.weight && formData.height) {
        checkBMIPlausibility(formData, results);
    }
}

/**
 * Prüft BMI-Plausibilität
 */
function checkBMIPlausibility(formData, results) {
    const weight = parseFloat(formData.weight);
    const height = parseFloat(formData.height) / 100; // cm zu m
    
    if (!isNaN(weight) && !isNaN(height) && height > 0) {
        const bmi = weight / (height * height);
        
        if (bmi < 12 || bmi > 60) {
            results.warnings.push({
                field: 'bmi',
                type: 'bmi_extreme',
                message: `BMI (${bmi.toFixed(1)}) liegt in einem extremen Bereich - bitte Eingaben überprüfen`,
                severity: 'high'
            });
        } else if (bmi < 16 || bmi > 40) {
            results.recommendations.push({
                type: 'bmi_attention',
                message: `BMI (${bmi.toFixed(1)}) erfordert besondere medizinische Aufmerksamkeit`
            });
        }
    }
}

// ============================================================================
// MEDIZINISCHE LOGIK-PRÜFUNGEN
// ============================================================================

/**
 * Führt medizinische Logik-Prüfungen durch
 */
function performMedicalLogicChecks(formData, results) {
    results.checksPerformed.push('medical_logic');
    
    // Medikations-Allergie-Konflikt
    checkMedicationAllergyConflicts(formData, results);
    
    // Diagnose-Alter-Konsistenz
    checkDiagnosisAgeConsistency(formData, results);
    
    // Medikations-Interaktionen (Basic)
    checkBasicMedicationInteractions(formData, results);
}

/**
 * Prüft Konflikte zwischen Medikation und Allergien
 */
function checkMedicationAllergyConflicts(formData, results) {
    const medications = extractMedications(formData.currentMedications || '');
    const allergies = extractAllergies(formData.allergies || '');
    
    // Bekannte Wirkstoffgruppen
    const drugGroups = {
        'penicillin': ['amoxicillin', 'ampicillin', 'penicillin'],
        'aspirin': ['aspirin', 'asa', 'acetylsalicylsäure'],
        'ibuprofen': ['ibuprofen', 'nurofen'],
        'paracetamol': ['paracetamol', 'acetaminophen']
    };
    
    // Prüfe auf Konflikte
    allergies.forEach(allergy => {
        const allergyLower = allergy.toLowerCase();
        
        Object.keys(drugGroups).forEach(group => {
            if (allergyLower.includes(group)) {
                medications.forEach(med => {
                    const medLower = med.toLowerCase();
                    if (drugGroups[group].some(drug => medLower.includes(drug))) {
                        results.errors.push({
                            field: 'medications',
                            type: 'medication_allergy_conflict',
                            message: `Möglicher Konflikt: Medikation "${med}" bei bekannter Allergie gegen "${allergy}"`,
                            severity: 'critical'
                        });
                    }
                });
            }
        });
    });
}

/**
 * Extrahiert Medikamente aus Freitext
 */
function extractMedications(text) {
    if (!text) return [];
    return text.split(/[,;\n]/).map(m => m.trim()).filter(m => m.length > 0);
}

/**
 * Extrahiert Allergien aus Freitext
 */
function extractAllergies(text) {
    if (!text) return [];
    return text.split(/[,;\n]/).map(a => a.trim()).filter(a => a.length > 0);
}

/**
 * Prüft Konsistenz zwischen Diagnosen und Alter
 */
function checkDiagnosisAgeConsistency(formData, results) {
    if (!formData.dateOfBirth || !formData.pastIllnesses) return;
    
    const age = calculateAge(formData.dateOfBirth);
    const illnesses = formData.pastIllnesses.toLowerCase();
    
    // Alters-ungewöhnliche Erkrankungen
    if (age < 30 && illnesses.includes('arthrose')) {
        results.warnings.push({
            field: 'pastIllnesses',
            type: 'age_diagnosis_unusual',
            message: 'Arthrose in jungem Alter ist ungewöhnlich - bitte bestätigen',
            severity: 'medium'
        });
    }
    
    if (age < 18 && (illnesses.includes('herzinfarkt') || illnesses.includes('schlaganfall'))) {
        results.warnings.push({
            field: 'pastIllnesses',
            type: 'age_diagnosis_rare',
            message: 'Kardiovaskuläre Erkrankungen in diesem Alter sind sehr selten - bitte überprüfen',
            severity: 'high'
        });
    }
}

/**
 * Prüft grundlegende Medikamenten-Interaktionen
 */
function checkBasicMedicationInteractions(formData, results) {
    const medications = extractMedications(formData.currentMedications || '');
    const medLower = medications.map(m => m.toLowerCase());
    
    // Bekannte Interaktionen
    const interactions = [
        {
            drugs: ['marcumar', 'warfarin'],
            conflicts: ['aspirin', 'ibuprofen', 'diclofenac'],
            message: 'Blutgerinnungshemmer mit NSAIDs: Erhöhtes Blutungsrisiko'
        },
        {
            drugs: ['simvastatin', 'atorvastatin'],
            conflicts: ['clarithromycin', 'erythromycin'],
            message: 'Statine mit Makrolid-Antibiotika: Erhöhtes Myopathie-Risiko'
        }
    ];
    
    interactions.forEach(interaction => {
        const hasDrug = interaction.drugs.some(drug => 
            medLower.some(med => med.includes(drug))
        );
        const hasConflict = interaction.conflicts.some(conflict => 
            medLower.some(med => med.includes(conflict))
        );
        
        if (hasDrug && hasConflict) {
            results.warnings.push({
                field: 'medications',
                type: 'medication_interaction',
                message: interaction.message,
                severity: 'high'
            });
        }
    });
}

// ============================================================================
// STATISTISCHE ANOMALIE-ERKENNUNG
// ============================================================================

/**
 * Führt statistische Anomalie-Prüfungen durch
 */
function performStatisticalChecks(formData, results) {
    results.checksPerformed.push('statistical_analysis');
    
    // Ungewöhnliche Kombinationen
    checkUnusualCombinations(formData, results);
    
    // Vollständigkeits-Check
    checkDataCompleteness(formData, results);
}

/**
 * Prüft auf ungewöhnliche Datenkombinationen
 */
function checkUnusualCombinations(formData, results) {
    // Beispiel: Viele Medikamente aber keine Vorerkrankungen
    const medCount = extractMedications(formData.currentMedications || '').length;
    const hasIllnesses = formData.pastIllnesses && formData.pastIllnesses.trim().length > 0;
    
    if (medCount >= 3 && !hasIllnesses) {
        results.recommendations.push({
            type: 'data_consistency',
            message: 'Mehrere Medikamente ohne dokumentierte Vorerkrankungen - bitte Angaben vervollständigen'
        });
    }
    
    // Allergien ohne Details
    if (formData.hasAllergies === 'yes' && (!formData.allergies || formData.allergies.trim().length === 0)) {
        results.warnings.push({
            field: 'allergies',
            type: 'incomplete_data',
            message: 'Allergien angegeben, aber keine Details erfasst',
            severity: 'medium'
        });
    }
}

/**
 * Prüft Datenvollständigkeit
 */
function checkDataCompleteness(formData, results) {
    const essentialFields = ['firstName', 'lastName', 'dateOfBirth', 'gender'];
    const missingFields = essentialFields.filter(field => !formData[field] || formData[field].trim() === '');
    
    if (missingFields.length > 0) {
        results.warnings.push({
            field: 'general',
            type: 'incomplete_essential_data',
            message: `Wesentliche Felder fehlen: ${missingFields.join(', ')}`,
            severity: 'medium'
        });
    }
}

// ============================================================================
// DATENSCHUTZ-FUNKTIONEN
// ============================================================================

/**
 * Löscht alle AI-bezogenen Daten (DSGVO Art. 17 - Recht auf Löschung)
 */
function deleteAllAIData() {
    return new Promise((resolve, reject) => {
        try {
            // Lösche Audit-Logs
            localStorage.removeItem('ai_audit_log');
            aiAuditLog.entries = [];
            
            // Lösche Konfigurationen
            localStorage.removeItem('ai_plausibility_config');
            
            // Lösche gecachte Prüfergebnisse
            localStorage.removeItem('ai_cached_results');
            
            logAIAccess('all_ai_data_deleted', {
                result: 'success',
                timestamp: new Date().toISOString()
            });
            
            resolve({
                success: true,
                message: 'Alle AI-bezogenen Daten wurden gelöscht',
                deletedItems: ['audit_log', 'config', 'cached_results']
            });
        } catch (error) {
            reject({
                success: false,
                message: 'Fehler beim Löschen der AI-Daten',
                error: error.message
            });
        }
    });
}

/**
 * Pseudonymisiert Trainingsdaten (DSGVO Art. 32)
 */
function pseudonymizeTrainingData(data) {
    const pseudonymized = {...data};
    
    // Hash-Funktion für konsistente Pseudonymisierung
    const hashString = async (str) => {
        const encoder = new TextEncoder();
        const data = encoder.encode(str);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    };
    
    // Pseudonymisiere persönliche Identifikatoren
    const fieldsToHash = ['firstName', 'lastName', 'email', 'phone', 'address'];
    
    fieldsToHash.forEach(async field => {
        if (pseudonymized[field]) {
            pseudonymized[field] = await hashString(pseudonymized[field]);
        }
    });
    
    return pseudonymized;
}

/**
 * Überprüft, ob externe API-Aufrufe blockiert sind
 */
function verifyNoExternalAPICalls() {
    // Verhindere externe Aufrufe
    const blockedDomains = [
        'openai.com',
        'api.openai.com',
        'anthropic.com',
        'googleapis.com',
        'azure.com',
        'amazonaws.com'
    ];
    
    // Override fetch für Sicherheit
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
        const url = args[0];
        if (typeof url === 'string') {
            const isBlocked = blockedDomains.some(domain => url.includes(domain));
            if (isBlocked) {
                logAIAccess('blocked_external_api_call', {
                    url: url,
                    result: 'blocked',
                    reason: 'DSGVO-Compliance: Externe AI-Dienste verboten'
                });
                throw new Error('DSGVO-Verstoß: Externe AI-API-Aufrufe sind nicht erlaubt');
            }
        }
        return originalFetch.apply(this, args);
    };
    
    console.log('[AI-Plausibility] Externe API-Aufrufe werden blockiert (DSGVO-Compliance)');
}

// ============================================================================
// INITIALISIERUNG
// ============================================================================

// Lade gespeicherten Audit-Log
try {
    const savedLog = localStorage.getItem('ai_audit_log');
    if (savedLog) {
        const parsed = JSON.parse(savedLog);
        aiAuditLog.entries = parsed.entries || [];
    }
} catch (e) {
    console.warn('Konnte AI Audit Log nicht laden:', e);
}

// Blockiere externe API-Aufrufe
verifyNoExternalAPICalls();

// Initialisierungs-Log
logAIAccess('module_initialized', {
    result: 'success',
    version: '1.0.0',
    mode: 'offline-only',
    compliance: 'DSGVO Art. 5, 25, 32'
});

// ============================================================================
// EXPORT
// ============================================================================

// Funktionen für externe Verwendung verfügbar machen
if (typeof window !== 'undefined') {
    window.AIPlausibilityCheck = {
        performPlausibilityCheck,
        exportAIAuditLog,
        deleteAllAIData,
        config: AI_PLAUSIBILITY_CONFIG,
        version: '1.0.0'
    };
}
