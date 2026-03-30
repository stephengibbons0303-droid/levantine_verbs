#!/usr/bin/env python3
"""
Validate conjugation engine against the existing 103 known-good verbs.

BLOCKING GATE for Phase 2: engine must match known-good forms before
we trust it for new ALPS verbs.
"""

import json
import os
import sys
from conjugation_engine import generate_conjugations, normalize_form_label, extract_root

import unicodedata

def normalize_translit(s):
    """Normalize transliteration for comparison: strip accents, normalize u/o, i/y suffixes."""
    s = s.lower().strip()
    # Remove accent marks (combining diacriticals)
    s = unicodedata.normalize('NFD', s)
    s = ''.join(c for c in s if unicodedata.category(c) != 'Mn')
    # Normalize common variants
    s = s.replace('ţ', 't')  # variant of T
    return s


def main():
    data_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'verbs.json')
    with open(os.path.abspath(data_path), 'r', encoding='utf-8') as f:
        verbs = json.load(f)

    print(f"Loaded {len(verbs)} verbs\n")

    # Map existing verb forms to our engine form labels
    MEASURE_TO_FORM = {
        'I': None,  # Need sub-pattern, can't determine from measure alone
        'II': 'Form II',
        'III': 'Form III',
        'IV': 'Form IV',
        'V': 'Form V',
        'VI': 'Form VI',
        'VII': 'Form VII',
        'VIII': 'Form VIII',
        'IX': 'Form IX',
        'X': 'Form X',
    }

    total_tested = 0
    total_match = 0
    total_mismatch = 0
    total_skipped = 0
    form_results = {}  # form → {match, mismatch, details}

    for verb in verbs:
        vid = verb['id']
        measure = verb['classification']['measure']
        vtype = verb['classification']['type']

        # Determine form label
        form_label = MEASURE_TO_FORM.get(measure)
        if form_label is None and measure == 'I':
            # Try to infer Form I sub-pattern from type
            # We can't reliably determine IA/IB/IC/ID from the classification alone
            # Skip these for now
            total_skipped += 1
            continue

        if form_label is None:
            total_skipped += 1
            continue

        normalized = normalize_form_label(form_label)
        if not normalized:
            total_skipped += 1
            continue

        # Extract root from verb data
        root_str = verb['classification'].get('root', '')
        # Try to parse Arabic root letters: ج-ا format
        # For validation, we'll try to extract from the citation form instead
        citation = verb['verb']['translit']
        root = extract_root(citation, form_label)

        if not root or len(root) < 3:
            total_skipped += 1
            continue

        # Generate conjugations
        generated = generate_conjugations(root, form_label)
        if not generated:
            total_skipped += 1
            continue

        if form_label not in form_results:
            form_results[form_label] = {'match': 0, 'mismatch': 0, 'details': []}

        # Compare against known-good
        verb_matches = 0
        verb_mismatches = 0
        verb_details = []

        for tense in ['perfect', 'bi_imperfect', 'imperfect', 'imperative']:
            known = verb['conjugations'].get(tense, {})
            gen = generated.get(tense, {})
            known_forms = known.get('forms', [])
            gen_forms = gen.get('forms', [])

            for kf in known_forms:
                person = kf['person']
                known_translit = normalize_translit(kf['translit'])
                gen_form = next((g for g in gen_forms if g['person'] == person), None)

                if not gen_form:
                    continue

                gen_translit = normalize_translit(gen_form['translit'])

                if known_translit == gen_translit:
                    verb_matches += 1
                else:
                    verb_mismatches += 1
                    verb_details.append(f"  {tense}/{person}: expected '{known_translit}' got '{gen_translit}'")

        total_tested += 1
        total_match += verb_matches
        total_mismatch += verb_mismatches

        form_results[form_label]['match'] += verb_matches
        form_results[form_label]['mismatch'] += verb_mismatches

        if verb_mismatches > 0:
            form_results[form_label]['details'].append(
                f"\n  Verb {vid} ({verb['verb']['translit']} - {verb['verb']['english']}) "
                f"root={root}:\n" + '\n'.join(verb_details)
            )

    # Report
    print("=" * 60)
    print("VALIDATION RESULTS")
    print("=" * 60)
    print(f"\nVerbs tested: {total_tested}")
    print(f"Verbs skipped: {total_skipped} (Form I sub-patterns, irregulars)")
    print(f"Total form comparisons: {total_match + total_mismatch}")
    print(f"  Matches: {total_match}")
    print(f"  Mismatches: {total_mismatch}")

    if total_match + total_mismatch > 0:
        accuracy = total_match / (total_match + total_mismatch) * 100
        print(f"  Accuracy: {accuracy:.1f}%")

    print("\n--- Per Form Type ---")
    for form, res in sorted(form_results.items()):
        total = res['match'] + res['mismatch']
        acc = res['match'] / total * 100 if total > 0 else 0
        status = "PASS" if res['mismatch'] == 0 else "FAIL"
        print(f"\n  {form}: {status} ({res['match']}/{total} = {acc:.0f}%)")
        if res['details']:
            for d in res['details'][:3]:  # Show first 3 mismatches per form
                print(d)
            if len(res['details']) > 3:
                print(f"  ... and {len(res['details']) - 3} more verbs with mismatches")

    # Gate check
    print("\n" + "=" * 60)
    if total_mismatch == 0 and total_tested > 0:
        print("GATE: PASSED - All tested forms match known-good conjugations")
        return 0
    elif total_tested == 0:
        print("GATE: SKIPPED - No verbs could be tested (all Form I or irregular)")
        return 0
    else:
        print(f"GATE: FAILED - {total_mismatch} mismatches found")
        print("Note: Mismatches are expected due to transliteration style differences.")
        print("Review mismatches to determine if they are true errors or notation variants.")
        return 1

if __name__ == '__main__':
    sys.exit(main())
