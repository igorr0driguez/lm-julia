# Central de Reservas L&M — Jul.IA / Gust.IA

Sistema de atendimento via IA no WhatsApp integrado ao Kommo CRM via n8n, desenvolvido para a Central de Reservas L&M.

---

## Agentes

| Agente | Função | Parâmetro n8n |
|--------|--------|---------------|
| **Jul.IA** | Atende leads de hotéis/resorts individuais — coleta dados, gera cotação, faz handoff | `assistant=julia` |
| **Gust.IA** | Triagem nas centrais regionais — identifica hotel de interesse e encaminha | `assistant=gustavo` |

---

## Fluxo resumido

```
Cliente (WhatsApp)
      ↓
Kommo CRM (WABA oficial)
      ↓
Salesbot / Robô de Entrada
      ↓
n8n (webhook)
      ↓
OpenAI (Jul.IA ou Gust.IA)
      ↓
n8n (processa resposta + Cotador HAI+ se cotação)
      ↓
Kommo API → Cliente (WhatsApp)
```

Fluxo detalhado em [ARQUITETURA.md](./ARQUITETURA.md).

---

## Stack

- **Kommo CRM** — salesbots, pipelines, campos personalizados, widget privado
- **n8n** — Docker, VPS Hostinger KVM2, concurrency limit 15
- **Redis** — cache de leads, pipelines e custom fields
- **Postgres** — tabelas `crm.leads` e `crm.interacoes`
- **WhatsApp WABA** — via integração oficial Kommo
- **Cotador HAI+** — API REST de cotação (scraping de sistemas de reserva)

---

## Estrutura do repositório

```
.
├── CLAUDE.md              # Instruções para o agente de IA (Claude Code)
├── CONTEXT.md             # Estado atual, em andamento, decisões recentes — ler primeiro
├── ARQUITETURA.md         # Fluxo completo do sistema
├── kommo/
│   ├── CLAUDE.md          # Regras específicas do Kommo
│   ├── pipelines.md       # Pipelines com IDs e etapas
│   ├── robos.md           # Todos os salesbots documentados
│   ├── custom-fields.md   # Campos personalizados e IDs
│   ├── codigo_hoteis.md   # Mapeamento hotel_resort ↔ pipeline
│   ├── users.md           # Usuários e IDs
│   └── widget/            # Widget privado (manifest, script, i18n)
├── n8n/
│   ├── CLAUDE.md          # Regras específicas do n8n
│   ├── *.json             # Workflows exportados (14 ativos + 1 legacy)
│   └── codes_cotacao/     # Scripts JS para montar mensagens de orçamento
├── prompts/
│   ├── julia/             # Prompts da Jul.IA (diretrizes v8 + 8 prompts de hotel)
│   │   ├── diretrizes_gerais_julia_v8.md
│   │   └── {hotel}.js     # 8 prompts: termas_park, hotel_internacional, hotel_termas,
│   │                      #   termas_do_lago, fazzenda_park, machadinho_thermas,
│   │                      #   aguas_de_palmas, recanto_cataratas
│   └── gustavo/           # Prompts do Gust.IA (vazio — ainda não implementado)
├── hoteis/
│   ├── _template.md       # Template + checklist de setup por hotel
│   └── *.md               # 15 fichas de hotel preenchidas
├── centrais/
│   └── _template.md       # Template para centrais regionais
├── cotador/
│   ├── CLAUDE.md          # Instruções do cotador
│   └── doc_api_cotador.md # Documentação da API HAI+
└── bugs_e_melhorias/      # Backlog ativo e changelog
```

---

## Status dos hotéis

### Em produção (1)
| Hotel | Pipeline ID |
|-------|-------------|
| Termas Park Hotel | 11631008 |

### Prompt criado — aguardando deploy (7)
Hotel Internacional Gravatal, Hotel Termas, Termas do Lago, Fazzenda Park Resort, Machadinho Thermas Resort SPA, Águas de Palmas Resort, Recanto Cataratas Resort

### Ficha preenchida — sem prompt (7)
Cabanas Termas Hotel, Costão do Santinho, Hotel Tirolesa, Jardins de Jurema, Lagos de Jurema, Mabu Thermas, Vivaz Cataratas

### Pipeline no Kommo — sem ficha (6)
Dona Francisca, Itá Thermas, Grand Suites Family Resort, Laghetto Resort Golden, Laghetto Gramado, Laghetto Stilo Borges

### Centrais (6)
Central Gravatal, Central Jurema, Central Piratuba, Central Foz do Iguaçu, Central Resorts, Central Gramado

---

## Implementando um novo hotel

1. Copiar `hoteis/_template.md` e preencher a ficha
2. Seguir o checklist de setup do arquivo
3. Criar prompt em `prompts/julia/` usando a skill prompt-julia (`/prompt-julia create`)
4. Atualizar `kommo/codigo_hoteis.md` com o novo parâmetro `hotel_resort`
5. Configurar `n8n/codes_cotacao/config_hoteis.js` com dados do hotel

---

## Regras críticas

- Webhook n8n **sempre** com `Respond Immediately` — sem isso o Kommo retorna 404
- Campo `jul.ia_ativa` (ID: 1055196): somente `true`/`false`, nunca `1`/`0`
- Separador de buffer: `§|§`
- Emojis: apenas Unicode básico — testar antes de usar na API Kommo
- Widget: incrementar `version` no `manifest.json` a cada update; desinstalar e reinstalar após deploy
- Mudanças nos robôs globais afetam **todos** os pipelines — sempre sinalizar antes

---

## Documentação de referência

- [CONTEXT.md](./CONTEXT.md) — estado atual e decisões recentes
- [ARQUITETURA.md](./ARQUITETURA.md) — fluxo técnico completo
- [kommo/robos.md](./kommo/robos.md) — salesbots e fluxos
- [kommo/custom-fields.md](./kommo/custom-fields.md) — campos e IDs
- [kommo/codigo_hoteis.md](./kommo/codigo_hoteis.md) — mapeamento hotéis ↔ pipelines
- [cotador/doc_api_cotador.md](./cotador/doc_api_cotador.md) — API de cotação
