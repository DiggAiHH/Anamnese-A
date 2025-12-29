/**
 * ANAMNESE-A BACKEND SERVER v8 - Mock Login Edition
 * Features: CORS, Rate-Limiting, JWT, UTF-8, Health-Check
 */

const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-v8-app-change-in-production';

if (!process.env.JWT_SECRET) {
  console.warn('⚠️  WARNING: Using hardcoded JWT_SECRET!');
}

// CORS Whitelist
const ALLOWED_ORIGINS = [
  'http://localhost:8080',
  'http://localhost:8081',
  'http://127.0.0.1:8080',
  'http://127.0.0.1:8081'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`❌ CORS blocked: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: 'Too many requests' }
});
app.use('/api/', limiter);

// In-Memory Session Store
const sessions = new Map();
const TEST_USERS = new Map([
  ['test@example.com', { 
    id: 1, 
    email: 'test@example.com', 
    password: 'password123',
    name: 'Test User'
  }],
  ['测试@example.com', {
    id: 2,
    email: '测试@example.com',
    password: 'unicode密码',
    name: '测试用户'
  }]
]);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: Date.now(),
    uptime: process.uptime(),
    version: '8.2.0'
  });
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email und Passwort erforderlich'
      });
    }

    const user = TEST_USERS.get(email);
    
    if (!user || user.password !== password) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return res.status(401).json({
        error: 'Ungültige Anmeldedaten'
      });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    sessions.set(token, {
      userId: user.id,
      email: user.email,
      loginTime: Date.now()
    });

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

// Logout
app.post('/api/auth/logout', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (token) sessions.delete(token);
  res.json({ success: true });
});

// Verify Token Middleware
function verifyToken(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Kein Token' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Ungültiges Token' });
  }
}

// Protected Profile
app.get('/api/user/profile', verifyToken, (req, res) => {
  const user = TEST_USERS.get(req.user.email);
  if (!user) {
    return res.status(404).json({ error: 'User nicht gefunden' });
  }
  res.json({
    id: user.id,
    email: user.email,
    name: user.name
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint nicht gefunden',
    path: req.path
  });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Interner Serverfehler'
  });
});

// Server Start
const server = app.listen(PORT, () => {
  console.log('');
  console.log('='.repeat(60));
  console.log(`✅ Anamnese-A Backend v8 running`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`🔐 Test Login: test@example.com / password123`);
  console.log('='.repeat(60));
  console.log('');
  console.log('📍 Endpoints:');
  console.log(`  GET  /api/health`);
  console.log(`  POST /api/auth/login`);
  console.log(`  POST /api/auth/logout`);
  console.log(`  GET  /api/user/profile (protected)`);
  console.log('');
});

// Graceful Shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM: closing server');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

module.exports = app;
