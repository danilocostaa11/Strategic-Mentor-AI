# ⚙️ Configuração Rápida - Vercel + Turso

## Passo a Passo para Deploy (5 minutos)

### 1. Criar Database no Turso (2 min)

1. Acesse https://turso.tech
2. Faça login/crie conta
3. Clique em **"New Database"**
4. Configure:
   - **Name:** `strategic-mentor-ai`
   - **Location:** `São Paulo, Brazil` (ou mais próximo)
   - **Plan:** `Free`
5. Clique em **"Create Database"**

### 2. Obter Credenciais Turso (1 min)

Após criar o database:

```bash
# URL do database
turso db show strategic-mentor-ai --url

# Token de autenticação
turso db tokens create strategic-mentor-ai
```

**Anote:**
- `DATABASE_URL` = URL do passo anterior
- `AUTH_TOKEN` = Token gerado

### 3. Configurar Vercel (2 min)

#### Opção A: Via CLI (Recomendado)

```bash
# 1. Instalar Vercel CLI
npm install -g vercel

# 2. Login
vercel login

# 3. Link do projeto
cd mentor-ai
vercel link

# 4. Adicionar variáveis de ambiente
vercel env add TURSO_DATABASE_URL
vercel env add TURSO_AUTH_TOKEN
vercel env add AI_INTEGRATIONS_OPENAI_API_KEY
vercel env add AI_INTEGRATIONS_OPENAI_BASE_URL
```

#### Opção B: Via Dashboard

1. Acesse https://vercel.com/new
2. Importe seu repositório GitHub
3. Em **"Environment Variables"** adicione:

| Nome | Valor |
|------|-------|
| `TURSO_DATABASE_URL` | URL do Turso (passo 2) |
| `TURSO_AUTH_TOKEN` | Token do Turso (passo 2) |
| `AI_INTEGRATIONS_OPENAI_API_KEY` | Sua chave OpenAI |
| `AI_INTEGRATIONS_OPENAI_BASE_URL` | `https://api.openai.com/v1` |

### 4. Deploy

```bash
# Deploy de preview (teste)
npm run deploy:preview

# OU deploy de produção
npm run deploy:prod
```

---

## 📋 Variáveis de Ambiente

### Desenvolvimento Local (`.env`)

```env
DATABASE_URL=file:./prisma/dev.db
OPENAI_API_KEY=sk-...
AI_INTEGRATIONS_OPENAI_API_KEY=sk-...
AI_INTEGRATIONS_OPENAI_BASE_URL=https://api.openai.com/v1
```

### Produção (Vercel)

```env
DATABASE_URL=libsql://... (Turso)
TURSO_DATABASE_URL=libsql://...
TURSO_AUTH_TOKEN=eyJ...
AI_INTEGRATIONS_OPENAI_API_KEY=sk-...
AI_INTEGRATIONS_OPENAI_BASE_URL=https://api.openai.com/v1
```

---

## 🗄️ Configurar Banco de Dados

### Primeira vez (Desenvolvimento)

```bash
# Gerar Prisma Client
npm run db:generate

# Aplicar schema ao banco local
npm run db:push
```

### Produção (Turso)

```bash
# Conectar ao Turso e aplicar schema
DATABASE_URL=libsql://SEU_URL \
TURSO_DATABASE_URL=libsql://SEU_URL \
TURSO_AUTH_TOKEN=SEU_TOKEN \
npm run db:push
```

---

## 🧪 Testar Localmente

```bash
# Instalar dependências
npm install

# Gerar Prisma Client
npm run db:generate

# Rodar em desenvolvimento
npm run dev
```

Acesse: http://localhost:3000

---

## 🚀 Deploy Contínuo (Git)

1. Conecte repositório na Vercel
2. Configure auto-deploy em `main`
3. Todo `git push` fará deploy automático

**Build Command:**
```bash
prisma generate && npm run build
```

---

## 🔍 Troubleshooting

### Erro: "PrismaLibSQL is not a constructor"

✅ Verifique se `TURSO_DATABASE_URL` e `TURSO_AUTH_TOKEN` estão definidas na Vercel.

### Erro: "Environment variable not found"

✅ Execute `vercel env pull` para baixar variáveis locais.

### Erro: "Database is locked"

✅ Em produção, use Turso. SQLite é apenas para desenvolvimento.

---

## 📞 Suporte

- **DEPLOY.md:** Guia completo de deploy
- **Documentação Vercel:** https://vercel.com/docs
- **Documentação Turso:** https://docs.turso.tech

---

## ✅ Checklist Final

- [ ] Database Turso criado
- [ ] Variáveis na Vercel configuradas
- [ ] Deploy realizado
- [ ] Teste de análise com OpenAI funcionou
- [ ] Logs verificados (`vercel logs --follow`)
