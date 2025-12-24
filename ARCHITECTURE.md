# 🏗️ Architektur-Dokumentation: Medizinischer Anamnesebogen

## Übersicht

Diese Dokumentation beschreibt die Architektur der Anamnese-Anwendung, einschließlich der Optimierungen für Performance und die Hybrid-Offline/Online-Strategie.

## 📁 Dateistruktur

### Haupt-Dateien

| Datei | Beschreibung | Größe |
|-------|--------------|-------|
| `index_v8_complete.html` | Vollständige Offline-Version mit allen Modulen inline | ~1.3 MB |
| `index.html` | Modulare Version mit externen Skripten | ~50 KB |
| `app.js` | Haupt-Anwendungslogik | ~8 KB |
| `encryption.js` | AES-256-GCM Verschlüsselung | ~7 KB |
| `translations.js` | Multi-Language Support (10 Sprachen) | ~29 KB |

### Inline-Module in `index_v8_complete.html`

```
index_v8_complete.html (28.928 Zeilen, ~1.3 MB)
├── OCR GDPR-Compliance Module (~1.200 Zeilen)
├── APP_DATA mit Translations (~2.500 Zeilen)
│   └── 19 Sprachen inline
├── APP_DATA Sections (~12.500 Zeilen)
│   └── Medizinische Fragen
├── App State & Hilfsfunktionen (~500 Zeilen)
├── Security Utils (~200 Zeilen)
├── Translations Module (~600 Zeilen)
├── Encryption Module (~300 Zeilen)
├── Licensing Module (~450 Zeilen)
├── Stripe Integration (~500 Zeilen)
├── Enhanced Offline Features (~900 Zeilen)
├── GDT Export Module (~650 Zeilen)
├── Vosk Integration (~270 Zeilen)
├── AI Plausibility Check (~700 Zeilen)
├── GDT Import/Templates/UI (~1.000 Zeilen)
├── GDPR Compliance Module (~450 Zeilen)
├── GDT Batch/Audit/Feature Detection (~600 Zeilen)
└── Advanced Improvements (~500 Zeilen)
```

## 🚀 Performance-Optimierungen

### 1. Loading Screen (Implementiert)

```html
<!-- Kritisches CSS inline für sofortige Anzeige -->
<style id="critical-css">
    #loading-screen { ... }
</style>

<!-- Loading Screen im Body-Start -->
<div id="loading-screen">
    <h1>🏥 Medizinischer Anamnesebogen</h1>
    <div class="spinner"></div>
    <div class="progress-text">Anwendung wird geladen...</div>
</div>
```

**Vorteile:**
- Sofortige visuelle Rückmeldung
- Reduzierte wahrgenommene Ladezeit
- Fortschrittsanzeige

### 2. Deferred Script Loading

```html
<!-- Non-blocking: defer für nicht-kritische Scripts -->
<script src="tesseract.js" defer></script>
<script src="pdfjs" defer></script>
<script src="stripe.js" defer></script>

<!-- Kritisch: CryptoJS synchron laden -->
<script src="crypto-js.min.js"></script>
```

**Reihenfolge:**
1. HTML-Parsing beginnt
2. Kritisches CSS wird sofort angewendet
3. Loading Screen erscheint
4. CryptoJS lädt (kritisch für Verschlüsselung)
5. Andere Scripts laden parallel (defer)
6. DOMContentLoaded → App.init()
7. Loading Screen wird ausgeblendet

### 3. Progressive Enhancement

Die App funktioniert in Stufen:
1. **Basis**: Formular + lokale Speicherung
2. **Erweitert**: OCR, PDF-Verarbeitung
3. **Voll**: Stripe-Zahlungen, Vosk-Spracherkennung

## 🔐 Hybrid Offline/Online-Architektur

### Konzept

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT (Browser)                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────────┐    ┌─────────────────────────────┐ │
│  │  KRITISCHE FRAGEN   │    │   UNKRITISCHE FRAGEN        │ │
│  │  (Offline-First)    │    │   (Lazy Loading möglich)    │ │
│  ├─────────────────────┤    ├─────────────────────────────┤ │
│  │ • Basisdaten        │    │ • Lifestyle-Fragen          │ │
│  │ • Diagnosen         │    │ • Präferenzen               │ │
│  │ • Medikamente       │    │ • Zusatzinformationen       │ │
│  │ • Allergien         │    │                             │ │
│  └─────────────────────┘    └─────────────────────────────┘ │
│           │                           │                      │
│           └───────────┬───────────────┘                      │
│                       ▼                                      │
│         ┌─────────────────────────┐                         │
│         │  LOKALE VERSCHLÜSSELUNG │                         │
│         │  (AES-256-GCM)          │                         │
│         └───────────┬─────────────┘                         │
│                     ▼                                        │
│         ┌─────────────────────────┐                         │
│         │  EXPORT/ÜBERTRAGUNG     │                         │
│         │  • JSON (verschlüsselt) │                         │
│         │  • GDT (für PVS)        │                         │
│         │  • E-Mail               │                         │
│         └─────────────────────────┘                         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Datenschutz-Klassifizierung

| Kategorie | Sensibilität | Verarbeitung | Beispiele |
|-----------|--------------|--------------|-----------|
| **Kritisch** | Sehr hoch | Nur offline | Name, Geburtsdatum, Diagnosen |
| **Medizinisch** | Hoch | Nur offline | Medikamente, Allergien |
| **Normal** | Mittel | Offline bevorzugt | Symptome, Beschwerden |
| **Unkritisch** | Niedrig | Online möglich | Präferenzen, Feedback |

### Implementierung

```javascript
// Kritische Fragen: Immer offline
const CRITICAL_SECTIONS = ['q0000', 'q1A00', 'q1B00'];

// Unkritische Fragen: Können lazy geladen werden
const NON_CRITICAL_SECTIONS = ['q2043', 'q2044'];

// Lazy Loading für unkritische Sections
async function loadSectionsLazy(sectionIds) {
    // Nur laden wenn online und nicht im Cache
    if (navigator.onLine && !localStorage.getItem('sections_cache')) {
        const response = await fetch('/api/sections?ids=' + sectionIds.join(','));
        const data = await response.json();
        localStorage.setItem('sections_cache', JSON.stringify(data));
        return data;
    }
    return JSON.parse(localStorage.getItem('sections_cache') || '[]');
}
```

## 🔄 Datenfluss

```
1. Benutzer öffnet App
   ├── Loading Screen erscheint sofort
   ├── Kritische Module laden
   └── App initialisiert

2. Datenschutz-Einwilligung
   ├── Privacy Modal anzeigen
   ├── Einwilligung speichern (localStorage)
   └── Audit-Log erstellen

3. Fragebogen ausfüllen
   ├── Antworten in AppState speichern
   ├── Auto-Save alle 30 Sekunden
   └── Lokale Verschlüsselung

4. Export
   ├── Alle Daten lokal verschlüsseln
   ├── Audit-Log aktualisieren
   └── Export als JSON/GDT/E-Mail
```

## 📊 Speicher-Nutzung

| Storage | Inhalt | Max. Größe |
|---------|--------|------------|
| `localStorage` | Einstellungen, Autosave | 5-10 MB |
| `sessionStorage` | Temporäre Daten, Session-ID | 5 MB |
| `IndexedDB` | Dokumente, große Daten | 50+ MB |

## 🛡️ Sicherheitsarchitektur

### Verschlüsselung

```javascript
// Client-seitige Verschlüsselung
const ENCRYPTION_CONFIG = {
    algorithm: 'AES-GCM',
    keySize: 256,
    ivLength: 12,
    tagLength: 128,
    saltLength: 16,
    iterations: 100000,  // PBKDF2
    hash: 'SHA-256'
};
```

### Content Security Policy

```http
Content-Security-Policy:
    default-src 'self';
    script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net;
    style-src 'self' 'unsafe-inline';
    connect-src 'self' https://api.stripe.com;
    frame-ancestors 'none';
```

## 🔧 Empfohlene Weiterentwicklung

### Phase 1: Modulare Struktur
- Sections in separate JSON-Datei auslagern
- Lazy Loading für nicht-kritische Module
- Service Worker für Caching

### Phase 2: Hybrid-Architektur
- Backend-API für unkritische Daten
- Offline-First mit Sync
- Progressive Web App vollständig

### Phase 3: Optimierung
- Code-Splitting
- Minification der Inline-Scripts
- Brotli/Gzip-Kompression

## 📝 Changelog

### v8.2.0 (2024-12-24)
- ✅ Loading Screen hinzugefügt
- ✅ Deferred Script Loading
- ✅ Progress-Anzeige während Initialisierung
- ✅ Smooth Transition beim Ausblenden

---

*Dokumentation erstellt: 2025-12-24*
