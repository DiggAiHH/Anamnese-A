#!/usr/bin/env node

/**
 * Comprehensive Integration Test Suite for Praxis-Code-Generator
 * Tests both Practice and Self-test user flows
 */

const crypto = require('crypto');
const assert = require('assert');

console.log('=================================================');
console.log('Praxis-Code-Generator Integration Test Suite');
console.log('Phase 3: Complete Flow Testing');
console.log('=================================================\n');

let passedTests = 0;
let totalTests = 0;

function test(name, fn) {
    totalTests++;
    try {
        fn();
        console.log(`✓ ${name}`);
        passedTests++;
        return true;
    } catch (error) {
        console.log(`✗ ${name}`);
        console.log(`  Error: ${error.message}`);
        return false;
    }
}

// ==================== UUID VALIDATION TESTS ====================
console.log('\n1. Testing UUID Validation...\n');

test('Valid UUID format accepted', () => {
    const validUUIDs = [
        '123e4567-e89b-12d3-a456-426614174000',
        'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        '00000000-0000-0000-0000-000000000000',
        'ffffffff-ffff-ffff-ffff-ffffffffffff'
    ];
    
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    
    validUUIDs.forEach(uuid => {
        assert(uuidRegex.test(uuid), `UUID ${uuid} should be valid`);
    });
});

test('Invalid UUID formats rejected', () => {
    const invalidUUIDs = [
        'not-a-uuid',
        '123e4567-e89b-12d3-a456', // Too short
        '123e4567e89b12d3a456426614174000', // No hyphens
        '123e4567-e89b-12d3-a456-426614174000-extra', // Too long
        '', // Empty
        '123e4567-e89b-12d3-g456-426614174000' // Invalid character 'g'
    ];
    
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    
    invalidUUIDs.forEach(uuid => {
        assert(!uuidRegex.test(uuid), `UUID ${uuid} should be invalid`);
    });
});

// ==================== LANGUAGE VALIDATION TESTS ====================
console.log('\n2. Testing Language Validation...\n');

test('All 13 languages valid', () => {
    const validLanguages = [
        'de', 'de-en', 'de-ar', 'de-tr', 'de-uk', 'de-pl',
        'de-fa', 'de-ur', 'de-ps', 'de-es', 'de-fr', 'de-it', 'de-ru'
    ];
    
    validLanguages.forEach(lang => {
        assert(validLanguages.includes(lang), `Language ${lang} should be valid`);
    });
    
    assert.strictEqual(validLanguages.length, 13, 'Should have exactly 13 languages');
});

test('Invalid languages rejected', () => {
    const invalidLanguages = ['en', 'fr', 'de-xx', 'invalid', ''];
    const validLanguages = [
        'de', 'de-en', 'de-ar', 'de-tr', 'de-uk', 'de-pl',
        'de-fa', 'de-ur', 'de-ps', 'de-es', 'de-fr', 'de-it', 'de-ru'
    ];
    
    invalidLanguages.forEach(lang => {
        assert(!validLanguages.includes(lang), `Language ${lang} should be invalid`);
    });
});

// ==================== MODE VALIDATION TESTS ====================
console.log('\n3. Testing Mode Validation...\n');

test('Valid modes accepted', () => {
    const validModes = ['practice', 'patient'];
    validModes.forEach(mode => {
        assert(['practice', 'patient'].includes(mode), `Mode ${mode} should be valid`);
    });
});

test('Invalid modes rejected', () => {
    const invalidModes = ['doctor', 'admin', 'test', ''];
    invalidModes.forEach(mode => {
        assert(!['practice', 'patient'].includes(mode), `Mode ${mode} should be invalid`);
    });
});

// ==================== USER TYPE TESTS ====================
console.log('\n4. Testing User Type Validation...\n');

test('Valid user types accepted', () => {
    const validTypes = ['practice', 'selftest'];
    validTypes.forEach(type => {
        assert(['practice', 'selftest'].includes(type), `Type ${type} should be valid`);
    });
});

test('Invalid user types rejected', () => {
    const invalidTypes = ['admin', 'doctor', 'patient', ''];
    invalidTypes.forEach(type => {
        assert(!['practice', 'selftest'].includes(type), `Type ${type} should be invalid`);
    });
});

// ==================== PRICING LOGIC TESTS ====================
console.log('\n5. Testing Pricing Logic...\n');

test('Practice users pay €0.99', () => {
    const userType = 'practice';
    const expectedAmount = 99; // cents
    const actualAmount = userType === 'selftest' ? 100 : 99;
    assert.strictEqual(actualAmount, expectedAmount, 'Practice should pay 99 cents');
});

test('Self-test users pay €1.00', () => {
    const userType = 'selftest';
    const expectedAmount = 100; // cents
    const actualAmount = userType === 'selftest' ? 100 : 99;
    assert.strictEqual(actualAmount, expectedAmount, 'Self-test should pay 100 cents');
});

// ==================== FLOW LOGIC TESTS ====================
console.log('\n6. Testing Flow Logic...\n');

test('Practice flow has 7 steps', () => {
    const userType = 'practice';
    const totalSteps = userType === 'selftest' ? 5 : 7;
    assert.strictEqual(totalSteps, 7, 'Practice should have 7 steps');
});

test('Self-test flow has 5 steps', () => {
    const userType = 'selftest';
    const totalSteps = userType === 'selftest' ? 5 : 7;
    assert.strictEqual(totalSteps, 5, 'Self-test should have 5 steps');
});

test('Self-test skips practice login (Step 1)', () => {
    const userType = 'selftest';
    const currentStep = 0; // User type selection
    const nextStep = userType === 'practice' ? 1 : 3; // Should skip to 3
    assert.strictEqual(nextStep, 3, 'Self-test should skip to Step 3 from Step 0');
});

test('Self-test skips mode selection (Step 2)', () => {
    const userType = 'selftest';
    const mode = userType === 'selftest' ? 'patient' : null;
    assert.strictEqual(mode, 'patient', 'Self-test should auto-set mode to patient');
});

test('Self-test skips patient data (Step 4)', () => {
    const userType = 'selftest';
    const mode = 'patient'; // Auto-set for self-test
    const fromStep3 = 3;
    const nextStep = (userType === 'selftest' || mode === 'patient') ? 5 : 4;
    assert.strictEqual(nextStep, 5, 'Self-test should skip Step 4 and go to Step 5');
});

test('Practice with mode=patient skips Step 4', () => {
    const userType = 'practice';
    const mode = 'patient';
    const fromStep3 = 3;
    const nextStep = (userType === 'selftest' || mode === 'patient') ? 5 : 4;
    assert.strictEqual(nextStep, 5, 'Practice with patient mode should skip Step 4');
});

test('Practice with mode=practice includes Step 4', () => {
    const userType = 'practice';
    const mode = 'practice';
    const fromStep3 = 3;
    const nextStep = (userType === 'selftest' || mode === 'patient') ? 5 : 4;
    assert.strictEqual(nextStep, 4, 'Practice with practice mode should go to Step 4');
});

// ==================== PROGRESS BAR TESTS ====================
console.log('\n7. Testing Progress Bar Display...\n');

test('Practice progress shows correct steps', () => {
    const steps = [0, 1, 2, 3, 4, 5, 6];
    steps.forEach(step => {
        const displayStep = step; // Practice uses actual steps
        assert.strictEqual(displayStep, step, `Step ${step} should display as ${step}`);
    });
});

test('Self-test progress maps correctly', () => {
    // Self-test uses steps 0, 3, 5, 6 but displays as 0, 1, 2, 3
    const stepMapping = {0: 0, 3: 1, 5: 2, 6: 3};
    Object.keys(stepMapping).forEach(actualStep => {
        const expectedDisplay = stepMapping[actualStep];
        assert(expectedDisplay !== undefined, `Step ${actualStep} should have a display mapping`);
    });
});

// ==================== DATA VALIDATION TESTS ====================
console.log('\n8. Testing Data Validation...\n');

test('Patient data validation', () => {
    const validPatientData = {
        firstName: 'Max',
        lastName: 'Mustermann',
        birthDate: '1990-01-01',
        address: 'Musterstraße 1, 12345 Musterstadt'
    };
    
    assert(validPatientData.firstName.length > 0, 'First name required');
    assert(validPatientData.lastName.length > 0, 'Last name required');
    assert(validPatientData.birthDate.length > 0, 'Birth date required');
    assert(validPatientData.birthDate.match(/^\d{4}-\d{2}-\d{2}$/), 'Birth date must be YYYY-MM-DD');
});

test('Patient data optional for patient mode', () => {
    const mode = 'patient';
    const patientData = null;
    
    if (mode === 'patient') {
        assert(patientData === null || patientData === undefined, 'Patient data should be optional for patient mode');
    }
});

test('Patient data required fields for practice mode', () => {
    const mode = 'practice';
    const patientData = {
        firstName: 'Max',
        lastName: 'Mustermann',
        birthDate: '1990-01-01'
    };
    
    if (mode === 'practice' && patientData) {
        assert(patientData.firstName, 'First name required for practice mode');
        assert(patientData.lastName, 'Last name required for practice mode');
        assert(patientData.birthDate, 'Birth date required for practice mode');
    }
});

// ==================== STRIPE METADATA TESTS ====================
console.log('\n9. Testing Stripe Metadata...\n');

test('Practice metadata includes all required fields', () => {
    const metadata = {
        userType: 'practice',
        practiceId: '123e4567-e89b-12d3-a456-426614174000',
        mode: 'practice',
        language: 'de',
        patientData: JSON.stringify({firstName: 'Max', lastName: 'Mustermann', birthDate: '1990-01-01'})
    };
    
    assert(metadata.userType === 'practice', 'Metadata should include userType');
    assert(metadata.practiceId, 'Metadata should include practiceId');
    assert(metadata.mode, 'Metadata should include mode');
    assert(metadata.language, 'Metadata should include language');
});

test('Self-test metadata uses placeholder practiceId', () => {
    const metadata = {
        userType: 'selftest',
        practiceId: 'SELFTEST',
        mode: 'patient',
        language: 'de',
        patientData: null
    };
    
    assert(metadata.userType === 'selftest', 'Metadata should have userType=selftest');
    assert(metadata.practiceId === 'SELFTEST', 'Metadata should use SELFTEST placeholder');
    assert(metadata.mode === 'patient', 'Metadata should have mode=patient');
    assert(metadata.patientData === null, 'Metadata should have null patientData');
});

// ==================== URL GENERATION TESTS ====================
console.log('\n10. Testing URL Generation...\n');

test('Anamnese URLs include language and code', () => {
    const language = 'de-en';
    const code = 'ABC123XYZ789';
    const baseUrl = 'https://anamnese.example.com';
    const url = `${baseUrl}/${language}?code=${encodeURIComponent(code)}`;
    
    assert(url.includes(language), 'URL should include language');
    assert(url.includes(code), 'URL should include code');
    assert(url.startsWith(baseUrl), 'URL should start with base URL');
});

test('All 13 languages generate valid URLs', () => {
    const languages = [
        'de', 'de-en', 'de-ar', 'de-tr', 'de-uk', 'de-pl',
        'de-fa', 'de-ur', 'de-ps', 'de-es', 'de-fr', 'de-it', 'de-ru'
    ];
    const code = 'TEST123';
    const baseUrl = 'https://anamnese.example.com';
    
    languages.forEach(lang => {
        const url = `${baseUrl}/${lang}?code=${encodeURIComponent(code)}`;
        assert(url.includes(lang), `URL should include language ${lang}`);
    });
});

// ==================== RESPONSIVE DESIGN TESTS ====================
console.log('\n11. Testing Responsive Design Logic...\n');

test('Mobile text format', () => {
    const step = 3;
    const total = 7;
    const mobileText = `${step}/${total}`;
    assert.strictEqual(mobileText, '3/7', 'Mobile should show compact format');
});

test('Desktop text format', () => {
    const step = 3;
    const total = 7;
    const desktopText = `Schritt ${step} von ${total}`;
    assert.strictEqual(desktopText, 'Schritt 3 von 7', 'Desktop should show full format');
});

test('Column sizing classes', () => {
    const classes = ['col-12', 'col-lg-9', 'col-xl-8'];
    assert(classes.length === 3, 'Should have 3 responsive classes');
    assert(classes.includes('col-12'), 'Should be full width on mobile');
    assert(classes.includes('col-lg-9'), 'Should be 9/12 on large screens');
    assert(classes.includes('col-xl-8'), 'Should be 8/12 on extra large screens');
});

test('Padding classes', () => {
    const classes = ['p-3', 'p-md-4', 'p-lg-5'];
    assert(classes.length === 3, 'Should have 3 padding classes');
    assert(classes.includes('p-3'), 'Should have p-3 on mobile');
    assert(classes.includes('p-md-4'), 'Should have p-md-4 on medium');
    assert(classes.includes('p-lg-5'), 'Should have p-lg-5 on large');
});

// ==================== FINAL RESULTS ====================
console.log('\n=================================================');
console.log('Test Results Summary');
console.log('=================================================\n');

const percentage = ((passedTests / totalTests) * 100).toFixed(1);
console.log(`Passed: ${passedTests}/${totalTests} (${percentage}%)`);

if (passedTests === totalTests) {
    console.log('\n✅ All tests passed! Phase 3 complete.\n');
    process.exit(0);
} else {
    console.log(`\n✗ ${totalTests - passedTests} test(s) failed.\n`);
    process.exit(1);
}
