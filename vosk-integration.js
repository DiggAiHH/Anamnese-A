// VOSK Speech Recognition Integration
// Local speech recognition using VOSK model (offline)

'use strict';

let recognizer = null;
let audioContext = null;
let mediaStream = null;
let processor = null;
let currentInputField = null;
let voskWorker = null;
let voskReady = false;
let voskInitPromise = null;
let zeroGainNode = null;

// Initialize VOSK recognizer
async function initVoskRecognizer() {
    if (voskInitPromise) {
        return voskInitPromise;
    }

    voskInitPromise = (async () => {
        try {
            // Check if VOSK model is available
            const modelPath = 'models/vosk-model-small-de-0.15';

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

                voskWorker.postMessage({
                    action: 'init',
                    modelPath
                });
            }

            // Wait until worker is ready (or errors)
            await waitForVoskReady(8000);
            return true;
        } catch (error) {
            console.error('VOSK initialization error:', error);
            voskInitPromise = null;
            return false;
        }
    })();

    return voskInitPromise;
}

function waitForVoskReady(timeoutMs) {
    if (voskReady) {
        return Promise.resolve(true);
    }

    return new Promise((resolve, reject) => {
        const start = Date.now();
        const timer = setInterval(() => {
            if (voskReady) {
                clearInterval(timer);
                resolve(true);
                return;
            }
            if (Date.now() - start > timeoutMs) {
                clearInterval(timer);
                reject(new Error('Vosk worker not ready (timeout)'));
            }
        }, 150);
    });
}

// Handle recognition results
function handleRecognitionResult(data) {
    if (data.type === 'ready') {
        voskReady = true;
        return;
    }

    if (data.type === 'error') {
        console.error('VOSK worker reported error:', data.message);
        showVoskError();
        return;
    }

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

// Optional: context dictionary support (used by index_v8_complete inline module)
function updateVoskDictionary(fieldId) {
    if (!voskWorker) return;
    if (typeof window.getContextDictionaryForQuestion !== 'function') return;

    try {
        const words = window.getContextDictionaryForQuestion(fieldId);
        voskWorker.postMessage({ action: 'setDictionary', words });
    } catch (error) {
        console.warn('Unable to update Vosk dictionary:', error);
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
        // Ensure worker is initialized before we start streaming audio
        recognizer = await initVoskRecognizer();
        if (!recognizer) {
            throw new Error('Vosk unavailable');
        }

        // Optional dictionary update
        updateVoskDictionary(fieldId);

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
            if (!voskWorker || !recognizer || !voskReady) {
                return;
            }
            const inputData = e.inputBuffer.getChannelData(0);
            const pcm16 = new Int16Array(inputData.length);
            for (let i = 0; i < inputData.length; i++) {
                pcm16[i] = Math.max(-32768, Math.min(32767, inputData[i] * 32768));
            }
            voskWorker.postMessage({
                action: 'process',
                audio: pcm16
            }, [pcm16.buffer]);
        };
        
        // Avoid routing mic audio to speakers (feedback); ScriptProcessor must be connected.
        zeroGainNode = audioContext.createGain();
        zeroGainNode.gain.value = 0;
        source.connect(processor);
        processor.connect(zeroGainNode);
        zeroGainNode.connect(audioContext.destination);
        
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
    if (window.currentRecognition) {
        try {
            window.currentRecognition.stop();
        } catch (e) {
            // ignore
        }
        window.currentRecognition = null;
    }

    if (processor) {
        processor.disconnect();
        processor = null;
    }

    if (zeroGainNode) {
        try {
            zeroGainNode.disconnect();
        } catch (e) {
            // ignore
        }
        zeroGainNode = null;
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
