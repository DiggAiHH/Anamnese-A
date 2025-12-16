// VOSK Speech Recognition Integration
// Local speech recognition using VOSK model

let recognizer = null;
let audioContext = null;
let mediaStream = null;
let processor = null;
let currentInputField = null;
let voskWorker = null;

// Initialize VOSK recognizer
async function initVoskRecognizer() {
    try {
        // Check if VOSK model is available
        const modelPath = 'model/vosk-model-small-de-0.15';
        
        // Create Web Worker for VOSK processing
        if (!voskWorker) {
            voskWorker = new Worker('vosk-worker.js');
            
            voskWorker.onmessage = function(event) {
                handleRecognitionResult(event.data);
            };
            
            voskWorker.onerror = function(error) {
                console.error('VOSK Worker error:', error);
                showVoskError();
            };
            
            // Initialize worker with model path
            voskWorker.postMessage({ 
                action: 'init', 
                modelPath: modelPath 
            });
        }
        
        return true;
    } catch (error) {
        console.error('VOSK initialization error:', error);
        return false;
    }
}

// Handle recognition results
function handleRecognitionResult(data) {
    if (data.type === 'result' && data.text && currentInputField) {
        const field = document.getElementById(currentInputField);
        if (field) {
            // Append or set the recognized text
            if (field.value) {
                field.value += ' ' + data.text;
            } else {
                field.value = data.text;
            }
        }
    } else if (data.type === 'partial' && data.text) {
        // Show partial results in status
        updateVoiceStatus(data.text);
    }
}

// Start voice recognition for a specific field
async function startVoiceRecognition(fieldId) {
    currentInputField = fieldId;
    
    // Show voice status
    const voiceStatus = document.getElementById('voiceStatus');
    voiceStatus.style.display = 'block';
    updateVoiceStatus(translations[currentLanguage].voiceStatusText);
    
    try {
        // Request microphone access
        mediaStream = await navigator.mediaDevices.getUserMedia({ 
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true
            } 
        });
        
        // Create audio context
        audioContext = new (window.AudioContext || window.webkitAudioContext)({
            sampleRate: 16000
        });
        
        const source = audioContext.createMediaStreamSource(mediaStream);
        
        // Create script processor for audio data
        processor = audioContext.createScriptProcessor(4096, 1, 1);
        
        processor.onaudioprocess = function(e) {
            if (voskWorker && recognizer) {
                const inputData = e.inputBuffer.getChannelData(0);
                // Convert Float32Array to Int16Array for VOSK
                const pcm16 = new Int16Array(inputData.length);
                for (let i = 0; i < inputData.length; i++) {
                    pcm16[i] = Math.max(-32768, Math.min(32767, inputData[i] * 32768));
                }
                voskWorker.postMessage({
                    action: 'process',
                    audio: pcm16
                }, [pcm16.buffer]);
            }
        };
        
        source.connect(processor);
        processor.connect(audioContext.destination);
        
        // Initialize recognizer if not already done
        if (!recognizer) {
            recognizer = await initVoskRecognizer();
        }
        
        // Add click listener to stop recording
        voiceStatus.onclick = stopVoiceRecognition;
        voiceStatus.style.cursor = 'pointer';
        updateVoiceStatus('🎤 ' + translations[currentLanguage].voiceStatusText + ' (Click to stop)');
        
    } catch (error) {
        console.error('Voice recognition error:', error);
        showVoskError();
        stopVoiceRecognition();
    }
}

// Stop voice recognition
function stopVoiceRecognition() {
    if (processor) {
        processor.disconnect();
        processor = null;
    }
    
    if (audioContext) {
        audioContext.close();
        audioContext = null;
    }
    
    if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
        mediaStream = null;
    }
    
    if (voskWorker) {
        voskWorker.postMessage({ action: 'stop' });
    }
    
    const voiceStatus = document.getElementById('voiceStatus');
    voiceStatus.style.display = 'none';
    voiceStatus.onclick = null;
    voiceStatus.style.cursor = 'default';
    
    currentInputField = null;
}

// Update voice status text
function updateVoiceStatus(text) {
    const statusText = document.getElementById('voiceStatusText');
    if (statusText) {
        statusText.textContent = text;
    }
}

// Show VOSK error and fallback to browser's speech recognition
function showVoskError() {
    console.warn('VOSK not available, attempting fallback to browser speech recognition');
    
    // Try browser's native speech recognition as fallback
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        useBrowserSpeechRecognition();
    } else {
        alert('Speech recognition is not available. Please type manually or check that the VOSK model is in the model/ folder.');
        stopVoiceRecognition();
    }
}

// Fallback to browser's speech recognition
function useBrowserSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
        return;
    }
    
    const recognition = new SpeechRecognition();
    recognition.lang = currentLanguage === 'de' ? 'de-DE' : 
                       currentLanguage === 'en' ? 'en-US' :
                       currentLanguage === 'fr' ? 'fr-FR' :
                       currentLanguage === 'es' ? 'es-ES' :
                       currentLanguage === 'it' ? 'it-IT' :
                       currentLanguage === 'pt' ? 'pt-PT' :
                       currentLanguage === 'nl' ? 'nl-NL' :
                       currentLanguage === 'pl' ? 'pl-PL' :
                       currentLanguage === 'tr' ? 'tr-TR' :
                       currentLanguage === 'ar' ? 'ar-SA' : 'de-DE';
    
    recognition.continuous = true;
    recognition.interimResults = true;
    
    recognition.onresult = function(event) {
        let finalTranscript = '';
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
                finalTranscript += transcript + ' ';
            } else {
                interimTranscript += transcript;
            }
        }
        
        if (finalTranscript && currentInputField) {
            const field = document.getElementById(currentInputField);
            if (field) {
                if (field.value) {
                    field.value += ' ' + finalTranscript.trim();
                } else {
                    field.value = finalTranscript.trim();
                }
            }
        }
        
        if (interimTranscript) {
            updateVoiceStatus('🎤 ' + interimTranscript);
        }
    };
    
    recognition.onerror = function(event) {
        console.error('Browser speech recognition error:', event.error);
        stopVoiceRecognition();
    };
    
    recognition.onend = function() {
        stopVoiceRecognition();
    };
    
    recognition.start();
    
    // Store recognition instance for stopping
    window.currentRecognition = recognition;
    
    // Override stop function
    const originalStop = stopVoiceRecognition;
    window.stopVoiceRecognition = function() {
        if (window.currentRecognition) {
            window.currentRecognition.stop();
            window.currentRecognition = null;
        }
        originalStop();
    };
}

// Auto-initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Pre-initialize VOSK in background (non-blocking)
    setTimeout(function() {
        initVoskRecognizer().catch(err => {
            console.log('VOSK pre-initialization failed, will use fallback if needed:', err);
        });
    }, 1000);
});
