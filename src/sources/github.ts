import { REPOS_GITHUB } from "../config.js";
import { getJson } from "../http.js";
import { registrarFalha } from "../falhas.js";
import type { Vaga } from "../types.js";

interface Issue {
  number: number;
  title: string;
  html_url: string;
  created_at: string;
  labels: { name: string }[];
  pull_request?: unknown;
}

export async function buscarGithub(): Promise<Vaga[]> {
  const headers: Record<string, string> = { Accept: "application/vnd.github+json" };
  // No GitHub Actions o token já existe e aumenta o limite de requisições
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

  const vagas: Vaga[] = [];
  for (const repo of REPOS_GITHUB) {
    const url = `https://api.github.com/repos/${repo}/issues?state=open&sort=created&direction=desc&per_page=50`;
    try {
      const issues = await getJson<Issue[]>(url, headers);
      for (const i of issues) {
        if (i.pull_request) continue;
        const labels = i.labels.map((l) => l.name).join(" ");
        const remoto = /remot/i.test(`${i.title} ${labels}`);
        vagas.push({
          id: `github:${repo}#${i.number}`,
          titulo: i.title,
          empresa: repo,
          url: i.html_url,
          local: remoto ? "Remoto" : "Ver detalhes",
          remoto,
          publicadaEm: new Date(i.created_at),
          fonte: "github",
          extra: labels,
        });
      }
    } catch (erro) {
      registrarFalha("github", `${repo} falhou: ${(erro as Error).message}`);
    }
  }
  return vagas;
}
