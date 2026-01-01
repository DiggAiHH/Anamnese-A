#!/usr/bin/env node

/**
 * Setup script for Praxis-Code-Generator
 * Helps generate secure keys and configure environment
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function setup() {
  console.log('===========================================');
  console.log('Praxis-Code-Generator Setup');
  console.log('===========================================\n');
  
  console.log('This script will help you configure the application.\n');
  
  // Generate secure keys
  console.log('Generating secure keys...');
  const masterKey = crypto.randomBytes(32).toString('hex');
  const sessionSecret = crypto.randomBytes(32).toString('hex');
  console.log('✓ Keys generated\n');
  
  // Ask for configuration
  const config = {
    NODE_ENV: await question('Environment (development/production) [development]: ') || 'development',
    PORT: await question('Server port [3000]: ') || '3000',
    DATABASE_URL: await question('Database URL [postgresql://postgres:postgres@localhost:5432/anamnese]: ') || 'postgresql://postgres:postgres@localhost:5432/anamnese',
    STRIPE_SECRET_KEY: await question('Stripe Secret Key [sk_test_...]: ') || 'sk_test_YOUR_KEY',
    STRIPE_PUBLISHABLE_KEY: await question('Stripe Publishable Key [pk_test_...]: ') || 'pk_test_YOUR_KEY',
    STRIPE_WEBHOOK_SECRET: await question('Stripe Webhook Secret [whsec_...]: ') || 'whsec_YOUR_SECRET',
    FRONTEND_URL: await question('Frontend URL [http://localhost:3000]: ') || 'http://localhost:3000',
    ANAMNESE_BASE_URL: await question('Anamnese Base URL [http://localhost:8080]: ') || 'http://localhost:8080',
    MASTER_KEY: masterKey,
    SESSION_SECRET: sessionSecret
  };
  
  // Create .env file
  const envContent = Object.entries(config)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
  
  const envPath = path.join(__dirname, '.env');
  
  if (fs.existsSync(envPath)) {
    const overwrite = await question('\n.env file already exists. Overwrite? (y/n) [n]: ');
    if (overwrite.toLowerCase() !== 'y') {
      console.log('\nSetup cancelled. Existing .env file kept.');
      rl.close();
      return;
    }
  }
  
  fs.writeFileSync(envPath, envContent);
  console.log('\n✓ .env file created');
  
  // Update frontend with Stripe key
  console.log('\nUpdating frontend configuration...');
  const appJsPath = path.join(__dirname, 'public', 'js', 'app.js');
  const indexHtmlPath = path.join(__dirname, 'public', 'index.html');
  
  if (fs.existsSync(indexHtmlPath)) {
    let htmlContent = fs.readFileSync(indexHtmlPath, 'utf8');
    htmlContent = htmlContent.replace(
      /<meta name="stripe-key" content="[^"]*">/,
      `<meta name="stripe-key" content="${config.STRIPE_PUBLISHABLE_KEY}">`
    );
    fs.writeFileSync(indexHtmlPath, htmlContent);
    console.log('✓ Frontend HTML configured');
  }
  
  if (fs.existsSync(appJsPath)) {
    let appJsContent = fs.readFileSync(appJsPath, 'utf8');
    // Backup in case meta tag is not read
    appJsContent = appJsContent.replace(
      /const STRIPE_KEY = document\.querySelector[^;]*;/,
      `const STRIPE_KEY = document.querySelector('meta[name="stripe-key"]')?.content || '${config.STRIPE_PUBLISHABLE_KEY}';`
    );
    fs.writeFileSync(appJsPath, appJsContent);
    console.log('✓ Frontend JS configured');
  }
  
  console.log('\n===========================================');
  console.log('Setup Complete!');
  console.log('===========================================\n');
  
  console.log('Next steps:');
  console.log('1. Install PostgreSQL if not already installed');
  console.log('2. Create database: createdb anamnese');
  console.log('3. Import schema: psql -d anamnese -f database/schema.sql');
  console.log('4. Add a test practice to database:');
  console.log('   INSERT INTO practices (name, email, active)');
  console.log('   VALUES (\'Test Practice\', \'practice@invalid.test\', true);');
  console.log('5. Start server: npm start');
  console.log('6. Open http://localhost:' + config.PORT + ' in browser\n');
  
  console.log('Important Security Notes:');
  console.log('- Keep your .env file secure and never commit it to Git');
  console.log('- In production, use real Stripe keys');
  console.log('- Configure SSL/TLS for production deployment');
  console.log('- Set up database backups\n');
  
  rl.close();
}

setup().catch(error => {
  console.error('Setup failed:', error);
  rl.close();
  process.exit(1);
});
