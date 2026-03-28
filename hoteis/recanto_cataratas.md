# Recanto Cataratas Thermas Resort & Convention

## Identificador

- hotel_resort param: recanto_cataratas_resort
- Pipeline ID:
- Nome do pipeline no Kommo: Recanto Cataratas Thermas Resort

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

> Baseada no Bloco 1 das diretrizes_gerais_julia.md. Preencher antes de criar o prompt.

```
=== IDENTIFICAÇÃO ===
nome_hotel: "Recanto Cataratas Thermas Resort & Convention"
localizacao: "Foz do Iguaçu, PR"
escopo: "SOMENTE Recanto Cataratas Thermas Resort & Convention"

=== REGIME E ESTRUTURA ===
regime_hospedagem: "pensão completa — 3 refeições/dia"
regime_bebidas: "Bebidas alcoólicas não inclusas"
tipos_quarto: "Apartamento Luxo | Suíte Master | Premium com Hidromassagem | Master com Hidromassagem"
lotacao_maxima_ap: 4
checkin: "a partir das 14h"
checkout: "até às 12h"
refeicoes_detalhadas: "café da manhã, almoço, jantar"

=== DESTAQUES E ESTRUTURA ===
destaques: "piscinas de águas termais, parque aquático infantil, spa premiado, boliche, 501 acomodações, pensão completa, recreação para todas as idades"
recreacao_inclusa: "programação diária de entretenimento para todas as idades, atividades temáticas em pacotes especiais"
servicos_terceirizados: ""
outras_estruturas: "2 restaurantes com especialidades regionais e internacionais, bar, academia, spa/centro de bem-estar, salão de jogos, pista de boliche, quadras de esportes, estacionamento gratuito, Wi-Fi gratuito em todas as áreas"
atracoes_especificas: ""
parque_externo: ""
mascotes: ""
transfer: "NÃO oferece — handoff"

=== FAIXAS ETÁRIAS — HOSPEDAGEM ===
cortesia_hospedagem: "3–10 anos → cortesia (máx 2 por AP, mediante 2 adultos pagantes)"
pagante_hospedagem: ""
adulto_hospedagem: "11+ anos → tarifa adulto"

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
pagamento_hospedagem: "à vista via PIX ou parcelamento em até 10x sem juros no link (parcela mínima R$ 250,00). Feriados: até 12x sem juros"
pagamento_dayuse: ""

=== PRIMEIRA MENSAGEM ===
primeira_mensagem: |
  Olá, Seja Bem-Vindo(a)!
  Eu sou a JÚLIA ☺, sua assistente virtual da Central de Reservas L&M – Recanto Cataratas Thermas Resort & Convention.

  Para montar seu orçamento, preciso de algumas informações:

  ☀ Qual a data de entrada?
  ☀ Qual a data de saída?
  - Quantos adultos ficarão no quarto?
  - Há crianças? Se sim, qual a idade de cada uma?

  ☺ Com essas informações consigo preparar seu orçamento completo!

=== CASOS ESPECIAIS DO HOTEL ===
casos_especiais: |
  -

=== TERMINOLOGIA PROTEGIDA ===
terminologia: |
  nunca usar "tudo incluso"/"tudo incluído" — regime é "pensão completa"
  nunca usar possessivos do hotel ("nosso resort", "nossa piscina") — usar "o Recanto Cataratas"
```

> Horários das refeições não detalhados no material — se o hotel enviar, adicionar aqui.

---

## Estrutura e Lazer

- Piscinas de águas termais
- Parque aquático infantil
- Spa premiado / centro de bem-estar
- Pista de boliche
- Salão de jogos
- Quadras de esportes
- Academia
- 2 restaurantes (especialidades regionais e internacionais)
- Bar
- Estacionamento gratuito
- Wi-Fi gratuito em todas as áreas
- 501 acomodações

## Recreação e Atividades (inclusas)

- Programação diária de entretenimento para todas as idades
- Atividades temáticas em pacotes especiais

---

## Prompt Julia — particularidades

- **Possessivos proibidos**: parceiro comercial. Usar "o Recanto Cataratas" — nunca "nosso resort", "nossa piscina" etc. OK para empresa/atendimento ("nosso especialista", "nossa equipe").
- **Regime**: pensão completa (3 refeições). Nunca usar "tudo incluso".
- **Faixas etárias hospedagem**: bebê 0–2 (não entra na cotação), cortesia 3–10 (máx 2 por AP, mediante 2 adultos pagantes), adulto 11+. Motor de reserva aplica cortesia automaticamente — Julia só coleta idades normalmente.
- **Day use**: handoff (não cotar).

## Observações operacionais

- Valores sujeitos a disponibilidade e alteração sem aviso prévio
- Reserva confirmada somente após pagamento
- Bebidas alcoólicas não inclusas na pensão completa
- Parcela mínima R$ 250,00 no parcelamento via link
- Feriados: condição especial de até 12x sem juros
