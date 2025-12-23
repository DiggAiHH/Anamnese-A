# Admin Dashboard - Fragebogen Management

## Übersicht

Das Admin Dashboard ist eine Single Page Application (SPA) zur Verwaltung von Anamnese-Fragen. Es ermöglicht Ärzten und Praxispersonal, individuelle Fragebögen zu erstellen, zu bearbeiten und verschlüsselt zu exportieren.

## Features

### 🎨 Design & Benutzerfreundlichkeit
- Modernes, behördenkonformes Design (USWDS/BSI-Standards)
- Vollständig responsiv (Desktop, Tablet, Mobile)
- Barrierefreie Gestaltung mit hohen Kontrasten
- Intuitive Zwei-Spalten-Layout:
  - Links: Eingabebereich für neue Fragen
  - Rechts: Vorschau und Verwaltung hinzugefügter Fragen

### 📝 Fragen-Erstellung

#### Kategorien
Wählen Sie aus 11 vordefinierten Kategorien oder erstellen Sie eigene:
- Basisdaten
- Augenbeschwerden
- HNO-Beschwerden
- Psychische Gesundheit
- Kinder- und Jugendmedizin
- Symptome
- Medikamente
- Allergien
- Vorerkrankungen
- Familienanamnese
- Sozialanamnese
- **+ Neue Kategorie** (individuell erstellbar)

#### Fragetypen
- **Text**: Freitextfeld für ausführliche Antworten
- **Zahl**: Numerische Eingaben (z.B. Alter, Gewicht)
- **Datum**: Datumsauswahl
- **Single Choice**: Einfachauswahl aus mehreren Optionen
- **Multiple Choice**: Mehrfachauswahl aus mehreren Optionen

#### Mehrsprachigkeit
Unterstützung für 12 Sprachen:
- 🇩🇪 Deutsch
- 🇬🇧 English
- 🇫🇷 Français
- 🇪🇸 Español
- 🇮🇹 Italiano
- 🇹🇷 Türkçe
- 🇵🇱 Polski
- 🇷🇺 Русский
- 🇺🇦 Українська
- 🇸🇦 العربية
- 🇮🇷 فارسی
- 🇵🇰 اردو
- 🇨🇳 中文

### 🔧 Fragen-Verwaltung
- **Hinzufügen**: Neue Fragen mit wenigen Klicks erstellen
- **Bearbeiten**: Bestehende Fragen ändern
- **Löschen**: Fragen entfernen (mit Bestätigungsdialog)
- **Vorschau**: Übersicht aller Fragen mit Metadaten (Kategorie, Typ, Sprachen)

### 🏥 Praxis-Informationen
Erfassen Sie wichtige Praxisdaten:
- **Name des Arztes** (Pflichtfeld)
- **Praxisname** (Pflichtfeld)
- **Praxisnummer** (optional)
- **Gewünschtes Fertigstellungsdatum** (optional)

### 🤖 KI-Funktions-Anfrage
- Dedizierter Bereich für individuelle KI-Anfragen
- Beschreiben Sie gewünschte datenschutzkonforme KI-Funktionen
- Hinweis auf benötigte anonymisierte Beispieldateien

### 🔐 Export-Funktionen

#### Verschlüsselung
- **AES-256-GCM Verschlüsselung** (Web Crypto API)
- **PBKDF2 Schlüsselableitung** (100.000 Iterationen)
- **Hardcoded Passwort**: "123456" (wie angefordert für Prototyp)
- Zufällige Salt- und IV-Werte für jede Verschlüsselung
- Base64-Kodierung des Outputs

#### Export-Optionen

**1. Per E-Mail senden**
- Öffnet Ihr Standard-E-Mail-Programm
- Vorbefüllter Betreff und Body
- Enthält verschlüsselte Daten (AES-256)
- Alle Praxis- und KI-Anfrage-Informationen inkludiert

**2. Als verschlüsselte Datei exportieren**
- Download als `.aes256.txt` Datei
- Dateiname: `anamnese_export_YYYY-MM-DD.aes256.txt`
- Vollständig verschlüsselte Inhalte
- Kann sicher per E-Mail oder Cloud geteilt werden

#### Export-Datenstruktur
```json
{
  "version": "1.0.0",
  "exportDate": "ISO-8601-Timestamp",
  "practice": {
    "doctorName": "...",
    "practiceName": "...",
    "practiceNumber": "...",
    "completionDate": "..."
  },
  "aiRequest": "...",
  "questions": [...],
  "metadata": {
    "questionCount": 0,
    "categories": [],
    "languages": []
  }
}
```

### 💾 Datenpersistenz
- **Auto-Save**: Automatisches Speichern alle 5 Sekunden
- **localStorage**: Daten bleiben auch nach Browser-Neustart erhalten
- **Zustandswiederherstellung**: Unfertige Fragebögen werden automatisch geladen

## Technische Details

### Technologie-Stack
- **Single HTML File**: Keine Build-Tools erforderlich
- **Vanilla JavaScript**: ES6+, keine Frameworks
- **Modern CSS**: CSS Grid, Flexbox, CSS Variables
- **Web Crypto API**: Native Browser-Verschlüsselung
- **localStorage API**: Client-seitige Persistenz

### Browser-Kompatibilität
Getestet und funktionsfähig in:
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

### Sicherheit
- **Content Security Policy** (CSP) Headers
- **Input Sanitization** durch Browser-native Mechanismen
- **Keine externen Abhängigkeiten** (außer CDN-Fonts)
- **Client-seitige Verschlüsselung** (keine Server-Übertragung)

## Installation & Nutzung

### Voraussetzungen
- Moderner Webbrowser (siehe Kompatibilität)
- JavaScript aktiviert
- Keine Installation erforderlich

### Schritt 1: Öffnen
1. Navigieren Sie zum Projektverzeichnis
2. Öffnen Sie `admin_dashboard.html` in Ihrem Browser
3. Alternativ: Doppelklick auf die Datei

### Schritt 2: Frage erstellen
1. Wählen Sie eine **Kategorie** aus dem Dropdown
   - Oder wählen Sie "Neue Kategorie" für individuelle Kategorien
2. Wählen Sie den **Fragetyp**
   - Bei Choice-Typen: Optionen hinzufügen
3. Geben Sie den **Fragetext** (Deutsch) ein
4. Optional: Fügen Sie **Übersetzungen** hinzu
5. Klicken Sie auf **"Frage hinzufügen"**

### Schritt 3: Fragen verwalten
- **Bearbeiten**: Klicken Sie auf "✏️ Bearbeiten"
- **Löschen**: Klicken Sie auf "🗑️ Löschen"
- **Vorschau**: Rechte Seite zeigt alle Fragen

### Schritt 4: Export vorbereiten
1. Füllen Sie die **Praxis-Informationen** aus:
   - Name des Arztes *
   - Praxisname *
   - Optional: Praxisnummer und Fertigstellungsdatum
2. Optional: Geben Sie eine **KI-Funktions-Anfrage** ein

### Schritt 5: Exportieren
**Option A: E-Mail**
- Klicken Sie auf "📧 Per E-Mail senden"
- Ihr E-Mail-Programm öffnet sich
- Senden Sie die E-Mail an support@diggai.de

**Option B: Datei**
- Klicken Sie auf "💾 Als verschlüsselte Datei exportieren"
- Datei wird heruntergeladen
- Senden Sie die Datei per E-Mail oder laden Sie sie in einen sicheren Bereich hoch

## Validierung

### Pflichtfelder
Folgende Felder sind erforderlich:
- ✅ Kategorie
- ✅ Fragetyp
- ✅ Fragetext (Deutsch)
- ✅ Mindestens 2 Optionen (bei Choice-Typen)
- ✅ Name des Arztes (beim Export)
- ✅ Praxisname (beim Export)

### Fehlermeldungen
Das Dashboard zeigt automatisch Fehlermeldungen, wenn:
- Pflichtfelder nicht ausgefüllt sind
- Weniger als 2 Optionen bei Choice-Fragen
- Keine Fragen vor dem Export hinzugefügt wurden

### Erfolgsmeldungen
Grüne Erfolgsmeldungen erscheinen bei:
- ✓ Frage erfolgreich hinzugefügt
- ✓ Frage erfolgreich aktualisiert
- ✓ Frage erfolgreich gelöscht
- ✓ Export erfolgreich

## Best Practices

### Fragen erstellen
1. **Klare Formulierung**: Verwenden Sie einfache, verständliche Sprache
2. **Kontextrelevanz**: Ordnen Sie Fragen der richtigen Kategorie zu
3. **Übersetzungsqualität**: Lassen Sie Übersetzungen von Muttersprachlern prüfen
4. **Option-Vollständigkeit**: Stellen Sie sicher, dass alle relevanten Optionen enthalten sind

### Datensicherheit
1. **Regelmäßige Exports**: Exportieren Sie Ihre Fragebögen regelmäßig
2. **Sichere Aufbewahrung**: Bewahren Sie exportierte Dateien sicher auf
3. **Passwortschutz**: Das Passwort "123456" ist nur für Prototypen - in Produktion sollte ein sicheres Passwort verwendet werden

### Workflow-Empfehlung
1. Erstellen Sie zunächst alle Fragen in Deutsch
2. Überprüfen Sie die Fragensammlung auf Vollständigkeit
3. Fügen Sie Übersetzungen hinzu (falls erforderlich)
4. Testen Sie die Fragen intern
5. Exportieren Sie und senden Sie den verschlüsselten Export

## Entschlüsselung (für Entwickler)

Die exportierten Daten sind AES-256-GCM verschlüsselt. Die Entschlüsselung erfolgt mit:
- **Passwort**: "123456"
- **Schlüsselableitung**: PBKDF2 (100.000 Iterationen, SHA-256)
- **Format**: Base64-kodiert (Salt + IV + Encrypted Data)

Beispiel-Entschlüsselung in JavaScript:
```javascript
async function decryptData(encryptedBase64, password) {
    const enc = new TextEncoder();
    const data = Uint8Array.from(atob(encryptedBase64), c => c.charCodeAt(0));
    
    const salt = data.slice(0, 16);
    const iv = data.slice(16, 28);
    const encrypted = data.slice(28);
    
    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        enc.encode(password),
        { name: 'PBKDF2' },
        false,
        ['deriveBits', 'deriveKey']
    );
    
    const key = await crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: salt,
            iterations: 100000,
            hash: 'SHA-256'
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        false,
        ['decrypt']
    );
    
    const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: iv },
        key,
        encrypted
    );
    
    return new TextDecoder().decode(decrypted);
}
```

## Fehlerbehebung

### Problem: Daten werden nicht gespeichert
**Lösung**: Überprüfen Sie, ob localStorage im Browser aktiviert ist und ausreichend Speicherplatz verfügbar ist.

### Problem: Export-Button reagiert nicht
**Lösung**: Stellen Sie sicher, dass mindestens eine Frage hinzugefügt wurde und alle Pflichtfelder ausgefüllt sind.

### Problem: E-Mail öffnet sich nicht
**Lösung**: Konfigurieren Sie einen Standard-E-Mail-Client in Ihrem Betriebssystem oder Browser.

### Problem: Verschlüsselung schlägt fehl
**Lösung**: Verwenden Sie einen modernen Browser, der die Web Crypto API unterstützt (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+).

## Support

Bei Fragen oder Problemen wenden Sie sich an:
- **E-Mail**: support@diggai.de
- **Projekt**: https://github.com/DiggAiHH/Anamnese-A

## Lizenz

Dieses Projekt ist Teil des Anamnese-A Systems von DiggAi GmbH.

## Changelog

### Version 1.0.0 (2025-12-23)
- ✨ Initiale Implementierung
- 🎨 USWDS/BSI-konformes Design
- 🔐 AES-256 Verschlüsselung
- 🌍 12-Sprachen-Unterstützung
- 📤 E-Mail und Datei-Export
- 🤖 KI-Funktions-Anfrage Bereich
- 💾 Auto-Save und localStorage-Persistenz
