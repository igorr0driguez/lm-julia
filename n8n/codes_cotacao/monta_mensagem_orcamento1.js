const dados = $item(0).$node["Orcamento3"].json;
const { hotel: hotelResort, config } = $item(0).$node["Config Hoteis"].json;

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

if (dados && dados.opcoes) {
  dados.opcoes.sort((a, b) => parsePreco(a.preco_total) - parsePreco(b.preco_total));
}

if (!dados || !dados.opcoes || dados.opcoes.length === 0) {
  return {
    mensagem:
      "☹ Infelizmente não encontramos disponibilidade para as datas solicitadas. Gostaria de verificar outras datas disponíveis?",
    imagem: null,
  };
}

const [anoIn, mesIn, diaIn] = dados.busca.checkin.split("-");
const [anoOut, mesOut, diaOut] = dados.busca.checkout.split("-");
const dataEntrada = `${diaIn}/${mesIn}/${anoIn}`;
const dataSaida = `${diaOut}/${mesOut}/${anoOut}`;

const checkin = new Date(dados.busca.checkin + "T12:00:00");
const checkout = new Date(dados.busca.checkout + "T12:00:00");
const diarias = Math.round(
  Math.abs((checkout - checkin) / (24 * 60 * 60 * 1000)),
);

const adultos = dados.busca.hospedes.adultos;
const criancasIdades = dados.busca.hospedes.criancas_idades;
const criancas = criancasIdades
  ? criancasIdades.split(",").filter((x) => x.trim() !== "").length
  : 0;

const primeiraOpcao = dados.opcoes[0];
const totalParaMostrar = Math.min(3, dados.opcoes.length);

let mensagem = "";

// ============================================================
// TERMAS PARK HOTEL
// ============================================================
if (hotelResort === "park_hotel") {
  const totalPessoas = adultos + criancas;
  let totalPessoasTexto = `${adultos} adulto${adultos > 1 ? "s" : ""}`;
  if (criancas > 0)
    totalPessoasTexto += ` + ${criancas} criança${criancas > 1 ? "s" : ""}`;

  mensagem += config.titulo + `\n\n`;
  mensagem += `☉ *Período:* ${dataEntrada} a ${dataSaida} (${diarias} diária${diarias > 1 ? "s" : ""})\n\n`;
  mensagem += `☺ *Hospedagem para:* ${totalPessoasTexto} (${totalPessoas} pessoa${totalPessoas > 1 ? "s" : ""})\n\n`;

  mensagem += `✦ *Valor total do pacote:*\n\n`;
  mensagem += `*${primeiraOpcao.apartamento}*\n`;
  mensagem += `▶ *${primeiraOpcao.preco_total}*\n`;
  for (let i = 1; i < totalParaMostrar; i++) {
    mensagem += `*${dados.opcoes[i].apartamento.toUpperCase()}* - consultar\n`;
  }
  mensagem += "\n";

  mensagem += config.pensao + `\n\n`;
  mensagem += config.estrutura + `\n\n`;
  mensagem += config.recreacao + `\n\n`;
  mensagem += config.servicos + `\n\n`;
  mensagem += config.pagamento + `\n\n`;
  mensagem += config.checkin + `\n`;
  mensagem += config.checkout + `\n\n`;
  mensagem += config.obs;
  if (config.aviso) mensagem += `\n\n` + config.aviso;

  // ============================================================
  // HOTEL TERMAS GRAVATAL
  // ============================================================
} else if (hotelResort === "termas_gravatal") {
  mensagem += `*Orçamento:*\n`;
  mensagem += config.subtitulo + `\n\n`;

  mensagem += config.pensao + `\n\n`;
  mensagem += config.estrutura + `\n\n`;

  mensagem += `✦ *Valores Da Hospedagem:*\n\n`;
  mensagem += `${dataEntrada} - ${dataSaida}\n`;
  mensagem += `*${primeiraOpcao.apartamento}*\n`;

  let totalPessoasTexto = `${adultos} adulto${adultos > 1 ? "s" : ""}`;
  if (criancas > 0)
    totalPessoasTexto += ` + ${criancas} criança${criancas > 1 ? "s" : ""}`;
  mensagem += `☺ ${totalPessoasTexto}\n`;
  mensagem += `${diarias} diária${diarias > 1 ? "s" : ""}\n`;
  mensagem += `▶ *${primeiraOpcao.preco_total}*\n\n`;

  for (let i = 1; i < totalParaMostrar; i++) {
    mensagem += `*${dados.opcoes[i].apartamento.toUpperCase()}* - consultar\n`;
  }
  mensagem += "\n";

  mensagem += config.roupao + `\n\n`;
  mensagem += config.horarios_refeicoes + `\n\n`;
  mensagem += config.horarios_piscinas + `\n\n`;
  mensagem += config.horarios_banheiras + `\n\n`;
  mensagem += config.checkin + `\n`;
  mensagem += config.checkout + `\n\n`;
  mensagem += config.obs;
  if (config.aviso) mensagem += `\n\n` + config.aviso;

  // ============================================================
  // HOTEL TERMAS DO LAGO
  // ============================================================
  // ============================================================
  // FAZZENDA PARK RESORT
  // ============================================================
} else if (hotelResort === "fazzenda") {
  const totalPessoas = adultos + criancas;
  let totalPessoasTexto = `${adultos} adulto${adultos > 1 ? "s" : ""}`;
  if (criancas > 0)
    totalPessoasTexto += ` + ${criancas} criança${criancas > 1 ? "s" : ""}`;

  // --- ORÇAMENTO ---
  mensagem += config.titulo + `\n\n`;
  mensagem += `☉ *Período:* ${dataEntrada} a ${dataSaida} (${diarias} diária${diarias > 1 ? "s" : ""})\n`;
  mensagem += `☺ *Hospedagem para:* ${totalPessoasTexto} (${totalPessoas} pessoa${totalPessoas > 1 ? "s" : ""})\n\n`;
  mensagem += `*${primeiraOpcao.apartamento}*\n`;
  mensagem += `◆ PIX à vista com 3% de desconto: ▶ *${calcPix(primeiraOpcao.preco_total)}*\n`;
  mensagem += `◆ Cartão em até 12x sem juros: ${primeiraOpcao.preco_total}\n`;
  for (let i = 1; i < totalParaMostrar; i++) {
    mensagem += `*${dados.opcoes[i].apartamento.toUpperCase()}* - consultar\n`;
  }
  mensagem += "\n";
  mensagem += config.pagamento + `\n\n`;
  mensagem += config.checkin + `\n`;
  mensagem += config.checkout + `\n\n`;

  // --- ATIVIDADES ---
  mensagem += config.atividades + `\n\n`;
  mensagem += config.servicos + `\n\n`;

  // --- ALL INCLUSIVE ---
  mensagem += config.allinclusive + `\n\n`;
  mensagem += config.bebidas + `\n\n`;

  mensagem += config.obs;
  if (config.aviso) mensagem += `\n\n` + config.aviso;

  // ============================================================
  // HOTEL TERMAS DO LAGO
  // ============================================================
} else if (hotelResort === "termas_do_lago") {
  mensagem += config.titulo + `\n\n`;
  mensagem += `Data: ${dataEntrada} a ${dataSaida}\n\n`;
  mensagem += `Valor total do pacote para o período solicitado para todos\n\n`;
  mensagem += `*${primeiraOpcao.apartamento}*\n`;
  mensagem += `▶ *${primeiraOpcao.preco_total}*\n\n`;
  mensagem += config.pensao + `\n\n`;

  for (let i = 1; i < totalParaMostrar; i++) {
    mensagem += `*${dados.opcoes[i].apartamento.toUpperCase()}* - consultar\n`;
  }
  if (totalParaMostrar > 1) mensagem += "\n";

  mensagem += config.pagamento + `\n\n`;
  mensagem += config.checkin_checkout + `\n\n`;
  mensagem += config.amenidades + `\n\n`;
  mensagem += config.estrutura + `\n\n`;
  mensagem += config.obs;
  if (config.aviso) mensagem += `\n\n` + config.aviso;

  // ============================================================
  // MACHADINHO THERMAS RESORT SPA
  // ============================================================
} else if (hotelResort === "machadinho_thermas") {
  const totalPessoas = adultos + criancas;
  let totalPessoasTexto = `${adultos} adulto${adultos > 1 ? "s" : ""}`;
  if (criancas > 0)
    totalPessoasTexto += ` + ${criancas} criança${criancas > 1 ? "s" : ""}`;

  mensagem += config.titulo + `\n\n`;
  mensagem += `☉ *Período:* ${dataEntrada} a ${dataSaida} (${diarias} diária${diarias > 1 ? "s" : ""})\n`;
  mensagem += `☺ *Hospedagem para:* ${totalPessoasTexto} (${totalPessoas} pessoa${totalPessoas > 1 ? "s" : ""})\n\n`;

  mensagem += `✦ *Valor total do pacote:*\n\n`;
  mensagem += `*${primeiraOpcao.apartamento}*\n`;
  mensagem += `▶ *${primeiraOpcao.preco_total}*\n`;
  for (let i = 1; i < totalParaMostrar; i++) {
    mensagem += `*${dados.opcoes[i].apartamento.toUpperCase()}* - consultar\n`;
  }
  mensagem += "\n";

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

  // ============================================================
  // ÁGUAS DE PALMAS RESORT
  // ============================================================
} else if (hotelResort === "aguas_de_palmas") {
  const totalPessoas = adultos + criancas;
  let totalPessoasTexto = `${adultos} adulto${adultos > 1 ? "s" : ""}`;
  if (criancas > 0)
    totalPessoasTexto += ` + ${criancas} criança${criancas > 1 ? "s" : ""}`;

  mensagem += config.titulo + `\n`;
  mensagem += config.subtitulo + `\n\n`;
  mensagem += config.pensao + `\n\n`;
  mensagem += `✦ *Orçamento da Hospedagem*\n\n`;
  mensagem += `☉ *Período:* ${dataEntrada} a ${dataSaida} (${diarias} diária${diarias > 1 ? "s" : ""})\n`;
  mensagem += `☺ *Hospedagem para:* ${totalPessoasTexto} (${totalPessoas} pessoa${totalPessoas > 1 ? "s" : ""})\n\n`;
  mensagem += `*${primeiraOpcao.apartamento}*\n`;
  mensagem += `▶ *${primeiraOpcao.preco_total}*\n`;
  for (let i = 1; i < totalParaMostrar; i++) {
    mensagem += `*${dados.opcoes[i].apartamento.toUpperCase()}* - consultar\n`;
  }
  mensagem += "\n";

  mensagem += config.recreacao + `\n\n`;
  mensagem += config.parque + `\n\n`;
  mensagem += config.praia + `\n\n`;
  mensagem += config.pagamento + `\n\n`;
  mensagem += config.checkin + `\n`;
  mensagem += config.checkout + `\n\n`;
  mensagem += config.obs;
  if (config.aviso) mensagem += `\n\n` + config.aviso;

  // ============================================================
  // RECANTO CATARATAS THERMAS RESORT
  // ============================================================
} else if (hotelResort === "recanto_cataratas_resort") {
  let totalPessoasTexto = `${adultos} adulto${adultos > 1 ? "s" : ""}`;
  if (criancas > 0)
    totalPessoasTexto += ` + ${criancas} criança${criancas > 1 ? "s" : ""}`;

  mensagem += config.titulo + `\n\n`;
  mensagem += `✦ *Valores da hospedagem:*\n\n`;
  mensagem += `${dataEntrada} - ${dataSaida}\n`;
  mensagem += `☺ ${totalPessoasTexto}\n`;
  mensagem += `${diarias} diária${diarias > 1 ? "s" : ""}\n\n`;

  const opsPorPensao = agruparPorPensaoRecanto(dados.opcoes);
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

  mensagem += config.estrutura + `\n\n`;
  mensagem += config.pagamento + `\n\n`;
  mensagem += config.checkin_checkout;
  if (config.aviso) mensagem += `\n\n` + config.aviso;

  // ============================================================
  // CABANAS TERMAS HOTEL
  // ============================================================
} else if (hotelResort === "cabanas") {
  let totalPessoasTexto = `${adultos} adulto${adultos > 1 ? "s" : ""}`;
  if (criancas > 0)
    totalPessoasTexto += ` + ${criancas} criança${criancas > 1 ? "s" : ""}`;

  mensagem += config.titulo + `\n\n`;
  mensagem += config.pensao + `\n\n`;

  mensagem += `💵 *Valores Da Hospedagem:*\n\n`;
  mensagem += `${dataEntrada} - ${dataSaida}\n`;
  mensagem += `*${primeiraOpcao.apartamento}*\n`;
  mensagem += `☺ ${totalPessoasTexto}\n`;
  mensagem += `${diarias} diária${diarias > 1 ? "s" : ""}\n`;
  mensagem += `▶ *${primeiraOpcao.preco_total}*\n\n`;

  for (let i = 1; i < totalParaMostrar; i++) {
    mensagem += `*${dados.opcoes[i].apartamento.toUpperCase()}* - consultar\n`;
  }
  if (totalParaMostrar > 1) mensagem += "\n";

  mensagem += config.pagamento + `\n\n`;
  mensagem += config.checkin + `\n`;
  mensagem += config.checkout + `\n\n`;
  mensagem += config.horarios_refeicoes + `\n\n`;
  mensagem += config.pets + `\n\n`;
  mensagem += config.obs;
  if (config.aviso) mensagem += `\n\n` + config.aviso;

  // ============================================================
  // COSTÃO DO SANTINHO
  // ============================================================
} else if (hotelResort === "costao") {
  let totalPessoasTexto = `${adultos} adulto${adultos > 1 ? "s" : ""}`;
  if (criancas > 0)
    totalPessoasTexto += ` + ${criancas} criança${criancas > 1 ? "s" : ""}`;

  mensagem += config.titulo + `\n\n`;
  mensagem += config.regime + `\n\n`;

  mensagem += `✦ *Valores Da Hospedagem:*\n\n`;
  mensagem += `${dataEntrada} - ${dataSaida}\n`;
  mensagem += `*${primeiraOpcao.apartamento}*\n`;
  mensagem += `Adulto(s): ${adultos}\n`;
  if (criancas > 0) mensagem += `Crianças: ${criancas}\n`;
  if (primeiraOpcao.pensao) mensagem += `Pensão: ${primeiraOpcao.pensao}\n`;
  if (primeiraOpcao.tarifa) mensagem += `Tarifa: ${primeiraOpcao.tarifa}\n`;
  mensagem += `${diarias} diária${diarias > 1 ? "s" : ""}\n`;
  mensagem += `▶ *${primeiraOpcao.preco_total}*\n\n`;

  for (let i = 1; i < totalParaMostrar; i++) {
    mensagem += `*${dados.opcoes[i].apartamento.toUpperCase()}* - consultar\n`;
  }
  if (totalParaMostrar > 1) mensagem += "\n";

  mensagem += config.desconto + `\n\n`;
  mensagem += config.pagamento + `\n\n`;
  mensagem += config.checkin + `\n`;
  mensagem += config.checkout + `\n\n`;
  mensagem += config.pets + `\n\n`;
  mensagem += config.obs;
  if (config.aviso) mensagem += `\n\n` + config.aviso;

  // ============================================================
  // LAGOS DE JUREMA
  // ============================================================
} else if (hotelResort === "lagos_de_jurema") {
  let totalPessoasTexto = `${adultos} adulto${adultos > 1 ? "s" : ""}`;
  if (criancas > 0)
    totalPessoasTexto += ` + ${criancas} criança${criancas > 1 ? "s" : ""}`;

  mensagem += config.titulo + `\n\n`;

  mensagem += `✦ *Valores da hospedagem:*\n\n`;
  mensagem += `${dataEntrada} - ${dataSaida}\n`;
  mensagem += `*${primeiraOpcao.apartamento}*\n`;
  mensagem += `☺ ${totalPessoasTexto}\n`;
  mensagem += `${diarias} diária${diarias > 1 ? "s" : ""}\n`;
  mensagem += `▶ *${primeiraOpcao.preco_total}*\n`;
  for (let i = 1; i < totalParaMostrar; i++) {
    mensagem += `*${dados.opcoes[i].apartamento.toUpperCase()}* - consultar\n`;
  }
  mensagem += "\n";

  mensagem += config.horarios_refeicoes + `\n\n`;
  mensagem += config.sobre_resort + `\n\n`;
  mensagem += config.checkin_checkout + `\n\n`;
  mensagem += config.obs;
  if (config.aviso) mensagem += `\n\n` + config.aviso;

  // ============================================================
  // JARDINS DE JUREMA
  // ============================================================
} else if (hotelResort === "jardins_de_jurema") {
  let totalPessoasTexto = `${adultos} adulto${adultos > 1 ? "s" : ""}`;
  if (criancas > 0)
    totalPessoasTexto += ` + ${criancas} criança${criancas > 1 ? "s" : ""}`;

  mensagem += config.titulo + `\n\n`;

  mensagem += `✦ *Valores da hospedagem:*\n\n`;
  mensagem += `${dataEntrada} - ${dataSaida}\n`;
  mensagem += `*${primeiraOpcao.apartamento}*\n`;
  mensagem += `☺ ${totalPessoasTexto}\n`;
  mensagem += `${diarias} diária${diarias > 1 ? "s" : ""}\n`;
  mensagem += `▶ *${primeiraOpcao.preco_total}*\n`;
  for (let i = 1; i < totalParaMostrar; i++) {
    mensagem += `*${dados.opcoes[i].apartamento.toUpperCase()}* - consultar\n`;
  }
  mensagem += "\n";

  mensagem += config.horarios_refeicoes + `\n\n`;
  mensagem += config.sobre_resort + `\n\n`;
  mensagem += config.checkin_checkout + `\n\n`;
  mensagem += config.obs;
  if (config.aviso) mensagem += `\n\n` + config.aviso;

  // ============================================================
  // MABU THERMAS GRAND RESORT
  // ============================================================
} else if (hotelResort === "mabu_thermas") {
  let totalPessoasTexto = `${adultos} adulto${adultos > 1 ? "s" : ""}`;
  if (criancas > 0)
    totalPessoasTexto += ` + ${criancas} criança${criancas > 1 ? "s" : ""}`;

  mensagem += config.titulo + `\n\n`;
  mensagem += `✦ *Valores da hospedagem:*\n\n`;
  mensagem += `${dataEntrada} - ${dataSaida}\n`;
  mensagem += `☺ ${totalPessoasTexto}\n`;
  mensagem += `${diarias} diária${diarias > 1 ? "s" : ""}\n\n`;

  const opsPorPensao = agruparPorPensaoRecanto(dados.opcoes);
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

  mensagem += config.estrutura + `\n\n`;
  mensagem += config.checkin_checkout + `\n\n`;
  mensagem += config.obs;
  if (config.aviso) mensagem += `\n\n` + config.aviso;

  // ============================================================
  // HOTEL INTERNACIONAL GRAVATAL
  // ============================================================
} else {
  mensagem += `*Orçamento:*\n`;
  mensagem += `★ *${dados.hotel.nome}*\n\n`;

  mensagem += config.pensao + `\n\n`;
  mensagem += config.bebidas + `\n\n`;

  mensagem += `✦ *Valores da hospedagem:*\n\n`;
  mensagem += `${dataEntrada} - ${dataSaida}\n`;
  mensagem += `*${primeiraOpcao.apartamento}*\n`;
  mensagem += (adultos === 4 && criancas === 0) ? `Hóspede(s): ${adultos}\n` : `Adulto(s): ${adultos}\n`;
  if (criancas > 0) mensagem += `Crianças: ${criancas}\n`;
  mensagem += `Pensão: ${primeiraOpcao.pensao}\n`;
  mensagem += `Tarifa: ${primeiraOpcao.tarifa}\n`;
  mensagem += `${diarias} diária${diarias > 1 ? "s" : ""}\n`;
  mensagem += `*${primeiraOpcao.preco_total}*\n\n`;

  for (let i = 1; i < totalParaMostrar; i++) {
    mensagem += `*${dados.opcoes[i].apartamento.toUpperCase()}* - consultar\n`;
  }

  mensagem += `\n` + config.pagamento + `\n\n`;
  mensagem += config.checkin + `\n`;
  mensagem += config.checkout + `\n\n`;
  mensagem += config.obs;
  if (config.aviso) mensagem += `\n\n` + config.aviso;
}

return {
  mensagem: mensagem,
  hotel: dados.hotel ? dados.hotel.nome : hotelResort,
  checkin: dataEntrada,
  checkout: dataSaida,
  diarias: diarias,
  total_opcoes: dados.resumo ? dados.resumo.total_opcoes : null,
  valor_minimo: dados.resumo ? dados.resumo.mais_barato : null,
  valor_maximo: dados.resumo ? dados.resumo.mais_caro : null,
  opcoes_completas: dados.opcoes,
};
