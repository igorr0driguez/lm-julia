
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
- 2026-03-16 | n8n/codes_cotacao/monta_mensagem_orcamento1.js | removida linha obs_pix da mensagem do Fazzenda — valor exibido é de cartão, obs era enganosa; vendedor negocia PIX
- 2026-03-16 | prompts/julia/fazzenda_park_resort.js, hotel_internacional_gravatal.js, hotel_termas.js | fix: criança com tarifa adulto era contada como adulto no JSON (ex: "casal + criança de 14" → adultos:3 errado). Correção em 3 camadas: tabela "Adulto"→"Tarifa adulto", aviso ATENÇÃO após tabela, exemplo JSON completo para 13+
- 2026-03-16 | prompts/julia/diretrizes_gerais_julia_v8.md | regra de "Tarifa adulto" na tabela generalizada para qualquer faixa etária (não só 13+); Ex8 obrigatório nos exemplos de todo prompt novo
- 2026-03-16 | prompts/julia/fazzenda_park_resort.js | prompt criado e validado contra gold standard (hotel_internacional_gravatal.js) e diretrizes_gerais_julia_v8.md — pronto para testes
- 2026-03-16 | n8n/codes_cotacao/config_hoteis.js | config do Fazzenda adicionada (titulo, obs_pix, pagamento, checkin, checkout, atividades, servicos, allinclusive, bebidas, obs); MAP atualizado com código "fazzenda"
- 2026-03-16 | n8n/codes_cotacao/monta_mensagem_orcamento1.js | bloco Fazzenda adicionado — ordem: orçamento → atividades → all inclusive
- 2026-03-16 | n8n/codes_cotacao/monta_mensagem_multipla.js | bloco Fazzenda adicionado (cabeçalho + rodapé) — mesma ordem
- 2026-03-14 | prompts/julia/termas_park_hotel.js | prompt atualizado: bug de idades de crianças corrigido; agência/operadora; transfer; Regra #7 (respostas curtas); bebê universal (0–2); bebes no schema; notify_text no schema; tipo "combinado"; "tudo incluso" proibido; revelar categorias proibido; enquadramento positivo; exemplos atualizados
- 2026-03-14 | hoteis/termas_park_hotel.md | particularidades do prompt documentadas (possessivos permitidos, opção econômica, faixas etárias)
- 2026-03-14 | kommo/CLAUDE.md | exceção de possessivos do Termas Park documentada
- 2026-03-14 | bugs-e-melhorias/001-hotel-iniciou-conversa.md | criado — limitação conhecida documentada com decisão de processo
- 2026-03-14 | ARQUITETURA.md | criado — fluxo completo do sistema documentado
- 2026-03-14 | kommo/robos.md | criado — todos os robôs documentados com fluxos
- 2026-03-14 | kommo/CLAUDE.md | atualizado — campos, robôs, limitações técnicas
- 2026-03-14 | prompts/julia/diretrizes_gerais_julia_v8.md | day_use_mode adicionado à FICHA; opção econômica removida; schema alinhado ao gold standard
- 2026-03-14 | prompts/julia/hotel_internacional_gravatal.js | opção econômica removida; "aceitou colchão" removido dos gatilhos
- 2026-03-14 | hoteis/termas_park_hotel.md | "águas termais" → "águas térmicas/aquecidas" em todas as ocorrências
