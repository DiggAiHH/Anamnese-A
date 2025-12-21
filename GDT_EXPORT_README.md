# GDT-Export Implementation - Quick Start Guide

## 🚀 Schnellstart

### Export durchführen

1. **Formular ausfüllen**: Füllen Sie das Anamnese-Formular mit Patientendaten aus
2. **GDT-Export Button**: Klicken Sie auf "GDT-Export (DSGVO)"
3. **Konfiguration**: 
   - Geben Sie Ihre Praxis-ID ein
   - Wählen Sie Pseudonymisierung (empfohlen)
   - Wählen Sie welche Daten exportiert werden sollen
4. **Einwilligung**: Erteilen Sie die erforderlichen Einwilligungen
5. **Export**: Wählen Sie den Speicherort für die GDT-Datei

## 📁 Dateistruktur

```
Anamnese-A/
├── gdt-export.js              # Kern-GDT-Export-Modul
├── gdpr-compliance.js         # DSGVO-Compliance-Modul
├── gdt-export-ui.js           # UI-Integration
├── GDPR_EXPORT_DOCUMENTATION.md  # Umfassende Dokumentation
├── test-gdt-export.js         # Test-Suite
└── test-gdt-export.html       # Test-Interface
```

## ✅ Features

### GDT 3.0/3.1 Konformität
- ✅ Korrekte Feldkennungen (FKK)
- ✅ GDT-Satzarten (6301, 6302, etc.)
- ✅ CRLF-Zeilenenden
- ✅ ISO-8859-1 Zeichenkodierung
- ✅ Längenfeldberechnung

### DSGVO-Compliance (Art. 30, 32, 35)
- ✅ Pseudonymisierung von Patientendaten
- ✅ Granulares Einwilligungsmanagement
- ✅ Umfassendes Audit-Logging
- ✅ Verarbeitungsverzeichnis-Generator
- ✅ DSFA-Vorlagen-Generator
- ✅ Lokale Speicherung (kein Cloud-Transfer)

### Sicherheitsmaßnahmen
- ✅ AES-256-GCM Verschlüsselung
- ✅ PBKDF2 Key Derivation
- ✅ File System Access API
- ✅ Keine externen API-Calls
- ✅ Vollständige Offline-Funktionalität

## 🔧 Konfiguration

### Grundeinstellungen

```javascript
updateGDTConfig({
    practiceId: 'IHRE-PRAXIS-ID',
    pseudonymizeData: true,        // Empfohlen
    includeFullName: false,        // Erfordert Einwilligung
    includeAddress: false,         // Erfordert Einwilligung
    includeContactData: false,     // Erfordert Einwilligung
    auditLogging: true            // Empfohlen
});
```

### Unterstützte Praxisverwaltungssysteme

1. **Medatixx**
   - GDT-Datei im konfigurierten Import-Ordner ablegen
   - Automatischer Import nach Dateiablage

2. **CGM**
   - GDT-Schnittstelle in CGM aktivieren
   - Import-Verzeichnis konfigurieren

3. **Quincy**
   - GDT-Modul aktivieren
   - Überwachungsordner einrichten

## 📊 GDT-Feldmapping

### Personendaten
| Feld | FKK | Beschreibung | Pseudonymisierung |
|------|-----|--------------|-------------------|
| Patientennummer | 3000 | Eindeutige ID | ✅ Standard |
| Nachname | 3101 | Nachname | ❌ Optional |
| Vorname | 3102 | Vorname | ❌ Optional |
| Geburtsdatum | 3103 | TTMMJJJJ | ❌ Nein |
| Geschlecht | 3110 | 1=M, 2=W | ❌ Nein |

### Medizinische Daten (Art. 9 DSGVO)
| Feld | FKK | Beschreibung |
|------|-----|--------------|
| Anamnese | 6200 | Aktuelle Beschwerden |
| Befund | 6300 | Frühere Erkrankungen |
| Medikation | 6210 | Aktuelle Medikamente |
| Allergien | 6220 | Bekannte Allergien |

## 🧪 Tests ausführen

### Automatische Tests
1. Öffnen Sie `test-gdt-export.html` im Browser
2. Klicken Sie auf "Alle Tests ausführen"
3. Überprüfen Sie das Testergebnis

### Manuelle Tests
```javascript
// In der Browser-Konsole
gdtTests.runAll();
```

## 📋 DSGVO-Checkliste vor Go-Live

- [ ] **DSB-Prüfung**: Unabhängiger Datenschutzbeauftragter muss Implementierung prüfen
- [ ] **Verarbeitungsverzeichnis**: Erstellen und aktualisieren (§ 30 DSGVO)
- [ ] **DSFA**: Datenschutz-Folgenabschätzung durchführen (Art. 35 DSGVO)
- [ ] **Feldmapping**: Mit DSB abstimmen
- [ ] **Log-Lösung**: Mit DSB abstimmen
- [ ] **Personal**: Schulung durchführen
- [ ] **Einwilligungen**: Rechtlich prüfen
- [ ] **TOM**: Technische und organisatorische Maßnahmen dokumentieren

## 📄 DSGVO-Dokumentation exportieren

### Verarbeitungsverzeichnis
```javascript
exportProcessingRecord();
```

### DSFA-Vorlage
```javascript
exportDPIATemplate();
```

### Audit-Log
```javascript
exportAuditLog();
```

### Einwilligungen
```javascript
exportConsentDocumentation(patientId);
```

## 🔐 Audit-Log

Alle GDT-Exporte werden automatisch protokolliert:

```json
{
  "timestamp": "2025-12-21T15:59:00.000Z",
  "action": "GDT_EXPORT",
  "filename": "GDT_1234567890_2025-12-21.gdt",
  "patientId": "1234567890",
  "pseudonymized": true,
  "consentGiven": true,
  "exportConfig": {
    "includeFullName": false,
    "includeAddress": false,
    "includeContactData": false
  }
}
```

## ⚠️ Wichtige Hinweise

### Rechtliche Anforderungen
1. **Keine Produktion ohne DSB-Freigabe**
2. **Explizite Einwilligung erforderlich** für:
   - Export personenbezogener Daten
   - Verwendung von Klardaten (Name, Adresse)
   - Synchronisierung mit PVS
3. **Dokumentationspflicht** nach Art. 30 DSGVO
4. **Audit-Protokolle** aufbewahren

### Best Practices
1. **Pseudonymisierung nutzen** wann immer möglich
2. **Granulare Einwilligungen** einholen
3. **Audit-Logs regelmäßig prüfen**
4. **Personal schulen**
5. **DSB konsultieren** bei Änderungen

## 📞 Support & Kontakt

### Datenschutz-Kontakte
- **Datenschutzbeauftragter**: [Kontakt einzutragen]
- **Aufsichtsbehörde**: Landesdatenschutzbeauftragte
- **Praxisverantwortlicher**: [Kontakt einzutragen]

### Technischer Support
- Repository: https://github.com/DiggAiHH/Anamnese-A
- Dokumentation: `GDPR_EXPORT_DOCUMENTATION.md`

## 📚 Referenzen

### Rechtliche Grundlagen
- DSGVO Art. 5: Grundsätze der Datenverarbeitung
- DSGVO Art. 6: Rechtmäßigkeit der Verarbeitung
- DSGVO Art. 9: Besondere Kategorien personenbezogener Daten
- DSGVO Art. 30: Verzeichnis von Verarbeitungstätigkeiten
- DSGVO Art. 32: Sicherheit der Verarbeitung
- DSGVO Art. 35: Datenschutz-Folgenabschätzung

### Technische Standards
- KVB GDT-Spezifikation 3.1
- ISO 27001: Informationssicherheit
- BSI IT-Grundschutz

## 🏷️ Labels (für GitHub Issues)
- `datenschutz`
- `DSGVO`
- `privacy`
- `security`
- `GDT`
- `PVS-Integration`

---

**Version**: 1.0.0  
**Stand**: Dezember 2025  
**Status**: ⚠️ Erfordert DSB-Prüfung vor Produktiveinsatz
