/**
 * Prophetic Timeline - Medina Solar Eclipse Simulator
 * Simulates the 27 January 632 CE (29 Shawwal 10 AH) Annular Solar Eclipse over Medina.
 * Peak: 08:30 AM Medina local time | Magnitude: 0.87 (10.5 digits out of 12).
 */

export class EclipseSimulator {
  constructor(canvasContainerId) {
    this.container = document.getElementById(canvasContainerId);
    this.progress = 0.5; // 0.0 to 1.0 (0.5 is peak eclipse)
    this.isPlaying = false;
    this.animationId = null;
    this.canvas = null;
    this.ctx = null;
  }

  render() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="eclipse-sim-card">
        <div class="sim-header">
          <div class="sim-badge">Madinah al-Munawwarah • 27 Jan 632 M / 29 Syawal 10 H</div>
          <div class="sim-phase" id="eclipse-phase-text">Kemuncak Gerhana Anulus (Litupan 87%)</div>
        </div>

        <div class="canvas-wrapper">
          <canvas id="eclipse-canvas" width="400" height="300"></canvas>
        </div>

        <div class="sim-controls">
          <div class="time-readout">
            <span id="eclipse-time">08:30 AM</span>
            <span id="eclipse-obscuration">Litupan: 87.5% (10.5 / 12 أصابع)</span>
          </div>
          <input type="range" id="eclipse-slider" min="0" max="100" value="50" class="sim-slider">
          <div class="btn-group">
            <button id="eclipse-play-btn" class="btn btn-sm btn-primary">▶ Main</button>
            <button id="eclipse-reset-btn" class="btn btn-sm btn-outline">↺ Semula (Kemuncak)</button>
          </div>
        </div>

        <div class="hadith-callout">
          <div class="arabic-matn" dir="rtl">
            «إِنَّ الشَّمْسَ وَالْقَمَرَ آيَتَانِ مِنْ آيَاتِ اللَّهِ، لاَ يَنْكَسِفَانِ لِمَوْتِ أَحَدٍ وَلاَ لِحَيَاتِهِ، فَإِذَا رَأَيْتُمُوهُمَا فَادْعُوا اللَّهَ وَصَلُّوا حَتَّى يَنْجَلِيَ»
          </div>
          <div class="translation-text">
            "Sesungguhnya matahari dan bulan adalah dua tanda daripada tanda-tanda kebesaran Allah; kedua-duanya tidak gerhana kerana kematian seseorang ataupun kelahirannya. Maka apabila kamu melihatnya, berdoalah kepada Allah dan solatlah sehingga ia kembali terang."
            <span class="source-tag">— <a href="https://maktabah-maftoohah.github.io/sahih-al-bukhari/1043" target="_blank" rel="noopener noreferrer" class="hadith-link">Sahih al-Bukhari (Kitab al-Kusuf, No. 1043) ↗</a></span>
          </div>
        </div>
      </div>
    `;

    this.canvas = document.getElementById("eclipse-canvas");
    this.ctx = this.canvas.getContext("2d");
    this.setupListeners();
    this.draw();
  }

  setupListeners() {
    const slider = document.getElementById("eclipse-slider");
    const playBtn = document.getElementById("eclipse-play-btn");
    const resetBtn = document.getElementById("eclipse-reset-btn");

    if (slider) {
      slider.addEventListener("input", (e) => {
        this.progress = parseFloat(e.target.value) / 100;
        this.pause();
        this.updateReadouts();
        this.draw();
      });
    }

    if (playBtn) {
      playBtn.addEventListener("click", () => {
        if (this.isPlaying) {
          this.pause();
        } else {
          this.play();
        }
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        this.pause();
        this.progress = 0.5;
        if (slider) slider.value = 50;
        this.updateReadouts();
        this.draw();
      });
    }
  }

  play() {
    this.isPlaying = true;
    const playBtn = document.getElementById("eclipse-play-btn");
    if (playBtn) playBtn.textContent = "⏸ Henti";

    const animate = () => {
      this.progress += 0.003;
      if (this.progress > 1.0) {
        this.progress = 0;
      }
      const slider = document.getElementById("eclipse-slider");
      if (slider) slider.value = this.progress * 100;
      this.updateReadouts();
      this.draw();

      if (this.isPlaying) {
        this.animationId = requestAnimationFrame(animate);
      }
    };
    this.animationId = requestAnimationFrame(animate);
  }

  pause() {
    this.isPlaying = false;
    if (this.animationId) cancelAnimationFrame(this.animationId);
    const playBtn = document.getElementById("eclipse-play-btn");
    if (playBtn) playBtn.textContent = "▶ Main";
  }

  updateReadouts() {
    const timeEl = document.getElementById("eclipse-time");
    const obsEl = document.getElementById("eclipse-obscuration");
    const phaseEl = document.getElementById("eclipse-phase-text");

    // 0.0 -> 07:30 AM, 0.5 -> 08:30 AM, 1.0 -> 09:30 AM
    const totalMinutes = 7 * 60 + 30 + this.progress * 120;
    const hours = Math.floor(totalMinutes / 60);
    const mins = Math.floor(totalMinutes % 60);
    const formattedTime = `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")} AM`;

    // Obscuration curve peaked at 87.5% at progress=0.5
    const distFromPeak = Math.abs(this.progress - 0.5) * 2; // 0 at peak, 1 at ends
    const obscuration = Math.max(0, (1 - distFromPeak * 1.5) * 87.5).toFixed(1);

    if (timeEl) timeEl.textContent = formattedTime;
    if (obsEl) obsEl.textContent = `Litupan: ${obscuration}% (${(obscuration * 0.12).toFixed(1)} / 12 أصابع)`;

    if (phaseEl) {
      if (distFromPeak < 0.1) {
        phaseEl.textContent = "Kemuncak Gerhana Anulus (Litupan Maksimum 87.5%)";
        phaseEl.style.color = "#f59e0b";
      } else if (this.progress < 0.5) {
        phaseEl.textContent = "Fasa Gerhana Separa (Bulan Masuk)";
        phaseEl.style.color = "var(--text-secondary)";
      } else {
        phaseEl.textContent = "Fasa Gerhana Separa (Bulan Keluar)";
        phaseEl.style.color = "var(--text-secondary)";
      }
    }
  }

  draw() {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const sunRadius = 70;
    const moonRadius = 65; // Slightly smaller -> annular eclipse!

    ctx.clearRect(0, 0, w, h);

    // Sky Background (dims as eclipse progresses)
    const distFromPeak = Math.abs(this.progress - 0.5) * 2;
    const skyDarkness = 1 - distFromPeak * 0.6; // 0.4 to 1.0 darkness
    const r = Math.floor(15 * (1 - skyDarkness * 0.5));
    const g = Math.floor(25 * (1 - skyDarkness * 0.5));
    const b = Math.floor(45 * (1 - skyDarkness * 0.5));
    ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
    ctx.fillRect(0, 0, w, h);

    // Sun Corona / Glow
    const glowGrad = ctx.createRadialGradient(cx, cy, sunRadius * 0.8, cx, cy, sunRadius * 2.2);
    glowGrad.addColorStop(0, "rgba(255, 220, 100, 0.9)");
    glowGrad.addColorStop(0.3, "rgba(251, 191, 36, 0.4)");
    glowGrad.addColorStop(0.7, "rgba(245, 158, 11, 0.1)");
    glowGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, sunRadius * 2.2, 0, Math.PI * 2);
    ctx.fill();

    // Sun Disk
    const sunGrad = ctx.createRadialGradient(cx - 15, cy - 15, 10, cx, cy, sunRadius);
    sunGrad.addColorStop(0, "#fffbeb");
    sunGrad.addColorStop(0.5, "#fde68a");
    sunGrad.addColorStop(0.9, "#f59e0b");
    sunGrad.addColorStop(1, "#d97706");
    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, sunRadius, 0, Math.PI * 2);
    ctx.fill();

    // Moon Position (sweeping from right-bottom to left-top across sun)
    // progress: 0.0 (far right) -> 0.5 (center offset by 5px) -> 1.0 (far left)
    const moonX = cx + (0.5 - this.progress) * (sunRadius * 3.4);
    const moonY = cy + (0.5 - this.progress) * (sunRadius * 0.7);

    // Moon Disk (Dark silhouette)
    const moonGrad = ctx.createRadialGradient(moonX, moonY, moonRadius * 0.5, moonX, moonY, moonRadius);
    moonGrad.addColorStop(0, "#111827");
    moonGrad.addColorStop(0.9, "#030712");
    moonGrad.addColorStop(1, "rgba(3, 7, 18, 0.95)");
    ctx.fillStyle = moonGrad;
    ctx.beginPath();
    ctx.arc(moonX, moonY, moonRadius, 0, Math.PI * 2);
    ctx.fill();

    // Ring of fire highlight at peak
    if (distFromPeak < 0.15) {
      ctx.strokeStyle = "rgba(255, 235, 150, 0.7)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(cx, cy, sunRadius - 1, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
}
