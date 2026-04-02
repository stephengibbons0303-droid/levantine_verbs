/**
 * Vocab Pool — single source of truth for quiz prompts and sidebar reference.
 *
 * Beirut Accent Standing Rules (for future reference):
 * - H-dropping on feminine/plural possessive suffixes: imma (not immha), bayta (not baytha), bayton (not baython)
 * - Vowel compression: Sa7be + ik → Sa7btik (not Sa7ibtik)
 * - Week = joum3a (not usbū3) — used throughout all time adverbs
 * - Friday is feminine: hal-jum3a, ij-jum3a ij-jēye (feminine ij-jēye, not masculine ij-jēy)
 * - hal- prefix: Beirut contraction of "hayda al-" for time markers
 */

// --- Time adverb pools by tense ---
// Note: jum3a = Friday (feminine), joum3a = week (Beirut)

export const TIME_ADVERBS = {
  past: [
    { translit: "mbēri7", english: "yesterday" },
    { translit: "min joum3a", english: "a week ago" },
    { translit: "hal-Subī7", english: "this morning" },
    { translit: "2abil shwayy", english: "a little while ago" },
    { translit: "min zamēn", english: "a long time ago" },
    { translit: "lēlit mbēri7", english: "last night" },
    { translit: "2abil yomēn", english: "two days ago" },
    { translit: "il-joum3a il-maDiye", english: "last week" },
    { translit: "2awwil mbēri7", english: "day before yesterday", arabic: "أول مبارح" },
    { translit: "al-shahr al-maDi", english: "last month", arabic: "الشهر الماضي" },
    { translit: "al-sini al-maDiye", english: "last year", arabic: "السنة الماضية" },
    { translit: "min shwayy", english: "a little while ago", arabic: "من شوي" },
  ],
  present: [
    { translit: "kil yom", english: "every day" },
    { translit: "dēyman", english: "always" },
    { translit: "3ēdatan", english: "usually" },
    { translit: "kil joum3a", english: "every week" },
    { translit: "kil marra", english: "every time" },
    { translit: "halla2", english: "now", arabic: "هلق" },
    { translit: "halla2 halla2", english: "right now", arabic: "هلق هلق" },
    { translit: "aw2at", english: "sometimes", arabic: "أوقات" },
    { translit: "hal-iyyam", english: "nowadays", arabic: "هالأيام" },
    { translit: "nādiran", english: "rarely", arabic: "نادراً" },
    { translit: "abadan", english: "never", arabic: "أبداً" },
  ],
  future: [
    { translit: "bukra", english: "tomorrow" },
    { translit: "ba3d bukra", english: "day after tomorrow" },
    { translit: "hal-jum3a", english: "this Friday" },
    { translit: "hal-joum3a", english: "this week" },
    { translit: "ba3d shwayy", english: "in a little while" },
    { translit: "il-yōm", english: "today" },
    { translit: "al-joum3a al-jāye", english: "next week", arabic: "الجمعة الجاية" },
    { translit: "al-shahr al-jāye", english: "next month", arabic: "الشهر الجاي" },
    { translit: "al-layli", english: "tonight", arabic: "الليلة" },
    { translit: "ba3dēn", english: "later", arabic: "بعدين" },
    { translit: "2arīban", english: "soon", arabic: "قريباً" },
  ],
  imperative: [
    { translit: "halla2", english: "now" },
    { translit: "b-sur3a", english: "quickly" },
  ],
  participle: [
    { translit: "halla2", english: "now" },
    { translit: "min zamēn", english: "for a long time" },
  ],
};

// --- Bedde (want) forms by person ---

export const BEDDE_FORMS = {
  ana: "béddi", nihna: "béddna", inta: "béddak", inti: "béddik",
  intu: "béddkon", huwwe: "béddo", hiyye: "bédda", hinne: "béddun",
};

// --- Prompt pronouns (transliterated Arabic) ---

export const PROMPT_PRONOUNS = {
  ana: "ána", nihna: "ní7na", inta: "ínta", inti: "ínti",
  intu: "íntu", huwwe: "huwwe", hiyye: "hiyye", hinne: "hínni",
};

// --- Common objects for quiz prompts and sidebar ---

export const OBJECTS = [
  { key: "il-akil", translit: "il-akil", english: "the food" },
  { key: "il-ktēb", translit: "il-ktēb", english: "the book" },
  { key: "is-sayyāra", translit: "is-sayyāra", english: "the car" },
  { key: "telefōn", translit: "telefōn", english: "the phone" },
  { key: "il-maSāri", translit: "il-maSāri", english: "the money" },
  { key: "il-2ahwe", translit: "il-2ahwe", english: "the coffee" },
  { key: "il-bēb", translit: "il-bēb", english: "the door" },
  { key: "il-miftē7", translit: "il-miftē7", english: "the key" },
  { key: "il-khuDra", translit: "il-khuDra", english: "the vegetables" },
  { key: "il-khíbiz", translit: "il-khíbiz", english: "the bread" },
  { key: "il-máyy", translit: "il-máyy", english: "the water" },
  { key: "il-7alīb", translit: "il-7alīb", english: "the milk" },
  { key: "il-dáwa", translit: "il-dáwa", english: "the medicine" },
  { key: "is-sandwīsh", translit: "is-sandwīsh", english: "the sandwich" },
  { key: "il-bītza", translit: "il-bītza", english: "the pizza" },
  { key: "il-fātūra", translit: "il-fātūra", english: "the bill" },
  { key: "ij-jarīde", translit: "ij-jarīde", english: "the newspaper" },
  { key: "il-shánTa", translit: "il-shánTa", english: "the bag" },
  { key: "il-akhbēr", translit: "il-akhbēr", english: "the news" },
  { key: "il-fīlm", translit: "il-fīlm", english: "the movie" },
  { key: "il-match", translit: "il-match", english: "the match" },
  { key: "is-su2āl", translit: "is-su2āl", english: "the question" },
  { key: "it-tiyēb", translit: "it-tiyēb", english: "the clothes" },
  { key: "iS-Súwar", translit: "iS-Súwar", english: "the photos" },
  { key: "iz-zbēle", translit: "iz-zbēle", english: "the trash" },
  { key: "iS-Sabbāt", translit: "iS-Sabbāt", english: "the shoes" },
  { key: "il-kambiyūtar", translit: "il-kambiyūtar", english: "the computer" },
  { key: "il-hadīye", translit: "il-hadīye", english: "the gift" },
  { key: "il-3inwēn", translit: "il-3inwēn", english: "the address" },
  { key: "ir-rá2im", translit: "ir-rá2im", english: "the number" },
  { key: "il-mushkle", translit: "il-mushkle", english: "the problem" },
  { key: "il-7a2ī2a", translit: "il-7a2ī2a", english: "the truth" },
  { key: "il-jāT", translit: "il-jāT", english: "the dishes" },
  { key: "il-bāS", translit: "il-bāS", english: "the bus" },
  { key: "il-bēt", translit: "il-bēt", english: "the house" },
  { key: "il-shíbbēk", translit: "il-shíbbēk", english: "the window" },
  { key: "il-ghráD", translit: "il-ghráD", english: "the stuff" },
  { key: "il-7all", translit: "il-7all", english: "the solution" },
  { key: "il-Tard", translit: "il-Tard", english: "the package" },
  { key: "il-khúTTa", translit: "il-khúTTa", english: "the plan" },
  { key: "il-jawēb", translit: "il-jawēb", english: "the answer" },
  { key: "il-2íSSa", translit: "il-2íSSa", english: "the story" },
  { key: "il-natīje", translit: "il-natīje", english: "the result" },
  { key: "il-músi2a", translit: "il-músi2a", english: "the music" },
  { key: "il-wējib", translit: "il-wējib", english: "the homework" },
  { key: "il-imti7ān", translit: "il-imti7ān", english: "the exam" },
  { key: "il-risēle", translit: "il-risēle", english: "the letter" },
  { key: "il-wáraʔ", translit: "il-wáraʔ", english: "the paper" },
  { key: "il-maw3id", translit: "il-maw3id", english: "the appointment" },
  { key: "il-7arāra", translit: "il-7arāra", english: "the heat" },
  { key: "il-bárd", translit: "il-bárd", english: "the cold" },
  { key: "il-báyDa", translit: "il-báyDa", english: "the egg" },
  { key: "il-kébbēye", translit: "il-kébbēye", english: "the glass" },
  { key: "il-maTbakh", translit: "il-maTbakh", english: "the kitchen" },
  { key: "in-níkte", translit: "in-níkte", english: "the joke" },
  { key: "3árabi", translit: "3árabi", english: "Arabic" },
  { key: "bayyo", translit: "bayyo", english: "his dad" },
  { key: "ukhto", translit: "ukhto", english: "his sister" },
  { key: "Sa7bo", translit: "Sa7bo", english: "his friend" },
  { key: "il-mu3allme", translit: "il-mu3allme", english: "the teacher" },
  { key: "il-jīrēn", translit: "il-jīrēn", english: "the neighbors" },
  { key: "la-bayyo", translit: "la-bayyo", english: "his dad" },
  { key: "ahlo", translit: "ahlo", english: "his family" },
];

// --- Family words with possessive conjugations ---

export const POSSESSIVE_LABELS = [
  "My (-ī)", "Your(m) (-ak)", "Your(f) (-ik)", "His (-o)",
  "Her (-a)", "Our (-nā)", "Your(pl) (-kon)", "Their (-on)",
];

export const FAMILY_CONJUGATIONS = [
  { base: "Dad", forms: ["bayyī", "bayyak", "bayyik", "bayyo", "bayya", "bayynā", "bayykon", "bayyon"] },
  { base: "Mother", forms: ["immī", "immak", "immik", "immo", "imma", "immnā", "immkon", "immon"] },
  { base: "Brother", forms: ["khayyī", "khayyak", "khayyik", "khayyo", "khayya", "khayynā", "khayykon", "khayyon"] },
  { base: "Sister", forms: ["ukhtī", "ukhtak", "ukhtik", "ukhto", "ukhta", "ukhtnā", "ukhtkon", "ukhton"] },
  { base: "Wife", forms: ["martī", "martak", "martik", "marto", "marta", "martnā", "martkon", "marton"] },
  { base: "Husband", forms: ["jōzī", "jōzak", "jōzik", "jōzo", "jōza", "jōznā", "jōzkon", "jōzon"] },
  { base: "Son", forms: ["ibnī", "ibnak", "ibnik", "ibno", "ibna", "ibnnā", "ibnkon", "ibnon"] },
  { base: "Daughter", forms: ["bintī", "bintak", "bintik", "binto", "binta", "bintnā", "bintkon", "binton"] },
  { base: "Friend (m)", forms: ["sā7bī", "sā7bak", "sā7bik", "sā7bo", "sā7ba", "sā7bnā", "sā7bkon", "sā7bon"] },
  { base: "Friend (f)", forms: ["sā7bitī", "sā7bitak", "sā7bitik", "sā7bito", "sā7bita", "sā7bitnā", "sā7bitkon", "sā7biton"] },
];

// --- People nouns ---

export const PEOPLE_NOUNS = [
  { translit: "il-7akīm", english: "the doctor", arabic: "الحكيم" },
  { translit: "il-mdīr", english: "the manager / boss", arabic: "المدير" },
  { translit: "il-shōfēr", english: "the driver", arabic: "الشوفير" },
  { translit: "il-mowazzaf", english: "the employee", arabic: "الموظف" },
  { translit: "il-gharīb", english: "the stranger", arabic: "الغريب" },
];

// --- Activities (sidebar reference) ---

export const ACTIVITIES = [
  { key: "il-ghada", translit: "il-ghada", english: "lunch" },
  { key: "il-3asha", translit: "il-3asha", english: "dinner" },
  { key: "il-fTūr", translit: "il-fTūr", english: "breakfast" },
  { key: "ish-shúghul", translit: "ish-shúghul", english: "work" },
  { key: "id-dirāse", translit: "id-dirāse", english: "studies" },
  { key: "it-tamārīn", translit: "it-tamārīn", english: "exercises" },
  { key: "id-dars", translit: "id-dars", english: "the lesson" },
  { key: "il-ijtimē3", translit: "il-ijtimē3", english: "the meeting" },
];

// --- Utilities ---

export function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
