/**
 * ERROR BOUNDARY & DEBUG OVERLAY
 * HISTORY-AWARE: User wants "Copy Report" button for easy debugging
 * DSGVO-SAFE: No external error tracking, all data stays local
 */

class ErrorReportingSystem {
  constructor() {
    this.errors = [];
    this.maxErrors = 50; // DSGVO: Limit stored errors
    this.initialized = false;
    
    this.init();
  }
  
  init() {
    if (this.initialized) return;
    
    // Global error handler
    window.addEventListener('error', (event) => {
      this.captureError({
        type: 'JavaScript Error',
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack || 'No stack trace',
        timestamp: new Date().toISOString()
      });
    });
    
    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.captureError({
        type: 'Unhandled Promise Rejection',
        message: event.reason?.message || String(event.reason),
        stack: event.reason?.stack || 'No stack trace',
        timestamp: new Date().toISOString()
      });
    });
    
    // Console.error override (capture but still log)
    const originalError = console.error;
    console.error = (...args) => {
      this.captureError({
        type: 'Console Error',
        message: args.map(a => String(a)).join(' '),
        timestamp: new Date().toISOString()
      });
      originalError.apply(console, args);
    };
    
    this.initialized = true;
    console.log('✅ Error Reporting System initialized (DSGVO-compliant, local only)');
  }
  
  captureError(errorData) {
    // Add to error list
    this.errors.push(errorData);
    
    // DSGVO: Limit stored errors
    if (this.errors.length > this.maxErrors) {
      this.errors.shift();
    }
    
    // Show error modal
    this.showErrorModal(errorData);
    
    // Store in sessionStorage (cleared on browser close)
    try {
      sessionStorage.setItem('anamnese_errors', JSON.stringify(this.errors));
    } catch (e) {
      console.warn('Could not store errors in sessionStorage:', e);
    }
  }
  
  showErrorModal(errorData) {
    // Check if modal already exists
    let modal = document.getElementById('error-reporting-modal');
    
    if (!modal) {
      // Create modal
      modal = document.createElement('div');
      modal.id = 'error-reporting-modal';
      modal.innerHTML = `
        <div class="error-overlay">
          <div class="error-modal">
            <div class="error-header">
              <h2>❌ Fehler aufgetreten</h2>
              <button class="error-close" onclick="document.getElementById('error-reporting-modal').remove()">×</button>
            </div>
            <div class="error-body">
              <div class="error-type">${errorData.type}</div>
              <div class="error-message">${this.escapeHtml(errorData.message)}</div>
              ${errorData.stack ? `<details class="error-stack">
                <summary>Stack Trace</summary>
                <pre>${this.escapeHtml(errorData.stack)}</pre>
              </details>` : ''}
              <div class="error-context">
                <strong>Zeitstempel:</strong> ${errorData.timestamp}<br>
                <strong>User Agent:</strong> ${navigator.userAgent}<br>
                <strong>URL:</strong> ${window.location.href}<br>
                <strong>Viewport:</strong> ${window.innerWidth}x${window.innerHeight}
              </div>
            </div>
            <div class="error-footer">
              <button class="error-btn error-btn-primary" onclick="window.errorReporting.copyReport()">
                📋 Report kopieren
              </button>
              <button class="error-btn error-btn-secondary" onclick="window.errorReporting.downloadReport()">
                💾 Als JSON herunterladen
              </button>
              <button class="error-btn error-btn-danger" onclick="window.errorReporting.clearErrors()">
                🗑️ Alle löschen
              </button>
            </div>
          </div>
        </div>
      `;
      
      // Add styles
      if (!document.getElementById('error-reporting-styles')) {
        const style = document.createElement('style');
        style.id = 'error-reporting-styles';
        style.textContent = `
          .error-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 999999;
            animation: fadeIn 0.3s;
          }
          
          .error-modal {
            background: #fff;
            border-radius: 8px;
            max-width: 800px;
            width: 90%;
            max-height: 80vh;
            overflow: auto;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
          }
          
          .error-header {
            background: #dc3545;
            color: white;
            padding: 16px 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-radius: 8px 8px 0 0;
          }
          
          .error-header h2 {
            margin: 0;
            font-size: 20px;
          }
          
          .error-close {
            background: none;
            border: none;
            color: white;
            font-size: 32px;
            cursor: pointer;
            line-height: 1;
          }
          
          .error-body {
            padding: 20px;
          }
          
          .error-type {
            font-weight: bold;
            color: #dc3545;
            margin-bottom: 8px;
          }
          
          .error-message {
            font-family: 'Courier New', monospace;
            background: #f8f9fa;
            padding: 12px;
            border-left: 4px solid #dc3545;
            margin-bottom: 16px;
            word-break: break-word;
          }
          
          .error-stack {
            margin-bottom: 16px;
          }
          
          .error-stack summary {
            cursor: pointer;
            font-weight: bold;
            color: #007bff;
            margin-bottom: 8px;
          }
          
          .error-stack pre {
            background: #f8f9fa;
            padding: 12px;
            overflow-x: auto;
            font-size: 12px;
            border-left: 4px solid #ffc107;
          }
          
          .error-context {
            font-size: 13px;
            color: #6c757d;
            background: #f8f9fa;
            padding: 12px;
            border-radius: 4px;
          }
          
          .error-footer {
            padding: 16px 20px;
            background: #f8f9fa;
            display: flex;
            gap: 8px;
            border-radius: 0 0 8px 8px;
          }
          
          .error-btn {
            padding: 10px 16px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
            transition: all 0.2s;
          }
          
          .error-btn-primary {
            background: #007bff;
            color: white;
          }
          
          .error-btn-primary:hover {
            background: #0056b3;
          }
          
          .error-btn-secondary {
            background: #6c757d;
            color: white;
          }
          
          .error-btn-secondary:hover {
            background: #545b62;
          }
          
          .error-btn-danger {
            background: #dc3545;
            color: white;
          }
          
          .error-btn-danger:hover {
            background: #c82333;
          }
          
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          
          @media (max-width: 600px) {
            .error-modal {
              width: 95%;
              max-height: 90vh;
            }
            
            .error-footer {
              flex-direction: column;
            }
            
            .error-btn {
              width: 100%;
            }
          }
        `;
        document.head.appendChild(style);
      }
      
      document.body.appendChild(modal);
    }
  }
  
  copyReport() {
    const report = this.generateReport();
    
    navigator.clipboard.writeText(report).then(() => {
      alert('✅ Error Report in Zwischenablage kopiert!\n\nJetzt kannst du ihn an den Entwickler senden.');
    }).catch(err => {
      console.error('Copy failed:', err);
      
      // Fallback: Show in textarea
      const textarea = document.createElement('textarea');
      textarea.value = report;
      textarea.style.cssText = 'position:absolute;left:-9999px;';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      
      alert('✅ Error Report kopiert (Fallback-Methode)');
    });
  }
  
  downloadReport() {
    const report = this.generateReport();
    const blob = new Blob([report], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `anamnese-error-report-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    alert('✅ Error Report als JSON heruntergeladen!');
  }
  
  generateReport() {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      language: navigator.language,
      platform: navigator.platform,
      cookiesEnabled: navigator.cookieEnabled,
      errors: this.errors,
      // DSGVO: No personal data, no tracking
      note: 'This report contains NO personal data. All error tracking is local.'
    }, null, 2);
  }
  
  clearErrors() {
    if (confirm('Alle gespeicherten Fehler löschen?')) {
      this.errors = [];
      sessionStorage.removeItem('anamnese_errors');
      document.getElementById('error-reporting-modal')?.remove();
      alert('✅ Alle Fehler gelöscht!');
    }
  }
  
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  
  // Public API
  getErrors() {
    return [...this.errors];
  }
  
  getErrorCount() {
    return this.errors.length;
  }
}

// Initialize global error reporting
window.errorReporting = new ErrorReportingSystem();

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ErrorReportingSystem;
}
