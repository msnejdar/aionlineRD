# ⚡ Quick Start Guide

## 1️⃣ Instalace (2 minuty)

```bash
# Clone repository
git clone <your-repo-url>
cd aionlineRD

# Install dependencies
npm install

# Setup environment
cp .env.local.template .env.local
```

**Editujte `.env.local`:**
```env
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

Získejte klíč na: https://console.anthropic.com/

## 2️⃣ Development (30 sekund)

```bash
npm run dev
```

Otevřete: http://localhost:3000

**Login:** `sporka2025`

## 3️⃣ Test Workflow (5 minut)

1. **Login** s heslem `sporka2025`
2. **Vyplňte formulář** (všechna pole jsou povinná)
3. **Nahrajte fotky:**
   - Min. 5 fotek exteriéru
   - Min. 3 fotky interiéru
4. **Klikněte "Analyzovat nemovitost"**
5. **Počkejte 30-60 sekund** na AI výsledky
6. **Zobrazí se výsledky** s barevným označením
7. **(Volitelně) Upravte výsledky** manuálně
8. **Export PDF**

## 4️⃣ Production Deployment (5 minut)

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

**Nastavte ve Vercel Dashboard:**
- Settings → Environment Variables
- Přidejte: `ANTHROPIC_API_KEY`

## 🎯 Základní použití

### Formulář
- Vyplňte VŠECHNA pole (jsou povinná)
- Dispozice určuje počet požadovaných fotek pokojů
- PSČ musí být 5 číslic

### Fotky
```
Exteriér (min 5):
  ✓ Přední strana + číslo popisné
  ✓ Zadní strana
  ✓ Levá strana
  ✓ Pravá strana
  ✓ Celkový pohled

Interiér (min 3):
  ✓ Kuchyň
  ✓ Koupelna
  ✓ Chodba
  ✓ Pokoje (podle dispozice)

Vedlejší stavby:
  ✓ Garáže (pokud garageCount > 0)
```

### AI Analýza
- Trvá **30-60 sekund**
- Kontroluje **10 polí** formuláře
- Hlídá **5 odmítacích kritérií**
- Vypočítává **podlahovou plochu**
- Vrací doporučení: ✅ SCHVÁLENO / ❌ ZAMÍTNUTO / ⚠️ MANUÁLNÍ

### Výsledky
- **Zelená** = souhlasí (high confidence)
- **Červená** = nesouhlasí
- **Žlutá** = nejisté (low/medium confidence)

## 🐛 Časté problémy

### "Module not found" při buildu
```bash
rm -rf node_modules package-lock.json
npm install
```

### "ANTHROPIC_API_KEY is not defined"
```bash
# Zkontrolujte .env.local
cat .env.local

# Nebo nastavte ve Vercel Dashboard
```

### Upload fotek nefunguje
- Max velikost: **10MB per foto**
- Formáty: **JPG, PNG**
- Min počet: **5 exteriér + 3 interiér**

### AI timeout
- Normal: 30-60 sekund
- Pokud selže: zkuste znovu
- Rate limit: max 5 requestů/min

## 📚 Dokumentace

- **[README.md](README.md)** - Kompletní dokumentace
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Deployment guide
- **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)** - Přehled projektu

## 🎨 Demo Data

Pro testování použijte:
- **Adresa:** Václavské náměstí 1, Praha, 11000
- **Dispozice:** 3+1
- **Stav:** Dobře udržovaný
- **Fotky:** Min 8 fotek (5 exteriér + 3 interiér)

## 🔑 Credentials

- **Login heslo:** `sporka2025`
- **API Key:** Získejte na https://console.anthropic.com/

## ⚙️ Configuration

```javascript
// Změnit max velikost fotek
// next.config.js
bodySizeLimit: '20mb'

// Změnit timeout AI
// vercel.json
maxDuration: 90

// Změnit rate limit
// lib/rateLimit.ts
maxRequests: 10
```

## 🚀 Commands

```bash
npm run dev      # Development server
npm run build    # Production build
npm start        # Production server
npm run lint     # Run ESLint

vercel           # Deploy preview
vercel --prod    # Deploy production
```

## 📊 Status

- ✅ **Login** - Funguje
- ✅ **Formulář** - 100% polí implementováno
- ✅ **Upload** - Drag & drop ready
- ✅ **AI** - Claude 3.5 Sonnet
- ✅ **Výsledky** - Barevné označení
- ✅ **PDF** - Export hotový
- ✅ **Responsive** - Desktop/Tablet/Mobile

## 🎯 Next Steps

1. ✅ Install dependencies
2. ✅ Set ANTHROPIC_API_KEY
3. ✅ Test locally
4. ✅ Deploy to Vercel
5. 🎉 Done!

---

**Vše funguje out-of-the-box. Stačí nastavit API klíč a můžete začít!**

_Pro detaily viz [README.md](README.md)_
