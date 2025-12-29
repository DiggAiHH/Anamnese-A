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
const { AuthService } = require('./middleware/auth');  // HISTORY-AWARE: JWT/Session Auth
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// =============================================================================
// CRITICAL FIX: Joi Validation Schemas
// =============================================================================
const practiceValidationSchema = Joi.object({
  practiceId: Joi.string()
    .uuid()
    .required()
    .messages({
      'string.guid': 'Invalid practice ID format',
      'any.required': 'Practice ID is required'
    })
});

const paymentSessionSchema = Joi.object({
  practiceId: Joi.string().uuid().required(),
  mode: Joi.string().valid('standard', 'premium', 'enterprise').required(),
  language: Joi.string().valid('de', 'en', 'fr', 'es', 'it', 'tr', 'pl', 'ru', 'ar', 'zh').default('de'),
  patientData: Joi.object().optional()
});

const codeQuerySchema = Joi.object({
  sessionId: Joi.string().required()
});

// Logger configuration (HISTORY-AWARE: Move before DEV_BYPASS to fix init error)
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

// Dev bypass configuration - ONLY for testing, never in production
// HISTORY-AWARE: Moved after logger initialization to fix ReferenceError
const DEV_BYPASS_PAYMENT = process.env.DEV_BYPASS_PAYMENT === 'true' && process.env.NODE_ENV !== 'production';
if (DEV_BYPASS_PAYMENT) {
  logger.warn('⚠️  DEV_BYPASS_PAYMENT is ACTIVE - Payment bypass enabled for testing');
}

// Database connection pool
// HISTORY-AWARE: DEV_BYPASS still needs DB for code generation + auth
// DSGVO-SAFE: allow running without DB only if DATABASE_URL is unset
function shouldUseDatabaseSSL() {
  const databaseSsl = (process.env.DATABASE_SSL || '').toLowerCase();
  if (databaseSsl === 'true' || databaseSsl === '1' || databaseSsl === 'require') return true;

  const pgsslmode = (process.env.PGSSLMODE || '').toLowerCase();
  if (pgsslmode === 'require' || pgsslmode === 'verify-full' || pgsslmode === 'verify-ca') return true;

  const databaseUrl = process.env.DATABASE_URL || '';
  if (/sslmode=require/i.test(databaseUrl)) return true;
  if (/[?&]ssl=true/i.test(databaseUrl)) return true;

  return false;
}

function parseBooleanEnv(value, defaultValue) {
  if (value === undefined) return defaultValue;
  const normalized = String(value).toLowerCase().trim();
  if (normalized === 'true' || normalized === '1' || normalized === 'yes') return true;
  if (normalized === 'false' || normalized === '0' || normalized === 'no') return false;
  return defaultValue;
}

const pool = process.env.DATABASE_URL ? new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: shouldUseDatabaseSSL() ? { rejectUnauthorized: false } : false
}) : null;

// Test database connection (DSGVO-SAFE: Skip in dev-bypass mode)
if (pool) {
  pool.query('SELECT NOW()', (err, res) => {
    if (err) {
      logger.error('Database connection failed:', err);
    } else {
      logger.info('Database connected successfully');
    }
  });
} else {
  logger.warn('Database connection DISABLED (no DATABASE_URL set)');
}

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
      defaultSrc: ['\'self\''],
      styleSrc: ['\'self\'', '\'unsafe-inline\''],  // HISTORY-AWARE: Removed CDN, Bootstrap now local
      scriptSrc: ['\'self\'', 'https://js.stripe.com'],  // HISTORY-AWARE: Removed CDN, qrcode.js still external (TODO)
      imgSrc: ['\'self\'', 'data:', 'https:'],
      connectSrc: ['\'self\'', 'https://api.stripe.com'],
      frameSrc: ['https://js.stripe.com', 'https://hooks.stripe.com'],
      fontSrc: ['\'self\'', 'data:']  // HISTORY-AWARE: Added for Bootstrap Icons fonts
    }
  }
}));

// CORS: allow browser to send/receive httpOnly cookies across ports (same-site)
const allowedCorsOrigins = new Set();
function addAllowedOrigin(raw) {
  if (!raw) return;
  try {
    const origin = new URL(raw).origin;
    allowedCorsOrigins.add(origin);
  } catch (err) {
    // ignore invalid URLs
  }
}

addAllowedOrigin(process.env.ANAMNESE_BASE_URL);
addAllowedOrigin(process.env.FRONTEND_URL);

// Local dev defaults (docker-compose frontend)
addAllowedOrigin('http://localhost:8080');
addAllowedOrigin('http://127.0.0.1:8080');

const corsOptions = {
  origin: (origin, callback) => {
    // Non-browser clients (no Origin header) should pass
    if (!origin) return callback(null, true);
    if (allowedCorsOrigins.has(origin)) return callback(null, true);
    return callback(new Error('CORS origin not allowed'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(limiter);

// Cookies (required for httpOnly session cookie auth)
app.use(cookieParser());

// Body parser - raw for webhooks
app.use('/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// =============================================================================
// AUTH SERVICE (DSGVO-konform: httpOnly Cookie + server-side sessions)
// =============================================================================
const authService = pool ? new AuthService(pool) : null;

function requireDatabase(req, res) {
  if (!pool) {
    res.status(503).json({
      error: 'Service Unavailable',
      message: 'Database not configured'
    });
    return false;
  }
  return true;
}

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

// Shared code generation function
// Used by both Stripe webhook and dev bypass mode
async function generateAccessCode(metadata, sessionId) {
  const codeData = {
    practiceId: metadata.practiceId,
    mode: metadata.mode,
    language: metadata.language,
    patientData: metadata.patientData,
    timestamp: Date.now(),
    sessionId: sessionId
  };
  
  const encryptedCode = encryptData(JSON.stringify(codeData));
  
  // Store code in database
  await pool.query(
    `INSERT INTO codes (practice_id, code, mode, language, stripe_session_id, created_at)
     VALUES ($1, $2, $3, $4, $5, NOW())`,
    [
      metadata.practiceId,
      encryptedCode,
      metadata.mode,
      metadata.language,
      sessionId
    ]
  );
  
  return encryptedCode;
}

// API Routes

// =============================================================================
// AUTH ROUTES (HISTORY-AWARE: fixes "bei der login versuch" for login-ui.js)
// =============================================================================

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  if (!requireDatabase(req, res)) return;
  if (!authService) {
    return res.status(503).json({ error: 'Service Unavailable', message: 'Auth not configured' });
  }

  try {
    const schema = Joi.object({
      email: Joi.string().email().max(255).required(),
      password: Joi.string().min(1).max(512).required()
    });

    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: 'Invalid input' });
    }

    const email = value.email.toLowerCase();
    const password = value.password;

    const userResult = await pool.query(
      'SELECT id, email, password_hash, role, practice_id, is_active FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      await new Promise((r) => setTimeout(r, 400));
      return res.status(401).json({ error: 'Ungültige Anmeldedaten' });
    }

    const user = userResult.rows[0];
    if (!user.is_active) {
      return res.status(403).json({ error: 'Account deaktiviert' });
    }

    const passwordOk = bcrypt.compareSync(password, user.password_hash);
    if (!passwordOk) {
      await new Promise((r) => setTimeout(r, 400));
      return res.status(401).json({ error: 'Ungültige Anmeldedaten' });
    }

    const session = await authService.createSession(user.id, user.practice_id, {
      userAgent: req.get('user-agent') || null,
      ip: req.ip || null
    });

    const token = authService.generateToken({
      sessionId: session.id,
      userId: user.id,
      practiceId: user.practice_id
    });

    // DSGVO-SAFE: httpOnly Cookie; frontend braucht Token nicht im JS-Kontext
    res.cookie('anamnese_session', token, {
      httpOnly: true,
      secure: parseBooleanEnv(process.env.COOKIE_SECURE, process.env.NODE_ENV === 'production'),
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    await logAudit(
      user.practice_id,
      'AUTH_LOGIN_SUCCESS',
      { userId: user.id, role: user.role },
      req
    );

    // HISTORY-AWARE: keep response compatible with existing login-ui.js
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        practiceId: user.practice_id
      }
    });
  } catch (err) {
    logger.error('Auth login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/logout
app.post('/api/auth/logout', async (req, res) => {
  if (!requireDatabase(req, res)) return;
  if (!authService) {
    return res.status(503).json({ error: 'Service Unavailable', message: 'Auth not configured' });
  }

  try {
    const token = req.cookies?.anamnese_session;
    if (token) {
      const decoded = authService.verifyToken(token);
      if (decoded?.sessionId) {
        await authService.revokeSession(decoded.sessionId);
      }
    }

    res.clearCookie('anamnese_session');
    res.json({ success: true });
  } catch (err) {
    logger.error('Auth logout error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

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
    
    // DEV BYPASS MODE: Generate code immediately without Stripe
    if (DEV_BYPASS_PAYMENT) {
      const pseudoSessionId = `dev_bypass_${crypto.randomBytes(16).toString('hex')}`;
      
      const metadata = {
        practiceId: practiceId || 'SELFTEST',
        mode,
        language,
        patientData: patientData ? JSON.stringify(patientData) : null
      };
      
      try {
        // Generate code using shared function
        await generateAccessCode(metadata, pseudoSessionId);
        
        // Store pseudo-transaction for tracking
        await pool.query(
          `INSERT INTO transactions (practice_id, stripe_session_id, amount_total, amount_net, tax_amount, status, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
          [
            metadata.practiceId,
            pseudoSessionId,
            0, // No payment in bypass mode
            0,
            0,
            'dev_bypass'
          ]
        );
        
        await logAudit(
          metadata.practiceId,
          'CODE_GENERATED_BYPASS',
          { sessionId: pseudoSessionId, mode, language },
          req
        );
        
        logger.warn('Dev bypass code generated', { sessionId: pseudoSessionId, practiceId: metadata.practiceId });
        
        // Return bypass indicator with sessionId
        return res.json({ 
          sessionId: pseudoSessionId,
          bypass: true 
        });
      } catch (err) {
        logger.error('Error in bypass mode:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
    }
    
    // NORMAL STRIPE MODE: Create Stripe checkout session
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
      // Use shared code generation function
      await generateAccessCode(session.metadata, session.id);
      
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
    
    // Validation: sessionId muss alphanumerisch + underscore sein (dev_bypass_ oder Stripe-Format)
    const schema = Joi.object({
      sessionId: Joi.string().pattern(/^[a-zA-Z0-9_]+$/).max(200).required()
    });
    
    const { error } = schema.validate({ sessionId });
    if (error) {
      return res.status(400).json({ error: 'Invalid sessionId format' });
    }
    
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

// Bypass status endpoint (for frontend to check)
app.get('/api/bypass-status', (req, res) => {
  res.json({ bypassEnabled: DEV_BYPASS_PAYMENT });
});

// =============================================================================
// GLOBAL ERROR HANDLER (HISTORY-AWARE: Phase 3 - Error Handling)
// =============================================================================
const { ErrorHandler } = require('./middleware/error-handler');

// Not Found Handler (must be before error handler)
app.use(ErrorHandler.notFound);

// Global Error Handler (must be last middleware)
app.use(ErrorHandler.handle);

// Start server
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  if (!pool) {
    process.exit(0);
  }
  pool.end(() => {
    logger.info('Database pool closed');
    process.exit(0);
  });
});
