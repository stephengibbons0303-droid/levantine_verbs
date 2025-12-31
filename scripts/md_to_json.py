#!/usr/bin/env python3
"""
Convert Levantine Arabic verb markdown files to JSON format.

Usage:
    python md_to_json.py input.md [--output output.json] [--start-id 1]
"""

import re
import json
import argparse
from pathlib import Path


def parse_verb_header(header_line):
    """Parse verb header like: ## 2. أخَذ — *irregular measure I* — **to take**"""
    match = re.match(
        r'##\s*(\d+)\.\s*(\S+)\s*—\s*\*([^*]+)\*\s*—\s*\*\*(.+)\*\*',
        header_line
    )
    if match:
        num, arabic, classification, english = match.groups()
        return {
            'id': int(num),
            'arabic': arabic,
            'classification': classification.strip(),
            'english': english.strip()
        }
    return None


def parse_classification(class_str):
    """Parse classification like 'irregular measure I' or 'sound measure II'"""
    match = re.match(r'(.+?)\s+measure\s+(\w+)', class_str)
    if match:
        verb_type, measure = match.groups()
        return {'type': verb_type.strip(), 'measure': measure}
    return {'type': class_str, 'measure': 'I'}


def extract_root(arabic_verb, verb_type):
    """Extract root letters from Arabic verb."""
    # Remove common prefixes/affixes and get root consonants
    # This is a simplified extraction - roots are typically 3 consonants
    vowels = 'َُِّْٰٓۤىآأإؤئءً'
    consonants = [c for c in arabic_verb if c not in vowels]
    if len(consonants) >= 3:
        return '-'.join(consonants[:3])
    return '-'.join(consonants)


def parse_conjugation_table(lines, start_idx):
    """Parse a conjugation table and return forms."""
    forms = []
    person_map = {
        'ána': 'ana',
        'níḥna': 'nihna',
        'ínta': 'inta',
        'ínti': 'inti',
        'íntu': 'intu',
        'húwwi': 'huwwe',
        'híyyi': 'hiyye',
        'hínni': 'hinne'
    }

    i = start_idx
    while i < len(lines):
        line = lines[i].strip()
        if not line or line.startswith('|---'):
            i += 1
            continue
        if line.startswith('##') or line.startswith('**'):
            break
        if line.startswith('|'):
            parts = [p.strip() for p in line.split('|')]
            parts = [p for p in parts if p]  # Remove empty strings
            if len(parts) >= 3 and parts[0] in person_map:
                person = person_map[parts[0]]
                # Table format: person | translit | arabic | translit | arabic | translit | arabic
                # We want different columns based on table type
                forms.append({
                    'person': person,
                    'raw_parts': parts[1:]  # Store raw parts for later processing
                })
        i += 1
    return forms, i


def parse_simple_table(lines, start_idx):
    """Parse imperative or participle table."""
    forms = []
    person_map = {
        'ínta': 'inta',
        'ínti': 'inti',
        'íntu': 'intu',
        'masculine': 'masculine',
        'feminine': 'feminine',
        'plural': 'plural'
    }

    i = start_idx
    while i < len(lines):
        line = lines[i].strip()
        if not line or line.startswith('|---'):
            i += 1
            continue
        if line.startswith('##') or line.startswith('**'):
            break
        if line.startswith('|'):
            parts = [p.strip() for p in line.split('|')]
            parts = [p for p in parts if p]
            if len(parts) >= 3 and parts[0] in person_map:
                forms.append({
                    'person': person_map[parts[0]],
                    'translit': parts[1],
                    'arabic': parts[2]
                })
        i += 1
    return forms, i


def parse_verb_section(lines, start_idx):
    """Parse a complete verb section."""
    verb_data = {
        'perfect': [],
        'imperfect': [],
        'bi_imperfect': [],
        'imperative': [],
        'active_participle': [],
        'notes': [],
        'examples': []
    }

    i = start_idx
    current_section = None

    person_map = {
        'ána': 'ana',
        'níḥna': 'nihna',
        'ínta': 'inta',
        'ínti': 'inti',
        'íntu': 'intu',
        'húwwi': 'huwwe',
        'híyyi': 'hiyye',
        'hínni': 'hinne'
    }

    while i < len(lines):
        line = lines[i].strip()

        # Check for next verb section
        if line.startswith('## ') and re.match(r'##\s*\d+\.', line):
            break

        # Check for main conjugation table header
        if '**perfect**' in line and '**imperfect**' in line:
            current_section = 'conjugations'
            i += 1
            continue

        # Check for imperative section
        if '**imperative**' in line.lower():
            current_section = 'imperative'
            i += 1
            continue

        # Check for active participle section
        if '**active participle**' in line.lower():
            current_section = 'participle'
            i += 1
            continue

        # Check for notes
        if line.startswith('**Notes:**'):
            current_section = 'notes'
            i += 1
            continue

        # Check for examples
        if line.startswith('**Example sentences:**'):
            current_section = 'examples'
            i += 1
            continue

        # Parse based on current section
        if current_section == 'conjugations' and line.startswith('|'):
            parts = [p.strip() for p in line.split('|')]
            parts = [p for p in parts if p]
            if len(parts) >= 7 and parts[0] in person_map:
                person = person_map[parts[0]]
                # Format: person | perf_tr | perf_ar | impf_tr | impf_ar | bi_tr | bi_ar
                verb_data['perfect'].append({
                    'person': person,
                    'translit': parts[1],
                    'arabic': parts[2]
                })
                verb_data['imperfect'].append({
                    'person': person,
                    'translit': parts[3],
                    'arabic': parts[4]
                })
                verb_data['bi_imperfect'].append({
                    'person': person,
                    'translit': parts[5],
                    'arabic': parts[6]
                })

        elif current_section == 'imperative' and line.startswith('|'):
            parts = [p.strip() for p in line.split('|')]
            parts = [p for p in parts if p]
            if len(parts) >= 3 and parts[0] in person_map:
                verb_data['imperative'].append({
                    'person': person_map[parts[0]],
                    'translit': parts[1],
                    'arabic': parts[2]
                })

        elif current_section == 'participle' and line.startswith('|'):
            parts = [p.strip() for p in line.split('|')]
            parts = [p for p in parts if p]
            if len(parts) >= 3 and parts[0] in ['masculine', 'feminine', 'plural']:
                verb_data['active_participle'].append({
                    'gender': parts[0],
                    'translit': parts[1],
                    'arabic': parts[2]
                })

        elif current_section == 'notes' and line.startswith('①') or line.startswith('②') or line.startswith('③'):
            note_text = re.sub(r'^[①②③④⑤]\s*', '', line)
            verb_data['notes'].append(note_text)

        elif current_section == 'examples' and line.startswith('-'):
            # Example line
            example_ar = line.lstrip('- ').strip()
            if i + 1 < len(lines) and lines[i + 1].strip().startswith('-'):
                example_en = lines[i + 1].strip().lstrip('- ').strip()
                verb_data['examples'].append({
                    'arabic': example_ar,
                    'english': example_en
                })
                i += 1

        i += 1

    return verb_data, i


def get_english_translation(person, verb_english, tense):
    """Generate English translation for conjugation."""
    person_subjects = {
        'ana': 'I',
        'nihna': 'we',
        'inta': 'you (m)',
        'inti': 'you (f)',
        'intu': 'you (pl)',
        'huwwe': 'he',
        'hiyye': 'she',
        'hinne': 'they'
    }

    # Remove "to " from verb
    verb = verb_english.replace('to ', '')
    subject = person_subjects.get(person, person)

    if tense == 'perfect':
        # Past tense
        if verb == 'come':
            past = 'came'
        elif verb == 'take':
            past = 'took'
        elif verb == 'eat':
            past = 'ate'
        elif verb == 'sell':
            past = 'sold'
        elif verb == 'leave':
            past = 'left'
        elif verb == 'begin':
            past = 'began'
        elif verb == 'become' or verb == 'become / to stay':
            past = 'became/stayed'
        elif verb.endswith('e'):
            past = verb + 'd'
        else:
            past = verb + 'ed'
        return f"{subject} {past}"
    elif tense == 'imperfect':
        return f"{subject} {verb}"
    elif tense == 'bi_imperfect':
        if person in ['huwwe', 'hiyye']:
            if verb.endswith('e'):
                return f"{subject} {verb}s"
            else:
                return f"{subject} {verb}s"
        return f"{subject} {verb}"
    elif tense == 'imperative':
        return f"{verb}! ({person.replace('inta', 'm').replace('inti', 'f').replace('intu', 'pl')})"

    return f"{subject} {verb}"


def build_bedde_forms(imperfect_forms, verb_english):
    """Build the bedde (want to) conjugation forms."""
    bedde_particles = [
        {'person': 'ana', 'particle_arabic': 'بدّي', 'particle_translit': 'béddi'},
        {'person': 'nihna', 'particle_arabic': 'بدّنا', 'particle_translit': 'béddna'},
        {'person': 'inta', 'particle_arabic': 'بدّك', 'particle_translit': 'béddak'},
        {'person': 'inti', 'particle_arabic': 'بدِّك', 'particle_translit': 'béddik'},
        {'person': 'intu', 'particle_arabic': 'بدّكن', 'particle_translit': 'béddkon'},
        {'person': 'huwwe', 'particle_arabic': 'بدّو', 'particle_translit': 'béddo'},
        {'person': 'hiyye', 'particle_arabic': 'بدّا', 'particle_translit': 'bédda'},
        {'person': 'hinne', 'particle_arabic': 'بدّن', 'particle_translit': 'béddon'}
    ]

    verb = verb_english.replace('to ', '')
    person_subjects = {
        'ana': 'I', 'nihna': 'we', 'inta': 'you (m)', 'inti': 'you (f)',
        'intu': 'you (pl)', 'huwwe': 'he', 'hiyye': 'she', 'hinne': 'they'
    }

    forms = []
    impf_map = {f['person']: f for f in imperfect_forms}

    for particle in bedde_particles:
        person = particle['person']
        impf = impf_map.get(person, {})
        forms.append({
            'person': person,
            'particle_arabic': particle['particle_arabic'],
            'particle_translit': particle['particle_translit'],
            'full_arabic': f"{particle['particle_arabic']} {impf.get('arabic', '')}",
            'full_translit': f"{particle['particle_translit']} {impf.get('translit', '')}",
            'english': f"{person_subjects[person]} want to {verb}"
        })

    # Build negative forms
    negative_forms = []
    for form in forms:
        negative_forms.append({
            'person': form['person'],
            'arabic': f"ما {form['full_arabic']}",
            'translit': f"ma {form['full_translit']}",
            'english': form['english'].replace('want to', "don't want to").replace("wants to", "doesn't want to")
        })

    return {
        'label': 'Want to (verb)',
        'usage': 'Expresses desire/want + imperfect verb',
        'note': 'bedde conjugates by person, verb stays in imperfect',
        'forms': forms,
        'negative': {
            'formation': 'ما + bedde conjugation + imperfect verb',
            'forms': negative_forms
        }
    }


def build_verb_json(header_info, verb_data):
    """Build the complete JSON structure for a verb."""
    classification = parse_classification(header_info['classification'])
    root = extract_root(header_info['arabic'], classification['type'])

    verb_english = header_info['english']

    # Build conjugation forms with English translations
    def build_forms(raw_forms, tense):
        return [
            {
                'person': f['person'],
                'arabic': f['arabic'],
                'translit': f['translit'],
                'english': get_english_translation(f['person'], verb_english, tense)
            }
            for f in raw_forms
        ]

    def build_imperative_forms(raw_forms):
        verb = verb_english.replace('to ', '')
        person_labels = {'inta': 'm', 'inti': 'f', 'intu': 'pl'}
        return [
            {
                'person': f['person'],
                'arabic': f['arabic'],
                'translit': f['translit'],
                'english': f"{verb}! ({person_labels.get(f['person'], '')})"
            }
            for f in raw_forms
        ]

    # Build active participle
    participle_forms = {}
    for p in verb_data['active_participle']:
        gender = p['gender']
        participle_forms[gender] = {
            'arabic': p['arabic'],
            'translit': p['translit'],
            'english': f"{verb_english.replace('to ', '')}ing ({gender[0]})" if gender != 'plural' else f"{verb_english.replace('to ', '')}ing (pl)"
        }

    # Build examples
    examples = []
    for ex in verb_data['examples'][:2]:  # Limit to 2 examples
        examples.append({
            'arabic': ex['arabic'],
            'translit': '',  # Would need transliteration
            'english': ex['english'],
            'tense': 'mixed'
        })

    # Build negation examples
    perf_form = verb_data['perfect'][0] if verb_data['perfect'] else {'arabic': '', 'translit': ''}
    bi_form = verb_data['bi_imperfect'][0] if verb_data['bi_imperfect'] else {'arabic': '', 'translit': ''}
    impf_form = verb_data['imperfect'][0] if verb_data['imperfect'] else {'arabic': '', 'translit': ''}

    result = {
        'id': header_info['id'],
        'verb': {
            'arabic': header_info['arabic'],
            'translit': verb_data['perfect'][5]['translit'] if len(verb_data['perfect']) > 5 else '',  # 3rd person masc
            'english': verb_english
        },
        'classification': {
            'measure': classification['measure'],
            'type': classification['type'],
            'root': root
        },
        'negation': {
            'particle': 'ما',
            'translit': 'ma',
            'position': 'before verb or particle',
            'examples': {
                'perfect': f"ما {perf_form['arabic']} (ma {perf_form['translit']}) - I didn't {verb_english.replace('to ', '')}",
                'bi_imperfect': f"ما {bi_form['arabic']} (ma {bi_form['translit']}) - I don't {verb_english.replace('to ', '')}",
                'future': f"ما رح {impf_form['arabic']} (ma raḥ {impf_form['translit']}) - I won't {verb_english.replace('to ', '')}"
            }
        },
        'conjugations': {
            'perfect': {
                'label': 'Past',
                'usage': 'Completed actions',
                'forms': build_forms(verb_data['perfect'], 'perfect')
            },
            'imperfect': {
                'label': 'Subjunctive/Base',
                'usage': 'Used with particles (bedde, raḥ, 3am, la-, etc.)',
                'forms': build_forms(verb_data['imperfect'], 'imperfect')
            },
            'bi_imperfect': {
                'label': 'Habitual Present',
                'usage': 'Regular/habitual actions, general truths',
                'forms': build_forms(verb_data['bi_imperfect'], 'bi_imperfect')
            },
            'imperative': {
                'label': 'Command',
                'usage': 'Direct commands',
                'forms': build_imperative_forms(verb_data['imperative'])
            }
        },
        'bedde': build_bedde_forms(verb_data['imperfect'], verb_english),
        'active_participle': {
            'label': 'Active Participle',
            'usage': {
                'primary': 'Describes current STATE or status, decision made, ongoing relevance',
                'vs_3am': {
                    'summary': 'Participle = state/status; 3am + verb = action in progress',
                    'key_differences': [
                        'Participle: implies decision made, current state',
                        '3am: emphasizes the physical/literal act happening now',
                        "3am can mean 'lately/these days' for habits"
                    ]
                }
            },
            'forms': participle_forms
        },
        'notes': verb_data['notes'] if verb_data['notes'] else [],
        'examples': examples
    }

    return result


def parse_markdown_file(filepath):
    """Parse a markdown file and extract all verbs."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    lines = content.split('\n')
    verbs = []

    i = 0
    while i < len(lines):
        line = lines[i].strip()

        # Look for verb headers
        if line.startswith('## ') and re.match(r'##\s*\d+\.', line):
            header_info = parse_verb_header(line)
            if header_info:
                verb_data, i = parse_verb_section(lines, i + 1)
                verb_json = build_verb_json(header_info, verb_data)
                verbs.append(verb_json)
                continue

        i += 1

    return verbs


def main():
    parser = argparse.ArgumentParser(description='Convert Levantine verb markdown to JSON')
    parser.add_argument('input', help='Input markdown file')
    parser.add_argument('--output', '-o', help='Output JSON file (default: stdout)')
    parser.add_argument('--start-id', type=int, default=None, help='Override starting ID')
    parser.add_argument('--append-to', help='Append to existing JSON file')

    args = parser.parse_args()

    verbs = parse_markdown_file(args.input)

    if args.start_id:
        for i, verb in enumerate(verbs):
            verb['id'] = args.start_id + i

    if args.append_to:
        with open(args.append_to, 'r', encoding='utf-8') as f:
            existing = json.load(f)
        existing.extend(verbs)
        verbs = existing

    output = json.dumps(verbs, ensure_ascii=False, indent=2)

    if args.output:
        with open(args.output, 'w', encoding='utf-8') as f:
            f.write(output)
        print(f"Wrote {len(verbs)} verbs to {args.output}")
    else:
        print(output)


if __name__ == '__main__':
    main()
