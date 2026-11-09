import { BUSCAS_GUPY } from "../config.js";
import { esperar, getJson } from "../http.js";
import { registrarFalha } from "../falhas.js";
import type { Vaga } from "../types.js";

// Endpoint público do portal de vagas da Gupy (não documentado oficialmente;
// se mudar, esta fonte só registra o erro e as outras continuam funcionando).
const BASE = "https://employability-portal.gupy.io/api/v1/jobs";

interface GupyJob {
  id: number;
  name?: string;
  careerPageName?: string;
  jobUrl?: string;
  careerPageUrl?: string;
  city?: string;
  state?: string;
  isRemoteWork?: boolean;
  workplaceType?: string;
  type?: string;
  publishedDate?: string;
}

export async function buscarGupy(): Promise<Vaga[]> {
  const vagas = new Map<string, Vaga>();

  for (const busca of BUSCAS_GUPY) {
    const url = `${BASE}?jobName=${encodeURIComponent(busca)}&limit=100&offset=0`;
    try {
      const resp = await getJson<{ data?: GupyJob[] }>(url);
      for (const j of resp.data ?? []) {
        if (!j?.id || !j.name) continue;
        const remoto = Boolean(j.isRemoteWork) || j.workplaceType === "remote";
        const local = remoto ? "Remoto" : [j.city, j.state].filter(Boolean).join(" - ") || "Não informado";
        vagas.set(`gupy:${j.id}`, {
          id: `gupy:${j.id}`,
          titulo: j.name,
          empresa: j.careerPageName ?? "Não informado",
          url: j.jobUrl ?? j.careerPageUrl ?? "https://portal.gupy.io",
          local,
          remoto,
          publicadaEm: j.publishedDate ? new Date(j.publishedDate) : null,
          fonte: "gupy",
          // O tipo vem como "vacancy_type_internship", "vacancy_type_trainee" etc.
          extra: (j.type ?? "").replace(/vacancy_type_|_/g, " "),
        });
      }
    } catch (erro) {
      registrarFalha("gupy", `busca "${busca}" falhou: ${(erro as Error).message}`);
    }
    await esperar(1_000); // 1 requisição por segundo, para não sobrecarregar
  }

  return [...vagas.values()];
}
