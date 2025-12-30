# Plan_neu.md – Abschlussplan (Playwright 100%, Selbsttest, DSGVO)

## Kontext
- Branch: app/v8-complete-isolated
- Aktuell: Einzeltest-Fix (GDPR anonymization) erledigt; voller Suite-Status unbekannt
- Auftrag: Vollsuite prüfen, Selbst-Anamnese durchlaufen, Probleme dokumentieren und beheben (DSGVO/medizinisch sicher)

## Schritte (Priorität)
1) Status erheben
   - Vollständige Playwright-Suite über alle Browser laufen lassen, Logs notieren.
   - Ergebnis-Delta zu Vortag festhalten.

2) Selbst-Anamnese durchführen
   - `index_v8_complete.html` end-to-end ausfüllen (realistische Daten), UX/DSGVO/Med-Fails notieren.
   - Neues Protokoll-Dokument anlegen (Selftest) mit Befunden und Schweregrad.

3) Fehler beheben
   - Playwright-Fails analysieren und fixen (keine Regessions zu Offline/GDPR).
   - Selbsttest-Befunde priorisiert abarbeiten (Sicherheits-/Datenschutz-Themen zuerst).

4) Verifizieren
   - Vollsuite erneut ausführen (alle Browser).
   - Selftest-relevante Pfade nachstellen und prüfen.
   - Ergebnisse in KI-Notizen/Session-Summary vermerken.

## Definition of Done
- Playwright: 42/42 grün (alle Browser)
- Selbsttest: keine Blocker, keine Datenschutz- oder Medizin-Konformitätsverstöße
- Keine neuen externen Assets/Tracker; Consent-/Privacy-Flow intakt
- Ergebnisse dokumentiert (Plan_neu.md aktualisiert, Selftest-Protokoll, Session Summary)
