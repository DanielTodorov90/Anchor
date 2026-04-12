# ⚓ A.N.C.H.O.R.
### Adaptive Neural Command Hub for Operations & Returns
**Личният AI асистент на Danny — Дивидентният Моряк**

---

## 🚀 ФАЗА 1 — PWA Setup

### Структура на проекта
```
anchor-pwa/
├── index.html              # Главният HTML файл
├── vercel.json             # Vercel deployment config
├── public/
│   ├── manifest.json       # PWA manifest
│   ├── sw.js               # Service Worker (offline + push notifications)
│   └── icons/              # App icons (виж по-долу)
└── src/
    ├── style.css           # Sci-fi HUD design system
    ├── app.js              # Main controller (nav, clock, PWA, notifications)
    ├── utils/
    │   ├── api.js          # Anthropic Claude API
    │   ├── storage.js      # localStorage wrapper
    │   └── speech.js       # STT + TTS (Bulgarian)
    └── modules/
        ├── chat.js         # AI чат
        ├── markets.js      # Live крипто цени
        ├── tasks.js        # Tasks + localStorage
        ├── wordpress.js    # WordPress публикации
        ├── news.js         # Новини търсене
        ├── portfolio.js    # Portfolio (Phase 2)
        └── earnings.js     # Earnings calendar
```

---

## ⚙️ DEPLOYMENT (Vercel — безплатно)

### 1. Създай GitHub repo
```bash
git init
git add .
git commit -m "feat: A.N.C.H.O.R. Phase 1 PWA"
git remote add origin https://github.com/DanielTodorov90/anchor.git
git push -u origin main
```

### 2. Deploy на Vercel
1. Отиди на [vercel.com](https://vercel.com)
2. "New Project" → импортирай GitHub repo-то
3. Framework: **Other** (Static)
4. Deploy → получаваш HTTPS URL (напр. `anchor-danny.vercel.app`)

### 3. Icons — генерирай ги
Използвай [realfavicongenerator.net](https://realfavicongenerator.net) или [pwa-image-generator.netlify.app](https://pwa-image-generator.netlify.app)
- Качи anchor лого (512x512 PNG)
- Свали всички размери → сложи в `/public/icons/`

---

## 📱 ИНСТАЛАЦИЯ НА IPHONE 16 PRO

1. Отвори Safari → `https://anchor-danny.vercel.app`
2. Натисни **Share** (квадрат с стрелка)
3. Натисни **"Add to Home Screen"**
4. Натисни **"Add"**
5. Отвори от Home Screen → работи като истинско app!

**За нотификации:** Ще видиш бутон "Активирай нотификации" при първо отваряне.

---

## 🗺️ ROADMAP

| Фаза | Статус | Описание |
|------|--------|----------|
| **Фаза 1** | ✅ | PWA основа, HUD UI, Chat AI, Markets, Tasks, WordPress |
| **Фаза 2** | 🔜 | Backend (Supabase), Auth, Push notifications сървър |
| **Фаза 3** | 🔜 | Сутрешен бюлетин 08:00, scheduled notifications |
| **Фаза 4** | 🔜 | Gmail интеграция (четене, с потвърждение) |
| **Фаза 5** | 💬 | WordPress пълна автоматизация (дискусия) |
| **Фаза 6** | 📋 | CV модул (отделна задача) |

---

## 🔑 API KEY

В `src/utils/api.js` Anthropic API ключът се инжектира автоматично от средата.
За production добави в Vercel Environment Variables:
```
ANTHROPIC_API_KEY=sk-ant-...
```

---

*Built with ⚓ by A.N.C.H.O.R. — Dividend Sailor Project 2026*
