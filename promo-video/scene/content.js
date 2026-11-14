// Words, pictures and cue points of the two cuts. Cue numbers are word indexes
// in the captions of each narration segment (see timeline.<lang>.json).
const PLATES = '/';            // the site root: plates are used straight from the site
const UI = '../build/ui/';     // phone screenshots from tools/capture_ui.js

const CITIES = [               // where the guide's Qur'ans are kept today [lon, lat]
  { id: 'fez', ll: [-5.0, 34.03], ar: 'فاس', en: 'Fez' },
  { id: 'jerusalem', ll: [35.23, 31.78], ar: 'القدس', en: 'Jerusalem', label: [-1, -1] },
  { id: 'escorial', ll: [-4.15, 40.59], ar: 'الإسكوريال', en: 'El Escorial', label: [-1, 1] },
  { id: 'munich', ll: [11.58, 48.14], ar: 'ميونخ', en: 'Munich', label: [1, -1] },
  { id: 'istanbul', ll: [28.98, 41.01], ar: 'إسطنبول', en: 'Istanbul', label: [1, -1] },
  { id: 'cairo', ll: [31.24, 30.04], ar: 'القاهرة', en: 'Cairo', label: [-1, 1.1] },
  { id: 'medina', ll: [39.61, 24.47], ar: 'المدينة', en: 'Medina', label: [1, 1.1] },
  { id: 'doha', ll: [51.53, 25.29], ar: 'الدوحة', en: 'Doha', label: [1, 0.2] },
  { id: 'paris', ll: [2.35, 48.86], ar: 'باريس', en: 'Paris', label: [-1, 0.35] },
  { id: 'london', ll: [-0.13, 51.51], ar: 'لندن', en: 'London', label: [-1, -1] },
  { id: 'uppsala', ll: [17.64, 59.86], ar: 'أوبسالا', en: 'Uppsala', label: [1, -1] },
  { id: 'dresden', ll: [13.74, 51.05], ar: 'درسدن', en: 'Dresden', label: [1, -1], quiet: true },
  { id: 'madrid', ll: [-3.70, 40.42], ar: 'مدريد', en: 'Madrid', quiet: true },
  { id: 'tunis', ll: [10.18, 36.81], ar: 'تونس', en: 'Tunis', quiet: true },
  { id: 'newyork', ll: [-74.0, 40.71], ar: 'نيويورك', en: 'New York', label: [-1, -1] },
  { id: 'philadelphia', ll: [-75.17, 39.95], ar: 'فيلادلفيا', en: 'Philadelphia', quiet: true },
  { id: 'houston', ll: [-95.37, 29.76], ar: 'هيوستن', en: 'Houston', label: [-1, 1] },
  { id: 'losangeles', ll: [-118.24, 34.05], ar: 'لوس أنجلوس', en: 'Los Angeles', quiet: true },
];

const ERAS = [                 // colours are the site's own era accents (dark theme)
  { key: 'adarisa', a: 788, b: 985, color: '#d39a72', ar: 'الأدارسة', en: 'Idrisids' },
  { key: 'murabitun', a: 1056, b: 1147, color: '#8fa8e0', ar: 'المرابطون', en: 'Almoravids' },
  { key: 'muwahhidun', a: 1130, b: 1269, color: '#e08a6e', ar: 'الموحدون', en: 'Almohads' },
  { key: 'marini', a: 1248, b: 1465, color: '#62a88f', ar: 'بنو مرين', en: 'Marinids' },
  { key: 'wattasi', a: 1472, b: 1554, color: '#6fbec0', ar: 'الوطاسيون', en: 'Wattasids' },
  { key: 'saadi', a: 1510, b: 1659, color: '#e3808f', ar: 'السعديون', en: 'Saadians' },
  { key: 'alawi', a: 1666, b: 2026, color: '#c79ad6', ar: 'العلويون', en: 'Alaouites' },
];

// every Qur'an in the guide: [era, Gregorian year, group] (from the era data files)
const ITEMS = [
  ['adarisa', 900, 'edge'],
  ['murabitun', 1140, 'surviving'], ['murabitun', 1138, 'edge'], ['murabitun', 1143, 'edge'], ['murabitun', 1095, 'edge'], ['murabitun', 1090, 'edge'],
  ['muwahhidun', 1256, 'surviving'], ['muwahhidun', 1203, 'surviving'], ['muwahhidun', 1191, 'surviving'], ['muwahhidun', 1182, 'surviving'], ['muwahhidun', 1200, 'surviving'],
  ['muwahhidun', 1226, 'edge'], ['muwahhidun', 1230, 'edge'], ['muwahhidun', 1220, 'edge'], ['muwahhidun', 1223, 'edge'], ['muwahhidun', 1235, 'edge'], ['muwahhidun', 1184, 'edge'], ['muwahhidun', 1160, 'edge'], ['muwahhidun', 1164, 'edge'], ['muwahhidun', 1170, 'edge'],
  ['marini', 1306, 'surviving'], ['marini', 1345, 'surviving'], ['marini', 1318, 'surviving'],
  ['marini', 1304, 'lost'], ['marini', 1339, 'lost'], ['marini', 1340, 'lost'], ['marini', 1342, 'lost'], ['marini', 1350, 'lost'],
  ['marini', 1310, 'edge'], ['marini', 1348, 'edge'], ['marini', 1304, 'edge'], ['marini', 1327, 'edge'], ['marini', 1250, 'edge'], ['marini', 1287, 'edge'],
  ['wattasi', 1542, 'edge'], ['wattasi', 1472, 'edge'],
  ['saadi', 1599, 'surviving'], ['saadi', 1568, 'surviving'], ['saadi', 1560, 'surviving'], ['saadi', 1561, 'surviving'], ['saadi', 1616, 'surviving'], ['saadi', 1653, 'surviving'],
  ['saadi', 1603, 'edge'], ['saadi', 1574, 'edge'], ['saadi', 1635, 'edge'], ['saadi', 1619, 'edge'], ['saadi', 1606, 'edge'], ['saadi', 1590, 'edge'], ['saadi', 1559, 'edge'], ['saadi', 1659, 'edge'], ['saadi', 1654, 'edge'],
  ['alawi', 1730, 'surviving'], ['alawi', 1822, 'surviving'], ['alawi', 1850, 'surviving'],
  ['alawi', 1812, 'edge'], ['alawi', 1879, 'edge'], ['alawi', 1929, 'edge'], ['alawi', 1970, 'edge'], ['alawi', 1996, 'edge'], ['alawi', 1999, 'edge'], ['alawi', 2010, 'edge'],
  ['alawi', 1742, 'lost'], ['alawi', 1725, 'lost'], ['alawi', 1885, 'lost'],
];

const CONTENT = {
  ar: {
    brand: 'مصاحف المغرب',
    url: 'masahif-al-maghrib.com',
    tagline: 'دليل مصوَّر للمصاحف المؤرَّخة في عصور المغرب',
    span: 'من الأدارسة إلى العلويين',
    hook: [
      { city: 'jerusalem', name: 'القدس', place: 'المتحف الإسلامي بالمسجد الأقصى',
        title: 'الربعة المغربية بخط السلطان أبي الحسن المريني', date: '745هـ / 1345م',
        img: PLATES + 'marini/plates/aq-saffat.jpg', bg: 'img/bg-aqsa.jpg', w: 858, h: 957, focus: [50, 45] },
      { city: 'escorial', name: 'إسبانيا', place: 'دير الإسكوريال · المكتبة الملكية',
        title: 'خاتمة مصحف خزانة السلطان أحمد المنصور الذهبي', date: '1008هـ / 1599م',
        img: '../assets/mansur-colophon-tall.jpg', bg: 'img/bg-mansur.jpg', w: 1400, h: 2389, focus: [50, 30] },
      { city: 'munich', name: 'ميونخ', place: 'مكتبة الدولة البافارية',
        title: 'مصحف خزانة السلطان أبي يعقوب يوسف المريني', date: '705هـ / 1306م',
        img: PLATES + 'marini/plates/mc-fatiha.jpg', bg: 'img/bg-munich.jpg', w: 1800, h: 1287, focus: [50, 50] },
    ],
    stats: [{ n: 12, label: 'قرنًا' }, { n: 7, label: 'عصور' }, { n: 60, plus: true, label: 'مصحفًا' }],
    legend: { surviving: 'باقية', lost: 'مفقودة', edge: 'على حافة الشرط' },
    treasures: {
      caliph: { name: 'الخليفة الموحدي المرتضى', note: 'ربعة بخط يده · 654هـ', img: PLATES + 'muwahhidun/plates/mt-juz1.jpg' },
      sultan: { name: 'السلطان المريني أبو الحسن', note: 'ربعة بخط يده · 745هـ', img: PLATES + 'marini/plates/aq-juz2.jpg' },
      gold: { name: 'بالذهب على اللازورد', note: 'خاتمة مصحف المنصور الذهبي · 1008هـ', img: '../assets/mansur-colophon-wide.jpg' },
      silver: { name: 'بالفضة على ورق أخضر', note: 'المصحف الأخضر · القرن التاسع الهجري', img: PLATES + 'wattasi/plates/gr-text.jpg' },
    },
    callouts: ['بطاقة لكل مصحف', 'عيّنات مقرّبة من الخط', 'روابط إلى النسخ المرقمنة'],
    author: {
      kicker: 'عن المُعِدّ', name: 'إبراهيم حسني إدريسي',
      role: 'خطاط وباحث في المخطوطات والخطوط المغربية', city: 'فاس',
      badges: [
        { icon: 'pen', text: 'أستاذ الخطوط المغربية: المبسوط والمجوهر والثلث المغربي والأندلسي' },
        { icon: 'cap', text: 'شهادة التكوين في فن الخط، جامع القرويين بفاس', year: '2019' },
        { icon: 'medal', text: 'الجائزة التشجيعية لجائزة محمد السادس لفن الخط المغربي', year: '2025' },
      ],
    },
    chips: ['موثّق المصادر', 'عربي · English'],
    credits: { role: 'تطوير الموقع وإنتاج الفيديو', name: 'خالد بن جلون', from: 'مطوّر من فاس',
      images: 'صور المخطوطات من المكتبات والمتاحف المذكورة في الموقع' },
    cues: { hook: [4, 5, 1], scatter: 2, gather: 6, brand: 9, stats: [0, 3, 5], surviving: 9, lost: 12,
      caliph: 4, sultan: 6, gold: 7, silver: 12, card: 0, samples: 5, links: 10,
      name: 5, role: 3, teach: 8, city: 11, grad: 12, award: 22, sourced: 0, bilingual: 2 },
  },
  en: {
    brand: 'Masahif al-Maghrib',
    url: 'masahif-al-maghrib.com',
    tagline: 'An illustrated guide to the dated Qur’ans of Morocco',
    span: 'from the Idrisids to the Alaouites',
    hook: [
      { city: 'jerusalem', name: 'Jerusalem', place: 'Islamic Museum, al-Aqsa Mosque',
        title: 'The Maghribi rabʿa, in the hand of the Marinid sultan Abu al-Hasan', date: '745 AH / 1345 CE',
        img: PLATES + 'marini/plates/aq-saffat.jpg', bg: 'img/bg-aqsa.jpg', w: 858, h: 957, focus: [50, 45] },
      { city: 'escorial', name: 'Spain', place: 'El Escorial · Royal Library',
        title: 'Colophon of the Qur’an made for the library of Sultan Ahmad al-Mansur', date: '1008 AH / 1599 CE',
        img: '../assets/mansur-colophon-tall.jpg', bg: 'img/bg-mansur.jpg', w: 1400, h: 2389, focus: [50, 30] },
      { city: 'munich', name: 'Munich', place: 'Bavarian State Library',
        title: 'The Qur’an made for the library of the Marinid sultan Abu Yaʿqub Yusuf', date: '705 AH / 1306 CE',
        img: PLATES + 'marini/plates/mc-fatiha.jpg', bg: 'img/bg-munich.jpg', w: 1800, h: 1287, focus: [50, 50] },
    ],
    stats: [{ n: 12, label: 'centuries' }, { n: 7, label: 'dynasties' }, { n: 60, plus: true, label: 'Qur’ans' }],
    legend: { surviving: 'surviving', lost: 'lost', edge: 'on the edge' },
    treasures: {
      caliph: { name: 'The Almohad caliph al-Murtada', note: 'in his own hand · 654 AH', img: PLATES + 'muwahhidun/plates/mt-juz1.jpg' },
      sultan: { name: 'The Marinid sultan Abu al-Hasan', note: 'in his own hand · 745 AH', img: PLATES + 'marini/plates/aq-juz2.jpg' },
      gold: { name: 'Gold on lapis blue', note: 'Colophon of al-Mansur’s Qur’an · 1008 AH', img: '../assets/mansur-colophon-wide.jpg' },
      silver: { name: 'Silver on green paper', note: 'The Green Qur’an · 9th century AH', img: PLATES + 'wattasi/plates/gr-text.jpg' },
    },
    callouts: ['A card for every Qur’an', 'Close-ups of the script', 'Links to digitized copies'],
    author: {
      kicker: 'About the author', name: 'Ibrahim Hassani Idrissi',
      role: 'Calligrapher and manuscript researcher', city: 'Fez',
      badges: [
        { icon: 'pen', text: 'Teaches Maghribi scripts: Mabsut, Mujawhar, Maghribi Thuluth and Andalusi' },
        { icon: 'cap', text: 'Diploma in the Art of Calligraphy, al-Qarawiyyin, Fez', year: '2019' },
        { icon: 'medal', text: 'Encouragement Prize, Mohammed VI Award for Maghribi Calligraphy', year: '2025' },
      ],
    },
    chips: ['Fully sourced', 'English · عربي'],
    credits: { role: 'Website development & video production', name: 'Khalid Benjelloun', from: 'Developer from Fez',
      images: 'Manuscript images courtesy of the libraries and museums credited on the site' },
    cues: { hook: [8, 7, 3], scatter: 4, gather: 8, brand: 14, stats: [0, 2, 4], surviving: 9, lost: 12,
      caliph: 5, sultan: 8, gold: 13, silver: 20, card: 0, samples: 9, links: 15,
      name: 2, role: 5, city: 10, teach: 12, grad: 16, award: 26, sourced: 0, bilingual: 3 },
  },
};
