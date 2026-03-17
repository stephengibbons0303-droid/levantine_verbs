# Quiz Sentence Frames — Option C Format (Verbs 1–10 Sample)

## How This Works

Each frame is a reusable sentence template for a specific **verb + tense**. The quiz engine:
1. Picks a frame matching the user's selected tense
2. Inserts the user's selected person (pronoun) before/around the blank
3. Looks up the correct conjugated form from verbs.json
4. Pulls 3 distractors: same verb, same tense, different persons

**A frame does NOT specify the person — that's dynamic.**

### Data Structure

```json
{
  "verb_id": 1,
  "tense": "perfect",
  "frame_before": "",
  "frame_after": "3al-7afle mbēri7.",
  "english": "___ to the party yesterday.",
  "vocab_used": ["il-7afle", "mbēri7"]
}
```

At quiz time, if user selected ána + perfect:
→ `ána ________ 3al-7afle mbēri7.`
→ Answer: jīt | Distractors: íja, jīna, íju

If user selected huwwe + perfect (same frame):
→ `huwwe ________ 3al-7afle mbēri7.`
→ Answer: íja | Distractors: jīt, jīna, íju

### Tense Groups

| Tense group | Code | What the engine inserts |
|-------------|------|------------------------|
| Past | perfect | [pronoun] ________ [frame] |
| Present (habitual) | bi_imperfect | [pronoun] ________ [frame] |
| Dependent (subjunctive) | imperfect | [particle] [pronoun prefix] ________ [frame] |
| Future (ra7) | imperfect | [pronoun] ra7 ________ [frame] |
| Want (bedde) | imperfect | [bedde-form] ________ [frame] |
| Progressive (3am) | imperfect | [pronoun] 3am ________ [frame] |
| Imperative | imperative | ________ [frame] (no pronoun — person implied) |
| Participle | participle | [pronoun] ________ [frame] |

**Note on imperative:** Only 3 persons valid (ínta, ínti, íntu). Engine must filter.
**Note on participle:** Answer must match gender/number. Engine uses m/f/pl from participle forms.

---

## Verb 1: íja (إجا) — to come

| # | Tense | frame_before | frame_after | English | Vocab |
|---|-------|-------------|-------------|---------|-------|
| 1 | perfect | | 3al-7afle mbēri7. | ___ to the party yesterday. | il-7afle, mbēri7 |
| 2 | perfect | | 3al-bēt min usbū3. | ___ home a week ago. | il-bēt, min usbū3 |
| 3 | perfect | | 3al-madrase hal-Subī7. | ___ to school this morning. | 3al-madrase, hal-Subī7 |
| 4 | bi_imperfect | | la-3índi kil yom iS-Sub7. | ___ to my place every day in the morning. | kil yom, iS-Sub7 |
| 5 | bi_imperfect | | 3al-ma2ha kil jum3a. | ___ to the café every Friday. | il-ma2ha, kil jum3a |
| 6 | imperfect | ra7 | bukra b-is-sayyāra. | ___ will ___ tomorrow by car. | bukra, is-sayyāra |
| 7 | imperfect | bedde | ma3ak 3al-ba7r. | ___ want(s) to ___ with you to the beach. | 3al-ba7r |
| 8 | imperfect | 3am | b-is-sayyāra hallaʔ. | ___ ___ by car now. | is-sayyāra, hallaʔ |
| 9 | imperative | | la-hōn! | Come here! | — |
| 10 | imperative | | 3a bukra iS-Sub7. | Come tomorrow morning. | bukra, iS-Sub7 |
| 11 | participle | | b-is-sayyāra. | ___ coming by car. | is-sayyāra |

---

## Verb 2: 2ákhad (أخذ) — to take

| # | Tense | frame_before | frame_after | English | Vocab |
|---|-------|-------------|-------------|---------|-------|
| 1 | perfect | | il-ktēb min il-bēt. | ___ the book from home. | il-ktēb, il-bēt |
| 2 | perfect | | il-shánTa w-rā7. | ___ the bag and left. | il-shánTa |
| 3 | bi_imperfect | | il-bāS iS-Sub7 dēyman. | ___ always take(s) the bus in the morning. | il-bāS, iS-Sub7, dēyman |
| 4 | bi_imperfect | ma | shī bdūn 2ízin. | ___ don't/doesn't take anything without permission. | — |
| 5 | imperfect | ra7 | is-sayyāra 3al-maTār. | ___ will ___ the car to the airport. | is-sayyāra, il-maTār |
| 6 | imperative | | il-maSāri w-rū7 3as-sū2. | Take the money and go to the market. | il-maSāri, is-sū2 |
| 7 | imperative | | il-shánTa 3al-madrase. | Take the bag to school. | il-shánTa, 3al-madrase |
| 8 | imperfect | 3am | il-dáwa hallaʔ. | ___ taking the medicine now. | il-dáwa, hallaʔ |
| 9 | participle | | ma3o il-ktēb. | ___ has the book with him/her. | il-ktēb |
| 10 | imperfect | bedde | 2ahwe ma3ik. | ___ want(s) to take coffee with you. | il-2ahwe |

---

## Verb 3: 2á3lan (أعلن) — to announce

| # | Tense | frame_before | frame_after | English | Vocab |
|---|-------|-------------|-------------|---------|-------|
| 1 | perfect | | il-akhbēr b-il-maktab. | ___ announced the news at the office. | il-akhbēr, il-maktab |
| 2 | perfect | | 3an il-3írs ish-sháhir ij-jēy. | ___ announced the wedding next month. | il-3írs, ij-jēy |
| 3 | bi_imperfect | | 3an il-7afle bukra. | ___ announce(s) the party tomorrow. | il-7afle, bukra |
| 4 | imperfect | ra7 | il-akhbēr hal-jum3a. | ___ will announce the news this Friday. | il-akhbēr, hal-jum3a |
| 5 | imperative | | 3an il-7afle la-jīrēnna. | Announce the party to our neighbors. | il-7afle, jīrēnna |
| 6 | imperfect | 3am | 3an il-ijtimē3 b-il-maktab. | ___ announcing the meeting at the office. | il-ijtimē3, il-maktab |
| 7 | imperfect | bedde | 3an il-7afle. | ___ want(s) to announce the party. | il-7afle |
| 8 | participle | | 3an il-akhbēr. | ___ (has) announced the news. | il-akhbēr |

---

## Verb 4: 2ákal (أكل) — to eat

| # | Tense | frame_before | frame_after | English | Vocab |
|---|-------|-------------|-------------|---------|-------|
| 1 | perfect | | il-ghada b-il-maT3am mbēri7. | ___ ate lunch at the restaurant yesterday. | il-ghada, il-maT3am, mbēri7 |
| 2 | perfect | | b-il-maT3am 2abil yomēn. | ___ ate at the restaurant two days ago. | il-maT3am, 2abil yomēn |
| 3 | bi_imperfect | | fTūr kil yom iS-Sub7. | ___ eat(s) breakfast every morning. | il-fTūr, kil yom, iS-Sub7 |
| 4 | bi_imperfect | | ghada b-il-maktab kil yom. | ___ eat(s) lunch at the office every day. | il-ghada, il-maktab, kil yom |
| 5 | imperfect | 3am | il-akil b-il-maT3am. | ___ eating at the restaurant. | il-akil, il-maT3am |
| 6 | imperative | | ma3na b-il-maT3am! | Eat with us at the restaurant! | il-maT3am |
| 7 | imperative | | 2abil ma yíbrud il-akil! | Eat before the food gets cold! | il-akil |
| 8 | imperfect | bedde | (no frame_after — standalone) | What do you want to eat? | — |
| 9 | participle | | il-akil b-il-maTbakh. | ___ (has) eaten the food in the kitchen. | il-akil, il-maTbakh |
| 10 | imperfect | ra7 | il-ghada b-il-bēt. | ___ will eat lunch at home. | il-ghada, il-bēt |

---

## Verb 5: 2ámar (أمر) — to order

| # | Tense | frame_before | frame_after | English | Vocab |
|---|-------|-------------|-------------|---------|-------|
| 1 | perfect | | il-akil min il-maT3am. | ___ ordered the food from the restaurant. | il-akil, il-maT3am |
| 2 | perfect | | 2ahwe min il-ma2ha. | ___ ordered coffee from the café. | il-2ahwe, il-ma2ha |
| 3 | bi_imperfect | | 2ahwe min il-ma2ha kil yom. | ___ order(s) coffee from the café every day. | il-2ahwe, il-ma2ha, kil yom |
| 4 | imperfect | 3am | il-akil b-il-maT3am. | ___ ordering food at the restaurant. | il-akil, il-maT3am |
| 5 | imperative | | il-2ahwe w-is-sandwīsh. | Order the coffee and sandwich. | il-2ahwe, is-sandwīsh |
| 6 | imperfect | ra7 | il-ghada min il-maT3am. | ___ will order lunch from the restaurant. | il-ghada, il-maT3am |
| 7 | imperfect | bedde | il-3asha la-ahlo. | ___ want(s) to order dinner for his family. | il-3asha, ahlo |
| 8 | participle | | il-akil min il-ma2ha. | ___ (has) ordered the food from the café. | il-akil, il-ma2ha |

---

## Verb 6: bē3 (باع) — to sell

| # | Tense | frame_before | frame_after | English | Vocab |
|---|-------|-------------|-------------|---------|-------|
| 1 | perfect | | is-sayyāra min shāhir. | ___ sold the car a month ago. | is-sayyāra, min shāhir |
| 2 | perfect | | is-sayyāra min zamēn. | ___ sold the car a long time ago. | is-sayyāra, min zamēn |
| 3 | bi_imperfect | | khuDra b-is-sū2 kil yom. | ___ sell(s) vegetables at the market every day. | il-khuDra, is-sū2, kil yom |
| 4 | bi_imperfect | | khíbiz b-is-sū2 kil yom. | ___ sell(s) bread at the market every day. | il-khíbiz, is-sū2, kil yom |
| 5 | imperative | | il-khuDra b-is-sū2. | Go sell the vegetables at the market. | il-khuDra, is-sū2 |
| 6 | imperfect | ra7 | il-bēt ij-jdīd. | ___ will sell the new house. | il-bēt |
| 7 | participle | hal-shahr, ma | shī b-is-sū2. | This month, ___ haven't sold anything at the market. | hal-shahr, is-sū2 |
| 8 | imperfect | bedde | is-sayyāra il-2adīme. | ___ want(s) to sell the old car. | is-sayyāra |
| 9 | bi_imperfect | | khíbiz b-is-sū2? | Do ___ sell bread at the market? | il-khíbiz, is-sū2 |

---

## Verb 7: báram (برم) — to roam

| # | Tense | frame_before | frame_after | English | Vocab |
|---|-------|-------------|-------------|---------|-------|
| 1 | perfect | | b-is-sū2 w-ma lá2a khíbiz. | ___ roamed the market and didn't find bread. | is-sū2, il-khíbiz |
| 2 | perfect | | b-wásaT il-balad mbēri7. | ___ roamed downtown yesterday. | wásaT il-balad, mbēri7 |
| 3 | bi_imperfect | | b-is-sū2 kil usbū3. | ___ roam(s) the market every week. | is-sū2, kil usbū3 |
| 4 | imperfect | ra7 | b-il-7āra bukra. | ___ will roam the neighborhood tomorrow. | il-7āra, bukra |
| 5 | imperfect | bedde | b-wásaT il-balad il-yōm. | ___ want(s) to roam downtown today. | wásaT il-balad |
| 6 | bi_imperfect | | b-wásaT il-balad kil usbū3? | Do ___ roam downtown every week? | wásaT il-balad, kil usbū3 |
| 7 | imperfect | 3am | b-wásaT il-balad. | ___ roaming downtown. | wásaT il-balad |
| 8 | imperative | | b-il-7āra w-rjā3. | Roam the neighborhood and come back. | il-7āra |

---

## Verb 8: bí2i (بقي) — to stay

| # | Tense | frame_before | frame_after | English | Vocab |
|---|-------|-------------|-------------|---------|-------|
| 1 | perfect | | b-il-bēt la-S-Sub7. | ___ stayed home until morning. | il-bēt, iS-Sub7 |
| 2 | perfect | | b-il-bēt la-wa7do mbēri7. | ___ stayed home alone yesterday. | il-bēt, la-wa7do, mbēri7 |
| 3 | bi_imperfect | | b-il-bēt ktīr wa2ít. | ___ stay(s) home a long time. | il-bēt |
| 4 | bi_imperfect | | ktīr hēdi wa2ít yiSīr fī mushkle. | ___ remain(s) very quiet when there's a problem. | il-mushkle |
| 5 | imperative | | b-il-bēt ma3 ahlo. | Stay home with the family. | il-bēt, ahlo |
| 6 | imperfect | ra7 | b-il-bēt b-il-lēl. | ___ will stay home at night. | il-bēt, b-il-lēl |
| 7 | imperfect | bedde | b-il-2ōtēl usbū3. | ___ want(s) to stay at the hotel a week. | il-2ōtēl |
| 8 | participle | | b-il-maktab ba3d. | ___ (is) still at the office. | il-maktab |
| 9 | imperfect | 3am | b-il-maT3am shwayy. | ___ staying at the restaurant a bit. | il-maT3am |

---

## Verb 9: bállash (بلّش) — to begin

| # | Tense | frame_before | frame_after | English | Vocab |
|---|-------|-------------|-------------|---------|-------|
| 1 | perfect | | il-7afle lēlit mbēri7. | ___ started the party last night. | il-7afle, lēlit mbēri7 |
| 2 | perfect | | id-dirāse jdīde hal-shahr. | ___ started new studies this month. | id-dirāse, hal-shahr |
| 3 | bi_imperfect | | ish-shúghul bakkīr kil yom. | ___ start(s) work early every day. | ish-shúghul, kil yom |
| 4 | bi_imperfect | | shúghla is-sē3a tmēne iS-Sub7. | ___ start(s) work at 8 in the morning. | ish-shúghul, iS-Sub7 |
| 5 | imperfect | ra7 | il-7afle bukra. | ___ will start the party tomorrow. | il-7afle, bukra |
| 6 | imperative | | il-fTūr b-il-maTbakh. | Start breakfast in the kitchen. | il-fTūr, il-maTbakh |
| 7 | imperative | ma | il-7afle min dūni! | Don't start the party without me! | il-7afle |
| 8 | imperfect | 3am | ish-shúghul ij-jdīd. | ___ starting the new work. | ish-shúghul |
| 9 | participle | | ish-shúghul bakkīr. | ___ (have) started work early. | ish-shúghul |

---

## Verb 10: tárak (ترك) — to leave

| # | Tense | frame_before | frame_after | English | Vocab |
|---|-------|-------------|-------------|---------|-------|
| 1 | perfect | | id-dirāse min zamēn. | ___ left studies a long time ago. | id-dirāse, min zamēn |
| 2 | perfect | | ish-shúghul 2abil shāhir. | ___ left work a month ago. | ish-shúghul, 2abil shāhir |
| 3 | bi_imperfect | | il-bēt kil sáne. | ___ leave(s) the house every year. | il-bēt, kil sáne |
| 4 | bi_imperfect | ma | wlēdo la-wa7don b-il-bēt. | ___ don't/doesn't leave the kids alone at home. | wlēdo, la-wa7do, il-bēt |
| 5 | imperative | | telefōn w-nēmi! | Leave the phone and sleep! | telefōn |
| 6 | imperative | | il-bēb maftū7 wa2ít trū7. | Leave the door open when you go. | il-bēb |
| 7 | imperfect | ra7 | il-bēt ba3d shwayy. | ___ will leave the house in a bit. | il-bēt, ba3d shwayy |
| 8 | imperfect | bedde | ish-shúghul bakkīr il-yōm. | ___ want(s) to leave work early today. | ish-shúghul |
| 9 | imperfect | 3am | il-bēt hallaʔ. | ___ leaving the house now. | il-bēt, hallaʔ |
| 10 | participle | | ish-shúghul min zamēn. | ___ (has) left work a long time ago. | ish-shúghul, min zamēn |

---

## Engine Logic Summary

```
On quiz generation:
1. User selects: tense(s), person(s), question count
2. Engine picks random verb → picks random frame matching tense
3. Engine inserts selected person:
   - perfect/bi_imperfect: "[pronoun] ________ [frame_after]"
   - imperfect+ra7: "[pronoun] ra7 ________ [frame_after]"
   - imperfect+bedde: "[bedde_form] ________ [frame_after]"
   - imperfect+3am: "[pronoun] 3am ________ [frame_after]"
   - imperative: "________ [frame_after]" (person shown as subtitle)
   - participle: "[pronoun] ________ [frame_after]"
4. Correct answer: look up verb_id + tense + person in verbs.json
5. Distractors: 3 other persons from same verb + same tense
6. If Arabic toggle ON: show Arabic script from verbs.json alongside
```

### Tense group mapping for setup screen

| Setup screen label | Frames to draw from |
|-------------------|---------------------|
| "Past" | tense = perfect |
| "Present" | tense = bi_imperfect |
| "Dependent" | tense = imperfect (includes ra7, bedde, 3am sub-types) |
| "All tenses" | any tense |
| Imperative | could be its own toggle, or grouped under "Dependent" |
| Participle | could be its own toggle |

### What about frame_before?

Most frames only need `frame_after`. But some need `frame_before` for:
- **Negative:** `ma` before the blank
- **Particles in the frame itself:** e.g. `hal-shahr, ma ________ shī b-is-sū2`

The engine handles ra7/bedde/3am insertion separately — those aren't stored in `frame_before`. Only contextual pre-blank content goes there.
