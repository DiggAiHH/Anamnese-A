#!/usr/bin/env python3
"""
FRAGEBOGEN-VALIDATOR & COMPREHENSIVE TEST SUITE
============================================
DSGVO-konform | HISTORY-AWARE | PHASE 5 EXECUTION
"""

import json
import re
from pathlib import Path

def count_questions_in_app_data():
    """
    Analysiere index.html und zähle alle Fragen in APP_DATA.sections
    """
    index_file = Path("/workspaces/Anamnese-A/app-v8-complete/index.html")
    
    if not index_file.exists():
        print(f"❌ File not found: {index_file}")
        return {}
    
    content = index_file.read_text(encoding='utf-8')
    
    # Find APP_DATA.sections array
    pattern_appdata = r'const\s+APP_DATA\s*=\s*\{[\s\S]*?sections:\s*\[([\s\S]*?)\]\s*\};'
    match = re.search(pattern_appdata, content)
    
    if not match:
        # Try alternative pattern
        pattern_alt = r'APP_DATA\s*=\s*\{[\s\S]*?sections:\s*\[([\s\S]*?)(?=\n\s*(?:translations|const|var|let|<\/script))' 
        match = re.search(pattern_alt, content)
    
    if not match:
        print("❌ APP_DATA.sections not found!")
        return {}
    
    sections_text = match.group(1) if match else ""
    
    # Count sections (each starts with `{`)
    section_starts = re.findall(r'\{\s*id:\s*["\']([^"\']+)["\']', sections_text)
    
    # Count questions within sections
    questions_pattern = r'questions:\s*\[[\s\S]*?\]'
    questions_blocks = re.findall(questions_pattern, sections_text)
    
    # Count individual question objects
    total_questions = 0
    questions_per_section = {}
    
    for block in questions_blocks:
        # Count question objects (each starts with `{` or `{id:`)
        question_objects = re.findall(r'\{\s*id:\s*["\']([^"\']+)["\']', block)
        total_questions += len(question_objects)
        
    print(f"\n{'='*70}")
    print(f"📊 FRAGEBOGEN-AUDIT: Anamnese-A V8 Complete")
    print(f"{'='*70}")
    print(f"📁 Datei: {index_file.name}")
    print(f"📏 Größe: {len(content):,} Zeichen")
    print(f"\n🔍 ANALYSE-ERGEBNISSE:")
    print(f"   Sections gefunden: {len(section_starts)}")
    print(f"   Questions blocks: {len(questions_blocks)}")
    print(f"   Geschätzte Fragen: ~{total_questions}")
    
    # Try more accurate count
    all_question_ids = re.findall(r'\{\s*id:\s*["\']([^"\']+)["\'][\s\S]*?type:\s*["\']([^"\']+)["\']', sections_text)
    
    print(f"\n✅ GENAUERE ZÄHLUNG:")
    print(f"   Fragen mit ID+Type: {len(all_question_ids)}")
    
    # Analyze question types
    question_types = {}
    for qid, qtype in all_question_ids:
        question_types[qtype] = question_types.get(qtype, 0) + 1
    
    print(f"\n📋 FRAGE-TYPEN:")
    for qtype, count in sorted(question_types.items(), key=lambda x: -x[1]):
        print(f"   {qtype:15s}: {count:3d} Fragen")
    
    return {
        'total_questions': len(all_question_ids),
        'total_sections': len(section_starts),
        'question_types': question_types,
        'sample_ids': [qid for qid, _ in all_question_ids[:10]]
    }


def check_translations():
    """
    Prüfe alle Übersetzungen in APP_DATA.translations
    """
    index_file = Path("/workspaces/Anamnese-A/app-v8-complete/index.html")
    content = index_file.read_text(encoding='utf-8')
    
    # Find translations object
    pattern = r'translations:\s*\{([\s\S]*?)\}\s*,?\s*sections:'
    match = re.search(pattern, content)
    
    if not match:
        print("\n❌ Translations not found!")
        return {}
    
    trans_text = match.group(1)
    
    # Find language keys (de, en, fr, es, etc.)
    lang_pattern = r'([a-z]{2}):\s*\{'
    languages = re.findall(lang_pattern, trans_text)
    
    print(f"\n{'='*70}")
    print(f"🌍 SPRACHEN-AUDIT:")
    print(f"{'='*70}")
    print(f"Gefundene Sprachen: {', '.join(languages)}")
    print(f"Anzahl: {len(languages)} Sprachen")
    
    # Check if all required languages are present
    required_langs = ['de', 'en', 'fr', 'es', 'it', 'tr', 'pl', 'ru', 'ar', 'zh', 
                     'pt', 'nl', 'uk', 'fa', 'ur', 'sq', 'ro', 'hi', 'ja']
    
    missing = [lang for lang in required_langs if lang not in languages]
    extra = [lang for lang in languages if lang not in required_langs]
    
    if missing:
        print(f"\n⚠️  FEHLENDE SPRACHEN: {', '.join(missing)}")
    if extra:
        print(f"\n✨ ZUSÄTZLICHE SPRACHEN: {', '.join(extra)}")
    
    if not missing:
        print(f"\n✅ Alle 19 Sprachen vorhanden!")
    
    return {
        'languages': languages,
        'total': len(languages),
        'missing': missing,
        'complete': len(missing) == 0
    }


def comprehensive_test_suite():
    """
    Führe alle Tests durch
    """
    print("\n" + "="*70)
    print("🧪 COMPREHENSIVE TEST SUITE - Anamnese-A V8 Complete")
    print("="*70)
    
    # Test 1: Fragebogen-Vollständigkeit
    question_audit = count_questions_in_app_data()
    
    # Test 2: Sprachen-Vollständigkeit
    lang_audit = check_translations()
    
    # Test 3: Erwartete Anzahl
    expected_min = 250
    actual = question_audit.get('total_questions', 0)
    
    print(f"\n{'='*70}")
    print(f"🎯 FINAL ASSESSMENT:")
    print(f"{'='*70}")
    print(f"Erwartete Fragen (min): {expected_min}")
    print(f"Gefundene Fragen:        {actual}")
    
    if actual >= expected_min:
        print(f"✅ STATUS: BESTANDEN ({actual}/{expected_min})")
    elif actual >= expected_min * 0.9:  # 90% threshold
        print(f"⚠️  STATUS: FAST VOLLSTÄNDIG ({actual}/{expected_min}) - {expected_min - actual} fehlen")
    else:
        print(f"❌ STATUS: UNVOLLSTÄNDIG ({actual}/{expected_min}) - {expected_min - actual} fehlen")
    
    # Summary
    summary = {
        'questions': {
            'total': actual,
            'expected': expected_min,
            'passed': actual >= expected_min,
            'types': question_audit.get('question_types', {})
        },
        'languages': {
            'total': lang_audit.get('total', 0),
            'expected': 19,
            'passed': lang_audit.get('complete', False),
            'missing': lang_audit.get('missing', [])
        }
    }
    
    # Save results
    result_file = Path("/workspaces/Anamnese-A/app-v8-complete/docs/FRAGEBOGEN_AUDIT_RESULTS.json")
    result_file.parent.mkdir(parents=True, exist_ok=True)
    result_file.write_text(json.dumps(summary, indent=2, ensure_ascii=False))
    
    print(f"\n💾 Ergebnisse gespeichert: {result_file}")
    
    return summary


if __name__ == "__main__":
    comprehensive_test_suite()
