/**
 * O bot roda a cada 30 minutos, mas algumas fontes pedem (ou não precisam de)
 * consultas tão frequentes. Esta função diz se a fonte deve rodar nesta execução.
 * Ex.: deveRodar(6) → só nas execuções das 0h, 6h, 12h e 18h (UTC).
 * Com FORCAR_TODAS=1, todas as fontes rodam (útil para testar na mão).
 */
export function deveRodar(intervaloHoras: number, agora = new Date()): boolean {
  if (process.env.FORCAR_TODAS) return true;
  return agora.getUTCHours() % intervaloHoras === 0 && agora.getUTCMinutes() < 30;
}
