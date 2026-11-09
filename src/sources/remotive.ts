import { HORAS_REMOTIVE_UTC } from "../config.js";
import { getJson } from "../http.js";
import { registrarFalha } from "../falhas.js";
import type { Vaga } from "../types.js";

// API pública do Remotive. Regras deles: no máximo 4 consultas por dia
// e sempre dar crédito com link para a vaga no site deles.
const URL_API = "https://remotive.com/api/remote-jobs";

interface RemotiveJob {
  id: number;
  url: string;
  title: string;
  company_name: string;
  candidate_required_location?: string;
  job_type?: string;
  publication_date?: string;
}

export async function buscarRemotive(agora = new Date()): Promise<Vaga[]> {
  const horaCerta = HORAS_REMOTIVE_UTC.includes(agora.getUTCHours()) && agora.getUTCMinutes() < 30;
  if (!horaCerta && !process.env.FORCAR_REMOTIVE) return [];

  try {
    const resp = await getJson<{ jobs?: RemotiveJob[] }>(URL_API);
    return (resp.jobs ?? []).map((j) => ({
      id: `remotive:${j.id}`,
      titulo: j.title,
      empresa: j.company_name,
      url: j.url,
      local: `Remoto (${j.candidate_required_location || "Worldwide"})`,
      remoto: true,
      publicadaEm: j.publication_date ? new Date(j.publication_date) : null,
      fonte: "remotive" as const,
      extra: j.job_type ?? "",
    }));
  } catch (erro) {
    registrarFalha("remotive", `falhou: ${(erro as Error).message}`);
    return [];
  }
}
