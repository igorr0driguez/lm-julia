# Planejamento — Evolução da Skill prompt-julia para RAG

> **Autor:** Igor + Claude Code (planejamento)
> **Data:** 06/04/2026
> **Status:** Planejamento — aguardando revisão
> **Dependência:** `planejamento_RAG.md` (infra, schema, fluxos n8n)
> **Objetivo:** Evoluir a skill `prompt-julia` para gerenciar prompts no modelo RAG (3 camadas), mantendo compatibilidade com os prompts estáticos (.js) durante a transição.

---

## Sumário

1. [Por Que Evoluir a Skill Existente](#1-por-que-evoluir-a-skill-existente)
2. [Visão Geral da Evolução](#2-visão-geral-da-evolução)
3. [Pré-Requisito: MCP Postgres](#3-pré-requisito-mcp-postgres)
4. [Fases de Implementação](#4-fases-de-implementação)
5. [Modos Existentes — Adaptação para RAG](#5-modos-existentes--adaptação-para-rag)
6. [Modos Novos](#6-modos-novos)
7. [Detecção Automática de Contexto (Estático vs RAG)](#7-detecção-automática-de-contexto-estático-vs-rag)
8. [Checklist de Revisão — Adaptação para RAG](#8-checklist-de-revisão--adaptação-para-rag)
9. [Templates e Estruturas de Referência](#9-templates-e-estruturas-de-referência)
10. [Gestão de Conteúdo via Skill (Operações Postgres)](#10-gestão-de-conteúdo-via-skill-operações-postgres)
11. [Mapeamento Ficha → hotel_config + content_chunks](#11-mapeamento-ficha--hotel_config--content_chunks)
12. [Riscos e Mitigações](#12-riscos-e-mitigações)
13. [Roadmap de Implementação da Skill](#13-roadmap-de-implementação-da-skill)

---

## 1. Por Que Evoluir a Skill Existente

### Decisão: evoluir `prompt-julia`, NÃO criar skill separada

| Fator | Justificativa |
|-------|---------------|
| Operações idênticas | Create, review, update, correct — os verbos não mudam, o alvo muda |
| Conhecimento compartilhado | Comportamento do GPT-4.1 mini, diretrizes, checklist, decisões canônicas — tudo continua válido |
| Manutenção | Duas skills = duplicar diretrizes, decisões canônicas, checklist. Quando atualizar uma, precisa lembrar da outra |
| UX para o Igor | Um comando só: `/prompt-julia`. A skill detecta se o hotel está no RAG ou no estático e age adequadamente |
| Transição gradual | Durante meses, alguns hotéis estarão no RAG e outros no estático. Uma skill que lida com ambos é essencial |

### O que NÃO muda na skill

- As **diretrizes gerais** (Blocos 1-4) continuam sendo a fonte canônica
- O **comportamento do GPT-4.1 mini** (literal, end-of-prompt precedence, exemplos como calibrador primário) continua guiando toda decisão
- As **decisões canônicas** (tabela de padrões — header, R#1-R#7, exemplos, NÃO FAZER, etc.) continuam válidas
- O **checklist de revisão** continua sendo a referência de qualidade
- Os **critical patterns** (wording condicional, crianças, Think step, etc.) continuam sendo verificados

### O que MUDA

- O **alvo** da operação: antes era um arquivo `.js`; agora são registros no Postgres (hotel_config, content_chunks, prompt_templates)
- A **verificação** de qualidade: antes era ler o `.js`; agora é montar o prompt dinâmico (simular assemblePrompt) e verificar o resultado
- A **granularidade**: antes toda mudança era no arquivo inteiro; agora cada camada é independente (mudar uma faixa etária = UPDATE na hotel_config, sem tocar nos chunks)

---

## 2. Visão Geral da Evolução

### Modos da skill — antes e depois

```
ANTES (estático)                        DEPOIS (RAG-aware)
─────────────────                       ──────────────────

/prompt-julia create                    /prompt-julia create
  └─ Gera arquivo .js                     ├─ [estático] Gera arquivo .js (igual hoje)
                                          └─ [RAG] Popula hotel_config + content_chunks

/prompt-julia review                    /prompt-julia review
  └─ Audita arquivo .js                   ├─ [estático] Audita arquivo .js (igual hoje)
                                          └─ [RAG] Monta prompt dinâmico + audita resultado

/prompt-julia update                    /prompt-julia update
  └─ Edita seção do .js                   ├─ [estático] Edita seção do .js (igual hoje)
                                          └─ [RAG] Identifica camada + atualiza Postgres

/prompt-julia correct                   /prompt-julia correct
  └─ Diagnostica no .js                   ├─ [estático] Diagnostica no .js (igual hoje)
                                          └─ [RAG] Diagnostica por camada (template/config/chunk)

                                        /prompt-julia migrate      ← NOVO
                                          └─ Extrai .js → hotel_config + content_chunks

                                        /prompt-julia chunk        ← NOVO
                                          └─ CRUD de chunks (promoções, FAQ, sazonalidade)

                                        /prompt-julia preview      ← NOVO
                                          └─ Monta prompt dinâmico e mostra o resultado

                                        /prompt-julia sync-status  ← NOVO
                                          └─ Verifica status de sincronização Postgres ↔ Qdrant
```

### Fluxo de decisão da skill

```
Usuário invoca /prompt-julia <modo> [args]
        │
        ▼
Skill detecta contexto:
  ├─ Argumento é caminho para arquivo .js?
  │   └─ SIM → modo ESTÁTICO (comportamento atual, zero mudanças)
  │
  ├─ Argumento é hotel_slug?
  │   └─ SIM → verificar se hotel existe em rag.hotel_config
  │       ├─ EXISTE → modo RAG
  │       └─ NÃO EXISTE → perguntar se quer criar (create) ou migrar (migrate)
  │
  └─ Sem argumento?
      └─ Perguntar ao usuário qual hotel e modo
```

---

## 3. Pré-Requisito: MCP Postgres

### O que é

MCP (Model Context Protocol) Postgres permite que o Claude Code execute queries SQL diretamente no Postgres da VPS, sem precisar de SSH manual. É o canal principal para a skill gerenciar dados no RAG.

### Opções de conexão

| Opção | Como funciona | Segurança | Praticidade |
|-------|---------------|-----------|-------------|
| **A — SSH Tunnel (recomendada)** | `ssh -L 5432:localhost:5432 user@vps` → MCP conecta em `localhost:5432` | Postgres fica em localhost, sem expor porta | Precisa manter o tunnel aberto durante uso |
| **B — Porta exposta com SSL** | Liberar 5432 no firewall, configurar SSL + `pg_hba.conf` para IP do Igor | Conexão criptografada, mas porta exposta | Conexão direta, sem tunnel |
| **C — Conexão via rede Docker** | Só funciona se Claude Code estivesse na VPS (não é o caso) | N/A | N/A — descartada |

### Configuração recomendada (Opção A — SSH Tunnel)

**Passo 1 — Na VPS (uma vez):**

```bash
# Verificar se Postgres aceita conexão local
docker exec postgres pg_isready -h localhost
# Deve retornar: localhost:5432 - accepting connections

# Criar usuário dedicado para o MCP (opcional mas recomendado)
docker exec -it postgres psql -U postgres -c "
  CREATE USER mcp_claude WITH PASSWORD 'senha_segura_aqui';
  GRANT USAGE ON SCHEMA rag TO mcp_claude;
  GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA rag TO mcp_claude;
  ALTER DEFAULT PRIVILEGES IN SCHEMA rag GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO mcp_claude;
"
```

**Passo 2 — Na máquina local (a cada sessão de trabalho):**

```bash
# Abrir tunnel SSH (manter terminal aberto)
ssh -L 5433:localhost:5432 user@IP_DA_VPS
# Nota: uso porta 5433 local para não conflitar se tiver Postgres local
```

**Passo 3 — Configurar MCP no Claude Code:**

No arquivo de settings do Claude Code (`.claude/settings.json` ou similar), adicionar o MCP server:

```json
{
  "mcpServers": {
    "postgres": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-postgres",
        "postgresql://mcp_claude:senha_segura_aqui@localhost:5433/nome_do_banco"
      ]
    }
  }
}
```

**Passo 4 — Testar:**

No Claude Code, a skill deve conseguir executar:

```sql
SELECT * FROM rag.hotel_config LIMIT 1;
```

### Alternativa: sem MCP (fallback manual)

Se o MCP der problema ou enquanto não estiver configurado, a skill pode gerar os comandos SQL e o Igor executa manualmente via `! docker exec -it postgres psql -U postgres -c "..."`. É menos fluido mas funciona.

A skill deve sempre gerar SQL válido e completo, independente de ter MCP ou não. O MCP apenas automatiza a execução.

---

## 4. Fases de Implementação

### Fase A — Preparação (AGORA, antes da infra RAG)

**O que fazer:**
- Atualizar a skill com a documentação dos novos modos (este documento)
- Adicionar a lógica de detecção de contexto (estático vs RAG) — seção 7
- Modos existentes continuam funcionando 100% como estão
- Novos modos ficam documentados mas retornam "infra RAG ainda não disponível"

**Por que agora:**
- O documento de planejamento fica pronto e revisado
- Quando a infra subir, a skill já sabe o que fazer

**Mudanças no arquivo skill.md:**
- Adicionar seção de modos novos (migrate, chunk, preview, sync-status)
- Adicionar seção de detecção de contexto
- Adicionar referência a este documento de planejamento
- Manter todo o conteúdo atual intacto

### Fase B — Migração (quando infra RAG + dados estiverem prontos — Fases 1-3 do roadmap RAG)

**O que fazer:**
- Ativar modo `migrate` — a skill consegue ler um `.js` e popular hotel_config + content_chunks
- Ativar modo `chunk` — CRUD de chunks no Postgres
- Ativar modo `sync-status` — verificar embedding_synced

**Pré-requisitos:**
- Schema `rag` criado no Postgres (Fase 1 do roadmap RAG)
- Tabelas criadas (hotel_config, content_chunks, prompt_templates)
- MCP Postgres configurado e funcionando (ou fallback manual)
- Qdrant rodando (para sync-status verificar)

### Fase C — Operação RAG (quando montagem dinâmica estiver funcionando — Fase 4+ do roadmap RAG)

**O que fazer:**
- Adaptar create/review/update/correct para entender as 3 camadas
- Ativar modo `preview` — montar prompt dinâmico simulado
- Review passa a validar o prompt montado (não mais o .js)

**Pré-requisitos:**
- assemblePrompt funcionando no n8n
- Pelo menos 1 hotel ativo no RAG (Termas Park)
- Templates compartilhados populados em prompt_templates

### Fase D — Consolidação (quando todos os hotéis estiverem no RAG)

**O que fazer:**
- Modo estático vira "legacy" (ainda funciona, mas aparece aviso)
- Criar atalhos para operações frequentes (add promoção, atualizar FAQ)
- Possivelmente: integrar com workflow n8n de ingestão (disparar re-embed via webhook)

---

## 5. Modos Existentes — Adaptação para RAG

### 5.1 Create — `/prompt-julia create`

#### Modo estático (atual — sem mudanças)

Continua exatamente como está: lê gold standard, extrai ficha, valida com usuário, gera `.js`, roda checklist.

#### Modo RAG (novo)

**Trigger:** usuário pede para criar prompt de novo hotel E o contexto é RAG.

**Inputs necessários:**
- Hotel data (ficha, PDF, briefing — qualquer formato, igual hoje)
- Faixas etárias do hotel
- Confirmação: "modo RAG" (ou detecção automática se hotel_config já existir para outros hotéis)

**Processo:**

```
1. EXTRAIR FICHA (igual ao modo estático)
   ├─ Ler material do hotel
   ├─ Preencher campos da Ficha (Bloco 1)
   └─ Apresentar ao usuário para validação

2. POPULAR hotel_config
   ├─ Mapear campos da Ficha → colunas da tabela rag.hotel_config
   │   (ver Seção 11 — Mapeamento Ficha → hotel_config)
   ├─ Gerar SQL de INSERT
   ├─ Executar via MCP (ou apresentar SQL para execução manual)
   └─ Validar: SELECT do registro inserido

3. CRIAR CHUNKS hotel-específicos
   ├─ Gerar chunks de content_type:
   │   ├─ descricao_hotel (visão geral, destaques, localização)
   │   ├─ quartos (tipos, capacidade, amenidades)
   │   ├─ regime_refeicoes (regime, horários, bebidas)
   │   ├─ lazer_recreacao (atividades, piscinas, recreação)
   │   ├─ politicas (check-in, checkout, pagamento, cancelamento)
   │   ├─ day_use (se hotel oferece — mensagem padrão + condições)
   │   ├─ servicos_extras (SPA, transfer, extras pagos)
   │   ├─ atracoes_especificas (parques, mascotes, atrações internas)
   │   └─ exemplos_few_shot (exemplos adicionais além dos 4 core)
   │
   ├─ Cada chunk segue o template: "[{hotel_name}] {título}\n\n{conteúdo}"
   ├─ Cada chunk é autocontido (entendível isoladamente)
   ├─ Gerar SQL de INSERT para cada chunk
   ├─ Executar via MCP
   └─ Todos os chunks ficam com embedding_synced = false (serão vetorizados pelo workflow de ingestão)

4. VERIFICAR TEMPLATES COMPARTILHADOS
   ├─ SELECT * FROM rag.prompt_templates
   ├─ Se templates não existem → AVISAR o usuário (fase de infra não concluída)
   └─ Se existem → validar que os placeholders do hotel são compatíveis

5. GERAR PROMPT ESTÁTICO DE FALLBACK
   ├─ Gerar o .js completo (mesmo processo do modo estático)
   ├─ Salvar em prompts/julia/{hotel_slug}.js (backup no repo)
   └─ UPDATE rag.hotel_config SET prompt_estatico = '...' WHERE hotel_slug = '{slug}'

6. PREVIEW + REVIEW
   ├─ Simular montagem do prompt dinâmico (assemblePrompt conceitual)
   │   Templates + hotel_config + chunks criados → prompt montado
   ├─ Rodar checklist de revisão no prompt montado
   ├─ Reportar issues encontrados
   └─ Corrigir antes de entregar

7. DISPARAR INGESTÃO (se possível)
   ├─ Se workflow n8n de ingestão tem webhook → disparar
   └─ Se não → avisar usuário: "Execute o workflow de ingestão manualmente para vetorizar os chunks"
```

**Output final:**
- hotel_config populado no Postgres
- N chunks criados em content_chunks (com embedding_synced = false)
- Prompt estático de fallback salvo no hotel_config e como .js no repo
- Relatório de review do prompt montado
- Lista de chunks criados com seus IDs e content_types

### 5.2 Review — `/prompt-julia review`

#### Modo estático (atual — sem mudanças)

Continua exatamente como está.

#### Modo RAG (novo)

**Trigger:** usuário pede review de hotel que está no RAG.

**Input:** hotel_slug

**Processo:**

```
1. CARREGAR DADOS DO HOTEL
   ├─ SELECT * FROM rag.hotel_config WHERE hotel_slug = '{slug}'
   ├─ SELECT * FROM rag.content_chunks WHERE hotel_slug = '{slug}' AND ativo = true
   └─ SELECT * FROM rag.prompt_templates

2. MONTAR PROMPT SIMULADO
   ├─ Substituir placeholders nos templates com dados do hotel_config
   ├─ Injetar faixas_etarias na Regra #4 (renderizar tabela markdown)
   ├─ Injetar regras_exclusivas onde aplicável
   ├─ Injetar primeira_mensagem, nao_fazer_extras, possessivos_hotel
   ├─ Simular injeção de chunks RAG (pegar os 5 mais relevantes para um cenário genérico)
   ├─ Injetar 4 exemplos core com placeholders substituídos
   └─ Resultado = prompt montado completo (como o n8n geraria)

3. RODAR CHECKLIST DE REVISÃO
   ├─ Aplicar TODOS os checks do references/review-checklist.md no prompt montado
   ├─ Checks adicionais específicos de RAG (ver Seção 8)
   └─ Reportar findings com severidade (CRITICAL / HIGH / MEDIUM / LOW)

4. VERIFICAR INTEGRIDADE DOS DADOS
   ├─ hotel_config: campos obrigatórios preenchidos? faixas_etarias válidas?
   ├─ content_chunks: chunks mínimos existem? (descricao_hotel, pelo menos 1 exemplo)
   ├─ embedding_synced: algum chunk pendente de vetorização?
   ├─ prompt_estatico: existe e está atualizado?
   └─ Reportar inconsistências
```

**Output:**
- Prompt montado completo (visualização)
- Relatório de review com findings e severidades
- Status de integridade dos dados RAG
- Sugestões de correção para cada finding

### 5.3 Update — `/prompt-julia update`

#### Modo estático (atual — sem mudanças)

Continua exatamente como está.

#### Modo RAG (novo)

**Trigger:** usuário pede mudança em hotel que está no RAG.

**Input:** hotel_slug + descrição da mudança

**Processo:**

```
1. CLASSIFICAR A MUDANÇA
   ├─ A skill detecta automaticamente o tipo (igual hoje):
   │   ├─ Tipo A — Dado do hotel (faixa etária, regime, horário, etc.)
   │   ├─ Tipo B — Regra comportamental do hotel
   │   ├─ Tipo C — Regra geral (afeta todos os hotéis)
   │   └─ Tipo D — Remoção
   │
   └─ Novo: IDENTIFICAR QUAL CAMADA é afetada
       ├─ Camada 1 (template) → mudança em prompt_templates
       ├─ Camada 2 (config) → mudança em hotel_config
       ├─ Camada 3 (chunk) → mudança em content_chunks
       └─ Múltiplas camadas → aplicar em todas

2. MAPEAR IMPACTO POR CAMADA

   ┌─────────────────────────────────────────────────────────────────────┐
   │ Tipo da mudança          │ Camada afetada    │ Ação                │
   ├─────────────────────────────────────────────────────────────────────┤
   │ Faixa etária mudou       │ hotel_config      │ UPDATE faixas_etarias, adulto_min_idade │
   │ Regime mudou             │ hotel_config      │ UPDATE regime_*     │
   │ Primeira mensagem mudou  │ hotel_config      │ UPDATE primeira_mensagem │
   │ Day use mudou            │ hotel_config      │ UPDATE day_use_*    │
   │ Nova promoção            │ content_chunks    │ INSERT chunk (promocoes) │
   │ Novo FAQ                 │ content_chunks    │ INSERT chunk (faq)  │
   │ Info sazonal             │ content_chunks    │ INSERT chunk (sazonalidade) │
   │ Nova regra de negócio    │ hotel_config      │ UPDATE regras_exclusivas │
   │                          │ + content_chunks  │ + INSERT/UPDATE chunk de caso especial │
   │ Novo NÃO FAZER           │ hotel_config      │ UPDATE nao_fazer_extras │
   │ Terminologia mudou       │ hotel_config      │ UPDATE terminologia │
   │ Novo exemplo few-shot    │ content_chunks    │ INSERT chunk (exemplos_few_shot) │
   │ Regra geral mudou        │ prompt_templates  │ UPDATE template(s) afetado(s) │
   │                          │                   │ → ALERTA: afeta todos os hotéis │
   │ Info do hotel mudou      │ content_chunks    │ UPDATE chunk existente │
   │ Remoção de conteúdo      │ content_chunks    │ UPDATE SET ativo = false │
   │ Remoção de regra         │ hotel_config      │ UPDATE campo relevante │
   │                          │ + content_chunks  │ + UPDATE SET ativo = false │
   └─────────────────────────────────────────────────────────────────────┘

3. APLICAR MUDANÇA
   ├─ Gerar SQL para cada operação necessária
   ├─ Se mudança em content_chunks:
   │   └─ UPDATE SET embedding_synced = false (forçar re-vetorização)
   ├─ Se mudança em hotel_config:
   │   └─ Invalidar cache Redis: avisar usuário para limpar `hotel_config:{slug}`
   ├─ Se mudança em prompt_templates:
   │   ├─ ALERTAR: "Essa mudança afeta TODOS os hotéis. Confirma?"
   │   ├─ Incrementar version no template
   │   └─ Invalidar cache Redis de templates
   └─ Executar via MCP (ou apresentar SQL)

4. ATUALIZAR PROMPT ESTÁTICO DE FALLBACK
   ├─ Aplicar a mesma mudança no .js (se existir)
   ├─ UPDATE rag.hotel_config SET prompt_estatico = '...'
   └─ Manter os dois em sync

5. PREVIEW + REVIEW
   ├─ Montar prompt dinâmico com os dados atualizados
   ├─ Rodar checklist nos pontos afetados pela mudança
   └─ Reportar se a mudança introduziu algum issue
```

**Output:**
- SQL executado (ou apresentado para execução manual)
- Diff conceitual: o que mudou em cada camada
- Preview do prompt montado (opcional, sob pedido)
- Resultado do review parcial
- Lembrete: "Execute o workflow de ingestão para re-vetorizar os chunks atualizados" (se aplicável)

### 5.4 Correct — `/prompt-julia correct`

#### Modo estático (atual — sem mudanças)

Continua exatamente como está.

#### Modo RAG (novo)

**Trigger:** Julia está se comportando errado e o hotel está no RAG.

**Input:** descrição do comportamento errado + hotel_slug

**Processo (adaptação dos 4 steps):**

```
STEP 1: REPRODUCE (igual ao estático)
  └─ Entender: o que o cliente disse, o que a Julia respondeu, o que deveria ter feito

STEP 2: DIAGNOSE (expandido para 3 camadas)
  ├─ Carregar hotel_config do hotel
  ├─ Carregar content_chunks ativos do hotel
  ├─ Carregar prompt_templates
  ├─ Montar o prompt que o n8n teria montado para aquela mensagem
  │
  ├─ Classificar causa raiz (categorias expandidas):
  │   ├─ TEMPLATE: regra compartilhada está errada ou fraca
  │   │   Ex: wording incondicional no template de Think
  │   │
  │   ├─ CONFIG: dado do hotel está errado ou faltando
  │   │   Ex: faixa etária errada no hotel_config
  │   │
  │   ├─ CHUNK IRRELEVANTE: RAG retornou chunk que confundiu o modelo
  │   │   Ex: exemplo de day use injetado numa conversa de hospedagem
  │   │
  │   ├─ CHUNK FALTANDO: RAG não retornou contexto necessário
  │   │   Ex: cliente perguntou sobre promoção, não tinha chunk de promoção
  │   │
  │   ├─ CHUNK COM CONTEÚDO ERRADO: informação desatualizada ou incorreta
  │   │   Ex: chunk diz "piscina aberta 7h-22h" mas horário mudou
  │   │
  │   ├─ MONTAGEM: erro na lógica de assemblePrompt (Code node do n8n)
  │   │   Ex: placeholder não substituído, faixas etárias renderizadas errado
  │   │
  │   └─ RETRIEVAL: embedding não capturou intenção da mensagem
  │       Ex: score_threshold muito alto cortou chunks relevantes
  │
  └─ Reportar diagnóstico ao usuário ANTES de corrigir

STEP 3: CORRECT (por camada)
  ├─ Se TEMPLATE → propor mudança no prompt_templates (com alerta: afeta todos)
  ├─ Se CONFIG → gerar UPDATE no hotel_config
  ├─ Se CHUNK → gerar INSERT/UPDATE/SET ativo=false no content_chunks
  ├─ Se MONTAGEM → apontar o que precisa mudar no Code node do n8n (fora do escopo da skill, mas diagnosticar)
  ├─ Se RETRIEVAL → sugerir ajuste de score_threshold ou adição de keyword filter
  │
  ├─ Aplicar GPT-4.1 mini best practices na correção:
  │   ├─ Wording literal e explícito
  │   ├─ Sandwich pattern (regra no início + reforço no NÃO FAZER)
  │   ├─ Few-shot example se comportamento é recorrente
  │   └─ Verificar conflitos com outras instruções
  │
  └─ Executar via MCP (ou apresentar SQL)

STEP 4: VALIDATE (expandido)
  ├─ Montar prompt dinâmico com dados corrigidos
  ├─ Rodar checklist completo no prompt montado
  ├─ Verificar especificamente os check items relacionados ao diagnóstico
  ├─ Atualizar prompt estático de fallback se a correção impacta
  └─ Reportar: causa raiz, o que mudou, se o checklist passa
```

**Output:**
- Diagnóstico com classificação por camada
- SQL de correção executado (ou apresentado)
- Prompt montado corrigido (preview)
- Resultado do review
- Atualização do prompt estático se necessário

---

## 6. Modos Novos

### 6.1 Migrate — `/prompt-julia migrate`

**Objetivo:** Converter um prompt estático `.js` existente para o modelo RAG (popular hotel_config + content_chunks).

**Quando usar:** Para cada hotel durante a Fase 2 do roadmap RAG.

**Input:** Caminho para o arquivo .js OU hotel_slug (busca automática em `prompts/julia/`)

**Processo detalhado:**

```
1. LER E PARSEAR O PROMPT .js
   ├─ Ler o arquivo completo
   ├─ Identificar seções por headers markdown (## e ###)
   ├─ Classificar cada seção como:
   │   ├─ COMPARTILHADA → vai para prompt_templates (se ainda não existir)
   │   ├─ HOTEL-ESPECÍFICA → vai para hotel_config ou content_chunks
   │   └─ EXEMPLO → vai para content_chunks (exemplos_few_shot)
   │
   └─ Seções e destino:
       ├─ Header (identidade)          → hotel_config (hotel_name, hotel_location)
       ├─ Regra #1 (formato)           → prompt_templates (rules_1_to_3) — COMPARTILHADA
       ├─ Regra #2 (tools/Think)       → prompt_templates (rules_1_to_3) — COMPARTILHADA
       ├─ Regra #3 (uma pergunta)      → prompt_templates (rules_1_to_3) — COMPARTILHADA
       ├─ Regra #4 (categorização)     → hotel_config (faixas_etarias, regras_exclusivas)
       ├─ Regra #5 (cotação direta)    → prompt_templates (rules_5_to_7) — COMPARTILHADA
       ├─ Regra #6 (segurança)         → prompt_templates (rules_5_to_7) — COMPARTILHADA
       ├─ Regra #7 (respostas curtas)  → prompt_templates (rules_5_to_7) — COMPARTILHADA
       ├─ Idioma                        → prompt_templates (idioma) — COMPARTILHADA
       ├─ Primeira mensagem             → hotel_config (primeira_mensagem)
       ├─ Contexto do hotel             → content_chunks (vários chunks)
       ├─ Condução da conversa          → prompt_templates (conversation_flow) — COMPARTILHADA
       ├─ Descontos                     → prompt_templates (descontos) — COMPARTILHADA
       ├─ Casos especiais               → content_chunks + hotel_config (regras_exclusivas)
       ├─ Validações                    → prompt_templates (validacoes) — COMPARTILHADA
       ├─ Tom e estilo                  → prompt_templates (tom_estilo) — COMPARTILHADA
       ├─ NÃO FAZER (compartilhado)    → prompt_templates (nao_fazer_base) — COMPARTILHADA
       ├─ NÃO FAZER (hotel-específico) → hotel_config (nao_fazer_extras)
       ├─ Schema de saída               → prompt_templates (schema_saida) — COMPARTILHADA
       └─ Exemplos                      → content_chunks (exemplos_few_shot) + prompt_templates (exemplos_core)

2. EXTRAIR hotel_config
   ├─ hotel_slug: derivar do nome do arquivo (ex: hotel_internacional_gravatal.js → hotel_internacional)
   ├─ hotel_resort_code: consultar Anexo A do planejamento_RAG.md
   ├─ hotel_name: extrair do header
   ├─ hotel_location: extrair do header
   ├─ faixas_etarias: parsear tabela da Regra #4 → gerar JSONB
   ├─ adulto_min_idade: menor idade da faixa adulto
   ├─ regime_hospedagem: extrair do contexto
   ├─ primeira_mensagem: extrair seção de primeira mensagem
   ├─ day_use_modo: detectar se tem mensagem de day use
   ├─ day_use_mensagem: extrair mensagem se existir
   ├─ regras_exclusivas: extrair da Regra #4 e Casos Especiais
   ├─ terminologia: extrair de Casos Especiais (termos protegidos)
   ├─ possessivos_hotel: detectar se prompt usa "nosso hotel"
   ├─ nao_fazer_extras: extrair NÃO FAZER hotel-específicos
   ├─ prompt_estatico: o prompt .js completo (para fallback)
   │
   ├─ Apresentar extração ao usuário para VALIDAÇÃO
   │   (mostrar cada campo extraído + valor)
   │
   └─ Gerar e executar INSERT SQL

3. EXTRAIR content_chunks
   ├─ Contexto do hotel:
   │   ├─ Descrição geral → chunk descricao_hotel
   │   ├─ Quartos → chunk quartos
   │   ├─ Refeições → chunk regime_refeicoes
   │   ├─ Lazer/recreação → chunk(s) lazer_recreacao
   │   ├─ Políticas → chunk politicas
   │   └─ Serviços extras → chunk servicos_extras
   │
   ├─ Casos especiais hotel-específicos → chunk(s) com content_type adequado
   │
   ├─ Exemplos (além dos 4 core):
   │   ├─ Identificar quais dos 8+ exemplos do .js são CORE (saudação, cotação básica, handoff, tarifa-adulto)
   │   ├─ CORE → NÃO criar chunk (vão no template exemplos_core)
   │   └─ ADICIONAIS → chunk individual para cada um:
   │       ├─ content_type: "exemplos_few_shot"
   │       ├─ metadata.cenario: "day_use" | "multi_ap" | "informativo" | "grupo" | etc.
   │       └─ Cada exemplo deve ser autocontido com Think + Armazena + JSON
   │
   ├─ Cada chunk:
   │   ├─ Prefixar com "[{hotel_name}] {título}"
   │   ├─ Ser autocontido
   │   ├─ embedding_synced = false
   │   └─ qdrant_point_id = NULL
   │
   ├─ Apresentar chunks ao usuário para VALIDAÇÃO
   │   (mostrar: título, content_type, tamanho em chars, preview do conteúdo)
   │
   └─ Gerar e executar INSERT SQL para cada chunk

4. VERIFICAR/CRIAR TEMPLATES COMPARTILHADOS
   ├─ Se PRIMEIRO hotel sendo migrado:
   │   ├─ Extrair partes compartilhadas do .js
   │   ├─ Converter instruções fixas em templates com placeholders:
   │   │   {hotel_name}, {hotel_location}, {faixas_etarias_tabela},
   │   │   {lotacao_max_ap}, {primeira_mensagem}, {day_use_regra},
   │   │   {possessivos_regra}, {nao_fazer_extras}, {regras_exclusivas}
   │   ├─ Apresentar templates ao usuário para VALIDAÇÃO
   │   └─ INSERT em prompt_templates
   │
   └─ Se NÃO é o primeiro:
       ├─ SELECT templates existentes
       ├─ Comparar partes compartilhadas deste .js com templates existentes
       ├─ Se divergência → ALERTAR (pode ser melhoria ou inconsistência)
       └─ Não sobrescrever sem confirmação

5. RELATÓRIO FINAL
   ├─ hotel_config: inserido ✓ (listar campos)
   ├─ content_chunks: N chunks criados (listar com título e content_type)
   ├─ prompt_templates: criados/verificados ✓
   ├─ prompt_estatico: salvo ✓
   ├─ Pendências: X chunks com embedding_synced = false → executar ingestão
   └─ Próximos passos: "Dispare o workflow de ingestão para vetorizar os chunks"
```

**Output:**
- hotel_config populado
- N chunks em content_chunks
- Templates compartilhados (criados ou verificados)
- Prompt estático de fallback salvo
- Relatório completo com pendências

### 6.2 Chunk — `/prompt-julia chunk`

**Objetivo:** CRUD direto de chunks no Postgres. Atalho rápido para operações do dia a dia.

**Quando usar:** Adicionar promoção, atualizar FAQ, desativar conteúdo expirado, adicionar exemplo.

**Subcomandos:**

#### `/prompt-julia chunk add`

**Input:** hotel_slug + conteúdo + tipo

**Processo:**

```
1. RECEBER INPUT DO USUÁRIO
   ├─ Hotel: "park_hotel" (ou nome legível → skill resolve o slug)
   ├─ Tipo: promoção / FAQ / sazonalidade / exemplo / serviço / etc.
   ├─ Conteúdo: texto livre com as informações
   └─ Validade: (opcional) data início e fim para promoções

2. FORMATAR CHUNK
   ├─ Aplicar template: "[{hotel_name}] {título}\n\n{conteúdo}"
   ├─ Se tipo = exemplos_few_shot:
   │   ├─ Formatar com Think + Armazena + JSON (igual aos exemplos do prompt)
   │   ├─ Definir metadata.cenario
   │   └─ Usar decisões canônicas (bold título, JSON inline, etc.)
   ├─ Se tipo = promocoes:
   │   ├─ Incluir validade no metadata
   │   └─ Incluir condições, valores, público-alvo
   ├─ Validar: chunk é autocontido? Tamanho adequado (300-500 tokens para narrativo)?
   └─ Apresentar chunk formatado ao usuário para VALIDAÇÃO

3. INSERIR
   ├─ INSERT INTO rag.content_chunks (hotel_slug, content_type, section, title, content, metadata)
   ├─ embedding_synced = false
   └─ Executar via MCP

4. CONFIRMAR
   ├─ Mostrar: chunk_id, content_type, título, status
   └─ Lembrete: "Execute o workflow de ingestão para vetorizar"
```

#### `/prompt-julia chunk list`

**Input:** hotel_slug + (opcional) filtro por content_type

```sql
SELECT chunk_id, content_type, section, title,
       LENGTH(content) as chars, embedding_synced, ativo,
       metadata->>'cenario' as cenario,
       metadata->>'validade_fim' as expira
FROM rag.content_chunks
WHERE hotel_slug = '{slug}'
  AND ativo = true
ORDER BY content_type, title;
```

**Output:** Tabela formatada com todos os chunks do hotel.

#### `/prompt-julia chunk update`

**Input:** chunk_id (ou hotel_slug + título) + nova informação

```
1. Carregar chunk atual
2. Aplicar mudança
3. UPDATE content SET ..., embedding_synced = false, updated_at = NOW()
4. Mostrar diff (antes/depois)
5. Lembrete de ingestão
```

#### `/prompt-julia chunk deactivate`

**Input:** chunk_id (ou hotel_slug + título)

```sql
UPDATE rag.content_chunks
SET ativo = false, updated_at = NOW()
WHERE chunk_id = '{id}';

-- Nota: o Qdrant query filtra por ativo implicitamente via embedding_synced
-- O cron de cleanup removerá o ponto do Qdrant
```

#### `/prompt-julia chunk expire`

**Input:** hotel_slug (desativar chunks com validade vencida)

```sql
UPDATE rag.content_chunks
SET ativo = false, updated_at = NOW()
WHERE hotel_slug = '{slug}'
  AND metadata->>'validade_fim' IS NOT NULL
  AND (metadata->>'validade_fim')::date < CURRENT_DATE
  AND ativo = true
RETURNING chunk_id, title, metadata->>'validade_fim' as expirou_em;
```

### 6.3 Preview — `/prompt-julia preview`

**Objetivo:** Montar o prompt dinâmico como o n8n faria e mostrar o resultado completo.

**Quando usar:** Antes de ativar RAG para um hotel. Para verificar se o prompt montado está correto.

**Input:** hotel_slug + (opcional) mensagem simulada do cliente

**Processo:**

```
1. CARREGAR DADOS
   ├─ hotel_config do hotel
   ├─ prompt_templates (todos)
   └─ content_chunks ativos do hotel

2. SIMULAR assemblePrompt
   ├─ Substituir placeholders nos templates:
   │   {hotel_name} → config.hotel_name
   │   {hotel_location} → config.hotel_location
   │   {faixas_etarias_tabela} → renderizar tabela markdown do JSONB
   │   {lotacao_max_ap} → config.lotacao_max_ap
   │   {primeira_mensagem} → config.primeira_mensagem
   │   {day_use_regra} → renderizar conforme day_use_modo
   │   {possessivos_regra} → renderizar conforme possessivos_hotel
   │   {nao_fazer_extras} → renderizar array de proibições
   │   {regras_exclusivas} → renderizar JSONB como markdown
   │
   ├─ Injetar 4 exemplos core com placeholders do hotel
   │
   ├─ Se mensagem simulada fornecida:
   │   ├─ Buscar chunks mais relevantes (simular busca semântica)
   │   │   (sem embedding real — usar keyword matching como proxy)
   │   └─ Injetar chunks na seção <contexto_adicional>
   │
   └─ Se sem mensagem:
       └─ Injetar top-5 chunks por relevância genérica

3. OUTPUT
   ├─ Prompt montado completo (texto)
   ├─ Contagem de tokens estimada
   ├─ Lista de chunks que seriam injetados
   ├─ Comparação com prompt estático (se existir):
   │   ├─ Tokens: estático vs dinâmico
   │   ├─ Seções presentes/ausentes
   │   └─ Diferenças significativas
   └─ Avisos se algo parecer errado
```

**Nota sobre limitação:** O preview não faz embedding real (não tem acesso ao Qdrant). A simulação de busca semântica usa keyword matching como aproximação. O preview real com Qdrant requer testar direto no n8n.

### 6.4 Sync Status — `/prompt-julia sync-status`

**Objetivo:** Verificar se todos os chunks estão sincronizados entre Postgres e Qdrant.

**Input:** hotel_slug (ou "all" para todos)

**Queries:**

```sql
-- Chunks pendentes de vetorização
SELECT hotel_slug, COUNT(*) as pendentes
FROM rag.content_chunks
WHERE embedding_synced = false AND ativo = true
GROUP BY hotel_slug
ORDER BY pendentes DESC;

-- Chunks ativos por hotel e tipo
SELECT hotel_slug, content_type, COUNT(*) as total,
       SUM(CASE WHEN embedding_synced THEN 1 ELSE 0 END) as synced
FROM rag.content_chunks
WHERE ativo = true
GROUP BY hotel_slug, content_type
ORDER BY hotel_slug, content_type;

-- Último log de ingestão
SELECT hotel_slug, status, chunks_processed, chunks_embedded,
       chunks_failed, started_at, finished_at
FROM rag.ingest_log
ORDER BY started_at DESC
LIMIT 10;
```

**Output:**
- Tabela de status por hotel (total chunks, synced, pendentes)
- Último log de ingestão
- Alertas se houver chunks pendentes há mais de 24h
- Alertas se houver chunks com validade vencida e ativo = true

---

## 7. Detecção Automática de Contexto (Estático vs RAG)

### Lógica de detecção

A skill precisa saber se deve operar no modo estático (arquivo .js) ou RAG (Postgres). A detecção segue esta cascata:

```
1. ARGUMENTO EXPLÍCITO
   ├─ Caminho para .js (ex: "prompts/julia/park_hotel.js") → ESTÁTICO
   ├─ hotel_slug (ex: "park_hotel") → verificar Postgres
   └─ Nome legível (ex: "Termas Park Hotel") → resolver slug → verificar Postgres

2. VERIFICAR POSTGRES (se MCP disponível)
   ├─ SELECT ativo FROM rag.hotel_config WHERE hotel_slug = '{slug}'
   │   ├─ Registro existe E ativo = true → MODO RAG
   │   ├─ Registro existe E ativo = false → MODO ESTÁTICO (hotel desativado no RAG)
   │   └─ Registro não existe → MODO ESTÁTICO (hotel ainda não migrado)
   │
   └─ Se MCP não disponível:
       └─ MODO ESTÁTICO (fallback)

3. FLAG DE OVERRIDE (futuro)
   └─ Usuário pode forçar modo: "/prompt-julia review --static park_hotel"
       ou "/prompt-julia review --rag park_hotel"
```

### Mensagens de contexto

Quando a skill detecta o modo, informar ao usuário:

```
[RAG] Hotel "park_hotel" encontrado no sistema RAG. Operando em modo RAG.
```

```
[ESTÁTICO] Hotel "park_hotel" não encontrado no RAG. Operando em modo estático (.js).
Dica: use "/prompt-julia migrate" para migrar este hotel para o RAG.
```

```
[ESTÁTICO] MCP Postgres não disponível. Operando em modo estático.
Dica: configure o MCP Postgres para habilitar o modo RAG (ver planejamento_update_rag_skill_prompt_julia.md, Seção 3).
```

---

## 8. Checklist de Revisão — Adaptação para RAG

O checklist existente (`references/review-checklist.md`) continua válido para o prompt montado. Checks adicionais específicos do RAG:

### Checks de hotel_config

| ID | Check | Severidade |
|----|-------|------------|
| RAG-CFG-01 | `faixas_etarias` JSONB tem pelo menos 3 faixas (cortesia, pagante, adulto)? Bebê (0-2) é universal, não precisa estar no JSONB | HIGH |
| RAG-CFG-02 | `adulto_min_idade` bate com a menor idade da faixa adulto no JSONB? | CRITICAL |
| RAG-CFG-03 | `primeira_mensagem` não está vazia? | CRITICAL |
| RAG-CFG-04 | `day_use_modo` é consistente com `day_use_mensagem`? (se send_and_handoff → mensagem obrigatória; se handoff_only → mensagem deve ser NULL) | HIGH |
| RAG-CFG-05 | `hotel_resort_code` bate com o código usado no n8n/Kommo? (consultar Anexo A do planejamento RAG) | CRITICAL |
| RAG-CFG-06 | `possessivos_hotel` é false para todos exceto Termas Park? | MEDIUM |
| RAG-CFG-07 | `prompt_estatico` está preenchido e é um prompt funcional? | HIGH |
| RAG-CFG-08 | `regras_exclusivas` contém apenas regras deste hotel? (não copiadas do gold standard) | HIGH |
| RAG-CFG-09 | `lotacao_max_ap` bate com a ficha do hotel? | CRITICAL |
| RAG-CFG-10 | `regime_hospedagem` é um dos valores aceitos? ("pensao_completa", "all_inclusive", "meia_pensao") | HIGH |

### Checks de content_chunks

| ID | Check | Severidade |
|----|-------|------------|
| RAG-CHK-01 | Hotel tem pelo menos 1 chunk de `descricao_hotel`? | HIGH |
| RAG-CHK-02 | Todos os chunks seguem template "[{hotel_name}] {título}\n\n{conteúdo}"? | MEDIUM |
| RAG-CHK-03 | Chunks de `exemplos_few_shot` têm Think + Armazena + JSON? | CRITICAL |
| RAG-CHK-04 | Chunks de `exemplos_few_shot` têm `metadata.cenario` definido? | HIGH |
| RAG-CHK-05 | Nenhum chunk excede 500 tokens (narrativo) ou 1000 tokens (exemplo/tabela)? | MEDIUM |
| RAG-CHK-06 | Chunks de `promocoes` com validade têm `metadata.validade_inicio` e `metadata.validade_fim`? | HIGH |
| RAG-CHK-07 | Não existem chunks duplicados (mesmo título + mesmo hotel_slug + ativo)? | MEDIUM |
| RAG-CHK-08 | Todos os chunks ativos têm `embedding_synced = true`? | HIGH |
| RAG-CHK-09 | Chunks de exemplos few-shot seguem decisões canônicas (bold título, JSON inline, etc.)? | MEDIUM |
| RAG-CHK-10 | Chunks são autocontidos? (contêm contexto suficiente para serem entendidos isoladamente) | HIGH |

### Checks de prompt_templates

| ID | Check | Severidade |
|----|-------|------------|
| RAG-TPL-01 | Todos os 11 templates esperados existem? (header, rules_1_to_3, rule_4_template, rules_5_to_7, idioma, conversation_flow, descontos, validacoes, tom_estilo, nao_fazer_base, schema_saida, exemplos_core) | CRITICAL |
| RAG-TPL-02 | Templates contêm os placeholders esperados? ({hotel_name}, {hotel_location}, etc.) | CRITICAL |
| RAG-TPL-03 | Wording condicional está preservado nos templates? ("Se crianças com idades **informadas**" etc.) | CRITICAL |
| RAG-TPL-04 | NÃO FAZER base tem bullets separados (nunca `\|` na mesma linha)? | HIGH |
| RAG-TPL-05 | Exemplos core têm placeholder {faixa_adulto_min} no exemplo de tarifa adulto? | CRITICAL |
| RAG-TPL-06 | Regras #1-#7 estão presentes, numeradas, com emoji 🚨? | HIGH |

### Checks de prompt montado

| ID | Check | Severidade |
|----|-------|------------|
| RAG-MTD-01 | Prompt montado tem as 19 seções na ordem correta? | HIGH |
| RAG-MTD-02 | Nenhum placeholder não-substituído no prompt montado? (buscar por `{` + `}`) | CRITICAL |
| RAG-MTD-03 | Token count estimado está entre 5.000 e 7.000? (<5.000 = faltando conteúdo; >7.000 = muitos chunks) | MEDIUM |
| RAG-MTD-04 | Seção `<contexto_adicional>` está delimitada com tags? | HIGH |
| RAG-MTD-05 | 4 exemplos core estão presentes com dados do hotel? | CRITICAL |
| RAG-MTD-06 | Prompt montado vs prompt estático: diferenças são apenas de formato, não de conteúdo? | HIGH |

---

## 9. Templates e Estruturas de Referência

### 9.1 Template de chunk — exemplos_few_shot

```markdown
[{hotel_name}] Exemplo: {cenário}

**Cenário — {título do cenário}**
Cliente: "{mensagem do cliente}"
Think: {raciocínio passo a passo com dados do hotel}
Armazena: Resumo_IA = "{resumo em 1 linha}"
{"message":"{resposta}","etapa":"{etapa}","tipo_servico":"{tipo}",...}<<FIM>>
```

**Regras para exemplos few-shot em chunks:**
- Cada exemplo deve ser **completo** (Think + Armazena + JSON)
- Usar dados REAIS do hotel (nome, faixas, primeira mensagem)
- JSON inline (sem indentação) — economia de tokens
- metadata.cenario deve ser uma das categorias: "day_use", "multi_ap", "informativo", "grupo", "edge_case", "sazonalidade", "promocao"

### 9.2 Template de chunk — descricao_hotel

```markdown
[{hotel_name}] Visão geral

O {hotel_name} fica em {localização}. {destaques principais}.
{Regime}: {detalhes do regime}.
Check-in {horário}, checkout {horário}.
```

### 9.3 Template de chunk — promocoes

```markdown
[{hotel_name}] Promoção: {nome da promoção}

{Detalhes da promoção: condições, valores, público-alvo, o que inclui.}
Válido de {data_inicio} a {data_fim}.
{Condições especiais se houver.}
```

Metadata obrigatório:
```json
{
  "validade_inicio": "YYYY-MM-DD",
  "validade_fim": "YYYY-MM-DD",
  "temporada": "pascoa_2026"
}
```

### 9.4 Template de chunk — faq

```markdown
[{hotel_name}] FAQ: {pergunta resumida}

{Resposta completa e autocontida. Incluir detalhes suficientes para a Julia
responder sem precisar de outro contexto.}
```

### 9.5 Estrutura JSONB de faixas_etarias

```json
[
  {"faixa": "cortesia", "min": 3, "max": 8, "categoria": "cortesia"},
  {"faixa": "pagante", "min": 9, "max": 12, "categoria": "tarifa_crianca"},
  {"faixa": "adulto", "min": 13, "max": null, "categoria": "tarifa_adulto"}
]
```

**Variações por hotel:**
- **3 faixas** (Cabanas): cortesia 3-12, adulto 13+ (sem pagante separado)
- **4 faixas** (maioria): cortesia, pagante, adulto
- **5 faixas** (Águas de Palmas): cortesia, pagante, jovem 13-15, adulto 16+

**Nota:** Bebê (0-2) é universal e NÃO entra no JSONB. É tratado no template compartilhado.

### 9.6 Estrutura JSONB de regras_exclusivas

```json
{
  "fisico4_otimizacao": true,
  "fisico4_descricao": "Se físico=4 em AP único → cotar como 4 adultos independente da composição",
  "cortesia_omissao": false,
  "cortesia_omissao_descricao": null,
  "max_cortesias_ap": null,
  "iss_incluso": null,
  "pix_desconto": null
}
```

O Code node do n8n renderiza cada regra ativa como texto markdown na Regra #4 ou nos Casos Especiais do prompt.

---

## 10. Gestão de Conteúdo via Skill (Operações Postgres)

### Operações frequentes e SQL correspondente

A skill deve saber gerar e executar (via MCP) estes SQLs para operações comuns:

#### Adicionar promoção

```sql
INSERT INTO rag.content_chunks (hotel_slug, content_type, title, content, metadata)
VALUES (
  '{hotel_slug}',
  'promocoes',
  'Promoção {nome}',
  '[{hotel_name}] Promoção {nome}

{detalhes completos da promoção}
Válido de {data_inicio} a {data_fim}.',
  '{"validade_inicio": "{YYYY-MM-DD}", "validade_fim": "{YYYY-MM-DD}", "temporada": "{tag}"}'
);
```

#### Adicionar FAQ

```sql
INSERT INTO rag.content_chunks (hotel_slug, content_type, title, content, metadata)
VALUES (
  '{hotel_slug}',
  'faq',
  'FAQ: {pergunta resumida}',
  '[{hotel_name}] FAQ: {pergunta resumida}

{resposta completa e autocontida}',
  '{}'
);
```

#### Atualizar faixa etária

```sql
UPDATE rag.hotel_config
SET faixas_etarias = '{novo JSONB}',
    adulto_min_idade = {nova idade},
    updated_at = NOW()
WHERE hotel_slug = '{slug}';

-- Nota: também precisa atualizar o prompt_estatico e os exemplos que referenciam faixas
```

#### Desativar promoção expirada

```sql
UPDATE rag.content_chunks
SET ativo = false, updated_at = NOW()
WHERE hotel_slug = '{slug}'
  AND content_type = 'promocoes'
  AND metadata->>'validade_fim' IS NOT NULL
  AND (metadata->>'validade_fim')::date < CURRENT_DATE
  AND ativo = true;
```

#### Ver todo conteúdo de um hotel

```sql
SELECT chunk_id, content_type, title,
       LENGTH(content) as chars,
       embedding_synced as synced,
       metadata->>'validade_fim' as expira
FROM rag.content_chunks
WHERE hotel_slug = '{slug}' AND ativo = true
ORDER BY content_type, title;
```

#### Forçar re-vetorização de um chunk

```sql
UPDATE rag.content_chunks
SET embedding_synced = false, updated_at = NOW()
WHERE chunk_id = '{uuid}';
```

#### Ver configuração de um hotel

```sql
SELECT hotel_slug, hotel_name, hotel_location,
       regime_hospedagem, faixas_etarias,
       adulto_min_idade, lotacao_max_ap,
       day_use_modo, possessivos_hotel,
       regras_exclusivas, nao_fazer_extras,
       ativo, updated_at
FROM rag.hotel_config
WHERE hotel_slug = '{slug}';
```

### Regra de segurança para operações Postgres

A skill SEMPRE deve:

1. **Mostrar o SQL ao usuário antes de executar** (exceto SELECTs simples)
2. **Pedir confirmação para UPDATE/DELETE** em hotel_config ou prompt_templates
3. **Nunca executar DROP, TRUNCATE ou DELETE sem WHERE** — usar `SET ativo = false` para "deletar"
4. **Alertar quando mudança em prompt_templates afeta todos os hotéis**
5. **Após qualquer mudança em content_chunks**: lembrar de executar ingestão
6. **Após qualquer mudança em hotel_config**: lembrar de invalidar cache Redis

---

## 11. Mapeamento Ficha → hotel_config + content_chunks

### Campos da Ficha (Bloco 1) → hotel_config

| Campo da Ficha | Coluna hotel_config | Transformação |
|----------------|---------------------|---------------|
| `nome_hotel` | `hotel_name` | Direto |
| `localizacao` | `hotel_location` | Direto |
| — | `hotel_slug` | Derivar do nome (snake_case, sem acentos) |
| — | `hotel_resort_code` | Consultar mapeamento n8n/Kommo (Anexo A do planejamento RAG) |
| `regime_hospedagem` | `regime_hospedagem` | Normalizar: "pensão completa" → "pensao_completa" |
| — | `regime_descricao` | Gerar descrição curta do regime |
| `cortesia_hospedagem` + `pagante_hospedagem` + `adulto_hospedagem` | `faixas_etarias` | Gerar JSONB (ver seção 9.5) |
| `adulto_hospedagem` | `adulto_min_idade` | Extrair menor idade da faixa adulto |
| `lotacao_maxima_ap` | `lotacao_max_ap` | Direto (INT) |
| `checkin` | `checkin` | Direto |
| `checkout` | `checkout` | Direto |
| `pagamento_hospedagem` | `pagamento` | Direto |
| `mensagem_dayuse` | `day_use_mensagem` + `day_use_modo` | Se vazio → modo "handoff_only", msg NULL. Se preenchido → modo "send_and_handoff", msg = valor |
| `casos_especiais` | `regras_exclusivas` | Parsear → JSONB (ver seção 9.6) |
| `terminologia` | `terminologia` | Parsear → JSONB {"usar": [...], "nunca_usar": [...]} |
| — | `possessivos_hotel` | false para todos exceto Termas Park |
| `primeira_mensagem` | `primeira_mensagem` | Direto |
| — | `nao_fazer_extras` | Extrair do prompt (NÃO FAZER hotel-específicos) → TEXT[] |

### Campos da Ficha → content_chunks

| Campo da Ficha | content_type | Notas |
|----------------|-------------|-------|
| `destaques` + `localizacao` + `regime_hospedagem` | `descricao_hotel` | Chunk de visão geral |
| `tipos_quarto` + `lotacao_maxima_ap` | `quartos` | 1-2 chunks dependendo da variedade |
| `regime_hospedagem` + `regime_bebidas` + `refeicoes_detalhadas` | `regime_refeicoes` | Chunk de regime e refeições |
| `recreacao_inclusa` + `outras_estruturas` | `lazer_recreacao` | 1 ou mais chunks |
| `checkin` + `checkout` + `pagamento_hospedagem` | `politicas` | Chunk de políticas |
| `mensagem_dayuse` (se preenchido) | `day_use` | Chunk com mensagem e condições |
| `servicos_terceirizados` | `servicos_extras` | Chunk (se preenchido) |
| `atracoes_especificas` + `parque_externo` + `mascotes` | `atracoes_especificas` | 1 ou mais chunks (se preenchidos) |
| — | `exemplos_few_shot` | Exemplos adicionais (além dos 4 core) |

---

## 12. Riscos e Mitigações

### Riscos da evolução da skill

| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| MCP Postgres indisponível | Skill não consegue operar no modo RAG | Fallback para modo estático. Skill sempre gera SQL completo que pode ser executado manualmente |
| Migração perde conteúdo do .js | Hotel fica com prompt incompleto no RAG | Processo de migração tem VALIDAÇÃO pelo usuário em cada etapa. Prompt estático salvo como fallback |
| Template compartilhado editado errado | Todos os hotéis afetados | Skill alerta "afeta todos os hotéis" + pede confirmação. Versionamento na tabela. Testar com 1 hotel primeiro |
| Chunks mal formatados | RAG retorna conteúdo que confunde o modelo | Review checklist verifica formato. Templates de chunk padronizados |
| Wording condicional perdido na conversão .js → templates | Julia faz perguntas proativas sobre crianças (bug crítico) | Checklist RAG-TPL-03 verifica wording condicional. Critical pattern #1 continua monitorado |
| Skill tenta operar em modo RAG antes da infra estar pronta | Erros de conexão, tabelas inexistentes | Detecção de contexto (seção 7) verifica se Postgres/tabelas existem antes de operar |
| Chunks de exemplo com cenário errado no metadata | RAG retorna exemplo de day use em conversa de hospedagem | Checklist RAG-CHK-04 verifica metadata.cenario |
| Usuário esquece de disparar ingestão após mudanças | Chunks ficam no Postgres mas não no Qdrant | Skill SEMPRE lembra ao final de operações de escrita. sync-status permite verificar |

### Riscos de processo

| Risco | Mitigação |
|-------|-----------|
| Dois modos paralelos (estático + RAG) durante transição gera confusão | Skill detecta automaticamente e informa o modo. Prompt estático mantido como fallback |
| Skill cresce demais em tamanho (tokens) | Modos RAG adicionam instruções mas não duplicam as diretrizes. Uso de referências externas (este documento) para detalhes |
| Curva de aprendizado dos novos modos | Nomes intuitivos (chunk, preview, sync-status). Cada modo tem ajuda inline |

---

## 13. Roadmap de Implementação da Skill

### Fase A — Documentação e Preparação (imediato)

- [x] Criar este documento de planejamento
- [ ] Revisar planejamento (Igor)
- [ ] Após aprovação: adicionar referência a este documento no skill.md
- [ ] Adicionar seção de "Modos Futuros (RAG)" no skill.md com descrições breves
- [ ] Adicionar lógica de detecção de contexto (seção 7) como documentação no skill.md

### Fase B — Modos de Migração (quando infra RAG estiver pronta)

**Pré-requisitos:** Schema `rag` criado, tabelas existentes, MCP configurado.

- [ ] Implementar modo `migrate` no skill.md
- [ ] Implementar modo `chunk` (add, list, update, deactivate, expire)
- [ ] Implementar modo `sync-status`
- [ ] Testar migração com gold standard (Hotel Internacional)
- [ ] Testar migração com Termas Park (produção)
- [ ] Migrar os demais 10 hotéis

### Fase C — Modos Operacionais RAG (quando montagem dinâmica funcionar)

**Pré-requisitos:** assemblePrompt funcional, pelo menos 1 hotel ativo no RAG.

- [ ] Implementar modo `preview`
- [ ] Adaptar modo `create` para RAG (processo completo com hotel_config + chunks)
- [ ] Adaptar modo `review` para RAG (montar prompt + auditar)
- [ ] Adaptar modo `update` para RAG (identificar camada + atualizar Postgres)
- [ ] Adaptar modo `correct` para RAG (diagnóstico por camada)
- [ ] Adicionar checks RAG ao checklist de revisão (`references/review-checklist.md`)
- [ ] Testar review completo com Termas Park (produção)

### Fase D — Consolidação

- [ ] Adicionar atalhos para operações frequentes
- [ ] Modo estático passa a ser "legacy" (com aviso)
- [ ] Avaliar necessidade de integração com webhook n8n (disparar ingestão automaticamente)
- [ ] Documentar processo de gestão de conteúdo para equipe

---

> **Próximos passos:** Este documento deve ser revisado pelo Igor. Após aprovação, a Fase A pode ser executada imediatamente (adicionar referências e documentação no skill.md). As Fases B-D dependem do progresso do roadmap RAG principal (planejamento_RAG.md).
