// Verb-specific sentence templates ported from tools/app.py
export const VERB_TEMPLATES = {
  "إجا": {
    bi_imperfect: [
      ["_____ عالبيت كل يوم", "_____ 3al-beit kil yom", "_____ come home every day"],
      ["_____ عالشغل كل يوم", "_____ 3ash-shighl kil yom", "_____ come to work every day"],
      ["_____ لعندي كل أسبوع", "_____ la3indi kil isbu3", "_____ come to my place every week"],
    ],
    perfect: [
      ["_____ عالبيت مبارح", "_____ 3al-beit mberih", "_____ came home yesterday"],
      ["_____ لعندي مبارح", "_____ la3indi mberih", "_____ came to my place yesterday"],
    ],
  },
  "أخَذ": {
    bi_imperfect: [
      ["_____ الباص كل يوم", "_____ il-baS kil yom", "_____ take the bus every day"],
      ["_____ الدوا كل يوم", "_____ id-dawa kil yom", "_____ take medicine every day"],
      ["_____ قهوة كل صبح", "_____ ahwe kil Subih", "_____ have coffee every morning"],
    ],
    perfect: [
      ["_____ الباص مبارح", "_____ il-baS mberih", "_____ took the bus yesterday"],
      ["_____ الكتاب مبارح", "_____ il-kteb mberih", "_____ took the book yesterday"],
    ],
  },
  "أعْلَن": {
    bi_imperfect: [
      ["_____ الأخبار كل يوم", "_____ il-akhbar kil yom", "_____ announce news every day"],
      ["_____ النتائج كل أسبوع", "_____ in-nateyij kil isbu3", "_____ announce results every week"],
    ],
    perfect: [
      ["_____ الخبر مبارح", "_____ il-khabar mberih", "_____ announced the news yesterday"],
      ["_____ خطوبتن مبارح", "_____ khaTubton mberih", "_____ announced their engagement yesterday"],
    ],
  },
  "أكَل": {
    bi_imperfect: [
      ["_____ الفطور كل يوم", "_____ il-fTur kil yom", "_____ eat breakfast every day"],
      ["_____ فلافل كل يوم", "_____ falafel kil yom", "_____ eat falafel every day"],
      ["_____ بالمطعم كل جمعة", "_____ bil-maT3am kil jum3a", "_____ eat at the restaurant every Friday"],
    ],
    perfect: [
      ["_____ الفطور مبارح", "_____ il-fTur mberih", "_____ ate breakfast yesterday"],
      ["_____ شاورما مبارح", "_____ shawarma mberih", "_____ ate shawarma yesterday"],
      ["_____ عند ستي مبارح", "_____ 3ind sitti mberih", "_____ ate at grandma's yesterday"],
    ],
  },
  "أمَر": {
    bi_imperfect: [
      ["_____ قهوة كل يوم", "_____ ahwe kil yom", "_____ order coffee every day"],
      ["_____ أكل كل يوم", "_____ akil kil yom", "_____ order food every day"],
      ["_____ من المطعم كل أسبوع", "_____ min il-maT3am kil isbu3", "_____ order from the restaurant every week"],
    ],
    perfect: [
      ["_____ قهوة مبارح", "_____ ahwe mberih", "_____ ordered coffee yesterday"],
      ["_____ شاورما مبارح", "_____ shawarma mberih", "_____ ordered shawarma yesterday"],
    ],
  },
  "باع": {
    bi_imperfect: [
      ["_____ خضرة كل يوم", "_____ khaDra kil yom", "_____ sell vegetables every day"],
      ["_____ بالسوق كل يوم", "_____ bis-su2 kil yom", "_____ sell at the market every day"],
    ],
    perfect: [
      ["_____ السيارة مبارح", "_____ is-sayyara mberih", "_____ sold the car yesterday"],
      ["_____ البيت مبارح", "_____ il-beit mberih", "_____ sold the house yesterday"],
    ],
  },
  "بَرَم": {
    bi_imperfect: [
      ["_____ بالسوق كل يوم", "_____ bis-su2 kil yom", "_____ wander the market every day"],
      ["_____ بالضيعة كل أسبوع", "_____ bid-Day3a kil isbu3", "_____ wander the village every week"],
    ],
    perfect: [
      ["_____ بالسوق مبارح", "_____ bis-su2 mberih", "_____ wandered the market yesterday"],
      ["_____ بكل المحلات مبارح", "_____ b-kil il-maHallat mberih", "_____ visited all the shops yesterday"],
    ],
  },
  "بِقي": {
    bi_imperfect: [
      ["_____ بالبيت كل يوم", "_____ bil-beit kil yom", "_____ stay home every day"],
      ["_____ هادي كل يوم", "_____ hadi kil yom", "_____ stay calm every day"],
    ],
    perfect: [
      ["_____ بالبيت مبارح", "_____ bil-beit mberih", "_____ stayed home yesterday"],
      ["_____ عند صحابي مبارح", "_____ 3ind SHabi mberih", "_____ stayed at friends' yesterday"],
    ],
  },
  "بَلَّش": {
    bi_imperfect: [
      ["_____ الشغل كل يوم", "_____ ish-shighl kil yom", "_____ start work every day"],
      ["_____ الدرس كل يوم", "_____ id-daris kil yom", "_____ start the lesson every day"],
    ],
    perfect: [
      ["_____ الشغل مبارح", "_____ ish-shighl mberih", "_____ started work yesterday"],
      ["_____ يدرس عربي مبارح", "_____ yidrus 3arabi mberih", "_____ started studying Arabic yesterday"],
    ],
  },
  "تَرَك": {
    bi_imperfect: [
      ["_____ الشغل الساعة خمسة كل يوم", "_____ ish-shighl is-se3a khamse kil yom", "_____ leave work at five every day"],
      ["_____ البيت كل صبح", "_____ il-beit kil Subih", "_____ leave home every morning"],
    ],
    perfect: [
      ["_____ الشغل مبارح", "_____ ish-shighl mberih", "_____ left work yesterday"],
      ["_____ التدخين مبارح", "_____ it-tadkhin mberih", "_____ quit smoking yesterday"],
    ],
  },
};

export const GENERIC_TEMPLATES = {
  bi_imperfect: [["_____ كل يوم", "_____ kil yom", "_____ every day"]],
  perfect: [["_____ مبارح", "_____ mberih", "_____ yesterday"]],
};

export const IMPERFECT_TEMPLATES = {
  auxiliary: [
    { particle_ar: "فيّي", particle_tr: "fíyyi", context_en: "I can", person: "ana" },
    { particle_ar: "فينا", particle_tr: "fína", context_en: "we can", person: "nihna" },
    { particle_ar: "فيك", particle_tr: "fík", context_en: "you (m) can", person: "inta" },
    { particle_ar: "فيكي", particle_tr: "fíki", context_en: "you (f) can", person: "inti" },
    { particle_ar: "فيكن", particle_tr: "fíkon", context_en: "you (pl) can", person: "intu" },
    { particle_ar: "فيو", particle_tr: "fíyyu", context_en: "he can", person: "huwwe" },
    { particle_ar: "فيا", particle_tr: "fíya", context_en: "she can", person: "hiyye" },
    { particle_ar: "فين", particle_tr: "fíyon", context_en: "they can", person: "hinne" },
    { particle_ar: "بدّي", particle_tr: "báddi", context_en: "I want to", person: "ana" },
    { particle_ar: "بدّنا", particle_tr: "báddna", context_en: "we want to", person: "nihna" },
    { particle_ar: "بدّك", particle_tr: "báddak", context_en: "you (m) want to", person: "inta" },
    { particle_ar: "بدّك", particle_tr: "báddik", context_en: "you (f) want to", person: "inti" },
    { particle_ar: "بدّكن", particle_tr: "báddkon", context_en: "you (pl) want to", person: "intu" },
    { particle_ar: "بدّو", particle_tr: "báddo", context_en: "he wants to", person: "huwwe" },
    { particle_ar: "بدّا", particle_tr: "bádda", context_en: "she wants to", person: "hiyye" },
    { particle_ar: "بدّن", particle_tr: "báddon", context_en: "they want to", person: "hinne" },
  ],
  future: [{ particle_ar: "رح", particle_tr: "ra7", context_en: "will" }],
  progressive: [{ particle_ar: "عم", particle_tr: "3am", context_en: "is/are (doing)" }],
  purpose: [
    { particle_ar: "ل", particle_tr: "la-", context_en: "in order to" },
    { particle_ar: "ت", particle_tr: "ta-", context_en: "in order to" },
    { particle_ar: "حتى", particle_tr: "7átta", context_en: "so that" },
    { particle_ar: "كرمال", particle_tr: "kirmēl", context_en: "so that" },
  ],
};
