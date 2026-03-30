/**
 * SRS State Manager — localStorage persistence for per-verb review state.
 */

import { newCardState, FSRS_CONFIG, isMastered, getNextInterval } from './fsrs.js';

const STORAGE_KEY = 'srs_state';

/**
 * Load all SRS card states from localStorage.
 * @returns {Object} Map of verb_id → card state
 */
export function loadAllCards() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/**
 * Save all SRS card states to localStorage.
 */
function saveAllCards(cards) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
}

/**
 * Get or create a card state for a specific verb.
 */
export function getCard(verbId) {
  const cards = loadAllCards();
  return cards[verbId] || newCardState(verbId);
}

/**
 * Save an updated card state for a specific verb.
 */
export function saveCard(verbId, cardState) {
  const cards = loadAllCards();
  cards[verbId] = { ...cardState, verb_id: verbId };
  saveAllCards(cards);
}

/**
 * Get mastery stats for a specific difficulty tier.
 * @param {Array} verbs - All verb objects
 * @param {string} tier - Difficulty tier (A, B, BA, C, D, E)
 * @returns {{ total, mastered, percent }}
 */
export function getTierMasteryStats(verbs, tier) {
  const cards = loadAllCards();
  // BA is treated as B for filtering
  const tierVerbs = verbs.filter(v => {
    const d = v.difficulty;
    if (tier === 'B') return d === 'B' || d === 'BA';
    return d === tier;
  });
  const total = tierVerbs.length;
  const mastered = tierVerbs.filter(v => {
    const card = cards[v.id];
    return card && isMastered(card);
  }).length;
  return { total, mastered, percent: total > 0 ? mastered / total : 0 };
}

/**
 * Check if a tier is unlocked based on mastery of the previous tier.
 * Tier order: A → B → C → D → E
 * A is always unlocked. Each subsequent tier unlocks when tierUnlockPercent
 * of the previous tier's verbs are mastered.
 */
export function isTierUnlocked(verbs, tier) {
  const tierOrder = ['A', 'B', 'C', 'D', 'E'];
  const idx = tierOrder.indexOf(tier);
  if (idx <= 0) return true; // A is always unlocked

  const prevTier = tierOrder[idx - 1];
  const stats = getTierMasteryStats(verbs, prevTier);
  return stats.percent >= FSRS_CONFIG.tierUnlockPercent;
}

/**
 * Get all unlocked tiers.
 */
export function getUnlockedTiers(verbs) {
  const tierOrder = ['A', 'B', 'C', 'D', 'E'];
  const unlocked = [];
  for (const tier of tierOrder) {
    if (isTierUnlocked(verbs, tier)) {
      unlocked.push(tier);
    } else {
      break; // Tiers unlock sequentially
    }
  }
  return unlocked;
}

/**
 * Get summary stats for the SRS dashboard.
 */
export function getDashboardStats(verbs) {
  const cards = loadAllCards();
  const tierOrder = ['A', 'B', 'C', 'D', 'E'];
  const unlockedTiers = getUnlockedTiers(verbs);

  const tiers = tierOrder.map(tier => ({
    tier,
    unlocked: unlockedTiers.includes(tier),
    ...getTierMasteryStats(verbs, tier),
  }));

  let dueCount = 0;
  let totalReviewed = 0;
  const troubleVerbs = [];

  for (const verb of verbs) {
    const card = cards[verb.id];
    if (!card || card.state === 'new') continue;
    totalReviewed++;

    // Check if due
    if (card.last_review) {
      const daysSince = (new Date() - new Date(card.last_review)) / (1000 * 60 * 60 * 24);
      const interval = getNextInterval(card.S);
      if (daysSince >= interval) dueCount++;
    }

    if (card.confident_errors >= 2) {
      troubleVerbs.push({ verb, card });
    }
  }

  return { tiers, dueCount, totalReviewed, troubleVerbs };
}

/**
 * Reset all SRS state (for debugging/testing).
 */
export function resetAllCards() {
  localStorage.removeItem(STORAGE_KEY);
}
