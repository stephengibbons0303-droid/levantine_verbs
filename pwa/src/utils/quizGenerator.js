import { PERSON_LABELS, PERSON_TRANSLIT } from './constants';
import { VERB_TEMPLATES, GENERIC_TEMPLATES, IMPERFECT_TEMPLATES } from './templates';
import { getTenseLabel } from './tenseLabels';
import { getBlankedExamples } from './quizExamples';

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function generateQuiz(verbs, quizType, num, useArabicScript = false, selectedTense = "all", selectedPersons = null) {
  // New sentence-based types are generated separately (they don't use the per-verb loop).
  if (quizType === "listening") return generateListening(verbs, num);
  if (quizType === "inverse_mcq") return generateInverseMcq(verbs, num, useArabicScript);
  if (quizType === "gap_fill") return generateGapFill(verbs, num, useArabicScript);

  const questions = [];

  let quizVerbs;
  if (quizType === "conjugation") {
    quizVerbs = verbs.filter(v =>
      !v.partial &&
      (v.conjugations?.perfect?.forms?.length ?? 0) >= 4 &&
      (v.conjugations?.bi_imperfect?.forms?.length ?? 0) >= 4 &&
      (v.conjugations?.imperfect?.forms?.length ?? 0) >= 4
    );
    if (!quizVerbs.length) quizVerbs = verbs;
  } else {
    quizVerbs = verbs;
  }

  for (let i = 0; i < num; i++) {
    const verb = pick(quizVerbs);

    if (quizType === "conjugation") {
      let tense = selectedTense === "all"
        ? pick(["perfect", "bi_imperfect", "imperfect"])
        : selectedTense;

      if (!verb.conjugations?.[tense]) tense = "bi_imperfect";
      const allForms = verb.conjugations[tense].forms;
      if (!allForms?.length) continue;
      const forms = selectedPersons
        ? allForms.filter(f => selectedPersons.includes(f.person))
        : allForms;
      if (!forms.length) continue;

      let q;
      if (tense === "imperfect") {
        q = generateImperfectQuestion(verb, forms, allForms, useArabicScript);
      } else {
        q = generateStandardQuestion(verb, forms, allForms, tense, useArabicScript);
      }
      if (q) {
        q.options = shuffle(q.options);
        questions.push(q);
      }
    } else if (quizType === "ar2en") {
      const wrongOptions = shuffle(
        [...new Set(verbs.filter(v => v.verb.english !== verb.verb.english).map(v => v.verb.english))]
      ).slice(0, 3);
      questions.push({
        prompt: verb.verb.arabic,
        answer: verb.verb.english,
        options: shuffle([verb.verb.english, ...wrongOptions]),
      });
    } else {
      // en2ar
      const wrongOptions = shuffle(
        [...new Set(verbs.filter(v => v.verb.arabic !== verb.verb.arabic).map(v => v.verb.arabic))]
      ).slice(0, 3);
      questions.push({
        prompt: verb.verb.english,
        answer: verb.verb.arabic,
        hint: verb.verb.translit,
        options: shuffle([verb.verb.arabic, ...wrongOptions]),
      });
    }
  }
  return questions;
}

function generateImperfectQuestion(verb, forms, allForms, useArabicScript) {
  let contextType = pick(["auxiliary", "future", "progressive", "purpose"]);
  const form = pick(forms);
  let promptTemplate, answer, answerAlt, enContext;

  if (contextType === "auxiliary") {
    const auxOptions = IMPERFECT_TEMPLATES.auxiliary.filter(a => a.person === form.person);
    if (auxOptions.length) {
      const aux = pick(auxOptions);
      if (useArabicScript) {
        promptTemplate = `${aux.particle_ar} __________`;
        answer = form.arabic;
        answerAlt = form.translit;
      } else {
        promptTemplate = `${aux.particle_tr} __________`;
        answer = form.translit;
        answerAlt = form.arabic;
      }
      enContext = aux.context_en;
    } else {
      contextType = "future";
    }
  }

  if (contextType === "future" || contextType === "progressive") {
    const particle = pick(IMPERFECT_TEMPLATES[contextType]);
    const pronoun = PERSON_TRANSLIT[form.person] || form.person;
    if (useArabicScript) {
      promptTemplate = `${particle.particle_ar} __________`;
      answer = form.arabic;
      answerAlt = form.translit;
    } else {
      promptTemplate = `${pronoun} ${particle.particle_tr} __________`;
      answer = form.translit;
      answerAlt = form.arabic;
    }
    enContext = `${PERSON_LABELS[form.person] || ""} ${particle.context_en}`;
  } else if (contextType === "purpose") {
    const particle = pick(IMPERFECT_TEMPLATES.purpose);
    if (useArabicScript) {
      promptTemplate = `${particle.particle_ar}__________`;
      answer = form.arabic;
      answerAlt = form.translit;
    } else {
      promptTemplate = `${particle.particle_tr}__________`;
      answer = form.translit;
      answerAlt = form.arabic;
    }
    enContext = particle.context_en;
  }

  const wrongKey = useArabicScript ? "arabic" : "translit";
  const wrongOptions = [...new Set(allForms.map(f => f[wrongKey]).filter(v => v !== answer))];

  // Map context type to particle for example sentence builder
  let particle = null;
  if (contextType === 'future') particle = 'ra7';
  else if (contextType === 'auxiliary') {
    // Check if this was a bedde auxiliary
    const auxOpts = IMPERFECT_TEMPLATES.auxiliary.filter(a => a.person === form.person);
    const isBedde = auxOpts.some(a => a.particle_tr.startsWith('b'));
    particle = isBedde ? 'bedde' : 'lezim';
  } else {
    // progressive, purpose — use a random particle for example
    const { particle: p } = getTenseLabel('imperfect');
    particle = p;
  }

  const examples = verb.examples || [];
  return {
    prompt: promptTemplate,
    prompt_english: enContext,
    answer,
    answer_alt: answerAlt,
    options: [answer, ...shuffle(wrongOptions).slice(0, 3)],
    verb_info: { translit: verb.verb.translit, arabic: verb.verb.arabic, english: verb.verb.english },
    example: examples.length ? pick(examples) : null,
    tense: "imperfect",
    person: form.person,
    particle,
    context_type: contextType,
  };
}

function generateStandardQuestion(verb, forms, allForms, tense, useArabicScript) {
  const form = pick(forms);
  const verbArabic = verb.verb.arabic;
  let templates = VERB_TEMPLATES[verbArabic]?.[tense];
  if (!templates?.length) templates = GENERIC_TEMPLATES[tense] || [["_____", "_____", "_____"]];
  const [arTpl, trTpl, enTpl] = pick(templates);

  const pronoun = PERSON_TRANSLIT[form.person] || form.person;
  const promptTemplate = useArabicScript
    ? arTpl.replace("_____", "__________")
    : trTpl.replace("_____", "__________");

  const answer = useArabicScript ? form.arabic : form.translit;
  const answerAlt = useArabicScript ? form.translit : form.arabic;
  const wrongKey = useArabicScript ? "arabic" : "translit";
  const wrongOptions = [...new Set(allForms.map(f => f[wrongKey]).filter(v => v !== answer))];
  const subject = PERSON_LABELS[form.person] || "";

  const examples = verb.examples || [];
  return {
    prompt: `${pronoun} ${promptTemplate}`,
    prompt_english: enTpl.replace("_____", subject),
    answer,
    answer_alt: answerAlt,
    options: [answer, ...shuffle(wrongOptions).slice(0, 3)],
    verb_info: { translit: verb.verb.translit, arabic: verb.verb.arabic, english: verb.verb.english },
    example: examples.length ? pick(examples) : null,
    tense,
    person: form.person,
    particle: null,
  };
}

// --- Listening (all verbs): hear a Lebanese sentence/word, pick the meaning ---
function generateListening(verbs, num) {
  const pool = verbs.filter(v => v.verb?.arabic && v.verb?.english);
  const qs = [];
  for (let i = 0; i < num && pool.length >= 4; i++) {
    const verb = pick(pool);
    const ex = verb.examples || [];
    const useEx = ex.length ? pick(ex) : null; // full sentence if available, else the verb word
    const wrong = shuffle(
      [...new Set(pool.filter(v => v.verb.english !== verb.verb.english).map(v => v.verb.english))]
    ).slice(0, 3);
    if (wrong.length < 3) continue;
    qs.push({
      type: 'listening',
      audioArabic: useEx ? useEx.arabic : verb.verb.arabic,
      audioTranslit: useEx ? useEx.translit : verb.verb.translit,
      sentenceEnglish: useEx ? useEx.english : null,
      options: shuffle([verb.verb.english, ...wrong]),
      answer: verb.verb.english,
      reveal: { translit: verb.verb.translit, arabic: verb.verb.arabic, english: verb.verb.english },
    });
  }
  return qs;
}

// --- Inverse MCQ (103 example verbs): given the verb, pick the sentence it completes ---
function generateInverseMcq(verbs, num, useArabic) {
  const ex = getBlankedExamples(verbs);
  const qs = [];
  const distinctVerbs = new Set(ex.map(e => e.verbId)).size;
  if (distinctVerbs < 4) return qs;
  for (let i = 0; i < num; i++) {
    const target = pick(ex);
    const others = shuffle(ex.filter(e => e.verbId !== target.verbId));
    const chosen = [];
    const used = new Set([target.verbId]);
    for (const o of others) {
      if (used.has(o.verbId)) continue; // one sentence per verb, so no accidental twins
      used.add(o.verbId);
      chosen.push(o);
      if (chosen.length === 3) break;
    }
    if (chosen.length < 3) continue;
    const options = shuffle([target, ...chosen]).map(e => ({
      value: e.blankTranslit,
      translit: e.blankTranslit,
      arabic: e.blankArabic,
    }));
    qs.push({
      type: 'inverse_mcq',
      verb_info: target.verbInfo,
      prompt_hint: 'Which sentence uses this verb?',
      options,
      answer: target.blankTranslit,
      answer_english: target.english,
      answer_fill: useArabic ? target.answerArabic : target.answerTranslit,
    });
  }
  return qs;
}

// --- Gap-fill (103 example verbs): read the Lebanese sentence, pick the verb that fills the blank ---
function generateGapFill(verbs, num, useArabic) {
  const ex = getBlankedExamples(verbs);
  const qs = [];
  if (new Set(ex.map(e => e.verbId)).size < 4) return qs;
  for (let i = 0; i < num; i++) {
    const target = pick(ex);
    const answer = useArabic ? target.answerArabic : target.answerTranslit;
    if (!answer) continue;
    const distract = [];
    const seen = new Set([answer]);
    for (const o of shuffle(ex.filter(e => e.verbId !== target.verbId))) {
      const f = useArabic ? o.answerArabic : o.answerTranslit;
      if (!f || seen.has(f)) continue;
      seen.add(f);
      distract.push(f);
      if (distract.length === 3) break;
    }
    if (distract.length < 3) continue;
    qs.push({
      type: 'gap_fill',
      prompt: useArabic ? target.blankArabic : target.blankTranslit,
      prompt_alt: useArabic ? target.blankTranslit : target.blankArabic,
      options: shuffle([answer, ...distract]),
      answer,
      answer_english: target.english,
      reveal: target.verbInfo,
    });
  }
  return qs;
}
