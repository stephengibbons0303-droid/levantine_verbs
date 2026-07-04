# Levantine Verbs — Software Architecture Document (SAD)

> Status: DRAFT — skeleton for completion
> Baseline documented: **Deployed PWA** — static client-side app on GitHub Pages, single-device, offline-capable. Server-dependent features (ASR fine-tuning, backend TTS, on-device LLM packaging) are **horizon / planned** and recorded as deltas in §7.3.
> Owner: {{OWNER}}
> Last reconciled against repo: {{DATE}} @ commit {{COMMIT}} on branch {{CANONICAL_BRANCH}}

---

## Conventions (do not delete)

Every architectural claim carries an evidence tag:

- `[IMPLEMENTED: path]` — verified present in the named source file(s).
- `[PLANNED: spec]` — intended, sourced from a named spec/handover; **not** yet in code.
- `[ASSUMPTION]` — inferred from context; requires human confirmation.
- `[GAP]` — unknown / unresolved; flagged for the owner.

Untagged factual claims are not permitted. Marketing language is not permitted.

**Out of scope for this document:** The ALPS 1,261-verb dictionary is a *content source*, not built data — do not document it as shipped unless verbs derived from it are present in `verbs.json`.

---

## 1. Introduction and Goals
<!-- One paragraph: what Levantine Verbs is (offline-first PWA for learning Levantine/Beirut-dialect Arabic verb conjugation via interleaved FSRS flashcards, built on the Aldrich 103-verb frequency core). State current scope (single-device, ~103 verbs, browser-based, no account/backend) and the horizon (PWA hub + child apps, speaking practice, on-device AI). No marketing. -->

### 1.1 Primary architectural goals
<!-- The 3–5 quality goals that actually shaped the design. Candidates: offline-first / zero-backend (works on a phone with no server, data local); single-device data ownership (localStorage + IndexedDB); modular extensibility (shared-origin hub + child PWAs added without breaking existing apps); pedagogical integrity (FSRS + interleaving + desirable difficulties); mobile-primary performance (Galaxy S22 budget). Rank them. -->

### 1.2 Stakeholders
<!-- Table: stakeholder | concern | what this SAD must give them. Cover: the learner (single primary user); the developer (Stephen); the native-speaker consultant (linguistic sign-off authority); Claude Code (delegated executor working from task specs). -->

---

## 2. Architecture Constraints
<!-- Hard constraints, not preferences. Each with source. -->

### 2.1 Technical constraints
<!-- Stack lock (React + Vite + Tailwind, vite-plugin-pwa); static hosting only (GitHub Pages → base-path constraint, no server-side compute, no secrets store); client-only persistence (localStorage + IndexedDB, no DB server); mobile target (Galaxy S22 / Snapdragon 8 Gen 1 / 8GB — on-device AI footprint budget ~160MB); content served as static asset (verbs.json). Tag each. -->

### 2.2 Linguistic / content constraints
<!-- Beirut dialect as standard; the transliteration system (Arabizi consonants + macron/acute/nasal vowels) as the canonical display layer; native-speaker sign-off required for risky-verb conjugations; carried-forward dialect invariants (h-dropping on possessive suffixes, vowel compression, "joum3a" for week, Friday feminine, telefōn, 3al-madrase vs b-il-madrase). [Flag any place code diverges from these as GAP.] -->

---

## 3. Context and Scope

### 3.1 System context
<!-- C4 Level 1 context diagram (Mermaid). Actor: the learner. External systems/dependencies: GitHub Pages (host), the browser storage layer, and (PLANNED) on-device model assets (Whisper, LFM2.5) + audio assets (Habibi-TTS). Show data direction. Keep it legible. -->

### 3.2 Technical context
<!-- Boundaries/interfaces: the app is self-contained at runtime (no network calls in baseline — confirm/flag as GAP if any fetch exists beyond static assets); PWA service worker + manifest; base-path handling for GitHub Pages subpath; (PLANNED) shared-origin data sharing across child PWAs. Record any unresolved hub-routing decision as [GAP]. -->

---

## 4. Solution Strategy
<!-- Half a page. Load-bearing decisions and why: zero-backend offline PWA (data local, no auth); FSRS v5 over SM-2; interleaving with user-controlled depth; tiered conjugation engine (runtime generation for safe/moderate verbs, static tables for risky verbs — conservative failure mode); Option C per-verb/per-tense sentence frames; (PLANNED) shared-origin hub-and-apps over a monolith; (PLANNED) binary-match ASR over open transcription; on-device AI over cloud. Point forward to §9 for decision records. -->

---

## 5. Building Block View

### 5.1 Level 1 — System decomposition
<!-- C4 container diagram (Mermaid): React UI | quiz/scheduling engine (FSRS + interleaving) | content layer (verbs.json + frames) | persistence (localStorage + IndexedDB) | service worker/PWA shell. Each box: responsibility + source location. Mark PLANNED containers (ASR module, on-device LLM, TTS, child PWAs). -->

### 5.2 Level 2 — Frontend modules
<!-- Decompose the React app as actually found: routing/shell, quiz engine, FSRS scheduler, interleaving selector, conjugation engine (tiered), frame insertion (frame_before/frame_after + pronoun/conjugation injection), English sentence builder, progress/dashboard, content islands. For each: responsibility, key entry points, source path. Tag IMPLEMENTED vs PLANNED per module. Flag the carried-forward bugs (transitive object pull-through; englishSentenceBuilder parts.person vs parts.pronoun; past-tense/adverb grammar) as [GAP] or [IMPLEMENTED-with-defect] against their source files. -->

### 5.3 Level 2 — Data model
<!-- The data as built. (a) Static content: verbs.json shape — verb fields, per-tense conjugations, example sentences + Arabizi, frame fields, difficulty level, topic. Derive the real schema from the file. (b) Runtime state: localStorage keys + IndexedDB stores (FSRS card state: Difficulty/Stability/Retrievability, review history, settings such as interleaving depth). Cite files. Note which store is canonical for progress. -->

### 5.4 Level 2 — Learning apps / activities inventory
<!-- Per activity: status (IMPLEMENTED/PLANNED/SPEC-ONLY), route, data touched, owning spec. Cover: Conjugation quiz (built); Dialogue reader (planned, /dialogue); Speaking activity + ASR binary match (planned, /speak); Vocab app (planned, /vocab); content islands (approved). Note the planned hub at the app root, with child apps as subpaths. -->

### 5.5 Progress & dashboards
<!-- Current progress tracking vs the planned expanded dashboard (topic radar, four-skills tracking, tier heat map). Status + source per view. -->

---

## 6. Runtime View
<!-- 3–4 key scenarios as Mermaid sequence diagrams, grounded in actual call paths. Suggested: (a) quiz attempt → answer graded → FSRS update (incl. confident-wrong remedial path, S×0.25) → IndexedDB write; (b) next-item selection → interleaving selector (depth-bounded) → frame assembly (frame_before + pronoun + conjugation + frame_after) → render; (c) conjugation lookup → tier routing (runtime generate vs static table); (d) PLANNED: speaking turn → TTS playback → learner read-aloud → Whisper binary match. Mark any PLANNED path. -->

---

## 7. Deployment View

### 7.1 Baseline deployment
<!-- The deployed PWA: GitHub Pages static host, GitHub Actions build/deploy, Vite base path, service worker caching, verbs.json as static asset, all state client-side. This is the canonical deployment this document describes. -->

### 7.2 Horizon deployment
<!-- The planned shape: shared-origin hub (app root) + child PWAs (/conjugate/, /dialogue/, /speak/, /vocab/) sharing localStorage/IndexedDB; on-device model assets (Whisper.cpp WASM and/or Capacitor native wrapper; LFM2.5 via GGUF/ONNX); audio assets (Habibi-TTS pre-generated static or backend). Note where a backend becomes unavoidable (e.g. live TTS) and tag the "no code change" portability claims with their evidence or [GAP]. -->

### 7.3 Current state vs target — DELTA TABLE
<!-- Reconciliation table. Columns: Concern | Target (baseline) | Current actual | Gap / action. Rows to include: deployed branch (canonical vs working branch); verb coverage (103 baseline vs ALPS expansion horizon); ASR (planned vs not wired); on-device LLM (planned vs not packaged); TTS (planned vs none); hub architecture (planned vs single app); known content/engine defects (transitive objects, English builder, interleaving verification). This is the living part of the document — regenerate at each increment. -->

---

## 8. Cross-cutting Concepts

### 8.1 Persistence & data lifecycle
<!-- localStorage vs IndexedDB split; what is canonical for progress; reset/migration behaviour; (PLANNED) cross-app shared origin. Flag data-loss risks (clearing browser storage). -->

### 8.2 Scheduling & pedagogy
<!-- FSRS v5 (DSR) parameters and quality grading; confident-wrong remedial path; interleaving depth control; content islands (non-assessed break cards every 8–12 items); Bjork desirable-difficulties framing. -->

### 8.3 Content pipeline & conjugation engine
<!-- Tiered engine (safe/moderate runtime, risky static + native-speaker sign-off — conservative failure mode is a guarded invariant, see below); Option C frame rule; transliteration system as display layer; native-speaker QA loop. -->

### 8.4 Speech (ASR/TTS) — PLANNED
<!-- Whisper binary-match approach (match against two known strings, not open transcription); Arabic-script training with Arabizi only at display; whisper.cpp WASM/native path; Habibi-TTS audio. All PLANNED — tag accordingly. -->

### 8.5 On-device AI — PLANNED
<!-- LFM2.5-350M for distractor generation / feedback / classification; footprint budget; GGUF/ONNX + Capacitor packaging. PLANNED. -->

### 8.6 PWA shell, build & observability
<!-- vite-plugin-pwa, manifest, service worker caching strategy, base-path handling, GitHub Actions pipeline. Any client-side logging/telemetry (likely none — flag as [GAP] if absent). -->

---

## 9. Architecture Decisions
<!-- Concise ADR list. One row each: ID | decision | status | rationale | superseded refs. Pull the locked ones: FSRS v5 over SM-2; binary-match ASR over open transcription; Arabic script for Whisper training (Arabizi post-hoc); local training over cloud GPU; tiered conjugation engine (conservative failure); Option C frames (frame_before = contextual/negative particles only); shared-origin hub over monolith; on-device LFM2.5 over Gemma (footprint); offline/zero-backend for single-device. Each references a source spec/handover. Open decisions go in as status=OPEN with the [GAP]. -->

---

## 10. Quality Requirements
<!-- Quality scenarios (stimulus → expected response → measure), not vague adjectives. Cover: offline availability; mobile performance budget (load/interaction on Galaxy S22); extensibility (add a child app without changing existing apps); content correctness (native-speaker sign-off gate); on-device AI footprint ceiling. Mark unmeasured ones [GAP]. -->

---

## 11. Risks and Technical Debt
<!-- Honest register: severity + owner + mitigation. Include: browser-storage data loss (no backup); single-device only (no sync); carried-forward defects (transitive object pull-through, English sentence builder person/pronoun bug, past-tense/adverb grammar, 2–3 verb topic-assignment mismatches); interleaving not fully verified post-patch; risky-verb static tables pending native-speaker sign-off; planned-feature footprint risk (Whisper + LFM2.5 on 8GB device); GitHub Pages base-path fragility. -->

## 12. Glossary
<!-- FSRS, DSR, SM-2, interleaving, desirable difficulties, content island, Option C frame, tiered conjugation engine, Arabizi/transliteration system, KLP-equivalent (per verb-tense card), binary-match ASR, PWA, service worker, Aldrich core, ALPS. One line each. -->
