# Instrução para gerar prompt Jul.IA de um hotel

> **Para o Claude Code.** Quando o usuário pedir para gerar o prompt de um hotel, leia este arquivo e siga as instruções abaixo.

---

## Passo 1 — Ler os inputs

Leia os 3 arquivos abaixo antes de gerar qualquer coisa:

| Input | Arquivo | Para quê |
|-------|---------|----------|
| **Ficha do hotel** | `hoteis/{hotel}.md` | Dados específicos: regime, faixas etárias, destaques, casos especiais, terminologia, primeira mensagem |
| **Diretrizes gerais** | `prompts/julia/diretrizes_gerais_julia_v8.md` | Regras invioláveis compartilhadas entre todos os hotéis — o prompt DEVE incorporar 100% delas |
| **Gold standard** | `prompts/julia/hotel_internacional_gravatal.js` | Referência de formato, tom, nível de detalhe e estrutura do output. Replicar este padrão |

A ficha de referência (exemplo de ficha bem preenchida) é `hoteis/hotel_internacional_gravatal.md`.

**Validação antes de gerar:** conferir se a ficha tem todos os campos obrigatórios preenchidos. Se faltar algum, perguntar ao usuário antes de prosseguir.

---

## Passo 2 — Gerar o prompt

### Output
- Arquivo: `prompts/julia/{codigo_hotel}.js` (código técnico vem do campo `hotel_resort param` na ficha)
- Formato: `const prompt = \`...\`` retornando `[{ json: { prompt } }]` para o n8n
- Variável `${now}` referenciada no prompt (NÃO substituída) — o n8n injeta em runtime

### Estrutura obrigatória (seguir Bloco 3 das diretrizes)

O prompt final deve conter as seções abaixo, **nesta ordem exata**:

```
1.  CABEÇALHO
    → FICHA: nome_hotel, localizacao
    → DIRETRIZES 2.1: identidade, posicionamento, idioma

2.  REGRA #1 — FORMATO DE SAÍDA
    → DIRETRIZES 2.13 (resumida)

3.  REGRA #2 — USO OBRIGATÓRIO DE TOOLS
    → DIRETRIZES 2.12: Think → Armazena → JSON + <<FIM>>
    → Incluir: resolução de datas via ${now}, identificação de crianças por idade

4.  REGRA #3 — UMA PERGUNTA POR VEZ
    → DIRETRIZES 2.5 com exemplos ❌/✅

5.  REGRA #4 — CATEGORIZAÇÃO POR IDADE
    → FICHA: faixas etárias do hotel (cada hotel tem faixas diferentes!)
    → DIRETRIZES 2.6: bebê universal 0–2, lotação física, cortesia = preço não espaço
    → Tabela: Faixa | Categoria | Cotação | Capacidade AP
    → Atenção 13+ no JSON: adultos = só quem cliente chamou de adulto
    → Exemplos de categorização adaptados às faixas DESTE hotel

6.  REGRA #5 — COTAÇÃO DIRETA
    → DIRETRIZES 2.7: dados completos → pronto_para_cotacao: true

7.  REGRA #6 — SEGURANÇA
    → DIRETRIZES 2.2

8.  REGRA #7 — RESPOSTAS CURTAS
    → DIRETRIZES 2.14: máx 3 frases, só o perguntado, enquadramento positivo

9.  PRIMEIRA MENSAGEM
    → FICHA: primeira_mensagem (texto exato)
    → DIRETRIZES 2.4: nunca repetir após 1ª interação

10. CONTEXTO DO HOTEL
    → FICHA: todos os campos relevantes como bullet points
    → Incluir: local, regime, bebidas, quartos, check-in/out, destaques,
      recreação, estrutura, serviços à parte, transfer, escopo
    → Se FICHA.regime_bebidas preenchido → campo separado
    → Se FICHA.parque_externo preenchido → incluir com detalhes
    → Se FICHA.mascotes preenchido → incluir com contexto
    → Se FICHA.atracoes_especificas preenchido → incluir cada uma
    → Se day_use_mode = "cotar" → tabela de preços day use
    → Se day_use_mode = "handoff" → apenas "Day use: qualquer menção → handoff imediato"

11. CONDUÇÃO DA CONVERSA
    → DIRETRIZES 2.4: informativo
    → DIRETRIZES 2.5: coleta hospedagem (um por vez), 3 cenários de crianças
    → DIRETRIZES 2.7: lotação, múltiplos APs, múltiplas datas, grupo >10
    → Se day_use_mode = "cotar" → fluxo completo de coleta day use
    → Se day_use_mode = "handoff" → NÃO incluir fluxo de coleta day use

12. DESCONTOS
    → DIRETRIZES 2.10: só faixa etária, resposta padrão PCD adaptada com nome do hotel

13. CASOS ESPECIAIS
    → FICHA: casos_especiais
    → DIRETRIZES 2.8: handoffs (outro hotel, grupo, reclamação, agência, irritado)
    → DIRETRIZES 2.9: transfer
    → Incluir casos específicos do hotel (late checkout, babá, parque, etc.)

14. VALIDAÇÕES
    → DIRETRIZES 2.11: tabela completa
    → Adaptar com FICHA: lotação_maxima_ap, regras day use, validações específicas

15. NÃO FAZER (lista de proibições)
    → DIRETRIZES 2.15: proibições gerais
    → FICHA.terminologia: proibições específicas do hotel
    → Se regime ≠ "all inclusive" → proibir "tudo incluso"/"tudo incluído"
    → Se day_use_mode = "handoff" → proibir coletar/cotar day use
    → Possessivos do hotel PROIBIDOS → usar "o {nome_hotel}"
    → Emojis: apenas Unicode básico (☺☀)

16. FORMATO DE SAÍDA
    → DIRETRIZES 2.13: schema JSON completo
    → Regras de handoff e notify_text
    → Estruturas de dados_multiplos (chave SEMPRE "datas_alternativas")

17. EXEMPLOS (few-shot)
    → Mínimo 8 exemplos adaptados ao hotel:
      Ex1: "Oi" → saudação padrão
      Ex2: N pessoas sem idades → todos adultos → cotação direta
      Ex3: Família mista (bebê + cortesia + pagante conforme faixas do hotel)
      Ex4: 2 perguntas informativas curtas (calibrar brevidade — CRÍTICO)
      Ex5: Múltiplos APs + data relativa → resolução + cotação múltipla
      Ex6: Cliente pede atendente → handoff_only
      Ex7: Grupo/excursão → send_and_handoff
      Ex8: Criança 13+ → JSON com adultos:2, criancas:1 (OBRIGATÓRIO)
    → Se day_use_mode = "handoff" → exemplo de handoff day use
    → Se day_use_mode = "cotar" → exemplo de cotação day use
    → Usar nome, serviços e atrações REAIS do hotel nos exemplos
```

### Regras de qualidade

- **Fidelidade às diretrizes**: 100%. Toda regra do Bloco 2 deve estar incorporada. Se tiver dúvida, releia a diretriz
- **Fidelidade à ficha**: dados exatos. Não inventar atrações, serviços ou características
- **Gold standard**: o prompt gerado deve ter o mesmo nível de detalhe, tom e estrutura do `hotel_internacional_gravatal.js`
- **Sem referências cruzadas**: cada seção do prompt é autocontida ("vide seção X" proibido)
- **Limite ~5000 tokens**: priorizar regras > exemplos > contexto. Se passar, comprimir lista de estrutura e minificar JSONs dos exemplos
- **Não incluir** informações que ninguém pergunta (ISS, detalhes de pagamento, condições de reserva). Só o que a Julia precisa para responder perguntas reais

---

## Passo 3 — Após gerar

1. Marcar na ficha do hotel: `[x] Prompt criado e publicado no n8n`
2. Conferir token count — se passou de 5k, revisar e enxugar
3. Apresentar ao usuário para revisão antes de considerar finalizado
