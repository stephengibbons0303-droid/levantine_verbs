#!/usr/bin/env python3
"""
Import ALPS verbs from Levantine verbs.xlsx into data/verbs.json.

Reads from sheet "verbs" (NOTE: NOT "forms " — that's the template sheet).
Existing 103 verbs are kept as-is with their static conjugations.
New verbs get conjugations: null and will be engine-generated at runtime.
"""

import json
import os
import re
import pandas as pd
from conjugation_engine import extract_root, normalize_form_label

def parse_citation(translit_col):
    """Parse past/present citation from the 'Transliteration (Past/Present)' column.
    Format: 'past (present)' or 'past (bipresent) [prep]'
    """
    if pd.isna(translit_col):
        return None, None
    s = str(translit_col).strip()
    # Extract preposition if present
    s = re.sub(r'\[.*?\]', '', s).strip()
    # Split past and present
    match = re.match(r'^(.+?)\s*\((.+?)\)\s*$', s)
    if match:
        past = match.group(1).strip()
        present = match.group(2).strip()
        # Handle alternatives: "past/alt (present)"
        past = past.split('/')[0].strip()
        return past, present
    # No parentheses — just past form
    return s.split('/')[0].strip(), None


def main():
    xlsx_path = os.path.join(os.path.dirname(__file__), '..', 'Levantine verbs.xlsx')
    data_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'verbs.json')
    xlsx_path = os.path.abspath(xlsx_path)
    data_path = os.path.abspath(data_path)

    # Load existing verbs
    with open(data_path, 'r', encoding='utf-8') as f:
        existing_verbs = json.load(f)
    existing_by_id = {v['id']: v for v in existing_verbs}
    print(f"Existing verbs: {len(existing_verbs)}")

    # Read XLSX verbs sheet
    vdf = pd.read_excel(xlsx_path, sheet_name='verbs')
    print(f"XLSX verbs: {len(vdf)}")

    # Build a lookup of existing verbs by transliteration for cross-referencing
    existing_by_translit = {}
    for v in existing_verbs:
        key = v['verb']['translit'].lower().strip()
        # Strip accents for matching
        import unicodedata
        key_normalized = unicodedata.normalize('NFD', key)
        key_normalized = ''.join(c for c in key_normalized if unicodedata.category(c) != 'Mn')
        existing_by_translit[key_normalized] = v

    next_id = max(v['id'] for v in existing_verbs) + 1
    new_verbs = []
    matched = 0
    skipped = 0

    for _, row in vdf.iterrows():
        past, present = parse_citation(row.get('Transliteration (Past/Present)', ''))
        if not past:
            skipped += 1
            continue

        english = str(row.get('English Meaning', '')).strip()
        form_label = str(row.get('Form', '')).strip()
        level = str(row.get('Level', '')).strip()
        arabic_past = str(row.get('Arabic (Past)', '')).strip() if pd.notna(row.get('Arabic (Past)')) else ''
        arabic_present = str(row.get('Arabic (Present)', '')).strip() if pd.notna(row.get('Arabic (Present)')) else ''

        # Normalize for cross-reference
        import unicodedata
        past_normalized = unicodedata.normalize('NFD', past.lower())
        past_normalized = ''.join(c for c in past_normalized if unicodedata.category(c) != 'Mn')

        # Check if this verb already exists
        if past_normalized in existing_by_translit:
            matched += 1
            continue

        # Extract root letters
        root = extract_root(past, form_label)

        # Determine if form is supported by engine
        normalized_form = normalize_form_label(form_label)

        verb_entry = {
            'id': next_id,
            'verb': {
                'arabic': arabic_past.split('(')[0].split('/')[0].strip() if arabic_past else '',
                'translit': past,
                'english': english,
            },
            'difficulty': level if level else None,
            'form': form_label,
            'conjugations': None,
        }

        if root:
            verb_entry['root_letters'] = root

        if present:
            verb_entry['citation'] = {'past': past, 'present': present}

        new_verbs.append(verb_entry)
        next_id += 1

    print(f"\nMatched to existing: {matched}")
    print(f"Skipped (no citation): {skipped}")
    print(f"New verbs to add: {len(new_verbs)}")

    # Count by form type
    form_counts = {}
    for v in new_verbs:
        f = normalize_form_label(v.get('form', ''))
        key = f if f else 'unsupported'
        form_counts[key] = form_counts.get(key, 0) + 1
    print("\nNew verbs by engine support:")
    for f, c in sorted(form_counts.items()):
        print(f"  {f}: {c}")

    # Combine
    all_verbs = existing_verbs + new_verbs
    print(f"\nTotal verbs: {len(all_verbs)}")

    # Write
    with open(data_path, 'w', encoding='utf-8') as f:
        json.dump(all_verbs, f, ensure_ascii=False, indent=2)
        f.write('\n')
    print(f"Written to {data_path}")


if __name__ == '__main__':
    main()
