# Hotel Internacional Gravatal

## Identificador
- hotel_resort param: hotel_internacional_gravatal
- Pipeline ID: 9377539
- Nome do pipeline no Kommo: Internacional

## Status de implementação
- [x] Etapas JUL.IA ATIVADA e JUL.IA DESATIVADA criadas no pipeline
- [x] Gatilho do salesbot "Chamar Jul.IA" configurado na etapa JUL.IA ATIVADA
- [x] Robô de Entrada configurado (campos, etapa, condicionais)
- [x] Salesbot de Recepção configurado
- [x] Salesbot Enviar Fotos configurado
- [x] hotel_resort configurado corretamente no Robô de Entrada
- [x] Material do hotel coletado
- [x] Ficha preenchida (ver seção abaixo)
- [x] Prompt criado e publicado no n8n
- [x] Code de cotação atualizado no n8n
- [x] Validação interna (chat de testes)
- [ ] Validação com o cliente
- [x] Validação de cotação (caso extremo)
- [ ] Primeiro atendimento real validado

---

## Ficha do Hotel

```
=== IDENTIFICAÇÃO ===
nome_hotel: "Hotel Internacional Gravatal"
localizacao: "Termas do Gravatal, Gravatal/SC"
escopo: "SOMENTE Hotel Internacional Gravatal"

=== REGIME E ESTRUTURA ===
regime_hospedagem: "pensão completa — 5 refeições/dia"
regime_bebidas: "chopp artesanal Berg Brau, sucos e picolés (11h–13h na piscina); água, suco e refrigerante no almoço e jantar. Demais bebidas pagas à parte"
tipos_quarto: "Standard Superior | Luxo c/ Banheira | Premium c/ Piscina"
lotacao_maxima_ap: 5
checkin: "a partir das 15h"
checkout: "até às 12h (almoço incluso)"
refeicoes_detalhadas: "café (07h30–10h), petiscos piscina (11h–12h), almoço (12h–14h), chá (16h–17h), jantar (19h30–21h30)"

=== DESTAQUES E ESTRUTURA ===
destaques: "águas termais naturais em todos os quartos e piscinas, pensão completa com 5 refeições, Parque Aquativo incluso, Ilha do Tesouro Perdido, Vale do Dinossauro, mascotes Caco e Nora"
recreacao_inclusa: "hidroginástica, trilha, pesca, quadras, arco e flecha, Ilha do Tesouro Perdido, Vale do Dinossauro, fitness, sauna, bilhar, ping-pong, sala TV/kids/jogos"
servicos_terceirizados: ""
outras_estruturas: "piscinas externas (07h–19h, qua/sáb até 17h), piscina coberta (07h30–21h30), balneário (07h30–11h e 14h–19h), SPA com agendamento (09h–12h e 13h–17h)"
atracoes_especificas: "Ilha do Tesouro Perdido: ilha em lago interno, acesso por tirolesa — brincadeiras temáticas, caça ao tesouro, luau | Vale do Dinossauro: atração INTERNA do hotel — réplicas de dinossauros em espaço na natureza (NÃO é externa)"
parque_externo: "Parque Aquático Aquativo — incluso para hóspedes, em frente ao hotel. Funciona de terça a domingo, de julho a abril. Fechado 08/06–08/07/2026, reabre 09/07"
mascotes: "Caco (inspirado nos macacos que habitavam a ilha próxima) e Nora (mascote do Vale do Dinossauro)"
transfer: "NÃO oferece"

=== FAIXAS ETÁRIAS — HOSPEDAGEM ===
cortesia_hospedagem: "3–4 anos → não paga, ocupa lugar no AP"
pagante_hospedagem: "5–12 anos → tarifa criança"
adulto_hospedagem: "13+ anos"

=== DAY USE ===
day_use_mode: "cotar"

=== FAIXAS ETÁRIAS — DAY USE ===
cortesia_dayuse: "até 4 anos → FREE"
meia_dayuse: "5–12 anos → meia entrada"
pagante_dayuse: ""
adulto_dayuse: "13+ anos"

=== DAY USE — PACOTES ===
pacotes_dayuse: |
  Seg–Qui: adulto R$ 383,00 | criança 5–12 R$ 191,50 | até 4 anos FREE
  Fim de semana: adulto R$ 450,00 | criança 5–12 R$ 225,00 | até 4 anos FREE
  Não válido em feriados e pacotes temáticos
  Inclui: café (08h–10h), petiscos (11h–12h), chopp artesanal (11h–13h), almoço + bebidas (12h–14h), chá (16h–17h)
  NÃO inclui: apartamento, toalhas, roupões, Parque Aquativo
horario_dayuse: "08h–18h (reserva antecipada obrigatória)"
minimo_pagantes_dayuse: ""

=== PAGAMENTO ===
pagamento_hospedagem: "entrada de 25% via PIX ou depósito + saldo até 10x cartão (Visa e Mastercard)"
pagamento_dayuse: "entrada de 50% via PIX ou depósito"

=== PRIMEIRA MENSAGEM ===
primeira_mensagem: |
  Olá, Seja Bem-Vindo(a)!
  Eu sou a JÚLIA ☺, sua assistente virtual da Central de Reservas L&M – Hotel Internacional.

  Antes de continuarmos, preciso de algumas informações para montar seu orçamento:

  ☀ Qual seria a data de entrada prevista?
  ☀ Qual seria a data de saída prevista?
  - Quantos adultos ficarão no quarto?
  - Há crianças? Se sim, qual a idade de cada uma?

  ☺ Com essas informações consigo montar seu orçamento completo!

=== CASOS ESPECIAIS DO HOTEL ===
casos_especiais: |
  - Transfer: hotel não oferece — informar e sugerir opções externas. Sem handoff
  - Agência/operadora de turismo: handoff_only
  - Vale do Dinossauro: atração INTERNA — nunca tratar como externa ou fora do hotel
  - Aquativo (hóspede): incluso, informar funcionamento sempre pelo positivo
  - Aquativo (day use): NÃO incluso — informar sem criar expectativa
  - PCD/autismo/condição médica: sem handoff — informar política de faixa etária padrão
  - Período de fechamento do Aquativo: 08/06–08/07/2026, reabre 09/07

=== TERMINOLOGIA PROTEGIDA ===
terminologia: |
  nunca usar "tudo incluso"/"tudo incluído" — regime é "pensão completa"
  nunca usar possessivos do hotel ("nosso hotel", "aqui no hotel") — usar "o Hotel Internacional"
  nunca enquadrar funcionamento por negativas ("fecha", "não funciona", "restrições") — sempre pelo positivo
```

---

## Prompt Julia — particularidades
- **Possessivos proibidos**: parceiro comercial. Usar "o Hotel Internacional" — nunca "nosso hotel", "nossa piscina" etc. OK para empresa/atendimento ("nosso especialista", "nossa equipe").
- **Vale do Dinossauro = INTERNA**: nunca descrever como atração externa. É um espaço dentro do hotel com réplicas de dinossauros na natureza.
- **Aquativo**: incluso para hóspedes; NÃO incluso no day use. Período fechado 08/06–08/07/2026, reabre 09/07.
- **Faixas etárias hospedagem**: bebê 0–2 (não entra na cotação), cortesia 3–4, pagante 5–12, adulto 13+
- **Faixas etárias day use**: bebê 0–2 (ignora), até 4 FREE, 5–12 meia, adulto 13+
- **Day use em feriados/temáticos**: não válido — informar e oferecer hospedagem como alternativa

## Observações operacionais
- Valores sujeitos a disponibilidade e alteração sem aviso prévio
- Reserva confirmada somente após pagamento da entrada
- Aquativo: funciona de julho a abril (terça a domingo); verificar período de fechamento anual antes de informar
- Atualizar tabela de preços sempre que o cliente enviar novos valores
