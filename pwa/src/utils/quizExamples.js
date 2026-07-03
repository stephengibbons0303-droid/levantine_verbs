// Blanked example sentences — the shared data foundation for the inverse-MCQ and
// gap-fill quiz types. Each of the ~103 verbs that carry curated `examples` gets its
// verb form located inside every example sentence and replaced with a blank, capturing
// the removed form as the answer. Only examples that blank cleanly in BOTH scripts are
// kept (~78% of examples). Computed once and memoized.

const BLANK = '____';

function normT(s) {
  return (s || '')
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[āáàâ]/g, 'a').replace(/[īíìî]/g, 'i').replace(/[ūúùû]/g, 'u')
    .replace(/[éèêē]/g, 'e').replace(/[óòôō]/g, 'o')
    .replace(/[^a-z0-9]/g, '');
}
function stripTashkeel(s) {
  return (s || '').replace(/[ً-ْٰـ]/g, '');
}
function arOnly(s) {
  return stripTashkeel(s).replace(/[^ء-ي]/g, '');
}

// Every conjugated surface form of a verb (translit + arabic), for locating it in a sentence.
function verbForms(verb) {
  const t = new Set(), a = new Set();
  const add = (tr, ar) => { if (tr) t.add(normT(tr)); if (ar) a.add(arOnly(ar)); };
  const c = verb.conjugations || {};
  for (const tense of Object.keys(c)) {
    const block = c[tense];
    for (const f of (block.forms || [])) add(f.translit, f.arabic);
    for (const k of ['masculine', 'feminine', 'plural']) {
      if (block[k]) add(block[k].translit, block[k].arabic);
    }
  }
  add(verb.verb?.translit, verb.verb?.arabic);
  return { t, a };
}

function matchForm(norm, forms) {
  if (norm.length < 2) return false;
  for (const f of forms) {
    if (f.length < 2) continue;
    if (norm === f || (norm.startsWith(f) && f.length >= 3) || (f.startsWith(norm) && norm.length >= 3)) {
      return true;
    }
  }
  return false;
}

// Replace the first token matching a verb form with a blank; return {blanked, answer}.
function blank(sentence, forms, isArabic) {
  const toks = sentence.split(/(\s+)/); // keep whitespace separators
  for (let i = 0; i < toks.length; i++) {
    const norm = isArabic ? arOnly(toks[i]) : normT(toks[i]);
    if (matchForm(norm, forms)) {
      const answer = toks[i].replace(/[.,!?;:"']/g, '').trim();
      toks[i] = BLANK;
      return { blanked: toks.join(''), answer };
    }
  }
  return null;
}

let _cache = null;

// getBlankedExamples(verbs) -> [{ verbId, verbInfo, topic, blankTranslit, blankArabic,
//   answerTranslit, answerArabic, english }]
export function getBlankedExamples(verbs) {
  if (_cache) return _cache;
  const out = [];
  for (const verb of verbs) {
    const ex = verb.examples || [];
    if (!ex.length) continue;
    const forms = verbForms(verb);
    for (const e of ex) {
      const bt = blank(e.translit || '', forms.t, false);
      const ba = blank(e.arabic || '', forms.a, true);
      if (!bt || !ba) continue; // keep only clean-in-both
      out.push({
        verbId: verb.id,
        verbInfo: { translit: verb.verb.translit, arabic: verb.verb.arabic, english: verb.verb.english },
        topic: verb.topic || null,
        blankTranslit: bt.blanked,
        blankArabic: ba.blanked,
        answerTranslit: bt.answer,
        answerArabic: ba.answer,
        english: e.english || '',
      });
    }
  }
  _cache = out;
  return out;
}

export const BLANK_TOKEN = BLANK;
