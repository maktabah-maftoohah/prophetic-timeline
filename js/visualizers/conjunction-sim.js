/**
 * Prophetic Timeline - Great Conjunction Simulator (Scorpio 571 CE)
 * Visualizes Saturn & Jupiter in the Constellation of Scorpio (برج العقرب).
 * Alignment verified by Mahmoud Pasha al-Falaki using Alexis Bouvard's tables:
 * - Jupiter: 215° 02'
 * - Saturn: 215° 17'
 */

export class ConjunctionSimulator {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
  }

  render() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="conjunction-sim-card">
        <div class="sim-header">
          <div class="sim-badge">Langit Semenanjung Arab • 1 April 571 M / 30 Safar 53 SH</div>
          <div class="sim-phase">Qiran al-Millah al-Islamiyyah (قران الملة) di Buruj Scorpio</div>
        </div>

        <div class="sky-canvas-wrapper">
          <svg viewBox="0 0 500 320" class="scorpio-svg" id="scorpio-chart">
            <defs>
              <radialGradient id="jupiter-glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stop-color="#fff" />
                <stop offset="40%" stop-color="#fed7aa" />
                <stop offset="100%" stop-color="rgba(249, 115, 22, 0)" />
              </radialGradient>
              <radialGradient id="saturn-glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stop-color="#fff" />
                <stop offset="40%" stop-color="#fef08a" />
                <stop offset="100%" stop-color="rgba(234, 179, 8, 0)" />
              </radialGradient>
              <radialGradient id="antares-glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stop-color="#fee2e2" />
                <stop offset="30%" stop-color="#ef4444" />
                <stop offset="100%" stop-color="rgba(239, 68, 68, 0)" />
              </radialGradient>
            </defs>

            <!-- Background Starfield -->
            <rect width="500" height="320" fill="#030712" />
            <g opacity="0.6">
              <circle cx="45" cy="40" r="1" fill="#fff" />
              <circle cx="85" cy="90" r="1.2" fill="#fff" />
              <circle cx="130" cy="30" r="0.8" fill="#fff" />
              <circle cx="410" cy="50" r="1" fill="#fff" />
              <circle cx="460" cy="120" r="1.5" fill="#fff" />
              <circle cx="390" cy="270" r="1.1" fill="#fff" />
              <circle cx="70" cy="250" r="0.9" fill="#fff" />
              <circle cx="160" cy="280" r="1.2" fill="#fff" />
            </g>

            <!-- Scorpio Constellation Lines -->
            <!-- Claws: Graffias (Beta Sco), Dschubba (Delta Sco), Pi Sco -->
            <path d="M 120 70 L 170 110 L 140 160 M 170 110 L 220 135 L 260 160 L 290 200 L 330 230 L 370 240 L 400 220 L 410 185" 
                  stroke="rgba(148, 163, 184, 0.4)" stroke-width="1.5" stroke-dasharray="3,3" fill="none" />

            <!-- Constellation Stars -->
            <!-- Graffias (Beta Sco) -->
            <circle cx="120" cy="70" r="3" fill="#cbd5e1" />
            <text x="100" y="60" fill="#94a3b8" font-size="10">β Sco (Graffias)</text>

            <!-- Dschubba (Delta Sco) -->
            <circle cx="170" cy="110" r="3.5" fill="#e2e8f0" />
            <text x="180" y="105" fill="#94a3b8" font-size="10">δ Sco (Dschubba)</text>

            <!-- Pi Sco -->
            <circle cx="140" cy="160" r="3" fill="#cbd5e1" />

            <!-- Antares (Alpha Sco / Qalb al-Aqrab) -->
            <circle cx="260" cy="160" r="14" fill="url(#antares-glow)" />
            <circle cx="260" cy="160" r="4.5" fill="#f87171" />
            <text x="240" y="190" fill="#fca5a5" font-weight="bold" font-size="11">Antares (قلب العقرب)</text>

            <!-- Shaula & Lesath (Stinger) -->
            <circle cx="400" cy="220" r="3.5" fill="#e2e8f0" />
            <circle cx="410" cy="185" r="4" fill="#f1f5f9" />
            <text x="420" y="190" fill="#94a3b8" font-size="10">Shaula (الشولة)</text>

            <!-- THE CONJUNCTION: Jupiter & Saturn in Scorpio -->
            <!-- Ecliptic Degree: ~215° -->
            <!-- Conjunction target box -->
            <rect x="185" y="45" width="130" height="80" rx="8" fill="rgba(30, 41, 59, 0.7)" stroke="#f59e0b" stroke-width="1" />
            <text x="195" y="62" fill="#fbbf24" font-weight="bold" font-size="11">Qiran Falak 571 M</text>
            <text x="195" y="76" fill="#94a3b8" font-size="9">Longitud Ekliptik: ~215°</text>

            <!-- Saturn (Zuhal) at 215° 17' -->
            <circle cx="230" cy="98" r="12" fill="url(#saturn-glow)" />
            <circle cx="230" cy="98" r="4" fill="#fde047" />
            <!-- Saturn Rings -->
            <ellipse cx="230" cy="98" rx="8" ry="2.5" fill="none" stroke="#fef08a" stroke-width="1.2" transform="rotate(-20 230 98)" />
            <text x="205" y="118" fill="#fef08a" font-size="10">Zuhal (215° 17')</text>

            <!-- Jupiter (Musytari) at 215° 02' -->
            <circle cx="275" cy="95" r="14" fill="url(#jupiter-glow)" />
            <circle cx="275" cy="95" r="5" fill="#fb923c" />
            <text x="255" y="118" fill="#fed7aa" font-size="10">Musytari (215° 02')</text>
          </svg>
        </div>

        <div class="conjunction-details">
          <div class="coord-box">
            <span class="coord-label">Planet Musytari (Jupiter):</span>
            <span class="coord-val">215° 02' (Buruj Scorpio)</span>
          </div>
          <div class="coord-box">
            <span class="coord-label">Planet Zuhal (Saturn):</span>
            <span class="coord-val">215° 17' (Buruj Scorpio)</span>
          </div>
          <div class="coord-box">
            <span class="coord-label">Jarak Sudut (Separasi):</span>
            <span class="coord-val">0° 15' (Hanya 15 minit busur!)</span>
          </div>
        </div>

        <div class="historical-quote">
          <div class="quote-ar" dir="rtl">
            «أقول إن سنة ولادة النبي صلى الله عليه وسلم اتفقت عام الفيل وهي سنة ٨٨٢ للإسكندر، وفيها كان قران بين زحل والمشتري في برج العقرب قبل الولادة بقليل»
          </div>
          <div class="quote-author">— Yahya ibn Abi Shukr al-Maghribi al-Andalusi (Ahli Falak & Matematik Abad ke-13)</div>
        </div>
      </div>
    `;
  }
}
