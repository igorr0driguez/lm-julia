
# Context — Estado atual do projeto

Atualizado em: 26/03/2026

## Agentes
- Jul.IA → atende hotéis/resorts individuais
- Gust.IA → triagem nas centrais (substitui Flav.IA — nome antigo desatualizado)

## Em produção
- **Termas Park Hotel**: pipeline, robôs, webhook, prompt — funcionando

## Prompts criados (aguardando deploy/testes)
- Hotel Internacional Gravatal (gold standard — referência de qualidade)
- Hotel Termas
- Termas do Lago
- Fazzenda Park Resort
- Machadinho Thermas Resort SPA
- Águas de Palmas Resort
- Recanto Cataratas Resort
- Cabanas Termas Hotel
- Costão do Santinho Resort

## Hotéis com ficha preenchida (sem prompt ainda)
- Hotel Tirolesa
- Jardins de Jurema
- Lagos de Jurema
- Mabu Thermas
- Vivaz Cataratas

## Hotéis sem ficha nem prompt
- Dona Francisca (pipeline existe no Kommo)
- Itá Thermas (pipeline existe no Kommo)
- Grand Suites Family Resort (pipeline existe no Kommo)
- Laghetto Resort Golden (pipeline existe no Kommo)
- Laghetto Gramado (pipeline existe no Kommo)
- Laghetto Stilo Borges (pipeline existe no Kommo)

## Centrais
- Central Gravatal (pipeline no Kommo)
- Central Jurema Águas Quentes (pipeline no Kommo)
- Central Piratuba (pipeline no Kommo)
- Central Foz do Iguaçu (pipeline no Kommo)
- Central Resorts.com.br (pipeline no Kommo)
- Central Gramado (pipeline no Kommo)

Nenhuma central tem documentação .md ainda — apenas o template existe.

## Decisões vigentes
- Timer humanizado: 65-95s de wait (custo fixo: ~55s, total percebido: 2min-2min30s)
- Possessivos do hotel permitidos SOMENTE no Termas Park Hotel (propriedade da família do cliente)
- Crianças com tarifa adulto → campo `idades_criancas`, tabela usa "Tarifa adulto" (nunca "Adulto")
- Day use → handoff imediato (sem cotação pela IA) — exceto Águas de Palmas e Hotel Internacional (day_use_mode = "cotar")
- **Otimização físico=4 é EXCLUSIVA do Hotel Internacional Gravatal** — não copiar para outros prompts
- **Omissão de cortesia na cotação é EXCLUSIVA do Cabanas Termas Hotel** — cotador do hotel cobra indevidamente pela cortesia, Julia omite 1 criança 3-10 do JSON
- Gold standard (Internacional) é referência de **estrutura e estilo**, não de regras de negócio — sempre confirmar antes de copiar regras comerciais

## Problemas conhecidos
- **Hotel inicia conversa via WABA → Jul.IA ativa indevidamente**: equipe usa WhatsApp fora do Kommo (WABA beta). Sem solução técnica — equipe deve acionar [MANUAL] Desativar Jul.IA. Ver `bugs_e_melhorias/001-hotel-iniciou-conversa.md`.

## Últimas alterações
- 2026-03-26 | prompts/julia/costao_do_santinho.js | Prompt criado (all inclusive, sem otimização físico=4, day use handoff_only, faixas 0-2/3/4-11/12+)
- 2026-03-26 | hoteis/costao_do_santinho.md | Ficha preenchida + material coletado
- 2026-03-26 | kommo/codigo_hoteis.md | Costão adicionado (costao, ocu_max 6)
- 2026-03-25 | prompts/julia/cabanas_termas_hotel.js | Prompt criado + regra exclusiva de omissão de cortesia no JSON
- 2026-03-25 | prompts/julia/cabanas_termas_hotel.js | Removida otimização físico=4 (exclusiva do Internacional, estava indevida)
- 2026-03-25 | prompts/julia/diretrizes_gerais_julia.md | Regra 4.2.8: regras exclusivas não propagam entre hotéis
- 2026-03-25 | .claude/skills/prompt-julia/ | Critical Pattern #8: hotel-specific rules, aviso no gold standard
- 2026-03-22 | n8n/codes_cotacao/ | Bug fix: cotação nem sempre retornava a mais barata (multipla e orcamento1)
- 2026-03-22 | n8n/ | Workflows atualizados (backend_jul.ia, enviar_fotos, pos_venda, legacy_fluxo_zap)
- 2026-03-20 | prompts/julia/ | 5 prompts revisados e padronizados no gold standard (aguas_de_palmas, hotel_termas, machadinho, recanto_cataratas, termas_do_lago)
- 2026-03-20 | .claude/skills/prompt-julia/ | Skill upgrade com base nos prompts canônicos gold standard
- 2026-03-19 | n8n/codes_cotacao/ | trata_dados1.js e trata_multiplos_dados.js criados (tratamento de dados pré-cotação)
- 2026-03-19 | prompts/julia/ | diretrizes v8 e prompts atualizados
- 2026-03-19 | hoteis/recanto_cataratas.md | ficha atualizada
- 2026-03-18 | hoteis/aguas_de_palmas.md | ficha preenchida (5 faixas etárias hospedagem, day_use_mode=cotar)
- 2026-03-18 | prompts/julia/aguas_de_palmas.js | prompt criado
- 2026-03-18 | n8n/codes_cotacao/ | config, orcamento1 e multipla do Águas de Palmas adicionados
- 2026-03-18 | prompts/julia/hotel_internacional_gravatal.js | adicionada proibição "dividir APs sem confirmar"
- 2026-03-17 | hoteis/machadinho_thermas_resort.md | ficha preenchida
- 2026-03-17 | prompts/julia/machadinho_thermas_resort.js | prompt criado e validado
- 2026-03-17 | prompts/julia/modelo_prompt_hotel.md | criado e depois removido — funcionalidade absorvida pela skill prompt-julia
- 2026-03-16 | prompts/julia/fazzenda_park_resort.js | prompt criado e validado
- 2026-03-16 | n8n/codes_cotacao/ | config e mensagens do Fazzenda adicionadas
- 2026-03-16 | Correção geral: "Tarifa adulto" nos prompts (3 hotéis + diretrizes v8)
- 2026-03-14 | prompts/julia/termas_park_hotel.js | atualização ampla (idades, agência, transfer, respostas curtas, etc.)
- 2026-03-14 | ARQUITETURA.md, kommo/robos.md | criados — documentação do fluxo e robôs
- 2026-03-14 | bugs_e_melhorias/001-hotel-iniciou-conversa.md | limitação documentada
