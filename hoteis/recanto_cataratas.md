# Recanto Cataratas Thermas Resort

## Identificador

- hotel_resort param: recanto_cataratas_resort
- Pipeline ID:
- Nome do pipeline no Kommo: Recanto Cataratas Thermas Resort

## Status de implementação

- [ ] Etapas JUL.IA ATIVADA e JUL.IA DESATIVADA criadas no pipeline
- [ ] Gatilho do salesbot "Chamar Jul.IA" configurado na etapa JUL.IA ATIVADA
- [ ] Robô de Entrada configurado (campos, etapa, condicionais)
- [x] Atualizar Dicionário Pipeline:Salesbot ID no Workflow Enviar Fotos
- [x] Salesbot Enviar Fotos configurado
- [ ] hotel_resort configurado corretamente no Robô de Entrada
- [ ] Material do hotel coletado
- [ ] Ficha preenchida (ver seção abaixo)
- [ ] Prompt criado e publicado no n8n
- [ ] Revisar Prompt
- [ ] Atualizar n8n: Config Hoteis
- [ ] Atualizar n8n: Monta mensagem Orcamento1
- [ ] Atualizar n8n: Monta mensagem Multipla
- [ ] Validação interna (chat de testes)
- [ ] Validação com o cliente
- [ ] Validação de cotação (caso extremo)
- [ ] Primeiro atendimento real validado

---

## Ficha do Hotel

> Baseada no Bloco 1 das diretrizes_gerais_julia_v8.md. Preencher antes de criar o prompt.

```
=== IDENTIFICAÇÃO ===
nome_hotel: "Recanto Cataratas Thermas Resort"
localizacao: ""
escopo: "SOMENTE Recanto Cataratas Thermas Resort"

=== REGIME E ESTRUTURA ===
regime_hospedagem: ""
regime_bebidas: ""
tipos_quarto: ""
lotacao_maxima_ap: 4
checkin: ""
checkout: ""
refeicoes_detalhadas: ""

=== DESTAQUES E ESTRUTURA ===
destaques: ""
recreacao_inclusa: ""
servicos_terceirizados: ""
outras_estruturas: ""
atracoes_especificas: ""
parque_externo: ""
mascotes: ""
transfer: ""

=== FAIXAS ETÁRIAS — HOSPEDAGEM ===
cortesia_hospedagem: ""
pagante_hospedagem: ""
adulto_hospedagem: ""

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
pagamento_hospedagem: ""
pagamento_dayuse: ""

=== PRIMEIRA MENSAGEM ===
primeira_mensagem: ""

=== CASOS ESPECIAIS DO HOTEL ===
casos_especiais: |
  -

=== TERMINOLOGIA PROTEGIDA ===
terminologia: |
  -
```

---

## Prompt Julia — particularidades

(o que muda em relação ao prompt base — preencher após criar o prompt)

## Observações operacionais

(regras específicas, restrições, histórico de alterações relevantes)
