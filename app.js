// Main Application Logic
// Handles form initialization and general app functionality

// =============================================================================
// CRITICAL FIX #1: Safe Storage Handler with Quota Management
// =============================================================================
const StorageHandler = {
    setItem: function(key, value) {
        try {
            localStorage.setItem(key, value);
            return { success: true };
        } catch (e) {
            if (e.name === 'QuotaExceededError') {
                console.warn('Storage quota exceeded, attempting cleanup');
                try {
                    // Try to free up space by removing old drafts
                    localStorage.removeItem('anamneseDraft');
                    localStorage.removeItem('gdtAuditLog');
                    localStorage.setItem(key, value);
                    return { success: true, warning: 'Old data cleared' };
                } catch (retryError) {
                    return { 
                        success: false, 
                        error: 'Storage full. Please delete old data or export and clear.',
                        code: 'QUOTA_EXCEEDED'
                    };
                }
            } else if (e.name === 'SecurityError') {
                return {
                    success: false,
                    error: 'Storage access denied. Please check browser settings or disable private mode.',
                    code: 'SECURITY_ERROR'
                };
            }
            return { success: false, error: e.message, code: 'UNKNOWN_ERROR' };
        }
    },
    
    getItem: function(key) {
        try {
            return localStorage.getItem(key);
        } catch (e) {
            console.error('Storage read error:', e);
            return null;
        }
    },
    
    removeItem: function(key) {
        try {
            localStorage.removeItem(key);
            return { success: true };
        } catch (e) {
            return { success: false, error: e.message };
        }
    }
};

// =============================================================================
// CRITICAL FIX #2: XSS Protection - Input Sanitization
// =============================================================================
function sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    return input
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
}

// =============================================================================
// CRITICAL FIX #3: Loading Feedback System
// =============================================================================
const LoadingSpinner = {
    show: function(message = 'Processing...') {
        const existing = document.getElementById('loading-spinner-overlay');
        if (existing) return;
        
        const overlay = document.createElement('div');
        overlay.id = 'loading-spinner-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 10000;
        `;
        overlay.innerHTML = `
            <div class="spinner" style="
                border: 4px solid #f3f3f3;
                border-top: 4px solid #3498db;
                border-radius: 50%;
                width: 50px;
                height: 50px;
                animation: spin 1s linear infinite;
            "></div>
            <p style="color: white; margin-top: 20px; font-size: 16px;">${message}</p>
            <style>
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            </style>
        `;
        document.body.appendChild(overlay);
    },
    
    hide: function() {
        const overlay = document.getElementById('loading-spinner-overlay');
        if (overlay) overlay.remove();
    }
};

// =============================================================================
// CRITICAL FIX #4: Error Display System
// =============================================================================
function showError(message, type = 'error') {
    const colors = {
        error: '#f44336',
        warning: '#ff9800',
        info: '#2196F3',
        success: '#4CAF50'
    };
    
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${colors[type]};
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.3);
        z-index: 10001;
        max-width: 400px;
        animation: slideIn 0.3s ease-out;
    `;
    toast.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 20px;">${type === 'error' ? '❌' : type === 'warning' ? '⚠️' : type === 'success' ? '✅' : 'ℹ️'}</span>
            <span>${sanitizeInput(message)}</span>
        </div>
        <style>
            @keyframes slideIn {
                from { transform: translateX(400px); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        </style>
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => toast.remove(), 300);
    }, 5000);
}

function showSuccess(message) {
    showError(message, 'success');
}

// =============================================================================
// CRITICAL FIX #5: localStorage Availability Check
// =============================================================================
function isLocalStorageAvailable() {
    try {
        const test = '__localStorage_test__';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
    } catch (e) {
        return false;
    }
}

// Initialize fallback storage if localStorage is unavailable
if (!isLocalStorageAvailable()) {
    console.warn('localStorage unavailable, using in-memory fallback');
    window.memoryStorage = {};
    window.localStorage = {
        getItem: (key) => window.memoryStorage[key] || null,
        setItem: (key, val) => { window.memoryStorage[key] = val; },
        removeItem: (key) => { delete window.memoryStorage[key]; },
        clear: () => { window.memoryStorage = {}; }
    };
    showError('localStorage is disabled. Data will be lost when you close this tab. Please enable localStorage or exit private browsing.', 'warning');
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Set initial language
    changeLanguage();
    
    // Add form validation
    const form = document.getElementById('anamneseForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
        });
    }
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Ctrl+S to save
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            saveEncrypted();
        }
        // Ctrl+L to load
        if (e.ctrlKey && e.key === 'l') {
            e.preventDefault();
            loadEncrypted();
        }
        // Ctrl+E to export
        if (e.ctrlKey && e.key === 'e') {
            e.preventDefault();
            exportJSON();
        }
        // ESC to close modal
        if (e.key === 'Escape') {
            closePasswordModal();
            stopVoiceRecognition();
        }
    });
    
    // Autosave functionality (optional)
    setupAutosave();
    
    // Check for saved language preference
    const savedLang = localStorage.getItem('preferredLanguage');
    if (savedLang) {
        document.getElementById('language').value = savedLang;
        changeLanguage();
    }
    
    // Save language preference when changed
    document.getElementById('language').addEventListener('change', function() {
        const result = StorageHandler.setItem('preferredLanguage', this.value);
        if (!result.success) {
            showError('Could not save language preference', 'warning');
        }
    });
    
    // Add print functionality
    setupPrintFunction();
    
    // Show app info on first visit
    showFirstVisitInfo();
    
    console.log('Anamnese Application initialized successfully');
    console.log('Features: 10 languages, AES-256 encryption, VOSK speech recognition, offline operation');
});

// Setup autosave functionality
function setupAutosave() {
    let autosaveTimer;
    const form = document.getElementById('anamneseForm');
    
    // Listen to form changes
    form.addEventListener('input', function() {
        // Clear existing timer
        clearTimeout(autosaveTimer);
        
        // Set new timer (save after 30 seconds of inactivity)
        autosaveTimer = setTimeout(function() {
            // Prevent race condition with encryption
            if (window.encryptionInProgress) {
                console.log('Encryption in progress, skipping autosave');
                return;
            }
            
            // Save draft to localStorage (without encryption)
            const formData = getFormData();
            const result = StorageHandler.setItem('anamneseDraft', JSON.stringify(formData));
            
            if (result.success) {
                console.log('Draft autosaved');
                if (result.warning) {
                    showError(result.warning, 'warning');
                }
            } else {
                showError('Autosave failed: ' + result.error, 'error');
            }
        }, 30000);
    });
    
    // Load draft if available
    const draft = StorageHandler.getItem('anamneseDraft');
    if (draft && !StorageHandler.getItem('anamneseData')) {
        try {
            const draftData = JSON.parse(draft);
            
            // Validate draft structure
            if (typeof draftData !== 'object' || draftData === null) {
                throw new Error('Invalid draft format');
            }
            
            // Only load draft if form is empty
            const isEmpty = !document.getElementById('firstName').value;
            if (isEmpty) {
                setFormData(draftData);
                console.log('Draft loaded');
                showSuccess('Previously saved draft loaded');
            }
        } catch (e) {
            console.error('Error loading draft:', e);
            StorageHandler.removeItem('anamneseDraft');
            showError('Saved draft was corrupted and removed', 'warning');
        }
    }
}

// Setup print functionality
function setupPrintFunction() {
    // Add print button if needed
    const printBtn = document.createElement('button');
    printBtn.type = 'button';
    printBtn.className = 'btn btn-secondary';
    printBtn.textContent = '🖨️ Print';
    printBtn.onclick = function() {
        window.print();
    };
    
    // Could add to button group if desired
    // document.querySelector('.button-group').appendChild(printBtn);
}

// Show info on first visit
function showFirstVisitInfo() {
    const hasVisited = localStorage.getItem('hasVisitedAnamnese');
    
    if (!hasVisited) {
        setTimeout(function() {
            const message = currentLanguage === 'de' ? 
                'Willkommen! Diese Anwendung:\n\n' +
                '✓ Speichert alle Daten nur lokal auf Ihrem Gerät\n' +
                '✓ Verwendet AES-256 Verschlüsselung\n' +
                '✓ Sendet keine Daten an externe Server\n' +
                '✓ Unterstützt 10 Sprachen\n' +
                '✓ Bietet Spracherkennung (VOSK)\n' +
                '✓ Exportiert Daten als JSON\n\n' +
                'Ihre Daten sind sicher und privat!' :
                'Welcome! This application:\n\n' +
                '✓ Stores all data only locally on your device\n' +
                '✓ Uses AES-256 encryption\n' +
                '✓ Does not send data to external servers\n' +
                '✓ Supports 10 languages\n' +
                '✓ Offers speech recognition (VOSK)\n' +
                '✓ Exports data as JSON\n\n' +
                'Your data is safe and private!';
            
            alert(message);
            localStorage.setItem('hasVisitedAnamnese', 'true');
        }, 1000);
    }
}

// Validate form fields
function validateForm() {
    const form = document.getElementById('anamneseForm');
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!field.value) {
            field.style.borderColor = 'red';
            isValid = false;
        } else {
            field.style.borderColor = '';
        }
    });
    
    return isValid;
}

// Format date for display
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString(currentLanguage);
}

// Check browser compatibility
function checkBrowserCompatibility() {
    const features = {
        webCrypto: !!window.crypto && !!window.crypto.subtle,
        localStorage: !!window.localStorage,
        webAudio: !!(window.AudioContext || window.webkitAudioContext),
        mediaDevices: !!navigator.mediaDevices,
        webWorker: !!window.Worker
    };
    
    console.log('Browser compatibility:', features);
    
    if (!features.webCrypto) {
        console.warn('Web Crypto API not available - encryption may not work');
    }
    
    if (!features.localStorage) {
        console.warn('LocalStorage not available - data persistence may not work');
    }
    
    return features;
}

// Check compatibility on load
checkBrowserCompatibility();

// Service Worker for offline support (optional enhancement)
if ('serviceWorker' in navigator) {
    // Could register a service worker for full offline support
    // navigator.serviceWorker.register('sw.js');
}

// Export functions for debugging
window.debugApp = {
    getFormData,
    setFormData,
    validateForm,
    checkBrowserCompatibility
};

console.log('App.js loaded - Application ready');
