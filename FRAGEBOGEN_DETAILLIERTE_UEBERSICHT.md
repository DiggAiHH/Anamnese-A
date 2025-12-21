# Detaillierte Übersicht: Anamnese-Fragebogen Struktur

## Dokument-Übersicht

Dieses Dokument bietet eine tabellarische Detailansicht aller 223 Abschnitte des Anamnese-Fragebogens aus Pull Request #3.

## Inhaltsverzeichnis

1. [Abschnitte nach Kategorie](#abschnitte-nach-kategorie)
2. [Bedingte Logik Details](#bedingte-logik-details)
3. [Feld-ID Konventionen](#feld-id-konventionen)
4. [Implementierungsdetails](#implementierungsdetails)

---

## Abschnitte nach Kategorie

### Kategorie q0: Basisdaten (1 Abschnitt)

| Abschnitt-ID | Titel | Anzahl Felder | Bedingt | Beschreibung |
|--------------|-------|---------------|---------|--------------|
| q0000 | Basisdaten | 6 | Nein | Grundlegende Patientendaten: Name, Vorname, Geschlecht, Geburtsdatum |

**Felder in q0000:**

| Feld-ID | Typ | Label | Pflicht | Bemerkung |
|---------|-----|-------|---------|-----------|
| 0000 | text | Nachname | ✓ | |
| 0001 | text | Vorname | ✓ | |
| 0002 | select | Geschlecht | ✓ | **Steuert Bedingung für q1334** |
| 0003_tag | select | Tag | ✓ | Teil des Geburtsdatums |
| 0003_monat | select | Monat | ✓ | Teil des Geburtsdatums |
| 0003_jahr | select | Jahr | ✓ | Teil des Geburtsdatums |

**Geschlecht-Optionen (0002):**
- männlich
- weiblich ← **Löst q1334 aus**
- divers/weiß nicht
- keine Angabe

---

### Kategorie q1: Symptome & Beschwerden (115 Abschnitte)

Diese Kategorie umfasst die umfangreichste Sammlung von Fragen zu verschiedenen Körpersystemen und Beschwerden.

#### Unterkategorien:

| Unterkategorie | ID-Bereich | Anzahl | Thema |
|----------------|------------|--------|-------|
| Augen | q1A00 | 1 | Augenbeschwerden |
| HNO | q1B00-q1B06 | 7 | HNO-Beschwerden und Details |
| Körperlich | q1C00-q1C15 | 16 | Verschiedene körperliche Beschwerden |
| Psychisch | q1P00-q1P54 | 9 | Psychische und kognitive Symptome |
| Allgemein | q1000-q1999 | 81 | Allgemeine Symptome von Kopf bis Fuß |
| Gynäkologisch | **q1334** | 1 | **Bedingt: nur für weiblich** |

#### Beispiel-Abschnitte aus q1:

| Abschnitt-ID | Titel | Anzahl Felder | Typ | Beschreibung |
|--------------|-------|---------------|-----|--------------|
| q1A00 | Welche Augenbeschwerden haben Sie? | 16 | Checkbox | Aderhautrötung, Blendempfindlichkeit, Doppelbilder, etc. |
| q1B00 | Welche HNO-Beschwerden haben Sie? | 9 | Checkbox | Hörstörung, Nasenbluten, Halsschmerzen, etc. |
| q1C00 | Haben Sie Brustschmerzen? | 1 | Radio | Ja/Nein |
| q1P00 | Psychische Beschwerden | 8 | Checkbox | Angst, Depression, Panikattacken, etc. |
| **q1334** | **Gynäkologische Zusatzfragen** | **13** | **Mixed** | **Bedingt durch Geschlecht = weiblich** |

#### Detailansicht q1334 (Bedingter Abschnitt):

**Bedingung:**
```json
{
    "field": "0002",
    "operator": "==",
    "value": "weiblich"
}
```

**Felder:**

| Feld-ID | Typ | Label | Pflicht | Optionen |
|---------|-----|-------|---------|----------|
| 1334_lrb | text | Letzte Regelblutung | ✗ | Freitexteingabe |
| 1334_gyn | checkbox | (Multiple) | ✗ | 12 Optionen: |

**Checkbox-Optionen für 1334_gyn:**
- vaginale Blutung
- Ausfluss
- Unterleibsschmerzen
- Schwangerschaftsanzeichen
- Menstruationsbeschwerden
- Wechseljahresbeschwerden
- Brustveränderungen
- Beckenbodenbeschwerden
- Hormonelle Probleme
- Entzündungen
- Knoten/Verhärtungen
- Andere gynäkologische Beschwerden

---

### Kategorie q2: Versicherung & Administration (32 Abschnitte)

| Abschnitt-ID-Bereich | Thema | Beispiel-Titel |
|----------------------|-------|----------------|
| q2000-q2999 | Versicherungsstatus, Kostenträger, Verwaltung | "Versicherungsstatus?", "Krankenkasse", etc. |

**Typische Felder:**
- Versicherungstyp (Gesetzlich/Privat)
- Krankenkasse
- Versicherungsnummer
- Zusatzversicherungen

---

### Kategorie q3: Kontaktdaten (6 Abschnitte)

| Abschnitt-ID-Bereich | Thema | Beispiel-Titel |
|----------------------|-------|----------------|
| q3000-q3999 | Adresse, Telefon, E-Mail | "Wie lautet Ihre PLZ?", "Telefonnummer", etc. |

**Typische Felder:**
- PLZ
- Ort
- Straße
- Hausnummer
- Telefonnummer
- E-Mail-Adresse

---

### Kategorie q4: Körperliche Maße & Vitalwerte (16 Abschnitte)

| Abschnitt-ID-Bereich | Thema | Beispiel-Titel |
|----------------------|-------|----------------|
| q4000-q4999 | Größe, Gewicht, BMI, Blutdruck | "Wie groß sind Sie?", "Wie viel wiegen Sie?", etc. |

**Typische Felder:**
- Körpergröße (cm)
- Körpergewicht (kg)
- BMI (berechnet)
- Blutdruck
- Puls
- Temperatur

---

### Kategorie q5: Chronische Erkrankungen (4 Abschnitte)

| Abschnitt-ID-Bereich | Thema | Beispiel-Titel |
|----------------------|-------|----------------|
| q5000-q5999 | Diabetes, Asthma, etc. | "Leiden Sie an Diabetes?", etc. |

**Typische Felder:**
- Diabetes (Typ 1/2)
- Asthma
- COPD
- Herzerkrankungen

---

### Kategorie q6: Beeinträchtigungen (10 Abschnitte)

| Abschnitt-ID-Bereich | Thema | Beispiel-Titel |
|----------------------|-------|----------------|
| q6000-q6999 | Körperliche/Geistige Behinderungen | "Haben Sie körperliche Beeinträchtigungen?", etc. |

---

### Kategorie q7: Gesundheitsstörungen (13 Abschnitte)

| Abschnitt-ID-Bereich | Thema | Beispiel-Titel |
|----------------------|-------|----------------|
| q7000-q7999 | Aktuelle Gesundheitsstörungen | "Haben Sie eine der folgenden Gesundheitsstörungen?", etc. |

---

### Kategorie q8: Vorerkrankungen & Eingriffe (23 Abschnitte)

| Abschnitt-ID-Bereich | Thema | Beispiel-Titel |
|----------------------|-------|----------------|
| q8000-q8999 | Frühere Erkrankungen, Operationen | "Gab es bei Ihnen bereits folgende Erkrankungen oder Eingriffe?", etc. |

**Typische Felder:**
- Frühere Operationen
- Krankenhausaufenthalte
- Unfälle
- Schwere Erkrankungen

---

### Kategorie q9: Abschluss & Versand (3 Abschnitte)

| Abschnitt-ID | Titel | Anzahl Felder | Beschreibung |
|--------------|-------|---------------|--------------|
| q9000 | Kontaktdaten vor Versand prüfen | Multiple | Finale Überprüfung |
| q9800 | Datenschutz & Einwilligung | 2 | Zustimmung |
| q9900 | Zusätzliche Anmerkungen | 3 | Freitextfeld für weitere Informationen |

---

## Bedingte Logik Details

### Übersicht aller Bedingungen

| # | Steuerfeld | Wert | Operator | Abhängiger Abschnitt | Titel |
|---|------------|------|----------|----------------------|-------|
| 1 | 0002 | weiblich | == | q1334 | Gynäkologische Zusatzfragen |

### Erweiterte Bedingungsmöglichkeiten

Obwohl aktuell nur eine Bedingung implementiert ist, unterstützt das System folgende Operatoren:

| Operator | Bedeutung | Beispiel | Anwendungsfall |
|----------|-----------|----------|----------------|
| `==` | Gleichheit | `"field": "0002", "value": "weiblich"` | Geschlechtsspezifische Fragen |
| `!=` | Ungleichheit | `"field": "age", "value": "0"` | Ausschluss bestimmter Werte |
| `>` | Größer als | `"field": "age", "value": "65"` | Altersabhängige Fragen |
| `<` | Kleiner als | `"field": "age", "value": "18"` | Minderjährige |
| `>=` | Größer oder gleich | `"field": "bmi", "value": "30"` | BMI-abhängige Fragen |
| `<=` | Kleiner oder gleich | `"field": "blood_pressure", "value": "140"` | Blutdruck-abhängig |
| `includes` | Enthält (Array) | `"field": "symptoms", "value": "fever"` | Symptom-abhängige Folgefragen |

---

## Feld-ID Konventionen

### Namensschema

| Muster | Bedeutung | Beispiel |
|--------|-----------|----------|
| `0000-0999` | Basisdaten | 0000 (Nachname), 0002 (Geschlecht) |
| `1XXX` | Symptome & Beschwerden | 1A00 (Augen), 1B00 (HNO), 1C00 (Körperlich) |
| `2XXX` | Versicherung | 2000-2999 |
| `3XXX` | Kontaktdaten | 3000-3999 |
| `4XXX` | Körpermaße | 4000-4999 |
| `5XXX` | Chronische Erkrankungen | 5000-5999 |
| `6XXX` | Beeinträchtigungen | 6000-6999 |
| `7XXX` | Gesundheitsstörungen | 7000-7999 |
| `8XXX` | Vorerkrankungen | 8000-8999 |
| `9XXX` | Abschluss | 9000-9999 |

### Spezielle Suffixe

| Suffix | Bedeutung | Beispiel |
|--------|-----------|----------|
| `_tag` | Tag (Datum) | 0003_tag |
| `_monat` | Monat (Datum) | 0003_monat |
| `_jahr` | Jahr (Datum) | 0003_jahr |
| `_lrb` | Letzte Regelblutung | 1334_lrb |
| `_gyn` | Gynäkologisch | 1334_gyn |
| `_freitext` | Freitext | 9900_freitext |

---

## Implementierungsdetails

### Datenstruktur einer Sektion

```javascript
{
    "id": "q1334",                    // Eindeutige Abschnitts-ID
    "title": "Gynäkologische Zusatzfragen",  // Titel
    "condition": {                    // Optional: Bedingung
        "field": "0002",              // Abhängiges Feld
        "operator": "==",             // Vergleichsoperator
        "value": "weiblich"           // Erwarteter Wert
    },
    "fields": [                       // Array von Feldern
        {
            "id": "1334_lrb",         // Eindeutige Feld-ID
            "type": "text",           // Feldtyp
            "label": "Letzte Regelblutung",  // Beschriftung
            "required": false         // Pflichtfeld
        },
        {
            "id": "1334_gyn",
            "type": "checkbox",
            "label": "vaginale Blutung",
            "required": false
        }
        // ... weitere Felder
    ]
}
```

### Rendering-Reihenfolge

```
1. Lade Abschnitt basierend auf currentStep Index
2. Prüfe ob Abschnitt eine Bedingung hat
3. Wenn Bedingung vorhanden:
   a. Hole Antwort des Steuerfelds
   b. Werte Bedingung aus
   c. Wenn nicht erfüllt: Überspringe zu nächstem Abschnitt
4. Rendere Abschnittstitel
5. Für jedes Feld:
   a. Erstelle entsprechendes HTML-Element
   b. Setze gespeicherte Antwort (falls vorhanden)
   c. Füge Event-Listener hinzu
6. Validiere Pflichtfelder
7. Aktiviere/Deaktiviere "Weiter"-Button
```

### Antwort-Speicherung

```javascript
AppState.answers = {
    // Text-Felder: String
    "0000": "Mustermann",
    "0001": "Max",
    
    // Select-Felder: String
    "0002": "männlich",
    "0003_tag": "15",
    "0003_monat": "6",
    "0003_jahr": "1985",
    
    // Checkbox-Felder: Array
    "1A00": ["Aderhautrötung", "Blendempfindlichkeit"],
    "1334_gyn": ["vaginale Blutung", "Unterleibsschmerzen"],
    
    // Radio-Felder: String
    "1C00": "Ja"
}
```

### Export-Format

#### Metadaten

```json
{
    "metadata": {
        "version": "5.0",
        "timestamp": "2025-12-20T10:46:00.000Z",
        "language": "de",
        "app_title": "Anamnese-Fragebogen"
    },
    "answers": {
        "0000": "Mustermann",
        "0001": "Max",
        // ... alle Antworten
    }
}
```

#### Verschlüsselung

**Prozess:**
1. JSON-Objekt erstellen
2. JSON.stringify()
3. TextEncoder: String → Uint8Array
4. Salt generieren (16 bytes)
5. IV generieren (12 bytes)
6. PBKDF2: Passwort → Key (100.000 Iterationen)
7. AES-256-GCM: Verschlüsselung
8. Kombinieren: Salt + IV + Encrypted Data
9. Base64-Encoding
10. Export als .txt Datei

**Entschlüsselung:**
1. Base64-Decoding
2. Extrahieren: Salt (16), IV (12), Data (Rest)
3. PBKDF2: Passwort → Key
4. AES-256-GCM: Entschlüsselung
5. TextDecoder: Uint8Array → String
6. JSON.parse()

---

## Statistiken

### Gesamtübersicht

| Metrik | Wert |
|--------|------|
| Gesamtanzahl Abschnitte | 223 |
| Gesamtanzahl Felder | 1.331 |
| Bedingte Abschnitte | 1 |
| Unterstützte Sprachen | 4 (DE, EN, TR, PL) |
| Feldtypen | 5 |
| Unterstützte Operatoren | 7 |

### Feldtypen-Verteilung

| Feldtyp | Anzahl | Prozent |
|---------|--------|---------|
| Checkbox | 956 | 71,8% |
| Radio | 180 | 13,5% |
| Text | 149 | 11,2% |
| Select | 43 | 3,2% |
| Textarea | 3 | 0,2% |

### Kategorien-Verteilung

| Kategorie | Abschnitte | Prozent |
|-----------|------------|---------|
| q1 (Symptome) | 115 | 51,6% |
| q2 (Versicherung) | 32 | 14,3% |
| q8 (Vorerkrankungen) | 23 | 10,3% |
| q4 (Körpermaße) | 16 | 7,2% |
| q7 (Gesundheitsstörungen) | 13 | 5,8% |
| q6 (Beeinträchtigungen) | 10 | 4,5% |
| q3 (Kontaktdaten) | 6 | 2,7% |
| q5 (Chronische Erkr.) | 4 | 1,8% |
| q9 (Abschluss) | 3 | 1,3% |
| q0 (Basisdaten) | 1 | 0,4% |

---

## Technische Anforderungen

### Browser-Kompatibilität

| Feature | Minimum Browser Version |
|---------|------------------------|
| Web Crypto API | Chrome 37+, Firefox 34+, Safari 11+, Edge 12+ |
| AES-256-GCM | Chrome 41+, Firefox 36+, Safari 11+, Edge 79+ |
| PBKDF2 | Chrome 37+, Firefox 34+, Safari 11+, Edge 12+ |
| LocalStorage | Alle modernen Browser |

### Performance

| Metrik | Wert |
|--------|------|
| Durchschnittliche Ladezeit pro Abschnitt | < 100ms |
| Verschlüsselungszeit (1MB Daten) | ~ 500ms |
| LocalStorage Speicher | ~ 5MB (alle Antworten) |
| HTML-Dateigröße | 632 KB (index_v5.html) |

---

## Changelog aus PR #3

### Wichtigste Änderungen

| Bereich | Alt | Neu |
|---------|-----|-----|
| Verschlüsselung | CryptoJS CDN | Web Crypto API (nativ) |
| Verschlüsselungsalgorithmus | AES | AES-256-GCM |
| Key Derivation | Keins | PBKDF2 (100k Iterationen) |
| Offline-Fähigkeit | ❌ Nein (CDN) | ✅ Ja (nativ) |
| Checkbox/Radio Rendering | ❌ Fehlerhaft | ✅ Behoben |

### Sicherheitsverbesserungen

1. **Keine externen Abhängigkeiten mehr**
   - Kein CDN-Laden von CryptoJS
   - Reduziert Angriffsfläche

2. **Stärkere Verschlüsselung**
   - AES-256-GCM (authenticated encryption)
   - PBKDF2 mit 100.000 Iterationen
   - Zufällige Salt und IV pro Verschlüsselung

3. **Bessere Fehlerbehandlung**
   - Async/await für Verschlüsselung
   - Try-catch Blöcke
   - Benutzerfreundliche Fehlermeldungen

---

## Zusammenfassung

Der Anamnese-Fragebogen ist ein **umfassendes, mehrsprachiges System** zur strukturierten Erfassung von Patientendaten mit:

✅ **223 Abschnitte** organisiert nach medizinischen Themenbereichen  
✅ **1.331 Felder** verschiedener Eingabetypen  
✅ **Bedingte Logik** für geschlechtsspezifische Fragen  
✅ **AES-256-GCM Verschlüsselung** mit Web Crypto API  
✅ **Offline-Fähigkeit** ohne externe Abhängigkeiten  
✅ **Mehrsprachigkeit** (Deutsch, Englisch, Türkisch, Polnisch)  
✅ **Flexible Architektur** für zukünftige Erweiterungen  

Die Implementierung in **PR #3** verbessert signifikant die Sicherheit und Zuverlässigkeit durch native Browser-APIs und behebt kritische Rendering-Fehler.
