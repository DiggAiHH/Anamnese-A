# Deployment Guide - Praxis-Code-Generator

Complete guide for deploying the Praxis-Code-Generator to various platforms.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Local Development](#local-development)
- [Docker Deployment](#docker-deployment)
- [Cloud Platforms](#cloud-platforms)
  - [Heroku](#heroku)
  - [AWS](#aws)
  - [DigitalOcean](#digitalocean)
  - [Azure](#azure)
- [Reverse Proxy Setup](#reverse-proxy-setup)
- [SSL/TLS Configuration](#ssltls-configuration)
- [Monitoring](#monitoring)
- [Backup Strategy](#backup-strategy)

---

## Prerequisites

### Required Services
- **PostgreSQL 14+** database
- **Stripe Account** (for payments)
- **Domain name** (for production)
- **SSL Certificate** (Let's Encrypt recommended)

### Required Knowledge
- Basic Linux server administration
- Docker basics (for containerized deployment)
- SQL database management
- DNS configuration

---

## Local Development

### Quick Setup

```bash
# Clone repository
git clone https://github.com/DiggAiHH/Anamnese-A.git
cd Anamnese-A

# Install dependencies
npm install

# Configure environment
npm run setup

# Start PostgreSQL
sudo systemctl start postgresql

# Create database and import schema
createdb anamnese
psql -d anamnese -f database/schema.sql

# Add test practice
psql -d anamnese -c "INSERT INTO practices (name, email, active) VALUES ('Test Practice', 'test@example.com', true);"

# Start server
npm run dev
```

Server runs at `http://localhost:3000`

---

## Docker Deployment

### Single Server Deployment

```bash
# Clone repository
git clone https://github.com/DiggAiHH/Anamnese-A.git
cd Anamnese-A

# Configure environment
cp .env.example .env
nano .env  # Edit with production values

# Generate secure keys
MASTER_KEY=$(openssl rand -hex 32)
SESSION_SECRET=$(openssl rand -hex 32)
# Add to .env

# Start services
docker-compose up -d

# Check logs
docker-compose logs -f app

# Initialize database (if needed)
docker-compose exec db psql -U anamnese_user -d anamnese -f /docker-entrypoint-initdb.d/schema.sql

# Add practice
docker-compose exec db psql -U anamnese_user -d anamnese -c \
  "INSERT INTO practices (name, email, active) VALUES ('Production Practice', 'info@practice.com', true);"
```

### Production docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://anamnese_user:${DB_PASSWORD}@db:5432/anamnese
      - STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}
      - STRIPE_WEBHOOK_SECRET=${STRIPE_WEBHOOK_SECRET}
      - MASTER_KEY=${MASTER_KEY}
      - SESSION_SECRET=${SESSION_SECRET}
      - FRONTEND_URL=https://code-generator.your-domain.com
      - ANAMNESE_BASE_URL=https://anamnese.your-domain.com
    depends_on:
      db:
        condition: service_healthy
    restart: unless-stopped
    networks:
      - anamnese-network
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  db:
    image: postgres:16-alpine
    environment:
      - POSTGRES_USER=anamnese_user
      - POSTGRES_PASSWORD=${DB_PASSWORD}
      - POSTGRES_DB=anamnese
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/schema.sql:/docker-entrypoint-initdb.d/schema.sql
      - ./backups:/backups
    restart: unless-stopped
    networks:
      - anamnese-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -d anamnese"]
      interval: 10s
      timeout: 5s
      retries: 5

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: unless-stopped
    networks:
      - anamnese-network

volumes:
  postgres_data:

networks:
  anamnese-network:
    driver: bridge
```

---

## Cloud Platforms

### Heroku

#### Prerequisites
- Heroku CLI installed
- Heroku account

#### Deployment Steps

```bash
# Login to Heroku
heroku login

# Create app
heroku create praxis-code-generator

# Add PostgreSQL
heroku addons:create heroku-postgresql:mini

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set MASTER_KEY=$(openssl rand -hex 32)
heroku config:set SESSION_SECRET=$(openssl rand -hex 32)
heroku config:set STRIPE_SECRET_KEY=sk_live_...
heroku config:set STRIPE_WEBHOOK_SECRET=whsec_...
heroku config:set FRONTEND_URL=https://praxis-code-generator.herokuapp.com
heroku config:set ANAMNESE_BASE_URL=https://your-anamnese-app.com

# Deploy
git push heroku main

# Initialize database
heroku pg:psql < database/schema.sql

# Add practice
heroku pg:psql -c "INSERT INTO practices (name, email, active) VALUES ('Practice Name', 'email@example.com', true);"

# Open app
heroku open
```

#### Configure Stripe Webhook

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://praxis-code-generator.herokuapp.com/webhook`
3. Select event: `checkout.session.completed`
4. Copy webhook secret and update Heroku config:
   ```bash
   heroku config:set STRIPE_WEBHOOK_SECRET=whsec_...
   ```

---

### AWS (EC2 + RDS)

#### Step 1: Create RDS Database

```bash
# Create PostgreSQL RDS instance
aws rds create-db-instance \
  --db-instance-identifier anamnese-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --engine-version 16.1 \
  --master-username admin \
  --master-user-password YOUR_SECURE_PASSWORD \
  --allocated-storage 20 \
  --vpc-security-group-ids sg-XXXXXXXX

# Note the endpoint URL
```

#### Step 2: Launch EC2 Instance

```bash
# Launch Ubuntu instance
aws ec2 run-instances \
  --image-id ami-0c55b159cbfafe1f0 \
  --instance-type t3.micro \
  --key-name your-key-pair \
  --security-group-ids sg-XXXXXXXX

# SSH into instance
ssh -i your-key.pem ubuntu@ec2-XX-XXX-XXX-XX.compute.amazonaws.com
```

#### Step 3: Install Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install git
sudo apt install -y git

# Install PostgreSQL client
sudo apt install -y postgresql-client
```

#### Step 4: Deploy Application

```bash
# Clone repository
git clone https://github.com/DiggAiHH/Anamnese-A.git
cd Anamnese-A

# Install dependencies
npm install --production

# Configure environment
cp .env.example .env
nano .env
# Set DATABASE_URL to RDS endpoint
# DATABASE_URL=postgresql://admin:password@anamnese-db.xxx.rds.amazonaws.com:5432/anamnese

# Initialize database
psql -h anamnese-db.xxx.rds.amazonaws.com -U admin -d postgres -f database/schema.sql

# Start with PM2
sudo npm install -g pm2
pm2 start server.js --name praxis-code-generator
pm2 startup
pm2 save
```

#### Step 5: Configure Nginx

```bash
# Install Nginx
sudo apt install -y nginx

# Configure site
sudo nano /etc/nginx/sites-available/praxis-code-generator

# Add configuration (see Reverse Proxy section)

# Enable site
sudo ln -s /etc/nginx/sites-available/praxis-code-generator /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

### DigitalOcean

#### Using DigitalOcean App Platform

1. **Connect GitHub Repository**
   - Go to DigitalOcean App Platform
   - Click "Create App"
   - Connect GitHub repository

2. **Configure App**
   - Detect Node.js automatically
   - Set build command: `npm install`
   - Set run command: `npm start`

3. **Add Database**
   - Add PostgreSQL database component
   - Note connection string

4. **Set Environment Variables**
   ```
   NODE_ENV=production
   DATABASE_URL=${db.DATABASE_URL}
   STRIPE_SECRET_KEY=sk_live_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   MASTER_KEY=<generate>
   SESSION_SECRET=<generate>
   FRONTEND_URL=https://your-app.ondigitalocean.app
   ANAMNESE_BASE_URL=https://anamnese.example.com
   ```

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete

6. **Initialize Database**
   - Use DigitalOcean console or local psql:
   ```bash
   psql "postgresql://user:pass@host:25060/db?sslmode=require" -f database/schema.sql
   ```

---

### Azure

#### Using Azure App Service + Azure Database

```bash
# Login to Azure
az login

# Create resource group
az group create --name anamnese-rg --location westeurope

# Create PostgreSQL server
az postgres flexible-server create \
  --resource-group anamnese-rg \
  --name anamnese-db \
  --location westeurope \
  --admin-user adminuser \
  --admin-password SecurePass123! \
  --sku-name Standard_B1ms \
  --version 16

# Create database
az postgres flexible-server db create \
  --resource-group anamnese-rg \
  --server-name anamnese-db \
  --database-name anamnese

# Create App Service plan
az appservice plan create \
  --name anamnese-plan \
  --resource-group anamnese-rg \
  --sku B1 \
  --is-linux

# Create web app
az webapp create \
  --resource-group anamnese-rg \
  --plan anamnese-plan \
  --name praxis-code-generator \
  --runtime "NODE:20-lts"

# Configure app settings
az webapp config appsettings set \
  --resource-group anamnese-rg \
  --name praxis-code-generator \
  --settings \
    NODE_ENV=production \
    DATABASE_URL="postgresql://adminuser:SecurePass123!@anamnese-db.postgres.database.azure.com:5432/anamnese?sslmode=require"

# Deploy code
az webapp deployment source config \
  --name praxis-code-generator \
  --resource-group anamnese-rg \
  --repo-url https://github.com/DiggAiHH/Anamnese-A \
  --branch main \
  --manual-integration
```

---

## Reverse Proxy Setup

### Nginx Configuration

```nginx
# /etc/nginx/sites-available/praxis-code-generator

upstream praxis_backend {
    server localhost:3000;
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name code-generator.your-domain.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS server
server {
    listen 443 ssl http2;
    server_name code-generator.your-domain.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/code-generator.your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/code-generator.your-domain.com/privkey.pem;
    ssl_protocols TLSv1.3 TLSv1.2;
    ssl_ciphers 'ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';
    ssl_prefer_server_ciphers on;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Proxy settings
    location / {
        proxy_pass http://praxis_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Static files caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://praxis_backend;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

---

## SSL/TLS Configuration

### Using Let's Encrypt

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d code-generator.your-domain.com

# Auto-renewal (already set up by Certbot)
sudo certbot renew --dry-run
```

### Using Custom Certificate

```bash
# Place certificates
sudo mkdir -p /etc/nginx/ssl
sudo cp your-cert.crt /etc/nginx/ssl/
sudo cp your-key.key /etc/nginx/ssl/

# Update Nginx config
ssl_certificate /etc/nginx/ssl/your-cert.crt;
ssl_certificate_key /etc/nginx/ssl/your-key.key;

# Restart Nginx
sudo systemctl restart nginx
```

---

## Monitoring

### PM2 Monitoring

```bash
# Install PM2
npm install -g pm2

# Start with monitoring
pm2 start server.js --name praxis-code-generator

# View logs
pm2 logs praxis-code-generator

# Monitor resources
pm2 monit

# Web dashboard
pm2 link YOUR_SECRET_KEY YOUR_PUBLIC_KEY
```

### Health Check Script

```bash
#!/bin/bash
# /usr/local/bin/health-check.sh

ENDPOINT="http://localhost:3000/health"
ALERT_EMAIL="admin@example.com"

response=$(curl -s -o /dev/null -w "%{http_code}" $ENDPOINT)

if [ $response != "200" ]; then
    echo "Health check failed: HTTP $response" | mail -s "Alert: Praxis-Code-Generator Down" $ALERT_EMAIL
fi
```

### Cron Job

```bash
# Run health check every 5 minutes
*/5 * * * * /usr/local/bin/health-check.sh
```

---

## Backup Strategy

### Database Backup Script

```bash
#!/bin/bash
# /usr/local/bin/backup-db.sh

BACKUP_DIR="/var/backups/postgresql"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="anamnese"
RETENTION_DAYS=30

# Create backup directory
mkdir -p $BACKUP_DIR

# Perform backup
pg_dump -U postgres -Fc $DB_NAME > $BACKUP_DIR/anamnese_$DATE.dump

# Encrypt backup
gpg --encrypt --recipient backup@example.com $BACKUP_DIR/anamnese_$DATE.dump
rm $BACKUP_DIR/anamnese_$DATE.dump

# Upload to S3 (optional)
aws s3 cp $BACKUP_DIR/anamnese_$DATE.dump.gpg s3://your-backup-bucket/

# Delete old backups
find $BACKUP_DIR -name "*.dump.gpg" -mtime +$RETENTION_DAYS -delete

echo "Backup completed: anamnese_$DATE.dump.gpg"
```

### Automated Backups

```bash
# Daily backup at 2 AM
0 2 * * * /usr/local/bin/backup-db.sh >> /var/log/backup.log 2>&1
```

### Restore from Backup

```bash
# Decrypt backup
gpg --decrypt anamnese_20241222_020000.dump.gpg > anamnese_20241222_020000.dump

# Restore database
pg_restore -U postgres -d anamnese -c anamnese_20241222_020000.dump
```

---

## Troubleshooting

### Application won't start

```bash
# Check logs
pm2 logs praxis-code-generator
# or
docker-compose logs app

# Check environment variables
env | grep -E "DATABASE_URL|STRIPE"

# Test database connection
psql $DATABASE_URL -c "SELECT 1;"
```

### Stripe webhooks not working

```bash
# Test webhook locally
stripe listen --forward-to localhost:3000/webhook

# Check webhook logs in Stripe Dashboard
# Verify STRIPE_WEBHOOK_SECRET matches

# Test endpoint
curl -X POST http://localhost:3000/webhook \
  -H "Content-Type: application/json" \
  -d '{}'
```

### Database connection errors

```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Check connections
psql -U postgres -c "SELECT * FROM pg_stat_activity;"

# Check connection limit
psql -U postgres -c "SHOW max_connections;"
```

---

## Security Checklist

Before going to production:

- [ ] Change all default passwords
- [ ] Use strong MASTER_KEY (32 bytes, random)
- [ ] Configure HTTPS/SSL
- [ ] Set up firewall (allow only 80, 443, 22)
- [ ] Enable database encryption at rest
- [ ] Set up automated backups
- [ ] Configure monitoring and alerts
- [ ] Review and restrict database permissions
- [ ] Set up rate limiting
- [ ] Enable audit logging
- [ ] Configure Stripe production keys
- [ ] Set up webhook signing
- [ ] Test disaster recovery plan
- [ ] Review CSP headers
- [ ] Enable HSTS
- [ ] Configure fail2ban
- [ ] Set up log rotation
- [ ] Document incident response plan

---

## Support

For deployment issues:
- 📧 Email: support@example.com
- 📖 Documentation: [PRAXIS_CODE_GENERATOR_README.md](PRAXIS_CODE_GENERATOR_README.md)
- 🔒 Security: [PRAXIS_CODE_SECURITY.md](PRAXIS_CODE_SECURITY.md)

---

**Last Updated**: 2024-12-22
