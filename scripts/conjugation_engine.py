#!/usr/bin/env python3
"""
Conjugation Engine — Python version for development and validation.

Generates conjugation tables from root letters + form type.
Handles "safe" derived forms (II, III, V, VI, VII, VIII, X, Quad) and
"moderate" Form I sub-patterns (IA, IB, IC, ID).
"""

import json
import os
import re

# Person suffixes for past tense
PAST_SUFFIXES = {
    'ana': 'it', 'nihna': 'na', 'inta': 'it', 'inti': 'ti',
    'intu': 'to', 'huwwe': '', 'hiyye': 'it', 'hinne': 'o',
}

PERSONS = ['ana', 'nihna', 'inta', 'inti', 'intu', 'huwwe', 'hiyye', 'hinne']
IMP_PERSONS = ['inta', 'inti', 'intu']
IMP_SUFFIXES = {'inta': '', 'inti': 'y', 'intu': 'o'}
PRESENT_SUFFIXES = {
    'ana': '', 'nihna': '', 'inta': '', 'huwwe': '', 'hiyye': '',
    'inti': 'y', 'intu': 'o', 'hinne': 'o',
}


def build_past_forms(stem_fn, root):
    return [{'person': p, 'arabic': '', 'translit': stem_fn(root) + PAST_SUFFIXES[p], 'english': ''}
            for p in PERSONS]


def build_present_forms(stem_fn, short_stem_fn, root, prefixes):
    forms = []
    for p in PERSONS:
        suffix = PRESENT_SUFFIXES[p]
        stem = short_stem_fn(root) if suffix else stem_fn(root)
        forms.append({'person': p, 'arabic': '', 'translit': prefixes[p] + stem + suffix, 'english': ''})
    return forms


def build_imperative_forms(stem_fn, short_stem_fn, root):
    forms = []
    for p in IMP_PERSONS:
        suffix = IMP_SUFFIXES[p]
        stem = short_stem_fn(root) if suffix else stem_fn(root)
        forms.append({'person': p, 'arabic': '', 'translit': stem + suffix, 'english': ''})
    return forms


# Present tense prefix sets
PREF_STD = {'ana': 'b', 'nihna': 'mn', 'inta': 'bt', 'inti': 'bt', 'intu': 'bt',
            'huwwe': 'byi', 'hiyye': 'bt', 'hinne': 'byi'}
PREF_I = {'ana': 'bi', 'nihna': 'mni', 'inta': 'bti', 'inti': 'bti', 'intu': 'bti',
          'huwwe': 'byi', 'hiyye': 'bti', 'hinne': 'byi'}
PREF_IB = {'ana': 'bo', 'nihna': 'mno', 'inta': 'bto', 'inti': 'bto', 'intu': 'bto',
           'huwwe': 'byo', 'hiyye': 'bto', 'hinne': 'byo'}
# Imperfect (no bi- prefix) versions
IMP_STD = {'ana': '', 'nihna': 'n', 'inta': 't', 'inti': 't', 'intu': 't',
           'huwwe': 'yi', 'hiyye': 't', 'hinne': 'yi'}
IMP_I = {'ana': '', 'nihna': 'ni', 'inta': 'ti', 'inti': 'ti', 'intu': 'ti',
         'huwwe': 'yi', 'hiyye': 'ti', 'hinne': 'yi'}
IMP_IB = {'ana': '', 'nihna': 'no', 'inta': 'to', 'inti': 'to', 'intu': 'to',
          'huwwe': 'yo', 'hiyye': 'to', 'hinne': 'yo'}


def generate_form_ii(root):
    c1, c2, c3 = root
    past = lambda r: f'{c1}a{c2}{c2}a{c3}'
    pres = lambda r: f'{c1}a{c2}{c2}i{c3}'
    short = lambda r: f'{c1}a{c2}{c2}{c3}'
    return {
        'perfect': {'forms': build_past_forms(past, root)},
        'bi_imperfect': {'forms': build_present_forms(pres, short, root, PREF_STD)},
        'imperfect': {'forms': build_present_forms(pres, short, root, IMP_STD)},
        'imperative': {'forms': build_imperative_forms(pres, short, root)},
    }


def generate_form_iii(root):
    c1, c2, c3 = root
    past = lambda r: f'{c1}aa{c2}a{c3}'
    pres = lambda r: f'{c1}aa{c2}i{c3}'
    short = lambda r: f'{c1}aa{c2}{c3}'
    return {
        'perfect': {'forms': build_past_forms(past, root)},
        'bi_imperfect': {'forms': build_present_forms(pres, short, root, PREF_STD)},
        'imperfect': {'forms': build_present_forms(pres, short, root, IMP_STD)},
        'imperative': {'forms': build_imperative_forms(pres, short, root)},
    }


def generate_form_v(root):
    c1, c2, c3 = root
    past = lambda r: f't{c1}a{c2}{c2}a{c3}'
    pres = lambda r: f't{c1}a{c2}{c2}a{c3}'
    short = lambda r: f't{c1}a{c2}{c2}a{c3}'
    pref = {'ana': 'bi', 'nihna': 'mni', 'inta': 'bti', 'inti': 'bti', 'intu': 'bti',
            'huwwe': 'byi', 'hiyye': 'bti', 'hinne': 'byi'}
    imp = {'ana': '', 'nihna': 'ni', 'inta': 'ti', 'inti': 'ti', 'intu': 'ti',
           'huwwe': 'yi', 'hiyye': 'ti', 'hinne': 'yi'}
    return {
        'perfect': {'forms': build_past_forms(past, root)},
        'bi_imperfect': {'forms': build_present_forms(pres, short, root, pref)},
        'imperfect': {'forms': build_present_forms(pres, short, root, imp)},
        'imperative': {'forms': build_imperative_forms(past, short, root)},
    }


def generate_form_vi(root):
    c1, c2, c3 = root
    past = lambda r: f't{c1}aa{c2}a{c3}'
    pres = lambda r: f't{c1}aa{c2}a{c3}'
    short = lambda r: f't{c1}aa{c2}a{c3}'
    pref = {'ana': 'bi', 'nihna': 'mni', 'inta': 'bti', 'inti': 'bti', 'intu': 'bti',
            'huwwe': 'byi', 'hiyye': 'bti', 'hinne': 'byi'}
    imp = {'ana': '', 'nihna': 'ni', 'inta': 'ti', 'inti': 'ti', 'intu': 'ti',
           'huwwe': 'yi', 'hiyye': 'ti', 'hinne': 'yi'}
    return {
        'perfect': {'forms': build_past_forms(past, root)},
        'bi_imperfect': {'forms': build_present_forms(pres, short, root, pref)},
        'imperfect': {'forms': build_present_forms(pres, short, root, imp)},
        'imperative': {'forms': build_imperative_forms(past, short, root)},
    }


def generate_form_vii(root):
    c1, c2, c3 = root
    past = lambda r: f'n{c1}a{c2}a{c3}'
    pres = lambda r: f'n{c1}o{c2}i{c3}'
    short = lambda r: f'n{c1}o{c2}{c3}'
    return {
        'perfect': {'forms': build_past_forms(past, root)},
        'bi_imperfect': {'forms': build_present_forms(pres, short, root, PREF_IB)},
        'imperfect': {'forms': build_present_forms(pres, short, root, IMP_IB)},
        'imperative': {'forms': build_imperative_forms(pres, short, root)},
    }


def generate_form_viii(root):
    c1, c2, c3 = root
    past = lambda r: f'{c1}ta{c2}a{c3}'
    pres = lambda r: f'{c1}ti{c2}i{c3}'
    short = lambda r: f'{c1}ti{c2}{c3}'
    return {
        'perfect': {'forms': build_past_forms(past, root)},
        'bi_imperfect': {'forms': build_present_forms(pres, short, root, PREF_I)},
        'imperfect': {'forms': build_present_forms(pres, short, root, IMP_I)},
        'imperative': {'forms': build_imperative_forms(pres, short, root)},
    }


def generate_form_x(root):
    c1, c2, c3 = root
    past = lambda r: f'sta{c1}{c2}a{c3}'
    pres = lambda r: f'sta{c1}{c2}i{c3}'
    short = lambda r: f'sta{c1}i{c2}{c3}'
    return {
        'perfect': {'forms': build_past_forms(past, root)},
        'bi_imperfect': {'forms': build_present_forms(pres, short, root, PREF_I)},
        'imperfect': {'forms': build_present_forms(pres, short, root, IMP_I)},
        'imperative': {'forms': build_imperative_forms(pres, short, root)},
    }


def generate_quad(root):
    c1, c2, c3, c4 = root
    past = lambda r: f'{c1}a{c2}{c3}a{c4}'
    pres = lambda r: f'{c1}a{c2}{c3}i{c4}'
    short = lambda r: f'{c1}a{c2}i{c3}{c4}'
    return {
        'perfect': {'forms': build_past_forms(past, root)},
        'bi_imperfect': {'forms': build_present_forms(pres, short, root, PREF_I)},
        'imperfect': {'forms': build_present_forms(pres, short, root, IMP_I)},
        'imperative': {'forms': build_imperative_forms(pres, short, root)},
    }


def generate_form_ia(root):
    c1, c2, c3 = root
    past = lambda r: f'{c1}a{c2}a{c3}'
    pres = lambda r: f'{c1}{c2}a{c3}'
    short = lambda r: f'{c1}{c2}a{c3}'
    imp_m = lambda r: f'{c1}{c2}aa{c3}'
    imp_short = lambda r: f'{c1}{c2}a{c3}'
    return {
        'perfect': {'forms': build_past_forms(past, root)},
        'bi_imperfect': {'forms': build_present_forms(pres, short, root, PREF_I)},
        'imperfect': {'forms': build_present_forms(pres, short, root, IMP_I)},
        'imperative': {'forms': build_imperative_forms(imp_m, imp_short, root)},
    }


def generate_form_ib(root):
    c1, c2, c3 = root
    past = lambda r: f'{c1}a{c2}a{c3}'
    pres = lambda r: f'{c1}{c2}o{c3}'
    short = lambda r: f'{c1}{c2}{c3}'
    imp_m = lambda r: f'{c1}{c2}oo{c3}'
    imp_short = lambda r: f'{c1}{c2}o{c3}'
    return {
        'perfect': {'forms': build_past_forms(past, root)},
        'bi_imperfect': {'forms': build_present_forms(pres, short, root, PREF_IB)},
        'imperfect': {'forms': build_present_forms(pres, short, root, IMP_IB)},
        'imperative': {'forms': build_imperative_forms(imp_m, imp_short, root)},
    }


def generate_form_ic(root):
    c1, c2, c3 = root
    past = lambda r: f'{c1}a{c2}a{c3}'
    pres = lambda r: f'{c1}{c2}o{c3}'
    short = lambda r: f'{c1}i{c2}{c3}'
    imp_m = lambda r: f'{c1}{c2}oo{c3}'
    imp_short = lambda r: f'{c1}{c2}i{c3}'
    return {
        'perfect': {'forms': build_past_forms(past, root)},
        'bi_imperfect': {'forms': build_present_forms(pres, short, root, PREF_I)},
        'imperfect': {'forms': build_present_forms(pres, short, root, IMP_I)},
        'imperative': {'forms': build_imperative_forms(imp_m, imp_short, root)},
    }


def generate_form_id(root):
    c1, c2, c3 = root
    past = lambda r: f'{c1}i{c2}i{c3}'
    pres = lambda r: f'{c1}{c2}a{c3}'
    short = lambda r: f'{c1}{c2}a{c3}'
    return {
        'perfect': {'forms': build_past_forms(past, root)},
        'bi_imperfect': {'forms': build_present_forms(pres, short, root, PREF_I)},
        'imperfect': {'forms': build_present_forms(pres, short, root, IMP_I)},
        'imperative': {'forms': build_imperative_forms(pres, short, root)},
    }


FORM_GENERATORS = {
    'Form II': generate_form_ii,
    'Form III': generate_form_iii,
    'Form V': generate_form_v,
    'Form VI': generate_form_vi,
    'Form VII': generate_form_vii,
    'Form VIII': generate_form_viii,
    'Form X': generate_form_x,
    'Quadrilateral': generate_quad,
    'Form IA': generate_form_ia,
    'Form IB': generate_form_ib,
    'Form IC': generate_form_ic,
    'Form ID': generate_form_id,
}


def normalize_form_label(form_label):
    """Normalize a form label to match our template keys."""
    if not form_label:
        return None
    if form_label in FORM_GENERATORS:
        return form_label
    # Try base form
    base = re.split(r'[,]| Irr\.| Final| Medial| Geminate| back| waaw', form_label)[0].strip()
    if base in FORM_GENERATORS:
        return base
    if form_label.startswith('Emphatic'):
        return 'Quadrilateral'
    return None


# Multi-character consonants in the transliteration system
CONSONANT_ORDER = [
    'sh', 'kh', 'th', 'gh', 'dh', 'ch',
    '2', '3', '7',
    'T', 'D', 'S', 'Z',
    'b', 't', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm',
    'n', 'r', 's', 'w', 'y', 'z', 'q',
]

VOWELS = set('aeiouāīū')


def parse_consonants(translit):
    """Extract consonant sequence from a transliteration string."""
    consonants = []
    i = 0
    s = translit.lower().strip()
    while i < len(s):
        if s[i] in VOWELS or s[i] in ' -()[]':
            i += 1
            continue
        found = False
        for c in CONSONANT_ORDER:
            if s[i:i+len(c)] == c.lower():
                consonants.append(c)
                i += len(c)
                found = True
                break
        if not found:
            consonants.append(s[i])
            i += 1
    return consonants


def extract_root(citation_past, form_label):
    """Extract root letters from the past tense citation form given the form pattern."""
    normalized = normalize_form_label(form_label)
    if not normalized:
        return None

    consonants = parse_consonants(citation_past)
    if not consonants:
        return None

    if normalized == 'Form II':
        # CaCCaC — C1, then C2 (geminated, skip duplicate), C3
        if len(consonants) >= 3:
            c1 = consonants[0]
            # Find the geminated consonant
            for i in range(1, len(consonants)):
                if i + 1 < len(consonants) and consonants[i] == consonants[i + 1]:
                    return [c1, consonants[i], consonants[i + 2] if i + 2 < len(consonants) else consonants[-1]]
            # Fallback: assume C1, C2, C3
            return consonants[:3] if len(consonants) >= 3 else None

    elif normalized == 'Form III':
        # CaaCaC — C1, C2, C3
        return consonants[:3] if len(consonants) >= 3 else None

    elif normalized == 'Form V':
        # tCaCCaC — skip t prefix
        if consonants and consonants[0] == 't':
            rest = consonants[1:]
            if len(rest) >= 3:
                c1 = rest[0]
                for i in range(1, len(rest)):
                    if i + 1 < len(rest) and rest[i] == rest[i + 1]:
                        return [c1, rest[i], rest[i + 2] if i + 2 < len(rest) else rest[-1]]
                return rest[:3]

    elif normalized == 'Form VI':
        # tCaaCaC — skip t prefix
        if consonants and consonants[0] == 't':
            return consonants[1:4] if len(consonants) >= 4 else None

    elif normalized == 'Form VII':
        # nCaCaC — skip n prefix
        if consonants and consonants[0] == 'n':
            return consonants[1:4] if len(consonants) >= 4 else None

    elif normalized == 'Form VIII':
        # CtaCaC — C1, skip t, C2, C3
        if len(consonants) >= 4:
            # Pattern: C1-t-C2-C3
            return [consonants[0], consonants[2], consonants[3]]

    elif normalized == 'Form X':
        # staCCaC — skip st prefix
        if len(consonants) >= 5 and consonants[0] == 's' and consonants[1] == 't':
            return consonants[2:5] if len(consonants) >= 5 else None

    elif normalized == 'Quadrilateral':
        # CaCCaC (4 root letters)
        return consonants[:4] if len(consonants) >= 4 else None

    elif normalized in ('Form IA', 'Form IB', 'Form IC'):
        # CaCaC
        return consonants[:3] if len(consonants) >= 3 else None

    elif normalized == 'Form ID':
        # CiCiC
        return consonants[:3] if len(consonants) >= 3 else None

    return None


def generate_conjugations(root_letters, form_label):
    """Generate full conjugation table from root letters and form label."""
    normalized = normalize_form_label(form_label)
    if not normalized or normalized not in FORM_GENERATORS:
        return None
    return FORM_GENERATORS[normalized](root_letters)


if __name__ == '__main__':
    # Demo: generate a few conjugations
    examples = [
        (['d', 'r', 's'], 'Form II', 'darras (teach)'),
        (['3', 'l', 'm'], 'Form V', 't3allam (learn)'),
        (['sh', 'gh', 'l'], 'Form VIII', 'shtaghal (work)'),
        (['d', 'f', '3'], 'Form IA', 'dafa3 (pay)'),
    ]

    for root, form, desc in examples:
        print(f'\n=== {desc} — {form} ===')
        conj = generate_conjugations(root, form)
        if not conj:
            print('  (no template)')
            continue
        for tense in ['perfect', 'bi_imperfect', 'imperative']:
            print(f'\n  {tense}:')
            for f in conj[tense]['forms']:
                print(f"    {f['person']:8s} {f['translit']}")
