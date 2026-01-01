// =============================================================================
// GLOBAL ERROR HANDLER - Debug-Overlay (Frontend + Backend)
// =============================================================================
// HISTORY-AWARE: Phase 3 - Tester-Feedback-System
// DSGVO-SAFE: Keine personenbezogenen Daten im Stack-Trace

// =============================================================================
// BACKEND: Express Error Middleware
// =============================================================================
class ErrorHandler {
  static handle(err, req, res, next) {
    let logger = null;
    try {
      logger = require('../logger');
    } catch {
      logger = null;
    }

    // Log error
      const isProd = process.env.NODE_ENV === 'production';
      const safeLog = {
        message: err?.message || 'Unknown error',
        name: err?.name,
        code: err?.code,
        status: err?.status || err?.statusCode
      };
      // In production: avoid logging stack traces / URLs to reduce PII risk.
      // In development: include stack for debugging.
      if (!isProd && err?.stack) safeLog.stack = err.stack;
    if (logger) {
      logger.error('[Error Handler]', safeLog);
    }

    // Determine status code
    const statusCode = err.statusCode || err.status || 500;

    // DSGVO-SAFE: Remove sensitive data from error response
    const safeError = {
      error: err.name || 'Error',
      message: err.message,
      statusCode,
      timestamp: new Date().toISOString(),
      path: req.originalUrl,
      method: req.method
    };

    // Add stack trace only in development
    if (process.env.NODE_ENV === 'development') {
      safeError.stack = err.stack;
      safeError.details = err.details || {};
    }

    // Send JSON response
    res.status(statusCode).json(safeError);
  }

  // Async error wrapper
  static asyncHandler(fn) {
    return (req, res, next) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  }

  // Not Found Handler
  static notFound(req, res, next) {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    error.statusCode = 404;
    next(error);
  }
}

// =============================================================================
// FRONTEND: Error Boundary (Vanilla JS)
// =============================================================================
const ErrorOverlay = {
  isVisible: false,
  errors: [],

  init() {
    // Catch global errors
    window.addEventListener('error', (event) => {
      this.captureError({
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack
      });
    });

    // Catch unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.captureError({
        message: `Unhandled Promise Rejection: ${event.reason}`,
        stack: event.reason?.stack
      });
    });

    // Create overlay HTML
    this.createOverlay();
  },

  captureError(error) {
    console.warn('[Error Overlay] Captured:', error?.message || 'Unknown error');

    this.errors.push({
      ...error,
      timestamp: new Date().toISOString(),
      urlPath: window.location.pathname
    });

    this.show();
    this.render();
  },

  createOverlay() {
    const overlay = document.createElement('div');
    overlay.id = 'error-overlay';
    overlay.innerHTML = `
      <style>
        #error-overlay {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.9);
          z-index: 999999;
          overflow: auto;
          font-family: 'Courier New', monospace;
          color: #fff;
        }
        #error-overlay.visible {
          display: block;
        }
        .error-header {
          background: #d32f2f;
          padding: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .error-header h1 {
          margin: 0;
          font-size: 24px;
        }
        .error-close {
          background: #fff;
          color: #d32f2f;
          border: none;
          padding: 10px 20px;
          cursor: pointer;
          font-weight: bold;
          border-radius: 4px;
        }
        .error-content {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }
        .error-item {
          background: #1e1e1e;
          border: 1px solid #444;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 20px;
        }
        .error-message {
          font-size: 18px;
          color: #ff5252;
          margin-bottom: 10px;
        }
        .error-stack {
          background: #000;
          padding: 15px;
          border-radius: 4px;
          overflow-x: auto;
          font-size: 12px;
          line-height: 1.6;
          white-space: pre-wrap;
        }
        .error-meta {
          margin-top: 10px;
          font-size: 12px;
          color: #aaa;
        }
        .error-actions {
          margin-top: 20px;
          display: flex;
          gap: 10px;
        }
        .error-btn {
          padding: 10px 20px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: bold;
        }
        .error-btn-copy {
          background: #2196f3;
          color: #fff;
        }
        .error-btn-reload {
          background: #4caf50;
          color: #fff;
        }
        .error-user-notes {
          margin-top: 20px;
        }
        .error-user-notes textarea {
          width: 100%;
          min-height: 100px;
          padding: 10px;
          border: 1px solid #444;
          border-radius: 4px;
          background: #1e1e1e;
          color: #fff;
          font-family: inherit;
          font-size: 14px;
        }
      </style>
      <div class="error-header">
        <h1>⚠️ Application Error</h1>
        <button class="error-close" onclick="ErrorOverlay.hide()">✕ Close</button>
      </div>
      <div class="error-content" id="error-content">
        <!-- Errors rendered here -->
      </div>
    `;
    document.body.appendChild(overlay);
  },

  show() {
    const overlay = document.getElementById('error-overlay');
    if (overlay) {
      overlay.classList.add('visible');
      this.isVisible = true;
    }
  },

  hide() {
    const overlay = document.getElementById('error-overlay');
    if (overlay) {
      overlay.classList.remove('visible');
      this.isVisible = false;
    }
  },

  render() {
    const content = document.getElementById('error-content');
    if (!content) return;

    content.innerHTML = this.errors.map((error, index) => `
      <div class="error-item">
        <div class="error-message">
          <strong>Error ${index + 1}:</strong> ${this.escapeHtml(error.message)}
        </div>
        ${error.stack ? `
          <div class="error-stack">${this.escapeHtml(error.stack)}</div>
        ` : ''}
        <div class="error-meta">
          <div><strong>Time:</strong> ${error.timestamp}</div>
          <div><strong>Path:</strong> ${error.urlPath || ''}</div>
          ${error.filename ? `<div><strong>File:</strong> ${error.filename}:${error.lineno}:${error.colno}</div>` : ''}
        </div>
        <div class="error-user-notes">
          <label><strong>What were you doing when this happened?</strong></label>
          <textarea id="user-notes-${index}" placeholder="Please describe the steps that led to this error..."></textarea>
        </div>
        <div class="error-actions">
          <button class="error-btn error-btn-copy" onclick="ErrorOverlay.copyReport(${index})">
            📋 Copy Error Report
          </button>
          <button class="error-btn error-btn-reload" onclick="window.location.reload()">
            🔄 Reload Page
          </button>
        </div>
      </div>
    `).join('');
  },

  copyReport(index) {
    const error = this.errors[index];
    const userNotes = document.getElementById(`user-notes-${index}`)?.value || 'No user notes provided';

    const report = {
      error: {
        message: error.message,
        stack: error.stack,
        filename: error.filename,
        lineno: error.lineno,
        colno: error.colno
      },
      context: {
        timestamp: error.timestamp,
        path: error.urlPath
      },
      userFeedback: userNotes
    };

    const reportJSON = JSON.stringify(report, null, 2);

    // Copy to clipboard
    navigator.clipboard.writeText(reportJSON).then(() => {
      alert('✅ Error report copied to clipboard!\n\nYou can now paste this into your bug report.');
    }).catch(() => {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = reportJSON;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      alert('✅ Error report copied to clipboard!');
    });
  },

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
};

// Auto-initialize on page load
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    ErrorOverlay.init();
    console.warn('[Error Overlay] Initialized');
  });
}

// =============================================================================
// EXPORTS
// =============================================================================
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ErrorHandler, ErrorOverlay };
}
