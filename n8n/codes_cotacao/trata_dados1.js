// Pega os dados coletados
const dadosColetados = $item(0).$node["Code"].json.dados_coletados;
const hotelCode = $item(0).$node["Webhook"].json.query.assistant;

// Função para converter e validar data
function converterData(dataStr) {
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

// Ordena idades do mais novo ao mais velho
// (a API já aplica a regra: max 1 cortesia por AP, restante pagante por faixa etária)
const idades = [...(dadosColetados.idades_criancas || [])]
  .map(idade => Math.floor(Number(idade)))
  .filter(idade => idade >= 3)
  .sort((a, b) => a - b);

// Formato esperado pela API: "3,11" ou "" se sem crianças
const criancas_idades = idades.length > 0 ? idades.join(',') : '';

const checkin  = converterData(dadosColetados.data_entrada);
const checkout = converterData(dadosColetados.data_saida);

return {
  hotel_code:         hotelCode,
  checkin:            checkin,
  checkout:           checkout,
  adultos:            dadosColetados.adultos,
  criancas_idades:    criancas_idades,
  email:              dadosColetados.email,
  apartamento_num:    1,
  total_apartamentos: 1,
  total_datas:        1
};
