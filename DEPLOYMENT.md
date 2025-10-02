# 🚀 Deployment Guide

## Příprava k nasazení

### 1. Instalace závislostí

```bash
npm install
```

Pokud npm install trvá dlouho nebo selže, zkuste:

```bash
# Vyčistit cache
npm cache clean --force

# Nebo použít yarn
yarn install

# Nebo pnpm (rychlejší)
pnpm install
```

### 2. Nastavení environment variables

Vytvořte `.env.local`:

```env
ANTHROPIC_API_KEY=sk-ant-your-api-key-here
```

### 3. Testování lokálně

```bash
# Development server
npm run dev

# Production build test
npm run build
npm start
```

### 4. Kontrola typů

```bash
# TypeScript type check
npx tsc --noEmit
```

## 🌐 Deployment na Vercel

### Metoda 1: Vercel CLI (doporučeno)

```bash
# Instalace Vercel CLI
npm i -g vercel

# Login
vercel login

# První deployment (development)
vercel

# Production deployment
vercel --prod
```

### Metoda 2: GitHub Integration

1. Push kód na GitHub:
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. Připojte repository ve Vercel:
   - https://vercel.com/new
   - Import Git Repository
   - Vyberte váš repository

3. Nastavte environment variables:
   - Settings → Environment Variables
   - Přidejte `ANTHROPIC_API_KEY`
   - Apply to Production, Preview, Development

4. Deploy:
   - Automaticky se deployuje při každém push

## 🔧 Vercel Configuration

### vercel.json

```json
{
  "env": {
    "ANTHROPIC_API_KEY": "@anthropic-api-key"
  },
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 60
    }
  }
}
```

### Nastavení v Vercel Dashboard

1. **Environment Variables:**
   - `ANTHROPIC_API_KEY` = váš Claude API klíč

2. **Function Configuration:**
   - Runtime: Node.js 20.x
   - Memory: 1024 MB (default)
   - Max Duration: 60s (pro AI analýzu)

3. **Build Settings:**
   - Framework: Next.js
   - Build Command: `next build`
   - Output Directory: `.next`
   - Install Command: `npm install`

## 📋 Pre-deployment Checklist

- [ ] `npm install` úspěšně dokončeno
- [ ] `npm run build` prošlo bez chyb
- [ ] TypeScript type check prošel (`npx tsc --noEmit`)
- [ ] `.env.local` obsahuje platný ANTHROPIC_API_KEY
- [ ] Testovali jste lokálně na http://localhost:3000
- [ ] Přihlášení funguje s heslem `sporka2025`
- [ ] Upload fotek funguje (min 5 exteriér + 3 interiér)
- [ ] AI analýza vrací validní výsledky
- [ ] PDF export funguje
- [ ] Manuální editace funguje

## 🐛 Troubleshooting

### Build Error: "Module not found"

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Timeout při AI analýze

V `vercel.json` zvyšte maxDuration:

```json
"functions": {
  "app/api/**/*.ts": {
    "maxDuration": 90
  }
}
```

### "ANTHROPIC_API_KEY is not defined"

Zkontrolujte environment variables ve Vercel Dashboard:
- Settings → Environment Variables
- Musí být nastaveno pro Production

### Rate Limit Error z Claude API

- Zkontrolujte usage na https://console.anthropic.com/
- Zvyšte tier plánu pokud je potřeba
- Implementovaný rate limiter: 5 req/min per IP

### Upload velkých fotek selhává

V `next.config.js` je nastaveno:

```js
experimental: {
  serverActions: {
    bodySizeLimit: '10mb',
  },
}
```

Pokud potřebujete víc, zvyšte na `20mb`.

## 📊 Monitoring

### Vercel Analytics

Po deploymentu sledujte:
- **Deployment logs** - chyby při buildu
- **Function logs** - runtime errors
- **Analytics** - performance metrics

### Claude API Usage

Sledujte na https://console.anthropic.com/:
- Počet requestů
- Token usage
- Rate limits

## 🔐 Bezpečnost

### Produkční checklist:

- [ ] ANTHROPIC_API_KEY je v environment variables (ne v kódu)
- [ ] Session cookies mají `httpOnly: true`
- [ ] Session cookies mají `secure: true` v produkci
- [ ] Rate limiting je aktivní
- [ ] Middleware chrání všechny protected routes
- [ ] Input validation funguje (Zod schemas)

### Dodatečná doporučení:

1. **HTTPS Only**: Vercel automaticky poskytuje HTTPS
2. **CORS**: Není potřeba, API je same-origin
3. **CSP Headers**: Zvažte přidat Content-Security-Policy
4. **IP Whitelisting**: Pokud chcete omezit přístup jen z konkrétních IP

## 📈 Scaling

### Pro vysokou zátěž:

1. **Upgrade Vercel plánu** na Pro nebo Enterprise
   - Více concurrent executions
   - Delší max duration
   - Prioritní support

2. **Optimalizace Claude API:**
   - Použít `claude-3-5-sonnet` místo Opus (rychlejší, levnější)
   - Cache obrázků pokud možno
   - Batch processing pro více requestů

3. **Database** (budoucí rozšíření):
   - Uložení výsledků kontroly
   - Historie analýz
   - Audit log

## 🎯 Post-deployment Testing

Po úspěšném deploymentu otestujte:

1. **Login**: Zkuste se přihlásit s heslem `sporka2025`
2. **Formulář**: Vyplňte všechna pole
3. **Upload**: Nahrajte testovací fotky (min 8)
4. **Analýza**: Počkejte na AI výsledky (30-60s)
5. **Manuální editace**: Změňte nějaké pole
6. **PDF Export**: Stáhněte výsledné PDF

### Test Data

Pro testování můžete použít:
- Stock fotky domů z Unsplash
- Veřejné fotky nemovitostí z realitních serverů
- Testovací formulářová data

## 📞 Support

V případě problémů:
1. Zkontrolujte Vercel deployment logs
2. Zkontrolujte Function logs v Vercel
3. Zkontrolujte Claude API status: https://status.anthropic.com/
4. Kontaktujte Anthropic support pro API issues

---

**✅ Po úspěšném deploymentu aplikace běží na:**
```
https://your-project.vercel.app
```

**🔑 Login:**
- Heslo: `sporka2025`

**🎉 Hotovo! Aplikace je připravena k produkčnímu použití.**
