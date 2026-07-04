# Claude Code Prompt — Generate the Levantine Verbs SAD

> Run with Opus 4.8 in Claude Code, from the repo root, on the canonical branch.
> Fill in the placeholders below before running.

---

## Inputs (fill before running)

- CANONICAL_BRANCH: {{e.g. main}}
- BASELINE: deployed PWA — static client-side app on GitHub Pages, single-device, offline-capable. (Local dev and any working/feature branch are recorded only as §7.3 deltas, never as the baseline.)
- SKELETON: `docs/architecture/LevantineVerbs_SAD_SKELETON.md` (place the skeleton here first)

---

## Task

Complete the Software Architecture Document by filling every section of the
skeleton at the SKELETON path. Write into a copy named `LevantineVerbs_SAD.md` in the same
directory. Do not alter the skeleton's section structure or the Conventions block.

The purpose of this document is to produce a **clear, evidenced map of what
actually exists** so a PRD can be written against it. Accuracy about
implemented-vs-planned matters more than completeness.

## How to work

1. **Establish ground truth first.** Before writing prose, inventory the repo:
   - Content: parse `verbs.json` → derive the real verb schema (fields, per-tense
     conjugations, example sentences + Arabizi, frame_before/frame_after,
     difficulty, topic). Count verbs actually present.
   - Frontend: enumerate React routes and components; identify the quiz engine,
     FSRS scheduler, interleaving selector, conjugation engine, frame insertion,
     English sentence builder, progress/dashboard.
   - Persistence: find every localStorage key and IndexedDB store actually used,
     and what each holds (FSRS card state, history, settings).
   - Build/deploy: Vite config + base path, vite-plugin-pwa / manifest / service
     worker, GitHub Actions workflow.
   - Read the canonical specs and handovers in project knowledge (the Option C
     frame specs, the transliteration guide, the latest session handover and
     key-next-steps docs, the Step 3 extended-verbs task). Use any PROGRESS-style
     handover as a *completion ledger only* — to decide IMPLEMENTED vs PLANNED and
     to flag code/doc disagreements, never as evidence of architecture.
     `[IMPLEMENTED]` tags must cite code.
   Produce this inventory as working notes before drafting.

2. **Tag every claim** per the skeleton's Conventions:
   `[IMPLEMENTED: path]`, `[PLANNED: spec]`, `[ASSUMPTION]`, `[GAP]`.
   A claim with no tag is a defect. If you cannot evidence something in code,
   it is `[PLANNED]`, `[ASSUMPTION]`, or `[GAP]` — never asserted as built.

3. **Baseline discipline.** The document describes the **deployed single-device
   PWA** as baseline. The hub-and-child-apps architecture, ASR, on-device LLM,
   TTS, and the ALPS verb expansion are **horizon/planned** — recorded in §7.2
   and the §7.3 delta table, never presented as the baseline. Do not present a
   working branch as the deployed state.

4. **Diagrams in Mermaid.** Context (§3.1), containers (§5.1), and runtime
   sequences (§6) as fenced Mermaid blocks. Legible, not exhaustive.

5. **Self-check before finishing.** Append a short report listing:
   - every `[GAP]` raised, grouped by section;
   - every `[ASSUMPTION]` the owner must confirm;
   - any place where code and a spec/handover disagree (state both, do not
     reconcile silently — flag for the owner). The known carried-forward defects
     (transitive object pull-through; englishSentenceBuilder person-vs-pronoun;
     past-tense/adverb grammar; 2–3 verb topic mismatches; interleaving not fully
     verified) must each be located in code and flagged here.

## Hard exclusions (violations are defects)

- **Ignore cross-project pollution.** Older notes/memory may contain unrelated
  concepts from other projects (e.g. an RSAF tutor, "SAIF", FastAPI/Azure/Postgres,
  xAPI/LRS/LTI, committee agents). None of it applies here. This project is a
  client-side Levantine Arabic verb PWA only — ignore any such references.
- Do not document the **ALPS 1,261-verb dictionary** as shipped content. It is a
  source for expansion; only verbs actually present in `verbs.json` are built.
- Do not present **ASR / on-device LLM / TTS** as implemented unless code is
  present. They are PLANNED.
- Do not invent non-functional requirements, SLAs, or metrics. If a quality
  requirement (§10) is not evidenced or specced, mark it `[GAP]`.
- Do not import marketing language. This is an engineering document.

## Guarded invariants

- **Conjugation engine failure mode is conservative**: safe/moderate verbs are
  generated at runtime; risky verbs use static tables requiring native-speaker
  sign-off. If code appears to generate risky-verb forms at runtime, do not
  "correct" the document to match — flag the contradiction as a `[GAP]`.
- **Option C frame rule**: `frame_before` is strictly for contextual/negative
  particles; engine-handled particles (ra7 / bedde / 3am) are inserted by the
  engine, never baked into frames. If code or data violates this, flag as `[GAP]`.

## Output

- `LevantineVerbs_SAD.md` — the completed document.
- The self-check report appended at the end under a `## Reconciliation Report`
  heading.

Do not push. Stop after writing the file and report the gap/assumption counts.
