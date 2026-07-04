# Levantine Verbs — Product Requirements Document (PRD)

> Status: DRAFT v1 — first reconciled PRD. Supersedes [`LevantineVerbs_Roadmap_PRD_foundation.md`](LevantineVerbs_Roadmap_PRD_foundation.md) as the working product spec.
> Baseline of record: [`LevantineVerbs_SAD.md`](LevantineVerbs_SAD.md) @ commit `b227d0a` (the authoritative "what's actually built"). All statuses below are reconciled against it.
> Owner: Stephen (repo owner / sole developer). Content authority: native-speaker consultant.
> Date: 2026-06-23. The nine open decisions are **resolved** (§4).

> **How to read this doc:** §4 (decisions) and §8 (backlog) are the load-bearing parts — the backlog is the SAD Reconciliation Report turned into prioritized work. Everything else frames them.

---

## 1. Product overview & vision

Levantine Verbs is an **offline-first, single-device PWA for mastering Beirut-dialect Levantine Arabic verb conjugation** through spaced, interleaved retrieval practice. The learner browses a tiered verb catalogue and drills conjugations in an FSRS-scheduled quiz that adapts to their memory and penalises over-confidence. The product thesis is pedagogical: **FSRS scheduling + interleaving + desirable difficulties** (Bjork) produce durable recall better than blocked drilling or naive flashcards.

It runs entirely in the browser with no backend, no account, and no network dependency beyond loading its own content — installable to a phone home screen and fully usable offline.

## 2. Target user & context

- **Primary user:** a self-directed adult learner of spoken Beirut Levantine Arabic (the owner and learners like him), studying as a **daily habit on a phone**, often offline.
- **Content authority:** a **native-speaker consultant** who signs off conjugation correctness — the gate for any form the app teaches.
- **Usage shape:** short daily sessions; review-driven (the scheduler decides what to show); reads transliteration, does not type it.

## 3. Goals & non-goals

**Goals**
- G1. **Correctness first.** Never teach a wrong conjugation. Risky/irregular forms are native-speaker-signed before they reach a learner.
- G2. **Durable daily-habit scheduling.** FSRS-driven review that respects a daily cadence and punishes confident errors.
- G3. **Offline, single-device, zero-backend.** Works on a phone with no server and no data leaving the device.
- G4. **Usable coverage of the 1,301-verb set**, prioritised by tier (A→E).
- G5. **Maintainability** sufficient for a solo developer: no silent build drift, a content validator, and tests on the scheduling/engine core.

**Non-goals (explicitly out of scope for this PRD cycle)**
- N1. Multi-user, accounts, or cross-device sync (decision §4.9).
- N2. Cloud backend / server compute (zero-backend is architectural, decision §4.9).
- N3. Building the PWA hub + child apps (Phase 5 — design-note only, decision §4.8).
- N4. Speech (TTS/ASR) features (Phase 4 — not this cycle).
- N5. Gamification beyond the existing progress meter (Phase 6 — deferred).

## 4. Resolved product decisions

The nine open decisions (SAD §R.2 + foundation "Open decisions"), now closed. Each: **Decision · Why · Action.**

**4.1 Deployment — GitHub Pages from `/docs` on `main`. CONFIRM + automate.**
Why: the SAD's inference chain (base path + `outDir:'../docs'` + tracked `docs/`, no `gh-pages`, no workflow) is solid. The real exposure is that `docs/` is a hand-committed build artifact that can silently drift from `pwa/`.
Action: confirm the mode in *Settings → Pages*; then **add a minimal GitHub Action that builds `pwa/` and commits/publishes `docs/`** so drift becomes impossible. → Backlog B-CI.

**4.2 Scheduling granularity — keep per-verb now; per-tense is the leading v2 candidate.**
Why: per-verb was pragmatic, not pedagogically chosen, and is the weakest link (a verb's past vs its post-`bedde` form are genuinely different difficulties). But per-tense ~4× the card count and complicates interleaving; interleaving already forces tense variety within a verb.
Action: **keep per-verb through the content phase; log per-tense as a known limitation and the top v2 scheduling change** once content is stable. Do **not** rebuild now. → Backlog B-SCHED-V2 (deferred), documented limitation.

**4.3 Interval granularity — day-level, confirmed. No work.**
Why: `w[17]/w[18]` are FSRS sub-day learning steps — relevant to cram/same-session relearning, irrelevant to a daily-habit app.
Action: confirm day-granularity; **add a one-line code comment** marking `w[17]/w[18]` intentionally inert. → Backlog B-COMMENT.

**4.4 Performance / footprint targets — split them.**
Why: the Galaxy S22 is the owner's real device; the ~160 MB figure only has meaning once Whisper + LFM2.5 are real (Phase 5).
Action: **S22 = the real performance test target now**; **~160 MB = a provisional Phase-5 design constraint** to validate before committing to those models — it gates nothing today. → §7 NFRs.

**4.5 Free-practice vs SRS — retire the legacy free-practice path.**
Why: `quizGenerator.js` / `templates.js` / `exampleSentenceBuilder.js` are a second, worse copy of the sentence pipeline and hold most residual defects (baked-in objects, ungrammatical English, no FSRS).
Action: **remove the legacy free-practice path.** If a no-stakes practice mode is still wanted, reimplement it as **"SRS mode minus persistence,"** reusing `quizPromptBuilder` + `englishSentenceBuilder` + `english_forms`. Closes carried-forward defects #1 (residual) and #3 (free-practice) and removes a maintenance fork. → Backlog B-RETIRE.

**4.6 Beirut dialect + invariants — authoritative. CONFIRM + enforce.**
Why: it's the app's reason for existing and the consultant's working variety. The SAD shows none of it is enforced in code — pure hand-authoring discipline, which is how accented person-keys and non-scheme artifacts crept in.
Action: confirm the standard; **add a content validator** (canonical person-key set, transliteration-scheme conformance, dialect-flag checks) run over `verbs.json`. → Backlog B-VALIDATOR.

**4.7 Vowel system — macrons. CLOSED.**
Why: already in the data, compact, and the consultant reviews in them. The doubled-vowel argument is keyboard-typeability — irrelevant, since learners *read* these, not type them. The accented-vs-bare person-key bug shows mixing notations causes silent failures; effort belongs on normalising person-keys, not re-spelling vowels.
Action: **macrons, decision closed.** No bulk transliteration pass. (Reinforces B-PERSONKEYS.)

**4.8 Hub naming + routing — don't build now; when built, one app/one origin/one SW.**
Why: Phase 5, design-note only. Separate child PWAs at subpaths fight over service-worker scope and shared storage.
Action: **defer the hub.** When built: a single app on one origin with one service worker, **using the already-declared `react-router-dom`** — "hub" as a home route, Conjugate/Dialogue/Speak/Vocab as nested routes, base path stays `/levantine_verbs/`. Naming is non-blocking → deferred. → Roadmap Phase 5.

**4.9 Single-user, no sync — confirmed; add backup insurance.**
Why: the entire zero-backend architecture rests on single-user; sync would break it and is out of scope. But the SAD's data-loss risk is real — clearing browser storage wipes everything.
Action: **stay single-user**; **add JSON export/import of `srs_state`** as cheap insurance. Keeps zero-backend intact while removing the catastrophic-loss failure mode. → Backlog B-EXPORT.

## 5. Current-state baseline (reconciled)

Authoritative detail in the SAD; the essentials and the corrections to the foundation roadmap:

- **Content:** 1,301 verbs in `verbs.json`. **~1,001 are SRS-eligible**; **~300 are silently unreachable** (no `root_letters`, incl. **18 tier-A and 27 tier-B**). ~103–108 are fully hand-authored; the rest rely on the runtime engine. [SAD §5.3]
- **What's actually built:** Browse (filters + tier badges), an SRS quiz (FSRS v5, confidence slider, confident-error remedial), a free-practice quiz (to be retired), and an SRS dashboard. Single SPA, in-memory tab nav (no router yet). [SAD §5.2, §5.4]
- **Foundation-roadmap corrections** (status was provisional, now reconciled):

| Foundation claim | Reconciled truth |
|---|---|
| "React/Vite/**Tailwind**" | No Tailwind; hand-written CSS |
| "Option C frames, verbs 1–40 ✅" | Frame fields **absent from data & code** (0/1301); only `.md` specs exist — not wired in |
| "Replace example sentence builder 📋" | **Done on the SRS path**; old free-practice builder remains & still buggy |
| "Side panel searchable + collapsible 📋" | **Already done** (`QuickReference.jsx`) |
| Invariant "conservative failure mode" | **Violated** — ~131 irregular verbs generated unsigned |
| Invariant "engine inserts …/3am" | `3am` **never emitted in SRS** |

## 6. Functional requirements

Priority tags: **[MUST]** this cycle · **[SHOULD]** this cycle if capacity · **[LATER]** future phase.

**Content & data model**
- FR-1 [MUST] Every tier-A and tier-B verb is SRS-eligible (has usable conjugations) — close the ~300 (esp. 18 A / 27 B) coverage gap by adding `root_letters` or static tables. [SAD §5.3]
- FR-2 [MUST] `verbs.json` passes a content validator: canonical person-keys only, transliteration-scheme conformance, valid difficulty tier (A–E; no `CB/DA/DC/EB/EC`), valid topic. [§4.6]
- FR-3 [SHOULD] Correct the known topic mis-assignments (`2idir`/7iDir→communication, `laa2a`→actions, plus `khálla`, `2assar`, `sa7ab`). [SAD §5.3]

**Conjugation engine (correctness gate — G1)**
- FR-4 [MUST] The engine must **not** runtime-generate irregular/weak/geminate verbs from sound-root templates. Such verbs are flagged risky and served only from static, native-speaker-signed tables; if no signed table exists, the verb is withheld from quizzing rather than shown wrong. [SAD §8.3 — fixes the invariant breach]
- FR-5 [MUST] Introduce an explicit risk/verification marker in the data (e.g. `verified` / `risk`) that the engine consults for routing — replacing the current "comments-only" tiering. [SAD §8.3]
- FR-6 [SHOULD] `3am` (progressive) is available as an SRS particle frame. [SAD §8.3]

**Quiz / SRS**
- FR-7 [MUST] Retire the legacy free-practice path; if retained, a practice mode is "SRS minus persistence" reusing the SRS prompt/English builders. [§4.5]
- FR-8 [MUST] Confident-error answers trigger the remedial sequence; remedial follow-ups **either** feed FSRS **or** are explicitly documented as non-scoring (resolve the current silent gap). [SAD §8.2]
- FR-9 [SHOULD] Interleaving behaves to spec (no same verb+tense consecutively; depth cap respected) and is covered by deterministic tests. [§8 B-TESTS]

**Scheduling**
- FR-10 [MUST] Scheduling stays per-verb; the limitation is documented and per-tense is tracked as the v2 candidate. [§4.2]
- FR-11 [MUST] Intervals are day-granular; `w[17]/w[18]` marked intentionally inert. [§4.3]

**Browse / Dashboard**
- FR-12 [MUST] Dashboard stats are computed by a single source of truth (dedupe the divergent `srsState`/`SRSDashboard` logic). [SAD §5.5]
- FR-13 [LATER] Expanded dashboard (topic radar, four-skills, tier heat map, session history). [Foundation Phase 3]

**Persistence & data safety**
- FR-14 [MUST] Learner can export and re-import `srs_state` as a JSON file (manual backup/restore). [§4.9]

**Build / deploy**
- FR-15 [MUST] A CI step builds `pwa/` and publishes `docs/`, eliminating manual-build drift. [§4.1]

## 7. Non-functional requirements

- NFR-1 **Offline availability:** all core flows (browse, quiz, schedule, save, export) work with no network after first load. [SAD §3.2]
- NFR-2 **Performance:** target device is the **Galaxy S22**; cold load and quiz interaction must be smooth there. (Define a concrete budget during implementation; currently unmeasured.) [§4.4]
- NFR-3 **Correctness gate:** no conjugation reaches a learner without either mechanical-safety (regular forms) or native-speaker sign-off (risky forms). [G1, §4.6]
- NFR-4 **Content integrity:** `verbs.json` changes are validated automatically, not by discipline. [§4.6]
- NFR-5 **Data durability:** no single action (short of deliberate export-less storage wipe) causes irrecoverable progress loss; export/import is the mitigation. [§4.9]
- NFR-6 **Maintainability:** scheduling/engine core has unit tests; no dead second-copy pipelines; CI guards build drift. [G5]
- NFR-7 **Footprint (provisional, Phase 5):** on-device AI assets ≤ ~160 MB — a design constraint to validate before adopting Whisper/LFM2.5, not a current gate. [§4.4]

## 8. Backlog (the SAD Reconciliation Report, prioritised)

**P0 — correctness & data-loss (do first)**
- **B-RISKGATE** — Stop runtime-generating the ~131 irregular verbs; add a `verified`/`risk` marker; route risky → static signed tables or withhold. *(FR-4, FR-5; SAD §8.3)* — **the single highest-value fix.**
- **B-COVERAGE** — Backfill the ~300 SRS-unreachable verbs (start with the 18 A + 27 B) with `root_letters` or static conjugations. *(FR-1; SAD §5.3)*
- **B-EXPORT** — JSON export/import of `srs_state`. *(FR-14; §4.9)*

**P1 — quality, cleanup, integrity**
- **B-RETIRE** — Remove the legacy free-practice path (or reimplement as SRS-minus-persistence). Closes defects #1-residual & #3. *(FR-7; §4.5)*
- **B-PERSONKEYS** — Fix the `ni7na`/`nihna` reflexive bug and normalise all person-keys (accented→canonical) across static data; eliminates silent lookup misses. *(defect #2; SAD §5.3)*
- **B-VALIDATOR** — Content validator (person-keys, translit scheme, tiers, topics, dialect flags). *(FR-2; §4.6)*
- **B-CI** — GitHub Action: build `pwa/` → publish `docs/`. *(FR-15; §4.1)*
- **B-TOPICS** — Fix topic mis-assignments. *(FR-3; SAD §5.3)*
- **B-TIERS** — Normalise the 5 compound difficulty tiers (`CB/DA/DC/EB/EC`). *(SAD §5.3)*
- **B-STATS** — Dedupe divergent dashboard stats logic. *(FR-12; SAD §5.5)*
- **B-TESTS** — Deterministic scheduler/FSRS/conjugation tests (inject RNG); verify interleaving end-to-end. *(FR-9; SAD §5.2)*

**P2 — hygiene & small fixes**
- **B-3AM** — Add `3am` progressive particle to SRS prompts. *(FR-6)*
- **B-REMEDIAL** — Decide remedial follow-ups feed FSRS, or document as non-scoring. *(FR-8)*
- **B-COMMENT** — Comment marking FSRS `w[17]/w[18]` intentionally inert. *(§4.3)*
- **B-ROUTER** — Resolve the unused `react-router-dom`: remove now, or keep with a note pending the Phase-5 hub. *(§4.8)*
- **B-SCHED-V2** *(deferred)* — Per-tense scheduling design. *(§4.2)*

## 9. Reconciled roadmap

Foundation Phases 0–6, re-judged against ground truth and the decisions:

- **Phase 0 — Foundation:** ✅ largely done. Corrections: no Tailwind; Option C frames are **not** wired into data/code (spec-only); side-panel search/collapse **done**. Interleaving present but unverified (→ B-TESTS).
- **Phase 1 — Immediate fixes:** now reframed by §4. Done: side panel; English builder on SRS path. **This cycle:** B-RISKGATE, B-COVERAGE, B-EXPORT, B-RETIRE, B-PERSONKEYS, B-VALIDATOR, B-CI, B-TOPICS, B-TIERS, B-STATS, B-TESTS.
- **Phase 2 — Content authoring:** Option C frames for verbs 41–103 and ALPS A/B — **the main bottleneck**, blocks V2 distractors; native-speaker review. Vowel decision **closed (macrons)**.
- **Phase 3 — Assessment depth:** V2 cross-verb distractors (blocked on Phase 2); Bloom's question-type progression; B/C-tier topic tagging; expanded dashboard (FR-13).
- **Phase 4 — Audio (listening/speaking):** Habibi-TTS, listening, prefab speaking dialogues; Whisper binary-match ASR. All [LATER].
- **Phase 5 — On-device AI & hub:** design-note only. Hub = single app/one origin/one SW via `react-router-dom` nested routes (§4.8); LFM2.5 on-device; validate the ~160 MB budget (§4.4) before committing. Capture deliberately as scope, not assumed-committed.
- **Phase 6 — Gamification:** deferred.

## 10. Success metrics

Single-user + no telemetry constrains measurement to what's inspectable in-app or in data:
- M1. **Coverage:** % of tier-A/B verbs SRS-eligible → target 100% (FR-1). *(measurable from data)*
- M2. **Correctness gate:** % of risky verbs either signed-off or withheld (zero unsigned risky verbs quizzable) → target 100% (FR-4). *(measurable from data)*
- M3. **Data safety:** export/import available and verified round-trip (FR-14). *(binary)*
- M4. **Build integrity:** `docs/` always matches `pwa/` build (CI enforced, FR-15). *(binary)*
- M5. **Engine confidence:** scheduler/FSRS/conjugation covered by passing tests (FR-9, B-TESTS). *(binary)*
- M6 [LATER]. Retention/habit metrics would require opt-in local analytics — out of scope now (no telemetry by design).

## 11. Open / deferred items

- Hub naming (deferred; non-blocking — §4.8).
- Per-tense scheduling design (v2 candidate — §4.2 / B-SCHED-V2).
- Concrete S22 performance budget (define during implementation — NFR-2).
- ~160 MB on-device-AI footprint (validate at Phase 5 — NFR-7).
- Confirm GitHub Pages mode in repo Settings (§4.1) and the dialect standard with the consultant (§4.6) — both expected to confirm.

## Appendix — traceability

Decisions §4.1–4.9 ↔ backlog (B-CI, B-SCHED-V2, B-COMMENT, NFRs, B-RETIRE, B-VALIDATOR/B-PERSONKEYS, B-ROUTER, B-EXPORT) ↔ SAD sections (§3.2, §5.2/5.3/5.5, §8.2/8.3, §R.2/R.5, §11). The PRD backlog is the SAD Reconciliation Report made actionable; the SAD remains the evidence base.
