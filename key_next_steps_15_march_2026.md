# Key Next Steps — Conjugate This, Conjugate That

**Date:** March 15, 2026

---

## 1. Transliteration System Switch

Switch from the current IPA-adjacent system to the Aldrich book's simpler system. This is a bulk find-and-replace across all verb data files, example sentence files, and verbs.json.

### Character Mapping (Current → New)

| Current | New | Arabic | Notes |
|---------|-----|--------|-------|
| ɧ | 7 | ح | Haa2 — number-based, Arabizi-friendly |
| ʔ | 2 | ء/ق | Hamzeh / Qaaf (when glottalized) |
| x | kh | خ | Khaa2 — digraph, more intuitive |
| š | sh | ش | Shiin — standard English digraph |
| ɣ | gh | غ | Ghayn — digraph |
| ş | S | ص | Saad — uppercase = emphatic |
| ʈ | T | ط | Taa2 — uppercase = emphatic |
| ɖ | D | ض | Daad — uppercase = emphatic |
| ʐ | Z | ظ | Zaa2 — uppercase = emphatic |
| 3 | 3 | ع | 3ayn — **no change** |

### Vowel System — TBD
Current system uses macrons (ā ē ī ō ū) for long vowels and acute accents (á í ú) for stressed short vowels. The Aldrich book doubles vowels for length (aa, ee, ii, oo, uu). Need to decide:
- Keep macrons (more compact, already in data)?
- Switch to doubled vowels (more accessible, no special characters)?
- Hybrid?

### Scope
- All 8 pipe-delimited verb `.txt` files
- All transliterated example sentence `.md` files (001–103)
- `verbs.json` (generated from pipe_to_json.py)
- `transliteration_guide.md`
- Any hardcoded strings in the app UI

---

## 2. Quiz Question Improvements

### Current State
Questions are bare-bones fill-in-the-blank with minimal context:
- `ínti ________ kil yom` (you (f) every day)
- `íntu ________ mberih` (you (pl) yesterday)
- `fík ________` (you (m) can)
- `ta-________` (in order to)
- `kirmēl________` (so that)
- `ínta ra7 ________` (you (m) will)

These work structurally but are repetitive and don't teach vocabulary beyond the verb itself.

### Proposed Improvements

**A. Expand time phrase vocabulary**
Replace the 3 rotating indicators (yesterday, every day, tomorrow) with a wider pool:

| Tense | Phrases to draw from |
|-------|---------------------|
| Past | mbēri7 (yesterday), min usbū3 (a week ago), hal-Subī7 (this morning), 2abil shwayy (a little while ago), min zamēn (a long time ago), lēlit mbēri7 (last night), hal-shahr (this month), 2abil yomēn (two days ago) |
| Present/habitual | kil yom (every day), dēyman (always), 3ēdatan (usually), kil usbū3 (every week), ba3D iD-Duhur (in the afternoon), iS-Sub7 (in the morning), b-il-lēl (at night), kil marra (every time) |
| Future | bukra (tomorrow), ba3d bukra (day after tomorrow), hal-jum3a (this Friday), ij-jēy (next/coming), ba3d shwayy (in a little while), is-sēne ij-jēye (next year), b-il-3uTle (during the holiday) |

**B. Introduce basic vocabulary into question frames**
Add location, activity, and object words so questions teach more than just the verb:

| Category | Example words |
|----------|-------------|
| Locations | b-il-bēt (at home), b-il-maTbakh (in the kitchen), 3al-madrase (at school), b-is-sū2 (at the market), b-il-maktab (at the office), 3al-ba7r (at the beach), b-il-maT3am (at the restaurant) |
| Objects | il-akil (the food), il-ktēb (the book), is-sayyēra (the car), it-talafōn (the phone), il-maSēri (the money), il-2ahwe (the coffee), il-bēb (the door) |
| People | ma3 rfē2ētak (with your friends), ma3 ahlo (with his family), la-bayyo (for his dad), ma3 ukhto (with his sister) |
| Activities/manner | b-sur3a (quickly), bi-hadēye (quietly), sawa (together), la-wa7do (alone) |

**C. Question template variety**
Instead of always `[pronoun] ________ [time]`, use varied frames:
- `[pronoun] ________ [object] [location]` — "ínta ________ il-bēb" (you ___ the door)
- `[time], [pronoun] ________ [location]` — "mbēri7, huwwe ________ 3al-maktab"
- `[pronoun] ________ [object] ma3 [person]` — "hiyye ________ 2ahwe ma3 rfē2ēta"
- `lēzim [pronoun] ________` — "lēzim ínta ________" (you must ___)
- `[pronoun] 7abb ________` — desire + imperfect

---

## 3. Extended Verb Set + Difficulty Categories

### Source
ALPS Spoken Levantine Arabic Verbs Dictionary — to be extracted and added to the existing 103 verbs.

### Difficulty Categories

| Category | Description | Approximate count |
|----------|-------------|-------------------|
| A | Core essential verbs — highest frequency, needed for basic conversation | ~25-30 |
| B | High frequency — common in daily life | ~30-40 |
| C | Medium frequency — useful but less essential | ~30-40 |
| D | Lower frequency — specific contexts | ~30-40 |
| E | Rare / literary / specialized | remainder |

### Implementation
- Add a `difficulty` field (A–E) to each verb in verbs.json
- Quiz mode filters by difficulty: start with A, unlock B when A is mastered, etc.
- Browse mode can filter/sort by difficulty
- Existing 103 verbs need to be categorized A–E
- New verbs from ALPS dictionary extracted and added in same pipe-delimited format

---

## 4. Speaking & Listening

### Listening Component
- User hears a spoken Levantine Arabic phrase
- Responds by selecting from limited multiple choice (A or B only)
- Focus: comprehension + appropriate response selection
- NOT about spotting errors — about fluency and natural response

### Speaking Component
- Scenario-based short utterance exchanges
- Focused situations: supermarket, restaurant with family, introductions, small talk, directions, ordering food, etc.
- User speaks a response, app evaluates

### Architecture Decision: Prefabricated vs Live AI

| Approach | Pros | Cons |
|----------|------|------|
| **Prefabricated dialogues** | Works offline, predictable quality, no API cost, faster response, can be carefully curated for difficulty level | Limited variety, can feel repetitive, hard to scale scenarios |
| **Live AI (Claude API)** | Infinite variety, adaptive difficulty, natural conversation flow, can respond to unexpected inputs | Requires internet, API costs, latency, harder to control quality/difficulty, needs careful prompting |
| **Hybrid (recommended)** | Prefab for core scenarios (A/B difficulty), AI for advanced free-form (C+ difficulty). Prefab acts as fallback when offline. AI dialogues unlock as reward for mastery. | More complex to build, two systems to maintain |

### Recommended Hybrid Approach
1. **Phase 1 — Prefabricated:** Build 10-15 scenario dialogue trees (2-4 exchanges each) using mastered vocabulary. Each node has audio (Habibi-TTS) + 2 response options. Covers categories A and B verbs.
2. **Phase 2 — AI Missions:** Claude API dialogue missions that use the learner's mastered verb list. Passing a mission = summative assessment, unlocks next level. Requires internet.

### TTS Status
- Habibi-TTS (F5-TTS backbone, Apache 2.0, `--dialect LEV`) identified but not yet integrated
- Option: pre-generate static audio for prefab dialogues, live TTS for AI missions

### ASR Status
- Fine-tuned Whisper Large v3 (Levantine, ~2,200 hours) on HuggingFace
- whisper.cpp for on-device inference
- Fuzzy matching against expected forms for evaluation

---

## Priority Order

1. **Transliteration switch** — foundational, affects everything else
2. **Quiz question improvements** — biggest UX impact for current users
3. **Difficulty categories** — enables progression system
4. **Speaking & listening (prefab phase)** — major feature add
5. **AI dialogue missions** — aspirational, builds on everything above
