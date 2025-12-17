// Main Application Logic
// Handles form initialization and general app functionality

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
        localStorage.setItem('preferredLanguage', this.value);
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
            // Save draft to localStorage (without encryption)
            const formData = getFormData();
            localStorage.setItem('anamneseDraft', JSON.stringify(formData));
            console.log('Draft autosaved');
        }, 30000);
    });
    
    // Load draft if available
    const draft = localStorage.getItem('anamneseDraft');
    if (draft && !localStorage.getItem('anamneseData')) {
        try {
            const draftData = JSON.parse(draft);
            // Only load draft if form is empty
            const isEmpty = !document.getElementById('firstName').value;
            if (isEmpty) {
                setFormData(draftData);
                console.log('Draft loaded');
            }
        } catch (e) {
            console.error('Error loading draft:', e);
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
