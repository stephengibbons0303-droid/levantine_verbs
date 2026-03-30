/**
 * FSRS v5 (Free Spaced Repetition Scheduler) — Core Algorithm
 *
 * Implements the DSR (Difficulty, Stability, Retrievability) memory model.
 * Formulas verified from: https://github.com/open-spaced-repetition/awesome-fsrs/wiki/The-Algorithm
 *
 * Ratings: 1=Again, 2=Hard, 3=Good, 4=Easy
 */

// FSRS v5 default parameters (19 values)
const FSRS_W = [
  0.40255, 1.18385, 3.173, 15.69105,  // w[0]-w[3]: initial stability for ratings 1-4
  7.1949,                               // w[4]: initial difficulty base
  0.5345,                               // w[5]: initial difficulty scaling
  1.4604,                               // w[6]: difficulty update factor
  0.0046,                               // w[7]: mean reversion weight
  1.54575,                              // w[8]: recall stability factor
  0.1192,                               // w[9]: recall stability S exponent
  1.01925,                              // w[10]: recall stability R factor
  1.9395,                               // w[11]: forget stability D factor
  0.11,                                 // w[12]: forget stability D exponent
  0.29605,                              // w[13]: forget stability S exponent
  2.2698,                               // w[14]: forget stability R factor
  0.2315,                               // w[15]: Hard penalty (G==2)
  2.9898,                               // w[16]: Easy bonus (G==4)
  0.51655,                              // w[17]: short-term stability decay
  0.6621,                               // w[18]: short-term stability base
];

export const FSRS_CONFIG = {
  requestRetention: 0.9,
  maximumInterval: 36500,
  masteryThreshold: 21,
  tierUnlockPercent: 0.70,
  confidentErrorSMultiplier: 0.25,
  confidentErrorDMultiplier: 1.5,
  enableFuzz: true,
};

/**
 * Initial stability for a first review with given rating.
 * S_0(G) = w[G-1]
 */
export function initialStability(rating) {
  return FSRS_W[rating - 1];
}

/**
 * Initial difficulty for a first review with given rating.
 * D_0(G) = w[4] - e^(w[5] * (G-1)) + 1
 */
export function initialDifficulty(rating) {
  return FSRS_W[4] - Math.exp(FSRS_W[5] * (rating - 1)) + 1;
}

/**
 * Clamp difficulty to [1, 10].
 */
function clampD(d) {
  return Math.min(10, Math.max(1, d));
}

/**
 * Update difficulty after a review.
 * D' = D + (-w[6] * (G-3)) * (10-D)/9
 * Then mean reversion: D'' = w[7] * D_0(4) + (1-w[7]) * D'
 */
export function updateDifficulty(D, rating) {
  const delta = -FSRS_W[6] * (rating - 3);
  const Dprime = D + delta * (10 - D) / 9;
  const D0_4 = initialDifficulty(4);
  const Dpp = FSRS_W[7] * D0_4 + (1 - FSRS_W[7]) * Dprime;
  return clampD(Dpp);
}

/**
 * Update difficulty for a confident error (Easy(4) + incorrect).
 * Uses confidentErrorDMultiplier × the standard Again penalty.
 * Standard Again: delta = -w[6] * (1-3) = 2*w[6]
 * Confident error: delta = confidentErrorDMultiplier * 2 * w[6] = 3*w[6] (at default 1.5)
 */
export function updateDifficultyConfidentError(D) {
  const standardAgainDelta = 2 * FSRS_W[6];
  const delta = FSRS_CONFIG.confidentErrorDMultiplier * standardAgainDelta;
  const Dprime = D + delta * (10 - D) / 9;
  const D0_4 = initialDifficulty(4);
  const Dpp = FSRS_W[7] * D0_4 + (1 - FSRS_W[7]) * Dprime;
  return clampD(Dpp);
}

/**
 * Retrievability — current probability of recall.
 * R(t, S) = (1 + t/(9*S))^(-1)   [FSRS v4.5+ power law]
 */
export function getRetrievability(S, daysSinceReview) {
  if (daysSinceReview <= 0) return 1;
  return Math.pow(1 + daysSinceReview / (9 * S), -1);
}

/**
 * Stability after successful recall.
 * S'_r(D,S,R,G) = S * (e^w[8] * (11-D) * S^(-w[9]) * (e^(w[10]*(1-R)) - 1) * w[15]^(G==2) * w[16]^(G==4) + 1)
 */
export function stabilityAfterRecall(D, S, R, rating) {
  const hardPenalty = rating === 2 ? FSRS_W[15] : 1;
  const easyBonus = rating === 4 ? FSRS_W[16] : 1;
  const inner =
    Math.exp(FSRS_W[8]) *
    (11 - D) *
    Math.pow(S, -FSRS_W[9]) *
    (Math.exp(FSRS_W[10] * (1 - R)) - 1) *
    hardPenalty *
    easyBonus;
  return S * (inner + 1);
}

/**
 * Stability after forgetting (lapse).
 * S'_f(D,S,R) = w[11] * D^(-w[12]) * ((S+1)^w[13] - 1) * e^(w[14]*(1-R))
 */
export function stabilityAfterForgetting(D, S, R) {
  return (
    FSRS_W[11] *
    Math.pow(D, -FSRS_W[12]) *
    (Math.pow(S + 1, FSRS_W[13]) - 1) *
    Math.exp(FSRS_W[14] * (1 - R))
  );
}

/**
 * Calculate next interval from stability and target retention.
 * Inverts the retrievability formula: t = 9*S * (1/R - 1)
 * Clamps to [1, maximumInterval].
 */
export function getNextInterval(S) {
  const R = FSRS_CONFIG.requestRetention;
  const interval = 9 * S * (1 / R - 1);
  let days = Math.round(interval);
  days = Math.max(1, Math.min(days, FSRS_CONFIG.maximumInterval));
  if (FSRS_CONFIG.enableFuzz && days >= 3) {
    const fuzz = Math.round((Math.random() - 0.5) * days * 0.05);
    days = Math.max(1, days + fuzz);
  }
  return days;
}

/**
 * Initialize a new card after first review.
 */
export function initCard(rating) {
  const S = initialStability(rating);
  const D = initialDifficulty(rating);
  return {
    D,
    S,
    reps: 1,
    lapses: 0,
    confident_errors: 0,
    state: rating === 1 ? 'learning' : 'review',
    last_review: new Date().toISOString().slice(0, 10),
  };
}

/**
 * Map confidence × outcome to effective FSRS rating.
 *
 * 2×4 Matrix:
 * | Confidence | Correct → Rating | Incorrect → Rating |
 * | Easy(4)    | Easy(4)          | CONFIDENT ERROR     |
 * | Good(3)    | Good(3)          | Again(1)            |
 * | Hard(2)    | Hard(2)          | Again(1)            |
 * | Again(1)   | Hard(2)          | Again(1)            |
 *
 * Returns { rating, isConfidentError }
 */
export function mapConfidenceOutcome(confidence, isCorrect) {
  if (isCorrect) {
    return {
      rating: confidence === 1 ? 2 : confidence, // Again+correct = Hard (lucky guess)
      isConfidentError: false,
    };
  }
  // Incorrect
  return {
    rating: 1, // All incorrect → Again(1)
    isConfidentError: confidence === 4, // Easy+incorrect = confident error
  };
}

/**
 * Update a card after a review.
 *
 * @param {Object} card - Current card state {D, S, last_review, reps, lapses, confident_errors, state}
 * @param {number} daysSinceReview - Days elapsed since last review
 * @param {number} confidence - User's confidence rating (1-4)
 * @param {boolean} isCorrect - Whether the answer was correct
 * @returns {Object} Updated card state
 */
export function updateCard(card, daysSinceReview, confidence, isCorrect) {
  const { rating, isConfidentError } = mapConfidenceOutcome(confidence, isCorrect);
  const R = getRetrievability(card.S, daysSinceReview);

  let newD, newS;

  if (card.reps === 0) {
    // First review
    return initCard(rating);
  }

  if (isCorrect) {
    newD = updateDifficulty(card.D, rating);
    newS = stabilityAfterRecall(card.D, card.S, R, rating);
  } else if (isConfidentError) {
    // Confident error: harsher penalty
    newD = updateDifficultyConfidentError(card.D);
    newS = Math.max(
      FSRS_W[0], // minimum stability = Again initial stability
      card.S * FSRS_CONFIG.confidentErrorSMultiplier
    );
  } else {
    // Standard lapse
    newD = updateDifficulty(card.D, 1); // Again rating
    newS = stabilityAfterForgetting(card.D, card.S, R);
  }

  const newState = isCorrect
    ? newS >= 1 ? 'review' : 'learning'
    : card.state === 'review' ? 'relearning' : 'learning';

  return {
    D: newD,
    S: newS,
    reps: card.reps + 1,
    lapses: card.lapses + (isCorrect ? 0 : 1),
    confident_errors: card.confident_errors + (isConfidentError ? 1 : 0),
    state: newState,
    last_review: new Date().toISOString().slice(0, 10),
  };
}

/**
 * Check if a card is due for review.
 */
export function isDue(card) {
  if (!card || !card.last_review) return true;
  const interval = getNextInterval(card.S);
  const lastReview = new Date(card.last_review);
  const now = new Date();
  const daysSince = (now - lastReview) / (1000 * 60 * 60 * 24);
  return daysSince >= interval;
}

/**
 * Check if a card is mastered (S >= masteryThreshold).
 */
export function isMastered(card) {
  return card && card.S >= FSRS_CONFIG.masteryThreshold;
}

/**
 * Create an empty (new) card state for a verb.
 */
export function newCardState(verbId) {
  return {
    verb_id: verbId,
    D: 0,
    S: 0,
    last_review: null,
    reps: 0,
    lapses: 0,
    confident_errors: 0,
    state: 'new',
  };
}
