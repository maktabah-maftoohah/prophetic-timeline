/**
 * Prophetic Timeline - Event Store
 * Manages loading, indexing, caching, filtering, and cross-event calculations.
 */

import { MAWLID_JDN } from "./calendar-engine.js";

class EventStore {
  constructor() {
    this.events = [];
    this.metadata = null;
    this.byJdn = new Map();
    this.byId = new Map();
    this.isLoaded = false;
  }

  async loadEvents(basePath = "./data/events.json") {
    if (this.isLoaded) return this.events;
    try {
      const response = await fetch(basePath);
      if (!response.ok) {
        throw new Error(`Failed to load ${basePath}: ${response.statusText}`);
      }
      const data = await response.json();
      this.metadata = data.metadata;
      this.events = data.events;

      // Index events
      this.events.forEach(ev => {
        this.byId.set(ev.id, ev);
        if (ev.date && ev.date.jdn != null) {
          if (!this.byJdn.has(ev.date.jdn)) {
            this.byJdn.set(ev.date.jdn, []);
          }
          this.byJdn.get(ev.date.jdn).push(ev);
        }
      });

      this.isLoaded = true;
      return this.events;
    } catch (err) {
      console.error("Error loading events:", err);
      throw err;
    }
  }

  getAllEvents() {
    return this.events;
  }

  getEventById(id) {
    return this.byId.get(id) || null;
  }

  getEventsByJDN(jdn) {
    return this.byJdn.get(jdn) || [];
  }

  filterEvents({ category = "all", searchQuery = "", granularity = "all" } = {}) {
    return this.events.filter(ev => {
      // Category filter
      if (category !== "all" && ev.category !== category) {
        return false;
      }
      // Granularity filter
      if (granularity !== "all" && ev.granularity !== granularity) {
        return false;
      }
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const titleMs = (ev.title.ms || "").toLowerCase();
        const titleEn = (ev.title.en || "").toLowerCase();
        const titleAr = (ev.title.ar || "").toLowerCase();
        const descMs = (ev.narrative.summary_ms || "").toLowerCase();
        const descEn = (ev.narrative.summary_en || "").toLowerCase();
        const descAr = (ev.narrative.summary_ar || "").toLowerCase();

        const match = titleMs.includes(q) || titleEn.includes(q) || titleAr.includes(q) ||
                      descMs.includes(q) || descEn.includes(q) || descAr.includes(q);
        if (!match) return false;
      }
      return true;
    });
  }

  calculateDayDifference(eventIdA, eventIdB) {
    const evA = this.getEventById(eventIdA);
    const evB = this.getEventById(eventIdB);
    if (!evA || !evB) return null;
    if (evA.date.jdn == null || evB.date.jdn == null) return null;

    const diffDays = Math.abs(evB.date.jdn - evA.date.jdn);
    const lunarYears = (diffDays / 354.367).toFixed(2);
    const solarYears = (diffDays / 365.2422).toFixed(2);

    return {
      eventA: evA,
      eventB: evB,
      diffDays,
      lunarYears,
      solarYears
    };
  }

  getCategories() {
    return [
      { id: "all", label: { ms: "Semua Kategori", en: "All Categories", ar: "جميع الفئات" } },
      { id: "ancient_epoch", label: { ms: "Zaman Purba", en: "Ancient Epochs", ar: "العصور القديمة" } },
      { id: "astronomical_anchor", label: { ms: "Paksi Astronomi", en: "Astronomical Anchors", ar: "الأوتاد الفلكية" } },
      { id: "pre_mawlid_seerah", label: { ms: "Sebelum Kelahiran", en: "Pre-Mawlid", ar: "ما قبل المولد" } },
      { id: "mawlid", label: { ms: "Kelahiran Nabi ﷺ", en: "The Mawlid", ar: "المولد النبوي" } },
      { id: "prophetic_childhood", label: { ms: "Masa Kanak-kanak", en: "Childhood & Youth", ar: "النشأة الشريفة" } },
      { id: "prophetic_mission", label: { ms: "Permulaan Kerasulan", en: "Prophethood / Bi'thah", ar: "المبعث النبوي" } },
      { id: "madinan_era", label: { ms: "Zaman Madinah", en: "Madinan Era", ar: "العهد المدني" } },
      { id: "wafat_and_after", label: { ms: "Kewafatan & Selepasnya", en: "Passing & Beyond", ar: "الوفاة الشريفة وما بعدها" } }
    ];
  }
}

export const eventStore = new EventStore();
