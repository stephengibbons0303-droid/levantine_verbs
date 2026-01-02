"""
Levantine Arabic Verb Editor & Quiz Tester
Run: streamlit run tools/app.py
"""

import streamlit as st
import json
from pathlib import Path
import random
import sys

# Add scripts directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent / "scripts"))
from pipe_to_json import parse_pipe_content

# Paths
DATA_DIR = Path(__file__).parent.parent / "data"
VERBS_FILE = DATA_DIR / "verbs.json"

PERSONS = ["ana", "nihna", "inta", "inti", "intu", "huwwe", "hiyye", "hinne"]
PERSON_LABELS = {
    "ana": "I", "nihna": "we", "inta": "you (m)", "inti": "you (f)",
    "intu": "you (pl)", "huwwe": "he", "hiyye": "she", "hinne": "they"
}
# Transliterated pronouns for quiz display
PERSON_TRANSLIT = {
    "ana": "ána", "nihna": "níḥna", "inta": "ínta", "inti": "ínti",
    "intu": "íntu", "huwwe": "húwwe", "hiyye": "híyye", "hinne": "hínne"
}

# ---------- Data Loading ----------
@st.cache_data
def load_verbs():
    if VERBS_FILE.exists():
        with open(VERBS_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
            return data if isinstance(data, list) else [data]
    return []

def save_verbs(verbs):
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    with open(VERBS_FILE, "w", encoding="utf-8") as f:
        json.dump(verbs, f, ensure_ascii=False, indent=2)
    st.cache_data.clear()

# ---------- Pages ----------
def page_browse():
    st.header("📚 Browse Verbs")
    verbs = load_verbs()
    
    if not verbs:
        st.warning("No verbs loaded. Add verbs in the Editor tab.")
        return
    
    # Filters
    col1, col2 = st.columns(2)
    with col1:
        measures = sorted(set(v["classification"]["measure"] for v in verbs))
        filter_measure = st.selectbox("Filter by Measure", ["All"] + measures)
    with col2:
        types = sorted(set(v["classification"]["type"] for v in verbs))
        filter_type = st.selectbox("Filter by Type", ["All"] + types)
    
    filtered = verbs
    if filter_measure != "All":
        filtered = [v for v in filtered if v["classification"]["measure"] == filter_measure]
    if filter_type != "All":
        filtered = [v for v in filtered if v["classification"]["type"] == filter_type]
    
    st.write(f"Showing {len(filtered)} of {len(verbs)} verbs")
    
    # Verb selector
    verb_options = {f"{v['id']:03d}. {v['verb']['translit']} - {v['verb']['english']}": v for v in filtered}
    selected = st.selectbox("Select verb", list(verb_options.keys()))
    
    if selected:
        verb = verb_options[selected]
        display_verb(verb)

def display_verb(verb):
    st.subheader(f"{verb['verb']['arabic']} ({verb['verb']['translit']}) - {verb['verb']['english']}")
    st.caption(f"Measure {verb['classification']['measure']} | {verb['classification']['type']} | Root: {verb['classification']['root']}")
    
    # Conjugation tables
    for tense in ["perfect", "imperfect", "bi_imperfect", "imperative"]:
        if tense in verb.get("conjugations", {}):
            conj = verb["conjugations"][tense]
            st.markdown(f"**{conj.get('label', tense)}**")
            
            forms = conj.get("forms", [])
            cols = st.columns(4)
            for i, form in enumerate(forms):
                with cols[i % 4]:
                    st.write(f"**{form['person']}**: {form['arabic']}")
                    st.caption(form['translit'])
    
    # Active participle
    if "active_participle" in verb:
        st.markdown("**Active Participle**")
        ap = verb["active_participle"].get("forms", {})
        cols = st.columns(3)
        for i, gender in enumerate(["masculine", "feminine", "plural"]):
            if gender in ap:
                with cols[i]:
                    st.write(f"**{gender}**: {ap[gender]['arabic']}")
                    st.caption(ap[gender]['translit'])

def page_converter():
    st.header("📤 Verb Importer")
    st.caption("Upload pipe-delimited verb data (from NotebookLM) to add verbs to the database")

    existing_verbs = load_verbs()
    existing_arabic = {v["verb"]["arabic"] for v in existing_verbs}
    max_id = max((v["id"] for v in existing_verbs), default=0)

    # File uploader
    uploaded_file = st.file_uploader("Upload verb data file", type=["txt"])

    if uploaded_file is not None:
        content = uploaded_file.read().decode("utf-8")

        # Parse the pipe-delimited content
        try:
            parsed_verbs, skipped = parse_pipe_content(content)
        except Exception as e:
            st.error(f"❌ Error parsing file: {e}")
            return

        if not parsed_verbs and not skipped:
            st.error("❌ **Format Error**: No verbs found in the uploaded file.")
            st.info("Make sure the format matches the expected pipe-delimited format (see below).")
            return

        st.divider()

        # Parsing results section
        st.subheader("📋 Parsing Results")

        col1, col2 = st.columns(2)
        with col1:
            st.metric("Successfully parsed", len(parsed_verbs))
        with col2:
            st.metric("Skipped (incomplete)", len(skipped))

        if parsed_verbs and not skipped:
            st.success(f"✅ **All verbs parsed successfully!**")
        elif parsed_verbs and skipped:
            st.warning(f"⚠️ **{len(skipped)} verb(s) skipped due to incomplete data**")
        else:
            st.error(f"❌ **No valid verbs found** — all {len(skipped)} verb(s) had issues")

        # Show skipped verbs
        if skipped:
            with st.expander(f"View {len(skipped)} skipped verb(s)", expanded=True):
                for s in skipped:
                    st.markdown(f"⚠️ **{s['arabic']}** — {s['english']}")
                    for issue in s['issues']:
                        st.caption(f"   └─ {issue}")

        # Show parsed verbs
        if parsed_verbs:
            with st.expander(f"View {len(parsed_verbs)} parsed verb(s)"):
                for verb in parsed_verbs:
                    arabic = verb["verb"]["arabic"]
                    english = verb["verb"]["english"]
                    translit = verb["verb"]["translit"]
                    conj = verb.get("conjugations", {})
                    perf_count = len(conj.get("perfect", {}).get("forms", []))
                    imp_count = len(conj.get("imperative", {}).get("forms", []))
                    part_count = len(verb.get("active_participle", {}).get("forms", {}))

                    st.markdown(f"✅ **{arabic}** ({translit}) — {english}")
                    st.caption(f"   └─ perfect: {perf_count}, imperative: {imp_count}, participle: {part_count}")

        if not parsed_verbs:
            return

        st.divider()

        # Analyze for duplicates
        new_verbs = []
        duplicates = []

        for verb in parsed_verbs:
            if verb["verb"]["arabic"] in existing_arabic:
                existing = next(v for v in existing_verbs if v["verb"]["arabic"] == verb["verb"]["arabic"])
                duplicates.append((verb, existing))
            else:
                new_verbs.append(verb)

        # Preview section
        st.subheader("📊 Import Preview")

        col1, col2, col3 = st.columns(3)
        with col1:
            st.metric("Current verbs", len(existing_verbs))
        with col2:
            st.metric("New to add", len(new_verbs))
        with col3:
            st.metric("After import", len(existing_verbs) + len(new_verbs))

        # New verbs
        if new_verbs:
            st.success(f"**{len(new_verbs)} new verb(s) will be added:**")
            for verb in new_verbs:
                st.write(f"• {verb['verb']['arabic']} ({verb['verb']['translit']}) — {verb['verb']['english']}")

        # Duplicates
        if duplicates:
            st.warning(f"**{len(duplicates)} duplicate(s) will be skipped:**")
            for new_verb, existing in duplicates:
                st.write(f"• {new_verb['verb']['arabic']} — already exists as ID {existing['id']}")

        if not new_verbs and not duplicates:
            st.info("No verbs to process.")

        st.divider()

        # Import button
        if new_verbs:
            if st.button("💾 Import to verbs.json", type="primary"):
                # Assign new IDs
                for i, verb in enumerate(new_verbs):
                    verb["id"] = max_id + 1 + i

                # Merge and save
                merged = existing_verbs + new_verbs
                save_verbs(merged)

                st.success(f"✅ **Successfully imported {len(new_verbs)} verb(s) to verbs.json!**")

                # Show what was added
                st.info("**Added:**")
                for verb in new_verbs:
                    st.write(f"• ID {verb['id']}: {verb['verb']['arabic']} ({verb['verb']['translit']}) — {verb['verb']['english']}")

                st.balloons()
        elif duplicates and not new_verbs:
            st.info("All verbs already exist in the database. Nothing to import.")

    # Show expected format
    with st.expander("📖 Expected Format (from NotebookLM)"):
        st.markdown("""
**Pipe-delimited format** — one line per field, verbs separated by `---`

```
VERB|number|arabic|transliteration|english|classification
PERFECT|person|translit|arabic
(8 rows: ana, nihna, inta, inti, intu, huwwe, hiyye, hinne)
IMPERFECT|person|translit|arabic
(8 rows)
BI_IMPERFECT|person|translit|arabic
(8 rows)
IMPERATIVE|person|translit|arabic
(3 rows: inta, inti, intu — or IMPERATIVE|NONE if no imperative)
PARTICIPLE|gender|translit|arabic
(3 rows: m, f, pl — or PARTICIPLE|NONE if no participle)
NOTE|note text
---
```

**Example:**
```
VERB|2|أخد|Paxad|to take|irregular measure I
PERFECT|ana|Paxádit|أَخَدت
PERFECT|nihna|Paxádna|أَخَدنا
...
IMPERATIVE|inta|xud|خُد
IMPERATIVE|inti|xidi|خدي
IMPERATIVE|intu|xidu|خدوا
PARTICIPLE|m|Pēxid|آخد
PARTICIPLE|f|Pēxdi|آخدة
PARTICIPLE|pl|Pēxdīn|آخدين
NOTE|The imperfect forms have a long vowel.
---
```
        """)

def page_quiz():
    st.header("🎯 Quiz Tester")
    verbs = load_verbs()

    if not verbs:
        st.warning("No verbs loaded.")
        return

    # Quiz settings
    col1, col2, col3 = st.columns(3)
    with col1:
        quiz_type = st.selectbox("Quiz Type", ["Conjugation", "Arabic → English", "English → Arabic"])
    with col2:
        num_questions = st.slider("Questions", 5, 20, 10)
    with col3:
        use_arabic_script = st.checkbox("Show Arabic script", value=False)

    if st.button("Start Quiz"):
        st.session_state.quiz_questions = generate_quiz(verbs, quiz_type, num_questions, use_arabic_script)
        st.session_state.quiz_idx = 0
        st.session_state.quiz_score = 0
        st.session_state.lightsaber_level = 0  # Track lightsaber progress (0-100)
        st.session_state.max_level = num_questions  # Need this many correct to fill
        st.session_state.use_arabic_script = use_arabic_script

    if "quiz_questions" in st.session_state:
        run_quiz()

# Verb-specific sentence templates with natural collocations
# Tense markers: bi_imperfect = kil yom (every day), perfect = mberih (yesterday)
# Format: verb_arabic -> {tense -> [(ar_template, translit_template, en_template), ...]}
VERB_TEMPLATES = {
    "إجا": {  # to come
        "bi_imperfect": [
            ("_____ عالبيت كل يوم", "_____ 3al-beit kil yom", "_____ come home every day"),
            ("_____ عالشغل كل يوم", "_____ 3ash-shighl kil yom", "_____ come to work every day"),
            ("_____ لعندي كل أسبوع", "_____ la3indi kil isbu3", "_____ come to my place every week"),
        ],
        "perfect": [
            ("_____ عالبيت مبارح", "_____ 3al-beit mberih", "_____ came home yesterday"),
            ("_____ لعندي مبارح", "_____ la3indi mberih", "_____ came to my place yesterday"),
        ],
    },
    "أخَذ": {  # to take
        "bi_imperfect": [
            ("_____ الباص كل يوم", "_____ il-baS kil yom", "_____ take the bus every day"),
            ("_____ الدوا كل يوم", "_____ id-dawa kil yom", "_____ take medicine every day"),
            ("_____ قهوة كل صبح", "_____ ahwe kil Subih", "_____ have coffee every morning"),
        ],
        "perfect": [
            ("_____ الباص مبارح", "_____ il-baS mberih", "_____ took the bus yesterday"),
            ("_____ الكتاب مبارح", "_____ il-kteb mberih", "_____ took the book yesterday"),
        ],
    },
    "أعْلَن": {  # to announce
        "bi_imperfect": [
            ("_____ الأخبار كل يوم", "_____ il-akhbar kil yom", "_____ announce news every day"),
            ("_____ النتائج كل أسبوع", "_____ in-nateyij kil isbu3", "_____ announce results every week"),
        ],
        "perfect": [
            ("_____ الخبر مبارح", "_____ il-khabar mberih", "_____ announced the news yesterday"),
            ("_____ خطوبتن مبارح", "_____ khaTubton mberih", "_____ announced their engagement yesterday"),
        ],
    },
    "أكَل": {  # to eat
        "bi_imperfect": [
            ("_____ الفطور كل يوم", "_____ il-fTur kil yom", "_____ eat breakfast every day"),
            ("_____ فلافل كل يوم", "_____ falafel kil yom", "_____ eat falafel every day"),
            ("_____ بالمطعم كل جمعة", "_____ bil-maT3am kil jum3a", "_____ eat at the restaurant every Friday"),
        ],
        "perfect": [
            ("_____ الفطور مبارح", "_____ il-fTur mberih", "_____ ate breakfast yesterday"),
            ("_____ شاورما مبارح", "_____ shawarma mberih", "_____ ate shawarma yesterday"),
            ("_____ عند ستي مبارح", "_____ 3ind sitti mberih", "_____ ate at grandma's yesterday"),
        ],
    },
    "أمَر": {  # to order
        "bi_imperfect": [
            ("_____ قهوة كل يوم", "_____ ahwe kil yom", "_____ order coffee every day"),
            ("_____ أكل كل يوم", "_____ akil kil yom", "_____ order food every day"),
            ("_____ من المطعم كل أسبوع", "_____ min il-maT3am kil isbu3", "_____ order from the restaurant every week"),
        ],
        "perfect": [
            ("_____ قهوة مبارح", "_____ ahwe mberih", "_____ ordered coffee yesterday"),
            ("_____ شاورما مبارح", "_____ shawarma mberih", "_____ ordered shawarma yesterday"),
        ],
    },
    "باع": {  # to sell
        "bi_imperfect": [
            ("_____ خضرة كل يوم", "_____ khaDra kil yom", "_____ sell vegetables every day"),
            ("_____ بالسوق كل يوم", "_____ bis-su2 kil yom", "_____ sell at the market every day"),
        ],
        "perfect": [
            ("_____ السيارة مبارح", "_____ is-sayyara mberih", "_____ sold the car yesterday"),
            ("_____ البيت مبارح", "_____ il-beit mberih", "_____ sold the house yesterday"),
        ],
    },
    "بَرَم": {  # to turn/wander
        "bi_imperfect": [
            ("_____ بالسوق كل يوم", "_____ bis-su2 kil yom", "_____ wander the market every day"),
            ("_____ بالضيعة كل أسبوع", "_____ bid-Day3a kil isbu3", "_____ wander the village every week"),
        ],
        "perfect": [
            ("_____ بالسوق مبارح", "_____ bis-su2 mberih", "_____ wandered the market yesterday"),
            ("_____ بكل المحلات مبارح", "_____ b-kil il-maHallat mberih", "_____ visited all the shops yesterday"),
        ],
    },
    "بِقي": {  # to stay/become
        "bi_imperfect": [
            ("_____ بالبيت كل يوم", "_____ bil-beit kil yom", "_____ stay home every day"),
            ("_____ هادي كل يوم", "_____ hadi kil yom", "_____ stay calm every day"),
        ],
        "perfect": [
            ("_____ بالبيت مبارح", "_____ bil-beit mberih", "_____ stayed home yesterday"),
            ("_____ عند صحابي مبارح", "_____ 3ind SHabi mberih", "_____ stayed at friends' yesterday"),
        ],
    },
    "بَلَّش": {  # to begin
        "bi_imperfect": [
            ("_____ الشغل كل يوم", "_____ ish-shighl kil yom", "_____ start work every day"),
            ("_____ الدرس كل يوم", "_____ id-daris kil yom", "_____ start the lesson every day"),
        ],
        "perfect": [
            ("_____ الشغل مبارح", "_____ ish-shighl mberih", "_____ started work yesterday"),
            ("_____ يدرس عربي مبارح", "_____ yidrus 3arabi mberih", "_____ started studying Arabic yesterday"),
        ],
    },
    "تَرَك": {  # to leave
        "bi_imperfect": [
            ("_____ الشغل الساعة خمسة كل يوم", "_____ ish-shighl is-se3a khamse kil yom", "_____ leave work at five every day"),
            ("_____ البيت كل صبح", "_____ il-beit kil Subih", "_____ leave home every morning"),
        ],
        "perfect": [
            ("_____ الشغل مبارح", "_____ ish-shighl mberih", "_____ left work yesterday"),
            ("_____ التدخين مبارح", "_____ it-tadkhin mberih", "_____ quit smoking yesterday"),
        ],
    },
}

# Fallback generic templates if verb not found
GENERIC_TEMPLATES = {
    "bi_imperfect": [
        ("_____ كل يوم", "_____ kil yom", "_____ every day"),
    ],
    "perfect": [
        ("_____ مبارح", "_____ mberih", "_____ yesterday"),
    ],
}

def generate_quiz(verbs, quiz_type, num, use_arabic_script=False):
    questions = []
    for _ in range(num):
        verb = random.choice(verbs)

        if quiz_type == "Conjugation":
            tense = random.choice(["perfect", "bi_imperfect"])
            forms = verb["conjugations"][tense]["forms"]
            form = random.choice(forms)

            # Get verb-specific template with natural collocations
            verb_arabic = verb["verb"]["arabic"]
            verb_templates = VERB_TEMPLATES.get(verb_arabic, {}).get(tense, [])
            if not verb_templates:
                verb_templates = GENERIC_TEMPLATES.get(tense, [("_____", "_____", "_____")])
            ar_template, translit_template, en_template = random.choice(verb_templates)

            # Get the pronoun for this person
            person_pronoun = PERSON_TRANSLIT.get(form["person"], form["person"])

            # Build prompt with pronoun: "níḥna __________ kil yom"
            if use_arabic_script:
                prompt_template = ar_template.replace("_____", "__________")
            else:
                prompt_template = translit_template.replace("_____", "__________")

            # Prepend pronoun to template
            prompt_with_pronoun = f"{person_pronoun} {prompt_template}"

            # Get unique wrong answers (using appropriate script)
            if use_arabic_script:
                wrong_options = list(set(f["arabic"] for f in forms if f["arabic"] != form["arabic"]))
                answer = form["arabic"]
                answer_alt = form["translit"]
            else:
                wrong_options = list(set(f["translit"] for f in forms if f["translit"] != form["translit"]))
                answer = form["translit"]
                answer_alt = form["arabic"]

            random.shuffle(wrong_options)
            options = [answer] + wrong_options[:3]

            # Build English prompt with subject
            subject = PERSON_LABELS.get(form["person"], "")

            # Get a random example sentence from the verb if available
            examples = verb.get("examples", [])
            example = random.choice(examples) if examples else None

            q = {
                "prompt": prompt_with_pronoun,
                "prompt_english": en_template.replace("_____", subject),
                "answer": answer,
                "answer_alt": answer_alt,
                "options": options,
                "verb_info": {
                    "translit": verb["verb"]["translit"],
                    "arabic": verb["verb"]["arabic"],
                    "english": verb["verb"]["english"]
                },
                "example": example,
                "tense": tense
            }
        elif quiz_type == "Arabic → English":
            # Get unique wrong answers
            wrong_options = list(set(v["verb"]["english"] for v in verbs if v["verb"]["english"] != verb["verb"]["english"]))
            random.shuffle(wrong_options)
            options = [verb["verb"]["english"]] + wrong_options[:3]

            q = {
                "prompt": verb["verb"]["arabic"],
                "answer": verb["verb"]["english"],
                "options": options
            }
        else:
            # Get unique wrong answers
            wrong_options = list(set(v["verb"]["arabic"] for v in verbs if v["verb"]["arabic"] != verb["verb"]["arabic"]))
            random.shuffle(wrong_options)
            options = [verb["verb"]["arabic"]] + wrong_options[:3]

            q = {
                "prompt": verb["verb"]["english"],
                "answer": verb["verb"]["arabic"],
                "hint": verb["verb"]["translit"],
                "options": options
            }
        
        random.shuffle(q["options"])
        questions.append(q)
    return questions

def render_lightsaber(level, max_level):
    """Render a vertical lightsaber progress bar on the right side."""
    # Calculate fill percentage (0-100)
    fill_pct = min(100, max(0, (level / max_level) * 100)) if max_level > 0 else 0
    is_full = fill_pct >= 100

    # Lightsaber CSS and HTML
    lightsaber_html = f"""
    <style>
    .lightsaber-container {{
        position: fixed;
        right: 20px;
        top: 50%;
        transform: translateY(-50%);
        display: flex;
        flex-direction: column;
        align-items: center;
        z-index: 1000;
    }}
    .lightsaber-blade-container {{
        width: 24px;
        height: 300px;
        background: linear-gradient(to bottom, #1a1a2e, #0d0d1a);
        border-radius: 12px 12px 0 0;
        position: relative;
        overflow: hidden;
        box-shadow: inset 0 0 10px rgba(0,0,0,0.5);
    }}
    .lightsaber-blade {{
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: {fill_pct}%;
        background: linear-gradient(to top,
            rgba(0, 150, 255, 0.3) 0%,
            rgba(100, 200, 255, 0.7) 30%,
            rgba(150, 220, 255, 0.9) 50%,
            rgba(200, 240, 255, 1) 70%,
            rgba(255, 255, 255, 1) 100%);
        box-shadow:
            0 0 10px rgba(0, 150, 255, 0.8),
            0 0 20px rgba(0, 150, 255, 0.6),
            0 0 30px rgba(0, 150, 255, 0.4),
            0 0 40px rgba(0, 150, 255, 0.2);
        border-radius: 10px 10px 0 0;
        transition: height 0.5s ease-out;
    }}
    .lightsaber-core {{
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 8px;
        height: {fill_pct}%;
        background: linear-gradient(to top,
            rgba(200, 230, 255, 0.8) 0%,
            rgba(255, 255, 255, 1) 100%);
        border-radius: 4px 4px 0 0;
        transition: height 0.5s ease-out;
    }}
    .lightsaber-handle {{
        width: 20px;
        height: 60px;
        background: linear-gradient(to right, #2a2a3a, #4a4a5a, #3a3a4a);
        border-radius: 3px;
        position: relative;
        box-shadow: 0 2px 5px rgba(0,0,0,0.5);
    }}
    .lightsaber-handle::before {{
        content: '';
        position: absolute;
        top: 10px;
        left: 2px;
        right: 2px;
        height: 3px;
        background: #666;
        border-radius: 1px;
    }}
    .lightsaber-handle::after {{
        content: '';
        position: absolute;
        top: 20px;
        left: 2px;
        right: 2px;
        height: 25px;
        background: repeating-linear-gradient(
            to bottom,
            #555 0px,
            #555 2px,
            #333 2px,
            #333 4px
        );
        border-radius: 1px;
    }}
    .lightsaber-emitter {{
        width: 24px;
        height: 10px;
        background: linear-gradient(to right, #3a3a4a, #5a5a6a, #4a4a5a);
        border-radius: 2px 2px 0 0;
    }}
    .level-text {{
        color: #00a0ff;
        font-size: 14px;
        font-weight: bold;
        margin-top: 10px;
        text-shadow: 0 0 10px rgba(0, 150, 255, 0.8);
    }}
    {'@keyframes pulse { 0%, 100% { box-shadow: 0 0 20px rgba(0,150,255,0.8), 0 0 40px rgba(0,150,255,0.6), 0 0 60px rgba(0,150,255,0.4); } 50% { box-shadow: 0 0 30px rgba(0,150,255,1), 0 0 60px rgba(0,150,255,0.8), 0 0 90px rgba(0,150,255,0.6); } } .lightsaber-blade { animation: pulse 1s ease-in-out infinite; }' if is_full else ''}
    </style>
    <div class="lightsaber-container">
        <div class="lightsaber-blade-container">
            <div class="lightsaber-blade"></div>
            <div class="lightsaber-core"></div>
        </div>
        <div class="lightsaber-emitter"></div>
        <div class="lightsaber-handle"></div>
        <div class="level-text">{int(fill_pct)}%</div>
    </div>
    """

    # Add sound effect when fully lit
    if is_full:
        lightsaber_html += """
        <audio autoplay>
            <source src="https://www.soundjay.com/mechanical/sounds/electric-fan-1.mp3" type="audio/mpeg">
        </audio>
        <script>
            // Lightsaber ignition celebration
            console.log('🗡️ LIGHTSABER FULLY CHARGED! 🗡️');
        </script>
        """

    st.markdown(lightsaber_html, unsafe_allow_html=True)

def run_quiz():
    idx = st.session_state.quiz_idx
    questions = st.session_state.quiz_questions
    level = st.session_state.get('lightsaber_level', 0)
    max_level = st.session_state.get('max_level', len(questions))

    # Render the lightsaber
    render_lightsaber(level, max_level)

    if idx >= len(questions):
        if level >= max_level:
            st.balloons()
            st.success(f"🗡️ LIGHTSABER FULLY CHARGED! Quiz Complete! Score: {st.session_state.quiz_score}/{len(questions)}")
        else:
            st.success(f"Quiz Complete! Score: {st.session_state.quiz_score}/{len(questions)}")
            st.info(f"Lightsaber level: {int((level/max_level)*100)}% - Keep practicing!")
        if st.button("New Quiz"):
            del st.session_state.quiz_questions
            if 'lightsaber_level' in st.session_state:
                del st.session_state.lightsaber_level
            st.rerun()
        return

    q = questions[idx]
    st.caption(f"Q{idx + 1} of {len(questions)}")

    # Show verb info for conjugation questions
    if "verb_info" in q:
        vi = q["verb_info"]
        tense_label = "Past" if q.get("tense") == "perfect" else "Present"
        st.markdown(f"**{vi['translit']}** | {vi['arabic']} | *{vi['english']}* — ({tense_label})")

    st.subheader(f"{q['prompt']}")

    # Show English translation for conjugation questions
    if "prompt_english" in q:
        st.write(f"*{q['prompt_english']}*")

    # Show example sentence from verb data
    if "example" in q and q["example"]:
        ex = q["example"]
        st.caption(f"📖 {ex.get('arabic', '')} — {ex.get('english', '')}")

    if "hint" in q:
        st.caption(f"Hint: {q['hint']}")

    for opt_idx, opt in enumerate(q["options"]):
        if st.button(opt, key=f"opt_{idx}_{opt_idx}"):
            if opt == q["answer"]:
                st.session_state.quiz_score += 1
                # Increase lightsaber level on correct answer
                st.session_state.lightsaber_level = min(max_level, level + 1)
                alt = q.get("answer_alt", "")
                if alt:
                    st.success(f"✓ Correct! {q['answer']} = {alt}")
                else:
                    st.success("✓ Correct!")
            else:
                # Decrease lightsaber level on wrong answer (but not below 0)
                st.session_state.lightsaber_level = max(0, level - 1)
                alt = q.get("answer_alt", "")
                if alt:
                    st.error(f"✗ Wrong. Answer: {q['answer']} = {alt}")
                else:
                    st.error(f"✗ Wrong. Answer: {q['answer']}")
            st.session_state.quiz_idx += 1
            st.rerun()

def page_stats():
    st.header("📊 Statistics")
    verbs = load_verbs()
    
    if not verbs:
        st.warning("No verbs loaded.")
        return
    
    st.metric("Total Verbs", len(verbs))
    
    # By measure
    measures = {}
    for v in verbs:
        m = v["classification"]["measure"]
        measures[m] = measures.get(m, 0) + 1
    
    st.subheader("By Measure")
    st.bar_chart(measures)
    
    # By type
    types = {}
    for v in verbs:
        t = v["classification"]["type"]
        types[t] = types.get(t, 0) + 1
    
    st.subheader("By Type")
    st.bar_chart(types)

# ---------- Main ----------
def main():
    st.set_page_config(page_title="Levantine Verbs", page_icon="🇱🇧", layout="wide")
    st.title("🇱🇧 Levantine Arabic Verb Tool")
    
    tab1, tab2, tab3, tab4 = st.tabs(["📚 Browse", "📤 Import", "🎯 Quiz", "📊 Stats"])

    with tab1:
        page_browse()
    with tab2:
        page_converter()
    with tab3:
        page_quiz()
    with tab4:
        page_stats()

if __name__ == "__main__":
    main()
