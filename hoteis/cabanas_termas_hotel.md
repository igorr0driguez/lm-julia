# Cabanas Termas Hotel

## Identificador

- hotel_resort param: cabanas
- Pipeline ID:
- Nome do pipeline no Kommo: Cabanas Termas Hotel

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
nome_hotel: "Cabanas Termas Hotel"
localizacao: "Termas do Gravatal, Gravatal/SC"
escopo: "SOMENTE Cabanas Termas Hotel"

=== REGIME E ESTRUTURA ===
regime_hospedagem: "pensão completa — 4 refeições/dia"
regime_bebidas: "não incluídas — pagas à parte"
tipos_quarto: "apartamentos de casal simples até apartamentos com três quartos"
lotacao_maxima_ap: 6
checkin: "a partir das 14h"
checkout: "até às 12h (almoço incluso)"
refeicoes_detalhadas: "café da manhã (07h30–10h), almoço (12h–14h), café da tarde (16h–17h), jantar (19h–21h)"

=== DESTAQUES E ESTRUTURA ===
destaques: "águas termais direto da fonte, piscinas termais 24h (coberta e ao ar livre), balneário termal com hidromassagem individual, pensão completa com 4 refeições, SPA termal, aceita pets"
recreacao_inclusa: "alongamento energético (09h), caminhada ecológica (09h10–10h), hidroginástica (10h40), atividades recreativas na recepção"
servicos_terceirizados: ""
outras_estruturas: "estacionamento coberto, espaço fitness (academia BX — ticket na recepção), playground ecológico, bosque arborizado, quiosque com churrasqueira/fogo de chão, sala de carteado climatizada, sala de estar, salão de jogos (bilhar, pimbolim, ping-pong, carteado), sala de TV, sala de convenções, restaurante com buffet completo, ofurôs externos"
atracoes_especificas: ""
parque_externo: ""
mascotes: ""
transfer: "NÃO oferece"

=== FAIXAS ETÁRIAS — HOSPEDAGEM ===
cortesia_hospedagem: "até 10 anos → cortesia (1 por apartamento)"
pagante_hospedagem: "0–12 anos → tarifa criança"
adulto_hospedagem: "13+ → tarifa adulto"

=== DAY USE ===
mensagem_dayuse: "☀ Day Use – Cabanas Termas Hotel\n\nNo Cabanas Termas Hotel, você pode desfrutar de um dia completo de lazer com café da manhã e almoço inclusos (exceto bebidas), além do acesso às áreas externas e piscinas.\n\n✦ Valor e Condições\n▶ R$ 280,00 por pessoa\n▶ Máximo de 10 pessoas\n▶ Horário: 08h00 às 17h00\n▶ Reserva obrigatória, mediante consulta de disponibilidade\n▶ Não válido em feriados\n\n☀ Incluso:\n✔ Café da manhã (07h30 às 10h00)\n✔ Almoço exceto bebidas (12h00 às 14h00)\n✔ Café da tarde (16h00 às 17h00)\n✔ Piscinas\n✔ Ofurôs externos\n✔ Sala de jogos\n✔ Quadra de futebol\n✔ Quadra de beach tênis\n✔ Vôlei de areia\n✔ Demais áreas externas\n✔ Atividades com recreacionistas (conforme programação)\n\n⚠ Não inclui: apartamento, balneário (banheiras de hidromassagem individuais)\n\n⚠ Valores apenas orçados, nada reservado"

=== PAGAMENTO ===
pagamento_hospedagem: "sinal de 30% via PIX ou depósito + saldo ao final da hospedagem parcelado no cartão em até 3x, ou total via link antecipado em até 6x sem juros (parcelas mínimas R$ 200)"

=== PRIMEIRA MENSAGEM ===
primeira_mensagem: ""

=== CASOS ESPECIAIS DO HOTEL ===
casos_especiais: |
  - Pets: aceita até 02 de pequeno porte, taxa diária R$ 105,00 por pet
  - Balneário termal: hidromassagem em cabines individuais (manhã 07h30–09h / tarde 17h–19h) — NÃO incluso no day use
  - Piscinas termais: funcionamento 24h (interna e externa)
  - Feriados/datas especiais: pacotes temáticos com programação especial — consultar valores e condições
  - Day use: mensagem padrão enviada automaticamente + handoff. Feriados: informação já consta na mensagem
  - Cortesia hospedagem: apenas 01 criança até 10 anos por apartamento — não afeta categorização na cotação, apenas informação da base de conhecimento

=== TERMINOLOGIA PROTEGIDA ===
terminologia: |
  usar "águas termais" / "piscinas termais" / "balneário termal" — terminologia oficial do hotel
  nunca usar possessivos do hotel ("nosso hotel", "nossa piscina") — usar "o Cabanas Termas Hotel". OK para empresa/atendimento ("nosso especialista", "nossa equipe")
```

---

## Prompt Julia — particularidades

(o que muda em relação ao prompt base — preencher após criar o prompt)

## Observações operacionais

- Valores sujeitos a disponibilidade e alteração sem aviso prévio
- Reserva confirmada somente após pagamento do sinal
- Atualizar tabela de preços sempre que o cliente enviar novos valores
- Day use: mensagem padrão enviada automaticamente via prompt, sem cotação — valor único R$ 280/pessoa
