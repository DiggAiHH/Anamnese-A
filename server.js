require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const Joi = require('joi');
const crypto = require('crypto');
const { Pool } = require('pg');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const winston = require('winston');
const path = require('path');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Logger configuration
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

// Database connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    logger.error('Database connection failed:', err);
  } else {
    logger.info('Database connected successfully');
  }
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

// Middleware
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
  }
}));
app.use(cors());
app.use(limiter);

// Body parser - raw for webhooks
app.use('/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Helper function for AES-256 encryption
function encryptData(data) {
  const algorithm = 'aes-256-gcm';
  const key = Buffer.from(process.env.MASTER_KEY, 'hex');
  const iv = crypto.randomBytes(12);
  
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  // Return base64 encoded: iv + authTag + encrypted data
  return Buffer.concat([
    iv,
    authTag,
    Buffer.from(encrypted, 'hex')
  ]).toString('base64');
}

// Helper function for AES-256 decryption
function decryptData(encryptedData) {
  const algorithm = 'aes-256-gcm';
  const key = Buffer.from(process.env.MASTER_KEY, 'hex');
  const buffer = Buffer.from(encryptedData, 'base64');
  
  const iv = buffer.slice(0, 12);
  const authTag = buffer.slice(12, 28);
  const encrypted = buffer.slice(28);
  
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encrypted, undefined, 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

// Audit logging helper
async function logAudit(practiceId, action, details, req) {
  try {
    await pool.query(
      `INSERT INTO audit_log (practice_id, action, details, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        practiceId,
        action,
        details,
        req.ip,
        req.get('user-agent')
      ]
    );
  } catch (err) {
    logger.error('Audit logging failed:', err);
  }
}

// API Routes

// POST /api/validate-practice
app.post('/api/validate-practice', async (req, res) => {
  try {
    const { practiceId } = req.body;
    
    // Validierung mit Joi
    const schema = Joi.object({
      practiceId: Joi.string().uuid().required()
    });
    
    const { error } = schema.validate({ practiceId });
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    
    // Prüfe in Datenbank
    const result = await pool.query(
      'SELECT id, name, active FROM practices WHERE id = $1',
      [practiceId]
    );
    
    if (result.rows.length === 0 || !result.rows[0].active) {
      await logAudit(practiceId, 'PRACTICE_VALIDATION_FAILED', { practiceId }, req);
      return res.status(404).json({ valid: false });
    }
    
    // Generiere Session-Secret (HMAC)
    const secret = crypto.createHmac('sha256', process.env.MASTER_KEY)
      .update(practiceId + Date.now())
      .digest('hex');
    
    await logAudit(practiceId, 'PRACTICE_VALIDATED', { name: result.rows[0].name }, req);
    
    res.json({
      valid: true,
      name: result.rows[0].name,
      secret: secret
    });
  } catch (err) {
    logger.error('Practice validation error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/create-checkout-session
app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const { userType, practiceId, mode, language, patientData } = req.body;
    
    // Validation schema depends on userType
    let schema;
    if (userType === 'selftest') {
      // For self-test, practiceId is not required
      schema = Joi.object({
        userType: Joi.string().valid('practice', 'selftest').required(),
        practiceId: Joi.string().uuid().optional(),
        mode: Joi.string().valid('practice', 'patient').required(),
        language: Joi.string().valid('de', 'de-en', 'de-ar', 'de-tr', 'de-uk', 'de-pl', 'de-fa', 'de-ur', 'de-ps', 'de-es', 'de-fr', 'de-it', 'de-ru').required(),
        patientData: Joi.object({
          firstName: Joi.string().max(100),
          lastName: Joi.string().max(100),
          birthDate: Joi.date().iso(),
          address: Joi.string().max(500)
        }).allow(null)
      });
    } else {
      // For practice, practiceId is required
      schema = Joi.object({
        userType: Joi.string().valid('practice', 'selftest').optional(),
        practiceId: Joi.string().uuid().required(),
        mode: Joi.string().valid('practice', 'patient').required(),
        language: Joi.string().valid('de', 'de-en', 'de-ar', 'de-tr', 'de-uk', 'de-pl', 'de-fa', 'de-ur', 'de-ps', 'de-es', 'de-fr', 'de-it', 'de-ru').required(),
        patientData: Joi.object({
          firstName: Joi.string().max(100),
          lastName: Joi.string().max(100),
          birthDate: Joi.date().iso(),
          address: Joi.string().max(500)
        }).allow(null)
      });
    }
    
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    
    // Determine price based on userType
    const unitAmount = userType === 'selftest' ? 100 : 99; // 1,00€ or 0,99€ in cents
    const description = userType === 'selftest' 
      ? `Selbst-Test | Sprache: ${language}`
      : `Sprache: ${language}, Modus: ${mode}`;
    
    // Erstelle Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'sepa_debit'],
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: {
            name: 'Anamnese-Zugangscode',
            description: description
          },
          unit_amount: unitAmount,
          tax_behavior: 'inclusive'
        },
        quantity: 1
      }],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/cancel`,
      metadata: {
        userType: userType || 'practice',
        practiceId: practiceId || 'SELFTEST',
        mode,
        language,
        patientData: patientData ? JSON.stringify(patientData) : null
      },
      automatic_tax: {
        enabled: true
      }
    });
    
    await logAudit(practiceId, 'CHECKOUT_SESSION_CREATED', { sessionId: session.id, mode, language }, req);
    
    res.json({ sessionId: session.id });
  } catch (err) {
    logger.error('Checkout session creation error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /webhook (Stripe Webhook)
app.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    logger.error('Webhook signature verification failed:', err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    
    try {
      // Generiere verschlüsselten Code
      const codeData = {
        practiceId: session.metadata.practiceId,
        mode: session.metadata.mode,
        language: session.metadata.language,
        patientData: session.metadata.patientData,
        timestamp: Date.now(),
        sessionId: session.id
      };
      
      const encryptedCode = encryptData(JSON.stringify(codeData));
      
      // Speichere in Datenbank
      await pool.query(
        `INSERT INTO codes (practice_id, code, mode, language, stripe_session_id, created_at)
         VALUES ($1, $2, $3, $4, $5, NOW())`,
        [
          session.metadata.practiceId,
          encryptedCode,
          session.metadata.mode,
          session.metadata.language,
          session.id
        ]
      );
      
      // Speichere Transaktion
      await pool.query(
        `INSERT INTO transactions (practice_id, stripe_session_id, amount_total, amount_net, tax_amount, status, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
        [
          session.metadata.practiceId,
          session.id,
          session.amount_total,
          session.amount_total - (session.total_details?.amount_tax || 0),
          session.total_details?.amount_tax || 0,
          'completed'
        ]
      );
      
      await logAudit(
        session.metadata.practiceId,
        'CODE_GENERATED',
        { sessionId: session.id, mode: session.metadata.mode },
        { ip: 'stripe-webhook', get: () => 'Stripe' }
      );
      
      logger.info('Payment processed successfully:', { sessionId: session.id });
    } catch (err) {
      logger.error('Error processing webhook:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
  
  res.json({ received: true });
});

// GET /api/code/:sessionId
app.get('/api/code/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const result = await pool.query(
      'SELECT code, language, mode, practice_id FROM codes WHERE stripe_session_id = $1',
      [sessionId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Code not found' });
    }
    
    await logAudit(
      result.rows[0].practice_id,
      'CODE_RETRIEVED',
      { sessionId },
      req
    );
    
    res.json({
      code: result.rows[0].code,
      language: result.rows[0].language,
      mode: result.rows[0].mode
    });
  } catch (err) {
    logger.error('Code retrieval error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  pool.end(() => {
    logger.info('Database pool closed');
    process.exit(0);
  });
});
