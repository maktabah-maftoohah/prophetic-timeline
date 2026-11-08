/**
 * Prophetic Timeline - Moon Phase & Crescent Visibility Simulator (Rukyah Hilal)
 * Interactive astronomical simulator modeling crescent moon visibility at sunset (Maghrib),
 * crescent altitude, elongation, moon age, and comparative criteria evaluation:
 * 1. Kriteria MABIMS Baharu (2021+): Ketinggian >= 3° & Elongasi >= 6.4°
 * 2. Kriteria MABIMS Lama (Wujudul Hilal): Ketinggian >= 2° & (Elongasi >= 3° || Umur >= 8 jam)
 * 3. Kriteria Astronomi Antarabangsa Dr. Mohammad Odeh (Zon A, B, C, D)
 * 4. Had Danjon (Danjon Limit: Elongasi < 7° = mustahil nampak akibat bayang kawah)
 * 
 * Features key historical Sirah presets:
 * - Hilal 1 Zulhijjah 10 AH (Haji Wada' 632 CE)
 * - Hilal 1 Syawal 10 AH (Gerhana Suria Madinah 632 CE)
 * - Hilal 1 Rabi' al-Awwal 53 BH (Mawlid 571 CE)
 * - Hilal 1 Ramadan 13 BH (Bi'thah 610 CE)
 * - Hilal 1 Rabi' al-Awwal 1 AH (Hijrah Arrival 622 CE)
 */

import { i18n } from "../core/i18n.js";
import { formatHadithLink } from "../core/hadith-linker.js";

export class MoonPhaseSimulator {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    // Simulation state
    this.altitude = 5.8;     // degrees above horizon (0° to 15°)
    this.elongation = 8.4;   // degrees separation from sun (0° to 25°)
    this.moonAge = 18.5;     // hours from conjunction
    this.activePreset = "wada";
    this.canvas = null;
    this.ctx = null;
  }

  render() {
    if (!this.container) return;
    const lang = i18n.getLang();

    this.container.innerHTML = `
      <div class="moon-sim-card">
        <div class="sim-header">
          <div class="sim-badge">${i18n.t("visualizers.moonSimBadge")}</div>
          <div class="sim-phase">${i18n.t("visualizers.moonSimTitle")}</div>
          <p class="sim-desc">${i18n.t("visualizers.moonSimDesc")}</p>
        </div>

        <!-- Presets Bar -->
        <div class="moon-presets-bar">
          <span class="preset-label">${i18n.t("visualizers.moonPresetsLabel")}:</span>
          <button class="moon-preset-pill ${this.activePreset === 'wada' ? 'active' : ''}" data-preset="wada">
            🌙 Zulhijjah 10 H (Haji Wada')
          </button>
          <button class="moon-preset-pill ${this.activePreset === 'eclipse' ? 'active' : ''}" data-preset="eclipse">
            🌑 Syawal 10 H (Gerhana Madinah)
          </button>
          <button class="moon-preset-pill ${this.activePreset === 'mawlid' ? 'active' : ''}" data-preset="mawlid">
            ⭐ Rabiulawal 53 BH (Mawlid)
          </button>
          <button class="moon-preset-pill ${this.activePreset === 'bithah' ? 'active' : ''}" data-preset="bithah">
            📖 Ramadan 13 BH (Bi'thah)
          </button>
          <button class="moon-preset-pill ${this.activePreset === 'hijrah' ? 'active' : ''}" data-preset="hijrah">
            🌴 Rabiulawal 1 H (Hijrah)
          </button>
        </div>

        <!-- Canvas Display -->
        <div class="sky-canvas-wrapper moon-canvas-wrapper">
          <canvas id="moon-phase-canvas" width="600" height="320"></canvas>
        </div>

        <!-- Interactive Sliders & Live Readouts -->
        <div class="moon-controls-grid">
          <div class="control-card">
            <div class="control-header">
              <label for="slider-moon-alt">${i18n.t("visualizers.crescentAltitude")}</label>
              <span class="control-val" id="val-moon-alt">${this.altitude.toFixed(1)}°</span>
            </div>
            <input type="range" id="slider-moon-alt" min="0" max="15" step="0.1" value="${this.altitude}" class="sim-slider">
            <div class="slider-scale">
              <span>0° (Ufuk)</span>
              <span>3° (MABIMS)</span>
              <span>7°</span>
              <span>15°</span>
            </div>
          </div>

          <div class="control-card">
            <div class="control-header">
              <label for="slider-moon-elong">${i18n.t("visualizers.elongationArc")}</label>
              <span class="control-val" id="val-moon-elong">${this.elongation.toFixed(1)}°</span>
            </div>
            <input type="range" id="slider-moon-elong" min="0" max="25" step="0.1" value="${this.elongation}" class="sim-slider">
            <div class="slider-scale">
              <span>0° (Ijtimak)</span>
              <span>6.4° (MABIMS)</span>
              <span>7° (Danjon)</span>
              <span>25°</span>
            </div>
          </div>

          <div class="control-card">
            <div class="control-header">
              <label for="slider-moon-age">${i18n.t("visualizers.moonAge")}</label>
              <span class="control-val" id="val-moon-age">${this.moonAge.toFixed(1)} ${i18n.t("visualizers.hours")}</span>
            </div>
            <input type="range" id="slider-moon-age" min="1" max="48" step="0.5" value="${this.moonAge}" class="sim-slider">
            <div class="slider-scale">
              <span>1j</span>
              <span>8j (Lama)</span>
              <span>24j</span>
              <span>48j</span>
            </div>
          </div>
        </div>

        <!-- Live Scientific Parameters & Criteria Evaluation -->
        <div class="criteria-eval-container" id="criteria-eval-box">
          <!-- Injected dynamically in updateEvaluation() -->
        </div>

        <!-- Canonical Hadith Reference -->
        <div class="hadith-callout moon-hadith-callout">
          <div class="arabic-matn" dir="rtl">
            «صُومُوا لِرُؤْيَتِهِ وَأَفْطِرُوا لِرُؤْيَتِهِ، فَإِنْ غُمِّيَ عَلَيْكُمْ فَأَكْمِلُوا عِدَّةَ شَعْبَانَ ثَلاَثِينَ»
          </div>
          <div class="translation-text">
            ${i18n.t("visualizers.hilalHadithTranslation")}
            <span class="source-tag">
              — ${formatHadithLink("Sahih al-Bukhari (No. 1909)")} • ${formatHadithLink("Sahih Muslim (Hadith 1081)")}
            </span>
          </div>
        </div>
      </div>
    `;

    this.canvas = document.getElementById("moon-phase-canvas");
    if (this.canvas) {
      this.ctx = this.canvas.getContext("2d");
    }

    this.setupListeners();
    this.updateEvaluation();
    this.drawSky();
  }

  setupListeners() {
    const sliderAlt = document.getElementById("slider-moon-alt");
    const sliderElong = document.getElementById("slider-moon-elong");
    const sliderAge = document.getElementById("slider-moon-age");

    if (sliderAlt) {
      sliderAlt.addEventListener("input", (e) => {
        this.altitude = parseFloat(e.target.value);
        this.activePreset = "custom";
        this.updatePillStates();
        const valEl = document.getElementById("val-moon-alt");
        if (valEl) valEl.textContent = `${this.altitude.toFixed(1)}°`;
        this.updateEvaluation();
        this.drawSky();
      });
    }

    if (sliderElong) {
      sliderElong.addEventListener("input", (e) => {
        this.elongation = parseFloat(e.target.value);
        this.activePreset = "custom";
        this.updatePillStates();
        const valEl = document.getElementById("val-moon-elong");
        if (valEl) valEl.textContent = `${this.elongation.toFixed(1)}°`;
        this.updateEvaluation();
        this.drawSky();
      });
    }

    if (sliderAge) {
      sliderAge.addEventListener("input", (e) => {
        this.moonAge = parseFloat(e.target.value);
        this.activePreset = "custom";
        this.updatePillStates();
        const valEl = document.getElementById("val-moon-age");
        if (valEl) valEl.textContent = `${this.moonAge.toFixed(1)} ${i18n.t("visualizers.hours")}`;
        this.updateEvaluation();
        this.drawSky();
      });
    }

    // Preset buttons
    const pills = this.container.querySelectorAll(".moon-preset-pill");
    pills.forEach(pill => {
      pill.addEventListener("click", () => {
        const p = pill.getAttribute("data-preset");
        this.applyPreset(p);
      });
    });
  }

  applyPreset(presetKey) {
    this.activePreset = presetKey;
    if (presetKey === "wada") {
      // 1 Zulhijjah 10 AH (Farewell Hajj)
      this.altitude = 5.8;
      this.elongation = 8.4;
      this.moonAge = 18.5;
    } else if (presetKey === "eclipse") {
      // 29 Shawwal 10 AH (Solar Eclipse day - dusk after morning eclipse)
      this.altitude = 1.8;
      this.elongation = 4.2;
      this.moonAge = 9.5;
    } else if (presetKey === "mawlid") {
      // 1 Rabi' I 53 BH (Mawlid)
      this.altitude = 6.2;
      this.elongation = 9.0;
      this.moonAge = 22.0;
    } else if (presetKey === "bithah") {
      // 1 Ramadan 13 BH (Bi'thah)
      this.altitude = 7.0;
      this.elongation = 10.1;
      this.moonAge = 24.0;
    } else if (presetKey === "hijrah") {
      // 1 Rabi' I 1 AH (Hijrah arrival)
      this.altitude = 5.2;
      this.elongation = 7.8;
      this.moonAge = 16.8;
    }

    // Update inputs
    const sliderAlt = document.getElementById("slider-moon-alt");
    const sliderElong = document.getElementById("slider-moon-elong");
    const sliderAge = document.getElementById("slider-moon-age");
    if (sliderAlt) sliderAlt.value = this.altitude;
    if (sliderElong) sliderElong.value = this.elongation;
    if (sliderAge) sliderAge.value = this.moonAge;

    const valAlt = document.getElementById("val-moon-alt");
    const valElong = document.getElementById("val-moon-elong");
    const valAge = document.getElementById("val-moon-age");
    if (valAlt) valAlt.textContent = `${this.altitude.toFixed(1)}°`;
    if (valElong) valElong.textContent = `${this.elongation.toFixed(1)}°`;
    if (valAge) valAge.textContent = `${this.moonAge.toFixed(1)} ${i18n.t("visualizers.hours")}`;

    this.updatePillStates();
    this.updateEvaluation();
    this.drawSky();
  }

  updatePillStates() {
    const pills = this.container.querySelectorAll(".moon-preset-pill");
    pills.forEach(p => {
      if (p.getAttribute("data-preset") === this.activePreset) {
        p.classList.add("active");
      } else {
        p.classList.remove("active");
      }
    });
  }

  updateEvaluation() {
    const evalContainer = document.getElementById("criteria-eval-box");
    if (!evalContainer) return;
    const lang = i18n.getLang();

    // 1. Illumination fraction & crescent width
    // Fraction: k = (1 - cos(elongation)) / 2 * 100
    const radElong = (this.elongation * Math.PI) / 180;
    const illumPercent = ((1 - Math.cos(radElong)) / 2) * 100;
    // Crescent width in arcminutes (approx 31' moon diameter)
    const crescentWidthArcmin = 0.5 * (1 - Math.cos(radElong)) * 31.0;

    // 2. MABIMS Baharu (2021+): Alt >= 3.0° AND Elongation >= 6.4°
    const passMabimsNew = this.altitude >= 3.0 && this.elongation >= 6.4;

    // 3. MABIMS Tradisional: Alt >= 2.0° AND (Elongation >= 3.0° OR Age >= 8h)
    const passMabimsOld = this.altitude >= 2.0 && (this.elongation >= 3.0 || this.moonAge >= 8.0);

    // 4. Danjon Limit: Elongation < 7.0° means crescent light is physically broken/extinguished by crater shadows
    const danjonPass = this.elongation >= 7.0;

    // 5. Odeh Astronomical Criteria:
    // Zone A: Naked eye easily | Zone B: Naked eye under good sky | Zone C: Optical aid only | Zone D: Not visible
    let odehZone = "D";
    let odehClass = "zone-d";
    let odehDesc = i18n.t("visualizers.odehZoneD");

    if (!danjonPass || this.altitude <= 0) {
      odehZone = "D";
      odehClass = "zone-d";
      odehDesc = i18n.t("visualizers.odehZoneD");
    } else {
      // V-factor approximation based on altitude and crescent width
      const vFactor = this.altitude - (crescentWidthArcmin < 0.2 ? 9.0 : (crescentWidthArcmin < 0.5 ? 6.5 : 4.0));
      if (vFactor >= 2.0 && this.altitude >= 6.0 && this.elongation >= 8.5) {
        odehZone = "A";
        odehClass = "zone-a";
        odehDesc = i18n.t("visualizers.odehZoneA");
      } else if (vFactor >= 0.0 && this.altitude >= 4.0 && this.elongation >= 7.0) {
        odehZone = "B";
        odehClass = "zone-b";
        odehDesc = i18n.t("visualizers.odehZoneB");
      } else if (this.altitude >= 1.5 && this.elongation >= 7.0) {
        odehZone = "C";
        odehClass = "zone-c";
        odehDesc = i18n.t("visualizers.odehZoneC");
      } else {
        odehZone = "D";
        odehClass = "zone-d";
        odehDesc = i18n.t("visualizers.odehZoneD");
      }
    }

    evalContainer.innerHTML = `
      <div class="metrics-grid">
        <div class="metric-box">
          <span class="metric-label">${i18n.t("visualizers.illumination")}:</span>
          <span class="metric-val">${illumPercent.toFixed(2)}%</span>
        </div>
        <div class="metric-box">
          <span class="metric-label">${i18n.t("visualizers.crescentWidth")}:</span>
          <span class="metric-val">${crescentWidthArcmin.toFixed(2)}'</span>
        </div>
        <div class="metric-box">
          <span class="metric-label">${i18n.t("visualizers.lagTime")}:</span>
          <span class="metric-val">~${Math.round(this.altitude * 4)} ${i18n.t("visualizers.minutes")}</span>
        </div>
      </div>

      <div class="criteria-cards-grid">
        <!-- Card 1: MABIMS Baharu (2021+) -->
        <div class="criteria-card ${passMabimsNew ? 'status-pass' : 'status-fail'}">
          <div class="criteria-name">Kriteria MABIMS Baharu (2021+)</div>
          <div class="criteria-rule">Ketinggian &ge; 3.0° &bull; Elongasi &ge; 6.4°</div>
          <div class="criteria-result">
            ${passMabimsNew 
              ? `<span class="badge badge-success">✓ ${i18n.t("visualizers.hilalVisible")} (Imkanur Rukyah)</span>` 
              : `<span class="badge badge-danger">✗ ${i18n.t("visualizers.hilalNotVisible")}</span>`}
          </div>
        </div>

        <!-- Card 2: Kriteria Dr. Mohammad Odeh -->
        <div class="criteria-card ${odehClass}">
          <div class="criteria-name">Kriteria Astronomi Odeh (Antarabangsa)</div>
          <div class="criteria-rule">${i18n.t("visualizers.odehRule")}</div>
          <div class="criteria-result">
            <span class="badge ${odehClass}">Zon ${odehZone}: ${odehDesc}</span>
          </div>
        </div>

        <!-- Card 3: Had Danjon -->
        <div class="criteria-card ${danjonPass ? 'status-pass' : 'status-fail'}">
          <div class="criteria-name">Had Fizikal Danjon (7.0°)</div>
          <div class="criteria-rule">Elongasi Minimum Pembentukan Sabit Berterusan</div>
          <div class="criteria-result">
            ${danjonPass
              ? `<span class="badge badge-success">✓ Melepasi Had (${this.elongation.toFixed(1)}° &ge; 7°)</span>`
              : `<span class="badge badge-danger">✗ Bawah Had (${this.elongation.toFixed(1)}° &lt; 7°: Sabit Terputus)</span>`}
          </div>
        </div>
      </div>
    `;
  }

  drawSky() {
    if (!this.canvas || !this.ctx) return;
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.clearRect(0, 0, w, h);

    // 1. Sky Twilight Gradient (Sunset Horizon)
    // Horizon is placed at y = 250 (giving 250px for sky up to 15 degrees altitude)
    const horizonY = 250;
    const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
    skyGrad.addColorStop(0, "#030712");    // deep night sky at top
    skyGrad.addColorStop(0.35, "#0f172a"); // indigo twilight
    skyGrad.addColorStop(0.7, "#311042");  // purple transition
    skyGrad.addColorStop(0.9, "#7c2d12");  // warm amber dusk
    skyGrad.addColorStop(1, "#c2410c");    // orange sunset glow at horizon

    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, horizonY);

    // 2. Earth / Ground below horizon
    const groundGrad = ctx.createLinearGradient(0, horizonY, 0, h);
    groundGrad.addColorStop(0, "#1c1917");
    groundGrad.addColorStop(1, "#0c0a09");
    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, horizonY, w, h - horizonY);

    // 3. Horizon Line & Degree Markers
    ctx.strokeStyle = "rgba(251, 146, 60, 0.8)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, horizonY);
    ctx.lineTo(w, horizonY);
    ctx.stroke();

    // Altitude Grid Lines: 0° is y=250, 15° is y=40 (approx 14px per degree)
    const pxPerDegree = (horizonY - 40) / 15;

    ctx.save();
    ctx.font = "10px sans-serif";
    ctx.fillStyle = "rgba(226, 232, 240, 0.5)";
    ctx.strokeStyle = "rgba(148, 163, 184, 0.2)";
    ctx.setLineDash([3, 3]);

    [3, 6, 9, 12, 15].forEach(deg => {
      const lineY = horizonY - deg * pxPerDegree;
      ctx.beginPath();
      ctx.moveTo(0, lineY);
      ctx.lineTo(w, lineY);
      ctx.stroke();
      ctx.fillText(`${deg}°`, 8, lineY - 3);
    });

    // MABIMS 3° guideline highlighted
    const mabims3Y = horizonY - 3 * pxPerDegree;
    ctx.strokeStyle = "rgba(16, 185, 129, 0.6)";
    ctx.beginPath();
    ctx.moveTo(0, mabims3Y);
    ctx.lineTo(w, mabims3Y);
    ctx.stroke();
    ctx.fillStyle = "#10b981";
    ctx.fillText("3° Had Min MABIMS", w - 120, mabims3Y - 3);

    ctx.restore();

    // 4. Sun position (below horizon)
    // Placed at center x = w / 2, y = horizonY + 28
    const sunX = w / 2;
    const sunY = horizonY + 28;
    const sunGlow = ctx.createRadialGradient(sunX, horizonY, 5, sunX, horizonY, 90);
    sunGlow.addColorStop(0, "rgba(251, 191, 36, 0.8)");
    sunGlow.addColorStop(0.3, "rgba(249, 115, 22, 0.4)");
    sunGlow.addColorStop(1, "rgba(249, 115, 22, 0)");
    ctx.fillStyle = sunGlow;
    ctx.fillRect(sunX - 100, horizonY - 20, 200, 50);

    // 5. Crescent Moon
    // Moon position based on altitude and elongation
    // Elongation shifts moon horizontally (e.g. left/south of sun)
    const moonAltitudeY = horizonY - (this.altitude * pxPerDegree);
    // Angular separation: horizontally mapped (approx 8px per degree)
    const moonX = sunX - (this.elongation * 7.5);
    const moonRadius = 24;

    // Outer Moon Aura / Glow
    if (this.altitude > 0) {
      const moonGlow = ctx.createRadialGradient(moonX, moonAltitudeY, moonRadius * 0.5, moonX, moonAltitudeY, moonRadius * 2.2);
      moonGlow.addColorStop(0, "rgba(254, 240, 138, 0.35)");
      moonGlow.addColorStop(1, "rgba(254, 240, 138, 0)");
      ctx.fillStyle = moonGlow;
      ctx.beginPath();
      ctx.arc(moonX, moonAltitudeY, moonRadius * 2.2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Faint Earthshine (Da'wa al-Ardh / Ashen Light) for unlit part
    ctx.fillStyle = "rgba(40, 50, 75, 0.4)";
    ctx.beginPath();
    ctx.arc(moonX, moonAltitudeY, moonRadius, 0, Math.PI * 2);
    ctx.fill();

    // Glowing Illuminated Crescent Limb
    // We construct the crescent using two arcs or bezier
    const radElong = (this.elongation * Math.PI) / 180;
    const phaseFactor = Math.min(1.0, Math.max(0.04, (1 - Math.cos(radElong)) / 2));
    const innerRadiusX = Math.max(2, moonRadius * (1 - phaseFactor * 2));

    ctx.save();
    ctx.translate(moonX, moonAltitudeY);
    // Rotate crescent so its lit cusp faces the sun (down-right towards sun below horizon)
    const angleToSun = Math.atan2(sunY - moonAltitudeY, sunX - moonX);
    ctx.rotate(angleToSun - Math.PI / 2);

    ctx.fillStyle = "#fef08a";
    ctx.shadowColor = "#fef08a";
    ctx.shadowBlur = 12;

    ctx.beginPath();
    // Outer semi-circle facing sun
    ctx.arc(0, 0, moonRadius, -Math.PI / 2, Math.PI / 2, false);
    // Inner ellipse back to start
    ctx.ellipse(0, 0, innerRadiusX, moonRadius, 0, Math.PI / 2, -Math.PI / 2, true);
    ctx.closePath();
    ctx.fill();

    ctx.restore();

    // Altitude indicator line from moon down to horizon
    ctx.save();
    ctx.strokeStyle = "rgba(251, 191, 36, 0.4)";
    ctx.setLineDash([2, 4]);
    ctx.beginPath();
    ctx.moveTo(moonX, moonAltitudeY + moonRadius);
    ctx.lineTo(moonX, horizonY);
    ctx.stroke();

    // Altitude text beside moon
    ctx.font = "bold 11px sans-serif";
    ctx.fillStyle = "#fbbf24";
    ctx.fillText(`Hilal: ${this.altitude.toFixed(1)}°`, moonX + moonRadius + 6, moonAltitudeY + 4);
    ctx.font = "10px sans-serif";
    ctx.fillStyle = "#cbd5e1";
    ctx.fillText(`Elongasi: ${this.elongation.toFixed(1)}°`, moonX + moonRadius + 6, moonAltitudeY + 18);
    ctx.restore();

    // Horizon label text
    ctx.fillStyle = "#fed7aa";
    ctx.font = "bold 11px sans-serif";
    ctx.fillText("Ufuk Barat (Arah Matahari Terbenam / Maghrib)", w / 2 - 130, horizonY + 18);
  }
}
