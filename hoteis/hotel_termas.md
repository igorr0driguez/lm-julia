# Hotel Termas (Gravatal)

## Identificador

- hotel_resort param: termas_gravatal
- Pipeline ID: 9361827
- Nome do pipeline no Kommo: Hotel Termas

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
nome_hotel: "Hotel Termas"
localizacao: "Termas do Gravatal, Gravatal/SC"
escopo: "SOMENTE Hotel Termas"

=== REGIME E ESTRUTURA ===
regime_hospedagem: "pensão completa — 4 refeições/dia + petiscos na piscina"
regime_bebidas: "petiscos com caipirinha inclusos (11h–12h na piscina); demais bebidas pagas à parte (inclusive nesse horário)"
tipos_quarto: "Standard Superior | Luxo c/ Banheira | Suíte c/ Mini Piscina"
lotacao_maxima_ap: 5
checkin: "a partir das 15h"
checkout: "até às 12h (almoço incluso)"
refeicoes_detalhadas: "café da manhã (07h30–10h), petiscos+caipirinha na piscina (11h–12h), almoço (12h–14h), café da tarde (16h–17h), jantar (19h–21h30)"

=== DESTAQUES E ESTRUTURA ===
destaques: "piscinas e banheiras termais a 36°C (internas e externas), parque aquático termal interno incluso, ofurôs, pensão completa com petiscos+caipirinha na piscina, recreação com equipe das 9h às 23h"
recreacao_inclusa: "hidroginástica na piscina, recreação com programação especial, equipe recreativa das 9h às 23h, trilhas, fontes, gazebos, redários, chimarródromo"
servicos_terceirizados: ""
outras_estruturas: "quadras esportivas, sala de jogos (bilhar, pebolim, carteado, ping-pong), sala de TV, restaurante com buffet completo, estacionamento coberto, roupão disponível para aluguel (R$ 5,00/dia)"
atracoes_especificas: ""
parque_externo: ""
mascotes: ""
transfer: "NÃO oferece"

=== FAIXAS ETÁRIAS — HOSPEDAGEM ===
cortesia_hospedagem: "3–8 anos → não paga, acomodado em colchão ao chão"
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
pagamento_hospedagem: "parcelamento em até 10x sem juros (cartão)"
pagamento_dayuse: ""

=== PRIMEIRA MENSAGEM ===
primeira_mensagem: ""

=== CASOS ESPECIAIS DO HOTEL ===
casos_especiais: |
  - Crianças 3–8 anos: acomodadas em colchão ao chão (padrão do hotel) — informar se o cliente perguntar sobre acomodação das crianças. Cotação normal
  - Parque aquático termal: INTERNO ao hotel, incluso para hóspedes. Fechado férias coletivas 08/06–08/07/2026, reabre 09/07/2026
  - Piscinas coberta: 7h–13h e 14h–19h30 | externa: 7h–18h | sauna: 17h–19h (seg–sex) e 11h–12h e 17h–19h (sáb–dom)
  - Banheiras e piscinas privativas (AP Luxo/Suíte): 6h–22h

=== TERMINOLOGIA PROTEGIDA ===
terminologia: |
  nunca usar "tudo incluso"/"tudo incluído" — regime é "pensão completa"
  nunca usar possessivos do hotel ("nosso hotel", "nossa piscina") — usar "o Hotel Termas"
  nunca enquadrar funcionamento por negativas ("fecha", "restrições") — sempre pelo positivo
```

> Campos em branco: primeira_mensagem, day use (modo handoff, não precisa cotar).

---

## Prompt Julia — particularidades

(preencher após criar o prompt)

## Observações operacionais

- Valores sujeitos a alteração sem aviso prévio
- Reserva confirmada somente após pagamento
- Atualizar tabela de preços sempre que o cliente enviar novos valores
- Parque aquático é INTERNO (não externo) — incluso na hospedagem
