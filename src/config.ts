import type { Canal } from "./types.js";

// ===================================================================
// Ajuste aqui o que o radar procura. Não precisa mexer no resto.
// ===================================================================

/** Buscas feitas na Gupy (cada uma retorna até 100 vagas). */
export const BUSCAS_GUPY = [
  "estágio desenvolvimento",
  "estágio desenvolvedor",
  "estágio software",
  "estágio TI",
  "estagiário programação",
  "desenvolvedor júnior",
  "desenvolvedor junior",
  "programador júnior",
  "full stack",
  "inteligência artificial",
  "machine learning",
];

/** Repositórios do GitHub onde as vagas são publicadas como issues. */
export const REPOS_GITHUB = ["frontendbr/vagas", "backend-br/vagas"];

/** Só manda vagas publicadas nos últimos N dias (evita enxurrada na 1ª execução). */
export const IDADE_MAXIMA_DIAS = 3;

/** Limite de vagas por canal em cada execução. */
export const MAX_POR_CANAL = 15;

/** Remotive pede no máximo 4 atualizações por dia: só consulta nessas horas (UTC). */
export const HORAS_REMOTIVE_UTC = [0, 6, 12, 18];

/**
 * Padrões aplicados ao texto normalizado (minúsculo e sem acento).
 * São expressões regulares: \b = limite de palavra.
 */
export const PADROES = {
  // A vaga precisa ser de tecnologia
  tecnologia: [
    /desenvolv/, /\bdeveloper\b/, /\bdev\b/, /programa(dor|cao)/, /software/,
    /sistemas/, /full[\s-]?stack/, /front[\s-]?end/, /back[\s-]?end/, /\bweb\b/,
    /mobile/, /\breact\b/, /\bjava\b/, /\bnode/, /python/, /\bphp\b/, /typescript/,
    /javascript/, /\bti\b/, /tecnologia da informacao/, /\bqa\b/, /engineer/,
    /engenh(eiro|aria) de (software|dados|computacao)/,
  ],
  // Nível que NÃO queremos
  excluir: [
    /\bsenior\b/, /\bsr\b(?!\/)/, /\bpleno\b/, /\bpl\b(?!\/)/, /\blead\b/, /\blider\b/,
    /\bstaff\b/, /\bprincipal\b/, /especialista/, /specialist/, /coordenador/,
    /gerente/, /\bmanager\b/, /\bhead\b/, /arquitet/, /architect/, /mid[\s-]?level/,
    /\b(ii|iii|iv)\b/,
  ],
  estagio: [/estagi/, /\bintern(ship)?\b/],
  junior: [/\bjunior\b/, /\bjr\b/, /trainee/, /entry[\s-]?level/, /new grad/],
  fullstack: [/full[\s-]?stack/],
  ia: [
    /inteligencia artificial/, /machine learning/, /\bllms?\b/, /genai/,
    /ia generativa/, /deep learning/, /\bai engineer/, /\bml engineer/,
  ],
};

/** IA/AI em maiúsculas (verificado no título original, para não pegar "ia" solto). */
export const SIGLAS_IA = /\b(IA|AI)\b/;

export const CORES: Record<Canal, number> = {
  estagio: 0x2ecc71,
  junior: 0x3498db,
  fullstack: 0x9b59b6,
  ia: 0xe67e22,
  remoto: 0x1abc9c,
  internacional: 0xf1c40f,
};

/** Nome da variável de ambiente (secret) com o webhook de cada canal. */
export const WEBHOOKS: Record<Canal, string> = {
  estagio: "DISCORD_WEBHOOK_ESTAGIO",
  junior: "DISCORD_WEBHOOK_JUNIOR",
  fullstack: "DISCORD_WEBHOOK_FULLSTACK",
  ia: "DISCORD_WEBHOOK_IA",
  remoto: "DISCORD_WEBHOOK_REMOTO",
  internacional: "DISCORD_WEBHOOK_INTERNACIONAL",
};

/** Canal #administrativo: recebe avisos quando alguma fonte falha (opcional). */
export const WEBHOOK_ADMIN = "DISCORD_WEBHOOK_ADMIN";

/** Intervalo mínimo entre dois avisos de erro da mesma fonte, para não lotar o canal. */
export const HORAS_ENTRE_ALERTAS = 12;
