// Browser Feature Detection and Offline Mode Indicator
// Detects required browser features and provides visual feedback

// Feature detection results
const browserFeatures = {
    fileSystemAccess: false,
    webCrypto: false,
    localStorage: false,
    indexedDB: false,
    serviceWorker: false,
    offlineSupport: false
};

// Check for File System Access API
function checkFileSystemAccess() {
    return 'showSaveFilePicker' in window || 'showOpenFilePicker' in window;
}

// Check for Web Crypto API
function checkWebCrypto() {
    return window.crypto && window.crypto.subtle !== undefined;
}

// Check for localStorage
function checkLocalStorage() {
    try {
        const test = '__localStorage_test__';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
    } catch (e) {
        return false;
    }
}

// Check for IndexedDB
function checkIndexedDB() {
    return 'indexedDB' in window;
}

// Check for Service Worker support
function checkServiceWorker() {
    return 'serviceWorker' in navigator;
}

// Perform all feature checks
function detectBrowserFeatures() {
    browserFeatures.fileSystemAccess = checkFileSystemAccess();
    browserFeatures.webCrypto = checkWebCrypto();
    browserFeatures.localStorage = checkLocalStorage();
    browserFeatures.indexedDB = checkIndexedDB();
    browserFeatures.serviceWorker = checkServiceWorker();
    browserFeatures.offlineSupport = browserFeatures.serviceWorker && browserFeatures.localStorage;
    
    return browserFeatures;
}

// Get feature status for display
function getFeatureStatus() {
    const features = detectBrowserFeatures();
    
    return {
        critical: [
            { name: 'File System Access API', status: features.fileSystemAccess, description: 'Für lokale Dateiauswahl' },
            { name: 'Web Crypto API', status: features.webCrypto, description: 'Für SHA-256 Pseudonymisierung' },
            { name: 'Local Storage', status: features.localStorage, description: 'Für Konfigurationsspeicherung' }
        ],
        optional: [
            { name: 'IndexedDB', status: features.indexedDB, description: 'Für erweiterte Datenspeicherung' },
            { name: 'Service Worker', status: features.serviceWorker, description: 'Für Offline-Funktionalität' }
        ]
    };
}

// Check if all critical features are available
function checkCriticalFeatures() {
    const features = detectBrowserFeatures();
    const missing = [];
    
    if (!features.webCrypto) {
        missing.push('Web Crypto API (für Pseudonymisierung)');
    }
    if (!features.localStorage) {
        missing.push('Local Storage (für Konfiguration)');
    }
    
    return {
        isSupported: missing.length === 0,
        missingFeatures: missing,
        fileSystemFallback: !features.fileSystemAccess
    };
}

// Show feature detection dialog
function showFeatureDetectionDialog() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    
    const content = document.createElement('div');
    content.className = 'modal-content';
    content.style.maxWidth = '700px';
    
    const status = getFeatureStatus();
    const criticalCheck = checkCriticalFeatures();
    
    content.innerHTML = `
        <h2>🔍 Browser-Kompatibilität</h2>
        
        ${!criticalCheck.isSupported ? `
            <div style="background: #ffebee; border-left: 4px solid #f44336; padding: 15px; margin: 15px 0;">
                <strong>⚠️ Kritische Features fehlen:</strong>
                <ul style="margin: 10px 0; padding-left: 20px;">
                    ${criticalCheck.missingFeatures.map(f => `<li>${f}</li>`).join('')}
                </ul>
                <p style="margin: 0;">GDT-Export kann in diesem Browser nicht vollständig funktionieren.</p>
            </div>
        ` : `
            <div style="background: #e8f5e9; border-left: 4px solid #4CAF50; padding: 15px; margin: 15px 0;">
                <strong>✅ Alle kritischen Features verfügbar</strong>
                <p style="margin: 5px 0 0 0;">Ihr Browser unterstützt alle erforderlichen Funktionen für GDT-Export.</p>
            </div>
        `}
        
        ${criticalCheck.fileSystemFallback ? `
            <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 15px 0;">
                <strong>ℹ️ Hinweis:</strong> File System Access API nicht verfügbar.
                <p style="margin: 5px 0 0 0;">Export verwendet Download-Fallback.</p>
            </div>
        ` : ''}
        
        <h3 style="margin-top: 20px;">Kritische Features</h3>
        <div style="margin: 10px 0;">
            ${status.critical.map(f => `
                <div style="display: flex; align-items: center; padding: 10px; margin: 5px 0; background: ${f.status ? '#f1f8f4' : '#fef5f5'}; border-radius: 4px;">
                    <span style="font-size: 24px; margin-right: 10px;">${f.status ? '✅' : '❌'}</span>
                    <div style="flex: 1;">
                        <strong>${f.name}</strong>
                        <div style="font-size: 13px; color: #666;">${f.description}</div>
                    </div>
                </div>
            `).join('')}
        </div>
        
        <h3 style="margin-top: 20px;">Optionale Features</h3>
        <div style="margin: 10px 0;">
            ${status.optional.map(f => `
                <div style="display: flex; align-items: center; padding: 10px; margin: 5px 0; background: ${f.status ? '#f1f8f4' : '#f5f5f5'}; border-radius: 4px;">
                    <span style="font-size: 24px; margin-right: 10px;">${f.status ? '✅' : '⚪'}</span>
                    <div style="flex: 1;">
                        <strong>${f.name}</strong>
                        <div style="font-size: 13px; color: #666;">${f.description}</div>
                    </div>
                </div>
            `).join('')}
        </div>
        
        <div style="margin-top: 20px; padding: 15px; background: #f5f5f5; border-radius: 4px; font-size: 13px;">
            <strong>Empfohlene Browser:</strong>
            <ul style="margin: 10px 0; padding-left: 20px;">
                <li>Google Chrome 86+ oder Microsoft Edge 86+</li>
                <li>Firefox 90+ (mit Download-Fallback)</li>
                <li>Safari 15.2+ (mit Download-Fallback)</li>
            </ul>
        </div>
        
        <div style="text-align: right; margin-top: 20px;">
            <button class="btn btn-primary" onclick="this.closest('.modal').remove()">
                Schließen
            </button>
        </div>
    `;
    
    modal.appendChild(content);
    document.body.appendChild(modal);
}

// Online/Offline status management
let onlineStatus = navigator.onLine;
let statusIndicator = null;

// Create status indicator element
function createStatusIndicator() {
    if (statusIndicator) return statusIndicator;
    
    statusIndicator = document.createElement('div');
    statusIndicator.id = 'connectionStatus';
    statusIndicator.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 10px 20px;
        border-radius: 25px;
        font-size: 14px;
        font-weight: bold;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        z-index: 9999;
        transition: all 0.3s ease;
        cursor: pointer;
    `;
    
    updateStatusIndicator();
    document.body.appendChild(statusIndicator);
    
    // Click to show details
    statusIndicator.addEventListener('click', () => {
        showFeatureDetectionDialog();
    });
    
    return statusIndicator;
}

// Update status indicator appearance
function updateStatusIndicator() {
    if (!statusIndicator) return;
    
    if (onlineStatus) {
        statusIndicator.innerHTML = '🟢 Online';
        statusIndicator.style.background = '#4CAF50';
        statusIndicator.style.color = 'white';
    } else {
        statusIndicator.innerHTML = '🔴 Offline';
        statusIndicator.style.background = '#f44336';
        statusIndicator.style.color = 'white';
    }
}

// Show temporary notification
function showStatusNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        border-radius: 4px;
        font-size: 14px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    
    const colors = {
        info: { bg: '#2196F3', color: 'white' },
        success: { bg: '#4CAF50', color: 'white' },
        warning: { bg: '#ff9800', color: 'white' },
        error: { bg: '#f44336', color: 'white' }
    };
    
    const style = colors[type] || colors.info;
    notification.style.background = style.bg;
    notification.style.color = style.color;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Initialize online/offline monitoring
function initializeStatusMonitoring() {
    // Initial status
    onlineStatus = navigator.onLine;
    
    // Create indicator
    createStatusIndicator();
    
    // Listen for online/offline events
    window.addEventListener('online', () => {
        onlineStatus = true;
        updateStatusIndicator();
        showStatusNotification('✅ Verbindung wiederhergestellt', 'success');
        console.log('GDT Export: Online mode active');
    });
    
    window.addEventListener('offline', () => {
        onlineStatus = false;
        updateStatusIndicator();
        showStatusNotification('⚠️ Offline-Modus aktiv', 'warning');
        console.log('GDT Export: Offline mode active');
    });
    
    // Check features on load
    const criticalCheck = checkCriticalFeatures();
    if (!criticalCheck.isSupported) {
        setTimeout(() => {
            showStatusNotification('⚠️ Browser-Kompatibilitätsprobleme erkannt', 'warning');
        }, 1000);
    }
}

// Check if offline mode is supported
function isOfflineModeSupported() {
    return browserFeatures.offlineSupport;
}

// Get current connection status
function getConnectionStatus() {
    return {
        online: onlineStatus,
        features: browserFeatures,
        timestamp: new Date().toISOString()
    };
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
    
    #connectionStatus:hover {
        transform: scale(1.05);
    }
`;
document.head.appendChild(style);

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeStatusMonitoring);
} else {
    initializeStatusMonitoring();
}
