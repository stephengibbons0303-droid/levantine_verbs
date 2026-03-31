/**
 * Quiz Prompt Builder — assembles sentence frame prompts for the quiz.
 *
 * Replaces the old grammar-label approach ("I — Past") with a sentence frame
 * containing a blank where the conjugated verb goes, e.g.:
 *   "ána _______ il-ktēb mbēri7"
 */

import { TIME_ADVERBS, BEDDE_FORMS, PROMPT_PRONOUNS, pickRandom } from './vocabPool';

const BLANK = '_______';

/**
 * Build a sentence frame prompt for a quiz question.
 *
 * @param {Object} verb - Verb object from verbs.json (needs .transitivity and .quiz_objects)
 * @param {string} tense - Internal tense key (perfect, bi_imperfect, imperfect, imperative, participle)
 * @param {string} person - Person key (ana, inta, etc.)
 * @param {string|null} particle - For imperfect: "bedde", "ra7", or "lezim". Null for other tenses.
 * @returns {{ prompt: string, timeAdverb: string, object: string|null }}
 */
export function buildQuizPrompt(verb, tense, person, particle) {
  // 1. Determine object (transitive verbs only)
  let object = null;
  const transitivity = verb.transitivity;
  const quizObjects = verb.quiz_objects;
  if ((transitivity === 'tr' || transitivity === 'both') && quizObjects && quizObjects.length > 0) {
    object = pickRandom(quizObjects);
  }

  // 2. Pick time adverb from the appropriate pool
  const poolMap = {
    perfect: 'past',
    bi_imperfect: 'present',
    imperfect: 'future',
    imperative: 'imperative',
    participle: 'participle',
  };
  const pool = TIME_ADVERBS[poolMap[tense]];
  const timeAdverb = pool ? pickRandom(pool).translit : '';

  // 3. Build the object + time portion
  const tail = object ? `${object} ${timeAdverb}` : timeAdverb;

  // 4. Assemble prompt by tense
  const pronoun = PROMPT_PRONOUNS[person] || person;
  let prompt;

  if (tense === 'imperfect' && particle === 'bedde') {
    // bedde: use person-specific bedde form, no separate pronoun
    const bedde = BEDDE_FORMS[person] || 'bedde';
    prompt = `${bedde} ${BLANK} ${tail}`;
  } else if (tense === 'imperfect' && particle === 'ra7') {
    prompt = `${pronoun} ra7 ${BLANK} ${tail}`;
  } else if (tense === 'imperfect' && particle === 'lezim') {
    // lēzim is invariable — pronoun needed to identify person
    prompt = `${pronoun} lēzim ${BLANK} ${tail}`;
  } else if (tense === 'imperative') {
    // Comma after pronoun, exclamation at end
    prompt = `${pronoun}, ${BLANK} ${tail}!`;
  } else {
    // perfect, bi_imperfect, participle
    prompt = `${pronoun} ${BLANK} ${tail}`;
  }

  return { prompt, timeAdverb, object };
}
