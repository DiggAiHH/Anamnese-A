# Senior-ENG Methodik (Anamnese-A)

Ziel: In Sessions möglichst ohne Rückfragen robuste, DSGVO-sichere Änderungen liefern.

## Default-Assumptions (wenn nicht anders spezifiziert)
- Minimaler Diff (nur notwendige Änderungen)
- Offline-first: keine externen APIs für Datenverarbeitung, kein Tracking
- Keine PII in Logs/Docs (Emails, IPs, Namen, Freitext)
- Dummy-Beispiele ausschließlich mit `invalid.test`
- Bestehende APIs/Dateinamen respektieren (keine unnötigen Umbenennungen)

## Wann Rückfragen erlaubt sind (max. 1–3)
- Blocker: fehlende Secrets/ENV, unklare Single Source of Truth, widersprüchliche Anforderungen
- Hoher Risiko-Branch: mehrere plausible Wege mit Datenverlust-/Security-/Compliance-Risiko

## Vorgehen (kurz)
1. Relevante Files/Interfaces lesen (nicht raten)
2. Kleinsten sicheren Fix implementieren
3. Tests gezielt ausführen (so spezifisch wie möglich)
4. Doku aktualisieren, wenn Onboarding/Beispiele betroffen sind

## Copy/Paste Beispiele (DSGVO-safe)
- User-Email: `user@invalid.test`
- Praxis-Email: `practice@invalid.test`
