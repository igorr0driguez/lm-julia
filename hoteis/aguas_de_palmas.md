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
mensagem_dayuse: "☀ Day Use – Águas de Palmas Resort\n\n☉ Período: JAN a OUT 2026\n\n✦ Valores\n▶ Adulto: R$ 450,00\n▶ Criança (06 a 12 anos): R$ 300,00\n▶ Até 5 anos: cortesia\n\n☀ Serviços inclusos:\n✔ Café da manhã e almoço (bebidas não alcoólicas inclusas durante as refeições)\n✔ Estacionamento e Wi-Fi\n✔ Entrada a partir das 09h00 e saída até às 17h00 (atrasos geram cobrança adicional)\n✔ Parque Aquático com 13 piscinas, toboáguas adulto e infantil, bar molhado e piscinas de jogos\n✔ Complexo de Inverno com piscinas aquecidas, hidromassagem, jacuzzi, sauna panorâmica e sala de descanso\n✔ Recreação para adultos e crianças (a partir de 6 anos) e Espaço Kids para os menores\n✔ Crianças de 0 a 5 anos cortesia (acompanhadas pelos pais)\n\n⚠ Importante:\n→ Não fornecemos toalhas\n→ Consumo de bebidas externas não permitido\n→ Taxa de serviço de 10% sobre consumos extras\n\n✦ Pagamento: 50% de entrada para confirmação e saldo no check-in (até 5x sem juros). Não aceitamos cheques.\n\n⚠ Valores apenas orçados, nada reservado"

=== PAGAMENTO ===
pagamento_hospedagem: "20% entrada + saldo em até 6x sem juros no ato da reserva, OU 50% entrada + saldo em 5x sem juros no resort. Não aceita cheque"

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
  - Day use: mensagem padrão enviada automaticamente + handoff. Feriados e toalhas: informação já consta na mensagem
  - Recreação: a partir de 6 anos. Menores de 6 → Espaço Kids (acompanhados pelos pais)
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
