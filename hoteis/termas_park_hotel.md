# Termas Park Hotel

## Identificador
- hotel_resort param: termas_park_hotel
- Pipeline ID: 11631008
- Nome do pipeline no Kommo: Termas Park Hotel - termaspark.com.br

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
nome_hotel: "Termas Park Hotel"
localizacao: "Gravatal, SC"
escopo: "SOMENTE Termas Park Hotel"

=== REGIME E ESTRUTURA ===
regime_hospedagem: "pensão completa"
regime_bebidas: ""
tipos_quarto: ""
lotacao_maxima_ap: 0
checkin: "a partir das 14h"
checkout: "até às 12h (almoço incluso)"
refeicoes_detalhadas: "café da manhã, petiscos na piscina (11h–13h30), almoço, jantar"

=== DESTAQUES E ESTRUTURA ===
destaques: "piscinas térmicas/aquecidas cobertas e ao ar livre, banheiras de hidromassagem, pensão completa, recreação completa, eventos temáticos"
recreacao_inclusa: "bailes e eventos temáticos, bingo, hidroginástica, caminhadas guiadas, máscara de argila, caipira no pilão, trilhas e brincadeiras diversas"
servicos_terceirizados: "passeio de charrete, passeio a cavalo, Parque Aquático Termal (pago à parte)"
outras_estruturas: "sala de TV, sala de jogos (sinuca, pebolim, ping-pong, carteado), Wi-Fi em todas as áreas, restaurante com buffet completo"
atracoes_especificas: ""
parque_externo: ""
mascotes: ""
transfer: ""

=== FAIXAS ETÁRIAS — HOSPEDAGEM ===
cortesia_hospedagem: ""
pagante_hospedagem: ""
adulto_hospedagem: ""

=== DAY USE ===
day_use_mode: "cotar"

=== FAIXAS ETÁRIAS — DAY USE ===
cortesia_dayuse: ""
meia_dayuse: "8–12 anos → meia entrada"
pagante_dayuse: ""
adulto_dayuse: ""

=== DAY USE — PACOTES ===
pacotes_dayuse: |
  Somente piscina — R$ 65,00/pessoa
  Piscina + almoço — R$ 135,00/pessoa
  Café da manhã + almoço + café da tarde + piscina — R$ 160,00/pessoa (mínimo 15 pagantes)
horario_dayuse: "10h–18h (com café da manhã: entrada a partir das 8h)"
minimo_pagantes_dayuse: "Pacote café+almoço+café da tarde+piscina exige mínimo de 15 pagantes"

=== PAGAMENTO ===
pagamento_hospedagem: "entrada de 30% via PIX ou depósito + saldo no hotel ou parcelamento em até 10x (Visa e Mastercard)"
pagamento_dayuse: "entrada de 50% via PIX ou depósito"

=== PRIMEIRA MENSAGEM ===
primeira_mensagem: ""

=== CASOS ESPECIAIS DO HOTEL ===
casos_especiais: |
  -

=== TERMINOLOGIA PROTEGIDA ===
terminologia: |
  usar "águas térmicas/aquecidas" / nunca usar "águas termais" para descrever as piscinas
  usar "piscinas térmicas/aquecidas" / nunca usar "piscinas termais"
```

> Campos em branco a preencher: regime_bebidas, tipos_quarto, lotacao_maxima_ap, transfer, faixas etárias hospedagem, faixas etárias day use (cortesia/adulto), primeira_mensagem, casos_especiais.

---

## Estrutura de Produtos

### Hospedagem (Pacotes)
Pensão completa inclusa em todos os pacotes:
- Cafe da manha
- Petiscos na piscina (11h as 13h30)
- Almoco
- Jantar

Condicoes de pagamento (hospedagem):
- Entrada: 30% via PIX ou deposito
- Saldo: pagamento no hotel ou parcelamento em ate 10x (Visa e Mastercard)
- Check-in: a partir das 14h
- Check-out: ate as 12h (almoco incluso)

### Day Use
| Modalidade | Valor por pessoa |
|---|---|
| Somente piscina | R$ 65,00 |
| Piscina + almoco | R$ 135,00 |
| Cafe da manha + almoco + cafe da tarde + piscina | R$ 160,00 (minimo 15 pagantes) |

- Horario day use: 10h as 18h
- Com cafe da manha: entrada a partir das 8h
- Criancas 8 a 12 anos: meia entrada

Condicoes de pagamento (day use):
- Entrada: 50% via PIX ou deposito

---

## Estrutura e Lazer
- Piscinas térmicas/aquecidas coberta e ao ar livre (8h as 20h)
- Banheiras de hidromassagem (7h30-9h30 e 16h-18h)
- Sala de TV
- Sala de jogos: sinuca, pebolim, ping-pong, carteado
- Wi-Fi em todas as areas
- Restaurante com buffet completo

## Recreacao e Atividades (inclusas)
- Bailes e eventos tematicos
- Bingo
- Hidroginastica
- Caminhadas guiadas
- Mascara de argila
- Caipira no pilao
- Trilhas e brincadeiras diversas

## Servicos Terceirizados (pagos a parte)
- Passeio de charrete
- Passeio a cavalo
- Parque Aquatico Termal

---

## Cardapio Bar/Piscina

### Porcoes
| Item | Valor |
|---|---|
| Fritas | R$ 32,00 |
| Peixe | R$ 38,00 |
| File de Alcatra | R$ 47,00 |
| Frango | R$ 35,00 |
| Frios | R$ 34,00 |

### Bebidas
| Item | Valor |
|---|---|
| Agua | R$ 5,00 |
| Agua Tonica | R$ 6,00 |
| Sucos | R$ 7,00 |
| Refrigerante | R$ 7,00 |

### Doses
| Item | Valor |
|---|---|
| Martini | R$ 12,00 |
| Bacardi | R$ 15,00 |
| Campari | R$ 15,00 |
| Gin | R$ 15,00 |
| Conhaque | R$ 10,00 |
| Cachaca | R$ 14,00 |
| Smirnoff | R$ 15,00 |
| Natu | R$ 15,00 |
| Old Eight | R$ 12,00 |
| Passport | R$ 14,00 |
| Steinhaeger | R$ 12,00 |
| Underberg | R$ 12,00 |

### Cervejas
| Item | Valor |
|---|---|
| Brahma / Skol (Garrafa) | R$ 15,00 |
| Malzbier (355ml) | R$ 15,00 |
| Original / Heineken (Garrafa) | R$ 20,00 |
| Cerveja (Lata) | R$ 10,00 |

### Caipirinhas e Caipiroskas
| Item | Valor |
|---|---|
| Caipiroska de Fruta | R$ 27,00 |
| Caipiroska de Limao | R$ 24,00 |
| Caipirinha de Limao | R$ 24,00 |

### Espumantes
| Item | Valor |
|---|---|
| Nobrese Brut | R$ 57,00 |
| Nobrese Moscatel | R$ 57,00 |

### Vinhos
| Item | Valor |
|---|---|
| Taca de Vinho | R$ 9,00 |
| Jarra de Vinho | R$ 27,00 |

---

## Prompt Julia — particularidades
- **Possessivos do hotel permitidos**: diferente de todos os outros hotéis (parceiros comerciais), o Termas Park é de propriedade da família do cliente. A Jul.IA pode usar "nossa piscina", "nosso hotel" etc. — a proibição padrão de possessivos NÃO se aplica aqui.
- **Opção Econômica (colchão ao chão)**: funcionalidade ativa — crianças 0–8 anos + mínimo 3 diárias. Aceite → handoff_only.
- Faixas etárias hospedagem: bebê 0–2 (não conta cotação/físico), cortesia 3–8, pagante 9–12, adulto 13+
- Faixas etárias day use: bebê 0–2, cortesia 3–7, meia 8–12, adulto 13+

## Observacoes operacionais
- Valores sujeitos a disponibilidade e alteracao sem aviso previo
- Reserva confirmada somente apos pagamento da entrada
- Atualizar tabela de precos sempre que o cliente enviar novos valores
