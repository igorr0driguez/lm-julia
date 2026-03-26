# Hotel Termas do Lago

## Identificador

- hotel_resort param: termas_do_lago
- Pipeline ID: 9377947
- Nome do pipeline no Kommo: Termas do Lago

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
- [x] Revisar Prompt
- [x] Atualizar n8n: Config Hoteis
- [x] Atualizar n8n: Monta mensagem Orcamento1
- [x] Atualizar n8n: Monta mensagem Multipla
- [x] Validação interna (chat de testes)
- [x] Validação com o cliente
- [x] Validação de cotação (caso extremo)
- [x] Primeiro atendimento real validado

---

## Ficha do Hotel

```
=== IDENTIFICAÇÃO ===
nome_hotel: "Hotel Termas do Lago"
localizacao: "Termas do Gravatal, Gravatal/SC"
escopo: "SOMENTE Hotel Termas do Lago"

=== REGIME E ESTRUTURA ===
regime_hospedagem: "pensão completa — 3 refeições/dia (café da manhã, almoço e jantar)"
regime_bebidas: "bebidas NÃO inclusas nas refeições"
tipos_quarto: ""
lotacao_maxima_ap: 5
checkin: "a partir das 15h"
checkout: "até às 12h (almoço incluso)"
refeicoes_detalhadas: "café da manhã, almoço e jantar"

=== DESTAQUES E ESTRUTURA ===
destaques: "águas termais naturais em todos os quartos e piscinas, vista privilegiada para o lago, Park Termal incluso, 68 unidades, administração pelo Grupo Termas"
recreacao_inclusa: "equipe de recreação, sala de jogos (bilhar, pimbolim, carteado, ping pong), cancha de bocha, lago para pesca (hotel não fornece material de pesca), sala de TV"
servicos_terceirizados: ""
outras_estruturas: "piscina externa com água termal a 36°C (área coberta e ao ar livre), balneário com banheiras termais, estacionamento, restaurante com buffet completo, WiFi"
atracoes_especificas: ""
parque_externo: "Park Termal (Aquativo Parque Aquático) — incluso para hóspedes. Fecha às segundas-feiras. Fechado 08/06–08/07/2026, reabre 09/07"
mascotes: ""
transfer: "NÃO oferece"

=== FAIXAS ETÁRIAS — HOSPEDAGEM ===
cortesia_hospedagem: "3–8 anos → não paga, ocupa lugar no AP"
pagante_hospedagem: "9–12 anos → tarifa criança"
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
pagamento_hospedagem: "entrada de 30% antecipado (PIX ou depósito) + saldo direto no hotel ou cartão até 10x (parcela mínima R$ 200, Visa e Mastercard)"
pagamento_dayuse: ""

=== PRIMEIRA MENSAGEM ===
primeira_mensagem: |
  Olá, Seja Bem-Vindo(a)!
  Eu sou a JULIA ☺, sua assistente virtual da Central de Reservas L&M – Hotel Termas do Lago.

  Antes de continuarmos, preciso de algumas informações para montar seu orçamento:

  ☀ Qual seria a data de entrada prevista?
  ☀ Qual seria a data de saída prevista?
  - Quantos adultos ficarão no quarto?
  - Há crianças? Se sim, qual a idade de cada uma?

  ☺ Com essas informações consigo montar seu orçamento completo!

=== CASOS ESPECIAIS DO HOTEL ===
casos_especiais: |
  - Transfer: hotel não oferece — informar e sugerir opções externas. Sem handoff
  - Park Termal (hóspede): incluso, informar funcionamento sempre pelo positivo. Funciona de terça a domingo
  - Período de fechamento do Park Termal: 08/06–08/07/2026, reabre 09/07
  - Pesca no lago: hotel não fornece material de pesca — informar sem criar expectativa
  - Day use: handoff (não cotar, não entrar no mérito)
  - Tipos de quarto: não detalhar categorias — hotel é linha custo-benefício, evitar entrar nesse mérito
  - Agência/operadora de turismo: handoff_only
  - Informações não disponíveis: nunca inventar dados — se não tem a informação, não afirmar

=== TERMINOLOGIA PROTEGIDA ===
terminologia: |
  nunca usar "tudo incluso"/"tudo incluído" — regime é "pensão completa"
  nunca usar possessivos do hotel ("nosso hotel", "aqui no hotel") — usar "o Hotel Termas do Lago"
  nunca enquadrar funcionamento por negativas ("fecha", "não funciona", "restrições") — sempre pelo positivo
```

---

## Prompt Julia — particularidades

(o que muda em relação ao prompt base — preencher após criar o prompt)

## Observações operacionais

- Valores sujeitos a disponibilidade e alteração sem aviso prévio
- Reserva confirmada somente após pagamento da entrada
- Park Termal: fecha segundas-feiras; verificar período de fechamento anual antes de informar
- Hotel administrado pelo Grupo Termas (mesma administração do Hotel Termas Gravatal)
- 68 unidades habitacionais
