# Kommo — Contexto específico

## Robôs — tipos existentes

| Robô | Tipo | Escopo |
|---|---|---|
| Robô de Entrada | Por pipeline | Hotel individual |
| Robô de Entrada (Central) | Por pipeline | Central |
| Chamar Jul.IA | Global (loop principal) | Todos os pipelines |
| Falar com Jul.IA | Global (nested) | Chamado pelo Chamar Jul.IA |
| Falar com Jul.IA com Buffer | Global (nested) | Chamado pelo Chamar Jul.IA |
| Chamar Gust.IA | Global (loop principal) | Pipelines de central |
| Falar com Gust.IA | Global (nested) | Chamado pelo Chamar Gust.IA |
| Falar com Gust.IA com Buffer | Global (nested) | Chamado pelo Chamar Gust.IA |
| Desativar Jul.IA manualmente | Global | Todos os pipelines |
| Preparando Orçamento | Por pipeline | Disparado antes do orçamento |
| Enviar Fotos | Por pipeline (por hotel) | Disparado após orçamento |
| Salesbot de Recepção | Por pipeline | Mensagem de boas-vindas |

Ver `robos.md` para documentação completa de cada robô.

## Etapas (nomenclatura exata, maiúsculo, case sensitive)
- JUL.IA ATIVADA
- JUL.IA DESATIVADA

## Custom fields relevantes

| Campo | ID | Tipo | Editável manualmente | Uso |
|---|---|---|---|---|
| `jul.ia_ativa` | 1055196 | checkbox | Não (is_api_only) | Liga/desliga IA |
| `mensagem_buffer` | — | texto | Não (is_api_only) | Acumula mensagens para buffer |
| `hotel_resort` | — | texto | Não (is_api_only) | Identificador técnico (snake_case) |
| `hotel ou resort` | — | texto | Sim | Nome legível para vendedores |

### jul.ia_ativa
- PATCH /api/v4/leads/{lead_id}
- Valor: `{ "value": true }` ou `{ "value": false }` — **NUNCA 1 ou 0**
- Usado tanto para Jul.IA quanto para Gust.IA (campo compartilhado)

## Detecção de formulário
- Mensagem contém "cotação" → lead veio de landing page com formulário preenchido → vai direto à IA sem mensagem de recepção
- Mensagem livre → envia Salesbot de Recepção + webhook first_contact ao n8n
- Detecção via condição "contém" no Kommo (não existe operador "não contém")

## Detecção de conversa iniciada pelo hotel (WABA)
- O Kommo permite uso do WhatsApp via app/web conectado à conta WABA (funcionalidade beta)
- Se o hotel envia a primeira mensagem (outbound), o lead é criado e o Robô de Entrada dispara — mas não há mensagem incoming do cliente, então `mensagem_buffer` fica vazio
- **Padrão obrigatório em todos os Robôs de Entrada**: verificar `mensagem_buffer` logo após a ação 1 (salvar buffer)
  - `mensagem_buffer` **está preenchido** → cliente iniciou → fluxo normal
  - `mensagem_buffer` **está vazio** → hotel iniciou → nota + encerrar sem ativar IA
- Operadores disponíveis no Kommo: "está preenchido" / "está vazio" (campo texto)

## Query params dos webhooks

| Param | Valores | Descrição |
|---|---|---|
| `assistant` | julia \| gustavo | Agente a ser chamado no n8n |
| `buffer` | true \| false | Se n8n lê o mensagem_buffer via API |
| `hotel_resort` | ex: termas_park_hotel | Identificador do hotel/central |
| `first_contact` | true | n8n registra contexto, não chama IA |
| `follow_up` | false | Reservado |

## Limitações técnicas importantes

- **1 resposta por webhook**: o handler_julia da integração privada só retorna uma mensagem por requisição. Solução: Salesbot Preparando Orçamento + Salesbot Enviar Fotos como etapas separadas.
- **Nested obrigatório**: os robôs "Falar com Jul.IA" devem ser chamados como sub-robôs (nested). Fluxo contínuo causa loop infinito e o Kommo mata a instância.
- **bind_actions com salesbot:callback não funciona** em integrações privadas (limitação do Kommo). Código mantido no widget por referência.
- **Respond Immediately obrigatório no n8n**: sem isso o Kommo retorna 404 no webhook.

## Separador de buffer
`§|§` — concatena mensagens múltiplas no campo `mensagem_buffer`. Escolhido por ser improvável de ser enviado manualmente.
