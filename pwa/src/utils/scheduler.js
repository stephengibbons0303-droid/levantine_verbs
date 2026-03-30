/**
 * Quiz Scheduler — selects which verbs to quiz based on FSRS state.
 *
 * Priority: (1) due verbs (lowest R first), (2) new verbs from unlocked tiers, (3) approaching due
 * Interleaving: never same verb/tense consecutively.
 * Tier gating: A only at start; unlock B when 70% of A mastered; etc.
 */

import { getRetrievability, getNextInterval } from './fsrs.js';
import { loadAllCards, getUnlockedTiers } from './srsState.js';
import { TENSES, PERSONS } from './constants.js';

/**
 * Get the next quiz item for SRS mode.
 *
 * @param {Array} verbs - All verb objects
 * @param {Object} lastItem - Previous quiz item { verbId, tense } or null
 * @param {Object} options - { selectedTenses, selectedPersons, excludeVerbId, excludeTenses }
 * @returns {{ verb, tense, person } | null} Next item to quiz, or null if nothing due
 */
export function getNextSRSItem(verbs, lastItem = null, options = {}) {
  const cards = loadAllCards();
  const unlockedTiers = getUnlockedTiers(verbs);

  const selectedTenses = options.selectedTenses || TENSES;
  const selectedPersons = options.selectedPersons || PERSONS;
  const excludeVerbId = options.excludeVerbId || null;
  const excludeTenses = options.excludeTenses || null;

  // Filter to verbs in unlocked tiers with available conjugations
  const eligible = verbs.filter(v => {
    const tier = v.difficulty;
    if (!tier) return false;
    // BA treated as B
    const effectiveTier = tier === 'BA' ? 'B' : tier;
    return unlockedTiers.includes(effectiveTier) && v.conjugations !== null;
  });

  if (eligible.length === 0) return null;

  const now = new Date();

  // Score each verb: lower = more urgent
  const scored = eligible.map(verb => {
    const card = cards[verb.id];
    if (!card || card.state === 'new' || card.reps === 0) {
      // New verb: priority based on tier order
      const tierPriority = { A: 10, B: 20, C: 30, D: 40, E: 50 };
      const tp = tierPriority[verb.difficulty === 'BA' ? 'B' : verb.difficulty] || 50;
      return { verb, score: tp, isNew: true, R: 1 };
    }

    const daysSince = card.last_review
      ? (now - new Date(card.last_review)) / (1000 * 60 * 60 * 24)
      : 999;
    const R = getRetrievability(card.S, daysSince);
    const interval = getNextInterval(card.S);
    const overdue = daysSince - interval;

    // Due verbs get negative scores (more urgent = more negative)
    // Not-yet-due verbs get positive scores
    const score = overdue >= 0 ? -overdue - (1 - R) * 100 : overdue;

    return { verb, score, isNew: false, R };
  });

  // Sort: most urgent first (lowest score)
  scored.sort((a, b) => {
    // Due verbs before new verbs before not-yet-due
    if (a.score < 0 && b.score >= 0) return -1;
    if (a.score >= 0 && b.score < 0) return 1;
    if (a.isNew && !b.isNew && b.score >= 0) return -1;
    if (!a.isNew && b.isNew && a.score >= 0) return 1;
    return a.score - b.score;
  });

  // Pick a tense and person, avoiding the same verb/tense as last time
  // If excludeVerbId filters out the only option, we'll retry without it
  for (let attempt = 0; attempt < 2; attempt++) {
    const skipVerbId = attempt === 0 ? excludeVerbId : null;

    for (const { verb } of scored) {
      // Skip excluded verb (interleaving cap reached or "New Verb" skip)
      if (skipVerbId && verb.id === skipVerbId) continue;

      const availableTenses = selectedTenses.filter(t => {
        if (!verb.conjugations?.[t]) return false;
        // Avoid same verb+tense as last item
        if (lastItem && lastItem.verbId === verb.id && lastItem.tense === t) return false;
        // Avoid recently-used tenses for tense variety within a verb streak
        if (excludeTenses?.includes(t)) return false;
        return true;
      });

      if (availableTenses.length === 0) {
        // If tense exclusion blocked all tenses, try again without it
        if (excludeTenses && excludeTenses.length > 0) {
          const fallbackTenses = selectedTenses.filter(t => {
            if (!verb.conjugations?.[t]) return false;
            if (lastItem && lastItem.verbId === verb.id && lastItem.tense === t) return false;
            return true;
          });
          if (fallbackTenses.length > 0) {
            const tense = fallbackTenses[Math.floor(Math.random() * fallbackTenses.length)];
            const tenseForms = verb.conjugations[tense]?.forms || [];
            const availablePersons = tenseForms
              .map(f => f.person)
              .filter(p => selectedPersons.includes(p));
            if (availablePersons.length > 0) {
              const person = availablePersons[Math.floor(Math.random() * availablePersons.length)];
              return { verb, tense, person };
            }
          }
        }
        continue;
      }

      const tense = availableTenses[Math.floor(Math.random() * availableTenses.length)];
      const tenseForms = verb.conjugations[tense]?.forms || [];
      const availablePersons = tenseForms
        .map(f => f.person)
        .filter(p => selectedPersons.includes(p));

      if (availablePersons.length === 0) continue;

      const person = availablePersons[Math.floor(Math.random() * availablePersons.length)];

      return { verb, tense, person };
    }

    // If first attempt (with exclusion) found nothing, retry without excluding
    if (attempt === 0 && excludeVerbId) continue;
    break;
  }

  return null;
}

/**
 * Get count of due verbs.
 */
export function getDueCount(verbs) {
  const cards = loadAllCards();
  const now = new Date();
  let count = 0;

  for (const verb of verbs) {
    const card = cards[verb.id];
    if (!card || card.state === 'new' || card.reps === 0) continue;
    if (!card.last_review) continue;

    const daysSince = (now - new Date(card.last_review)) / (1000 * 60 * 60 * 24);
    const interval = getNextInterval(card.S);
    if (daysSince >= interval) count++;
  }

  return count;
}

/**
 * Get count of new (unseen) verbs in unlocked tiers.
 */
export function getNewCount(verbs) {
  const cards = loadAllCards();
  const unlockedTiers = getUnlockedTiers(verbs);

  return verbs.filter(v => {
    const tier = v.difficulty === 'BA' ? 'B' : v.difficulty;
    if (!tier || !unlockedTiers.includes(tier)) return false;
    if (!v.conjugations) return false;
    const card = cards[v.id];
    return !card || card.state === 'new' || card.reps === 0;
  }).length;
}

/**
 * Generate remedial follow-up items for confident error path.
 * 2-3 questions on the SAME verb, different tenses/persons.
 * Uses the normal conjugation data (getConjugation pipeline).
 *
 * @param {Object} verb - The verb object
 * @param {string} originalTense - Tense of the original question (to avoid)
 * @param {string} originalPerson - Person of the original question (to avoid)
 * @returns {Array<{tense, person}>} 2-3 follow-up items
 */
export function generateRemedialItems(verb, originalTense, originalPerson) {
  const items = [];
  const tenses = TENSES.filter(t => verb.conjugations?.[t]?.forms?.length > 0);

  // Collect all possible tense/person combos, excluding the original
  const candidates = [];
  for (const tense of tenses) {
    const forms = verb.conjugations[tense].forms || [];
    for (const form of forms) {
      if (tense === originalTense && form.person === originalPerson) continue;
      candidates.push({ tense, person: form.person });
    }
  }

  // Shuffle and pick 2-3
  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
  }

  const count = Math.min(candidates.length, Math.random() < 0.5 ? 2 : 3);
  return candidates.slice(0, count);
}
