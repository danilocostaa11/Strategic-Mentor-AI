#!/usr/bin/env bash
set -euo pipefail

echo "== Strategic Mentor AI :: Setup (Next.js + Prisma + SQLite + OpenAI + PWA) =="

# 0) Basic checks
if [ ! -f "package.json" ]; then
  echo "ERRO: package.json não encontrado. Crie um Repl usando o template Next.js primeiro."
  exit 1
fi

# 1) Install deps
echo "-> Instalando dependências..."
npm i prisma @prisma/client zod next-pwa lucide-react >/dev/null

# 2) Prisma init (se não existir)
if [ ! -d "prisma" ]; then
  echo "-> Inicializando Prisma..."
  npx prisma init --datasource-provider sqlite >/dev/null
fi

# 3) .env (não sobrescreve se já existir)
if [ ! -f ".env" ]; then
  echo "-> Criando .env (placeholder)..."
  cat > .env <<'ENV'
DATABASE_URL="file:./dev.db"
# OPENAI_API_KEY deve ser definido nos Secrets do Replit (Tools -> Secrets)
ENV
fi

# 4) Prisma schema
echo "-> Escrevendo prisma/schema.prisma..."
cat > prisma/schema.prisma <<'PRISMA'
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model Client {
  id                String   @id @default(cuid())
  name              String
  company           String?
  segment           String?  // Pharma | Imob | IA
  profileManual     String?  // Analítico | Integrador | Expressivo | Pragmático
  profileAI         String?
  profileConfidence Float?
  notes             String?
  createdAt         DateTime @default(now())
  meetings          Meeting[]
}

model Meeting {
  id             String   @id @default(cuid())
  clientId       String?
  title          String
  segment        String?
  rawTranscript  String
  analysisJson   String?  // JSON string
  strategicScore Float?
  closingScore   Float?
  createdAt      DateTime @default(now())

  client         Client?  @relation(fields: [clientId], references: [id])
}
PRISMA

# 5) Create folders
echo "-> Criando estrutura de pastas..."
mkdir -p lib data/playbooks public/icons
mkdir -p app/dashboard app/clients app/meetings/new app/meetings/[id] app/patterns
mkdir -p app/api/clients app/api/meetings app/api/analyze app/api/patterns

# 6) Playbooks placeholders (não sobrescreve se já existirem)
if [ ! -f "data/playbooks/negotiation.md" ]; then
  cat > data/playbooks/negotiation.md <<'MD'
# Playbook de Negociação (placeholder)
Cole aqui o conteúdo do seu playbook de negociação em Markdown.
MD
fi

if [ ! -f "data/playbooks/communication.md" ]; then
  cat > data/playbooks/communication.md <<'MD'
# Playbook de Comunicação & Escuta (placeholder)
Cole aqui o conteúdo do seu playbook de comunicação/escuta em Markdown.
MD
fi

# 7) lib/prisma.ts
cat > lib/prisma.ts <<'TS'
import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    log: ["error", "warn"],
  });

if (process.env.NODE_ENV !== "production") global.prisma = prisma;
TS

# 8) lib/playbook.ts
cat > lib/playbook.ts <<'TS'
import fs from "node:fs";
import path from "node:path";

function readPlaybook(relPath: string) {
  const p = path.join(process.cwd(), relPath);
  return fs.readFileSync(p, "utf-8");
}

export function loadPlaybooks() {
  const negotiation = readPlaybook("data/playbooks/negotiation.md");
  const communication = readPlaybook("data/playbooks/communication.md");

  return { negotiation, communication };
}
TS

# 9) lib/prompts.ts
cat > lib/prompts.ts <<'TS'
export function buildIndividualPrompt(args: {
  negotiationPlaybook: string;
  communicationPlaybook: string;
  transcript: string;
  segment?: string | null;
  clientContext?: string | null;
}) {
  const { negotiationPlaybook, communicationPlaybook, transcript, segment, clientContext } = args;

  return `
Você é um Mentor Estratégico de Performance Comercial (equilibrado: método + psicologia).
Você deve seguir os PLAYBOOKS abaixo como referência principal (a "lei da casa").

=== PLAYBOOK: NEGOCIAÇÃO ===
${negotiationPlaybook}

=== PLAYBOOK: COMUNICAÇÃO & ESCUTA ATIVA ===
${communicationPlaybook}

=== CONTEXTO (se houver) ===
Segmento: ${segment ?? "N/A"}
Cliente (contexto cadastrado): ${clientContext ?? "N/A"}

=== TAREFA ===
Analise a transcrição bruta. Ela pode estar desorganizada e misturar quebra-gelo e assunto técnico.

Regras:
1) Identifique participantes e separe falas:
   - CONSULTOR
   - CLIENTE_1, CLIENTE_2, CLIENTE_3 (se houver)
   - Para cada CLIENTE_n, inferir papel: decisor / influenciador / técnico / observador (se possível).
2) Reorganize a conversa em blocos:
   - RAPPORT
   - TRANSIÇÃO
   - DIAGNÓSTICO
   - DORES
   - ARGUMENTAÇÃO
   - OBJEÇÕES
   - AVANÇO/FECHAMENTO
   - ENCERRAMENTO
3) Classifique PERFIL (DISC) por participante cliente:
   Analítico / Integrador / Expressivo / Pragmático
   - inclua confiança (0-100)
   - inclua evidências (trechos curtos, sem inventar)
4) Avalie o CONSULTOR:
   - condução estratégica (reativo vs conduzindo)
   - escuta ativa (perguntas abertas, validação, espaço para o outro)
   - estilo de comunicação predominante (analítico/amigável/autoritário/expressivo)
   - adequação ao perfil do(s) cliente(s)
   - qualidade de abertura (primeiros 5s)
   - fechamento (CTA + próximo passo claro)
5) Gere recomendações práticas para o próximo encontro (consultivo e orientado a fechamento).

=== FORMATO DE SAÍDA (OBRIGATÓRIO) ===
Responda SOMENTE com JSON válido exatamente neste schema:

{
  "participants": [
    { "label": "CONSULTOR", "role": "consultor" },
    { "label": "CLIENTE_1", "role": "decisor|influenciador|tecnico|observador|indefinido" }
  ],
  "structuredConversation": [
    { "block": "RAPPORT|TRANSIÇÃO|DIAGNÓSTICO|DORES|ARGUMENTAÇÃO|OBJEÇÕES|AVANÇO/FECHAMENTO|ENCERRAMENTO",
      "highlights": ["bullets curtos"],
      "keyQuotes": [{ "speaker": "CONSULTOR|CLIENTE_1|CLIENTE_2", "quote": "trecho curto" }]
    }
  ],
  "profiles": [
    { "participant": "CLIENTE_1",
      "disc": "Analítico|Integrador|Expressivo|Pragmático|Indefinido",
      "confidence": 0,
      "evidence": ["trechos curtos"]
    }
  ],
  "scores": {
    "strategic": 0,
    "closing": 0,
    "listening": 0
  },
  "strengths": ["3-6 itens"],
  "improvements": ["3-6 itens"],
  "missedOpportunities": ["2-6 itens"],
  "nextMeetingPlan": {
    "goal": "objetivo claro",
    "strategy": ["3-6 bullets"],
    "questions": ["5-12 perguntas estratégicas"],
    "closingStrategy": ["3-6 bullets"]
  },
  "meta": {
    "segment": "${segment ?? ""}",
    "notes": "se houver ambiguidade, descreva aqui sem inventar"
  }
}

=== TRANSCRIÇÃO ===
${transcript}
`.trim();
}

export function buildPatternsPrompt(args: {
  negotiationPlaybook: string;
  communicationPlaybook: string;
  analysesJsonArray: string;
  segment?: string | null;
}) {
  const { negotiationPlaybook, communicationPlaybook, analysesJsonArray, segment } = args;

  return `
Você é um Mentor Estratégico de Performance Comercial.
Use os PLAYBOOKS como referência. Analise padrões recorrentes do CONSULTOR ao longo de várias reuniões.

=== PLAYBOOK: NEGOCIAÇÃO ===
${negotiationPlaybook}

=== PLAYBOOK: COMUNICAÇÃO & ESCUTA ATIVA ===
${communicationPlaybook}

Segmento: ${segment ?? "N/A"}

Entrada: uma lista de análises anteriores (JSON). Não invente nada além do que está ali.

=== SAÍDA (SOMENTE JSON) ===
{
  "summary": "resumo geral em 3-6 linhas",
  "recurringStrengths": ["3-8 itens"],
  "recurringWeaknesses": ["3-10 itens"],
  "closingPatterns": ["2-8 itens"],
  "listeningPatterns": ["2-8 itens"],
  "profilePerformance": [
    { "disc": "Analítico|Integrador|Expressivo|Pragmático", "trend": "melhor|pior|misto", "notes": "curto" }
  ],
  "evolution": {
    "trend": "melhorando|estável|piorando|indefinido",
    "evidence": ["pontos objetivos"]
  },
  "plan30Days": {
    "focus": ["3-6 focos"],
    "microHabits": ["5-12 micro-hábitos"],
    "weeklyDrills": ["2-6 exercícios semanais"],
    "checklistBeforeMeeting": ["5-10 itens"],
    "checklistAfterMeeting": ["5-10 itens"]
  }
}

=== ANALYSES_JSON_ARRAY ===
${analysesJsonArray}
`.trim();
}
TS

# 10) lib/openai.ts (SDK oficial)
cat > lib/openai.ts <<'TS'
import OpenAI from "openai";

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});
TS

# 11) lib/analyzer.ts
cat > lib/analyzer.ts <<'TS'
import { openai } from "./openai";
import { buildIndividualPrompt, buildPatternsPrompt } from "./prompts";
import { loadPlaybooks } from "./playbook";

function safeJsonParse(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start >= 0 && end > start) {
      const slice = text.slice(start, end + 1);
      return JSON.parse(slice);
    }
    throw new Error("Resposta não é JSON válido.");
  }
}

export async function analyzeMeeting(args: {
  transcript: string;
  segment?: string | null;
  clientContext?: string | null;
}) {
  const { negotiation, communication } = loadPlaybooks();

  const prompt = buildIndividualPrompt({
    negotiationPlaybook: negotiation,
    communicationPlaybook: communication,
    transcript: args.transcript,
    segment: args.segment,
    clientContext: args.clientContext,
  });

  const resp = await openai.chat.completions.create({
    model: "gpt-5.2-mini",
    temperature: 0.2,
    messages: [
      { role: "system", content: "Você responde somente em JSON válido." },
      { role: "user", content: prompt },
    ],
  });

  const text = resp.choices[0]?.message?.content ?? "";
  return safeJsonParse(text);
}

export async function analyzePatterns(args: {
  analyses: any[];
  segment?: string | null;
}) {
  const { negotiation, communication } = loadPlaybooks();

  const prompt = buildPatternsPrompt({
    negotiationPlaybook: negotiation,
    communicationPlaybook: communication,
    analysesJsonArray: JSON.stringify(args.analyses),
    segment: args.segment,
  });

  const resp = await openai.chat.completions.create({
    model: "gpt-5.2-mini",
    temperature: 0.2,
    messages: [
      { role: "system", content: "Você responde somente em JSON válido." },
      { role: "user", content: prompt },
    ],
  });

  const text = resp.choices[0]?.message?.content ?? "";
  return safeJsonParse(text);
}
TS

# 12) API routes
cat > app/api/clients/route.ts <<'TS'
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const clients = await prisma.client.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(clients);
}

export async function POST(req: Request) {
  const body = await req.json();
  const client = await prisma.client.create({
    data: {
      name: body.name,
      company: body.company ?? null,
      segment: body.segment ?? null,
      profileManual: body.profileManual ?? null,
      notes: body.notes ?? null,
    },
  });
  return NextResponse.json(client);
}
TS

cat > app/api/meetings/route.ts <<'TS'
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const meetings = await prisma.meeting.findMany({
    orderBy: { createdAt: "desc" },
    include: { client: true },
  });
  return NextResponse.json(meetings);
}

export async function POST(req: Request) {
  const body = await req.json();
  const meeting = await prisma.meeting.create({
    data: {
      clientId: body.clientId ?? null,
      title: body.title,
      segment: body.segment ?? null,
      rawTranscript: body.rawTranscript,
      analysisJson: body.analysisJson ?? null,
      strategicScore: body.strategicScore ?? null,
      closingScore: body.closingScore ?? null,
    },
  });
  return NextResponse.json(meeting);
}
TS

cat > app/api/analyze/route.ts <<'TS'
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { analyzeMeeting } from "@/lib/analyzer";

export async function POST(req: Request) {
  const body = await req.json();

  const transcript: string = body.transcript ?? "";
  const clientId: string | null = body.clientId ?? null;
  const title: string = body.title ?? "Reunião";
  const segment: string | null = body.segment ?? null;

  if (!transcript || transcript.trim().length < 20) {
    return NextResponse.json({ error: "Transcrição muito curta." }, { status: 400 });
  }

  let clientContext: string | null = null;

  if (clientId) {
    const client = await prisma.client.findUnique({ where: { id: clientId } });
    if (client) {
      clientContext = [
        `Nome: ${client.name}`,
        client.company ? `Empresa: ${client.company}` : "",
        client.segment ? `Segmento: ${client.segment}` : "",
        client.profileManual ? `Perfil manual: ${client.profileManual}` : "",
        client.profileAI ? `Perfil IA: ${client.profileAI}` : "",
        client.notes ? `Notas: ${client.notes}` : "",
      ].filter(Boolean).join("\n");
    }
  }

  const analysis = await analyzeMeeting({ transcript, segment, clientContext });

  const strategicScore = Number(analysis?.scores?.strategic ?? null);
  const closingScore = Number(analysis?.scores?.closing ?? null);

  const meeting = await prisma.meeting.create({
    data: {
      clientId,
      title,
      segment,
      rawTranscript: transcript,
      analysisJson: JSON.stringify(analysis),
      strategicScore: Number.isFinite(strategicScore) ? strategicScore : null,
      closingScore: Number.isFinite(closingScore) ? closingScore : null,
    },
  });

  return NextResponse.json({ meetingId: meeting.id, analysis });
}
TS

cat > app/api/patterns/route.ts <<'TS'
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { analyzePatterns } from "@/lib/analyzer";

export async function POST(req: Request) {
  const body = await req.json();
  const meetingIds: string[] = body.meetingIds ?? [];
  const segment: string | null = body.segment ?? null;

  if (!Array.isArray(meetingIds) || meetingIds.length < 3) {
    return NextResponse.json({ error: "Selecione pelo menos 3 reuniões." }, { status: 400 });
  }

  const meetings = await prisma.meeting.findMany({
    where: { id: { in: meetingIds } },
    select: { analysisJson: true },
  });

  const analyses = meetings
    .map(m => (m.analysisJson ? JSON.parse(m.analysisJson) : null))
    .filter(Boolean);

  const report = await analyzePatterns({ analyses, segment });
  return NextResponse.json(report);
}
TS

# 13) Minimal UI pages
cat > app/page.tsx <<'TSX'
import Link from "next/link";

export default function Home() {
  return (
    <main style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <h1 style={{ fontSize: 28, fontWeight: 700 }}>Strategic Mentor AI</h1>
      <p style={{ marginTop: 8, opacity: 0.8 }}>
        Cole uma transcrição e receba diagnóstico estratégico + perfil comportamental + plano da próxima reunião.
      </p>

      <div style={{ display: "flex", gap: 12, marginTop: 20, flexWrap: "wrap" }}>
        <Link href="/meetings/new">Nova análise</Link>
        <Link href="/clients">Clientes</Link>
        <Link href="/dashboard">Histórico</Link>
        <Link href="/patterns">Análise de padrões</Link>
      </div>
    </main>
  );
}
TSX

cat > app/meetings/new/page.tsx <<'TSX'
"use client";

import { useEffect, useState } from "react";

type Client = { id: string; name: string };

export default function NewMeetingPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [clientId, setClientId] = useState<string>("");
  const [title, setTitle] = useState("Reunião");
  const [segment, setSegment] = useState("Pharma");
  const [transcript, setTranscript] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    fetch("/api/clients")
      .then(r => r.json())
      .then(setClients)
      .catch(() => setClients([]));
  }, []);

  async function run() {
    setLoading(true);
    setResult(null);
    try {
      const r = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId: clientId || null, title, segment, transcript }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data?.error ?? "Erro ao analisar.");
      setResult(data);
    } catch (e: any) {
      alert(e.message ?? "Erro");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <h2 style={{ fontSize: 22, fontWeight: 700 }}>Nova análise</h2>

      <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
        <label>
          Título
          <input value={title} onChange={(e) => setTitle(e.target.value)} style={{ width: "100%", padding: 8 }} />
        </label>

        <label>
          Segmento
          <select value={segment} onChange={(e) => setSegment(e.target.value)} style={{ width: "100%", padding: 8 }}>
            <option>Pharma</option>
            <option>Imob</option>
            <option>IA</option>
          </select>
        </label>

        <label>
          Cliente (opcional)
          <select value={clientId} onChange={(e) => setClientId(e.target.value)} style={{ width: "100%", padding: 8 }}>
            <option value="">— sem cliente —</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </label>

        <label>
          Transcrição
          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            rows={12}
            style={{ width: "100%", padding: 10 }}
            placeholder="Cole aqui a transcrição bruta..."
          />
        </label>

        <button onClick={run} disabled={loading} style={{ padding: 10 }}>
          {loading ? "Analisando..." : "Analisar"}
        </button>
      </div>

      {result?.analysis && (
        <section style={{ marginTop: 18 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700 }}>Resultado</h3>
          <pre style={{ whiteSpace: "pre-wrap", background: "#111", color: "#fff", padding: 12, borderRadius: 8 }}>
            {JSON.stringify(result.analysis, null, 2)}
          </pre>
          <p style={{ marginTop: 8, opacity: 0.8 }}>
            Meeting ID: {result.meetingId}
          </p>
        </section>
      )}
    </main>
  );
}
TSX

cat > app/clients/page.tsx <<'TSX'
"use client";

import { useEffect, useState } from "react";

type Client = { id: string; name: string; company?: string | null; segment?: string | null; profileManual?: string | null };

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [segment, setSegment] = useState("Pharma");
  const [profileManual, setProfileManual] = useState("Analítico");

  async function refresh() {
    const r = await fetch("/api/clients");
    setClients(await r.json());
  }

  useEffect(() => { refresh(); }, []);

  async function createClient() {
    const r = await fetch("/api/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, company, segment, profileManual }),
    });
    if (!r.ok) {
      const data = await r.json();
      alert(data?.error ?? "Erro");
      return;
    }
    setName("");
    setCompany("");
    await refresh();
  }

  return (
    <main style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <h2 style={{ fontSize: 22, fontWeight: 700 }}>Clientes</h2>

      <div style={{ display: "grid", gap: 10, marginTop: 14, padding: 12, border: "1px solid #ddd", borderRadius: 8 }}>
        <h3 style={{ fontWeight: 700 }}>Novo cliente</h3>
        <input placeholder="Nome" value={name} onChange={(e) => setName(e.target.value)} style={{ padding: 8 }} />
        <input placeholder="Empresa (opcional)" value={company} onChange={(e) => setCompany(e.target.value)} style={{ padding: 8 }} />
        <select value={segment} onChange={(e) => setSegment(e.target.value)} style={{ padding: 8 }}>
          <option>Pharma</option>
          <option>Imob</option>
          <option>IA</option>
        </select>
        <select value={profileManual} onChange={(e) => setProfileManual(e.target.value)} style={{ padding: 8 }}>
          <option>Analítico</option>
          <option>Integrador</option>
          <option>Expressivo</option>
          <option>Pragmático</option>
        </select>
        <button onClick={createClient} disabled={!name.trim()} style={{ padding: 10 }}>
          Criar
        </button>
      </div>

      <div style={{ marginTop: 18 }}>
        <h3 style={{ fontWeight: 700 }}>Lista</h3>
        <ul style={{ marginTop: 10 }}>
          {clients.map(c => (
            <li key={c.id} style={{ padding: 10, borderBottom: "1px solid #eee" }}>
              <b>{c.name}</b> {c.company ? `— ${c.company}` : ""}{" "}
              <span style={{ opacity: 0.7 }}>
                ({c.segment ?? "N/A"} | {c.profileManual ?? "sem perfil"})
              </span>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
TSX

cat > app/dashboard/page.tsx <<'TSX'
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Meeting = {
  id: string;
  title: string;
  segment?: string | null;
  strategicScore?: number | null;
  closingScore?: number | null;
  createdAt: string;
  client?: { name: string } | null;
};

export default function DashboardPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);

  useEffect(() => {
    fetch("/api/meetings").then(r => r.json()).then(setMeetings);
  }, []);

  return (
    <main style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <h2 style={{ fontSize: 22, fontWeight: 700 }}>Histórico</h2>

      <ul style={{ marginTop: 12 }}>
        {meetings.map(m => (
          <li key={m.id} style={{ padding: 10, borderBottom: "1px solid #eee" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <div>
                <b>{m.title}</b>{" "}
                <span style={{ opacity: 0.7 }}>
                  {m.client?.name ? `— ${m.client.name}` : ""} ({m.segment ?? "N/A"})
                </span>
                <div style={{ opacity: 0.7, fontSize: 12 }}>
                  {new Date(m.createdAt).toLocaleString()}
                </div>
              </div>

              <div style={{ textAlign: "right" }}>
                <div>Estratégia: {m.strategicScore ?? "—"}</div>
                <div>Fechamento: {m.closingScore ?? "—"}</div>
                <Link href={`/meetings/${m.id}`}>Ver</Link>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
TSX

cat > app/meetings/[id]/page.tsx <<'TSX'
import { prisma } from "@/lib/prisma";

export default async function MeetingPage({ params }: { params: { id: string } }) {
  const meeting = await prisma.meeting.findUnique({
    where: { id: params.id },
    include: { client: true },
  });

  if (!meeting) return <main style={{ padding: 24 }}>Não encontrado.</main>;

  const analysis = meeting.analysisJson ? JSON.parse(meeting.analysisJson) : null;

  return (
    <main style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <h2 style={{ fontSize: 22, fontWeight: 700 }}>{meeting.title}</h2>
      <p style={{ opacity: 0.75 }}>
        {meeting.client?.name ? `Cliente: ${meeting.client.name} • ` : ""}
        Segmento: {meeting.segment ?? "N/A"}
      </p>

      <h3 style={{ marginTop: 14, fontWeight: 700 }}>Análise</h3>
      <pre style={{ whiteSpace: "pre-wrap", background: "#111", color: "#fff", padding: 12, borderRadius: 8 }}>
        {analysis ? JSON.stringify(analysis, null, 2) : "Sem análise salva."}
      </pre>
    </main>
  );
}
TSX

cat > app/patterns/page.tsx <<'TSX'
"use client";

import { useEffect, useState } from "react";

type Meeting = { id: string; title: string; createdAt: string };

export default function PatternsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/meetings")
      .then(r => r.json())
      .then((data) => setMeetings(data.map((m: any) => ({ id: m.id, title: m.title, createdAt: m.createdAt }))));
  }, []);

  async function run() {
    const ids = Object.entries(selected).filter(([, v]) => v).map(([k]) => k);
    setLoading(true);
    setReport(null);
    try {
      const r = await fetch("/api/patterns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ meetingIds: ids }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data?.error ?? "Erro ao gerar padrões.");
      setReport(data);
    } catch (e: any) {
      alert(e.message ?? "Erro");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <h2 style={{ fontSize: 22, fontWeight: 700 }}>Análise de padrões</h2>
      <p style={{ opacity: 0.8 }}>Selecione pelo menos 3 reuniões.</p>

      <div style={{ marginTop: 12 }}>
        {meetings.map(m => (
          <label key={m.id} style={{ display: "block", padding: 8, borderBottom: "1px solid #eee" }}>
            <input
              type="checkbox"
              checked={!!selected[m.id]}
              onChange={(e) => setSelected(s => ({ ...s, [m.id]: e.target.checked }))}
            />{" "}
            <b>{m.title}</b> <span style={{ opacity: 0.7, fontSize: 12 }}>{new Date(m.createdAt).toLocaleString()}</span>
          </label>
        ))}
      </div>

      <button onClick={run} disabled={loading} style={{ marginTop: 12, padding: 10 }}>
        {loading ? "Gerando..." : "Gerar padrões"}
      </button>

      {report && (
        <pre style={{ marginTop: 14, whiteSpace: "pre-wrap", background: "#111", color: "#fff", padding: 12, borderRadius: 8 }}>
          {JSON.stringify(report, null, 2)}
        </pre>
      )}
    </main>
  );
}
TSX

# 14) PWA minimal
echo "-> Configurando PWA..."
if [ ! -f "next.config.js" ]; then
  cat > next.config.js <<'JS'
const withPWA = require("next-pwa")({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
});

module.exports = withPWA({
  reactStrictMode: true,
});
JS
fi

if [ ! -f "public/manifest.json" ]; then
  cat > public/manifest.json <<'JSON'
{
  "name": "Strategic Mentor AI",
  "short_name": "MentorAI",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0b0b0b",
  "theme_color": "#0b0b0b",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  }
}
JSON
fi

# 15) Run migrate
echo "-> Rodando migração Prisma..."
npx prisma migrate dev --name init >/dev/null || true

echo ""
echo "✅ Setup finalizado!"
echo "Próximos passos:"
echo "1) Replit -> Tools -> Secrets: defina OPENAI_API_KEY"
echo "2) Cole seus playbooks reais em data/playbooks/negotiation.md e communication.md"
echo "3) Rode: npm run dev"
echo ""
echo "Dica: ícones do PWA são opcionais agora (public/icons/icon-192.png e icon-512.png)."
