import { PERSON_LABELS, PERSON_TRANSLIT } from './constants';
import { VERB_TEMPLATES, GENERIC_TEMPLATES, IMPERFECT_TEMPLATES } from './templates';

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
        q = generateImperfectQuestion(verb, forms, useArabicScript);
      } else {
        q = generateStandardQuestion(verb, forms, tense, useArabicScript);
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

function generateImperfectQuestion(verb, forms, useArabicScript) {
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
  const wrongOptions = [...new Set(forms.map(f => f[wrongKey]).filter(v => v !== answer))];

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
    context_type: contextType,
  };
}

function generateStandardQuestion(verb, forms, tense, useArabicScript) {
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
  const wrongOptions = [...new Set(forms.map(f => f[wrongKey]).filter(v => v !== answer))];
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
  };
}
