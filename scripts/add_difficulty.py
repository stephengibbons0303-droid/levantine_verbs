#!/usr/bin/env python3
"""Add difficulty tiers (A-E) to existing 103 verbs in data/verbs.json."""

import json
import os

# Difficulty mapping from TASK_step3 file (V1-V103)
DIFFICULTY_MAP = {
    # A (54 verbs)
    **{i: "A" for i in [1,2,4,6,9,10,13,18,20,24,25,26,30,31,32,34,37,41,42,43,45,
                         47,49,50,51,53,54,55,56,58,59,66,69,70,73,74,76,77,79,
                         80,81,83,84,85,86,88,92,95,98,99,100,101,102,103]},
    # B (19 verbs)
    **{i: "B" for i in [5,7,8,12,19,23,28,33,36,48,60,61,64,72,75,78,91,93,94]},
    # BA (2 verbs) — stored as "BA", treated as B for filtering
    **{i: "BA" for i in [46,65]},
    # C (16 verbs)
    **{i: "C" for i in [11,14,15,16,17,21,22,40,44,57,67,68,71,82,87,97]},
    # D (9 verbs)
    **{i: "D" for i in [3,29,35,38,52,62,63,90,96]},
    # E (3 verbs)
    **{i: "E" for i in [27,39,89]},
}

def main():
    data_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'verbs.json')
    data_path = os.path.abspath(data_path)

    with open(data_path, 'r', encoding='utf-8') as f:
        verbs = json.load(f)

    assigned = 0
    missing = []
    for verb in verbs:
        vid = verb['id']
        if vid in DIFFICULTY_MAP:
            verb['difficulty'] = DIFFICULTY_MAP[vid]
            assigned += 1
        else:
            missing.append(vid)

    if missing:
        print(f"WARNING: {len(missing)} verbs have no difficulty mapping: {missing}")

    # Verify distribution
    from collections import Counter
    dist = Counter(v['difficulty'] for v in verbs if 'difficulty' in v)
    print(f"Assigned difficulty to {assigned}/{len(verbs)} verbs")
    print(f"Distribution: {dict(sorted(dist.items()))}")

    # Expected: A=54, B=19, BA=2, C=16, D=9, E=3 = 103
    expected = {'A': 54, 'B': 19, 'BA': 2, 'C': 16, 'D': 9, 'E': 3}
    for tier, count in expected.items():
        actual = dist.get(tier, 0)
        status = "OK" if actual == count else f"MISMATCH (expected {count})"
        print(f"  {tier}: {actual} {status}")

    with open(data_path, 'w', encoding='utf-8') as f:
        json.dump(verbs, f, ensure_ascii=False, indent=2)
        f.write('\n')

    print(f"\nWritten to {data_path}")

if __name__ == '__main__':
    main()
