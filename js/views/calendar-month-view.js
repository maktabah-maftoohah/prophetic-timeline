/**
 * Prophetic Timeline - Google Calendar-Style Month View
 * Interactive grid supporting multiple calendar drivers: Hijri (default), Elephant Era, Julian.
 * Fully synchronized with Mahmoud Pasha al-Falaki's astronomical and historical determinations.
 */

import {
  julianToJDN,
  jdnToJulian,
  jdnToHijri,
  hijriToJDN,
  getDaysInHijriMonth,
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

    // Current viewing center (defaults to Mawlid: 9 Rabi' al-Awwal 53 BH / 20 April 571 CE)
    this.currentYear = 571;
    this.currentMonth = 4; // April
    this.hijriYear = 53;
    this.hijriMonth = 3; // Rabi' al-Awwal
    this.hijriIsBH = true;
    this.primarySystem = "hijri"; // 'hijri' | 'elephant_era' | 'julian'
  }

  jumpToJDN(jdn) {
    const julian = jdnToJulian(jdn);
    this.currentYear = julian.year;
    this.currentMonth = julian.month;

    const hijri = jdnToHijri(jdn);
    this.hijriYear = hijri.year;
    this.hijriMonth = hijri.month;
    this.hijriIsBH = hijri.isBH;

    this.render();
  }

  render() {
    if (!this.container) return;
    const lang = i18n.getLang();
    const isHijriDriver = (this.primarySystem === "hijri" || this.primarySystem === "elephant_era");

    let displayTitle = "";
    let subTitle = "";

    if (isHijriDriver) {
      const startJdn = hijriToJDN(this.hijriYear, this.hijriMonth, 1, this.hijriIsBH);
      const snapStart = getMultiCalendarSnapshot(startJdn, lang);
      const daysInMonth = getDaysInHijriMonth(this.hijriYear, this.hijriMonth, this.hijriIsBH);
      const endJdn = startJdn + daysInMonth - 1;
      const snapEnd = getMultiCalendarSnapshot(endJdn, lang);

      const archaicText = snapStart.hijri.archaicMonthName ? ` • ${snapStart.hijri.archaicMonthName}` : "";

      if (this.primarySystem === "hijri") {
        displayTitle = `${snapStart.hijri.monthName} ${this.hijriYear} ${this.hijriIsBH ? "BH" : "AH"}${archaicText}`;
      } else {
        displayTitle = `${snapStart.elephantEra.label} • Bulan ${snapStart.hijri.monthName}`;
      }

      subTitle = `Julian: ${snapStart.julian.day} ${getMonthName(snapStart.julian.month, lang, "julian")} ${snapStart.julian.year} – ${snapEnd.julian.day} ${getMonthName(snapEnd.julian.month, lang, "julian")} ${snapEnd.julian.year} M • ${snapStart.elephantEra.label}`;
    } else {
      const startJdn = julianToJDN(this.currentYear, this.currentMonth, 1);
      const snapStart = getMultiCalendarSnapshot(startJdn, lang);
      let daysInMonth = 31;
      if (this.currentMonth === 2) {
        daysInMonth = (this.currentYear % 4 === 0) ? 29 : 28;
      } else if ([4, 6, 9, 11].includes(this.currentMonth)) {
        daysInMonth = 30;
      }
      const endJdn = startJdn + daysInMonth - 1;
      const snapEnd = getMultiCalendarSnapshot(endJdn, lang);

      displayTitle = `${getMonthName(this.currentMonth, lang, "julian")} ${this.currentYear} M (Julian)`;
      subTitle = `Hijri: ${snapStart.hijri.monthName} ${snapStart.hijri.year} ${snapStart.hijri.yearType} – ${snapEnd.hijri.monthName} ${snapEnd.hijri.year} ${snapEnd.hijri.yearType} • ${snapStart.elephantEra.label}`;
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
            <div class="cal-header-sub">${subTitle}</div>
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
          <button class="cal-preset-pill" data-jdn="1929669">Tahun Gajah (Feb 571)</button>
          <button class="cal-preset-pill" data-jdn="1929725">Mawlid (Apr 571)</button>
          <button class="cal-preset-pill" data-jdn="1943900">Bi'thah (Feb 610)</button>
          <button class="cal-preset-pill" data-jdn="1948506">Hijrah (Sep 622)</button>
          <button class="cal-preset-pill" data-jdn="1949663">Gerhana Bulan 4 H (Nov 625)</button>
          <button class="cal-preset-pill" data-jdn="1951922">Gerhana Suria 10 H (Jan 632)</button>
          <button class="cal-preset-pill" data-jdn="1951961">Haji Wada' (Mac 632)</button>
          <button class="cal-preset-pill" data-jdn="1952055">Kewafatan Nabi (Jun 632)</button>
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
        if (this.primarySystem === "hijri" || this.primarySystem === "elephant_era") {
          this.hijriMonth -= 1;
          if (this.hijriMonth < 1) {
            this.hijriMonth = 12;
            if (this.hijriIsBH) {
              this.hijriYear += 1;
            } else {
              if (this.hijriYear === 1) {
                this.hijriYear = 1;
                this.hijriIsBH = true;
              } else {
                this.hijriYear -= 1;
              }
            }
          }
          const midJdn = hijriToJDN(this.hijriYear, this.hijriMonth, 15, this.hijriIsBH);
          const j = jdnToJulian(midJdn);
          this.currentYear = j.year;
          this.currentMonth = j.month;
        } else {
          this.currentMonth -= 1;
          if (this.currentMonth < 1) {
            this.currentMonth = 12;
            this.currentYear -= 1;
          }
          const midJdn = julianToJDN(this.currentYear, this.currentMonth, 15);
          const h = jdnToHijri(midJdn);
          this.hijriYear = h.year;
          this.hijriMonth = h.month;
          this.hijriIsBH = h.isBH;
        }
        this.render();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        if (this.primarySystem === "hijri" || this.primarySystem === "elephant_era") {
          this.hijriMonth += 1;
          if (this.hijriMonth > 12) {
            this.hijriMonth = 1;
            if (this.hijriIsBH) {
              if (this.hijriYear === 1) {
                this.hijriYear = 1;
                this.hijriIsBH = false;
              } else {
                this.hijriYear -= 1;
              }
            } else {
              this.hijriYear += 1;
            }
          }
          const midJdn = hijriToJDN(this.hijriYear, this.hijriMonth, 15, this.hijriIsBH);
          const j = jdnToJulian(midJdn);
          this.currentYear = j.year;
          this.currentMonth = j.month;
        } else {
          this.currentMonth += 1;
          if (this.currentMonth > 12) {
            this.currentMonth = 1;
            this.currentYear += 1;
          }
          const midJdn = julianToJDN(this.currentYear, this.currentMonth, 15);
          const h = jdnToHijri(midJdn);
          this.hijriYear = h.year;
          this.hijriMonth = h.month;
          this.hijriIsBH = h.isBH;
        }
        this.render();
      });
    }

    if (todayBtn) {
      todayBtn.addEventListener("click", () => {
        this.jumpToJDN(MAWLID_JDN);
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
        const jdn = parseInt(p.getAttribute("data-jdn"), 10);
        if (jdn) {
          this.jumpToJDN(jdn);
        }
      });
    });
  }

  renderDaysGrid() {
    const gridBody = document.getElementById("days-grid-body");
    if (!gridBody) return;

    const lang = i18n.getLang();
    const isHijriDriver = (this.primarySystem === "hijri" || this.primarySystem === "elephant_era");

    let firstDayJdn = 0;
    let daysInMonth = 30;

    if (isHijriDriver) {
      firstDayJdn = hijriToJDN(this.hijriYear, this.hijriMonth, 1, this.hijriIsBH);
      daysInMonth = getDaysInHijriMonth(this.hijriYear, this.hijriMonth, this.hijriIsBH);
    } else {
      firstDayJdn = julianToJDN(this.currentYear, this.currentMonth, 1);
      if (this.currentMonth === 2) {
        daysInMonth = (this.currentYear % 4 === 0) ? 29 : 28;
      } else if ([4, 6, 9, 11].includes(this.currentMonth)) {
        daysInMonth = 30;
      } else {
        daysInMonth = 31;
      }
    }

    const firstWeekday = getWeekday(firstDayJdn); // 0=Sunday, 1=Monday...
    let cellsHtml = "";

    // Empty lead cells for previous month padding
    for (let i = 0; i < firstWeekday; i++) {
      const prevPadJdn = firstDayJdn - (firstWeekday - i);
      const prevPadSnap = getMultiCalendarSnapshot(prevPadJdn, lang);
      const padPrimary = isHijriDriver ? prevPadSnap.hijri.day : prevPadSnap.julian.day;
      const padSub = isHijriDriver
        ? `${prevPadSnap.julian.day} ${getMonthName(prevPadSnap.julian.month, lang, "julian").slice(0, 3)}`
        : `${prevPadSnap.hijri.day} ${prevPadSnap.hijri.monthName.slice(0, 3)}`;

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
      const dayJdn = firstDayJdn + (day - 1);
      const snap = getMultiCalendarSnapshot(dayJdn, lang);
      const eventsOnDay = eventStore.getEventsByJDN(dayJdn);

      const isMawlid = dayJdn === MAWLID_JDN;
      let cellClasses = "calendar-day-cell";
      if (isMawlid) cellClasses += " cell-mawlid";
      if (eventsOnDay.length > 0) cellClasses += " has-events";

      const primaryNum = day;
      const secondarySub = isHijriDriver
        ? `${snap.julian.day} ${getMonthName(snap.julian.month, lang, "julian").slice(0, 3)}`
        : `${snap.hijri.day} ${snap.hijri.monthName.slice(0, 3)}`;

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
      const nextPadJdn = firstDayJdn + daysInMonth - 1 + j;
      const nextPadSnap = getMultiCalendarSnapshot(nextPadJdn, lang);
      const padPrimary = isHijriDriver ? nextPadSnap.hijri.day : nextPadSnap.julian.day;
      const padSub = isHijriDriver
        ? `${nextPadSnap.julian.day} ${getMonthName(nextPadSnap.julian.month, lang, "julian").slice(0, 3)}`
        : `${nextPadSnap.hijri.day} ${nextPadSnap.hijri.monthName.slice(0, 3)}`;

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
        <div class="modal-title-ar" dir="rtl">${snap.hijri.formattedAr}</div>
        <div class="modal-title-sub">${snap.hijri.formatted}</div>

        <div class="modal-concordance-box">
          <h4>${i18n.t("calendar.multiCalendarHeader")}:</h4>
          <div class="multi-cal-table">
            <div class="mcal-row"><span>Taqwim Hijri:</span><strong>${snap.hijri.formatted}${snap.hijri.archaicMonthName ? ` • ${snap.hijri.archaicMonthName}` : ""}</strong></div>
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
              ${ev.narrative.hadith_refs && ev.narrative.hadith_refs.length > 0 ? `
                <div class="event-hadith-refs" style="margin-top: 0.35rem; font-size: 0.85rem;">
                  <strong>Hadis:</strong> ${ev.narrative.hadith_refs.map(ref => {
                    const match = ref.match(/Sahih al-Bukhari[^\d]*(\d+)/i);
                    if (match) {
                      return `<a href="https://maktabah-maftoohah.github.io/sahih-al-bukhari/${match[1]}" target="_blank" rel="noopener noreferrer" class="hadith-link">${ref} ↗</a>`;
                    }
                    return ref;
                  }).join(", ")}
                </div>
              ` : ""}
              <div class="event-source"><em>Sumber:</em> ${ev.narrative.classical_source || "-"}</div>
            </div>
          `).join("") : `<p class="no-events">${i18n.t("calendar.noEventsDay")}</p>`}
        </div>
      </div>
    `;

    modal.classList.add("is-active");
  }
}
