# AI-Plausibilitätsprüfung: Technische Dokumentation
# AI Plausibility Check: Technical Documentation

---

## 1. Überblick / Overview

### 1.1 Zweck / Purpose

Das AI-Plausibilitätsprüfungs-Modul bietet eine **lokale, regel-basierte Validierung** medizinischer Anamnese-Daten. Es erkennt:
- Inkonsistenzen in den Eingaben
- Medizinische Konflikte (z.B. Medikation vs. Allergien)
- Unplausible Wertebereiche
- Fehlende erforderliche Daten

### 1.2 Architektur / Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Browser (Nutzer)                       │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │          HTML Form (Anamnese-Eingabe)            │  │
│  └──────────────────┬───────────────────────────────┘  │
│                     │                                   │
│                     ▼                                   │
│  ┌──────────────────────────────────────────────────┐  │
│  │   ai-plausibility-check.js (Lokal im Browser)    │  │
│  │                                                   │  │
│  │  ┌─────────────────────────────────────────┐    │  │
│  │  │  Rule-Based Validation Engine           │    │  │
│  │  │  - Basic Checks                         │    │  │
│  │  │  - Medical Logic Checks                 │    │  │
│  │  │  - Statistical Checks                   │    │  │
│  │  └─────────────────────────────────────────┘    │  │
│  │                                                   │  │
│  │  ┌─────────────────────────────────────────┐    │  │
│  │  │  Audit Logging                          │    │  │
│  │  │  (Pseudonymisiert)                      │    │  │
│  │  └─────────────────────────────────────────┘    │  │
│  │                                                   │  │
│  │  ┌─────────────────────────────────────────┐    │  │
│  │  │  External API Blocker                   │    │  │
│  │  │  (OpenAI, Google, etc. blockiert)       │    │  │
│  │  └─────────────────────────────────────────┘    │  │
│  └──────────────────┬───────────────────────────────┘  │
│                     │                                   │
│                     ▼                                   │
│  ┌──────────────────────────────────────────────────┐  │
│  │           localStorage (Lokal)                   │  │
│  │  - Audit Logs (pseudonymisiert)                  │  │
│  │  - Config                                        │  │
│  │  - Cached Results                                │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  ❌ KEINE Verbindung zu externen Servern ❌             │
└─────────────────────────────────────────────────────────┘
```

### 1.3 Datenschutz-Prinzipien / Privacy Principles

1. **100% Lokal**: Alle Verarbeitungen im Browser
2. **Keine externe Kommunikation**: Blockierung externer APIs
3. **Pseudonymisierung**: Logs ohne personenbezogene Daten
4. **Transparent**: Open Source, nachvollziehbare Regeln
5. **Nutzerkontrolle**: Vollständige Kontrolle über Daten

---

## 2. Installation und Integration / Installation and Integration

### 2.1 Einbindung in HTML / HTML Integration

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Medizinische Anamnese</title>
</head>
<body>
    <!-- Anamnese-Formular -->
    <form id="anamneseForm">
        <!-- ... Formularfelder ... -->
    </form>
    
    <!-- AI-Modul einbinden -->
    <script src="ai-plausibility-check.js"></script>
    
    <!-- Nutzung -->
    <script>
        document.getElementById('anamneseForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Formulardaten sammeln
            const formData = getFormData();
            
            // Plausibilitätsprüfung durchführen
            const results = performPlausibilityCheck(formData);
            
            // Ergebnisse anzeigen
            displayResults(results);
        });
    </script>
</body>
</html>
```

### 2.2 Abhängigkeiten / Dependencies

**KEINE externen Abhängigkeiten!**

- ✅ Vanilla JavaScript (ES6+)
- ✅ Web Crypto API (Browser-nativ)
- ✅ localStorage API (Browser-nativ)
- ❌ Keine npm-Pakete
- ❌ Keine CDN-Ressourcen
- ❌ Keine externen Libraries

### 2.3 Browser-Kompatibilität / Browser Compatibility

| Browser | Mindestversion | Status |
|---------|----------------|--------|
| Chrome | 60+ | ✅ Vollständig unterstützt |
| Firefox | 60+ | ✅ Vollständig unterstützt |
| Safari | 11+ | ✅ Vollständig unterstützt |
| Edge | 79+ | ✅ Vollständig unterstützt |

**Erforderliche Browser-Features**:
- ES6+ (Arrow Functions, Promises, async/await)
- localStorage
- Web Crypto API
- JSON

---

## 3. API-Referenz / API Reference

### 3.1 Hauptfunktionen / Main Functions

#### 3.1.1 `performPlausibilityCheck(formData)`

**Beschreibung**: Führt vollständige Plausibilitätsprüfung durch

**Parameter**:
```javascript
formData = {
    // Persönliche Daten
    firstName: "Max",
    lastName: "Mustermann",
    dateOfBirth: "1985-03-15",
    gender: "male",
    
    // Medizinische Daten
    currentMedications: "Ibuprofen, Aspirin",
    allergies: "Penicillin",
    pastIllnesses: "Diabetes",
    weight: "75",
    height: "180",
    
    // ... weitere Felder
}
```

**Rückgabewert**:
```javascript
{
    timestamp: "2025-12-22T12:00:00.000Z",
    overallStatus: "valid" | "warning" | "invalid",
    
    warnings: [
        {
            field: "medications",
            type: "medication_interaction",
            message: "Blutgerinnungshemmer mit NSAIDs: Erhöhtes Blutungsrisiko",
            severity: "high"
        }
    ],
    
    errors: [
        {
            field: "pregnant",
            type: "gender_mismatch",
            message: "Schwangerschaft bei männlichem Geschlecht ist nicht plausibel",
            severity: "high"
        }
    ],
    
    recommendations: [
        {
            type: "minor_patient",
            message: "Patient ist minderjährig - Einwilligung der Erziehungsberechtigten erforderlich"
        }
    ],
    
    checksPerformed: ["basic_validation", "medical_logic", "statistical_analysis"]
}
```

**Beispiel**:
```javascript
const formData = getFormData();
const results = performPlausibilityCheck(formData);

if (results.overallStatus === 'invalid') {
    alert('Fehler gefunden: ' + results.errors.map(e => e.message).join('\n'));
} else if (results.overallStatus === 'warning') {
    console.warn('Warnungen:', results.warnings);
}
```

#### 3.1.2 `exportAIAuditLog()`

**Beschreibung**: Exportiert Audit-Log als JSON-Datei

**Parameter**: Keine

**Rückgabewert**: void (Datei-Download)

**Beispiel**:
```javascript
// Button-Click Handler
document.getElementById('exportAuditBtn').addEventListener('click', () => {
    exportAIAuditLog();
    // Downloads: AI-Audit-Log-2025-12-22.json
});
```

#### 3.1.3 `deleteAllAIData()`

**Beschreibung**: Löscht alle AI-bezogenen Daten (DSGVO Art. 17)

**Parameter**: Keine

**Rückgabewert**: Promise
```javascript
{
    success: true,
    message: "Alle AI-bezogenen Daten wurden gelöscht",
    deletedItems: ["audit_log", "config", "cached_results"]
}
```

**Beispiel**:
```javascript
async function handleDeletion() {
    if (confirm('Wirklich alle Daten löschen?')) {
        try {
            const result = await deleteAllAIData();
            console.log(result.message);
        } catch (error) {
            console.error('Fehler:', error.message);
        }
    }
}
```

### 3.2 Konfiguration / Configuration

#### 3.2.1 `AI_PLAUSIBILITY_CONFIG`

```javascript
const AI_PLAUSIBILITY_CONFIG = {
    // System-Status
    enabled: true,              // Modul aktiviert?
    offlineOnly: true,          // Nur offline (NICHT ändern!)
    
    // Logging
    auditLogging: true,         // Audit-Logging aktiviert?
    detailedLogging: false,     // Detaillierte Console-Logs?
    
    // Prüfungsebenen
    checkLevels: {
        basic: true,            // Basis-Checks
        medical: true,          // Medizinische Logik
        statistical: true       // Statistische Analysen
    },
    
    // Schwellenwerte
    thresholds: {
        minAge: 0,
        maxAge: 120,
        minWeight: 0.5,         // kg
        maxWeight: 500,         // kg
        minHeight: 30,          // cm
        maxHeight: 250          // cm
    }
};
```

**Anpassung**:
```javascript
// Schwellenwerte anpassen
AI_PLAUSIBILITY_CONFIG.thresholds.maxAge = 110;

// Prüfebene deaktivieren
AI_PLAUSIBILITY_CONFIG.checkLevels.statistical = false;

// Detaillierte Logs aktivieren (nur für Entwicklung!)
AI_PLAUSIBILITY_CONFIG.detailedLogging = true;
```

---

## 4. Prüfungslogik / Validation Logic

### 4.1 Basis-Prüfungen / Basic Checks

#### 4.1.1 Altersbereichsprüfung

```javascript
// Prüft: 0 <= Alter <= 120
if (age < 0 || age > 120) {
    errors.push({
        field: 'dateOfBirth',
        type: 'age_out_of_range',
        message: `Alter (${age}) liegt außerhalb des plausiblen Bereichs`,
        severity: 'high'
    });
}
```

#### 4.1.2 Geschlechtsspezifische Prüfungen

```javascript
// Schwangerschaft nur bei weiblichem Geschlecht
if (pregnant === 'yes' && gender === 'male') {
    errors.push({
        field: 'pregnant',
        type: 'gender_mismatch',
        message: 'Schwangerschaft bei männlichem Geschlecht ist nicht plausibel',
        severity: 'high'
    });
}
```

#### 4.1.3 BMI-Plausibilität

```javascript
// BMI = Gewicht(kg) / Größe(m)²
const bmi = weight / (height * height);

if (bmi < 12 || bmi > 60) {
    warnings.push({
        field: 'bmi',
        type: 'bmi_extreme',
        message: `BMI (${bmi.toFixed(1)}) liegt in einem extremen Bereich`,
        severity: 'high'
    });
}
```

### 4.2 Medizinische Logik-Prüfungen / Medical Logic Checks

#### 4.2.1 Medikations-Allergie-Konflikte

```javascript
// Beispiel: Penicillin-Allergie
const allergies = ["penicillin"];
const medications = ["amoxicillin"]; // Penicillin-Gruppe

if (allergies.includes("penicillin") && 
    medications.some(m => m.includes("penicillin") || m.includes("amoxicillin"))) {
    errors.push({
        field: 'medications',
        type: 'medication_allergy_conflict',
        message: 'Möglicher Konflikt: Medikation bei bekannter Allergie',
        severity: 'critical'
    });
}
```

#### 4.2.2 Medikamenten-Interaktionen

```javascript
// Beispiel: Marcumar + NSAIDs
const hasAnticoagulant = medications.some(m => 
    m.toLowerCase().includes('marcumar') || 
    m.toLowerCase().includes('warfarin')
);

const hasNSAID = medications.some(m => 
    m.toLowerCase().includes('ibuprofen') || 
    m.toLowerCase().includes('aspirin')
);

if (hasAnticoagulant && hasNSAID) {
    warnings.push({
        field: 'medications',
        type: 'medication_interaction',
        message: 'Blutgerinnungshemmer mit NSAIDs: Erhöhtes Blutungsrisiko',
        severity: 'high'
    });
}
```

#### 4.2.3 Diagnose-Alter-Konsistenz

```javascript
// Arthrose in jungem Alter ungewöhnlich
if (age < 30 && illnesses.includes('arthrose')) {
    warnings.push({
        field: 'pastIllnesses',
        type: 'age_diagnosis_unusual',
        message: 'Arthrose in jungem Alter ist ungewöhnlich',
        severity: 'medium'
    });
}
```

### 4.3 Statistische Prüfungen / Statistical Checks

#### 4.3.1 Ungewöhnliche Kombinationen

```javascript
// Viele Medikamente, aber keine Vorerkrankungen
const medCount = medications.length;
const hasIllnesses = pastIllnesses && pastIllnesses.length > 0;

if (medCount >= 3 && !hasIllnesses) {
    recommendations.push({
        type: 'data_consistency',
        message: 'Mehrere Medikamente ohne dokumentierte Vorerkrankungen'
    });
}
```

#### 4.3.2 Datenvollständigkeit

```javascript
// Essenzielle Felder prüfen
const essentialFields = ['firstName', 'lastName', 'dateOfBirth', 'gender'];
const missingFields = essentialFields.filter(field => !formData[field]);

if (missingFields.length > 0) {
    warnings.push({
        field: 'general',
        type: 'incomplete_essential_data',
        message: `Wesentliche Felder fehlen: ${missingFields.join(', ')}`,
        severity: 'medium'
    });
}
```

---

## 5. Datenschutz-Implementation / Privacy Implementation

### 5.1 Blockierung externer APIs / External API Blocking

```javascript
// Override der fetch-Funktion
const blockedDomains = [
    'openai.com',
    'api.openai.com',
    'anthropic.com',
    'googleapis.com',
    'azure.com',
    'amazonaws.com'
];

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
```

### 5.2 Pseudonymisierung / Pseudonymization

```javascript
function sanitizeForLogging(data) {
    const sanitized = {...data};
    
    // Entferne persönliche Identifikatoren
    const sensitiveFields = ['firstName', 'lastName', 'email', 'phone', 'address'];
    sensitiveFields.forEach(field => {
        if (sanitized[field]) {
            sanitized[field] = '***PSEUDONYMIZED***';
        }
    });
    
    return sanitized;
}
```

### 5.3 Audit-Logging / Audit Logging

```javascript
function logAIAccess(action, details = {}) {
    const entry = {
        id: generateAuditId(),
        timestamp: new Date().toISOString(),
        action: action,
        module: 'AI-Plausibility-Check',
        details: sanitizeForLogging(details),  // Pseudonymisiert!
        result: details.result || 'unknown',
        processingType: 'local-only',
        dataTransfer: 'none'
    };
    
    aiAuditLog.entries.push(entry);
    
    // Automatische Rotation (max. 1000 Einträge)
    if (aiAuditLog.entries.length > 1000) {
        aiAuditLog.entries.shift(); // FIFO
    }
    
    // Lokale Speicherung
    localStorage.setItem('ai_audit_log', JSON.stringify({
        entries: aiAuditLog.entries.slice(-1000),
        lastUpdate: new Date().toISOString()
    }));
}
```

---

## 6. Testing

### 6.1 Unit-Tests

```javascript
// Beispiel: Test für Altersbereichsprüfung
function testAgeValidation() {
    // Testfall 1: Gültiges Alter
    const result1 = performPlausibilityCheck({
        dateOfBirth: '1985-03-15' // ~40 Jahre
    });
    console.assert(result1.errors.length === 0, 'Test 1 failed');
    
    // Testfall 2: Alter zu hoch
    const result2 = performPlausibilityCheck({
        dateOfBirth: '1850-01-01' // >170 Jahre
    });
    console.assert(result2.errors.length > 0, 'Test 2 failed');
    console.assert(result2.errors[0].type === 'age_out_of_range', 'Test 2 failed');
    
    console.log('✅ Age validation tests passed');
}

testAgeValidation();
```

### 6.2 Integrationstests

```javascript
// Test: Vollständiger Workflow
async function testFullWorkflow() {
    // 1. Formular ausfüllen
    const formData = {
        firstName: 'Test',
        lastName: 'Patient',
        dateOfBirth: '1985-03-15',
        gender: 'male',
        currentMedications: 'Ibuprofen',
        allergies: 'Keine',
        weight: '75',
        height: '180'
    };
    
    // 2. Plausibilitätsprüfung
    const results = performPlausibilityCheck(formData);
    console.assert(results.overallStatus === 'valid', 'Status should be valid');
    
    // 3. Audit-Log prüfen
    const logEntry = aiAuditLog.entries[aiAuditLog.entries.length - 1];
    console.assert(logEntry.action === 'plausibility_check_completed', 'Log entry missing');
    
    // 4. Daten löschen
    const deleteResult = await deleteAllAIData();
    console.assert(deleteResult.success === true, 'Deletion failed');
    
    console.log('✅ Full workflow test passed');
}

testFullWorkflow();
```

### 6.3 Sicherheitstests

```javascript
// Test: Externe API blockiert?
function testExternalAPIBlocking() {
    try {
        fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST'
        });
        console.error('❌ External API not blocked!');
    } catch (error) {
        if (error.message.includes('DSGVO-Verstoß')) {
            console.log('✅ External API correctly blocked');
        } else {
            console.error('❌ Wrong error type');
        }
    }
}

testExternalAPIBlocking();
```

---

## 7. Performance

### 7.1 Benchmarks

```javascript
// Messung der Prüfzeit
function benchmarkPlausibilityCheck() {
    const formData = getSampleFormData();
    
    const start = performance.now();
    const results = performPlausibilityCheck(formData);
    const end = performance.now();
    
    console.log(`Prüfzeit: ${(end - start).toFixed(2)}ms`);
    console.log(`Prüfungen: ${results.checksPerformed.length}`);
    console.log(`Warnungen: ${results.warnings.length}`);
    console.log(`Fehler: ${results.errors.length}`);
}
```

**Erwartete Performance**:
- Typische Prüfzeit: < 10ms
- Max. Prüfzeit: < 50ms
- Memory: < 5MB

### 7.2 Optimierungen / Optimizations

1. **Lazy Evaluation**: Prüfungen stoppen bei kritischen Fehlern
2. **Caching**: Häufig geprüfte Werte cachen
3. **Keine Regex-Explosionen**: Einfache String-Operationen
4. **Minimale DOM-Zugriffe**: Daten im Memory halten

---

## 8. Fehlerbehandlung / Error Handling

### 8.1 Fehlertypen / Error Types

```javascript
try {
    const results = performPlausibilityCheck(formData);
} catch (error) {
    if (error.name === 'TypeError') {
        console.error('Ungültige Datenstruktur:', error);
    } else if (error.message.includes('DSGVO')) {
        console.error('Datenschutzverstoß:', error);
    } else {
        console.error('Unbekannter Fehler:', error);
    }
}
```

### 8.2 Graceful Degradation

```javascript
// Fallback bei Fehler
function safePerformPlausibilityCheck(formData) {
    try {
        return performPlausibilityCheck(formData);
    } catch (error) {
        console.error('Plausibilitätsprüfung fehlgeschlagen:', error);
        
        // Fallback: Leeres Ergebnis
        return {
            timestamp: new Date().toISOString(),
            overallStatus: 'unknown',
            warnings: [],
            errors: [{
                field: 'general',
                type: 'system_error',
                message: 'Plausibilitätsprüfung konnte nicht durchgeführt werden',
                severity: 'medium'
            }],
            recommendations: [],
            checksPerformed: []
        };
    }
}
```

---

## 9. Erweiterungen / Extensions

### 9.1 Eigene Prüfregeln hinzufügen / Add Custom Rules

```javascript
// Beispiel: Neue medizinische Regel
function checkCustomRule(formData, results) {
    // Beispiel: Raucher mit Herzproblemen
    if (formData.smoking === 'yes' && 
        formData.pastIllnesses && 
        formData.pastIllnesses.toLowerCase().includes('herz')) {
        
        results.recommendations.push({
            type: 'lifestyle_health_interaction',
            message: 'Rauchen und Herzerkrankungen: Dringend ärztliche Beratung empfohlen'
        });
    }
}

// In performMedicalLogicChecks() einbinden:
function performMedicalLogicChecks(formData, results) {
    // ... bestehende Prüfungen ...
    
    // Eigene Regel hinzufügen
    checkCustomRule(formData, results);
}
```

### 9.2 Neue Datenquellen / New Data Sources

```javascript
// Beispiel: Lab-Werte einbeziehen
function checkLabValues(formData, results) {
    if (formData.labValues) {
        const glucose = parseFloat(formData.labValues.glucose);
        
        if (glucose > 126) {
            results.warnings.push({
                field: 'labValues.glucose',
                type: 'abnormal_lab_value',
                message: 'Nüchtern-Glukose erhöht: Diabetes-Screening empfohlen',
                severity: 'high'
            });
        }
    }
}
```

---

## 10. Deployment

### 10.1 Produktiv-Checkliste / Production Checklist

```
□ DSFA durchgeführt und genehmigt
□ DSB konsultiert
□ Schulungen durchgeführt
□ Tests erfolgreich
□ Dokumentation vollständig
□ Audit-Logging funktioniert
□ Externe APIs blockiert
□ Löschfunktion getestet
□ Browser-Kompatibilität geprüft
□ Performance-Tests bestanden
□ Backup-Strategie definiert
□ Incident Response Plan erstellt
□ Kontakt-Informationen aktualisiert
```

### 10.2 Monitoring

```javascript
// Überwachung der Systemgesundheit
function monitorSystemHealth() {
    const health = {
        timestamp: new Date().toISOString(),
        moduleEnabled: AI_PLAUSIBILITY_CONFIG.enabled,
        logEntries: aiAuditLog.entries.length,
        lastCheck: aiAuditLog.entries[aiAuditLog.entries.length - 1]?.timestamp,
        externalAPIsBlocked: true, // Immer true
        version: '1.0.0'
    };
    
    console.log('System Health:', health);
    return health;
}

// Regelmäßige Überwachung
setInterval(monitorSystemHealth, 3600000); // Jede Stunde
```

---

## 11. Support und Wartung / Support and Maintenance

### 11.1 Häufige Probleme / Common Issues

**Problem**: Prüfung findet keine Fehler
**Lösung**: Überprüfe, ob `AI_PLAUSIBILITY_CONFIG.enabled = true`

**Problem**: Externe API-Blockierung funktioniert nicht
**Lösung**: Stelle sicher, dass `ai-plausibility-check.js` vor anderen Scripts geladen wird

**Problem**: Logs werden nicht gespeichert
**Lösung**: Prüfe localStorage-Quota (evtl. voll)

### 11.2 Updates

**Update-Prozess**:
1. DSFA überprüfen und aktualisieren
2. Neue Version testen
3. Dokumentation aktualisieren
4. Benutzer informieren
5. Rollout durchführen
6. Monitoring intensivieren

---

## 12. Lizenz und Credits / License and Credits

**Lizenz**: [Einzutragen]

**Entwickler**: DiggAi GmbH

**Datenschutz**: Vollständig DSGVO-konform

**Open Source**: Ja (Transparenz für Aufsichtsbehörden)

---

**Ende der technischen Dokumentation**

**Version**: 1.0.0
**Letzte Aktualisierung**: 2025-12-22
