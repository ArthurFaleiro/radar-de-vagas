// Rode com "npm run testar-filtro" para conferir o filtro sem chamar nenhum site.
import { escolherCanais } from "./filtro.js";
import type { Fonte, Vaga } from "./types.js";

const POA = "Porto Alegre - Rio Grande do Sul";

const casos: [string, Fonte, boolean, string, string][] = [
  // título, fonte, remota?, local, canais esperados
  ["Estágio em Desenvolvimento de Software", "gupy", false, POA, "estagio"],
  ["Estagiário de TI", "gupy", true, "Remoto", "estagio,remoto"],
  ["Estágio em Contabilidade", "gupy", false, POA, ""],
  ["Desenvolvedor Full Stack Júnior", "gupy", false, "Canoas - RS", "junior"],
  ["Desenvolvedor Full Stack Júnior", "gupy", true, "Remoto", "junior,remoto"],
  ["Desenvolvedor Full Stack", "gupy", false, "São Leopoldo - RS", "fullstack"],
  ["Desenvolvedor Full Stack Pleno", "gupy", true, "Remoto", ""],
  ["Desenvolvedor Java Sênior", "gupy", false, POA, ""],
  ["Dev Front-end Jr - Porto Alegre/RS", "github", false, "Ver detalhes", "junior"],
  ["Dev Front-end Jr - São Paulo/SP", "github", false, "Ver detalhes", ""],
  ["[Remoto] Desenvolvedor PL/SQL Júnior", "github", true, "Remoto", "junior,remoto"],
  ["Desenvolvedor Back-end PL", "github", false, POA, ""],
  ["Analista de Sistemas II", "gupy", false, POA, ""],
  ["Estágio em Inteligência Artificial", "gupy", false, "Esteio - RS", "ia"],
  ["Engenheiro de IA Júnior", "gupy", true, "Remoto", "ia,remoto"],
  ["Senior AI Engineer", "remotive", true, "Remoto (Worldwide)", ""],
  ["Junior AI Engineer", "remotive", true, "Remoto (USA)", "ia,internacional"],
  ["Junior Full Stack Developer", "remotive", true, "Remoto (Worldwide)", "internacional"],
  ["Software Engineer", "remotive", true, "Remoto (Worldwide)", ""],
  ["Analista Financeiro Júnior", "gupy", false, POA, ""],
  ["Desenvolvedor Python", "gupy", false, POA, ""],
  // Filtro de cidade
  ["Estágio em Desenvolvimento", "gupy", false, "São Paulo - SP", ""],
  ["Desenvolvedor Júnior", "gupy", false, "Sapucaia do Sul - RS", "junior"],
  ["Desenvolvedor Júnior", "gupy", false, "Eldorado do Sul - RS", "junior"],
  ["Desenvolvedor Júnior", "gupy", false, "Caxias do Sul - RS", ""],
  ["Desenvolvedor Júnior", "gupy", false, "Novo Hamburgo - RS", ""],
  ["Estágio em TI", "gupy", true, "Remoto", "estagio,remoto"],
];

let erros = 0;
for (const [titulo, fonte, remoto, local, esperado] of casos) {
  const vaga: Vaga = { id: titulo, titulo, empresa: "", url: "", local, remoto, publicadaEm: null, fonte };
  const obtido = escolherCanais(vaga).join(",");
  const ok = obtido === esperado;
  if (!ok) erros++;
  const rotulo = `${titulo} | ${local} [${fonte}]`;
  console.log(`${ok ? "✅" : "❌"} ${rotulo.padEnd(66)} → ${obtido || "ignorada"}${ok ? "" : ` (esperado: ${esperado || "ignorada"})`}`);
}
console.log(erros ? `\n${erros} caso(s) com problema` : "\nTodos os casos passaram");
process.exit(erros ? 1 : 0);
