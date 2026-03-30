# GPT-4.1 Mini — Best Practices for Jul.IA Prompts

Research compiled from official OpenAI documentation and community testing. Sources listed at the end.

---

## 0. No Built-in Chain-of-Thought (Sem Raciocínio Interno)

GPT-4.1 mini is NOT a reasoning model. Unlike o-series models (o1, o3, o4-mini), it does **not** produce an internal chain-of-thought before answering. Without explicit prompting, it jumps straight to a response — skipping any multi-step logic.

**Implication for Julia prompts:**
- This is WHY Julia's `Think:` step exists. It's not optional polish — it's a **structural requirement**
- Without Think, the model skips: age categorization logic, total calculations, AP limit checks, deduction by subtraction
- Every few-shot example MUST demonstrate the Think step so the model learns to reason before outputting JSON
- Inducing explicit planning increases task pass rates by ~4% (OpenAI testing)

**Rule:** Think is not optional polish — it is a structural requirement because the model has no internal reasoning. Remove Think and the model will produce incorrect JSON.

## 1. Literal Instruction Following

GPT-4.1 mini follows instructions more literally than predecessors. It does NOT infer intent from vague prompts.

**Implication for Julia prompts:**
- "idades → categorizar" = unconditional, model will ALWAYS consider children
- "idades informadas → categorizar" = conditional, model only acts when ages were provided
- A single word change can flip behavior from correct to broken

**Rule:** After writing any instruction, ask: "If the model reads this with zero context, will it do what I want?" If the answer depends on inference, rewrite to be explicit.

## 2. Instruction Precedence (End Wins)

When the prompt contains conflicting or repeated instructions, GPT-4.1 mini prioritizes the one closer to the END of the prompt.

**Implication for Julia prompts:**
- Critical rules go at the TOP (read first, establish context)
- Reinforcement of the MOST important rules goes near the END (NÃO FAZER section, Tom e Estilo reforço)
- The NÃO FAZER section's internal ordering matters: first items in the list have LESS weight than last items... BUT since children rules are the most critical, we place them FIRST as a dedicated sub-section with "CRITICO" marker to give them structural prominence even if positionally they're earlier

**Pattern:** Sandwich — important instructions at both beginning and end of the prompt.

## 3. Markdown Hierarchy

GPT-4.1 mini is well-trained on Markdown. Structured prompts with headers, bold, and lists show 10-13% accuracy improvement over plain text.

**Implication for Julia prompts:**
- Use `##` headers for sections, `###` for subsections
- Use `**bold**` for critical terms and rules
- Use visual markers on critical rule headers
- Use tables for structured data (age brackets, validations)
- Use numbered lists for sequential flows
- Use code blocks (` ``` `) for JSON examples and schemas

## 4. Few-Shot Examples as Primary Calibrator

The model replicates the pattern shown in examples more faithfully than it follows textual rules. One clear example outweighs paragraphs of instructions.

**Implication for Julia prompts:**
- The Examples section at the end is the MOST important section for behavior calibration
- Every critical behavior must have a corresponding example
- Examples must show the full Think → Armazena → JSON pattern
- The "N pessoas sem idades → todos adultos" example is the single most important example because it calibrates the children-not-mentioned behavior
- Informative examples calibrate brevity (max 3 sentences)

**Rule:** If a behavior is critical, it needs an example. Rules without examples are suggestions; rules with examples are specifications.

## 5. Negative Instructions

GPT-4.1 mini handles negative instructions ("never", "don't", "não") BETTER than older models. The official OpenAI guide uses them extensively.

**Implication for Julia prompts:**
- Using "nunca" and "não" is fine and effective
- Best practice: pair negative with positive alternative
  - Good: "Nunca pergunte sobre crianças proativamente — coletar SOMENTE se o cliente mencionar"
  - Less good: "Nunca pergunte sobre crianças proativamente"
- The old advice "avoid never because the model might do the opposite" does NOT apply to 4.1 mini

## 6. Prompt Length and Quality

- Context window: 1M tokens input, 32K output (same as full GPT-4.1)
- Needle-in-haystack: 100% accuracy
- Complex multi-hop reasoning degrades with very long contexts — simple fact recall remains reliable, but tasks requiring simultaneous analysis and correlation of information from distant parts of the context degrade significantly
- The degradation is not about finding information (needle-in-haystack is 100%) but about reasoning over multiple pieces of information found in different locations
- Target ~5000 tokens for Julia prompts — beyond ~5700 quality drops for this use case

**Implication for Julia prompts:**
- Compress context (hotel data) more than rules
- Never compress conditional wording or examples
- This matters even though the context window is 1M: Julia requires multi-hop reasoning (read ages → categorize → calculate totals → apply hotel rules). Keeping the prompt compact keeps all rules within the model's effective reasoning window
- If over budget: minify JSON in examples, merge low-priority NÃO FAZER items with pipes, shorten hotel descriptions

## 7. Format Preferences

| Format | Use case | Notes |
|--------|----------|-------|
| Markdown | Default for everything | Best overall performance |
| JSON | Output schema only | Good for structured output, bad for reasoning |
| XML | Not needed | Would work but Markdown is simpler |
| Tables | Age brackets, validations | Clean and well-parsed by 4.1 mini |

## 8. No API-Level Structured Outputs

GPT-4.1 mini does **NOT** support `response_format: {type: "json_schema"}` in the Chat Completions API. Unlike GPT-4o, there is no API-level guarantee of JSON schema conformance. All JSON formatting must be enforced through prompt instructions and few-shot examples.

**Implication for Julia prompts:**
- The JSON schema block embedded in the prompt is **load-bearing**, not decorative — it's the ONLY enforcement mechanism
- Any changes to JSON fields (adding, renaming, removing) MUST be reflected in ALL few-shot examples
- The `<<FIM>>` marker serves as an explicit stop signal that substitutes for API-level output control
- The model CAN produce reliable JSON, but only because the prompt tells it to, not because the API forces it

**Rule:** Treat the prompt-embedded JSON schema and examples as the ONLY enforcement mechanism. They must be perfectly consistent with each other.

## 9. Known Quirks

1. **Sample phrases repeated verbatim** — Unless told to vary, the model will repeat exact phrases from examples. Julia prompts must say "Varie expressões de abertura"
2. **Verbose without formatting guidance** — Without explicit output format, expect excessive prose. Julia's JSON schema + `<<FIM>>` handles this
3. **Parallel tool call errors** — Rare but possible. Julia uses sequential Think → Armazena → JSON
4. **Output cap** — Some users report outputs capping around 6K tokens despite 32K limit. Not an issue for Julia (responses are short)

## 10. Debugging: One Clarifying Sentence

When GPT-4.1 mini's behavior diverges from expectations, a single clarifying sentence added to the prompt is usually sufficient to steer it back. The official OpenAI guide states: *"a single sentence firmly and unequivocally clarifying your desired behavior is almost always sufficient to steer the model on course."*

**Pattern:**
1. Identify the exact divergent behavior (e.g., Julia asks about children unprompted)
2. Write one explicit sentence addressing it (e.g., "Nunca pergunte sobre crianças proativamente — coletar SOMENTE se o cliente mencionar")
3. Place it near the relevant instruction OR in the NÃO FAZER section
4. Test

**Implication for Julia prompts:**
- Fixes should be surgical, not restructurings. Try a one-sentence correction first
- If one sentence doesn't fix it, the problem is structural: missing example, conflicting instructions, or unconditional wording
- This aligns with the diagnostic flow in `references/diagnostic-patterns.md`: identify root cause pattern → apply minimal targeted fix

**Rule:** Try a one-sentence fix before restructuring. If one sentence doesn't fix it, the problem is structural (missing example, conflicting instructions).

---

## Notes for Future Reference

**Agentic patterns:** OpenAI recommends three reminders for agentic workflows that boost performance by ~20%: (1) persistence — "keep going until resolved", (2) tool usage — "use tools, don't guess", (3) planning — "plan extensively before each action". Julia's Think step aligns with the planning reminder. The other two are not directly applicable to Julia's current conversational architecture but are worth considering if Julia evolves toward multi-turn autonomous behavior.

**Migration testing:** Official OpenAI documentation emphasizes that prompts migrated from GPT-4o mini require thorough testing because implicit assumptions no longer hold. GPT-4.1 mini follows instructions literally — rules that "worked because the model inferred intent" in 4o mini will silently break. Any prompt originally written for a different model should be reviewed against this best-practices document before deployment.

---

## Sources

- [GPT-4.1 Prompting Guide — OpenAI Cookbook (Official)](https://developers.openai.com/cookbook/examples/gpt4-1_prompting_guide)
- [Introducing GPT-4.1 in the API — OpenAI (Official)](https://openai.com/index/gpt-4-1/)
- [GPT-4.1 Mini Model — OpenAI API Docs](https://platform.openai.com/docs/models/gpt-4.1-mini)
- [PromptHub: Complete Guide to GPT-4.1](https://www.prompthub.us/blog/the-complete-guide-to-gpt-4-1-models-performance-pricing-and-prompting-tips)
- [ArXiv: Does Prompt Formatting Impact LLM Performance?](https://arxiv.org/html/2411.10541v1)
- [Galaxy AI: GPT-4.1 Mini vs GPT-4o Mini Comparison](https://blog.galaxy.ai/compare/gpt-4-1-mini-vs-gpt-4o-mini)
- [Getzep: GPT-4.1 Long-Context Analysis](https://blog.getzep.com/gpt-4-1-and-o4-mini-is-openai-overselling-long-context/)
- [OpenAI Structured Outputs — Supported Models](https://developers.openai.com/api/docs/guides/structured-outputs)
