# Levantine Arabic Verb Conjugation Data

A structured dataset of Lebanese Arabic verb conjugations for language learning applications.

## Structure

```
levantine-verbs/
├── data/
│   ├── verbs.json          # Main verb database
│   └── ocr/                 # Source OCR markdown files
│       ├── verbs_001-010.md
│       └── ...
├── schemas/
│   └── verb_schema.json    # JSON schema for validation
├── tools/
│   ├── app.py              # Streamlit editor/tester
│   └── validate.py         # JSON validation script
└── android/                # Android project (future)
```

## Quick Start

```bash
# Install dependencies
pip install -r requirements.txt

# Run Streamlit app
streamlit run tools/app.py
```

## Verb Data Schema

Each verb contains:
- **verb**: Arabic, transliteration, English meaning
- **classification**: Measure (I-X), type (sound/hollow/defective/etc.), root
- **conjugations**: Perfect, imperfect, bi-imperfect, imperative
- **bedde**: "Want to" constructions with negatives
- **active_participle**: State/status forms (m/f/pl)
- **examples**: Contextual sentences by tense

## Data Entry Workflow

1. OCR source material → `data/ocr/verbs_XXX-XXX.md`
2. Use Streamlit app to enter/edit verbs
3. Validate with `python tools/validate.py`
4. Export for Android app

## License

Data extracted from "Levantine Arabic Verbs" by Matthew Aldrich (Lingualism).
For personal/educational use.
