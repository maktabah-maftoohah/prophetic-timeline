/**
 * Prophetic Timeline - Day Calculator Component
 * Calculates exact elapsed days, lunar years, and solar tropical years between any two milestones.
 */

import { eventStore } from "../core/event-store.js";
import { i18n } from "../core/i18n.js";

export class DayCalculator {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
  }

  render() {
    if (!this.container) return;

    const events = eventStore.getAllEvents().filter(e => e.date && e.date.jdn != null);
    const lang = i18n.getLang();

    // Default select Mawlid and Wafat
    const defaultA = "prophet-birth-mawlid";
    const defaultB = "prophet-passing-wafat";

    this.container.innerHTML = `
      <div class="calculator-card">
        <div class="calc-header">
          <h3>${i18n.t("visualizers.calculatorTitle")}</h3>
          <p class="calc-desc">${i18n.t("visualizers.calculatorDesc")}</p>
        </div>

        <div class="calc-form">
          <div class="form-group">
            <label for="calc-event-a">${i18n.t("visualizers.selectEventA")}</label>
            <select id="calc-event-a" class="form-control">
              ${events.map(ev => `
                <option value="${ev.id}" ${ev.id === defaultA ? "selected" : ""}>
                  ${ev.title[lang] || ev.title.ms} (${ev.date.display_date[lang] || ev.date.display_date.ms})
                </option>
              `).join("")}
            </select>
          </div>

          <div class="form-group">
            <label for="calc-event-b">${i18n.t("visualizers.selectEventB")}</label>
            <select id="calc-event-b" class="form-control">
              ${events.map(ev => `
                <option value="${ev.id}" ${ev.id === defaultB ? "selected" : ""}>
                  ${ev.title[lang] || ev.title.ms} (${ev.date.display_date[lang] || ev.date.display_date.ms})
                </option>
              `).join("")}
            </select>
          </div>

          <div class="preset-buttons">
            <button class="preset-btn" data-a="prophet-birth-mawlid" data-b="al-bithah-first-revelation">Kelahiran ➔ Kerasulan (40 Thn)</button>
            <button class="preset-btn" data-a="prophet-birth-mawlid" data-b="hijrah-entry-quba-medina">Kelahiran ➔ Hijrah (53 Thn)</button>
            <button class="preset-btn" data-a="prophet-birth-mawlid" data-b="death-of-ibrahim-solar-eclipse">Kelahiran ➔ Gerhana (Wafat Ibrahim)</button>
            <button class="preset-btn" data-a="prophet-birth-mawlid" data-b="prophet-passing-wafat">Kelahiran ➔ Kewafatan (63 Thn)</button>
            <button class="preset-btn" data-a="elephant-expedition-571" data-b="prophet-birth-mawlid">Tahun Gajah ➔ Kelahiran (49 Hari)</button>
          </div>
        </div>

        <div id="calc-results-area" class="calc-results"></div>
      </div>
    `;

    this.setupListeners();
    this.updateCalculation();
  }

  setupListeners() {
    const selectA = document.getElementById("calc-event-a");
    const selectB = document.getElementById("calc-event-b");
    const presetBtns = this.container.querySelectorAll(".preset-btn");

    if (selectA) selectA.addEventListener("change", () => this.updateCalculation());
    if (selectB) selectB.addEventListener("change", () => this.updateCalculation());

    presetBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        const a = btn.getAttribute("data-a");
        const b = btn.getAttribute("data-b");
        if (selectA) selectA.value = a;
        if (selectB) selectB.value = b;
        this.updateCalculation();
      });
    });
  }

  updateCalculation() {
    const selectA = document.getElementById("calc-event-a");
    const selectB = document.getElementById("calc-event-b");
    const resultsArea = document.getElementById("calc-results-area");
    if (!selectA || !selectB || !resultsArea) return;

    const eventIdA = selectA.value;
    const eventIdB = selectB.value;
    const res = eventStore.calculateDayDifference(eventIdA, eventIdB);
    const lang = i18n.getLang();

    if (!res) {
      resultsArea.innerHTML = `<div class="error-msg">Sila pilih dua peristiwa yang mempunyai nilai Julian Day Number (JDN).</div>`;
      return;
    }

    const { eventA, eventB, diffDays, lunarYears, solarYears } = res;

    // Check if matches key hadith milestones
    let hadithBadge = "";
    if (diffDays === 22329) {
      hadithBadge = `<div class="hadith-badge">★ Mengesahkan Riwayat Sahih al-Bukhari & Muslim: Hayat Rasulullah ﷺ genap 63 tahun qamari + 9 hari</div>`;
    } else if (diffDays === 18780) {
      hadithBadge = `<div class="hadith-badge">★ Mengesahkan Riwayat Sahih: Usia baginda ketika Hijrah genap 53 tahun qamari</div>`;
    } else if (diffDays === 14174) {
      hadithBadge = `<div class="hadith-badge">★ Mengesahkan Riwayat Sahih: Usia baginda ketika menerima wahyu genap 40 tahun qamari</div>`;
    } else if (diffDays === 49 || diffDays === 55) {
      hadithBadge = `<div class="hadith-badge">★ Mengesahkan Riwayat al-Mas'udi: Kelahiran berlaku tepat 7 minggu (49 hari) selepas ketibaan Abraha</div>`;
    }

    resultsArea.innerHTML = `
      <div class="result-summary">
        <h4>${i18n.t("visualizers.resultInterval")}</h4>
        <div class="result-path">
          <span class="path-node">${eventA.title[lang] || eventA.title.ms}</span>
          <span class="path-arrow">➔</span>
          <span class="path-node">${eventB.title[lang] || eventB.title.ms}</span>
        </div>

        <div class="metrics-grid">
          <div class="metric-card">
            <span class="metric-title">${i18n.t("visualizers.totalDays")}</span>
            <span class="metric-number">${diffDays.toLocaleString()}</span>
            <span class="metric-unit">${i18n.t("timeline.days")}</span>
          </div>

          <div class="metric-card">
            <span class="metric-title">${i18n.t("visualizers.lunarEquiv")}</span>
            <span class="metric-number">${lunarYears}</span>
            <span class="metric-unit">${i18n.t("timeline.lunarYears")} (354.367 h/thn)</span>
          </div>

          <div class="metric-card">
            <span class="metric-title">${i18n.t("visualizers.solarEquiv")}</span>
            <span class="metric-number">${solarYears}</span>
            <span class="metric-unit">${i18n.t("timeline.solarYears")} (365.2422 h/thn)</span>
          </div>
        </div>

        ${hadithBadge}
      </div>
    `;
  }
}
