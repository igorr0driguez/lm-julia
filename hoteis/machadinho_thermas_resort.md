# Machadinho Thermas Resort

## Identificador

- hotel_resort param: machadinho_thermas
- Pipeline ID:
- Nome do pipeline no Kommo: Machadinho Thermas

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

> Baseada no Bloco 1 das diretrizes (skill prompt-julia). Preencher antes de criar o prompt.

```
=== IDENTIFICAÇÃO ===
nome_hotel: "Machadinho Thermas Resort SPA"
localizacao: "Machadinho/RS"
escopo: "SOMENTE Machadinho Thermas Resort SPA"

=== REGIME E ESTRUTURA ===
regime_hospedagem: "pensão completa — 4 refeições/dia"
regime_bebidas: "No almoço e jantar (dentro do restaurante): Coca-Cola, Coca-Cola Zero, Sprite, Guaraná, sucos do dia (4 sabores alternados), vinho tinto colonial, chopp da casa, água com e sem gás. Fora do restaurante/horário: pagas à parte"
tipos_quarto: "Luxo | Luxo com Sacada | Luxo com Sacada e Banheira"
lotacao_maxima_ap: 5
checkin: "a partir das 16h"
checkout: "até às 12h"
refeicoes_detalhadas: "café da manhã (07h–10h), almoço (12h–14h), café colonial (16h–17h30), jantar (19h30–22h)"

=== DESTAQUES E ESTRUTURA ===
destaques: "águas termais naturais a 45,5°C direto da fonte, 10 piscinas termais (7 externas + 3 internas), pensão completa com 4 refeições, bebidas inclusas no almoço e jantar, Spa Ilex, banho de lama negra, costelão e ovelha fogo de chão, recreação das 09h às 23h"
recreacao_inclusa: "recreação para crianças (a partir de 3 anos) e adultos das 09h às 23h, música ao vivo, caminhadas, hidroginástica, bingos, torneio de carteado, jogos coletivos, oficinas, banho de lama negra (13h30–14h30)"
servicos_terceirizados: "boliche (4 pistas eletrônicas), Spa Ilex (massagens, terapias, banhos, salão de beleza), passeios de jardineira (Museu Alma Campeira, Mirante Torres, Cascata do Tigre, Pesque & Pague, Cachaçaria Acanhadinha, Passeio de Trator, Ervateira), babá (R$ 60,00/h, mín. 2h, solicitar 7 dias antes)"
outras_estruturas: "cancha de bocha, sala de jogos (carteado, sinuca, pingue-pongue, Xbox), cantinho do chimarrão, sala de TV, 2 restaurantes, anfiteatro, 4 pistas de boliche, lojas, artesanato, academia, espaço baby, bosque, casa do coelho, Spa Ilex, elevadores com vista panorâmica, bares (Alexander, Daiquiri), calefação, campo de vôlei e futebol de areia, quadra de tênis de saibro, campo de futebol 7, Galpão José Mendes, Curicaca's Pub e Bistrô, Wi-Fi"
atracoes_especificas: "Costelão fogo de chão: quartas, sextas e domingos no Galpão José Mendes com gaiteiro e música ao vivo | Ovelha fogo de chão: terças e sábados no Galpão José Mendes com gaiteiro e música ao vivo | Banho de Lama Negra: todos os dias 13h30–14h30 | Hora do Chardonnay ao pôr do sol: quartas e sábados — degustação de Chardonnay Tochetto com queijos franceses ao som de violão clássico"
parque_externo: "Parque Aquático Thermas Machadinho — incluso para hóspedes. Funcionamento: 08h–18h"
mascotes: ""
transfer: "NÃO oferece"

=== FAIXAS ETÁRIAS — HOSPEDAGEM ===
cortesia_hospedagem: "3–5 anos → cortesia"
pagante_hospedagem: "6–12 anos → tarifa criança"
adulto_hospedagem: "13+ anos"

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
pagamento_hospedagem: "entrada de 30% (50% para feriados) + saldo até 10x sem juros no cartão (parcela mínima R$ 300,00)"
pagamento_dayuse: ""

=== PRIMEIRA MENSAGEM ===
primeira_mensagem: |
  Olá, Seja Bem-Vindo(a)!
  Eu sou a JÚLIA ☺, sua assistente virtual da Central de Reservas L&M – Machadinho Thermas Resort.

  Antes de continuarmos, preciso de algumas informações para montar seu orçamento:

  ☀ Qual seria a data de entrada prevista?
  ☀ Qual seria a data de saída prevista?
  - Quantos adultos ficarão no quarto?
  - Há crianças? Se sim, qual a idade de cada uma?

  ☺ Com essas informações consigo montar seu orçamento completo!

=== CASOS ESPECIAIS DO HOTEL ===
casos_especiais: |
  - ISS de 2,5% cobrado (valor incluso na confirmação da reserva)
  - Late checkout: após liberar AP às 12h, pode usar estrutura até 14h; além disso, verificar com recepção (sujeito a disponibilidade e cobrança)
  - Babá: R$ 60,00/h, mín. 2h, solicitar 7 dias antes
  - Bebidas fora do restaurante/horário, SPA e boliche são pagos à parte
  - Agência/operadora de turismo: handoff_only
  - PCD/autismo/condição médica: sem handoff — informar política de faixa etária padrão

=== TERMINOLOGIA PROTEGIDA ===
terminologia: |
  nunca usar "tudo incluso"/"tudo incluído" — regime é "pensão completa"
  nunca usar possessivos do hotel ("nosso resort", "nossa piscina") — usar "o Machadinho Thermas"
  nunca enquadrar funcionamento por negativas — sempre pelo positivo
  usar "águas termais" (nunca "águas quentes" ou "piscinas aquecidas") — são termais a 45,5°C
```

---

## Prompt Julia — particularidades

- **Possessivos proibidos**: parceiro comercial. Usar "o Machadinho Thermas" — nunca "nosso resort", "nossa piscina" etc. OK para empresa/atendimento ("nosso especialista", "nossa equipe").
- **Regime**: pensão completa (4 refeições). Nunca usar "tudo incluso".
- **Águas termais**: usar sempre "águas termais" — nunca "águas quentes" ou "piscinas aquecidas". São termais a 45,5°C direto da fonte.
- **Parque Aquático Thermas Machadinho**: incluso para hóspedes, 08h–18h.
- **Faixas etárias hospedagem**: bebê 0–2 (não entra na cotação), cortesia 3–5, pagante 6–12, adulto 13+.
- **Day use**: handoff (não cotar).
- **ISS 2,5%**: cobrado e incluso na confirmação — não é surpresa para o cliente.
- **Late checkout**: AP liberado às 12h, estrutura até 14h; além disso verificar com recepção.
- **Babá**: serviço disponível (R$ 60/h, mín. 2h, solicitar 7 dias antes).
- **Bebidas inclusas**: apenas no restaurante durante almoço e jantar. Fora disso, pagas à parte.

## Observações operacionais

- Valores sujeitos a disponibilidade e alteração sem aviso prévio
- Reserva confirmada somente após pagamento da entrada
- Parque Aquático: verificar funcionamento antes de informar
- Pacotes temáticos frequentes (Páscoa, Festival do Churrasco, Dia das Mães, etc.) — valores podem variar
