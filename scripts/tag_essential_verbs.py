#!/usr/bin/env python3
"""
Tag essential verbs and topic groups in verbs.json.

- Adds "essential": true to the top 20 high-frequency verbs (by ID).
- Adds "topic" field to all A/BA tier verbs (except 4 pseudo-verbs).
- Copies result to pwa/public/verbs.json and docs/verbs.json.
- Reports all matches and warns about unmatched entries.
"""

import json
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA_JSON = ROOT / "data" / "verbs.json"
COPIES = [
    ROOT / "pwa" / "public" / "verbs.json",
    ROOT / "docs" / "verbs.json",
]

# ── Essential verb IDs (top 20 survival verbs) ──────────────────────────────
ESSENTIAL_IDS = {34, 1, 20, 59, 4, 2, 26, 37, 69, 50, 76, 70, 66, 47, 31, 77, 55, 9, 80, 84}

# ── Pseudo-verbs that get NO topic (Full tier only) ─────────────────────────
PSEUDO_VERB_IDS = {98, 99, 100, 101}  # kēn fī, 3índi, ili, má3i

# ── Topic assignments by verb ID ────────────────────────────────────────────
# Every A/BA verb gets a topic (except pseudo-verbs).
# Where Aldrich + ALPS duplicates exist, both IDs are listed.

TOPIC_MAP = {}

def _assign(topic, ids):
    for vid in ids:
        TOPIC_MAP[vid] = topic

_assign("daily_routine", [
    84,    # nēm — sleep (Aldrich)
    1147,  # neim — sleep (ALPS)
    65,    # fī2 — wake up (Aldrich, BA)
    949,   # fei2 — wake up (ALPS, BA)
    929,   # ghify — fall asleep (BA)
    1004,  # 2aam — rise; get up
    80,    # libis — wear
    734,   # shala7 — undress
    204,   # t7ammam — bathe oneself
    4,     # 2ákal — eat
    51,    # shírib — drink
    229,   # trawwa2 — have breakfast
    13,    # tghádda — have lunch
    266,   # t3ashsha — have dinner
    50,    # shtághal — work
    167,   # t2akhkhar — be late
])

_assign("communication", [
    26,    # 7aki — speak (Aldrich)
    394,   # 7aka — speak (ALPS)
    47,    # simi3 — hear
    70,    # 2āl — say (Aldrich)
    1003,  # 2aal — say (ALPS)
    42,    # sa2al — ask
    318,   # jeiwab — answer
    181,   # ttaSal — contact; call
    417,   # khabbar — tell; inform
    74,    # 2ara — read
    77,    # katab — write
    69,    # fihim — understand
    59,    # 3írif — know
    219,   # tzakkar — remember
])

_assign("actions", [
    903,   # 3imil — do; make (BA)
    9,     # bállash — begin
    454,   # khalaS — finish
    382,   # 7aDDar — prepare
    43,    # sta3mal — use
    66,    # fata7 — open
    45,    # sakkar — close
    487,   # da22 — knock; ring; play music
    898,   # 3allam — teach; educate
    31,    # dáras — study
    572,   # zabaT — turn out right
    756,   # Sadda2 — believe; certify
])

_assign("movement", [
    34,    # rā7 — go (Aldrich)
    508,   # raa7 — go (ALPS)
    1,     # íja — come (Aldrich)
    106,   # 2ija — come (ALPS)
    37,    # ríji3 — return
    58,    # ṭíli3 — ascend (Aldrich)
    827,   # Toli3 — go up; go out (ALPS)
    1183,  # nizil — go down
    793,   # Dahar — leave; go out
    941,   # feit — enter
    92,    # wuSil — arrive (Aldrich)
    1291,  # wiSil — arrive (ALPS)
    83,    # mshi — walk (Aldrich)
    1134,  # mishy — walk (ALPS)
    556,   # rakaD — run
    1126,  # mara2 — pass by; stop by
    987,   # fall — leave; depart
    599,   # sei2 — drive
    1290,  # waSSal — deliver; drive s.o.
    798,   # Taar — fly (BA)
    18,    # jīb — bring (Aldrich)
    314,   # jeib — bring (ALPS)
])

_assign("wants_feelings", [
    20,    # 7abb — like; love
    102,   # báddi — want
    103,   # fíni — can
    846,   # 3aaz — need (BA)
    867,   # 3ajab — appeal to s.o.
    85,    # nbasat — enjoy
    237,   # tsalla — have fun
    54,    # Dí7ik — laugh
    259,   # ti3ib — get tired
    1261,  # hilik — become exhausted
    883,   # 3aSSab — be nervous/angry
    316,   # jei3 — hunger
    136,   # barad — get cold
    86,    # nisi — forget (Aldrich)
    1186,  # nisy — forget (ALPS)
])

_assign("shopping", [
    49,    # shtara — buy
    6,     # bē3 — sell
    32,    # dáfa3 — pay
    652,   # sa7ab — withdraw
    73,    # 2idir — be able to
    470,   # dei2 — taste
    88,    # naţar — wait
    2,     # 2ákhad — take
])

_assign("home_life", [
    56,    # ṭábakh — cook
    334,   # jala — wash dishes
    46,    # sakan — live (BA)
    847,   # 3aash — live (BA)
    10,    # tárak — leave
    25,    # 7att — put
    30,    # khálla — let
    692,   # sheil — remove; take away
    1065,  # kasar — break (BA)
    55,    # Dall — stay
    53,    # ṣār — become (Aldrich)
    747,   # Saar — become (ALPS)
])

_assign("social", [
    669,   # sallam — greet
    41,    # sē3ad — help (Aldrich)
    597,   # sei3ad — help (ALPS)
    691,   # sheif — see
    95,    # wi2if — stand
    278,   # tfaDDal — have the honor
    868,   # 3ajjal — rush
    105,   # 2assar — affect; influence
    81,    # l3ib — play (Aldrich)
    1094,  # li3ib — play (ALPS)
    1115,  # meit — die
    76,    # kēn — be (Aldrich)
    1050,  # kein — be (ALPS)
])


def main():
    with open(DATA_JSON, "r", encoding="utf-8") as f:
        verbs = json.load(f)

    verb_by_id = {v["id"]: v for v in verbs}

    # ── Tag essential verbs ──────────────────────────────────────────────
    print("=== Essential Verbs (top 20) ===")
    for vid in sorted(ESSENTIAL_IDS):
        v = verb_by_id.get(vid)
        if v:
            v["essential"] = True
            print(f"  ✓ ID {vid:4d}: {v['verb']['translit']:15s} {v['verb']['english']}")
        else:
            print(f"  ⚠ WARNING: ID {vid} not found in verbs.json!")

    # ── Tag topics ───────────────────────────────────────────────────────
    print("\n=== Topic Tags ===")
    topic_counts = {}
    for vid, topic in sorted(TOPIC_MAP.items()):
        v = verb_by_id.get(vid)
        if v:
            d = v.get("difficulty", "")
            if d not in ("A", "BA"):
                print(f"  ⚠ WARNING: ID {vid} ({v['verb']['translit']}) has difficulty={d}, not A/BA — skipping topic tag")
                continue
            v["topic"] = topic
            topic_counts[topic] = topic_counts.get(topic, 0) + 1
            print(f"  ✓ ID {vid:4d}: {v['verb']['translit']:15s} → {topic}")
        else:
            print(f"  ⚠ WARNING: ID {vid} not found in verbs.json!")

    # ── Report topic counts ──────────────────────────────────────────────
    print("\n=== Topic Counts ===")
    for topic in ["daily_routine", "communication", "actions", "movement",
                   "wants_feelings", "shopping", "home_life", "social"]:
        print(f"  {topic:20s}: {topic_counts.get(topic, 0)} verbs")
    print(f"  {'TOTAL':20s}: {sum(topic_counts.values())} verbs")

    # ── Warn about expected but missing topic verbs (non-A/BA tier) ──────
    print("\n=== Expected Verbs Not Tagged (wrong tier) ===")
    expected_missing = {
        52: ("shakar", "social", "D"),
        57: ("Talab", "shopping", "C"),
    }
    for vid, (name, topic, tier) in sorted(expected_missing.items()):
        print(f"  ⓘ ID {vid} ({name}) listed in {topic} but is tier {tier} — not tagged (future)")

    print("\n  ⓘ 'dall' (point; direct; guide) listed in social — no matching A/BA verb found in verbs.json")

    # ── Warn about untagged A/BA verbs ───────────────────────────────────
    print("\n=== Untagged A/BA Verbs ===")
    untagged = []
    for v in verbs:
        d = v.get("difficulty", "")
        if d in ("A", "BA") and "topic" not in v and v["id"] not in PSEUDO_VERB_IDS:
            untagged.append(v)
            print(f"  ⚠ ID {v['id']:4d}: {v['verb']['translit']:15s} {v['verb']['english']:30s} (difficulty={d})")

    if not untagged:
        print("  None — all A/BA verbs are tagged!")

    # ── Pseudo-verbs (no topic, expected) ────────────────────────────────
    print("\n=== Pseudo-verbs (no topic, expected) ===")
    for vid in sorted(PSEUDO_VERB_IDS):
        v = verb_by_id.get(vid)
        if v:
            print(f"  ⓘ ID {vid:4d}: {v['verb']['translit']:15s} {v['verb']['english']}")

    # ── Write back ───────────────────────────────────────────────────────
    with open(DATA_JSON, "w", encoding="utf-8") as f:
        json.dump(verbs, f, ensure_ascii=False, indent=2)
    print(f"\n✓ Written: {DATA_JSON}")

    for dest in COPIES:
        shutil.copy2(DATA_JSON, dest)
        print(f"✓ Copied:  {dest}")

    # ── Summary ──────────────────────────────────────────────────────────
    essential_count = sum(1 for v in verbs if v.get("essential"))
    topic_tagged = sum(1 for v in verbs if "topic" in v)
    print(f"\n=== Summary ===")
    print(f"  Essential verbs tagged: {essential_count}")
    print(f"  Topic-tagged verbs:     {topic_tagged}")
    print(f"  Untagged A/BA verbs:    {len(untagged)} (+ {len(PSEUDO_VERB_IDS)} pseudo-verbs)")


if __name__ == "__main__":
    main()
