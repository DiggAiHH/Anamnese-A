// Enhanced Audit Functions Module
// CSV/PDF export, filtering, and statistics dashboard

// Export audit log to CSV format
function exportAuditLogCSV() {
    const auditLog = getAuditLog(1000); // Get last 1000 entries
    
    if (auditLog.length === 0) {
        return {
            success: false,
            message: 'Keine Audit-Log Einträge zum Exportieren vorhanden'
        };
    }
    
    // CSV headers
    const headers = ['Zeitstempel', 'Aktion', 'Dateiname', 'Patienten-ID', 'Pseudonymisiert', 'Einwilligung', 'Benutzer', 'Sprache'];
    
    // Convert audit entries to CSV rows
    const rows = auditLog.map(entry => [
        new Date(entry.timestamp).toLocaleString('de-DE'),
        entry.action,
        entry.filename || '',
        entry.patientId || '',
        entry.pseudonymized ? 'Ja' : 'Nein',
        entry.consentGiven ? 'Erteilt' : 'Nicht erteilt',
        entry.userAgentHash || entry.userAgent || '',
        entry.language || ''
    ]);
    
    // Build CSV content
    const csvContent = [headers, ...rows]
        .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(';'))
        .join('\n');
    
    // Add BOM for proper Excel UTF-8 handling
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GDT_Audit_Log_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    return {
        success: true,
        message: `Audit-Log mit ${auditLog.length} Einträgen wurde als CSV exportiert`
    };
}

// Export audit log to JSON format
function exportAuditLogJSON() {
    const auditLog = getAuditLog(1000);
    
    if (auditLog.length === 0) {
        return {
            success: false,
            message: 'Keine Audit-Log Einträge zum Exportieren vorhanden'
        };
    }
    
    const exportData = {
        exportDate: new Date().toISOString(),
        totalEntries: auditLog.length,
        entries: auditLog,
        metadata: {
            version: '1.0',
            application: 'Anamnese-A GDT Export',
            gdprCompliant: true
        }
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GDT_Audit_Log_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    return {
        success: true,
        message: `Audit-Log mit ${auditLog.length} Einträgen wurde als JSON exportiert`
    };
}

// Filter audit log by date range
function filterAuditLogByDateRange(startDate, endDate) {
    const auditLog = getAuditLog(10000);
    
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    
    return auditLog.filter(entry => {
        const entryDate = new Date(entry.timestamp);
        if (start && entryDate < start) return false;
        if (end && entryDate > end) return false;
        return true;
    });
}

// Filter audit log by action type
function filterAuditLogByAction(action) {
    const auditLog = getAuditLog(10000);
    return auditLog.filter(entry => entry.action === action);
}

// Get audit log statistics
function getAuditLogStatistics() {
    const auditLog = getAuditLog(10000);
    
    if (auditLog.length === 0) {
        return {
            totalExports: 0,
            pseudonymizedExports: 0,
            consentGivenExports: 0,
            lastExport: null,
            firstExport: null,
            exportsByDay: {},
            exportsByAction: {}
        };
    }
    
    const stats = {
        totalExports: auditLog.length,
        pseudonymizedExports: auditLog.filter(e => e.pseudonymized).length,
        consentGivenExports: auditLog.filter(e => e.consentGiven).length,
        lastExport: auditLog[auditLog.length - 1].timestamp,
        firstExport: auditLog[0].timestamp,
        exportsByDay: {},
        exportsByAction: {},
        exportsByMonth: {},
        uniquePatients: new Set(auditLog.map(e => e.patientId)).size
    };
    
    // Group by day
    auditLog.forEach(entry => {
        const date = new Date(entry.timestamp).toISOString().split('T')[0];
        stats.exportsByDay[date] = (stats.exportsByDay[date] || 0) + 1;
    });
    
    // Group by month
    auditLog.forEach(entry => {
        const month = new Date(entry.timestamp).toISOString().substring(0, 7);
        stats.exportsByMonth[month] = (stats.exportsByMonth[month] || 0) + 1;
    });
    
    // Group by action
    auditLog.forEach(entry => {
        stats.exportsByAction[entry.action] = (stats.exportsByAction[entry.action] || 0) + 1;
    });
    
    return stats;
}

// Generate audit statistics report HTML
function generateAuditStatsReport() {
    const stats = getAuditLogStatistics();
    
    if (stats.totalExports === 0) {
        return '<p style="text-align: center; color: #666;">Keine Daten für Statistiken vorhanden</p>';
    }
    
    const pseudoPercentage = Math.round((stats.pseudonymizedExports / stats.totalExports) * 100);
    const consentPercentage = Math.round((stats.consentGivenExports / stats.totalExports) * 100);
    
    // Last 7 days data
    const last7Days = Object.entries(stats.exportsByDay)
        .sort(([a], [b]) => b.localeCompare(a))
        .slice(0, 7)
        .reverse();
    
    const maxExportsPerDay = Math.max(...Object.values(stats.exportsByDay), 1);
    
    return `
        <div style="margin: 20px 0;">
            <h3 style="margin-top: 0;">Übersicht</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                <div style="background: #e3f2fd; padding: 15px; border-radius: 4px;">
                    <div style="font-size: 24px; font-weight: bold; color: #1976D2;">${stats.totalExports}</div>
                    <div style="font-size: 13px; color: #666;">Gesamt-Exporte</div>
                </div>
                <div style="background: #f3e5f5; padding: 15px; border-radius: 4px;">
                    <div style="font-size: 24px; font-weight: bold; color: #7B1FA2;">${stats.uniquePatients}</div>
                    <div style="font-size: 13px; color: #666;">Eindeutige Patienten</div>
                </div>
                <div style="background: #e8f5e9; padding: 15px; border-radius: 4px;">
                    <div style="font-size: 24px; font-weight: bold; color: #388E3C;">${pseudoPercentage}%</div>
                    <div style="font-size: 13px; color: #666;">Pseudonymisiert</div>
                </div>
                <div style="background: #fff3e0; padding: 15px; border-radius: 4px;">
                    <div style="font-size: 24px; font-weight: bold; color: #F57C00;">${consentPercentage}%</div>
                    <div style="font-size: 13px; color: #666;">Mit Einwilligung</div>
                </div>
            </div>
        </div>
        
        <div style="margin: 30px 0;">
            <h3>Exporte der letzten 7 Tage</h3>
            <div style="background: #f5f5f5; padding: 15px; border-radius: 4px;">
                ${last7Days.length === 0 ? '<p style="text-align: center; color: #666;">Keine Daten</p>' : ''}
                ${last7Days.map(([date, count]) => `
                    <div style="margin: 10px 0;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                            <span style="font-size: 13px;">${new Date(date).toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit' })}</span>
                            <span style="font-weight: bold;">${count}</span>
                        </div>
                        <div style="background: #ddd; height: 8px; border-radius: 4px; overflow: hidden;">
                            <div style="background: #2196F3; height: 100%; width: ${(count / maxExportsPerDay) * 100}%;"></div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
        
        <div style="margin: 30px 0;">
            <h3>Zeitraum</h3>
            <p style="font-size: 13px; color: #666;">
                <strong>Erster Export:</strong> ${new Date(stats.firstExport).toLocaleString('de-DE')}<br>
                <strong>Letzter Export:</strong> ${new Date(stats.lastExport).toLocaleString('de-DE')}
            </p>
        </div>
    `;
}

// Enhanced audit log viewer with filtering
function showEnhancedAuditLogViewer() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    
    const content = document.createElement('div');
    content.className = 'modal-content';
    content.style.maxWidth = '900px';
    content.style.maxHeight = '90vh';
    content.style.overflowY = 'auto';
    
    const initialStats = generateAuditStatsReport();
    
    content.innerHTML = `
        <h2>Audit-Log & Statistiken</h2>
        
        <!-- Tab Navigation -->
        <div style="border-bottom: 2px solid #ddd; margin: 20px 0;">
            <button id="tabStats" class="tab-button active" style="padding: 10px 20px; border: none; background: none; cursor: pointer; border-bottom: 3px solid #2196F3; font-weight: bold;">
                📊 Statistiken
            </button>
            <button id="tabLog" class="tab-button" style="padding: 10px 20px; border: none; background: none; cursor: pointer; color: #666;">
                📋 Log-Einträge
            </button>
            <button id="tabFilter" class="tab-button" style="padding: 10px 20px; border: none; background: none; cursor: pointer; color: #666;">
                🔍 Filter
            </button>
        </div>
        
        <!-- Statistics Tab -->
        <div id="statsContent" class="tab-content">
            ${initialStats}
        </div>
        
        <!-- Log Entries Tab -->
        <div id="logContent" class="tab-content" style="display: none;">
            <div id="logEntries"></div>
        </div>
        
        <!-- Filter Tab -->
        <div id="filterContent" class="tab-content" style="display: none;">
            <h3>Zeitraum-Filter</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 15px 0;">
                <div>
                    <label style="display: block; margin-bottom: 5px;">Von:</label>
                    <input type="date" id="filterStartDate" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 5px;">Bis:</label>
                    <input type="date" id="filterEndDate" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                </div>
            </div>
            <button id="applyFilter" class="btn" style="background: #2196F3; color: white;">Filter anwenden</button>
            <button id="clearFilter" class="btn" style="background: #757575; color: white;">Filter zurücksetzen</button>
            <div id="filterResults" style="margin-top: 20px;"></div>
        </div>
        
        <!-- Action Buttons -->
        <div style="display: flex; justify-content: space-between; margin-top: 20px; gap: 10px; flex-wrap: wrap;">
            <div>
                <button id="exportCSV" class="btn" style="background: #4CAF50; color: white; font-size: 13px;">
                    📥 CSV Export
                </button>
                <button id="exportJSON" class="btn" style="background: #2196F3; color: white; font-size: 13px;">
                    📥 JSON Export
                </button>
            </div>
            <button class="btn btn-primary" onclick="this.closest('.modal').remove()">
                Schließen
            </button>
        </div>
    `;
    
    modal.appendChild(content);
    document.body.appendChild(modal);
    
    // Tab switching
    const tabs = content.querySelectorAll('.tab-button');
    const tabContents = content.querySelectorAll('.tab-content');
    
    tabs.forEach((tab, index) => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => {
                t.classList.remove('active');
                t.style.borderBottom = 'none';
                t.style.color = '#666';
                t.style.fontWeight = 'normal';
            });
            tabContents.forEach(tc => tc.style.display = 'none');
            
            tab.classList.add('active');
            tab.style.borderBottom = '3px solid #2196F3';
            tab.style.color = '#000';
            tab.style.fontWeight = 'bold';
            tabContents[index].style.display = 'block';
            
            // Load log entries when tab is activated
            if (index === 1 && !document.getElementById('logEntries').innerHTML) {
                loadLogEntries();
            }
        });
    });
    
    // Export handlers
    document.getElementById('exportCSV').addEventListener('click', () => {
        const result = exportAuditLogCSV();
        alert(result.message);
    });
    
    document.getElementById('exportJSON').addEventListener('click', () => {
        const result = exportAuditLogJSON();
        alert(result.message);
    });
    
    // Filter handlers
    document.getElementById('applyFilter').addEventListener('click', () => {
        const start = document.getElementById('filterStartDate').value;
        const end = document.getElementById('filterEndDate').value;
        const filtered = filterAuditLogByDateRange(start, end);
        
        document.getElementById('filterResults').innerHTML = `
            <div style="background: #e3f2fd; padding: 15px; border-radius: 4px;">
                <strong>${filtered.length} Einträge gefunden</strong> im Zeitraum 
                ${start ? new Date(start).toLocaleDateString('de-DE') : 'Anfang'} bis 
                ${end ? new Date(end).toLocaleDateString('de-DE') : 'Ende'}
            </div>
        `;
    });
    
    document.getElementById('clearFilter').addEventListener('click', () => {
        document.getElementById('filterStartDate').value = '';
        document.getElementById('filterEndDate').value = '';
        document.getElementById('filterResults').innerHTML = '';
    });
    
    function loadLogEntries() {
        const auditLog = getAuditLog(50);
        const logEntriesDiv = document.getElementById('logEntries');
        
        if (auditLog.length === 0) {
            logEntriesDiv.innerHTML = '<p style="text-align: center; color: #666;">Keine Audit-Log Einträge vorhanden</p>';
            return;
        }
        
        logEntriesDiv.innerHTML = auditLog.reverse().map(entry => `
            <div style="border: 1px solid #ddd; padding: 10px; margin: 10px 0; border-radius: 4px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                    <strong>${entry.action}</strong>
                    <span style="color: #666; font-size: 12px;">${new Date(entry.timestamp).toLocaleString('de-DE')}</span>
                </div>
                ${entry.filename ? `<div style="font-size: 13px;"><strong>Datei:</strong> ${entry.filename}</div>` : ''}
                <div style="font-size: 13px;"><strong>Patient-ID:</strong> ${entry.patientId}</div>
                ${entry.pseudonymized !== undefined ? `<div style="font-size: 13px;"><strong>Pseudonymisiert:</strong> ${entry.pseudonymized ? 'Ja' : 'Nein'}</div>` : ''}
                ${entry.consentGiven !== undefined ? `<div style="font-size: 13px;"><strong>Einwilligung:</strong> ${entry.consentGiven ? 'Erteilt' : 'Nicht erteilt'}</div>` : ''}
            </div>
        `).join('');
    }
}
