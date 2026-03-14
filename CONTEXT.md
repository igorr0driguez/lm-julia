
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

- **Hotel inicia conversa via WABA → Jul.IA ativa indevidamente**: equipe do Termas Park usa WhatsApp fora do Kommo (WABA beta). Não há solução técnica viável — o sistema não consegue distinguir quem iniciou a conversa de forma confiável. **Solução: processo operacional** — equipe deve acionar o robô [MANUAL] Desativar Jul.IA assim que o lead aparecer. Ver `bugs-e-melhorias/001-hotel-iniciou-conversa.md`.

## Últimas alterações
- 2026-03-14 | bugs-e-melhorias/001-hotel-iniciou-conversa.md | criado — limitação conhecida documentada com decisão de processo
- 2026-03-14 | ARQUITETURA.md | criado — fluxo completo do sistema documentado
- 2026-03-14 | kommo/robos.md | criado — todos os robôs documentados com fluxos
- 2026-03-14 | kommo/CLAUDE.md | atualizado — campos, robôs, limitações técnicas
- 2026-03-14 | prompts/julia/diretrizes_gerais_julia_v8.md | day_use_mode adicionado à FICHA; opção econômica removida; schema alinhado ao gold standard
- 2026-03-14 | prompts/julia/hotel_internacional_gravatal.js | opção econômica removida; "aceitou colchão" removido dos gatilhos
- 2026-03-14 | hoteis/termas_park_hotel.md | "águas termais" → "águas térmicas/aquecidas" em todas as ocorrências
