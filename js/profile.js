/**
 * Prophetic Timeline - Mahmoud Pasha al-Falaki Profile Module
 * Vanilla ES6 module handling theme toggle, comprehensive trilingual language switching (MS/EN/AR),
 * and smooth jump navigation with scroll spy.
 */

class ProfileApp {
  constructor() {
    this.currentLang = localStorage.getItem("prophetic_timeline_lang") || "ms";
    this.currentTheme = localStorage.getItem("prophetic_theme") || "dark";
  }

  init() {
    this.applyTheme(this.currentTheme);
    this.applyLanguage(this.currentLang);
    this.setupEventListeners();
    this.setupScrollSpy();
  }

  applyTheme(theme) {
    this.currentTheme = theme;
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("prophetic_theme", theme);
    this.updateThemeButtonLabel();
  }

  toggleTheme() {
    const nextTheme = this.currentTheme === "dark" ? "light" : "dark";
    this.applyTheme(nextTheme);
  }

  updateThemeButtonLabel() {
    const themeToggleBtn = document.getElementById("theme-toggle-btn");
    if (!themeToggleBtn) return;

    const isDark = this.currentTheme === "dark";
    if (this.currentLang === "en") {
      themeToggleBtn.textContent = isDark ? "☀️ Light" : "🌙 Dark";
    } else if (this.currentLang === "ar") {
      themeToggleBtn.textContent = isDark ? "☀️ مضيء" : "🌙 داكن";
    } else {
      themeToggleBtn.textContent = isDark ? "☀️ Cerah" : "🌙 Gelap";
    }
  }

  applyLanguage(lang) {
    if (!["ms", "en", "ar"].includes(lang)) lang = "ms";
    this.currentLang = lang;
    localStorage.setItem("prophetic_timeline_lang", lang);

    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.setAttribute("data-lang", lang);

    // Update active class on language buttons
    const langBtns = document.querySelectorAll(".lang-btn");
    langBtns.forEach((btn) => {
      if (btn.getAttribute("data-lang") === lang) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });

    // Update elements with data-lang-text
    const multiLangElements = document.querySelectorAll("[data-lang-text]");
    multiLangElements.forEach((el) => {
      const text = el.getAttribute(`data-lang-${lang}`);
      if (text) {
        el.innerHTML = text;
      }
    });

    // Toggle blocks with data-lang-block
    const langBlocks = document.querySelectorAll("[data-lang-block]");
    langBlocks.forEach((block) => {
      const blockLang = block.getAttribute("data-lang-block");
      if (blockLang === lang) {
        block.style.display = "";
      } else {
        block.style.display = "none";
      }
    });

    // Update theme button text according to new language
    this.updateThemeButtonLabel();
  }

  setupEventListeners() {
    // Theme toggle button
    const themeBtn = document.getElementById("theme-toggle-btn");
    if (themeBtn) {
      themeBtn.addEventListener("click", () => this.toggleTheme());
    }

    // Language switcher buttons
    const langBtns = document.querySelectorAll(".lang-btn");
    langBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const selectedLang = e.currentTarget.getAttribute("data-lang");
        this.applyLanguage(selectedLang);
      });
    });

    // Smooth scroll for nav pills
    const pillLinks = document.querySelectorAll(".pill-link");
    pillLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const targetId = link.getAttribute("href");
        const targetEl = document.querySelector(targetId);
        if (targetEl) {
          const offsetTop = targetEl.getBoundingClientRect().top + window.pageYOffset - 120;
          window.scrollTo({
            top: offsetTop,
            behavior: "smooth"
          });
        }
      });
    });
  }

  setupScrollSpy() {
    const sections = document.querySelectorAll(".content-section");
    const navPills = document.querySelectorAll(".pill-link");

    if (!("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute("id");
            navPills.forEach((pill) => {
              if (pill.getAttribute("href") === `#${id}`) {
                pill.classList.add("active");
              } else {
                pill.classList.remove("active");
              }
            });
          }
        });
      },
      {
        rootMargin: "-20% 0px -70% 0px"
      }
    );

    sections.forEach((sec) => observer.observe(sec));
  }
}

// Bootstrap on DOM ready
document.addEventListener("DOMContentLoaded", () => {
  const profileApp = new ProfileApp();
  profileApp.init();
});
