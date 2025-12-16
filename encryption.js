// AES-256 Encryption using Web Crypto API
// All encryption happens locally in the browser

let currentAction = null;

// Derive key from password using PBKDF2
async function deriveKey(password, salt) {
    const encoder = new TextEncoder();
    const passwordKey = await crypto.subtle.importKey(
        'raw',
        encoder.encode(password),
        'PBKDF2',
        false,
        ['deriveBits', 'deriveKey']
    );

    return crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: salt,
            iterations: 100000,
            hash: 'SHA-256'
        },
        passwordKey,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
    );
}

// Encrypt data with AES-256-GCM
async function encryptData(data, password) {
    const encoder = new TextEncoder();
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    const key = await deriveKey(password, salt);
    
    const encryptedData = await crypto.subtle.encrypt(
        {
            name: 'AES-GCM',
            iv: iv
        },
        key,
        encoder.encode(data)
    );

    // Combine salt, iv, and encrypted data
    const result = new Uint8Array(salt.length + iv.length + encryptedData.byteLength);
    result.set(salt, 0);
    result.set(iv, salt.length);
    result.set(new Uint8Array(encryptedData), salt.length + iv.length);

    // Convert to base64 for storage
    return btoa(String.fromCharCode.apply(null, result));
}

// Decrypt data with AES-256-GCM
async function decryptData(encryptedBase64, password) {
    const decoder = new TextDecoder();
    
    // Decode from base64
    const encryptedArray = new Uint8Array(
        atob(encryptedBase64).split('').map(c => c.charCodeAt(0))
    );

    // Extract salt, iv, and encrypted data
    const salt = encryptedArray.slice(0, 16);
    const iv = encryptedArray.slice(16, 28);
    const data = encryptedArray.slice(28);

    const key = await deriveKey(password, salt);

    try {
        const decryptedData = await crypto.subtle.decrypt(
            {
                name: 'AES-GCM',
                iv: iv
            },
            key,
            data
        );

        return decoder.decode(decryptedData);
    } catch (e) {
        throw new Error('Decryption failed - incorrect password');
    }
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
    const password = document.getElementById('encryptionPassword').value;
    
    if (!password) {
        alert(translations[currentLanguage].alertPassword);
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

// Perform save with encryption
async function performSave(password) {
    try {
        const formData = getFormData();
        const jsonData = JSON.stringify(formData);
        
        const encryptedData = await encryptData(jsonData, password);
        
        // Save to localStorage
        localStorage.setItem('anamneseData', encryptedData);
        
        alert(translations[currentLanguage].alertSaved);
    } catch (error) {
        console.error('Save error:', error);
        alert('Error saving data: ' + error.message);
    }
}

// Perform load with decryption
async function performLoad(password) {
    try {
        const encryptedData = localStorage.getItem('anamneseData');
        
        if (!encryptedData) {
            alert(translations[currentLanguage].alertNoData);
            return;
        }
        
        const jsonData = await decryptData(encryptedData, password);
        const formData = JSON.parse(jsonData);
        
        setFormData(formData);
        
        alert(translations[currentLanguage].alertLoaded);
    } catch (error) {
        console.error('Load error:', error);
        alert(translations[currentLanguage].alertError);
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
