# Architecture & product docs — Levantine Verbs

Reverse-engineered spec + roadmap for this app, authored **2026-06-23** against commit `b227d0a`.
Banked onto `main` from the (unmerged) `claude/crazy-gates-d40230` worktree branch so the source-of-truth
documents have a home in the repo rather than a lone local branch.

- **`LevantineVerbs_PRD.md`** — Product Requirements (reconciled v1). §4 (resolved decisions) and §8
  (prioritized backlog) are the load-bearing parts.
- **`LevantineVerbs_SAD.md`** — Software Architecture Document, evidence-tagged with `file:line`. §8.3 is the
  conjugation-correctness gap (irregular verbs generated from sound-root templates).
- `LevantineVerbs_Roadmap_PRD_foundation.md` — earlier roadmap, superseded by the PRD.
- `LevantineVerbs_SAD_SKELETON.md`, `LevantineVerbs_SAD_claude_code_prompt.md` — scaffolding used to produce
  the SAD.

**Status — a June-23 snapshot, not live truth.** Some of the backlog is already done: the free-practice quiz
path was retired (FSRS-only), and the SAD §8.3 correctness gap has a **Phase 0 withhold gate shipped** (see
`pwa/scripts/verify-risk-gate.mjs`, which withholds the ~145 irregular verbs that generated wrong forms).
Treat the **PRD §8 backlog** as the reference to-do list; the still-open items (geminate/final-weak templates,
the 300 uncovered verbs, `srs_state` export/import, a CI action for `docs/` drift, a content validator, etc.)
remain to be done.
