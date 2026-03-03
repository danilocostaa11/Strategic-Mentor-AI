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
