/**
 * Prophetic Timeline - Timeline View
 * Vertical scrolling interactive timeline with macro prologue and micro day-precision zones.
 */

import { eventStore } from "../core/event-store.js";
import { i18n } from "../core/i18n.js";

export class TimelineView {
  constructor(containerId, onSelectDateForCalendar = null) {
    this.container = document.getElementById(containerId);
    this.onSelectDateForCalendar = onSelectDateForCalendar;
    this.activeCategory = "all";
    this.searchQuery = "";
  }

  render() {
    if (!this.container) return;
    const lang = i18n.getLang();
    const categories = eventStore.getCategories();

    this.container.innerHTML = `
      <div class="timeline-controls-bar">
        <div class="search-box">
          <input type="text" id="timeline-search" placeholder="${i18n.t("timeline.searchPlaceholder")}" value="${this.searchQuery}" class="form-control">
        </div>
        <div class="category-filter">
          <label for="timeline-category-select">${i18n.t("timeline.filterCategory")}</label>
          <select id="timeline-category-select" class="form-control">
            ${categories.map(c => `
              <option value="${c.id}" ${c.id === this.activeCategory ? "selected" : ""}>
                ${c.label[lang] || c.label.ms}
              </option>
            `).join("")}
          </select>
        </div>
      </div>

      <div id="timeline-content-area" class="timeline-container">
        <!-- Rendered dynamically -->
      </div>
    `;

    this.setupListeners();
    this.renderTimelineNodes();
  }

  setupListeners() {
    const searchInput = document.getElementById("timeline-search");
    const categorySelect = document.getElementById("timeline-category-select");

    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        this.searchQuery = e.target.value;
        this.renderTimelineNodes();
      });
    }

    if (categorySelect) {
      categorySelect.addEventListener("change", (e) => {
        this.activeCategory = e.target.value;
        this.renderTimelineNodes();
      });
    }
  }

  renderTimelineNodes() {
    const contentArea = document.getElementById("timeline-content-area");
    if (!contentArea) return;

    const filteredEvents = eventStore.filterEvents({
      category: this.activeCategory,
      searchQuery: this.searchQuery
    });

    const lang = i18n.getLang();

    if (filteredEvents.length === 0) {
      contentArea.innerHTML = `
        <div class="empty-state">
          <p>Tiada peristiwa dijumpai bagi kriteria carian ini.</p>
        </div>
      `;
      return;
    }

    // Split into Ancient Epochs (prologue) and Lifespan / Historical precision events
    const ancientEpochs = filteredEvents.filter(e => e.category === "ancient_epoch");
    const precisionEvents = filteredEvents.filter(e => e.category !== "ancient_epoch");

    let html = "";

    // 1. Prologue Section
    if (ancientEpochs.length > 0) {
      html += `
        <div class="timeline-section-heading">
          <h3>${i18n.t("timeline.prologueTitle")}</h3>
          <p class="section-notice">${i18n.t("timeline.prologueNotice")}</p>
        </div>
        <div class="ancient-epochs-grid">
          ${ancientEpochs.map(ev => this.renderAncientCard(ev, lang)).join("")}
        </div>
      `;
    }

    // 2. Precision Lifespan Section
    if (precisionEvents.length > 0) {
      html += `
        <div class="timeline-section-heading mt-6">
          <h3>Garis Masa Utama: Tahun Gajah hingga Kewafatan (571–632 M)</h3>
          <p class="section-notice">Tersusun mengikut turutan falak dan kalendar sebenar dengan paksi perkiraan Mahmoud Pasha al-Falaki.</p>
        </div>
        <div class="vertical-timeline">
          ${precisionEvents.map((ev, index) => {
            const nextEv = precisionEvents[index + 1];
            return this.renderTimelineCard(ev, nextEv, lang);
          }).join("")}
        </div>
      `;
    }

    contentArea.innerHTML = html;
    this.setupCardInteractiveActions();
  }

  renderAncientCard(ev, lang) {
    return `
      <div class="ancient-card" data-event-id="${ev.id}">
        <div class="card-badge">${ev.date.display_date[lang] || ev.date.display_date.ms}</div>
        <h4 class="card-title">${ev.title[lang] || ev.title.ms}</h4>
        <div class="card-title-ar" dir="rtl">${ev.title.ar}</div>
        <p class="card-desc">${ev.narrative[`summary_${lang}`] || ev.narrative.summary_ms}</p>
        <div class="card-source">${ev.narrative.classical_source || ""}</div>
      </div>
    `;
  }

  renderTimelineCard(ev, nextEv, lang) {
    const isMawlid = ev.id === "prophet-birth-mawlid";
    const isWafat = ev.id === "prophet-passing-wafat";
    const isElephant = ev.id === "elephant-expedition-571";
    const isEclipse = ev.id === "death-of-ibrahim-solar-eclipse";
    const isHijrah = ev.id === "hijrah-entry-quba-medina";
    const isBithah = ev.id === "al-bithah-first-revelation";

    let specialClass = "";
    if (isMawlid) specialClass = "card-mawlid";
    else if (isWafat) specialClass = "card-wafat";
    else if (isElephant) specialClass = "card-elephant";
    else if (isEclipse) specialClass = "card-eclipse";
    else if (isHijrah) specialClass = "card-hijrah";

    // Day count connector to next major milestone
    let connectorHtml = "";
    if (nextEv && ev.date.jdn && nextEv.date.jdn) {
      const diff = Math.abs(nextEv.date.jdn - ev.date.jdn);
      if (diff > 0) {
        connectorHtml = `
          <div class="timeline-connector">
            <div class="connector-line"></div>
            <div class="connector-pill">
              <span class="pill-days">⏳ +${diff.toLocaleString()} ${i18n.t("timeline.days")}</span>
              <span class="pill-sub">(${(diff / 354.367).toFixed(1)} thn qamari)</span>
            </div>
            <div class="connector-line"></div>
          </div>
        `;
      }
    }

    // Days from Mawlid badge
    let mawlidDiffBadge = "";
    if (ev.astronomical_meta && ev.astronomical_meta.day_count_from_mawlid != null) {
      const d = ev.astronomical_meta.day_count_from_mawlid;
      mawlidDiffBadge = `<div class="mawlid-distance-badge">🌟 ${i18n.t("timeline.daysFromMawlid")} <strong>${d.toLocaleString()} ${i18n.t("timeline.days")}</strong></div>`;
    }

    return `
      <div class="timeline-item ${specialClass}" id="event-node-${ev.id}">
        <div class="timeline-marker"></div>
        <div class="timeline-card">
          <div class="card-header-bar">
            <span class="date-chip">${ev.date.display_date[lang] || ev.date.display_date.ms}</span>
            ${ev.date.elephant_era ? `<span class="elephant-chip">${ev.date.elephant_era.label}</span>` : ""}
            ${ev.date.weekday ? `<span class="weekday-chip">${ev.date.weekday}</span>` : ""}
          </div>

          <h3 class="timeline-title">${ev.title[lang] || ev.title.ms}</h3>
          <div class="timeline-title-ar" dir="rtl">${ev.title.ar}</div>

          <!-- Multi-calendar concordance strip -->
          <div class="concordance-strip">
            <div class="conc-item"><strong>Hijri:</strong> ${ev.date.hijri_display || "-"}</div>
            <div class="conc-item"><strong>Iskandar:</strong> ${ev.date.seleucid_alexander || "-"}</div>
            <div class="conc-item"><strong>Nabonassar:</strong> ${ev.date.nabonassar || "-"}</div>
            <div class="conc-item"><strong>Ciptaan (AM):</strong> ${ev.date.jewish_am || "-"}</div>
            <div class="conc-item"><strong>Parsi:</strong> ${ev.date.persian_regnal || "-"}</div>
          </div>

          <p class="timeline-narrative">${ev.narrative[`summary_${lang}`] || ev.narrative.summary_ms}</p>

          ${mawlidDiffBadge}

          <div class="card-footer-actions">
            <button class="btn btn-sm btn-outline view-narrative-btn" data-event-id="${ev.id}">
              📖 ${i18n.t("timeline.readNarrative")}
            </button>
            ${ev.date.jdn ? `
              <button class="btn btn-sm btn-outline view-in-cal-btn" data-jdn="${ev.date.jdn}">
                📅 ${i18n.t("timeline.viewInCalendar")}
              </button>
            ` : ""}
          </div>
        </div>
      </div>
      ${connectorHtml}
    `;
  }

  setupCardInteractiveActions() {
    const narrativeBtns = this.container.querySelectorAll(".view-narrative-btn");
    narrativeBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-event-id");
        this.openEventModal(id);
      });
    });

    const calBtns = this.container.querySelectorAll(".view-in-cal-btn");
    calBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        const jdn = parseInt(btn.getAttribute("data-jdn"), 10);
        if (this.onSelectDateForCalendar) {
          this.onSelectDateForCalendar(jdn);
        }
      });
    });
  }

  openEventModal(eventId) {
    const ev = eventStore.getEventById(eventId);
    if (!ev) return;
    const lang = i18n.getLang();

    const modal = document.getElementById("event-detail-modal");
    const modalBody = document.getElementById("event-modal-body");
    if (!modal || !modalBody) return;

    modalBody.innerHTML = `
      <div class="modal-event-detail">
        <div class="modal-header-chips">
          <span class="chip chip-gold">${ev.date.display_date[lang] || ev.date.display_date.ms}</span>
          ${ev.date.elephant_era ? `<span class="chip chip-blue">${ev.date.elephant_era.label}</span>` : ""}
          ${ev.date.weekday ? `<span class="chip chip-green">${ev.date.weekday}</span>` : ""}
        </div>

        <h2 class="modal-title">${ev.title[lang] || ev.title.ms}</h2>
        <div class="modal-title-ar" dir="rtl">${ev.title.ar}</div>

        <div class="modal-concordance-box">
          <h4>Penyelarasan Pelbagai Sistem Kalendar:</h4>
          <ul>
            <li><strong>Taqwim Hijri / Pra-Hijrah:</strong> ${ev.date.hijri_display || "-"}</li>
            <li><strong>Era Tahun Gajah ('Am al-Fil):</strong> ${ev.date.elephant_era ? ev.date.elephant_era.label : "-"}</li>
            <li><strong>Taqwim Iskandar (Seleucid):</strong> ${ev.date.seleucid_alexander || "-"}</li>
            <li><strong>Taqwim Nabonassar:</strong> ${ev.date.nabonassar || "-"}</li>
            <li><strong>Taqwim Yahudi (Anno Mundi):</strong> ${ev.date.jewish_am || "-"}</li>
            <li><strong>Pemerintahan Parsi Sasanian:</strong> ${ev.date.persian_regnal || "-"}</li>
            <li><strong>Julian Day Number (JDN):</strong> ${ev.date.jdn || "-"}</li>
          </ul>
        </div>

        <div class="modal-full-narrative">
          <h4>Naratif Lengkap & Analisis Sejarah:</h4>
          <p>${ev.narrative[`summary_${lang}`] || ev.narrative.summary_ms}</p>
        </div>

        ${ev.narrative.quran_refs && ev.narrative.quran_refs.length > 0 ? `
          <div class="modal-quran-box">
            <h4>📖 Ayat Al-Quran Berkaitan:</h4>
            <div class="quran-ref-badges">
              ${ev.narrative.quran_refs.map(ref => `<span class="quran-badge">Surah ${ref}</span>`).join("")}
            </div>
          </div>
        ` : ""}

        ${ev.narrative.hadith_refs && ev.narrative.hadith_refs.length > 0 ? `
          <div class="modal-hadith-box">
            <h4>📜 Hadis & Riwayat Berkaitan:</h4>
            <ul>
              ${ev.narrative.hadith_refs.map(ref => `<li>${ref}</li>`).join("")}
            </ul>
          </div>
        ` : ""}

        <div class="modal-source-box">
          <strong>Sumber & Rujukan Penyelidikan:</strong> ${ev.narrative.classical_source || "-"}
        </div>
      </div>
    `;

    modal.classList.add("is-active");
  }
}
