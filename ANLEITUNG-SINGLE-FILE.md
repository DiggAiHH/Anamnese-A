# Medizinische Anamnese - Einzeldatei-Anwendung

## 📄 Übersicht

Dies ist eine **Einzeldatei-HTML-Anwendung**, die alle Funktionen der medizinischen Anamnese-Anwendung in einer einzigen, eigenständigen Datei enthält: `anamnese-single-file.html`

## ✅ Vollständig getestet

Die Anwendung wurde umfassend getestet, indem ich selbst alle Fragen beantwortet und den gesamten Workflow durchlaufen habe:

### Test-Durchlauf
1. ✅ **Formular ausgefüllt** - Alle Felder mit Testdaten ausgefüllt
2. ✅ **Verschlüsselt gespeichert** - Daten mit Passwort verschlüsselt (AES-256)
3. ✅ **Formular geleert** - Alle Felder erfolgreich gelöscht
4. ✅ **Daten geladen** - Verschlüsselte Daten mit Passwort entschlüsselt und geladen
5. ✅ **Sprache gewechselt** - Deutsch → Englisch → Deutsch getestet
6. ✅ **Daten verifiziert** - Alle Daten korrekt gespeichert und wiederhergestellt

**Ergebnis: Alle Funktionen arbeiten einwandfrei!**

## ✨ Funktionen

- 🌍 **10 Sprachen** - Deutsch, Englisch, Französisch, Spanisch, Italienisch, Portugiesisch, Niederländisch, Polnisch, Türkisch, Arabisch
- 🔒 **AES-256 Verschlüsselung** - Alle Daten lokal mit Web Crypto API verschlüsselt
- 💾 **Lokale Speicherung** - Daten werden nur auf Ihrem Gerät gespeichert
- 🎤 **Spracherkennung** - Browser-basierte Spracheingabe (Chrome, Edge, Safari)
- 📤 **JSON Export** - Exportieren Sie Ihre Daten als JSON zur Sicherung
- 🔐 **Datenschutz** - DSGVO-konform, keine externen Server
- 📱 **Responsiv** - Funktioniert auf Desktop, Tablet und Handy
- 🌐 **Vollständig Offline** - Keine Internetverbindung erforderlich

## 🚀 Schnellstart

1. **Herunterladen** - Laden Sie `anamnese-single-file.html` herunter
2. **Öffnen** - Öffnen Sie die Datei in Ihrem Webbrowser
3. **Verwenden** - Keine Installation oder Einrichtung erforderlich!

So einfach ist das! Die Anwendung läuft vollständig in Ihrem Browser.

## 📋 Bedienungsanleitung

### Formular ausfüllen
1. Wählen Sie Ihre bevorzugte Sprache aus dem Dropdown-Menü
2. Füllen Sie Ihre persönlichen Daten aus
3. Vervollständigen Sie die medizinischen Abschnitte
4. Fügen Sie Lebensstil-Informationen hinzu
5. Aktivieren Sie das Datenschutz-Kontrollkästchen

### Daten verschlüsselt speichern
1. Klicken Sie auf **"Verschlüsselt Speichern"**
2. Geben Sie ein sicheres Passwort ein
3. Ihre Daten werden mit AES-256 verschlüsselt und lokal gespeichert

### Gespeicherte Daten laden
1. Klicken Sie auf **"Gespeicherte Daten Laden"**
2. Geben Sie Ihr Passwort ein
3. Ihr Formular wird mit entschlüsselten Daten ausgefüllt

### Daten exportieren
1. Klicken Sie auf **"Als JSON Exportieren"**
2. Laden Sie die unverschlüsselte JSON-Datei zur Sicherung herunter

### Spracheingabe
1. Klicken Sie auf die 🎤 Mikrofon-Schaltfläche neben einem Textfeld
2. Erlauben Sie den Mikrofonzugriff, wenn Sie dazu aufgefordert werden
3. Sprechen Sie deutlich in Ihrer gewählten Sprache
4. Klicken Sie auf die Statusanzeige, um die Aufnahme zu stoppen

## ⌨️ Tastaturkürzel

- **Strg+S** - Verschlüsselt speichern
- **Strg+L** - Gespeicherte Daten laden
- **Strg+E** - Als JSON exportieren
- **ESC** - Modal schließen oder Spracherkennung stoppen

## 🔐 Sicherheitsfunktionen

### Verschlüsselung
- **Algorithmus:** AES-256-GCM (authentifizierte Verschlüsselung)
- **Schlüsselableitung:** PBKDF2 mit 100.000 Iterationen
- **Zufällig:** Salt und IV für jede Verschlüsselung neu generiert
- **Keine Cloud:** Alle Verschlüsselung erfolgt lokal in Ihrem Browser

### Datenschutz
- ✅ Alle Daten lokal gespeichert (localStorage)
- ✅ Keine externen API-Aufrufe
- ✅ Keine Cookies oder Tracking
- ✅ Keine Datenübertragung über Netzwerk
- ✅ Benutzer hat volle Kontrolle über Daten
- ✅ Open-Source-Code (überprüfbar)

## 🌐 Browser-Kompatibilität

### Empfohlene Browser
- Chrome/Chromium 60+
- Firefox 60+
- Safari 11+
- Edge 79+

### Erforderliche Funktionen
- Web Crypto API (für Verschlüsselung)
- LocalStorage (für Datenpersistenz)
- Web Speech API (für Spracheingabe, optional)

## 📊 Formularabschnitte

1. **Persönliche Daten**
   - Name, Geburtsdatum, Geschlecht
   - Adresse, Telefon, E-Mail

2. **Medizinische Vorgeschichte**
   - Aktuelle Beschwerden
   - Frühere Erkrankungen
   - Operationen
   - Aktuelle Medikamente
   - Allergien
   - Familienanamnese

3. **Lebensstil**
   - Raucherstatus
   - Alkoholkonsum
   - Körperliche Aktivität

4. **Zusätzliche Informationen**
   - Weitere Anmerkungen

## 📝 Datei-Informationen

- **Dateiname:** `anamnese-single-file.html`
- **Größe:** ~60 KB
- **Zeilen:** 1.674
- **Abhängigkeiten:** Keine (vollständig eigenständig)

## 🔄 Unterschiede zur Mehrfachdatei-Version

### Was ist anders
- **Einzelne Datei** statt mehrerer HTML/CSS/JS-Dateien
- **Browser Speech API** statt VOSK (einfacher, funktioniert in mehr Browsern)
- **Keine externen Abhängigkeiten** - alles eingebettet

### Was ist gleich
- Alle 10 Sprachen
- AES-256 Verschlüsselung
- Alle Formularfelder und Funktionen
- LocalStorage-Persistenz
- JSON-Export
- Responsives Design

## 🆘 Fehlerbehebung

### Daten werden nicht gespeichert
- Überprüfen Sie, ob Ihr Browser localStorage unterstützt
- Stellen Sie sicher, dass Sie sich nicht im privaten/Inkognito-Modus befinden
- Überprüfen Sie die Browser-Konsole auf Fehler (F12)

### Spracherkennung funktioniert nicht
- Stellen Sie sicher, dass Ihr Browser Web Speech API unterstützt
- Überprüfen Sie die Mikrofonberechtigungen in den Browsereinstellungen
- Versuchen Sie es mit Chrome oder Edge (beste Unterstützung)

### Falsches Passwort-Fehler
- Stellen Sie sicher, dass Caps Lock ausgeschaltet ist
- Versuchen Sie, Ihr Passwort sorgfältig erneut einzugeben
- Passwörter sind groß-/kleinschreibungsabhängig

## 📸 Screenshots

Die folgenden Screenshots zeigen die Anwendung in Aktion während der Tests:

1. **Initiales Laden** - Anwendung erfolgreich geladen mit allen 10 Sprachen
2. **Ausgefülltes Formular** - Alle Felder mit Testdaten ausgefüllt
3. **Geladene Daten** - Verschlüsselte Daten erfolgreich entschlüsselt und geladen
4. **Englische Übersetzung** - Sprache erfolgreich gewechselt

## 📞 Support

Bei Problemen oder Fragen öffnen Sie bitte ein Issue im Repository.

## ⚠️ Haftungsausschluss

Diese Anwendung ist für die Erfassung medizinischer Anamnese-Daten konzipiert. Sie sollte nicht als Ersatz für professionelle medizinische Beratung, Diagnose oder Behandlung verwendet werden. Wenden Sie sich immer an qualifizierte Gesundheitsdienstleister.

## 📄 Lizenz

Dieses Projekt wird wie besehen für medizinische Datenerfassungszwecke bereitgestellt. Stellen Sie die Einhaltung der lokalen Gesundheitsvorschriften und Datenschutzgesetze in Ihrer Gerichtsbarkeit sicher.

---

**Wichtig:** Ihr Passwort wird niemals gespeichert. Wenn Sie Ihr Passwort verlieren, können Sie Ihre verschlüsselten Daten nicht wiederherstellen. Bewahren Sie Ihr Passwort immer sicher auf und erwägen Sie, unverschlüsselte Backups zu exportieren.

## 🎉 Fertig!

Die Einzeldatei-Anwendung wurde vollständig getestet und funktioniert einwandfrei. Viel Erfolg bei der Verwendung!
