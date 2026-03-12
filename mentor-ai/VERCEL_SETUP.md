# 🚀 Deploy Vercel + Turso - Guia Simplificado

## Configuração Rápida

### 1. Turso (Banco de Dados)

```bash
# Criar database
turso db create strategic-mentor-ai

# Pegar URL
turso db show strategic-mentor-ai --url

# Gerar token
turso db tokens create strategic-mentor-ai
```

### 2. Vercel (Variáveis de Ambiente)

No dashboard da Vercel ou via CLI:

```bash
vercel env add TURSO_DATABASE_URL
vercel env add TURSO_AUTH_TOKEN
vercel env add AI_INTEGRATIONS_OPENAI_API_KEY
```

### 3. Deploy

```bash
npm run build
vercel --prod
```

---

## O que mudou?

- ✅ **lib/prisma.ts** - Agora detecta Turso automaticamente em produção
- ✅ **vercel.json** - Configuração de build
- ✅ **.env.example** - Template de variáveis

## Modelo OpenAI

Atualizado para `gpt-4o-2024-11-20` (mais recente)

---

## Status do App

✅ **PRONTO PARA USO**
- Desenvolvimento local: funcionando
- Produção (Vercel + Turso): configurado
