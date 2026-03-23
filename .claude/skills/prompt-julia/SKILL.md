---
name: prompt-julia
description: Create, review, update, and correct Jul.IA prompts optimized for GPT-4.1 mini. Use this skill whenever the user wants to create a new hotel prompt, review/audit an existing prompt, update a prompt, diagnose/fix production issues, or correct Julia behavior. Also trigger when the user mentions "prompt da julia", "montar prompt", "revisar prompt", "auditar prompt", "corrigir prompt", "a julia tá fazendo X errado", "bug da julia", or any work involving prompts in the prompts/julia/ directory.
---

# Prompt Julia — Create & Review

This skill handles creation and review of Jul.IA prompts optimized for GPT-4.1 mini. Every prompt must follow the project's diretrizes AND the GPT-4.1 mini best practices documented here.

## How GPT-4.1 Mini Processes Prompts

Understanding these behaviors is essential — they drive every decision in this skill:

1. **Literal interpretation**: 4.1 mini follows instructions LITERALLY. "idades → categorizar" (unconditional) behaves differently from "idades informadas → categorizar" (conditional). Every word matters.
2. **End-of-prompt precedence**: When instructions conflict, the one closer to the END wins. Place critical rules at the beginning AND reinforce near the end (sandwich pattern).
3. **Markdown hierarchy**: Headers, bold, lists give 10-13% accuracy boost. Use visual markers to signal importance.
4. **Few-shot examples are the primary calibrator**: The model replicates the pattern it sees in examples more faithfully than textual rules. Examples with explicit Think/Armazena steps teach behavior better than rules alone.
5. **Negative instructions work well**: "Nunca" and "Não" are fine — 4.1 mini respects them better than older models. But always pair with a positive alternative when possible.
6. **Conditional wording is critical**: Removing conditional words ("informadas", "não declaradas", "quando mencionadas") during compression turns conditional instructions into unconditional ones, changing behavior.

## Modes

### Mode: Create (`/prompt-julia create`)

Creates a new hotel prompt from scratch.

**Required inputs:**
- Hotel data (ficha, PDF, briefing, site — any format)
- The hotel's age brackets for cortesia/pagante/adulto

**Process:**
1. Read `prompts/julia/diretrizes_gerais_julia_v8.md` — this is the master guide (Blocos 1-4)
2. Read `prompts/julia/hotel_internacional_gravatal.js` — this is the **gold standard** reference prompt (best structural alignment with diretrizes v8 and GPT-4.1 mini best practices)
3. Optionally read `prompts/julia/termas_park_hotel.js` as secondary reference (original production prompt)
4. Extract hotel data into the Ficha format (Bloco 1 of diretrizes)
4. Present ficha to user for validation
5. Generate prompt following Bloco 3 structure exactly
6. Run the Review Checklist (see below) on the generated prompt before delivering
7. Report any issues found; fix them before final delivery

**Structure rules (from Bloco 3):**
- Output is a JavaScript template literal: `const prompt = \`...\``
- Variable `${now}` referenced (not substituted) — n8n injects at runtime
- Sections in exact order (19 seções): Header → 7 Critical Rules → Idioma → First Message → Hotel Context → Conversation Flow → Discounts → Special Cases → Validations → Tone Reinforcement → Limitations → Output Schema → Examples
- Idioma section standalone obrigatória ("## 🌐 SEMPRE em português brasileiro.") entre R#7 e Primeira Mensagem
- Tom e Estilo reforço obrigatório entre Validações e NÃO FAZER
- Critical rules numbered #1-#7 with visual markers
- Examples section: minimum 8 examples covering all key scenarios
- Target: ~5000 tokens max

### Mode: Review (`/prompt-julia review`)

Audits an existing prompt against best practices.

**Required inputs:**
- Path to the prompt file to review (or paste the prompt)

**Process:**
1. Read the prompt to review
2. Read `prompts/julia/hotel_internacional_gravatal.js` as gold standard reference
3. Read `references/review-checklist.md` for the full checklist
4. Run every check item against the prompt
5. Report findings with severity levels:
   - **CRITICAL** — Will cause wrong behavior in production (e.g., unconditional wording causing proactive questions)
   - **HIGH** — Likely to cause issues under certain inputs (e.g., missing example for edge case)
   - **MEDIUM** — Suboptimal but may not cause visible issues (e.g., missing visual markers)
   - **LOW** — Style/consistency issues (e.g., formatting differences from gold standard)
6. For each finding, explain: what's wrong, why it matters for 4.1 mini, and the specific fix

### Mode: Update (`/prompt-julia update`)

Applies a specific change to an existing prompt following Bloco 4 of the diretrizes.

**Required inputs:**
- Path to the prompt file to update
- Description of the change (add data, add rule, change rule, remove something)

**Process:**
1. Read the prompt + understand the requested change
2. **Detect change type automatically** from Bloco 4:
   - **Type A** — New hotel data (tariff, service, attraction, policy)
   - **Type B** — New behavioral rule (how Julia should act)
   - **Type C** — General rule change (affects all prompts conceptually)
   - **Type D** — Removal (data, rule, example)
3. **Identify ALL affected points** — A single change can ripple across multiple sections:
   - Context/data sections (hotel info, tariffs, services)
   - Rules (#1-#7 and subsections)
   - Validation/flow steps
   - Examples (may need new example, or existing ones may conflict)
   - NÃO FAZER (may need new prohibition or removal of existing one)
   - Tom e Estilo (if change affects communication style)
4. Apply change to ALL identified sections (not just the obvious one)
5. **Run Review Checklist** (`references/review-checklist.md`) on the result — report any new issues introduced by the change
6. Show diff of what changed before delivering

### Mode: Correct (`/prompt-julia correct`)

Diagnoses and fixes wrong Julia behavior in production. This is the debugging mode — takes a symptom (what Julia did wrong) and traces it back to the prompt instruction causing the issue.

**Required inputs:**
- Description of the wrong behavior (text, screenshot, or client print)
- Path to the prompt file to fix

**Process (4 steps):**

#### Step 1: Reproduce
- Parse the reported behavior: what did the client say? What did Julia respond? What should she have done instead?
- Identify the exact failure: wrong question, wrong JSON, wrong tone, wrong handoff, etc.

#### Step 2: Diagnose
- Read the prompt completely
- Consult `references/diagnostic-patterns.md` to match the symptom to a known pattern
- Identify the **root cause** — classify into one of these categories:
  - **Wording incondicional**: a conditional instruction lost its conditional word (ex: "idades → categorizar" vs "idades informadas → categorizar")
  - **Exemplo faltando ou incompleto**: the behavior isn't demonstrated in few-shot examples, or the example doesn't show Think reasoning
  - **Regra fraca / sem destaque**: the rule exists but is buried, not bold, or lacks visual markers
  - **Conflito de instruções**: two instructions push the model in opposite directions (ex: Think forces total calculation → model seeks children info)
  - **Regra ausente**: the behavior simply isn't covered by any instruction
- Report the diagnosis to the user before proceeding with the fix

#### Step 3: Correct
- Apply the fix following GPT-4.1 mini best practices:
  - Use **literal, explicit wording** — no room for interpretation
  - If adding a rule: **reinforce in NÃO FAZER** (sandwich pattern — beginning + end)
  - If behavior is recurrent: **add or improve a few-shot example** demonstrating correct behavior with Think step
  - **Check for conflicts**: verify the fix doesn't contradict other instructions in the prompt
  - If fixing a Think step issue: verify ALL examples that show Think are consistent with the fix

#### Step 4: Validate
- Run the **full Review Checklist** (`references/review-checklist.md`) on the corrected prompt
- Specifically verify the check items related to the diagnosed issue pass
- Report: what was the root cause, what was changed, and whether the checklist passes
- Show diff of all changes made

## Decisões Canônicas (template padrão)

Estas decisões foram padronizadas e devem ser seguidas em qualquer modo (create/review/update):

| Aspecto | Decisão | Justificativa |
|---------|---------|---------------|
| Header | Tom/idioma/estilo em 1 linha | Economia de tokens |
| R#1 | "Resposta COMPLETA = UM bloco JSON..." | Compacta |
| R#2 Think | Bold numerado + ">10→grupo" | Diretrizes 2.12 |
| R#5 | 1 frase | Compacta |
| R#6 | 1 frase | Compacta |
| R#7 | "Máx 3 frases" + 3 bullets | Compacta |
| Idioma | Seção standalone obrigatória | Bloco 3 §9 |
| Descontos | Template completo com resposta entre aspas | Diretrizes 2.10 |
| Casos Especiais | Bold trigger + ação inline | Compacto |
| Validações | Tabela com descrições curtas | Compacto |
| Tom e Estilo | 2-3 linhas reforço | Bloco 3 §16 |
| NÃO FAZER | 4 categorias, bullets SEPARADOS (nunca `\|`) | Interpretação literal GPT-4.1 mini |
| Schema de saída | JSON inline (sem indentação) | Economia de tokens |
| Schema | Sem `opcao_day_use` | Não faz parte do padrão |
| Day use | `mensagem_dayuse` → send_and_handoff. Sem coleta | Diretrizes 2.5 |
| Handoff/notify | Inline (sem sub-headers ###) | Economia de tokens |
| Exemplos | Bold título + Think + Armazena + JSON inline | Alinhados |

## Key References

- `prompts/julia/diretrizes_gerais_julia_v8.md` — Master guide for all prompts (read Bloco 2 for rules, Bloco 3 for structure)
- `prompts/julia/hotel_internacional_gravatal.js` — Gold standard para estrutura (melhor alinhamento com diretrizes v8 + GPT-4.1 mini best practices)
- `prompts/julia/termas_park_hotel.js` — Referência de hotel simples (produção, sem otimizações). Ambos seguem o template canônico
- Read `references/review-checklist.md` for the complete audit checklist with all check items
- Read `references/diagnostic-patterns.md` for known bug patterns and fix recipes (used by correct mode)
- Read `references/gpt41-mini-best-practices.md` for detailed research findings and sources

## Critical Patterns to Always Check

These are the most common failure modes discovered in production:

1. **Think step wording**: Must use conditional language — "idades **informadas**", "NUNCA supor idades **não declaradas**". Unconditional wording causes the model to proactively ask about children.
2. **Children rule reinforcement**: "Não pergunte proativamente" must be standalone, bold, and prominent — not buried in a compressed line.
3. **NÃO FAZER section**: Children rules must be FIRST (end-of-prompt precedence) and marked CRITICAL.
4. **Examples with Think**: The "N pessoas sem idades" example MUST include explicit Think showing "Crianças NÃO mencionadas → NÃO perguntar".
5. **Visual hierarchy**: All 7 critical rules must have visual markers for the model to parse importance.
6. **Compression safety**: When reducing tokens, never lose conditional words, Think/Armazena in examples, visual markers, or standalone rules about children.
7. **Client AP division priority**: When the client specifies AP division (e.g., "2 in each room"), this MUST take priority over any optimization or capacity logic. The flow step for client division must come BEFORE optimization steps. Examples must demonstrate this priority with Think reasoning.
