# Central de Reservas L&M — Projeto Jul.IA / Gust.IA

## O que é esse projeto
Sistema de atendimento via IA no WhatsApp integrado ao Kommo CRM via n8n.
Dois agentes:
- Jul.IA: atende leads de hotéis/resorts individuais
- Gust.IA: triagem nas centrais (Gravatal, Jurema, Piratuba, Foz do Iguaçu, Resorts, Gramado)

Status: 1 hotel em produção (Termas Park Hotel), 7 prompts adicionais criados, expansão em andamento.

## Stack
- Kommo CRM (salesbots, pipelines, custom fields, widget privado)
- n8n (Docker, VPS Hostinger KVM2, concurrency limit 15)
- Redis (cache de leads, pipelines, custom fields)
- Postgres (crm.leads, crm.interacoes)
- WhatsApp WABA via integração oficial Kommo
- Cotador HAI+ (API REST de cotação — scraping de sistemas de reserva)

## Arquivos do projeto
- CONTEXT.md → estado atual, em andamento, decisões recentes — LER SEMPRE PRIMEIRO
- ARQUITETURA.md → fluxo técnico completo do sistema
- kommo/ → salesbots, widget, campos, pipelines e usuários
- n8n/ → workflows em JSON + scripts de cotação (codes_cotacao/)
- prompts/ → prompts por agente (julia/ e gustavo/)
- hoteis/ → contexto e configurações por hotel (15 fichas + template)
- centrais/ → contexto e configurações por central (template apenas)
- cotador/ → documentação da API de cotação HAI+
- bugs_e_melhorias/ → backlog ativo e changelog
- .claude/skills/prompt-julia/ → skill de criação e revisão de prompts (gold standard)

## Regras críticas
- Webhook n8n SEMPRE com Respond Immediately (sem isso Kommo retorna 404)
- Campo jul.ia_ativa (ID: 1055196): SOMENTE booleano true/false, nunca 1/0
- Separador de buffer: §|§
- Emojis: apenas Unicode básico — testar antes de usar na API Kommo
- Widget: incrementar version no manifest.json a cada update; desinstalar e reinstalar após deploy
- bind_actions com salesbot:callback não funciona em integrações privadas
- Prompts: campo `adultos` no JSON = só quem o cliente chamou de adulto. Crianças com tarifa adulto vão em `idades_criancas`, NUNCA em `adultos`. Tabela de categorização deve usar "Tarifa adulto" (nunca só "Adulto") para evitar confusão do modelo

## Atenção ao escopo
- Mudanças nos robôs globais afetam TODOS os pipelines — sempre sinalizar
- Sempre confirmar qual hotel/central está em escopo antes de alterar pipelines
- Ao expandir para novo hotel: usar hoteis/_template.md
- Ao expandir para nova central: usar centrais/_template.md
- Ao criar prompt de novo hotel: usar skill prompt-julia (`/prompt-julia create`)
