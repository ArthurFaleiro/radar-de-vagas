import { deveRodar } from "../agenda.js";
import { registrarFalha } from "../falhas.js";
import { getJson } from "../http.js";
import type { Vaga } from "../types.js";

// API pública do Remote OK. Termos deles: citar o Remote OK como fonte e linkar
// para a vaga no site deles (o card faz as duas coisas). Retorna as ~100 vagas mais recentes.
const URL_API = "https://remoteok.com/api";

interface RemoteOkJob {
  id?: string | number;
  position?: string;
  company?: string;
  location?: string;
  tags?: string[];
  date?: string;
  url?: string;
}

export async function buscarRemoteOk(): Promise<Vaga[]> {
  if (!deveRodar(2)) return [];
  try {
    const itens = await getJson<RemoteOkJob[]>(URL_API);
    // O primeiro item da lista é o aviso legal deles, não uma vaga
    return itens
      .filter((j) => j.id && j.position && j.url)
      .map((j) => ({
        id: `remoteok:${j.id}`,
        titulo: j.position!,
        empresa: j.company ?? "Não informado",
        url: j.url!,
        local: `Remoto (${j.location?.trim() || "Worldwide"})`,
        remoto: true,
        publicadaEm: j.date ? new Date(j.date) : null,
        fonte: "remoteok" as const,
        extra: (j.tags ?? []).join(" "),
      }));
  } catch (erro) {
    registrarFalha("remoteok", (erro as Error).message);
    return [];
  }
}
