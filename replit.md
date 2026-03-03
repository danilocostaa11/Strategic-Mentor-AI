# Strategic Mentor AI

## Overview
Sistema de inteligência comercial que transforma transcrições de reuniões em diagnóstico estratégico estruturado usando IA.

## Tech Stack
- **Framework**: Next.js 16 (App Router, Turbopack)
- **Language**: TypeScript
- **ORM**: Prisma with SQLite (`SQLITE_URL` env var)
- **AI**: OpenAI via Replit AI Integrations (`AI_INTEGRATIONS_OPENAI_BASE_URL`, `AI_INTEGRATIONS_OPENAI_API_KEY`)
- **Styling**: Tailwind CSS 4
- **Validation**: Zod

## Project Structure
```
mentor-ai/
  app/
    api/
      analyze/route.ts     ← Main analysis pipeline
      patterns/route.ts    ← Pattern analysis across meetings
      clients/route.ts     ← Client CRUD
      meetings/route.ts    ← Meeting CRUD
    clients/               ← Client UI pages
    dashboard/             ← Dashboard page
    meetings/              ← Meeting UI pages
    patterns/              ← Pattern analysis page
  lib/
    analyzer.ts            ← Orchestrates OpenAI analysis with cache & retry
    cache.ts               ← In-memory cache (Map) for analysis results
    openai.ts              ← OpenAI client (Replit AI Integrations)
    playbook.ts            ← Loads base playbooks + segment overlays
    prisma.ts              ← Prisma client singleton
    prompts.ts             ← Versioned prompt templates with rubrica
  data/playbooks/
    negotiation.md         ← Base negotiation playbook
    communication.md       ← Base communication playbook
    overlays/
      pharma.md            ← Pharma segment overlay
      imob.md              ← Real estate segment overlay
      b2b.md               ← B2B/Tech segment overlay
  prisma/
    schema.prisma          ← Models: Client, Meeting, PatternReport
    migrations/            ← SQLite migrations
```

## Key Architecture Decisions
- **SQLite**: Uses `SQLITE_URL` env var (not `DATABASE_URL` which is reserved for Replit PostgreSQL)
- **Prompt Versioning**: Each analysis saves `promptVersion` (e.g., `v1.1-2026-03`) and `promptHash` to the Meeting record
- **Base + Overlay System**: Prompts compose base playbooks with segment-specific overlays (~200 extra tokens per segment)
- **In-Memory Cache**: Cache key = MD5(transcript) + segment + promptVersion. Auto-invalidates on prompt version changes
- **Meeting Status**: PENDING → ANALYZING → DONE | ERROR. Transcript saved even on error
- **Model**: Uses `gpt-4o` via Replit AI Integrations (no API key needed)

## Database
- SQLite via Prisma
- Models: Client, Meeting (with status, versioning, feedback fields), PatternReport
- Migration: `cd mentor-ai && SQLITE_URL="file:./dev.db" npx prisma migrate dev`

## Workflow
- `Start application`: `cd mentor-ai && npm run dev` (port 5000)
