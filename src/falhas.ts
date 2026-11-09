import type { Fonte } from "./types.js";

/** Erros de cada fonte nesta execução, para avisar no #administrativo. */
export const falhas = new Map<Fonte, string[]>();

export function registrarFalha(fonte: Fonte, mensagem: string): void {
  console.error(`[${fonte}] ${mensagem}`);
  falhas.set(fonte, [...(falhas.get(fonte) ?? []), mensagem]);
}
