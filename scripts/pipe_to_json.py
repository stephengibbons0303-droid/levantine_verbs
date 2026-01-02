#!/usr/bin/env python3
"""
Parse pipe-delimited verb data (from NotebookLM) into JSON format.

Expected input format:
VERB|number|arabic|translit|english|classification
PERFECT|person|translit|arabic
... (8 persons)
IMPERFECT|person|translit|arabic
... (8 persons)
BI_IMPERFECT|person|translit|arabic
... (8 persons)
IMPERATIVE|person|translit|arabic (or IMPERATIVE|NONE)
... (3 persons)
PARTICIPLE|gender|translit|arabic (or PARTICIPLE|NONE)
... (3 genders: m, f, pl)
NOTE|text
---
"""

import json
import re


EXPECTED_PERSONS = ['ana', 'nihna', 'inta', 'inti', 'intu', 'huwwe', 'hiyye', 'hinne']
IMPERATIVE_PERSONS = ['inta', 'inti', 'intu']
PARTICIPLE_GENDERS = ['m', 'f', 'pl']


def get_english_translation(person, verb_english, tense):
    """Generate English translation for conjugation."""
    person_subjects = {
        'ana': 'I', 'nihna': 'we', 'inta': 'you (m)', 'inti': 'you (f)',
        'intu': 'you (pl)', 'huwwe': 'he', 'hiyye': 'she', 'hinne': 'they'
    }

    verb = verb_english.replace('to ', '')
    subject = person_subjects.get(person, person)

    # Common irregular past tenses
    irregular_past = {
        'take': 'took', 'come': 'came', 'eat': 'ate', 'sell': 'sold',
        'leave': 'left', 'begin': 'began', 'say': 'said', 'be said': 'was said',
        'go': 'went', 'see': 'saw', 'give': 'gave', 'know': 'knew',
        'make': 'made', 'find': 'found', 'think': 'thought', 'tell': 'told',
        'become': 'became', 'feel': 'felt', 'bring': 'brought', 'write': 'wrote',
        'sit': 'sat', 'stand': 'stood', 'lose': 'lost', 'pay': 'paid',
        'meet': 'met', 'run': 'ran', 'send': 'sent', 'build': 'built',
        'fall': 'fell', 'cut': 'cut', 'drive': 'drove', 'read': 'read',
        'grow': 'grew', 'keep': 'kept', 'hold': 'held', 'hear': 'heard',
        'let': 'let', 'put': 'put', 'show': 'showed', 'speak': 'spoke',
        'buy': 'bought', 'lead': 'led', 'understand': 'understood',
        'watch': 'watched', 'follow': 'followed', 'stop': 'stopped',
        'create': 'created', 'talk': 'talked', 'turn': 'turned',
        'start': 'started', 'move': 'moved', 'play': 'played',
        'live': 'lived', 'believe': 'believed', 'help': 'helped',
        'ask': 'asked', 'change': 'changed', 'work': 'worked',
        'like': 'liked', 'want': 'wanted', 'need': 'needed',
        'try': 'tried', 'use': 'used', 'call': 'called',
        'love': 'loved', 'learn': 'learned', 'phone': 'phoned',
        'treat': 'treated', 'hope': 'hoped', 'avoid': 'avoided',
        'err': 'erred', 'have lunch': 'had lunch', 'have breakfast': 'had breakfast',
        'have dinner': 'had dinner',
    }

    if tense == 'perfect':
        past = irregular_past.get(verb, verb + 'ed' if not verb.endswith('e') else verb + 'd')
        return f"{subject} {past}"
    elif tense == 'imperfect':
        return f"{subject} {verb}"
    elif tense == 'bi_imperfect':
        if person in ['huwwe', 'hiyye'] and not verb.endswith('s'):
            return f"{subject} {verb}s" if not verb.endswith('e') else f"{subject} {verb}s"
        return f"{subject} {verb}"
    elif tense == 'imperative':
        labels = {'inta': 'm', 'inti': 'f', 'intu': 'pl'}
        return f"{verb}! ({labels.get(person, '')})"

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

    negative_forms = []
    for form in forms:
        negative_forms.append({
            'person': form['person'],
            'arabic': f"ما {form['full_arabic']}",
            'translit': f"ma {form['full_translit']}",
            'english': form['english'].replace('want to', "don't want to")
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


def parse_classification(class_str):
    """Parse classification like 'irregular measure I' or 'sound measure II'"""
    match = re.match(r'(.+?)\s+measure\s+(\w+)', class_str)
    if match:
        verb_type, measure = match.groups()
        return {'type': verb_type.strip(), 'measure': measure}
    return {'type': class_str, 'measure': 'I'}


def extract_root(arabic_verb):
    """Extract root letters from Arabic verb."""
    vowels = 'َُِّْٰٓۤىآأإؤئءًٌٍ'
    consonants = [c for c in arabic_verb if c not in vowels]
    if len(consonants) >= 3:
        return '-'.join(consonants[:3])
    return '-'.join(consonants)


def parse_pipe_content(content):
    """
    Parse pipe-delimited content and return list of verb dicts.

    Returns:
        tuple: (list of valid verbs, list of skipped verb reports)
    """
    lines = content.strip().split('\n')
    verbs = []
    skipped = []

    current_verb = None
    current_data = {
        'perfect': [], 'imperfect': [], 'bi_imperfect': [],
        'imperative': [], 'participle': [], 'notes': []
    }

    def finalize_verb():
        nonlocal current_verb, current_data
        if current_verb is None:
            return

        issues = []

        # Check completeness
        for tense in ['perfect', 'imperfect', 'bi_imperfect']:
            if len(current_data[tense]) != 8:
                issues.append(f"{tense}: {len(current_data[tense])}/8 forms")

        if not current_data['imperative'] and current_data['imperative'] != 'NONE':
            issues.append("imperative: missing")
        elif current_data['imperative'] != 'NONE' and len(current_data['imperative']) != 3:
            issues.append(f"imperative: {len(current_data['imperative'])}/3 forms")

        if not current_data['participle'] and current_data['participle'] != 'NONE':
            issues.append("participle: missing")
        elif current_data['participle'] != 'NONE' and len(current_data['participle']) != 3:
            issues.append(f"participle: {len(current_data['participle'])}/3 forms")

        if issues:
            skipped.append({
                'id': current_verb['id'],
                'arabic': current_verb['arabic'],
                'english': current_verb['english'],
                'issues': issues
            })
            current_verb = None
            current_data = {
                'perfect': [], 'imperfect': [], 'bi_imperfect': [],
                'imperative': [], 'participle': [], 'notes': []
            }
            return

        # Build full verb JSON
        classification = parse_classification(current_verb['classification'])
        verb_english = current_verb['english']

        def build_forms(forms_list, tense):
            return [
                {
                    'person': f['person'],
                    'arabic': f['arabic'],
                    'translit': f['translit'],
                    'english': get_english_translation(f['person'], verb_english, tense)
                }
                for f in forms_list
            ]

        def build_imperative_forms(forms_list):
            if forms_list == 'NONE':
                return []
            verb = verb_english.replace('to ', '')
            labels = {'inta': 'm', 'inti': 'f', 'intu': 'pl'}
            return [
                {
                    'person': f['person'],
                    'arabic': f['arabic'],
                    'translit': f['translit'],
                    'english': f"{verb}! ({labels.get(f['person'], '')})"
                }
                for f in forms_list
            ]

        def build_participle_forms(forms_list):
            if forms_list == 'NONE':
                return {}
            verb = verb_english.replace('to ', '')
            gender_map = {'m': 'masculine', 'f': 'feminine', 'pl': 'plural'}
            result = {}
            for f in forms_list:
                gender = gender_map.get(f['gender'], f['gender'])
                suffix = f['gender'][0] if f['gender'] != 'pl' else 'pl'
                result[gender] = {
                    'arabic': f['arabic'],
                    'translit': f['translit'],
                    'english': f"{verb}ing ({suffix})"
                }
            return result

        # Build negation examples
        perf_form = current_data['perfect'][0] if current_data['perfect'] else {'arabic': '', 'translit': ''}
        bi_form = current_data['bi_imperfect'][0] if current_data['bi_imperfect'] else {'arabic': '', 'translit': ''}
        impf_form = current_data['imperfect'][0] if current_data['imperfect'] else {'arabic': '', 'translit': ''}
        verb_base = verb_english.replace('to ', '')

        verb_json = {
            'id': current_verb['id'],
            'verb': {
                'arabic': current_verb['arabic'],
                'translit': current_verb['translit'],
                'english': verb_english
            },
            'classification': {
                'measure': classification['measure'],
                'type': classification['type'],
                'root': extract_root(current_verb['arabic'])
            },
            'negation': {
                'particle': 'ما',
                'translit': 'ma',
                'position': 'before verb or particle',
                'examples': {
                    'perfect': f"ما {perf_form['arabic']} (ma {perf_form['translit']}) - I didn't {verb_base}",
                    'bi_imperfect': f"ما {bi_form['arabic']} (ma {bi_form['translit']}) - I don't {verb_base}",
                    'future': f"ما رح {impf_form['arabic']} (ma raḥ {impf_form['translit']}) - I won't {verb_base}"
                }
            },
            'conjugations': {
                'perfect': {
                    'label': 'Past',
                    'usage': 'Completed actions',
                    'forms': build_forms(current_data['perfect'], 'perfect')
                },
                'imperfect': {
                    'label': 'Subjunctive/Base',
                    'usage': 'Used with particles (bedde, raḥ, 3am, la-, etc.)',
                    'forms': build_forms(current_data['imperfect'], 'imperfect')
                },
                'bi_imperfect': {
                    'label': 'Habitual Present',
                    'usage': 'Regular/habitual actions, general truths',
                    'forms': build_forms(current_data['bi_imperfect'], 'bi_imperfect')
                },
                'imperative': {
                    'label': 'Command',
                    'usage': 'Direct commands',
                    'forms': build_imperative_forms(current_data['imperative'])
                }
            },
            'bedde': build_bedde_forms(current_data['imperfect'], verb_english),
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
                'forms': build_participle_forms(current_data['participle'])
            },
            'notes': current_data['notes'],
            'examples': []
        }

        verbs.append(verb_json)

        # Reset for next verb
        current_verb = None
        current_data = {
            'perfect': [], 'imperfect': [], 'bi_imperfect': [],
            'imperative': [], 'participle': [], 'notes': []
        }

    for line in lines:
        line = line.strip()
        if not line:
            continue

        if line == '---':
            finalize_verb()
            continue

        parts = line.split('|')
        if len(parts) < 2:
            continue

        line_type = parts[0].upper()

        if line_type == 'VERB':
            # Finalize previous verb if exists
            if current_verb:
                finalize_verb()

            # VERB|number|arabic|translit|english|classification
            if len(parts) >= 6:
                current_verb = {
                    'id': int(parts[1]) if parts[1].isdigit() else len(verbs) + 1,
                    'arabic': parts[2],
                    'translit': parts[3],
                    'english': parts[4],
                    'classification': parts[5]
                }

        elif line_type == 'PERFECT' and current_verb:
            if len(parts) >= 4:
                current_data['perfect'].append({
                    'person': parts[1].lower(),
                    'translit': parts[2],
                    'arabic': parts[3]
                })

        elif line_type == 'IMPERFECT' and current_verb:
            if len(parts) >= 4:
                current_data['imperfect'].append({
                    'person': parts[1].lower(),
                    'translit': parts[2],
                    'arabic': parts[3]
                })

        elif line_type == 'BI_IMPERFECT' and current_verb:
            if len(parts) >= 4:
                current_data['bi_imperfect'].append({
                    'person': parts[1].lower(),
                    'translit': parts[2],
                    'arabic': parts[3]
                })

        elif line_type == 'IMPERATIVE' and current_verb:
            if len(parts) >= 2 and parts[1].upper() == 'NONE':
                current_data['imperative'] = 'NONE'
            elif len(parts) >= 4:
                if current_data['imperative'] != 'NONE':
                    current_data['imperative'].append({
                        'person': parts[1].lower(),
                        'translit': parts[2],
                        'arabic': parts[3]
                    })

        elif line_type == 'PARTICIPLE' and current_verb:
            if len(parts) >= 2 and parts[1].upper() == 'NONE':
                current_data['participle'] = 'NONE'
            elif len(parts) >= 4:
                if current_data['participle'] != 'NONE':
                    current_data['participle'].append({
                        'gender': parts[1].lower(),
                        'translit': parts[2],
                        'arabic': parts[3]
                    })

        elif line_type == 'NOTE' and current_verb:
            if len(parts) >= 2:
                current_data['notes'].append(parts[1])

    # Finalize last verb
    if current_verb:
        finalize_verb()

    return verbs, skipped


def parse_pipe_file(filepath):
    """Parse a pipe-delimited file."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    return parse_pipe_content(content)


if __name__ == '__main__':
    import argparse

    parser = argparse.ArgumentParser(description='Convert pipe-delimited verb data to JSON')
    parser.add_argument('input', help='Input file')
    parser.add_argument('--output', '-o', help='Output JSON file')

    args = parser.parse_args()

    verbs, skipped = parse_pipe_file(args.input)

    print(f"Parsed {len(verbs)} verbs successfully")
    if skipped:
        print(f"Skipped {len(skipped)} verbs due to incomplete data:")
        for s in skipped:
            print(f"  - {s['id']}. {s['arabic']} ({s['english']}): {', '.join(s['issues'])}")

    if args.output:
        with open(args.output, 'w', encoding='utf-8') as f:
            json.dump(verbs, f, ensure_ascii=False, indent=2)
        print(f"Wrote to {args.output}")
    else:
        print(json.dumps(verbs, ensure_ascii=False, indent=2))
