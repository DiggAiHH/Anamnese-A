# Security Documentation - Praxis-Code-Generator

## Überblick

Dieses Dokument beschreibt das Sicherheitskonzept des Praxis-Code-Generators gemäß DSGVO Art. 32 (Sicherheit der Verarbeitung).

## Inhaltsverzeichnis

- [Sicherheitsarchitektur](#sicherheitsarchitektur)
- [Verschlüsselung](#verschlüsselung)
- [Authentifizierung](#authentifizierung)
- [Autorisierung](#autorisierung)
- [Input-Validierung](#input-validierung)
- [Sicherheitsmaßnahmen](#sicherheitsmaßnahmen)
- [Schlüsselverwaltung](#schlüsselverwaltung)
- [Backup-Strategie](#backup-strategie)
- [Incident Response](#incident-response)
- [Security Checklist](#security-checklist)

## Sicherheitsarchitektur

### Schichtenmodell

```
┌─────────────────────────────────────┐
│         Client (Browser)            │
│  - CSP Headers                      │
│  - Input Sanitization               │
│  - HTTPS-only                       │
└─────────────────────────────────────┘
              ↕ HTTPS
┌─────────────────────────────────────┐
│      Reverse Proxy (nginx)          │
│  - SSL/TLS Termination              │
│  - Rate Limiting                    │
│  - DDoS Protection                  │
└─────────────────────────────────────┘
              ↕
┌─────────────────────────────────────┐
│      Application Server             │
│  - Express.js                       │
│  - Helmet.js Headers                │
│  - Rate Limiting                    │
│  - Joi Validation                   │
│  - Winston Logging                  │
└─────────────────────────────────────┘
              ↕
┌─────────────────────────────────────┐
│       PostgreSQL Database           │
│  - Encrypted at Rest                │
│  - Connection Pooling               │
│  - Prepared Statements              │
└─────────────────────────────────────┘
```

## Verschlüsselung

### AES-256-GCM Verschlüsselung

**Algorithmus**: AES-256-GCM (Galois/Counter Mode)

**Warum AES-256-GCM?**
- **Authenticated Encryption**: Kombiniert Verschlüsselung und Integritätsprüfung
- **Performance**: Hardwarebeschleunigte Implementierung auf modernen CPUs
- **Sicherheit**: NIST-empfohlener Standard für Regierungsdokumente (Top Secret)
- **DSGVO-konform**: Erfüllt Art. 32 DSGVO (Sicherheit der Verarbeitung)

### Implementierung (Node.js)

```javascript
const crypto = require('crypto');

function encryptData(plaintext) {
  const algorithm = 'aes-256-gcm';
  const key = Buffer.from(process.env.MASTER_KEY, 'hex'); // 32 Bytes
  const iv = crypto.randomBytes(12); // 96-bit IV für GCM
  
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag(); // 128-bit authentication tag
  
  // Format: iv (12 bytes) + authTag (16 bytes) + encrypted data
  return Buffer.concat([
    iv,
    authTag,
    Buffer.from(encrypted, 'hex')
  ]).toString('base64');
}

function decryptData(ciphertext) {
  const algorithm = 'aes-256-gcm';
  const key = Buffer.from(process.env.MASTER_KEY, 'hex');
  const buffer = Buffer.from(ciphertext, 'base64');
  
  const iv = buffer.slice(0, 12);
  const authTag = buffer.slice(12, 28);
  const encrypted = buffer.slice(28);
  
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encrypted, undefined, 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}
```

### Key Derivation

**PBKDF2** (Password-Based Key Derivation Function 2):
- **Iterations**: 100.000
- **Hash**: SHA-256
- **Salt**: 'anamnese-salt-2025' (sollte pro Installation einzigartig sein)

### Web Crypto API (Browser)

```javascript
async function generateSecureCode(data) {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(PRACTICE_SECRET),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );
  
  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode('anamnese-salt-2025'),
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt']
  );
  
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoder.encode(JSON.stringify(data))
  );
  
  return btoa(String.fromCharCode(...iv, ...new Uint8Array(encrypted)));
}
```

## Authentifizierung

### Praxis-ID Validierung

**Verfahren**:
1. Client sendet Praxis-ID (UUID) an Server
2. Server prüft UUID-Format mit Joi
3. Server prüft ID in Datenbank (aktiv?)
4. Bei Erfolg: Server generiert Session-Secret (HMAC)

**Session-Secret-Generierung**:
```javascript
const secret = crypto.createHmac('sha256', process.env.MASTER_KEY)
  .update(practiceId + Date.now())
  .digest('hex');
```

**Vorteile**:
- Keine Passwörter notwendig
- UUID schwer zu erraten
- Session-Secret zeitlich limitiert
- HMAC verhindert Manipulation

### Schutz vor Brute-Force

**Rate Limiting**:
- **100 Requests pro 15 Minuten** pro IP
- Bei Überschreitung: HTTP 429 + Retry-After Header
- Implementierung: `express-rate-limit`

## Autorisierung

### Zugriffskontrolle

1. **Praxis-Level**: Nur validierte Praxen können Codes generieren
2. **Code-Level**: Codes gehören zu einer Praxis (practice_id)
3. **Audit-Level**: Alle Zugriffe werden protokolliert

### Principle of Least Privilege

- Datenbankbenutzer hat nur notwendige Rechte (INSERT, SELECT, UPDATE)
- Node.js läuft als non-root User (UID 1000)
- Docker-Container haben minimale Capabilities

## Input-Validierung

### Client-Side (Browser)

**HTML5 Validation**:
```html
<input type="text" required pattern="[0-9a-f-]{36}">
<input type="date" required>
```

**JavaScript Validation**:
- UUID-Regex: `/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i`
- Längenprüfung: firstName/lastName max. 100 Zeichen
- Datumsformat: ISO 8601

### Server-Side (Node.js)

**Joi Validation**:
```javascript
const schema = Joi.object({
  practiceId: Joi.string().uuid().required(),
  mode: Joi.string().valid('practice', 'patient').required(),
  language: Joi.string().valid(
    'de', 'de-en', 'de-ar', 'de-tr', 'de-uk', 
    'de-pl', 'de-fa', 'de-ur', 'de-ps', 'de-es', 
    'de-fr', 'de-it', 'de-ru'
  ).required(),
  patientData: Joi.object({
    firstName: Joi.string().max(100),
    lastName: Joi.string().max(100),
    birthDate: Joi.date().iso(),
    address: Joi.string().max(500)
  }).allow(null)
});
```

**SQL Injection Prevention**:
- Prepared Statements (pg library)
- Keine String-Konkatenation in Queries

**XSS Prevention**:
- Content-Security-Policy Header
- Helmet.js
- Kein `innerHTML` im Frontend-Code

## Sicherheitsmaßnahmen

### Helmet.js Security Headers

```javascript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
      scriptSrc: ["'self'", "https://js.stripe.com", "https://cdn.jsdelivr.net"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.stripe.com"],
      frameSrc: ["https://js.stripe.com", "https://hooks.stripe.com"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  xssFilter: true,
  frameguard: { action: 'deny' }
}));
```

### HTTPS Enforcement

**Production Deployment**:
- Nur HTTPS erlaubt
- HSTS Header aktiviert
- TLS 1.3 bevorzugt
- Cipher Suite: ECDHE+AESGCM, ECDHE+CHACHA20

### Database Security

**Connection String**:
```javascript
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false,
  max: 20, // Connection pool size
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
});
```

**Prepared Statements**:
```javascript
await pool.query(
  'SELECT * FROM practices WHERE id = $1',
  [practiceId]
);
```

## Schlüsselverwaltung

### Master-Key

**Generierung**:
```bash
openssl rand -hex 32
```

**Speicherung**:
- **Development**: `.env` Datei (nicht im Git)
- **Production**: 
  - AWS Secrets Manager
  - Azure Key Vault
  - HashiCorp Vault
  - Kubernetes Secrets

**Rotation**:
- Master-Key sollte mindestens jährlich rotiert werden
- Bei Verdacht auf Kompromittierung sofort rotieren
- Alte verschlüsselte Daten müssen neu verschlüsselt werden

### Stripe-Keys

**API Keys**:
- **Secret Key**: Nur auf Server
- **Publishable Key**: Kann im Frontend stehen
- **Webhook Secret**: Nur auf Server

**Best Practices**:
- Verwenden Sie Test-Keys während Entwicklung
- Restricted API Keys verwenden (minimale Permissions)
- Rotation alle 90 Tage

## Backup-Strategie

### Datenbank-Backups

**Frequenz**:
- **Vollbackup**: Täglich um 02:00 Uhr
- **Incrementelles Backup**: Alle 6 Stunden
- **WAL Archivierung**: Kontinuierlich

**Retention**:
- **Tägliche Backups**: 30 Tage
- **Wöchentliche Backups**: 12 Wochen
- **Monatliche Backups**: 12 Monate

**Verschlüsselung**:
- Backups mit GPG verschlüsseln
- Separater Verschlüsselungsschlüssel
- Offline-Speicherung des Schlüssels

**Backup-Script** (PostgreSQL):
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/postgresql"
DB_NAME="anamnese"

# Vollbackup
pg_dump -U postgres -Fc $DB_NAME > $BACKUP_DIR/anamnese_$DATE.dump

# Verschlüsseln
gpg --encrypt --recipient backup@example.com $BACKUP_DIR/anamnese_$DATE.dump

# Alte Backups löschen (älter als 30 Tage)
find $BACKUP_DIR -name "*.dump.gpg" -mtime +30 -delete
```

### Disaster Recovery

**Recovery Time Objective (RTO)**: < 4 Stunden
**Recovery Point Objective (RPO)**: < 1 Stunde

**Recovery-Prozess**:
1. Neue Datenbankinstanz aufsetzen
2. Letztes Backup wiederherstellen
3. WAL-Logs anwenden
4. Datenintegrität prüfen
5. Anwendung neu starten

## Incident Response

### Incident Response Plan

**Phase 1: Erkennung**
- Monitoring-Alerts (CPU, Memory, Disk, Network)
- Log-Analyse (Winston, PostgreSQL Logs)
- Security-Scanner (OWASP ZAP, Nessus)

**Phase 2: Analyse**
- Scope bestimmen (welche Systeme betroffen?)
- Impact Assessment (Datenverlust, Downtime)
- Root Cause Analysis

**Phase 3: Eindämmung**
- Kompromittierte Systeme isolieren
- Zugriffe sperren
- Notfall-Wartung aktivieren

**Phase 4: Beseitigung**
- Malware entfernen
- Sicherheitslücken patchen
- Passwörter/Keys rotieren

**Phase 5: Wiederherstellung**
- Systeme aus Backup wiederherstellen
- Funktionalität testen
- Monitoring intensivieren

**Phase 6: Lessons Learned**
- Incident dokumentieren
- Prozesse verbessern
- Training durchführen

### Kontakte

**Security Team**:
- E-Mail: security@example.com
- Telefon: +49 XXX XXXXXXX
- On-Call: Bereitschaftsdienst 24/7

**Externe Dienstleister**:
- CERT-Bund: [https://www.bsi.bund.de](https://www.bsi.bund.de)
- Datenschutzbehörde: [https://www.bfdi.bund.de](https://www.bfdi.bund.de)

### Meldepflichten

**DSGVO Art. 33**: Meldung an Aufsichtsbehörde binnen 72 Stunden bei:
- Datenschutzverletzungen
- Unbefugtem Zugriff
- Datenverlust

**DSGVO Art. 34**: Benachrichtigung betroffener Personen bei:
- Hohem Risiko für Rechte und Freiheiten
- Keine geeigneten Schutzmaßnahmen (z.B. Verschlüsselung)

## Security Checklist

### Deployment Checklist

- [ ] `NODE_ENV=production` gesetzt
- [ ] Alle Secrets in Umgebungsvariablen
- [ ] Master-Key mit 32 Bytes generiert
- [ ] HTTPS aktiviert (TLS 1.3)
- [ ] Helmet.js konfiguriert
- [ ] Rate Limiting aktiviert
- [ ] Datenbank-Backups eingerichtet
- [ ] Monitoring konfiguriert (CPU, RAM, Disk)
- [ ] Logging aktiviert (Winston)
- [ ] Stripe-Webhooks getestet
- [ ] Firewall-Regeln konfiguriert
- [ ] Nicht benötigte Ports geschlossen
- [ ] SSH nur mit Key-Auth
- [ ] Fail2ban installiert
- [ ] Automatische Updates aktiviert

### Code Review Checklist

- [ ] Input-Validierung auf Client und Server
- [ ] SQL Prepared Statements verwendet
- [ ] Keine Secrets im Code
- [ ] Keine `eval()` oder `Function()` Aufrufe
- [ ] Keine `innerHTML` ohne Sanitization
- [ ] Kein `dangerouslySetInnerHTML` in React
- [ ] Error-Messages geben keine sensitiven Infos preis
- [ ] Logging enthält keine Passwörter/Keys
- [ ] Dependencies auf Vulnerabilities geprüft
- [ ] OWASP Top 10 berücksichtigt

### Penetration Testing

**Frequenz**: Mindestens jährlich

**Scope**:
- SQL Injection
- XSS (Cross-Site Scripting)
- CSRF (Cross-Site Request Forgery)
- Authentication Bypass
- Authorization Bypass
- Sensitive Data Exposure
- Security Misconfiguration
- Broken Access Control

**Tools**:
- OWASP ZAP
- Burp Suite
- Nmap
- SQLmap
- Nikto

## Verantwortlichkeiten

| Rolle | Verantwortung |
|-------|---------------|
| **Security Officer** | Gesamtverantwortung Informationssicherheit |
| **DevOps Team** | Infrastruktur, Deployment, Monitoring |
| **Development Team** | Sichere Codeentwicklung, Code Reviews |
| **DPO (Datenschutzbeauftragter)** | DSGVO-Compliance, Meldepflichten |
| **Management** | Budget, Ressourcen, Eskalation |

## Änderungshistorie

| Datum | Version | Änderung |
|-------|---------|----------|
| 2024-12-22 | 1.0 | Initiale Version |

---

**Kontakt**: security@example.com

**Letzte Aktualisierung**: 2024-12-22
