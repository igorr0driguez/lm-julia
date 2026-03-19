# GPT-4.1 Mini — Best Practices for Jul.IA Prompts

Research compiled from official OpenAI documentation and community testing. Sources listed at the end.

---

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
- Complex multi-hop reasoning degrades with very long contexts
- Target ~5000 tokens for Julia prompts — beyond ~5700 quality drops for this use case

**Implication for Julia prompts:**
- Compress context (hotel data) more than rules
- Never compress conditional wording or examples
- If over budget: minify JSON in examples, merge low-priority NÃO FAZER items with pipes, shorten hotel descriptions

## 7. Format Preferences

| Format | Use case | Notes |
|--------|----------|-------|
| Markdown | Default for everything | Best overall performance |
| JSON | Output schema only | Good for structured output, bad for reasoning |
| XML | Not needed | Would work but Markdown is simpler |
| Tables | Age brackets, validations | Clean and well-parsed by 4.1 mini |

## 8. Known Quirks

1. **Sample phrases repeated verbatim** — Unless told to vary, the model will repeat exact phrases from examples. Julia prompts must say "Varie expressões de abertura"
2. **Verbose without formatting guidance** — Without explicit output format, expect excessive prose. Julia's JSON schema + `<<FIM>>` handles this
3. **Parallel tool call errors** — Rare but possible. Julia uses sequential Think → Armazena → JSON
4. **Output cap** — Some users report outputs capping around 6K tokens despite 32K limit. Not an issue for Julia (responses are short)

---

## Sources

- [GPT-4.1 Prompting Guide — OpenAI Cookbook (Official)](https://developers.openai.com/cookbook/examples/gpt4-1_prompting_guide)
- [Introducing GPT-4.1 in the API — OpenAI (Official)](https://openai.com/index/gpt-4-1/)
- [GPT-4.1 Mini Model — OpenAI API Docs](https://platform.openai.com/docs/models/gpt-4.1-mini)
- [PromptHub: Complete Guide to GPT-4.1](https://www.prompthub.us/blog/the-complete-guide-to-gpt-4-1-models-performance-pricing-and-prompting-tips)
- [ArXiv: Does Prompt Formatting Impact LLM Performance?](https://arxiv.org/html/2411.10541v1)
