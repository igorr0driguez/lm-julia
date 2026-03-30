# Lagos de Jurema

## Identificador

- hotel_resort param: lagos_de_jurema
- Pipeline ID:
- Nome do pipeline no Kommo: Lagos de Jurema

## Status de implementação

- [x] Etapas JUL.IA ATIVADA e JUL.IA DESATIVADA criadas no pipeline
- [x] Gatilho do salesbot "Chamar Jul.IA" configurado na etapa JUL.IA ATIVADA
- [ ] Robô de Entrada configurado (campos, etapa, condicionais)
- [x] Atualizar Dicionário Pipeline:Salesbot ID no Workflow Enviar Fotos
- [x] Salesbot Enviar Fotos configurado
- [ ] hotel_resort configurado corretamente no Robô de Entrada
- [x] Material do hotel coletado
- [x] Ficha preenchida (ver seção abaixo)
- [x] Prompt criado e publicado no n8n
- [x] Revisar Prompt
- [x] Atualizar n8n: Config Hoteis
- [x] Atualizar n8n: Monta mensagem Orcamento1
- [x] Atualizar n8n: Monta mensagem Multipla
- [x] Validação interna (chat de testes)
- [ ] Validação com o cliente
- [ ] Validação de cotação (caso extremo)
- [ ] Primeiro atendimento real validado

---

## Ficha do Hotel

> Baseada no Bloco 1 das diretrizes_gerais_julia.md. Preencher antes de criar o prompt.

```
=== IDENTIFICAÇÃO ===
nome_hotel: "Lagos de Jurema"
localizacao: ""
escopo: "SOMENTE Lagos de Jurema"

=== REGIME E ESTRUTURA ===
regime_hospedagem: "pensão completa — 3 refeições/dia"
regime_bebidas: "NÃO incluso — bebidas cobradas à parte nos bares"
tipos_quarto: "Standard | Master | Suíte | Suíte Master | Premium | Suíte Premium"
lotacao_maxima_ap: 5
checkin: "a partir das 17h"
checkout: "até às 15h"
refeicoes_detalhadas: "café da manhã (07h30–10h), almoço (12h–15h), chá da tarde (16h30–17h30), jantar (19h–22h)"

=== DESTAQUES E ESTRUTURA ===
destaques: "águas termais naturais a 42°C, Family Resort, pensão completa, complexo de piscinas termais, circuito de relaxamento (banho de lama negra, ofurô, hidromassagem), SPA Jurema, recreação para todas as idades, 184 acomodações"
recreacao_inclusa: "piscinas termais, banho de lama negra, ofurôs, piscina de hidromassagem ao ar livre, saunas, chás e chimarródromo, recreações monitoradas, passeios ecológicos e trilhas, hidroginástica, biribol, futevôlei, beach tennis, tênis, futebol de campo, Casa da Jureminha (crianças até 4 anos com responsável), danceteria, Teatro Boutique (Show da Casa — todas as noites), Revoada das Garças, Gruta de Nossa Senhora de Lourdes, Circuito de Relaxamento"
servicos_terceirizados: "SPA Jurema (massagens, banhos, terapias — mais de 40 procedimentos, valores à parte)"
outras_estruturas: "Celeiro Restaurante (opções vegetarianas, veganas e restrição alimentar), Bar do Parque Aquático (24h), Bar da Piscina Coberta (06h–02h), Boutique, Empório do Chá e Horto, Bistrô SPA Jurema, Boutique SPA Jurema, cavalariça, lagos de pesca"
atracoes_especificas: "Revoada das Garças: todos os dias às 18h (reunião nas árvores) e 06h30 (voo) | Show da Casa: todas as noites no Teatro Boutique | Circuito de Aventura (tirolesa e arborismo): consultar valores"
parque_externo: ""
mascotes: ""
transfer: "NÃO oferece"

=== FAIXAS ETÁRIAS — HOSPEDAGEM ===
cortesia_hospedagem: "3–12 anos → cortesia (até 2 crianças por acomodação)"
pagante_hospedagem: "13–14 anos → tarifa criança"
adulto_hospedagem: "a partir de 15 anos"

=== DAY USE ===
day_use_mode: "handoff"
# Se "cotar": preencher os campos abaixo. Se "handoff": deixar em branco.

=== FAIXAS ETÁRIAS — DAY USE ===
cortesia_dayuse: ""
meia_dayuse: ""
pagante_dayuse: ""
adulto_dayuse: ""

=== DAY USE — PACOTES ===
pacotes_dayuse: |
  -
horario_dayuse: ""
minimo_pagantes_dayuse: ""

=== PAGAMENTO ===
pagamento_hospedagem: ""
pagamento_dayuse: ""

=== PRIMEIRA MENSAGEM ===
primeira_mensagem: |
  Olá, Seja Bem-Vindo(a)!
  Eu sou a JÚLIA ☺, sua assistente virtual da Central de Reservas L&M – Lagos de Jurema.

  Antes de continuarmos, preciso de algumas informações para montar seu orçamento:

  ☀ Qual seria a data de entrada prevista?
  ☀ Qual seria a data de saída prevista?
  - Quantos adultos ficarão no quarto?
  - Há crianças? Se sim, qual a idade de cada uma?

  ☺ Com essas informações consigo montar seu orçamento completo!

=== CASOS ESPECIAIS DO HOTEL ===
casos_especiais: |
  - Atividades e áreas de lazer compartilhadas com o Jardins de Jurema (exceto refeições e pernoites — cada hóspede usa o restaurante do resort contratado)
  - Serviços com fichas (pagos à parte): cavalos e charrete, pedalinhos, carrinho elétrico, patinetes e motociclos elétricos, bicicletas (locação), jogos eletrônicos, sinuca, tênis de mesa, tirolesa e arborismo, pesca esportiva
  - SPA Jurema: terceirizado, valores à parte
  - Bebidas: cobradas à parte nos bares
  - Casa da Jureminha: crianças até 4 anos, somente acompanhadas de responsável
  - Restrições alimentares: consultar disponibilidade com antecedência junto à recepção
  - "Termas de Jurema" é o nome antigo do resort — reconhecer como referência ao Lagos de Jurema, usar o nome atual nas respostas

=== TERMINOLOGIA PROTEGIDA ===
terminologia: |
  - nunca usar "tudo incluso"/"tudo incluído" — regime é "pensão completa"
  - usar "águas termais" (nunca "águas quentes" ou "piscinas aquecidas") — emergem a 42°C da fonte
```

---

## Prompt Julia — particularidades

(o que muda em relação ao prompt base — preencher após criar o prompt)

## Observações operacionais

(regras específicas, restrições, histórico de alterações relevantes)
