/**
 * GDT Encrypted Export Module
 * Provides additional file encryption for GDT exports
 * Use cases: Network drive transport, email transfer, external backups
 * 
 * GDPR Compliance: Art. 32 DSGVO - Encryption as security measure
 */

class GDTEncryptedExport {
    constructor() {
        this.encryptionAlgorithm = 'AES-GCM';
        this.keyLength = 256;
        this.ivLength = 12;
        this.saltLength = 16;
        this.iterations = 100000;
    }

    /**
     * Generate encryption key from password using PBKDF2
     */
    async deriveKey(password, salt) {
        const encoder = new TextEncoder();
        const passwordKey = await window.crypto.subtle.importKey(
            'raw',
            encoder.encode(password),
            'PBKDF2',
            false,
            ['deriveBits', 'deriveKey']
        );

        return await window.crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: salt,
                iterations: this.iterations,
                hash: 'SHA-256'
            },
            passwordKey,
            { name: this.encryptionAlgorithm, length: this.keyLength },
            false,
            ['encrypt', 'decrypt']
        );
    }

    /**
     * Encrypt GDT file content
     */
    async encryptGDTFile(gdtContent, password) {
        try {
            // Generate random salt and IV
            const salt = window.crypto.getRandomValues(new Uint8Array(this.saltLength));
            const iv = window.crypto.getRandomValues(new Uint8Array(this.ivLength));

            // Derive encryption key
            const key = await this.deriveKey(password, salt);

            // Convert content to bytes
            const encoder = new TextEncoder();
            const data = encoder.encode(gdtContent);

            // Encrypt
            const encryptedData = await window.crypto.subtle.encrypt(
                {
                    name: this.encryptionAlgorithm,
                    iv: iv
                },
                key,
                data
            );

            // Combine salt + iv + encrypted data
            const encryptedArray = new Uint8Array(encryptedData);
            const combined = new Uint8Array(salt.length + iv.length + encryptedArray.length);
            combined.set(salt, 0);
            combined.set(iv, salt.length);
            combined.set(encryptedArray, salt.length + iv.length);

            // Convert to base64 for storage
            const base64 = btoa(String.fromCharCode.apply(null, combined));

            return {
                success: true,
                encrypted: base64,
                algorithm: `${this.encryptionAlgorithm}-${this.keyLength}`,
                metadata: {
                    encrypted: true,
                    algorithm: this.encryptionAlgorithm,
                    keyLength: this.keyLength,
                    timestamp: new Date().toISOString()
                }
            };
        } catch (error) {
            console.error('Encryption error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Decrypt GDT file content
     */
    async decryptGDTFile(encryptedBase64, password) {
        try {
            // Convert from base64
            const combined = Uint8Array.from(atob(encryptedBase64), c => c.charCodeAt(0));

            // Extract salt, iv, and encrypted data
            const salt = combined.slice(0, this.saltLength);
            const iv = combined.slice(this.saltLength, this.saltLength + this.ivLength);
            const encryptedData = combined.slice(this.saltLength + this.ivLength);

            // Derive decryption key
            const key = await this.deriveKey(password, salt);

            // Decrypt
            const decryptedData = await window.crypto.subtle.decrypt(
                {
                    name: this.encryptionAlgorithm,
                    iv: iv
                },
                key,
                encryptedData
            );

            // Convert to string
            const decoder = new TextDecoder();
            const gdtContent = decoder.decode(decryptedData);

            return {
                success: true,
                decrypted: gdtContent
            };
        } catch (error) {
            console.error('Decryption error:', error);
            return {
                success: false,
                error: 'Falsches Passwort oder beschädigte Datei'
            };
        }
    }

    /**
     * Generate secure random password
     */
    generateSecurePassword(length = 16) {
        const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
        const array = new Uint8Array(length);
        window.crypto.getRandomValues(array);
        let password = '';
        for (let i = 0; i < length; i++) {
            password += charset[array[i] % charset.length];
        }
        return password;
    }

    /**
     * Validate password strength
     */
    validatePasswordStrength(password) {
        const minLength = 12;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        const issues = [];
        let strength = 'weak';

        if (password.length < minLength) {
            issues.push(`Mindestens ${minLength} Zeichen erforderlich`);
        }
        if (!hasUpperCase) {
            issues.push('Mindestens ein Großbuchstabe erforderlich');
        }
        if (!hasLowerCase) {
            issues.push('Mindestens ein Kleinbuchstabe erforderlich');
        }
        if (!hasNumbers) {
            issues.push('Mindestens eine Zahl erforderlich');
        }
        if (!hasSpecialChar) {
            issues.push('Mindestens ein Sonderzeichen erforderlich');
        }

        if (issues.length === 0) {
            strength = password.length >= 16 ? 'strong' : 'medium';
        }

        return {
            valid: issues.length === 0,
            strength: strength,
            issues: issues
        };
    }

    /**
     * Create encrypted export file with metadata
     */
    async createEncryptedExportFile(gdtContent, filename, password) {
        const result = await this.encryptGDTFile(gdtContent, password);
        
        if (!result.success) {
            return result;
        }

        const exportData = {
            version: '1.0',
            type: 'encrypted-gdt-export',
            metadata: result.metadata,
            filename: filename,
            data: result.encrypted
        };

        return {
            success: true,
            content: JSON.stringify(exportData, null, 2),
            filename: filename.replace('.gdt', '.egdt')
        };
    }

    /**
     * Show encryption dialog
     */
    showEncryptionDialog(gdtContent, originalFilename) {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.7);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
        `;

        const dialog = document.createElement('div');
        dialog.style.cssText = `
            background: white;
            padding: 30px;
            border-radius: 12px;
            max-width: 600px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        `;

        dialog.innerHTML = `
            <h2 style="margin-top: 0; color: #2c3e50;">🔒 GDT-Datei verschlüsseln</h2>
            
            <div style="background: #e8f4f8; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #3498db;">
                <strong>ℹ️ Verschlüsselung</strong><br>
                Die GDT-Datei wird mit AES-256-GCM verschlüsselt.<br>
                Anwendungsfälle: Netzlaufwerk-Transfer, E-Mail-Versand, externe Backups.
            </div>

            <div style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 8px; font-weight: bold;">
                    Verschlüsselungs-Passwort:
                </label>
                <div style="display: flex; gap: 10px;">
                    <input type="password" id="encryptPassword" 
                           style="flex: 1; padding: 10px; border: 2px solid #ddd; border-radius: 6px; font-size: 14px;"
                           placeholder="Mindestens 12 Zeichen">
                    <button id="togglePassword" 
                            style="padding: 10px 15px; background: #95a5a6; color: white; border: none; border-radius: 6px; cursor: pointer;">
                        👁️
                    </button>
                    <button id="generatePassword" 
                            style="padding: 10px 15px; background: #3498db; color: white; border: none; border-radius: 6px; cursor: pointer;">
                        🎲
                    </button>
                </div>
                <div id="passwordStrength" style="margin-top: 8px; font-size: 13px;"></div>
            </div>

            <div style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 8px; font-weight: bold;">
                    Passwort bestätigen:
                </label>
                <input type="password" id="confirmPassword" 
                       style="width: 100%; padding: 10px; border: 2px solid #ddd; border-radius: 6px; font-size: 14px;"
                       placeholder="Passwort wiederholen">
            </div>

            <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #ffc107;">
                <strong>⚠️ Wichtig:</strong><br>
                • Passwort sicher aufbewahren<br>
                • Bei Verlust ist Entschlüsselung unmöglich<br>
                • Passwort nicht in E-Mail senden<br>
                • Separate, sichere Übermittlung erforderlich
            </div>

            <div id="errorMessage" style="color: #e74c3c; margin-bottom: 15px; display: none;"></div>

            <div style="display: flex; gap: 10px; justify-content: flex-end;">
                <button id="cancelEncryption" 
                        style="padding: 12px 24px; background: #95a5a6; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px;">
                    Abbrechen
                </button>
                <button id="confirmEncryption" 
                        style="padding: 12px 24px; background: #27ae60; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px;">
                    🔒 Verschlüsseln und Speichern
                </button>
            </div>
        `;

        modal.appendChild(dialog);
        document.body.appendChild(modal);

        const passwordInput = dialog.querySelector('#encryptPassword');
        const confirmInput = dialog.querySelector('#confirmPassword');
        const strengthDiv = dialog.querySelector('#passwordStrength');
        const errorDiv = dialog.querySelector('#errorMessage');
        const toggleBtn = dialog.querySelector('#togglePassword');
        const generateBtn = dialog.querySelector('#generatePassword');

        // Password strength indicator
        passwordInput.addEventListener('input', () => {
            const validation = this.validatePasswordStrength(passwordInput.value);
            const colors = { weak: '#e74c3c', medium: '#f39c12', strong: '#27ae60' };
            strengthDiv.innerHTML = `
                <span style="color: ${colors[validation.strength]};">
                    Stärke: ${validation.strength === 'weak' ? '🔴 Schwach' : 
                              validation.strength === 'medium' ? '🟡 Mittel' : '🟢 Stark'}
                </span>
                ${validation.issues.length > 0 ? '<br>' + validation.issues.join('<br>') : ''}
            `;
        });

        // Toggle password visibility
        toggleBtn.addEventListener('click', () => {
            const type = passwordInput.type === 'password' ? 'text' : 'password';
            passwordInput.type = type;
            confirmInput.type = type;
            toggleBtn.textContent = type === 'password' ? '👁️' : '🙈';
        });

        // Generate secure password
        generateBtn.addEventListener('click', () => {
            const password = this.generateSecurePassword(16);
            passwordInput.value = password;
            confirmInput.value = password;
            passwordInput.dispatchEvent(new Event('input'));
            
            // Show generated password
            alert(`Generiertes Passwort:\n\n${password}\n\n⚠️ Bitte sicher aufbewahren!`);
        });

        // Cancel
        dialog.querySelector('#cancelEncryption').addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        // Confirm encryption
        dialog.querySelector('#confirmEncryption').addEventListener('click', async () => {
            const password = passwordInput.value;
            const confirm = confirmInput.value;

            // Validate
            errorDiv.style.display = 'none';

            if (!password) {
                errorDiv.textContent = '❌ Bitte Passwort eingeben';
                errorDiv.style.display = 'block';
                return;
            }

            const validation = this.validatePasswordStrength(password);
            if (!validation.valid) {
                errorDiv.textContent = '❌ Passwort erfüllt nicht die Anforderungen';
                errorDiv.style.display = 'block';
                return;
            }

            if (password !== confirm) {
                errorDiv.textContent = '❌ Passwörter stimmen nicht überein';
                errorDiv.style.display = 'block';
                return;
            }

            // Show progress
            dialog.querySelector('#confirmEncryption').textContent = '⏳ Verschlüssele...';
            dialog.querySelector('#confirmEncryption').disabled = true;

            try {
                // Create encrypted file
                const result = await this.createEncryptedExportFile(
                    gdtContent,
                    originalFilename,
                    password
                );

                if (!result.success) {
                    throw new Error(result.error);
                }

                // Save encrypted file
                const blob = new Blob([result.content], { type: 'application/json' });
                const handle = await window.showSaveFilePicker({
                    suggestedName: result.filename,
                    types: [{
                        description: 'Verschlüsselte GDT-Datei',
                        accept: { 'application/json': ['.egdt'] }
                    }]
                });

                const writable = await handle.createWritable();
                await writable.write(blob);
                await writable.close();

                // Log to audit
                if (window.GDPRCompliance) {
                    window.GDPRCompliance.logAuditEntry('gdt_encrypted_export', {
                        filename: result.filename,
                        algorithm: 'AES-256-GCM',
                        success: true
                    });
                }

                document.body.removeChild(modal);
                alert('✅ Verschlüsselte GDT-Datei erfolgreich gespeichert!\n\n' +
                      '⚠️ Passwort sicher aufbewahren und getrennt übermitteln.');

            } catch (error) {
                console.error('Encryption error:', error);
                errorDiv.textContent = `❌ Fehler: ${error.message}`;
                errorDiv.style.display = 'block';
                dialog.querySelector('#confirmEncryption').textContent = '🔒 Verschlüsseln und Speichern';
                dialog.querySelector('#confirmEncryption').disabled = false;
            }
        });
    }

    /**
     * Show decryption dialog
     */
    showDecryptionDialog() {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.7);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
        `;

        const dialog = document.createElement('div');
        dialog.style.cssText = `
            background: white;
            padding: 30px;
            border-radius: 12px;
            max-width: 600px;
            width: 90%;
            box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        `;

        dialog.innerHTML = `
            <h2 style="margin-top: 0; color: #2c3e50;">🔓 Verschlüsselte GDT-Datei entschlüsseln</h2>
            
            <div style="background: #e8f4f8; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #3498db;">
                <strong>ℹ️ Entschlüsselung</strong><br>
                Wählen Sie eine verschlüsselte .egdt Datei und geben Sie das Passwort ein.
            </div>

            <div style="margin-bottom: 20px;">
                <button id="selectEncryptedFile" 
                        style="padding: 12px 24px; background: #3498db; color: white; border: none; border-radius: 6px; cursor: pointer; width: 100%;">
                    📁 Verschlüsselte Datei auswählen
                </button>
                <div id="selectedFile" style="margin-top: 10px; font-size: 13px; color: #7f8c8d;"></div>
            </div>

            <div style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 8px; font-weight: bold;">
                    Entschlüsselungs-Passwort:
                </label>
                <input type="password" id="decryptPassword" 
                       style="width: 100%; padding: 10px; border: 2px solid #ddd; border-radius: 6px; font-size: 14px;"
                       placeholder="Passwort eingeben">
            </div>

            <div id="errorMessage" style="color: #e74c3c; margin-bottom: 15px; display: none;"></div>

            <div style="display: flex; gap: 10px; justify-content: flex-end;">
                <button id="cancelDecryption" 
                        style="padding: 12px 24px; background: #95a5a6; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px;">
                    Abbrechen
                </button>
                <button id="confirmDecryption" 
                        style="padding: 12px 24px; background: #27ae60; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px;"
                        disabled>
                    🔓 Entschlüsseln
                </button>
            </div>
        `;

        modal.appendChild(dialog);
        document.body.appendChild(modal);

        let selectedFileContent = null;
        let selectedFileName = null;

        const errorDiv = dialog.querySelector('#errorMessage');
        const confirmBtn = dialog.querySelector('#confirmDecryption');
        const selectedFileDiv = dialog.querySelector('#selectedFile');

        // File selection
        dialog.querySelector('#selectEncryptedFile').addEventListener('click', async () => {
            try {
                const [handle] = await window.showOpenFilePicker({
                    types: [{
                        description: 'Verschlüsselte GDT-Datei',
                        accept: { 'application/json': ['.egdt'] }
                    }]
                });

                const file = await handle.getFile();
                selectedFileContent = await file.text();
                selectedFileName = file.name;
                selectedFileDiv.textContent = `✓ Ausgewählt: ${file.name}`;
                confirmBtn.disabled = false;

            } catch (error) {
                if (error.name !== 'AbortError') {
                    console.error('File selection error:', error);
                }
            }
        });

        // Cancel
        dialog.querySelector('#cancelDecryption').addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        // Confirm decryption
        dialog.querySelector('#confirmDecryption').addEventListener('click', async () => {
            const password = dialog.querySelector('#decryptPassword').value;

            errorDiv.style.display = 'none';

            if (!selectedFileContent) {
                errorDiv.textContent = '❌ Bitte Datei auswählen';
                errorDiv.style.display = 'block';
                return;
            }

            if (!password) {
                errorDiv.textContent = '❌ Bitte Passwort eingeben';
                errorDiv.style.display = 'block';
                return;
            }

            confirmBtn.textContent = '⏳ Entschlüssele...';
            confirmBtn.disabled = true;

            try {
                // Parse encrypted file
                const fileData = JSON.parse(selectedFileContent);
                
                if (fileData.type !== 'encrypted-gdt-export') {
                    throw new Error('Ungültiges Dateiformat');
                }

                // Decrypt
                const result = await this.decryptGDTFile(fileData.data, password);

                if (!result.success) {
                    throw new Error(result.error);
                }

                // Save decrypted file
                const blob = new Blob([result.decrypted], { type: 'text/plain' });
                const originalName = fileData.filename || selectedFileName.replace('.egdt', '.gdt');
                
                const handle = await window.showSaveFilePicker({
                    suggestedName: originalName,
                    types: [{
                        description: 'GDT-Datei',
                        accept: { 'text/plain': ['.gdt'] }
                    }]
                });

                const writable = await handle.createWritable();
                await writable.write(blob);
                await writable.close();

                // Log to audit
                if (window.GDPRCompliance) {
                    window.GDPRCompliance.logAuditEntry('gdt_decrypted_import', {
                        filename: originalName,
                        success: true
                    });
                }

                document.body.removeChild(modal);
                alert('✅ GDT-Datei erfolgreich entschlüsselt und gespeichert!');

            } catch (error) {
                console.error('Decryption error:', error);
                errorDiv.textContent = `❌ ${error.message}`;
                errorDiv.style.display = 'block';
                confirmBtn.textContent = '🔓 Entschlüsseln';
                confirmBtn.disabled = false;
            }
        });
    }
}

// Initialize global instance
window.GDTEncryptedExport = new GDTEncryptedExport();
