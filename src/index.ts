import { HORAS_ENTRE_ALERTAS, IDADE_MAXIMA_DIAS, MAX_POR_CANAL } from "./config.js";
import { avisarAdmin, enviarParaCanal } from "./discord.js";
import { carregarEstado, salvarEstado } from "./estado.js";
import { falhas } from "./falhas.js";
import { escolherCanais } from "./filtro.js";
import { buscarEmail } from "./sources/email.js";
import { buscarEmpresas } from "./sources/empresas.js";
import { buscarGithub } from "./sources/github.js";
import { buscarGupy } from "./sources/gupy.js";
import { buscarHimalayas } from "./sources/himalayas.js";
import { buscarRemoteOk } from "./sources/remoteok.js";
import { buscarRemotive } from "./sources/remotive.js";
import type { Canal, Vaga } from "./types.js";

/** Chave no arquivo de estado: a mesma vaga pode ir para dois canais (ex.: #junior e #remoto). */
const chave = (vaga: Vaga, canal: Canal) => `${vaga.id}>${canal}`;

async function main() {
  const estado = carregarEstado();
  const limiteIdade = Date.now() - IDADE_MAXIMA_DIAS * 86_400_000;

  const resultados = await Promise.all([
    buscarGupy(),
    buscarGithub(),
    buscarRemotive(),
    buscarHimalayas(),
    buscarRemoteOk(),
    buscarEmpresas(),
    buscarEmail(),
  ]);
  const todas = resultados.flat();

  const coletadas = new Map<string, number>();
  for (const v of todas) coletadas.set(v.fonte, (coletadas.get(v.fonte) ?? 0) + 1);
  console.log(`Coletadas: ${[...coletadas].map(([f, n]) => `${f} ${n}`).join(" | ") || "nenhuma"}`);

  const porCanal = new Map<Canal, Vaga[]>();
  const vistas = new Set<string>();
  for (const vaga of todas) {
    if (vistas.has(vaga.id)) continue; // a mesma vaga pode vir de duas buscas
    vistas.add(vaga.id);
    if (vaga.publicadaEm && vaga.publicadaEm.getTime() < limiteIdade) continue; // antiga demais
    for (const canal of escolherCanais(vaga)) {
      if (estado[chave(vaga, canal)]) continue; // já enviada para este canal
      porCanal.set(canal, [...(porCanal.get(canal) ?? []), vaga]);
    }
  }

  let total = 0;
  for (const [canal, vagas] of porCanal) {
    // Mais antigas primeiro, para a mais nova ficar no fim do canal
    const ordenadas = vagas
      .sort((a, b) => (a.publicadaEm?.getTime() ?? 0) - (b.publicadaEm?.getTime() ?? 0))
      .slice(-MAX_POR_CANAL);
    const enviadas = await enviarParaCanal(canal, ordenadas);
    for (const v of enviadas) estado[chave(v, canal)] = new Date().toISOString();
    total += enviadas.length;
  }

  // Avisa no #administrativo quando uma fonte parou de funcionar
  // (não trouxe nenhuma vaga) ou quando algo aponta para um endereço inexistente (404)
  for (const [fonte, erros] of falhas) {
    const semVagas = (coletadas.get(fonte) ?? 0) === 0;
    const enderecoErrado = erros.some((e) => e.includes("HTTP 404"));
    if (!semVagas && !enderecoErrado) continue; // falha pontual, ignora
    const chaveAlerta = `alerta>${fonte}`;
    const ultimo = estado[chaveAlerta] ? new Date(estado[chaveAlerta]).getTime() : 0;
    if (Date.now() - ultimo < HORAS_ENTRE_ALERTAS * 3_600_000) continue;
    const enviado = await avisarAdmin(
      `⚠️ Problema na fonte **${fonte}**:\n\`\`\`\n${erros.slice(0, 5).join("\n")}\n\`\`\``,
    );
    if (enviado) estado[chaveAlerta] = new Date().toISOString();
  }

  salvarEstado(estado);
  console.log(`Novas vagas enviadas: ${total}`);
}

main().catch(async (erro) => {
  console.error(erro);
  await avisarAdmin(`❌ O Radar de Vagas quebrou:\n\`\`\`\n${String(erro).slice(0, 1500)}\n\`\`\``).catch(() => {});
  process.exit(1);
});
