import { existsSync, readFileSync, writeFileSync } from "node:fs";

// Guarda os IDs das vagas já enviadas para nunca repetir.
// O GitHub Actions faz commit deste arquivo depois de cada execução.
const ARQUIVO = new URL("../data/enviadas.json", import.meta.url);
const DIAS_PARA_ESQUECER = 60;

export type Estado = Record<string, string>; // id -> data em que foi enviada

export function carregarEstado(): Estado {
  if (!existsSync(ARQUIVO)) return {};
  return JSON.parse(readFileSync(ARQUIVO, "utf8")) as Estado;
}

export function salvarEstado(estado: Estado): void {
  const limite = Date.now() - DIAS_PARA_ESQUECER * 86_400_000;
  const limpo = Object.fromEntries(
    Object.entries(estado)
      .filter(([, data]) => new Date(data).getTime() > limite)
      .sort(([a], [b]) => a.localeCompare(b)),
  );
  writeFileSync(ARQUIVO, JSON.stringify(limpo, null, 2) + "\n");
}
