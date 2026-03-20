const dados = $item(0).$node["Code"].json;
const dadosColetados = dados.dados_coletados;
const hotelCode = $item(0).$node["Webhook"].json.query.assistant;

function converterData(dataStr) {
  if (!dataStr) throw new Error("Data não informada");
  const partes = dataStr.split('/');
  let dia, mes, ano;
  if (partes.length === 2) {
    [dia, mes] = partes;
    ano = new Date().getFullYear().toString();
  } else if (partes.length === 3) {
    [dia, mes, ano] = partes;
  } else {
    throw new Error(`Formato de data inválido: ${dataStr}`);
  }
  return `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
}

// Resiliente: aceita datas_alternativas, datas, ou multiplas_datas como chave
const dm = dados.dados_multiplos || {};
const datasRaw = dm.datas_alternativas || dm.datas || dm.multiplas_datas || [];
const datas = datasRaw.length > 0
  ? datasRaw
  : [{ data_entrada: dadosColetados.data_entrada, data_saida: dadosColetados.data_saida }];

const apartamentos = (dm.apartamentos && dm.apartamentos.length > 0)
  ? dm.apartamentos
  : [{
      ap: 1,
      adultos: dadosColetados.adultos,
      criancas: dadosColetados.criancas,
      idades_criancas: dadosColetados.idades_criancas || []
    }];

const resultado = [];

for (const data of datas) {
  const checkin = converterData(data.data_entrada);
  const checkout = converterData(data.data_saida);

  for (const ap of apartamentos) {
    const idades = [...(ap.idades_criancas || [])]
      .map(idade => Math.floor(Number(idade)))
      .filter(idade => idade >= 3)
      .sort((a, b) => a - b);
    const criancas_idades = idades.length > 0 ? idades.join(',') : '';

    resultado.push({
      json: {
        hotel_code:         hotelCode,
        checkin:            checkin,
        checkout:           checkout,
        adultos:            ap.adultos,
        criancas_idades:    criancas_idades,
        apartamento_num:    ap.ap,
        total_apartamentos: apartamentos.length,
        total_datas:        datas.length
      }
    });
  }
}

return resultado;