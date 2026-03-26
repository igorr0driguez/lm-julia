const { hotel: hotelResort, config } = $item(0).$node["Config Hoteis"].json;
const totalItems = items.length;

function parsePreco(str) {
  if (!str) return Infinity;
  return Number(str.replace(/[R$\s.]/g, '').replace(',', '.'));
}

const primeiroTrata = $item(0).$node["Trata multiplos dados"].json;
const totalApartamentos = primeiroTrata.total_apartamentos;

const grupos = [];
for (let i = 0; i < totalItems; i += totalApartamentos) {
  const grupo = { apartamentos: [] };
  for (let j = 0; j < totalApartamentos && i + j < totalItems; j++) {
    const idx = i + j;
    const orcamento = items[idx].json;
    if (orcamento.opcoes) {
      orcamento.opcoes.sort((a, b) => parsePreco(a.preco_total) - parsePreco(b.preco_total));
    }
    const trataDados = $item(idx).$node["Trata multiplos dados"].json;

    grupo.checkin = trataDados.checkin;
    grupo.checkout = trataDados.checkout;
    grupo.apartamentos.push({
      ap_num: trataDados.apartamento_num,
      dados_api: orcamento,
    });
  }
  grupos.push(grupo);
}

function selecionarOpcoes(apartamentos) {
  return apartamentos.map((ap) => {
    const dados = ap.dados_api;
    if (!dados || !dados.opcoes || dados.opcoes.length === 0) {
      return { ap_num: ap.ap_num, dados_api: dados, opcao: null };
    }
    return { ap_num: ap.ap_num, dados_api: dados, opcao: dados.opcoes[0] };
  });
}

let mensagem = "";

// ---- CABEÇALHO ----
if (hotelResort === "park_hotel") {
  mensagem += config.titulo + `\n\n`;
  mensagem += config.pensao + `\n\n`;
  mensagem += config.estrutura + `\n\n`;
  mensagem += `✦ *Valores da hospedagem:*\n\n`;
} else if (hotelResort === "termas_gravatal") {
  mensagem += `*Orçamento:*\n`;
  mensagem += config.subtitulo + `\n\n`;
  mensagem += config.pensao + `\n\n`;
  mensagem += config.estrutura + `\n\n`;
  mensagem += `✦ *Valores Da Hospedagem:*\n\n`;
} else if (hotelResort === "fazzenda") {
  mensagem += config.titulo + `\n\n`;
  mensagem += `✦ *Valores da hospedagem:*\n\n`;
} else if (hotelResort === "termas_do_lago") {
  mensagem += config.titulo + `\n\n`;
} else if (hotelResort === "machadinho_thermas") {
  mensagem += config.titulo + `\n\n`;
  mensagem += `✦ *Valores da hospedagem:*\n\n`;
} else if (hotelResort === "aguas_de_palmas") {
  mensagem += config.titulo + `\n`;
  mensagem += config.subtitulo + `\n\n`;
  mensagem += config.pensao + `\n\n`;
  mensagem += `✦ *Orçamento da Hospedagem*\n\n`;
} else if (hotelResort === "recanto_cataratas_resort") {
  mensagem += config.titulo + `\n\n`;
  mensagem += `✦ *Valores da hospedagem:*\n\n`;
} else if (hotelResort === "cabanas") {
  mensagem += config.titulo + `\n\n`;
  mensagem += config.pensao + `\n\n`;
  mensagem += `💵 *Valores Da Hospedagem:*\n\n`;
} else if (hotelResort === "costao") {
  mensagem += config.titulo + `\n\n`;
  mensagem += config.regime + `\n\n`;
  mensagem += `✦ *Valores Da Hospedagem:*\n\n`;
} else if (hotelResort === "lagos_de_jurema") {
  mensagem += config.titulo + `\n\n`;
  mensagem += `✦ *Valores da hospedagem:*\n\n`;
} else {
  // hotel_internacional
  const primeiroComDados = grupos.find(
    (g) => g.apartamentos[0].dados_api.hotel,
  );
  const nomeHotel = primeiroComDados
    ? primeiroComDados.apartamentos[0].dados_api.hotel.nome
    : "Hotel Internacional Gravatal";

  mensagem += `*Orçamento:*\n`;
  mensagem += `★ *${nomeHotel}*\n\n`;
  mensagem += config.pensao + `\n\n`;
  mensagem += config.bebidas + `\n\n`;
  mensagem += `✦ *Valores da hospedagem:*\n\n`;
}

// ---- VALORES DINÂMICOS ----
for (const grupo of grupos) {
  const [anoIn, mesIn, diaIn] = grupo.checkin.split("-");
  const [anoOut, mesOut, diaOut] = grupo.checkout.split("-");
  const dataEntrada = `${diaIn}/${mesIn}/${anoIn}`;
  const dataSaida = `${diaOut}/${mesOut}/${anoOut}`;

  const checkinDate = new Date(grupo.checkin + "T12:00:00");
  const checkoutDate = new Date(grupo.checkout + "T12:00:00");
  const diarias = Math.round(
    Math.abs((checkoutDate - checkinDate) / (24 * 60 * 60 * 1000)),
  );

  mensagem += `☉ *${dataEntrada} - ${dataSaida} (${diarias} diária${diarias > 1 ? "s" : ""})*\n\n`;

  const apComOpcoes = selecionarOpcoes(grupo.apartamentos);

  for (const ap of apComOpcoes) {
    if (!ap.opcao) {
      mensagem += `*QUARTO ${ap.ap_num}:* ✖ Sem disponibilidade\n\n`;
      continue;
    }

    const dados = ap.dados_api;
    const opcao = ap.opcao;
    const adultos = dados.busca.hospedes.adultos;
    const criancasIdades = dados.busca.hospedes.criancas_idades;
    const criancas = criancasIdades
      ? criancasIdades.split(",").filter((x) => x.trim() !== "").length
      : 0;

    mensagem += `*QUARTO ${ap.ap_num}:*\n`;
    mensagem += `${dataEntrada} - ${dataSaida}\n`;
    mensagem += `*${opcao.apartamento}*\n`;

    if (hotelResort === "hotel_internacional") {
      mensagem += (adultos === 4 && criancas === 0) ? `Hóspede(s): ${adultos}\n` : `Adulto(s): ${adultos}\n`;
      if (criancas > 0) mensagem += `Crianças: ${criancas}\n`;
      mensagem += `Pensão: ${opcao.pensao}\n`;
      mensagem += `Tarifa: ${opcao.tarifa}\n`;
    } else if (hotelResort === "costao") {
      mensagem += `Adulto(s): ${adultos}\n`;
      if (criancas > 0) mensagem += `Crianças: ${criancas}\n`;
      if (opcao.pensao) mensagem += `Pensão: ${opcao.pensao}\n`;
      if (opcao.tarifa) mensagem += `Tarifa: ${opcao.tarifa}\n`;
    } else {
      let totalPessoasTexto = `${adultos} adulto${adultos > 1 ? "s" : ""}`;
      if (criancas > 0)
        totalPessoasTexto += ` + ${criancas} criança${criancas > 1 ? "s" : ""}`;
      mensagem += `☺ ${totalPessoasTexto}\n`;
    }

    mensagem += `${diarias} diária${diarias > 1 ? "s" : ""}\n`;
    mensagem += `▶ *${opcao.preco_total}*\n\n`;
  }
}

// ---- RODAPÉ ----
if (hotelResort === "park_hotel") {
  mensagem += config.recreacao + `\n\n`;
  mensagem += config.servicos + `\n\n`;
  mensagem += config.pagamento + `\n\n`;
  mensagem += config.checkin + `\n`;
  mensagem += config.checkout + `\n\n`;
  mensagem += config.obs;
  if (config.aviso) mensagem += `\n\n` + config.aviso;
} else if (hotelResort === "termas_gravatal") {
  mensagem += config.roupao + `\n\n`;
  mensagem += config.horarios_refeicoes + `\n\n`;
  mensagem += config.horarios_piscinas + `\n\n`;
  mensagem += config.horarios_banheiras + `\n\n`;
  mensagem += config.checkin + `\n`;
  mensagem += config.checkout + `\n\n`;
  mensagem += config.obs;
  if (config.aviso) mensagem += `\n\n` + config.aviso;
} else if (hotelResort === "fazzenda") {
  mensagem += config.obs_pix + `\n\n`;
  mensagem += config.pagamento + `\n\n`;
  mensagem += config.checkin + `\n`;
  mensagem += config.checkout + `\n\n`;
  mensagem += config.atividades + `\n\n`;
  mensagem += config.servicos + `\n\n`;
  mensagem += config.allinclusive + `\n\n`;
  mensagem += config.bebidas + `\n\n`;
  mensagem += config.obs;
  if (config.aviso) mensagem += `\n\n` + config.aviso;
} else if (hotelResort === "termas_do_lago") {
  mensagem += config.pagamento + `\n\n`;
  mensagem += config.checkin_checkout + `\n\n`;
  mensagem += config.amenidades + `\n\n`;
  mensagem += config.estrutura + `\n\n`;
  mensagem += config.obs;
  if (config.aviso) mensagem += `\n\n` + config.aviso;
} else if (hotelResort === "machadinho_thermas") {
  mensagem += config.pensao + `\n\n`;
  mensagem += config.bebidas + `\n\n`;
  mensagem += config.piscinas + `\n\n`;
  mensagem += config.pagamento + `\n\n`;
  mensagem += config.recreacao + `\n\n`;
  mensagem += config.costelao + `\n\n`;
  mensagem += config.ovelha + `\n\n`;
  mensagem += config.lama + `\n\n`;
  mensagem += config.chardonnay + `\n\n`;
  mensagem += config.estrutura + `\n\n`;
  mensagem += config.apartamentos + `\n\n`;
  mensagem += config.obs_bebidas + `\n\n`;
  mensagem += config.opcionais + `\n\n`;
  mensagem += config.spa + `\n\n`;
  mensagem += config.checkin + `\n`;
  mensagem += config.checkout + `\n\n`;
  mensagem += config.horarios_refeicoes;
  if (config.aviso) mensagem += `\n\n` + config.aviso;
} else if (hotelResort === "aguas_de_palmas") {
  mensagem += config.recreacao + `\n\n`;
  mensagem += config.parque + `\n\n`;
  mensagem += config.praia + `\n\n`;
  mensagem += config.pagamento + `\n\n`;
  mensagem += config.checkin + `\n`;
  mensagem += config.checkout + `\n\n`;
  mensagem += config.obs;
  if (config.aviso) mensagem += `\n\n` + config.aviso;
} else if (hotelResort === "recanto_cataratas_resort") {
  mensagem += config.estrutura + `\n\n`;
  mensagem += config.pagamento + `\n\n`;
  mensagem += config.checkin_checkout;
  if (config.aviso) mensagem += `\n\n` + config.aviso;
} else if (hotelResort === "cabanas") {
  mensagem += config.pagamento + `\n\n`;
  mensagem += config.checkin + `\n`;
  mensagem += config.checkout + `\n\n`;
  mensagem += config.horarios_refeicoes + `\n\n`;
  mensagem += config.pets + `\n\n`;
  mensagem += config.obs;
  if (config.aviso) mensagem += `\n\n` + config.aviso;
} else if (hotelResort === "costao") {
  mensagem += config.desconto + `\n\n`;
  mensagem += config.pagamento + `\n\n`;
  mensagem += config.checkin + `\n`;
  mensagem += config.checkout + `\n\n`;
  mensagem += config.pets + `\n\n`;
  mensagem += config.obs;
  if (config.aviso) mensagem += `\n\n` + config.aviso;
} else if (hotelResort === "lagos_de_jurema") {
  mensagem += config.horarios_refeicoes + `\n\n`;
  mensagem += config.sobre_resort + `\n\n`;
  mensagem += config.checkin_checkout + `\n\n`;
  mensagem += config.obs;
  if (config.aviso) mensagem += `\n\n` + config.aviso;
} else {
  // hotel_internacional
  mensagem += `\n` + config.pagamento + `\n\n`;
  mensagem += config.checkin + `\n`;
  mensagem += config.checkout + `\n\n`;
  mensagem += config.obs;
  if (config.aviso) mensagem += `\n\n` + config.aviso;
}

return [{ json: { mensagem } }];
