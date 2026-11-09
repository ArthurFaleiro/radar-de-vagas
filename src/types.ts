export type Fonte = "gupy" | "remotive" | "github";

export type Canal = "estagio" | "junior" | "fullstack" | "ia" | "remoto" | "internacional";

export interface Vaga {
  /** ID único global, ex.: "gupy:123456" */
  id: string;
  titulo: string;
  empresa: string;
  url: string;
  local: string;
  remoto: boolean;
  publicadaEm: Date | null;
  fonte: Fonte;
  /** Texto extra usado só no filtro (labels, tipo da vaga etc.) */
  extra?: string;
}
