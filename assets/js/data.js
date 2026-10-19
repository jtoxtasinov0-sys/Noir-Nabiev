/*
  Amerika bo‘ylab 80 kun: barcha raqamlar va ro‘yxatlar shu faylda.
  Narxni, smetani yoki statistikani o‘zgartirish uchun faqat shu yerni tahrirlang.
  Matnlar { uz: "...", ru: "..." } ko‘rinishida yoziladi.
*/
window.DATA = {

  /* ---------- 2-slayd: marshrut (tartib = sayohat yo‘nalishi) ---------- */
  cities: [
    { id: "ny", en: "NEW YORK, NY", days: [1, 7],
      name: { uz: "Nyu-York", ru: "Нью-Йорк" },
      tag:  { uz: "Pilot qism: limitsiz karta va 0 dollar. Manhetten qoidalari bilan.", ru: "Пилот: безлимитная карта против нуля долларов по правилам Манхэттена." } },
    { id: "dc", en: "WASHINGTON, D.C.", days: [8, 11],
      name: { uz: "Vashington", ru: "Вашингтон" },
      tag:  { uz: "Kapitoliy, Oq uy va bepul muzeylar. Tarixni 0 dollarga o‘rganish.", ru: "Капитолий, Белый дом и бесплатные музеи. История за ноль долларов." } },
    { id: "miami", en: "MIAMI, FL", days: [12, 17],
      name: { uz: "Mayami", ru: "Майами" },
      tag:  { uz: "Okean, Art Deco va yaxtalar. Dam olish uchun pul kerakmi?", ru: "Океан, ар-деко и яхты. Нужны ли деньги, чтобы отдохнуть?" } },
    { id: "houston", en: "HOUSTON, TX", days: [18, 21],
      name: { uz: "Xyuston", ru: "Хьюстон" },
      tag:  { uz: "NASA kosmik markazi va haqiqiy Texas barbekyusi.", ru: "Космический центр NASA и настоящее техасское барбекю." } },
    { id: "chicago", en: "CHICAGO, IL", days: [22, 26],
      name: { uz: "Chikago", ru: "Чикаго" },
      tag:  { uz: "Shamollar shahri: osmono‘par binolar va deep-dish pitsa.", ru: "Город ветров: небоскрёбы и пицца deep-dish." } },
    { id: "colorado", en: "COLORADO", days: [27, 31],
      name: { uz: "Kolorado", ru: "Колорадо" },
      tag:  { uz: "Qoyali tog‘lar: kemping, sovuq va birinchi tog‘ sinovi.", ru: "Скалистые горы: кемпинг, холод и первое горное испытание." } },
    { id: "utah", en: "UTAH", days: [32, 35],
      name: { uz: "Yuta", ru: "Юта" },
      tag:  { uz: "Monument Valley: Forrest Gamp yo‘li bo‘ylab road-trip.", ru: "Долина монументов: роуд-трип по дороге Форреста Гампа." } },
    { id: "arizona", en: "ARIZONA", days: [36, 40],
      name: { uz: "Arizona", ru: "Аризона" },
      tag:  { uz: "Katta Kanyon: tongni kim birinchi kutib oladi?", ru: "Гранд-Каньон: кто первым встретит рассвет?" } },
    { id: "vegas", en: "LAS VEGAS, NV", days: [41, 45],
      name: { uz: "Las-Vegas", ru: "Лас-Вегас" },
      tag:  { uz: "Neon shahri: shou, chiroqlar va tungi challenge.", ru: "Город неона: шоу, огни и ночной челлендж." } },
    { id: "la", en: "LOS ANGELES, CA", days: [46, 53],
      name: { uz: "Los-Anjeles", ru: "Лос-Анджелес" },
      tag:  { uz: "Gollivud: Javokhirning shahri. Amerika ichkaridan.", ru: "Голливуд: город Джавохира. Америка изнутри." } },
    { id: "sf", en: "SAN FRANCISCO, CA", days: [54, 58],
      name: { uz: "San-Fransisko", ru: "Сан-Франциско" },
      tag:  { uz: "Oltin Darvoza ko‘prigi va Alkatras siri.", ru: "Мост Золотые Ворота и тайна Алькатраса." } },
    { id: "oregon", en: "OREGON", days: [59, 62],
      name: { uz: "Oregon", ru: "Орегон" },
      tag:  { uz: "Yovvoyi qirg‘oq: telefon va internetsiz bir kun.", ru: "Дикое побережье: день без телефона и интернета." } },
    { id: "washington", en: "SEATTLE, WA", days: [63, 67],
      name: { uz: "Vashington shtati", ru: "Штат Вашингтон" },
      tag:  { uz: "Sietl: kofe poytaxti va Reynir tog‘i.", ru: "Сиэтл: кофейная столица и гора Рейнир." } },
    { id: "alaska", en: "ALASKA", days: [68, 73],
      name: { uz: "Alyaska", ru: "Аляска" },
      tag:  { uz: "Qutb shafag‘i, muzliklar va sovuq bilan sinov.", ru: "Северное сияние, ледники и испытание холодом." } },
    { id: "hawaii", en: "HAWAII", days: [74, 80],
      name: { uz: "Gavayi", ru: "Гавайи" },
      tag:  { uz: "Final: okean, vulqonlar va mavsum g‘olibi.", ru: "Финал: океан, вулканы и победитель сезона." } }
  ],

  /* ---------- 4-slayd: statistika (YouTube Studio + Instagram Insights) ---------- */
  months: {
    uz: ["yan", "fev", "mar", "apr", "may", "iyn", "iyl", "avg", "sen", "okt", "noy", "dek"],
    ru: ["янв", "фев", "мар", "апр", "май", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"]
  },
  countries: {
    uz: { UZ: "O‘zbekiston", RU: "Rossiya", KZ: "Qozog‘iston", KG: "Qirg‘iziston", TJ: "Tojikiston" },
    ru: { UZ: "Узбекистан", RU: "Россия", KZ: "Казахстан", KG: "Кыргызстан", TJ: "Таджикистан" }
  },
  ages: ["13-17", "18-24", "25-34", "35-44", "45-54", "55-64", "65+"],

  panels: [
    {
      id: "noir-yt", who: "noir", platform: "youtube",
      tab: { uz: "Noir · YouTube", ru: "Noir · YouTube" },
      kpis: [
        { v: 22313628, fmt: "full", l: { uz: "ko‘rishlar", ru: "просмотров" } },
        { v: 2.5, fmt: "mln", l: { uz: "soat tomosha", ru: "часов просмотра" } },
        { v: 270.1, fmt: "mln", l: { uz: "taassurot", ru: "показов" } },
        { v: "6:55", fmt: "text", l: { uz: "o‘rtacha ko‘rish vaqti", ru: "среднее время просмотра" } }
      ],
      line: { kind: "noir", title: { uz: "Kunlik ko‘rishlar, oktabr 2024 - oktabr 2026", ru: "Просмотры в день, октябрь 2024 - октябрь 2026" },
              ticks: [0, 125000, 250000, 375000],
              xlabels: [[0, 9, 2024], [0.166, 1, 2025], [0.333, 5, 2025], [0.5, 9, 2025], [0.667, 1, 2026], [0.833, 5, 2026], [1, 9, 2026]] },
      videos: [
        { id: "GNjnoOrpymE", t: "ENG ACHCHIQ SHOW", v: 2157771 },
        { id: "XARJbDIfq8Q", t: "Daxshatli yoki Mazali", v: 2148119 },
        { id: "ObPlp0EZmnc", t: "NOIR OSHXONASI | Dudoshli", v: 2020320 },
        { id: "eGiwa7Z8Urs", t: "NOIR SANTA", v: 1786143 }
      ],
      gender: { m: 63.8, f: 36.2 },
      age: [15.7, 24.4, 25.4, 24.3, 5.9, 2.6, 1.7],
      geo: [["UZ", 93.2], ["KG", 3.4], ["RU", 0.8], ["KZ", 0.5], ["TJ", 0.4]],
      insight: { v: "74%", l: { uz: "tomoshabinlar 18-44 yoshda: eng faol xarid qiluvchi auditoriya", ru: "зрителей в возрасте 18-44 лет: самая платёжеспособная аудитория" } }
    },
    {
      id: "noir-ig", who: "noir", platform: "instagram",
      tab: { uz: "Noir · Instagram", ru: "Noir · Instagram" },
      kpis: [
        { v: 557000, fmt: "full", suffix: "+", l: { uz: "obunachi", ru: "подписчиков" } },
        { v: 4.7, fmt: "mln", l: { uz: "eng ko‘p ko‘rilgan Reels (30 kun)", ru: "лучший Reels (30 дней)" } },
        { v: 16.1, fmt: "mln", l: { uz: "top-5 Reels ko‘rishlari (30 kun)", ru: "просмотров топ-5 Reels (30 дней)" } },
        { v: 253, fmt: "full", l: { uz: "nashr", ru: "публикации" } }
      ],
      reels: { title: { uz: "Top Reels, oxirgi 30 kun", ru: "Топ Reels за 30 дней" }, items: [
        { t: { uz: "Sinov Reels, 25.09", ru: "Пробный Reels, 25.09" }, v: 4.7 },
        { t: { uz: "Sinov Reels, oktabr", ru: "Пробный Reels, октябрь" }, v: 3.9 },
        { t: { uz: "Kajel old money stilida", ru: "Kajel old money stilida" }, v: 3.7 },
        { t: { uz: "Mani honam yo‘q qiberila dib...", ru: "Mani honam yo‘q qiberila dib..." }, v: 2.0 },
        { t: { uz: "Usta akalarni ishiga baho berib...", ru: "Usta akalarni ishiga baho berib..." }, v: 1.8 }
      ] },
      langs: { title: { uz: "Auditoriya tili", ru: "Язык аудитории" }, items: [
        [{ uz: "O‘zbek", ru: "Узбекский" }, 75.3], [{ uz: "Rus", ru: "Русский" }, 19.8], [{ uz: "Ingliz", ru: "Английский" }, 1.7]
      ] },
      gender: { m: 82.4, f: 17.6 },
      age: [4.7, 20.8, 49.8, 19.2, 3.7, 1.1, 0.8],
      geo: [["UZ", 84.2], ["RU", 6.8], ["KZ", 1.8], ["KG", 1.6], ["TJ", 1.1]],
      cities: { title: { uz: "Top shaharlar", ru: "Топ городов" }, items: [
        [{ uz: "Toshkent", ru: "Ташкент" }, 23.9], [{ uz: "Yangiyer", ru: "Янгиер" }, 4.0], [{ uz: "Andijon", ru: "Андижан" }, 3.6],
        [{ uz: "Samarqand", ru: "Самарканд" }, 3.5], [{ uz: "Namangan", ru: "Наманган" }, 2.5]
      ] }
    },
    {
      id: "jav-ig", who: "javokhir", platform: "instagram",
      tab: { uz: "Javokhir · Instagram", ru: "Javokhir · Instagram" },
      kpis: [
        { v: 37225536, fmt: "full", l: { uz: "ko‘rish, 60 kunda", ru: "просмотров за 60 дней" } },
        { v: 9276682, fmt: "full", l: { uz: "qamrov (noyob tomoshabin)", ru: "охват (уникальные зрители)" } },
        { v: 1.86, fmt: "mln", l: { uz: "interaksiya", ru: "взаимодействий" } },
        { v: 27543, fmt: "full", prefix: "+", l: { uz: "yangi obunachi, 60 kunda", ru: "новых подписчиков за 60 дней" } }
      ],
      line: { kind: "jav", title: { uz: "Kunlik ko‘rishlar, 13 avgust - 11 oktabr", ru: "Просмотры в день, 13 августа - 11 октября" },
              ticks: [0, 2300000, 4600000],
              xlabels: [[0, 7, 13], [0.49, 8, 11], [1, 9, 11]] },
      types: { title: { uz: "Kontent turi bo‘yicha ko‘rishlar", ru: "Просмотры по типу контента" }, items: [
        ["Reels", 34000000], [{ uz: "Storislar", ru: "Истории" }, 2800000], [{ uz: "Postlar", ru: "Посты" }, 229000]
      ] },
      gender: { m: 75.2, f: 24.8 },
      age: [4.9, 22.1, 47.2, 19.4, 4.3, 1.3, 0.8],
      geo: [["UZ", 81.8], ["RU", 7.2], ["KG", 2.7], ["KZ", 1.7], ["TJ", 1.5]],
      reels: { title: { uz: "Top Reels", ru: "Топ Reels" }, items: [
        { t: { uz: "FIFA-2026: Portugaliya va O‘zbekiston", ru: "FIFA-2026: Португалия и Узбекистан" }, v: 11 },
        { t: { uz: "Back to Alcatraz!", ru: "Back to Alcatraz!" }, v: 6.1 },
        { t: { uz: "Bruce Lee nima bo‘lib vafot etgan...", ru: "Bruce Lee nima bo‘lib vafot etgan..." }, v: 4.6 },
        { t: { uz: "Bundanxam yomoni bor ko‘ramiz...", ru: "Bundanxam yomoni bor ko‘ramiz..." }, v: 3.2 },
        { t: { uz: "Once upon a time in Hollywood", ru: "Once upon a time in Hollywood" }, v: 3.2 }
      ] }
    }
  ],

  /* ---------- 8-slayd: hamkorlik ---------- */
  partner: {
    deliverables: [
      { icon: "film-slate", t: { uz: "15 qismli YouTube shou, har biri 20-25 daqiqa", ru: "YouTube-шоу из 15 серий по 20-25 минут" } },
      { icon: "stamp", t: { uz: "Brend shou nomida va introda", ru: "Бренд в названии и интро шоу" } },
      { icon: "video-camera", t: { uz: "45+ Reels va Shorts", ru: "45+ Reels и Shorts" } },
      { icon: "users-three", t: { uz: "1,7 mln+ obunachiga ega auditoriya", ru: "Аудитория 1,7 млн+ подписчиков" } },
      { icon: "chart-line-up", t: { uz: "Prognoz: 50 mln+ ko‘rish", ru: "Прогноз: 50 млн+ просмотров" } }
    ],
    scope: [
      { icon: "video-camera", l: { uz: "Suratga olish jamoasi", ru: "Съёмочная группа" } },
      { icon: "airplane-tilt", l: { uz: "Aviachiptalar va transport", ru: "Авиабилеты и транспорт" } },
      { icon: "bed", l: { uz: "Turar joy, 80 kecha", ru: "Проживание, 80 ночей" } },
      { icon: "trophy", l: { uz: "Challenge fondi", ru: "Фонд челленджей" } },
      { icon: "film-slate", l: { uz: "Montaj va post-prodakshn", ru: "Монтаж и постпродакшн" } },
      { icon: "shield-check", l: { uz: "Texnika, vizalar, sug‘urta", ru: "Техника, визы, страховка" } },
      { icon: "megaphone", l: { uz: "Marketing va promo", ru: "Маркетинг и промо" } }
    ]
  }
};
