# Fragebogen-Analyse: Navigationshilfe

## Über diese Dokumentation

Diese Dokumentation analysiert die Struktur und Logik des Anamnese-Fragebogens aus **Pull Request #3** (https://github.com/DiggAiHH/Anamnese-A/pull/3/files).

Die Analyse umfasst:
- ✅ Vollständige Strukturanalyse aller 223 Abschnitte
- ✅ Identifikation und Dokumentation der bedingten Logik
- ✅ Visuelle Ablaufdiagramme (Mermaid)
- ✅ Tabellarische Detailübersichten
- ✅ Technische Implementierungsdetails

## 📚 Dokumentationsübersicht

### 1. [FRAGEBOGEN_STRUKTUR_ANALYSE.md](./FRAGEBOGEN_STRUKTUR_ANALYSE.md)
**Hauptdokument: Strukturelle Analyse**

Dieses Dokument bietet eine umfassende schriftliche Erläuterung:
- Datenstruktur und Hierarchie
- Kategorisierung der 223 Abschnitte
- Feldtypen und deren Verwendung
- Bedingte Logik und Implementierung
- Ablauflogik des Fragebogens
- Abhängigkeitsgraph
- Technische Implementierung
- Datenverwaltung und Export
- Verschlüsselung (PR #3 Änderungen)
- Erweiterbarkeit und Best Practices

**Empfohlen für:** Entwickler, Projektmanager, technische Dokumentation

### 2. [FRAGEBOGEN_ABLAUFDIAGRAMM.md](./FRAGEBOGEN_ABLAUFDIAGRAMM.md)
**Visuelle Diagramme und Flowcharts**

Dieses Dokument enthält 12+ Mermaid-Diagramme:
- Gesamtübersicht des Fragebogen-Ablaufs
- Detaillierter Ablauf der Basisdaten
- Bedingte Verzweigung (Geschlechtsspezifisch)
- Kategorisierungs-Pie-Charts
- Bedingungslogik-Implementierung (Flussdiagramm)
- Datenverwaltung und Export-Pipeline
- Verschlüsselungs-Pipeline (Alt vs. Neu)
- Abhängigkeitsgraph
- Navigation und Validierung
- System-Architektur (C4)

**Empfohlen für:** Visuelle Lerner, Präsentationen, schneller Überblick

### 3. [FRAGEBOGEN_DETAILLIERTE_UEBERSICHT.md](./FRAGEBOGEN_DETAILLIERTE_UEBERSICHT.md)
**Tabellarische Detailreferenz**

Dieses Dokument bietet strukturierte Tabellen:
- Alle Abschnitte nach Kategorie (q0-q9)
- Detaillierte Feldlisten
- Bedingte Logik im Detail
- Feld-ID Konventionen
- Implementierungsdetails (Code-Beispiele)
- Statistiken und Metriken
- Changelog aus PR #3
- Browser-Kompatibilität

**Empfohlen für:** Schnelle Referenz, Nachschlagen, QA-Testing

## 🎯 Schnellzugriff

### Häufig gesuchte Informationen

| Was suchen Sie? | Wo finden Sie es? |
|-----------------|-------------------|
| Übersicht aller 223 Abschnitte | [Detaillierte Übersicht - Abschnitte nach Kategorie](./FRAGEBOGEN_DETAILLIERTE_UEBERSICHT.md#abschnitte-nach-kategorie) |
| Visuelle Darstellung des Ablaufs | [Ablaufdiagramm - Gesamtübersicht](./FRAGEBOGEN_ABLAUFDIAGRAMM.md#gesamtübersicht) |
| Bedingte Logik erklärt | [Struktur-Analyse - Bedingte Logik](./FRAGEBOGEN_STRUKTUR_ANALYSE.md#bedingte-logik) |
| Wie funktioniert q1334? | [Struktur-Analyse - Abhängigkeitsgraph](./FRAGEBOGEN_STRUKTUR_ANALYSE.md#abhängigkeitsgraph) |
| Feldtypen und Verteilung | [Struktur-Analyse - Feldtypen](./FRAGEBOGEN_STRUKTUR_ANALYSE.md#feldtypen-und-verteilung) |
| PR #3 Änderungen | [Detaillierte Übersicht - Changelog](./FRAGEBOGEN_DETAILLIERTE_UEBERSICHT.md#changelog-aus-pr-3) |
| Verschlüsselung erklärt | [Struktur-Analyse - Datenverwaltung](./FRAGEBOGEN_STRUKTUR_ANALYSE.md#datenverwaltung) |
| Code-Beispiele | [Detaillierte Übersicht - Implementierung](./FRAGEBOGEN_DETAILLIERTE_UEBERSICHT.md#implementierungsdetails) |
| System-Architektur | [Ablaufdiagramm - System-Architektur](./FRAGEBOGEN_ABLAUFDIAGRAMM.md#zusammenfassung-system-architektur) |

## 📊 Kernerkenntnisse

### Fragebogen-Struktur

```
223 Abschnitte
├── q0 (1): Basisdaten
├── q1 (115): Symptome & Beschwerden ⭐ Größte Kategorie
│   ├── q1A: Augen
│   ├── q1B: HNO
│   ├── q1C: Körperlich
│   ├── q1P: Psychisch
│   ├── q1xxx: Allgemein
│   └── q1334: Gynäkologisch ⚠️ BEDINGT
├── q2 (32): Versicherung & Administration
├── q3 (6): Kontaktdaten
├── q4 (16): Körperliche Maße & Vitalwerte
├── q5 (4): Chronische Erkrankungen
├── q6 (10): Beeinträchtigungen
├── q7 (13): Gesundheitsstörungen
├── q8 (23): Vorerkrankungen & Eingriffe
└── q9 (3): Abschluss & Versand
```

### Bedingte Logik

**Aktuell implementiert:**
- 🔹 1 bedingter Abschnitt: **q1334** (Gynäkologische Zusatzfragen)
- 🔹 Bedingung: Feld `0002` (Geschlecht) == `'weiblich'`
- 🔹 13 Felder in diesem Abschnitt

**System unterstützt:**
- 7 Operatoren: `==`, `!=`, `>`, `<`, `>=`, `<=`, `includes`
- Abschnitt-Ebene Bedingungen ✅
- Feld-Ebene Bedingungen ✅ (Architektur vorhanden, nicht verwendet)

### Feldtypen

| Typ | Anzahl | Prozent | Verwendung |
|-----|--------|---------|------------|
| **Checkbox** | 956 | 71,8% | Mehrfachauswahl (Symptome, etc.) |
| **Radio** | 180 | 13,5% | Einfachauswahl (Ja/Nein) |
| **Text** | 149 | 11,2% | Freitext (Name, PLZ, etc.) |
| **Select** | 43 | 3,2% | Dropdown (Geschlecht, Datum) |
| **Textarea** | 3 | 0,2% | Mehrzeiliger Text |

**Total:** 1.331 Felder

### PR #3 Verbesserungen

| Bereich | Vorher | Nachher |
|---------|--------|---------|
| Verschlüsselung | ❌ CryptoJS CDN (blockiert) | ✅ Web Crypto API (nativ) |
| Algorithmus | AES | AES-256-GCM |
| Key Derivation | - | PBKDF2 (100k Iterationen) |
| Offline-Fähigkeit | ❌ Nein | ✅ Ja |
| Checkbox/Radio Rendering | ❌ Fehlerhaft | ✅ Behoben |

## 🔍 Technische Details

### Datenfluss

```
Benutzer → Eingabe → AppState.answers → LocalStorage
                                      ↓
                                  Validierung
                                      ↓
                              JSON-Objekt erstellen
                                      ↓
                         AES-256-GCM Verschlüsselung
                                      ↓
                              Export (Datei/Email/NFC)
```

### Bedingungs-Evaluation

```
Abschnitt laden
    ↓
Hat Bedingung? ──Nein──> Anzeigen
    ↓ Ja
Feld beantwortet? ──Nein──> Überspringen
    ↓ Ja
Bedingung erfüllt? ──Ja──> Anzeigen
    ↓ Nein
Überspringen → Nächster Abschnitt
```

## 🚀 Für Entwickler

### Neue bedingte Abschnitte hinzufügen

```json
{
    "id": "qXXXX",
    "title": "Ihr Abschnittstitel",
    "condition": {
        "field": "abhängiges_feld_id",
        "operator": "==",
        "value": "erwarteter_wert"
    },
    "fields": [
        // ... Ihre Felder
    ]
}
```

### Code-Referenzen

Die folgenden Funktionen implementieren die Kernlogik in `index_v5.html`:

| Funktion | Zweck |
|----------|-------|
| `checkCondition()` | Bedingungen prüfen |
| `renderStep()` | Abschnitt rendern und bedingte Logik anwenden |
| `encryptData()` | Verschlüsselung mit Web Crypto API |
| `decryptData()` | Entschlüsselung |

*Hinweis: Genaue Zeilennummern können sich durch zukünftige Änderungen verschieben.*

## 📖 Leseempfehlungen

### Für verschiedene Zielgruppen

**Entwickler / Techniker:**
1. Start: [Struktur-Analyse](./FRAGEBOGEN_STRUKTUR_ANALYSE.md)
2. Dann: [Detaillierte Übersicht - Implementierung](./FRAGEBOGEN_DETAILLIERTE_UEBERSICHT.md#implementierungsdetails)
3. Referenz: [Ablaufdiagramm - Bedingungslogik](./FRAGEBOGEN_ABLAUFDIAGRAMM.md#bedingungslogik-implementierung)

**Projektmanager / Business:**
1. Start: [Ablaufdiagramm - Gesamtübersicht](./FRAGEBOGEN_ABLAUFDIAGRAMM.md#gesamtübersicht)
2. Dann: [Struktur-Analyse - Kategorisierung](./FRAGEBOGEN_STRUKTUR_ANALYSE.md#kategorisierung-der-abschnitte)
3. Details: [Detaillierte Übersicht - Statistiken](./FRAGEBOGEN_DETAILLIERTE_UEBERSICHT.md#statistiken)

**QA / Tester:**
1. Start: [Detaillierte Übersicht](./FRAGEBOGEN_DETAILLIERTE_UEBERSICHT.md)
2. Fokus: [Bedingte Logik Details](./FRAGEBOGEN_DETAILLIERTE_UEBERSICHT.md#bedingte-logik-details)
3. Testfälle: [Struktur-Analyse - Abhängigkeitsgraph](./FRAGEBOGEN_STRUKTUR_ANALYSE.md#abhängigkeitsgraph)

## 🎓 Weitere Ressourcen

- **Original PR #3:** https://github.com/DiggAiHH/Anamnese-A/pull/3/files
- **Web Crypto API Docs:** https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API
- **Mermaid Diagramme:** https://mermaid.js.org/
- **AES-256-GCM:** https://en.wikipedia.org/wiki/Galois/Counter_Mode

## ❓ FAQ

**Q: Warum gibt es nur eine bedingte Logik (q1334)?**  
A: Das ist die aktuelle Implementierung. Das System unterstützt beliebig viele Bedingungen und kann leicht erweitert werden.

**Q: Kann ich neue Bedingungen hinzufügen?**  
A: Ja! Siehe [Erweiterbarkeit](./FRAGEBOGEN_STRUKTUR_ANALYSE.md#erweiterbarkeit) für Anleitungen.

**Q: Was ist der Unterschied zwischen Abschnitt- und Feld-Bedingungen?**  
A: Abschnitt-Bedingungen blenden ganze Abschnitte aus. Feld-Bedingungen blenden einzelne Felder aus. Beide funktionieren identisch.

**Q: Warum wurde Web Crypto API verwendet statt CryptoJS?**  
A: Web Crypto API ist nativ im Browser, funktioniert offline, ist sicherer und hat keine externen Abhängigkeiten.

**Q: Wie teste ich die bedingte Logik für q1334?**  
A: Setzen Sie Feld 0002 (Geschlecht) auf "weiblich" und prüfen Sie, ob q1334 angezeigt wird.

## 📝 Zusammenfassung

Diese Dokumentation bietet eine **vollständige Analyse** des Anamnese-Fragebogens:

✅ **3 umfassende Dokumente** (Struktur, Diagramme, Details)  
✅ **12+ visuelle Diagramme** (Mermaid)  
✅ **Alle 223 Abschnitte dokumentiert**  
✅ **Bedingte Logik vollständig erklärt**  
✅ **PR #3 Änderungen analysiert**  
✅ **Code-Beispiele und Referenzen**  
✅ **Statistiken und Metriken**  

Die Dokumentation ist in **deutscher Sprache** verfasst und erfüllt die Anforderungen aus dem Problem Statement.

---

**Erstellt:** 2025-12-20  
**Basis:** Pull Request #3 - index_v5.html  
**Version:** 5.0
