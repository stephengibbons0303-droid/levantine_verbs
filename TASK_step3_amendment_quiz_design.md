# Step 3 Amendment: Confidence Slider, Distractor Redesign & Remedial Learning

**Date:** March 30, 2026  
**Amends:** TASK_step3_extended_verbs.md — Sub-Task D (FSRS) and Quiz Design  
**Status:** Design decisions finalized, pending Claude Code implementation

---

## 1. Pre-Submission Confidence Slider

### Design

Replace binary correct/incorrect scoring with a confidence slider that the user adjusts BEFORE submitting their answer. The slider sits below the four multiple-choice options.

```
┌─────────────────────────────────────┐
│  huwwe ________ il-ktēb mbēri7.     │
│                                     │
│  ○ dáras      ○ darásit             │
│  ○ dáfa3      ○ dafa3ít             │
│                                     │
│  ◄──●────────────────────────────►  │
│  Again   Hard     Good     Easy     │
│  (1)     (2)      (3)      (4)      │
│                                     │
│          [ Submit Answer ]          │
└─────────────────────────────────────┘
```

### Behavior

- Slider defaults to **Good (3)** on every new question — users who don't care about the slider can just tap an answer and submit with minimal friction
- User selects a multiple-choice answer AND sets the slider, then taps Submit
- Both signals (selected answer + confidence level) are captured simultaneously
- After submission, the correct answer is revealed and the FSRS state is updated using the 2×4 matrix below

### Semantics

This is a **pre-submission confidence rating**, not a post-retrieval judgment. The user is saying "how sure am I?" before seeing whether they're right. This gives us two independent signals per question that standard Anki/FSRS never gets: the confidence level (1-4) AND the binary outcome (correct/incorrect).

---

## 2. The 2×4 Confidence × Outcome Matrix

The confidence slider and the answer correctness combine into 8 possible states. Each maps to a specific FSRS rating and learning response:

| Confidence | Correct | Incorrect |
|---|---|---|
| **Easy (4)** | FSRS: Easy(4) — big S growth. User knew it cold. | **RED FLAG** — confident error. Triggers remedial path (see §3). S reset to lower than standard Again. D gets larger upward adjustment. |
| **Good (3)** | FSRS: Good(3) — normal S growth. Standard successful retrieval. | FSRS: Again(1) — standard stability reset. Normal lapse handling. |
| **Hard (2)** | FSRS: Hard(2) — small S growth. Effortful but successful retrieval. | FSRS: Again(1) — standard reset. Struggle was expected, user knew they were shaky. |
| **Again (1)** | FSRS: Hard(2) — lucky guess. Correct answer gets minimal credit because user self-reported no confidence. | FSRS: Again(1) — standard reset. User knew they didn't know it. Expected outcome. |

### Key design decisions in this matrix

**Correct + Again(1) → Hard(2), not Good(3):** A correct answer from a user who said "I'm guessing" should not receive full stability credit. The retrieval was not genuine — it was a 1-in-4 coin flip that happened to land right. Mapping to Hard(2) gives minimal S growth, which is honest.

**Incorrect + Easy(4) → worse than standard Again(1):** This is the only cell that triggers special handling. See §3 below. All other incorrect outcomes are standard Again(1) regardless of confidence, because the FSRS stability reset is the same — the difference is in the remedial response.

**Incorrect + Hard(2) vs Incorrect + Good(3):** Both map to Again(1) for FSRS purposes. The confidence signal is still logged and available for analytics (e.g., "this user frequently misjudges their confidence on Form II verbs"), but the scheduling impact is the same.

---

## 3. Confident Error: Remedial Learning Path

### Trigger

A quiz answer where confidence = Easy(4) AND the answer is incorrect.

### Why this needs special handling

A confident wrong answer is qualitatively different from an uncertain wrong answer. The user has a **strong but incorrect memory trace** — they retrieved the wrong form and felt sure about it. Simply showing the correct answer and moving on risks the incorrect trace persisting, because it has high storage strength in Bjork's terms. The wrong answer will keep competing with the correct one on future retrieval.

From Bjork & Bjork (2011): difficulties are only "desirable" if the learner has sufficient background to respond successfully. A confident error is evidence that the difficulty has become undesirable for this specific verb — the user doesn't just need spacing, they need active correction and overwriting of the bad trace.

However, Kornell, Hays & Bjork (2009) show that unsuccessful retrieval attempts enhance subsequent learning WHEN corrective feedback is given. So the remedial path isn't coddling — it's the mechanism that makes errors productive.

### Remedial sequence

Immediately after the incorrect answer is revealed (before the next normal quiz question), the app enters a focused correction micro-sequence for that specific verb:

**Step 1 — Correction display:**
Show the user's wrong answer alongside the correct answer with the full conjugation table visible. "You said darásit (I/you studied). The correct answer is dáras (he studied). Here's the full table for this tense." Linger for a minimum of 3 seconds before allowing progression.

**Step 2 — Immediate retrieval practice (2-3 follow-up questions):**
Serve 2-3 additional questions on the SAME verb but different tenses/persons. This forces the user to actively retrieve the correct forms multiple times, overwriting the bad trace. These questions use same-verb distractors only (not cross-verb) — the goal is conjugation correction, not comprehension testing.

**Step 3 — Return to normal flow:**
After the remedial questions, the quiz resumes its normal FSRS-scheduled sequence.

### FSRS state impact for confident errors

- **Stability:** Reset to a LOWER value than standard Again(1). Suggest S = S × 0.25 (compared to standard lapse reset which might use S × 0.5). The incorrect trace has high storage strength, so more aggressive re-exposure is needed.
- **Difficulty:** D gets a LARGER upward adjustment than a normal lapse. This verb is genuinely harder for this user than the algorithm estimated.
- **Tracking:** Add a `confident_errors` counter to the per-verb SRS state. If the same verb accumulates multiple confident errors, flag it as a "trouble verb" in the UI (Stats tab) for the user's awareness.

### Per-verb SRS state (updated from Sub-Task D)

```json
{
  "verb_id": 31,
  "D": 5.0,
  "S": 4.2,
  "last_review": "2026-03-28",
  "reps": 3,
  "lapses": 0,
  "confident_errors": 0,
  "state": "review"
}
```

---

## 4. Distractor Redesign: Cross-Verb 2×2 Format

### Problem with current design

Current quiz distractors are all conjugations of the same verb (e.g., dáras, darásit, byídrus, darásna). The user's cognitive task is only "which person/tense suffix is correct?" — they never need to identify the verb itself. This is a form of micro-blocking that removes the need for L2 comprehension.

In real-world Levantine Arabic, the challenge is: understand the situation, determine which verb is needed, AND conjugate it correctly — all simultaneously.

### New distractor format: 2×2 matrix

Each question presents four answers that form a 2×2 grid of (correct verb / wrong verb) × (correct conjugation / wrong conjugation):

| | Correct conjugation | Wrong conjugation |
|---|---|---|
| **Correct verb** | ✓ Answer | Distractor |
| **Wrong verb** | Distractor | Distractor |

**Example question:** "huwwe ________ il-ktēb mbēri7." (He _____ the book yesterday.)

| Answer | Type | What it tests |
|---|---|---|
| dáras | Correct verb, correct conjugation | — |
| darásit | Correct verb, wrong conjugation (I/you studied) | Conjugation skill — must know huwwe ≠ darásit |
| dáfa3 | Wrong verb, correct conjugation (he paid) | Comprehension skill — must understand context requires "study" not "pay" |
| dafa3ít | Wrong verb, wrong conjugation (I/you paid) | Both skills — can't shortcut by eliminating on one dimension alone |

### Why this structure prevents shortcuts

With same-verb distractors, recognizing one wrong suffix eliminates options. With the 2×2 format, recognizing that dafa3ít has the wrong suffix doesn't help — darásit ALSO has the wrong suffix but is the right verb. The user must solve both dimensions (which verb? which conjugation?) to answer correctly.

### Wrong verb selection: use the SAME wrong verb for both cross-verb distractors

If two different wrong verbs appeared, the user could think "the verb that appears twice is probably the target." With one wrong verb in two forms, the visual pattern is 2 daras options + 2 dafa3 options. No giveaway.

### Difficulty progression via distractor selection

**Low S (early encounters):** Pick a cross-verb from a semantically distant category. dáfa3 (pay) vs dáras (study) — easy to distinguish on meaning. The comprehension test is gentle, the conjugation test does the heavy lifting.

**High S (later encounters):** Pick a cross-verb that is semantically closer. fíhim (understand) vs dáras (study) in a sentence about books — now the comprehension test is genuinely challenging. Both verbs could plausibly relate to books. The Arabic sentence frame must disambiguate.

---

## 5. LLM-Assisted Distractor Categorization Pipeline

### The semantic closeness problem

You cannot randomly select cross-verb distractors. "huwwe ________ il-ktēb mbēri7" — if the algorithm randomly selects 2ara (read) as the "wrong" verb, "he read the book yesterday" is perfectly valid. The user picks it, gets marked wrong, and the question is broken.

With 1,261 verbs and contextual sentence frames mentioning everyday objects, locations, and activities, accidental semantic overlap is constant.

### The LLM reliability problem

Asking an LLM "which verbs DON'T fit this sentence?" is unreliable. LLMs hedge, find creative justifications, and tend to produce "interesting near-misses" rather than clearly wrong options. The model's helpfulness instinct works against the task.

### Solution: Flip the problem

Instead of asking "what's wrong?" (hard for LLMs), ask "what's right?" (LLMs are built for this). For each sentence frame, ask Claude to identify ALL verbs from the tier that could validly complete the sentence. Everything NOT on the list is a safe distractor.

### Three-category output per frame

For each sentence frame, the LLM produces two explicit categories. The third is implicit:

**Category 1 — Plausible:** Verbs that validly complete this sentence. These are NEVER used as distractors. Typically 1-5 verbs.

**Category 2 — Near miss:** Verbs that are semantically close to the context but don't quite work. These are distractors for HIGH-S reviews (harder questions as mastery grows). Typically 3-10 verbs.

**Category 3 — Remainder (implicit):** Every other verb in the tier that wasn't mentioned. These are distractors for LOW-S reviews (early encounters, easy elimination). This category is not stored — it's computed at runtime as: all tier verbs minus Category 1 minus Category 2.

### Prompt design

```
Given this Levantine Arabic sentence frame:
"huwwe ________ il-ktēb mbēri7."
(Context: He _____ the book yesterday.)

And this list of verbs at difficulty tier A:
[full verb list with English meanings]

CATEGORY 1 — PLAUSIBLE: List ALL verbs from the list that could 
validly and naturally complete this sentence in Levantine Arabic. 
Include any verb where a native speaker would consider the 
sentence correct and natural.

CATEGORY 2 — NEAR MISS: List verbs that are semantically related 
to the context (books, studying, reading, etc.) but would NOT 
produce a natural or correct sentence. These are "almost but not 
quite" fits.
```

### Failure mode analysis

**If Claude misses a valid verb (false negative on Category 1):** That verb ends up in the distractor pool. The user might pick it and get marked wrong for a debatably correct answer. Mitigation: native speaker spot-checks Category 1 lists. Spot-checking "these 3 verbs all work here, correct?" is much easier than reviewing "these 47 verbs all DON'T work here, correct?"

**If Claude over-includes a valid verb (false positive on Category 1):** That verb gets excluded from the distractor pool. We lose one potential distractor but never serve a broken question. The failure mode is conservative.

**If Claude misclassifies a near-miss as plausible:** Same as over-inclusion — conservative failure, we lose a good hard distractor but don't break anything.

**If Claude misclassifies a plausible verb as near-miss:** The verb becomes a hard distractor when it shouldn't be. This is the one dangerous failure mode, equivalent to missing a valid verb. Caught by native speaker review of Category 1.

### Batch processing

- Option C frames exist for verbs 1-40 (~8 frames per verb = ~320 frames)
- Verbs 41-103 need frames first
- New ALPS verbs need frames
- At ~50 frames per API call, current frames = ~7 calls
- Full 1,261 verbs at ~8 frames each = ~10,000 frames = ~200 calls
- Run once per frame at content creation time, store results permanently
- No runtime API cost, no internet needed on user's phone

### Storage format per frame

```json
{
  "verb_id": 31,
  "tense": "perfect",
  "frame_before": "",
  "frame_after": "il-ktēb mbēri7.",
  "plausible_verbs": [31, 74, 47],
  "near_miss_verbs": [69, 12, 77],
  "vocab_used": ["il-ktēb", "mbēri7"]
}
```

At runtime, the distractor algorithm:
1. Gets the current frame's `plausible_verbs` and `near_miss_verbs`
2. If verb S is LOW: pick wrong verb from Category 3 (remainder — semantically distant, easy)
3. If verb S is HIGH: pick wrong verb from Category 2 (near miss — semantically close, hard)
4. Never pick from Category 1 (plausible — would be a valid answer)

---

## 6. Phased Rollout

### V1: Ship now (same-verb distractors + confidence slider)

- Implement confidence slider with default Good(3)
- Implement 2×4 matrix for FSRS rating mapping
- Implement confident-error remedial path
- Keep same-verb distractors (current design) — all 4 options from target verb
- FSRS scheduling active with the confidence signal

This is a complete, shippable improvement over the current quiz. No dependency on cross-verb distractor infrastructure.

### V2: After Option C frame expansion

- Complete Option C frames for verbs 41-103
- Run LLM categorization batch on all completed frames (1-103)
- Switch to 2×2 distractor format for frames that have categorization data
- Fallback to same-verb distractors for any frame without categorization
- Category 3 distractors for low-S verbs, Category 2 for high-S verbs

### V3: Full ALPS verb set

- As new ALPS verbs get Option C frames, each batch goes through:
  1. Frame authoring
  2. Native speaker review
  3. LLM categorization batch
  4. Distractor pool stored
- This becomes the standard content pipeline for all new verbs

### Ongoing content pipeline (per batch of new verbs)

```
Author writes Option C frames
        ↓
Native speaker reviews frames for naturalness
        ↓
LLM categorization: plausible / near-miss / remainder per frame
        ↓
Native speaker spot-checks Category 1 (plausible) lists
        ↓
Approved frames + categorization merged into verbs.json
        ↓
Ship
```

---

## 7. Summary of Changes to Sub-Task D (FSRS)

These amendments extend the FSRS implementation specified in TASK_step3_extended_verbs.md:

| Component | Original spec | This amendment |
|---|---|---|
| Rating input | Binary correct/incorrect, mapped to Good(3)/Again(1) | 4-point confidence slider × binary outcome = 2×4 matrix |
| Slider UI | Not specified | Pre-submission slider below MC answers, defaults to Good(3) |
| Confident errors | Not specified | Remedial learning path: correction display → 2-3 same-verb follow-ups → return to normal flow |
| FSRS state | 7 fields | 8 fields (+confident_errors counter) |
| S reset on confident error | Standard Again(1) reset | Harsher reset: S × 0.25 instead of standard lapse factor |
| Distractor strategy | Not specified (inherits current same-verb) | V1: same-verb. V2: 2×2 cross-verb with LLM-categorized pools. V3: full pipeline |
| Distractor data | Not specified | Per-frame plausible_verbs + near_miss_verbs lists |
| Content pipeline | Not specified for distractors | Frame authoring → native review → LLM categorization → spot-check → ship |
