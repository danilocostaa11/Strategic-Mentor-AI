#!/bin/bash

# Script de Deploy - Strategic Mentor AI
# Uso: ./scripts/deploy.sh [preview|production]

set -e

ENV=${1:-preview}

echo "🚀 Strategic Mentor AI - Deploy Script"
echo "======================================"
echo ""

# Verificar dependências
echo "📦 Verificando dependências..."
if ! command -v npm &> /dev/null; then
    echo "❌ npm não encontrado. Instale Node.js primeiro."
    exit 1
fi

if ! command -v vercel &> /dev/null; then
    echo "⚠️  Vercel CLI não encontrado. Instalando..."
    npm install -g vercel
fi

# Instalar dependências do projeto
echo ""
echo "📦 Instalando dependências..."
npm ci

# Gerar Prisma Client
echo ""
echo "🗄️  Gerando Prisma Client..."
npx prisma generate

# Build do projeto
echo ""
echo "🔨 Build do projeto..."
npm run build

# Deploy
echo ""
echo "🌐 Deploy na Vercel ($ENV)..."
if [ "$ENV" = "production" ]; then
    vercel --prod
else
    vercel
fi

echo ""
echo "✅ Deploy concluído com sucesso!"
echo ""
echo "📋 Próximos passos:"
echo "   1. Acesse o dashboard da Vercel para verificar o deploy"
echo "   2. Teste a integração com OpenAI"
echo "   3. Monitore os logs: vercel logs --follow"
