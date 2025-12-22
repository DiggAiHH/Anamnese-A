# AI-Löschkonzept nach Art. 17 DSGVO
# AI Deletion Concept according to Art. 17 GDPR

**Recht auf Löschung ("Recht auf Vergessenwerden")**
**Right to Erasure ("Right to be Forgotten")**

---

## Dokumenten-Information / Document Information

- **Modul**: AI-Plausibilitätsprüfung (AI Plausibility Check)
- **Version**: 1.0.0
- **Datum**: 2025-12-22
- **Rechtsgrundlage**: DSGVO Art. 17, Art. 5 Abs. 1 lit. e
- **Standard**: BfDI-Orientierungshilfe Löschkonzepte

---

## 1. Zweck und Geltungsbereich / Purpose and Scope

### 1.1 Zweck / Purpose

Dieses Löschkonzept definiert:
- Welche Daten gelöscht werden müssen
- Wann eine Löschung erfolgt (Fristen)
- Wie die Löschung technisch umgesetzt wird
- Wie die Löschung dokumentiert wird
- Wie Betroffene ihr Löschrecht ausüben können

### 1.2 Geltungsbereich / Scope

Dieses Konzept gilt für alle durch das AI-Plausibilitätsprüfungs-Modul verarbeiteten Daten:
- Anamnese-Formulardaten
- AI-Prüfergebnisse
- Audit-Logs
- Trainingsdaten (falls vorhanden)
- Cache-Daten
- Konfigurationsdaten

---

## 2. Rechtliche Grundlagen / Legal Basis

### 2.1 Art. 17 DSGVO - Recht auf Löschung

Die betroffene Person hat das Recht, von dem Verantwortlichen zu verlangen, dass sie betreffende personenbezogene Daten unverzüglich gelöscht werden, wenn einer der folgenden Gründe zutrifft:

1. **Art. 17 Abs. 1 lit. a**: Daten nicht mehr notwendig für Zweck
2. **Art. 17 Abs. 1 lit. b**: Einwilligung widerrufen, keine andere Rechtsgrundlage
3. **Art. 17 Abs. 1 lit. c**: Widerspruch nach Art. 21 eingelegt
4. **Art. 17 Abs. 1 lit. d**: Daten unrechtmäßig verarbeitet
5. **Art. 17 Abs. 1 lit. e**: Löschung zur Erfüllung rechtlicher Verpflichtung
6. **Art. 17 Abs. 1 lit. f**: Daten wurden in Bezug auf Dienste der Informationsgesellschaft erhoben

### 2.2 Art. 5 Abs. 1 lit. e DSGVO - Speicherbegrenzung

Personenbezogene Daten dürfen nur so lange in einer Form gespeichert werden, die die Identifizierung der betroffenen Personen ermöglicht, wie es für die Zwecke, für die sie verarbeitet werden, erforderlich ist.

### 2.3 Ausnahmen von der Löschpflicht (Art. 17 Abs. 3 DSGVO)

Löschung ist nicht erforderlich, wenn Verarbeitung notwendig ist für:
- Ausübung des Rechts auf freie Meinungsäußerung und Information
- Erfüllung einer rechtlichen Verpflichtung
- Gründe des öffentlichen Interesses im Bereich der öffentlichen Gesundheit
- Archivzwecke im öffentlichen Interesse, wissenschaftliche oder historische Forschungszwecke
- Geltendmachung, Ausübung oder Verteidigung von Rechtsansprüchen

**Im Fall des AI-Moduls: KEINE AUSNAHMEN** - Betroffene können jederzeit vollständige Löschung verlangen.

---

## 3. Datenkategorien und Löschfristen / Data Categories and Deletion Periods

### 3.1 Übersicht Datenkategorien / Overview Data Categories

| Kategorie | Beschreibung | Standardfrist | Löschgrund | Priorität |
|-----------|--------------|---------------|------------|-----------|
| **Anamnese-Daten** | Persönliche und medizinische Daten | Bis Löschantrag | Betroffenenrecht | HOCH |
| **AI-Prüfergebnisse** | Plausibilitätsprüfungs-Ergebnisse | Mit Anamnese-Daten | Zweckbindung | HOCH |
| **Audit-Logs** | Protokollierung der Zugriffe | Max. 1000 Einträge (FIFO) | Speicherbegrenzung | MITTEL |
| **Cache-Daten** | Temporäre Zwischenspeicherung | Session-Ende | Technisch | NIEDRIG |
| **Verschlüsselungsschlüssel** | Sitzungsbasierte Schlüssel | Session-Ende | Sicherheit | HOCH |
| **Trainingsdaten** | Pseudonymisierte Trainingsdaten | Bis Löschantrag | Betroffenenrecht | HOCH |

### 3.2 Detaillierte Löschfristen / Detailed Deletion Periods

#### 3.2.1 Anamnese-Daten / Medical History Data

**Speicherort**: `localStorage` - Schlüssel: `anamneseData`, `anamneseData_encrypted`

**Löschfrist**: 
- Standard: Bis zur manuellen Löschung durch Nutzer
- Bei Löschantrag: Unverzüglich (sofort)
- Bei Einwilligungswiderruf: Unverzüglich (sofort)

**Löschmethode**: 
```javascript
localStorage.removeItem('anamneseData');
localStorage.removeItem('anamneseData_encrypted');
localStorage.removeItem('anamneseDraft');
```

#### 3.2.2 AI-Prüfergebnisse / AI Check Results

**Speicherort**: `localStorage` - Schlüssel: `ai_cached_results`

**Löschfrist**: 
- Automatisch mit Anamnese-Daten
- Separat bei Deaktivierung der AI-Funktion

**Löschmethode**:
```javascript
localStorage.removeItem('ai_cached_results');
```

#### 3.2.3 Audit-Logs / Audit Logs

**Speicherort**: `localStorage` - Schlüssel: `ai_audit_log`

**Löschfrist**: 
- Automatisch: Bei Überschreitung von 1000 Einträgen (FIFO)
- Manuell: Bei Löschantrag
- Empfohlen: Nach 12 Monaten vollständige Löschung

**Löschmethode**:
```javascript
localStorage.removeItem('ai_audit_log');
aiAuditLog.entries = [];
```

**Besonderheit**: 
- Logs werden pseudonymisiert gespeichert
- Keine direkten Personenbezüge in Logs
- Trotzdem bei Löschantrag zu löschen

#### 3.2.4 Cache-Daten / Cache Data

**Speicherort**: `sessionStorage`, Browser-Cache

**Löschfrist**: 
- Automatisch: Bei Browser-Schließung
- Manuell: Jederzeit durch Nutzer

**Löschmethode**:
```javascript
sessionStorage.clear();
// Browser-Cache: Nutzer-gesteuert
```

#### 3.2.5 Verschlüsselungsschlüssel / Encryption Keys

**Speicherort**: `sessionStorage` - Schlüssel: `encryptionKey`

**Löschfrist**: 
- Automatisch: Bei Browser-Schließung
- Sicherheit: Niemals persistent speichern

**Löschmethode**:
```javascript
sessionStorage.removeItem('encryptionKey');
```

**Sicherheitshinweis**: 
Master-Passwort-Hash bleibt in `localStorage`, aber ohne Schlüssel sind Daten nicht entschlüsselbar.

#### 3.2.6 Trainingsdaten (falls vorhanden) / Training Data

**Speicherort**: `localStorage` - Schlüssel: `ai_training_data`

**Löschfrist**: 
- Bei Löschantrag: Unverzüglich
- Automatisch: Bei Deaktivierung des AI-Moduls

**Löschmethode**:
```javascript
localStorage.removeItem('ai_training_data');
localStorage.removeItem('ai_training_metadata');
```

**Besonderheit**: 
- Trainingsdaten werden vor Speicherung pseudonymisiert
- Trotzdem bei Löschantrag vollständig zu löschen

---

## 4. Löschverfahren / Deletion Procedures

### 4.1 Vollständige Löschung / Complete Deletion

#### 4.1.1 Funktion `deleteAllAIData()`

**Implementierung**:
```javascript
function deleteAllAIData() {
    return new Promise((resolve, reject) => {
        try {
            // Liste aller zu löschenden Schlüssel
            const keysToDelete = [
                // Anamnese-Daten
                'anamneseData',
                'anamneseData_encrypted',
                'anamneseDraft',
                
                // AI-spezifisch
                'ai_audit_log',
                'ai_cached_results',
                'ai_plausibility_config',
                'ai_training_data',
                'ai_training_metadata',
                
                // Consent
                'ai_consent_records',
                
                // Config
                'ai_preferences'
            ];
            
            // Lösche alle Schlüssel
            keysToDelete.forEach(key => {
                localStorage.removeItem(key);
            });
            
            // Leere In-Memory-Strukturen
            aiAuditLog.entries = [];
            
            // Session-Daten löschen
            sessionStorage.clear();
            
            // Logging der Löschung
            const deletionRecord = {
                timestamp: new Date().toISOString(),
                action: 'complete_deletion',
                keysDeleted: keysToDelete.length,
                status: 'success'
            };
            
            // Temporäres Log für Nachweis (wird nach Export gelöscht)
            const tempLog = JSON.stringify(deletionRecord);
            
            resolve({
                success: true,
                message: 'Alle AI-bezogenen Daten wurden vollständig gelöscht',
                deletedItems: keysToDelete,
                deletionRecord: deletionRecord
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
```

#### 4.1.2 Nutzung / Usage

**Durch Betroffenen (UI)**:
```javascript
// Button-Click Handler
document.getElementById('deleteAllDataBtn').addEventListener('click', async () => {
    if (confirm('Wirklich ALLE Daten löschen? Diese Aktion kann nicht rückgängig gemacht werden!')) {
        try {
            const result = await deleteAllAIData();
            alert(result.message);
            // Optional: Löschnachweis generieren
            generateDeletionCertificate(result.deletionRecord);
        } catch (error) {
            alert('Fehler: ' + error.message);
        }
    }
});
```

**Durch Administrator**:
```javascript
// Console oder API
AIPlausibilityCheck.deleteAllAIData()
    .then(result => console.log('Gelöscht:', result))
    .catch(error => console.error('Fehler:', error));
```

### 4.2 Selektive Löschung / Selective Deletion

#### 4.2.1 Nur AI-Daten löschen, Anamnese behalten

```javascript
function deleteOnlyAIData() {
    const aiKeysToDelete = [
        'ai_audit_log',
        'ai_cached_results',
        'ai_plausibility_config',
        'ai_training_data',
        'ai_training_metadata',
        'ai_consent_records'
    ];
    
    aiKeysToDelete.forEach(key => {
        localStorage.removeItem(key);
    });
    
    return {
        success: true,
        message: 'AI-Daten gelöscht, Anamnese-Daten bleiben erhalten',
        deletedItems: aiKeysToDelete
    };
}
```

#### 4.2.2 Nur Audit-Logs löschen

```javascript
function deleteAuditLogs() {
    localStorage.removeItem('ai_audit_log');
    aiAuditLog.entries = [];
    
    return {
        success: true,
        message: 'Audit-Logs gelöscht'
    };
}
```

### 4.3 Automatische Löschung / Automatic Deletion

#### 4.3.1 Automatische Log-Rotation

```javascript
function logAIAccess(action, details = {}) {
    // ... (siehe ai-plausibility-check.js)
    
    // Automatische Löschung alter Einträge
    if (aiAuditLog.entries.length > aiAuditLog.maxEntries) {
        const deleted = aiAuditLog.entries.shift(); // FIFO
        console.log('Auto-deleted oldest log entry:', deleted.id);
    }
}
```

#### 4.3.2 Session-basierte Löschung

```javascript
// Bei Browser-Schließung automatisch
window.addEventListener('beforeunload', () => {
    // sessionStorage wird automatisch geleert
    // Temporäre Daten werden entfernt
    console.log('Session-Daten werden automatisch gelöscht');
});
```

---

## 5. Löschnachweis / Deletion Certificate

### 5.1 Generierung des Löschnachweises / Certificate Generation

```javascript
function generateDeletionCertificate(deletionRecord) {
    const certificate = {
        title: 'Löschnachweis / Deletion Certificate',
        system: 'Anamnese-AI-Plausibility-Check',
        version: '1.0.0',
        
        deletionDetails: {
            timestamp: deletionRecord.timestamp,
            requestedBy: 'user', // oder 'patient', 'administrator'
            reason: 'Art. 17 DSGVO - Recht auf Löschung',
            action: deletionRecord.action,
            itemsDeleted: deletionRecord.deletedItems || deletionRecord.keysDeleted,
            status: deletionRecord.status
        },
        
        dataCategories: [
            'Personenbezogene Daten',
            'Gesundheitsdaten',
            'AI-Prüfergebnisse',
            'Audit-Logs',
            'Cache-Daten'
        ],
        
        confirmation: {
            allDataDeleted: true,
            noBackupsRemaining: true,
            noThirdPartyTransfer: true,
            irreversible: true
        },
        
        legalBasis: 'DSGVO Art. 17 - Recht auf Löschung',
        
        issuer: {
            organization: 'Anamnese System',
            date: new Date().toISOString(),
            signature: 'System-generiert'
        }
    };
    
    // Export als JSON
    const blob = new Blob([JSON.stringify(certificate, null, 2)], {
        type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Loeschnachweis-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    return certificate;
}
```

### 5.2 Beispiel Löschnachweis / Example Certificate

```json
{
  "title": "Löschnachweis / Deletion Certificate",
  "system": "Anamnese-AI-Plausibility-Check",
  "version": "1.0.0",
  "deletionDetails": {
    "timestamp": "2025-12-22T12:00:00.000Z",
    "requestedBy": "user",
    "reason": "Art. 17 DSGVO - Recht auf Löschung",
    "action": "complete_deletion",
    "itemsDeleted": 10,
    "status": "success"
  },
  "dataCategories": [
    "Personenbezogene Daten",
    "Gesundheitsdaten",
    "AI-Prüfergebnisse",
    "Audit-Logs",
    "Cache-Daten"
  ],
  "confirmation": {
    "allDataDeleted": true,
    "noBackupsRemaining": true,
    "noThirdPartyTransfer": true,
    "irreversible": true
  },
  "legalBasis": "DSGVO Art. 17 - Recht auf Löschung",
  "issuer": {
    "organization": "Anamnese System",
    "date": "2025-12-22T12:00:00.000Z",
    "signature": "System-generiert"
  }
}
```

---

## 6. Prozess zur Ausübung des Löschrechts / Process for Exercising Right to Erasure

### 6.1 Antrag durch Betroffenen / Request by Data Subject

#### 6.1.1 Antragswege / Request Channels

1. **Self-Service (bevorzugt)**:
   - Betroffener löscht Daten selbst über UI
   - Funktion: "Alle meine Daten löschen"
   - Sofortige Ausführung

2. **E-Mail/Schriftlich**:
   - Antrag an Datenschutzbeauftragten
   - Identifikation erforderlich
   - Bearbeitungszeit: Unverzüglich, spätestens 1 Monat

3. **Mündlich**:
   - Bei persönlichem Kontakt
   - Dokumentation erforderlich
   - Bestätigung schriftlich

#### 6.1.2 Antragsprüfung / Request Verification

```
PRÜFSCHEMA:
1. Identität des Antragstellers verifizieren
2. Berechtigung prüfen (betroffene Person?)
3. Ausnahmen nach Art. 17 Abs. 3 DSGVO prüfen
   → Im AI-Modul: KEINE Ausnahmen
4. Löschung durchführen
5. Bestätigung an Betroffenen
```

### 6.2 Bearbeitungsfrist / Processing Time

**Gesetzliche Frist**: Unverzüglich, spätestens innerhalb eines Monats

**Im AI-Modul**: 
- Self-Service: Sofort
- Antrag über DSB: Innerhalb 3 Werktagen

### 6.3 Dokumentation / Documentation

Jeder Löschvorgang wird dokumentiert:
- Datum und Uhrzeit
- Antragsteller (anonymisiert)
- Gelöschte Datenkategorien
- Löschmethode
- Bestätigung

---

## 7. Technische Umsetzung / Technical Implementation

### 7.1 Sichere Löschung / Secure Deletion

#### 7.1.1 localStorage-Löschung

```javascript
// Einfache Löschung (ausreichend für localStorage)
localStorage.removeItem(key);

// Alternative: Überschreiben vor Löschung
localStorage.setItem(key, '');
localStorage.removeItem(key);
```

**Hinweis**: `localStorage.removeItem()` ist für Browser-Speicher ausreichend. Eine Überschreibung mit Nullen ist nicht nötig, da localStorage nicht persistent auf Disk geschrieben wird wie Dateien.

#### 7.1.2 In-Memory-Daten

```javascript
// Objekte leeren
aiAuditLog.entries = [];

// Referenzen entfernen
let sensitiveData = null;

// Garbage Collection
// (automatisch durch JavaScript)
```

#### 7.1.3 Verschlüsselte Daten

```javascript
// Schlüssel löschen
sessionStorage.removeItem('encryptionKey');

// Verschlüsselte Daten sind ohne Schlüssel nicht lesbar
// Trotzdem löschen für vollständige Entfernung
localStorage.removeItem('anamneseData_encrypted');
```

### 7.2 Verifizierung der Löschung / Verification of Deletion

```javascript
function verifyDeletion() {
    const keysToCheck = [
        'anamneseData',
        'anamneseData_encrypted',
        'ai_audit_log',
        'ai_cached_results',
        'ai_plausibility_config',
        'ai_training_data'
    ];
    
    const remainingKeys = [];
    
    keysToCheck.forEach(key => {
        if (localStorage.getItem(key) !== null) {
            remainingKeys.push(key);
        }
    });
    
    if (remainingKeys.length === 0) {
        return {
            success: true,
            message: 'Alle Daten erfolgreich gelöscht',
            remainingKeys: []
        };
    } else {
        return {
            success: false,
            message: 'Einige Daten wurden nicht gelöscht',
            remainingKeys: remainingKeys
        };
    }
}
```

---

## 8. Restrisiken und Hinweise / Residual Risks and Notes

### 8.1 Browser-Cache / Browser Cache

**Risiko**: Browser kann Daten cachen

**Mitigation**:
- Nutzer sollte Browser-Cache manuell leeren
- In Anleitung dokumentieren
- Privacy-Mode empfehlen

**Anleitung für Nutzer**:
```
Chrome: Strg+Shift+Entf → "Gesamter Zeitraum" → "Bilder und Dateien im Cache"
Firefox: Strg+Shift+Entf → "Alles" → "Cache"
Safari: Safari → Verlauf löschen → "Gesamten Verlauf"
```

### 8.2 Backups / Backups

**Risiko**: Nutzer hat manuell Backups erstellt

**Mitigation**:
- Keine automatischen Backups durch System
- Nutzer ist für eigene Backups verantwortlich
- Bei Löschantrag auch Backups löschen lassen

**Hinweis**: System erstellt KEINE automatischen Cloud-Backups!

### 8.3 Browser-Fingerprinting / Browser Fingerprinting

**Risiko**: Browser-Fingerprinting könnte Nutzer wiedererkennen

**Mitigation**:
- System nutzt kein Fingerprinting
- Keine Tracking-Mechanismen
- Vollständig lokal

### 8.4 Forensische Wiederherstellung / Forensic Recovery

**Risiko**: Mit speziellen Tools könnten Daten wiederhergestellt werden

**Realität**: 
- localStorage ist nicht persistent wie Festplatten-Dateien
- Wiederherstellung sehr unwahrscheinlich
- Würde physischen Zugriff auf Gerät erfordern

**Empfehlung**: Bei höchsten Sicherheitsanforderungen:
- Vollständige Neuinstallation des Browsers
- Oder Verwendung von Privacy-Mode

---

## 9. Schulung und Bewusstsein / Training and Awareness

### 9.1 Schulung für medizinisches Personal / Training for Medical Staff

**Inhalte**:
- Löschrecht der Patienten
- Wie Löschung durchgeführt wird
- Dokumentationspflichten
- Fristen

**Frequenz**: Jährlich + bei Einführung

### 9.2 Information für Patienten / Information for Patients

**Informationsmaterial**:
- Flyer: "Ihr Recht auf Löschung"
- Website-Information
- Datenschutzerklärung
- FAQ

**Inhalt**:
```
Sie haben das Recht auf Löschung Ihrer Daten!

1. Wie lösche ich meine Daten?
   → Klicken Sie auf "Alle Daten löschen"
   
2. Was wird gelöscht?
   → Alle Ihre medizinischen Daten und AI-Auswertungen
   
3. Ist die Löschung endgültig?
   → Ja, nicht umkehrbar!
   
4. Bekomme ich eine Bestätigung?
   → Ja, Löschnachweis wird automatisch erstellt
```

---

## 10. Compliance und Überwachung / Compliance and Monitoring

### 10.1 Regelmäßige Überprüfung / Regular Review

**Frequenz**: Vierteljährlich

**Prüfpunkte**:
- Funktionieren alle Löschfunktionen?
- Werden Fristen eingehalten?
- Dokumentation vollständig?
- Beschwerden von Betroffenen?

### 10.2 Metriken / Metrics

**Zu erfassen**:
- Anzahl Löschanträge pro Monat
- Durchschnittliche Bearbeitungszeit
- Erfolgsquote (vollständige Löschung)
- Beschwerden/Probleme

### 10.3 Kontinuierliche Verbesserung / Continuous Improvement

**Maßnahmen**:
- Feedback von Nutzern einholen
- Technische Verbesserungen
- Prozessoptimierung
- Schulungsinhalte aktualisieren

---

## 11. Kontakt und Verantwortlichkeiten / Contact and Responsibilities

### 11.1 Datenschutzbeauftragter / Data Protection Officer

**Verantwortlich für**:
- Beratung bei Löschanträgen
- Überwachung der Einhaltung
- Schulungen
- Dokumentation

**Kontakt**:
- Name: [Einzutragen]
- E-Mail: [Einzutragen]
- Telefon: [Einzutragen]

### 11.2 IT-Administration / IT Administration

**Verantwortlich für**:
- Technische Umsetzung
- Wartung der Löschfunktionen
- Monitoring
- Support

### 11.3 Medizinisches Personal / Medical Staff

**Verantwortlich für**:
- Information der Patienten
- Entgegennahme von Löschanträgen
- Weiterleitung an DSB bei Bedarf
- Dokumentation

---

## 12. Anhänge / Appendices

### Anhang A: Checkliste für Löschung / Deletion Checklist

```
□ Identität des Antragstellers verifiziert
□ Berechtigung geprüft
□ Ausnahmen nach Art. 17 Abs. 3 DSGVO geprüft
□ Löschung durchgeführt mit deleteAllAIData()
□ Verifizierung mit verifyDeletion()
□ Löschnachweis generiert
□ Betroffenen informiert
□ Vorgang dokumentiert
□ Ggf. Backups gelöscht
□ Browser-Cache-Hinweis gegeben
```

### Anhang B: Muster-Antwort auf Löschantrag / Template Response

```
Betreff: Bestätigung der Datenlöschung gemäß Art. 17 DSGVO

Sehr geehrte/r [Name],

hiermit bestätigen wir die vollständige Löschung Ihrer personenbezogenen Daten 
aus dem Anamnese-AI-System gemäß Ihrem Antrag vom [Datum].

Gelöscht wurden:
- Alle Anamnese-Daten
- AI-Prüfergebnisse
- Audit-Logs
- Cache-Daten
- Trainingsdaten

Zeitpunkt der Löschung: [Datum, Uhrzeit]

Die Löschung ist endgültig und kann nicht rückgängig gemacht werden.

Im Anhang finden Sie einen detaillierten Löschnachweis.

Mit freundlichen Grüßen
[Verantwortlicher / Datenschutzbeauftragter]
```

### Anhang C: FAQ für Betroffene / FAQ for Data Subjects

**F: Wie lange dauert die Löschung?**
A: Sofort, wenn Sie selbst löschen. Innerhalb von 3 Werktagen bei Antrag.

**F: Kann ich gelöschte Daten wiederherstellen?**
A: Nein, Löschung ist endgültig.

**F: Werden auch Backups gelöscht?**
A: Das System erstellt keine automatischen Backups. Eigene Backups müssen Sie selbst löschen.

**F: Bekomme ich eine Bestätigung?**
A: Ja, automatisch generierter Löschnachweis.

**F: Kostet die Löschung etwas?**
A: Nein, das Recht auf Löschung ist kostenfrei.

---

## 13. Änderungshistorie / Change History

| Version | Datum | Änderung | Autor |
|---------|-------|----------|-------|
| 1.0.0 | 2025-12-22 | Initiale Erstellung | System |
| | | | |

---

## 14. Genehmigung / Approval

**Erstellt von** / Created by:
- Funktion: Development
- Datum: 2025-12-22

**Geprüft von** / Reviewed by:
- Funktion: Datenschutzbeauftragter (DSB)
- Datum: [Ausstehend]

**Genehmigt von** / Approved by:
- Funktion: Geschäftsführung
- Datum: [Ausstehend]

---

**Ende des Löschkonzepts**

**End of Deletion Concept**

---

*Dieses Dokument ist Teil des Datenschutz-Management-Systems und wird jährlich überprüft.*

*This document is part of the Data Protection Management System and is reviewed annually.*
