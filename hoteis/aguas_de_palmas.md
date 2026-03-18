# Águas de Palmas Resort

## Identificador

- hotel_resort param: aguas_de_palmas
- Pipeline ID:
- Nome do pipeline no Kommo: Águas de Palmas

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

> Baseada no Bloco 1 das diretrizes_gerais_julia_v8.md. Preencher antes de criar o prompt.

```
=== IDENTIFICAÇÃO ===
nome_hotel: "Águas de Palmas Resort"
localizacao: "Governador Celso Ramos/SC"
escopo: "SOMENTE Águas de Palmas Resort"

=== REGIME E ESTRUTURA ===
regime_hospedagem: "pensão completa"
regime_bebidas: "bebidas não alcoólicas inclusas durante as principais refeições; buffet de sorvetes incluso para hóspedes"
tipos_quarto: "Suíte Aquarius | Bloco Nautilus | Suíte Nautilus | Suítes Luxo (blocos Caravelas e Nautilus, com hidromassagem)"
lotacao_maxima_ap: 4
checkin: "a partir das 15h30"
checkout: "até às 12h (almoço incluso)"
refeicoes_detalhadas: "pensão completa — 4 refeições/dia: café da manhã, almoço, café da tarde e jantar. Bebidas não alcoólicas inclusas nas refeições. Buffet de sorvetes incluso"

=== DESTAQUES E ESTRUTURA ===
destaques: "complexo de 240 mil m², Parque Aquático com 13 piscinas e toboáguas, piscinas térmicas cobertas e hidromassagem, serviço de praia exclusivo com cadeiras e guarda-sol, trenzinho para a praia a cada 30 min"
recreacao_inclusa: "recreação para adultos e crianças a partir de 6 anos, das 9h às 22h, com equipe especializada; trilhas ecológicas; Espaço Kids para menores de 6 anos"
servicos_terceirizados: ""
outras_estruturas: "Wi-Fi, estacionamento"
atracoes_especificas: "Parque Aquático: 13 piscinas, toboáguas adulto e infantil, bar molhado, piscinas de jogos | Complexo de Inverno: piscinas aquecidas cobertas, hidromassagem, jacuzzi, sauna panorâmica, sala de descanso"
parque_externo: ""
mascotes: ""
transfer: "NÃO oferece transfer externo (aeroporto/rodoviária). Oferece trenzinho interno gratuito para a praia a cada 30 min, com quiosque exclusivo (cadeiras e guarda-sol)"

=== FAIXAS ETÁRIAS — HOSPEDAGEM ===
cortesia_hospedagem: "3–7 anos → cortesia"
pagante_hospedagem: "8–12 anos → tarifa criança"
pagante2_hospedagem: "13–15 anos → tarifa jovem"   # tarifário diferente do adulto e do criança
adulto_hospedagem: "16+ → adulto"

=== DAY USE ===
day_use_mode: "cotar"

=== FAIXAS ETÁRIAS — DAY USE ===
cortesia_dayuse: "3–5 anos → cortesia"
meia_dayuse: ""
pagante_dayuse: "6–12 anos → pagante (R$ 300,00)"
adulto_dayuse: "13+ → adulto (R$ 450,00)"

=== DAY USE — PACOTES ===
pacotes_dayuse: |
  Day Use padrão (jan a out 2026): adulto R$ 450,00 | criança 6–12 R$ 300,00 | até 5 anos cortesia
  Inclui: café da manhã, almoço (bebidas não alcoólicas inclusas), estacionamento, Wi-Fi, Parque Aquático, Complexo de Inverno, recreação, Espaço Kids
  NÃO inclui: toalhas. Consumo de bebidas externas não permitido. Taxa de serviço 10% sobre consumos extras
  Não válido feriados/temáticos — consultar disponibilidade antecipadamente
horario_dayuse: "09h–17h"
minimo_pagantes_dayuse: ""

=== PAGAMENTO ===
pagamento_hospedagem: "20% entrada + saldo em até 6x sem juros no ato da reserva, OU 50% entrada + saldo em 5x sem juros no resort. Não aceita cheque"
pagamento_dayuse: "50% entrada para confirmação + saldo no check-in em até 5x sem juros. Não aceita cheque"

=== PRIMEIRA MENSAGEM ===
primeira_mensagem: |
  Olá, Seja Bem-Vindo(a)!
  Eu sou a JÚLIA ☺, sua assistente virtual da Central de Reservas L&M – Águas de Palmas Resort.

  Antes de continuarmos, preciso de algumas informações para montar seu orçamento:

  ☀ Qual seria a data de entrada prevista?
  ☀ Qual seria a data de saída prevista?
  - Quantos adultos ficarão no quarto?
  - Há crianças? Se sim, qual a idade de cada uma?

  ☺ Com essas informações consigo montar seu orçamento completo!

=== CASOS ESPECIAIS DO HOTEL ===
casos_especiais: |
  - Serviço de praia: trenzinho a cada 30 min para quiosque exclusivo com cadeiras e guarda-sol — informar como diferencial
  - Day use em feriados/temáticos: não disponível — informar e oferecer hospedagem como alternativa
  - Recreação: a partir de 6 anos. Menores de 6 → Espaço Kids (acompanhados pelos pais)
  - Toalhas no day use: NÃO fornecidas — informar se perguntarem
  - Agência/operadora de turismo: handoff_only

=== TERMINOLOGIA PROTEGIDA ===
terminologia: |
  nunca usar "tudo incluso"/"tudo incluído" — regime é "pensão completa"
  nunca usar possessivos do hotel ("nosso resort") — usar "o Águas de Palmas Resort". OK para empresa ("nosso especialista")
  nunca enquadrar funcionamento por negativas ("fecha", "não funciona") — sempre pelo positivo
  usar "piscinas aquecidas cobertas" ou "piscinas térmicas cobertas" para o Complexo de Inverno
```

---

## Prompt Julia — particularidades

(o que muda em relação ao prompt base — preencher após criar o prompt)

## Observações operacionais

(regras específicas, restrições, histórico de alterações relevantes)
