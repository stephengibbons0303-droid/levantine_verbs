# Levantine Verbs — Phased Roadmap (PRD Foundation)

> Consolidated from `session_handover_02_april_2026.md` (freshest), the March 31 handover, and `key_next_steps_15_march_2026.md`, with the PWA-hub and on-device-AI threads folded in from design notes.
>
> **Status caveat:** Phase/item statuses below reflect the April 2026 handovers. They are provisional and must be reconciled against the SAD once Claude Code runs it — treat the SAD output as the authoritative source of "what's actually built," then update this doc.
>
> **Status key:** ✅ Done · 🔧 In progress / pending verification · 📋 Specced, not built · 💡 Design note only (no spec yet) · 🌟 Aspirational

---

## Phase 0 — Foundation (largely complete)

| Item | Status | Notes |
|------|--------|-------|
| React/Vite/Tailwind PWA on GitHub Pages | ✅ | Live on phone |
| 1,301 verbs in Browse tab (tier badges, filters) | ✅ | verbs.json master |
| FSRS v5 SRS core | ✅ | fsrs.js, scheduler.js, srsState.js |
| Quiz with confidence slider (Again/Hard/Good/Easy) | ✅ | |
| Learner-friendly tense labels | ✅ | tenseLabels.js |
| SRS interleaving (1–10 cap slider, verb-range, New Verb) | 🔧 | Implemented; **not fully verified** post-patch |
| 112 A/BA verbs tagged across 8 topic groups | ✅ | 2–3 (7iDir, laa2a) need manual tagging |
| Option C frames, verbs 1–40 | ✅ | 41–103 outstanding (see Phase 2) |
| 494 Arabizi transliterations injected | ✅ | 494/494 matched |

---

## Phase 1 — Immediate fixes (Claude Code)

| Item | Status | Notes |
|------|--------|-------|
| Transitive verbs not pulling objects into prompts | 🔧 | Verify `quiz_objects` populated + `quizPromptBuilder.js` reads them; 47-verb table in task spec |
| Replace example sentence builder w/ filled-in quiz prompt + correct English | 📋 | Fixes English grammar bugs (past tense, adverb placement) in one move |
| Side panel: searchable + collapsible (all collapsed on open) | 📋 | QuickReference.jsx |
| Verify interleaving end-to-end | 🔧 | Fresh localStorage, "Daily routine", depth = 3 |
| Manual topic tags: 7iDir → communication, laa2a → actions | 📋 | One-liner edits in verbs.json |

---

## Phase 2 — Content authoring (back in Claude Project)

| Item | Status | Notes |
|------|--------|-------|
| Option C frames, verbs 41–103 | 📋 | ~8 frames/verb, native-speaker review. **Main bottleneck** — blocks V2 distractors |
| Option C frames, ALPS A/B verbs | 📋 | Same work for expansion set |
| Normalize ṭ/ʈ emphatic-T in source .txt | 📋 | Housekeeping; only matters if regenerating verbs.json |

**Open decision (carried from March):** vowel system — keep macrons / switch to doubled vowels / hybrid. Resolve before any bulk transliteration pass.

---

## Phase 3 — Assessment depth & feedback

| Item | Status | Notes |
|------|--------|-------|
| V2 cross-verb distractors | 📋 | Blocked on Phase 2 frames. LLM categorization (plausible/near-miss/remainder) → 2×2 format → difficulty scaling on S |
| Bloom's question-type progression | 💡 | MCQ frames (now) → typed fill-in-blank → matching → inverted MCQ |
| Topic tagging for B/C tier verbs | 📋 | Extend 8 topic groups as tiers unlock |
| Expanded dashboard | 📋 | Topic radar, four-skills tracking, tier heat map, session history |

---

## Phase 4 — Audio (listening + speaking)

| Item | Status | Notes |
|------|--------|-------|
| Habibi-TTS integration | 📋 | Pre-generate static audio for example sentences; speaker-icon placeholder already in UI. Needs backend or build-time generation |
| Listening component | 📋 | Hear phrase → pick A/B response. Comprehension, not error-spotting |
| Speaking component (prefab dialogues) | 📋 | 10–15 scenario trees, 2–4 exchanges, A/B verbs; offline fallback |
| Whisper ASR — binary matching | 🌟 | Match learner speech against two known strings (far easier than open transcription) |
| Whisper fine-tune (Levantine, Arabic script) | 🌟 | whisper-small + LoRA, local RTX 5090; whisper.cpp WASM/native for on-device. Three phases: pronunciation → repeat-after-me → audio prompts |

---

## Phase 5 — On-device AI & architecture (design notes, not yet specced)

| Item | Status | Notes |
|------|--------|-------|
| PWA hub architecture | 💡 | Root hub + child PWAs (`/conjugate/`, `/dialogue/`, `/speak/`, `/vocab/`) sharing localStorage/IndexedDB on shared origin; no backend for single-device |
| On-device LLM (LFM2.5-350M) | 💡 | Distractor generation, conjugation feedback, item classification; ~81MB; GGUF/ONNX + Capacitor wrapper. Total on-device AI budget ~160MB |
| AI dialogue missions (Claude API) | 🌟 | Free-form C+ dialogues using mastered verbs as summative assessment; requires internet; unlocks as mastery reward |

> **PRD note:** Phase 5 items live only in design notes, not in any handover roadmap. Capture them deliberately in the PRD rather than assuming they're committed scope.

---

## Phase 6 — Aspirational

| Item | Status | Notes |
|------|--------|-------|
| Gamification (XP, unlockables, visual rewards) | 🌟 | Explicitly deferred |

---

## Standing invariants (apply across all phases)

- **Conjugation engine, conservative failure mode:** safe/moderate verbs generated at runtime; risky verbs use static tables with native-speaker sign-off.
- **Option C frame rule:** `frame_before` is for contextual/negative particles only; engine inserts ra7 / bedde / lēzim / 3am.
- **Arabic script for Whisper training;** Arabizi only at the display layer.
- **Dialect flags:** h-dropping on possessive suffixes, vowel compression, "joum3a" for week, Friday feminine, telefōn, 3al-madrase (going to) vs b-il-madrase (at).
- **Spec before code:** Claude Code touches nothing without a reviewed spec.

---

## Open decisions to resolve in the PRD

1. Vowel system (macrons / doubled / hybrid).
2. Whether the deployed app makes any runtime network calls (decides offline-first claim — feeds SAD §3.2/§8).
3. Hub naming and routing scheme (root hub confirmed; child subpaths confirmed).
4. SAIF-native equivalent: there is none here — this is a single-user offline app; confirm no multi-user/sync ambition for the PRD scope.
