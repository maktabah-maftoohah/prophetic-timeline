# Prophetic Timeline & Calendar (الخط الزمني للسيرة النبوية والتقويم)

> **Repository:** `maktabah-maftoohah/prophetic-timeline`  
> **Pengehosan:** [https://maktabah-maftoohah.github.io/prophetic-timeline/](https://maktabah-maftoohah.github.io/prophetic-timeline/)  
> **Bahagian daripada:** Inisiatif Khazanah Digital [**Maktabah Maftoohah** (المكتبة المفتوحة)](https://github.com/maktabah-maftoohah)

---

## 1. Pengenalan & Matlamat Aplikasi

**Prophetic Timeline & Calendar** ialah sebuah aplikasi visualisasi interaktif berasaskan web sifar-binaan (*zero-build vanilla ES6*) yang mempersembahkan kronologi sejarah dan peristiwa agung era kenabian bermula daripada zaman purba, Tahun Gajah (*‘Ām al-Fīl*), sehingga kewafatan Junjungan Mulia Nabi Muhammad ﷺ (571–632 Masihi).

Aplikasi ini dibina berasaskan kajian bersejarah ahli falak dan matematik Mesir abad ke-19, **Mahmoud Pasha al-Falaki** (Mahmoud-Bey, 1815–1885 M), yang diselaraskan merentasi 7 sistem penanggalan serentak.

---

## 2. Ciri-Ciri Utama Aplikasi

1. **📜 Garis Masa Interaktif (Timeline View)**:
   - **Zon Purba**: Kad makro bagi peristiwa purba (Penciptaan Dunia, Pembinaan Kaabah, Runtuhnya Empangan Ma'rib, Wafat Ka'b ibn Lu'ayy).
   - **Garis Masa Berketepatan Hari (571–632 M)**: Kad peristiwa dengan penanda hari, jalur padanan 7 kalendar, dan lencana jarak hari dari hari kelahiran (*Mawlid*).
   - **Garis Penyambung Hari (*Day-Count Connectors*)**: Menunjukkan jarak hari mutlak ($14,174\text{ hari}$, $18,780\text{ hari}$, $22,197\text{ hari}$, $22,329\text{ hari}$).

2. **📅 Paparan Kalendar Bulanan ("Google Calendar-Style" Month View)**:
   - Grid 7 hari seminggu dengan cip peristiwa.
   - Pemandu grid kalendar boleh ditukar:
     - **Taqwim Hijri (AH / BH)** (Pilihan Utama/Lalai).
     - **Tahun Gajah (*‘Ām al-Fīl*, 1–63)**.
     - **Masihi Julian** & **Masihi Gregorian**.
   - Lompat pantas ke peristiwa kemuncak (Tahun Gajah, Mawlid, Bi'thah, Hijrah, Gerhana, Haji Wada', Kewafatan).
   - Dialog perincian hari yang memaparkan 7 sistem kalendar bagi mana-mana hari terpilih.

3. **🗓️ Paparan Kalendar Tahunan (12-Month Year View)**:
   - Pandangan mata burung (*bird's-eye view*) 12 bulan mini dalam satu paparan.
   - Penunjuk titik kepadatan peristiwa. Klik mana-mana bulan untuk terus melompat ke paparan bulanan.

4. **🪐 Visualisasi Falak Interaktif (Astro Simulator)**:
   - **Simulator Gerhana Matahari di Madinah (27 Januari 632 M / 29 Syawal 10 H)**: Simulasi kanvas gerhana anulus (litupan 87% / 10.5 jari) pada pagi kewafatan putera Nabi ﷺ, Ibrahim, lengkap dengan hadis Sahih al-Bukhari.
   - **Rajah Buruj Qiran Zuhal & Musytari (1 April 571 M)**: Paparan SVG buruj Scorpio (*al-Aqrab*) menunjukkan kedudukan Zuhal ($215^\circ 17'$) dan Musytari ($215^\circ 02'$) sebelum kelahiran Nabi ﷺ.

5. **🔢 Kalkulator Jarak Hari Interaktif (Day-Count Calculator)**:
   - Pengguna boleh memilih mana-mana dua peristiwa sejarah untuk mengira jarak hari sebenar, kesetaraan tahun qamari ($354.367\text{ hari}$), dan tahun syamsi ($365.2422\text{ hari}$).

6. **🌐 Antara Muka Tiga Bahasa (BM / EN / AR)**:
   - **Bahasa Melayu** (Nomenklatur Islam Nusantara piawai) sebagai bahasa lalai.
   - **Bahasa Inggeris** (English) & **Bahasa Arab** (العربية) dengan tipografi khat Amiri dan sokongan RTL penuh.

---

## 3. Seni Bina & Invarian Organisasi

Sesuai dengan garis panduan `AGENTS.md` pertubuhan Maktabah Maftoohah:
* **Zero-Build Vanilla ES6**: Berfungsi secara *native* di pelayar moden tanpa perlukan kompilasi, bundler, atau kebergantungan runtime Node.js.
* **Laluan Relatif Penuh**: Semua aset diakses menggunakan `./css/...`, `./js/...`, `./data/...` supaya serasi 100% dengan pengehosan subpath GitHub Pages.
* **PWA & Offline First**: Fail `manifest.webmanifest` dan `sw.js` (Service Worker) membolehkan aplikasi dipasang di telefon pintar/komputer dan beroperasi tanpa sambungan internet.
* **Integriti Teks Suci**: Menggunakan teks Al-Quran dan matan hadis autentik tanpa sebarang janaan teks buatan.

---

## 4. Struktur Direktori

```
prophetic-timeline/
├── index.html                    # Kerangka utama aplikasi web
├── manifest.webmanifest          # PWA Web App Manifest
├── sw.js                         # Service Worker (Cache luar talian)
├── README.md                     # Dokumentasi projek
├── css/
│   ├── main.css                  # Gaya asas, tema cerah/gelap, modal
│   ├── timeline.css              # Gaya garis masa menegak & kad
│   ├── calendar.css              # Gaya grid kalendar bulanan & tahunan
│   └── visualizers.css           # Gaya kanvas simulator falak & kalkulator
├── js/
│   ├── app.js                    # Titik masuk modul JavaScript (ES6)
│   ├── core/
│   │   ├── calendar-engine.js    # Enjin matematik penukaran 7 sistem kalendar
│   │   ├── event-store.js        # Pengurus storan data & penapis peristiwa
│   │   └── i18n.js               # Pengurus terjemahan bahasa
│   ├── views/
│   │   ├── timeline-view.js      # Pengendali paparan garis masa
│   │   ├── calendar-month-view.js# Pengendali paparan kalendar bulanan
│   │   └── calendar-year-view.js # Pengendali paparan kalendar tahunan
│   ├── visualizers/
│   │   ├── eclipse-sim.js        # Simulator kanvas gerhana matahari 632 M
│   │   ├── conjunction-sim.js    # Rajah SVG buruj qiran Scorpio 571 M
│   │   └── day-calculator.js     # Kalkulator jarak hari interaktif
│   └── i18n/
│       ├── ms.js                 # Penterjemahan Bahasa Melayu (Lalai)
│       ├── en.js                 # Penterjemahan Bahasa Inggeris
│       └── ar.js                 # Penterjemahan Bahasa Arab
└── data/
    └── events.json               # Pangkalan data 25 peristiwa Mahmoud Pasha al-Falaki
```

---

## 5. Menjalankan Aplikasi Secara Tempatan

Anda boleh menjalankan aplikasi ini serta-merta menggunakan pelayan HTTP terbina dalam Python:

```bash
cd prophetic-timeline
python scripts/serve.py --port 8000
```

Buka pelayar web di:
```
http://localhost:8000
```
