// GDT Export Templates Module
// Pre-configured export profiles for different PVS systems and use cases

// Export template structure
const GDT_EXPORT_TEMPLATES = {
    // Medatixx optimized profile
    medatixx_standard: {
        name: 'Medatixx Standard',
        description: 'Optimiert für Medatixx Praxisverwaltungssysteme',
        config: {
            pseudonymizeData: false,
            includeFullName: true,
            includeAddress: true,
            includeContactData: true,
            includeInsuranceData: true,
            includeMedicalCodes: true,
            validateBeforeExport: true
        },
        requiredFields: ['bsnr', 'lanr'],
        pvs: 'medatixx'
    },
    
    // CGM optimized profile
    cgm_standard: {
        name: 'CGM Standard',
        description: 'Optimiert für CGM Praxisverwaltungssysteme',
        config: {
            pseudonymizeData: false,
            includeFullName: true,
            includeAddress: true,
            includeContactData: true,
            includeInsuranceData: true,
            includeMedicalCodes: true,
            validateBeforeExport: true
        },
        requiredFields: ['bsnr', 'lanr'],
        pvs: 'cgm'
    },
    
    // Quincy optimized profile
    quincy_standard: {
        name: 'Quincy Standard',
        description: 'Optimiert für Quincy Praxisverwaltungssysteme',
        config: {
            pseudonymizeData: false,
            includeFullName: true,
            includeAddress: true,
            includeContactData: true,
            includeInsuranceData: true,
            includeMedicalCodes: false, // Quincy handles ICD-10 separately
            validateBeforeExport: true
        },
        requiredFields: ['bsnr', 'lanr'],
        pvs: 'quincy'
    },
    
    // Privacy-focused profile (maximum pseudonymization)
    privacy_maximum: {
        name: 'Datenschutz Maximal',
        description: 'Maximale Pseudonymisierung, minimale Datenübertragung',
        config: {
            pseudonymizeData: true,
            includeFullName: false,
            includeAddress: false,
            includeContactData: false,
            includeInsuranceData: false,
            includeMedicalCodes: false,
            validateBeforeExport: true
        },
        requiredFields: [],
        pvs: 'generic'
    },
    
    // Research/Statistics profile
    research_anonymous: {
        name: 'Forschung/Statistik',
        description: 'Anonymisiert für Forschung und statistische Auswertung',
        config: {
            pseudonymizeData: true,
            includeFullName: false,
            includeAddress: false,
            includeContactData: false,
            includeInsuranceData: false,
            includeMedicalCodes: true, // ICD-10 relevant for research
            validateBeforeExport: true
        },
        requiredFields: [],
        pvs: 'generic'
    },
    
    // Complete profile (all data)
    complete_export: {
        name: 'Vollständiger Export',
        description: 'Alle verfügbaren Daten (erfordert umfassende Einwilligung)',
        config: {
            pseudonymizeData: false,
            includeFullName: true,
            includeAddress: true,
            includeContactData: true,
            includeInsuranceData: true,
            includeMedicalCodes: true,
            validateBeforeExport: true
        },
        requiredFields: ['bsnr', 'lanr'],
        pvs: 'generic'
    },
    
    // Basic profile (minimal data)
    basic_export: {
        name: 'Basis Export',
        description: 'Nur grundlegende Patientendaten und Anamnese',
        config: {
            pseudonymizeData: true,
            includeFullName: true,
            includeAddress: false,
            includeContactData: false,
            includeInsuranceData: false,
            includeMedicalCodes: false,
            validateBeforeExport: true
        },
        requiredFields: [],
        pvs: 'generic'
    },
    
    // Emergency transfer profile
    emergency_transfer: {
        name: 'Notfall-Übermittlung',
        description: 'Für dringende Patientenübergabe an andere Praxis',
        config: {
            pseudonymizeData: false,
            includeFullName: true,
            includeAddress: true,
            includeContactData: true,
            includeInsuranceData: true,
            includeMedicalCodes: true,
            validateBeforeExport: false // Speed over validation in emergency
        },
        requiredFields: [],
        pvs: 'generic'
    }
};

// Load template into current configuration
function loadGDTTemplate(templateId) {
    const template = GDT_EXPORT_TEMPLATES[templateId];
    
    if (!template) {
        console.error('Template not found:', templateId);
        return {
            success: false,
            message: `Vorlage "${templateId}" nicht gefunden`
        };
    }
    
    // Check if required fields are configured
    const missingFields = [];
    template.requiredFields.forEach(field => {
        if (!gdtExportConfig[field]) {
            missingFields.push(field);
        }
    });
    
    if (missingFields.length > 0) {
        const fieldNames = {
            'bsnr': 'BSNR (Betriebsstättennummer)',
            'lanr': 'LANR (Lebenslange Arztnummer)',
            'practiceId': 'Praxis-ID'
        };
        const missingFieldNames = missingFields.map(f => fieldNames[f] || f).join(', ');
        
        console.warn('Missing required fields for template:', missingFields);
        return {
            success: false,
            message: `Fehlende Pflichtfelder für diese Vorlage: ${missingFieldNames}`,
            missingFields: missingFields
        };
    }
    
    // Apply template configuration
    updateGDTConfig(template.config);
    
    console.log('Template loaded:', template.name);
    return {
        success: true,
        message: `Vorlage "${template.name}" wurde geladen`,
        template: template
    };
}

// Get list of available templates
function getAvailableTemplates() {
    return Object.keys(GDT_EXPORT_TEMPLATES).map(key => ({
        id: key,
        name: GDT_EXPORT_TEMPLATES[key].name,
        description: GDT_EXPORT_TEMPLATES[key].description,
        pvs: GDT_EXPORT_TEMPLATES[key].pvs,
        requiredFields: GDT_EXPORT_TEMPLATES[key].requiredFields
    }));
}

// Get template by ID
function getTemplateById(templateId) {
    return GDT_EXPORT_TEMPLATES[templateId] || null;
}

// Get templates for specific PVS
function getTemplatesForPVS(pvs) {
    return Object.keys(GDT_EXPORT_TEMPLATES)
        .filter(key => GDT_EXPORT_TEMPLATES[key].pvs === pvs || GDT_EXPORT_TEMPLATES[key].pvs === 'generic')
        .map(key => ({
            id: key,
            name: GDT_EXPORT_TEMPLATES[key].name,
            description: GDT_EXPORT_TEMPLATES[key].description
        }));
}

// Save current configuration as custom template
function saveCustomTemplate(name, description) {
    const customTemplateId = `custom_${Date.now()}`;
    
    const customTemplate = {
        name: name,
        description: description,
        config: {
            pseudonymizeData: gdtExportConfig.pseudonymizeData,
            includeFullName: gdtExportConfig.includeFullName,
            includeAddress: gdtExportConfig.includeAddress,
            includeContactData: gdtExportConfig.includeContactData,
            includeInsuranceData: gdtExportConfig.includeInsuranceData,
            includeMedicalCodes: gdtExportConfig.includeMedicalCodes,
            validateBeforeExport: gdtExportConfig.validateBeforeExport
        },
        requiredFields: [],
        pvs: 'custom',
        createdAt: new Date().toISOString()
    };
    
    // Save to localStorage
    const customTemplates = JSON.parse(localStorage.getItem('gdtCustomTemplates') || '{}');
    customTemplates[customTemplateId] = customTemplate;
    localStorage.setItem('gdtCustomTemplates', JSON.stringify(customTemplates));
    
    console.log('Custom template saved:', name);
    return {
        success: true,
        message: `Eigene Vorlage "${name}" wurde gespeichert`,
        templateId: customTemplateId
    };
}

// Load custom templates from localStorage
function getCustomTemplates() {
    const customTemplates = JSON.parse(localStorage.getItem('gdtCustomTemplates') || '{}');
    return Object.keys(customTemplates).map(key => ({
        id: key,
        name: customTemplates[key].name,
        description: customTemplates[key].description,
        pvs: 'custom',
        createdAt: customTemplates[key].createdAt
    }));
}

// Delete custom template
function deleteCustomTemplate(templateId) {
    if (!templateId.startsWith('custom_')) {
        return {
            success: false,
            message: 'Nur eigene Vorlagen können gelöscht werden'
        };
    }
    
    const customTemplates = JSON.parse(localStorage.getItem('gdtCustomTemplates') || '{}');
    delete customTemplates[templateId];
    localStorage.setItem('gdtCustomTemplates', JSON.stringify(customTemplates));
    
    return {
        success: true,
        message: 'Vorlage wurde gelöscht'
    };
}

// Load custom template (including from localStorage)
function loadCustomTemplate(templateId) {
    if (templateId.startsWith('custom_')) {
        const customTemplates = JSON.parse(localStorage.getItem('gdtCustomTemplates') || '{}');
        const template = customTemplates[templateId];
        
        if (!template) {
            return {
                success: false,
                message: 'Eigene Vorlage nicht gefunden'
            };
        }
        
        updateGDTConfig(template.config);
        return {
            success: true,
            message: `Eigene Vorlage "${template.name}" wurde geladen`,
            template: template
        };
    }
    
    return loadGDTTemplate(templateId);
}

// Export template to JSON file
function exportTemplate(templateId) {
    const template = getTemplateById(templateId) || 
                     JSON.parse(localStorage.getItem('gdtCustomTemplates') || '{}')[templateId];
    
    if (!template) {
        return {
            success: false,
            message: 'Vorlage nicht gefunden'
        };
    }
    
    const templateData = {
        id: templateId,
        ...template,
        exportedAt: new Date().toISOString(),
        version: '1.0'
    };
    
    const blob = new Blob([JSON.stringify(templateData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gdt_template_${templateId}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    return {
        success: true,
        message: 'Vorlage wurde exportiert'
    };
}

// Import template from JSON file
async function importTemplate(fileContent) {
    try {
        const templateData = JSON.parse(fileContent);
        
        // Validate template structure
        if (!templateData.name || !templateData.config) {
            return {
                success: false,
                message: 'Ungültige Vorlagen-Datei'
            };
        }
        
        // Save as custom template
        const result = saveCustomTemplate(templateData.name, templateData.description);
        
        return {
            success: true,
            message: `Vorlage "${templateData.name}" wurde importiert`,
            templateId: result.templateId
        };
    } catch (error) {
        console.error('Error importing template:', error);
        return {
            success: false,
            message: 'Fehler beim Importieren der Vorlage'
        };
    }
}
