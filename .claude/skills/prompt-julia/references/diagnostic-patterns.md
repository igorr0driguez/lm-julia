# Padrões de Diagnóstico — Jul.IA Prompts (GPT-4.1 Mini)

Catálogo de padrões para diagnosticar e corrigir comportamentos errados da Julia em produção. Cada padrão é baseado em bugs reais ou cenários de alto risco identificados durante operação.

---

## Como usar este catálogo

1. Leia o sintoma reportado pelo usuário
2. Encontre o padrão mais próximo abaixo
3. Siga "Onde procurar" para localizar a causa no prompt
4. Aplique o "Fix pattern" seguindo as best practices do 4.1 mini

---

## Padrão 1: Julia pergunta algo que o cliente não mencionou

**Sintoma:** Cliente diz "2 pessoas, 10 a 15 de março" e Julia pergunta sobre crianças, mesmo sem ninguém ter mencionado crianças.

**Causa comum:**
- Wording incondicional no Think step (ex: "idades → categorizar" em vez de "idades **informadas** → categorizar")
- Exemplo de "N pessoas" sem Think explícito mostrando "Crianças NÃO mencionadas → NÃO perguntar"
- Think forçando "calcular total de pessoas antes de tudo", o que leva o modelo a buscar informação de crianças

**Onde procurar:**
- Regra #4 (Think step / categorização de idades)
- Exemplos: o exemplo de "N pessoas sem idades" (geralmente Ex2 ou Ex3)
- Qualquer step que force cálculo de total de hóspedes antes de coletar dados

**Fix pattern:**
1. Adicionar palavra condicional: "idades **informadas**" em vez de "idades"
2. No exemplo "N pessoas", adicionar Think com: `Crianças NÃO mencionadas → NÃO perguntar`
3. Remover ou condicionar qualquer cálculo forçado de total no Think
4. Reforçar no NÃO FAZER: `❌ CRÍTICO: Perguntar sobre crianças quando o cliente não mencionou`

---

## Padrão 2: Julia repete informação já dada pelo cliente

**Sintoma:** Cliente diz "quero 10 a 15 de março" e Julia responde "Ótimo! Para o período de 10 a 15 de março, quantos adultos serão?"

**Causa comum:**
- Exemplo de continuação (não-saudação) faltando ou mostrando recap dos dados
- Regra de brevidade fraca ou ausente
- Saudação mostra padrão de repetir dados que o modelo generaliza para todas as respostas

**Onde procurar:**
- Exemplos: comparar exemplo de saudação vs exemplo de continuação
- Tom e Estilo: regra de brevidade
- Fluxo de conversa: se há instrução de "confirmar dados recebidos"

**Fix pattern:**
1. Garantir que exemplos de continuação NÃO repetem dados do cliente
2. Adicionar regra explícita: "Nunca repita dados que o cliente acabou de informar"
3. Se regra de brevidade existe mas é fraca, torná-la bold e standalone

---

## Padrão 3: Julia dá resposta longa demais

**Sintoma:** Respostas com 5+ linhas, múltiplos parágrafos, explicações desnecessárias.

**Causa comum:**
- Exemplo informativo mostrando resposta longa
- Regra #7 (respostas curtas) sem exemplo demonstrando brevidade
- Tom e Estilo sem limite explícito de frases

**Onde procurar:**
- Regra #7 (respostas curtas)
- Exemplos: todos os exemplos — verificar se algum tem resposta longa
- Tom e Estilo: verificar se há limite de frases/linhas

**Fix pattern:**
1. Exemplo informativo: máximo 3 frases + enquadramento positivo + oferta de cotação
2. Regra #7: adicionar "máximo 3 frases por resposta" se ausente
3. Revisar TODOS os exemplos para garantir que nenhum ultrapassa o limite

---

## Padrão 4: Julia usa termo proibido

**Sintoma:** Julia diz "tudo incluso" (hotel é pensão completa), ou "nosso hotel", ou usa emoji moderno.

**Causa comum:**
- Termo proibido não está no NÃO FAZER
- Termo está no NÃO FAZER mas longe do final (baixa precedência no 4.1 mini)
- Termo correto não está documentado como alternativa positiva

**Onde procurar:**
- NÃO FAZER: verificar se o termo está listado
- Posição do NÃO FAZER: deve estar perto do final do prompt
- Contexto do hotel: verificar se o termo correto está documentado
- Tom e Estilo: verificar regras de possessivos e terminologia

**Fix pattern:**
1. Adicionar ao NÃO FAZER com ❌ marker se ausente
2. Adicionar alternativa positiva: "Use X em vez de Y"
3. Se termo é crítico (ex: regime alimentar), marcar como CRÍTICO no NÃO FAZER
4. Verificar se algum exemplo usa o termo proibido e corrigir

---

## Padrão 5: Julia faz mais de uma pergunta por mensagem

**Sintoma:** "Qual a data de entrada? E quantos adultos serão?" numa só mensagem.

**Causa comum:**
- Regra #3 (uma pergunta por vez) sem exemplo demonstrando ❌ errado vs ✅ correto
- Exemplos mostrando duas perguntas na mesma mensagem
- Fluxo listando dados a coletar sem enfatizar "um por vez"

**Onde procurar:**
- Regra #3 (uma pergunta por vez)
- Exemplos: verificar se algum exemplo faz duas perguntas
- Fluxo de conversa: verificar se a instrução "um dado por vez" é explícita

**Fix pattern:**
1. Regra #3: adicionar exemplo inline ❌/✅ se ausente
2. Verificar e corrigir exemplos que fazem mais de uma pergunta
3. Reforçar no NÃO FAZER: "Fazer mais de uma pergunta por mensagem"

---

## Padrão 6: Julia confirma dados antes de cotar

**Sintoma:** Cliente dá todos os dados e Julia responde "Deixe-me confirmar: entrada dia 10, saída dia 15, 2 adultos. Está correto?"

**Causa comum:**
- Regra #5 (cotação direta) fraca ou sem ênfase visual
- Exemplo de cotação mostrando etapa de confirmação
- Wording como "verificar dados" no fluxo que o modelo interpreta como confirmar com cliente

**Onde procurar:**
- Regra #5 (cotação direta sem confirmação)
- Exemplos: o exemplo de cotação completa
- Fluxo de conversa: wording dos steps de cotação

**Fix pattern:**
1. Regra #5: tornar bold, com marker visual, e texto explícito: "NUNCA recapitular dados para confirmação"
2. Exemplo de cotação: mostrar Think → `pronto_para_cotacao: true` sem mensagem de confirmação
3. NÃO FAZER: adicionar "Confirmar/recapitular dados antes de cotar"

---

## Padrão 7: Julia classifica criança como adulto no JSON

**Sintoma:** Cliente diz "2 adultos e 1 filho de 14 anos". JSON retorna `adultos: 3` em vez de `adultos: 2, criancas: 1, idades_criancas: [14]`.

**Causa comum:**
- Exemplo de criança 13+ ausente ou incompleto
- ATENÇÃO/warning sobre 13+ fraco ou mal posicionado
- Tabela de categorização usando "Adulto" em vez de "Tarifa adulto" para faixa 13+, confundindo o modelo
- Campo `adultos` sem definição explícita ("só quem o cliente chamou de adulto")

**Onde procurar:**
- Regra #4: tabela de categorização — verificar se 13+ diz "Tarifa adulto" (não "Adulto")
- Regra #4: definição do campo `adultos`
- ATENÇÃO/warning pós-tabela sobre 13+ no JSON
- Exemplos: exemplo de criança 13+ (geralmente Ex8)

**Fix pattern:**
1. Tabela: usar "Tarifa adulto" (nunca só "Adulto") para faixa 13+
2. Definição de `adultos`: "SOMENTE quem o cliente chamou de adulto"
3. ATENÇÃO com ⚠️: "Criança 13+ vai em `idades_criancas`, NUNCA em `adultos`"
4. Exemplo Ex8: mostrar explicitamente `adultos:2, criancas:1, idades:[14]` (nunca `adultos:3`)

---

## Padrão 8: Julia não faz handoff quando deveria

**Sintoma:** Cliente pede algo fora do escopo (evento, transfer, reclamação) e Julia tenta responder em vez de transferir.

**Causa comum:**
- Caso especial ausente na lista de gatilhos de handoff
- Gatilho existe mas não usa `handoff_only` explicitamente
- Wording ambíguo como "encaminhar se necessário" em vez de "SEMPRE transferir"

**Onde procurar:**
- Casos Especiais: lista de gatilhos de handoff
- Limitações: regra de escopo
- Output Schema: valores de `handoff` e seus gatilhos

**Fix pattern:**
1. Adicionar caso especial com gatilho explícito e valor `handoff_only`
2. Wording incondicional: "SEMPRE transferir" (não "encaminhar se necessário")
3. Se é um caso frequente, adicionar exemplo mostrando o handoff
4. Reforçar nas Limitações: listar explicitamente o que está fora do escopo

---

## Padrão 9: Julia inclui bebês (0-2) em idades_criancas

**Sintoma:** Cliente diz "2 adultos e criança de 2 anos" e Julia retorna `criancas:1, idades_criancas:[2]` em vez de `criancas:0, bebes:1, idades_criancas:[]`. Cotação cobra por bebê indevidamente.

**Causa comum:**
- `idades_criancas` definido como "idades reais de TODAS as crianças" — modelo interpreta literalmente e inclui 0-2
- Falta regra explícita dizendo que 0-2 NÃO vai em `idades_criancas` nem em `criancas`
- Único exemplo com bebê ativa otimização comercial (ex: físico=4, exclusiva de alguns hotéis), escondendo o tratamento correto do bebê no JSON
- Idade fracionária ("2 anos e meio") arredondada para 3 pelo modelo
- NÃO FAZER sem proibição explícita de incluir 0-2 em `idades_criancas`

**Onde procurar:**
- Regra #4: definição de `idades_criancas` — deve dizer "crianças de 3+" (não "TODAS as crianças")
- ATENÇÃO pós-tabela: deve ter bloco separado para bebês similar ao bloco de 13+
- Exemplos: deve existir exemplo com bebê SEM otimização comercial, mostrando `criancas:0, bebes:1, idades_criancas:[]`
- NÃO FAZER: deve ter proibição explícita sobre idades 0-2 em `idades_criancas`
- n8n (safety net): `trata_dados1.js` e `trata_multiplos_dados.js` devem filtrar `.filter(idade => idade >= 3)`

**Fix pattern:**
1. Definição: mudar "TODAS as crianças" para "crianças de 3+ (inclusive 13+). Bebês (0–2) NÃO entram"
2. Adicionar bloco ⚠️ ATENÇÃO — Bebês (0–2) no JSON, com exemplo inline: "Casal + criança de 2" → adultos:2, criancas:0, bebes:1, idades_criancas:[]. NUNCA criancas:1 ou idades_criancas:[2]
3. Adicionar exemplo completo (Think → JSON) com bebê SEM otimização comercial
4. NÃO FAZER: adicionar "Incluir idades 0–2 em `idades_criancas` ou contar bebês em `criancas`"
5. Idades fracionárias: instruir a truncar (arredondar para baixo) — "2 anos e meio" = idade 2 = bebê
6. Safety net no n8n: `.filter(idade => idade >= 3)` antes do `.sort()`

---

## Padrão 10: Julia ignora divisão de APs pedida pelo cliente (antigo Padrão 9)

**Sintoma:** Cliente pede "4 pessoas, 2 em cada quarto" e Julia cota 4 pessoas em AP único, ignorando a divisão.

**Causa comum:**
- Step de "cliente especificou divisão" vem DEPOIS de otimizações ou regras de capacidade no fluxo
- Regra de divisão fraca (uma linha sem destaque, sem exemplo)
- Otimização comercial hotel-specific (ex: físico=4 no Internacional) dispara antes e sobrepõe a divisão
- Único exemplo multi-AP tem total que não conflita com otimizações
- Modelo interpreta multi-AP como algo que só existe para resolver limite de capacidade, não como respeito à preferência do cliente

**Onde procurar:**
- Fluxo de coleta (Condução da Conversa): posição do step "divisão do cliente" em relação a otimizações
- Regras de otimização comercial (se existirem no hotel): verificar se têm ressalva "em AP único" / "não aplica se cliente dividiu"
- Exemplos: verificar se existe exemplo multi-AP com total que conflita com otimização
- NÃO FAZER: verificar se proíbe ignorar divisão do cliente

**Fix pattern:**
1. Mover step "cliente especificou divisão" para ANTES de qualquer otimização/capacidade no fluxo
2. Destacar com ⚠️ e wording forte: "SEMPRE respeitar", "tem PRIORIDADE"
3. Se hotel tiver otimização comercial: adicionar ressalva "em AP único" / "não aplica se cliente dividiu em APs"
4. Adicionar exemplo multi-AP mostrando Think com raciocínio de prioridade da divisão do cliente
5. Adicionar ao NÃO FAZER: "Ignorar divisão de APs que o cliente especificou"
6. Adicionar regra REATIVO: "só quando cliente mencionar — NUNCA sugerir divisão proativamente"
