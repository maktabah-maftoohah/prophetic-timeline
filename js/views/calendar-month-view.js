/**
 * Prophetic Timeline - Google Calendar-Style Month View
 * Interactive grid supporting multiple calendar drivers: Hijri (default), Elephant Era, Julian, Gregorian.
 */

import {
  julianToJDN,
  jdnToJulian,
  jdnToHijri,
  jdnToElephantEra,
  getMultiCalendarSnapshot,
  HIJRI_MONTH_NAMES,
  WEEKDAY_NAMES,
  getMonthName,
  MAWLID_JDN,
  getWeekday
} from "../core/calendar-engine.js";
import { eventStore } from "../core/event-store.js";
import { i18n } from "../core/i18n.js";

export class CalendarMonthView {
  constructor(containerId, onDayClick = null) {
    this.container = document.getElementById(containerId);
    this.onDayClick = onDayClick;

    // Current viewing center (defaults to Mawlid: April 571 CE / Rabi' al-Awwal 53 BH)
    this.currentYear = 571;
    this.currentMonth = 4; // April
    this.primarySystem = "hijri"; // 'hijri' | 'elephant_era' | 'julian' | 'gregorian'
  }

  jumpToJDN(jdn) {
    const julian = jdnToJulian(jdn);
    this.currentYear = julian.year;
    this.currentMonth = julian.month;
    this.render();
  }

  render() {
    if (!this.container) return;
    const lang = i18n.getLang();

    // Calculate center day JDN (15th of the current month)
    const midJdn = julianToJDN(this.currentYear, this.currentMonth, 15);
    const snap = getMultiCalendarSnapshot(midJdn, lang);

    let displayTitle = "";
    if (this.primarySystem === "hijri") {
      displayTitle = `${snap.hijri.monthName} ${snap.hijri.year} ${snap.hijri.yearType} (${snap.hijri.archaicMonthName})`;
    } else if (this.primarySystem === "elephant_era") {
      displayTitle = `${snap.elephantEra.label} • Bulan ${snap.hijri.monthName}`;
    } else {
      displayTitle = `${getMonthName(this.currentMonth, lang, "julian")} ${this.currentYear} M (Julian)`;
    }

    this.container.innerHTML = `
      <div class="calendar-wrapper">
        <!-- Top Toolbar -->
        <div class="calendar-toolbar">
          <div class="cal-nav-left">
            <button id="cal-prev-btn" class="btn btn-sm btn-outline">◀ ${i18n.t("calendar.prevMonth")}</button>
            <button id="cal-today-btn" class="btn btn-sm btn-primary">⭐ Mawlid (571 M)</button>
            <button id="cal-next-btn" class="btn btn-sm btn-outline">${i18n.t("calendar.nextMonth")} ▶</button>
          </div>

          <div class="cal-title-center">
            <h2 class="cal-header-title">${displayTitle}</h2>
            <div class="cal-header-sub">
              Julian: ${getMonthName(this.currentMonth, lang, "julian")} ${this.currentYear} • Hijri: ${snap.hijri.monthName} ${snap.hijri.year} ${snap.hijri.yearType}
            </div>
          </div>

          <div class="cal-nav-right">
            <div class="system-selector">
              <label>${i18n.t("calendar.primaryCalendar")}</label>
              <select id="cal-system-select" class="form-control form-control-sm">
                <option value="hijri" ${this.primarySystem === "hijri" ? "selected" : ""}>Taqwim Hijri (AH / BH)</option>
                <option value="elephant_era" ${this.primarySystem === "elephant_era" ? "selected" : ""}>Tahun Gajah (1–63)</option>
                <option value="julian" ${this.primarySystem === "julian" ? "selected" : ""}>Masihi Julian</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Quick Jump Presets -->
        <div class="quick-jump-presets">
          <span class="preset-label">Lompat Pantas:</span>
          <button class="cal-preset-pill" data-y="571" data-m="2">Tahun Gajah (Feb 571)</button>
          <button class="cal-preset-pill" data-y="571" data-m="4">Mawlid (Apr 571)</button>
          <button class="cal-preset-pill" data-y="610" data-m="2">Bi'thah (Feb 610)</button>
          <button class="cal-preset-pill" data-y="622" data-m="9">Hijrah (Sep 622)</button>
          <button class="cal-preset-pill" data-y="625" data-m="11">Gerhana Bulan 4 H (Nov 625)</button>
          <button class="cal-preset-pill" data-y="632" data-m="1">Gerhana Suria 10 H (Jan 632)</button>
          <button class="cal-preset-pill" data-y="632" data-m="3">Haji Wada' (Mac 632)</button>
          <button class="cal-preset-pill" data-y="632" data-m="6">Kewafatan Nabi (Jun 632)</button>
        </div>

        <!-- Calendar Month Grid -->
        <div class="calendar-grid-container">
          <div class="weekday-header-row">
            ${WEEKDAY_NAMES[lang].map(d => `<div class="weekday-header-cell">${d}</div>`).join("")}
          </div>
          <div class="days-grid" id="days-grid-body">
            <!-- Rendered by generateDaysGrid -->
          </div>
        </div>
      </div>
    `;

    this.setupListeners();
    this.renderDaysGrid();
  }

  setupListeners() {
    const prevBtn = document.getElementById("cal-prev-btn");
    const nextBtn = document.getElementById("cal-next-btn");
    const todayBtn = document.getElementById("cal-today-btn");
    const systemSelect = document.getElementById("cal-system-select");
    const presets = this.container.querySelectorAll(".cal-preset-pill");

    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        this.currentMonth -= 1;
        if (this.currentMonth < 1) {
          this.currentMonth = 12;
          this.currentYear -= 1;
        }
        this.render();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        this.currentMonth += 1;
        if (this.currentMonth > 12) {
          this.currentMonth = 1;
          this.currentYear += 1;
        }
        this.render();
      });
    }

    if (todayBtn) {
      todayBtn.addEventListener("click", () => {
        this.currentYear = 571;
        this.currentMonth = 4;
        this.render();
      });
    }

    if (systemSelect) {
      systemSelect.addEventListener("change", (e) => {
        this.primarySystem = e.target.value;
        this.render();
      });
    }

    presets.forEach(p => {
      p.addEventListener("click", () => {
        this.currentYear = parseInt(p.getAttribute("data-y"), 10);
        this.currentMonth = parseInt(p.getAttribute("data-m"), 10);
        this.render();
      });
    });
  }

  renderDaysGrid() {
    const gridBody = document.getElementById("days-grid-body");
    if (!gridBody) return;

    const lang = i18n.getLang();

    // First day of current Julian month
    const firstDayJdn = julianToJDN(this.currentYear, this.currentMonth, 1);
    const firstWeekday = getWeekday(firstDayJdn); // 0=Sunday, 1=Monday...

    // Determine number of days in this Julian month
    // In Julian: 572 was leap year (572 % 4 == 0), 571 was not
    let daysInMonth = 31;
    if (this.currentMonth === 2) {
      daysInMonth = (this.currentYear % 4 === 0) ? 29 : 28;
    } else if ([4, 6, 9, 11].includes(this.currentMonth)) {
      daysInMonth = 30;
    }

    let cellsHtml = "";

    // Empty lead cells for previous month padding
    for (let i = 0; i < firstWeekday; i++) {
      const prevPadJdn = firstDayJdn - (firstWeekday - i);
      const prevPadSnap = getMultiCalendarSnapshot(prevPadJdn, lang);
      let padPrimary = prevPadSnap.julian.day;
      let padSub = `${prevPadSnap.hijri.day} ${prevPadSnap.hijri.monthName.slice(0, 3)}`;

      if (this.primarySystem === "hijri") {
        padPrimary = prevPadSnap.hijri.day;
        padSub = `${prevPadSnap.julian.day} ${getMonthName(prevPadSnap.julian.month, lang, "julian").slice(0, 3)}`;
      } else if (this.primarySystem === "elephant_era") {
        padPrimary = prevPadSnap.hijri.day;
        padSub = `Thn ${prevPadSnap.elephantEra.year}`;
      }

      cellsHtml += `
        <div class="calendar-day-cell pad-cell" data-jdn="${prevPadJdn}">
          <div class="day-number-bar">
            <span class="day-num">${padPrimary}</span>
            <span class="day-sub">${padSub}</span>
          </div>
        </div>
      `;
    }

    // Days of current month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayJdn = julianToJDN(this.currentYear, this.currentMonth, day);
      const snap = getMultiCalendarSnapshot(dayJdn, lang);
      const eventsOnDay = eventStore.getEventsByJDN(dayJdn);

      const isMawlid = dayJdn === MAWLID_JDN;
      let cellClasses = "calendar-day-cell";
      if (isMawlid) cellClasses += " cell-mawlid";
      if (eventsOnDay.length > 0) cellClasses += " has-events";

      // Subscript date depending on primary system
      let primaryNum = day;
      let secondarySub = `${snap.hijri.day} ${snap.hijri.monthName.slice(0, 3)}`;

      if (this.primarySystem === "hijri") {
        primaryNum = snap.hijri.day;
        secondarySub = `${day} ${getMonthName(this.currentMonth, lang, "julian").slice(0, 3)}`;
      } else if (this.primarySystem === "elephant_era") {
        primaryNum = snap.hijri.day;
        secondarySub = `Thn ${snap.elephantEra.year}`;
      }

      cellsHtml += `
        <div class="${cellClasses}" data-jdn="${dayJdn}">
          <div class="day-number-bar">
            <span class="day-num">${primaryNum}</span>
            <span class="day-sub">${secondarySub}</span>
          </div>

          <div class="cell-event-chips">
            ${eventsOnDay.map(ev => `
              <div class="event-chip ${ev.category}" title="${ev.title[lang] || ev.title.ms}">
                ${ev.title[lang] || ev.title.ms}
              </div>
            `).join("")}
          </div>
        </div>
      `;
    }

    // Trailing pad cells to complete the last week row
    const totalRendered = firstWeekday + daysInMonth;
    const trailingPads = (7 - (totalRendered % 7)) % 7;
    for (let j = 1; j <= trailingPads; j++) {
      const nextPadJdn = julianToJDN(this.currentYear, this.currentMonth, daysInMonth) + j;
      const nextPadSnap = getMultiCalendarSnapshot(nextPadJdn, lang);
      let padPrimary = nextPadSnap.julian.day;
      let padSub = `${nextPadSnap.hijri.day} ${nextPadSnap.hijri.monthName.slice(0, 3)}`;

      if (this.primarySystem === "hijri") {
        padPrimary = nextPadSnap.hijri.day;
        padSub = `${nextPadSnap.julian.day} ${getMonthName(nextPadSnap.julian.month, lang, "julian").slice(0, 3)}`;
      } else if (this.primarySystem === "elephant_era") {
        padPrimary = nextPadSnap.hijri.day;
        padSub = `Thn ${nextPadSnap.elephantEra.year}`;
      }

      cellsHtml += `
        <div class="calendar-day-cell pad-cell" data-jdn="${nextPadJdn}">
          <div class="day-number-bar">
            <span class="day-num">${padPrimary}</span>
            <span class="day-sub">${padSub}</span>
          </div>
        </div>
      `;
    }

    gridBody.innerHTML = cellsHtml;

    // Attach click events
    const dayCells = gridBody.querySelectorAll(".calendar-day-cell");
    dayCells.forEach(cell => {
      cell.addEventListener("click", () => {
        const jdn = parseInt(cell.getAttribute("data-jdn"), 10);
        this.openDayDetail(jdn);
      });
    });
  }

  openDayDetail(jdn) {
    const lang = i18n.getLang();
    const snap = getMultiCalendarSnapshot(jdn, lang);
    const eventsOnDay = eventStore.getEventsByJDN(jdn);

    const modal = document.getElementById("event-detail-modal");
    const modalBody = document.getElementById("event-modal-body");
    if (!modal || !modalBody) return;

    modalBody.innerHTML = `
      <div class="modal-day-detail">
        <div class="modal-header-chips">
          <span class="chip chip-gold">${snap.weekdayName}</span>
          <span class="chip chip-blue">JDN: ${snap.jdn}</span>
          ${snap.elephantEra.isValidEra ? `<span class="chip chip-green">${snap.elephantEra.label}</span>` : ""}
        </div>

        <h2 class="modal-title">${snap.julian.formatted}</h2>
        <div class="modal-title-ar" dir="rtl">${snap.hijri.formatted}</div>

        <div class="modal-concordance-box">
          <h4>${i18n.t("calendar.multiCalendarHeader")}:</h4>
          <div class="multi-cal-table">
            <div class="mcal-row"><span>Taqwim Hijri:</span><strong>${snap.hijri.formatted} (${snap.hijri.archaicMonthName})</strong></div>
            <div class="mcal-row"><span>Tahun Gajah:</span><strong>${snap.elephantEra.label}</strong></div>
            <div class="mcal-row"><span>Masihi (Julian):</span><strong>${snap.julian.formatted}</strong></div>
            <div class="mcal-row"><span>Masihi (Gregorian):</span><strong>${snap.gregorian.formatted}</strong></div>
            <div class="mcal-row"><span>Taqwim Iskandar:</span><strong>Tahun ${snap.alexanderYear} Iskandar</strong></div>
            <div class="mcal-row"><span>Taqwim Nabonassar:</span><strong>Tahun ${snap.nabonassarYear} Nabonassar</strong></div>
            <div class="mcal-row"><span>Taqwim Yahudi (AM):</span><strong>Tahun ${snap.jewishYear} Anno Mundi</strong></div>
            <div class="mcal-row"><span>Pemerintahan Parsi:</span><strong>${snap.persianRegnal || "-"}</strong></div>
            <div class="mcal-row"><span>Jarak dari Kelahiran:</span><strong>${snap.daysFromMawlid >= 0 ? `+${snap.daysFromMawlid.toLocaleString()} hari` : `${snap.daysFromMawlid.toLocaleString()} hari`}</strong></div>
          </div>
        </div>

        <div class="day-events-list">
          <h4>${i18n.t("calendar.eventsOnDay")}</h4>
          ${eventsOnDay.length > 0 ? eventsOnDay.map(ev => `
            <div class="day-event-item">
              <h5>${ev.title[lang] || ev.title.ms}</h5>
              <div class="event-ar" dir="rtl">${ev.title.ar}</div>
              <p>${ev.narrative[`summary_${lang}`] || ev.narrative.summary_ms}</p>
              <div class="event-source"><em>Sumber:</em> ${ev.narrative.classical_source || "-"}</div>
            </div>
          `).join("") : `<p class="no-events">${i18n.t("calendar.noEventsDay")}</p>`}
        </div>
      </div>
    `;

    modal.classList.add("is-active");
  }
}
