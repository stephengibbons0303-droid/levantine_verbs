#!/usr/bin/env python3
"""
Fix transitivity and quiz_objects for verbs in verbs.json.

Matches verbs by English meaning (first meaning before semicolon) since
the task's transliteration names don't match the actual verbs.json translits.
"""

import json
import os
import re
import sys

# --- Assignment table from task description ---
# Maps English meaning -> { transitivity, quiz_objects }
# English keys are lowercase, stripped of "to "

TRANSITIVE_VERBS = {
    "take": {"tr": "tr", "qo": ["il-ktēb", "il-shánTa", "il-maSāri"]},
    "announce": {"tr": "tr", "qo": ["il-akhbēr", "il-natīje"]},
    "eat": {"tr": "tr", "qo": ["il-akil", "is-sandwīsh", "il-bītza"]},
    "order": {"tr": "tr", "qo": ["il-akil", "il-2ahwe"]},
    "sell": {"tr": "tr", "qo": ["is-sayyāra", "il-bēt"]},
    "change": {"tr": "tr", "qo": ["it-tiyēb", "il-khúTTa"]},
    "begin": {"tr": "both", "qo": ["ish-shúghul", "id-dirāse"]},
    "start": {"tr": "both", "qo": ["ish-shúghul", "id-dirāse"]},
    "pay": {"tr": "tr", "qo": ["il-fātūra", "il-maSāri"]},
    "study": {"tr": "tr", "qo": ["il-ktēb", "id-dars"]},
    "search for": {"tr": "tr", "qo": ["il-miftē7", "il-shánTa", "telefōn"]},
    "search": {"tr": "tr", "qo": ["il-miftē7", "il-shánTa", "telefōn"]},
    "open": {"tr": "tr", "qo": ["il-bēb", "il-ktēb", "il-shíbbēk"]},
    "understand": {"tr": "tr", "qo": ["is-su2āl", "id-dars", "il-mushkle"]},
    "wash": {"tr": "tr", "qo": ["it-tiyēb", "is-sayyāra", "il-jāT"]},
    "prepare": {"tr": "tr", "qo": ["il-akil", "il-ghada", "il-3asha"]},
    "talk": {"tr": "tr", "qo": ["il-2íSSa", "in-níkte"]},
    "tell": {"tr": "tr", "qo": ["il-2íSSa", "in-níkte"]},
    "put": {"tr": "tr", "qo": ["il-akil", "il-ktēb", "il-miftē7"]},
    "carry": {"tr": "tr", "qo": ["il-shánTa", "il-ghráD"]},
    "buy": {"tr": "tr", "qo": ["il-akil", "il-khuDra", "il-khíbiz"]},
    "bring": {"tr": "tr", "qo": ["il-akil", "il-máyy", "il-dáwa"]},
    "get": {"tr": "tr", "qo": ["il-akil", "il-máyy", "il-dáwa"]},
    "write": {"tr": "tr", "qo": ["il-risēle", "il-wáraʔ"]},
    "break": {"tr": "tr", "qo": ["il-báyDa", "il-kébbēye"]},
    "wear": {"tr": "tr", "qo": ["it-tiyēb", "iS-Sabbāt"]},
    "find": {"tr": "tr", "qo": ["il-miftē7", "il-shánTa", "il-7all"]},
    "forget": {"tr": "tr", "qo": ["il-miftē7", "il-maw3id", "telefōn"]},
    "clean": {"tr": "tr", "qo": ["il-bēt", "il-maTbakh"]},
    "read": {"tr": "tr", "qo": ["il-ktēb", "ij-jarīde", "il-akhbēr"]},
    "return": {"tr": "both", "qo": ["il-ktēb", "il-maSāri"]},
    "close": {"tr": "tr", "qo": ["il-bēb", "il-shíbbēk"]},
    "hear": {"tr": "tr", "qo": ["il-akhbēr", "il-músi2a"]},
    "ask": {"tr": "tr", "qo": ["is-su2āl"]},
    "see": {"tr": "tr", "qo": ["il-fīlm", "il-match"]},
    "watch": {"tr": "tr", "qo": ["il-fīlm", "il-match"]},
    "drink": {"tr": "tr", "qo": ["il-2ahwe", "il-máyy", "il-7alīb"]},
    "cook": {"tr": "tr", "qo": ["il-akil", "il-ghada", "il-3asha"]},
    "leave": {"tr": "tr", "qo": ["ish-shúghul", "il-bēt", "id-dirāse"]},
    "do": {"tr": "tr", "qo": ["il-akil", "it-tamārīn", "il-wējib"]},
    "make": {"tr": "tr", "qo": ["il-akil", "it-tamārīn", "il-wējib"]},
    "teach": {"tr": "tr", "qo": ["id-dars", "3árabi"]},
    "educate": {"tr": "tr", "qo": ["id-dars", "3árabi"]},
    "know": {"tr": "tr", "qo": ["il-7a2ī2a", "il-jawēb", "il-3inwēn"]},
    "deliver": {"tr": "tr", "qo": ["il-akil", "il-Tard"]},
    "convey": {"tr": "tr", "qo": ["il-akil", "il-Tard"]},
    "stop": {"tr": "tr", "qo": ["is-sayyāra"]},
    "review": {"tr": "tr", "qo": ["id-dars", "il-imti7ān"]},
    "spray": {"tr": "tr", "qo": ["il-máyy"]},
    "complain": {"tr": "tr", "qo": ["il-mushkle"]},
    "say": {"tr": "tr", "qo": ["il-7a2ī2a", "il-akhbēr"]},
    "withdraw": {"tr": "tr", "qo": ["il-maSāri"]},
    "drive": {"tr": "tr", "qo": ["is-sayyāra", "il-bāS"]},
    "place": {"tr": "tr", "qo": ["il-akil", "il-ktēb"]},
    "photograph": {"tr": "tr", "qo": ["iS-Súwar"]},
    # "both" verbs
    "remember": {"tr": "both", "qo": ["il-maw3id", "il-2íSSa"]},
    "feel": {"tr": "both", "qo": ["il-bárd", "il-7arāra"]},
    "exchange": {"tr": "both", "qo": ["il-maSāri", "it-tiyēb"]},
    # People-taking verbs
    "thank": {"tr": "tr", "qo": ["la-bayyo", "il-mu3allme", "il-jīrēn"]},
    "help": {"tr": "tr", "qo": ["ukhto", "Sa7bo", "il-jīrēn"]},
    "aid": {"tr": "tr", "qo": ["ukhto", "Sa7bo", "il-jīrēn"]},
    "inform": {"tr": "tr", "qo": ["ahlo", "Sa7bo", "il-mu3allme"]},
    "guide": {"tr": "tr", "qo": ["Sa7bo", "ukhto"]},
}


def normalize_english(eng):
    """Extract the first meaning, lowercase, strip 'to ', strip brackets."""
    # Split on semicolons, take first
    first = eng.split(";")[0].strip()
    # Remove bracketed qualifiers
    first = re.sub(r'\[.*?\]', '', first).strip()
    # Remove parenthetical
    first = re.sub(r'\(.*?\)', '', first).strip()
    # Strip leading "to "
    first = re.sub(r'^to\s+', '', first, flags=re.IGNORECASE)
    return first.lower().strip()


def main():
    data_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'verbs.json')
    public_path = os.path.join(os.path.dirname(__file__), '..', 'pwa', 'public', 'verbs.json')

    with open(data_path, 'r', encoding='utf-8') as f:
        verbs = json.load(f)

    updated = 0
    skipped = 0
    matched_english = set()

    for verb in verbs:
        eng_raw = verb.get('verb', {}).get('english', '')
        eng_norm = normalize_english(eng_raw)

        if eng_norm in TRANSITIVE_VERBS:
            entry = TRANSITIVE_VERBS[eng_norm]
            verb['transitivity'] = entry['tr']
            verb['quiz_objects'] = entry['qo']
            matched_english.add(eng_norm)
            updated += 1
            print(f"  Updated: {verb['verb']['translit']:20s} | {eng_raw:40s} | {entry['tr']:5s} | qo={entry['qo']}")

    # Check for unmatched entries
    all_keys = set(TRANSITIVE_VERBS.keys())
    unmatched = all_keys - matched_english
    if unmatched:
        print(f"\nWarning: {len(unmatched)} task entries not matched to any verb:")
        for key in sorted(unmatched):
            print(f"  - '{key}'")

    # Write output
    with open(data_path, 'w', encoding='utf-8') as f:
        json.dump(verbs, f, ensure_ascii=False, indent=2)

    with open(public_path, 'w', encoding='utf-8') as f:
        json.dump(verbs, f, ensure_ascii=False, indent=2)

    print(f"\nDone: {updated} verbs updated, written to data/ and pwa/public/")


if __name__ == '__main__':
    main()
