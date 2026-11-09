import { CIDADES_PRESENCIAIS, PADROES, SIGLAS_IA } from "./config.js";
import type { Canal, Fonte, Vaga } from "./types.js";

export function normalizar(texto: string): string {
  return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

const algum = (padroes: RegExp[], texto: string) => padroes.some((p) => p.test(texto));

const PADROES_CIDADES = CIDADES_PRESENCIAIS.map((c) => new RegExp(`\\b${c.replace(/\s+/g, "\\s+")}\\b`));

/**
 * Remota: passa sempre. Presencial ou híbrida: só se for numa das cidades da lista.
 * Na Gupy a cidade vem no campo "local"; no GitHub ela costuma estar no título ou nas labels.
 */
/** Sites só de vagas remotas internacionais: vão para #internacional. */
export const FONTES_INTERNACIONAIS: Fonte[] = ["remotive", "himalayas", "remoteok"];

const REGIOES_ELEGIVEIS =
  /brazil|brasil|latam|latin america|america latina|south america|americas|worldwide|global|anywhere|international|\bbr\b/;

/**
 * Vagas internacionais costumam aceitar só quem mora em certos países (ex.: "Remote (USA)").
 * Passam as abertas ao mundo todo, ao Brasil ou à América Latina.
 */
export function remotoElegivel(local: string): boolean {
  const texto = normalizar(local);
  const resto = texto.replace(/remot[oea]s?|remote|home office|[()\-,/|]/g, " ").trim();
  return resto === "" || REGIOES_ELEGIVEIS.test(texto);
}

export function localPermitido(vaga: Vaga): boolean {
  if (vaga.fonte === "email") return true; // o local já foi definido no alerta do próprio site
  if (FONTES_INTERNACIONAIS.includes(vaga.fonte)) return remotoElegivel(vaga.local);
  if (vaga.remoto) return true;
  const onde = normalizar(`${vaga.local} ${vaga.titulo} ${vaga.extra ?? ""}`);
  return algum(PADROES_CIDADES, onde);
}

/**
 * Decide para quais canais a vaga vai (lista vazia = ignorar).
 *
 * - Vagas do Brasil vão para o canal do nível (#estágio, #junior, #full-stack ou #ia)
 *   e, se forem remotas, também para #remoto.
 * - Vagas internacionais (Remotive, Himalayas, Remote OK) vão para #internacional,
 *   e as de IA também para #ia. Só passam as abertas a quem mora no Brasil/LATAM ou no mundo todo.
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

  if (FONTES_INTERNACIONAIS.includes(vaga.fonte)) {
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
