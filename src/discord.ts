import { CORES, WEBHOOK_ADMIN, WEBHOOKS } from "./config.js";
import { esperar } from "./http.js";
import type { Canal, Vaga } from "./types.js";

const NOME_FONTE = { gupy: "Gupy", remotive: "Remotive", github: "GitHub" } as const;

function montarEmbed(vaga: Vaga, canal: Canal) {
  return {
    title: vaga.titulo.slice(0, 256),
    url: vaga.url,
    color: CORES[canal],
    fields: [
      { name: "🏢 Empresa", value: vaga.empresa.slice(0, 1024), inline: true },
      { name: vaga.remoto ? "🏠 Local" : "📍 Local", value: vaga.local.slice(0, 1024), inline: true },
    ],
    footer: { text: `via ${NOME_FONTE[vaga.fonte]}` },
    ...(vaga.publicadaEm ? { timestamp: vaga.publicadaEm.toISOString() } : {}),
  };
}

/** Envia as vagas em lotes de até 10 cards (limite do Discord por mensagem). */
export async function enviarParaCanal(canal: Canal, vagas: Vaga[]): Promise<Vaga[]> {
  const webhook = process.env[WEBHOOKS[canal]];
  if (!webhook) {
    console.log(`[discord] sem ${WEBHOOKS[canal]} configurado. Simulando o envio de ${vagas.length} vaga(s):`);
    for (const v of vagas) console.log(`   #${canal}  ${v.titulo} | ${v.empresa} | ${v.local} | ${v.url}`);
    return []; // em simulação nada é marcado como enviado
  }

  const enviadas: Vaga[] = [];
  for (let i = 0; i < vagas.length; i += 10) {
    const lote = vagas.slice(i, i + 10);
    const corpo = JSON.stringify({ username: "Radar de Vagas", embeds: lote.map((v) => montarEmbed(v, canal)) });

    for (let tentativa = 0; tentativa < 3; tentativa++) {
      const resp = await fetch(webhook, { method: "POST", headers: { "Content-Type": "application/json" }, body: corpo });
      if (resp.status === 429) {
        const { retry_after } = (await resp.json()) as { retry_after?: number };
        await esperar(((retry_after ?? 2) + 0.5) * 1000);
        continue;
      }
      if (!resp.ok) {
        console.error(`[discord] #${canal} respondeu ${resp.status}: ${await resp.text()}`);
        break;
      }
      enviadas.push(...lote);
      break;
    }
    await esperar(1_500);
  }
  return enviadas;
}

/** Manda um aviso simples (texto) para o #administrativo, se o webhook existir. */
export async function avisarAdmin(mensagem: string): Promise<boolean> {
  const webhook = process.env[WEBHOOK_ADMIN];
  if (!webhook) {
    console.log(`[admin] (sem webhook) ${mensagem}`);
    return false;
  }
  const resp = await fetch(webhook, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: "Radar de Vagas", content: mensagem.slice(0, 2000) }),
  });
  return resp.ok;
}
