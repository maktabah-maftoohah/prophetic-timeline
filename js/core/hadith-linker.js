/**
 * Prophetic Timeline - Canonical Hadith Linker
 * Generates direct verified hyperlinks to the Maktabah Maftoohah canonical digital hadith library
 * across Sahih al-Bukhari, Sahih Muslim, Sunan Abi Dawud, Jami' at-Tirmidhi,
 * Sunan an-Nasa'i, Sunan Ibn Majah, Musnad Ahmad, and Muwatta Malik.
 */

const CANONICAL_CORPUS = [
  {
    pattern: /Sahih al-Bukhari[^\d]*(\d+)/i,
    baseUrl: "https://maktabah-maftoohah.github.io/sahih-al-bukhari/",
    collectionName: "Sahih al-Bukhari"
  },
  {
    pattern: /Sahih Muslim[^\d]*(\d+)/i,
    baseUrl: "https://maktabah-maftoohah.github.io/sahih-muslim/",
    collectionName: "Sahih Muslim"
  },
  {
    pattern: /Sunan (?:Abi|Abu) Daw?ud[^\d]*(\d+)/i,
    baseUrl: "https://maktabah-maftoohah.github.io/sunan-abi-dawud/",
    collectionName: "Sunan Abi Dawud"
  },
  {
    pattern: /(?:Jami['`]?|Sunan) (?:at|al)-Tirmidhi[^\d]*(\d+)/i,
    baseUrl: "https://maktabah-maftoohah.github.io/jami-at-tirmidhi/",
    collectionName: "Jami' at-Tirmidhi"
  },
  {
    pattern: /Sunan an-Nasa['`]?i[^\d]*(\d+)/i,
    baseUrl: "https://maktabah-maftoohah.github.io/sunan-an-nasai/",
    collectionName: "Sunan an-Nasa'i"
  },
  {
    pattern: /Sunan Ibn Majah[^\d]*(\d+)/i,
    baseUrl: "https://maktabah-maftoohah.github.io/sunan-ibn-majah/",
    collectionName: "Sunan Ibn Majah"
  },
  {
    pattern: /Musnad Ahmad[^\d]*(\d+)/i,
    baseUrl: "https://maktabah-maftoohah.github.io/musnad-ahmad/",
    collectionName: "Musnad Ahmad"
  },
  {
    pattern: /Muwatta(?:['`]? Malik)?[^\d]*(\d+)/i,
    baseUrl: "https://maktabah-maftoohah.github.io/muwatta-malik/",
    collectionName: "Muwatta Malik"
  }
];

/**
 * Format any hadith string reference into an accessible anchor link if part of canonical corpus
 * @param {string} refText - e.g. "Sahih Muslim (Hadith 1162)" or "Sahih al-Bukhari (No. 4464)"
 * @returns {string} HTML string
 */
export function formatHadithLink(refText) {
  if (!refText || typeof refText !== "string") return "";

  for (const item of CANONICAL_CORPUS) {
    const match = refText.match(item.pattern);
    if (match) {
      const hadithNum = match[1];
      const targetUrl = `${item.baseUrl}${hadithNum}`;
      return `<a href="${targetUrl}" target="_blank" rel="noopener noreferrer" class="hadith-link" title="Buka ${item.collectionName} No. ${hadithNum} di Maktabah Maftoohah">${refText} ↗</a>`;
    }
  }

  return refText;
}
