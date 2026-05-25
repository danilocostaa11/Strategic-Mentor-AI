// Publica análise como nota markdown no vault Obsidian (repo GitHub privado).
// Opt-in via env var VAULT_AUTOPUBLISH=true. Falhar em silêncio se config ausente.

import {
  buildMarkdown,
  isPharmaSegment,
  resolveVaultPath,
} from "./vault-formatter";

export type PublishResult =
  | { published: true; path: string; commitSha: string; url: string }
  | { published: false; reason: string; detail?: string };

interface GitHubFileResponse {
  content?: { sha: string; html_url: string };
  commit?: { sha: string };
}

async function getExistingFileSha(opts: {
  owner: string;
  repo: string;
  path: string;
  branch: string;
  token: string;
}): Promise<string | null> {
  const url = `https://api.github.com/repos/${opts.owner}/${opts.repo}/contents/${encodeURIComponent(opts.path)}?ref=${encodeURIComponent(opts.branch)}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${opts.token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GitHub GET failed: ${res.status} ${await res.text()}`);
  const data = (await res.json()) as { sha?: string };
  return data.sha ?? null;
}

export async function publishToVault(meeting: any, analysis: any): Promise<PublishResult> {
  if (process.env.VAULT_AUTOPUBLISH !== "true") {
    return { published: false, reason: "disabled" };
  }

  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.VAULT_REPO_OWNER;
  const repo = process.env.VAULT_REPO_NAME;
  const branch = process.env.VAULT_BRANCH || "main";

  if (!token || !owner || !repo) {
    return { published: false, reason: "config-missing", detail: "GITHUB_TOKEN, VAULT_REPO_OWNER, VAULT_REPO_NAME required" };
  }

  const segment = meeting.segment || meeting.client?.segment || null;
  if (isPharmaSegment(segment)) {
    return { published: false, reason: "r-az2-blocked", detail: "Pharma segment cannot be auto-published to vault" };
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://mentor-ai-topaz.vercel.app";
  const path = resolveVaultPath(meeting, analysis);
  const markdown = buildMarkdown(meeting, analysis, baseUrl);
  const contentBase64 = Buffer.from(markdown, "utf-8").toString("base64");

  try {
    const existingSha = await getExistingFileSha({ owner, repo, path, branch, token });
    const action = existingSha ? "update" : "create";
    const commitMessage = `mentor-ai: ${action} ${path} (meeting ${meeting.id})`;

    const putUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}`;
    const body: Record<string, unknown> = {
      message: commitMessage,
      content: contentBase64,
      branch,
    };
    if (existingSha) body.sha = existingSha;

    const res = await fetch(putUrl, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errorText = await res.text();
      return { published: false, reason: "github-api-error", detail: `${res.status} ${errorText.slice(0, 200)}` };
    }

    const data = (await res.json()) as GitHubFileResponse;
    return {
      published: true,
      path,
      commitSha: data.commit?.sha || "unknown",
      url: data.content?.html_url || `https://github.com/${owner}/${repo}/blob/${branch}/${path}`,
    };
  } catch (error: any) {
    return { published: false, reason: "exception", detail: error?.message || String(error) };
  }
}
