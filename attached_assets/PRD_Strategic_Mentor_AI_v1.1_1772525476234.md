# 📄 PRD — Strategic Mentor AI
**Versão:** MVP 1.1 — Revisada e Ampliada  
**Ambiente:** Replit  
**Stack:** Next.js + Prisma + SQLite + OpenAI + PWA  
**Última revisão:** Março 2026

---

## 🔄 Changelog v1.0 → v1.1

| Área | Melhoria |
|------|----------|
| Dados | Campos de status, versionamento de prompt, feedback do usuário |
| Pipeline | Fallback, cache, custo estimado por análise |
| UX | Onboarding, estados vazios, fila offline |
| Inteligência | Roteamento por segmento, rubrica de scores |
| Execução | Tarefas granulares por semana, critérios de done |
| Novos | Export PDF, User Stories, Glossário |

---

## 1. 🎯 Visão do Produto

Strategic Mentor AI é um sistema de **inteligência comercial evolutiva** que transforma transcrições brutas de reuniões em diagnóstico estratégico estruturado. Atua como um **Mentor Estratégico equilibrado (método + psicologia)**.

### O que NÃO é
Não é um resumidor. Não é um CRM. É um sistema de **performance comercial baseada em dados reais**.

---

## 2. 🧠 Problema

Reuniões comerciais são desorganizadas, subjetivas e difíceis de avaliar. Vendedores não percebem:

- Padrões recorrentes de erro
- Falhas de fechamento
- Desalinhamento com o perfil do cliente
- Deficiências de escuta ativa

**Impacto mensurável esperado após 30 dias:** aumento de taxa de fechamento, maior profundidade de diagnóstico, consistência estratégica.

---

## 3. 👤 Usuário-Alvo

### Persona Principal — "O Consultor Reflexivo"
- Consultor comercial B2B (uso pessoal/validatório)
- Tem 3–10 reuniões/semana
- Quer melhorar sem depender de coach humano
- Acessa principalmente pelo celular, entre reuniões

### Segmentos suportados no MVP
| Segmento | Playbook Específico | Nuances |
|----------|--------------------|---------| 
| Farmacêutico | negotiation.md + pharma-overlay | Foco em evidências clínicas, múltiplos influenciadores |
| Imobiliário | negotiation.md + imob-overlay | Foco em urgência, objeções financeiras |
| IA / B2B | negotiation.md + b2b-overlay | Foco em ROI, ciclos longos, comitês |

> **Melhoria v1.1:** Cada segmento recebe um "overlay" de instruções adicionadas ao prompt base, sem duplicar os playbooks inteiros.

---

## 4. 📖 User Stories Prioritizadas

### Must Have (MVP)
```
US-01: Como consultor, quero colar uma transcrição e receber análise estruturada
        em menos de 60 segundos, para agir antes da próxima reunião.

US-02: Como consultor, quero ver o perfil DISC de cada participante com evidências
        da transcrição, para adaptar minha comunicação.

US-03: Como consultor, quero um plano concreto para a próxima reunião,
        para não chegar sem estratégia.

US-04: Como consultor, quero ver meus padrões ao longo de N reuniões,
        para entender onde estou repetindo erros.

US-05: Como consultor, quero acessar o app no celular offline,
        para registrar transcrições mesmo sem internet.
```

### Should Have
```
US-06: Como consultor, quero corrigir o perfil detectado pela IA,
        para alimentar análises futuras com dados mais precisos.

US-07: Como consultor, quero exportar o relatório em PDF,
        para compartilhar com meu gestor ou guardar no CRM.

US-08: Como consultor, quero receber alerta quando um padrão negativo
        aparecer em 3+ reuniões seguidas, para agir antes que vire hábito.
```

### Nice to Have (pós-MVP)
```
US-09: Upload de áudio com transcrição automática
US-10: Dashboard comparativo entre múltiplos consultores
US-11: Integração com CRM (HubSpot, Pipedrive)
```

---

## 5. 🏗️ Arquitetura Técnica

### Stack
| Camada | Tecnologia | Justificativa |
|--------|-----------|---------------|
| Frontend | Next.js 14 (App Router) | SSR + RSC + API routes no mesmo projeto |
| ORM | Prisma | Type-safe, migrations fáceis |
| Banco | SQLite (MVP) → PostgreSQL (escala) | Zero config no Replit |
| IA | OpenAI GPT-4o | Melhor custo/qualidade para análise longa |
| Estilo | Tailwind CSS | Velocidade de prototipação |
| Validação | Zod | Contrato entre frontend e API |
| PWA | next-pwa | Service Worker automático |

### Estrutura de Arquivos
```
app/
  (auth)/              ← futuro: login
  dashboard/           ← home com métricas resumidas
  clients/
    page.tsx           ← lista de clientes
    [id]/page.tsx      ← perfil do cliente + histórico
    new/page.tsx       ← cadastro
  meetings/
    page.tsx           ← histórico de reuniões
    [id]/page.tsx      ← resultado da análise
    new/page.tsx       ← nova reunião
  patterns/
    page.tsx           ← análise de padrões
  api/
    analyze/route.ts   ← pipeline principal
    patterns/route.ts  ← análise consolidada
    clients/route.ts
    meetings/route.ts
    export/[id]/route.ts  ← geração de PDF ← NOVO v1.1

lib/
  prisma.ts
  playbook.ts          ← carrega e compõe playbooks + overlays
  prompts.ts           ← templates versionados
  analyzer.ts          ← orquestra pipeline
  scorer.ts            ← lógica de scoring isolada ← NOVO v1.1
  cache.ts             ← cache simples em memória ← NOVO v1.1
  queue.ts             ← fila offline (IndexedDB) ← NOVO v1.1

data/playbooks/
  negotiation.md
  communication.md
  overlays/
    pharma.md          ← NOVO v1.1
    imob.md            ← NOVO v1.1
    b2b.md             ← NOVO v1.1

prisma/
  schema.prisma
  migrations/

public/
  manifest.json
  icons/
    icon-192.png
    icon-512.png
```

---

## 6. 🗄️ Modelagem de Dados

### 6.1 Client
```prisma
model Client {
  id                String    @id @default(cuid())
  name              String
  company           String?
  segment           Segment
  profileManual     String?   // perfil informado pelo consultor
  profileAI         String?   // último perfil detectado pela IA
  profileConfidence Float?    // 0.0 – 1.0
  profileConfirmed  Boolean   @default(false)  // ← NOVO: usuário confirmou?
  tags              String?   // JSON array de tags livres ← NOVO
  notes             String?
  meetings          Meeting[]
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
}

enum Segment {
  PHARMA
  IMOB
  B2B
}
```

### 6.2 Meeting
```prisma
model Meeting {
  id               String        @id @default(cuid())
  clientId         String
  client           Client        @relation(fields: [clientId], references: [id])
  title            String
  segment          Segment
  rawTranscript    String
  analysisJson     String?       // JSON estruturado da análise
  analysisVersion  String?       // versão do prompt usado ← NOVO
  status           MeetingStatus @default(PENDING)  ← NOVO
  strategicScore   Float?
  closingScore     Float?
  userFeedback     String?       // JSON: ajustes manuais do usuário ← NOVO
  includedInPattern Boolean     @default(false)     ← NOVO
  createdAt        DateTime      @default(now())
  updatedAt        DateTime      @updatedAt
}

enum MeetingStatus {
  PENDING      // transcrição salva, aguarda análise
  ANALYZING    // análise em andamento
  DONE         // análise concluída
  ERROR        // falha no pipeline
}
```

### 6.3 PatternReport ← NOVO v1.1
```prisma
model PatternReport {
  id           String   @id @default(cuid())
  meetingIds   String   // JSON array de IDs usados
  reportJson   String   // análise consolidada
  createdAt    DateTime @default(now())
}
```

---

## 7. 🧠 Motor de Inteligência (Pipeline)

### Visão Geral do Fluxo
```
Transcrição →[Etapa 1: Contexto]→[Etapa 2: Análise]→[Etapa 3: Score]→ JSON estruturado
                                                                              ↓
                                                                    [Salva no DB]
                                                                    [Renderiza UI]
```

### Etapa 1 — Composição de Contexto

```typescript
// lib/playbook.ts
function buildContext(segment: Segment): string {
  const base = loadFile('negotiation.md') + loadFile('communication.md')
  const overlay = loadFile(`overlays/${segment.toLowerCase()}.md`)
  return `${base}\n\n## Contexto de Segmento\n${overlay}`
}
```

> **Por que overlays?** Evita prompts gigantes. Cada segmento adiciona apenas o delta necessário (~200 tokens extra).

---

### Etapa 2 — Análise Individual

#### 2.1 Separação de Falas
- Identificar CONSULTOR, CLIENTE 1, CLIENTE 2+
- Inferir papel provável: decisor, influenciador, técnico, bloqueador

#### 2.2 Mapeamento de Blocos Conversacionais
| Bloco | O que observar |
|-------|---------------|
| Rapport | Qualidade do vínculo inicial, naturalidade |
| Transição | Suavidade da passagem para negócio |
| Diagnóstico | Perguntas abertas x fechadas, profundidade |
| Exploração de dores | Escuta ativa, aprofundamento |
| Argumentação | Alinhamento com dores identificadas |
| Objeções | Tipo (preço/tempo/autoridade/necessidade), resposta |
| Tentativa de fechamento | Técnica usada, timing |
| Encerramento | Comprometimento, próximos passos claros |

#### 2.3 Classificação de Perfil por Participante
| Dimensão | Detalhes |
|----------|----------|
| Tipo | Analítico / Integrador / Expressivo / Pragmático |
| Confiança | 0–100% |
| Evidências | 3–5 trechos da transcrição que embasam o diagnóstico |
| Estilo de decisão | Racional / Emocional / Relacional / Autoritário |

#### 2.4 Avaliação do Consultor
| Dimensão | Critério |
|----------|---------|
| Condução estratégica | Seguiu estrutura lógica? Adaptou ao contexto? |
| Escuta ativa | Parafraseou? Aprofundou? Não interrompeu? |
| Abertura (5 seg) | Criou conexão ou foi direto ao produto? |
| Adaptação ao perfil | Comunicou no estilo do cliente? |
| Fechamento | Pediu compromisso? Usou técnica adequada? |

#### 2.5 Geração de Saídas
```typescript
interface AnalysisResult {
  participants: Participant[]
  conversationBlocks: Block[]
  consultantEvaluation: ConsultantEval
  strengths: string[]           // 3–5 pontos
  priorityAdjustments: string[] // 3–5 ajustes, por ordem de impacto
  strategicQuestions: string[]  // perguntas que deveriam ter sido feitas
  closingStrategy: string       // estratégia personalizada ao perfil detectado
  nextMeetingPlan: NextMeeting
  strategicScore: number        // 0–10
  closingScore: number          // 0–10
  promptVersion: string         // ex: "v1.1-2026-03"
}
```

---

### Rubrica de Scores ← NOVO v1.1

#### Strategic Score (0–10)
| Faixa | Significado |
|-------|-------------|
| 0–3 | Reunião sem estrutura, sem diagnóstico |
| 4–5 | Estrutura parcial, diagnóstico superficial |
| 6–7 | Boa condução, pontos de melhoria claros |
| 8–9 | Reunião estratégica, adaptação ao perfil |
| 10 | Referência: todos os blocos executados com excelência |

#### Closing Score (0–10)
| Faixa | Significado |
|-------|-------------|
| 0–3 | Sem tentativa de fechamento |
| 4–5 | Fechamento fraco, sem comprometimento |
| 6–7 | Fechamento presente, timing questionável |
| 8–9 | Fechamento técnico, adequado ao perfil |
| 10 | Compromisso claro + próximos passos + data |

> A rubrica é **injetada no prompt** para garantir consistência entre análises.

---

### Etapa 3 — Análise de Padrões

**Gatilho:** Mínimo de **3 reuniões** (recomendado: 5–10)

**Entrada:** Array de `AnalysisResult` das reuniões selecionadas

**Saída:**
```typescript
interface PatternReport {
  recurrentBehaviors: string[]      // comportamentos que aparecem em 60%+ das reuniões
  recurringWeaknesses: string[]     // fragilidades repetidas
  perceivedEvolution: string        // narrativa de evolução
  bestPerformingProfile: string     // perfil de cliente com maior score médio
  hardestProfile: string            // perfil com maior dificuldade
  strategicTrend: string            // está melhorando/piorando/estagnando?
  thirtyDayPlan: string[]           // 5–7 ações concretas
  microHabits: string[]             // hábitos diários de 5 minutos
  alertTriggered: boolean           // padrão negativo em 3+ seguidas? ← NOVO
  alertMessage?: string             // mensagem de alerta específica ← NOVO
}
```

---

### Estratégia de Cache ← NOVO v1.1

```typescript
// lib/cache.ts
// Cache simples em memória (Map) para evitar reprocessar a mesma transcrição
const analysisCache = new Map<string, AnalysisResult>()

function getCacheKey(transcript: string, segment: string, promptVersion: string): string {
  return `${hashMD5(transcript)}-${segment}-${promptVersion}`
}
```

**Quando invalida:** Ao atualizar a versão do prompt.

---

### Estimativa de Custo por Análise ← NOVO v1.1

| Componente | Tokens estimados | Custo GPT-4o (aprox.) |
|------------|-----------------|----------------------|
| Contexto (playbook + overlay) | ~2.000 | — |
| Transcrição média (30 min) | ~4.000 | — |
| Resposta estruturada | ~2.000 | — |
| **Total por análise** | **~8.000** | **~$0.06** |
| Análise de padrões (10 reuniões) | ~15.000 | ~$0.11 |

> Com 100 análises/mês: ~$6. Viável para MVP pessoal.

---

### Fallback de Erros ← NOVO v1.1

```typescript
// lib/analyzer.ts
async function analyze(transcript: string, segment: Segment): Promise<AnalysisResult> {
  try {
    return await callOpenAI(transcript, segment)
  } catch (error) {
    if (isRateLimitError(error)) {
      await sleep(2000)
      return await callOpenAI(transcript, segment) // retry once
    }
    // Salva meeting com status ERROR, não perde a transcrição
    throw new AnalysisError('OPENAI_FAILURE', transcript)
  }
}
```

**Estados de erro exibidos ao usuário:**
- `OPENAI_FAILURE` → "Análise temporariamente indisponível. Sua transcrição foi salva."
- `TRANSCRIPT_TOO_SHORT` → "Transcrição muito curta. Mínimo de 500 palavras."
- `INVALID_FORMAT` → "Formato não reconhecido. Use CONSULTOR: / CLIENTE:"

---

## 8. 🧩 Funcionalidades MVP

### 8.1 Onboarding ← NOVO v1.1
Fluxo de primeiro acesso (3 telas):
1. **Bem-vindo** — o que o app faz (30 segundos)
2. **Seu perfil** — nome, segmento principal, meta de melhoria
3. **Primeira reunião** — botão "Analisar agora" com transcrição de exemplo pré-carregada

> Reduz fricção de adoção. Usuário experimenta o valor antes de cadastrar dados reais.

---

### 8.2 Cadastro de Cliente
- Nome, empresa, segmento
- Perfil manual (dropdown DISC)
- Notas estratégicas
- Tags livres (ex: "decisor", "difícil", "relacionamento longo") ← NOVO
- Histórico de reuniões vinculadas

---

### 8.3 Nova Reunião
**Fluxo:**
1. Selecionar cliente (ou criar novo)
2. Colar transcrição
3. Selecionar segmento (pré-preenchido do cliente)
4. **Preview de contagem de palavras + estimativa de tempo** ← NOVO
5. Processar → loading com etapas visíveis ("Lendo transcrição... Classificando perfis... Gerando estratégia...")

**Fila Offline (PWA):** ← NOVO v1.1
- Usuário cola transcrição sem internet → salva em IndexedDB com status PENDING
- Quando reconectar → processa automaticamente em background
- Notificação: "Sua reunião de [data] foi analisada."

---

### 8.4 Tela de Resultado

**Seções:**
1. **Header** — Cliente, Data, Scores (destaque visual)
2. **Participantes** — Cards com perfil + papel
3. **Estrutura da Conversa** — Timeline visual dos blocos
4. **Perfis Detectados** — DISC com evidências colapsáveis
5. **Diagnóstico Estratégico** — Avaliação do consultor por dimensão
6. **Diagnóstico Comunicação** — Estilo x Estilo
7. **Pontos Fortes** — Lista verde
8. **Ajustes Prioritários** — Lista laranja, ordenada por impacto
9. **Perguntas Estratégicas** — "O que você deveria ter perguntado"
10. **Estratégia Próxima Reunião** — Plano detalhado
11. **Scores** — Gráfico radar ← NOVO

**Ações:**
- ✏️ Editar perfil detectado (feedback loop)
- 📄 Exportar PDF
- 🔄 Re-analisar (com prompt mais recente)

---

### 8.5 Feedback Loop ← NOVO v1.1

Após ver o resultado, o usuário pode:
- Confirmar ou corrigir perfil DISC detectado
- Marcar ajustes prioritários como "já praticado"
- Adicionar notas pessoais à análise

Esses dados são salvos em `userFeedback` (JSON) e **alimentam a análise de padrões** com dados mais precisos.

---

### 8.6 Histórico de Reuniões

Lista com:
- Título, Cliente, Segmento
- Strategic Score (badge colorido)
- Closing Score
- Status (PENDING / ANALYZING / DONE / ERROR)
- Data

Filtros: por cliente, segmento, faixa de score, período.

---

### 8.7 Análise de Padrões

**Fluxo:**
1. Selecionar 3–10 reuniões (checkbox)
2. Preview: "Analisando X reuniões, aprox. Y min de interações"
3. Processar
4. Resultado: relatório consolidado com alertas visuais se padrão negativo detectado

---

### 8.8 Export PDF ← NOVO v1.1

Endpoint: `GET /api/export/[meetingId]`

Conteúdo do PDF:
- Cabeçalho com nome do cliente e data
- Scores em destaque
- Todas as seções da análise formatadas
- Plano de próxima reunião destacado
- Rodapé: "Gerado por Strategic Mentor AI"

**Tech:** `@react-pdf/renderer` ou `puppeteer` (headless Chrome no Replit)

---

## 9. 📱 PWA

| Requisito | Detalhe |
|-----------|---------|
| manifest.json | display: standalone, theme_color, background_color |
| Ícones | 192px e 512px (maskable) |
| Service Worker | Cache de assets estáticos |
| Offline queue | IndexedDB via `idb` library |
| Botão instalar | Evento `beforeinstallprompt` capturado |
| Notificações | Web Push para análise concluída em background |

---

## 10. 🎨 UX / Estados de Interface ← NOVO v1.1

| Estado | Componente | Tratamento |
|--------|-----------|------------|
| Loading | Análise em andamento | Skeleton + etapas visíveis |
| Empty state | Sem reuniões | CTA para primeira análise |
| Error | Falha na API | Mensagem clara + "Tentar novamente" |
| Offline | Sem internet | Banner + fila automática |
| Success | Análise concluída | Toast + scroll para resultado |

---

## 11. 🔐 Segurança

- API key do OpenAI **nunca** exposta no client (apenas em env vars server-side)
- Transcrições armazenadas localmente (SQLite), sem envio a terceiros além da OpenAI
- **Futuro:** criptografia AES-256 das transcrições em repouso
- **Futuro:** autenticação por magic link (NextAuth)

---

## 12. 📊 Métricas de Validação (30 dias)

| Métrica | Forma de medir |
|---------|---------------|
| Taxa de retorno | Reuniões analisadas por semana |
| Adoção de feedback loop | % de análises com perfil confirmado |
| Qualidade percebida | Score médio das análises (tracking interno) |
| Impacto declarado | Campo "resultado da reunião" (Won/Lost/Em andamento) ← NOVO |
| Export | Nº de PDFs gerados |

> **Sugestão v1.1:** Adicionar campo `dealOutcome` (GANHOU/PERDEU/EM_ANDAMENTO) nas reuniões para correlacionar scores com resultados reais. Isso transforma o app em validador estatístico do próprio método.

---

## 13. 🚫 Fora do Escopo (MVP)

- Upload de áudio / diarização por voz
- Multiusuário / times
- Sistema de pagamento
- Machine learning próprio
- CRM completo
- Dashboard comparativo entre consultores

---

## 14. 🎯 Diferencial Estratégico

O sistema:
- Usa playbooks proprietários com overlays por segmento
- Classifica múltiplos participantes com evidências
- Analisa escuta ativa por dimensão
- Detecta padrões evolutivos com alertas
- Fecha o loop: diagnóstico → plano → feedback → padrão
- **Único** que correlaciona perfil DISC com estratégia de fechamento personalizada

---

## 15. 🗓️ Plano de Execução Revisado

### Semana 1 — Fundação
- [ ] Setup Next.js + Prisma + SQLite no Replit
- [ ] Schema v1.1 (com status, version, feedback)
- [ ] Endpoint `/api/analyze` funcionando com GPT-4o
- [ ] Sistema de overlays por segmento
- [ ] Rubrica de scores injetada no prompt
- [ ] Cache básico em memória

### Semana 2 — Core Features
- [ ] Cadastro de clientes (com tags)
- [ ] Fluxo de nova reunião (com preview de palavras)
- [ ] Tela de resultado (todas as seções)
- [ ] Feedback loop (confirmar/editar perfil)
- [ ] Estados de loading/erro/vazio

### Semana 3 — Inteligência e Export
- [ ] Análise de padrões com alertas
- [ ] Exportar PDF
- [ ] Campo `dealOutcome` nas reuniões
- [ ] Histórico com filtros
- [ ] Refinamento de prompts (testar com transcrições reais)

### Semana 4 — PWA e Polimento
- [ ] PWA completa (manifest, service worker, ícones)
- [ ] Fila offline (IndexedDB)
- [ ] Onboarding (3 telas)
- [ ] Testes com transcrições reais dos 3 segmentos
- [ ] Ajuste fino de prompts baseado nos resultados

---

## 16. 📚 Glossário

| Termo | Definição no sistema |
|-------|---------------------|
| DISC | Framework de perfis: Dominante, Influente, Estável, Cauteloso |
| Overlay | Instruções adicionais de segmento injetadas no prompt base |
| Prompt Version | String que identifica a versão do template de prompt (ex: `v1.1-2026-03`) |
| Feedback Loop | Ciclo onde o usuário corrige/confirma a IA, melhorando análises futuras |
| Deal Outcome | Resultado declarado da negociação (Ganhou/Perdeu/Em andamento) |
| Pattern Alert | Alerta gerado quando padrão negativo aparece em 3+ reuniões consecutivas |
| Strategic Score | Nota 0–10 que avalia a condução estratégica da reunião |
| Closing Score | Nota 0–10 que avalia a qualidade do fechamento |
