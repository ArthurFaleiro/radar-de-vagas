import { CIDADES_PRESENCIAIS, PADROES, SIGLAS_IA } from "./config.js";
import type { Canal, Vaga } from "./types.js";

export function normalizar(texto: string): string {
  return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

const algum = (padroes: RegExp[], texto: string) => padroes.some((p) => p.test(texto));

const PADROES_CIDADES = CIDADES_PRESENCIAIS.map((c) => new RegExp(`\\b${c.replace(/\s+/g, "\\s+")}\\b`));

/**
 * Remota: passa sempre. Presencial ou híbrida: só se for numa das cidades da lista.
 * Na Gupy a cidade vem no campo "local"; no GitHub ela costuma estar no título ou nas labels.
 */
export function localPermitido(vaga: Vaga): boolean {
  if (vaga.remoto) return true;
  const onde = normalizar(`${vaga.local} ${vaga.titulo} ${vaga.extra ?? ""}`);
  return algum(PADROES_CIDADES, onde);
}

/**
 * Decide para quais canais a vaga vai (lista vazia = ignorar).
 *
 * - Vagas do Brasil vão para o canal do nível (#estágio, #junior, #full-stack ou #ia)
 *   e, se forem remotas, também para #remoto.
 * - Vagas internacionais (Remotive) vão para #internacional, e as de IA também para #ia.
 *
 * Olha só o título (e labels/tipo da vaga), não a descrição: descrições
 * citam "sênior" ou "IA" o tempo todo e gerariam falsos positivos.
 */
export function escolherCanais(vaga: Vaga): Canal[] {
  const texto = normalizar(`${vaga.titulo} ${vaga.extra ?? ""}`);
  const titulo = normalizar(vaga.titulo);

  const ehIA = algum(PADROES.ia, texto) || SIGLAS_IA.test(vaga.titulo);
  if (!ehIA && !algum(PADROES.tecnologia, texto)) return [];
  if (algum(PADROES.excluir, titulo)) return [];
  if (!localPermitido(vaga)) return [];

  const ehEstagio = algum(PADROES.estagio, texto);
  const ehJunior = algum(PADROES.junior, texto);
  const ehFullstack = algum(PADROES.fullstack, texto);

  if (vaga.fonte === "remotive") {
    if (ehIA) return ["ia", "internacional"];
    return ehEstagio || ehJunior || ehFullstack ? ["internacional"] : [];
  }

  let principal: Canal | null = null;
  if (ehIA) principal = "ia";
  else if (ehEstagio) principal = "estagio";
  else if (ehJunior) principal = "junior";
  else if (ehFullstack) principal = "fullstack";
  if (!principal) return []; // sem nível definido: geralmente é pleno, então ignora

  return vaga.remoto ? [principal, "remoto"] : [principal];
}
