import { HORAS_ENTRE_ALERTAS, IDADE_MAXIMA_DIAS, MAX_POR_CANAL } from "./config.js";
import { avisarAdmin, enviarParaCanal } from "./discord.js";
import { carregarEstado, salvarEstado } from "./estado.js";
import { falhas } from "./falhas.js";
import { escolherCanais } from "./filtro.js";
import { buscarGithub } from "./sources/github.js";
import { buscarGupy } from "./sources/gupy.js";
import { buscarRemotive } from "./sources/remotive.js";
import type { Canal, Fonte, Vaga } from "./types.js";

/** Chave no arquivo de estado: a mesma vaga pode ir para dois canais (ex.: #junior e #remoto). */
const chave = (vaga: Vaga, canal: Canal) => `${vaga.id}>${canal}`;

async function main() {
  const estado = carregarEstado();
  const limiteIdade = Date.now() - IDADE_MAXIMA_DIAS * 86_400_000;

  const [gupy, remotive, github] = await Promise.all([buscarGupy(), buscarRemotive(), buscarGithub()]);
  const coletadas: Record<Fonte, number> = { gupy: gupy.length, remotive: remotive.length, github: github.length };
  console.log(`Coletadas: Gupy ${gupy.length} | Remotive ${remotive.length} | GitHub ${github.length}`);

  const porCanal = new Map<Canal, Vaga[]>();
  for (const vaga of [...gupy, ...remotive, ...github]) {
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

  // Avisa no #administrativo quando uma fonte falhou e não trouxe nenhuma vaga
  for (const [fonte, erros] of falhas) {
    if (coletadas[fonte] > 0) continue; // falha parcial (ex.: 1 busca da Gupy), ignora
    const chaveAlerta = `alerta>${fonte}`;
    const ultimo = estado[chaveAlerta] ? new Date(estado[chaveAlerta]).getTime() : 0;
    if (Date.now() - ultimo < HORAS_ENTRE_ALERTAS * 3_600_000) continue;
    const enviado = await avisarAdmin(
      `⚠️ A fonte **${fonte}** falhou e não trouxe nenhuma vaga.\n\`\`\`\n${erros.slice(0, 5).join("\n")}\n\`\`\``,
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
