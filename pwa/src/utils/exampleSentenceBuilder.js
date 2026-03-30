import { PERSON_LABELS, PERSON_TRANSLIT } from './constants';

const BEDDE_FORMS = {
  ana: "béddi", nihna: "béddna", inta: "béddak", inti: "béddik",
  intu: "béddkon", huwwe: "béddo", hiyye: "bédda", hinne: "béddun",
};

const COMPLEMENTS = {
  perfect: [
    { translit: "mbēri7", english: "yesterday" },
    { translit: "hal-Subī7", english: "this morning" },
    { translit: "min usbū3", english: "a week ago" },
  ],
  bi_imperfect: [
    { translit: "kil yom", english: "every day" },
    { translit: "dēyman", english: "always" },
    { translit: "kil usbū3", english: "every week" },
  ],
  imperfect: [
    { translit: "bukra", english: "tomorrow" },
    { translit: "ba3d shwayy", english: "in a little while" },
    { translit: "hal-jum3a", english: "this Friday" },
  ],
  imperative: [
    { translit: "hallaʔ", english: "now" },
    { translit: "b-sur3a", english: "quickly" },
  ],
  participle: [
    { translit: "hallaʔ", english: "now" },
    { translit: "min zamēn", english: "for a long time" },
  ],
};

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * Assembles a post-answer example sentence from parts.
 *
 * @param {Object} opts
 * @param {string} opts.tense - Tense key
 * @param {string} opts.person - Person key (e.g. "ana", "inta")
 * @param {string} opts.correctTranslit - Correct conjugation transliteration
 * @param {string} opts.verbEnglish - Verb English meaning from verb.verb.english (e.g. "to study")
 * @param {string|null} opts.particle - Particle from getTenseLabel() ("ra7", "bedde", "lezim", or null)
 * @returns {{ sentence: string, english: string } | null}
 */
export function buildExampleSentence({ tense, person, correctTranslit, verbEnglish, particle }) {
  const complements = COMPLEMENTS[tense];
  if (!complements) return null;

  const comp = pick(complements);
  const pronoun = PERSON_TRANSLIT[person] || person;
  const pronounEn = PERSON_LABELS[person] || person;
  const baseVerb = verbEnglish?.replace(/^to\s+/i, '') || '...';

  let sentence, english;

  if (tense === 'imperfect' && particle === 'bedde') {
    // bedde: omit pronoun, use person-specific bedde form
    const bedde = BEDDE_FORMS[person] || 'bedde';
    sentence = `${bedde} ${correctTranslit} ${comp.translit}.`;
    const wantForm = (person === 'huwwe' || person === 'hiyye') ? 'wants to' : 'want to';
    english = `${pronounEn} ${wantForm} ${baseVerb} ${comp.english}.`;
  } else if (tense === 'imperfect' && particle === 'ra7') {
    sentence = `${pronoun} ra7 ${correctTranslit} ${comp.translit}.`;
    english = `${pronounEn} will ${baseVerb} ${comp.english}.`;
  } else if (tense === 'imperfect' && particle === 'lezim') {
    sentence = `lēzim ${correctTranslit} ${comp.translit}.`;
    english = `${pronounEn} must ${baseVerb} ${comp.english}.`;
  } else if (tense === 'imperative') {
    // imperative: omit pronoun
    sentence = `${correctTranslit} ${comp.translit}!`;
    english = `${capitalize(baseVerb)} ${comp.english}!`;
  } else {
    // perfect, bi_imperfect, participle, etc.
    sentence = `${pronoun} ${correctTranslit} ${comp.translit}.`;
    english = `${pronounEn} ${baseVerb} ${comp.english}.`;
  }

  return { sentence, english };
}
