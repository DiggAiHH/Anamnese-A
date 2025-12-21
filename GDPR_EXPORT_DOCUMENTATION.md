# GDT-Export: DSGVO-konforme Primärsystem-Schnittstelle

## Übersicht

Die GDT-Export-Schnittstelle ermöglicht den sicheren und DSGVO-konformen Export von medizinischen Anamnese-Daten im GDT-Format (GDT 3.0/3.1) für die Integration mit Praxisverwaltungssystemen wie Medatixx, CGM und Quincy.

## ✅ DSGVO-Compliance Features

### Datenschutz-Grundprinzipien

1. **Lokale Speicherung (Art. 5 DSGVO)**
   - Alle Daten werden ausschließlich lokal gespeichert
   - Kein Cloud-Transfer
   - Volle Kontrolle über Datenverarbeitung

2. **Pseudonymisierung (Art. 32 DSGVO)**
   - Automatische Pseudonymisierung von Patientenidentifikatoren
   - Optional: Export mit Klardaten (nur mit expliziter Einwilligung)
   - Konsistente Pseudonyme für Zuordnung

3. **Einwilligungsmanagement (Art. 6, 7 DSGVO)**
   - Explizite Einwilligung vor jedem Export
   - Dokumentation aller Einwilligungen
   - Widerrufsrecht jederzeit ausübbar
   - Granulare Einwilligungsoptionen

4. **Audit-Logging (Art. 30, 32 DSGVO)**
   - Umfassendes Logging aller Exporte
   - Nachvollziehbarkeit für Aufsichtsbehörden
   - Exportierbare Audit-Protokolle

5. **Datenschutz-Folgenabschätzung (Art. 35 DSGVO)**
   - Vorbereitete DSFA-Vorlage
   - Risikobewertung dokumentiert
   - Schutzmaßnahmen definiert

## 🔧 Technische Implementierung

### GDT-Format Konformität

Die Implementierung folgt der **KVB GDT-Spezifikation 3.1**:

- Korrekte Feldkennungen (FKK)
- GDT-Satzarten (Stammdaten 6301, Anamnese 6302, etc.)
- Windows-Zeilenenden (CRLF)
- ISO-8859-1 Zeichenkodierung
- Korrekte Längenfeldberechnung

### Unterstützte GDT-Felder

#### Patientenidentifikation
- `3000` - Patientennummer (pseudonymisiert oder Klartext)
- `3101` - Nachname
- `3102` - Vorname
- `3103` - Geburtsdatum (Format: TTMMJJJJ)
- `3110` - Geschlecht (1=männlich, 2=weiblich)

#### Adressdaten
- `3107` - Straße
- `3112` - PLZ
- `3106` - Ort
- `3622` - Telefon
- `3626` - E-Mail

#### Medizinische Daten
- `6200` - Anamnese
- `6205` - Diagnose
- `6210` - Medikation
- `6220` - Allergien
- `6300` - Befund

#### Metadaten
- `8418` - Erstellungsdatum (JJJJMMTT)
- `8419` - Erstellungszeit (HHMMSS)
- `0201` - Praxis-ID
- `0102` - Software-ID

## 📋 Verwendung

### 1. Export-Konfiguration

```javascript
// Konfiguration aktualisieren
updateGDTConfig({
    practiceId: 'PRAXIS-12345',
    pseudonymizeData: true,
    includeFullName: false,
    includeAddress: false,
    includeContactData: false
});
```

### 2. Einwilligung einholen

```javascript
// Einwilligung für Export anfordern
const patientId = 'PATIENT-001';
const consentTypes = [
    CONSENT_TYPES.DATA_EXPORT,
    CONSENT_TYPES.MEDICAL_HISTORY
];

const consent = await requestConsent(patientId, consentTypes);
```

### 3. GDT-Export durchführen

```javascript
// Form-Daten exportieren
const formData = getFormData();
const result = await exportGDT(formData, consent);

if (result.success) {
    console.log('Export erfolgreich:', result.filename);
} else {
    console.error('Export fehlgeschlagen:', result.message);
}
```

### 4. Audit-Log überprüfen

```javascript
// Audit-Log abrufen
const auditLog = getAuditLog(100);

// Audit-Log exportieren (für DSB)
exportAuditLog();
```

## 🔐 Sicherheitsmaßnahmen

### Technische Maßnahmen

1. **Verschlüsselung**
   - AES-256-GCM für gespeicherte Daten
   - PBKDF2 Key Derivation (100.000 Iterationen)
   - Sichere Schlüsselableitung aus Passwort

2. **Pseudonymisierung**
   - Hash-basierte Pseudonymisierung
   - Konsistente Pseudonyme für Zuordnung
   - Keine Rückverfolgbarkeit ohne Zuordnungstabelle

3. **Zugriffskontrolle**
   - File System Access API für sichere Dateioperationen
   - Keine automatischen Uploads
   - User-kontrollierte Speicherorte

4. **Audit-Logging**
   - Alle Exporte werden protokolliert
   - Zeitstempel, Benutzer, Konfiguration
   - Exportierbar für Aufsichtsbehörden

### Organisatorische Maßnahmen

1. **Schulung**
   - Personal muss in DSGVO-Anforderungen geschult sein
   - Umgang mit Einwilligungen muss bekannt sein
   - Regelmäßige Schulungen erforderlich

2. **Datenschutzbeauftragter**
   - DSB muss Implementierung prüfen
   - Feldmapping muss abgenommen werden
   - Log-Lösung muss abgestimmt sein

3. **Verarbeitungsverzeichnis**
   - Dokumentation nach § 30 DSGVO
   - Zwecke, Kategorien, Empfänger
   - Schutzmaßnahmen dokumentiert

## 📄 DSGVO-Dokumentation

### Verarbeitungsverzeichnis exportieren

```javascript
exportProcessingRecord();
```

Erzeugt eine JSON-Datei mit:
- Verantwortlicher (Controller)
- Verarbeitungszwecke
- Datenkategorien
- Empfänger
- Speicherdauer
- Technische und organisatorische Maßnahmen

### DSFA exportieren

```javascript
exportDPIATemplate();
```

Erzeugt eine Datenschutz-Folgenabschätzung mit:
- Beschreibung der Datenverarbeitung
- Risikobewertung
- Schutzmaßnahmen
- Restrisiko-Bewertung

### Einwilligungen dokumentieren

```javascript
const patientId = 'PATIENT-001';
exportConsentDocumentation(patientId);
```

Exportiert alle Einwilligungen eines Patienten mit:
- Zeitstempel
- Einwilligungstyp
- Status (erteilt/widerrufen)
- Details

## ⚖️ Rechtliche Anforderungen

### Vor Go-Live erforderlich

- [ ] **DSGVO-Konformität durch unabhängigen DSB prüfen**
- [ ] **Verarbeitungsverzeichnis erstellen und aktualisieren**
- [ ] **DSFA durchführen und dokumentieren**
- [ ] **Feldmapping mit DSB abstimmen**
- [ ] **Log-Lösung mit DSB abstimmen**
- [ ] **Personal schulen**
- [ ] **Einwilligungsvorlagen rechtlich prüfen**
- [ ] **Technische und organisatorische Maßnahmen dokumentieren**

### Praxiskonzept erforderlich

Kein Export personenbezogener Daten ohne explizites Praxiskonzept, das folgendes enthält:

1. **Zweckbestimmung**
   - Warum werden Daten exportiert?
   - Welche Daten sind erforderlich?
   - Rechtsgrundlage für Verarbeitung

2. **Berechtigungskonzept**
   - Wer darf Daten exportieren?
   - Wie wird Zugriff kontrolliert?
   - Vier-Augen-Prinzip?

3. **Datenschutz-Folgenabschätzung**
   - Risiken identifiziert
   - Schutzmaßnahmen definiert
   - Restrisiko akzeptabel

4. **Einwilligungsmanagement**
   - Wie werden Einwilligungen eingeholt?
   - Wie werden sie dokumentiert?
   - Wie kann Widerspruch erhoben werden?

## 🔍 Feldmapping-Dokumentation

### Personenbezogene Daten

| GDT-Feld | FKK  | Anamnese-Feld | Pseudonymisierung | Einwilligung erforderlich |
|----------|------|---------------|-------------------|---------------------------|
| Patientennummer | 3000 | Generiert | ✅ Standardmäßig | Nein |
| Nachname | 3101 | lastName | ❌ Optional | Ja (FULL_NAME) |
| Vorname | 3102 | firstName | ❌ Optional | Ja (FULL_NAME) |
| Geburtsdatum | 3103 | dateOfBirth | ❌ Nein | Ja (DATA_EXPORT) |
| Geschlecht | 3110 | gender | ❌ Nein | Ja (DATA_EXPORT) |

### Adressdaten

| GDT-Feld | FKK  | Anamnese-Feld | Einwilligung erforderlich |
|----------|------|---------------|---------------------------|
| Straße | 3107 | street | Ja (ADDRESS) |
| PLZ | 3112 | postalCode | Ja (ADDRESS) |
| Ort | 3106 | city | Ja (ADDRESS) |

### Kontaktdaten

| GDT-Feld | FKK  | Anamnese-Feld | Einwilligung erforderlich |
|----------|------|---------------|---------------------------|
| Telefon | 3622 | phone | Ja (CONTACT_DATA) |
| E-Mail | 3626 | email | Ja (CONTACT_DATA) |

### Medizinische Daten (Art. 9 DSGVO - besondere Kategorien)

| GDT-Feld | FKK  | Anamnese-Feld | Einwilligung erforderlich |
|----------|------|---------------|---------------------------|
| Anamnese | 6200 | currentComplaints | Ja (MEDICAL_HISTORY) |
| Befund | 6300 | pastIllnesses | Ja (MEDICAL_HISTORY) |
| Medikation | 6210 | currentMedications | Ja (MEDICAL_HISTORY) |
| Allergien | 6220 | allergies | Ja (MEDICAL_HISTORY) |

## 🔗 Integration mit Praxisverwaltungssystemen

### Medatixx

- GDT-Datei im konfigurierten Import-Ordner ablegen
- Dateiname-Konvention beachten
- Import über PVS-Funktion "GDT-Import"

### CGM

- GDT-Schnittstelle in CGM aktivieren
- Import-Verzeichnis konfigurieren
- Automatischer Import nach Dateiablage

### Quincy

- GDT-Modul in Quincy aktivieren
- Überwachungsordner einrichten
- Manuelle oder automatische Übernahme

## 📊 Audit-Log Format

Jeder Export wird protokolliert:

```json
{
  "timestamp": "2025-12-21T15:59:00.000Z",
  "action": "GDT_EXPORT",
  "filename": "GDT_1234567890_2025-12-21.gdt",
  "patientId": "1234567890",
  "pseudonymized": true,
  "consentGiven": true,
  "consentDetails": {
    "consents": {
      "data_export": true,
      "medical_history": true
    }
  },
  "exportConfig": {
    "includeFullName": false,
    "includeAddress": false,
    "includeContactData": false
  },
  "userAgent": "Mozilla/5.0...",
  "language": "de"
}
```

## ⚠️ Wichtige Hinweise

### Vor Produktiveinsatz

1. **DSB-Prüfung obligatorisch**
   - Unabhängiger Datenschutzbeauftragter muss Implementierung prüfen
   - Keine Inbetriebnahme ohne DSB-Freigabe

2. **Praxisindividuelle Anpassungen**
   - Praxis-ID muss konfiguriert werden
   - Feldmapping ggf. anpassen
   - Einwilligungsvorlagen anpassen

3. **Regelmäßige Überprüfung**
   - Jährliche DSFA-Überprüfung
   - Audit-Logs regelmäßig prüfen
   - Personal nachschulen

### Datenschutz-Kontakte

- **Datenschutzbeauftragter**: [Name und Kontakt einzutragen]
- **Aufsichtsbehörde**: Landesdatenschutzbeauftragte des jeweiligen Bundeslandes
- **Praxisverantwortlicher**: [Name und Kontakt einzutragen]

## 📚 Referenzen

### Rechtliche Grundlagen

- **DSGVO Art. 5**: Grundsätze der Datenverarbeitung
- **DSGVO Art. 6**: Rechtmäßigkeit der Verarbeitung
- **DSGVO Art. 7**: Bedingungen für die Einwilligung
- **DSGVO Art. 9**: Verarbeitung besonderer Kategorien personenbezogener Daten
- **DSGVO Art. 30**: Verzeichnis von Verarbeitungstätigkeiten
- **DSGVO Art. 32**: Sicherheit der Verarbeitung
- **DSGVO Art. 35**: Datenschutz-Folgenabschätzung

### Technische Standards

- **KVB GDT-Spezifikation 3.1**: Feldkennungen und Datenformate
- **ISO 27001**: Informationssicherheit
- **BSI IT-Grundschutz**: Sicherheitsmaßnahmen

### Weitere Dokumentation

- `gdt-export.js`: Technische Implementierung
- `gdpr-compliance.js`: DSGVO-Compliance Module
- `GDPR_EXPORT_DOCUMENTATION.md`: Diese Dokumentation

## 🏷️ Labels

**Must-have-Labels für Issue:**
- `datenschutz`
- `DSGVO`
- `privacy`
- `security`

## 📞 Support

Bei Fragen zur DSGVO-Konformität:
- Konsultieren Sie Ihren Datenschutzbeauftragten
- Kontaktieren Sie die zuständige Aufsichtsbehörde
- Ziehen Sie rechtlichen Rat hinzu

**WICHTIG**: Diese Implementierung ist ein Framework. Die finale DSGVO-Konformität muss durch einen qualifizierten Datenschutzbeauftragten für die jeweilige Praxis geprüft und bestätigt werden.
