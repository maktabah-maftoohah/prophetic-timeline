/**
 * Prophetic Timeline - "Falak Chrono-Navigator" Timeline View
 * Professional & interactive multi-era visualizer featuring:
 * 1. Sticky interactive era scrubber ribbon (minimap with milestones & scrollspy)
 * 2. Dual view modes: Narrative Stream vs. Proportional Chrono Scale
 * 3. Interactive category & era filter chips with live counts
 * 4. Inline Astronomical Time-Delta Inspector (two-point comparator)
 * 5. Islamic glassmorphic cards with 7-calendar concordance and astronomical badges
 * 6. Full trilingual & Arabic RTL typography support
 */

import { eventStore } from "../core/event-store.js";
import { i18n } from "../core/i18n.js";

// Key milestone pips for the interactive scrubber ribbon
// Alternating 'above' and 'below' with sufficient horizontal clearance so pips NEVER overlap
const SCRUBBER_MILESTONES = [
  { id: "ancient-epochs-section", label: { ms: "Purba", en: "Ancient", ar: "القديمة" }, year: "3761 SM", era: "ancient", icon: "🏺", posPercent: 3.5, side: "above" },
  { id: "event-node-elephant-expedition-571", label: { ms: "Tahun Gajah", en: "Elephant", ar: "الفيل" }, year: "571 M", era: "elephant", icon: "🐘", posPercent: 14.5, side: "below" },
  { id: "event-node-prophet-birth-mawlid", label: { ms: "Mawlid", en: "Mawlid", ar: "المولد" }, year: "571 M", era: "mawlid", icon: "🌟", posPercent: 23.5, side: "above" },
  { id: "event-node-al-bithah-first-revelation", label: { ms: "Bi'thah (Wahyu)", en: "Bi'thah", ar: "المبعث" }, year: "610 M", era: "makkah", icon: "📖", posPercent: 44.0, side: "below" },
  { id: "event-node-hijrah-entry-quba-medina", label: { ms: "Hijrah", en: "Hijrah", ar: "الهجرة" }, year: "622 M", era: "madinah", icon: "🌴", posPercent: 63.5, side: "above" },
  { id: "event-node-conquest-of-mecca-8ah", label: { ms: "Fath Makkah", en: "Conquest", ar: "فتح مكة" }, year: "630 M", era: "madinah", icon: "🕋", posPercent: 77.5, side: "below" },
  { id: "event-node-death-of-ibrahim-solar-eclipse", label: { ms: "Gerhana Madinah", en: "Eclipse", ar: "الكسوف" }, year: "632 M", era: "madinah", icon: "🌑", posPercent: 87.5, side: "above" },
  { id: "event-node-prophet-passing-wafat", label: { ms: "Wafat", en: "Passing", ar: "الوفاة" }, year: "632 M", era: "wafat", icon: "🕊️", posPercent: 96.5, side: "below" }
];

export class TimelineView {
  constructor(containerId, onSelectDateForCalendar = null, onSelectEventsForCalculator = null) {
    this.container = document.getElementById(containerId);
    this.onSelectDateForCalendar = onSelectDateForCalendar;
    this.onSelectEventsForCalculator = onSelectEventsForCalculator;

    // View state
    this.activeCategory = "all";
    this.searchQuery = "";
    this.viewMode = "story"; // "story" (Narrative Stream) | "chrono" (Proportional Chrono Scale)
    this.showComparator = false;
    this.compareA = "prophet-birth-mawlid";
    this.compareB = "prophet-passing-wafat";
    this.activeScrubberPip = "event-node-prophet-birth-mawlid";
    this.scrollObserver = null;
  }

  render() {
    if (!this.container) return;
    const lang = i18n.getLang();
    const allEvents = eventStore.getAllEvents();

    // Compute category counts for chips
    const counts = {
      all: allEvents.length,
      astronomical_anchor: allEvents.filter(e => e.category === "astronomical_anchor").length,
      ancient_epoch: allEvents.filter(e => e.category === "ancient_epoch").length,
      elephant_mawlid: allEvents.filter(e => e.category === "mawlid" || e.category === "pre_mawlid_seerah" || e.category === "prophetic_childhood").length,
      makkah: allEvents.filter(e => e.category === "prophetic_mission").length,
      madinah: allEvents.filter(e => e.category === "madinan_era").length,
      wafat: allEvents.filter(e => e.category === "wafat_and_after").length
    };

    this.container.innerHTML = `
      <div class="falak-timeline-wrapper">
        <!-- 1. Sticky Interactive Era Scrubber Ribbon -->
        ${this.renderScrubber(lang)}

        <!-- 2. Interactive Controls & View Mode Bar -->
        ${this.renderControlsBar(lang)}

        <!-- 3. Category & Era Filter Chips -->
        ${this.renderFilterChips(lang, counts)}

        <!-- 4. Inline Astronomical Time-Delta Inspector (Drawer) -->
        ${this.renderComparatorDrawer(lang)}

        <!-- 5. Main Timeline Content Area -->
        <div id="timeline-content-area" class="timeline-container timeline-mode-${this.viewMode}">
          <!-- Rendered dynamically -->
        </div>
      </div>
    `;

    this.setupListeners();
    this.renderTimelineNodes();
    this.setupScrollSpy();
  }

  renderScrubber(lang) {
    return `
      <div class="timeline-scrubber-wrapper">
        <div class="scrubber-header">
          <div class="scrubber-title-group">
            <span class="scrubber-icon">🧭</span>
            <strong>${i18n.t("timeline.scrubberTitle")}</strong>
            <span class="scrubber-scroll-hint">${i18n.t("timeline.scrollHint")}</span>
          </div>
          <div class="scrubber-header-actions">
            <div class="scrubber-legend">
              <span class="legend-dot dot-ancient"></span> ${i18n.t("timeline.eraAncient")}
              <span class="legend-dot dot-elephant"></span> ${i18n.t("timeline.eraElephant")}
              <span class="legend-dot dot-makkah"></span> ${i18n.t("timeline.eraMakkah")}
              <span class="legend-dot dot-madinah"></span> ${i18n.t("timeline.eraMadinah")}
              <span class="legend-dot dot-wafat"></span> ${i18n.t("timeline.eraPassing")}
            </div>
            <div class="scrubber-nav-arrows">
              <button class="scrubber-nav-btn" id="scrubber-scroll-left" title="Skrol ke kiri" aria-label="Skrol ke kiri">&lsaquo;</button>
              <button class="scrubber-nav-btn" id="scrubber-scroll-right" title="Skrol ke kanan" aria-label="Skrol ke kanan">&rsaquo;</button>
            </div>
          </div>
        </div>

        <div class="scrubber-viewport-container">
          <div class="scrubber-scroll-viewport" id="scrubber-scroll-viewport">
            <div class="scrubber-track-canvas" id="scrubber-track-canvas">
              <!-- Center Colored Era Track -->
              <div class="scrubber-era-track">
                <div class="era-seg seg-ancient" style="width: 9%;" title="${i18n.t("timeline.eraAncient")}"></div>
                <div class="era-seg seg-elephant" style="width: 23%;" title="${i18n.t("timeline.eraElephant")}"></div>
                <div class="era-seg seg-makkah" style="width: 22%;" title="${i18n.t("timeline.eraMakkah")}"></div>
                <div class="era-seg seg-madinah" style="width: 38%;" title="${i18n.t("timeline.eraMadinah")}"></div>
                <div class="era-seg seg-wafat" style="width: 8%;" title="${i18n.t("timeline.eraPassing")}"></div>
              </div>

              <!-- Active Needle on Track -->
              <div class="scrubber-needle" id="scrubber-needle" style="left: 23.5%;"></div>

              <!-- Milestone Nodes Layer (Pips above and below track with connecting stems) -->
              <div class="scrubber-milestones-layer">
                ${SCRUBBER_MILESTONES.map(m => {
                  const labelText = m.label[lang] || m.label.ms;
                  return `
                    <div class="scrubber-milestone-node node-${m.side} node-${m.era}" 
                      id="milestone-node-${m.id}" 
                      style="left: ${m.posPercent}%;">
                      
                      ${m.side === "above" ? `
                        <button class="scrubber-pip pip-${m.era}" 
                          data-target="${m.id}" 
                          title="${m.icon} ${labelText} (${m.year})"
                          aria-label="${labelText} ${m.year}">
                          <span class="pip-icon">${m.icon}</span>
                          <span class="pip-label">${labelText}</span>
                          <span class="pip-year">${m.year}</span>
                        </button>
                        <div class="pip-stem"></div>
                        <div class="pip-pin-dot"></div>
                      ` : `
                        <div class="pip-pin-dot"></div>
                        <div class="pip-stem"></div>
                        <button class="scrubber-pip pip-${m.era}" 
                          data-target="${m.id}" 
                          title="${m.icon} ${labelText} (${m.year})"
                          aria-label="${labelText} ${m.year}">
                          <span class="pip-icon">${m.icon}</span>
                          <span class="pip-label">${labelText}</span>
                          <span class="pip-year">${m.year}</span>
                        </button>
                      `}
                    </div>
                  `;
                }).join("")}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderControlsBar(lang) {
    return `
      <div class="timeline-controls-bar">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input type="text" id="timeline-search" placeholder="${i18n.t("timeline.searchPlaceholder")}" value="${this.searchQuery}" class="form-control" autocomplete="off">
          ${this.searchQuery ? `<button id="clear-search-btn" class="clear-search-btn" title="Padam">&times;</button>` : ""}
        </div>

        <div class="timeline-view-switcher">
          <span class="switcher-label">${i18n.t("timeline.viewMode")}</span>
          <div class="btn-group-toggle" role="group">
            <button class="toggle-btn ${this.viewMode === "story" ? "active" : ""}" data-mode="story" id="btn-mode-story">
              📜 ${i18n.t("timeline.modeStory")}
            </button>
            <button class="toggle-btn ${this.viewMode === "chrono" ? "active" : ""}" data-mode="chrono" id="btn-mode-chrono">
              📏 ${i18n.t("timeline.modeChrono")}
            </button>
          </div>
        </div>

        <div class="timeline-comparator-toggle">
          <button class="btn btn-sm ${this.showComparator ? "btn-primary" : "btn-outline"}" id="btn-toggle-comparator">
            ⚖️ ${i18n.t("timeline.compareToggle")}
          </button>
        </div>
      </div>
    `;
  }

  renderFilterChips(lang, counts) {
    const filters = [
      { id: "all", label: i18n.t("timeline.allEvents"), count: counts.all, icon: "🌐" },
      { id: "astronomical_anchor", label: i18n.t("timeline.astronomicalAnchors"), count: counts.astronomical_anchor, icon: "🪐" },
      { id: "ancient_epoch", label: i18n.t("timeline.eraAncient"), count: counts.ancient_epoch, icon: "🏺" },
      { id: "elephant_mawlid", label: i18n.t("timeline.eraElephant"), count: counts.elephant_mawlid, icon: "🐘" },
      { id: "prophetic_mission", label: i18n.t("timeline.eraMakkah"), count: counts.makkah, icon: "⛰️" },
      { id: "madinan_era", label: i18n.t("timeline.eraMadinah"), count: counts.madinah, icon: "🌴" },
      { id: "wafat_and_after", label: i18n.t("timeline.eraPassing"), count: counts.wafat, icon: "🕊️" }
    ];

    return `
      <div class="timeline-filter-chips" role="tablist" aria-label="Penapis Kategori">
        ${filters.map(f => `
          <button class="filter-chip ${this.activeCategory === f.id ? "active" : ""}" data-category="${f.id}" role="tab" aria-selected="${this.activeCategory === f.id}">
            <span class="chip-icon">${f.icon}</span>
            <span class="chip-text">${f.label}</span>
            <span class="chip-count">${f.count}</span>
          </button>
        `).join("")}
      </div>
    `;
  }

  renderComparatorDrawer(lang) {
    if (!this.showComparator) return `<div id="timeline-comparator-drawer" class="comparator-drawer is-hidden"></div>`;

    const precisionEvents = eventStore.getAllEvents().filter(e => e.date && e.date.jdn != null);
    const diffRes = eventStore.calculateDayDifference(this.compareA, this.compareB);

    let diffHtml = "";
    if (diffRes) {
      const { eventA, eventB, diffDays, lunarYears, solarYears } = diffRes;
      diffHtml = `
        <div class="comparator-metrics-grid">
          <div class="metric-card metric-primary">
            <span class="metric-label">Jumlah Hari Mutlak (Δ JDN)</span>
            <span class="metric-value"><strong>${diffDays.toLocaleString()}</strong> hari</span>
            <span class="metric-sub">${eventA.date.jdn} ➔ ${eventB.date.jdn}</span>
          </div>
          <div class="metric-card">
            <span class="metric-label">Tahun Qamari (354.367 h)</span>
            <span class="metric-value"><strong>${lunarYears}</strong> thn</span>
            <span class="metric-sub">Paksi Hijri / Syara'</span>
          </div>
          <div class="metric-card">
            <span class="metric-label">Tahun Syamsi (365.2422 h)</span>
            <span class="metric-value"><strong>${solarYears}</strong> thn</span>
            <span class="metric-sub">Paksi Astronomi Tropika</span>
          </div>
        </div>

        <div class="comparator-side-by-side">
          <div class="side-col col-a">
            <div class="col-header"><span class="badge-tag">Titik A</span> ${eventA.title[lang] || eventA.title.ms}</div>
            <div class="col-date">${eventA.date.display_date[lang] || eventA.date.display_date.ms} (${eventA.date.weekday || "-"})</div>
            <div class="col-conc">Hijri: ${eventA.date.hijri_display || "-"} | Iskandar: ${eventA.date.seleucid_alexander || "-"}</div>
          </div>
          <div class="side-col col-b">
            <div class="col-header"><span class="badge-tag">Titik B</span> ${eventB.title[lang] || eventB.title.ms}</div>
            <div class="col-date">${eventB.date.display_date[lang] || eventB.date.display_date.ms} (${eventB.date.weekday || "-"})</div>
            <div class="col-conc">Hijri: ${eventB.date.hijri_display || "-"} | Iskandar: ${eventB.date.seleucid_alexander || "-"}</div>
          </div>
        </div>
      `;
    }

    return `
      <div id="timeline-comparator-drawer" class="comparator-drawer">
        <div class="drawer-header">
          <div class="drawer-title">
            <span>⚖️ <strong>${i18n.t("timeline.compareDrawerTitle")}</strong></span>
            <span class="drawer-prompt">${i18n.t("timeline.comparePrompt")}</span>
          </div>
          <button id="close-comparator-btn" class="btn btn-sm btn-outline">&times; ${i18n.t("timeline.clearCompare")}</button>
        </div>

        <div class="drawer-selectors-row">
          <div class="select-group">
            <label for="comp-select-a">${i18n.t("timeline.pointA")}:</label>
            <select id="comp-select-a" class="form-control form-control-sm">
              ${precisionEvents.map(e => `
                <option value="${e.id}" ${e.id === this.compareA ? "selected" : ""}>
                  ${e.title[lang] || e.title.ms} (${e.date.display_date[lang] || e.date.display_date.ms})
                </option>
              `).join("")}
            </select>
          </div>

          <div class="select-group">
            <label for="comp-select-b">${i18n.t("timeline.pointB")}:</label>
            <select id="comp-select-b" class="form-control form-control-sm">
              ${precisionEvents.map(e => `
                <option value="${e.id}" ${e.id === this.compareB ? "selected" : ""}>
                  ${e.title[lang] || e.title.ms} (${e.date.display_date[lang] || e.date.display_date.ms})
                </option>
              `).join("")}
            </select>
          </div>

          <div class="drawer-actions">
            <button id="jump-to-calc-btn" class="btn btn-sm btn-primary">
              🔢 ${i18n.t("timeline.openInCalculator")}
            </button>
          </div>
        </div>

        <div id="comparator-output-area" class="comparator-output-area">
          ${diffHtml}
        </div>
      </div>
    `;
  }

  setupListeners() {
    // 1. Search Box
    const searchInput = document.getElementById("timeline-search");
    const clearSearchBtn = document.getElementById("clear-search-btn");

    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        this.searchQuery = e.target.value;
        this.renderTimelineNodes();
      });
    }

    if (clearSearchBtn) {
      clearSearchBtn.addEventListener("click", () => {
        this.searchQuery = "";
        if (searchInput) searchInput.value = "";
        this.render();
      });
    }

    // 2. View Mode Switcher
    const modeStoryBtn = document.getElementById("btn-mode-story");
    const modeChronoBtn = document.getElementById("btn-mode-chrono");

    if (modeStoryBtn) {
      modeStoryBtn.addEventListener("click", () => {
        if (this.viewMode !== "story") {
          this.viewMode = "story";
          this.render();
        }
      });
    }

    if (modeChronoBtn) {
      modeChronoBtn.addEventListener("click", () => {
        if (this.viewMode !== "chrono") {
          this.viewMode = "chrono";
          this.render();
        }
      });
    }

    // 3. Filter Chips
    const chips = this.container.querySelectorAll(".filter-chip");
    chips.forEach(chip => {
      chip.addEventListener("click", () => {
        const cat = chip.getAttribute("data-category");
        this.activeCategory = cat;
        chips.forEach(c => c.classList.remove("active"));
        chip.classList.add("active");
        this.renderTimelineNodes();
      });
    });

    // 4. Comparator Toggle & Selectors
    const compToggleBtn = document.getElementById("btn-toggle-comparator");
    if (compToggleBtn) {
      compToggleBtn.addEventListener("click", () => {
        this.showComparator = !this.showComparator;
        this.render();
      });
    }

    const closeCompBtn = document.getElementById("close-comparator-btn");
    if (closeCompBtn) {
      closeCompBtn.addEventListener("click", () => {
        this.showComparator = false;
        this.render();
      });
    }

    const compSelectA = document.getElementById("comp-select-a");
    const compSelectB = document.getElementById("comp-select-b");

    if (compSelectA) {
      compSelectA.addEventListener("change", (e) => {
        this.compareA = e.target.value;
        this.updateComparatorOutput();
      });
    }

    if (compSelectB) {
      compSelectB.addEventListener("change", (e) => {
        this.compareB = e.target.value;
        this.updateComparatorOutput();
      });
    }

    const jumpCalcBtn = document.getElementById("jump-to-calc-btn");
    if (jumpCalcBtn && this.onSelectEventsForCalculator) {
      jumpCalcBtn.addEventListener("click", () => {
        this.onSelectEventsForCalculator(this.compareA, this.compareB);
      });
    }

    // 5. Scrubber Pips Navigation & Auto-centering
    const pips = this.container.querySelectorAll(".scrubber-pip");
    pips.forEach(pip => {
      pip.addEventListener("click", () => {
        const targetId = pip.getAttribute("data-target");
        const match = SCRUBBER_MILESTONES.find(m => m.id === targetId);
        if (match) {
          this.centerScrubberPip(match.posPercent);
        }
        this.scrollToEvent(targetId);
      });
    });

    // 6. Scrubber Horizontal Scroll Navigation (Arrows, Drag-to-Scroll & Wheel)
    this.setupScrubberInteractions();
  }

  setupScrubberInteractions() {
    const viewport = document.getElementById("scrubber-scroll-viewport");
    const leftBtn = document.getElementById("scrubber-scroll-left");
    const rightBtn = document.getElementById("scrubber-scroll-right");

    if (leftBtn && viewport) {
      leftBtn.addEventListener("click", () => {
        viewport.scrollBy({ left: -360, behavior: "smooth" });
      });
    }

    if (rightBtn && viewport) {
      rightBtn.addEventListener("click", () => {
        viewport.scrollBy({ left: 360, behavior: "smooth" });
      });
    }

    if (viewport) {
      // Drag-to-scroll interaction
      let isDown = false;
      let startX = 0;
      let scrollLeftPos = 0;

      viewport.addEventListener("mousedown", (e) => {
        if (e.target.closest("button")) return;
        isDown = true;
        viewport.classList.add("is-dragging");
        startX = e.pageX - viewport.offsetLeft;
        scrollLeftPos = viewport.scrollLeft;
      });

      window.addEventListener("mouseup", () => {
        if (isDown) {
          isDown = false;
          viewport.classList.remove("is-dragging");
        }
      });

      viewport.addEventListener("mousemove", (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - viewport.offsetLeft;
        const walk = (x - startX) * 1.4;
        viewport.scrollLeft = scrollLeftPos - walk;
      });

      // Mouse wheel horizontal panning
      viewport.addEventListener("wheel", (e) => {
        if (e.deltaY !== 0 && !e.shiftKey) {
          e.preventDefault();
          viewport.scrollLeft += e.deltaY;
        }
      }, { passive: false });
    }
  }

  centerScrubberPip(posPercent) {
    const vp = document.getElementById("scrubber-scroll-viewport");
    const canvas = document.getElementById("scrubber-track-canvas");
    if (!vp || !canvas) return;
    const canvasWidth = canvas.scrollWidth;
    const targetX = (posPercent / 100) * canvasWidth;
    const targetScroll = targetX - (vp.clientWidth / 2);
    vp.scrollTo({ left: Math.max(0, targetScroll), behavior: "smooth" });
  }

  updateComparatorOutput() {
    const outputArea = document.getElementById("comparator-output-area");
    if (!outputArea) return;
    const lang = i18n.getLang();
    const diffRes = eventStore.calculateDayDifference(this.compareA, this.compareB);
    if (!diffRes) {
      outputArea.innerHTML = `<div class="error-msg">Sila pilih dua peristiwa yang sah.</div>`;
      return;
    }

    const { eventA, eventB, diffDays, lunarYears, solarYears } = diffRes;
    outputArea.innerHTML = `
      <div class="comparator-metrics-grid">
        <div class="metric-card metric-primary">
          <span class="metric-label">Jumlah Hari Mutlak (Δ JDN)</span>
          <span class="metric-value"><strong>${diffDays.toLocaleString()}</strong> hari</span>
          <span class="metric-sub">${eventA.date.jdn} ➔ ${eventB.date.jdn}</span>
        </div>
        <div class="metric-card">
          <span class="metric-label">Tahun Qamari (354.367 h)</span>
          <span class="metric-value"><strong>${lunarYears}</strong> thn</span>
          <span class="metric-sub">Paksi Hijri / Syara'</span>
        </div>
        <div class="metric-card">
          <span class="metric-label">Tahun Syamsi (365.2422 h)</span>
          <span class="metric-value"><strong>${solarYears}</strong> thn</span>
          <span class="metric-sub">Paksi Astronomi Tropika</span>
        </div>
      </div>

      <div class="comparator-side-by-side">
        <div class="side-col col-a">
          <div class="col-header"><span class="badge-tag">Titik A</span> ${eventA.title[lang] || eventA.title.ms}</div>
          <div class="col-date">${eventA.date.display_date[lang] || eventA.date.display_date.ms} (${eventA.date.weekday || "-"})</div>
          <div class="col-conc">Hijri: ${eventA.date.hijri_display || "-"} | Iskandar: ${eventA.date.seleucid_alexander || "-"}</div>
        </div>
        <div class="side-col col-b">
          <div class="col-header"><span class="badge-tag">Titik B</span> ${eventB.title[lang] || eventB.title.ms}</div>
          <div class="col-date">${eventB.date.display_date[lang] || eventB.date.display_date.ms} (${eventB.date.weekday || "-"})</div>
          <div class="col-conc">Hijri: ${eventB.date.hijri_display || "-"} | Iskandar: ${eventB.date.seleucid_alexander || "-"}</div>
        </div>
      </div>
    `;
  }

  scrollToEvent(targetId) {
    let targetEl = document.getElementById(targetId);
    if (!targetEl) {
      if (targetId === "ancient-epochs-section") {
        targetEl = document.getElementById("ancient-epochs-section");
      }
    }

    if (targetEl) {
      targetEl.scrollIntoView({ behavior: "smooth", block: "center" });
      targetEl.classList.add("pulse-focus");
      setTimeout(() => {
        targetEl.classList.remove("pulse-focus");
      }, 2500);
    }
  }

  setupScrollSpy() {
    if (this.scrollObserver) {
      this.scrollObserver.disconnect();
    }

    const items = this.container.querySelectorAll(".timeline-item, .ancient-card, #ancient-epochs-section");
    const needle = document.getElementById("scrubber-needle");
    if (!items.length || !needle) return;

    this.scrollObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          const match = SCRUBBER_MILESTONES.find(m => m.id === id);
          if (match) {
            needle.style.left = `${match.posPercent}%`;
            // Highlight matching milestone node & pip
            const nodes = this.container.querySelectorAll(".scrubber-milestone-node");
            nodes.forEach(n => {
              if (n.id === `milestone-node-${match.id}`) {
                n.classList.add("active");
              } else {
                n.classList.remove("active");
              }
            });
            this.centerScrubberPip(match.posPercent);
          }
        }
      });
    }, { threshold: 0.3 });

    items.forEach(it => this.scrollObserver.observe(it));
  }

  renderTimelineNodes() {
    const contentArea = document.getElementById("timeline-content-area");
    if (!contentArea) return;

    // Filter events
    let filteredEvents = eventStore.getAllEvents();

    // Category / Era filter
    if (this.activeCategory !== "all") {
      if (this.activeCategory === "elephant_mawlid") {
        filteredEvents = filteredEvents.filter(e => e.category === "mawlid" || e.category === "pre_mawlid_seerah" || e.category === "prophetic_childhood");
      } else {
        filteredEvents = filteredEvents.filter(e => e.category === this.activeCategory);
      }
    }

    // Search query filter
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase().trim();
      filteredEvents = filteredEvents.filter(ev => {
        const titleMs = (ev.title.ms || "").toLowerCase();
        const titleEn = (ev.title.en || "").toLowerCase();
        const titleAr = (ev.title.ar || "").toLowerCase();
        const descMs = (ev.narrative.summary_ms || "").toLowerCase();
        const descEn = (ev.narrative.summary_en || "").toLowerCase();
        const descAr = (ev.narrative.summary_ar || "").toLowerCase();
        const src = (ev.narrative.classical_source || "").toLowerCase();
        const dateStr = (ev.date.display_date.ms || "").toLowerCase();

        return titleMs.includes(q) || titleEn.includes(q) || titleAr.includes(q) ||
               descMs.includes(q) || descEn.includes(q) || descAr.includes(q) ||
               src.includes(q) || dateStr.includes(q);
      });
    }

    const lang = i18n.getLang();

    if (filteredEvents.length === 0) {
      contentArea.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">🔍</div>
          <p>${i18n.t("timeline.noEventsMatch")}</p>
        </div>
      `;
      return;
    }

    // Split into Ancient Epochs and Precision Lifespan events
    const ancientEpochs = filteredEvents.filter(e => e.category === "ancient_epoch");
    const precisionEvents = filteredEvents.filter(e => e.category !== "ancient_epoch");

    let html = "";

    // 1. Prologue Section
    if (ancientEpochs.length > 0) {
      html += `
        <div class="timeline-section-heading" id="ancient-epochs-section">
          <div class="heading-badge">🏺 ${i18n.t("timeline.eraAncient")}</div>
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
      const isChrono = this.viewMode === "chrono";
      html += `
        <div class="timeline-section-heading mt-6" id="prophetic-era-section">
          <div class="heading-badge">🌟 571–632 Masihi</div>
          <h3>Garis Masa Utama: Tahun Gajah hingga Kewafatan Baginda ﷺ</h3>
          <p class="section-notice">
            ${isChrono 
              ? `<strong>📏 ${i18n.t("timeline.modeChrono")}:</strong> ${i18n.t("timeline.proportionalNotice")}`
              : `Tersusun mengikut turutan falak dan kalendar sebenar dengan paksi perkiraan Mahmoud Pasha al-Falaki.`
            }
          </p>
        </div>

        <div class="vertical-timeline ${isChrono ? "is-proportional-chrono" : ""}">
          ${precisionEvents.map((ev, index) => {
            const nextEv = precisionEvents[index + 1];
            return this.renderTimelineCard(ev, nextEv, lang, isChrono);
          }).join("")}
        </div>
      `;
    }

    contentArea.innerHTML = html;
    this.setupCardInteractiveActions();
    this.setupScrollSpy();
  }

  renderAncientCard(ev, lang) {
    return `
      <div class="ancient-card" id="event-node-${ev.id}" data-event-id="${ev.id}">
        <div class="card-badge">${ev.date.display_date[lang] || ev.date.display_date.ms}</div>
        <h4 class="card-title">${ev.title[lang] || ev.title.ms}</h4>
        <div class="card-title-ar" dir="rtl">${ev.title.ar}</div>
        <p class="card-desc">${ev.narrative[`summary_${lang}`] || ev.narrative.summary_ms}</p>
        <div class="card-source">${ev.narrative.classical_source || ""}</div>
        <div class="ancient-card-actions">
          <button class="btn btn-xs btn-outline view-narrative-btn" data-event-id="${ev.id}">
            📖 ${i18n.t("timeline.readNarrative")}
          </button>
        </div>
      </div>
    `;
  }

  renderTimelineCard(ev, nextEv, lang, isChrono = false) {
    const isMawlid = ev.id === "prophet-birth-mawlid";
    const isWafat = ev.id === "prophet-passing-wafat";
    const isElephant = ev.id === "elephant-expedition-571";
    const isEclipse = ev.id === "death-of-ibrahim-solar-eclipse";
    const isHijrah = ev.id === "hijrah-entry-quba-medina";
    const isBithah = ev.id === "al-bithah-first-revelation";
    const isAnchor = ev.category === "astronomical_anchor";

    let specialClass = "";
    if (isMawlid) specialClass = "card-mawlid";
    else if (isWafat) specialClass = "card-wafat";
    else if (isEclipse) specialClass = "card-eclipse";
    else if (isHijrah) specialClass = "card-hijrah";
    else if (isBithah) specialClass = "card-bithah";
    else if (isElephant) specialClass = "card-elephant";
    else if (isAnchor) specialClass = "card-anchor";

    // Day count connector to next major milestone
    let connectorHtml = "";
    let chronoGapStyle = "";

    if (nextEv && ev.date.jdn && nextEv.date.jdn) {
      const diff = Math.abs(nextEv.date.jdn - ev.date.jdn);
      if (diff > 0) {
        const lunarYears = (diff / 354.367).toFixed(1);
        const solarYears = (diff / 365.2422).toFixed(1);

        if (isChrono) {
          // Scale vertical spacing proportionally: min 40px, max 280px
          const scaledHeight = Math.min(280, Math.max(38, Math.round(diff * 0.05)));
          chronoGapStyle = `style="margin-bottom: ${scaledHeight}px;"`;

          connectorHtml = `
            <div class="timeline-connector connector-proportional" style="height: ${scaledHeight}px;">
              <div class="connector-line-chrono"></div>
              <div class="connector-pill-chrono">
                <span class="pill-days">⏳ +${diff.toLocaleString()} ${i18n.t("timeline.days")}</span>
                <span class="pill-sub">(${lunarYears} thn qamari / ${solarYears} thn syamsi)</span>
              </div>
            </div>
          `;
        } else {
          connectorHtml = `
            <div class="timeline-connector">
              <div class="connector-line"></div>
              <div class="connector-pill">
                <span class="pill-days">⏳ +${diff.toLocaleString()} ${i18n.t("timeline.days")}</span>
                <span class="pill-sub">(${lunarYears} thn qamari)</span>
              </div>
              <div class="connector-line"></div>
            </div>
          `;
        }
      }
    }

    // Days from Mawlid badge
    let mawlidDiffBadge = "";
    if (ev.astronomical_meta && ev.astronomical_meta.day_count_from_mawlid != null) {
      const d = ev.astronomical_meta.day_count_from_mawlid;
      const lunarAge = (d / 354.367).toFixed(1);
      mawlidDiffBadge = `
        <div class="mawlid-distance-badge" title="Jarak astronomi hari dari kelahiran (Mawlid)">
          <span class="badge-star">🌟</span>
          <span>${i18n.t("timeline.daysFromMawlid")} <strong>${d.toLocaleString()} ${i18n.t("timeline.days")}</strong></span>
          <span class="badge-age">(~${lunarAge} ${i18n.t("timeline.yearsOld")})</span>
        </div>
      `;
    }

    // Astro Anchor Badge
    let astroPill = "";
    if (isAnchor) {
      astroPill = `<span class="chip chip-astro">🪐 Paksi Falak Mahmoud Pasha</span>`;
    }

    return `
      <div class="timeline-item ${specialClass}" id="event-node-${ev.id}" ${chronoGapStyle}>
        <div class="timeline-marker">
          <div class="marker-inner"></div>
        </div>
        <div class="timeline-card">
          <div class="card-header-bar">
            <span class="date-chip">${ev.date.display_date[lang] || ev.date.display_date.ms}</span>
            ${ev.date.elephant_era ? `<span class="elephant-chip">${ev.date.elephant_era.label}</span>` : ""}
            ${ev.date.weekday ? `<span class="weekday-chip">${ev.date.weekday}</span>` : ""}
            ${astroPill}
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
              <button class="btn btn-sm btn-outline view-in-cal-btn" data-jdn="${ev.date.jdn}" title="Lompat ke Paparan Kalendar Bulanan bagi hari ini">
                📅 ${i18n.t("timeline.viewInCalendar")}
              </button>
              <button class="btn btn-sm btn-outline quick-compare-btn" data-event-id="${ev.id}" title="Pilih peristiwa ini untuk perbandingan jarak masa">
                ⚖️ Banding
              </button>
            ` : ""}
          </div>
        </div>
      </div>
      ${connectorHtml}
    `;
  }

  setupCardInteractiveActions() {
    // Narrative modals
    const narrativeBtns = this.container.querySelectorAll(".view-narrative-btn");
    narrativeBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-event-id");
        this.openEventModal(id);
      });
    });

    // Calendar jumps
    const calBtns = this.container.querySelectorAll(".view-in-cal-btn");
    calBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        const jdn = parseInt(btn.getAttribute("data-jdn"), 10);
        if (this.onSelectDateForCalendar) {
          this.onSelectDateForCalendar(jdn);
        }
      });
    });

    // Quick compare button
    const compareBtns = this.container.querySelectorAll(".quick-compare-btn");
    compareBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-event-id");
        this.compareB = id;
        this.showComparator = true;
        this.render();
        const drawer = document.getElementById("timeline-comparator-drawer");
        if (drawer) {
          drawer.scrollIntoView({ behavior: "smooth", block: "start" });
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
          ${ev.category === "astronomical_anchor" ? `<span class="chip chip-astro">🪐 Paksi Falak</span>` : ""}
        </div>

        <h2 class="modal-title">${ev.title[lang] || ev.title.ms}</h2>
        <div class="modal-title-ar" dir="rtl">${ev.title.ar}</div>

        <div class="modal-concordance-box">
          <h4>Penyelarasan Pelbagai Sistem Kalendar (Concordance):</h4>
          <div class="concordance-modal-grid">
            <div class="conc-row"><span>Taqwim Hijri / Pra-Hijrah:</span> <strong>${ev.date.hijri_display || "-"}</strong></div>
            <div class="conc-row"><span>Era Tahun Gajah ('Am al-Fil):</span> <strong>${ev.date.elephant_era ? ev.date.elephant_era.label : "-"}</strong></div>
            <div class="conc-row"><span>Taqwim Iskandar (Seleucid):</span> <strong>${ev.date.seleucid_alexander || "-"}</strong></div>
            <div class="conc-row"><span>Taqwim Nabonassar:</span> <strong>${ev.date.nabonassar || "-"}</strong></div>
            <div class="conc-row"><span>Taqwim Yahudi (Anno Mundi):</span> <strong>${ev.date.jewish_am || "-"}</strong></div>
            <div class="conc-row"><span>Pemerintahan Parsi Sasanian:</span> <strong>${ev.date.persian_regnal || "-"}</strong></div>
            <div class="conc-row"><span>Julian Day Number (JDN):</span> <strong>${ev.date.jdn || "-"}</strong></div>
          </div>
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
              ${ev.narrative.hadith_refs.map(ref => {
                const matchBukhari = ref.match(/Sahih al-Bukhari[^\d]*(\d+)/i);
                if (matchBukhari) {
                  return `<li><a href="https://maktabah-maftoohah.github.io/sahih-al-bukhari/${matchBukhari[1]}" target="_blank" rel="noopener noreferrer" class="hadith-link">${ref} ↗</a></li>`;
                }
                const matchMuslim = ref.match(/Sahih Muslim[^\d]*(\d+)/i);
                if (matchMuslim) {
                  return `<li><a href="https://maktabah-maftoohah.github.io/sahih-muslim/${matchMuslim[1]}" target="_blank" rel="noopener noreferrer" class="hadith-link">${ref} ↗</a></li>`;
                }
                return `<li>${ref}</li>`;
              }).join("")}
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
