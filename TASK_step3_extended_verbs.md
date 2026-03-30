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

## Three Sub-Tasks

### Sub-Task A: Assign difficulty levels to existing 103 verbs

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

**Implementation:** In `verbs.json`, add `"difficulty": "A"` (or B/C/D/E/BA) to each verb object. The `pipe_to_json.py` parser should also be updated to support an optional difficulty field, or the field can be injected post-generation.

For hybrid levels like "BA", treat as the higher tier (B) for quiz filtering purposes.

---

### Sub-Task B: Evaluate the conjugation engine question

**Question we need to answer:** For the ~1,158 NEW verbs from ALPS (1,261 minus ~103 overlap), should we:

1. **Pre-generate full conjugation tables** (like our existing 103) and store them in JSON, OR
2. **Build a conjugation engine** that takes a verb root + form classification and generates conjugations on the fly using the 38 form templates in the Forms sheet?

**Data available in the XLSX Forms sheet:**
- 38 conjugation tables covering all form types (IA, IB, IC, ID, II, III, IV, V, VI, VII, VIII, IX, X, Quadrilateral, Emphatic Quad, Irregular unique)
- Each table has 8 persons × 3 tenses (past, present, imperative) = 24 forms
- Each form type has regular + irregular sub-variants (medial weak, final weak, final geminate, initial wāw, etc.)

**What the ALPS verbs sheet provides per verb:**
- Level (A–E)
- English meaning
- Transitive/Intransitive/Both
- Transliteration (past/present)
- Form classification (e.g., "Form II", "Form IC, Irr., final weak")
- Arabic (present and past)

**What it does NOT provide per verb:** Full 8-person × all-tense conjugation tables.

**Recommendation from data analysis:** A conjugation engine is the right call. Pre-generating 1,261 × 24+ forms manually is impractical. The form templates are systematic enough to be rule-based. However:
- Irregular verbs (unique irregulars like 2ija, 2akhad, keen) need hardcoded tables — these already exist for our 103
- The engine should be a Python utility that outputs the same JSON structure as our existing verb data
- Test it against our existing 103 verbs (which have known-good conjugations) as validation

**Action for Claude Code:** Review the Forms sheet structure, prototype a conjugation engine, and validate against existing `verbs.json` entries.

---

### Sub-Task C: Find verbs without example sentences

The ALPS workbook has an "example sentences" sheet with 937 sentences. Many A/B/C verbs lack examples.

**Missing example sentences (A/B/C verbs):**

**Level A — 19 missing:**
2akal, 2ara/2iri, 2assar, ballash, barad, jala, jei3, jeib, t2akhkhar, t3ashsha, t7ammam, tarak, tfaDDal, tghadda, ti3ib, trawwa2, tsalla, ttaSal, tzakkar

**Level B — 29 missing:**
2akhkhar, 2akkad, 7assan, ba3at, baTTal, bala3, baram, bayyaD, baza2, bi2y, biky, btasam, jabar, jarrab, sala2, t3arraf, t3awwad, t7arrash, t7assan, tSaala7, tTalla3, tfarraj, tghayyar, tjawwaz, tkhaana2, tlei2a, tsaTTa7, ttafa2, twaffa2

**Level C — 66 missing:**
(full list in analysis above)

**Action for Claude Code:** Write a script that cross-references the verbs sheet against the example sentences sheet and outputs the full list of verbs needing examples, grouped by level. This will be used to prioritize sentence writing.

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
