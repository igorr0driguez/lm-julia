# 001 — Hotel inicia conversa via WABA e Jul.IA é ativada indevidamente

## Tipo
Bug

## Status
Resolvido (aguardando aplicar no Kommo)

## Prioridade
Alta

## Escopo
Termas Park Hotel — Robô de Entrada (pipeline ID: 11631008)

---

## Descrição

O Termas Park Hotel possui uma equipe de balcão que usa o WhatsApp Web conectado via WABA (funcionalidade beta do Kommo) para iniciar atendimentos manualmente. Quando um agente do hotel envia a **primeira mensagem** para um lead novo (conversa outbound), o Kommo cria o lead no pipeline e dispara o Robô de Entrada automaticamente.

O Robô de Entrada não distinguia entre conversas iniciadas pelo cliente (inbound) e pelo hotel (outbound), ativando a Jul.IA em ambos os casos. Resultado: a IA respondia numa conversa que o hotel já estava conduzindo manualmente, gerando sobreposição de atendimento e confusão para o cliente.

## Causa raiz

O Robô de Entrada assumia que toda conversa nova tinha sido iniciada pelo cliente. O campo `mensagem_buffer` é populado pela última mensagem *incoming* do contato — se a conversa foi iniciada pelo hotel (outbound), não há mensagem incoming e o campo fica vazio. Essa diferença não era verificada.

## Solução implementada

Adicionada verificação no Robô de Entrada, logo após salvar o `mensagem_buffer`:

- **`mensagem_buffer` preenchido** → cliente iniciou → fluxo normal de ativação da Jul.IA
- **`mensagem_buffer` vazio** → hotel iniciou → adiciona nota "Conversa iniciada pelo hotel — IA não ativada" e encerra o robô sem ativar a IA nem mudar de etapa

Operador Kommo usado: `mensagem_buffer` → **está preenchido** (branch normal).

## Arquivos alterados

- `kommo/robos.md` — Robô de Entrada documentado com o novo branch
- `CONTEXT.md` — problema e solução registrados

## Aplicar no Kommo

Editar manualmente o Robô de Entrada do pipeline Termas Park Hotel (ID: 11631008) no designer de robôs do Kommo, inserindo a condição após a ação 1 (salvar buffer).

## Notas

- Afeta apenas o Termas Park Hotel atualmente (única equipe usando WABA fora do Kommo)
- Ao expandir para outros hotéis, o mesmo branch deve ser replicado no Robô de Entrada de cada pipeline
- "não contém" não existe no Kommo — usar "está preenchido" para detectar mensagem incoming
