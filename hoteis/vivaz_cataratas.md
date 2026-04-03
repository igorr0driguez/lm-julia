# Vivaz Cataratas Resort

## Identificador

- hotel_resort param: vivaz_cataratas
- Pipeline ID:
- Nome do pipeline no Kommo: Vivaz Cataratas Resort

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
nome_hotel: "Vivaz Cataratas Resort"
localizacao: "Foz do Iguaçu/PR"
escopo: "SOMENTE Vivaz Cataratas Resort"

=== REGIME E ESTRUTURA ===
regime_hospedagem: "café da manhã incluso em todas as diárias, com opções de meia pensão (café + jantar) e pensão completa (café + almoço + jantar). NÃO é all inclusive"
regime_bebidas: "bebidas NÃO inclusas (exceto em pacotes de Natal e Réveillon)"
tipos_quarto: "Garden | Garden Family (conjugado) | Luxo Frente | Luxo Vista Piscina | Suíte Casal | Suíte Família"
lotacao_maxima_ap: 5
checkin: "a partir das 15h"
checkout: "até às 12h"
refeicoes_detalhadas: "café da manhã incluso em todas as reservas. Meia pensão: café + jantar. Pensão completa: café + almoço + jantar. Opções gastronômicas adicionais: restaurante à la carte, bistrô, bar da piscina, pizzaria, lanchonete, room service"

=== DESTAQUES E ESTRUTURA ===
destaques: "resort em meio à Mata Atlântica, Parque Aquático Aquamania incluso para hóspedes, recreação infantil das 8h30 às 22h, Spa & Wellness, trilha sensorial, cachoeira exclusiva, pet friendly, próximo às Cataratas do Iguaçu (13 min)"
recreacao_inclusa: "recreação infantil das 8h30 às 22h (a partir de 5 anos): jogos, oficinas de arte, passeio a cavalo, waterball, piquenique, cine open air, jantar infantil, música e dança, visita de personagens | adultos: sala de jogos, esportes, arco e flecha, desafios, trilha da cachoeira, passeio a cavalo, música e dança, degustação de vinhos | relaxamento: yoga, quick massage, piscina aquecida, trilha sensorial, sound healing"
servicos_terceirizados: "Spa (limpeza de pele, escova e corte, maquiagem, sobrancelhas, spa dos pés, escalda pés, reflexologia, massagem relaxante, drenagem linfática, aromaterapia, bambuterapia, pedras quentes, shiatsu, massagem terapêutica, argila facial e corporal, banhos e hidromassagem, alquimia de ervas)"
outras_estruturas: "piscinas ao ar livre e coberta/aquecida, restaurante à la carte, bistrô, bar da piscina, pizzaria, lanchonete, room service, salão de eventos, boutique e souvenirs, academia, sauna, Wi-Fi gratuito, recepção 24h"
atracoes_especificas: "Parque Aquático Aquamania (incluso para hóspedes): tobogãs (maior da fronteira — 22m), rio lento, piscina de ondas, áreas infantis, hidro recreativa com música e dança, lounge exclusivo para hóspedes, bar e drinks, gastronomia"
parque_externo: "Parque Aquático Aquamania — incluso para hóspedes. Funcionamento sazonal (verificar calendário antes de reservar). Temporada 2025/2026: dez–mar terça a domingo 10h–18h (jan: segunda 12h–18h), abril quarta a domingo e feriados 10h–18h (último dia 03/05/2026). Mai–ago: fechado. Temporada 2026/2027: set–mar terça a domingo 10h–18h (jan: segunda 12h–18h), abril quarta a domingo e feriados 10h–18h"
mascotes: ""
transfer: "NÃO oferece"

=== FAIXAS ETÁRIAS — HOSPEDAGEM ===
cortesia_hospedagem: "0–10 anos → cortesia"
pagante_hospedagem: "11–17 anos → tarifa criança"
adulto_hospedagem: "18+ → adulto"

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
pagamento_hospedagem: "até 10x sem juros"
pagamento_dayuse: ""

=== PRIMEIRA MENSAGEM ===
primeira_mensagem: |
  Olá, Seja Bem-Vindo(a)!
  Eu sou a JÚLIA ☺, sua assistente virtual da Central de Reservas L&M – Vivaz Cataratas Resort.

  Antes de continuarmos, preciso de algumas informações para montar seu orçamento:

  ☀ Qual seria a data de entrada prevista?
  ☀ Qual seria a data de saída prevista?
  - Quantos adultos ficarão no quarto?
  - Há crianças? Se sim, qual a idade de cada uma?

  ☺ Com essas informações consigo montar seu orçamento completo!

=== CASOS ESPECIAIS DO HOTEL ===
casos_especiais: |
  - Pet friendly: taxa de R$ 180,00/noite + 5% ISS por animal. Welcome Kit incluso (cama, potes para ração e água). Coleira obrigatória. Pet NÃO acessa áreas sociais (apenas trilhas e estacionamento). Exige carteira de vacinação atualizada (V8/V10, Raiva, Bordetella). Kit como recordação: R$ 200,00 adicional
  - Estacionamento: R$ 20,00/dia
  - Parque Aquático Aquamania: incluso para hóspedes, funcionamento sazonal (mai–ago fechado). Sempre orientar o hóspede a verificar o calendário antes de reservar
  - Proximidade pontos turísticos: Cataratas do Iguaçu 13min, Parque das Aves 12min, Aeroporto 12min, AquaFoz 13min, Shopping Catuaí Palladium 8min, Dreams Park Show 8min, Itaipu 37min
  - Suítes Casal (Sol, Selva, Cielo, Hojas): decoração temática + hidromassagem — indicar para casais
  - Suíte Família: inclui espaço infantil + hidromassagem
  - Garden Family: conjugado, comporta até 5 pessoas
  - Agência/operadora de turismo: handoff_only

=== TERMINOLOGIA PROTEGIDA ===
terminologia: |
  nunca usar possessivos do hotel ("nosso resort", "nossa piscina") — usar "o Vivaz Cataratas Resort". OK para empresa ("nosso especialista", "nossa equipe")
  nunca usar "tudo incluso"/"tudo incluído"/"all inclusive" como descrição do regime — o resort NÃO é all inclusive
  nunca enquadrar funcionamento por negativas ("fecha", "não funciona") — sempre pelo positivo
  usar "Aquamania" (nome oficial do parque aquático) — nunca "parque de água" ou variações informais
```

---

## Prompt Julia — particularidades

(o que muda em relação ao prompt base — preencher após criar o prompt)

## Observações operacionais

(regras específicas, restrições, histórico de alterações relevantes)
