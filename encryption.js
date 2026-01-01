// AES-256 Encryption using Web Crypto API
// All encryption happens locally in the browser
// OWASP 2023 Compliant: PBKDF2 with 600,000 iterations

let currentAction = null;

// =============================================================================
// CRITICAL FIX: Brute-Force Protection
// =============================================================================
let failedDecryptAttempts = 0;
let lockoutUntil = null;
const MAX_ATTEMPTS_BEFORE_LOCKOUT = 3;

// =============================================================================
// CRITICAL FIX: Race Condition Prevention
// =============================================================================
window.encryptionInProgress = false;

function resolveSharedEncryptionCore() {
    if (typeof globalThis !== 'undefined' && globalThis.SharedEncryption) {
        return globalThis.SharedEncryption;
    }
    if (typeof module === 'object' && module.exports) {
        try {
            // eslint-disable-next-line global-require
            return require('./shared/encryption.js');
        } catch (error) {
            console.error('Failed to load shared encryption module via require:', error);
        }
    }
    return null;
}

const SharedEncryptionCore = resolveSharedEncryptionCore();

if (!SharedEncryptionCore) {
    throw new Error('Shared encryption core module not loaded. Please ensure shared/encryption.js is included before encryption.js');
}

function validatePasswordStrength(password) {
    return SharedEncryptionCore.validatePasswordStrength(password);
}

async function deriveKey(password, salt, c) {
    return SharedEncryptionCore.deriveKey(password, salt, c);
}

async function encryptData(data, password, skipValidation = false, c) {
    return SharedEncryptionCore.encryptData(data, password, {
        skipValidation,
        cryptoImpl: c
    });
}

async function decryptData(encryptedBase64, password, c) {
    return SharedEncryptionCore.decryptData(encryptedBase64, password, {
        cryptoImpl: c
    });
}

// Show password modal
function showPasswordModal(action) {
    currentAction = action;
    document.getElementById('passwordModal').style.display = 'block';
    document.getElementById('encryptionPassword').value = '';
    document.getElementById('encryptionPassword').focus();
}

// Close password modal
function closePasswordModal() {
    document.getElementById('passwordModal').style.display = 'none';
    currentAction = null;
}

// Confirm password and execute action
async function confirmPassword() {
    // Check lockout before proceeding
    if (lockoutUntil && Date.now() < lockoutUntil) {
        const remainingSeconds = Math.ceil((lockoutUntil - Date.now()) / 1000);
        showError(`Too many failed attempts. Please wait ${remainingSeconds} seconds.`, 'error');
        return;
    }
    
    const password = document.getElementById('encryptionPassword').value;
    
    if (!password) {
        showError(translations[currentLanguage].alertPassword || 'Please enter a password', 'warning');
        return;
    }

    closePasswordModal();

    if (currentAction === 'save') {
        await performSave(password);
    } else if (currentAction === 'load') {
        await performLoad(password);
    }
}

// Get form data
function getFormData() {
    const form = document.getElementById('anamneseForm');
    const formData = new FormData(form);
    const data = {};
    
    for (let [key, value] of formData.entries()) {
        if (key === 'privacyConsent') {
            data[key] = form.elements[key].checked;
        } else {
            data[key] = value;
        }
    }
    
    // Add timestamp and language
    data.timestamp = new Date().toISOString();
    data.language = currentLanguage;
    
    return data;
}

// Set form data
function setFormData(data) {
    const form = document.getElementById('anamneseForm');
    
    for (let key in data) {
        if (key === 'timestamp' || key === 'language') continue;
        
        const element = form.elements[key];
        if (element) {
            if (element.type === 'checkbox') {
                element.checked = data[key];
            } else {
                element.value = data[key] || '';
            }
        }
    }
    
    // Set language if available
    if (data.language) {
        document.getElementById('language').value = data.language;
        changeLanguage();
    }
}

// =================================================================
// BUG FIX #6: SECURE performSave() with SecureStorage
// =================================================================

/**
 * Perform save with encryption and secure storage handling
 * @param {string} password - Master password
 * @returns {Promise<boolean>} - Success status
 */
async function performSave(password) {
    // Prevent race condition
    if (window.encryptionInProgress) {
        if (typeof showError === 'function') {
            showError('Encryption already in progress. Please wait.', 'warning');
        } else {
            alert('Encryption already in progress. Please wait.');
        }
        return false;
    }
    
    window.encryptionInProgress = true;
    
    // Show loading spinner if available
    if (typeof LoadingSpinner !== 'undefined' && LoadingSpinner.show) {
        LoadingSpinner.show(translations[currentLanguage].encrypting || 'Encrypting data...');
    }
    
    try {
        // Clear autosave timer to prevent race condition
        if (window.autosaveTimer) {
            clearTimeout(window.autosaveTimer);
        }
        
        const formData = getFormData();
        const jsonData = JSON.stringify(formData);
        
        const encryptedData = await encryptData(jsonData, password);
        
        // Use SecureStorage wrapper if available (from index_v8_complete.html)
        if (typeof SecureStorage !== 'undefined' && SecureStorage.setItem) {
            const success = SecureStorage.setItem('anamneseData', encryptedData);
            if (!success) {
                throw new Error('Storage full. Please export and delete old data.');
            }
        } else if (typeof StorageHandler !== 'undefined' && StorageHandler.setItem) {
            // Use StorageHandler from app.js
            const result = StorageHandler.setItem('anamneseData', encryptedData);
            if (!result.success) {
                throw new Error(result.error);
            }
            if (result.warning && typeof showError === 'function') {
                showError(result.warning, 'warning');
            }
        } else {
            // Fallback: Direct localStorage with try-catch
            try {
                localStorage.setItem('anamneseData', encryptedData);
            } catch (storageError) {
                if (storageError.name === 'QuotaExceededError') {
                    throw new Error('Storage full. Please export and delete old data.');
                }
                throw storageError;
            }
        }
        
        // Remove unencrypted draft after successful save
        try {
            localStorage.removeItem('anamneseDraft');
        } catch (e) {
            console.warn('Could not remove draft:', e);
        }
        
        // Show success
        if (typeof showSuccess === 'function') {
            showSuccess(translations[currentLanguage].alertSaved || 'Data saved successfully');
        } else {
            alert(translations[currentLanguage].alertSaved);
        }
        
        return true;
        
    } catch (error) {
        console.error('Save error:', error);
        
        const errorMsg = error.message.includes('Weak password') 
            ? error.message
            : '❌ Fehler beim Speichern:\n' + error.message;
        
        if (typeof showError === 'function') {
            showError(errorMsg, 'error');
        } else {
            alert(errorMsg);
        }
        
        return false;
        
    } finally {
        window.encryptionInProgress = false;
        if (typeof LoadingSpinner !== 'undefined' && LoadingSpinner.hide) {
            LoadingSpinner.hide();
        }
    }
}

// Perform load with decryption
async function performLoad(password) {
    // Check lockout
    if (typeof lockoutUntil !== 'undefined' && lockoutUntil && Date.now() < lockoutUntil) {
        const remainingSeconds = Math.ceil((lockoutUntil - Date.now()) / 1000);
        const msg = `Too many failed attempts. Please wait ${remainingSeconds} seconds.`;
        if (typeof showError === 'function') {
            showError(msg, 'error');
        } else {
            alert(msg);
        }
        return false;
    }
    
    // Show loading spinner
    if (typeof LoadingSpinner !== 'undefined' && LoadingSpinner.show) {
        LoadingSpinner.show(translations[currentLanguage].decrypting || 'Decrypting data...');
    }
    
    try {
        const encryptedData = localStorage.getItem('anamneseData');
        
        if (!encryptedData) {
            if (typeof showError === 'function') {
                showError(translations[currentLanguage].alertNoData || 'No saved data found', 'info');
            } else {
                alert(translations[currentLanguage].alertNoData);
            }
            return false;
        }
        
        const jsonData = await decryptData(encryptedData, password);
        const formData = JSON.parse(jsonData);
        
        setFormData(formData);
        
        // Reset failed attempts on success
        if (typeof failedDecryptAttempts !== 'undefined') {
            failedDecryptAttempts = 0;
            lockoutUntil = null;
        }
        
        // Store successful decrypt timestamp
        try {
            sessionStorage.setItem('lastSuccessfulDecrypt', Date.now());
        } catch (e) {
            console.warn('Could not store decrypt timestamp:', e);
        }
        
        if (typeof showSuccess === 'function') {
            showSuccess(translations[currentLanguage].alertLoaded || 'Data loaded successfully');
        } else {
            alert(translations[currentLanguage].alertLoaded);
        }
        
        return true;
        
    } catch (error) {
        console.error('Load error:', error);
        
        // Increment failed attempts if variable exists
        if (typeof failedDecryptAttempts !== 'undefined') {
            failedDecryptAttempts++;
            
            // Progressive lockout after 3 attempts
            if (failedDecryptAttempts >= 3) {
                const lockoutDuration = Math.pow(2, failedDecryptAttempts - 3) * 30000;
                lockoutUntil = Date.now() + lockoutDuration;
                const lockoutSeconds = Math.ceil(lockoutDuration / 1000);
                const msg = `Too many failed attempts. Locked for ${lockoutSeconds} seconds.`;
                if (typeof showError === 'function') {
                    showError(msg, 'error');
                } else {
                    alert(msg);
                }
                return false;
            }
        }
        
        // Show appropriate error
        if (error.message.includes('incorrect password') || error.message.includes('Decryption failed')) {
            const attemptInfo = typeof failedDecryptAttempts !== 'undefined' 
                ? ` (Attempt ${failedDecryptAttempts}/3)` 
                : '';
            const msg = (translations[currentLanguage].wrongPassword || 'Wrong password') + attemptInfo;
            if (typeof showError === 'function') {
                showError(msg, 'warning');
            } else {
                alert(msg);
            }
        } else {
            if (typeof showError === 'function') {
                showError(translations[currentLanguage].alertError || 'Error: ' + error.message, 'error');
            } else {
                alert(translations[currentLanguage].alertError);
            }
        }
        
        return false;
        
    } finally {
        if (typeof LoadingSpinner !== 'undefined' && LoadingSpinner.hide) {
            LoadingSpinner.hide();
        }
    }
}

// Save encrypted (called from button)
function saveEncrypted() {
    showPasswordModal('save');
}

// Load encrypted (called from button)
function loadEncrypted() {
    showPasswordModal('load');
}

// Export as JSON (unencrypted)
function exportJSON() {
    const formData = getFormData();
    const jsonData = JSON.stringify(formData, null, 2);
    
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `anamnese_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    alert(translations[currentLanguage].alertExported);
}

// Clear form
function clearForm() {
    if (confirm('Are you sure you want to clear all form data?')) {
        document.getElementById('anamneseForm').reset();
        alert(translations[currentLanguage].alertCleared);
    }
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('passwordModal');
    if (event.target === modal) {
        closePasswordModal();
    }
}

// Handle Enter key in password field
document.addEventListener('DOMContentLoaded', function() {
    const passwordInput = document.getElementById('encryptionPassword');
    if (passwordInput) {
        passwordInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                confirmPassword();
            }
        });
    }
});
