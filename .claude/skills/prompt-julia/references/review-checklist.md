# Review Checklist — Jul.IA Prompts for GPT-4.1 Mini

Run every item against the prompt being reviewed. Report severity and specific fix for each failure.

---

## 1. Structure & Format

| # | Check | Severity | What to look for |
|---|-------|----------|-----------------|
| 1.1 | JavaScript template literal | CRITICAL | Must be `const prompt = \`...\`` returning `[{ json: { prompt } }]` |
| 1.2 | `${now}` referenced, not hardcoded | CRITICAL | Variable must be `\${now}` in template literal — n8n injects at runtime |
| 1.3 | Section order matches Bloco 3 | HIGH | Header → 7 Rules → First Msg → Context → Flow → Discounts → Special Cases → Validations → Tone → Limitations → Schema → Examples |
| 1.4 | 7 critical rules present and numbered | HIGH | All 7 rules from diretrizes must exist: Output Format, Tools, One Question, Age Categorization, Direct Quote, Security, Short Responses |
| 1.5 | Visual markers on critical rules | MEDIUM | Headers should use visual markers (e.g., emoji) to signal hierarchy to the model |
| 1.6 | Token count ~5000 or under | MEDIUM | Count approximate tokens. Over 5700 degrades 4.1 mini performance |

## 2. Think Step (REGRA CRITICA #2)

| # | Check | Severity | What to look for |
|---|-------|----------|-----------------|
| 2.1 | Conditional wording for children | CRITICAL | Must say "idades **informadas**" (not "idades"). Must say "NUNCA supor idades **não declaradas**" (not just "NUNCA supor idades") |
| 2.2 | No forced total calculation | HIGH | Think should NOT force "calcular total de pessoas antes de tudo" — this pushes the model to seek children info. Use "Se >10 → grupo" as a check, not a prerequisite calculation |
| 2.3 | Analysis items present | MEDIUM | Think must analyze: service type, first msg vs continuation, collected/missing data, next single data point, quote or handoff |
| 2.4 | Date resolution instruction | MEDIUM | Must instruct to resolve weekday/relative dates to DD/MM/YYYY via `${now}` |

## 3. Children Handling

| # | Check | Severity | What to look for |
|---|-------|----------|-----------------|
| 3.1 | "Não pergunte proativamente" is standalone and bold | CRITICAL | Must be a prominent, bold line — not compressed into a generic list item. Compare with Termas Park gold standard |
| 3.2 | Flow step "sem crianças → todos adultos" | CRITICAL | Must exist as explicit numbered step in the Hospedagem flow |
| 3.3 | NÃO FAZER has children rules FIRST | HIGH | Children-related prohibitions must be the first group in the NÃO FAZER section (end-of-prompt precedence in 4.1 mini) |
| 3.4 | NÃO FAZER children rules marked as critical | HIGH | Should have a "CRITICO" or similar marker to differentiate from other prohibitions |
| 3.5 | No unconditional children references in Think | CRITICAL | Think step must NOT treat children as a constant checklist item. Only process children IF mentioned by client |

## 4. Age Categorization (REGRA CRITICA #4)

| # | Check | Severity | What to look for |
|---|-------|----------|-----------------|
| 4.1 | Age brackets match hotel's ficha | CRITICAL | Cortesia/pagante/adulto ranges must match the specific hotel, not be generic |
| 4.2 | Baby rule (0-2) is universal and explicit in JSON | HIGH | Babies (0-2) never enter quote, never count in physical total — must be explicit. Must also state: bebês NÃO entram em `idades_criancas` nem em `criancas` — vão SOMENTE em `bebes`. Verify NÃO FAZER has explicit prohibition against including 0-2 in `idades_criancas` |
| 4.6 | Fractional ages (e.g., "2 anos e meio") | MEDIUM | Prompt must instruct to truncate fractional ages (arredondar para baixo): "2 anos e meio" = idade 2 = bebê. Never round up |
| 4.3 | 13+ JSON rule with ATENÇÃO warning | HIGH | Must have explicit warning that 13+ children go in `idades_criancas`, NOT in `adultos`. Must use "Tarifa adulto" (not just "Adulto") in table |
| 4.4 | Categorization examples present | MEDIUM | At least 2-3 inline examples showing mixed families with correct categorization |
| 4.5 | `adultos` field definition explicit | HIGH | Must state: `adultos` = only who the client called adult. Never reclassify children as adults in JSON |

## 5. Quotation Flow

| # | Check | Severity | What to look for |
|---|-------|----------|-----------------|
| 5.1 | Collection order explicit | HIGH | Must state: entry date → exit date → adults → children (only if mentioned) |
| 5.2 | Direct quote without confirmation | HIGH | `pronto_para_cotacao: true` immediately when data complete — no recap, no confirmation |
| 5.3 | Group rule (>10) before AP limit rule | HIGH | Check for >10 people BEFORE checking AP capacity. >10 = immediate handoff, no AP splitting |
| 5.4 | Email: register if offered, never ask | MEDIUM | Must be explicit that email never blocks quotation |
| 5.5 | Multiple APs/dates handled | MEDIUM | `cotacao_multipla`, `dados_multiplos` with correct key `datas_alternativas` (never `datas`) |
| 5.6 | Client-specified AP division step exists | HIGH | Must have explicit step "client specified division → cotacao_multipla direto" in hospedagem flow, BEFORE any optimization or capacity step |
| 5.7 | NÃO FAZER prohibits ignoring client division | HIGH | Must prohibit both: (1) ignoring client-specified AP division, (2) suggesting AP division proactively when client didn't mention it |

## 6. Output Schema

| # | Check | Severity | What to look for |
|---|-------|----------|-----------------|
| 6.1 | Schema matches diretrizes 2.13 | HIGH | All fields present: message, etapa, tipo_servico, dados_coletados, pronto_para_cotacao, cotacao_multipla, dados_multiplos, handoff, notify_text, confidence, reason |
| 6.2 | `<<FIM>>` terminator | HIGH | Must instruct to write `<<FIM>>` after closing `}` and STOP |
| 6.3 | Handoff values documented | MEDIUM | none, handoff_only, send_and_handoff with clear triggers |
| 6.4 | `dados_multiplos` structures documented | MEDIUM | multiplos_apartamentos, multiplas_datas, combinado — all with correct field names |

## 7. Examples Section

| # | Check | Severity | What to look for |
|---|-------|----------|-----------------|
| 7.1 | Minimum 8 examples present | HIGH | Ex1:Greeting, Ex2:All adults, Ex3:Mixed family, Ex4:Informative(2 scenarios), Ex5:Multiple APs, Ex6:Handoff, Ex7:Group, Ex8:Child with adult tariff |
| 7.2 | "N pessoas" example has explicit Think | CRITICAL | The all-adults example MUST show Think with "Crianças NÃO mencionadas → NÃO perguntar". This is the primary calibrator for 4.1 mini |
| 7.3 | Child 13+ example present | HIGH | Must show: adultos:2, criancas:1, idades:[13+age] — NEVER adultos:3 |
| 7.4 | Informative example shows brevity | HIGH | Must demonstrate max 3 sentences + positive framing + offer for quote |
| 7.5 | Examples use hotel's real data | MEDIUM | Hotel name, services, values must match the hotel being prompted |
| 7.6 | Think/Armazena pattern visible in examples | MEDIUM | At least the critical examples (greeting, all-adults, mixed family) should show Think reasoning |

## 8. Tone, Style & Prohibitions

| # | Check | Severity | What to look for |
|---|-------|----------|-----------------|
| 8.1 | Tom e Estilo section exists as reinforcement | MEDIUM | Should appear near end of prompt (before NÃO FAZER) as a reminder — 4.1 mini end-of-prompt precedence |
| 8.2 | Possessives rule correct | MEDIUM | "nosso hotel" prohibited, "nosso especialista" allowed |
| 8.3 | "Tudo incluso" rule matches regime | HIGH | Prohibited unless hotel is all-inclusive. Pensão completa = never use "tudo incluso" |
| 8.4 | Unicode emoji rule | MEDIUM | Only basic Unicode (e.g., ☺☀), no modern emoji (😊🏨) — API Kommo compatibility |
| 8.5 | NÃO FAZER section organized by category | MEDIUM | Grouped (children, quotation, info/style, technical) rather than flat list — easier for model to parse |

## 9. Hotel-Specific Content

| # | Check | Severity | What to look for |
|---|-------|----------|-----------------|
| 9.1 | Scope declaration present | HIGH | Must state "SOMENTE [hotel name]" |
| 9.2 | Transfer rule present | MEDIUM | Most hotels don't offer transfer — must be explicit |
| 9.3 | Day use mode correct | HIGH | If `day_use_mode = "handoff"`: any day use mention → handoff_only. If "cotar": full flow present |
| 9.4 | Special cases from hotel ficha included | MEDIUM | Terminology, attractions, specific rules |
| 9.5 | First message matches hotel name | LOW | Greeting must reference the correct hotel |
| 9.6 | Payment terms correct | MEDIUM | Entry percentage, payment methods must match hotel |

## 10. Compression Safety (run ONLY when prompt was reduced from a larger version)

| # | Check | Severity | What to look for |
|---|-------|----------|-----------------|
| 10.1 | Conditional words preserved | CRITICAL | "informadas", "não declaradas", "quando mencionadas", "se mencionar" — these must survive compression |
| 10.2 | Think/Armazena in examples preserved | HIGH | Critical examples must still show Think reasoning, not just JSON |
| 10.3 | Visual markers preserved | MEDIUM | Emoji markers, bold text, header levels must survive |
| 10.4 | Standalone rules not merged | HIGH | "Não pergunte proativamente" must remain its own line, not merged into another rule |
| 10.5 | Tom e Estilo reinforcement preserved | MEDIUM | Must still exist as separate section near end of prompt |
