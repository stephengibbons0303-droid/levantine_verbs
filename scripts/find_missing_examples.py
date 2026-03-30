#!/usr/bin/env python3
"""Find verbs in the XLSX that have no example sentences, grouped by difficulty tier."""

import pandas as pd
import sys

def main():
    xlsx_path = 'Levantine verbs.xlsx'

    # Read both sheets
    vdf = pd.read_excel(xlsx_path, sheet_name='verbs')
    edf = pd.read_excel(xlsx_path, sheet_name='example sentences')

    print(f"Total verbs in 'verbs' sheet: {len(vdf)}")
    print(f"Total entries in 'example sentences' sheet: {len(edf)}")
    print(f"Unique verbs with examples: {edf['Root Verb'].nunique()}")
    print()

    # Get set of verbs that have examples (by transliteration)
    verbs_with_examples = set(edf['Root Verb'].dropna().str.strip())

    # Parse transliteration from verbs sheet — format is "past (present)" or "past/alt (present)"
    def extract_root(translit):
        if pd.isna(translit):
            return None
        s = str(translit).strip()
        # Take the first word before any slash, paren, or bracket
        for ch in ['/', '(', '[', ' ']:
            s = s.split(ch)[0]
        return s.strip()

    vdf['root_verb'] = vdf['Transliteration (Past/Present)'].apply(extract_root)

    # Find verbs missing examples
    vdf['has_example'] = vdf['root_verb'].isin(verbs_with_examples)

    missing = vdf[~vdf['has_example']].copy()

    # Normalize tier: treat BA as B, etc. for grouping display, but show original
    tier_order = ['A', 'B', 'BA', 'C', 'CB', 'D', 'DA', 'DC', 'E', 'EB', 'EC']

    print(f"=== Verbs WITHOUT example sentences: {len(missing)} ===\n")

    for tier in tier_order:
        tier_missing = missing[missing['Level'] == tier]
        tier_total = len(vdf[vdf['Level'] == tier])
        if tier_total == 0:
            continue
        print(f"Tier {tier}: {len(tier_missing)} missing / {tier_total} total")
        if len(tier_missing) > 0:
            for _, row in tier_missing.iterrows():
                print(f"  - {row['root_verb']} ({row['English Meaning']})")
        print()

    # Summary
    print("=== SUMMARY ===")
    for tier in ['A', 'B', 'C', 'D', 'E']:
        # Include sub-tiers (BA counts under B, etc.)
        tier_mask = vdf['Level'].str.startswith(tier) if tier != 'E' else vdf['Level'].isin(['E', 'EB', 'EC'])
        # Actually just do exact + sub-tiers
        sub_tiers = [t for t in tier_order if t.startswith(tier)]
        tier_mask = vdf['Level'].isin(sub_tiers)
        total = tier_mask.sum()
        miss_mask = missing['Level'].isin(sub_tiers)
        miss = miss_mask.sum()
        print(f"  {tier} (incl. sub-tiers): {miss} missing / {total} total")

if __name__ == '__main__':
    main()
