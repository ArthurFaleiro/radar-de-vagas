export type Fonte =
  | "gupy"
  | "remotive"
  | "github"
  | "himalayas"
  | "remoteok"
  | "greenhouse"
  | "lever"
  | "ashby"
  | "email";

export type Canal = "estagio" | "junior" | "fullstack" | "ia" | "remoto" | "internacional" | "administrativo" | "saude";

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
  /** Nome mostrado no rodapé do card, quando difere da fonte (ex.: "LinkedIn" para alertas por e-mail). */
  nomeFonte?: string;
  /** Texto extra usado só no filtro (labels, tipo da vaga, senioridade etc.) */
  extra?: string;
}
