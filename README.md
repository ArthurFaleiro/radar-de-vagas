# Radar de Vagas

Bot que procura vagas de **estágio, júnior, full stack e IA** (ignorando pleno e sênior) e posta cada vaga nova num canal do Discord. Roda sozinho a cada 30 minutos no GitHub Actions, sem servidor e sem custo.

## Fontes

| Fonte | O que traz | Observação |
|---|---|---|
| Gupy | Vagas no Brasil (muitas de estágio e júnior) | Endpoint público do portal; não é documentado, pode mudar |
| Remotive | Vagas remotas internacionais | Consultado só 4x por dia, como o Remotive pede; vagas chegam com 24h de atraso |
| GitHub | Issues de `frontendbr/vagas` e `backend-br/vagas` | API oficial do GitHub |

LinkedIn, Infojobs, Catho e PUCRS Carreiras não são lidos diretamente (os termos de uso proíbem robôs). Para eles, use os alertas por e-mail dos próprios sites.

## Canais

| Canal | Secret |
|---|---|
| #estágio | `DISCORD_WEBHOOK_ESTAGIO` |
| #junior | `DISCORD_WEBHOOK_JUNIOR` |
| #full-stack | `DISCORD_WEBHOOK_FULLSTACK` |
| #ia | `DISCORD_WEBHOOK_IA` |
| #remoto | `DISCORD_WEBHOOK_REMOTO` |
| #internacional | `DISCORD_WEBHOOK_INTERNACIONAL` |
| #administrativo (avisos de erro) | `DISCORD_WEBHOOK_ADMIN` |

Vagas do Brasil vão para o canal do nível (#estágio, #junior, #full-stack ou #ia) e, se forem remotas, também para #remoto. Vagas internacionais (Remotive) vão para #internacional, e as de IA também para #ia. O #administrativo só recebe um aviso quando uma fonte para de funcionar, no máximo uma vez a cada 12 horas por fonte. A regra fica em `src/filtro.ts`.

## Como colocar no ar

1. Crie um repositório no GitHub e envie esta pasta.
2. Em **Settings → Secrets and variables → Actions → New repository secret**, crie os secrets acima com as URLs dos webhooks.
3. Na aba **Actions**, abra "Radar de Vagas" e clique em **Run workflow** para testar.

## Rodar no computador

```bash
npm install
npm run testar-filtro   # confere o filtro com exemplos, sem acessar nenhum site
npm start               # sem webhooks configurados, só mostra no terminal o que enviaria
```

Para enviar de verdade localmente, defina as variáveis `DISCORD_WEBHOOK_*` no terminal antes do `npm start`. Para forçar a consulta ao Remotive fora dos horários, use `FORCAR_REMOTIVE=1`.

## Personalizar

Tudo que define o que é buscado e filtrado fica em `src/config.ts`: as buscas da Gupy, os repositórios do GitHub, as palavras de inclusão e exclusão, a idade máxima das vagas e o limite por canal.
