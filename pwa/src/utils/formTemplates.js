/**
 * Conjugation form templates for Levantine Arabic.
 *
 * Each template defines how root consonants (C1, C2, C3, C4) map into
 * past/present/imperative stems, and what prefixes/suffixes each person gets.
 *
 * Conventions:
 * - Root letters are numbered C1, C2, C3 (trilateral) or C1, C2, C3, C4 (quadrilateral)
 * - Templates use functions: (c1, c2, c3) => stem string
 * - "Safe" = derived forms where conjugation is fully mechanical
 * - "Moderate" = Form I sub-patterns where ALPS label determines vowels
 */

// Person suffixes for PAST tense (universal across all forms)
export const PAST_SUFFIXES = {
  ana:    'it',
  nihna:  'na',
  inta:   'it',
  inti:   'ti',
  intu:   'to',
  huwwe:  '',    // bare stem
  hiyye:  'it',  // sometimes 'at' - handled in template
  hinne:  'o',
};

// Person prefix patterns for PRESENT tense
// Each form defines its own prefix set since they vary
const PRESENT_PREFIXES_STANDARD = {
  ana:    'b',     nihna:  'mn',
  inta:   'bt',    inti:   'bt',   intu:   'bt',
  huwwe:  'byi',   hiyye:  'bt',   hinne:  'byi',
};

const PRESENT_PREFIXES_I = {
  ana:    'bi',    nihna:  'mni',
  inta:   'bti',   inti:   'bti',  intu:   'bti',
  huwwe:  'byi',   hiyye:  'bti',  hinne:  'byi',
};

const PRESENT_PREFIXES_IB = {
  ana:    'bo',    nihna:  'mno',
  inta:   'bto',   inti:   'bto',  intu:   'bto',
  huwwe:  'byo',   hiyye:  'bto',  hinne:  'byo',
};

// Tense suffixes for present (f/pl add -y/-o to shortened stem)
const PRESENT_SUFFIXES = {
  ana: '', nihna: '', inta: '', huwwe: '', hiyye: '',
  inti: 'y', intu: 'o', hinne: 'o',
};

// Imperative persons only
const IMP_PERSONS = ['inta', 'inti', 'intu'];
const IMP_SUFFIXES = { inta: '', inti: 'y', intu: 'o' };

/**
 * Build all 8 person forms for a given stem + prefix/suffix rules.
 */
function buildPastForms(stemFn, root) {
  const persons = ['ana', 'nihna', 'inta', 'inti', 'intu', 'huwwe', 'hiyye', 'hinne'];
  return persons.map(p => ({
    person: p,
    arabic: '',
    translit: stemFn(root) + PAST_SUFFIXES[p],
    english: '',
  }));
}

function buildPresentForms(stemFn, shortStemFn, root, prefixes) {
  const persons = ['ana', 'nihna', 'inta', 'inti', 'intu', 'huwwe', 'hiyye', 'hinne'];
  return persons.map(p => {
    const suffix = PRESENT_SUFFIXES[p];
    const stem = suffix ? shortStemFn(root) : stemFn(root);
    return {
      person: p,
      arabic: '',
      translit: prefixes[p] + stem + suffix,
      english: '',
    };
  });
}

function buildImperativeForms(stemFn, shortStemFn, root) {
  return IMP_PERSONS.map(p => {
    const suffix = IMP_SUFFIXES[p];
    const stem = suffix ? shortStemFn(root) : stemFn(root);
    return {
      person: p,
      arabic: '',
      translit: stem + suffix,
      english: '',
    };
  });
}

/**
 * Form templates.
 * Each returns { perfect, imperfect, bi_imperfect, imperative } with forms arrays.
 */
export const FORM_TEMPLATES = {
  // ============ SAFE: Derived Forms ============

  'Form II': (root) => {
    const [c1, c2, c3] = root;
    const pastStem = () => `${c1}a${c2}${c2}a${c3}`;
    const presStem = () => `${c1}a${c2}${c2}i${c3}`;
    const shortPres = () => `${c1}a${c2}${c2}${c3}`;
    const impStem = () => `${c1}a${c2}${c2}i${c3}`;
    const shortImp = () => `${c1}a${c2}${c2}${c3}`;
    return {
      perfect: { forms: buildPastForms(pastStem, root) },
      bi_imperfect: { forms: buildPresentForms(presStem, shortPres, root, PRESENT_PREFIXES_STANDARD) },
      imperfect: { forms: buildPresentForms(presStem, shortPres, root, { ana: '', nihna: 'n', inta: 't', inti: 't', intu: 't', huwwe: 'yi', hiyye: 't', hinne: 'yi' }) },
      imperative: { forms: buildImperativeForms(impStem, shortImp, root) },
    };
  },

  'Form III': (root) => {
    const [c1, c2, c3] = root;
    const pastStem = () => `${c1}aa${c2}a${c3}`;
    const presStem = () => `${c1}aa${c2}i${c3}`;
    const shortPres = () => `${c1}aa${c2}${c3}`;
    return {
      perfect: { forms: buildPastForms(pastStem, root) },
      bi_imperfect: { forms: buildPresentForms(presStem, shortPres, root, PRESENT_PREFIXES_STANDARD) },
      imperfect: { forms: buildPresentForms(presStem, shortPres, root, { ana: '', nihna: 'n', inta: 't', inti: 't', intu: 't', huwwe: 'yi', hiyye: 't', hinne: 'yi' }) },
      imperative: { forms: buildImperativeForms(presStem, shortPres, root) },
    };
  },

  'Form V': (root) => {
    const [c1, c2, c3] = root;
    const pastStem = () => `t${c1}a${c2}${c2}a${c3}`;
    const presStem = () => `t${c1}a${c2}${c2}a${c3}`;
    const shortPres = () => `t${c1}a${c2}${c2}a${c3}`;
    const presPrefix = {
      ana: 'bi', nihna: 'mni', inta: 'bti', inti: 'bti', intu: 'bti',
      huwwe: 'byi', hiyye: 'bti', hinne: 'byi',
    };
    return {
      perfect: { forms: buildPastForms(pastStem, root) },
      bi_imperfect: { forms: buildPresentForms(presStem, shortPres, root, presPrefix) },
      imperfect: { forms: buildPresentForms(presStem, shortPres, root, { ana: '', nihna: 'ni', inta: 'ti', inti: 'ti', intu: 'ti', huwwe: 'yi', hiyye: 'ti', hinne: 'yi' }) },
      imperative: { forms: buildImperativeForms(pastStem, shortPres, root) },
    };
  },

  'Form VI': (root) => {
    const [c1, c2, c3] = root;
    const pastStem = () => `t${c1}aa${c2}a${c3}`;
    const presStem = () => `t${c1}aa${c2}a${c3}`;
    const shortPres = () => `t${c1}aa${c2}a${c3}`;
    const presPrefix = {
      ana: 'bi', nihna: 'mni', inta: 'bti', inti: 'bti', intu: 'bti',
      huwwe: 'byi', hiyye: 'bti', hinne: 'byi',
    };
    return {
      perfect: { forms: buildPastForms(pastStem, root) },
      bi_imperfect: { forms: buildPresentForms(presStem, shortPres, root, presPrefix) },
      imperfect: { forms: buildPresentForms(presStem, shortPres, root, { ana: '', nihna: 'ni', inta: 'ti', inti: 'ti', intu: 'ti', huwwe: 'yi', hiyye: 'ti', hinne: 'yi' }) },
      imperative: { forms: buildImperativeForms(pastStem, shortPres, root) },
    };
  },

  'Form VII': (root) => {
    const [c1, c2, c3] = root;
    const pastStem = () => `n${c1}a${c2}a${c3}`;
    const presStem = () => `n${c1}o${c2}i${c3}`;
    const shortPres = () => `n${c1}o${c2}${c3}`;
    return {
      perfect: { forms: buildPastForms(pastStem, root) },
      bi_imperfect: { forms: buildPresentForms(presStem, shortPres, root, PRESENT_PREFIXES_IB) },
      imperfect: { forms: buildPresentForms(presStem, shortPres, root, { ana: '', nihna: 'no', inta: 'to', inti: 'to', intu: 'to', huwwe: 'yo', hiyye: 'to', hinne: 'yo' }) },
      imperative: { forms: buildImperativeForms(presStem, shortPres, root) },
    };
  },

  'Form VIII': (root) => {
    const [c1, c2, c3] = root;
    const pastStem = () => `${c1}ta${c2}a${c3}`;
    const presStem = () => `${c1}ti${c2}i${c3}`;
    const shortPres = () => `${c1}ti${c2}${c3}`;
    return {
      perfect: { forms: buildPastForms(pastStem, root) },
      bi_imperfect: { forms: buildPresentForms(presStem, shortPres, root, PRESENT_PREFIXES_I) },
      imperfect: { forms: buildPresentForms(presStem, shortPres, root, { ana: '', nihna: 'ni', inta: 'ti', inti: 'ti', intu: 'ti', huwwe: 'yi', hiyye: 'ti', hinne: 'yi' }) },
      imperative: { forms: buildImperativeForms(presStem, shortPres, root) },
    };
  },

  'Form X': (root) => {
    const [c1, c2, c3] = root;
    const pastStem = () => `sta${c1}${c2}a${c3}`;
    const presStem = () => `sta${c1}${c2}i${c3}`;
    const shortPres = () => `sta${c1}i${c2}${c3}`;
    return {
      perfect: { forms: buildPastForms(pastStem, root) },
      bi_imperfect: { forms: buildPresentForms(presStem, shortPres, root, PRESENT_PREFIXES_I) },
      imperfect: { forms: buildPresentForms(presStem, shortPres, root, { ana: '', nihna: 'ni', inta: 'ti', inti: 'ti', intu: 'ti', huwwe: 'yi', hiyye: 'ti', hinne: 'yi' }) },
      imperative: { forms: buildImperativeForms(presStem, shortPres, root) },
    };
  },

  'Quadrilateral': (root) => {
    const [c1, c2, c3, c4] = root;
    const pastStem = () => `${c1}a${c2}${c3}a${c4}`;
    const presStem = () => `${c1}a${c2}${c3}i${c4}`;
    const shortPres = () => `${c1}a${c2}i${c3}${c4}`;
    return {
      perfect: { forms: buildPastForms(pastStem, root) },
      bi_imperfect: { forms: buildPresentForms(presStem, shortPres, root, PRESENT_PREFIXES_I) },
      imperfect: { forms: buildPresentForms(presStem, shortPres, root, { ana: '', nihna: 'ni', inta: 'ti', inti: 'ti', intu: 'ti', huwwe: 'yi', hiyye: 'ti', hinne: 'yi' }) },
      imperative: { forms: buildImperativeForms(presStem, shortPres, root) },
    };
  },

  // ============ MODERATE: Form I Sub-Patterns ============

  'Form IA': (root) => {
    const [c1, c2, c3] = root;
    const pastStem = () => `${c1}a${c2}a${c3}`;
    const presStem = () => `${c1}${c2}a${c3}`;
    const shortPres = () => `${c1}${c2}a${c3}`;
    return {
      perfect: { forms: buildPastForms(pastStem, root) },
      bi_imperfect: { forms: buildPresentForms(presStem, shortPres, root, PRESENT_PREFIXES_I) },
      imperfect: { forms: buildPresentForms(presStem, shortPres, root, { ana: '', nihna: 'ni', inta: 'ti', inti: 'ti', intu: 'ti', huwwe: 'yi', hiyye: 'ti', hinne: 'yi' }) },
      imperative: { forms: buildImperativeForms(() => `${c1}${c2}aa${c3}`, () => `${c1}${c2}a${c3}`, root) },
    };
  },

  'Form IB': (root) => {
    const [c1, c2, c3] = root;
    const pastStem = () => `${c1}a${c2}a${c3}`;
    const presStem = () => `${c1}${c2}o${c3}`;
    const shortPres = () => `${c1}${c2}${c3}`;
    return {
      perfect: { forms: buildPastForms(pastStem, root) },
      bi_imperfect: { forms: buildPresentForms(presStem, shortPres, root, PRESENT_PREFIXES_IB) },
      imperfect: { forms: buildPresentForms(presStem, shortPres, root, { ana: '', nihna: 'no', inta: 'to', inti: 'to', intu: 'to', huwwe: 'yo', hiyye: 'to', hinne: 'yo' }) },
      imperative: { forms: buildImperativeForms(() => `${c1}${c2}oo${c3}`, () => `${c1}${c2}o${c3}`, root) },
    };
  },

  'Form IC': (root) => {
    const [c1, c2, c3] = root;
    const pastStem = () => `${c1}a${c2}a${c3}`;
    const presStem = () => `${c1}${c2}o${c3}`;
    const shortPres = () => `${c1}i${c2}${c3}`;
    return {
      perfect: { forms: buildPastForms(pastStem, root) },
      bi_imperfect: { forms: buildPresentForms(presStem, shortPres, root, PRESENT_PREFIXES_I) },
      imperfect: { forms: buildPresentForms(presStem, shortPres, root, { ana: '', nihna: 'ni', inta: 'ti', inti: 'ti', intu: 'ti', huwwe: 'yi', hiyye: 'ti', hinne: 'yi' }) },
      imperative: { forms: buildImperativeForms(() => `${c1}${c2}oo${c3}`, () => `${c1}${c2}i${c3}`, root) },
    };
  },

  'Form ID': (root) => {
    const [c1, c2, c3] = root;
    const pastStem = () => `${c1}i${c2}i${c3}`;
    const presStem = () => `${c1}${c2}a${c3}`;
    const shortPres = () => `${c1}${c2}a${c3}`;
    return {
      perfect: { forms: buildPastForms(pastStem, root) },
      bi_imperfect: { forms: buildPresentForms(presStem, shortPres, root, PRESENT_PREFIXES_I) },
      imperfect: { forms: buildPresentForms(presStem, shortPres, root, { ana: '', nihna: 'ni', inta: 'ti', inti: 'ti', intu: 'ti', huwwe: 'yi', hiyye: 'ti', hinne: 'yi' }) },
      imperative: { forms: buildImperativeForms(() => `${c1}${c2}a${c3}`, shortPres, root) },
    };
  },
};

/**
 * Normalize a form label from the XLSX to match our template keys.
 * E.g., "Form II, Final Weak" → "Form II" (falls back to base form if no specific template)
 */
export function normalizeFormLabel(formLabel) {
  if (!formLabel) return null;

  // Direct match
  if (FORM_TEMPLATES[formLabel]) return formLabel;

  // Try base form (strip everything after comma or "Irr.")
  const base = formLabel.split(',')[0].split(' Irr.')[0].split(' Final')[0].split(' Medial')[0].split(' Geminate')[0].trim();
  if (FORM_TEMPLATES[base]) return base;

  // Special mappings
  if (formLabel.startsWith('Emphatic')) return 'Quadrilateral';
  if (formLabel.startsWith('Quad. Reflexive')) return null; // Not supported yet
  if (formLabel.startsWith('Quad. Passive')) return null;

  return null;
}

/**
 * True if a form label carries an irregular/weak/geminate/hamza qualifier that the
 * base sound-root templates cannot honor. `normalizeFormLabel` reaches a template for
 * these ONLY by discarding the qualifier, which produces phonologically wrong forms
 * (SAD §8.3). Such verbs must be withheld from generation until a native-speaker-signed
 * static table exists — teaching nothing beats teaching a wrong conjugation.
 */
export function isRiskyForm(formLabel) {
  if (!formLabel) return false;
  if (FORM_TEMPLATES[formLabel]) return false; // exact template exists → honored, not risky
  const base = formLabel
    .split(',')[0]
    .split(' Irr.')[0]
    .split(' Final')[0]
    .split(' Medial')[0]
    .split(' Geminate')[0]
    .trim();
  // Reached a template only by stripping a qualifier off the label → the irregularity is lost.
  return base !== formLabel && Boolean(FORM_TEMPLATES[base]);
}
