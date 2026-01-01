// =============================================================================
// AUTH MIDDLEWARE - JWT/Session-Handling (DSGVO-konform)
// =============================================================================
// HISTORY-AWARE: No localStorage (XSS risk), use httpOnly cookies instead
// DSGVO-SAFE: Session data stays on server, only session ID in cookie

const jwt = require('jsonwebtoken');
const logger = require('../logger');

// HISTORY-AWARE: avoid hardcoded production secrets
// DSGVO-SAFE: token only contains sessionId + minimal identifiers
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET is required in production');
  }
  logger.warn('JWT_SECRET is not set; using development fallback (NOT for production)');
}

const EFFECTIVE_JWT_SECRET = JWT_SECRET || 'dev-insecure-jwt-secret-change-in-production';
const JWT_EXPIRY = '7d'; // 7 days
const SESSION_COOKIE_NAME = 'anamnese_session';

class AuthService {
  constructor(pool) {
    this.pool = pool;
  }

  // Generate JWT token
  generateToken(payload) {
    return jwt.sign(payload, EFFECTIVE_JWT_SECRET, { expiresIn: JWT_EXPIRY });
  }

  // Verify JWT token
  verifyToken(token) {
    try {
      return jwt.verify(token, EFFECTIVE_JWT_SECRET);
    } catch (error) {
      return null;
    }
  }

  // Create session in database (DSGVO-compliant)
  async createSession(userId, practiceId, metadata = {}) {
    const sessionId = require('crypto').randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const query = `
      INSERT INTO sessions (id, user_id, practice_id, metadata, expires_at, created_at)
      VALUES ($1, $2, $3, $4, $5, NOW())
      RETURNING id, expires_at
    `;

    try {
      const result = await this.pool.query(query, [
        sessionId,
        userId,
        practiceId,
        JSON.stringify(metadata),
        expiresAt
      ]);
      return result.rows[0];
    } catch (error) {
      logger.error('[Auth] Session creation failed', { message: error?.message });
      throw new Error('Session creation failed');
    }
  }

  // Get session from database
  async getSession(sessionId) {
    const query = `
      SELECT s.*, u.email, p.name as practice_name
      FROM sessions s
      LEFT JOIN users u ON s.user_id = u.id
      LEFT JOIN practices p ON s.practice_id = p.id
      WHERE s.id = $1 AND s.expires_at > NOW() AND s.revoked = FALSE
    `;

    try {
      const result = await this.pool.query(query, [sessionId]);
      return result.rows[0] || null;
    } catch (error) {
      logger.error('[Auth] Session retrieval failed', { message: error?.message });
      return null;
    }
  }

  // Invalidate session (logout)
  async revokeSession(sessionId) {
    const query = `
      UPDATE sessions
      SET revoked = TRUE, revoked_at = NOW()
      WHERE id = $1
    `;

    try {
      await this.pool.query(query, [sessionId]);
      return true;
    } catch (error) {
      logger.error('[Auth] Session revocation failed', { message: error?.message });
      return false;
    }
  }

  // Clean expired sessions (GDPR Art. 5: Storage Limitation)
  async cleanExpiredSessions() {
    const query = `
      DELETE FROM sessions
      WHERE expires_at < NOW() OR revoked = TRUE
    `;

    try {
      const result = await this.pool.query(query);
      logger.warn('[Auth] Cleaned expired sessions', { count: result.rowCount });
      return result.rowCount;
    } catch (error) {
      logger.error('[Auth] Session cleanup failed', { message: error?.message });
      return 0;
    }
  }
}

// Express Middleware: Verify JWT + Session
function authMiddleware(authService) {
  return async (req, res, next) => {
    try {
      // 1. Extract token from cookie (httpOnly, secure)
      const token = req.cookies[SESSION_COOKIE_NAME];

      if (!token) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'No session token provided'
        });
      }

      // 2. Verify JWT
      const decoded = authService.verifyToken(token);
      if (!decoded) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Invalid or expired token'
        });
      }

      // 3. Verify session in database
      const session = await authService.getSession(decoded.sessionId);
      if (!session) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Session not found or expired'
        });
      }

      // 4. Attach session to request
      req.session = session;
      req.user = {
        id: session.user_id,
        email: session.email,
        practiceId: session.practice_id,
        practiceName: session.practice_name
      };

      next();
    } catch (error) {
      logger.error('[Auth Middleware] Error', { message: error?.message });
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Authentication check failed'
      });
    }
  };
}

// Optional: Public routes (no auth required)
function optionalAuth(authService) {
  return async (req, res, next) => {
    const token = req.cookies[SESSION_COOKIE_NAME];

    if (token) {
      const decoded = authService.verifyToken(token);
      if (decoded) {
        const session = await authService.getSession(decoded.sessionId);
        if (session) {
          req.session = session;
          req.user = {
            id: session.user_id,
            email: session.email,
            practiceId: session.practice_id
          };
        }
      }
    }

    next();
  };
}

module.exports = {
  AuthService,
  authMiddleware,
  optionalAuth,
  SESSION_COOKIE_NAME,
  JWT_SECRET,
  JWT_EXPIRY
};
