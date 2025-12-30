# Screenreader Test Plan (WCAG 2.1 AA)

## Scope
- Zielseiten: index_v8_complete.html (Prod), index.html (Fallback)
- Geräte: Desktop (Windows/macOS), Mobile (Android/iOS)
- Fokus: Formular-Navigation, Fehlermeldungen, Live-Regions (Save-Indicator), Modals (Privacy/OCR)

## Tools
- Windows: NVDA (kostenlos), JAWS (kommerziell)
- macOS: VoiceOver (built-in)
- iOS/iPadOS: VoiceOver (built-in)
- Android: TalkBack (built-in)

## Test Cases
1) **Global Navigation**
   - Tab/Fokus-Reihenfolge folgt visueller Reihenfolge.
   - Skip-Links funktionieren ("Zum Hauptinhalt" und "Skip to language selector").
2) **Form Fields**
   - Alle Pflichtfelder werden mit Pflicht-Hinweis vorgelesen.
   - Radiobuttons/Selects haben verständliche Labels (Geschlecht, Tag/Monat/Jahr).
3) **Validation & Errors**
   - Fehlermeldungen erscheinen im Lesefluss nach dem Feld und werden angesagt.
   - Ungültiges Geburtsdatum (31.02, >120 Jahre, <1 Tag) löst verständliche Meldung aus.
4) **Modals**
   - Privacy-Modal: Fokus wird ins Modal gesetzt; ESC/Close schließt und Fokus kehrt zurück.
   - OCR-Einwilligung: Checkbox & Buttons haben Namen, Fokus bleibt im Modal.
5) **Live Regions / Status**
   - Save-Indicator (Auto-Save) wird als Status/Live Region angesagt ("gespeichert").
6) **Buttons/Icons**
   - Icon-only Buttons besitzen `aria-label` (Dark-Mode, Export, OCR-Aktionen).
7) **Language Switch**
   - Wechsel DE→EN→FR ändert Sprache des Headings und wird angesagt; `lang`-Attribut passt.
8) **Document Upload/OCR**
   - Dateiauswahl ist per Tastatur bedienbar; Fortschritt/Rückmeldung wird angesagt.

## Acceptance
- Keine Blocker (keine unbeschrifteten interaktiven Elemente).
- Fokus-Management korrekt für alle Modals.
- Fehler- und Statusmeldungen werden vorgelesen.
- Dokumentation von Abweichungen mit Screenshot/Notiz in SESSION_SUMMARY.
