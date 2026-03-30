# Jardins de Jurema

## Identificador

- hotel_resort param: jardins_de_jurema
- Pipeline ID:
- Nome do pipeline no Kommo: Jardins de Jurema

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
nome_hotel: "Jardins de Jurema"
localizacao: "BR-487, KM 237,5 — Iretama/PR"
escopo: "SOMENTE Jardins de Jurema"

=== REGIME E ESTRUTURA ===
regime_hospedagem: "pensão completa — café da manhã, almoço e jantar"
regime_bebidas: "NÃO incluso — bebidas cobradas à parte nos bares"
tipos_quarto: "Superior (36m², 1 casal + 1 solteiro) | Premium (37m², 1 casal king) | Superior Plus (43m², 1 casal + 1 ou 3 solteiro)"
lotacao_maxima_ap: 5
checkin: "a partir das 17h"
checkout: "até às 15h"
refeicoes_detalhadas: "café da manhã (07h30–10h), almoço (12h–15h), chá da tarde (16h30–17h30), jantar (19h–22h)"

=== DESTAQUES E ESTRUTURA ===
destaques: "águas termais naturais a 42°C, Convention & Termas Resort, pensão completa, complexo de piscinas termais, SPA Jurema (40+ procedimentos), centro de eventos para mais de 1000 pessoas, 152 apartamentos em 4 prédios, quartos de 36m² a 43m²"
recreacao_inclusa: "piscinas termais, ofurôs (águas entre 32°C e 38°C), piscina de hidromassagem ao ar livre (42°C), banho de lama negra, saunas, piscinas cobertas, piscina fria, passeios ecológicos e trilhas, recreação infantil monitorada (Espaço Baby 1–4 anos, Espaço Kids 4–10 anos), hidroginástica, beach tennis, vôlei de areia/futevôlei, tênis, futebol society, biribol, mini golf (9 buracos), FootSnooker, academia, redários, chás e chimarródromo, Espaço Conectar (coworking)"
servicos_terceirizados: "SPA Jurema (mais de 40 procedimentos — banhos, massagens, terapias, fangoterapia — valores à parte), Bistrô SPA Jurema (lanches, sucos, chás), Boutique SPA Jurema (cosméticos e linha SPA Jurema)"
outras_estruturas: "Restaurante Buffet Gardênia (pensão completa — café, almoço, jantar), Restaurante A la carte Flor da Mata (valores à parte), Lounge Espaço Bambu/Cave, Adega (carta de vinhos — reserva), Bar Molhado Vitória Régia, Bar Molhado Flor de Lótus, Sports Bar (sinuca, fliperama, TV esportes), Espaço do Chá, Boutique Jardins, Baby Room (berço, cozinha equipada), Espaço Conectar (coworking), Espaço Jogos Teen (fliperama, air hockey, pinball)"
atracoes_especificas: "Centro de Eventos Jardins: 9–10 salas, mais de 1000 pessoas simultâneas — feiras, workshops, treinamentos, convenções"
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
pagamento_hospedagem: "parcelamento sem juros em até 12x dependendo do valor da reserva — detalhes informados na cotação"
pagamento_dayuse: ""

=== PRIMEIRA MENSAGEM ===
primeira_mensagem: |
  Olá, Seja Bem-Vindo(a)!
  Eu sou a JÚLIA ☺, sua assistente virtual da Central de Reservas L&M – Jardins de Jurema.

  Antes de continuarmos, preciso de algumas informações para montar seu orçamento:

  ☀ Qual seria a data de entrada prevista?
  ☀ Qual seria a data de saída prevista?
  - Quantos adultos ficarão no quarto?
  - Há crianças? Se sim, qual a idade de cada uma?

  ☺ Com essas informações consigo montar seu orçamento completo!

=== CASOS ESPECIAIS DO HOTEL ===
casos_especiais: |
  - Atividades e áreas de lazer compartilhadas com o Lagos de Jurema (exceto refeições e pernoites — cada hóspede usa o restaurante do resort contratado)
  - Passarela conecta Jardins ao Lagos de Jurema
  - Serviços com fichas (pagos à parte): cavalos, charretes, pedalinhos, carrinho elétrico, bicicletas/triciclos (locação), patinetes, jogos eletrônicos, sinuca
  - SPA Jurema: terceirizado, valores à parte (40+ procedimentos)
  - Restaurante Flor da Mata (à la carte): valores à parte — não faz parte da pensão completa
  - Adega: reserva antecipada, valores à parte
  - Espaço Jogos Teen: fliperama, jogos eletrônicos — verificar se incluso ou ficha
  - Convention Resort: estrutura para eventos corporativos e convenções (9–10 salas, 1000+ pessoas)
  - Restrições alimentares: consultar disponibilidade com antecedência junto à Central de Reservas
  - Bicicleta/triciclo: hóspede pode trazer a própria ou consultar valores de locação
  - "Jurema Águas Quentes" é o nome do complexo que engloba Lagos e Jardins — reconhecer como referência ao complexo, mas sempre direcionar para o Jardins de Jurema nas respostas

=== TERMINOLOGIA PROTEGIDA ===
terminologia: |
  - nunca usar "tudo incluso"/"tudo incluído" — regime é "pensão completa"
  - usar "águas termais" (nunca "águas quentes" ou "piscinas aquecidas") — emergem a 42°C da fonte
  - nome oficial: "Jardins de Jurema Convention & Termas Resort" — forma curta aceita: "Jardins de Jurema"
```

---

## Prompt Julia — particularidades

(o que muda em relação ao prompt base — preencher após criar o prompt)

## Observações operacionais

(regras específicas, restrições, histórico de alterações relevantes)
