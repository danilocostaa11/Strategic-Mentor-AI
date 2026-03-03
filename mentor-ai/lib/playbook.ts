import fs from "node:fs";
import path from "node:path";

function readPlaybook(relPath: string): string {
  const p = path.join(process.cwd(), relPath);
  return fs.readFileSync(p, "utf-8");
}

function readPlaybookSafe(relPath: string): string | null {
  const p = path.join(process.cwd(), relPath);
  if (!fs.existsSync(p)) return null;
  return fs.readFileSync(p, "utf-8");
}

export function loadPlaybooks() {
  const negotiation = readPlaybook("data/playbooks/negotiation.md");
  const communication = readPlaybook("data/playbooks/communication.md");
  return { negotiation, communication };
}

const SEGMENT_MAP: Record<string, string> = {
  PHARMA: "pharma",
  pharma: "pharma",
  Pharma: "pharma",
  IMOB: "imob",
  imob: "imob",
  Imob: "imob",
  B2B: "b2b",
  b2b: "b2b",
  IA: "b2b",
  ia: "b2b",
};

export function loadOverlay(segment: string | null | undefined): string | null {
  if (!segment) return null;
  const key = SEGMENT_MAP[segment] ?? segment.toLowerCase();
  return readPlaybookSafe(`data/playbooks/overlays/${key}.md`);
}

export function buildContext(segment: string | null | undefined): string {
  const { negotiation, communication } = loadPlaybooks();
  const base = `${negotiation}\n\n${communication}`;
  const overlay = loadOverlay(segment);
  if (!overlay) return base;
  return `${base}\n\n## Contexto de Segmento\n${overlay}`;
}
