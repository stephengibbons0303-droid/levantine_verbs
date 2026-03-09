#!/usr/bin/env python3
"""Parse transliteration MD files and populate translit fields in verbs.json."""

import json
import re
import glob
import os

def parse_transliteration_files(md_dir):
    """Parse all transliteration MD files and return {verb_id: [(arabic, translit, english), ...]}."""
    result = {}

    md_files = sorted(glob.glob(os.path.join(md_dir, 'example_sentences_transliterated_*.md')))

    for md_file in md_files:
        with open(md_file, 'r', encoding='utf-8') as f:
            content = f.read()

        # Split by verb headers: ## <id>. <arabic> — <translit> — <english>
        verb_sections = re.split(r'^## (\d+)\.\s', content, flags=re.MULTILINE)

        # verb_sections[0] is preamble, then alternating: id, content, id, content...
        for i in range(1, len(verb_sections), 2):
            verb_id = int(verb_sections[i])
            section = verb_sections[i + 1]

            # Parse numbered examples. Each example has:
            # <number>. <arabic>
            #    - <transliteration>
            #    - <english>
            examples = []
            # Split by numbered lines
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


def normalize(text):
    """Normalize text for comparison - strip diacritics and whitespace."""
    # Remove common diacritics/marks for Arabic comparison
    text = text.strip()
    # Remove zero-width and diacritical marks
    text = re.sub(r'[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7\u06E8\u06EA-\u06ED]', '', text)
    # Normalize whitespace
    text = re.sub(r'\s+', ' ', text)
    return text


def match_examples(json_examples, md_examples):
    """Match JSON examples to MD examples and return updated list."""
    updated = []
    md_remaining = list(md_examples)

    for jex in json_examples:
        j_arabic = normalize(jex['arabic'])
        j_english = normalize(jex['english'])

        matched = False
        for idx, mex in enumerate(md_remaining):
            m_arabic = normalize(mex['arabic'])
            m_english = normalize(mex['english'])

            # Try matching by Arabic text first (most reliable)
            if j_arabic == m_arabic:
                jex['translit'] = mex['translit']
                md_remaining.pop(idx)
                matched = True
                break

        if not matched:
            # Try matching by English text
            for idx, mex in enumerate(md_remaining):
                m_english = normalize(mex['english'])
                if j_english == m_english:
                    jex['translit'] = mex['translit']
                    md_remaining.pop(idx)
                    matched = True
                    break

        if not matched:
            # Try fuzzy matching on Arabic (first 15 chars)
            for idx, mex in enumerate(md_remaining):
                m_arabic = normalize(mex['arabic'])
                if len(j_arabic) > 10 and len(m_arabic) > 10 and j_arabic[:15] == m_arabic[:15]:
                    jex['translit'] = mex['translit']
                    md_remaining.pop(idx)
                    matched = True
                    break

        if not matched:
            # Positional fallback - if same number of examples, use position
            pass

        updated.append(jex)

    return updated


def main():
    repo_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

    # Parse MD files
    md_data = parse_transliteration_files(repo_root)
    print(f"Parsed transliterations for {len(md_data)} verbs from MD files")

    # Load verbs.json
    verbs_path = os.path.join(repo_root, 'data', 'verbs.json')
    with open(verbs_path, 'r', encoding='utf-8') as f:
        verbs = json.load(f)

    matched_count = 0
    unmatched_count = 0
    total_examples = 0

    for verb in verbs:
        vid = verb['id']
        examples = verb.get('examples', [])
        total_examples += len(examples)

        if vid in md_data:
            md_examples = md_data[vid]

            # If counts match exactly, use positional matching as primary
            if len(examples) == len(md_examples):
                for i, ex in enumerate(examples):
                    ex['translit'] = md_examples[i]['translit']
                    matched_count += 1
            else:
                # Use smart matching
                updated = match_examples(examples, md_examples)
                for ex in updated:
                    if ex.get('translit'):
                        matched_count += 1
                    else:
                        unmatched_count += 1
                        print(f"  UNMATCHED verb {vid}: {ex['arabic'][:40]}")
        else:
            unmatched_count += len(examples)
            if examples:
                print(f"  NO MD DATA for verb {vid}: {verb['verb']['english']}")

    print(f"\nResults: {matched_count}/{total_examples} examples matched, {unmatched_count} unmatched")

    # Write updated verbs.json
    with open(verbs_path, 'w', encoding='utf-8') as f:
        json.dump(verbs, f, ensure_ascii=False, indent=2)
    print(f"Updated {verbs_path}")

    # Also update pwa/public/verbs.json
    pwa_path = os.path.join(repo_root, 'pwa', 'public', 'verbs.json')
    with open(pwa_path, 'w', encoding='utf-8') as f:
        json.dump(verbs, f, ensure_ascii=False, indent=2)
    print(f"Updated {pwa_path}")


if __name__ == '__main__':
    main()
