/**
 * Prophetic Timeline - i18n Manager
 */
import ms from "../i18n/ms.js";
import en from "../i18n/en.js";
import ar from "../i18n/ar.js";

const translations = { ms, en, ar };

class I18nManager {
  constructor() {
    this.currentLang = localStorage.getItem("prophetic_timeline_lang") || "ms";
    this.listeners = [];
  }

  getLang() {
    return this.currentLang;
  }

  setLang(lang) {
    if (!translations[lang]) return;
    this.currentLang = lang;
    localStorage.setItem("prophetic_timeline_lang", lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    this.notify();
  }

  t(path) {
    const keys = path.split(".");
    let current = translations[this.currentLang];
    for (const k of keys) {
      if (current && current[k] !== undefined) {
        current = current[k];
      } else {
        // Fallback to ms
        let fallback = translations.ms;
        for (const fk of keys) {
          if (fallback && fallback[fk] !== undefined) {
            fallback = fallback[fk];
          } else {
            return path;
          }
        }
        return fallback;
      }
    }
    return current;
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(l => l(this.currentLang));
  }
}

export const i18n = new I18nManager();
