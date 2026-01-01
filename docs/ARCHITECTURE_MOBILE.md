# Mobile Architektur – Anamnese-A

## Ziel
Trennung zwischen Web-PWA (`app/v8-complete-isolated`) und nativer Mobile-App (Ordner `mobile-app/`, React Native 0.73).

## Komponenten
- **UI Layer**: React Native Screens (`src/screens/*`), Navigation via `@react-navigation/native`.
- **State**: Zustand-Store (`src/store/index.ts`) mit verschlüsseltem Persist (AsyncStorage + React Native Keychain für Master Key).
- **Krypto**: `react-native-quick-crypto`, `react-native-get-random-values`, AES-256-GCM Wrapper analog zu Web `encryption.js`.
- **OCR**: `react-native-tesseract-ocr` (Geräte-intern, keine Cloud), Consent-Flow analog Web.
- **Speech**: `@react-native-voice/voice` + optional Vosk-Model in `assets/vosk/` (Download durch Installer/First-Run, Hash-Check TBD).
- **Storage**: SQLite (`react-native-sqlite-storage`) für Offline-Fragebogen + Audit-Log; Filesystem (`react-native-fs`) für Export/Import.
- **Compliance Hooks**: AuditLog-Service (writes JSON lines), ConsentScreens (Privacy/OCR), Emergency wipe (Keychain reset).

## Build/Deploy
- Separate Node workspace (`mobile-app/package.json`).
- Commands: `npm run android`, `npm run ios`, `npm run test`, `npm run test:e2e` (Detox).
- Output Artifacts signiert per App Store / Play Store, Releases dokumentiert in SBOM & Release SOP.

## Shared Assets Plan
- Übersetzungen, Fragebogendefinition (`APP_DATA`), Validierungen → Export aus Web (`shared/app-data.json`).
- Encryption/OCR/Vosk Helper → extrahieren nach `/shared/` (TO-DO). Beide Plattformen importieren.

## Compliance
- Offline-first, keine externen Requests außer optionale Stripe (bewusst deaktiviert mobile).
- Encryption Mandatory, Keychain + secure wipe.
- Logging: lokale Audit Logs, exportierbar (JSON/GDT) nur mit Consent.

## Nächste Schritte
1. `/shared/` Modul anlegen (Form/Validation/Krypto) → TODO 3.
2. Vosk-Download/H integrity Check → TODO 4.
3. Mobile Test Strategy (TalkBack/VoiceOver, offline resume) → TODO 6.
4. Release+SBOM Dokumentation → TODO 7.
