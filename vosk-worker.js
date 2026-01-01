/* eslint-env worker */
// VOSK Web Worker for speech recognition processing
// Runs fully local/offline when Vosk assets + model are present.

'use strict';

const SAMPLE_RATE = 16000;

let model = null;
let recognizer = null;
let modelLoaded = false;
let initialized = false;
let initInFlight = null;
let voskLibBase = null;
let dictionaryWords = null;

let lastPartialAt = 0;
const PARTIAL_THROTTLE_MS = 180;

let silentFrameCounter = 0;
const SILENCE_DECIMATION = 4;
const SILENCE_ABS_AVG_THRESHOLD = 140;

self.onmessage = async (event) => {
    const payload = event?.data || {};
    const action = payload.action;

    try {
        if (action === 'init') {
            await initializeModel(payload.modelPath);
            return;
        }

        if (action === 'setDictionary') {
            setDictionary(payload.words);
            return;
        }

        if (action === 'process') {
            if (modelLoaded && payload.audio) {
                processAudio(payload.audio);
            }
            return;
        }

        if (action === 'stop') {
            resetRecognizer();
            return;
        }

        if (action === 'dispose') {
            cleanup();
        }
    } catch (error) {
        self.postMessage({
            type: 'error',
            message: error?.message || 'Vosk worker error'
        });
    }
};

function resetRecognizer() {
    if (!modelLoaded || !model) {
        cleanup();
        return;
    }

    try {
        if (recognizer && typeof recognizer.reset === 'function') {
            recognizer.reset();
        } else {
            recognizer = createRecognizer(model, dictionaryWords);
        }
    } catch {
        recognizer = createRecognizer(model, dictionaryWords);
    }

    lastPartialAt = 0;
    silentFrameCounter = 0;
}

async function initializeModel(modelPath) {
    if (initialized && modelLoaded) {
        return;
    }
    if (initInFlight) {
        await initInFlight;
        return;
    }

    initInFlight = (async () => {
        const resolvedModelPath = modelPath || 'models/vosk-model-small-de-0.15';
        await ensureVoskLoaded();

        if (!self.Vosk || typeof self.Vosk.createModel !== 'function') {
            throw new Error('Vosk library not available');
        }

        model = await self.Vosk.createModel(resolvedModelPath);
        recognizer = createRecognizer(model, dictionaryWords);
        modelLoaded = true;
        initialized = true;

        self.postMessage({
            type: 'ready',
            message: 'Vosk model loaded successfully',
            modelPath: resolvedModelPath,
            voskLibBase
        });
    })().catch((error) => {
        cleanup();
        const hint =
            'Offline-Vosk Assets fehlen. Erwartet: public/lib/vosk/vosk.js + vosk.wasm (oder lib/vosk/...). ' +
            'Lösung: ./download-vosk.sh ausführen (mit Internet), danach offline nutzen.';
        self.postMessage({
            type: 'error',
            message: `${error?.message || 'Vosk init failed'}. ${hint}`
        });
        throw error;
    }).finally(() => {
        initInFlight = null;
    });

    await initInFlight;
}

async function ensureVoskLoaded() {
    if (self.Vosk && typeof self.Vosk.createModel === 'function') {
        return;
    }

    const candidates = [
        '/public/lib/vosk',
        'public/lib/vosk',
        '/lib/vosk',
        'lib/vosk',
        '/public/vosk',
        'public/vosk'
    ];

    let lastError = null;
    for (const base of candidates) {
        try {
            // Emscripten: make sure vosk.wasm can be located next to vosk.js
            self.Module = self.Module || {};
            self.Module.locateFile = (path) => `${base}/${path}`;
            importScripts(`${base}/vosk.js`);
            voskLibBase = base;
            return;
        } catch (error) {
            lastError = error;
        }
    }

    throw lastError || new Error('Unable to import vosk.js');
}

function sanitizeDictionary(words) {
    if (!Array.isArray(words)) return null;
    const out = [];
    const seen = new Set();
    for (const raw of words) {
        const word = String(raw || '').trim().toLowerCase();
        if (word.length < 2) continue;
        if (word.length > 40) continue;
        if (seen.has(word)) continue;
        seen.add(word);
        out.push(word);
        if (out.length >= 300) break;
    }
    return out.length ? out : null;
}

function setDictionary(words) {
    dictionaryWords = sanitizeDictionary(words);

    if (!modelLoaded || !model) {
        return;
    }

    // Prefer live grammar update when supported.
    if (recognizer && typeof recognizer.setGrammar === 'function' && dictionaryWords) {
        try {
            recognizer.setGrammar(JSON.stringify(dictionaryWords));
            return;
        } catch {
            // fall through to re-create
        }
    }

    // Recreate recognizer with grammar (best-effort, API differs between builds).
    recognizer = createRecognizer(model, dictionaryWords);
}

function createRecognizer(modelInstance, words) {
    if (!modelInstance || typeof modelInstance.KaldiRecognizer !== 'function') {
        throw new Error('Vosk model recognizer constructor missing');
    }

    let rec;
    if (words && words.length) {
        try {
            rec = new modelInstance.KaldiRecognizer(SAMPLE_RATE, JSON.stringify(words));
        } catch {
            try {
                rec = new modelInstance.KaldiRecognizer(SAMPLE_RATE, words);
            } catch {
                rec = new modelInstance.KaldiRecognizer(SAMPLE_RATE);
            }
        }
    } else {
        rec = new modelInstance.KaldiRecognizer(SAMPLE_RATE);
    }

    if (typeof rec.setWords === 'function') {
        try {
            rec.setWords(true);
        } catch {
            // ignore
        }
    }

    return rec;
}

function avgAbs(pcm16) {
    let sum = 0;
    for (let i = 0; i < pcm16.length; i++) {
        sum += Math.abs(pcm16[i]);
    }
    return pcm16.length ? sum / pcm16.length : 0;
}

function processAudio(audioPayload) {
    if (!recognizer) return;

    const pcm16 = audioPayload instanceof Int16Array ? audioPayload : new Int16Array(audioPayload);
    if (!pcm16.length) return;

    // Simple VAD: reduce compute on silence, but still feed occasional frames
    // so Vosk can finalize utterances.
    const level = avgAbs(pcm16);
    const isSilent = level < SILENCE_ABS_AVG_THRESHOLD;
    if (isSilent) {
        silentFrameCounter += 1;
        if (silentFrameCounter % SILENCE_DECIMATION !== 0) {
            return;
        }
    } else {
        silentFrameCounter = 0;
    }

    let hasFinal = false;
    try {
        hasFinal = Boolean(recognizer.acceptWaveform(pcm16));
    } catch (error) {
        self.postMessage({
            type: 'error',
            message: error?.message || 'acceptWaveform failed'
        });
        return;
    }

    if (hasFinal) {
        try {
            const res = JSON.parse(recognizer.result());
            if (res?.text) {
                self.postMessage({ type: 'result', text: String(res.text) });
            }
        } catch {
            // ignore parsing issues
        }
        return;
    }

    const now = Date.now();
    if (now - lastPartialAt < PARTIAL_THROTTLE_MS) {
        return;
    }
    lastPartialAt = now;

    try {
        const partial = JSON.parse(recognizer.partialResult());
        const text = partial?.partial;
        if (text) {
            self.postMessage({ type: 'partial', text: String(text) });
        }
    } catch {
        // ignore
    }
}

function cleanup() {
    try {
        if (recognizer && typeof recognizer.free === 'function') {
            recognizer.free();
        }
    } catch {
        // ignore
    }

    try {
        if (model && typeof model.free === 'function') {
            model.free();
        }
    } catch {
        // ignore
    }

    model = null;
    recognizer = null;
    modelLoaded = false;
    initialized = false;
    lastPartialAt = 0;
    silentFrameCounter = 0;
}
