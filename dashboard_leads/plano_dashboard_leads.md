# Plano: Dashboard de Acompanhamento de Leads — Jul.IA

## Problema

Com 13-15 mil leads/mês no Kommo e múltiplos funis (um por hotel/resort), os vendedores não conseguem acompanhar o status dos leads em atendimento pela Jul.IA de forma eficiente. Os principais problemas:

- A Júlia falha em ~1% dos atendimentos (~3 leads/dia) sem que ninguém perceba imediatamente
- O Kommo marca leads como "respondidos" automaticamente, escondendo falhas
- São 10+ funis, o que exige múltiplas abas ou navegação manual constante
- A visão de chat do Kommo é confusa quando a Júlia está ativa em vários leads simultaneamente
- Não há como configurar timer de mensagem de saída no Kommo

## Objetivo

Um painel de status em tempo real onde todos os vendedores consigam, de forma rápida e visual:

1. Saber quais leads estão sendo atendidos pela Júlia agora
2. Saber quais leads terminaram o atendimento e aguardam o vendedor assumir
3. Identificar imediatamente quais leads tiveram erro no atendimento
4. Ver o histórico da conversa do lead com a Júlia sem sair do painel
5. Assumir um lead diretamente, sincronizando com o Kommo

## Layout

### Barra de filtros (topo)

Badges clicáveis com o nome de cada hotel. Por padrão todos ativos. Clicar num badge filtra o painel para mostrar apenas os leads daquele hotel. Múltipla seleção permitida.

```
[TODOS] [TERMAS PARK] [INTERNACIONAL] [JUREMA] [PIRATUBA] ...
```

### Estrutura: 3 colunas globais fixas

```
┌─────────────────────┬──────────────────────┬─────────────────────┐
│   Em Atendimento    │ Aguardando Vendedor   │        Erro         │
│                     │                      │                     │
│  [card]             │  [card]              │  [card vermelho]    │
│  [card]             │  [card]              │  [card vermelho]    │
│  ...                │  ...                 │  ...                │
└─────────────────────┴──────────────────────┴─────────────────────┘
```

Independente de quantos hotéis existirem, sempre 3 colunas. O contexto do hotel é mostrado dentro do card via badge colorido.

### Ordenação por coluna

- **Em Atendimento**: ordenado por última mensagem recebida (mais recente primeiro — parecido com o chat atual do Kommo)
- **Aguardando Vendedor**: ordenado por última mensagem recebida (mais recente primeiro)
- **Erro**: ordenado por tempo de erro (mais antigo primeiro — prioriza quem está esperando há mais tempo)

### Modelo de card

```
┌─────────────────────────────────────┐
│ [TERMAS PARK]  João Silva           │
│ Status: Em atendimento              │
│ Última mensagem: há 2 min (14:32)   │
│ Assumido por: —                     │
│                                     │
│  [Ver chat]      [Assumir lead]     │
└─────────────────────────────────────┘
```

Card em erro:
```
┌─────────────────────────────────────┐  ← borda/fundo vermelho
│ [TERMAS PARK]  João Silva           │
│ Status: ERRO — sem resposta         │
│ Aguardando desde: 14:28 (6 min)     │
│ Assumido por: —                     │
│                                     │
│  [Ver chat]      [Assumir lead]     │
└─────────────────────────────────────┘
```

Campos exibidos em cada card:
- Badge colorido com nome do hotel (cor fixa por hotel)
- Nome do lead
- Status atual
- Última mensagem / tempo aguardando
- Quem assumiu (se já assumido)
- Botão **Ver chat** — abre popup com histórico da conversa
- Botão **Assumir lead** — atribui o lead ao vendedor (sincroniza com Kommo)

O card inteiro também é clicável e abre o lead diretamente no Kommo em nova aba.

### Popup "Ver chat"

Abre sobre o painel sem sair da página. Exibe a conversa acumulada do lead com a Júlia (mensagens do cliente e respostas da Júlia em ordem cronológica). Dentro do popup há também o botão "Assumir lead" para o gerente ou vendedor agir sem fechar o popup.

Principal utilidade: gerentes e leads com erro, onde entender o contexto antes de assumir é crítico.

## Estados dos Leads

| Estado | Coluna | Trigger |
|---|---|---|
| Em atendimento | Em Atendimento | Webhook: lead entrou na etapa "Júlia ativada" |
| Erro | Erro | Timer: gap > 4 min entre mensagem do cliente e resposta da Júlia |
| Aguardando vendedor | Aguardando Vendedor | Webhook: lead movido para "Júlia desativada" (handoff ou fim de fluxo) |
| Removido do painel | — | Webhook: vendedor assumiu (via botão no dashboard ou ação no Kommo) |

**Observação sobre o timer de erro:** o timer só dispara se a Júlia não respondeu dentro de 4 minutos após receber uma mensagem do cliente. Se a Júlia já respondeu e está aguardando o cliente, o timer não corre.

## Integração com n8n e Kommo

### Estratégia

Os webhooks com o Kommo já existem no n8n. A integração do dashboard é feita introduzindo chamadas adicionais nos fluxos já existentes — sem reescrever nada, só adicionar steps.

### Webhooks necessários (dashboard como receptor)

| Evento | Onde adicionar no n8n | Payload mínimo |
|---|---|---|
| Lead entrou na Júlia | Início do fluxo, quando lead chega na etapa "Júlia ativada" | lead_id, nome, hotel, link_kommo, timestamp |
| Mensagem do cliente recebida | A cada mensagem recebida no fluxo | lead_id, remetente: "cliente", texto, timestamp |
| Júlia respondeu | Após envio de mensagem da Júlia | lead_id, remetente: "julia", texto, timestamp |
| Júlia fez handoff | No fluxo de handoff existente | lead_id, timestamp |
| Atendimento concluído | No fluxo de conclusão/desativação | lead_id, timestamp |
| Vendedor assumiu | Via botão no dashboard → webhook n8n → Kommo | lead_id, vendedor_id, timestamp |

### Ação "Assumir" no dashboard

Quando o vendedor clica em "Assumir":
1. Dashboard chama webhook no n8n
2. N8n executa ação no Kommo: atribui lead ao vendedor (via ID do vendedor no Kommo)
3. Dashboard registra permanentemente quem assumiu e quando (Postgres)
4. Card é removido do painel ou marcado como assumido

O ID do vendedor no Kommo é associado ao login do vendedor no dashboard (via e-mail corporativo).

## Autenticação

- Login com e-mail corporativo
- Cada usuário tem seu ID Kommo associado no cadastro
- Todos os vendedores têm acesso ao painel completo (visão global)
- Registro permanente de ações vinculado ao usuário logado — redundância intencional com o Kommo, útil para auditoria interna independente do CRM

## Persistência de Estado

### Redis — estado em tempo real (já disponível na stack)

- Chave por lead_id com: status atual, timestamps, vendedor que assumiu
- Ao abrir/reabrir o dashboard, estado correto é carregado — timer não reinicia
- TTL: 129600 segundos (36h) — alinhado com o TTL já usado no n8n
- Mantido leve: só estado atual, sem histórico de mensagens

### Postgres — histórico persistente (já disponível na stack)

Duas novas tabelas, sem impacto nas tabelas existentes:

**`dashboard_leads_mensagens`**
- lead_id, hotel, remetente ("cliente" ou "julia"), texto, timestamp
- Alimentada a cada webhook de mensagem recebida/enviada
- Usada para exibir o chat no popup

**`dashboard_leads_acoes`**
- lead_id, vendedor_id, vendedor_nome, acao ("assumiu"), timestamp
- Registro permanente para auditoria
- Consultável para relatórios futuros se necessário

## Segurança

### Autenticação e sessão
- JWT com expiração curta (ex: 8h) + refresh token
- Rate limiting no endpoint de login (ex: máx 10 tentativas/min por IP) para prevenir brute force
- Bloqueio temporário de IP após N falhas consecutivas
- HTTPS obrigatório — sem exceção, mesmo em VPS própria

### Webhooks (n8n → dashboard)
- Shared secret: cada webhook do n8n inclui um header `X-Webhook-Secret` com token fixo; o backend rejeita requisições sem o token correto
- Whitelist de IP: o backend só aceita webhooks vindos do IP da VPS n8n
- As duas proteções juntas — uma compensa se a outra falhar

### Banco de dados
- Usuário Postgres dedicado para o dashboard com permissão apenas nas tabelas `dashboard_leads_mensagens` e `dashboard_leads_acoes` — sem acesso às tabelas `crm.*`
- Queries exclusivamente parametrizadas — nunca interpolação de string com input externo (prevenção de SQL injection)
- Parâmetros de URL (query strings) tratados como input não confiável da mesma forma que o corpo do POST — ex: `/api/leads?hotel=X&status=Y` tem os valores validados antes de qualquer uso em query ou lógica

### Frontend e API
- Headers de segurança padrão: `Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options` (via Helmet.js se Node, equivalente em outras stacks)
- CORS restrito ao domínio do dashboard — sem wildcard `*`
- Inputs sanitizados antes de qualquer uso — especialmente o campo de texto do chat (prevenção de XSS)
- Rate limiting geral na API (ex: máx 100 req/min por usuário autenticado)

### Acesso e auditoria
- Nenhuma rota acessível sem autenticação válida — incluindo endpoints de webhook de saída
- Log de acessos e ações em `dashboard_leads_acoes` — rastreável quem fez o quê e quando
- Variáveis sensíveis (secrets, credenciais DB, tokens Kommo) exclusivamente em variáveis de ambiente — nunca no código

## O que o dashboard NÃO tem (por design)

- Histórico de atendimentos anteriores do lead
- Métricas ou relatórios
- Notificações push (pode ser adicionado depois)

O painel é de uso imediato: o que importa é o estado atual. Leads que saem do fluxo da Júlia somem do painel.

## Stack

| Camada | Decisão | Justificativa |
|---|---|---|
| Backend | Node.js ou Python (FastAPI) — a definir | Leveza, fácil de hospedar na VPS existente |
| Frontend | React ou HTML/JS simples — a definir | React se quiser componentes reutilizáveis; HTML/JS se quiser zero dependência |
| Realtime | WebSocket ou SSE | Atualização dos cards sem reload de página |
| Estado em tempo real | Redis (já disponível) | Timer server-side, status atual dos leads, TTL 36h |
| Histórico e log de ações | Postgres (já disponível) — tabelas `dashboard_leads_mensagens` e `dashboard_leads_acoes` | Chat do popup, auditoria de quem assumiu — sem inflar RAM |
| Hosting | VPS Hostinger já existente | Sem custo adicional de infraestrutura |

## Próximos passos sugeridos

1. Definir stack de desenvolvimento (backend e frontend)
2. Criar tabelas `dashboard_leads_mensagens` e `dashboard_leads_acoes` no Postgres
3. Mapear todos os fluxos n8n onde os webhooks precisam ser inseridos (um por hotel)
4. Criar endpoints receptores de webhook no backend
5. Construir frontend — filtros, 3 colunas, cards, popup de chat
6. Implementar timer de erro server-side no Redis
7. Integrar ação "Assumir" com Kommo via n8n
8. Autenticação e mapeamento usuário ↔ ID Kommo
9. Testes com um hotel piloto antes de expandir para todos
