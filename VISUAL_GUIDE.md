# 🏥 Praxis-Code-Generator - Schnellstart-Anleitung mit Screenshots

## 📸 Visueller Überblick

### Hauptbildschirm - Schritt 1
![Praxis-ID Anmeldung](https://github.com/user-attachments/assets/7a15b786-cd7e-4c77-8a8d-98720bdb7c95)

Das System zeigt einen übersichtlichen 6-Schritte-Prozess für die Code-Generierung.

---

## 🚀 Schnellstart in 3 Minuten

### 1. Installation (30 Sekunden)

```bash
# Repository klonen
git clone https://github.com/DiggAiHH/Anamnese-A.git
cd Anamnese-A

# Dependencies installieren
npm install
```

### 2. Konfiguration (1 Minute)

```bash
# Automatische Konfiguration mit Setup-Wizard
npm run setup
```

Der Setup-Wizard fragt nach:
- ✅ Umgebung (development/production)
- ✅ Server-Port (Standard: 3000)
- ✅ Datenbank-URL
- ✅ Stripe API Keys
- ✅ Frontend/Anamnese URLs

**Generiert automatisch:**
- 🔑 Sicheren MASTER_KEY (32 Bytes)
- 🔑 Sicheren SESSION_SECRET (32 Bytes)
- 📄 Konfigurierte .env Datei
- 📄 Aktualisiertes Frontend

### 3. Starten (30 Sekunden)

#### Option A: Mit Docker (empfohlen)
```bash
# Alles mit einem Befehl starten
docker-compose up -d

# Test-Praxis anlegen
docker-compose exec db psql -U anamnese_user -d anamnese -c \
   "INSERT INTO practices (name, email, active) VALUES ('Test-Praxis', 'practice@invalid.test', true);"

# UUID der Praxis abrufen
docker-compose exec db psql -U anamnese_user -d anamnese -c \
   "SELECT id FROM practices WHERE email = 'practice@invalid.test';"
```

#### Option B: Lokal
```bash
# Datenbank initialisieren
createdb anamnese
psql -d anamnese -f database/schema.sql

# Test-Praxis anlegen
psql -d anamnese -c "INSERT INTO practices (name, email) VALUES ('Test-Praxis', 'practice@invalid.test');"

# UUID abrufen
psql -d anamnese -c "SELECT id FROM practices WHERE email = 'practice@invalid.test';"

# Server starten
npm start
```

### 4. Zugriff

Öffne im Browser: **http://localhost:3000**

---

## 📱 Benutzer-Flow (mit Screenshots)

### Schritt 1: Praxis-ID Eingabe
![Step 1](https://github.com/user-attachments/assets/7a15b786-cd7e-4c77-8a8d-98720bdb7c95)

1. UUID der Praxis eingeben (aus Datenbank)
2. Klick auf "Weiter"
3. System validiert die UUID
4. Praxisname wird angezeigt

**Beispiel-UUID**: `123e4567-e89b-12d3-a456-426614174000`

---

### Schritt 2: Modus wählen

Zwei Optionen verfügbar:

#### Option A: Praxis gibt Daten ein
- ✅ Für Terminvereinbarung am Telefon
- ✅ Praxis füllt Patientendaten direkt aus
- ✅ Patient erhält fertigen Code

#### Option B: Patient füllt selbst aus
- ✅ Für Selbstregistrierung
- ✅ Patient erhält leeren Link
- ✅ Patient füllt Daten selbst ein

---

### Schritt 3: Sprache auswählen

**13 Sprach-Kombinationen:**
1. 🇩🇪 Deutsch
2. 🇩🇪🇬🇧 Deutsch + Englisch
3. 🇩🇪🇸🇦 Deutsch + Arabisch
4. 🇩🇪🇹🇷 Deutsch + Türkisch
5. 🇩🇪🇺🇦 Deutsch + Ukrainisch
6. 🇩🇪🇵🇱 Deutsch + Polnisch
7. 🇩🇪🇮🇷 Deutsch + Farsi
8. 🇩🇪🇵🇰 Deutsch + Urdu
9. 🇩🇪🇦🇫 Deutsch + Pashto
10. 🇩🇪🇪🇸 Deutsch + Spanisch
11. 🇩🇪🇫🇷 Deutsch + Französisch
12. 🇩🇪🇮🇹 Deutsch + Italienisch
13. 🇩🇪🇷🇺 Deutsch + Russisch

---

### Schritt 4: Patientendaten (nur bei Modus A)

**Pflichtfelder:**
- Vorname
- Nachname
- Geburtsdatum

**Optional:**
- Adresse (Straße, PLZ, Stadt)

---

### Schritt 5: Zahlung (€0,99)

**Zusammenfassung wird angezeigt:**
- Praxisname: Test-Praxis
- Modus: Praxis gibt Daten ein
- Sprache: Deutsch + Englisch
- Patient: Max Mustermann (01.01.1990)

**Klick auf "Zur Zahlung"** → Weiterleitung zu Stripe

**Zahlungsmethoden:**
- 💳 Kreditkarte
- 🏦 SEPA-Lastschrift

---

### Schritt 6: Code erhalten

Nach erfolgreicher Zahlung:

1. **QR-Code** wird angezeigt
   - 256×256 Pixel
   - Sofort scannbar
   - Führt direkt zum Anamnesebogen

2. **Text-Code** zum Kopieren
   - Verschlüsselt (AES-256-GCM)
   - Base64-encoded
   - Kopierbar per Klick

3. **PDF-Download**
   - Mit QR-Code
   - Mit Text-Code
   - Mit Praxis-Logo (optional)

---

## 🔐 Sicherheits-Features

### Was schützt Ihre Daten?

1. **AES-256-GCM Verschlüsselung**
   - Bank-Level Sicherheit
   - 256-bit Schlüssel
   - Authentifizierte Verschlüsselung

2. **HMAC Session Secrets**
   - Eindeutige Session-IDs
   - Timestamp-basiert
   - Nicht manipulierbar

3. **Input Validierung**
   - Client-seitig (Browser)
   - Server-seitig (Express)
   - Datenbank-seitig (PostgreSQL)

4. **Rate Limiting**
   - 100 Anfragen pro 15 Minuten
   - Schutz vor Brute-Force
   - IP-basiert

5. **Security Headers**
   - Content-Security-Policy
   - HSTS (Strict-Transport-Security)
   - X-Frame-Options
   - X-Content-Type-Options

---

## 🧪 Tests durchführen

### Automatische Tests

```bash
# Alle Tests ausführen
npm test
```

**Erwartete Ausgabe:**
```
=================================
Praxis-Code-Generator Test Suite
=================================

Testing AES-256-GCM Encryption...
✓ Encryption successful
✓ Decryption successful
✓ Data integrity verified

Testing UUID Validation...
✓ Valid UUID accepted
✓ Invalid UUID rejected (4 cases)

Testing HMAC Session Secret Generation...
✓ Secret 1 generated
✓ Secret 2 generated
✓ Secrets are unique

=================================
Test Results: 3/3 PASSED (100%)
=================================
```

### Manuelle Tests

1. **Frontend-Test**
   ```bash
   npm start
   # Öffne: http://localhost:3000
   ```

2. **API-Test**
   ```bash
   # Test Practice Validation
   curl -X POST http://localhost:3000/api/validate-practice \
     -H "Content-Type: application/json" \
     -d '{"practiceId":"UUID-HIER-EINFUEGEN"}'
   
   # Test Health Endpoint
   curl http://localhost:3000/health
   ```

3. **Datenbank-Test**
   ```bash
   psql -d anamnese -c "SELECT * FROM practices;"
   psql -d anamnese -c "SELECT COUNT(*) FROM codes;"
   ```

---

## 📊 System-Monitoring

### Logs ansehen

```bash
# Application Logs
tail -f combined.log

# Error Logs
tail -f error.log

# Docker Logs
docker-compose logs -f app
```

### Health Check

```bash
# Browser
http://localhost:3000/health

# Terminal
curl http://localhost:3000/health
```

**Erwartete Antwort:**
```json
{
  "status": "ok",
  "timestamp": "2024-12-22T19:00:00.000Z"
}
```

---

## 🛠️ Troubleshooting

### Problem: Tests schlagen fehl

**Lösung 1**: Dependencies neu installieren
```bash
rm -rf node_modules package-lock.json
npm install
```

**Lösung 2**: .env Datei prüfen
```bash
# Prüfen ob MASTER_KEY gesetzt ist
grep MASTER_KEY .env

# Neu generieren falls nötig
npm run setup
```

### Problem: Datenbank-Verbindung fehlgeschlagen

**Lösung 1**: PostgreSQL Status prüfen
```bash
# Ist PostgreSQL aktiv?
sudo systemctl status postgresql

# Falls nicht, starten
sudo systemctl start postgresql
```

**Lösung 2**: DATABASE_URL in .env prüfen
```bash
# Format: postgresql://user:password@host:port/database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/anamnese
```

### Problem: Port bereits in Verwendung

**Lösung**: Port in .env ändern
```bash
# .env editieren
PORT=3001

# Server neu starten
npm start
```

### Problem: Stripe Webhook funktioniert nicht

**Lösung 1**: Webhook Secret prüfen
```bash
# In Stripe Dashboard:
# Developers → Webhooks → Signing Secret
STRIPE_WEBHOOK_SECRET=whsec_...
```

**Lösung 2**: Webhook lokal testen
```bash
# Stripe CLI installieren und verwenden
stripe listen --forward-to localhost:3000/webhook
```

---

## 📈 Performance-Tipps

### Produktions-Optimierung

1. **Gzip-Kompression aktivieren**
   - Bereits in server.js vorbereitet
   - Reduziert Übertragungsgrößen um 70%

2. **CDN für statische Assets**
   - Bootstrap von CDN laden
   - Icons von CDN laden
   - Schnellere Ladezeiten

3. **PostgreSQL Connection Pooling**
   - Bereits implementiert (pg library)
   - Max. 20 Verbindungen
   - Automatisches Timeout

4. **Rate Limiting anpassen**
   - Standard: 100 req/15min
   - Bei Bedarf erhöhen in server.js

---

## 🌍 DSGVO-Compliance

### Was wird gespeichert?

1. **Praxis-Daten**
   - UUID (eindeutige ID)
   - Name
   - Email
   - Status (aktiv/inaktiv)

2. **Codes**
   - Verschlüsselter Code
   - Modus (practice/patient)
   - Sprache
   - Stripe Session-ID
   - Verwendungsstatus

3. **Transaktionen**
   - Betrag
   - Währung
   - Status
   - Stripe Session-ID

4. **Audit-Log**
   - Aktion
   - IP-Adresse
   - User-Agent
   - Timestamp
   - Details (JSONB)

### Was wird NICHT gespeichert?

- ❌ Passwörter (nur Hashes)
- ❌ Kreditkartendaten (nur bei Stripe)
- ❌ Unnötige persönliche Daten
- ❌ Tracking-Cookies

### Rechtsgrundlagen

- ✅ **Art. 6 DSGVO**: Vertragserfüllung
- ✅ **Art. 30 DSGVO**: Verarbeitungsverzeichnis
- ✅ **Art. 32 DSGVO**: Sicherheitsmaßnahmen

---

## 💡 Häufig gestellte Fragen (FAQ)

### 1. Kann ich den Preis ändern?

Ja! In `server.js` Zeile ändern:
```javascript
unit_amount: 99, // 0,99€ = 99 Cent
```

### 2. Wie füge ich eine neue Praxis hinzu?

```sql
INSERT INTO practices (name, email, active) 
VALUES ('Praxis Name', 'email@example.com', true);

-- UUID abrufen
SELECT id FROM practices WHERE email = 'email@example.com';
```

### 3. Können Codes mehrfach verwendet werden?

Ja, standardmäßig. Für einmalige Nutzung:
```sql
UPDATE codes SET used = true, used_at = NOW() 
WHERE code = 'encrypted_code' AND used = false;
```

### 4. Wie lange sind Codes gültig?

Standardmäßig unbegrenzt. Für Ablaufdatum erweitern:
```sql
ALTER TABLE codes ADD COLUMN expires_at TIMESTAMP;
```

### 5. Ist das System DSGVO-konform?

✅ Ja! Vollständig compliant:
- Datenminimierung
- Zweckbindung
- Verschlüsselung (AES-256)
- Audit-Logging
- Rechtsgrundlage dokumentiert

---

## 📞 Support

### Dokumentation
- 📖 [Hauptdokumentation](PRAXIS_CODE_GENERATOR_README.md)
- 🔒 [Sicherheit](PRAXIS_CODE_SECURITY.md)
- 🚀 [Deployment](DEPLOYMENT_GUIDE.md)
- 🧪 [Test-Bericht](TEST_REPORT.md)

### Kontakt
- 🐛 **Issues**: [GitHub Issues](https://github.com/DiggAiHH/Anamnese-A/issues)
- 📧 **Email**: support@example.com
- 💬 **Chat**: [Ihr Support-Kanal]

---

## ✅ Checkliste für Produktionsstart

Vor dem Go-Live prüfen:

- [ ] Alle Tests laufen durch (`npm test`)
- [ ] Stripe Produktions-Keys eingetragen
- [ ] MASTER_KEY sicher gespeichert
- [ ] PostgreSQL Backups konfiguriert
- [ ] HTTPS/SSL aktiviert
- [ ] Firewall konfiguriert (nur 80, 443, 22)
- [ ] Rate Limiting aktiviert
- [ ] Monitoring eingerichtet
- [ ] Logs rotieren
- [ ] Dokumentation aktuell
- [ ] Datenschutzerklärung online
- [ ] Impressum vorhanden

---

**Version**: 1.0.0  
**Letzte Aktualisierung**: 22.12.2024  
**Status**: ✅ Produktionsreif

🎉 **Viel Erfolg mit dem Praxis-Code-Generator!**
