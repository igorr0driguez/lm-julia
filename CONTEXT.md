
# Context — Estado atual do projeto

Atualizado em: março/2026

## Agentes
- Jul.IA → atende hotéis/resorts individuais
- Gust.IA → triagem nas centrais (substitui Flav.IA — nome antigo desatualizado)

## Implementado
- Termas Park Hotel: pipeline, robôs, webhook, prompt — em produção

## Em andamento
- Expansão para os próximos hotéis (10+ na fila)
- Centrais: Central Gravatal, Central Piratuba, Central Foz do Iguaçu, Central Resorts

## Próximos na fila
- Hotel Internacional Gravatal
- Hotel Termas
- Hotel Termas do Lago
- Fazzenda Park Resort
- Machadinho Thermas Resort SPA
- Águas de Palmas Resort
(ordenar conforme prioridade do cliente)

## Decisões recentes
- Flav.IA renomeada para Gust.IA
- Timer humanizado: 65-95s de wait (custo fixo medido: ~55s, total percebido: 2min-2min30s)

## Problemas conhecidos

- **Hotel inicia conversa via WABA → Jul.IA ativa indevidamente** (Termas Park Hotel): equipe do balcão usa WhatsApp Web via WABA beta para iniciar atendimentos. Quando enviavam a primeira mensagem (outbound), o Robô de Entrada ativava a Jul.IA sem precisar. Solução: verificar se `mensagem_buffer` está vazio após ação 1 — se vazio, hotel iniciou, não ativar IA. Ver `bugs-e-melhorias/001-hotel-iniciou-conversa.md`. **Pendente aplicar no Kommo.**

## Últimas alterações
- 2026-03-14 | kommo/robos.md | Robô de Entrada: novo branch para detectar conversa iniciada pelo hotel (mensagem_buffer vazio)
- 2026-03-14 | bugs-e-melhorias/001-hotel-iniciou-conversa.md | criado — bug documentado com causa raiz e solução
- 2026-03-14 | ARQUITETURA.md | criado — fluxo completo do sistema documentado
- 2026-03-14 | kommo/robos.md | criado — todos os robôs documentados com fluxos
- 2026-03-14 | kommo/CLAUDE.md | atualizado — campos, robôs, limitações técnicas
- 2026-03-14 | prompts/julia/diretrizes_gerais_julia_v8.md | day_use_mode adicionado à FICHA; opção econômica removida; schema alinhado ao gold standard
- 2026-03-14 | prompts/julia/hotel_internacional_gravatal.js | opção econômica removida; "aceitou colchão" removido dos gatilhos
- 2026-03-14 | hoteis/termas_park_hotel.md | "águas termais" → "águas térmicas/aquecidas" em todas as ocorrências
