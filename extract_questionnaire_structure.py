#!/usr/bin/env python3
"""
Extrahiert die komplette Fragebogenstruktur aus index_v8_complete.html
"""
import json
import re

def extract_sections(html_content):
    """Extrahiert alle Sektionen aus der HTML-Datei"""
    
    # Finde den sections-Array im APP_DATA Objekt
    sections_pattern = r'"sections":\s*\[(.*?)\n\s*\],?\s*"conditional'
    match = re.search(sections_pattern, html_content, re.DOTALL)
    
    if not match:
        print("❌ Sections-Array nicht gefunden!")
        return None
    
    sections_text = '{"sections":[' + match.group(1) + ']}'
    
    try:
        data = json.loads(sections_text)
        return data
    except json.JSONDecodeError as e:
        print(f"❌ JSON Parse Error: {e}")
        return None

def main():
    print("🔍 Lese index_v8_complete.html...")
    
    with open('index_v8_complete.html', 'r', encoding='utf-8') as f:
        html_content = f.read()
    
    print(f"📄 Datei gelesen: {len(html_content):,} Zeichen")
    
    print("⚙️  Extrahiere Sections...")
    data = extract_sections(html_content)
    
    if data:
        sections_count = len(data['sections'])
        print(f"✅ {sections_count} Sektionen extrahiert!")
        
        # Zähle Felder
        total_fields = sum(len(s.get('fields', [])) for s in data['sections'])
        print(f"📊 Insgesamt {total_fields} Felder gefunden")
        
        # Speichere als JSON
        output_file = 'questionnaire_structure.json'
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        
        print(f"💾 Struktur gespeichert in: {output_file}")
        
        # Zeige Übersicht der ersten 10 Sektionen
        print("\n📋 Erste 10 Sektionen:")
        for i, section in enumerate(data['sections'][:10]):
            field_count = len(section.get('fields', []))
            has_condition = 'condition' in section
            print(f"  {i+1}. {section['id']}: {section['title']} ({field_count} Felder{', conditional' if has_condition else ''})")
        
        if sections_count > 10:
            print(f"  ... und {sections_count - 10} weitere Sektionen")
        
        return data
    else:
        return None

if __name__ == '__main__':
    result = main()
    if not result:
        exit(1)
