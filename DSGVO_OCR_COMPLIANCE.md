# DSGVO-Konformität: OCR-Engine Datenschutz-Dokumentation

## Überblick

Diese Dokumentation beschreibt die datenschutzrechtlichen Maßnahmen und technischen Garantien für die OCR-Engine (Optical Character Recognition) gemäß der Datenschutz-Grundverordnung (DSGVO).

**Status:** ✅ DSGVO-konform  
**Letzte Aktualisierung:** 2025-12-22  
**Rechtsgrundlage:** Art. 6 Abs. 1 lit. a DSGVO (Einwilligung), Art. 9 Abs. 2 lit. a DSGVO (Gesundheitsdaten)

---

## 1. Garantien & Technische Maßnahmen

### 1.1 Lokale Datenverarbeitung (Art. 32 DSGVO)

**Garantie:** Alle OCR-Verarbeitungsprozesse erfolgen **ausschließlich lokal** im Browser des Nutzers.

#### Technische Umsetzung:
- **OCR-Engine:** Tesseract.js (Browser-basiert)
- **Verarbeitungsort:** Client-seitig (JavaScript im Browser)
- **Keine Cloud-API-Aufrufe:** Kein Upload zu externen OCR-Diensten (Google Vision API, AWS Textract, etc.)
- **Keine Netzwerk-Kommunikation:** Bilddaten verlassen niemals das Gerät des Nutzers

#### Technische Nachweisbarkeit:
```javascript
// OCR wird vollständig lokal ausgeführt
async function performOCR(file) {
    // Tesseract.js läuft im Browser - keine API-Calls
    const result = await Tesseract.recognize(file, 'deu', { /* config */ });
    // Audit-Logging der lokalen Verarbeitung
    logOCROperation('ocr_completed', file.name, 'local_processing');
    return result.data.text;
}
```

### 1.2 Ausschluss externer Dienste

**Explizit ausgeschlossen:**
- ❌ Google Cloud Vision API
- ❌ AWS Textract
- ❌ Microsoft Azure Computer Vision
- ❌ Jegliche Cloud-basierte OCR-Services
- ❌ Externe APIs oder Upload-Endpunkte

**Begründung:** Art. 44-50 DSGVO (Drittlandtransfer) - Um Datentransfers in Drittländer und die damit verbundenen rechtlichen Risiken zu vermeiden, erfolgt die gesamte Verarbeitung lokal.

---

## 2. Datenschutz-Benachrichtigung beim Upload (Art. 13 DSGVO)

### 2.1 Informationspflichten

Vor jedem OCR-Upload wird der Nutzer über folgende Punkte informiert:

#### Pflichtinformationen gemäß Art. 13 DSGVO:
1. **Verantwortlicher:** Arztpraxis (jeweilige Praxis)
2. **Verarbeitungszweck:** Digitalisierung und Integration medizinischer Dokumente in die Patientenakte
3. **Rechtsgrundlage:** Art. 6 Abs. 1 lit. a DSGVO (Einwilligung), Art. 9 Abs. 2 lit. a DSGVO (Gesundheitsdaten)
4. **Speicherdauer:** Bis zur aktiven Löschung durch den Nutzer oder nach Abschluss der Behandlung
5. **Empfänger:** Keine externen Empfänger - Daten verbleiben lokal
6. **Betroffenenrechte:**
   - Auskunftsrecht (Art. 15 DSGVO)
   - Berichtigungsrecht (Art. 16 DSGVO)
   - **Löschungsrecht (Art. 17 DSGVO)**
   - Einschränkung der Verarbeitung (Art. 18 DSGVO)
   - Datenübertragbarkeit (Art. 20 DSGVO)
   - Widerspruchsrecht (Art. 21 DSGVO)
7. **Widerrufsrecht:** Jederzeit widerrufbar (Art. 7 Abs. 3 DSGVO)
8. **Beschwerderecht:** Bei zuständiger Datenschutz-Aufsichtsbehörde (Art. 77 DSGVO)

### 2.2 Einwilligungsdialog

Der Einwilligungsdialog erscheint **vor** dem ersten OCR-Upload und enthält:

```
┌─────────────────────────────────────────────────────┐
│ 🔒 Datenschutz-Hinweis: Dokumenten-Upload           │
├─────────────────────────────────────────────────────┤
│                                                      │
│ Sie sind dabei, medizinische Dokumente hochzuladen. │
│                                                      │
│ ✓ Alle Daten werden lokal auf Ihrem Gerät           │
│   verarbeitet (keine Cloud-Upload)                  │
│ ✓ OCR-Texterkennung erfolgt im Browser              │
│ ✓ Keine Übertragung an externe Server               │
│                                                      │
│ Die hochgeladenen Dokumente enthalten sensible      │
│ Gesundheitsdaten (Art. 9 DSGVO). Sie können Ihre    │
│ Daten jederzeit löschen (Art. 17 DSGVO).            │
│                                                      │
│ [Mehr Informationen] [Abbrechen] [Zustimmen]        │
└─────────────────────────────────────────────────────┘
```

---

## 3. Access Logging & Audit-Trail (Art. 30, 32 DSGVO)

### 3.1 Verarbeitungsverzeichnis

Alle OCR-Vorgänge werden in einem Audit-Log erfasst:

#### Protokollierte Daten:
```javascript
{
    "id": "OCR-LOG-1703267890123-abc123",
    "timestamp": "2025-12-22T10:15:30.123Z",
    "action": "ocr_started | ocr_completed | ocr_failed",
    "filename": "rezept_2025.jpg",
    "fileSize": 245678,
    "fileType": "image/jpeg",
    "processingType": "ocr",
    "processingLocation": "local_browser",
    "textLength": 1234,
    "userId": "PATIENT-12345",  // Pseudonymisiert
    "userAgent": "Mozilla/5.0...",
    "language": "deu",
    "success": true,
    "errorMessage": null,
    "metadata": {
        "imageWidth": 1920,
        "imageHeight": 1080,
        "imageFormat": "jpeg"
    }
}
```

#### Gespeicherte Ereignisse:
- `ocr_started`: OCR-Prozess gestartet
- `ocr_completed`: OCR erfolgreich abgeschlossen
- `ocr_failed`: OCR-Fehler
- `document_uploaded`: Dokument hochgeladen
- `document_viewed`: Dokument angezeigt
- `document_deleted`: Dokument gelöscht
- `all_documents_deleted`: Alle Dokumente gelöscht
- `consent_given`: Einwilligung erteilt
- `consent_withdrawn`: Einwilligung widerrufen

### 3.2 Zugriff auf Audit-Logs

Audit-Logs können von berechtigten Personen (Datenschutzbeauftragter, Praxisinhaber) eingesehen werden:

```javascript
// Alle OCR-Logs abrufen
const logs = OCR_AUDIT.getAllLogs();

// Logs nach Zeitraum filtern
const recentLogs = OCR_AUDIT.getLogsByDateRange('2025-01-01', '2025-12-31');

// Logs exportieren für DSB-Prüfung
const auditReport = OCR_AUDIT.generateAuditReport();
```

### 3.3 Log-Retention Policy

**Speicherdauer:** Audit-Logs werden für **3 Jahre** aufbewahrt (gemäß § 630f BGB - Dokumentationspflicht).

**Löschung:** Nach Ablauf der Aufbewahrungsfrist oder auf ausdrücklichen Wunsch des Patienten (Art. 17 DSGVO).

---

## 4. Recht auf Vergessenwerden (Art. 17 DSGVO)

### 4.1 Löschfunktionalität

Patienten können ihre OCR-Daten jederzeit vollständig löschen:

#### Verfügbare Löschoptionen:
1. **Einzelnes Dokument löschen:** Löscht ein spezifisches hochgeladenes Dokument
2. **Alle Dokumente löschen:** Löscht alle hochgeladenen Dokumente auf einmal
3. **Vollständige Datenlöschung:** Löscht alle Dokumente + Audit-Logs + Metadaten

#### Technische Implementierung:
```javascript
// Einzelnes Dokument löschen
function deleteDocument(documentId) {
    // 1. Dokument aus Storage entfernen
    DOCUMENT_STORAGE.documents = DOCUMENT_STORAGE.documents.filter(
        doc => doc.id !== documentId
    );
    
    // 2. Audit-Log-Eintrag erstellen
    logOCROperation('document_deleted', documentId, 'user_request');
    
    // 3. LocalStorage aktualisieren
    localStorage.removeItem(`ocr_document_${documentId}`);
    
    // 4. Bestätigung an Nutzer
    return { success: true, message: 'Dokument gelöscht' };
}

// Alle Dokumente löschen
function deleteAllDocuments() {
    const count = DOCUMENT_STORAGE.documents.length;
    
    // 1. Alle Dokumente entfernen
    DOCUMENT_STORAGE.documents = [];
    
    // 2. Audit-Log
    logOCROperation('all_documents_deleted', `${count} documents`, 'user_request');
    
    // 3. LocalStorage bereinigen
    clearOCRDataFromStorage();
    
    return { success: true, deletedCount: count };
}
```

### 4.2 Überprüfung der Löschung

Nach der Löschung wird überprüft, dass keine Restdaten vorhanden sind:

```javascript
function verifyCompleteDeletion() {
    // Prüfe DOCUMENT_STORAGE
    const docsRemaining = DOCUMENT_STORAGE.documents.length;
    
    // Prüfe LocalStorage
    const storageKeys = Object.keys(localStorage).filter(key => 
        key.startsWith('ocr_') || key.startsWith('document_')
    );
    
    // Prüfe SessionStorage
    const sessionKeys = Object.keys(sessionStorage).filter(key =>
        key.startsWith('ocr_') || key.startsWith('document_')
    );
    
    return {
        complete: docsRemaining === 0 && storageKeys.length === 0 && sessionKeys.length === 0,
        details: {
            documentsRemaining: docsRemaining,
            localStorageKeys: storageKeys.length,
            sessionStorageKeys: sessionKeys.length
        }
    };
}
```

### 4.3 Löschbestätigung an Nutzer

Nach erfolgreicher Löschung erhält der Nutzer eine Bestätigung:

```
┌─────────────────────────────────────────────────────┐
│ ✓ Löschung erfolgreich                               │
├─────────────────────────────────────────────────────┤
│                                                      │
│ Alle Ihre OCR-Daten wurden vollständig gelöscht:    │
│                                                      │
│ ✓ 5 Dokumente entfernt                              │
│ ✓ Metadaten gelöscht                                │
│ ✓ Texte aus Speicher entfernt                       │
│                                                      │
│ Audit-Hinweis: Die Löschung wurde protokolliert.    │
│                                                      │
│ [OK]                                                 │
└─────────────────────────────────────────────────────┘
```

---

## 5. Speicherkonzept (DSB-Prüfung)

### 5.1 Datenspeicherung

#### Speicherorte:
1. **Browser LocalStorage:**
   - Verschlüsselte Dokument-Texte
   - Metadaten (Dateiname, Zeitstempel, Typ)
   - Verschlüsselt mit AES-256-GCM

2. **In-Memory (DOCUMENT_STORAGE):**
   - Aktuelle Sitzung
   - Wird beim Schließen des Browsers gelöscht

3. **Keine Server-Speicherung:**
   - Keine Datenbank
   - Keine Cloud-Speicher
   - Keine Backups auf externen Servern

#### Verschlüsselung:
- **Algorithmus:** AES-256-GCM (Web Crypto API)
- **Key Derivation:** PBKDF2 mit 100.000 Iterationen
- **Schlüsselverwaltung:** Nutzer-definiertes Master-Passwort
- **Keine Schlüssel-Speicherung:** Schlüssel nur in Session, nie persistent

### 5.2 Aufbewahrungsfristen

| Datentyp | Aufbewahrungsfrist | Rechtsgrundlage |
|----------|-------------------|-----------------|
| OCR-Texte | Bis zur Löschung durch Nutzer | Art. 6 Abs. 1 lit. a DSGVO |
| Dokument-Metadaten | Bis zur Löschung durch Nutzer | Art. 6 Abs. 1 lit. a DSGVO |
| Audit-Logs | 3 Jahre | § 630f BGB |
| Einwilligungsnachweise | 3 Jahre nach Widerruf | Art. 7 Abs. 1 DSGVO |

**Keine unbefristete Vorhaltung:** Personenbezogene Bilddaten werden nicht länger als erforderlich gespeichert.

### 5.3 Datenlöschungskonzept

#### Automatische Löschung:
- Nach 24 Stunden Inaktivität (SessionStorage wird geleert)
- Beim Schließen des Browsers (In-Memory-Daten)

#### Manuelle Löschung:
- Jederzeit durch Nutzer über UI
- Auf Anfrage durch Praxis-Mitarbeiter
- Durch Datenschutzbeauftragten bei berechtigtem Interesse

#### Technische Löschung:
```javascript
// Vollständige Löschung aller OCR-Daten
function performCompleteDeletion() {
    // 1. In-Memory
    DOCUMENT_STORAGE.documents = [];
    OCR_AUDIT.logs = [];
    
    // 2. LocalStorage
    const keysToRemove = Object.keys(localStorage).filter(key =>
        key.startsWith('ocr_') || 
        key.startsWith('document_') ||
        key.startsWith('ocrAudit_')
    );
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    // 3. SessionStorage
    const sessionKeys = Object.keys(sessionStorage).filter(key =>
        key.startsWith('ocr_') || key.startsWith('document_')
    );
    sessionKeys.forEach(key => sessionStorage.removeItem(key));
    
    // 4. Audit-Log
    logOCROperation('complete_deletion', 'all_data', 'gdpr_art17_request');
    
    return verifyCompleteDeletion();
}
```

---

## 6. Technische und Organisatorische Maßnahmen (Art. 32 DSGVO)

### 6.1 Technische Maßnahmen

#### Vertraulichkeit (Art. 32 Abs. 1 lit. b DSGVO):
- ✅ AES-256-GCM Verschlüsselung
- ✅ PBKDF2 Key Derivation (100.000 Iterationen)
- ✅ Keine persistente Schlüssel-Speicherung
- ✅ Content Security Policy (CSP)
- ✅ Input Sanitization gegen XSS

#### Integrität (Art. 32 Abs. 1 lit. b DSGVO):
- ✅ GCM-Modus für authentifizierte Verschlüsselung
- ✅ Hash-Verifikation der OCR-Daten
- ✅ Audit-Logging aller Änderungen

#### Verfügbarkeit (Art. 32 Abs. 1 lit. b DSGVO):
- ✅ Offline-fähig (keine Abhängigkeit von externen Diensten)
- ✅ Lokale Speicherung (keine Server-Ausfälle)
- ✅ Browser-Storage-Backup-Mechanismus

#### Belastbarkeit (Art. 32 Abs. 1 lit. b DSGVO):
- ✅ Fehlerbehandlung bei OCR-Fehlern
- ✅ Fallback-Mechanismen
- ✅ Validierung der Eingabedaten

### 6.2 Organisatorische Maßnahmen

#### Zugriffskontrolle:
- Nur autorisierte Praxismitarbeiter haben Zugriff auf die Anwendung
- Passwortschutz für Export-Funktionen
- Audit-Logging aller Zugriffe

#### Schulung:
- Praxismitarbeiter werden in DSGVO-konformer Nutzung geschult
- Dokumentation der Schulungen

#### Datenschutz-Folgenabschätzung (DSFA):
- Bei Bedarf wird eine DSFA durchgeführt (Art. 35 DSGVO)
- Risikobewertung der OCR-Verarbeitung

---

## 7. Compliance-Checkliste

### Für Datenschutzbeauftragte (DSB)

- [x] **Art. 13 DSGVO:** Informationspflichten umgesetzt (Datenschutz-Hinweis)
- [x] **Art. 17 DSGVO:** Löschungsrecht implementiert und getestet
- [x] **Art. 30 DSGVO:** Verarbeitungsverzeichnis (Audit-Logs)
- [x] **Art. 32 DSGVO:** Technische Maßnahmen dokumentiert
- [x] **Art. 44-50 DSGVO:** Kein Drittlandtransfer (alles lokal)
- [x] **§ 630f BGB:** Dokumentationspflicht erfüllt (3 Jahre Aufbewahrung)
- [x] **Keine Cloud-APIs:** Explizit ausgeschlossen
- [x] **Verschlüsselung:** AES-256-GCM implementiert
- [x] **Einwilligungsdialog:** Vor jedem Upload

### Für Praxisinhaber

- [x] Keine externen Kosten für OCR-Dienste
- [x] Keine Datenschutz-Risiken durch Cloud-Provider
- [x] Vollständige Kontrolle über Patientendaten
- [x] Audit-Trail für Nachweispflichten
- [x] Einfache Löschung bei Patientenwunsch

---

## 8. Kontakt & Support

**Bei Fragen zur DSGVO-Konformität:**
- Datenschutzbeauftragter der Praxis
- Technischer Support: [Support-Kontakt]

**Bei Ausübung von Betroffenenrechten:**
- Art. 15 DSGVO (Auskunft): Anfrage an Praxis
- Art. 17 DSGVO (Löschung): Über UI oder Anfrage an Praxis
- Art. 77 DSGVO (Beschwerde): Zuständige Landesdatenschutzbehörde

---

## 9. Versionierung & Updates

| Version | Datum | Änderungen |
|---------|-------|-----------|
| 1.0 | 2025-12-22 | Initiale DSGVO-Dokumentation für OCR-Engine |

---

## 10. Rechtlicher Hinweis

Diese Dokumentation wurde nach bestem Wissen und Gewissen erstellt. Sie ersetzt keine individuelle rechtliche Beratung. Praxen sollten ihre Datenschutz-Maßnahmen mit einem Datenschutzbeauftragten oder Fachanwalt für IT-Recht abstimmen.

**Stand:** Dezember 2025  
**Gültigkeit:** Diese Dokumentation gilt für die OCR-Engine-Version ab 2.0
