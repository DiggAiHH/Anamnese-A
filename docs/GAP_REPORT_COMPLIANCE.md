# Compliance GAP Report (ISO 13485 / ISO 27001 / MDR / DSGVO)

| Bereich | Anforderung | Status (Ist) | GAP / Maßnahme | Priorität |
|---------|-------------|--------------|----------------|-----------|
| Qualitätsmanagement (ISO 13485) | QMS-Dokumentation, SOPs für Design Control, CAPA | Teilweise vorhanden (Projekt-Dokus, aber kein formales QMS) | QMS-Handbuch, SOPs für Design Reviews, Change Control, CAPA-Prozess erstellen | Hoch |
| Qualitätsmanagement (ISO 13485) | Traceability (Requirement → Risk → Test) | Anforderungen & Tests vorhanden, aber keine verlinkte Matrix | Traceability Matrix erstellen (Requirement, Hazard, Test Evidence) | Hoch |
| Qualitätsmanagement (ISO 13485) | Supplier Management | Keine dokumentierte Bewertung für externe Komponenten (Stripe, Bootstrap, Vosk) | Supplier Evaluation + Verträge/DPAs dokumentieren | Mittel |
| Informationssicherheit (ISO 27001) | ISMS Scope, Risikoanalyse, Statement of Applicability | Nicht dokumentiert | ISMS erstellen (Scope, Asset Register, IS-Risikoanalyse, SoA) | Hoch |
| Informationssicherheit (ISO 27001) | Backup/Restore & DR-Plan | Teilweise (Docker Compose) aber kein dokumentierter DR-Plan | DR-Plan + regelmäßige Restore-Tests dokumentieren | Mittel |
| MDR | Intended Use, Klassifizierung, GSPRs | Nicht formalisiert | Dokumente: Intended Use, Risiko-Klasse (wahrscheinlich Klasse I), GSPR-Checkliste | Hoch |
| MDR | Software Risk Management nach IEC 62304 / ISO 14971 | Hazard-Analysen nicht dokumentiert | Hazard & Risk File erstellen, Mitigation Traceability | Hoch |
| MDR | Klinische Bewertung / PMS | Nicht vorhanden | Plan für klinische Bewertung (Literatur) & PMS-Plan erstellen | Mittel |
| DSGVO | Verzeichnis Verarbeitungstätigkeiten | Teilweise (README) aber kein VVT | VVT erstellen inkl. Rechtsgrundlagen, Speicherfristen | Hoch |
| DSGVO | TOMs & Data Protection Impact Assessment | DP Impact Assessment existiert (AI_PRIVACY_IMPACT_ASSESSMENT.md) aber TOMs fehlen | Techn./organis. Maßnahmen (Encryption, Access Control, Offline Mode) dokumentieren | Mittel |
| DSGVO | Betroffenenrechte (Löschung, Export) | Funktionen vorhanden, aber kein SOP | SOP für Auskunft/Löschung/Portabilität | Mittel |
| OWASP/ Security | Threat Modeling, Pentest Plan | Nicht dokumentiert | STRIDE/LINDDUN Threat Model + regelmäßige Pentest/Pentest-Plan | Mittel |
| DevSecOps | SBOM, Dependency Monitoring | Nicht implementiert | SBOM Prozess (CycloneDX), Dependabot/Snyk Setup | Mittel |
| Release & Validation | Intended Environment, Installation/Update SOP | Nicht dokumentiert | Release SOP (Docker, Mobile Stores) + Installation/Update Anleitung | Mittel |

## Nächste Schritte
1. QMS- und ISMS-Dokumentenstruktur definieren (Ordner docs/compliance/...).
2. Traceability-Matrix und Risikoakten anlegen.
3. ISMS-Risikoanalyse + Statement of Applicability.
4. MDR-Dokumente (Intended Use, GSPR, PMS) erstellen.
5. DSGVO-Verzeichnis & TOMs ergänzen.
6. Threat Model & SBOM Prozess implementieren.
