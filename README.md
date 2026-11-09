# Radar de Vagas

Bot que procura vagas de **estágio, júnior, full stack e IA** (ignorando pleno e sênior) e posta cada vaga nova num canal do Discord. Roda sozinho a cada 30 minutos no GitHub Actions, sem servidor e sem custo.

## Fontes

| Fonte | O que traz | Frequência |
|---|---|---|
| Gupy | Vagas no Brasil (muitas de estágio e júnior) | a cada 30 min |
| GitHub | Issues de `frontendbr/vagas` e `backend-br/vagas` | a cada 30 min |
| Alertas por e-mail | LinkedIn, Indeed, Glassdoor, Infojobs, Catho, Vagas.com, Programathor, PUCRS Carreiras | a cada 30 min |
| Páginas de carreira | Empresas no Greenhouse, Lever e Ashby (lista em `src/config.ts`) | a cada 2 h |
| Remote OK | Vagas remotas internacionais | a cada 2 h |
| Himalayas | Vagas remotas internacionais (entry-level e estágio) | a cada 3 h |
| Remotive | Vagas remotas internacionais | 4x por dia |

LinkedIn e os outros sites de emprego não são lidos diretamente (os termos de uso proíbem robôs): o bot lê os alertas que esses sites mandam para o seu Gmail.

## Filtros

- **Nível:** estágio, júnior, full stack ou IA. Pleno, sênior, lead, especialista etc. são ignorados.
- **Saúde:** enfermagem, farmácia, fisioterapia, nutrição, psicologia, odontologia, laboratório etc. (sem medicina e sem chefia) vão para #vagas-saude. Cargos administrativos em hospital, clínica, laboratório ou farmácia vão para #vagas-saude e #vagas-administrativas.
- **Administrativas:** assistente, auxiliar, recepcionista, estágio, jovem aprendiz ou júnior administrativo vão para #vagas-administrativas.
- **Presencial/híbrida:** só em Porto Alegre, Canoas, São Leopoldo, Esteio, Eldorado do Sul e Sapucaia do Sul.
- **Remota no Brasil:** sempre passa.
- **Remota internacional:** só se aceitar quem mora no Brasil, na América Latina ou no mundo todo.
- **Alertas por e-mail:** o local é o que você configurou no alerta do site.

## Canais

| Canal | Secret |
|---|---|
| #estágio | `DISCORD_WEBHOOK_ESTAGIO` |
| #junior | `DISCORD_WEBHOOK_JUNIOR` |
| #full-stack | `DISCORD_WEBHOOK_FULLSTACK` |
| #ia | `DISCORD_WEBHOOK_IA` |
| #remoto | `DISCORD_WEBHOOK_REMOTO` |
| #internacional | `DISCORD_WEBHOOK_INTERNACIONAL` |
| #vagas-administrativas | `DISCORD_WEBHOOK_VAGAS_ADMINISTRATIVAS` |
| #vagas-saude | `DISCORD_WEBHOOK_VAGAS_SAUDE` |
| #administrativo (avisos de erro) | `DISCORD_WEBHOOK_ADMIN` |

Vagas do Brasil vão para o canal do nível e, se forem remotas, também para #remoto. Vagas internacionais vão para #internacional (e as de IA também para #ia).

## Alertas por e-mail (LinkedIn e outros)

1. Ative a verificação em duas etapas na sua conta Google.
2. Crie uma **senha de app** em myaccount.google.com/apppasswords.
3. Cadastre os secrets `GMAIL_USER` (seu e-mail) e `GMAIL_APP_PASSWORD` (a senha de 16 letras).
4. Crie alertas de vaga em cada site, já com o local desejado (Porto Alegre e região, ou Remoto).

O acesso é só leitura: o bot não apaga, move nem marca e-mails como lidos.

## Rodar no computador

```bash
npm install
npm run testar-filtro   # confere o filtro com exemplos, sem acessar nenhum site
npm start               # sem webhooks configurados, só mostra no terminal o que enviaria
```

Para forçar todas as fontes fora dos horários delas, use `FORCAR_TODAS=1`. No GitHub, o botão **Run workflow** já faz isso.

## Personalizar

Tudo fica em `src/config.ts`: buscas da Gupy, empresas acompanhadas, sites de alerta por e-mail, palavras de inclusão e exclusão, cidades aceitas, idade máxima das vagas e limite por canal.
