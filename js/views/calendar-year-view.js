/**
 * Prophetic Timeline - Calendar Year View
 * 12-Month bird's-eye view showing event distribution across any given year.
 */

import { julianToJDN, getWeekday, getMonthName } from "../core/calendar-engine.js";
import { eventStore } from "../core/event-store.js";
import { i18n } from "../core/i18n.js";

export class CalendarYearView {
  constructor(containerId, onMonthSelect = null) {
    this.container = document.getElementById(containerId);
    this.onMonthSelect = onMonthSelect;
    this.currentYear = 571; // Defaults to Year of the Mawlid
  }

  setYear(year) {
    this.currentYear = year;
    this.render();
  }

  render() {
    if (!this.container) return;
    const lang = i18n.getLang();

    const elephantYear = this.currentYear - 571 + 1;
    const elephantLabel = elephantYear >= 1 ? `Tahun ${elephantYear} Gajah` : "Pra-Tahun Gajah";

    this.container.innerHTML = `
      <div class="year-view-wrapper">
        <div class="year-toolbar">
          <button id="year-prev-btn" class="btn btn-sm btn-outline">◀ Tahun Sebelum</button>
          <div class="year-center-title">
            <h2>Tahun ${this.currentYear} Masihi (Julian)</h2>
            <div class="year-sub">${elephantLabel} • ${this.currentYear >= 622 ? `Tahun ${this.currentYear - 622 + 1} Hijrah` : `Tahun ${622 - this.currentYear + 1} Sebelum Hijrah`}</div>
          </div>
          <button id="year-next-btn" class="btn btn-sm btn-outline">Tahun Selepas ▶</button>
        </div>

        <div class="year-milestone-presets">
          <button class="year-preset-btn" data-y="571">571 M (Tahun Gajah & Mawlid)</button>
          <button class="year-preset-btn" data-y="573">573 M (Belah Dada di Banu Sa'd)</button>
          <button class="year-preset-btn" data-y="579">579 M (Wafat Anushirvan)</button>
          <button class="year-preset-btn" data-y="610">610 M (Permulaan Kerasulan)</button>
          <button class="year-preset-btn" data-y="622">622 M (Tahun 1 Hijrah)</button>
          <button class="year-preset-btn" data-y="625">625 M (Tahun 4 Hijrah / Gerhana Bulan)</button>
          <button class="year-preset-btn" data-y="630">630 M (Fath Makkah & Lahir Ibrahim)</button>
          <button class="year-preset-btn" data-y="632">632 M (Wafat Ibrahim, Haji Wada' & Wafat Nabi)</button>
        </div>

        <div class="year-grid-12">
          ${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(m => this.renderMiniMonth(m, lang)).join("")}
        </div>
      </div>
    `;

    this.setupListeners();
  }

  setupListeners() {
    const prevBtn = document.getElementById("year-prev-btn");
    const nextBtn = document.getElementById("year-next-btn");
    const presets = this.container.querySelectorAll(".year-preset-btn");
    const miniMonths = this.container.querySelectorAll(".mini-month-card");

    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        this.currentYear -= 1;
        this.render();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        this.currentYear += 1;
        this.render();
      });
    }

    presets.forEach(p => {
      p.addEventListener("click", () => {
        this.currentYear = parseInt(p.getAttribute("data-y"), 10);
        this.render();
      });
    });

    miniMonths.forEach(card => {
      card.addEventListener("click", () => {
        const m = parseInt(card.getAttribute("data-month"), 10);
        if (this.onMonthSelect) {
          this.onMonthSelect(this.currentYear, m);
        }
      });
    });
  }

  renderMiniMonth(month, lang) {
    const firstJdn = julianToJDN(this.currentYear, month, 1);
    const startWeekday = getWeekday(firstJdn); // 0=Sunday

    let daysInMonth = 31;
    if (month === 2) {
      daysInMonth = (this.currentYear % 4 === 0) ? 29 : 28;
    } else if ([4, 6, 9, 11].includes(month)) {
      daysInMonth = 30;
    }

    // Check for events in this month
    let eventCount = 0;
    let hasMawlid = false;
    let hasWafat = false;

    for (let d = 1; d <= daysInMonth; d++) {
      const jdn = julianToJDN(this.currentYear, month, d);
      const evs = eventStore.getEventsByJDN(jdn);
      if (evs.length > 0) {
        eventCount += evs.length;
        if (evs.some(e => e.id === "prophet-birth-mawlid")) hasMawlid = true;
        if (evs.some(e => e.id === "prophet-passing-wafat")) hasWafat = true;
      }
    }

    let highlightClass = "";
    if (hasMawlid) highlightClass = "has-mawlid";
    else if (hasWafat) highlightClass = "has-wafat";
    else if (eventCount > 0) highlightClass = "has-any-event";

    return `
      <div class="mini-month-card ${highlightClass}" data-month="${month}">
        <div class="mini-month-header">
          <span class="mini-month-title">${getMonthName(month, lang, "julian")}</span>
          ${eventCount > 0 ? `<span class="mini-event-count">★ ${eventCount} peristiwa</span>` : ""}
        </div>
        <div class="mini-days-row">
          <span>A</span><span>I</span><span>S</span><span>R</span><span>K</span><span>J</span><span>S</span>
        </div>
        <div class="mini-cells-grid">
          ${Array(startWeekday).fill('<span class="empty-dot"></span>').join("")}
          ${Array.from({ length: daysInMonth }, (_, i) => {
            const dayNum = i + 1;
            const jdn = julianToJDN(this.currentYear, month, dayNum);
            const evs = eventStore.getEventsByJDN(jdn);
            const dotClass = evs.length > 0 ? "event-dot active" : "event-dot";
            return `<span class="${dotClass}">${dayNum}</span>`;
          }).join("")}
        </div>
      </div>
    `;
  }
}
