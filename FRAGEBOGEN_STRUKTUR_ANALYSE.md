# Analyse der Fragebogen-Logik und -Struktur

## Übersicht

Dieses Dokument analysiert die Logik und Struktur des Anamnese-Fragebogens aus Pull Request #3 (https://github.com/DiggAiHH/Anamnese-A/pull/3/files). Der Fragebogen ist in der Datei `index_v5.html` implementiert und verwendet ein datengesteuertes Modell mit dynamischen Bedingungen.

## Hauptmerkmale

- **Gesamtanzahl der Abschnitte:** 223 Abschnitte
- **Gesamtanzahl der Felder:** 1.331 Felder
- **Bedingte Abschnitte:** 1 Abschnitt mit Bedingungslogik
- **Mehrsprachigkeit:** Unterstützung für Deutsch, Englisch, Türkisch und Polnisch

## Datenstruktur

Der Fragebogen ist als JSON-Datenstruktur organisiert mit folgender Hierarchie:

```
APP_DATA
├── version: "5.0"
├── translations: { de, en, tr, pl }
├── red_flag_fields: []
└── sections: [223 Abschnitte]
    ├── id: Eindeutige Abschnitts-ID (z.B. "q0000", "q1A00")
    ├── title: Abschnittstitel
    ├── condition: (optional) Bedingung für Sichtbarkeit
    └── fields: [Array von Feldern]
        ├── id: Feld-ID
        ├── type: Feldtyp (text, checkbox, radio, select, textarea)
        ├── label: Feldbezeichnung
        ├── required: Pflichtfeld (true/false)
        ├── options: (optional) Auswahloptionen
        └── condition: (optional) Feldspezifische Bedingung
```

## Kategorisierung der Abschnitte

Die Abschnitte sind nach Themenbereichen organisiert, erkennbar an ihren ID-Präfixen:

| Präfix | Anzahl | Themenbereich | Beispiel |
|--------|--------|---------------|----------|
| **q0** | 1 | Basisdaten | "Basisdaten" (Name, Geschlecht, Geburtsdatum) |
| **q1** | 115 | Symptome & Beschwerden | "Welche Augenbeschwerden haben Sie?" |
| **q2** | 32 | Versicherung & Administration | "Versicherungsstatus?" |
| **q3** | 6 | Kontaktdaten | "Wie lautet Ihre PLZ?" |
| **q4** | 16 | Körperliche Maße & Vitalwerte | "Wie groß sind Sie?" |
| **q5** | 4 | Chronische Erkrankungen | "Leiden Sie an Diabetes?" |
| **q6** | 10 | Beeinträchtigungen | "Haben Sie körperliche Beeinträchtigungen?" |
| **q7** | 13 | Gesundheitsstörungen | "Haben Sie eine der folgenden Gesundheitsstörungen?" |
| **q8** | 23 | Vorerkrankungen & Eingriffe | "Gab es bei Ihnen bereits folgende Erkrankungen oder Eingriffe?" |
| **q9** | 3 | Abschluss & Versand | "Kontaktdaten vor Versand prüfen" |

## Feldtypen und Verteilung

Der Fragebogen verwendet verschiedene Eingabetypen:

| Feldtyp | Anzahl | Verwendungszweck |
|---------|--------|------------------|
| **checkbox** | 956 | Mehrfachauswahl (z.B. Symptome, Vorerkrankungen) |
| **radio** | 180 | Einfachauswahl (z.B. Ja/Nein-Fragen) |
| **text** | 149 | Freitext-Eingabe (z.B. Name, PLZ) |
| **select** | 43 | Dropdown-Auswahl (z.B. Geschlecht, Geburtsdatum) |
| **textarea** | 3 | Mehrzeiliger Freitext (z.B. zusätzliche Informationen) |

## Bedingte Logik

### Bedingungsmechanismus

Der Fragebogen implementiert ein dynamisches Anzeigesystem basierend auf Bedingungen. Die Bedingungsstruktur:

```javascript
{
    "condition": {
        "field": "Feld-ID auf die sich bezogen wird",
        "operator": "==|!=|>|<|>=|<=|includes",
        "value": "Erwarteter Wert"
    }
}
```

### Unterstützte Operatoren

- `==` : Gleichheit
- `!=` : Ungleichheit
- `>`, `<`, `>=`, `<=` : Numerische Vergleiche
- `includes` : Prüft ob ein Wert in einem Array enthalten ist (für Checkbox-Gruppen)

### Implementierte Bedingungslogik

#### Abschnitt-Ebene Bedingungen

**Abschnitt q1334: "Gynäkologische Zusatzfragen"**
- **Bedingung:** Wird nur angezeigt wenn Feld `0002` (Geschlecht) den Wert `'weiblich'` hat
- **Operator:** `==` (Gleichheit)
- **Felder in diesem Abschnitt:**
  - `1334_lrb`: Letzte Regelblutung (Text)
  - `1334_gyn`: Gynäkologische Symptome (Mehrfach-Checkbox)
    - vaginale Blutung
    - Ausfluss
    - Unterleibsschmerzen
    - und weitere

#### Feld-Ebene Bedingungen

Aktuell sind keine spezifischen Feld-Ebene Bedingungen implementiert. Die Architektur unterstützt diese jedoch durch die `checkCondition()` Funktion.

## Ablauflogik des Fragebogens

### 1. Initialisierung

```
Start → Datenschutz-Hinweis → Sprachwahl → Basisdaten (q0000)
```

### 2. Haupt-Fragebogen-Flow

Der Fragebogen folgt einem linearen Ablauf mit bedingter Verzweigung:

```
q0000: Basisdaten
  ├─ Name (0000)
  ├─ Vorname (0001)
  ├─ Geschlecht (0002) ◄─── Steuerfeld für Bedingung!
  └─ Geburtsdatum (0003_tag, 0003_monat, 0003_jahr)
      ↓
q1Axx: Augenbeschwerden (16 Symptome)
      ↓
q1Bxx: HNO-Beschwerden (mehrere Unterabschnitte)
      ↓
q1Cxx: Weitere körperliche Beschwerden
      ↓
q1Pxx: Psychische Beschwerden
      ↓
q1xxx: Allgemeine Symptome (100+)
      ↓
[BEDINGTE VERZWEIGUNG]
      ├─ WENN Geschlecht = 'weiblich'
      │   └─ q1334: Gynäkologische Zusatzfragen ◄─── Bedingter Abschnitt
      ↓
q2xxx: Versicherung & Administration
      ↓
q3xxx: Kontaktdaten
      ↓
q4xxx: Körperliche Maße & Vitalwerte
      ↓
q5xxx: Chronische Erkrankungen
      ↓
q6xxx: Beeinträchtigungen
      ↓
q7xxx: Gesundheitsstörungen
      ↓
q8xxx: Vorerkrankungen & Eingriffe
      ↓
q9xxx: Abschluss & Versand
```

### 3. Navigation

- **Vorwärts:** Nächster Abschnitt wird geladen
- **Rückwärts:** Vorheriger Abschnitt wird geladen
- **Bedingte Abschnitte:** Werden automatisch übersprungen wenn Bedingung nicht erfüllt

### 4. Validierung

```javascript
// Für jeden Abschnitt:
- Prüfe ob alle Pflichtfelder ausgefüllt sind
- Aktiviere "Weiter"-Button nur wenn Validierung erfolgreich
- Speichere Antworten in AppState.answers
```

## Technische Implementierung

### Rendering-Funktion

```javascript
function renderStep(index) {
    const section = window.APP_DATA.sections[index];
    
    // 1. Prüfe Abschnittsbedingung
    if (section.condition) {
        const { field, value, operator = '==' } = section.condition;
        const answer = AppState.answers[field];
        
        // Bedingung auswerten
        let conditionMet = evaluateCondition(answer, value, operator);
        
        // Wenn nicht erfüllt, überspringe Abschnitt
        if (!conditionMet) {
            renderStep(index + 1); // Springe zum nächsten
            return;
        }
    }
    
    // 2. Rendere Abschnittstitel
    // 3. Rendere alle Felder
    // 4. Füge Event-Listener hinzu
    // 5. Validiere Pflichtfelder
}
```

### Bedingungsprüfung

```javascript
function checkCondition(item) {
    if (!item.condition) return true;
    
    const { field, value, operator = '==' } = item.condition;
    const answer = AppState.answers[field];
    
    // Prüfe ob Feld beantwortet wurde
    if (answer === undefined || answer === null || answer === '') {
        return false;
    }
    
    // Für Array-Antworten (Checkboxen)
    if (Array.isArray(answer)) {
        if (operator === 'includes') {
            return answer.includes(value);
        }
        return false;
    }
    
    // Standard-Operatoren
    switch (operator) {
        case '==': return answer == value;
        case '!=': return answer != value;
        case '>':  return parseFloat(answer) > parseFloat(value);
        case '<':  return parseFloat(answer) < parseFloat(value);
        case '>=': return parseFloat(answer) >= parseFloat(value);
        case '<=': return parseFloat(answer) <= parseFloat(value);
        default:   return false;
    }
}
```

## Abhängigkeitsgraph

### Steuerfeld: `0002` (Geschlecht)

```
Feld 0002: "Geschlecht"
├─ Option: "männlich"
├─ Option: "weiblich" ◄─── Löst Bedingung aus
├─ Option: "divers/weiß nicht"
└─ Option: "keine Angabe"
    │
    └─ WENN 0002 == 'weiblich'
        └─► Abschnitt q1334: "Gynäkologische Zusatzfragen"
            ├─ 1334_lrb: Letzte Regelblutung
            └─ 1334_gyn: Gynäkologische Symptome (12 Optionen)
```

## Datenverwaltung

### Speicherung der Antworten

```javascript
AppState.answers = {
    "0000": "Mustermann",
    "0001": "Max",
    "0002": "männlich",
    "0003_tag": "15",
    "0003_monat": "6",
    "0003_jahr": "1985",
    "1A00": ["Aderhautrötung", "Blendempfindlichkeit"],
    // ... weitere Antworten
}
```

### Export-Funktionen

Der Fragebogen bietet mehrere Export-Optionen:

1. **Verschlüsselte JSON-Datei** (AES-256-GCM)
   - Verwendet Web Crypto API
   - PBKDF2 Key Derivation (100.000 Iterationen)
   - Sicherer als die vorherige CryptoJS-Implementierung

2. **Unverschlüsselter JSON-Export**
   - Für Entwicklung und Testing

3. **E-Mail-Versand**
   - Verschlüsselte Daten als E-Mail-Body

4. **NFC-Export**
   - Für mobile Geräte mit NFC-Unterstützung

### Verschlüsselung (aus PR #3)

**Wichtige Änderung in PR #3:**
- **Vorher:** CryptoJS-Bibliothek von CDN (blockiert)
- **Nachher:** Native Web Crypto API (offline-fähig)

```javascript
async function encryptData(data) {
    // 1. Generiere Salt und IV
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    // 2. Leite Schlüssel ab (PBKDF2)
    const key = await deriveKeyFromPassword(ENCRYPTION_KEY, salt);
    
    // 3. Verschlüssele mit AES-256-GCM
    const encryptedData = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: iv },
        key,
        encoder.encode(data)
    );
    
    // 4. Kombiniere Salt + IV + Daten
    // 5. Konvertiere zu Base64
    return base64String;
}
```

## Erweiterbarkeit

### Hinzufügen neuer bedingter Abschnitte

Um einen neuen bedingten Abschnitt hinzuzufügen:

```json
{
    "id": "q_new_section",
    "title": "Neuer bedingter Abschnitt",
    "condition": {
        "field": "andere_feld_id",
        "operator": "==",
        "value": "erwarteter_wert"
    },
    "fields": [
        // ... Felder
    ]
}
```

### Hinzufügen von Feld-Bedingungen

Für bedingte Felder innerhalb eines Abschnitts:

```json
{
    "id": "bedingtes_feld",
    "type": "text",
    "label": "Wird nur unter Bedingung angezeigt",
    "required": false,
    "condition": {
        "field": "abhangiges_feld",
        "operator": "includes",
        "value": "bestimmte_option"
    }
}
```

## Best Practices und Empfehlungen

### 1. Bedingungsdesign
- Halte Bedingungen einfach und nachvollziehbar
- Vermeide zirkuläre Abhängigkeiten
- Dokumentiere alle bedingten Abschnitte

### 2. Feld-IDs
- Verwende konsistente Namenskonventionen
- Gruppiere verwandte Felder (z.B. 1334_lrb, 1334_gyn)
- Vermeide ID-Kollisionen

### 3. Validierung
- Setze `required: true` nur für wirklich notwendige Felder
- Biete sinnvolle Standardwerte an
- Implementiere clientseitige Validierung

### 4. Performance
- Der Fragebogen mit 223 Abschnitten ist gut strukturiert
- Dynamisches Rendering verhindert DOM-Überladung
- Nur aktuelle Abschnitte werden gerendert

## Zusammenfassung

Der Anamnese-Fragebogen ist ein komplexes, datengesteuertes System mit:

- **223 strukturierte Abschnitte** nach medizinischen Themenbereichen
- **1.331 Eingabefelder** verschiedener Typen
- **Dynamische Bedingungslogik** für geschlechtsspezifische Fragen
- **Mehrsprachige Unterstützung** (DE, EN, TR, PL)
- **Sichere Verschlüsselung** mit Web Crypto API (AES-256-GCM)
- **Flexible Architektur** für zukünftige Erweiterungen

Die Implementierung in PR #3 verbessert die Sicherheit und Offline-Fähigkeit durch den Wechsel von CryptoJS zu nativer Web Crypto API und behebt kritische Rendering-Probleme bei Checkbox- und Radio-Button-Feldern.

## Visualisierung

Siehe beigefügtes Diagramm `FRAGEBOGEN_ABLAUFDIAGRAMM.svg` für eine grafische Darstellung des Ablaufs.
