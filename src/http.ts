const USER_AGENT = "radar-de-vagas (bot pessoal de alertas de vagas)";

export const esperar = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function getJson<T>(url: string, headers: Record<string, string> = {}): Promise<T> {
  const resp = await fetch(url, {
    headers: { "User-Agent": USER_AGENT, Accept: "application/json", ...headers },
    signal: AbortSignal.timeout(20_000),
  });
  if (!resp.ok) throw new Error(`HTTP ${resp.status} em ${url}`);
  return (await resp.json()) as T;
}
