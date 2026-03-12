# 🚀 Guia de Deploy - Vercel + Turso

## Visão Geral

Este guia descreve o processo completo para deploy do Strategic Mentor AI na Vercel com banco de dados Turso (LibSQL).

---

## 📋 Pré-requisitos

1. Conta na [Vercel](https://vercel.com)
2. Conta no [Turso](https://turso.tech)
3. API Key da [OpenAI](https://platform.openai.com)
4. Git instalado e repositório configurado

---

## 1. Configurar Banco de Dados Turso

### 1.1 Criar Database no Turso

```bash
# Instalar CLI do Turso (se necessário)
npm install -g @tursodatabase/turso-cli

# Autenticar
turso auth login

# Criar database
turso db create strategic-mentor-ai

# Obter URL do database
turso db show strategic-mentor-ai --url
# Exemplo: libsql://[nome]-[org].turso.io
```

### 1.2 Gerar Token de Autenticação

```bash
# Criar token para produção
turso db tokens create strategic-mentor-ai
```

### 1.3 Configurar Schema

```bash
# Copiar .env.example e preencher com dados do Turso
cp .env.example .env.production

# Gerar Prisma Client com adapter LibSQL
npx prisma generate

# Aplicar migrations no Turso
DATABASE_URL=libsql://SEU_URL TURSO_DATABASE_URL=libsql://SEU_URL TURSO_AUTH_TOKEN=SEU_TOKEN npx prisma db push
```

---

## 2. Configurar Vercel

### 2.1 Instalar Vercel CLI

```bash
npm install -g vercel
```

### 2.2 Login na Vercel

```bash
vercel login
```

### 2.3 Link do Projeto

```bash
cd mentor-ai
vercel link
```

### 2.4 Configurar Variáveis de Ambiente

```bash
# Adicionar variáveis na Vercel
vercel env add DATABASE_URL production
vercel env add TURSO_DATABASE_URL production
vercel env add TURSO_AUTH_TOKEN production
vercel env add AI_INTEGRATIONS_OPENAI_API_KEY production
vercel env add AI_INTEGRATIONS_OPENAI_BASE_URL production
vercel env add OPENAI_API_KEY production
```

**Ou através do Dashboard:**
1. Acesse https://vercel.com/dashboard
2. Selecione o projeto
3. Vá em "Settings" → "Environment Variables"
4. Adicione as variáveis para `Production` e `Preview`

### 2.5 Variáveis Necessárias

| Variável | Valor | Ambiente |
|----------|-------|----------|
| `DATABASE_URL` | `file:./prisma/dev.db` (dev) / URL Turso (prod) | All |
| `TURSO_DATABASE_URL` | `libsql://[seu-database].turso.io` | Production |
| `TURSO_AUTH_TOKEN` | Token gerado no passo 1.2 | Production |
| `AI_INTEGRATIONS_OPENAI_API_KEY` | `sk-...` | All |
| `AI_INTEGRATIONS_OPENAI_BASE_URL` | `https://api.openai.com/v1` | All |
| `OPENAI_API_KEY` | `sk-...` | All |

---

## 3. Deploy

### 3.1 Deploy de Desenvolvimento (Preview)

```bash
vercel --dev
```

### 3.2 Deploy de Produção

```bash
vercel --prod
```

### 3.3 Deploy Automático via Git

1. Conecte seu repositório GitHub/GitLab/Bitbucket na Vercel
2. Configure o projeto:
   - **Framework Preset:** Next.js
   - **Build Command:** `prisma generate && npm run build`
   - **Output Directory:** `.next`
   - **Install Command:** `npm install`
3. Todo push na branch `main` fará deploy automático

---

## 4. Scripts de Build

### 4.1 Build Local para Teste

```bash
# Gerar Prisma Client
npx prisma generate

# Build de produção
npm run build

# Testar build localmente
npm run start
```

### 4.2 Migrations em Produção

```bash
# Aplicar mudanças do schema no Turso
npx prisma db push --accept-data-loss

# OU usar migrations explícitas
npx prisma migrate deploy
```

---

## 5. Configurações do vercel.json

O arquivo `vercel.json` já está configurado com:

```json
{
  "framework": "nextjs",
  "buildCommand": "prisma generate && npm run build",
  "regions": ["sao1"],
  "env": { ... }
}
```

**Regiões disponíveis:**
- `sao1` - São Paulo, Brasil (recomendado para latência)
- `iad1` - Washington DC, USA
- `cle1` - Cleveland, USA

---

## 6. Monitoramento e Logs

### 6.1 Acessar Logs na Vercel

```bash
# Logs em tempo real
vercel logs --follow

# Logs de deploy específico
vercel logs [DEPLOYMENT_ID]
```

### 6.2 Dashboard Vercel

Acesse https://vercel.com/[seu-projeto] para ver:
- Métricas de performance
- Analytics
- Logs de erros
- Deploy history

---

## 7. Otimizações para Produção

### 7.1 Cache de Análise

O sistema já implementa cache em memória. Para produção:

```typescript
// lib/cache.ts
// Cache é resetado a cada deploy serverless
// Considere usar Redis/Vercel KV para cache persistente
```

### 7.2 Timeout de Funções Serverless

A Vercel tem timeout de 10s (Hobby) a 60s (Pro).

Para análises longas:
- Ajuste `maxDuration` no `vercel.json`
- Implemente streaming da resposta
- Use Background Functions (Enterprise)

### 7.3 Tamanho do Bundle

```bash
# Analisar bundle
npm install -g @next/bundle-analyzer
npm run build
```

---

## 8. Troubleshooting

### Erro: "PrismaLibSQL is not a constructor"

**Solução:** Verifique se as variáveis `TURSO_DATABASE_URL` e `TURSO_AUTH_TOKEN` estão definidas.

### Erro: "Environment variable not found: DATABASE_URL"

**Solução:** Adicione a variável no `.env` (dev) ou Vercel (prod).

### Erro: "Rate limit exceeded" (OpenAI)

**Solução:** 
- Implemente backoff exponencial (já implementado)
- Upgrade no plano da OpenAI
- Use cache mais agressivamente

### Erro: "Database is locked" (SQLite)

**Solução:** Migre para Turso em produção. SQLite é apenas para desenvolvimento.

---

## 9. Checklist de Deploy

- [ ] Database Turso criado e configurado
- [ ] Token de autenticação gerado
- [ ] Schema aplicado no Turso (`prisma db push`)
- [ ] Variáveis de ambiente na Vercel
- [ ] Build local testado (`npm run build`)
- [ ] Deploy de preview funcionando
- [ ] Deploy de produção realizado
- [ ] Testes de integração com OpenAI
- [ ] Logs monitorados pós-deploy

---

## 10. Custos Estimados

### Vercel (Hobby - Gratuito)
- 100GB bandwidth/mês
- 6000 minutos de build/mês
- 100GB-hours de serverless

### Turso (Free Tier)
- 9GB armazenamento
- 500M leituras/mês
- 1M escritas/mês

### OpenAI
- GPT-4o: ~$0.06 por análise (8K tokens)
- 100 análises/mês: ~$6

**Total estimado:** $6-10/mês para uso pessoal

---

## 11. Próximos Passos

1. **Configurar domínio customizado** na Vercel
2. **Implementar autenticação** (NextAuth)
3. **Setup de monitoramento** (Sentry, LogRocket)
4. **Configurar CI/CD** com testes automatizados
5. **Implementar Vercel Analytics**

---

## 📞 Suporte

- [Documentação Vercel](https://vercel.com/docs)
- [Documentação Turso](https://docs.turso.tech)
- [Documentação Prisma](https://www.prisma.io/docs)
- [Documentação OpenAI](https://platform.openai.com/docs)
