# Costao do Santinho

## Identificador

- hotel_resort param: costao
- Pipeline ID:
- Nome do pipeline no Kommo: Costao do Santinho Resort

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
- [ ] Validação com o cliente
- [ ] Validação de cotação (caso extremo)
- [ ] Primeiro atendimento real validado

---

## Ficha do Hotel

> Baseada no Bloco 1 das diretrizes (skill prompt-julia). Preencher antes de criar o prompt.

```
=== IDENTIFICAÇÃO ===
nome_hotel: "Costão do Santinho"
localizacao: "Florianópolis/SC"
escopo: "SOMENTE Costão do Santinho"

=== REGIME E ESTRUTURA ===
regime_hospedagem: "all inclusive — refeições + bebidas"
regime_bebidas: "ALL INCLUSIVE — águas, refrigerantes, sucos, caipirinha, caipirosca, caipiríssima, sakerinha, vodca, whisky 8 anos, cervejas (Brahma, Budweiser, Bohemia, chopp Brahma), espumante francês, vinhos branco e tinto (chileno e argentino). Rótulos conforme preferência do resort. Frigobar: águas e refrigerantes. Hotel Internacional: Stella Artois no frigobar"
tipos_quarto: "Hotel Internacional: Suíte Imperial | Suíte Luxo | Suíte Júnior | Suíte Master | Suíte Prime Júnior | Suíte Prime Luxo | Suíte Prime 2 dormitórios /// Vilas Portuguesas: Luxo 1 dormitório | Luxo Família 2 dormitórios | Luxo Família 3 dormitórios | Superior 1 dormitório | Superior 2 dormitórios | Superior 3 dormitórios | Superior"
lotacao_maxima_ap: 6
checkin: "a partir das 15h"
checkout: "até às 11h (com almoço incluso)"
refeicoes_detalhadas: "café da manhã, almoço, jantar e lanches rápidos. Restaurante buffet Nossa Senhora das Ondas (estações temáticas). Restaurantes temáticos (reserva obrigatória, consultar programação): Nossa Senhora da Vitória (menu degustação), Kaigan (japonesa), Trattoria di Mari (massas e pizzas). Bar das Piscinas: buffet de saladas, lanches quentes, sobremesas e bebidas (autoatendimento). Restaurante Infantil"

=== DESTAQUES E ESTRUTURA ===
destaques: "resort de praia all inclusive mais premiado do Brasil, 700 mil m² de Mata Atlântica preservada, Praia do Santinho, +200 atividades de entretenimento, 11 piscinas (4 aquecidas a 33°C), Costão SPA by L'Occitane, Museu Arqueológico ao ar livre (inscrições rupestres de 5.000 anos), RPPN Morro das Aranhas, Parque Ecológico, Marina Náutica, Costão Family Adventure"
recreacao_inclusa: "caminhada energética, beach tennis, alongamento/yoga, VR Costão Games, esportes de praia, aula de ritmos, hidro lazer, jogos de piscina, club dance, circuito de jogos de mesa, esportes aquáticos, vôlei, jump e step, shows e musicais (Show das Sereias, Chá com as Princesas, Hollywood Production, Turminho do Costão), balada temática, cinema ao ar livre, happy hour, acústico internacional, sandboard, arco e flecha, trilhas de eco aventura, circuito em altura, futebol de campo, camping, stand up paddle, caiaque, gincanas ecológicas, observação de estrelas, karaokê, Costão Games (Xbox e PS4), Cine Costão, Costão Gym (academia Precor), complexo esportivo (quadras poliesportiva e tênis, campo de futebol society), empréstimo de jogos e materiais esportivos, observação de aves, caminhadas ecológicas (7 percursos), visita à fazendinha 4 patas, recreação infantil (Espaço Kids 0–3 anos, infantil 4–11 anos com programação temática diária, adolescentes/teens)"
servicos_terceirizados: "mergulho certificado | passeio de escuna | aula de surfe | aula de tênis | campo de golfe | campo de futebol oficial | SPA by L'Occitane | salão de beleza | baby sitter | Costão Delivery (serviço de quarto) | lavanderia | transfer e tours | decoração lua de mel | carta de vinhos premium | garrafas de bebida alcoólica | isotônicos | água de coco | energético | passeio de charrete (15h30–18h30)"
outras_estruturas: "Solarium 7 Chacras (1 ofurô + 3 jacuzzis com vista para a Praia do Santinho), Bar Carijós, Bar Molhado (sazonal), Quiosque da Piscina, quiosque de praia (sazonal/verão), boutique, farmácia, cafeteria, revistaria, loja de fotos, restaurante infantil, transporte interno 24h (vans), estacionamento gratuito, Wi-Fi em todas as áreas"
atracoes_especificas: "Costão Family Adventure: programa de soft adventure com pontos e brindes (sandboard, arvorismo, trilhas, caiaque, arco e flecha) | Espaço Kids: crianças 0–3 anos (jogos, TV, copa, fraldário — espaço de convivência pais e filhos, sem monitores) | Costão Mágico: espaço lúdico e piqueniques na natureza | Vila Kids e Parque Aquático infantil | Infantil 4–11 anos: programação temática diária com monitores (segunda a domingo, cada dia um tema diferente) | Adolescentes/Teens: programação dedicada (esportes, aventura, e-sports, festas temáticas, 10h–22h30)"
parque_externo: "Parque Ecológico Costão do Santinho — caminho ecológico, observação de fauna e flora da Mata Atlântica, mini circuito em altura"
mascotes: "Turminha do Costão — mascotes oficiais, presentes em shows e atividades infantis diárias (visita dos mascotes)"
transfer: "oferece (custo adicional — serviço terceirizado)"

=== FAIXAS ETÁRIAS — HOSPEDAGEM ===
cortesia_hospedagem: "0–3 anos → cortesia"
pagante_hospedagem: "4–11 anos → tarifa criança"
adulto_hospedagem: "12+ anos"

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
pagamento_hospedagem: "7% desconto à vista via PIX ou cartão sem direito a reembolso ou troca de data | 5% desconto à vista via PIX com direito a reembolso ou troca de data | valor integral em até 10x com direito a reembolso ou troca de data"
pagamento_dayuse: ""

=== PRIMEIRA MENSAGEM ===
primeira_mensagem: |
  Olá, Seja Bem-Vindo(a)!
  Eu sou a JÚLIA ☺, sua assistente virtual da Central de Reservas L&M – Costão do Santinho Resort.

  Para montar seu orçamento, preciso de algumas informações:

  ☀ Qual a data de entrada?
  ☀ Qual a data de saída?
  - Quantos adultos ficarão no quarto?
  - Há crianças? Se sim, qual a idade de cada uma?

  ☺ Com essas informações consigo preparar seu orçamento completo!

=== CASOS ESPECIAIS DO HOTEL ===
casos_especiais: |
  - Aceita pets: pequeno e médio porte até 15kg (consultar valores)
  - Restaurantes temáticos: reserva obrigatória, consultar programação de abertura
  - Restrições alimentares (diabéticos, alérgicos a glúten/lactose): informar no momento da reserva + agendar com nutricionista na Central do Hóspede
  - Hotel Internacional (pacotes 7 noites): reserva extra de restaurante temático inclusa + Stella Artois no frigobar
  - Atividades náuticas (Marina dos Ingleses, 5 min do resort): outubro a março, 09h30–12h30 e 14h30–16h30
  - Kit Baby: berço, banheira, carrinho — para bebês até 3 anos (solicitar na governança)
  - Acessibilidade: suítes adaptadas no Hotel Internacional (banheiro sem box, porta larga, barras de apoio, cadeira de banho, acesso por elevador, rampas)
  - Espaço Kids (0–3 anos): espaço de convivência pais e filhos — atividades NÃO supervisionadas por monitores
  - Agência/operadora de turismo: handoff_only
  - PCD/autismo/condição médica: sem handoff — informar política de faixa etária padrão

=== TERMINOLOGIA PROTEGIDA ===
terminologia: |
  usar "all inclusive" — regime é all inclusive (permitido por ser all inclusive)
  nunca usar possessivos do hotel ("nosso resort", "nosso hotel") — usar "o Costão do Santinho" ou "o resort". OK para empresa ("nosso especialista", "nossa equipe")
  nunca enquadrar funcionamento por negativas ("fecha", "não funciona") — sempre pelo positivo
```

---

## Prompt Julia — particularidades

(o que muda em relação ao prompt base — preencher após criar o prompt)

## Observações operacionais

- Tarifas flutuantes, sujeitas a alteração sem aviso prévio
- Duas categorias de acomodação: Hotel Internacional (sofisticação/vista mar) e Vilas Portuguesas (estilo açoriano/espaço/natureza)
- Atividades náuticas sazonais (outubro a março) na Marina dos Ingleses
- Aceita pets até 15kg (valores sob consulta)
- Suítes adaptadas para PCD disponíveis no Hotel Internacional
