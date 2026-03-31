#!/usr/bin/env python3
"""
Fix 8 daily_routine verbs missing conjugations so they appear in SRS quiz.

Strategy:
- 3 regular Form V verbs: add root_letters + form (engine generates at runtime)
- 2 ALPS duplicates: copy conjugations from original verbs
- 3 irregular verbs: add hand-written static conjugation tables
"""

import json
import copy
import sys

VERBS_PATH = "data/verbs.json"

with open(VERBS_PATH, "r", encoding="utf-8") as f:
    verbs = json.load(f)

vmap = {v["id"]: v for v in verbs}

# ─── Step 1: Add root_letters + form for 3 regular Form V verbs ───

regular_v = {
    167: {"root": ["2", "kh", "r"], "form": "Form V"},      # t2akhkhar
    204: {"root": ["7", "m", "m"], "form": "Form V"},        # t7ammam
    229: {"root": ["r", "w", "2"], "form": "Form V"},        # trawwa2
}

for vid, data in regular_v.items():
    v = vmap[vid]
    v["root_letters"] = data["root"]
    v["form"] = data["form"]
    print(f"  Step 1: Verb {vid} ({v['verb']['translit']}): added root_letters={data['root']}, form={data['form']}")

# ─── Step 2: Copy conjugations for 2 ALPS duplicates ───

duplicates = {
    949: 65,    # fei2 ← fī2
    1147: 84,   # neim ← nēm
}

for alps_id, orig_id in duplicates.items():
    alps_v = vmap[alps_id]
    orig_v = vmap[orig_id]
    alps_v["conjugations"] = copy.deepcopy(orig_v["conjugations"])
    print(f"  Step 2: Verb {alps_id} ({alps_v['verb']['translit']}): copied conjugations from verb {orig_id} ({orig_v['verb']['translit']})")

# ─── Step 3: Add static conjugations for 3 irregular verbs ───

# Helper to build a tense object
def make_tense(label, usage, persons, translits, arabics, englishes):
    forms = []
    for p, t, a, e in zip(persons, translits, arabics, englishes):
        forms.append({"person": p, "arabic": a, "translit": t, "english": e})
    return {"label": label, "usage": usage, "forms": forms}

PERSONS_8 = ["ána", "ní7na", "ínta", "ínti", "íntu", "húwwi", "híyyi", "hínni"]
PERSONS_IMP = ["ínta", "ínti", "íntu"]

# ── Verb 266: t3ashsha (have dinner) — Form V final-weak ──
# Pattern from verb 13 (tghádda): t- prefix, -ēt suffix for 1s/2ms past, etc.
v266 = vmap[266]
eng = "have dinner"
v266["conjugations"] = {
    "perfect": make_tense("Past", "Completed actions", PERSONS_8,
        ["t3ashshēt", "t3ashsháyna", "t3ashshēt", "t3ashsháyti", "t3ashsháytu", "t3ashsha", "t3áshshit", "t3áshshu"],
        ["تعشّيت", "تعشّينا", "تعشّيت", "تعشّيتي", "تعشّيتوا", "تعشّى", "تعشّت", "تعشّوا"],
        [f"ána {eng}ed", f"ní7na {eng}ed", f"ínta {eng}ed", f"ínti {eng}ed", f"íntu {eng}ed", f"húwwi {eng}ed", f"híyyi {eng}ed", f"hínni {eng}ed"]),
    "imperfect": make_tense("Subjunctive/Base", "Used with particles (bedde, raḥ, 3am, la-, etc.)", PERSONS_8,
        ["it3ashsha", "nit3ashsha", "tit3ashsha", "tit3áshshi", "tit3áshshu", "yit3ashsha", "tit3ashsha", "yit3áshshu"],
        ["إتعشّى", "نتعشّى", "تتعشّى", "تتعشّي", "تتعشّوا", "يتعشّى", "تتعشّى", "يتعشّوا"],
        [f"ána {eng}", f"ní7na {eng}", f"ínta {eng}", f"ínti {eng}", f"íntu {eng}", f"húwwi {eng}", f"híyyi {eng}", f"hínni {eng}"]),
    "bi_imperfect": make_tense("Habitual Present", "Regular/habitual actions, general truths", PERSONS_8,
        ["bit3ashsha", "mnit3ashsha", "btit3ashsha", "btit3áshshi", "btit3áshshu", "byit3ashsha", "btit3ashsha", "byit3áshshu"],
        ["بتعشّى", "منتعشّى", "بتتعشّى", "بتتعشّي", "بتتعشّوا", "بيتعشّى", "بتتعشّى", "بيتعشّوا"],
        [f"ána {eng}", f"ní7na {eng}", f"ínta {eng}", f"ínti {eng}", f"íntu {eng}", f"húwwi {eng}", f"híyyi {eng}", f"hínni {eng}"]),
    "imperative": make_tense("Command", "Direct commands", PERSONS_IMP,
        ["t3ashsha", "t3áshshi", "t3áshshu"],
        ["تعشّى", "تعشّي", "تعشّوا"],
        [f"{eng}! ()", f"{eng}! ()", f"{eng}! ()"]),
}
print(f"  Step 3: Verb 266 (t3ashsha): added static conjugations (Form V final-weak)")

# ── Verb 1004: 2aam (get up) — Form IB hollow ──
# Pattern from verb 84 (nēm) and 34 (rā7): CīC → CūC imperfect
v1004 = vmap[1004]
eng = "get up"
v1004["conjugations"] = {
    "perfect": make_tense("Past", "Completed actions", PERSONS_8,
        ["2ímit", "2ímna", "2ímit", "2ímti", "2ímtu", "2aam", "2aamit", "2aamu"],
        ["قمت", "قمنا", "قمت", "قمتي", "قمتوا", "قام", "قامت", "قاموا"],
        [f"ána got up", f"ní7na got up", f"ínta got up", f"ínti got up", f"íntu got up", f"húwwi got up", f"híyyi got up", f"hínni got up"]),
    "imperfect": make_tense("Subjunctive/Base", "Used with particles (bedde, raḥ, 3am, la-, etc.)", PERSONS_8,
        ["2ūm", "n2ūm", "t2ūm", "t2ūmi", "t2ūmu", "y2ūm", "t2ūm", "y2ūmu"],
        ["قوم", "نقوم", "تقوم", "تقومي", "تقوموا", "يقوم", "تقوم", "يقوموا"],
        [f"ána {eng}", f"ní7na {eng}", f"ínta {eng}", f"ínti {eng}", f"íntu {eng}", f"húwwi {eng}", f"híyyi {eng}", f"hínni {eng}"]),
    "bi_imperfect": make_tense("Habitual Present", "Regular/habitual actions, general truths", PERSONS_8,
        ["b2ūm", "min2ūm", "bit2ūm", "bit2ūmi", "bit2ūmu", "bi2ūm", "bit2ūm", "bi2ūmu"],
        ["بقوم", "منقوم", "بتقوم", "بتقومي", "بتقوموا", "بيقوم", "بتقوم", "بيقوموا"],
        [f"ána {eng}s", f"ní7na {eng}", f"ínta {eng}", f"ínti {eng}", f"íntu {eng}", f"húwwi {eng}s", f"híyyi {eng}s", f"hínni {eng}"]),
    "imperative": make_tense("Command", "Direct commands", PERSONS_IMP,
        ["2ūm", "2ūmi", "2ūmu"],
        ["قوم", "قومي", "قوموا"],
        [f"{eng}! ()", f"{eng}! ()", f"{eng}! ()"]),
}
print(f"  Step 3: Verb 1004 (2aam): added static conjugations (Form IB hollow)")

# ── Verb 929: ghify (fall asleep) — Form ID final-weak ──
# Similar to verb 84 pattern but Form ID (fi3il) with final-weak
v929 = vmap[929]
eng = "fall asleep"
v929["conjugations"] = {
    "perfect": make_tense("Past", "Completed actions", PERSONS_8,
        ["ghifīt", "ghifīna", "ghifīt", "ghifīti", "ghifītu", "ghify", "ghifyit", "ghifyu"],
        ["غفيت", "غفينا", "غفيت", "غفيتي", "غفيتوا", "غفي", "غفيت", "غفيوا"],
        [f"ána fell asleep", f"ní7na fell asleep", f"ínta fell asleep", f"ínti fell asleep", f"íntu fell asleep", f"húwwi fell asleep", f"híyyi fell asleep", f"hínni fell asleep"]),
    "imperfect": make_tense("Subjunctive/Base", "Used with particles (bedde, raḥ, 3am, la-, etc.)", PERSONS_8,
        ["ághfa", "nághfa", "tághfa", "tághfi", "tághfu", "yághfa", "tághfa", "yághfu"],
        ["أغفى", "نغفى", "تغفى", "تغفي", "تغفوا", "يغفى", "تغفى", "يغفوا"],
        [f"ána {eng}", f"ní7na {eng}", f"ínta {eng}", f"ínti {eng}", f"íntu {eng}", f"húwwi {eng}", f"híyyi {eng}", f"hínni {eng}"]),
    "bi_imperfect": make_tense("Habitual Present", "Regular/habitual actions, general truths", PERSONS_8,
        ["bághfa", "mnághfa", "btághfa", "btághfi", "btághfu", "byághfa", "btághfa", "byághfu"],
        ["بغفى", "منغفى", "بتغفى", "بتغفي", "بتغفوا", "بيغفى", "بتغفى", "بيغفوا"],
        [f"ána {eng}s", f"ní7na {eng}", f"ínta {eng}", f"ínti {eng}", f"íntu {eng}", f"húwwi {eng}s", f"híyyi {eng}s", f"hínni {eng}"]),
    "imperative": make_tense("Command", "Direct commands", PERSONS_IMP,
        ["ghfa", "ghfi", "ghfu"],
        ["غفى", "غفي", "غفوا"],
        [f"{eng}! ()", f"{eng}! ()", f"{eng}! ()"]),
}
print(f"  Step 3: Verb 929 (ghify): added static conjugations (Form ID final-weak)")

# ─── Write back ───

with open(VERBS_PATH, "w", encoding="utf-8") as f:
    json.dump(verbs, f, ensure_ascii=False, indent=2)

print(f"\nWrote {VERBS_PATH}")

# ─── Verification ───

print("\n=== Verification: daily_routine verbs ===")
daily = [v for v in verbs if v.get("topic") == "daily_routine"]
print(f"Total daily_routine verbs: {len(daily)}")

ok = 0
for v in sorted(daily, key=lambda x: x["id"]):
    has_conj = v["conjugations"] is not None
    has_engine = v.get("root_letters") is not None and v.get("form") is not None
    status = "✓ static" if has_conj else ("✓ engine" if has_engine else "✗ MISSING")
    print(f"  {v['id']:>5} {v['verb']['translit']:<15} {status}")
    if has_conj or has_engine:
        ok += 1

print(f"\nResult: {ok}/{len(daily)} verbs will have conjugations")
if ok < len(daily):
    print("WARNING: Some verbs still missing!")
    sys.exit(1)
else:
    print("All daily_routine verbs are fixed!")
