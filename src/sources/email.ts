import { createHash } from "node:crypto";
import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";
import { ALERTAS_EMAIL, DIAS_EMAIL } from "../config.js";
import { registrarFalha } from "../falhas.js";
import type { Vaga } from "../types.js";

// Lê os alertas de vaga que LinkedIn, Indeed, Catho etc. mandam para o seu Gmail.
// O acesso é só leitura: nenhum e-mail é apagado, movido ou marcado como lido.
// Precisa dos secrets GMAIL_USER e GMAIL_APP_PASSWORD (senha de app do Google).

const MAX_EMAILS = 60;

// Letras acentuadas que aparecem como &aacute;, &ccedil; etc. no HTML dos e-mails
const ACENTOS: Record<string, string> = { acute: "\u0301", grave: "\u0300", tilde: "\u0303", circ: "\u0302", uml: "\u0308", cedil: "\u0327" };

function decodificarEntidades(texto: string): string {
  return texto
    .replace(/&([a-zA-Z])(acute|grave|tilde|circ|uml|cedil);/g, (_, letra, tipo) => (letra + ACENTOS[tipo]).normalize("NFC"))
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)));
}

/** Extrai todos os links <a href="...">texto</a> de um HTML. */
export function extrairLinks(html: string): { href: string; texto: string }[] {
  const links: { href: string; texto: string }[] = [];
  const regex = /<a\b[^>]*?href\s*=\s*["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  for (const m of html.matchAll(regex)) {
    const texto = decodificarEntidades(m[2].replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
    links.push({ href: decodificarEntidades(m[1]), texto });
  }
  return links;
}

const hash = (texto: string) => createHash("sha1").update(texto).digest("hex").slice(0, 16);

/** Transforma um e-mail de alerta em vagas. Exportado para poder ser testado sem Gmail. */
export function vagasDoEmail(html: string, remetente: string, data: Date | null): Vaga[] {
  const site = ALERTAS_EMAIL.find((s) => remetente.toLowerCase().includes(s.dominio));
  if (!site) return [];

  const porId = new Map<string, { titulo: string; url: string }>();
  for (const { href, texto } of extrairLinks(html)) {
    if (texto.length < 6 || texto.length > 160) continue;

    let id: string;
    let url = href;
    if (site.idDoLink) {
      // Sites com ID de vaga no link (LinkedIn): só esses links contam, e o ID evita repetição
      const m = href.match(site.idDoLink);
      if (!m) continue;
      id = m[1];
      url = `https://www.linkedin.com/jobs/view/${m[1]}/`;
    } else {
      if (!/^https?:\/\//i.test(href)) continue;
      id = hash(texto.toLowerCase());
    }
    // O mesmo anúncio costuma ter vários links (logo, título, "ver vaga"); fica o primeiro com texto
    if (!porId.has(id)) porId.set(id, { titulo: texto, url });
  }

  return [...porId.entries()].map(([id, { titulo, url }]) => ({
    id: `email:${site.nome}:${id}`,
    titulo,
    empresa: `Alerta do ${site.nome}`,
    url,
    local: /remot|home ?office/i.test(titulo) ? "Remoto" : "Conforme o seu alerta",
    remoto: /remot|home ?office/i.test(titulo),
    publicadaEm: data,
    fonte: "email" as const,
    nomeFonte: site.nome,
  }));
}

export async function buscarEmail(): Promise<Vaga[]> {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD?.replace(/\s+/g, "");
  if (!user || !pass) return []; // alertas por e-mail ainda não configurados

  const cliente = new ImapFlow({ host: "imap.gmail.com", port: 993, secure: true, auth: { user, pass }, logger: false });
  const vagas: Vaga[] = [];

  try {
    await cliente.connect();
    // "Todos os e-mails" pega também os alertas que um filtro do Gmail tenha arquivado
    const pastas = await cliente.list();
    const todos = pastas.find((p) => p.specialUse === "\\All")?.path ?? "INBOX";

    const lock = await cliente.getMailboxLock(todos, { readOnly: true });
    try {
      const remetentes = ALERTAS_EMAIL.map((s) => `from:${s.dominio}`).join(" OR ");
      const uids = (await cliente.search({ gmraw: `newer_than:${DIAS_EMAIL}d (${remetentes})` }, { uid: true })) || [];
      const recentes = uids.slice(-MAX_EMAILS);
      if (recentes.length) {
        for await (const msg of cliente.fetch(recentes, { source: true }, { uid: true })) {
          if (!msg.source) continue;
          const email = await simpleParser(msg.source);
          const html = email.html || email.textAsHtml || "";
          const remetente = email.from?.value?.[0]?.address ?? "";
          vagas.push(...vagasDoEmail(html, remetente, email.date ?? null));
        }
      }
    } finally {
      lock.release();
    }
  } catch (erro) {
    registrarFalha("email", (erro as Error).message);
  } finally {
    await cliente.logout().catch(() => undefined);
  }
  return vagas;
}
