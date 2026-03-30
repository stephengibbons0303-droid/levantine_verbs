#!/usr/bin/env python3
"""
Merge reviewed conjugation tables into verbs.json.

Takes a review JSON file containing verified conjugation tables and
replaces `"conjugations": null` entries in verbs.json with the reviewed data.
"""

import json
import os
import sys

def main():
    if len(sys.argv) < 2:
        print("Usage: python3 merge_reviewed.py <reviewed_conjugations.json>")
        print("\nThe review file should contain a list of objects with:")
        print('  { "id": <verb_id>, "conjugations": { ... } }')
        sys.exit(1)

    review_path = sys.argv[1]
    data_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'verbs.json')
    data_path = os.path.abspath(data_path)

    with open(review_path, 'r', encoding='utf-8') as f:
        reviewed = json.load(f)

    with open(data_path, 'r', encoding='utf-8') as f:
        verbs = json.load(f)

    verb_map = {v['id']: v for v in verbs}
    merged = 0
    skipped = 0

    for entry in reviewed:
        vid = entry.get('id')
        conj = entry.get('conjugations')
        if vid not in verb_map:
            print(f"  WARNING: verb id {vid} not found in verbs.json")
            skipped += 1
            continue
        if verb_map[vid]['conjugations'] is not None:
            print(f"  SKIP: verb {vid} already has static conjugations")
            skipped += 1
            continue
        verb_map[vid]['conjugations'] = conj
        merged += 1

    with open(data_path, 'w', encoding='utf-8') as f:
        json.dump(verbs, f, ensure_ascii=False, indent=2)
        f.write('\n')

    print(f"\nMerged: {merged}")
    print(f"Skipped: {skipped}")
    print(f"Written to {data_path}")


if __name__ == '__main__':
    main()
