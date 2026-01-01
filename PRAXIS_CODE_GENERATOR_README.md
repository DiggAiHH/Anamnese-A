# Praxis-Code-Generator für digitale Anamnese

Eine Single-Page Web Application für medizinische Einrichtungen zur Generierung von AES-256-verschlüsselten Zugangscodes für digitale Anamnesebögen mit Stripe-Payment-Integration.

## 📋 Inhaltsverzeichnis

- [Überblick](#überblick)
- [Features](#features)
- [Installation](#installation)
- [Konfiguration](#konfiguration)
- [Verwendung](#verwendung)
- [API-Dokumentation](#api-dokumentation)
- [Deployment](#deployment)
- [Sicherheit](#sicherheit)
- [DSGVO-Compliance](#dsgvo-compliance)
- [Development & Testing](#-development--testing-neu)
- [Troubleshooting](#troubleshooting)

## Überblick

Der Praxis-Code-Generator ermöglicht es medizinischen Einrichtungen, sichere Zugangscodes für digitale Anamnesebögen zu erstellen. Der Prozess umfasst:

1. **Praxis-Authentifizierung** über UUID
2. **Auswahl des Eingabemodus** (Praxis oder Patient)
3. **Sprachauswahl** aus 13 verfügbaren Optionen
4. **Optional: Patientendaten-Eingabe**
5. **Stripe-Zahlung** (0,99 € inkl. MwSt.)
6. **Code-Generierung** mit QR-Code und PDF-Download

## Features

### Frontend
- ✅ Responsive Design mit Bootstrap 5
- ✅ Multi-Step-Formular mit Validierung
- ✅ 13 Sprachoptionen
- ✅ QR-Code-Generierung
- ✅ Toast-Benachrichtigungen
- ✅ Accessibility (WCAG 2.1 Level AA)
- ✅ Content Security Policy

### Backend
- ✅ Node.js + Express
- ✅ PostgreSQL-Datenbankintegration
- ✅ Stripe-Payment-Integration
- ✅ AES-256-GCM-Verschlüsselung
- ✅ Rate Limiting (100 req/15min)
- ✅ Helmet.js Security Headers
- ✅ Winston Logging
- ✅ Joi Input-Validierung
- ✅ DSGVO-konformes Audit-Logging

### Sicherheit
- ✅ AES-256-GCM Verschlüsselung
- ✅ HMAC-basierte Session-Secrets
- ✅ Input-Validierung auf Client und Server
- ✅ Rate Limiting
- ✅ Helmet.js Security Headers
- ✅ Audit-Logging (DSGVO Art. 30)

## Installation

### Voraussetzungen

- Node.js 18.x oder höher
- PostgreSQL 14.x oder höher
- Stripe-Account (Test-Modus für Entwicklung)

### Schritt 1: Repository klonen

```bash
git clone https://github.com/DiggAiHH/Anamnese-A.git
cd Anamnese-A
```

### Schritt 2: Dependencies installieren

```bash
npm install
```

### Schritt 3: Datenbank einrichten

```bash
# PostgreSQL installieren (falls noch nicht vorhanden)
# Für Ubuntu/Debian:
sudo apt-get install postgresql postgresql-contrib

# Datenbank erstellen
sudo -u postgres createdb anamnese
sudo -u postgres createuser anamnese_user

# Schema importieren
psql -U postgres -d anamnese -f database/schema.sql
```

### Schritt 4: Umgebungsvariablen konfigurieren

```bash
# .env-Datei aus Vorlage erstellen
cp .env.example .env

# .env-Datei bearbeiten und folgende Werte setzen:
# - DATABASE_URL
# - STRIPE_SECRET_KEY
# - STRIPE_PUBLISHABLE_KEY
# - STRIPE_WEBHOOK_SECRET
# - MASTER_KEY (generieren mit: openssl rand -hex 32)
# - SESSION_SECRET (generieren mit: openssl rand -hex 32)
```

### Schritt 5: Test-Praxis anlegen

```bash
# PostgreSQL-Shell öffnen
psql -U postgres -d anamnese

# Test-Praxis einfügen
INSERT INTO practices (name, email, active) 
VALUES ('Test-Praxis', 'practice@invalid.test', true);

# UUID der Praxis notieren
SELECT id FROM practices WHERE email = 'practice@invalid.test';
```

### Schritt 6: Server starten

```bash
# Entwicklungsmodus
npm run dev

# Produktionsmodus
npm start
```

Die Anwendung ist nun unter `http://localhost:3000` erreichbar.

## Konfiguration

### Umgebungsvariablen

| Variable | Beschreibung | Beispiel |
|----------|--------------|----------|
| `NODE_ENV` | Umgebung (development/production) | `production` |
| `PORT` | Server-Port | `3000` |
| `DATABASE_URL` | PostgreSQL-Verbindungsstring | `postgresql://user:pass@localhost:5432/anamnese` |
| `STRIPE_SECRET_KEY` | Stripe Secret Key | `sk_test_...` |
| `STRIPE_PUBLISHABLE_KEY` | Stripe Publishable Key | `pk_test_...` |
| `STRIPE_WEBHOOK_SECRET` | Stripe Webhook Secret | `whsec_...` |
| `MASTER_KEY` | 32-Byte Hex-String für Verschlüsselung | `abc123...` |
| `SESSION_SECRET` | Session-Secret | `xyz789...` |
| `FRONTEND_URL` | Frontend-URL für Stripe-Redirects | `https://anamnese-admin.example.com` |
| `ANAMNESE_BASE_URL` | Basis-URL der Anamnese-Anwendung | `https://anamnese.example.com` |

### Stripe-Konfiguration

1. **Account erstellen** auf [stripe.com](https://stripe.com)
2. **API-Keys abrufen** unter Developers → API keys
3. **Webhook einrichten**:
   - URL: `https://ihre-domain.de/webhook`
   - Events: `checkout.session.completed`
   - Secret notieren und in `.env` eintragen

### Stripe-Publishable-Key im Frontend

Bearbeiten Sie `public/js/app.js` und setzen Sie den Stripe-Publishable-Key:

```javascript
const stripe = Stripe('pk_test_YOUR_ACTUAL_KEY');
```

**Hinweis:** In Produktion sollte dieser Wert über eine sichere Konfigurationsdatei oder Umgebungsvariable gesetzt werden.

## Verwendung

### 1. Praxis-Login

- Öffnen Sie die Anwendung im Browser
- Geben Sie die Praxis-ID (UUID) ein
- System validiert die ID und zeigt den Praxisnamen an

### 2. Modus auswählen

Zwei Optionen:
- **Praxis gibt Daten ein**: Praxis füllt Patientendaten direkt aus
- **Patient füllt selbst aus**: Patient erhält Link zum selbständigen Ausfüllen

### 3. Sprache wählen

13 verfügbare Optionen:
- Deutsch
- Deutsch + Englisch/Arabisch/Türkisch/Ukrainisch/Polnisch/Farsi/Urdu/Pashto/Spanisch/Französisch/Italienisch/Russisch

### 4. Patientendaten eingeben (nur bei Modus "Praxis")

- Vorname (Pflichtfeld)
- Nachname (Pflichtfeld)
- Geburtsdatum (Pflichtfeld)
- Adresse (optional)

### 5. Zahlung durchführen

- Zusammenfassung prüfen
- Weiterleitung zu Stripe Checkout
- Zahlung von 0,99 € (inkl. MwSt.) durchführen
- Automatische Rückleitung zur Anwendung

### 6. Code erhalten

Nach erfolgreicher Zahlung:
- QR-Code anzeigen und scannen
- Code kopieren
- PDF mit Code herunterladen

## API-Dokumentation

### POST `/api/validate-practice`

Validiert eine Praxis-ID.

**Request:**
```json
{
  "practiceId": "123e4567-e89b-12d3-a456-426614174000"
}
```

**Response (Erfolg):**
```json
{
  "valid": true,
  "name": "Praxis Dr. Müller",
  "secret": "abc123..."
}
```

**Response (Fehler):**
```json
{
  "valid": false
}
```

### POST `/api/create-checkout-session`

Erstellt eine Stripe-Checkout-Session.

**Request:**
```json
{
  "practiceId": "123e4567-e89b-12d3-a456-426614174000",
  "mode": "practice",
  "language": "de-en",
  "patientData": {
    "firstName": "Max",
    "lastName": "Mustermann",
    "birthDate": "1990-01-01",
    "address": "Musterstraße 1, 12345 Musterstadt"
  }
}
```

**Response:**
```json
{
  "sessionId": "cs_test_..."
}
```

### POST `/webhook`

Stripe-Webhook-Endpoint (nur von Stripe aufzurufen).

### GET `/api/code/:sessionId`

Ruft einen generierten Code ab.

**Response:**
```json
{
  "code": "encrypted_base64_code",
  "language": "de-en",
  "mode": "practice"
}
```

### GET `/health`

Health-Check-Endpoint.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## Deployment

### Docker Deployment

#### Schritt 1: Umgebungsvariablen setzen

```bash
# Erstellen Sie eine .env-Datei mit allen erforderlichen Variablen
cp .env.example .env
nano .env
```

#### Schritt 2: Master-Key generieren

```bash
# Generieren Sie einen sicheren 32-Byte Hex-String
openssl rand -hex 32
```

#### Schritt 3: Docker Compose starten

```bash
docker-compose up -d
```

#### Schritt 4: Logs überprüfen

```bash
docker-compose logs -f app
```

#### Schritt 5: Datenbank initialisieren

```bash
# Test-Praxis anlegen
docker-compose exec db psql -U anamnese_user -d anamnese -c \
  "INSERT INTO practices (name, email, active) VALUES ('Test-Praxis', 'practice@invalid.test', true);"
```

### Cloud Deployment (Heroku, AWS, etc.)

Siehe [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) für detaillierte Anweisungen.

## Sicherheit

### Verschlüsselung

- **Algorithmus**: AES-256-GCM
- **Key Derivation**: PBKDF2 mit 100.000 Iterationen
- **IV**: 12 Bytes, zufällig generiert
- **Auth Tag**: 16 Bytes

### Best Practices

1. **Secrets niemals im Code**: Verwenden Sie Umgebungsvariablen
2. **HTTPS verwenden**: In Produktion nur über HTTPS erreichbar
3. **Master-Key sicher speichern**: Verwenden Sie ein Secrets-Management-System
4. **Regelmäßige Updates**: Halten Sie alle Dependencies aktuell
5. **Backup-Strategie**: Regelmäßige Backups der Datenbank

### Rate Limiting

- **100 Requests pro 15 Minuten** pro IP-Adresse
- Bei Überschreitung: HTTP 429 (Too Many Requests)

### Security Headers (Helmet.js)

- Content-Security-Policy
- X-Content-Type-Options
- X-Frame-Options
- X-XSS-Protection
- Strict-Transport-Security (HSTS)

## DSGVO-Compliance

### Rechtsgrundlagen

- **Art. 6 DSGVO**: Vertragserfüllung (Bezahlung für Code-Generierung)
- **Art. 32 DSGVO**: Sicherheit der Verarbeitung (AES-256-Verschlüsselung)
- **Art. 30 DSGVO**: Verzeichnis von Verarbeitungstätigkeiten (Audit-Log)

### Datenminimierung

- Nur notwendige Daten werden erhoben
- Patientendaten nur bei Modus "Praxis"
- Keine unnötige Speicherung

### Audit-Logging

Alle wichtigen Aktionen werden protokolliert:
- Praxis-Validierung
- Code-Generierung
- Code-Abruf
- Fehlerhafte Zugriffsversuche

### Datenschutz-Maßnahmen

1. **Verschlüsselung**: Alle sensiblen Daten verschlüsselt
2. **Zugriffskontrolle**: Nur autorisierte Praxen können Codes generieren
3. **Audit-Trail**: Vollständige Nachverfolgbarkeit
4. **Datenminimierung**: Nur erforderliche Daten werden gespeichert
5. **Speicherbegrenzung**: Codes können ablaufen (optional)

## Troubleshooting

### Problem: Datenbank-Verbindung schlägt fehl

**Lösung:**
- Prüfen Sie `DATABASE_URL` in `.env`
- Stellen Sie sicher, dass PostgreSQL läuft
- Überprüfen Sie Firewall-Einstellungen

### Problem: Stripe-Webhook funktioniert nicht

**Lösung:**
- Prüfen Sie `STRIPE_WEBHOOK_SECRET` in `.env`
- Testen Sie Webhook mit Stripe CLI:
  ```bash
  stripe listen --forward-to localhost:3000/webhook
  ```
- Überprüfen Sie Webhook-Logs im Stripe-Dashboard

### Problem: Code kann nicht abgerufen werden

**Lösung:**
- Prüfen Sie ob Zahlung erfolgreich war
- Überprüfen Sie Webhook-Logs
- Prüfen Sie `codes`-Tabelle in der Datenbank

### Problem: QR-Code wird nicht angezeigt

**Lösung:**
- Prüfen Sie Browser-Console auf Fehler
- Stellen Sie sicher, dass qrcode.js geladen wird
- Überprüfen Sie Content-Security-Policy

## FAQ

### Kann ich den Preis ändern?

Ja, bearbeiten Sie in `server.js` die Zeile:
```javascript
unit_amount: 99, // 0,99€ in Cent
```

### Wie füge ich eine neue Praxis hinzu?

```sql
INSERT INTO practices (name, email, active) 
VALUES ('Praxisname', 'email@example.com', true);
```

### Wie deaktiviere ich eine Praxis?

```sql
UPDATE practices SET active = false WHERE id = 'UUID';
```

### Können Codes mehrfach verwendet werden?

Standardmäßig ja. Um die Verwendung zu limitieren, implementieren Sie eine Prüfung im Anamnese-System:
```sql
UPDATE codes SET used = true, used_at = NOW() 
WHERE code = 'encrypted_code' AND used = false;
```

## 🧪 Development & Testing (NEU)

### Dev Bypass Mode

Für Test- und Entwicklungszwecke kann ein **Payment-Bypass-Modus** aktiviert werden, der es ermöglicht, alle Funktionen ohne echte Stripe-Zahlungen zu testen.

**⚠️ WARNUNG: NUR für Development/Testing - NIEMALS in Production!**

#### Aktivierung

1. Erstellen Sie eine `.env` Datei:
   ```bash
   NODE_ENV=development
   DEV_BYPASS_PAYMENT=true
   # ... andere Variablen
   ```

2. Starten Sie den Server:
   ```bash
   npm run dev
   ```

3. Öffnen Sie die Test-Seite:
   ```
   http://localhost:3000/index_nopay.html
   ```

#### Sicherheitsmechanismen

- **Production-Safety**: Bypass ist automatisch deaktiviert wenn `NODE_ENV=production`
- **Explizite Opt-in**: Muss über `DEV_BYPASS_PAYMENT=true` aktiviert werden
- **Audit-Logging**: Alle Bypass-Codes werden mit Status `dev_bypass` protokolliert
- **Kennung**: Pseudo-Session-IDs beginnen mit `dev_bypass_`

#### Funktionsweise

Im Bypass-Modus:
- Keine Stripe-SDK-Initialisierung
- Sofortige Code-Generierung ohne Zahlung
- UI zeigt "⚠️ Testmodus: Keine Zahlung erforderlich"
- Alle anderen Features funktionieren normal (QR-Code, PDF, etc.)

**Vollständige Dokumentation**: Siehe [README_DEV_BYPASS.md](README_DEV_BYPASS.md)

## Support

Bei Fragen oder Problemen:
- **E-Mail**: support@example.com
- **GitHub Issues**: [https://github.com/DiggAiHH/Anamnese-A/issues](https://github.com/DiggAiHH/Anamnese-A/issues)

## Lizenz

Copyright © 2024 DiggAi GmbH. All rights reserved.

---

**Hinweis**: Diese Anwendung dient der Verarbeitung medizinischer Daten. Stellen Sie sicher, dass alle rechtlichen Anforderungen in Ihrer Jurisdiktion erfüllt sind, bevor Sie die Anwendung produktiv einsetzen.
