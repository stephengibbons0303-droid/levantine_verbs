"""
Levantine Arabic Verb Editor & Quiz Tester
Run: streamlit run tools/app.py
"""

import streamlit as st
import json
from pathlib import Path
import random

# Paths
DATA_DIR = Path(__file__).parent.parent / "data"
VERBS_FILE = DATA_DIR / "verbs.json"

PERSONS = ["ana", "nihna", "inta", "inti", "intu", "huwwe", "hiyye", "hinne"]
PERSON_LABELS = {
    "ana": "I", "nihna": "we", "inta": "you (m)", "inti": "you (f)",
    "intu": "you (pl)", "huwwe": "he", "hiyye": "she", "hinne": "they"
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

def page_editor():
    st.header("✏️ Verb Editor")
    verbs = load_verbs()
    
    mode = st.radio("Mode", ["Add New", "Edit Existing"], horizontal=True)
    
    if mode == "Edit Existing" and verbs:
        verb_options = {f"{v['id']:03d}. {v['verb']['translit']}": i for i, v in enumerate(verbs)}
        selected = st.selectbox("Select verb to edit", list(verb_options.keys()))
        verb_idx = verb_options[selected]
        verb = verbs[verb_idx].copy()
    else:
        verb_idx = None
        verb = {
            "id": len(verbs) + 1,
            "verb": {"arabic": "", "translit": "", "english": ""},
            "classification": {"measure": "I", "type": "sound", "root": ""},
            "conjugations": {
                "perfect": {"label": "Past", "forms": [{"person": p, "arabic": "", "translit": "", "english": ""} for p in PERSONS]},
                "imperfect": {"label": "Subjunctive", "forms": [{"person": p, "arabic": "", "translit": "", "english": ""} for p in PERSONS]},
                "bi_imperfect": {"label": "Habitual", "forms": [{"person": p, "arabic": "", "translit": "", "english": ""} for p in PERSONS]},
                "imperative": {"label": "Command", "forms": [{"person": p, "arabic": "", "translit": "", "english": ""} for p in ["inta", "inti", "intu"]]}
            }
        }
    
    # Basic info
    st.subheader("Basic Info")
    col1, col2, col3 = st.columns(3)
    with col1:
        verb["verb"]["arabic"] = st.text_input("Arabic", verb["verb"]["arabic"])
    with col2:
        verb["verb"]["translit"] = st.text_input("Transliteration", verb["verb"]["translit"])
    with col3:
        verb["verb"]["english"] = st.text_input("English", verb["verb"]["english"])
    
    col1, col2, col3 = st.columns(3)
    with col1:
        verb["classification"]["measure"] = st.selectbox("Measure", ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "Iq", "IIq"], 
            index=["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "Iq", "IIq"].index(verb["classification"]["measure"]))
    with col2:
        verb["classification"]["type"] = st.text_input("Type", verb["classification"]["type"])
    with col3:
        verb["classification"]["root"] = st.text_input("Root", verb["classification"]["root"])
    
    # Conjugations
    for tense in ["perfect", "imperfect", "bi_imperfect", "imperative"]:
        st.subheader(f"{verb['conjugations'][tense]['label']} ({tense})")
        forms = verb["conjugations"][tense]["forms"]
        
        cols_per_row = 4
        for i in range(0, len(forms), cols_per_row):
            cols = st.columns(cols_per_row)
            for j, col in enumerate(cols):
                if i + j < len(forms):
                    form = forms[i + j]
                    with col:
                        st.markdown(f"**{form['person']}** ({PERSON_LABELS.get(form['person'], '')})")
                        form["arabic"] = st.text_input(f"Arabic##{tense}{i+j}", form["arabic"], key=f"{tense}_ar_{i+j}")
                        form["translit"] = st.text_input(f"Translit##{tense}{i+j}", form["translit"], key=f"{tense}_tr_{i+j}")
    
    # Save
    if st.button("💾 Save Verb", type="primary"):
        if verb_idx is not None:
            verbs[verb_idx] = verb
        else:
            verbs.append(verb)
        save_verbs(verbs)
        st.success(f"Saved verb #{verb['id']}: {verb['verb']['translit']}")
        st.rerun()

def page_quiz():
    st.header("🎯 Quiz Tester")
    verbs = load_verbs()
    
    if not verbs:
        st.warning("No verbs loaded.")
        return
    
    # Quiz settings
    col1, col2 = st.columns(2)
    with col1:
        quiz_type = st.selectbox("Quiz Type", ["Arabic → English", "English → Arabic", "Conjugation"])
    with col2:
        num_questions = st.slider("Questions", 5, 20, 10)
    
    if st.button("Start Quiz"):
        st.session_state.quiz_questions = generate_quiz(verbs, quiz_type, num_questions)
        st.session_state.quiz_idx = 0
        st.session_state.quiz_score = 0
    
    if "quiz_questions" in st.session_state:
        run_quiz()

# Verb-specific sentence templates with natural collocations
# Format: verb_arabic -> {tense -> [(ar_template, en_template), ...]}
VERB_TEMPLATES = {
    "إجا": {  # to come
        "bi_imperfect": [
            ("_____ عالبيت كل يوم", "_____ home every day"),
            ("_____ لعندي بكرا؟", "_____ to my place tomorrow?"),
            ("_____ عالشغل بالباص", "_____ to work by bus"),
        ],
        "perfect": [
            ("_____ عالبيت مبارح", "_____ home yesterday"),
            ("_____ لعندي الصبح", "_____ to my place this morning"),
        ],
    },
    "أخَذ": {  # to take
        "bi_imperfect": [
            ("_____ الباص كل يوم", "_____ the bus every day"),
            ("_____ الدوا كل صبح", "_____ medicine every morning"),
            ("_____ قهوة بالصبح", "_____ coffee in the morning"),
        ],
        "perfect": [
            ("_____ الباص مبارح", "_____ the bus yesterday"),
            ("_____ الكتاب من المكتبة", "_____ the book from the library"),
        ],
    },
    "أعْلَن": {  # to announce
        "bi_imperfect": [
            ("_____ الخبر بكرا", "_____ the news tomorrow"),
            ("_____ النتيجة قريباً", "_____ the result soon"),
        ],
        "perfect": [
            ("_____ الخبر مبارح", "_____ the news yesterday"),
            ("_____ خطوبتن", "_____ their engagement"),
        ],
    },
    "أكَل": {  # to eat
        "bi_imperfect": [
            ("_____ الفطور كل صبح", "_____ breakfast every morning"),
            ("_____ فلافل كتير", "_____ a lot of falafel"),
            ("_____ بالمطعم كل جمعة", "_____ at the restaurant every Friday"),
        ],
        "perfect": [
            ("_____ الفطور الصبح", "_____ breakfast this morning"),
            ("_____ شاورما مبارح", "_____ shawarma yesterday"),
            ("_____ عند ستي", "_____ at grandma's"),
        ],
    },
    "أمَر": {  # to order
        "bi_imperfect": [
            ("_____ قهوة من المقهى", "_____ coffee from the cafe"),
            ("_____ أكل من المطعم", "_____ food from the restaurant"),
            ("شو _____؟", "what would _____ like to order?"),
        ],
        "perfect": [
            ("_____ قهوة وكرواسان", "_____ coffee and a croissant"),
            ("_____ شاورما دجاج", "_____ chicken shawarma"),
        ],
    },
    "باع": {  # to sell
        "bi_imperfect": [
            ("_____ خضرة بالسوق", "_____ vegetables at the market"),
            ("_____ السيارة قريباً", "_____ the car soon"),
            ("_____ بالدكان كل يوم", "_____ at the shop every day"),
        ],
        "perfect": [
            ("_____ السيارة مبارح", "_____ the car yesterday"),
            ("_____ البيت الشهر الماضي", "_____ the house last month"),
        ],
    },
    "بَرَم": {  # to turn/wander
        "bi_imperfect": [
            ("_____ بالسوق كل سبت", "_____ around the market every Saturday"),
            ("_____ بالضيعة", "_____ around the village"),
            ("_____ بالمدينة", "_____ around the city"),
        ],
        "perfect": [
            ("_____ بالسوق مبارح", "_____ around the market yesterday"),
            ("_____ بكل المحلات", "_____ all the shops"),
        ],
    },
    "بِقي": {  # to stay/become
        "bi_imperfect": [
            ("_____ بالبيت اليوم", "_____ at home today"),
            ("_____ هادي وقت المشاكل", "_____ calm during problems"),
            ("_____ صاحي للصبح", "_____ awake until morning"),
        ],
        "perfect": [
            ("_____ بالبيت مبارح", "_____ at home yesterday"),
            ("_____ عند صحابي", "_____ at my friends' place"),
        ],
    },
    "بَلَّش": {  # to begin
        "bi_imperfect": [
            ("_____ الشغل بكير", "_____ work early"),
            ("_____ يدرس الساعة ثمانية", "_____ studying at eight"),
            ("أيمتى _____؟", "when does _____ start?"),
        ],
        "perfect": [
            ("_____ الشغل الصبح", "_____ work this morning"),
            ("_____ يدرس عربي", "_____ studying Arabic"),
        ],
    },
    "تَرَك": {  # to leave
        "bi_imperfect": [
            ("_____ الشغل الساعة خمسة", "_____ work at five"),
            ("_____ التدخين قريباً", "_____ smoking soon"),
            ("ما _____ الولاد لوحدن", "_____ never leave the kids alone"),
        ],
        "perfect": [
            ("_____ الشغل مبارح", "_____ work yesterday"),
            ("_____ التدخين السنة الماضية", "_____ smoking last year"),
        ],
    },
}

# Fallback generic templates if verb not found
GENERIC_TEMPLATES = {
    "bi_imperfect": [
        ("_____ كل يوم", "_____ every day"),
        ("_____ كتير", "_____ a lot"),
    ],
    "perfect": [
        ("_____ مبارح", "_____ yesterday"),
        ("_____ قبل شوي", "_____ a while ago"),
    ],
}

def generate_quiz(verbs, quiz_type, num):
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
                verb_templates = GENERIC_TEMPLATES.get(tense, [("_____", "_____")])
            ar_template, en_template = random.choice(verb_templates)

            # Get unique wrong answers (using transliteration)
            wrong_options = list(set(f["translit"] for f in forms if f["translit"] != form["translit"]))
            random.shuffle(wrong_options)
            options = [form["translit"]] + wrong_options[:3]

            # Build English prompt with subject
            person_subjects = {
                "ana": "I", "nihna": "we", "inta": "you (m)", "inti": "you (f)",
                "intu": "you (pl)", "huwwe": "he", "hiyye": "she", "hinne": "they"
            }
            subject = person_subjects.get(form["person"], "")

            q = {
                "prompt": ar_template,
                "prompt_english": en_template.replace("_____", subject),
                "answer": form["translit"],
                "answer_arabic": form["arabic"],
                "options": options
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

def run_quiz():
    idx = st.session_state.quiz_idx
    questions = st.session_state.quiz_questions
    
    if idx >= len(questions):
        st.success(f"Quiz Complete! Score: {st.session_state.quiz_score}/{len(questions)}")
        if st.button("New Quiz"):
            del st.session_state.quiz_questions
            st.rerun()
        return
    
    q = questions[idx]
    st.progress(idx / len(questions))
    st.subheader(f"Q{idx + 1}: {q['prompt']}")

    # Show English translation for conjugation questions
    if "prompt_english" in q:
        st.write(f"*{q['prompt_english']}*")

    if "hint" in q:
        st.caption(f"Hint: {q['hint']}")
    
    for opt_idx, opt in enumerate(q["options"]):
        if st.button(opt, key=f"opt_{idx}_{opt_idx}"):
            if opt == q["answer"]:
                st.session_state.quiz_score += 1
                arabic = q.get("answer_arabic", "")
                if arabic:
                    st.success(f"Correct! {q['answer']} = {arabic}")
                else:
                    st.success("Correct!")
            else:
                arabic = q.get("answer_arabic", "")
                if arabic:
                    st.error(f"Wrong. Answer: {q['answer']} = {arabic}")
                else:
                    st.error(f"Wrong. Answer: {q['answer']}")
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
    
    tab1, tab2, tab3, tab4 = st.tabs(["📚 Browse", "✏️ Editor", "🎯 Quiz", "📊 Stats"])
    
    with tab1:
        page_browse()
    with tab2:
        page_editor()
    with tab3:
        page_quiz()
    with tab4:
        page_stats()

if __name__ == "__main__":
    main()
