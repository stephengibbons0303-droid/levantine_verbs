const IMPERFECT_OPTIONS = [
  { label: "After ra7 (will)", particle: "ra7" },
  { label: "After bedde (want)", particle: "bedde" },
  { label: "After lēzim (must)", particle: "lezim" },
];

/**
 * Returns a user-facing tense label and (for imperfect) the selected particle.
 * For imperfect, randomly picks one of three particle labels each call.
 *
 * @param {string} tense - Internal tense key
 * @returns {{ label: string, particle: string|null }}
 */
export function getTenseLabel(tense) {
  switch (tense) {
    case 'perfect':
      return { label: "Past", particle: null };
    case 'bi_imperfect':
      return { label: "Present", particle: null };
    case 'imperfect': {
      const pick = IMPERFECT_OPTIONS[Math.floor(Math.random() * IMPERFECT_OPTIONS.length)];
      return { label: pick.label, particle: pick.particle };
    }
    case 'imperative':
      return { label: "Command", particle: null };
    case 'participle':
      return { label: "Describing now", particle: null };
    default:
      return { label: tense, particle: null };
  }
}
