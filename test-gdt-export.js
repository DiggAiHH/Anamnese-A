// Test Suite for GDT Export and GDPR Compliance
// Run this in browser console to test the implementation

console.log('=== GDT Export & GDPR Compliance Test Suite ===\n');

// Test 1: GDT Field Formatting
function testGDTFieldFormatting() {
    console.log('Test 1: GDT Field Formatting');
    
    const testCases = [
        { fieldId: '3000', content: '1234567890', expected: '01730001234567890' },
        { fieldId: '3101', content: 'Mustermann', expected: '0213101Mustermann' },
        { fieldId: '8418', content: '20251221', expected: '015841820251221' }
    ];
    
    let passed = 0;
    testCases.forEach((test, i) => {
        const result = formatGDTField(test.fieldId, test.content);
        const success = result === test.expected;
        console.log(`  Test 1.${i+1}: ${success ? '✓' : '✗'} ${test.fieldId} - "${test.content}"`);
        if (!success) {
            console.log(`    Expected: "${test.expected}"`);
            console.log(`    Got:      "${result}"`);
        }
        if (success) passed++;
    });
    
    console.log(`  Result: ${passed}/${testCases.length} tests passed\n`);
    return passed === testCases.length;
}

// Test 2: Date Formatting
function testDateFormatting() {
    console.log('Test 2: Date Formatting');
    
    const testDate = '1990-05-15';
    const result = formatGDTDate(testDate);
    const expected = '15051990';
    const success = result === expected;
    
    console.log(`  ${success ? '✓' : '✗'} Date: ${testDate} -> ${result}`);
    if (!success) {
        console.log(`    Expected: ${expected}`);
    }
    console.log('');
    return success;
}

// Test 3: Pseudonymization Consistency
function testPseudonymization() {
    console.log('Test 3: Pseudonymization Consistency');
    
    const patientData = {
        firstName: 'Max',
        lastName: 'Mustermann',
        dateOfBirth: '1990-05-15'
    };
    
    const pseudo1 = pseudonymizePatientId(patientData);
    const pseudo2 = pseudonymizePatientId(patientData);
    
    const success = pseudo1 === pseudo2 && pseudo1.length === 10;
    
    console.log(`  ${success ? '✓' : '✗'} Pseudonymization: ${pseudo1}`);
    console.log(`    Consistent: ${pseudo1 === pseudo2}`);
    console.log(`    Length: ${pseudo1.length} (expected: 10)`);
    console.log('');
    
    return success;
}

// Test 4: GDT Content Generation
function testGDTContentGeneration() {
    console.log('Test 4: GDT Content Generation');
    
    const formData = {
        firstName: 'Max',
        lastName: 'Mustermann',
        dateOfBirth: '1990-05-15',
        gender: 'male',
        currentComplaints: 'Test complaint',
        allergies: 'None'
    };
    
    const content = generateGDTContent(formData);
    
    const checks = {
        hasRecordType: content.includes('8100'),
        hasSoftwareId: content.includes('0102'),
        hasPatientId: content.includes('3000'),
        hasDateOfBirth: content.includes('3103'),
        hasGender: content.includes('3110'),
        hasAllergies: content.includes('6220'),
        hasCRLF: content.includes('\r\n')
    };
    
    let passed = 0;
    Object.entries(checks).forEach(([key, value]) => {
        console.log(`  ${value ? '✓' : '✗'} ${key}`);
        if (value) passed++;
    });
    
    console.log(`  Result: ${passed}/${Object.keys(checks).length} checks passed`);
    console.log(`  Content length: ${content.length} bytes\n`);
    
    return passed === Object.keys(checks).length;
}

// Test 5: Configuration Management
function testConfigManagement() {
    console.log('Test 5: Configuration Management');
    
    const testConfig = {
        practiceId: 'TEST-PRAXIS-001',
        pseudonymizeData: false,
        includeFullName: true,
        includeAddress: false
    };
    
    updateGDTConfig(testConfig);
    
    const checks = {
        practiceId: gdtExportConfig.practiceId === 'TEST-PRAXIS-001',
        pseudonymizeData: gdtExportConfig.pseudonymizeData === false,
        includeFullName: gdtExportConfig.includeFullName === true,
        includeAddress: gdtExportConfig.includeAddress === false
    };
    
    let passed = 0;
    Object.entries(checks).forEach(([key, value]) => {
        console.log(`  ${value ? '✓' : '✗'} ${key}`);
        if (value) passed++;
    });
    
    // Restore defaults
    updateGDTConfig({
        pseudonymizeData: true,
        includeFullName: false,
        includeAddress: false,
        includeContactData: false
    });
    
    console.log(`  Result: ${passed}/${Object.keys(checks).length} checks passed\n`);
    return passed === Object.keys(checks).length;
}

// Test 6: Audit Logging
function testAuditLogging() {
    console.log('Test 6: Audit Logging');
    
    const formData = {
        firstName: 'Test',
        lastName: 'Patient',
        dateOfBirth: '2000-01-01'
    };
    
    const initialLogLength = getAuditLog(1000).length;
    
    logGDTExport(formData, 'test.gdt', { synchronization: true });
    
    const newLogLength = getAuditLog(1000).length;
    const auditEntry = getAuditLog(1).pop();
    
    const checks = {
        logCreated: newLogLength > initialLogLength,
        hasTimestamp: auditEntry && 'timestamp' in auditEntry,
        hasAction: auditEntry && auditEntry.action === 'GDT_EXPORT',
        hasFilename: auditEntry && auditEntry.filename === 'test.gdt',
        hasPatientId: auditEntry && 'patientId' in auditEntry,
        hasConsent: auditEntry && 'consentGiven' in auditEntry
    };
    
    let passed = 0;
    Object.entries(checks).forEach(([key, value]) => {
        console.log(`  ${value ? '✓' : '✗'} ${key}`);
        if (value) passed++;
    });
    
    console.log(`  Result: ${passed}/${Object.keys(checks).length} checks passed\n`);
    return passed === Object.keys(checks).length;
}

// Test 7: Consent Record Creation
function testConsentRecordCreation() {
    console.log('Test 7: Consent Record Creation');
    
    const patientId = 'TEST-PATIENT-001';
    const consentType = CONSENT_TYPES.DATA_EXPORT;
    
    const record = createConsentRecord(patientId, consentType, true, { test: true });
    
    const checks = {
        hasId: record && 'id' in record,
        hasPatientId: record && record.patientId === patientId,
        hasConsentType: record && record.consentType === consentType,
        hasGranted: record && record.granted === true,
        hasTimestamp: record && 'timestamp' in record,
        hasLegalBasis: record && 'legalBasis' in record,
        hasVersion: record && 'version' in record
    };
    
    let passed = 0;
    Object.entries(checks).forEach(([key, value]) => {
        console.log(`  ${value ? '✓' : '✗'} ${key}`);
        if (value) passed++;
    });
    
    console.log(`  Result: ${passed}/${Object.keys(checks).length} checks passed\n`);
    return passed === Object.keys(checks).length;
}

// Test 8: Processing Record Generation
function testProcessingRecord() {
    console.log('Test 8: Processing Record Generation');
    
    const record = generateProcessingRecord();
    
    const checks = {
        hasController: record && 'controller' in record,
        hasPurposes: record && Array.isArray(record.purposes),
        hasSecurityMeasures: record && record.purposes[0] && Array.isArray(record.purposes[0].securityMeasures),
        hasDataCategories: record && record.purposes[0] && Array.isArray(record.purposes[0].dataCategories),
        hasCreatedTimestamp: record && 'created' in record,
        hasVersion: record && 'version' in record
    };
    
    let passed = 0;
    Object.entries(checks).forEach(([key, value]) => {
        console.log(`  ${value ? '✓' : '✗'} ${key}`);
        if (value) passed++;
    });
    
    console.log(`  Result: ${passed}/${Object.keys(checks).length} checks passed\n`);
    return passed === Object.keys(checks).length;
}

// Test 9: DPIA Template Generation
function testDPIATemplate() {
    console.log('Test 9: DPIA Template Generation');
    
    const dpia = generateDPIATemplate();
    
    const checks = {
        hasTitle: dpia && 'title' in dpia,
        hasDescription: dpia && 'description' in dpia,
        hasDataProcessing: dpia && 'dataProcessing' in dpia,
        hasRisks: dpia && Array.isArray(dpia.risks),
        hasTechnicalMeasures: dpia && Array.isArray(dpia.technicalMeasures),
        hasOrganizationalMeasures: dpia && Array.isArray(dpia.organizationalMeasures),
        hasConclusion: dpia && 'conclusion' in dpia,
        hasAcceptableRisk: dpia && dpia.conclusion && 'acceptable' in dpia.conclusion
    };
    
    let passed = 0;
    Object.entries(checks).forEach(([key, value]) => {
        console.log(`  ${value ? '✓' : '✗'} ${key}`);
        if (value) passed++;
    });
    
    console.log(`  Result: ${passed}/${Object.keys(checks).length} checks passed\n`);
    return passed === Object.keys(checks).length;
}

// Run all tests
function runAllTests() {
    console.log('Starting GDT Export & GDPR Compliance Test Suite...\n');
    console.log('=' .repeat(60) + '\n');
    
    const results = {
        'GDT Field Formatting': testGDTFieldFormatting(),
        'Date Formatting': testDateFormatting(),
        'Pseudonymization': testPseudonymization(),
        'GDT Content Generation': testGDTContentGeneration(),
        'Configuration Management': testConfigManagement(),
        'Audit Logging': testAuditLogging(),
        'Consent Record Creation': testConsentRecordCreation(),
        'Processing Record': testProcessingRecord(),
        'DPIA Template': testDPIATemplate()
    };
    
    console.log('=' .repeat(60));
    console.log('\n=== Test Summary ===\n');
    
    let passed = 0;
    Object.entries(results).forEach(([name, result]) => {
        console.log(`  ${result ? '✓' : '✗'} ${name}`);
        if (result) passed++;
    });
    
    const total = Object.keys(results).length;
    const percentage = Math.round((passed / total) * 100);
    
    console.log(`\n  Total: ${passed}/${total} tests passed (${percentage}%)`);
    
    if (passed === total) {
        console.log('\n  🎉 All tests passed! GDT Export is ready for DSB review.\n');
    } else {
        console.log('\n  ⚠️  Some tests failed. Please review the implementation.\n');
    }
    
    return results;
}

// Auto-run tests
console.log('Run runAllTests() to execute all tests.\n');

// Export for manual testing
window.gdtTests = {
    runAll: runAllTests,
    testGDTFieldFormatting,
    testDateFormatting,
    testPseudonymization,
    testGDTContentGeneration,
    testConfigManagement,
    testAuditLogging,
    testConsentRecordCreation,
    testProcessingRecord,
    testDPIATemplate
};
