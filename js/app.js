/**
 * Prophetic Timeline - Main Application Entry Point
 * Vanilla ES6 module orchestrating views, i18n, event-store, and visualizers.
 */

import { eventStore } from "./core/event-store.js";
import { i18n } from "./core/i18n.js";
import { TimelineView } from "./views/timeline-view.js";
import { CalendarMonthView } from "./views/calendar-month-view.js";
import { CalendarYearView } from "./views/calendar-year-view.js";
import { EclipseSimulator } from "./visualizers/eclipse-sim.js";
import { ConjunctionSimulator } from "./visualizers/conjunction-sim.js";
import { DayCalculator } from "./visualizers/day-calculator.js";

class App {
  constructor() {
    this.activeTab = "timeline";
    this.timelineView = null;
    this.monthView = null;
    this.yearView = null;
    this.eclipseSim = null;
    this.conjunctionSim = null;
    this.dayCalc = null;
  }

  async init() {
    // 1. Load events dataset
    await eventStore.loadEvents("./data/events.json");

    // 2. Setup theme
    this.initTheme();

    // 3. Setup i18n & language selector
    this.initLanguage();

    // 4. Initialize views
    this.timelineView = new TimelineView(
      "view-timeline",
      (jdn) => {
        this.switchTab("calendarMonth");
        this.monthView.jumpToJDN(jdn);
      },
      (eventAId, eventBId) => {
        this.switchTab("calculator");
        if (this.dayCalc) {
          this.dayCalc.selectEvents(eventAId, eventBId);
        }
      }
    );

    this.monthView = new CalendarMonthView("view-calendar-month");
    this.yearView = new CalendarYearView("view-calendar-year", (year, month) => {
      this.monthView.currentYear = year;
      this.monthView.currentMonth = month;
      this.switchTab("calendarMonth");
    });

    this.eclipseSim = new EclipseSimulator("eclipse-sim-container");
    this.conjunctionSim = new ConjunctionSimulator("conjunction-sim-container");
    this.dayCalc = new DayCalculator("day-calculator-container");

    // 5. Setup navigation listeners
    this.setupTabNavigation();
    this.setupModalHandlers();

    // 6. Initial render of active tab
    this.renderActiveTab();

    // 7. Register Service Worker for offline PWA support
    this.registerServiceWorker();
  }

  initTheme() {
    const savedTheme = localStorage.getItem("prophetic_theme") || "dark";
    document.documentElement.setAttribute("data-theme", savedTheme);

    const themeToggleBtn = document.getElementById("theme-toggle-btn");
    if (themeToggleBtn) {
      themeToggleBtn.textContent = savedTheme === "dark" ? "☀️ Cerah" : "🌙 Gelap";
      themeToggleBtn.addEventListener("click", () => {
        const current = document.documentElement.getAttribute("data-theme");
        const next = current === "dark" ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", next);
        localStorage.setItem("prophetic_theme", next);
        themeToggleBtn.textContent = next === "dark" ? "☀️ Cerah" : "🌙 Gelap";
      });
    }
  }

  initLanguage() {
    const langSelect = document.getElementById("lang-select");
    if (langSelect) {
      langSelect.value = i18n.getLang();
      langSelect.addEventListener("change", (e) => {
        i18n.setLang(e.target.value);
        this.updateStaticI18nLabels();
        this.renderActiveTab();
      });
    }

    this.updateStaticI18nLabels();
  }

  updateStaticI18nLabels() {
    const titleEl = document.getElementById("header-title");
    const subEl = document.getElementById("header-subtitle");
    const tabTimeline = document.getElementById("tab-btn-timeline");
    const tabMonth = document.getElementById("tab-btn-month");
    const tabYear = document.getElementById("tab-btn-year");
    const tabVisualizer = document.getElementById("tab-btn-visualizer");
    const tabCalculator = document.getElementById("tab-btn-calculator");
    const tabProfile = document.getElementById("tab-btn-profile");

    if (titleEl) titleEl.textContent = i18n.t("appTitle");
    if (subEl) subEl.textContent = i18n.t("appSubtitle");
    if (tabTimeline) tabTimeline.textContent = `📜 ${i18n.t("tabs.timeline")}`;
    if (tabMonth) tabMonth.textContent = `📅 ${i18n.t("tabs.calendarMonth")}`;
    if (tabYear) tabYear.textContent = `🗓️ ${i18n.t("tabs.calendarYear")}`;
    if (tabVisualizer) tabVisualizer.textContent = `🪐 ${i18n.t("tabs.visualizer")}`;
    if (tabCalculator) tabCalculator.textContent = `🔢 ${i18n.t("tabs.calculator")}`;
    if (tabProfile) tabProfile.textContent = `👤 ${i18n.t("tabs.profile")}`;
  }

  setupTabNavigation() {
    const tabBtns = document.querySelectorAll(".tab-btn");
    tabBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        const tab = btn.getAttribute("data-tab");
        this.switchTab(tab);
      });
    });
  }

  switchTab(tabName) {
    this.activeTab = tabName;

    // Update tab button classes
    const tabBtns = document.querySelectorAll(".tab-btn");
    tabBtns.forEach(btn => {
      if (btn.getAttribute("data-tab") === tabName) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });

    // Update view containers visibility
    const views = document.querySelectorAll(".view-panel");
    views.forEach(v => {
      if (v.getAttribute("data-view") === tabName) {
        v.classList.add("active");
      } else {
        v.classList.remove("active");
      }
    });

    this.renderActiveTab();
  }

  renderActiveTab() {
    if (this.activeTab === "timeline") {
      this.timelineView.render();
    } else if (this.activeTab === "calendarMonth") {
      this.monthView.render();
    } else if (this.activeTab === "calendarYear") {
      this.yearView.render();
    } else if (this.activeTab === "visualizer") {
      this.eclipseSim.render();
      this.conjunctionSim.render();
    } else if (this.activeTab === "calculator") {
      this.dayCalc.render();
    }
  }

  setupModalHandlers() {
    const modal = document.getElementById("event-detail-modal");
    const closeBtn = document.getElementById("modal-close-btn");
    const backdrop = document.getElementById("modal-backdrop");

    const closeModal = () => {
      if (modal) modal.classList.remove("is-active");
    };

    if (closeBtn) closeBtn.addEventListener("click", closeModal);
    if (backdrop) backdrop.addEventListener("click", closeModal);

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeModal();
    });
  }

  registerServiceWorker() {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("./sw.js").catch(err => {
        console.warn("SW registration skipped:", err);
      });
    }
  }
}

// Bootstrap application on DOM ready
document.addEventListener("DOMContentLoaded", () => {
  const app = new App();
  app.init().catch(console.error);
});
