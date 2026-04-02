#!/usr/bin/env python3
"""
Inject english_forms { base, past, present_3s } into every verb in verbs.json.

Extracts the first English meaning (before semicolons), strips "to " prefix
and bracketed qualifiers, then looks up irregular forms or generates regular ones.
"""

import json
import os
import re

# --- Irregular English verb forms ---
IRREGULAR = {
    "come": {"past": "came", "present_3s": "comes"},
    "take": {"past": "took", "present_3s": "takes"},
    "eat": {"past": "ate", "present_3s": "eats"},
    "sell": {"past": "sold", "present_3s": "sells"},
    "bring": {"past": "brought", "present_3s": "brings"},
    "write": {"past": "wrote", "present_3s": "writes"},
    "break": {"past": "broke", "present_3s": "breaks"},
    "wear": {"past": "wore", "present_3s": "wears"},
    "find": {"past": "found", "present_3s": "finds"},
    "forget": {"past": "forgot", "present_3s": "forgets"},
    "read": {"past": "read", "present_3s": "reads"},
    "hear": {"past": "heard", "present_3s": "hears"},
    "see": {"past": "saw", "present_3s": "sees"},
    "drink": {"past": "drank", "present_3s": "drinks"},
    "leave": {"past": "left", "present_3s": "leaves"},
    "know": {"past": "knew", "present_3s": "knows"},
    "do": {"past": "did", "present_3s": "does"},
    "make": {"past": "made", "present_3s": "makes"},
    "put": {"past": "put", "present_3s": "puts"},
    "say": {"past": "said", "present_3s": "says"},
    "feel": {"past": "felt", "present_3s": "feels"},
    "go": {"past": "went", "present_3s": "goes"},
    "sit": {"past": "sat", "present_3s": "sits"},
    "sleep": {"past": "slept", "present_3s": "sleeps"},
    "get up": {"past": "got up", "present_3s": "gets up"},
    "get": {"past": "got", "present_3s": "gets"},
    "give": {"past": "gave", "present_3s": "gives"},
    "run": {"past": "ran", "present_3s": "runs"},
    "begin": {"past": "began", "present_3s": "begins"},
    "speak": {"past": "spoke", "present_3s": "speaks"},
    "tell": {"past": "told", "present_3s": "tells"},
    "send": {"past": "sent", "present_3s": "sends"},
    "ride": {"past": "rode", "present_3s": "rides"},
    "drive": {"past": "drove", "present_3s": "drives"},
    "stand": {"past": "stood", "present_3s": "stands"},
    "understand": {"past": "understood", "present_3s": "understands"},
    "think": {"past": "thought", "present_3s": "thinks"},
    "withdraw": {"past": "withdrew", "present_3s": "withdraws"},
    "hold": {"past": "held", "present_3s": "holds"},
    "grow": {"past": "grew", "present_3s": "grows"},
    "become": {"past": "became", "present_3s": "becomes"},
    "win": {"past": "won", "present_3s": "wins"},
    "lose": {"past": "lost", "present_3s": "loses"},
    "fall": {"past": "fell", "present_3s": "falls"},
    "cry": {"past": "cried", "present_3s": "cries"},
    "try": {"past": "tried", "present_3s": "tries"},
    "fly": {"past": "flew", "present_3s": "flies"},
    "pay": {"past": "paid", "present_3s": "pays"},
    "buy": {"past": "bought", "present_3s": "buys"},
    "teach": {"past": "taught", "present_3s": "teaches"},
    "catch": {"past": "caught", "present_3s": "catches"},
    "carry": {"past": "carried", "present_3s": "carries"},
    "study": {"past": "studied", "present_3s": "studies"},
    "pray": {"past": "prayed", "present_3s": "prays"},
    "play": {"past": "played", "present_3s": "plays"},
    "stay": {"past": "stayed", "present_3s": "stays"},
    "stop": {"past": "stopped", "present_3s": "stops"},
    "be": {"past": "was", "present_3s": "is"},
    "have": {"past": "had", "present_3s": "has"},
    "hit": {"past": "hit", "present_3s": "hits"},
    "let": {"past": "let", "present_3s": "lets"},
    "cut": {"past": "cut", "present_3s": "cuts"},
    "set": {"past": "set", "present_3s": "sets"},
    "shut": {"past": "shut", "present_3s": "shuts"},
    "hurt": {"past": "hurt", "present_3s": "hurts"},
    "hang": {"past": "hung", "present_3s": "hangs"},
    "keep": {"past": "kept", "present_3s": "keeps"},
    "meet": {"past": "met", "present_3s": "meets"},
    "lead": {"past": "led", "present_3s": "leads"},
    "feed": {"past": "fed", "present_3s": "feeds"},
    "deal": {"past": "dealt", "present_3s": "deals"},
    "mean": {"past": "meant", "present_3s": "means"},
    "build": {"past": "built", "present_3s": "builds"},
    "spend": {"past": "spent", "present_3s": "spends"},
    "lend": {"past": "lent", "present_3s": "lends"},
    "bend": {"past": "bent", "present_3s": "bends"},
    "burn": {"past": "burned", "present_3s": "burns"},
    "learn": {"past": "learned", "present_3s": "learns"},
    "wake": {"past": "woke", "present_3s": "wakes"},
    "choose": {"past": "chose", "present_3s": "chooses"},
    "freeze": {"past": "froze", "present_3s": "freezes"},
    "sing": {"past": "sang", "present_3s": "sings"},
    "ring": {"past": "rang", "present_3s": "rings"},
    "swim": {"past": "swam", "present_3s": "swims"},
    "throw": {"past": "threw", "present_3s": "throws"},
    "blow": {"past": "blew", "present_3s": "blows"},
    "show": {"past": "showed", "present_3s": "shows"},
    "swear": {"past": "swore", "present_3s": "swears"},
    "tear": {"past": "tore", "present_3s": "tears"},
    "draw": {"past": "drew", "present_3s": "draws"},
    "dig": {"past": "dug", "present_3s": "digs"},
    "fight": {"past": "fought", "present_3s": "fights"},
    "seek": {"past": "sought", "present_3s": "seeks"},
    "hide": {"past": "hid", "present_3s": "hides"},
    "bite": {"past": "bit", "present_3s": "bites"},
    "shine": {"past": "shone", "present_3s": "shines"},
    "lie": {"past": "lied", "present_3s": "lies"},
    "die": {"past": "died", "present_3s": "dies"},
    "tie": {"past": "tied", "present_3s": "ties"},
    "spread": {"past": "spread", "present_3s": "spreads"},
    "cost": {"past": "cost", "present_3s": "costs"},
    "rise": {"past": "rose", "present_3s": "rises"},
    "arise": {"past": "arose", "present_3s": "arises"},
    "exist": {"past": "existed", "present_3s": "exists"},
    "want": {"past": "wanted", "present_3s": "wants"},
    # Phrasal verbs
    "go down": {"past": "went down", "present_3s": "goes down"},
    "go up": {"past": "went up", "present_3s": "goes up"},
    "go out": {"past": "went out", "present_3s": "goes out"},
    "come in": {"past": "came in", "present_3s": "comes in"},
    "take off": {"past": "took off", "present_3s": "takes off"},
    "take away": {"past": "took away", "present_3s": "takes away"},
    "pass by": {"past": "passed by", "present_3s": "passes by"},
    "pick up": {"past": "picked up", "present_3s": "picks up"},
    "search for": {"past": "searched for", "present_3s": "searches for"},
    "be late": {"past": "was late", "present_3s": "is late"},
    "be nervous": {"past": "was nervous", "present_3s": "is nervous"},
    "be able to": {"past": "was able to", "present_3s": "is able to"},
}

# Verbs whose primary English meaning doesn't work well in quiz context
ENGLISH_OVERRIDES = {
    "undress": {"base": "take off", "past": "took off", "present_3s": "takes off"},
    "enjoy": {"base": "enjoy", "past": "enjoyed", "present_3s": "enjoys", "reflexive": True},
    "be able to": {"base": "be able", "past": "was able", "present_3s": "is able"},
    "bathe": {"base": "bathe", "past": "bathed", "present_3s": "bathes", "reflexive": True},
}


def extract_base(english):
    """Extract base verb form from the verb's English field."""
    # Split on semicolons, take first meaning
    first = english.split(";")[0].strip()
    # Remove bracketed qualifiers like [a story], [s.th], etc.
    first = re.sub(r'\[.*?\]', '', first).strip()
    # Remove parenthetical
    first = re.sub(r'\(.*?\)', '', first).strip()
    # Split on comma and take first variant ("pass, pass by" -> "pass")
    first = first.split(",")[0].strip()
    # Strip reflexive "oneself" ("bathe oneself" -> "bathe")
    first = re.sub(r'\s+oneself$', '', first)
    # Strip leading "to "
    first = re.sub(r'^to\s+', '', first, flags=re.IGNORECASE)
    return first.strip().lower()


def make_regular_past(base):
    """Generate regular past tense (base + ed with spelling rules)."""
    if base.endswith('e'):
        return base + 'd'
    # Consonant-y -> ied
    if base.endswith('y') and len(base) > 1 and base[-2] not in 'aeiou':
        return base[:-1] + 'ied'
    # Double final consonant for CVC pattern (short words)
    if (len(base) <= 4 and
        re.match(r'^[a-z]*[aeiou][bcdfghlmnprstvwz]$', base) and
        not base.endswith('w') and not base.endswith('x')):
        return base + base[-1] + 'ed'
    return base + 'ed'


def make_regular_3s(base):
    """Generate regular 3rd person singular (base + s with spelling rules)."""
    if base.endswith(('s', 'sh', 'ch', 'x', 'z', 'o')):
        return base + 'es'
    # Consonant-y -> ies
    if base.endswith('y') and len(base) > 1 and base[-2] not in 'aeiou':
        return base[:-1] + 'ies'
    return base + 's'


def get_english_forms(english):
    """Return { base, past, present_3s } for a verb's English field."""
    base = extract_base(english)
    if not base:
        return {"base": "...", "past": "...", "present_3s": "..."}

    # Check overrides first (verbs whose primary meaning doesn't fit quiz context)
    if base in ENGLISH_OVERRIDES:
        ov = ENGLISH_OVERRIDES[base]
        result = {"base": ov["base"], "past": ov["past"], "present_3s": ov["present_3s"]}
        if ov.get("reflexive"):
            result["reflexive"] = True
        return result

    # Check irregular table
    if base in IRREGULAR:
        return {
            "base": base,
            "past": IRREGULAR[base]["past"],
            "present_3s": IRREGULAR[base]["present_3s"],
        }

    # Handle phrasal verbs: "search for" -> check "search for" first, then split
    # If not in irregular, try splitting particle
    parts = base.split()
    if len(parts) > 1:
        core = parts[0]
        particle = " ".join(parts[1:])
        if core in IRREGULAR:
            return {
                "base": base,
                "past": IRREGULAR[core]["past"] + " " + particle,
                "present_3s": IRREGULAR[core]["present_3s"] + " " + particle,
            }
        # Generate regular for the core verb + reattach particle
        return {
            "base": base,
            "past": make_regular_past(core) + " " + particle,
            "present_3s": make_regular_3s(core) + " " + particle,
        }

    # Regular forms
    return {
        "base": base,
        "past": make_regular_past(base),
        "present_3s": make_regular_3s(base),
    }


def main():
    data_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'verbs.json')
    public_path = os.path.join(os.path.dirname(__file__), '..', 'pwa', 'public', 'verbs.json')

    with open(data_path, 'r', encoding='utf-8') as f:
        verbs = json.load(f)

    updated = 0
    for verb in verbs:
        english = verb.get('verb', {}).get('english', '')
        if not english:
            continue
        forms = get_english_forms(english)
        verb['english_forms'] = forms
        updated += 1

    # Show a sample of results
    samples = [v for v in verbs if v['verb']['translit'] in
               ('dáras', 'íja', '2ákhad', 'rā7', 'shāf', '3mil', '3írif', 'nisi', 'ṭábakh', 'wa22af', '7aka', 'waSSal')]
    for v in samples:
        ef = v.get('english_forms', {})
        print(f"  {v['verb']['translit']:20s} | {v['verb']['english']:40s} | base={ef['base']:15s} past={ef['past']:15s} 3s={ef['present_3s']}")

    with open(data_path, 'w', encoding='utf-8') as f:
        json.dump(verbs, f, ensure_ascii=False, indent=2)

    with open(public_path, 'w', encoding='utf-8') as f:
        json.dump(verbs, f, ensure_ascii=False, indent=2)

    print(f"\nDone: {updated} verbs updated with english_forms")


if __name__ == '__main__':
    main()
