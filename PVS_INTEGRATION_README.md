# 🏥 PVS Integration Documentation

## Unterstützte Praxisverwaltungssysteme (PVS)

Diese Dokumentation beschreibt die Integration mit verschiedenen Praxisverwaltungssystemen (PVS) für den DSGVO-konformen Datenexport.

---

## Übersicht

| PVS | Land | Format | Status |
|-----|------|--------|--------|
| Medatixx | 🇩🇪 DE | GDT | ✅ Vollständig |
| CGM | 🇩🇪 DE/EU | GDT | ✅ Vollständig |
| Quincy | 🇩🇪 DE | GDT | ✅ Vollständig |
| **Tomedo PVS** | 🇩🇪 DE | GDT | ✅ **NEU** |
| **Tomedo AIR** | 🇩🇪 DE | GDT | ✅ **NEU** |
| **Doctolib** | 🇩🇪🇫🇷🇮🇹 DE/FR/IT | GDT/CSV/JSON | ✅ **NEU** |

---

## 🍎 Tomedo PVS Integration

### Übersicht
Tomedo ist ein Mac-basiertes Praxisverwaltungssystem, das in Deutschland weit verbreitet ist.

**Hersteller:** Zollsoft GmbH  
**Website:** https://www.tomedo.de  
**Plattform:** macOS

### Unterstützte Formate
- GDT 3.1 (primär)
- BDT (optional)

### Verfügbare Export-Templates

#### 1. Tomedo PVS Standard
- Vollständiger Export aller Patientendaten
- Optimal für die Integration in die tägliche Praxisarbeit
- Erfordert BSNR und LANR

#### 2. Tomedo Minimal
- Minimaler Datenexport mit Pseudonymisierung
- Für datenschutzsensible Anwendungsfälle

### Import-Anleitung

1. Exportieren Sie die GDT-Datei auf Ihren Mac
2. Öffnen Sie Tomedo
3. Gehen Sie zu **"Datei" → "Importieren" → "GDT-Datei"**
4. Wählen Sie die exportierte Datei aus
5. Überprüfen Sie die importierten Daten

### Besonderheiten
- Tomedo unterstützt UTF-8 Kodierung (im Gegensatz zu älteren Systemen)
- Direkter Import aus dem Anamnese-Export möglich
- BDT-Format zusätzlich verfügbar

---

## ☁️ Tomedo AIR Integration

### Übersicht
Tomedo AIR ist die Cloud-basierte Version von Tomedo für web-basierte Praxisverwaltung.

**Hersteller:** Zollsoft GmbH  
**Website:** https://www.tomedo.de/air  
**Plattform:** Web/Cloud

### DSGVO-Compliance
⚠️ **Wichtig:** Für maximalen Datenschutz erfolgt **kein direkter Cloud-Upload**. 
Die Datei muss manuell über das Tomedo AIR Web-Interface importiert werden.

### Verfügbare Export-Templates

#### 1. Tomedo AIR Standard
- Vollständiger Export für Cloud-Import
- Manueller Upload erforderlich (DSGVO-konform)

#### 2. Tomedo AIR Datenschutz
- Maximale Pseudonymisierung
- Nur essenzielle Daten werden exportiert

### Import-Anleitung

1. Exportieren Sie die GDT-Datei
2. Melden Sie sich bei Tomedo AIR an
3. Navigieren Sie zu **"Einstellungen" → "Datenimport"**
4. Laden Sie die GDT-Datei hoch
5. Bestätigen Sie den Import

### Sicherheitshinweise
- Alle Daten werden über HTTPS übertragen
- Keine automatische Synchronisation
- Vollständige Kontrolle über den Datenfluss

---

## 📅 Doctolib Integration

### Übersicht
Doctolib ist eine europäische Praxis- und Terminverwaltungsplattform, die in Deutschland, Frankreich und Italien verbreitet ist.

**Hersteller:** Doctolib GmbH  
**Website:** https://www.doctolib.de  
**Plattform:** Web/Cloud

### Unterstützte Länder
- 🇩🇪 Deutschland (DSGVO)
- 🇫🇷 Frankreich (RGPD)
- 🇮🇹 Italien (GDPR)

### Unterstützte Formate
- GDT 3.1 (für deutsche Praxen)
- CSV (universell)
- JSON (für API-Integration)

### Verfügbare Export-Templates

#### 1. Doctolib PVS Standard
- Vollständiger Export für deutsche Praxen
- GDT-Format optimiert für Doctolib-Import

#### 2. Doctolib Minimal
- Minimaler Export mit Kontaktdaten (für Terminverwaltung)
- Pseudonymisierung aktiviert

#### 3. Doctolib France (RGPD)
- Optimiert für französische Praxen
- RGPD-konform (französische DSGVO)
- Unterstützt Carte Vitale Daten

### Import-Anleitung (Deutsch)

1. Exportieren Sie die Datei (GDT, CSV oder JSON)
2. Melden Sie sich bei Doctolib Pro an
3. Gehen Sie zu **"Einstellungen" → "Datenimport"**
4. Wählen Sie das entsprechende Format
5. Laden Sie die Datei hoch
6. Überprüfen und bestätigen Sie den Import

### Import-Anleitung (Français)

1. Exportez le fichier (GDT, CSV ou JSON)
2. Connectez-vous à Doctolib Pro
3. Allez dans **"Paramètres" → "Import de données"**
4. Sélectionnez le format approprié
5. Téléchargez le fichier
6. Vérifiez et confirmez l'importation

### DSGVO/RGPD Compliance
- Kein direkter API-Zugriff (maximaler Datenschutz)
- Manueller Import erforderlich
- Vollständige Audit-Protokollierung

---

## 📋 GDT-Format Spezifikation

### GDT 3.1 Feldkennungen

| Feld-ID | Beschreibung | Tomedo | Doctolib |
|---------|--------------|--------|----------|
| 3000 | Patientennummer | ✅ | ✅ |
| 3101 | Nachname | ✅ | ✅ |
| 3102 | Vorname | ✅ | ✅ |
| 3103 | Geburtsdatum | ✅ | ✅ |
| 3110 | Geschlecht | ✅ | ✅ |
| 3107 | Straße | ✅ | ✅ |
| 3112 | PLZ | ✅ | ✅ |
| 3106 | Ort | ✅ | ✅ |
| 3622 | Telefon | ✅ | ✅ |
| 3626 | E-Mail | ✅ | ✅ |
| 6200 | Anamnese | ✅ | ✅ |
| 6210 | Medikation | ✅ | ✅ |
| 6220 | Allergien | ✅ | ✅ |

---

## 🔒 Datenschutz & Sicherheit

### Allgemeine Prinzipien
- **Lokale Verarbeitung:** Alle Daten werden im Browser des Benutzers verarbeitet
- **Keine externen API-Calls:** Kein automatischer Upload zu Cloud-Diensten
- **Manueller Import:** Der Benutzer hat volle Kontrolle über den Datenfluss
- **Pseudonymisierung:** Optional für alle Exporte verfügbar
- **Audit-Logging:** Alle Exporte werden protokolliert (DSGVO Art. 30)

### DSGVO-Artikel
- Art. 5: Datensparsamkeit
- Art. 13: Informationspflicht
- Art. 17: Recht auf Löschung
- Art. 25: Datenschutz durch Technikgestaltung
- Art. 30: Verarbeitungsverzeichnis
- Art. 32: Technische Maßnahmen

---

## 🚀 Verwendung

### Template laden (JavaScript)

```javascript
// Tomedo Standard Template laden
loadGDTTemplate('tomedo_standard');

// Doctolib France Template laden
loadGDTTemplate('doctolib_france');
```

### PVS-Informationen abrufen

```javascript
// Alle verfügbaren PVS-Systeme
const allPVS = getAllPVSSystems();

// Information zu einem spezifischen PVS
const tomedoInfo = getPVSInfo('tomedo');

// PVS nach Land filtern
const germanPVS = getPVSByCountry('DE');
```

### Export durchführen

```javascript
// Standard GDT-Export
const result = await exportGDT(formData);

// Doctolib CSV-Export
const csvData = await generateDoctolibExport(formData, 'csv', 'de-DE');

// Doctolib JSON-Export
const jsonData = await generateDoctolibExport(formData, 'json', 'fr-FR');
```

---

## 📁 Dateien

| Datei | Beschreibung |
|-------|--------------|
| `pvs-integration.js` | Haupt-Integrationsmodul |
| `gdt-export-templates.js` | Export-Templates für alle PVS |
| `gdt-export-ui.js` | Benutzeroberfläche für Export |
| `gdt-export.js` | GDT-Format Implementierung |

---

## 📞 Support

Bei Fragen zur PVS-Integration:
- **E-Mail:** support@diggai.de
- **Dokumentation:** Siehe `GDT_EXPORT_README.md`

---

*Dokumentation erstellt: 2025-12-24*  
*Version: 1.0.0*
