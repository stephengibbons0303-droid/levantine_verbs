# Streamlit → PWA Migration Spec

## Overview

Convert the existing Streamlit verb conjugation app (`tools/app.py`) into a React Progressive Web App hosted on GitHub Pages. The PWA targets mobile Android as the primary viewport.

---

## Current State

**Repo:** GitHub (user will provide URL)  
**Stack:** Python/Streamlit  
**Data:** 103 Lebanese Arabic verbs in pipe-delimited `.txt` files (currently in project knowledge — see below). `verbs.json` is empty.  
**Parsers:** `scripts/pipe_to_json.py` (pipe → JSON), `scripts/md_to_json.py` (markdown → JSON)  
**Schema:** `schemas/verb_schema.json`

### Existing Streamlit Features (to replicate)

1. **Browse** — filter verbs by measure/type, view full conjugation tables (perfect, imperfect, bi-imperfect, imperative), active participles
2. **Import** — pipe-delimited txt upload → parse → merge into verbs.json (data management: delete/clear by ID range)
3. **Quiz** — three modes:
   - Conjugation (fill-in-the-blank with sentence templates, pronoun + tense context)
   - Arabic → English
   - English → Arabic
   - Tense selector: all / perfect / bi-imperfect / imperfect
   - Imperfect questions use particle context (baddi, raḥ, 3am, fiyyi, la-, etc.)
   - Lightsaber progress bar (gamification)
4. **Stats** — verb count, bar charts by measure and type

---

## Step 0: Generate verbs.json

The 103 verbs exist as pipe-delimited `.txt` files. These are currently stored in this Claude project's knowledge base. The files are:

- `verbs_001-020.txt`
- `verbs_021-040.txt`
- `verbs_041-058.txt`
- `verbs_059-060.txt`
- `verbs_061-080.txt`
- `verbs_081-084.txt`
- `verbs_085-100.txt`
- `verbs_101-103.txt`

**Action:** Download these from the Claude project, then run the existing parser to generate the JSON:

```bash
cat verbs_*.txt > all_verbs.txt
python scripts/pipe_to_json.py all_verbs.txt -o data/verbs.json
```

Verify output: should contain 103 verb objects. Commit `data/verbs.json` to the repo. This is the permanent data store — GitHub Pages serves it as a static asset.

### Why commit JSON to repo?

- GitHub Pages is static — no server, no database
- Verb data rarely changes (only when adding new verbs from the book)
- The app fetches `verbs.json` at load time via relative URL
- User progress/scores stored in `localStorage` or `IndexedDB` on device
- To update verbs: re-run parser locally, commit updated JSON, push

---

## Step 1: Scaffold React PWA

### Tech Stack

- **React 18** (create with Vite)
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Vite PWA plugin** (`vite-plugin-pwa`) for service worker + manifest
- **localStorage** for user progress/scores persistence

### Project Structure

```
src/
├── main.jsx
├── App.jsx
├── index.css              # Tailwind imports
├── data/
│   └── verbs.json         # Committed verb data (imported at build time)
├── components/
│   ├── Layout.jsx         # Bottom nav, header
│   ├── VerbCard.jsx       # Single verb conjugation display
│   ├── QuizQuestion.jsx   # Multiple choice question component
│   ├── ProgressBar.jsx    # Lightsaber or progress indicator
│   └── FilterBar.jsx      # Measure/type filter controls
├── pages/
│   ├── Browse.jsx         # Verb browser with filters
│   ├── Quiz.jsx           # Quiz engine
│   └── Stats.jsx          # Statistics dashboard
├── hooks/
│   ├── useVerbs.js        # Load + filter verbs
│   ├── useQuiz.js         # Quiz state machine
│   └── useProgress.js     # localStorage progress tracking
└── utils/
    ├── quizGenerator.js   # Port quiz generation logic from app.py
    ├── templates.js       # Sentence templates (VERB_TEMPLATES, IMPERFECT_TEMPLATES)
    └── constants.js       # Person labels, transliterations, etc.
public/
├── manifest.json
├── icons/                 # PWA icons (192x192, 512x512)
└── verbs.json             # Also served statically as fallback
```

### Vite Config

```js
// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/REPO_NAME/',  // Required for GitHub Pages subdirectory
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Conjugate This, Conjugate That',
        short_name: 'Conjugate',
        description: 'Lebanese Arabic verb conjugation practice',
        theme_color: '#1a1a2e',
        background_color: '#0d0d1a',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,json,png,svg,woff2}']
      }
    })
  ]
})
```

---

## Step 2: Port Features

### 2a. Browse Page

- Filter dropdowns: measure (I–X, Iq, IIq) and type (sound, hollow, defective, etc.)
- Verb list: show `id. translit — english`
- Tap verb → expand to show full conjugation table
- Table layout: 8 rows (pronouns) × columns per tense
- Toggle: Arabic script / transliteration
- Active participle section below conjugation table
- Notes and example sentences collapsible

### 2b. Quiz Page

Port the quiz generation logic from `app.py` lines ~380–620. Key mechanics:

- **Conjugation mode:** pick random verb + random person + random tense → show prompt with sentence template, 4 multiple choice options from same tense
- **Imperfect tense:** use particle/auxiliary context (baddi, fiyyi, raḥ, 3am, la-, ḥatta, kirmēl) — port `IMPERFECT_TEMPLATES` dict
- **Arabic↔English mode:** simple word matching with distractors from other verbs
- Answer feedback: show correct answer + transliteration/arabic alt
- Score tracking per session
- Sentence templates per verb: port `VERB_TEMPLATES` dict for contextual fill-in-the-blank

**Quiz settings (mobile-first UI):**
- Quiz type selector (Conjugation / Arabic→English / English→Arabic)
- Tense selector (All / Past / Present / Dependent)
- Question count slider (5–20)
- Arabic script toggle

### 2c. Stats Page

- Total verb count
- Bar chart by measure (use a lightweight chart lib or CSS bars)
- Bar chart by type
- Future: per-verb mastery tracking from localStorage

---

## Step 3: Mobile-First Design

### Layout

- **Bottom navigation bar** with 3 tabs: Browse, Quiz, Stats
- Full-width cards, large touch targets (min 48px)
- RTL-aware text rendering for Arabic (use `dir="rtl"` on Arabic text spans)
- Dark theme default (matches the lightsaber aesthetic)

### Typography

- Arabic text: system Arabic font stack (`'Noto Sans Arabic', 'Segoe UI', sans-serif`)
- Transliteration: monospace or distinctive Latin font
- English: clean sans-serif

### Viewport

```html
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
```

---

## Step 4: GitHub Pages Deployment

### GitHub Actions (`.github/workflows/deploy.yml`)

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run build
      - uses: actions/configure-pages@v4
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist
      - uses: actions/deploy-pages@v4
```

### Repo Settings

- Enable GitHub Pages → Source: GitHub Actions
- Set `base` in `vite.config.js` to match repo name

---

## Step 5: PWA Install Experience

- Service worker caches all assets + verbs.json for offline use
- "Add to Home Screen" prompt on Android
- Standalone display mode (no browser chrome)
- Splash screen with app icon

---

## What NOT to Port (yet)

- **Import/Editor tab** — not needed in PWA; data managed via repo commits
- **Lightsaber CSS** — replace with a cleaner mobile progress indicator (can revisit)
- **Verb-specific sentence templates** — port the 10 verbs that have custom templates, use generic fallback for the rest
- **bedde conjugation display** — include in data but defer UI to later phase
- **Dialogue missions / AI features** — future phase
- **Habibi TTS integration** — future phase (see below)

---

## Future: Habibi TTS Integration

**Model:** Habibi-TTS — first open-source unified-dialectal Arabic TTS. Built on F5-TTS architecture by Shanghai Jiao Tong University's X-LANCE Lab. Outperforms ElevenLabs' commercial service on dialect generation quality.

**Why it matters:** Supports Levantine Arabic directly via `--dialect LEV` flag. Covers 20+ Arabic dialects including MSA, SAU, UAE, ALG, IRQ, EGY, MAR, OMN, TUN, LEV, SDN, LBY.

**Installation:**
```bash
pip install habibi-tts
```

**CLI usage:**
```bash
# Levantine dialect inference
habibi-tts_infer-cli \
  --ref_audio "assets/LEV.mp3" \
  --ref_text "reference text in Arabic" \
  --gen_text "text to synthesize" \
  --dialect LEV
```

**GUI:** `habibi-tts_infer-gradio` launches a Gradio web interface.

**Resources:**
- GitHub: https://github.com/SWivid/Habibi-TTS
- HuggingFace: https://huggingface.co/SWivid/Habibi-TTS
- Paper: arXiv:2601.13802

**Architecture note:** This is a heavy model requiring GPU inference. Cannot run client-side in a PWA. Integration options:
1. Self-hosted API server (e.g. a small GPU VPS running the model behind a REST endpoint)
2. Pre-generate audio for all verb forms + example sentences, commit as static `.mp3` files (most practical for V1)
3. Hybrid: pre-generate common forms, on-demand API for dialogue missions

**Licensing:** LEV model released under Apache 2.0 (free for any use). Some other dialect models (SAU, UAE) are CC-BY-NC-SA-4.0.

---

## Data Flow Summary

```
verbs_*.txt (pipe-delimited, in Claude project knowledge)
    ↓ python scripts/pipe_to_json.py
data/verbs.json (committed to GitHub repo)
    ↓ fetched at app load / cached by service worker
React app state (useVerbs hook)
    ↓
Quiz / Browse / Stats pages
    ↓
User progress → localStorage on device
```

---

## Quick Reference: Key Files to Port From

| Streamlit Source | What to Extract | PWA Target |
|---|---|---|
| `tools/app.py` lines 1–50 | Constants, person labels, transliterations | `src/utils/constants.js` |
| `tools/app.py` VERB_TEMPLATES dict | Sentence templates per verb | `src/utils/templates.js` |
| `tools/app.py` IMPERFECT_TEMPLATES dict | Particle/auxiliary contexts | `src/utils/templates.js` |
| `tools/app.py` generate_quiz() | Quiz question generation | `src/utils/quizGenerator.js` |
| `tools/app.py` display_verb() | Conjugation table rendering | `src/components/VerbCard.jsx` |
| `tools/app.py` page_stats() | Stats calculations | `src/pages/Stats.jsx` |
| `scripts/pipe_to_json.py` | Verb data parser | Run once locally, commit output |
| `schemas/verb_schema.json` | Data validation | Keep for reference |
