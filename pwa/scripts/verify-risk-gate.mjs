/**
 * Correctness gate check (SAD §8.3) — run: `node pwa/scripts/verify-risk-gate.mjs`
 *
 * Asserts that the conjugation engine WITHHOLDS every verb whose `form` label carries an
 * irregular/weak/geminate qualifier (those generate phonologically wrong forms), while
 * still generating the regular sound-root verbs. Exits non-zero on any violation.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { ensureConjugations } from '../src/utils/conjugationEngine.js';
import { isRiskyForm, normalizeFormLabel, FORM_TEMPLATES } from '../src/utils/formTemplates.js';

const here = dirname(fileURLToPath(import.meta.url));
const verbs = JSON.parse(readFileSync(join(here, '../public/verbs.json'), 'utf8'));

// Classify every generatable candidate BEFORE mutation.
const risky = [];      // must be withheld
const regular = [];    // must still generate
for (const v of verbs) {
  if (v.conjugations !== null || !v.root_letters || !v.form) continue;
  if (isRiskyForm(v.form)) { risky.push(v); continue; }
  if (normalizeFormLabel(v.form) && FORM_TEMPLATES[normalizeFormLabel(v.form)]) regular.push(v);
}

// Run the real engine.
for (const v of verbs) ensureConjugations(v);

const leaked = risky.filter(v => v.conjugations !== null);        // risky that still generated → FAIL
const dropped = regular.filter(v => v.conjugations === null);     // regular that stopped generating → FAIL

console.log(`risky (withheld):     ${risky.length}`);
console.log(`regular (generated):  ${regular.length}`);
console.log(`static (curated):     ${verbs.filter(v => v.conjugations !== null).length - regular.length} (incl. runtime-generated regular above once mutated)`);

let ok = true;
if (leaked.length) {
  ok = false;
  console.error(`\nFAIL: ${leaked.length} risky verb(s) still generated a conjugation:`);
  for (const v of leaked.slice(0, 10)) console.error(`  id ${v.id} "${v.verb?.translit}" form="${v.form}"`);
}
if (dropped.length) {
  ok = false;
  console.error(`\nFAIL: ${dropped.length} regular verb(s) unexpectedly withheld:`);
  for (const v of dropped.slice(0, 10)) console.error(`  id ${v.id} "${v.verb?.translit}" form="${v.form}"`);
}

if (ok) {
  console.log(`\nPASS — all ${risky.length} risky verbs withheld; all ${regular.length} regular verbs generate.`);
  process.exit(0);
} else {
  process.exit(1);
}
