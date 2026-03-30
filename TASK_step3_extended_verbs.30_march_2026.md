# Task: Step 3 — Extended Verb Set + Difficulty Categories

**Date:** March 30, 2026  
**Handoff from:** Claude Project (data/content workspace)  
**Handoff to:** Claude Code (implementation)

---

## Context

We're building a Levantine Arabic verb conjugation PWA ("Conjugate This, Conjugate That"). The app currently has 103 verbs from the Aldrich book stored in `verbs.json` (generated from pipe-delimited `.txt` source files via `pipe_to_json.py`).

We now have an ALPS (Spoken Levantine Arabic Verbs Dictionary) workbook with **1,261 verbs**, already categorized into difficulty tiers A–E, plus conjugation form tables, example sentences, and linguistic notes.

**File:** `Levantine_verbs.xlsx` — add this to the repo root. Claude Code should read it with `pandas.read_excel()` + `openpyxl`. **Do NOT convert to CSV** — Arabic script and diacritical marks (á, ē, ī, ō, ū, etc.) will corrupt.

---

## Sub-Task A: Assign difficulty levels to existing 103 verbs

Add a `difficulty` field (A–E) to each verb in `verbs.json`.

Cross-referencing has been done. Here is the complete mapping:

| V# | Root | Level | Notes |
|----|------|-------|-------|
| 1 | 2ija | A | |
| 2 | 2akhad | A | |
| 3 | 2a3lan | D | |
| 4 | 2akal | A | |
| 5 | 2amar | B | *Estimated — not exact ALPS match* |
| 6 | baa3 | A | *Estimated — "sell" not in ALPS, clearly A-tier* |
| 7 | baram | B | |
| 8 | bi2y | B | |
| 9 | ballash | A | |
| 10 | tarak | A | |
| 11 | t3aamal | C | |
| 12 | t3allam | B | |
| 13 | tghadda | A | |
| 14 | tfaada | C | |
| 15 | tlakhbaT | C | |
| 16 | talfan | C | |
| 17 | tmanna | C | |
| 18 | jeib | A | |
| 19 | 7aawal | B | |
| 20 | 7abb | A | |
| 21 | 7tafal | C | |
| 22 | 7arrak | C | |
| 23 | 7ass | B | |
| 24 | 7idir | A | ALPS root: 7idir (attend/watch) |
| 25 | 7aTT | A | |
| 26 | 7aka | A | |
| 27 | 7marr | E | |
| 28 | khliS | B | *Estimated — intransitive "finish/end"* |
| 29 | khallaS | D | |
| 30 | khalla | A | |
| 31 | daras | A | |
| 32 | dafa3 | A | |
| 33 | da2ar | B | |
| 34 | raa7 | A | |
| 35 | rabaT | D | |
| 36 | rtei7 | B | ALPS root: rtei7 |
| 37 | riji3 | A | |
| 38 | rikib | D | |
| 39 | rama | E | |
| 40 | zaar | C | |
| 41 | sei3ad | A | ALPS root: sei3ad |
| 42 | sa2al | A | |
| 43 | sta3mal | A | |
| 44 | sthanna | C | *Estimated — ALPS has thanna (enjoy) at C* |
| 45 | sakkar | A | |
| 46 | sakan | BA | |
| 47 | simi3 | A | |
| 48 | shabb | B | *Estimated — "grow up/ignite" not in ALPS* |
| 49 | shtara | A | |
| 50 | shtaghal | A | |
| 51 | shakar | A | |
| 52 | Saab | D | |
| 53 | Saar | A | |
| 54 | Di7ik | A | |
| 55 | Dall | A | |
| 56 | Tabakh | A | |
| 57 | Talab | C | |
| 58 | toli3 | A | ALPS root: toli3 (go up/go out) |
| 59 | 3irif | A | |
| 60 | 3azam | B | |
| 61 | 3aTa | B | |
| 62 | 3imil | D | |
| 63 | ghassal | D | |
| 64 | ghayyar | B | |
| 65 | fei2 | BA | ALPS root: fei2 (wake up) |
| 66 | fata7 | A | |
| 67 | farja | C | |
| 68 | fakkar | C | |
| 69 | fihim | A | |
| 70 | 2aal | A | |
| 71 | 2abaD | C | *Estimated — "earn/receive" not in ALPS* |
| 72 | 2atal | B | |
| 73 | 2idir | A | |
| 74 | 2ara/2iri | A | ALPS root: 2ara/2iri |
| 75 | 2a3ad | B | |
| 76 | keen | A | *Not in ALPS — "to be" is obviously A* |
| 77 | katab | A | |
| 78 | kazzab | B | |
| 79 | laa2a | A | *Estimated — "find" not in ALPS, clearly A* |
| 80 | libis | A | |
| 81 | li3ib | A | |
| 82 | masak | C | |
| 83 | mishy | A | ALPS root: mishy |
| 84 | neim | A | ALPS root: neim |
| 85 | nbasaT | A | |
| 86 | nisy | A | ALPS root: nisy |
| 87 | nDamm | C | *Estimated — "join" not in ALPS* |
| 88 | naTar | A | |
| 89 | n2aal | E | *Passive of 2aal — not in ALPS* |
| 90 | nlgha | D | *Passive of lagha (cancel) — ALPS has lagha at D* |
| 91 | htamm | B | |
| 92 | wiSil | A | |
| 93 | wa3ad | B | ALPS root: wa3ad |
| 94 | wi2i3 | B | |
| 95 | wi2if | A | |
| 96 | wa22af | D | |
| 97 | wilid | C | *Estimated — "be born" not in ALPS* |
| 98 | keen_fi | A | Special pseudo-verb ("there to be") |
| 99 | 3indi | A | Special pseudo-verb ("to have") |
| 100 | ili | A | Special pseudo-verb ("to have") |
| 101 | ma3i | A | Special pseudo-verb ("to have") |
| 102 | baddi | A | Special pseudo-verb ("to want") |
| 103 | fini | A | Special pseudo-verb ("to be able to") |

**Summary:** A=54, B=19, BA=2, C=16, D=9, E=3

**Implementation:** In `verbs.json`, add `"difficulty": "A"` (or B/C/D/E/BA) to each verb object. For hybrid levels like "BA", treat as the higher tier (B) for quiz filtering purposes.

---

## Sub-Task B: Conjugation Engine — Tiered Hybrid Architecture

### The Question

For the ~1,158 NEW verbs from ALPS (1,261 minus ~103 overlap), should we pre-generate all conjugation tables as static JSON, or build a runtime conjugation engine?

### Answer: Both — tiered by reliability

Analysis of all 1,261 verbs' form classifications reveals three reliability tiers for a rule-based conjugation engine:

#### SAFE (641 verbs, 229 ABC) — 51% of all verbs

Engine-generated conjugations are fully reliable. These are derived forms (II and above) where conjugation is completely mechanical — root consonants slot into a fixed template with fixed vowels. No ambiguity.

Forms: Form II (291), Form V (82), Form III (55), Form VIII (43), Quadrilateral (43), Emphatic (29), Form VII (28), Form X (24), Form VI (22), Quad. Reflexive (10), Emphatic Quad. (8), Form IX (6)

#### MODERATE (426 verbs, 168 ABC) — 34% of all verbs

Engine-generated conjugations are reliable IF the form label from ALPS is respected. These are sound (regular) Form I verbs (IA, IB, IC, ID) plus final-weak and geminate variants of derived forms. The ALPS data already specifies which vowel sub-pattern each verb uses.

Forms: Form IB (158), Form IA (72), Form ID (56), Form IC Irr. final geminate (30), Form II Irr. final weak (29), Form IC Geminate (17), Form IB Irr. final geminate (14), Form V Irr. final weak (10), Form IC (9), Form II Final Weak (9), Form ID waaw (8), Form IE rare (5), Form IV (3), Form IB Geminate (3), Form VIII Geminate (2), Form IA Irr. final geminate (1)

#### RISKY (186 verbs, 70 ABC) — 15% of all verbs

Engine-generated conjugations are NOT reliable. These include medial weak (hollow) verbs, Form I final weak verbs, initial-wāw verbs, and unique irregulars. The root vowel changes between tenses in ways not fully predictable from the form label alone.

Forms: All medial weak variants, Form I final weak variants, initial wāw variants, unique irregulars (2ija, 2akhad, kēn), and miscellaneous one-off forms.

### Architecture: `getConjugation(verbId, tense, person)`

The app exposes a single function. Quiz engine, browse tab, and all future features call it. They never know or care whether the form came from static JSON or was engine-generated.

```
getConjugation(verbId, tense, person) called
    ↓
Does this verb have conjugations in verbs.json? (conjugations ≠ null)
    ↓ YES                        ↓ NO
Return from static JSON     Engine generates full table from
                            root_letters + form template
                                ↓
                            Stores on JS object in memory:
                            verbs[id].conjugations = { ... }
                                ↓
                            Returns requested form
                                ↓
                            Next call for same verb → already
                            populated, engine doesn't run again
```

### Data format in `verbs.json`

**Static verb (risky forms, existing 103):**
```json
{
  "id": 1,
  "root": "2ija",
  "form": "Irregular (unique)",
  "difficulty": "A",
  "conjugations": {
    "perfect":       { "ána": "jīt", "ní7na": "jīna", ... },
    "imperfect":     { "ána": "íji", ... },
    "bi_imperfect":  { "ána": "bíji", ... },
    "imperative":    { "ínta": "ta3a", ... },
    "participle":    { "m": "jēy", "f": "jēyi", "pl": "jēyīn" }
  }
}
```

**Engine verb (safe/moderate forms):**
```json
{
  "id": 150,
  "root_letters": ["d", "r", "s"],
  "form": "Form II",
  "difficulty": "B",
  "citation": { "past": "darras", "present": "bidarris" },
  "conjugations": null
}
```

### Runtime caching

When the engine fills in a `null` conjugation, it writes to the same JavaScript object in the phone's RAM that was loaded from `verbs.json`. This is NOT persisted anywhere. On page refresh, it reloads from `verbs.json` and re-generates as needed. The engine runs once per verb per session (a few microseconds per verb). No localStorage, no GitHub, no server involvement — just a variable in RAM while the tab is open.

### Dev engine for review pipeline

The same conjugation logic also runs as a Python script in the dev environment:

1. Engine generates candidate conjugation tables → outputs to `generated_conjugations_review.json`
2. Native speaker reviews a sample per form type
3. Approved tables merged into `verbs.json` (script replaces `"conjugations": null` with verified static table)
4. That verb is now permanently static — engine no longer runs for it at runtime

### What needs review vs what doesn't

| Tier | Count | ABC | Review needed? | Lives in verbs.json as |
|------|-------|-----|---------------|----------------------|
| Safe | 641 | 229 | No — validate engine against existing 103 | `conjugations: null` |
| Moderate | 426 | 168 | No — same, once validated | `conjugations: null` |
| Risky | 186 | 70 | Yes — generate candidates, native speaker reviews | `conjugations: {...}` |

**Validation step:** Run the dev engine against our existing 103 verbs (which have known-good conjugations from the Aldrich book). ~80 of them fall in safe/moderate categories. If the engine produces identical forms, the engine is validated. Discrepancies reveal which form types need attention.

### Migration path

Over time, as the native speaker reviews engine-generated tables, verbs graduate from `null` to static. The `getConjugation` function automatically switches to static lookup. No code changes needed. Users never notice.

---

## Sub-Task C: Find verbs without example sentences

Write a script that cross-references the ALPS verbs sheet against the example sentences sheet and outputs all verbs needing examples, grouped by tier.

**Known gaps (from analysis):**

| Level | Missing examples |
|-------|-----------------|
| A | 19 verbs |
| B | 29 verbs |
| C | 66 verbs |

Full lists were generated in the Claude Project analysis session. The script should reproduce and verify these.

---

## Sub-Task D: Spaced Repetition — FSRS Implementation

### Why not SM-2

SM-2 (Anki's legacy algorithm) has known problems:
- Treats each card in isolation — no cross-card learning
- "Ease hell" — the Ease Factor degrades easily, rarely recovers
- Fixed initial intervals (1 day, 6 days) regardless of actual recall quality
- No memory model — just a multiplier that grows/shrinks

### FSRS (Free Spaced Repetition Scheduler)

FSRS is open-source (MIT license), based on the DSR model (Difficulty, Stability, Retrievability). It's what Anki now ships as its modern alternative to SM-2. Key concepts:

**Three components of memory (DSR model):**
- **Difficulty (D):** Inherent complexity of the material. Harder items gain stability more slowly.
- **Stability (S):** Time (in days) for recall probability to drop from 100% to 90%. Higher S = slower forgetting.
- **Retrievability (R):** Current probability of successful recall. Calculated from the forgetting curve:

```
R = exp(t × ln(0.9) / S)
```

Where `t` is days since last review and `S` is current stability.

**Key relationships (empirically validated from SuperMemo/MaiMemo data):**
- Higher S → smaller stability increase per review (diminishing returns on well-known material)
- Lower R at time of review → larger stability increase (harder retrieval = more learning)
- Higher D → smaller stability increase per review (hard items grow slower)
- Reviewing when R ≈ 100% can actually DECREASE stability (over-reviewing is harmful)
- SInc as a function of S follows a negative power function
- SInc as a function of R follows an exponential function
- These two effects counterbalance, producing approximately linear SInc growth over time

**Defining "mastered":** A verb is mastered when S ≥ threshold (e.g., S ≥ 30 days means the user can go a month before recall drops below 90%). This is far more meaningful than SM-2's "got it right X times in a row."

### Connection to Bjork & Bjork's Desirable Difficulties

The FSRS model directly implements Bjork's two-component theory (Bjork & Bjork, 1992):
- **Retrieval strength** = Retrievability (R) — current accessibility of a memory
- **Storage strength** = Stability (S) — how entrenched/interassociated a memory is

Bjork's core insight: "conditions that most rapidly increase retrieval strength differ from the conditions that maximize the gain of storage strength." In FSRS terms: conditions that keep R high (massed practice, easy quizzes) feel effective but don't grow S efficiently. Conditions that let R drop before review (spacing, effortful retrieval) feel harder but produce larger stability gains.

The FSRS data confirms this quantitatively — reviewing at R ≈ 100% produces SInc < 1 (stability actually decreases). The optimal zone for learning is R ≈ 70-85%.

**Desirable difficulties the app implements:**
- **Spacing:** FSRS schedules reviews at the interval where R drops to target retention (~90%) — not too early, not too late
- **Interleaving:** Quiz engine mixes verb forms across tenses, persons, and verbs rather than drilling one at a time. Bjork's research shows interleaving enhances both retention and transfer (63% vs 20% correct on delayed test in Rohrer & Taylor 2007)
- **Retrieval practice:** The quiz IS the learning event. Fill-in-the-blank conjugation = active retrieval, not passive re-exposure. Testing is more effective than restudying even without feedback (Bjork, 1975)
- **Variation:** Different sentence frames per verb per tense (our Option C design) = varied practice conditions. Bjork shows varied practice outperforms fixed practice even when tested at the fixed distance (Kerr & Booth, 1978)
- **Generation effect:** User must generate the conjugated form, not recognize it from a list. Generating answers produces stronger learning than being shown answers.

**Important caveat from Bjork:** Difficulties are only "desirable" if the learner has sufficient background to respond successfully. If difficulty exceeds the learner's ability, it becomes undesirable. This maps to our difficulty tier system — start learners with A-tier verbs, unlock B when A is mastered, etc.

### V1 Implementation (nuts and bolts)

For the initial implementation, we don't need the full FSRS optimizer or ML training. We need the core scheduling loop:

**Per-verb state in localStorage:**
```json
{
  "verb_id": 31,
  "D": 5.0,
  "S": 4.2,
  "last_review": "2026-03-28",
  "reps": 3,
  "lapses": 0
}
```

**On each quiz answer:**
1. Calculate current R from forgetting curve: `R = exp(t × ln(0.9) / S)` where t = days since last review
2. If correct: update S using stability increase formula (S_new = S × SInc, where SInc depends on D, S, R)
3. If incorrect: reset S to a lower value (lapse handling), increment lapses
4. Update D based on response pattern
5. Calculate next review date: solve for t when R drops to target retention (e.g., 0.9)

**Scheduling:**
- "Due for review" = R has dropped below target retention (e.g., 90%)
- "Mastered" = S ≥ mastery threshold (e.g., 21 or 30 days, configurable)
- Quiz mode prioritizes: (1) verbs due for review (lowest R first), (2) new verbs from unlocked tiers, (3) verbs approaching due date

**FSRS v5 default parameters** are published and the core algorithm is ~50 lines of code. The heavy ML optimization (training personalized parameters from user's own data) is a future enhancement.

### Future enhancements (not V1)
- Personalized FSRS parameters trained on user's own review data
- Per-tense tracking (user might master past tense before imperfect for a given verb)
- Optimal retention rate tuning (90% is default, but adjustable)
- Analytics dashboard showing forgetting curves, mastery progression, and review load forecasting
- SRS simulation for predicting when the user will have mastered their target verb set

---

## File Locations

- **XLSX workbook:** `Levantine_verbs.xlsx` (add to repo root)
- **Existing verb data:** 8 pipe-delimited `.txt` files (`verbs_001-020.txt` through `verbs_101-103.txt`)
- **JSON output:** `verbs.json` (generated by `pipe_to_json.py`)
- **Parser:** `pipe_to_json.py`

## Technical Notes

- Read XLSX with: `pip install openpyxl pandas` → `pd.read_excel('Levantine_verbs.xlsx', sheet_name='verbs')`
- The Forms sheet name has a trailing space: `sheet_name='forms '`
- The XLSX preserves Arabic script and transliteration diacritics perfectly — do not convert to CSV
- Existing pipe-delimited files V1–V20 have encoding issues (Mojibake) in the Arabic fields; V21+ are clean UTF-8. The XLSX is clean throughout.
- Transliteration conventions: 7=ح, 2=ء/ق, kh=خ, sh=ش, gh=غ, S=ص, T=ط, D=ض, Z=ظ, 3=ع

## Reference Material

- **FSRS algorithm:** https://github.com/open-spaced-repetition/fsrs4anki (MIT license)
- **FSRS tutorial:** "Spaced Repetition Algorithm: A Three-Day Journey from Novice to Expert" by Jarrett Ye (in project knowledge as PDF)
- **Desirable difficulties:** Bjork & Bjork (2011) "Making Things Hard on Yourself, But in a Good Way" (in project knowledge as PDF)
- **FSRS v5 parameters:** Published in the fsrs4anki repo wiki
