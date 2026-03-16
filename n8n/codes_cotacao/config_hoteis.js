const raw = $item(0).$node["Webhook"].json.query.assistant; //no node produção "Backend Jul.IA deve ser $item(0).$node["When Executed by Another Workflow"].json["hotel-resort"];

const MAP = {
  hotel_internacional: "hotel_internacional",
  park_hotel: "park_hotel",
  ita_thermas: "park_hotel",
  termas_gravatal: "termas_gravatal",
  termas_do_lago: "termas_do_lago",
};

const hotel = MAP[raw] ?? "hotel_internacional";

const CONFIG = {
  park_hotel: {
    titulo: `☘ *ORÇAMENTO – TERMAS PARK HOTEL | GRAVATAL / SC*`,
    pensao: `✦ *Pensão Completa Inclusa:*\n☕ Café da manhã\n◆ Petiscos na piscina\n✦ Almoço\n✦ Jantar`,
    estrutura: `♨ *Estrutura & Lazer:*\n✔ Quadra de beach Tennis e churrasqueira ao ar livre\n✔ Piscina aquecida coberta e ao ar livre (08h às 20h)\n✔ Banheiras de hidromassagem\n  → 07h30 às 09h30\n  → 16h às 18h\n✔ Petiscos na piscina: 11h às 13h30\n✔ Sala de TV\n✔ Sala de jogos (sinuca, pebolim, ping-pong e carteado)\n✔ Wi-Fi em todas as áreas\n✔ Restaurante com buffet completo`,
    recreacao: `★ *Recreação e Atividades:*\n♫ Bailes e eventos temáticos\n⚃ Bingo\n♨ Hidroginástica\n➤ Caminhadas guiadas\n✿ Máscara de argila\n✦ Caipira no pilão\n➤ Trilhas e brincadeiras diversas`,
    servicos: `Serviços Terceirizados (pagos à parte):\nPasseios Opcionais\n•➤ Passeio de charrete......20,00 por pessoa 40 min.\n•♞ Passeio a cavalo......80,00 por pessoa 1h\n•♨ Parque Acquativo Termal.......90,00 por pessoa passa o dia`,
    pagamento: `★ *Condições de Pagamento*\n◆ Entrada de 30% via PIX ou depósito\n◆ Saldo restante:\n  ✔ Pagamento direto no hotel ou\n  ✔ Parcelamento em até 10x no cartão (Visa e MasterCard)`,
    checkin: `→ Check-in: a partir das 14h`,
    checkout: `→ Check-out: até às 12h (almoço incluso)`,
    obs: `⚠ *Observação Importante:*\nValores apenas orçados, sujeitos à disponibilidade e alteração sem aviso prévio. A reserva será confirmada somente após o pagamento da entrada.`,
    aviso: null,
  },

  termas_gravatal: {
    subtitulo: `★ *Hotel Termas Do Gravatal:*`,
    pensao: `✦ *Incluso na diária:*\n• Café da manhã\n• Almoço\n• Café da tarde\n• Jantar\n• Petiscos com caipirinha na piscina antes do almoço\n* Bebidas pagas à parte`,
    estrutura: `⛱ *Estrutura do hotel:*\n• Parque aquático\n• Piscinas e banheiras termais a 36 °C (internas e externas)\n• Ofurôs internos e externos\n• Quadras esportivas\n• Sala de jogos\n• Recreação com programação especial\n• Trilhas, fontes, gazebos, redários e chimarródromo`,
    roupao: `➤ Aluguel do roupão (por dia):\nR$ 5,00`,
    horarios_refeicoes: `➤ *Horário das refeições:*\ncafé da manhã: 7:30h as 10h\npetisco na piscina: entre 11h e 12h\nalmoço: 12h as 14h\ncafé da tarde: das 16h as 17h\njantar: 19h as 21:30h`,
    horarios_piscinas: `♨ *Horário das piscinas e Sauna (para todos os hóspedes):*\nPiscina coberta: das 7h a 13h (manhã) / 14h as 19:30h (tarde)\nPiscina externa: 7h as 18h\nSauna: 17 as 19h seg a sexta / 11 ao 12h e 17 a 19h sab e dom`,
    horarios_banheiras: `♨ *Horário das Banheiras e Piscinas (privadas, apartamento)*\nBanheiras: 6h as 22h\nPiscinas: 6h as 22h`,
    checkin: `→ Check-in: a partir das 15h`,
    checkout: `→ Check-out: até as 12h (com almoço incluso na saída)`,
    obs: `⚠ Nada reservado, apenas cotado.\nOBS: Criança menor de 8 anos acomodada em um colchão ao chão.`,
    aviso: `AVISO:\nPARQUE AQUÁTICO ESTARÁ FECHADO PARA FÉRIAS COLETIVAS DO DIA 08/06/2026 A 08/07/2026, REABRINDO DIA 09/07/2026.`,
  },

  termas_do_lago: {
    titulo: `Segue abaixo orçamento e o que o Hotel Termas do Lago em Gravatal oferece em atividades e alimentação`,
    pensao: `Incluso na diária: 03 refeições, jantar, café da manhã e almoço (exceto bebidas).`,
    pagamento: `_ Formas de pagamento:\n• 30% antecipado, como garantia da reserva, saldo direto no hotel ou cartão.*\nParcelamento do total no cartão em até 10 x com parcela mínima de R$ 200 (visa e master).`,
    checkin_checkout: `- Check-in: 15h. / Check-out: 12h após almoço`,
    amenidades: `- Todas as categorias oferecem ar condicionado, TV, internet wireless, frigobar, telefone e cama box;`,
    estrutura: `Estrutura e lazer a disposição sem custo adicional:\n• Piscina externa com água termal à 36º C\n• Sala de TV\n• Sala de jogos\n• Parque aquático incluso (todas as segundas feira fechado)\n• Cancha de bocha\n• Lago para pesca (não fornece material de pesca)\n• Internet wi-fi\n• Equipe de recreação`,
    obs: `Obs: valores e disponibilidade cotados nada reservado sujeito a alteração`,
    aviso: `AVISO:\nPARQUE AQUÁTICO ESTARÁ FECHADO PARA FÉRIAS COLETIVAS DO DIA 08/06/2026 A 08/07/2026, REABRINDO DIA 09/07/2026.`,
  },

  hotel_internacional: {
    titulo: null,
    pensao: `✦ *Incluso na diária – Pensão Completa (05 refeições):*\n☕ Café da manhã – 07h30 às 10h00\n◆ Petiscos na piscina – 11h00 às 12h00\n✦ Almoço – 12h00 às 14h00\n☕ Chá da tarde – 16h00 às 17h00\n◆ Jantar – 19h30 às 21h30`,
    bebidas: `★ *Bebidas incluídas:*\n♦ Chopp liberado no bar piscina das 11h às 13h ( Marca Regional Berg Brau)\n◆ Água sem gás, suco e refrigerante servidos em taças ou copos durante almoço e jantar\n*Demais bebidas pagas à parte`,
    pagamento: `Formas de pagamento ▼\n\n◆ Sinal de 25% + saldo em até 10x no cartão via link (no ato da reserva)\n\n◆ Pagamento à vista via pix com desconto`,
    checkin: `→ Check-in: 15h`,
    checkout: `→ Check-out: 12h (almoço incluso)`,
    obs: `⚠ *Observação:* Tarifas flutuantes, se não reservado não há garantia de valores.`,
    aviso: `AVISO:\nPARQUE AQUÁTICO ESTARÁ FECHADO PARA FÉRIAS COLETIVAS DO DIA 08/06/2026 A 08/07/2026, REABRINDO DIA 09/07/2026.`,
  },
};

return [{ json: { hotel, config: CONFIG[hotel] } }];
