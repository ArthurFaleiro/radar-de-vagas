import { deveRodar } from "../agenda.js";
import { EMPRESAS } from "../config.js";
import { registrarFalha } from "../falhas.js";
import { esperar, getJson } from "../http.js";
import type { Vaga } from "../types.js";

// Páginas de carreira das empresas, lidas pelas APIs públicas e oficiais
// de Greenhouse, Lever e Ashby (feitas justamente para exibir vagas em outros sites).

const ehRemoto = (texto: string) => /remot|anywhere|home ?office|teletrabalho/i.test(texto);

async function greenhouse(empresa: string): Promise<Vaga[]> {
  const resp = await getJson<{
    jobs?: { id: number; title: string; absolute_url: string; location?: { name?: string }; first_published?: string; updated_at?: string }[];
  }>(`https://boards-api.greenhouse.io/v1/boards/${empresa}/jobs`);
  return (resp.jobs ?? []).map((j) => {
    const local = j.location?.name || "Não informado";
    const data = j.first_published ?? j.updated_at;
    return {
      id: `greenhouse:${empresa}:${j.id}`,
      titulo: j.title,
      empresa,
      url: j.absolute_url,
      local,
      remoto: ehRemoto(local),
      publicadaEm: data ? new Date(data) : null,
      fonte: "greenhouse" as const,
    };
  });
}

async function lever(empresa: string): Promise<Vaga[]> {
  const itens = await getJson<
    { id: string; text: string; hostedUrl: string; createdAt?: number; workplaceType?: string; categories?: { location?: string; commitment?: string } }[]
  >(`https://api.lever.co/v0/postings/${empresa}?mode=json`);
  return itens.map((j) => {
    const local = j.categories?.location || "Não informado";
    return {
      id: `lever:${empresa}:${j.id}`,
      titulo: j.text,
      empresa,
      url: j.hostedUrl,
      local,
      remoto: j.workplaceType === "remote" || ehRemoto(local),
      publicadaEm: j.createdAt ? new Date(j.createdAt) : null,
      fonte: "lever" as const,
      extra: j.categories?.commitment ?? "",
    };
  });
}

async function ashby(empresa: string): Promise<Vaga[]> {
  const resp = await getJson<{
    jobs?: { id: string; title: string; jobUrl: string; location?: string; isRemote?: boolean; workplaceType?: string; employmentType?: string; publishedAt?: string }[];
  }>(`https://api.ashbyhq.com/posting-api/job-board/${empresa}`);
  return (resp.jobs ?? []).map((j) => {
    const local = j.location || "Não informado";
    return {
      id: `ashby:${empresa}:${j.id}`,
      titulo: j.title,
      empresa,
      url: j.jobUrl,
      local,
      remoto: Boolean(j.isRemote) || j.workplaceType === "Remote" || ehRemoto(local),
      publicadaEm: j.publishedAt ? new Date(j.publishedAt) : null,
      fonte: "ashby" as const,
      extra: j.employmentType ?? "",
    };
  });
}

const LEITORES = { greenhouse, lever, ashby } as const;

export async function buscarEmpresas(): Promise<Vaga[]> {
  if (!deveRodar(2)) return []; // vagas de empresa mudam devagar; a cada 2h basta

  const vagas: Vaga[] = [];
  for (const [plataforma, empresas] of Object.entries(EMPRESAS) as [keyof typeof LEITORES, string[]][]) {
    for (const empresa of empresas) {
      try {
        vagas.push(...(await LEITORES[plataforma](empresa)));
      } catch (erro) {
        registrarFalha(plataforma, `empresa "${empresa}": ${(erro as Error).message}`);
      }
      await esperar(500);
    }
  }
  return vagas;
}
