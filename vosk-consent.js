'use strict';
/* global window, document, navigator, localStorage, alert */

(function(global) {
  const MODEL_META = {
    name: 'vosk-model-small-de-0.15',
    sizeMB: 50,
    sha256: 'b7e53c90b1f0a38456f4cd62b366ecd58803cd97cd42b06438e2c131713d5e43'
  };
  const CONSENT_KEY = 'voskModelConsent';
  const AUDIT_KEY = 'voskModelConsentAudit';
  let pendingConsentPromise = null;

  function safeParse(value, fallback) {
    try {
      return value ? JSON.parse(value) : fallback;
    } catch (error) {
      console.warn('[VoskConsent] Failed to parse stored value', error);
      return fallback;
    }
  }

  function getStoredConsent() {
    try {
      const raw = localStorage.getItem(CONSENT_KEY);
      return safeParse(raw, null);
    } catch (error) {
      console.warn('[VoskConsent] Unable to read consent storage', error);
      return null;
    }
  }

  function saveConsent(record) {
    try {
      localStorage.setItem(CONSENT_KEY, JSON.stringify(record));
    } catch (error) {
      console.warn('[VoskConsent] Unable to persist consent record', error);
    }
  }

  function appendAudit(entry) {
    try {
      const raw = localStorage.getItem(AUDIT_KEY);
      const log = safeParse(raw, []);
      log.push(entry);
      while (log.length > 25) {
        log.shift();
      }
      localStorage.setItem(AUDIT_KEY, JSON.stringify(log));
    } catch (error) {
      console.warn('[VoskConsent] Unable to append audit entry', error);
    }
  }

  function getAuditLog() {
    try {
      return safeParse(localStorage.getItem(AUDIT_KEY), []);
    } catch (error) {
      return [];
    }
  }

  function getLocaleKey() {
    const lang = (global.currentLanguage || navigator.language || 'de').toLowerCase();
    if (lang.startsWith('de')) return 'de';
    if (lang.startsWith('en')) return 'en';
    return 'en';
  }

  function getLocalizedCopy() {
    const copy = {
      de: {
        title: 'Offline-Spracherkennung aktivieren',
        body: 'Um die lokale Vosk-Spracherkennung zu verwenden, muss ein 50 MB Modell einmalig heruntergeladen werden. Alle Daten bleiben auf diesem Gerät.',
        details: 'Das Modell wird lokal gespeichert. Es findet kein Cloud-Upload statt. Die Integrität wird per SHA-256 geprüft.',
        accept: 'Herunterladen & Zustimmen',
        decline: 'Abbrechen'
      },
      en: {
        title: 'Enable Offline Speech Recognition',
        body: 'The app needs to download a 50 MB Vosk speech model once. All processing stays on this device.',
        details: 'The package is stored locally and verified via SHA-256. No cloud upload occurs.',
        accept: 'Download & Allow',
        decline: 'Cancel'
      }
    };
    return copy[getLocaleKey()] || copy.en;
  }

  function removeModal(modal) {
    if (modal && modal.parentNode) {
      modal.parentNode.removeChild(modal);
    }
  }

  function showConsentModal() {
    return new Promise(resolve => {
      const existing = document.querySelector('.vosk-consent-modal');
      if (existing) {
        resolve(false);
        return;
      }

      const copy = getLocalizedCopy();
      const overlay = document.createElement('div');
      overlay.className = 'modal vosk-consent-modal';
      overlay.style.display = 'block';

      const content = document.createElement('div');
      content.className = 'modal-content';
      content.style.maxWidth = '520px';
      content.style.padding = '24px';
      content.innerHTML = `
        <h2 style="margin-top: 0;">${copy.title}</h2>
        <p style="color: #444;">${copy.body}</p>
        <div style="background: #f5f5f5; border-left: 4px solid #4CAF50; padding: 12px; margin: 16px 0; font-size: 13px;">
          <p style="margin: 0;">${copy.details}</p>
          <p style="margin: 8px 0 0 0; font-family: monospace; font-size: 12px;">SHA-256: ${MODEL_META.sha256.slice(0, 16)}…</p>
        </div>
        <ul style="font-size: 13px; color: #555; padding-left: 18px;">
          <li>Downloadgröße: ${MODEL_META.sizeMB} MB</li>
          <li>Modell: ${MODEL_META.name}</li>
          <li>Speicherort: nur lokal (kein Cloud-Zugriff)</li>
        </ul>
        <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 24px;">
          <button type="button" class="btn" style="background: #b0b0b0;" data-action="decline">${copy.decline}</button>
          <button type="button" class="btn" style="background: #4CAF50;" data-action="accept">${copy.accept}</button>
        </div>
      `;

      overlay.appendChild(content);
      document.body.appendChild(overlay);

      const cleanup = (result) => {
        removeModal(overlay);
        resolve(result);
      };

      overlay.addEventListener('click', (event) => {
        if (event.target === overlay) {
          cleanup(false);
        }
      });

      const declineBtn = content.querySelector('button[data-action="decline"]');
      const acceptBtn = content.querySelector('button[data-action="accept"]');

      declineBtn.addEventListener('click', () => cleanup(false));
      acceptBtn.addEventListener('click', () => cleanup(true));
    });
  }

  async function ensureConsent() {
    const record = getStoredConsent();
    if (record && record.granted) {
      return true;
    }
    if (pendingConsentPromise) {
      return pendingConsentPromise;
    }
    pendingConsentPromise = (async () => {
      const granted = await showConsentModal();

      let userAgentHash = 'unknown';
      try {
        if (global.crypto?.subtle?.digest && global.TextEncoder) {
          const encoder = new TextEncoder();
          const data = encoder.encode(String(navigator.userAgent || ''));
          const hashBuffer = await global.crypto.subtle.digest('SHA-256', data);
          const hashArray = Array.from(new Uint8Array(hashBuffer));
          const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
          userAgentHash = hashHex.substring(0, 16);
        }
      } catch (error) {
        userAgentHash = 'unknown';
      }

      const auditEntry = {
        timestamp: new Date().toISOString(),
        granted,
        hash: MODEL_META.sha256,
        model: MODEL_META.name,
        language: global.currentLanguage || navigator.language || 'de',
        userAgentHash
      };
      appendAudit(auditEntry);
      if (granted) {
        saveConsent({ ...auditEntry, version: MODEL_META.name });
      }
      if (!granted) {
        if (typeof global.showError === 'function') {
          global.showError('Spracherkennung bleibt deaktiviert, bis Sie den lokalen Download erlauben.', 'warning');
        } else {
          alert('Speech recognition stays disabled until you allow the offline model download.');
        }
      }
      return granted;
    })().finally(() => {
      pendingConsentPromise = null;
    });
    return pendingConsentPromise;
  }

  function wrapFunctionWhenAvailable(fnName, wrapperFactory) {
    const applyWrapper = () => {
      const fn = global[fnName];
      if (typeof fn !== 'function' || fn.__voskConsentWrapped) {
        return typeof fn === 'function';
      }
      global[fnName] = wrapperFactory(fn);
      global[fnName].__voskConsentWrapped = true;
      return true;
    };

    if (applyWrapper()) {
      return;
    }

    const timer = setInterval(() => {
      if (applyWrapper()) {
        clearInterval(timer);
      }
    }, 300);

    setTimeout(() => clearInterval(timer), 10000);
  }

  function guardStartVoiceRecognition() {
    wrapFunctionWhenAvailable('startVoiceRecognition', (original) => {
      return async function patchedStartVoiceRecognition(fieldId) {
        const allowed = await ensureConsent();
        if (!allowed) {
          return null;
        }
        return original.call(this, fieldId);
      };
    });
  }

  function guardInitVoskRecognizer() {
    wrapFunctionWhenAvailable('initVoskRecognizer', (original) => {
      return async function patchedInitVoskRecognizer() {
        if (!hasGrantedConsent()) {
          console.warn('[VoskConsent] Skipping background init until user authorizes download');
          return false;
        }
        return original.apply(this, arguments);
      };
    });
  }

  function bootstrapGuard() {
    guardStartVoiceRecognition();
    guardInitVoskRecognizer();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrapGuard);
  } else {
    bootstrapGuard();
  }

  function hasGrantedConsent() {
    return Boolean(getStoredConsent()?.granted);
  }

  global.VoskConsentManager = {
    ensureConsent,
    hasConsent: hasGrantedConsent,
    getAuditLog
  };
})(window);
