# Arquitetura — Central de Reservas L&M

## Visão geral do fluxo

```
Cliente (WhatsApp)
      ↓
Kommo CRM (WABA oficial)
      ↓
Salesbot / Robô de Entrada
      ↓
n8n (webhook)
      ↓
OpenAI / ChatGPT (Jul.IA ou Gust.IA)
      ↓
n8n (processa resposta)
      ↓                    ↘
Kommo API → Cliente    Cotador HAI+ (se cotação)
```

---

## Componentes

### Kommo CRM
- Recebe mensagens via WhatsApp WABA (integração oficial)
- Gerencia leads, pipelines, etapas e campos personalizados
- Salesbots orquestram o fluxo: buffer, loop, handoff, fotos, orçamento
- Widget privado faz a ponte entre salesbots e n8n (ver seção Widget)

### n8n
- VPS Hostinger KVM2 | Docker | concurrency limit: 15
- Recebe webhooks do Kommo com `Respond Immediately` (obrigatório — sem isso Kommo retorna 404)
- Processa mensagens, chama a IA, grava no Postgres/Redis, devolve resposta ao Kommo
- Workflows separados por função: atendimento, desativação manual, notificação, pós-venda
- Scripts auxiliares em `n8n/codes_cotacao/` para montar mensagens de orçamento

### Redis
- Cache de: leads (TTL 36h), pipelines (diário), custom fields (a cada 3 dias)
- Evita chamadas repetidas à API do Kommo durante o fluxo

### Postgres
- Tabelas: `crm.leads`, `crm.interacoes`
- Histórico persistente de atendimentos

### Cotador HAI+ (API REST)
- API de cotação que faz scraping dos sistemas de reserva dos hotéis
- Base URL: `http://jeab-chat.theworkpc.com:8000`
- Scrapers: Silbeck (5 hotéis), Desbravador (2), Omnibees (4), Fazzenda (1), Recanto (1)
- Hotéis sem scraper: Dona Francisca, Vivaz Cataratas, Mabu Thermas, centrais
- Documentação em `cotador/doc_api_cotador.md`

### Widget privado (Kommo)
- Integração privada instalada na conta Kommo
- Expõe dois handlers usados pelos salesbots:
  - `handler_julia`: envia webhook ao n8n e aguarda resposta (edit request)
  - `handler_notify`: envia webhook de notificação ao n8n
- **Limitação crítica**: só permite **uma resposta por requisição** → cada chamada retorna exatamente 1 mensagem
- `bind_actions` com `salesbot:callback` **não funciona** em integrações privadas (limitação do Kommo)

---

## Agentes

### Jul.IA
- Atende leads de hotéis/resorts individuais
- Coleta dados, gera cotação, faz handoff quando necessário
- Parâmetro n8n: `assistant=julia`

### Gust.IA
- Triagem nas centrais regionais (Gravatal, Jurema, Piratuba, Foz do Iguaçu, Resorts, Gramado)
- Identifica hotel de interesse e encaminha ou atende
- Parâmetro n8n: `assistant=gustavo`
- Usa os mesmos campos, etapas e fluxo da Jul.IA — só o agente chamado muda

---

## Workflows n8n

| Workflow | Arquivo | Função |
|----------|---------|--------|
| Handler Jul.IA | handler_jul.ia.json | Entrada webhook, payload, cache, buffer, first_contact |
| Backend Jul.IA | backend_jul.ia.json | Chamada IA, banco, resposta ao lead |
| Agente Jul.IA | agente_jul.ia.json | Geração de resposta pela IA (OpenAI API) |
| CriaMemoria | criamemoria.json | Gestão de contexto/sumário via Redis |
| Handoff Jul.IA | handoff_jul.ia.json | Desativa IA, cria tarefa, move etapa |
| Handoff Gust.IA → Jul.IA | handoff_gustavo.ia→jul.ia.json | Rota da central para hotel específico |
| Desativação Manual | desativacao_manual_jul.ia.json | Desativação manual pela equipe |
| Timeout Jul.IA | timeout_jul.ia.json | Timeout 4h → passa para equipe |
| Enviar Fotos | enviar_fotos.json | Envia fotos do hotel ao lead |
| Pós-venda LM Resorts | pos_venda_lm_resorts.json | Follow-up pós-venda |
| Cache Custom Fields | cache_custom_fields.json | Atualiza cache a cada 3 dias |
| Cache Pipelines | cache_pipelines.json | Atualiza cache diário (madrugada) |
| Cache Users | cache_users.json | Atualiza cache de usuários |

Scripts auxiliares (codes_cotacao/): `config_hoteis.js`, `monta_mensagem_orcamento1.js`, `monta_mensagem_multipla.js`

---

## Fluxo detalhado — Hotel individual

### 1. Lead chega
- Mensagem recebida pelo Kommo via WhatsApp WABA
- Robô de Entrada é acionado

### 2. Setup do lead (Robô de Entrada)
- Salva mensagem em `mensagem_buffer`
- Define responsável, nota "IA em atendimento", `jul.ia_ativa=true`, nome do lead
- Define `hotel ou resort` (estético, visível para vendedores)
- Define `hotel_resort` (técnico, is_api_only, não editável manualmente)
- Move para etapa **JUL.IA ATIVADA**

### 3. Decisão: formulário ou mensagem livre
- `mensagem_buffer` contém "cotação" → **formulário de cotação** (landing page) → vai direto à IA
- Não contém → **mensagem livre** → envia Salesbot de Recepção + webhook `first_contact=true` ao n8n

### 4. Loop principal (Chamar Jul.IA)
- Aguarda mensagem do cliente (timeout: 4h → passa para equipe se atingir)
- Buffer de 1 minuto: concatena mensagens com separador `§|§`, reiniciado a cada mensagem
- Checa `jul.ia_ativa` antes de chamar IA (segurança)
- Chama sub-robô nested: "Falar com Jul.IA" (buffer=false) ou "Falar com Jul.IA com Buffer" (buffer=true)
- Sub-robô envia webhook via `handler_julia` e aguarda resposta do n8n
- Esvazia buffer, checa `jul.ia_ativa` novamente, reinicia o loop

### 5. Cotação / Handoff
- n8n processa, chama IA, recebe JSON de resposta da Jul.IA
- Se `pronto_para_cotacao=true` → consulta Cotador HAI+, monta orçamento
- Antes do orçamento: dispara **Salesbot Preparando Orçamento** (workaround para limitação de 1 resposta)
- Envia orçamento via `handler_julia`
- Após orçamento: dispara **Salesbot Enviar Fotos** do hotel
- Se `handoff_only` ou `send_and_handoff`: notifica equipe via `handler_notify`

### 6. Desativação
- Manual: equipe clica no robô → n8n executa workflow de desativação manual
- Automática: n8n seta `jul.ia_ativa=false` via API quando necessário

---

## Fluxo detalhado — Central

Mesmo fluxo, com diferenças:

1. **Robô de Entrada** faz triagem do hotel dentro do próprio salesbot (pipeline único para vários hotéis)
2. Se hotel identificado na mensagem → fluxo igual ao individual
3. Se não identificado → Gust.IA assume, pergunta qual hotel de interesse
4. Após identificação, Gust.IA (ou equipe) encaminha para o pipeline correto (workflow handoff_gustavo.ia→jul.ia)

---

## Separador de buffer

`§|§` — sequência improvável de ser enviada manualmente por um cliente.
Usado para concatenar múltiplas mensagens no campo `mensagem_buffer` antes de enviar ao n8n.

---

## Pipelines com Jul.IA ativa

Ver `kommo/pipelines.md` para lista completa com IDs e etapas.

Hotéis com etapas JUL.IA ATIVADA/DESATIVADA presentes:
- Termas Park Hotel (ID: 11631008) — **em produção**
- Hotel Internacional Gravatal (ID: 9377539)
- Hotel Termas (ID: 9361827)
- Hotel Termas do Lago (ID: 9377947)
- Cabanas Termas Hotel (ID: 9379711)
- Itá Thermas (ID: 9392163)
- Central Termas de Gravatal (ID: 9329275)
- Hotel Tirolesa (ID: 12074732) — etapa: "Atendimento Jul.IA"
