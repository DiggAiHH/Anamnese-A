// Global variables
let currentStep = 1;
let practiceSecret = null;
let practiceData = {
    id: null,
    name: null
};
let formData = {
    mode: null,
    language: null,
    patientData: null
};
let generatedCode = null;
let generatedUrl = null;

// Initialize Stripe
// In production, this should be configured via a config endpoint or build-time injection
// For now, replace 'YOUR_PUBLISHABLE_KEY' with your actual Stripe publishable key
const STRIPE_KEY = document.querySelector('meta[name="stripe-key"]')?.content || 'pk_test_YOUR_PUBLISHABLE_KEY';
const stripe = Stripe(STRIPE_KEY);

// Language mappings
const LANGUAGE_NAMES = {
    'de': 'Deutsch',
    'de-en': 'Deutsch + Englisch',
    'de-ar': 'Deutsch + Arabisch',
    'de-tr': 'Deutsch + Türkisch',
    'de-uk': 'Deutsch + Ukrainisch',
    'de-pl': 'Deutsch + Polnisch',
    'de-fa': 'Deutsch + Farsi',
    'de-ur': 'Deutsch + Urdu',
    'de-ps': 'Deutsch + Pashto',
    'de-es': 'Deutsch + Spanisch',
    'de-fr': 'Deutsch + Französisch',
    'de-it': 'Deutsch + Italienisch',
    'de-ru': 'Deutsch + Russisch'
};

const MODE_NAMES = {
    'practice': 'Praxis gibt Daten ein',
    'patient': 'Patient füllt selbst aus'
};

// Anamnese base URL (from environment)
const ANAMNESE_BASE_URL = window.location.origin.includes('localhost') 
    ? 'http://localhost:8080' 
    : 'https://anamnese.example.com';

// Utility Functions

function showToast(title, message, isError = false) {
    const toast = document.getElementById('toast');
    const toastTitle = document.getElementById('toastTitle');
    const toastMessage = document.getElementById('toastMessage');
    
    toastTitle.textContent = title;
    toastMessage.textContent = message;
    
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
}

function showSpinner(elementId, show = true) {
    const spinner = document.getElementById(elementId);
    if (spinner) {
        if (show) {
            spinner.classList.remove('d-none');
        } else {
            spinner.classList.add('d-none');
        }
    }
}

function updateProgressBar(step) {
    const progressBar = document.getElementById('progressBar');
    const percentage = (step / 6) * 100;
    progressBar.style.width = percentage + '%';
    progressBar.setAttribute('aria-valuenow', percentage);
    progressBar.textContent = `Schritt ${step} von 6`;
}

function goToStep(step) {
    // Validate current step before proceeding
    if (step > currentStep) {
        if (!validateCurrentStep()) {
            return;
        }
    }
    
    // Hide all steps
    document.querySelectorAll('.form-step').forEach(el => {
        el.classList.add('d-none');
    });
    
    // Show target step
    document.getElementById(`step${step}`).classList.remove('d-none');
    
    currentStep = step;
    updateProgressBar(step);
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function validateCurrentStep() {
    switch (currentStep) {
        case 1:
            return practiceData.id !== null;
        case 2:
            const mode = document.querySelector('input[name="mode"]:checked');
            if (!mode) {
                showToast('Fehler', 'Bitte wählen Sie einen Eingabemodus', true);
                return false;
            }
            formData.mode = mode.value;
            return true;
        case 3:
            const language = document.getElementById('language').value;
            if (!language) {
                showToast('Fehler', 'Bitte wählen Sie eine Sprache', true);
                return false;
            }
            formData.language = language;
            return true;
        case 4:
            if (formData.mode === 'practice') {
                const firstName = document.getElementById('firstName').value.trim();
                const lastName = document.getElementById('lastName').value.trim();
                const birthDate = document.getElementById('birthDate').value;
                
                if (!firstName || !lastName || !birthDate) {
                    showToast('Fehler', 'Bitte füllen Sie alle Pflichtfelder aus', true);
                    return false;
                }
                
                formData.patientData = {
                    firstName,
                    lastName,
                    birthDate,
                    address: document.getElementById('address').value.trim()
                };
            }
            return true;
        default:
            return true;
    }
}

// Step 1: Validate Practice ID
async function validatePracticeId() {
    const practiceIdInput = document.getElementById('practiceId');
    const practiceId = practiceIdInput.value.trim();
    
    // UUID validation
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(practiceId)) {
        practiceIdInput.classList.add('is-invalid');
        document.getElementById('practiceIdFeedback').textContent = 'Ungültige UUID-Format';
        return;
    }
    
    showSpinner('validateSpinner', true);
    practiceIdInput.classList.remove('is-invalid');
    
    try {
        const response = await fetch('/api/validate-practice', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ practiceId })
        });
        
        const data = await response.json();
        
        if (response.ok && data.valid) {
            practiceData.id = practiceId;
            practiceData.name = data.name;
            practiceSecret = data.secret;
            
            // Show practice name
            document.getElementById('practiceName').textContent = data.name;
            document.getElementById('practiceNameDisplay').style.display = 'block';
            
            showToast('Erfolg', `Angemeldet als ${data.name}`);
            
            // Wait a moment then proceed
            setTimeout(() => {
                goToStep(2);
            }, 1000);
        } else {
            practiceIdInput.classList.add('is-invalid');
            document.getElementById('practiceIdFeedback').textContent = 
                'Praxis-ID nicht gefunden oder inaktiv';
            showToast('Fehler', 'Ungültige Praxis-ID', true);
        }
    } catch (error) {
        console.error('Validation error:', error);
        showToast('Fehler', 'Verbindungsfehler. Bitte versuchen Sie es erneut.', true);
    } finally {
        showSpinner('validateSpinner', false);
    }
}

// Handle Step 3 Next (skip step 4 if mode is 'patient')
function handleStep3Next() {
    if (!validateCurrentStep()) {
        return;
    }
    
    if (formData.mode === 'practice') {
        goToStep(4);
    } else {
        goToStep(5);
        updateSummary();
    }
}

// Go back from Step 5
function goBackFromStep5() {
    if (formData.mode === 'practice') {
        goToStep(4);
    } else {
        goToStep(3);
    }
}

// Update Summary
function updateSummary() {
    document.getElementById('summaryPractice').textContent = practiceData.name;
    document.getElementById('summaryMode').textContent = MODE_NAMES[formData.mode];
    document.getElementById('summaryLanguage').textContent = LANGUAGE_NAMES[formData.language];
    
    if (formData.mode === 'practice' && formData.patientData) {
        document.getElementById('summaryPatientRow').style.display = 'block';
        document.getElementById('summaryPatient').textContent = 
            `${formData.patientData.firstName} ${formData.patientData.lastName} (${formData.patientData.birthDate})`;
    } else {
        document.getElementById('summaryPatientRow').style.display = 'none';
    }
}

// Initiate Stripe Payment
async function initiatePayment() {
    if (!validateCurrentStep()) {
        return;
    }
    
    updateSummary();
    showSpinner('paymentSpinner', true);
    
    try {
        const response = await fetch('/api/create-checkout-session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                practiceId: practiceData.id,
                mode: formData.mode,
                language: formData.language,
                patientData: formData.patientData
            })
        });
        
        const data = await response.json();
        
        if (response.ok && data.sessionId) {
            // Redirect to Stripe Checkout
            const result = await stripe.redirectToCheckout({
                sessionId: data.sessionId
            });
            
            if (result.error) {
                showToast('Fehler', result.error.message, true);
            }
        } else {
            showToast('Fehler', data.error || 'Fehler beim Erstellen der Zahlungssitzung', true);
        }
    } catch (error) {
        console.error('Payment error:', error);
        showToast('Fehler', 'Verbindungsfehler. Bitte versuchen Sie es erneut.', true);
    } finally {
        showSpinner('paymentSpinner', false);
    }
}

// Display Code after successful payment
async function displayCodeFromSession(sessionId) {
    try {
        const response = await fetch(`/api/code/${sessionId}`);
        const data = await response.json();
        
        if (response.ok) {
            generatedCode = data.code;
            const language = data.language;
            generatedUrl = `${ANAMNESE_BASE_URL}/${language}?code=${encodeURIComponent(generatedCode)}`;
            
            // Display code
            document.getElementById('codeText').value = generatedCode;
            
            // Generate QR Code
            const qrcodeContainer = document.getElementById('qrcodeContainer');
            qrcodeContainer.innerHTML = ''; // Clear previous QR code
            
            QRCode.toCanvas(generatedUrl, {
                width: 256,
                margin: 2,
                color: {
                    dark: '#0066CC',
                    light: '#FFFFFF'
                }
            }, function (error, canvas) {
                if (error) {
                    console.error('QR Code generation error:', error);
                    showToast('Fehler', 'QR-Code konnte nicht generiert werden', true);
                } else {
                    qrcodeContainer.appendChild(canvas);
                }
            });
            
            goToStep(6);
            showToast('Erfolg', 'Code erfolgreich generiert!');
        } else {
            showToast('Fehler', 'Code konnte nicht abgerufen werden', true);
        }
    } catch (error) {
        console.error('Code retrieval error:', error);
        showToast('Fehler', 'Fehler beim Abrufen des Codes', true);
    }
}

// Copy code to clipboard
function copyCode() {
    const codeText = document.getElementById('codeText');
    codeText.select();
    document.execCommand('copy');
    showToast('Erfolg', 'Code in Zwischenablage kopiert');
}

// Download PDF
function downloadPDF() {
    // Simple PDF generation using data URL
    // In production, use a proper PDF library like jsPDF
    const pdfContent = `
        Praxis-Code für digitale Anamnese
        =====================================
        
        Praxis: ${practiceData.name}
        Modus: ${MODE_NAMES[formData.mode]}
        Sprache: ${LANGUAGE_NAMES[formData.language]}
        
        Zugangscode:
        ${generatedCode}
        
        URL:
        ${generatedUrl}
        
        =====================================
        Bitte bewahren Sie diesen Code sicher auf.
    `;
    
    const blob = new Blob([pdfContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `anamnese-code-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast('Erfolg', 'Code heruntergeladen');
}

// Reset form for new code
function resetForm() {
    if (confirm('Möchten Sie einen neuen Code erstellen? Die aktuelle Sitzung wird zurückgesetzt.')) {
        // Reset all data
        currentStep = 1;
        practiceSecret = null;
        formData = {
            mode: null,
            language: null,
            patientData: null
        };
        generatedCode = null;
        generatedUrl = null;
        
        // Reset form
        document.getElementById('codeGeneratorForm').reset();
        document.getElementById('practiceNameDisplay').style.display = 'none';
        
        // Go back to step 1
        goToStep(1);
        
        showToast('Info', 'Formular zurückgesetzt');
    }
}

// Check for success redirect from Stripe
window.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    
    if (sessionId) {
        // Coming back from successful payment
        displayCodeFromSession(sessionId);
        
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
    }
});

// Form validation on input
document.addEventListener('DOMContentLoaded', () => {
    const practiceIdInput = document.getElementById('practiceId');
    if (practiceIdInput) {
        practiceIdInput.addEventListener('input', () => {
            practiceIdInput.classList.remove('is-invalid');
            document.getElementById('practiceNameDisplay').style.display = 'none';
        });
        
        // Allow Enter key to submit
        practiceIdInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                validatePracticeId();
            }
        });
    }
});
