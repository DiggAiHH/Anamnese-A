# Dokumenten-Upload und OCR-Funktionalität

## Übersicht

Die Anamnese-Anwendung wurde um eine leistungsstarke Dokumenten-Upload und OCR-Funktionalität erweitert. Patienten können nun zusätzliche Dokumente (Bilder, PDFs, Textdateien) hochladen, die automatisch verarbeitet, mit OCR (Optical Character Recognition) erfasst und verschlüsselt zusammen mit den Fragebogen-Antworten exportiert werden.

## Funktionen

### 📤 Dokumenten-Upload
- **Unterstützte Formate:**
  - Bilder (JPG, PNG, GIF, etc.) - werden mit OCR verarbeitet
  - PDF-Dokumente - Text wird extrahiert
  - Textdateien (.txt) - werden direkt eingelesen

### 🔍 Automatische Textextraktion
- **OCR für Bilder:** Verwendet Tesseract.js für deutsche Texterkennung
- **PDF-Text-Extraktion:** Verwendet PDF.js für die Extraktion von Text aus PDFs
- **Direktes Lesen:** Textdateien werden ohne Konvertierung verarbeitet

### 🔒 Verschlüsselung
- Alle extrahierten Texte werden mit der bestehenden AES-256-GCM Verschlüsselung gesichert
- Dokumente werden Teil der verschlüsselten Export-Datei

### 💾 Export-Optionen
- Export als verschlüsselte Datei (mit Dokumenten)
- E-Mail-Versand (mit Dokumenten)
- NFC-Export (bestehende Funktionalität)

## Verwendung

### Dokumente hochladen

1. Navigieren Sie zum Export-Bereich der Anwendung
2. Klicken Sie auf **"📤 Dokumente hochladen"**
3. Wählen Sie eine oder mehrere Dateien aus
4. Die Dokumente werden automatisch verarbeitet:
   - Bilder: OCR-Texterkennung läuft
   - PDFs: Text wird extrahiert
   - Textdateien: Werden direkt eingelesen
5. Nach der Verarbeitung erhalten Sie eine Bestätigung

### Hochgeladene Dokumente verwalten

- **📋 Dokumente anzeigen:** Zeigt alle hochgeladenen Dokumente mit Details (Dateiname, Typ, Textlänge, Zeitstempel)
- **🗑️ Dokumente löschen:** Löscht alle hochgeladenen Dokumente aus dem Speicher

### Export mit Dokumenten

#### Verschlüsselter Export
1. Klicken Sie auf **"💾 Export (Verschlüsselt + Dokumente)"**
2. Sie werden gefragt, ob Sie zusätzliche Dokumente hochladen möchten
3. Nach dem Upload (oder Überspringen) wird die Datei mit allen Daten und Dokumenten exportiert

#### E-Mail-Versand
1. Klicken Sie auf **"📧 Export (E-Mail + Dokumente)"**
2. Sie werden gefragt, ob Sie zusätzliche Dokumente hochladen möchten
3. Eine E-Mail mit den verschlüsselten Daten (inkl. Dokumente) wird vorbereitet

## Technische Details

### Bibliotheken

- **Tesseract.js v5:** Browser-basierte OCR-Engine für Texterkennung in Bildern
  - Sprache: Deutsch (kann auf andere Sprachen erweitert werden)
  - CDN: `https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js`

- **PDF.js v3.11:** PDF-Rendering und Text-Extraktion
  - CDN: `https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js`

### Datenstruktur

Hochgeladene Dokumente werden im folgenden Format gespeichert:

```javascript
{
    filename: "dokument.pdf",           // Original-Dateiname
    text: "Extrahierter Text...",       // Verarbeiteter Text
    timestamp: "2025-12-20T21:00:00Z",  // Upload-Zeitstempel
    type: "pdf-extraction",             // Verarbeitungstyp
    originalSize: 123456                // Originalgröße in Bytes
}
```

### Export-Format

Die exportierte JSON-Datei enthält:

```json
{
    "metadata": {
        "version": "5.0",
        "timestamp": "2025-12-20T21:00:00Z",
        "language": "de",
        "app_title": "Anamnese-Fragebogen"
    },
    "answers": {
        "0000": "Mustermann",
        "0001": "Max",
        ...
    },
    "attachedDocuments": [
        {
            "filename": "befund.pdf",
            "text": "Extrahierter Text aus dem Befund...",
            "timestamp": "2025-12-20T21:00:00Z",
            "type": "pdf-extraction",
            "originalSize": 234567
        },
        {
            "filename": "rezept.jpg",
            "text": "OCR erkannter Text vom Rezept...",
            "timestamp": "2025-12-20T21:05:00Z",
            "type": "ocr",
            "originalSize": 456789
        }
    ]
}
```

### Verschlüsselung

Die gesamte Datenstruktur (inkl. Dokumente) wird mit AES-256-GCM verschlüsselt:

1. JSON wird zu String serialisiert
2. PBKDF2 Key Derivation (100.000 Iterationen)
3. AES-256-GCM Verschlüsselung
4. Base64-Encoding für den Export

## Sicherheit und Datenschutz

### ✅ Lokale Verarbeitung
- Alle Dokumente werden **lokal im Browser** verarbeitet
- **Keine Daten werden an externe Server gesendet**
- OCR und PDF-Verarbeitung erfolgen client-seitig

### 🔒 Verschlüsselung
- Extrahierte Texte werden mit AES-256-GCM verschlüsselt
- PBKDF2 mit 100.000 Iterationen für sichere Schlüsselableitung
- Nur der Empfänger mit dem richtigen Schlüssel kann die Daten entschlüsseln

### 🗑️ Datenlöschung
- Dokumente werden nur im Browser-Speicher gehalten
- Können jederzeit mit einem Klick gelöscht werden
- Werden beim Schließen des Browsers nicht persistiert (außer explizit gespeichert)

## Testing

Eine Test-Datei ist verfügbar unter: `test_document_upload.html`

Diese Test-Seite validiert:
- ✓ Korrekte Bibliotheken-Integration
- ✓ OCR-Funktionalität für Bilder
- ✓ PDF-Text-Extraktion
- ✓ Textdatei-Verarbeitung

## Browser-Kompatibilität

| Browser | OCR | PDF-Extraktion | Verschlüsselung |
|---------|-----|----------------|-----------------|
| Chrome 90+ | ✅ | ✅ | ✅ |
| Firefox 88+ | ✅ | ✅ | ✅ |
| Safari 14+ | ✅ | ✅ | ✅ |
| Edge 90+ | ✅ | ✅ | ✅ |

## Verwendungsbeispiele

### Anwendungsfall 1: Befundbericht hochladen
Ein Patient hat einen ärztlichen Befundbericht als PDF erhalten:
1. Fragebogen ausfüllen
2. PDF-Befund hochladen
3. Text wird automatisch extrahiert
4. Export mit verschlüsselten Antworten + Befund

### Anwendungsfall 2: Medikamentenliste (Foto)
Patient fotografiert seine Medikamentenliste:
1. Foto als Bild hochladen
2. OCR erkennt die Medikamentennamen
3. Text wird zu den Antworten hinzugefügt
4. Verschlüsselter Export an den Arzt

### Anwendungsfall 3: Mehrere Dokumente
Patient hat mehrere relevante Dokumente:
1. Befund (PDF)
2. Allergiepass (Foto)
3. Medikamentenliste (Textdatei)
4. Alle werden hochgeladen und verarbeitet
5. Gemeinsamer verschlüsselter Export

## API-Referenz

### Hauptfunktionen

```javascript
// Dokument-Upload-Dialog anzeigen
await App.showDocumentUploadDialog()

// Export mit Dokument-Prompt
await App.exportWithDocumentPrompt(encrypted = true)

// E-Mail mit Dokumenten senden
await App.sendEmailWithDocuments()

// Hochgeladene Dokumente anzeigen
App.showUploadedDocuments()

// Alle Dokumente löschen
App.clearUploadedDocuments()
```

### Interne Funktionen

```javascript
// OCR durchführen
const text = await performOCR(imageFile)

// PDF-Text extrahieren
const text = await extractTextFromPDF(pdfFile)

// Datei verarbeiten
const docData = await processUploadedFile(file)

// JSON mit Dokumenten abrufen
const data = getAnswerJsonWithDocuments()
```

## Fehlerbehebung

### Problem: OCR erkennt keinen Text
**Lösung:** 
- Stellen Sie sicher, dass das Bild ausreichend Kontrast hat
- Text sollte gerade und gut lesbar sein
- Tesseract funktioniert am besten mit klarem, hochauflösendem Text

### Problem: PDF-Text kann nicht extrahiert werden
**Lösung:**
- Einige PDFs sind Bild-PDFs (gescannte Dokumente) ohne Text-Layer
- In diesem Fall konvertieren Sie das PDF zu Bildern und verwenden Sie OCR
- Oder verwenden Sie ein PDF mit Text-Layer

### Problem: "Bibliothek nicht geladen"
**Lösung:**
- Überprüfen Sie Ihre Internetverbindung (CDN-Bibliotheken)
- Warten Sie, bis die Seite vollständig geladen ist
- Prüfen Sie die Browser-Konsole auf Fehler

## Zukünftige Erweiterungen

Mögliche Verbesserungen:
- [ ] Mehrsprachige OCR (Englisch, Französisch, etc.)
- [ ] Bildvorschau vor Upload
- [ ] Fortschrittsbalken für große Dateien (statt alert-Dialoge)
- [ ] Toast-Benachrichtigungen statt alert/confirm
- [ ] Lokaler Speicher für Dokumente (localStorage)
- [ ] Bildkompression vor OCR
- [ ] Batch-Verarbeitung mit Fortschrittsanzeige
- [ ] Export als PDF-Report

**Hinweis:** Die aktuelle Version verwendet `alert()` und `confirm()` für Benutzerbenachrichtigungen. Dies ist eine einfache MVP-Implementierung, die in zukünftigen Versionen durch ein moderneres Toast-Benachrichtigungssystem ersetzt werden sollte.

## Lizenz und Credits

- **Tesseract.js:** Apache License 2.0
- **PDF.js:** Apache License 2.0
- **Integration:** Entwickelt für Anamnese-A Projekt

---

**Version:** 1.0  
**Datum:** 2025-12-20  
**Autor:** Entwickelt als Erweiterung für DiggAiHH/Anamnese-A
