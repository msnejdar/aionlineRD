#!/bin/bash

echo "🏠 AI Kontrola Nemovitostí - Setup Script"
echo "=========================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js není nainstalován. Nainstalujte Node.js 18+ a zkuste to znovu."
    exit 1
fi

echo "✅ Node.js $(node -v) detected"
echo ""

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm není nainstalován."
    exit 1
fi

echo "✅ npm $(npm -v) detected"
echo ""

# Install dependencies
echo "📦 Instaluji závislosti..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Instalace závislostí selhala. Zkuste:"
    echo "   npm cache clean --force"
    echo "   npm install"
    exit 1
fi

echo "✅ Závislosti nainstalovány"
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "⚠️  .env.local soubor neexistuje"
    echo "📝 Vytvářím .env.local z template..."
    cp .env.local.template .env.local
    echo ""
    echo "⚠️  DŮLEŽITÉ: Otevřete .env.local a nastavte váš ANTHROPIC_API_KEY"
    echo "   Získejte klíč na: https://console.anthropic.com/"
    echo ""
else
    echo "✅ .env.local existuje"
    echo ""
fi

# Test build
echo "🔨 Testuji build..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build selhal. Zkontrolujte chyby výše."
    exit 1
fi

echo "✅ Build úspěšný"
echo ""

echo "=========================================="
echo "🎉 Setup dokončen!"
echo ""
echo "Další kroky:"
echo "1. Nastavte ANTHROPIC_API_KEY v .env.local"
echo "2. Spusťte dev server: npm run dev"
echo "3. Otevřete: http://localhost:3000"
echo "4. Přihlaste se heslem: sporka2025"
echo ""
echo "Pro deployment na Vercel:"
echo "  vercel --prod"
echo ""
echo "Dokumentace: README.md a DEPLOYMENT.md"
echo "=========================================="
