# 001 — Hotel inicia conversa via WABA e Jul.IA é ativada indevidamente

## Tipo
Limitação conhecida

## Status
Fechado — solução via processo operacional

## Escopo
Termas Park Hotel (e qualquer hotel/central cujo número seja acessado por WhatsApp fora do Kommo)

---

## Descrição

O Kommo permite uso do WhatsApp via app/web conectado à conta WABA (funcionalidade beta). Se um atendente envia a primeira mensagem para um lead fora do Kommo, o lead entra no pipeline e o Robô de Entrada dispara normalmente, ativando a Jul.IA. Resultado: IA começa a responder numa conversa que já estava sendo conduzida manualmente.

## Por que não há solução técnica viável

O Robô de Entrada não tem como distinguir de forma confiável se a conversa foi iniciada inbound (cliente) ou outbound (hotel). Quando o hotel envia a primeira mensagem e o cliente responde, o lead entra no Kommo já com a mensagem do cliente — e o buffer estará preenchido de qualquer forma. Alternativas via API do Kommo (checagem de notas/mensagens no n8n) criariam complexidade e fragilidade desproporcionais para um caso edge que depende de comportamento fora do controle do sistema.

## Solução: processo operacional

Equipes que acessam o WhatsApp fora do Kommo devem:

**Ao iniciar um contato proativo com um lead:**
1. Abrir o lead no Kommo logo que ele aparecer no pipeline
2. Acionar o robô **[MANUAL] Desativar Jul.IA** imediatamente
3. Conduzir o atendimento manualmente a partir daí

O robô de desativação manual já existe exatamente para isso.

## Notas

- Fora do Kommo = fora do escopo técnico do sistema
- Hotéis que operam inteiramente pelo Kommo não têm esse problema
