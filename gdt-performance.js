// Performance Optimization Module
// Configuration caching, optimized data processing, and performance monitoring

// Configuration cache
const configCache = {
    gdt: null,
    templates: null,
    lastUpdate: null,
    ttl: 5 * 60 * 1000 // 5 minutes cache TTL
};

// Performance metrics
const performanceMetrics = {
    exportTimes: [],
    validationTimes: [],
    pseudonymizationTimes: [],
    averageExportTime: 0,
    averageValidationTime: 0,
    averagePseudonymizationTime: 0
};

// Cache configuration
function cacheGDTConfig(config) {
    configCache.gdt = JSON.parse(JSON.stringify(config));
    configCache.lastUpdate = Date.now();
    
    // Also persist to localStorage
    try {
        localStorage.setItem('gdtExportConfig', JSON.stringify(config));
        localStorage.setItem('gdtConfigTimestamp', Date.now().toString());
    } catch (e) {
        console.warn('Failed to persist config to localStorage:', e);
    }
}

// Get cached configuration
function getCachedGDTConfig() {
    // Check memory cache first
    if (configCache.gdt && (Date.now() - configCache.lastUpdate) < configCache.ttl) {
        return configCache.gdt;
    }
    
    // Try localStorage
    try {
        const stored = localStorage.getItem('gdtExportConfig');
        const timestamp = parseInt(localStorage.getItem('gdtConfigTimestamp') || '0');
        
        if (stored && (Date.now() - timestamp) < configCache.ttl) {
            configCache.gdt = JSON.parse(stored);
            configCache.lastUpdate = timestamp;
            return configCache.gdt;
        }
    } catch (e) {
        console.warn('Failed to load config from localStorage:', e);
    }
    
    return null;
}

// Clear configuration cache
function clearConfigCache() {
    configCache.gdt = null;
    configCache.lastUpdate = null;
}

// Cache templates
function cacheTemplates(templates) {
    configCache.templates = templates;
    configCache.lastUpdate = Date.now();
}

// Get cached templates
function getCachedTemplates() {
    if (configCache.templates && (Date.now() - configCache.lastUpdate) < configCache.ttl) {
        return configCache.templates;
    }
    return null;
}

// Performance monitoring wrapper
function measurePerformance(fn, category) {
    return async function(...args) {
        const startTime = performance.now();
        try {
            const result = await fn.apply(this, args);
            const endTime = performance.now();
            const duration = endTime - startTime;
            
            // Record metric
            if (performanceMetrics[`${category}Times`]) {
                performanceMetrics[`${category}Times`].push(duration);
                
                // Keep only last 100 measurements
                if (performanceMetrics[`${category}Times`].length > 100) {
                    performanceMetrics[`${category}Times`].shift();
                }
                
                // Update average
                const times = performanceMetrics[`${category}Times`];
                performanceMetrics[`average${category.charAt(0).toUpperCase() + category.slice(1)}Time`] = 
                    times.reduce((a, b) => a + b, 0) / times.length;
            }
            
            // Log slow operations
            if (duration > 1000) {
                console.warn(`Slow ${category} operation: ${duration.toFixed(2)}ms`);
            }
            
            return result;
        } catch (error) {
            const endTime = performance.now();
            console.error(`${category} failed after ${(endTime - startTime).toFixed(2)}ms:`, error);
            throw error;
        }
    };
}

// Optimized batch processing
async function processBatch(items, processor, batchSize = 10) {
    const results = [];
    
    for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize);
        const batchResults = await Promise.all(batch.map(processor));
        results.push(...batchResults);
        
        // Allow UI to update between batches
        await new Promise(resolve => setTimeout(resolve, 0));
    }
    
    return results;
}

// Debounce function for reducing excessive calls
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle function for rate limiting
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Memoization for expensive computations
function memoize(fn) {
    const cache = new Map();
    return function(...args) {
        const key = JSON.stringify(args);
        if (cache.has(key)) {
            return cache.get(key);
        }
        const result = fn.apply(this, args);
        cache.set(key, result);
        
        // Limit cache size
        if (cache.size > 100) {
            const firstKey = cache.keys().next().value;
            cache.delete(firstKey);
        }
        
        return result;
    };
}

// Get performance statistics
function getPerformanceStats() {
    return {
        export: {
            average: performanceMetrics.averageExportTime.toFixed(2),
            count: performanceMetrics.exportTimes.length,
            min: Math.min(...performanceMetrics.exportTimes).toFixed(2),
            max: Math.max(...performanceMetrics.exportTimes).toFixed(2)
        },
        validation: {
            average: performanceMetrics.averageValidationTime.toFixed(2),
            count: performanceMetrics.validationTimes.length,
            min: Math.min(...performanceMetrics.validationTimes).toFixed(2),
            max: Math.max(...performanceMetrics.validationTimes).toFixed(2)
        },
        pseudonymization: {
            average: performanceMetrics.averagePseudonymizationTime.toFixed(2),
            count: performanceMetrics.pseudonymizationTimes.length,
            min: Math.min(...performanceMetrics.pseudonymizationTimes).toFixed(2),
            max: Math.max(...performanceMetrics.pseudonymizationTimes).toFixed(2)
        },
        cache: {
            gdtConfigCached: configCache.gdt !== null,
            templatesCached: configCache.templates !== null,
            lastUpdate: configCache.lastUpdate ? new Date(configCache.lastUpdate).toLocaleString('de-DE') : 'Nie'
        }
    };
}

// Show performance dashboard
function showPerformanceDashboard() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    
    const content = document.createElement('div');
    content.className = 'modal-content';
    content.style.maxWidth = '800px';
    
    const stats = getPerformanceStats();
    
    content.innerHTML = `
        <h2>⚡ Performance-Statistiken</h2>
        
        <div style="margin: 20px 0;">
            <h3>Export-Performance</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px;">
                <div style="background: #e3f2fd; padding: 15px; border-radius: 4px; text-align: center;">
                    <div style="font-size: 20px; font-weight: bold; color: #1976D2;">${stats.export.average}ms</div>
                    <div style="font-size: 13px; color: #666;">Durchschnitt</div>
                </div>
                <div style="background: #f3e5f5; padding: 15px; border-radius: 4px; text-align: center;">
                    <div style="font-size: 20px; font-weight: bold; color: #7B1FA2;">${stats.export.min}ms</div>
                    <div style="font-size: 13px; color: #666;">Minimum</div>
                </div>
                <div style="background: #fff3e0; padding: 15px; border-radius: 4px; text-align: center;">
                    <div style="font-size: 20px; font-weight: bold; color: #F57C00;">${stats.export.max}ms</div>
                    <div style="font-size: 13px; color: #666;">Maximum</div>
                </div>
                <div style="background: #e8f5e9; padding: 15px; border-radius: 4px; text-align: center;">
                    <div style="font-size: 20px; font-weight: bold; color: #388E3C;">${stats.export.count}</div>
                    <div style="font-size: 13px; color: #666;">Messungen</div>
                </div>
            </div>
        </div>
        
        <div style="margin: 20px 0;">
            <h3>Validierungs-Performance</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px;">
                <div style="background: #e3f2fd; padding: 15px; border-radius: 4px; text-align: center;">
                    <div style="font-size: 20px; font-weight: bold; color: #1976D2;">${stats.validation.average}ms</div>
                    <div style="font-size: 13px; color: #666;">Durchschnitt</div>
                </div>
                <div style="background: #e8f5e9; padding: 15px; border-radius: 4px; text-align: center;">
                    <div style="font-size: 20px; font-weight: bold; color: #388E3C;">${stats.validation.count}</div>
                    <div style="font-size: 13px; color: #666;">Messungen</div>
                </div>
            </div>
        </div>
        
        <div style="margin: 20px 0;">
            <h3>Cache-Status</h3>
            <div style="background: #f5f5f5; padding: 15px; border-radius: 4px;">
                <div style="margin: 5px 0;">
                    <strong>GDT-Konfiguration:</strong> 
                    <span style="color: ${stats.cache.gdtConfigCached ? '#4CAF50' : '#757575'};">
                        ${stats.cache.gdtConfigCached ? '✅ Im Cache' : '⚪ Nicht gecacht'}
                    </span>
                </div>
                <div style="margin: 5px 0;">
                    <strong>Templates:</strong> 
                    <span style="color: ${stats.cache.templatesCached ? '#4CAF50' : '#757575'};">
                        ${stats.cache.templatesCached ? '✅ Im Cache' : '⚪ Nicht gecacht'}
                    </span>
                </div>
                <div style="margin: 5px 0;">
                    <strong>Letzte Aktualisierung:</strong> ${stats.cache.lastUpdate}
                </div>
            </div>
        </div>
        
        <div style="margin: 20px 0;">
            <h3>Optimierungsempfehlungen</h3>
            <ul style="font-size: 13px; color: #666; padding-left: 20px;">
                ${parseFloat(stats.export.average) > 500 ? 
                    '<li>⚠️ Export-Zeit über 500ms - Prüfen Sie die Datenmenge</li>' : 
                    '<li>✅ Export-Performance optimal</li>'}
                ${!stats.cache.gdtConfigCached ? 
                    '<li>💡 Konfiguration wird bei jedem Export neu geladen</li>' : 
                    '<li>✅ Konfiguration wird gecacht</li>'}
                ${stats.export.count < 10 ? 
                    '<li>ℹ️ Noch wenige Messungen für präzise Statistiken</li>' : 
                    '<li>✅ Ausreichend Messungen für valide Statistiken</li>'}
            </ul>
        </div>
        
        <div style="text-align: right; margin-top: 20px;">
            <button class="btn" style="background: #757575; color: white; margin-right: 10px;" onclick="clearConfigCache(); this.closest('.modal').remove(); alert('Cache geleert');">
                Cache leeren
            </button>
            <button class="btn btn-primary" onclick="this.closest('.modal').remove()">
                Schließen
            </button>
        </div>
    `;
    
    modal.appendChild(content);
    document.body.appendChild(modal);
}

// Auto-initialize performance monitoring
if (typeof gdtExportConfig !== 'undefined') {
    // Wrap update function with caching
    const originalUpdate = typeof updateGDTConfig !== 'undefined' ? updateGDTConfig : null;
    if (originalUpdate) {
        window.updateGDTConfig = function(config) {
            const result = originalUpdate.call(this, config);
            cacheGDTConfig(config);
            return result;
        };
    }
}

// Export functions for global use
window.performanceOptimization = {
    measurePerformance,
    processBatch,
    debounce,
    throttle,
    memoize,
    getPerformanceStats,
    showPerformanceDashboard,
    cacheGDTConfig,
    getCachedGDTConfig,
    clearConfigCache
};

console.log('GDT Performance Optimization module loaded');
