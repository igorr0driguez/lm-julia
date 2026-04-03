# Mabu Thermas Grand Resort

## Identificador

- hotel_resort param: mabu_thermas
- Pipeline ID:
- Nome do pipeline no Kommo: Mabu Thermas Foz

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

> Baseada no Bloco 1 das diretrizes (skill prompt-julia). Preencher antes de criar o prompt.

```
=== IDENTIFICAÇÃO ===
nome_hotel: "Mabu Thermas Grand Resort"
localizacao: "Foz do Iguaçu, PR"
escopo: "SOMENTE Mabu Thermas Grand Resort"

=== REGIME E ESTRUTURA ===
regime_hospedagem: "café da manhã, meia pensão (café + jantar) ou pensão completa (café + almoço + jantar) — depende da tarifa/disponibilidade, definido na cotação"
regime_bebidas: "bebidas NÃO inclusas — todo consumo de bebidas é cobrado à parte"
tipos_quarto: "Suíte Master | Suíte Tropical | Premium Tropical"
lotacao_maxima_ap: 4
checkin: "a partir das 15h"
checkout: "até às 12h"
refeicoes_detalhadas: "buffet diversificado e restaurantes temáticos — horários não disponíveis"

=== DESTAQUES E ESTRUTURA ===
destaques: "piscinas de águas termais a 36°C do Aquífero Guarani (renovadas a cada 4h), acesso incluso ao Blue Park com entrada antecipada, a 12 km das Cataratas do Iguaçu, toboáguas, praia termal exclusiva, gastronomia premium, recreação infantil em tempo integral, spa Corpo e Mente"
recreacao_inclusa: "recreação infantil em tempo integral, hidroginástica, festas temáticas, trilha ecológica, quadras (tênis, poliesportiva, areia), parede de escalada, sala de ginástica, salão de jogos, atividades ao ar livre"
servicos_terceirizados: "Spa Corpo e Mente (massagens, terapias corporais, ofurôs) — pago à parte"
outras_estruturas: "piscinas externas e internas aquecidas naturalmente, toboáguas, praia termal, bar molhado, sauna úmida, academia, estacionamento cortesia (1 automóvel por AP), Wi-Fi"
atracoes_especificas: "Blue Park — parque aquático anexo ao resort com acesso incluso e entrada antecipada para hóspedes. Toboáguas radicais, megatirolesa, praia com areia e ondas, rio lento, ilha infantil com brinquedos aquáticos, área interativa para pequenos, praças de alimentação. Funciona das 10h às 17h, calendário variável (consultar dias de funcionamento). Endereço: Rua Dr. Alberto Abujamra, 3175 — Mata Verde, Foz do Iguaçu"
parque_externo: "Blue Park — acesso incluso com entrada antecipada para hóspedes Mabu. Horário: 10h–17h, funcionamento conforme calendário (nem todos os dias). Sujeito a alteração por segurança, clima ou força maior"
mascotes: ""
transfer: "NÃO oferece"

=== FAIXAS ETÁRIAS — HOSPEDAGEM ===
cortesia_hospedagem: "0–8 anos → cortesia (máx 2 por AP)"
pagante_hospedagem: "9–11 anos → pagante (tarifa criança)"
adulto_hospedagem: "12+ anos → tarifa adulto"

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
pagamento_hospedagem: "parcelamento em até 6x sem juros (parcela mínima R$ 250,00)"
pagamento_dayuse: ""

=== PRIMEIRA MENSAGEM ===
primeira_mensagem: |
  Olá, Seja Bem-Vindo(a)!
  Eu sou a JÚLIA ☺, sua assistente virtual da Central de Reservas L&M – Mabu Thermas Grand Resort.

  Para montar seu orçamento, preciso de algumas informações:

  ☀ Qual a data de entrada?
  ☀ Qual a data de saída?
  - Quantos adultos ficarão no quarto?
  - Há crianças? Se sim, qual a idade de cada uma?

  ☺ Com essas informações consigo preparar seu orçamento completo!

=== CASOS ESPECIAIS DO HOTEL ===
casos_especiais: |
  - Não é pet friendly — aceita apenas cão-guia (informar no campo "Solicitação especial")
  - É proibido fumar nas dependências do hotel
  - Idade mínima para check-in: 18 anos — documento com foto e cartão de crédito obrigatórios
  - Taxa de turismo obrigatória: ~R$4/dia/hóspede (não inclusa na diária)
  - Taxa de toalha de piscina obrigatória: ~R$5/dia/hóspede (não inclusa na diária)
  - Berço e cama extra: sob consulta, mediante disponibilidade
  - Acessibilidade: possui acomodações e áreas de lazer acessíveis
  - Restrição alimentar: hotel preparado para atender dietas e restrições
  - Blue Park: acesso incluso, mas funcionamento conforme calendário — se cliente perguntar dias específicos, handoff

=== TERMINOLOGIA PROTEGIDA ===
terminologia: |
  "águas termais" liberado (faz parte do nome do hotel)
  nunca usar possessivos do hotel ("nosso resort", "nossa piscina") — usar "o Mabu Thermas"
  nunca usar "tudo incluso"/"all inclusive" — o resort NÃO é all inclusive
  regime correto: "meia pensão" ou "pensão completa" conforme tarifa
```

---

## Prompt Julia — particularidades

(o que muda em relação ao prompt base — preencher após criar o prompt)

## Observações operacionais

(regras específicas, restrições, histórico de alterações relevantes)
