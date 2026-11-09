// Rode com "npm run testar-filtro" para conferir o filtro sem chamar nenhum site.
import { escolherCanais } from "./filtro.js";
import type { Fonte, Vaga } from "./types.js";

const casos: [string, Fonte, boolean, string][] = [
  // título, fonte, remota?, canais esperados
  ["Estágio em Desenvolvimento de Software", "gupy", false, "estagio"],
  ["Estagiário de TI", "gupy", true, "estagio,remoto"],
  ["Estágio em Contabilidade", "gupy", false, ""],
  ["Desenvolvedor Full Stack Júnior", "gupy", false, "junior"],
  ["Desenvolvedor Full Stack Júnior", "gupy", true, "junior,remoto"],
  ["Desenvolvedor Full Stack", "gupy", false, "fullstack"],
  ["Desenvolvedor Full Stack Pleno", "gupy", true, ""],
  ["Desenvolvedor Java Sênior", "gupy", false, ""],
  ["Dev Front-end Jr", "github", false, "junior"],
  ["[Remoto] Desenvolvedor PL/SQL Júnior", "github", true, "junior,remoto"],
  ["Desenvolvedor Back-end PL", "github", false, ""],
  ["Analista de Sistemas II", "gupy", false, ""],
  ["Estágio em Inteligência Artificial", "gupy", false, "ia"],
  ["Engenheiro de IA Júnior", "gupy", true, "ia,remoto"],
  ["Senior AI Engineer", "remotive", true, ""],
  ["Junior AI Engineer", "remotive", true, "ia,internacional"],
  ["Junior Full Stack Developer", "remotive", true, "internacional"],
  ["Software Engineer", "remotive", true, ""],
  ["Analista Financeiro Júnior", "gupy", false, ""],
  ["Desenvolvedor Python", "gupy", false, ""],
];

let erros = 0;
for (const [titulo, fonte, remoto, esperado] of casos) {
  const vaga: Vaga = { id: titulo, titulo, empresa: "", url: "", local: "", remoto, publicadaEm: null, fonte };
  const obtido = escolherCanais(vaga).join(",");
  const ok = obtido === esperado;
  if (!ok) erros++;
  const rotulo = `${titulo}${remoto ? " (remota)" : ""} [${fonte}]`;
  console.log(`${ok ? "✅" : "❌"} ${rotulo.padEnd(56)} → ${obtido || "ignorada"}${ok ? "" : ` (esperado: ${esperado || "ignorada"})`}`);
}
console.log(erros ? `\n${erros} caso(s) com problema` : "\nTodos os casos passaram");
process.exit(erros ? 1 : 0);
