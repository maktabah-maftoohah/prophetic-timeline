/**
 * Prophetic Timeline - Calendar Engine
 * Precision multi-calendar algorithms for Julian, Gregorian, Hijri (AH/BH),
 * Elephant Era ('Am al-Fil), Seleucid (Alexander), Nabonassar, and Jewish Anno Mundi.
 * Based on Mahmoud Pasha al-Falaki's astronomical and historical determinations.
 */

export const ARCHAIC_ARAB_MONTHS = [
  { standard: "Al-Muharram", archaic: "المؤتمر (al-Mu'tamir)" },
  { standard: "Safar", archaic: "ناجر (Najir)" },
  { standard: "Rabi' al-Awwal", archaic: "خوان (Khuwwan)" },
  { standard: "Rabi' al-Thani", archaic: "صوان (Suwwan)" },
  { standard: "Jumada al-Ula", archaic: "رنة / حنين (Rinna / Hanin)" },
  { standard: "Jumada al-Akhirah", archaic: "زبة / بائدة (Zubba / Ba'idah)" },
  { standard: "Rajab", archaic: "الأصم (al-Asamm)" },
  { standard: "Sha'ban", archaic: "عادل / واغل ('Adil / Waghil)" },
  { standard: "Ramadan", archaic: "نافق / ناتق (Nafiq / Natiq)" },
  { standard: "Shawwal", archaic: "وعل (Wa'il)" },
  { standard: "Dhu al-Qi'dah", archaic: "ورنة (Warnah)" },
  { standard: "Dhu al-Hijjah", archaic: "برك (Burak)" }
];

export const HIJRI_MONTH_NAMES = {
  ms: [
    "Muharram", "Safar", "Rabiulawal", "Rabiulakhir",
    "Jamadilawal", "Jamadilakhir", "Rajab", "Syaaban",
    "Ramadan", "Syawal", "Zulkaedah", "Zulhijjah"
  ],
  en: [
    "Al-Muharram", "Safar", "Rabi' al-Awwal", "Rabi' al-Thani",
    "Jumada al-Ula", "Jumada al-Akhirah", "Rajab", "Sha'ban",
    "Ramadan", "Shawwal", "Dhu al-Qi'dah", "Dhu al-Hijjah"
  ],
  ar: [
    "المحرم", "صفر", "ربيع الأول", "ربيع الثاني",
    "جمادى الأولى", "جمادى الآخرة", "رجب", "شعبان",
    "رمضان", "شوال", "ذو القعدة", "ذو الحجة"
  ]
};

export const WEEKDAY_NAMES = {
  ms: ["Ahad", "Isnin", "Selasa", "Rabu", "Khamis", "Jumaat", "Sabtu"],
  en: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  ar: ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"]
};

// Anchor: Astronomical Hijri Epoch: Thursday 15 July 622 CE (Julian) = JDN 1948439
// Calibrated to Mahmoud Pasha al-Falaki's historical & astronomical milestones:
// - 9 Rabi' al-Awwal 53 BH (Mawlid) = Monday 20 April 571 CE (Julian) = JDN 1929725
// - 29 Shawwal 10 AH (Death of Ibrahim & Solar Eclipse) = Monday 27 January 632 CE (Julian) = JDN 1951922
// - 9 Dhu al-Hijjah 10 AH (Farewell Pilgrimage / Arafah) = Friday 6 March 632 CE (Julian) = JDN 1951961
// - 14 Jumada al-Akhirah 4 AH (Medina Lunar Eclipse) = Wednesday 20 November 625 CE (Julian) = JDN 1949663
export const HIJRAH_EPOCH_JDN = 1948439;

// Anchor: 9 Rabi' al-Awwal 53 BH (Mawlid) = Monday 20 April 571 CE (Julian) = JDN 1929725
export const MAWLID_JDN = 1929725;

/**
 * Convert a Julian calendar date to Julian Day Number (JDN)
 */
export function julianToJDN(year, month, day) {
  let y = year;
  let m = month;
  if (m <= 2) {
    y -= 1;
    m += 12;
  }
  const a = Math.floor(y / 100);
  // Julian calendar formulation
  const jdn = Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day - 1524;
  return jdn;
}

/**
 * Convert Julian Day Number (JDN) to Julian Calendar Date
 */
export function jdnToJulian(jdn) {
  const c = jdn + 32082;
  const d = Math.floor((4 * c + 3) / 1461);
  const e = c - Math.floor((1461 * d) / 4);
  const m = Math.floor((5 * e + 2) / 153);
  const day = e - Math.floor((153 * m + 2) / 5) + 1;
  const month = m < 10 ? m + 3 : m - 9;
  const year = d - 4800 + Math.floor((m + 2) / 12);
  return { year, month, day };
}

/**
 * Convert a Gregorian calendar date to Julian Day Number (JDN)
 */
export function gregorianToJDN(year, month, day) {
  let y = year;
  let m = month;
  if (m <= 2) {
    y -= 1;
    m += 12;
  }
  const a = Math.floor(y / 100);
  const b = 2 - a + Math.floor(a / 4);
  const jdn = Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + b - 1524;
  return jdn;
}

/**
 * Convert Julian Day Number (JDN) to Gregorian Calendar Date
 */
export function jdnToGregorian(jdn) {
  const a = jdn + 32044;
  const b = Math.floor((4 * a + 3) / 146097);
  const c = a - Math.floor((146097 * b) / 4);
  const d = Math.floor((4 * c + 3) / 1461);
  const e = c - Math.floor((1461 * d) / 4);
  const m = Math.floor((5 * e + 2) / 153);
  const day = e - Math.floor((153 * m + 2) / 5) + 1;
  const month = m < 10 ? m + 3 : m - 9;
  const year = 100 * b + d - 4800 + Math.floor((m + 2) / 12);
  return { year, month, day };
}

/**
 * Get weekday index (0 = Sunday, 1 = Monday, ..., 6 = Saturday) from JDN
 */
export function getWeekday(jdn) {
  return (jdn + 1) % 7;
}

/**
 * Convert JDN to Tabular / Al-Falaki Anchored Hijri Date
 */
export function jdnToHijri(jdn) {
  // Tabular Islamic Calendar (Kuwaiti algorithm calibrated to al-Falaki's milestones)
  const l = jdn - HIJRAH_EPOCH_JDN + 10632;
  const n = Math.floor((l - 1) / 10631);
  const lAdj = l - 10631 * n + 354;
  const j = (Math.floor((10985 - lAdj) / 5316)) * (Math.floor((50 * lAdj) / 17719)) +
            (Math.floor(lAdj / 5670)) * (Math.floor((43 * lAdj) / 15238));
  const lFinal = lAdj - (Math.floor((30 - j) / 15)) * (Math.floor((17719 * j) / 50)) -
                 (Math.floor(j / 16)) * (Math.floor((15238 * j) / 43)) + 29;
  const month = Math.floor((24 * lFinal) / 709);
  const day = lFinal - Math.floor((709 * month) / 24);
  let year = 30 * n + j - 30;

  let isBH = false;
  let yearType = "AH";
  let displayYear = year;

  if (year <= 0) {
    isBH = true;
    yearType = "BH";
    displayYear = Math.abs(year) + 1;
  }

  return {
    year: displayYear,
    rawYear: year,
    yearType,
    isBH,
    month: month,
    day: day
  };
}

/**
 * Convert a Tabular Hijri date to Julian Day Number (JDN)
 * @param {number} year - Absolute year (e.g. 53 for 53 BH or 10 for 10 AH)
 * @param {number} month - Month (1 = Muharram, ..., 12 = Zulhijjah)
 * @param {number} day - Day (1..30)
 * @param {boolean} isBH - True if Before Hijrah (BH)
 */
export function hijriToJDN(year, month, day, isBH = false) {
  const rawYear = isBH ? -(year - 1) : year;
  const y = rawYear;
  return day + Math.ceil(29.5 * (month - 1)) + (y - 1) * 354 + Math.floor((3 + 11 * y) / 30) + HIJRAH_EPOCH_JDN - 1;
}

/**
 * Determine the number of days in a given Hijri month (29 or 30 days)
 */
export function getDaysInHijriMonth(year, month, isBH = false) {
  let nextYear = year;
  let nextMonth = month + 1;
  let nextIsBH = isBH;
  if (nextMonth > 12) {
    nextMonth = 1;
    if (isBH) {
      if (year === 1) {
        nextYear = 1;
        nextIsBH = false;
      } else {
        nextYear = year - 1;
      }
    } else {
      nextYear = year + 1;
    }
  }
  const jdnStart = hijriToJDN(year, month, 1, isBH);
  const jdnEnd = hijriToJDN(nextYear, nextMonth, 1, nextIsBH);
  return jdnEnd - jdnStart;
}

/**
 * Convert JDN to Elephant Era ('Am al-Fil) Year
 * In classical Arab historiography, the Elephant Era is counted in lunar years
 * commencing from Muharram 53 BH (Tahun 1 Gajah = 571 CE) through the 63rd year (11 AH = 632 CE).
 */
export function jdnToElephantEra(jdn) {
  const hijri = jdnToHijri(jdn);
  let elephantYear = 0;
  if (hijri.isBH) {
    elephantYear = 53 - hijri.year + 1;
  } else {
    elephantYear = 52 + hijri.year;
  }
  const isValidEra = elephantYear >= 1 && elephantYear <= 100;
  return {
    year: elephantYear,
    isValidEra,
    label: isValidEra ? `Tahun ${elephantYear} Gajah` : `Pra-Tahun Gajah`
  };
}

/**
 * Get comprehensive multi-calendar conversion for any JDN
 */
export function getMultiCalendarSnapshot(jdn, lang = "ms") {
  if (jdn == null) return null;

  const weekdayIdx = getWeekday(jdn);
  const weekdayName = WEEKDAY_NAMES[lang][weekdayIdx];
  const julian = jdnToJulian(jdn);
  const gregorian = jdnToGregorian(jdn);
  const hijri = jdnToHijri(jdn);
  const elephant = jdnToElephantEra(jdn);

  // Seleucid / Alexander Year
  const alexanderYear = julian.year + 311;

  // Nabonassar Year (approx vague 365-day year from 747 BCE)
  const nabonassarYear = Math.floor((jdn - 1448638) / 365) + 1;

  // Jewish Anno Mundi Year
  const jewishYear = julian.year + 3760 + (julian.month >= 9 ? 1 : 0);

  // Persian Sasanian Reign (Khusrow I 531-579 CE)
  let persianRegnal = null;
  if (julian.year >= 531 && julian.year <= 579) {
    const regnal = julian.year - 531 + 1;
    persianRegnal = lang === "ar" ? `سنة ${regnal} لملك أنوشروان` : `Tahun ke-${regnal} Khusrow I Anushirvan`;
  } else if (julian.year >= 632) {
    persianRegnal = lang === "ar" ? "عهد يزدجرد الثالث" : "Zaman Yazdegerd III";
  }

  // Days from Mawlid
  const daysFromMawlid = jdn - MAWLID_JDN;

  return {
    jdn,
    weekdayIdx,
    weekdayName,
    julian: {
      year: julian.year,
      month: julian.month,
      day: julian.day,
      formatted: `${julian.day} ${getMonthName(julian.month, lang, "julian")} ${julian.year} M (Julian)`
    },
    gregorian: {
      year: gregorian.year,
      month: gregorian.month,
      day: gregorian.day,
      formatted: `${gregorian.day} ${getMonthName(gregorian.month, lang, "gregorian")} ${gregorian.year} M (Gregorian)`
    },
    hijri: {
      year: hijri.year,
      yearType: hijri.yearType,
      isBH: hijri.isBH,
      month: hijri.month,
      day: hijri.day,
      monthName: HIJRI_MONTH_NAMES[lang][hijri.month - 1] || "",
      archaicMonthName: ARCHAIC_ARAB_MONTHS[hijri.month - 1]?.archaic || "",
      formatted: `${hijri.day} ${HIJRI_MONTH_NAMES[lang][hijri.month - 1]} ${hijri.year} ${hijri.yearType}`,
      formattedAr: `${String(hijri.day).replace(/[0-9]/g, d => "٠١٢٣٤٥٦٧٨٩"[+d])} ${HIJRI_MONTH_NAMES.ar[hijri.month - 1]} ${String(hijri.year).replace(/[0-9]/g, d => "٠١٢٣٤٥٦٧٨٩"[+d])} ${hijri.yearType === "BH" ? "ق.هـ" : "هـ"}`
    },
    elephantEra: elephant,
    alexanderYear,
    nabonassarYear,
    jewishYear,
    persianRegnal,
    daysFromMawlid
  };
}

export function getMonthName(month, lang = "ms", system = "julian") {
  const months = {
    ms: ["Januari", "Februari", "Mac", "April", "Mei", "Jun", "Julai", "Ogos", "September", "Oktober", "November", "Disember"],
    en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    ar: ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"]
  };
  return months[lang][month - 1] || "";
}
