# Robôs Kommo — Documentação completa

## Visão geral

Os robôs do Kommo são salesbots configurados no designer de robôs. Existem dois tipos:
- **Globais**: criados uma vez, vinculados a múltiplos pipelines
- **Por pipeline**: específicos de cada hotel/central

### Limitação técnica crítica
O webhook da integração privada (handler_julia no widget) aceita **uma única resposta por requisição**. Consequência: nunca é possível enviar duas mensagens seguidas diretamente. A solução é encadear robôs ou usar salesbots separados.

### Por que robô dentro de robô (nested)
Os robôs "Falar com Jul.IA" e similares são chamados como sub-robôs dentro do "Chamar Jul.IA". Isso é obrigatório: se o fluxo fosse contínuo, o Kommo entraria em loop infinito e mataria a instância. Com o modelo nested, o robô pai fica aguardando o filho retornar antes de continuar.

---

## Robôs globais (afetam todos os pipelines onde são vinculados)

### [AUTO] Chamar Jul.IA
Loop principal. Acionado quando o lead entra na etapa **JUL.IA ATIVADA**.

**Fluxo:**
1. Verifica se `mensagem_buffer` contém "cotação"
   - Sim → vai direto ao ciclo de buffer (mensagem já está salva, pula espera)
   - Não → aguarda próxima mensagem do cliente (timeout: 4h → se atingir, passa para equipe)
2. Mensagem recebida → salva no `mensagem_buffer`
3. Entra no ciclo de buffer interno do Kommo: cronômetro de **1 minuto**, reiniciado a cada nova mensagem
4. Após 1 minuto sem mensagem nova → segue o fluxo
5. Checagem de sanidade: se `jul.ia_ativa` = vazio → para o robô
6. Verifica se `mensagem_buffer` contém o separador `§|§`
   - Sim → chama sub-robô **Falar com Jul.IA com Buffer** (buffer=true)
   - Não → chama sub-robô **Falar com Jul.IA** (buffer=false)
7. Após retorno do sub-robô: esvazia `mensagem_buffer`
8. Segunda checagem de sanidade: se `jul.ia_ativa` = vazio → para o robô
9. Volta ao passo 1 (loop)

---

### [AUTO] Falar com Jul.IA
Sub-robô (nested). Chamado dentro do "Chamar Jul.IA" quando não há buffer acumulado.

- Envia webhook via **handler_julia** (integração privada do widget)
- Query params: `assistant=julia`, `buffer=false`, `hotel_resort={valor do campo}`
- Aguarda resposta do n8n (edit request)
- Retorna mensagem ao Kommo
- Se erro → aborta

---

### [AUTO] Falar com Jul.IA com Buffer
Sub-robô (nested). Chamado quando `mensagem_buffer` contém o separador `§|§` (múltiplas mensagens acumuladas).

- Igual ao anterior, mas com query param `buffer=true`
- O n8n lê o `mensagem_buffer` via API Kommo para processar as mensagens concatenadas

---

### [AUTO] Chamar Gust.IA
Idêntico ao "Chamar Jul.IA". Sub-robôs usados: "Falar com Gust.IA" e "Falar com Gust.IA com Buffer". Query param `assistant=gustavo`.

---

### [AUTO] Falar com Gust.IA / Falar com Gust.IA com Buffer
Idênticos aos análogos da Jul.IA, com `assistant=gustavo`.

---

### [MANUAL] Desativar Jul.IA
Robô acionado manualmente pela equipe para interromper o atendimento da IA.

- Verifica se `jul.ia_ativa` = cheio
- Se sim → envia webhook ao n8n (workflow de desativação manual)

---

## Robôs por pipeline — Hotel individual

### Robô de Entrada
Primeiro robô acionado quando um lead chega ao pipeline. Prepara o contexto e inicia o fluxo da IA.

**Ações em sequência:**
1. Salva primeira mensagem do cliente no campo `mensagem_buffer`
2. **Verificação: `mensagem_buffer` está vazio?**
   - **SIM (hotel iniciou a conversa via WABA):**
     - Adiciona nota: "Conversa iniciada pelo hotel — IA não ativada"
     - Fim do robô (sem mudança de etapa, sem `jul.ia_ativa`)
   - **NÃO (cliente enviou mensagem → fluxo normal):**
     - Altera responsável do lead para o contato técnico
     - Adiciona nota: "IA em atendimento"
     - Define `jul.ia_ativa` = true
     - Define nome do lead = nome do contato (legibilidade na interface)
     - Define campo `hotel ou resort` (valor estético, visível para vendedores)
     - Define campo `hotel_resort` (valor técnico, is_api_only)
     - Muda etapa do lead → **JUL.IA ATIVADA**

**Condicional pós-setup (apenas branch NÃO acima):**
- Se `mensagem_buffer` contém "cotação":
  - Vai direto ao "Chamar Jul.IA" (sem mensagem de recepção — lead veio com formulário preenchido)
- Se não contém "cotação":
  - Dispara **Salesbot de Recepção** (mensagem pedindo dados de cotação)
  - Envia webhook ao n8n com params: `first_contact=true`, `buffer=true`, `follow_up=false`, `assistant=julia`
  - (n8n registra contexto mas não chama IA nem responde)

**Por que `mensagem_buffer` vazio indica conversa iniciada pelo hotel:**
O campo é populado pela última mensagem *incoming* do contato. Se o hotel enviou a primeira mensagem (outbound via WABA beta), não há mensagem incoming — o campo fica vazio. Operador usado no Kommo: `mensagem_buffer` → **está preenchido** (para o branch normal). Obs.: "não contém" não existe no Kommo, mas "está preenchido" / "está vazio" são operadores disponíveis.

---

### Salesbot de Recepção
Mensagem de boas-vindas + solicitação de dados. Disparado pelo Robô de Entrada quando não há formulário.

Conteúdo: saudação padrão da Jul.IA para o hotel (definido no prompt).

---

### Salesbot Preparando Orçamento
Solução para limitação de 1 resposta por webhook. Enviado imediatamente antes do orçamento.

Mensagem: *"Estou preparando seu orçamento, será enviado em breve"* (ou similar).

Motivo: o n8n retorna o orçamento em resposta separada; o cliente precisa de um aviso enquanto aguarda.

---

### Salesbot Enviar Fotos
Salesbot específico por hotel, com PDF/fotos do hotel. Acionado logo após o envio do orçamento pelo n8n.

- Cada hotel tem seu próprio salesbot com o material visual correspondente
- Solução para a limitação de 1 resposta por webhook (foto não pode ser enviada junto com o orçamento)

---

## Robôs por pipeline — Central

### Robô de Entrada (Central)
Diferente do hotel individual porque um único número atende múltiplos hotéis de uma região. Faz a triagem do hotel de interesse dentro do próprio salesbot.

**Fluxo:**
1. Lê a mensagem do cliente (95%+ vêm de landing page com formato: "Olá, gostaria de mais informações sobre o [hotel]")
2. Busca termos do nome dos hotéis da central na mensagem
3. **Se identificou hotel:**
   - Fluxo igual ao Robô de Entrada individual (define variáveis, muda etapa, verifica "cotação")
   - Tudo dentro de um único salesbot (sem pipeline separado por hotel nessa etapa)
4. **Se não identificou hotel:**
   - Define `hotel ou resort` = nome da central (ex: "Central Gravatal")
   - Define `hotel_resort` = identificador da central (ex: "central_gravatal")
   - Muda etapa → **JUL.IA ATIVADA** da central
   - Envia mensagem perguntando qual hotel/resort de interesse
   - (Gust.IA assume o atendimento e faz a triagem)

---

## Campos personalizados relevantes para os robôs

| Campo | Uso | Editável manualmente |
|---|---|---|
| `jul.ia_ativa` (ID: 1055196) | Liga/desliga IA — boolean true/false | Não (is_api_only) |
| `mensagem_buffer` | Acumula mensagens para buffer | Não (is_api_only) |
| `hotel_resort` | Identificador técnico do hotel (snake_case) | Não (is_api_only) |
| `hotel ou resort` | Nome legível do hotel para vendedores | Sim |

## Query params dos webhooks

| Param | Valores | Descrição |
|---|---|---|
| `assistant` | julia \| gustavo | Qual agente chamar no n8n |
| `buffer` | true \| false | Se n8n deve ler o mensagem_buffer via API |
| `hotel_resort` | ex: termas_park_hotel | Identificador do hotel/central |
| `first_contact` | true | n8n só registra contexto, não chama IA |
| `follow_up` | false | Reservado para uso futuro |
