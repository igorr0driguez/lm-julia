const { hotel: hotelResort, config } = $item(0).$node["Config Hoteis"].json;
const totalItems = items.length;

function parsePreco(str) {
  if (!str) return Infinity;
  return Number(str.replace(/[R$\s.]/g, '').replace(',', '.'));
}

function formatPreco(value) {
  return 'R$ ' + value.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?=,))/g, '.');
}

function calcPix(str) {
  const valor = parsePreco(str);
  if (!isFinite(valor)) return str;
  return formatPreco(valor * 0.97);
}

// --- Helpers Recanto Cataratas: agrupa por pensão ---
function normalizePensaoRecanto(pensao) {
  if (!pensao) return 'cafe';
  const lower = pensao.toLowerCase();
  if (lower.includes('pensão completa') || lower.includes('pensao completa')) return 'completa';
  if (lower.includes('meia pensão') || lower.includes('meia pensao')) return 'meia';
  return 'cafe';
}

function agruparPorPensaoRecanto(opcoes) {
  const grupos = {};
  for (const op of opcoes) {
    const key = normalizePensaoRecanto(op.pensao);
    if (!grupos[key] || parsePreco(op.preco_total) < parsePreco(grupos[key].preco_total)) {
      grupos[key] = op;
    }
  }
  const ordem = ['cafe', 'meia', 'completa'];
  const labels = {
    cafe: '☕ Café da Manhã',
    meia: '✦ Meia Pensão',
    completa: '✦ Pensão Completa',
  };
  return ordem.filter(k => grupos[k]).map(k => ({ label: labels[k], opcao: grupos[k] }));
}

// --- Helpers Costão do Santinho: agrupa por tarifa ---
function normalizeTarifaCostao(tarifa) {
  if (!tarifa) return 'pix7';
  const lower = tarifa.toLowerCase();
  if (lower.includes('5%')) return 'cartao5';
  if (lower.includes('reembolsável') && !lower.includes('não reembolsável')) return 'reembolsavel';
  return 'pix7';
}

function agruparPorTarifaCostao(opcoes) {
  const grupos = {};
  for (const op of opcoes) {
    const key = normalizeTarifaCostao(op.tarifa);
    if (!grupos[key] || parsePreco(op.preco_total) < parsePreco(grupos[key].preco_total)) {
      grupos[key] = op;
    }
  }
  const ordem = ['pix7', 'cartao5', 'reembolsavel'];
  return ordem.filter(k => grupos[k]).map(k => ({ key: k, opcao: grupos[k] }));
}

// --- Helpers Mabu Thermas: agrupa por pensão ---
function normalizePensaoMabu(pensao) {
  if (!pensao) return 'cafe';
  const lower = pensao.toLowerCase();
  if (lower.includes('pensão completa') || lower.includes('pensao completa')) return 'completa';
  if (lower.includes('jantar')) return 'meia';
  return 'cafe';
}

function agruparPorPensaoMabu(opcoes) {
  const grupos = {};
  for (const op of opcoes) {
    const key = normalizePensaoMabu(op.pensao);
    if (!grupos[key] || parsePreco(op.preco_total) < parsePreco(grupos[key].preco_total)) {
      grupos[key] = op;
    }
  }
  const ordem = ['cafe', 'meia', 'completa'];
  const labels = {
    cafe: '☕ Café da Manhã',
    meia: '✦ Meia Pensão (Café + Jantar)',
    completa: '✦ Pensão Completa (Café + Almoço + Jantar)',
  };
  return ordem.filter(k => grupos[k]).map(k => ({ label: labels[k], opcao: grupos[k] }));
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
} else if (hotelResort === "jardins_de_jurema") {
  mensagem += config.titulo + `\n\n`;
  mensagem += `✦ *Valores da hospedagem:*\n\n`;
} else if (hotelResort === "mabu_thermas") {
  mensagem += config.titulo + `\n\n`;
  mensagem += `✦ *Valores da hospedagem:*\n\n`;
} else if (hotelResort === "vivaz_cataratas") {
  mensagem += config.titulo + `\n\n`;
  mensagem += config.subtitulo + `\n\n`;
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

    // --- Agrupamento por pensão (Recanto Cataratas / Mabu Thermas) ---
    if (hotelResort === "recanto_cataratas_resort" || hotelResort === "mabu_thermas" || hotelResort === "vivaz_cataratas") {
      const dados = ap.dados_api;
      const adultos = dados.busca.hospedes.adultos;
      const criancasIdades = dados.busca.hospedes.criancas_idades;
      const criancas = criancasIdades
        ? criancasIdades.split(",").filter((x) => x.trim() !== "").length
        : 0;

      mensagem += `*QUARTO ${ap.ap_num}:*\n`;
      mensagem += `${dataEntrada} - ${dataSaida}\n`;
      let totalPessoasTexto = `${adultos} adulto${adultos > 1 ? "s" : ""}`;
      if (criancas > 0)
        totalPessoasTexto += ` + ${criancas} criança${criancas > 1 ? "s" : ""}`;
      mensagem += `☺ ${totalPessoasTexto}\n`;
      mensagem += `${diarias} diária${diarias > 1 ? "s" : ""}\n\n`;

      const opsPorPensao = (hotelResort === "mabu_thermas" || hotelResort === "vivaz_cataratas")
        ? agruparPorPensaoMabu(dados.opcoes)
        : agruparPorPensaoRecanto(dados.opcoes);
      const todasMesmaCategoria = opsPorPensao.length > 1 &&
        opsPorPensao.every(o => o.opcao.apartamento === opsPorPensao[0].opcao.apartamento);

      if (todasMesmaCategoria) {
        mensagem += `*${opsPorPensao[0].opcao.apartamento}*\n`;
        for (const { label, opcao } of opsPorPensao) {
          mensagem += `${label}: ▶ *${opcao.preco_total}*\n`;
        }
      } else {
        for (const { label, opcao } of opsPorPensao) {
          mensagem += `${label} — *${opcao.apartamento}*\n`;
          mensagem += `▶ *${opcao.preco_total}*\n`;
        }
      }
      mensagem += "\n";
      continue;
    }

    // --- Agrupamento por tarifa (Costão do Santinho) ---
    if (hotelResort === "costao") {
      const dados = ap.dados_api;
      const adultos = dados.busca.hospedes.adultos;
      const criancasIdades = dados.busca.hospedes.criancas_idades;
      const criancas = criancasIdades
        ? criancasIdades.split(",").filter((x) => x.trim() !== "").length
        : 0;

      mensagem += `*QUARTO ${ap.ap_num}:*\n`;
      mensagem += `${dataEntrada} - ${dataSaida}\n`;
      mensagem += `Adulto(s): ${adultos}\n`;
      if (criancas > 0) mensagem += `Crianças: ${criancas}\n`;
      mensagem += `${diarias} diária${diarias > 1 ? "s" : ""}\n\n`;

      const opsPorTarifa = agruparPorTarifaCostao(dados.opcoes);
      const todasMesmaCategoria = opsPorTarifa.length > 1 &&
        opsPorTarifa.every(o => o.opcao.apartamento === opsPorTarifa[0].opcao.apartamento);

      if (todasMesmaCategoria) {
        mensagem += `*${opsPorTarifa[0].opcao.apartamento}*\n\n`;
        for (const { key, opcao } of opsPorTarifa) {
          mensagem += `Tarifa: ${opcao.tarifa}\n`;
          mensagem += `▶ *${opcao.preco_total}*\n`;
          if (key === 'cartao5' || key === 'reembolsavel') mensagem += `_em até 10x com parcela mínima de R$100_\n`;
          mensagem += `\n`;
        }
      } else {
        for (const { key, opcao } of opsPorTarifa) {
          mensagem += `*${opcao.apartamento}*\n`;
          mensagem += `Tarifa: ${opcao.tarifa}\n`;
          mensagem += `▶ *${opcao.preco_total}*\n`;
          if (key === 'cartao5' || key === 'reembolsavel') mensagem += `_em até 10x com parcela mínima de R$100_\n`;
          mensagem += `\n`;
        }
      }
      mensagem += "\n";
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
    } else {
      let totalPessoasTexto = `${adultos} adulto${adultos > 1 ? "s" : ""}`;
      if (criancas > 0)
        totalPessoasTexto += ` + ${criancas} criança${criancas > 1 ? "s" : ""}`;
      mensagem += `☺ ${totalPessoasTexto}\n`;
    }

    mensagem += `${diarias} diária${diarias > 1 ? "s" : ""}\n`;
    if (hotelResort === "fazzenda") {
      mensagem += `◆ PIX à vista com 3% de desconto: ▶ *${calcPix(opcao.preco_total)}*\n`;
      mensagem += `◆ Cartão em até 12x sem juros: ${opcao.preco_total}\n\n`;
    } else {
      mensagem += `▶ *${opcao.preco_total}*\n\n`;
    }
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
} else if (hotelResort === "jardins_de_jurema") {
  mensagem += config.horarios_refeicoes + `\n\n`;
  mensagem += config.sobre_resort + `\n\n`;
  mensagem += config.checkin_checkout + `\n\n`;
  mensagem += config.obs;
  if (config.aviso) mensagem += `\n\n` + config.aviso;
} else if (hotelResort === "mabu_thermas") {
  mensagem += config.estrutura + `\n\n`;
  mensagem += config.checkin_checkout + `\n\n`;
  mensagem += config.obs;
  if (config.aviso) mensagem += `\n\n` + config.aviso;
} else if (hotelResort === "vivaz_cataratas") {
  mensagem += config.estrutura + `\n\n`;
  mensagem += config.lazer + `\n\n`;
  mensagem += config.refeicoes + `\n\n`;
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
