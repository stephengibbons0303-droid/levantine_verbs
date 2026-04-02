/**
 * English Sentence Builder — constructs filled Arabizi sentences and
 * grammatically correct English translations from quiz prompt parts.
 *
 * Used after SRS answer submission to show the complete sentence.
 */

import { PERSON_LABELS } from './constants';
import { OBJECTS, TIME_ADVERBS } from './vocabPool';

// Build lookup maps from vocabPool data at import time
const OBJECT_EN = {};
for (const obj of OBJECTS) {
  OBJECT_EN[obj.translit] = obj.english;
}

const TIME_EN = {};
for (const pool of Object.values(TIME_ADVERBS)) {
  for (const item of pool) {
    TIME_EN[item.translit] = item.english;
  }
}

// Frequency adverbs that go BEFORE the verb in English
const FREQ_ADVERBS = new Set([
  'always', 'usually', 'every time', 'never', 'rarely',
  'sometimes', 'often',
]);

/**
 * Reassemble the quiz prompt with the correct answer replacing the blank.
 *
 * @param {Object} parts - Parts from buildQuizPrompt
 * @param {string} correctAnswer - The correct conjugated verb form
 * @returns {string} Complete Arabizi sentence
 */
export function buildFilledSentence(parts, correctAnswer) {
  const { pronoun, particle, object, timeAdverb, tense } = parts;
  const segments = [];

  if (tense === 'imperative') {
    // Format: "pronoun, verb object timeAdverb!"
    if (pronoun) segments.push(pronoun + ',');
    segments.push(correctAnswer);
    if (object) segments.push(object);
    if (timeAdverb) segments.push(timeAdverb);
    return segments.join(' ') + '!';
  }

  if (pronoun) segments.push(pronoun);
  if (particle) segments.push(particle);
  segments.push(correctAnswer);
  if (object) segments.push(object);
  if (timeAdverb) segments.push(timeAdverb);
  return segments.join(' ') + '.';
}

/**
 * Build a grammatically correct English translation from parts.
 *
 * Uses parts.person (always the person key like "ana", "huwwe") for
 * English pronoun lookup — never parts.pronoun (which may be empty for bedde)
 * or parts.particle (which may be the bedde form like "béddi").
 *
 * @param {Object} parts - Parts from buildQuizPrompt
 * @param {Object} verb - Verb object from verbs.json (needs .english_forms)
 * @returns {string} English sentence
 */
export function buildEnglishSentence(parts, verb) {
  const { particle, object, timeAdverb, tense, person } = parts;

  const pEn = PERSON_LABELS[person] || person;
  const forms = verb.english_forms;
  if (!forms) {
    // Fallback: strip "to " from verb.verb.english
    const base = (verb.verb?.english || '').replace(/^to\s+/i, '').split(';')[0].trim();
    return `${pEn} ${base}.`;
  }

  const objEn = object ? (OBJECT_EN[object] || object) : '';
  let timeEn = timeAdverb ? (TIME_EN[timeAdverb] || timeAdverb) : '';
  const is3s = (person === 'huwwe' || person === 'hiyye');

  if (tense === 'imperative') {
    const cap = forms.base.charAt(0).toUpperCase() + forms.base.slice(1);
    return `${cap}${objEn ? ' ' + objEn : ''}${timeEn ? ' ' + timeEn : ''}!`;
  }

  if (tense === 'perfect') {
    return `${pEn} ${forms.past}${objEn ? ' ' + objEn : ''}${timeEn ? ' ' + timeEn : ''}.`;
  }

  if (tense === 'bi_imperfect') {
    const verbForm = is3s ? forms.present_3s : forms.base;
    // Frequency adverbs go before the verb in English
    if (FREQ_ADVERBS.has(timeEn)) {
      return `${pEn} ${timeEn} ${verbForm}${objEn ? ' ' + objEn : ''}.`;
    }
    return `${pEn} ${verbForm}${objEn ? ' ' + objEn : ''}${timeEn ? ' ' + timeEn : ''}.`;
  }

  if (tense === 'imperfect') {
    // Particle determines structure
    if (particle.startsWith('bédd') || particle.startsWith('bedd') || particle === 'bedde') {
      // bedde: want to
      const wantForm = is3s ? 'wants to' : 'want to';
      return `${pEn} ${wantForm} ${forms.base}${objEn ? ' ' + objEn : ''}${timeEn ? ' ' + timeEn : ''}.`;
    }
    if (particle === 'ra7') {
      return `${pEn} will ${forms.base}${objEn ? ' ' + objEn : ''}${timeEn ? ' ' + timeEn : ''}.`;
    }
    if (particle === 'lēzim') {
      return `${pEn} must ${forms.base}${objEn ? ' ' + objEn : ''}${timeEn ? ' ' + timeEn : ''}.`;
    }
    // Fallback for imperfect without recognized particle
    return `${pEn} ${forms.base}${objEn ? ' ' + objEn : ''}${timeEn ? ' ' + timeEn : ''}.`;
  }

  if (tense === 'participle') {
    const beForm = person === 'ana' ? 'am' : is3s ? 'is' : 'are';
    const ing = makeIng(forms.base);
    return `${pEn} ${beForm} ${ing}${objEn ? ' ' + objEn : ''}${timeEn ? ' ' + timeEn : ''}.`;
  }

  // Fallback
  return `${pEn} ${forms.base}${objEn ? ' ' + objEn : ''}${timeEn ? ' ' + timeEn : ''}.`;
}

/**
 * Convert base verb to -ing form.
 */
function makeIng(base) {
  if (!base) return '...';
  // Handle phrasal verbs: "search for" -> "searching for"
  const parts = base.split(' ');
  if (parts.length > 1) {
    return makeIng(parts[0]) + ' ' + parts.slice(1).join(' ');
  }
  // -ie → -ying: die→dying, lie→lying, tie→tying
  if (base.endsWith('ie')) return base.slice(0, -2) + 'ying';
  // -ee → -eeing: see→seeing, free→freeing
  if (base.endsWith('ee')) return base + 'ing';
  // Silent -e → drop e: come→coming, make→making, leave→leaving
  if (base.endsWith('e')) return base.slice(0, -1) + 'ing';
  // Double final consonant for short vowel + single consonant (CVC, max 4 chars)
  if (/^[a-z]*[aeiou][bcdfghlmnprstvz]$/i.test(base) && base.length <= 4) {
    return base + base.slice(-1) + 'ing';
  }
  return base + 'ing';
}
