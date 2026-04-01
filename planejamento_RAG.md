# Planejamento RAG — Central de Reservas L&M (Jul.IA)

> **Autor:** Igor + Claude Code (planejamento)
> **Data:** 01/04/2026
> **Status:** Planejamento — aguardando revisão antes da implementação
> **Objetivo:** Reduzir custo e tokens por chamada, permitir crescimento de conteúdo (promoções, FAQ, sazonalidade) sem inflar os prompts, e centralizar a gestão de conteúdo dos hotéis.

---

## Sumário

1. [Diagnóstico Atual](#1-diagnóstico-atual)
2. [Arquitetura Proposta](#2-arquitetura-proposta)
3. [Stack e Infraestrutura](#3-stack-e-infraestrutura)
4. [Estratégia de Chunking](#4-estratégia-de-chunking)
5. [Schema Postgres](#5-schema-postgres)
6. [Qdrant — Coleção e Indexação](#6-qdrant--coleção-e-indexação)
7. [Montagem Dinâmica do Prompt](#7-montagem-dinâmica-do-prompt)
8. [Fluxos n8n — Ingestão e Consulta](#8-fluxos-n8n--ingestão-e-consulta)
9. [Docker — Qdrant na VPS](#9-docker--qdrant-na-vps)
10. [Gestão de Conteúdo](#10-gestão-de-conteúdo)
11. [Rollback e Segurança](#11-rollback-e-segurança)
12. [Estimativas de Custo e Performance](#12-estimativas-de-custo-e-performance)
13. [Roadmap de Implementação](#13-roadmap-de-implementação)
14. [Gaps e Riscos Identificados](#14-gaps-e-riscos-identificados)

---

## 1. Diagnóstico Atual

### 1.1 Números reais dos prompts

Análise feita nos 12 prompts em `prompts/julia/`. Exemplo real de execução:

```
promptTokens:  9.855
completionTokens: 151
totalTokens: 10.006
```

Os prompts têm entre **24KB e 33KB** cada (~6.000-8.500 tokens). A skill mira ~5.000 tokens, mas na prática a maioria fica acima disso.

### 1.2 Onde os tokens estão sendo gastos

Análise detalhada do gold standard (`hotel_internacional_gravatal.js`, 30.717 chars):

| #   | Seção                             | Chars      | % do Total | Tipo                           | Pode ir pro RAG?                     |
| --- | --------------------------------- | ---------- | ---------- | ------------------------------ | ------------------------------------ |
| 1   | Header (identidade)               | 334        | 1,1%       | Hotel-específico               | NÃO — identidade obrigatória         |
| 2   | Regra #1 — Formato saída          | 118        | 0,4%       | Compartilhado                  | NÃO — regra crítica                  |
| 3   | Regra #2 — Tools (Think/Armazena) | 782        | 2,5%       | Compartilhado                  | NÃO — framework de raciocínio        |
| 4   | Regra #3 — Uma pergunta           | 215        | 0,7%       | Compartilhado                  | NÃO — regra crítica                  |
| 5   | Regra #4 — Categorização idade    | 2.330      | 7,6%       | Hotel-específico               | NÃO — governa toda cotação           |
| 6   | Regra #5 — Cotação direta         | 170        | 0,6%       | Compartilhado                  | NÃO — regra crítica                  |
| 7   | Regra #6 — Segurança              | 117        | 0,4%       | Compartilhado                  | NÃO — segurança obrigatória          |
| 8   | Regra #7 — Respostas curtas       | 395        | 1,3%       | Compartilhado                  | NÃO — regra crítica                  |
| 9   | Idioma                            | 44         | 0,1%       | Compartilhado                  | NÃO — trivial                        |
| 10  | Primeira mensagem                 | 496        | 1,6%       | Hotel-específico               | NÃO — usada no 1º turno              |
| 11  | **Contexto do hotel**             | **2.770**  | **9,0%**   | Hotel-específico               | **SIM — candidato RAG**              |
| 12  | Condução da conversa              | 2.528      | 8,2%       | Compartilhado                  | NÃO — orquestração core              |
| 13  | Descontos                         | 375        | 1,2%       | Compartilhado                  | NÃO — tamanho trivial                |
| 14  | **Casos especiais**               | **987**    | **3,2%**   | Hotel-específico               | **SIM — candidato RAG**              |
| 15  | Validações                        | 581        | 1,9%       | Compartilhado                  | NÃO — tabela de referência           |
| 16  | Tom e estilo                      | 204        | 0,7%       | Compartilhado                  | NÃO — tamanho trivial                |
| 17  | **Limitações (NÃO FAZER)**        | **3.030**  | **9,9%**   | Majoritariamente compartilhado | **PARCIAL — parte hotel-específica** |
| 18  | Schema de saída                   | 1.074      | 3,5%       | Compartilhado                  | NÃO — contrato de saída              |
| 19  | **EXEMPLOS**                      | **14.167** | **46,1%**  | Hotel-específico               | **SIM — principal candidato RAG**    |

### 1.3 Conclusão do diagnóstico

**A seção de exemplos consome 46% do prompt.** Junto com contexto do hotel (9%) e casos especiais (3,2%), temos **~58% do prompt** que é candidato a otimização via RAG.

O core fixo (regras #1-#7, fluxo de conversa, schema, validações, tom) ocupa ~42% e **precisa estar sempre presente** — o GPT-4.1 mini é literal e depende dessa estrutura para funcionar corretamente.

### 1.4 O que o RAG resolve

| Problema atual                                  | Solução com RAG                                            |
| ----------------------------------------------- | ---------------------------------------------------------- |
| Prompts com ~10K tokens e crescendo             | Prompt base ~5.000-6.000 tokens + contexto RAG sob demanda |
| Impossível adicionar promoções/FAQ sem inflar   | Conteúdo novo vai pro Qdrant, injetado só quando relevante |
| Atualizar info de hotel = editar JS manualmente | Atualizar no Postgres → re-vetorizar automaticamente       |
| Mesmo contexto enviado em toda mensagem         | Contexto relevante selecionado por semântica da pergunta   |
| 12 prompts com 80%+ de conteúdo duplicado       | Template único + config por hotel + conteúdo dinâmico      |

---

## 2. Arquitetura Proposta

### 2.1 Visão geral

```
┌─────────────────────────────────────────────────────────────────┐
│                        FLUXO DE CONSULTA                        │
│                                                                 │
│  Cliente (WhatsApp)                                             │
│       │                                                         │
│       ▼                                                         │
│  Kommo → n8n handler                                            │
│       │                                                         │
│       ▼                                                         │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ n8n backend (NOVO fluxo RAG)                            │    │
│  │                                                         │    │
│  │  1. Recebe mensagem + hotel_slug + etapa                │    │
│  │  2. Busca hotel_config no Postgres (config estruturada) │    │
│  │  3. Embed mensagem via OpenAI text-embedding-3-small    │    │
│  │  4. Query Qdrant (vetor + filtro hotel_slug)            │    │
│  │  5. Monta prompt: TEMPLATE + CONFIG + CHUNKS RAG        │    │
│  │  6. Chama GPT-4.1 mini com prompt montado               │    │
│  │  7. Processa resposta normalmente (cotação, handoff...)  │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                       FLUXO DE INGESTÃO                         │
│                                                                 │
│  Claude Code + MCP Postgres (Igor/equipe)                       │
│       │                                                         │
│       ▼                                                         │
│  Postgres (rag.content_chunks) ← source of truth                │
│       │                                                         │
│       ▼                                                         │
│  n8n workflow de ingestão (trigger: manual ou webhook)           │
│       │                                                         │
│       ├── Embed via OpenAI text-embedding-3-small               │
│       │                                                         │
│       └── Upsert no Qdrant (vetor + payload + metadados)        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Três camadas do prompt

O prompt que chega ao GPT-4.1 mini é montado em tempo real a partir de 3 camadas:

```
┌─────────────────────────────────────────────────────┐
│  CAMADA 1 — TEMPLATE CORE (sempre presente)         │
│  ~3.500-4.000 tokens                                │
│                                                     │
│  • Header com {hotel_name} e {hotel_location}       │
│  • Regras #1-#7 (shared, com placeholders)          │
│  • Idioma                                           │
│  • Primeira mensagem do hotel                       │
│  • Condução da conversa                             │
│  • Descontos                                        │
│  • Validações                                       │
│  • Tom e estilo                                     │
│  • NÃO FAZER (parte compartilhada)                  │
│  • Schema de saída                                  │
│  • 4 exemplos CORE obrigatórios                     │
│    (saudação, cotação básica, handoff, tarifa-adulto)│
└─────────────────────────────────────────────────────┘
           +
┌─────────────────────────────────────────────────────┐
│  CAMADA 2 — CONFIG DO HOTEL (sempre presente)       │
│  ~500-800 tokens                                    │
│  Fonte: Postgres (rag.hotel_config)                 │
│                                                     │
│  • Faixas etárias (cortesia, pagante, adulto)       │
│  • Lotação máxima por AP                            │
│  • Regime (pensão completa / all inclusive)          │
│  • Regras de negócio exclusivas                     │
│    (físico=4, omissão cortesia, etc.)               │
│  • Day use (mensagem padrão, se houver)             │
│  • Terminologia protegida                           │
│  • NÃO FAZER hotel-específicos                      │
│  • Possessivos (permitidos ou proibidos)            │
└─────────────────────────────────────────────────────┘
           +
┌─────────────────────────────────────────────────────┐
│  CAMADA 3 — CONTEXTO RAG (dinâmico por mensagem)    │
│  ~1.000-2.000 tokens                                │
│  Fonte: Qdrant (busca semântica)                    │
│                                                     │
│  • Detalhes do hotel (estrutura, lazer, serviços)   │
│  • Promoções vigentes                               │
│  • FAQ específico                                   │
│  • Info sazonal                                     │
│  • Exemplos adicionais relevantes à etapa           │
│  • Casos especiais ativados pela mensagem           │
└─────────────────────────────────────────────────────┘
```

**Resultado estimado por chamada:** ~5.000-6.800 tokens (vs ~9.855 atual)

### 2.3 Decisão sobre exemplos (few-shot) — CRÍTICO

Os exemplos são o **calibrador primário** do GPT-4.1 mini. A estratégia é:

**4 exemplos CORE — sempre presentes no template (Camada 1):**

1. **Saudação** ("Oi") → primeira mensagem padrão do hotel
2. **Cotação básica** (N pessoas sem idades → todos adultos → cotação direta) — **obrigatório** porque calibra o "não perguntar sobre crianças"
3. **Handoff** (cliente pede atendente → handoff_only)
4. **Tarifa adulto** ("casal e criança de 13") → adultos:2, criancas:1, idades_criancas:[13] — **obrigatório** porque evita o erro crítico de jogar criança-com-tarifa-adulto no campo adultos

**Exemplos adicionais — carregados via RAG (Camada 3) quando relevantes:**

- Exemplo de **day use** → carregado quando mensagem contém "day use", "passar o dia", "diária avulsa"
- Exemplo de **múltiplos APs** → carregado quando mensagem contém referência a divisão de quartos ou >5 pessoas
- Exemplo de **informativo** (pergunta sobre hotel) → carregado quando etapa = informativo ou mensagem é pergunta sobre facilidades
- Exemplo de **grupo/excursão** → carregado quando mensagem menciona grupo, excursão, ônibus
- Exemplos de **edge cases hotel-específicos** → carregados conforme relevância

**Por que essa divisão funciona:**

- Os 4 exemplos core cobrem os cenários mais frequentes e os edge cases mais perigosos
- Exemplos adicionais são injetados por semântica — se o cliente perguntou de day use, o exemplo de day use aparece
- O GPT-4.1 mini recebe exemplos RELEVANTES ao contexto da conversa, não todos de uma vez
- Economia estimada: ~8.000-10.000 chars (~2.500-3.000 tokens) por chamada

**Risco mitigado:** se o RAG falhar em recuperar um exemplo relevante, os 4 core garantem o comportamento básico correto. O fallback é um prompt funcional, só menos calibrado para cenários específicos.

---

## 3. Stack e Infraestrutura

### 3.1 Stack definida

| Componente    | Tecnologia                         | Função                                 |
| ------------- | ---------------------------------- | -------------------------------------- |
| Vector DB     | **Qdrant** (self-hosted, Docker)   | Armazenamento e busca vetorial         |
| Embeddings    | **OpenAI text-embedding-3-small**  | Vetorização de chunks (1536 dimensões) |
| LLM           | **GPT-4.1 mini**                   | Geração de respostas (já em uso)       |
| DB relacional | **Postgres** (já instalado na VPS) | Source of truth + config de hotéis     |
| Orquestração  | **n8n** (já instalado na VPS)      | Fluxos de ingestão e consulta          |
| Gestão        | **Claude Code + MCP Postgres**     | Interface de atualização de conteúdo   |
| Cache         | **Redis** (já instalado)           | Cache de sessão e leads (já em uso)    |

### 3.2 Requisitos de infra

O Qdrant é extremamente leve para nosso volume:

| Métrica                         | Valor                                 |
| ------------------------------- | ------------------------------------- |
| Vetores estimados               | 600-2.400 (12 hotéis × 50-200 chunks) |
| Dimensões por vetor             | 1.536 (text-embedding-3-small)        |
| RAM necessária                  | **< 25 MB**                           |
| Disco necessário                | **< 50 MB**                           |
| Docker memory limit recomendado | **512 MB** (sobra enorme)             |

---

## 4. Estratégia de Chunking

### 4.1 Tipos de chunk

O conteúdo dos hotéis se divide em dois tipos que precisam de tratamento diferente:

#### Tipo A — Conteúdo estruturado (tabelas, listas, regras)

- Faixas etárias, tarifas, horários, check-in/out, regras de negócio
- **Estratégia:** manter como unidade atômica — NUNCA quebrar uma tabela entre chunks
- **Tamanho:** variável, respeitar a unidade lógica

#### Tipo B — Conteúdo narrativo (descrições, FAQ, promoções)

- Descrição do hotel, facilidades, atividades, FAQ, promoções
- **Estratégia:** chunking semântico com overlap
- **Tamanho alvo:** 300-500 tokens por chunk
- **Overlap:** 50-100 tokens entre chunks adjacentes

### 4.2 Categorias de conteúdo (content_type)

Cada chunk recebe uma categoria que permite filtro fino no Qdrant:

| content_type           | Descrição                                   | Exemplo                                                            | Estimativa chunks/hotel |
| ---------------------- | ------------------------------------------- | ------------------------------------------------------------------ | ----------------------- |
| `descricao_hotel`      | Visão geral, localização, destaques         | "O Termas Park Hotel fica em Gravatal/SC, com piscinas termais..." | 2-4                     |
| `quartos`              | Tipos de quarto, capacidade, amenidades     | "Suíte Standard: até 5 pessoas, ar-condicionado, TV..."            | 3-6                     |
| `regime_refeicoes`     | Regime, refeições, horários, bebidas        | "Pensão completa: café 7h-10h, almoço 12h-14h..."                  | 2-4                     |
| `lazer_recreacao`      | Atividades, recreação, piscinas, spa        | "Recreação infantil das 9h às 12h e 14h às 17h..."                 | 3-8                     |
| `politicas`            | Cancelamento, pagamento, check-in/out, pets | "Check-in a partir das 14h, checkout até 12h..."                   | 3-6                     |
| `day_use`              | Info de day use, valores, horários          | "Day use disponível: R$280/pessoa, inclui almoço..."               | 1-2                     |
| `promocoes`            | Promoções sazonais, pacotes especiais       | "Pacote Páscoa 2026: 3 diárias pelo preço de 2..."                 | 2-10                    |
| `faq`                  | Perguntas frequentes                        | "O hotel aceita pets? Sim, cães de pequeno porte..."               | 5-15                    |
| `sazonalidade`         | Temporadas, fechamentos, eventos            | "Parque Aquático: funciona de terça a domingo, fecha jun-jul"      | 2-5                     |
| `exemplos_few_shot`    | Exemplos de fluxo completo (Think+JSON)     | Exemplo de day use, multi-AP, informativo, etc.                    | 4-8                     |
| `servicos_extras`      | Serviços terceirizados, transfer, SPA       | "SPA terceirizado, agendar com antecedência..."                    | 1-4                     |
| `atracoes_especificas` | Atrações internas, parques, mascotes        | "Vale do Dinossauro: atração INTERNA com réplicas..."              | 1-4                     |

**Estimativa total: 30-80 chunks por hotel / 360-960 vetores no total**

### 4.3 Template de chunk

Cada chunk deve ser **autocontido** — contém contexto suficiente para ser entendido isoladamente:

```
[{hotel_name}] {section_title}

{content}
```

Exemplo:

```
[Termas Park Hotel] Área de lazer e piscinas

O hotel conta com 3 piscinas termais aquecidas (34°C a 38°C),
funcionando das 7h às 22h. Piscina infantil com profundidade
máxima de 40cm. Toboágua disponível para hóspedes.
Sauna seca e úmida. Sala de jogos com sinuca e ping-pong.
```

### 4.4 Chunks de exemplos (few-shot)

Os exemplos adicionais (além dos 4 core) são chunkados individualmente para recuperação seletiva:

```
[Hotel Internacional Gravatal] Exemplo: Day use

**Cenário — Day use**
Cliente: "Quanto custa o day use pra sábado?"
Think: Tipo de serviço = day use. Hotel tem mensagem padrão de day use.
Enviar mensagem EXATA e fazer send_and_handoff. NÃO coletar dados.
Armazena: Resumo_IA = "Interesse em day use, mensagem padrão enviada"
{"message":"[mensagem de day use verbatim]","etapa":"identificacao_servico",
"tipo_servico":"day_use","handoff":"send_and_handoff",...}<<FIM>>
```

Cada exemplo vira um chunk com `content_type: "exemplos_few_shot"` e metadados adicionais (`cenario: "day_use"`, `cenario: "multi_ap"`, etc.) para recuperação precisa.

---

## 5. Schema Postgres

### 5.1 Novo schema: `rag`

Criar um schema separado para não misturar com o `crm` existente.

```sql
CREATE SCHEMA IF NOT EXISTS rag;
```

### 5.2 Tabela: `rag.hotel_config`

Configuração estruturada por hotel. Dados que vão na **Camada 2** do prompt (sempre presentes). Substitui o hardcoding de regras no .js.

```sql
CREATE TABLE rag.hotel_config (
    hotel_slug          TEXT PRIMARY KEY,           -- ex: "park_hotel", "hotel_internacional"
    hotel_resort_code   TEXT UNIQUE NOT NULL,         -- código usado no n8n/cotador — DEVE ser idêntico ao campo hotel_resort do Kommo
                                                     -- ex: "park_hotel", "cabanas", "termas_gravatal", "fazzenda"
    hotel_name          TEXT NOT NULL,               -- ex: "Termas Park Hotel"
    hotel_location      TEXT NOT NULL,               -- ex: "Gravatal/SC"

    -- Regime
    regime_hospedagem   TEXT NOT NULL,               -- "pensao_completa" | "all_inclusive" | "meia_pensao"
    regime_descricao    TEXT,                         -- descrição curta do regime

    -- Faixas etárias (JSONB — suporta 3, 4 ou 5 faixas por hotel)
    faixas_etarias      JSONB NOT NULL,              -- array de objetos, ex:
                                                     -- [{"faixa":"bebe","min":0,"max":2,"categoria":"nao_cotado"},
                                                     --  {"faixa":"cortesia","min":3,"max":8,"categoria":"cortesia"},
                                                     --  {"faixa":"pagante","min":9,"max":12,"categoria":"tarifa_crianca"},
                                                     --  {"faixa":"adulto","min":13,"max":null,"categoria":"tarifa_adulto"}]
                                                     -- Águas de Palmas tem 5 faixas (inclui "jovem" 13-15)
    adulto_min_idade    INT NOT NULL,                -- campo auxiliar para placeholders de exemplo (ex: 13)

    -- Capacidade
    lotacao_max_ap      INT NOT NULL DEFAULT 5,      -- máximo de pessoas por AP

    -- Horários e pagamento (dados que vão no template do prompt e na montagem de orçamento)
    checkin             TEXT,                         -- ex: "a partir das 14h"
    checkout            TEXT,                         -- ex: "até às 12h (almoço incluso)"
    pagamento           TEXT,                         -- ex: "entrada de 25% via PIX + saldo até 10x cartão"

    -- Day use
    day_use_modo        TEXT NOT NULL DEFAULT 'handoff_only', -- "handoff_only" | "send_and_handoff"
    day_use_mensagem    TEXT,                         -- mensagem padrão (NULL se handoff_only)

    -- Regras de negócio exclusivas (JSON flexível)
    regras_exclusivas   JSONB DEFAULT '{}',          -- ex: {"fisico4_otimizacao": true, "cortesia_omissao": true}

    -- Terminologia
    terminologia        JSONB DEFAULT '{}',          -- ex: {"usar": ["aquecida"], "nunca_usar": ["termal"]}
    possessivos_hotel   BOOLEAN NOT NULL DEFAULT false, -- se pode usar "nosso hotel" (TRUE só Termas Park)

    -- Primeira mensagem
    primeira_mensagem   TEXT NOT NULL,

    -- NÃO FAZER hotel-específicos
    nao_fazer_extras    TEXT[],                       -- lista de proibições extras do hotel

    -- Controle
    ativo               BOOLEAN NOT NULL DEFAULT true,
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Para fallback: prompt estático completo
    prompt_estatico     TEXT                          -- prompt .js completo para fallback
);

-- Índices
CREATE INDEX idx_hotel_config_ativo ON rag.hotel_config(hotel_slug) WHERE ativo = true;
-- idx_hotel_config_resort_code já criado implicitamente pela constraint UNIQUE na coluna
```

> **ATENÇÃO — Mapeamento hotel_resort ↔ hotel_slug:** O n8n e o Kommo usam o campo `hotel_resort` (ex: `park_hotel`, `cabanas`, `termas_gravatal`). O RAG usa `hotel_slug` como PK. Para simplificar, **usar o mesmo código em ambos** — ou seja, `hotel_slug = hotel_resort_code`. O campo `hotel_resort_code` existe como referência explícita para o implementador saber qual código o n8n envia. No Code node de montagem do prompt, buscar config pelo código que vem do handler: `SELECT * FROM rag.hotel_config WHERE hotel_resort_code = $1`.

### 5.3 Tabela: `rag.content_chunks`

Source of truth para todo conteúdo vetorizado. O Qdrant é índice de busca, mas o Postgres é a fonte canônica.

```sql
CREATE TABLE rag.content_chunks (
    chunk_id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_slug      TEXT NOT NULL REFERENCES rag.hotel_config(hotel_slug),
    content_type    TEXT NOT NULL,                    -- "descricao_hotel", "quartos", "faq", "exemplos_few_shot", etc.
    section         TEXT,                             -- sub-seção opcional ("area_lazer", "restaurante", etc.)
    title           TEXT NOT NULL,                    -- título curto para identificação
    content         TEXT NOT NULL,                    -- conteúdo textual do chunk
    metadata        JSONB DEFAULT '{}',              -- metadados extras (cenario, temporada, validade, etc.)

    -- Controle de vetorização
    embedding_synced BOOLEAN NOT NULL DEFAULT false,  -- true quando Qdrant está em sync
    qdrant_point_id  UUID,                            -- ID do ponto no Qdrant (para update/delete)

    -- Controle
    ativo           BOOLEAN NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_chunks_hotel ON rag.content_chunks(hotel_slug) WHERE ativo = true;
CREATE INDEX idx_chunks_type ON rag.content_chunks(content_type);
CREATE INDEX idx_chunks_sync ON rag.content_chunks(embedding_synced) WHERE embedding_synced = false;
```

### 5.4 Tabela: `rag.prompt_templates`

Templates da Camada 1 do prompt (partes compartilhadas).

```sql
CREATE TABLE rag.prompt_templates (
    template_key    TEXT PRIMARY KEY,                 -- "core_rules", "conversation_flow", "output_schema", etc.
    template_name   TEXT NOT NULL,                    -- nome legível
    content         TEXT NOT NULL,                    -- conteúdo com placeholders: {hotel_name}, {hotel_location}, etc.
    version         INT NOT NULL DEFAULT 1,
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

Templates previstos:

| template_key        | Conteúdo                                                          |
| ------------------- | ----------------------------------------------------------------- |
| `header`            | Cabeçalho com {hotel_name}, {hotel_location}, identidade          |
| `rules_1_to_3`      | Regras #1 (formato), #2 (tools), #3 (uma pergunta)                |
| `rule_4_template`   | Regra #4 template com placeholders de faixas etárias              |
| `rules_5_to_7`      | Regras #5 (cotação direta), #6 (segurança), #7 (respostas curtas) |
| `idioma`            | Regra de idioma                                                   |
| `conversation_flow` | Condução da conversa com placeholder de {lotacao_max_ap}          |
| `descontos`         | Política de descontos                                             |
| `validacoes`        | Tabela de validações                                              |
| `tom_estilo`        | Tom e estilo (reforço)                                            |
| `nao_fazer_base`    | NÃO FAZER compartilhados (sem hotel-específicos)                  |
| `schema_saida`      | Schema JSON completo                                              |
| `exemplos_core`     | 4 exemplos obrigatórios com placeholders de hotel e faixas        |

### 5.5 Tabela: `rag.ingest_log`

Rastreamento de ingestão para auditoria.

```sql
CREATE TABLE rag.ingest_log (
    log_id          SERIAL PRIMARY KEY,
    hotel_slug      TEXT,                             -- NULL se ingestão geral
    chunks_processed INT NOT NULL,
    chunks_embedded  INT NOT NULL,
    chunks_failed    INT NOT NULL DEFAULT 0,
    trigger_type     TEXT NOT NULL,                   -- "manual", "webhook", "scheduled"
    triggered_by     TEXT,                            -- "igor", "claude_code", "n8n_cron"
    started_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    finished_at      TIMESTAMPTZ,
    status           TEXT NOT NULL DEFAULT 'running', -- "running", "completed", "failed"
    error_details    TEXT
);
```

### 5.6 Migração dos dados existentes

Os dados iniciais vêm de duas fontes:

1. **`hoteis/*.md`** → Fichas de hotel → popular `rag.hotel_config`
2. **`prompts/julia/*.js`** → Extrair seções de contexto, casos especiais, exemplos → popular `rag.content_chunks`

Isso pode ser feito via script (n8n workflow ou script Node.js/Python) que:

- Lê cada prompt .js
- Parseia as seções conhecidas (regex por headers markdown)
- Insere chunks no Postgres
- Marca como `embedding_synced = false`
- Dispara workflow de ingestão

---

## 6. Qdrant — Coleção e Indexação

### 6.1 Decisão: Collection única com filtro por hotel

**Por quê:** Qdrant recomenda oficialmente UMA collection por modelo de embedding com filtro por tenant. Para 12 hotéis com 50-200 chunks cada, collections separadas criam overhead desnecessário.

### 6.2 Criar a collection

```json
PUT /collections/hotel_knowledge
{
    "vectors": {
        "size": 1536,
        "distance": "Cosine"
    },
    "on_disk_payload": false
}
```

### 6.3 Índice de tenant

Criar índice otimizado no campo `hotel_slug` com flag `is_tenant`:

```json
PUT /collections/hotel_knowledge/index
{
    "field_name": "hotel_slug",
    "field_schema": {
        "type": "keyword",
        "is_tenant": true
    }
}
```

Isso cria um **índice HNSW por tenant**, tornando buscas filtradas mais rápidas.

### 6.4 Índices adicionais

```json
PUT /collections/hotel_knowledge/index
{
    "field_name": "content_type",
    "field_schema": "keyword"
}
```

### 6.5 Estrutura de um ponto no Qdrant

```json
{
    "id": "uuid-do-chunk",
    "vector": [0.12, 0.34, ...],
    "payload": {
        "hotel_slug": "park_hotel",
        "content_type": "lazer_recreacao",
        "section": "piscinas",
        "title": "Piscinas termais e área de lazer",
        "text": "[Termas Park Hotel] Piscinas termais e área de lazer\n\nO hotel conta com 3 piscinas...",
        "metadata": {
            "cenario": null,
            "temporada": null,
            "validade": null
        },
        "chunk_id_postgres": "uuid-referência-ao-postgres"
    }
}
```

### 6.6 Query de busca (tempo de consulta)

```json
POST /collections/hotel_knowledge/points/query
{
    "query": [0.12, 0.34, ...],
    "filter": {
        "must": [
            {
                "key": "hotel_slug",
                "match": { "value": "park_hotel" }
            }
        ]
    },
    "limit": 5,
    "with_payload": true,
    "score_threshold": 0.3
}
```

**`score_threshold: 0.3`** — não injetar chunks com relevância muito baixa. Ajustar empiricamente após testes.

### 6.7 Busca híbrida (futuro)

Inicialmente usar apenas busca densa (embedding). Se a qualidade de retrieval não for satisfatória, implementar busca híbrida (densa + sparse/BM25) com Reciprocal Rank Fusion. O Qdrant suporta nativamente via Query API com prefetch + fusion.

**Não implementar agora** — o volume de dados é pequeno o suficiente para busca densa funcionar bem.

---

## 7. Montagem Dinâmica do Prompt

### 7.1 Lógica de montagem (Code node no n8n)

```javascript
// Pseudocódigo — Code node no n8n (backend_jul.ia adaptado)

// INPUTS
const hotel_slug = $input.hotel_slug; // vem do handler
const mensagem_cliente = $input.mensagem; // mensagem atual
const etapa_atual = $input.etapa; // da sessão Redis
const first_contact = $input.first_contact;

// CAMADA 1 — Templates (cache no Redis, refresh diário)
const templates = await getTemplates(); // SELECT * FROM rag.prompt_templates

// CAMADA 2 — Config do hotel (cache no Redis, refresh quando atualizar)
const config = await getHotelConfig(hotel_slug); // SELECT * FROM rag.hotel_config

// CAMADA 3 — RAG (busca a cada mensagem)
const embedding = await embedMessage(mensagem_cliente); // OpenAI API
const chunks = await queryQdrant(embedding, hotel_slug, {
  limit: 5,
  score_threshold: 0.3,
});

// MONTAGEM
const prompt = assemblePrompt(templates, config, chunks, { now: new Date() });

// assemblePrompt faz:
// 1. Substitui placeholders nos templates: {hotel_name}, {hotel_location}, {faixas_etarias}, etc.
// 2. Injeta config do hotel na Regra #4 e na Condução da Conversa
// 3. Injeta ${now} (data atual) — o prompt referencia essa variável para resolução de datas relativas
// 4. Injeta chunks RAG em seção delimitada <contexto_adicional>
// 5. Garante que os 4 exemplos core estão presentes
// 6. Adiciona exemplos recuperados via RAG (se houver)
```

### 7.2 Template de prompt montado (resultado final)

```markdown
# JUL.IA — Central de Reservas L&M | {hotel_name}

Assistente virtual da Central de Reservas L&M para o {hotel_name} ({hotel_location}).
Tom acolhedor, humano, direto. SEMPRE em português brasileiro.

## 🚨 REGRA CRÍTICA #1 — FORMATO DE SAÍDA

[template compartilhado]

## 🚨 REGRA CRÍTICA #2 — USO OBRIGATÓRIO DE TOOLS

[template compartilhado]

## 🚨 REGRA CRÍTICA #3 — UMA PERGUNTA POR VEZ

[template compartilhado]

## 🚨 REGRA CRÍTICA #4 — CATEGORIZAÇÃO ESTRITA POR IDADE

[template — a tabela abaixo é GERADA pelo Code node a partir do campo faixas_etarias JSONB]
| Faixa | Idade | Categoria |
|-------|-------|-----------|
{para cada item em faixas_etarias: renderizar linha com min-max e categoria}

[O Code node itera o array JSONB e monta a tabela markdown. Exemplos:]
- Hotel com 4 faixas: Bebê 0-2 | Cortesia 3-8 | Pagante 9-12 | Adulto 13+
- Águas de Palmas (5 faixas): Bebê 0-2 | Cortesia 3-7 | Pagante 8-12 | Jovem 13-15 | Adulto 16+
- Cabanas (cortesia ampla): Bebê 0-2 | Cortesia 3-12 | Adulto 13+

{regras_exclusivas renderizadas do JSONB — ex: "Se físico=4 em AP único → cotar como 4 adultos"}

## 🚨 REGRA CRÍTICA #5 — COTAÇÃO DIRETA

[template compartilhado]

## 🚨 REGRA CRÍTICA #6 — SEGURANÇA

[template compartilhado]

## 🚨 REGRA CRÍTICA #7 — RESPOSTAS CURTAS

[template compartilhado]

## 🌐 SEMPRE em português brasileiro.

## Primeira Mensagem

{primeira_mensagem}

## Contexto do Hotel

{regime_hospedagem}, {regime_descricao}, check-in: {checkin}, checkout: {checkout}, pagamento: {pagamento}

<contexto_adicional>
{chunks_rag_recuperados}
</contexto_adicional>

## Condução da Conversa

[template compartilhado com {lotacao_max_ap} e {day_use_modo} injetados]

## Política de Descontos

[template compartilhado]

## Casos Especiais

{casos_especiais_do_config + chunks_rag_de_casos_especiais}

## Validações

[template compartilhado com {lotacao_max_ap}]

## Tom e Estilo

[template compartilhado com {possessivos_hotel}]

## NÃO FAZER

[template compartilhado]
{nao_fazer_extras do hotel_config}

## Formato de Saída

[schema JSON completo — template compartilhado]

## Exemplos

{4_exemplos_core_com_placeholders_substituidos}
{exemplos_adicionais_do_rag}
```

### 7.3 Pontos de atenção na montagem

1. **Placeholders nos exemplos core:** os 4 exemplos obrigatórios precisam ter o nome do hotel e faixas etárias corretas. Usar placeholders que são substituídos pelo hotel_config.

2. **Ordem dos chunks RAG:** colocar chunks com score mais alto primeiro (modelos dão mais atenção ao início do contexto).

3. **Deduplicação:** se um chunk RAG repete informação que já está no hotel_config, não injetar.

4. **Tag `<contexto_adicional>`:** delimitar claramente a seção RAG para o modelo saber que é contexto dinâmico. Adicionar instrução: "Use as informações em `<contexto_adicional>` para responder perguntas do cliente. Se a pergunta não pode ser respondida com o contexto disponível, informe que vai verificar com a equipe."

5. **Limite de chunks injetados:** máximo 5 chunks por consulta. Se o Qdrant retornar mais, truncar pelos de menor score.

---

## 8. Fluxos n8n — Ingestão e Consulta

### 8.1 Fluxo de Ingestão

**Trigger:** manual (webhook) ou agendado (cron diário para re-sync)

```
[Webhook / Cron Trigger]
        │
        ▼
[Postgres] SELECT * FROM rag.content_chunks WHERE embedding_synced = false AND ativo = true
        │
        ▼
[Split In Batches] (lotes de 20 chunks)
        │
        ▼
[OpenAI API] POST /v1/embeddings
             model: "text-embedding-3-small"
             input: chunk.content (campo content do Postgres — já deve conter o prefixo "[hotel_name] title\n\n...")
        │
        ▼
[Qdrant API] PUT /collections/hotel_knowledge/points
             id: chunk.chunk_id
             vector: embedding
             payload: { hotel_slug, content_type, section, title, text, metadata }
        │
        ▼
[Postgres] UPDATE rag.content_chunks
           SET embedding_synced = true, qdrant_point_id = chunk_id
           WHERE chunk_id = ?
        │
        ▼
[Postgres] INSERT INTO rag.ingest_log (...)
```

**Detalhes:**

- Processar em lotes de 20 (OpenAI aceita batch de embeddings)
- Se um chunk falha, logar e continuar (não travar o lote)
- Re-sync: quando `updated_at` do chunk > última ingestão, marcar `embedding_synced = false`

### 8.2 Fluxo de Consulta (adaptação do backend_jul.ia)

O fluxo existente (`backend_jul.ia.json`) precisa de adaptação. Hoje:

```
handler → backend → agente_jul.ia (prompt estático) → resposta
```

Com RAG:

```
handler → backend (NOVO) → [embed + qdrant + montar prompt] → agente_jul.ia (prompt dinâmico) → resposta
```

> **Nota:** o n8n tem um **node nativo de Qdrant Vector Store** (Insert Documents, Get Many, Retrieve Documents). Pode ser usado no lugar dos HTTP Request nodes para simplificar. A vantagem do HTTP Request é mais controle sobre filtros e score_threshold. Testar ambos e usar o que for mais prático.

**Passos novos no backend (antes de chamar agente_jul.ia):**

```
[Recebe dados do handler]
        │
        ▼
[Redis] GET hotel_config:{hotel_slug}     ← config do hotel (cache)
        │ (se cache miss → Postgres → Redis SET com TTL 24h)
        │
        ▼
[Redis] GET prompt_templates              ← templates (cache)
        │ (se cache miss → Postgres → Redis SET com TTL 24h)
        │
        ▼
[OpenAI API] POST /v1/embeddings          ← embed da mensagem do cliente
             model: "text-embedding-3-small"
             input: mensagem_buffer
        │
        ▼
[Qdrant API] POST /collections/hotel_knowledge/points/query
             query: embedding_vector
             filter: { hotel_slug: "..." }
             limit: 5
             score_threshold: 0.3
        │
        ▼
[Code Node] assemblePrompt(templates, config, qdrant_chunks)
        │
        ▼
[agente_jul.ia] (recebe prompt montado dinamicamente)
        │
        ▼
[Resto do fluxo normal: cotação, handoff, etc.]
```

### 8.3 Latência adicionada

| Passo novo                     | Latência estimada |
| ------------------------------ | ----------------- |
| Redis GET (config + templates) | ~1-2ms            |
| OpenAI embed (mensagem)        | ~100-200ms        |
| Qdrant query                   | ~5-20ms           |
| Code node (montagem)           | ~5-10ms           |
| **Total adicional**            | **~110-230ms**    |

Irrelevante comparado ao tempo de resposta do GPT-4.1 mini (~2-5s) e ao timer de humanização (~65-95s).

### 8.4 Fluxo de invalidação de cache

Quando conteúdo é atualizado no Postgres:

```
[Postgres UPDATE em rag.content_chunks ou rag.hotel_config]
        │
        ▼
[Trigger ou webhook manual]
        │
        ├── Se hotel_config mudou → Redis DEL hotel_config:{hotel_slug}
        │
        ├── Se content_chunks mudou → Marcar embedding_synced = false
        │
        └── Disparar workflow de ingestão
```

---

## 9. Docker — Qdrant na VPS

### 9.1 Docker Compose

Adicionar ao docker-compose existente ou criar arquivo separado:

```yaml
# docker-compose.qdrant.yml
services:
  qdrant:
    image: qdrant/qdrant:latest
    container_name: qdrant
    restart: unless-stopped
    ports:
      - "127.0.0.1:6333:6333" # REST API — bind local only (segurança)
      - "127.0.0.1:6334:6334" # gRPC API — bind local only
    volumes:
      - qdrant_data:/qdrant/storage
    environment:
      - QDRANT__SERVICE__API_KEY=${QDRANT_API_KEY}
      - QDRANT__LOG_LEVEL=INFO
    deploy:
      resources:
        limits:
          memory: 512m
    networks:
      - lm_network # mesma rede do n8n e postgres

volumes:
  qdrant_data:

networks:
  lm_network:
    external: true # rede já existente do docker
```

### 9.2 Comando para subir

```bash
# Gerar API key
export QDRANT_API_KEY=$(openssl rand -hex 32)
echo "QDRANT_API_KEY=$QDRANT_API_KEY" >> .env

# Subir
docker compose -f docker-compose.qdrant.yml up -d

# Verificar
curl -H "api-key: $QDRANT_API_KEY" http://localhost:6333/healthz
```

### 9.3 Segurança

- **Bind `127.0.0.1` only** — Qdrant NÃO deve ficar exposto à internet
- **API key obrigatória** — sem ela, qualquer acesso na rede local lê/escreve dados
- **n8n acessa via rede Docker interna** — URL: `http://qdrant:6333` (nome do container)
- **Dashboard** disponível em `http://localhost:6333/dashboard` para debug local

### 9.4 Rede Docker

Verificar qual rede o n8n e Postgres já usam:

```bash
docker network ls
docker inspect n8n | grep -A 5 Networks
```

Usar a mesma rede no `lm_network`. Se não existir rede compartilhada, criar:

```bash
docker network create lm_network
# E reconectar n8n e postgres à mesma rede
```

---

## 10. Gestão de Conteúdo

### 10.1 Fluxo de atualização

```
Igor/equipe → Claude Code (MCP Postgres)
    │
    │  "Adiciona promoção de Páscoa pro Termas Park:
    │   3 diárias pelo preço de 2, válido 10-20/abr"
    │
    ▼
Claude Code → INSERT INTO rag.content_chunks (
    hotel_slug: 'park_hotel',
    content_type: 'promocoes',
    title: 'Promoção Páscoa 2026',
    content: '[Termas Park Hotel] Promoção Páscoa 2026\n\nPacote especial: 3 diárias...',
    metadata: '{"validade_inicio": "2026-04-10", "validade_fim": "2026-04-20"}'
)
    │
    ▼
Workflow de ingestão (automático ou manual)
    │
    ▼
Qdrant (disponível para a Julia na próxima interação)
```

### 10.2 Operações comuns via Claude Code

| Operação                      | Comando conceitual                                               |
| ----------------------------- | ---------------------------------------------------------------- |
| Adicionar promoção            | INSERT no content_chunks + disparar ingestão                     |
| Atualizar info do hotel       | UPDATE no content_chunks + marcar embedding_synced=false         |
| Mudar faixa etária            | UPDATE no hotel_config (invalidar cache Redis)                   |
| Desativar conteúdo            | UPDATE content_chunks SET ativo=false (Qdrant ignora na busca)   |
| Ver todo conteúdo de um hotel | SELECT \* FROM rag.content_chunks WHERE hotel_slug = 'X'         |
| Verificar sync                | SELECT \* FROM rag.content_chunks WHERE embedding_synced = false |

### 10.3 Conteúdo com validade

Promoções e conteúdo sazonal têm validade. Duas opções:

**Opção A — Filtro por validade no Qdrant (recomendada):**
Adicionar campos `validade_inicio` e `validade_fim` no payload do Qdrant. Na query, filtrar por: (1) não expirado E (2) já começou OU sem validade definida:

```json
{
  "filter": {
    "must": [
      { "key": "hotel_slug", "match": { "value": "park_hotel" } }
    ],
    "should": [
      {
        "must": [
          { "key": "metadata.validade_inicio", "range": { "lte": "2026-04-01" } },
          { "key": "metadata.validade_fim", "range": { "gte": "2026-04-01" } }
        ]
      },
      {
        "is_empty": { "key": "metadata.validade_fim" }
      }
    ]
  }
}
```

**Opção B — Cron de limpeza:**
Workflow n8n diário que marca como `ativo=false` chunks expirados e remove do Qdrant.

**Recomendação:** usar Opção A (filtro no Qdrant) para promoções com data definida + Opção B como cleanup semanal de conteúdo velho.

---

## 11. Rollback e Segurança

### 11.1 Fallback para prompt estático

Se o RAG degradar o comportamento da Julia:

1. **Campo `prompt_estatico`** na tabela `hotel_config` contém o prompt .js completo atual
2. **Flag de controle** no Redis: `rag_enabled:{hotel_slug}` (true/false)
3. No n8n, verificar a flag:
   - Se `rag_enabled = true` → montar prompt dinâmico (fluxo RAG)
   - Se `rag_enabled = false` → usar `prompt_estatico` do hotel_config (fluxo atual)
4. Permite **rollback instantâneo por hotel** sem deploy, sem restart

### 11.2 Versionamento de templates

A tabela `prompt_templates` tem campo `version`. Ao atualizar um template:

1. Manter o anterior como backup (ou versionar numa tabela de histórico)
2. Testar com 1 hotel antes de aplicar globalmente
3. Se falhar, reverter a versão no Postgres

### 11.3 Monitoramento

Métricas a acompanhar após deploy:

| Métrica                     | Como medir                              | Alerta se                                |
| --------------------------- | --------------------------------------- | ---------------------------------------- |
| Token count por chamada     | Log no n8n (tokenUsage do response)     | > 8.000 tokens (prompt crescendo demais) |
| Chunks retornados por query | Log no n8n (count do Qdrant response)   | 0 chunks (retrieval falhou)              |
| Score médio dos chunks      | Log no n8n (score do Qdrant)            | < 0.25 (chunks irrelevantes)             |
| Tempo de montagem           | Log no n8n (tempo do Code node)         | > 500ms                                  |
| Fallbacks ativados          | Contar ocorrências de rag_enabled=false | Qualquer hotel em fallback > 24h         |

### 11.4 Prompts atuais como backup

Os 12 arquivos em `prompts/julia/*.js` continuam existindo no repositório Git e ficam versionados. Além disso, cada um é salvo no campo `prompt_estatico` da `hotel_config`. Dupla segurança.

---

## 12. Estimativas de Custo e Performance

### 12.1 Custo de embeddings

| Operação                                    | Tokens         | Custo          |
| ------------------------------------------- | -------------- | -------------- |
| Ingestão total (1.000 chunks × ~400 tokens) | ~400K tokens   | **$0,008**     |
| Re-ingestão completa                        | ~400K tokens   | **$0,008**     |
| Embed por mensagem de cliente               | ~50-200 tokens | **$0,000004**  |
| 1.000 mensagens/dia                         | ~100K tokens   | **$0,002/dia** |

**Custo de embedding é desprezível** — menos de $1/ano para o volume da L&M.

### 12.2 Economia de tokens no GPT-4.1 mini

| Cenário                 | Tokens prompt | Custo/chamada\*   | Economia   |
| ----------------------- | ------------- | ----------------- | ---------- |
| Atual (prompt estático) | ~9.855        | $0,00148          | —          |
| Com RAG (estimado)      | ~5.500-6.800  | $0,00082-$0,00102 | **30-44%** |

\*GPT-4.1 mini input: $0.15/1M tokens

Para 1.000 mensagens/dia: economia de ~$0,46-$0,66/dia → **~$14-$20/mês**.

### 12.3 Economia futura

Sem RAG, cada nova feature (promoções, FAQ, sazonalidade) adicionaria ~500-2.000 tokens ao prompt. Com 5 expansões futuras, o prompt iria para ~15K-20K tokens. Com RAG, o prompt base fica estável em ~5.500-6.800 tokens independente do volume de conteúdo.

| Projeção       | Sem RAG        | Com RAG       |
| -------------- | -------------- | ------------- |
| Agora          | ~9.855 tokens  | ~6.000 tokens |
| +promoções     | ~11.000 tokens | ~6.200 tokens |
| +FAQ detalhado | ~13.000 tokens | ~6.400 tokens |
| +sazonalidade  | ~14.500 tokens | ~6.500 tokens |
| +cardápios     | ~16.000 tokens | ~6.600 tokens |
| +eventos       | ~17.500 tokens | ~6.700 tokens |

### 12.4 Performance

| Métrica                          | Atual        | Com RAG                      |
| -------------------------------- | ------------ | ---------------------------- |
| Latência processing              | ~2-5s        | ~2.2-5.2s (+200ms)           |
| Latência total (com humanização) | ~2min-2min30 | ~2min-2min30 (imperceptível) |
| RAM adicional na VPS             | 0            | ~50MB (Qdrant container)     |
| Disco adicional                  | 0            | ~50MB                        |

---

## 13. Roadmap de Implementação

### Fase 1 — Infraestrutura (1-2 dias)

- [ ] Subir Qdrant na VPS (docker-compose)
- [ ] Verificar rede Docker (n8n, postgres, qdrant na mesma rede)
- [ ] Criar schema `rag` no Postgres
- [ ] Criar tabelas (`hotel_config`, `content_chunks`, `prompt_templates`, `ingest_log`)
- [ ] Testar conectividade: n8n → Qdrant, n8n → Postgres (schema rag)

### Fase 2 — Dados (2-3 dias)

- [ ] Popular `hotel_config` com dados dos 12 hotéis (extrair dos prompts .js e fichas .md)
- [ ] Criar templates compartilhados em `prompt_templates` (extrair partes fixas do gold standard)
- [ ] Extrair chunks dos prompts existentes → popular `content_chunks`
- [ ] Salvar prompts estáticos atuais no campo `prompt_estatico` de cada hotel
- [ ] Criar collection no Qdrant + índices (hotel_slug com is_tenant, content_type)

### Fase 3 — Pipeline de Ingestão (1-2 dias)

- [ ] Criar workflow n8n de ingestão (Postgres → embed → Qdrant)
- [ ] Executar primeira ingestão completa
- [ ] Verificar: todos os chunks no Qdrant? Payloads corretos? embedding_synced = true?
- [ ] Testar queries manuais no Qdrant dashboard

### Fase 4 — Montagem do Prompt (2-3 dias)

- [ ] Criar função assemblePrompt no n8n (Code node)
- [ ] Testar montagem com dados reais de cada hotel
- [ ] Comparar prompt montado vs prompt estático original — validar que regras críticas estão presentes
- [ ] Validar com a skill `prompt-julia review` se o prompt montado passa todos os checks

### Fase 5 — Integração no Fluxo (1-2 dias)

- [ ] Adaptar `backend_jul.ia.json`: adicionar passos de embed + qdrant + montagem
- [ ] Implementar flag `rag_enabled` no Redis
- [ ] Implementar fallback para prompt estático
- [ ] Cache de config e templates no Redis

### Fase 6 — Teste com 1 Hotel (3-5 dias)

- [ ] Ativar RAG apenas para **Termas Park Hotel** (único em produção)
- [ ] Monitorar: token count, chunks retornados, scores, comportamento da Julia
- [ ] Testar cenários: saudação, cotação simples, cotação múltipla, day use, informativo, handoff, grupo
- [ ] Comparar respostas RAG vs estático — identificar degradações
- [ ] Ajustar score_threshold e limit se necessário

### Fase 7 — Rollout Gradual (1-2 semanas)

- [ ] Ativar RAG nos demais hotéis, 2-3 por vez
- [ ] Monitorar cada ativação
- [ ] Adicionar primeiro conteúdo novo (promoções de teste)
- [ ] Validar que promoções são recuperadas corretamente

### Fase 8 — Gestão de Conteúdo (ongoing)

- [ ] Configurar MCP Postgres no Claude Code para gestão de conteúdo
- [ ] Documentar processo de adicionar/atualizar conteúdo
- [ ] Configurar cron de cleanup de conteúdo expirado
- [ ] Treinar equipe no fluxo de atualização

---

## 14. Gaps e Riscos Identificados

### 14.1 Riscos técnicos

| Risco                                          | Impacto                                                      | Mitigação                                                        |
| ---------------------------------------------- | ------------------------------------------------------------ | ---------------------------------------------------------------- |
| RAG retorna chunks irrelevantes                | Julia responde com info errada ou fora de contexto           | score_threshold + fallback para prompt estático                  |
| Prompt montado perde conditional wording       | Julia faz perguntas proativas sobre crianças (bug conhecido) | Templates fixos com wording já validado, nunca modificar via RAG |
| Exemplos RAG não cobrem cenário da conversa    | Comportamento degradado em edge cases                        | 4 exemplos core SEMPRE presentes cobrem cenários mais críticos   |
| Qdrant down                                    | Julia não funciona                                           | Flag rag_enabled → fallback instantâneo para prompt estático     |
| Embedding da mensagem não captura intenção     | Chunks errados recuperados                                   | Tuning de score_threshold + possível adição de keyword filter    |
| Conteúdo no Postgres dessincronizado do Qdrant | Info desatualizada                                           | Workflow de sync + check de `embedding_synced`                   |

### 14.2 Riscos de processo

| Risco                                                     | Mitigação                                              |
| --------------------------------------------------------- | ------------------------------------------------------ |
| Equipe atualiza Postgres mas esquece de disparar ingestão | Cron de re-sync diário como safety net                 |
| Promoção expirada ainda é retornada                       | Filtro de validade no Qdrant + cron semanal de cleanup |
| Template core editado quebra todos os hotéis              | Versionamento + testar com 1 hotel antes de aplicar    |

### 14.3 Gaps a resolver durante implementação

1. **Rede Docker exata:** verificar nome da rede compartilhada entre n8n e Postgres na VPS. Pode ser `bridge`, custom, ou cada serviço em rede separada.

2. **Redis existente:** verificar se o Redis atual tem espaço para cache adicional (hotel_config, templates). Volume esperado é mínimo (<1MB).

3. **Formato de templates:** os templates com placeholders `{hotel_name}` etc. precisam ser escritos e validados um a um. É o trabalho mais delicado — um placeholder errado ou conditional wording perdido quebra o prompt.

4. **Extração de chunks dos prompts atuais:** parsear os .js para extrair seções é possível via regex (headers markdown `##`), mas pode precisar de ajuste manual para separar conteúdo hotel-específico vs compartilhado.

5. **Embedding de exemplos few-shot:** exemplos são longos (~500-1000 chars cada) e altamente estruturados (Think → Armazena → JSON). Testar se o embedding captura a "intenção" do cenário (ex: busca por "day use" retorna o exemplo de day use). Se não capturar bem, usar filtro de `metadata.cenario` como fallback.

6. **Múltiplas mensagens no buffer:** o n8n recebe um buffer com `§|§` separando mensagens. O embedding deve ser feito no buffer completo ou na última mensagem? Testar ambos — provavelmente a última mensagem é melhor para retrieval.

7. **Concurrency:** o n8n tem limit de 15 concurrent. Com o passo extra de embed + qdrant, verificar se o tempo total não causa bottleneck. Dado que o adicional é ~200ms, não deve ser problema.

8. **Atualização da skill `prompt-julia`:** quando o RAG estiver implementado, a skill precisa ser atualizada para refletir a nova arquitetura (chunks em vez de prompt monolítico). Isso é responsabilidade do Igor com o Claude Code, não do implementador.

9. **Mapeamento exato dos `hotel_resort_code`:** antes de popular a tabela `hotel_config`, verificar na VPS os valores exatos que o Kommo envia no webhook. Os códigos no Anexo A vêm do `config_hoteis.js` do cotador, mas o Kommo pode usar variações (ex: `park_hotel` vs `termas_park`). Um mismatch aqui faz o RAG não encontrar o hotel. **Checar com `docker exec n8n` + logs do handler.**

10. **Regra #4 com regras exclusivas complexas:** hotéis como Cabanas (omissão de cortesia) e Internacional (físico=4) têm lógica de negócio que precisa ser renderizada no prompt pelo Code node. O `faixas_etarias` JSONB resolve a tabela, mas o texto descritivo das regras exclusivas (ex: "Se grupo contém exatamente 1 criança 3-10 por AP, omitir do JSON") precisa estar no `regras_exclusivas` JSONB de forma que o Code node consiga renderizar como texto markdown. Definir um formato padrão para esse campo durante a Fase 2.

---

## Anexo A — Configuração dos 12 Hotéis

Dados a popular na tabela `rag.hotel_config`. A coluna `hotel_resort_code` é o código que o n8n/Kommo/Cotador já usam — **não mudar esses códigos**.

| hotel_slug (PK) | hotel_resort_code (n8n) | hotel_name | cortesia | pagante | adulto_min | lotacao_max | day_use | regras_exclusivas |
|---|---|---|---|---|---|---|---|---|
| `aguas_de_palmas` | `aguas_de_palmas` | Águas de Palmas Resort | 3-7 | 8-12 (+13-15 jovem) | 16 | 4 | send_and_handoff | 5 faixas etárias (único) |
| `cabanas` | `cabanas` | Cabanas Termas Hotel | 3-12 | — (cortesia até 12) | 13 | 6 | send_and_handoff | cortesia_omissao: 1 cri 3-10/AP |
| `costao` | `costao` | Costão do Santinho | 3 (only) | 4-11 | 12 | **6** | send_and_handoff | cortesia_age_3_only |
| `fazzenda` | `fazzenda` | Fazzenda Park Resort | 3-5 | 6-12 | 13 | 5 | handoff_only | all_inclusive, pix_3pct |
| `hotel_internacional` | `hotel_internacional` | Hotel Internacional Gravatal | 3-4 | 5-12 | 13 | 5 | send_and_handoff | fisico4_otimizacao |
| `termas_gravatal` | `termas_gravatal` | Hotel Termas Gravatal | 3-8 | 9-12 | 13 | 5 | handoff_only | — |
| `jardins_de_jurema` | `jardins_de_jurema` | Jardins de Jurema | 3-12 | 13-14 | 15 | 5 | handoff_only | max 2 cortesias/AP |
| `lagos_de_jurema` | `lagos_de_jurema` | Lagos de Jurema | 3-12 | 13-14 | 15 | 5 | handoff_only | max 2 cortesias/AP |
| `machadinho_thermas` | `machadinho_thermas` | Machadinho Thermas Resort | 3-5 | 6-12 | 13 | 5 | handoff_only | ISS 2,5% incluso |
| `recanto_cataratas_resort` | `recanto_cataratas_resort` | Recanto Cataratas Resort | 3-10 | — | 11 | **4** | handoff_only | max_ap=4, max 2 cortesias/AP |
| `termas_do_lago` | `termas_do_lago` | Termas do Lago | 3-8 | 9-12 | 13 | 5 | handoff_only | — |
| `park_hotel` | `park_hotel` | Termas Park Hotel | 3-8 | 9-12 | 13 | 5 | send_and_handoff | possessivos_hotel: true |

> **IMPORTANTE:** Os `hotel_resort_code` acima vêm do `config_hoteis.js` e do mapeamento do Cotador HAI+. Verificar na VPS se os códigos batem exatamente com o que o Kommo envia no campo `hotel_resort` do webhook. Se houver divergência, ajustar aqui.

> **ALIASES:** O `config_hoteis.js` tem alias `ita_thermas` → `park_hotel`. Se o Kommo pode enviar `ita_thermas` como `hotel_resort`, o handler ou o Code node de lookup precisa resolver o alias antes de consultar `rag.hotel_config`. Opção simples: tabela `rag.hotel_aliases (alias TEXT PK, hotel_slug TEXT REFERENCES hotel_config)` ou um JSONB de aliases no hotel_config. Opção mais simples: resolver no handler do n8n com um MAP de aliases, igual ao que o `config_hoteis.js` já faz.

> **Nota sobre faixas_etarias JSONB:** O schema agora usa JSONB para faixas etárias, suportando qualquer número de faixas. Águas de Palmas (5 faixas) e Cabanas (cortesia até 12, sem faixa pagante separada) são representados naturalmente sem gambiarras.

---

## Anexo B — Exemplos Core (4 obrigatórios)

Estes exemplos estarão no template `exemplos_core` com placeholders. O n8n substitui `{hotel_name}`, `{faixa_adulto_min}`, etc.

### Exemplo 1 — Saudação

```
**Cenário — Primeira mensagem**
Cliente: "Oi"
Think: Primeira interação → enviar saudação padrão. Tipo de serviço ainda não identificado.
Armazena: Resumo_IA = "Primeiro contato, saudação enviada"
{"message":"{primeira_mensagem}","etapa":"saudacao","tipo_servico":null,...}<<FIM>>
```

### Exemplo 2 — Cotação sem idades (todos adultos)

```
**Cenário — N pessoas sem idades**
Cliente: "Quero orçamento pra 3 pessoas, 10 a 12 de maio"
Think: Tipo = hospedagem. Dados: entrada 10/05, saída 12/05, 3 pessoas.
Crianças NÃO mencionadas → NÃO perguntar. Tratar todos como adultos.
3 adultos, lotação {lotacao_max_ap}/AP → cabe. Dados completos → cotação.
Armazena: Resumo_IA = "3 adultos, 10-12/mai, cotação solicitada"
{"message":"Perfeito! Já vou preparar o orçamento ☺","etapa":"cotacao",
"tipo_servico":"hospedagem","dados_coletados":{"data_entrada":"10/05/2026",
"data_saida":"12/05/2026","adultos":3,"criancas":0,"bebes":0,
"idades_criancas":[]},"pronto_para_cotacao":true,...}<<FIM>>
```

### Exemplo 3 — Handoff

```
**Cenário — Cliente pede atendente**
Cliente: "Quero falar com alguém"
Think: Cliente pede atendente humano → handoff_only imediato. Message vazio.
Armazena: Resumo_IA = "Cliente solicitou atendente humano"
{"message":"","etapa":"coleta_dados","handoff":"handoff_only",
"notify_text":"Cliente solicitou atendente humano",...}<<FIM>>
```

### Exemplo 4 — Tarifa adulto (edge case crítico)

```
**Cenário — Criança com tarifa adulto**
Cliente: "Casal e uma criança de {faixa_adulto_min} anos"
Think: Tipo = hospedagem. 2 adultos + 1 criança de {faixa_adulto_min}.
Categorização: {faixa_adulto_min} anos → Tarifa adulto. Mas cliente chamou
de "criança" → vai em idades_criancas, NUNCA em adultos. adultos=2,
criancas=1, idades_criancas=[{faixa_adulto_min}]. Falta datas.
Armazena: Resumo_IA = "Casal + 1 criança de {faixa_adulto_min}, falta datas"
{"message":"Que legal viajar em família ☺ Já tem ideia das datas?",
"etapa":"coleta_dados","tipo_servico":"hospedagem",
"dados_coletados":{"adultos":2,"criancas":1,"bebes":0,
"idades_criancas":[{faixa_adulto_min}]},...}<<FIM>>
```

---

## Anexo C — Queries Qdrant de Referência

### Criar collection

```bash
curl -X PUT http://localhost:6333/collections/hotel_knowledge \
  -H "api-key: $QDRANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "vectors": { "size": 1536, "distance": "Cosine" },
    "on_disk_payload": false
  }'
```

### Criar índices

```bash
# Índice de tenant
curl -X PUT http://localhost:6333/collections/hotel_knowledge/index \
  -H "api-key: $QDRANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "field_name": "hotel_slug",
    "field_schema": { "type": "keyword", "is_tenant": true }
  }'

# Índice de content_type
curl -X PUT http://localhost:6333/collections/hotel_knowledge/index \
  -H "api-key: $QDRANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "field_name": "content_type",
    "field_schema": "keyword"
  }'
```

### Upsert de pontos

```bash
curl -X PUT http://localhost:6333/collections/hotel_knowledge/points \
  -H "api-key: $QDRANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "points": [{
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "vector": [0.12, 0.34, ...],
      "payload": {
        "hotel_slug": "park_hotel",
        "content_type": "lazer_recreacao",
        "section": "piscinas",
        "title": "Piscinas termais",
        "text": "[Termas Park Hotel] Piscinas termais\n\n3 piscinas aquecidas...",
        "metadata": {}
      }
    }]
  }'
```

### Query de busca

```bash
curl -X POST http://localhost:6333/collections/hotel_knowledge/points/query \
  -H "api-key: $QDRANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "query": [0.12, 0.34, ...],
    "filter": {
      "must": [{ "key": "hotel_slug", "match": { "value": "park_hotel" } }]
    },
    "limit": 5,
    "with_payload": true,
    "score_threshold": 0.3
  }'
```

---

> **Próximos passos:** Este documento deve ser revisado pelo implementador antes de qualquer código. Após revisão, seguir o roadmap da Seção 13 fase por fase. Qualquer dúvida sobre regras de negócio, diretrizes da Julia, ou decisões de prompt — consultar o Igor.
