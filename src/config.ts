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
  // Vagas administrativas (#vagas-administrativas)
  "assistente administrativo",
  "auxiliar administrativo",
  "estágio administrativo",
  "jovem aprendiz administrativo",
  "recepcionista",
];

/** Repositórios do GitHub onde as vagas são publicadas como issues. */
export const REPOS_GITHUB = ["frontendbr/vagas", "backend-br/vagas"];

/** Só manda vagas publicadas nos últimos N dias (evita enxurrada na 1ª execução). */
export const IDADE_MAXIMA_DIAS = 3;

/** Limite de vagas por canal em cada execução. */
export const MAX_POR_CANAL = 15;

/**
 * Empresas acompanhadas direto na página de carreiras (APIs públicas oficiais).
 * Para achar o identificador, abra a página de vagas da empresa:
 *   - Greenhouse: job-boards.greenhouse.io/XXXX  ou  boards.greenhouse.io/XXXX  → "XXXX"
 *   - Lever:      jobs.lever.co/XXXX                                          → "XXXX"
 *   - Ashby:      jobs.ashbyhq.com/XXXX                                       → "XXXX"
 * Se um identificador estiver errado, o #administrativo avisa.
 */
export const EMPRESAS = {
  greenhouse: ["quintoandar", "vtex", "zupinnovation"],
  lever: [] as string[],
  ashby: ["nubank"],
};

/** Himalayas: buscas de vagas remotas por senioridade (o filtro de nível é aplicado depois). */
export const SENIORIDADES_HIMALAYAS = ["Entry-level", "Internship"];

/**
 * Sites cujos alertas de vaga chegam no seu Gmail. O bot lê esses e-mails
 * e posta as vagas. Crie os alertas em cada site já com o local desejado
 * (ex.: Porto Alegre ou Remoto), porque e-mails não trazem a cidade de forma confiável.
 */
export const ALERTAS_EMAIL = [
  { nome: "LinkedIn", dominio: "linkedin.com", idDoLink: /linkedin\.com\/(?:comm\/)?jobs\/view\/(\d+)/ },
  { nome: "Indeed", dominio: "indeed.com" },
  { nome: "Glassdoor", dominio: "glassdoor.com" },
  { nome: "Infojobs", dominio: "infojobs.com.br" },
  { nome: "Catho", dominio: "catho.com.br" },
  { nome: "Vagas.com", dominio: "vagas.com.br" },
  { nome: "Programathor", dominio: "programathor.com.br" },
  { nome: "PUCRS Carreiras", dominio: "pucrs.br" },
] as { nome: string; dominio: string; idDoLink?: RegExp }[];

/** Quantos dias de e-mails o bot olha a cada execução. */
export const DIAS_EMAIL = 2;

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
    /\b(ii|iii|iv)\b/, /supervisor/,
  ],
  // Vagas administrativas: o título precisa ter um destes termos...
  administrativo: [
    /administrativ/, /auxiliar de escritorio/, /assistente de escritorio/, /recepcionista/,
    /secretari[oa]/, /\badministrative\b/, /office assistant/,
  ],
  // ...e ser de entrada (assistente, auxiliar, estágio, aprendiz, júnior)
  entradaAdministrativa: [
    /assistente/, /auxiliar/, /recepcionista/, /secretari/, /aprendiz/, /estagi/,
    /\bjunior\b/, /\bjr\b/, /trainee/, /\bassistant\b/, /\bintern\b/,
  ],
  estagio: [/estagi/, /\bintern(ship)?\b/],
  junior: [/\bjunior\b/, /\bjr\b/, /trainee/, /entry[\s-]?level/, /new grad/],
  fullstack: [/full[\s-]?stack/],
  ia: [
    /inteligencia artificial/, /machine learning/, /\bllms?\b/, /genai/,
    /ia generativa/, /deep learning/, /\bai engineer/, /\bml engineer/,
  ],
};

/**
 * Vagas presenciais ou híbridas só passam se forem numa dessas cidades.
 * Vagas remotas passam sempre (Brasil e exterior). Escreva sem acento e em minúsculo.
 */
export const CIDADES_PRESENCIAIS = [
  "porto alegre",
  "canoas",
  "sao leopoldo",
  "esteio",
  "eldorado do sul",
  "sapucaia do sul",
];

/** IA/AI em maiúsculas (verificado no título original, para não pegar "ia" solto). */
export const SIGLAS_IA = /\b(IA|AI)\b/;

export const CORES: Record<Canal, number> = {
  estagio: 0x2ecc71,
  junior: 0x3498db,
  fullstack: 0x9b59b6,
  ia: 0xe67e22,
  remoto: 0x1abc9c,
  internacional: 0xf1c40f,
  administrativo: 0x95a5a6,
};

/** Nome da variável de ambiente (secret) com o webhook de cada canal. */
export const WEBHOOKS: Record<Canal, string> = {
  estagio: "DISCORD_WEBHOOK_ESTAGIO",
  junior: "DISCORD_WEBHOOK_JUNIOR",
  fullstack: "DISCORD_WEBHOOK_FULLSTACK",
  ia: "DISCORD_WEBHOOK_IA",
  remoto: "DISCORD_WEBHOOK_REMOTO",
  internacional: "DISCORD_WEBHOOK_INTERNACIONAL",
  administrativo: "DISCORD_WEBHOOK_VAGAS_ADMINISTRATIVAS",
};

/** Canal #administrativo: recebe avisos quando alguma fonte falha (opcional). */
export const WEBHOOK_ADMIN = "DISCORD_WEBHOOK_ADMIN";

/** Intervalo mínimo entre dois avisos de erro da mesma fonte, para não lotar o canal. */
export const HORAS_ENTRE_ALERTAS = 12;
