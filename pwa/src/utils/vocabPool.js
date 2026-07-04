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

// NOTE: the `arabic` fields on TIME_ADVERBS / OBJECTS / ACTIVITIES were auto-DRAFTED
// 2026-07-04 from the transliteration + meaning, and are pending Nidale's review for
// natural Beirut spelling. See reference/glossary-arabic-review.md. (PEOPLE_NOUNS
// arabic was authored earlier and is not part of that draft.)

// --- Time adverb pools by tense ---
// Note: jum3a = Friday (feminine), joum3a = week (Beirut)

export const TIME_ADVERBS = {
  past: [
    { translit: "mbēri7", english: "yesterday", arabic: "مبارح" },
    { translit: "min joum3a", english: "a week ago", arabic: "من جمعة" },
    { translit: "hal-Subī7", english: "this morning", arabic: "هالصبح" },
    { translit: "2abil shwayy", english: "a little while ago", arabic: "قبل شوي" },
    { translit: "min zamēn", english: "a long time ago", arabic: "من زمان" },
    { translit: "lēlit mbēri7", english: "last night", arabic: "ليلة مبارح" },
    { translit: "2abil yomēn", english: "two days ago", arabic: "قبل يومين" },
    { translit: "il-joum3a il-maDiye", english: "last week", arabic: "الجمعة الماضية" },
    { translit: "2awwil mbēri7", english: "day before yesterday", arabic: "أول مبارح" },
    { translit: "al-shahr al-maDi", english: "last month", arabic: "الشهر الماضي" },
    { translit: "al-sini al-maDiye", english: "last year", arabic: "السنة الماضية" },
    { translit: "min shwayy", english: "a little while ago", arabic: "من شوي" },
  ],
  present: [
    { translit: "kil yom", english: "every day", arabic: "كل يوم" },
    { translit: "dēyman", english: "always", arabic: "دايمًا" },
    { translit: "3ēdatan", english: "usually", arabic: "عادةً" },
    { translit: "kil joum3a", english: "every week", arabic: "كل جمعة" },
    { translit: "kil marra", english: "every time", arabic: "كل مرة" },
    { translit: "halla2", english: "now", arabic: "هلق" },
    { translit: "halla2 halla2", english: "right now", arabic: "هلق هلق" },
    { translit: "aw2at", english: "sometimes", arabic: "أوقات" },
    { translit: "hal-iyyam", english: "nowadays", arabic: "هالأيام" },
    { translit: "nādiran", english: "rarely", arabic: "نادراً" },
    { translit: "abadan", english: "never", arabic: "أبداً" },
  ],
  future: [
    { translit: "bukra", english: "tomorrow", arabic: "بكرا" },
    { translit: "ba3d bukra", english: "day after tomorrow", arabic: "بعد بكرا" },
    { translit: "hal-jum3a", english: "this Friday", arabic: "هالجمعة" },
    { translit: "hal-joum3a", english: "this week", arabic: "هالجمعة" },
    { translit: "ba3d shwayy", english: "in a little while", arabic: "بعد شوي" },
    { translit: "il-yōm", english: "today", arabic: "اليوم" },
    { translit: "al-joum3a al-jāye", english: "next week", arabic: "الجمعة الجاية" },
    { translit: "al-shahr al-jāye", english: "next month", arabic: "الشهر الجاي" },
    { translit: "al-layli", english: "tonight", arabic: "الليلة" },
    { translit: "ba3dēn", english: "later", arabic: "بعدين" },
    { translit: "2arīban", english: "soon", arabic: "قريباً" },
  ],
  imperative: [
    { translit: "halla2", english: "now", arabic: "هلق" },
    { translit: "b-sur3a", english: "quickly", arabic: "بسرعة" },
  ],
  participle: [
    { translit: "halla2", english: "now", arabic: "هلق" },
    { translit: "min zamēn", english: "for a long time", arabic: "من زمان" },
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
  { key: "il-akil", translit: "il-akil", english: "the food", arabic: "الأكل" },
  { key: "il-ktēb", translit: "il-ktēb", english: "the book", arabic: "الكتاب" },
  { key: "is-sayyāra", translit: "is-sayyāra", english: "the car", arabic: "السيارة" },
  { key: "telefōn", translit: "telefōn", english: "the phone", arabic: "التلفون" },
  { key: "il-maSāri", translit: "il-maSāri", english: "the money", arabic: "المصاري" },
  { key: "il-2ahwe", translit: "il-2ahwe", english: "the coffee", arabic: "القهوة" },
  { key: "il-bēb", translit: "il-bēb", english: "the door", arabic: "الباب" },
  { key: "il-miftē7", translit: "il-miftē7", english: "the key", arabic: "المفتاح" },
  { key: "il-khuDra", translit: "il-khuDra", english: "the vegetables", arabic: "الخضرة" },
  { key: "il-khíbiz", translit: "il-khíbiz", english: "the bread", arabic: "الخبز" },
  { key: "il-máyy", translit: "il-máyy", english: "the water", arabic: "المي" },
  { key: "il-7alīb", translit: "il-7alīb", english: "the milk", arabic: "الحليب" },
  { key: "il-dáwa", translit: "il-dáwa", english: "the medicine", arabic: "الدوا" },
  { key: "is-sandwīsh", translit: "is-sandwīsh", english: "the sandwich", arabic: "الساندويش" },
  { key: "il-bītza", translit: "il-bītza", english: "the pizza", arabic: "البيتزا" },
  { key: "il-fātūra", translit: "il-fātūra", english: "the bill", arabic: "الفاتورة" },
  { key: "ij-jarīde", translit: "ij-jarīde", english: "the newspaper", arabic: "الجريدة" },
  { key: "il-shánTa", translit: "il-shánTa", english: "the bag", arabic: "الشنطة" },
  { key: "il-akhbēr", translit: "il-akhbēr", english: "the news", arabic: "الأخبار" },
  { key: "il-fīlm", translit: "il-fīlm", english: "the movie", arabic: "الفيلم" },
  { key: "il-match", translit: "il-match", english: "the match", arabic: "الماتش" },
  { key: "is-su2āl", translit: "is-su2āl", english: "the question", arabic: "السؤال" },
  { key: "it-tiyēb", translit: "it-tiyēb", english: "the clothes", arabic: "التياب" },
  { key: "iS-Súwar", translit: "iS-Súwar", english: "the photos", arabic: "الصور" },
  { key: "iz-zbēle", translit: "iz-zbēle", english: "the trash", arabic: "الزبالة" },
  { key: "iS-Sabbāt", translit: "iS-Sabbāt", english: "the shoes", arabic: "الصبّاط" },
  { key: "il-kambiyūtar", translit: "il-kambiyūtar", english: "the computer", arabic: "الكمبيوتر" },
  { key: "il-hadīye", translit: "il-hadīye", english: "the gift", arabic: "الهدية" },
  { key: "il-3inwēn", translit: "il-3inwēn", english: "the address", arabic: "العنوان" },
  { key: "ir-rá2im", translit: "ir-rá2im", english: "the number", arabic: "الرقم" },
  { key: "il-mushkle", translit: "il-mushkle", english: "the problem", arabic: "المشكلة" },
  { key: "il-7a2ī2a", translit: "il-7a2ī2a", english: "the truth", arabic: "الحقيقة" },
  { key: "il-jāT", translit: "il-jāT", english: "the dishes", arabic: "الجاط" },
  { key: "il-bāS", translit: "il-bāS", english: "the bus", arabic: "الباص" },
  { key: "il-bēt", translit: "il-bēt", english: "the house", arabic: "البيت" },
  { key: "il-shíbbēk", translit: "il-shíbbēk", english: "the window", arabic: "الشباك" },
  { key: "il-ghráD", translit: "il-ghráD", english: "the stuff", arabic: "الغرض" },
  { key: "il-7all", translit: "il-7all", english: "the solution", arabic: "الحل" },
  { key: "il-Tard", translit: "il-Tard", english: "the package", arabic: "الطرد" },
  { key: "il-khúTTa", translit: "il-khúTTa", english: "the plan", arabic: "الخطة" },
  { key: "il-jawēb", translit: "il-jawēb", english: "the answer", arabic: "الجواب" },
  { key: "il-2íSSa", translit: "il-2íSSa", english: "the story", arabic: "القصة" },
  { key: "il-natīje", translit: "il-natīje", english: "the result", arabic: "النتيجة" },
  { key: "il-músi2a", translit: "il-músi2a", english: "the music", arabic: "الموسيقى" },
  { key: "il-wējib", translit: "il-wējib", english: "the homework", arabic: "الواجب" },
  { key: "il-imti7ān", translit: "il-imti7ān", english: "the exam", arabic: "الامتحان" },
  { key: "il-risēle", translit: "il-risēle", english: "the letter", arabic: "الرسالة" },
  { key: "il-wáraʔ", translit: "il-wáraʔ", english: "the paper", arabic: "الورق" },
  { key: "il-maw3id", translit: "il-maw3id", english: "the appointment", arabic: "الموعد" },
  { key: "il-7arāra", translit: "il-7arāra", english: "the heat", arabic: "الحرارة" },
  { key: "il-bárd", translit: "il-bárd", english: "the cold", arabic: "البرد" },
  { key: "il-báyDa", translit: "il-báyDa", english: "the egg", arabic: "البيضة" },
  { key: "il-kébbēye", translit: "il-kébbēye", english: "the glass", arabic: "الكبّاية" },
  { key: "il-maTbakh", translit: "il-maTbakh", english: "the kitchen", arabic: "المطبخ" },
  { key: "in-níkte", translit: "in-níkte", english: "the joke", arabic: "النكتة" },
  { key: "3árabi", translit: "3árabi", english: "Arabic", arabic: "عربي" },
  { key: "bayyo", translit: "bayyo", english: "his dad", arabic: "بيّو" },
  { key: "ukhto", translit: "ukhto", english: "his sister", arabic: "أختو" },
  { key: "Sa7bo", translit: "Sa7bo", english: "his friend", arabic: "صاحبو" },
  { key: "il-mu3allme", translit: "il-mu3allme", english: "the teacher", arabic: "المعلّمة" },
  { key: "il-jīrēn", translit: "il-jīrēn", english: "the neighbors", arabic: "الجيران" },
  { key: "la-bayyo", translit: "la-bayyo", english: "his dad", arabic: "لبيّو" },
  { key: "ahlo", translit: "ahlo", english: "his family", arabic: "أهلو" },
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
  { key: "il-ghada", translit: "il-ghada", english: "lunch", arabic: "الغدا" },
  { key: "il-3asha", translit: "il-3asha", english: "dinner", arabic: "العشا" },
  { key: "il-fTūr", translit: "il-fTūr", english: "breakfast", arabic: "الفطور" },
  { key: "ish-shúghul", translit: "ish-shúghul", english: "work", arabic: "الشغل" },
  { key: "id-dirāse", translit: "id-dirāse", english: "studies", arabic: "الدراسة" },
  { key: "it-tamārīn", translit: "it-tamārīn", english: "exercises", arabic: "التمارين" },
  { key: "id-dars", translit: "id-dars", english: "the lesson", arabic: "الدرس" },
  { key: "il-ijtimē3", translit: "il-ijtimē3", english: "the meeting", arabic: "الاجتماع" },
];

// --- Utilities ---

export function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
