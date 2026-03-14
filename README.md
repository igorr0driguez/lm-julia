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
n8n (processa resposta)
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

---

## Estrutura do repositório

```
.
├── CLAUDE.md              # Instruções para o agente de IA (Claude Code)
├── CONTEXT.md             # Estado atual, em andamento, decisões recentes — ler primeiro
├── ARQUITETURA.md         # Fluxo completo do sistema
├── kommo/
│   ├── pipelines.md       # Pipelines com IDs e etapas
│   ├── robos.md           # Todos os salesbots documentados
│   ├── custom-fields.md   # Campos personalizados e IDs
│   ├── codigo_hoteis.md   # Parâmetro hotel_resort por hotel
│   └── users.md           # Usuários e IDs
├── n8n/                   # Workflows exportados em JSON
├── prompts/
│   ├── julia/             # Prompts da Jul.IA (diretrizes gerais + por hotel)
│   └── gustavo/           # Prompts do Gust.IA
├── hoteis/
│   ├── _template.md       # Template + checklist de setup por hotel
│   └── termas_park_hotel.md
├── centrais/
│   └── _template.md       # Template para centrais regionais
└── bugs-e-melhorias/      # Backlog ativo e changelog
```

---

## Hotéis em produção

| Hotel | Pipeline ID | Status |
|-------|-------------|--------|
| Termas Park Hotel | 11631008 | Em produção |

Próximos na fila: Hotel Internacional Gravatal, Hotel Termas, Hotel Termas do Lago, Fazzenda Park Resort, Machadinho Thermas Resort SPA, Águas de Palmas Resort.

---

## Implementando um novo hotel

1. Copiar `hoteis/_template.md` e preencher a ficha
2. Seguir o checklist de setup do arquivo
3. Criar prompt em `prompts/julia/` baseado nas diretrizes gerais
4. Atualizar `kommo/codigo_hoteis.md` com o novo parâmetro `hotel_resort`

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
