# 🏠 AI Kontrola Nemovitostí - Česká spořitelna

Produkční Next.js aplikace pro automatickou AI kontrolu údajů o nemovitostech pomocí Anthropic Claude API.

🚀 **Vercel Deployment Ready**

## 🎯 Hlavní funkce

- ✅ Automatická kontrola údajů o nemovitosti oproti fotodokumentaci
- ✅ Detekce odmítacích kritérií (rekonstrukce, praskliny, poškození)
- ✅ Orientační výpočet podlahové plochy z fotografií
- ✅ Manuální editace výsledků bankéřem
- ✅ Export výsledků do PDF s barevným označením

## 🚀 Rychlý start

### 1. Instalace závislostí

```bash
npm install
```

### 2. Nastavení environment variables

Vytvořte soubor `.env.local`:

```env
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

### 3. Spuštění dev serveru

```bash
npm run dev
```

Aplikace poběží na [http://localhost:3000](http://localhost:3000)

### 4. Přihlášení

**Heslo:** `sporka2025`

## 📦 Technologie

- **Next.js 14** - React framework s App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling s glass morphism efektem
- **Anthropic Claude API** - AI analýza
- **pdf-lib** - Generování PDF
- **react-dropzone** - Drag & drop upload
- **Zod** - Validace dat

## 🏗️ Struktura projektu

```
/app
  /api
    /analyze-property    # POST endpoint pro AI analýzu
    /generate-pdf        # POST endpoint pro generování PDF
    /auth/login          # POST autentizace
    /auth/logout         # POST odhlášení
  /components
    PropertyForm.tsx     # Hlavní formulář
    ImageUploader.tsx    # Upload fotek s drag & drop
    ResultsPanel.tsx     # Zobrazení výsledků
    ManualReview.tsx     # Editace výsledků
    LoadingAnimation.tsx # Loading state
  /login
    page.tsx             # Login stránka
  page.tsx               # Hlavní stránka (orchestrace)
  layout.tsx             # Root layout
  globals.css            # Globální styly
  middleware.ts          # Auth middleware

/lib
  anthropic.ts           # Claude API integrace
  validation.ts          # Zod schémata
  pdfGenerator.ts        # PDF generování
  imageOptimization.ts   # Optimalizace fotek
  rateLimit.ts           # Rate limiting

/types
  index.ts               # TypeScript definice
```

## 🔐 Autentizace

Aplikace používá jednoduché password-only přihlášení s session cookies.

- Heslo: `sporka2025`
- Session platnost: 24 hodin
- Middleware chrání všechny stránky kromě `/login`

## 📸 Požadavky na fotodokumentaci

### Exteriér (min. 5 fotek)
- Přední strana s číslem popisným
- Zadní strana
- Levá strana
- Pravá strana
- Celkový pohled

### Interiér (podle dispozice)
- Kuchyň (1 foto)
- Koupelna (1+ foto)
- Chodba (1 foto)
- Pokoje (podle dispozice: 1kk=1, 2+1=2, atd.)

### Vedlejší stavby
- Garáže (pokud garageCount > 0)

## 🚫 Odmítací kritéria

AI **automaticky zamítne** nemovitost pokud:

1. ❌ Je v aktivní rekonstrukci (bourání, lešení)
2. ❌ Má výrazné poškození (zřícené části)
3. ❌ Má viditelné praskliny v konstrukci
4. ❌ Chybí více než 20% fasády
5. ❌ Chybí požadovaná fotodokumentace

## 📋 Workflow

```
1. Login (sporka2025)
   ↓
2. Vyplnění formuláře
   ↓
3. Upload fotografií (drag & drop)
   ↓
4. AI analýza (30-60 sekund)
   ↓
5. Zobrazení výsledků
   ↓
6. (Volitelně) Manuální úprava
   ↓
7. Export do PDF
```

## 🎨 UI Design

Aplikace používá **liquid glass morphism** design:

- Gradient pozadí (fialová → růžová)
- Skleněné panely s blur efektem
- Smooth animace
- Barevné označení polí (zelená/červená/žlutá)
- Responsive pro desktop i mobil

## 🌐 Deployment na Vercel

### 1. Připojte GitHub repository

```bash
vercel
```

### 2. Nastavte environment variables

V Vercel dashboard:
- Settings → Environment Variables
- Přidejte `ANTHROPIC_API_KEY`

### 3. Deploy

```bash
vercel --prod
```

## 📊 API Endpointy

### POST /api/analyze-property

Analyzuje nemovitost pomocí Claude API.

**Request:**
```json
{
  "formData": { /* PropertyFormData */ },
  "photos": {
    "exterior": ["base64..."],
    "interior": ["base64..."],
    "additional": ["base64..."]
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "validation": { /* pole validace */ },
    "floorAreaEstimate": { /* výpočet plochy */ },
    "issues": { /* nalezené problémy */ },
    "recommendation": "approved|rejected|manualReview",
    "summary": "..."
  }
}
```

### POST /api/generate-pdf

Generuje PDF s výsledky.

**Request:**
```json
{
  "formData": { /* PropertyFormData */ },
  "validationResults": { /* AIResponse */ },
  "manualEdits": { /* volitelné */ },
  "bankOfficerNote": "..."
}
```

**Response:**
PDF soubor ke stažení

## 🧪 Testování

### Testovací scénáře

1. ✅ Správné údaje + kompletní fotky → **APPROVED**
2. ✅ Viditelná prasklina → **REJECTED**
3. ✅ Chybějící pokoje → **REJECTED**
4. ✅ Nesouhlasí stav → **MANUAL REVIEW**
5. ✅ Rozdíl v podlahové ploše → **RED flag**

## 📝 Poznámky

- Maximální velikost fotek: 10MB
- Automatická optimalizace na 1024x1024px
- Rate limit: 5 požadavků/minutu na IP
- Timeout pro AI: 60 sekund
- Podporované formáty: JPG, PNG

## 🔧 Troubleshooting

### Claude API error

```bash
# Zkontrolujte API klíč
echo $ANTHROPIC_API_KEY

# Zkontrolujte rate limits na Anthropic dashboard
```

### PDF generování selhává

```bash
# Zkontrolujte pdf-lib instalaci
npm install pdf-lib@latest
```

### Upload fotek nefunguje

```bash
# Zvýšte body size limit v next.config.js
bodySizeLimit: '10mb'
```

## 📄 License

Proprietary - Česká spořitelna

## 👥 Kontakt

Pro podporu kontaktujte IT oddělení České spořitelny.

---

**Vytvořeno s ❤️ pomocí Claude Code & Anthropic Claude API**
