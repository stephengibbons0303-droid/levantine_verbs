#!/usr/bin/env python3
"""
Parse transliteration MD files and inject Arabizi translit fields into verbs.json.

Reads example_sentences_transliterated_*.md files, matches them to existing
examples in data/verbs.json by Arabic text (normalized) or positional fallback,
and updates the translit field. Also syncs pwa/public/verbs.json.

Usage: python3 scripts/inject_transliterations.py
"""

import json
import re
import glob
import os


def parse_transliteration_files(md_dir):
    """Parse all transliteration MD files and return {verb_id: [(arabic, translit, english), ...]}."""
    result = {}

    md_files = sorted(glob.glob(os.path.join(md_dir, 'example_sentences_transliterated_*.md')))
    if not md_files:
        print("ERROR: No example_sentences_transliterated_*.md files found!")
        return result

    print(f"Found {len(md_files)} MD files:")
    for f in md_files:
        print(f"  {os.path.basename(f)}")

    for md_file in md_files:
        with open(md_file, 'r', encoding='utf-8') as f:
            content = f.read()

        # Split by verb headers: ## <id>. <arabic> — <translit> — <english>
        verb_sections = re.split(r'^## (\d+)\.\s', content, flags=re.MULTILINE)

        # verb_sections[0] is preamble, then alternating: id, content, id, content...
        for i in range(1, len(verb_sections), 2):
            verb_id = int(verb_sections[i])
            section = verb_sections[i + 1]

            examples = []
            # Split by numbered lines (e.g. "1. ", "2. ")
            example_blocks = re.split(r'^\d+\.\s', section, flags=re.MULTILINE)

            for block in example_blocks[1:]:  # skip first empty/header part
                lines = [l.strip() for l in block.strip().split('\n') if l.strip()]
                if len(lines) < 3:
                    continue

                arabic = lines[0]
                translit = lines[1].lstrip('- ').strip()
                english = lines[2].lstrip('- ').strip()

                examples.append({
                    'arabic': arabic,
                    'translit': translit,
                    'english': english,
                })

            result[verb_id] = examples

    return result


def strip_arabic_diacritics(text):
    """Remove Arabic diacritical marks (tashkeel) for comparison."""
    text = text.strip()
    # Remove Arabic diacritics: fathatan, dammatan, kasratan, fatha, damma,
    # kasra, shadda, sukun, and other combining marks
    text = re.sub(
        r'[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7\u06E8\u06EA-\u06ED]',
        '', text
    )
    # Normalize alef variants (أ إ آ → ا)
    text = re.sub(r'[أإآ]', 'ا', text)
    # Normalize whitespace
    text = re.sub(r'\s+', ' ', text)
    # Strip trailing punctuation for comparison
    text = text.rstrip('.،,؟?!')
    return text


def main():
    repo_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

    # Parse MD files
    md_data = parse_transliteration_files(repo_root)
    print(f"\nParsed transliterations for {len(md_data)} verbs from MD files")

    md_example_count = sum(len(exs) for exs in md_data.values())
    print(f"Total examples in MD files: {md_example_count}")

    # Load verbs.json
    verbs_path = os.path.join(repo_root, 'data', 'verbs.json')
    with open(verbs_path, 'r', encoding='utf-8') as f:
        verbs = json.load(f)

    # Stats
    verbs_processed = 0
    total_updated = 0
    positional_matches = 0
    arabic_matches = 0
    english_matches = 0
    fuzzy_matches = 0
    unmatched = 0
    already_had_translit = 0

    for verb in verbs:
        vid = verb['id']
        examples = verb.get('examples', [])
        if not examples:
            continue
        if vid not in md_data:
            for ex in examples:
                if not ex.get('translit'):
                    unmatched += 1
                    print(f"  ERROR: No MD data for verb {vid} ({verb['verb']['english']})")
            continue

        verbs_processed += 1
        md_examples = md_data[vid]

        # Strategy 1: If example counts match, use positional matching (most reliable)
        if len(examples) == len(md_examples):
            for i, ex in enumerate(examples):
                if ex.get('translit') and ex['translit'].strip():
                    already_had_translit += 1
                ex['translit'] = md_examples[i]['translit']
                positional_matches += 1
                total_updated += 1
        else:
            # Strategy 2: Match by normalized Arabic text, then English, then fuzzy
            md_remaining = list(enumerate(md_examples))

            for ex in examples:
                if ex.get('translit') and ex['translit'].strip():
                    already_had_translit += 1

                j_arabic = strip_arabic_diacritics(ex.get('arabic', ''))
                j_english = strip_arabic_diacritics(ex.get('english', ''))
                matched = False

                # Try exact Arabic match (after stripping diacritics)
                for idx, (orig_idx, mex) in enumerate(md_remaining):
                    m_arabic = strip_arabic_diacritics(mex['arabic'])
                    if j_arabic == m_arabic:
                        ex['translit'] = mex['translit']
                        md_remaining.pop(idx)
                        arabic_matches += 1
                        total_updated += 1
                        matched = True
                        break

                if not matched:
                    # Try English match
                    for idx, (orig_idx, mex) in enumerate(md_remaining):
                        m_english = strip_arabic_diacritics(mex['english'])
                        if j_english == m_english:
                            ex['translit'] = mex['translit']
                            md_remaining.pop(idx)
                            english_matches += 1
                            total_updated += 1
                            matched = True
                            break

                if not matched:
                    # Try fuzzy Arabic match (first 15 chars)
                    for idx, (orig_idx, mex) in enumerate(md_remaining):
                        m_arabic = strip_arabic_diacritics(mex['arabic'])
                        if len(j_arabic) > 10 and len(m_arabic) > 10 and j_arabic[:15] == m_arabic[:15]:
                            ex['translit'] = mex['translit']
                            md_remaining.pop(idx)
                            fuzzy_matches += 1
                            total_updated += 1
                            matched = True
                            break

                if not matched:
                    unmatched += 1
                    print(f"  ERROR: Unmatched example in verb {vid}: {ex.get('arabic', '')[:50]}")

    # Print stats
    print(f"\n{'='*60}")
    print(f"INJECTION RESULTS")
    print(f"{'='*60}")
    print(f"Verbs processed:           {verbs_processed}")
    print(f"Total examples updated:    {total_updated}")
    print(f"  Positional matches:      {positional_matches}")
    print(f"  Arabic text matches:     {arabic_matches}")
    print(f"  English text matches:    {english_matches}")
    print(f"  Fuzzy Arabic matches:    {fuzzy_matches}")
    print(f"Already had translit:      {already_had_translit} (overwritten with MD data)")
    print(f"ERRORS (no match):         {unmatched}")
    print(f"{'='*60}")

    if unmatched > 0:
        print(f"\nWARNING: {unmatched} examples could not be matched. Review above ERROR lines.")
    else:
        print(f"\nAll examples matched successfully.")

    # Write updated verbs.json
    with open(verbs_path, 'w', encoding='utf-8') as f:
        json.dump(verbs, f, ensure_ascii=False, indent=2)
    print(f"\nUpdated {verbs_path}")

    # Also update pwa/public/verbs.json
    pwa_path = os.path.join(repo_root, 'pwa', 'public', 'verbs.json')
    if os.path.exists(pwa_path):
        with open(pwa_path, 'w', encoding='utf-8') as f:
            json.dump(verbs, f, ensure_ascii=False, indent=2)
        print(f"Updated {pwa_path}")


if __name__ == '__main__':
    main()
