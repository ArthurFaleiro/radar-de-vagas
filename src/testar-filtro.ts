// Rode com "npm run testar-filtro" para conferir o filtro sem chamar nenhum site.
import { escolherCanais } from "./filtro.js";
import { vagasDoEmail } from "./sources/email.js";
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
  ["Junior AI Engineer", "remotive", true, "Remoto (USA)", ""],
  ["Junior AI Engineer", "remotive", true, "Remoto (Worldwide)", "ia,internacional"],
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
  // Fontes internacionais: só vagas abertas ao Brasil/LATAM/mundo
  ["Junior Frontend Developer", "himalayas", true, "Remoto (Brazil, Argentina)", "internacional"],
  ["Junior Frontend Developer", "himalayas", true, "Remoto (United States)", ""],
  ["Software Engineer Intern", "himalayas", true, "Remoto (LATAM)", "internacional"],
  ["Junior Backend Engineer", "remoteok", true, "Remoto (Worldwide)", "internacional"],
  ["Junior Backend Engineer", "remoteok", true, "Remoto (Europe)", ""],
  // Páginas de carreira de empresas
  ["Estágio em Engenharia de Software", "greenhouse", false, "São Paulo, Brazil", ""],
  ["Estágio em Engenharia de Software", "greenhouse", true, "Remote - Brazil", "estagio,remoto"],
  ["Software Engineer Jr", "ashby", false, "Porto Alegre, RS", "junior"],
  // Vagas administrativas
  ["Assistente Administrativo", "gupy", false, POA, "administrativo"],
  ["Auxiliar Administrativo", "gupy", false, "Canoas - RS", "administrativo"],
  ["Estágio Administrativo", "gupy", true, "Remoto", "administrativo"],
  ["Jovem Aprendiz - Administrativo", "gupy", false, "Esteio - RS", "administrativo"],
  ["Recepcionista", "gupy", false, POA, "administrativo"],
  ["Assistente Administrativo", "gupy", false, "São Paulo - SP", ""],
  ["Analista Administrativo", "gupy", false, POA, ""],
  ["Analista Administrativo Júnior", "gupy", false, POA, "administrativo"],
  ["Coordenador Administrativo", "gupy", false, POA, ""],
  ["Supervisor Administrativo", "gupy", false, POA, ""],
  ["Assistente Administrativo Pleno", "gupy", false, POA, ""],
  // Alertas por e-mail (o local vem do alerta, então não é filtrado)
  ["Desenvolvedor Júnior Empresa X São Paulo", "email", false, "Conforme o seu alerta", "junior"],
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
// Leitura de e-mail de alerta (HTML de exemplo)
const htmlLinkedin = `
  <a href="https://www.linkedin.com/comm/jobs/view/4012345678/?trk=x"><img src="logo.png"></a>
  <a href="https://www.linkedin.com/comm/jobs/view/4012345678/?trk=y">Desenvolvedor Full Stack J&uacute;nior</a>
  <a href="https://www.linkedin.com/comm/jobs/view/4099999999/">Estágio em Desenvolvimento</a>
  <a href="https://www.linkedin.com/comm/jobs/search/">Ver todas as vagas</a>`;
const doEmail = vagasDoEmail(htmlLinkedin, "jobalerts-noreply@linkedin.com", new Date());
const okEmail =
  doEmail.length === 2 &&
  doEmail[0].url === "https://www.linkedin.com/jobs/view/4012345678/" &&
  doEmail[0].titulo === "Desenvolvedor Full Stack Júnior";
if (!okEmail) erros++;
console.log(`${okEmail ? "✅" : "❌"} E-mail do LinkedIn → ${doEmail.map((v) => v.titulo).join(" / ")}`);

const htmlGenerico = `<a href="https://www.catho.com.br/vagas/x/123">Programador Júnior</a><a href="https://www.catho.com.br/sair">Descadastrar</a>`;
const generico = vagasDoEmail(htmlGenerico, "alertas@catho.com.br", new Date())
  .filter((v) => escolherCanais(v).length > 0);
const okGenerico = generico.length === 1 && generico[0].nomeFonte === "Catho";
if (!okGenerico) erros++;
console.log(`${okGenerico ? "✅" : "❌"} E-mail da Catho → ${generico.map((v) => v.titulo).join(" / ")}`);

console.log(erros ? `\n${erros} caso(s) com problema` : "\nTodos os casos passaram");
process.exit(erros ? 1 : 0);
