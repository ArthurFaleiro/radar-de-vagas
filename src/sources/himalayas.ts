import { deveRodar } from "../agenda.js";
import { SENIORIDADES_HIMALAYAS } from "../config.js";
import { registrarFalha } from "../falhas.js";
import { esperar, getJson } from "../http.js";
import type { Vaga } from "../types.js";

// API pública e oficial do Himalayas (só vagas remotas). Regra deles: dar crédito
// ao Himalayas ao exibir as vagas — o card mostra "via Himalayas" e linka para o site.
const URL_API = "https://himalayas.app/jobs/api/search";

interface HimalayasJob {
  guid?: string;
  title?: string;
  companyName?: string;
  applicationLink?: string;
  locationRestrictions?: string[];
  seniority?: string[] | string;
  employmentType?: string;
  pubDate?: number | string;
}

function paraData(valor: number | string | undefined): Date | null {
  if (valor === undefined || valor === null || valor === "") return null;
  if (typeof valor === "number") return new Date(valor < 1e12 ? valor * 1000 : valor); // segundos ou ms
  const d = new Date(valor);
  return Number.isNaN(d.getTime()) ? null : d;
}

export async function buscarHimalayas(): Promise<Vaga[]> {
  if (!deveRodar(3)) return []; // os dados deles atualizam 1x por dia; a cada 3h sobra

  const vagas = new Map<string, Vaga>();
  for (const seniority of SENIORIDADES_HIMALAYAS) {
    const url = `${URL_API}?seniority=${encodeURIComponent(seniority)}&sort=recent&page=1`;
    try {
      const resp = await getJson<{ jobs?: HimalayasJob[] }>(url);
      for (const j of resp.jobs ?? []) {
        if (!j.title || !j.applicationLink) continue;
        const id = `himalayas:${j.guid ?? j.applicationLink}`;
        const restricoes = j.locationRestrictions?.filter(Boolean) ?? [];
        const senioridade = Array.isArray(j.seniority) ? j.seniority.join(" ") : (j.seniority ?? "");
        vagas.set(id, {
          id,
          titulo: j.title,
          empresa: j.companyName ?? "Não informado",
          url: j.applicationLink,
          local: `Remoto (${restricoes.length ? restricoes.join(", ") : "Worldwide"})`,
          remoto: true,
          publicadaEm: paraData(j.pubDate),
          fonte: "himalayas",
          extra: `${senioridade} ${j.employmentType ?? ""}`,
        });
      }
    } catch (erro) {
      registrarFalha("himalayas", `seniority "${seniority}" falhou: ${(erro as Error).message}`);
    }
    await esperar(1_500);
  }
  return [...vagas.values()];
}
