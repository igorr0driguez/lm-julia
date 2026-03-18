# Fazzenda Park Resort

## Identificador

- hotel_resort param: fazzenda
- Pipeline ID:
- Nome do pipeline no Kommo: Fazzenda

## Status de implementação

- [x] Etapas JUL.IA ATIVADA e JUL.IA DESATIVADA criadas no pipeline
- [x] Gatilho do salesbot "Chamar Jul.IA" configurado na etapa JUL.IA ATIVADA
- [x] Robô de Entrada configurado (campos, etapa, condicionais)
- [x] Atualizar Dicionário Pipeline:Salesbot ID no Workflow Enviar Fotos
- [x] Salesbot Enviar Fotos configurado
- [x] hotel_resort configurado corretamente no Robô de Entrada
- [x] Material do hotel coletado
- [x] Ficha preenchida (ver seção abaixo)
- [x] Prompt criado e publicado no n8n
- [ ] Revisar Prompt
- [x] Atualizar n8n: Config Hoteis
- [x] Atualizar n8n: Monta mensagem Orcamento1
- [x] Atualizar n8n: Monta mensagem Multipla
- [ ] Validação interna (chat de testes)
- [ ] Validação com o cliente
- [ ] Validação de cotação (caso extremo)
- [ ] Primeiro atendimento real validado

---

## Ficha do Hotel

```
=== IDENTIFICAÇÃO ===
nome_hotel: "Fazzenda Park Resort"
localizacao: "Gaspar/SC"
escopo: "SOMENTE Fazzenda Park Resort"

=== REGIME E ESTRUTURA ===
regime_hospedagem: "all inclusive completo — 7 refeições/dia + bebidas liberadas o dia inteiro"
regime_bebidas: "ALL INCLUSIVE — bebidas liberadas o dia inteiro: vinhos (tintos nacionais/importados, rosé, branco, espumantes brut/moscatel/sem álcool), coquetéis (Margarita, Mojito, Sex on the Beach, Alexander, Piña Colada, Tequila Sunrise, Gin Tropical, batidas), doses (Campari, Red Label, White Horse, Martini, Smirnoff), cervejas (Heineken, Corona, Budweiser, Original, Amstel, Ultra Amstel, Brahma Malzbier, Heineken Zero, Chopp Pilsen Brahma), caipirinhas (cachaça, Smirnoff, Bacardi, vinho, sakê, tropicais), sem álcool (águas, refrigerantes, sucos naturais, batidas sem álcool, caipiras)"
tipos_quarto: "Apartamento Standard | Apartamento Luxo | Suíte Superluxo | Suíte Nupcial | Suíte Prime"
lotacao_maxima_ap: 4
checkin: "a partir das 15h (acesso à estrutura e acomodação)"
checkout: "até às 12h (permanência na estrutura, atrações e refeições até às 15h)"
refeicoes_detalhadas: "7 refeições/dia: café da manhã (07h30–10h), petiscos na piscina (11h–19h), almoço (12h–14h), café colonial (16h–18h), pizzaria (16h30–21h), jantar (20h–22h), lanche da madrugada (00h–02h)"

=== DESTAQUES E ESTRUTURA ===
destaques: "resort fazenda all inclusive completo, 7 refeições/dia, bebidas liberadas o dia inteiro, complexo de piscinas aquecidas (interna e externa), +17 jacuzzis, recreação das 09h30 até 00h, Clube do Gasparinho Kids, fazenda com animais, natureza"
recreacao_inclusa: "piscina interna (09h–21h), piscina externa (09h–20h), pescaria, bailes, passeio de charrete, passeio a cavalo, passeio de pôneis, passeio de bicicleta, pedalinho, ordenha, sauna, trilhas ecológicas, +17 jacuzzis (interna e externa), campo de futebol, quadras de esporte, playground aquático, playground, Clube do Gasparinho Kids, sala de jogos, stand up paddle, interação com animais, academia, recreação para crianças/adultos/melhor idade (09h30–00h), complexo de piscinas aquecidas (interna e externa)"
servicos_terceirizados: "arvorismo R$ 80,00 (a partir de 5 anos, mín 1,50m, agendar no concierge) | quadriciclo R$ 350,00 em dupla — pista baixa, necessário CNH (agendar no concierge) | massagem/SPA R$ 150,00 a R$ 230,00 (agendar no concierge) | passeio de mini fusca R$ 120,00 a R$ 270,00 (seg–sáb 09h30–12h e 14h–18h) | roupão R$ 50,00/diária por unidade"
outras_estruturas: ""
atracoes_especificas: "Clube do Gasparinho Kids: espaço de recreação infantil dedicado"
parque_externo: ""
mascotes: "Gasparinho — mascote oficial do resort, presente no Clube do Gasparinho Kids"
transfer: "NÃO oferece"

=== FAIXAS ETÁRIAS — HOSPEDAGEM ===
cortesia_hospedagem: "3–5 anos → cortesia (não paga, ocupa lugar no AP)"
pagante_hospedagem: "6–12 anos → tarifa criança"
adulto_hospedagem: "13+ anos"

=== DAY USE ===
day_use_mode: "handoff"

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
pagamento_hospedagem: "pagamento TOTAL no ato da reserva. PIX à vista com 3% de desconto, ou cartão de crédito em até 12x sem juros (parcelas mínimas de R$ 200,00, via link)"
pagamento_dayuse: ""

=== PRIMEIRA MENSAGEM ===
primeira_mensagem: |
  Olá, Seja Bem-Vindo(a)!
  Eu sou a JÚLIA ☺, sua assistente virtual da Central de Reservas L&M – Fazzenda Park Resort.

  Antes de continuarmos, preciso de algumas informações para montar seu orçamento:

  ☀ Qual seria a data de entrada prevista?
  ☀ Qual seria a data de saída prevista?
  - Quantos adultos ficarão no quarto?
  - Há crianças? Se sim, qual a idade de cada uma?

  ☺ Com essas informações consigo montar seu orçamento completo!

=== CASOS ESPECIAIS DO HOTEL ===
casos_especiais: |
  - Voltagem do resort: 220V — informar se perguntarem
  - Serviços terceirizados: sempre informar que precisam agendar no concierge (exceto mini fusca)
  - PCD/autismo/condição médica: sem handoff — informar política de faixa etária padrão
  - Agência/operadora de turismo: handoff_only

=== TERMINOLOGIA PROTEGIDA ===
terminologia: |
  usar "all inclusive" ou "tudo incluso" — regime é all inclusive completo (permitido por ser all inclusive)
  nunca usar possessivos do hotel ("nosso resort", "nosso hotel") — usar "o Fazzenda Park Resort". OK para empresa ("nosso especialista", "nossa equipe")
  nunca enquadrar funcionamento por negativas ("fecha", "não funciona") — sempre pelo positivo
```

---

## Prompt Julia — particularidades

(o que muda em relação ao prompt base — preencher após criar o prompt)

## Observações operacionais

- Tarifas flutuantes, sujeitas a alteração sem aviso prévio
- Reserva confirmada somente após pagamento total
- Voltagem do resort: 220V
