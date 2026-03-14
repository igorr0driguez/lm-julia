# Central de Reservas L&M — Projeto Jul.IA / Gust.IA

## O que é esse projeto
Sistema de atendimento via IA no WhatsApp integrado ao Kommo CRM via n8n.
Dois agentes:
- Jul.IA: atende leads de hotéis/resorts específicos (19 no total)
- Gust.IA: triagem nas centrais (Gravatal, Piratuba, Foz do Iguaçu, Resorts)

Status: 1 hotel implementado (Termas Park Hotel). Expansão em andamento.

## Stack
- Kommo CRM (salesbots, pipelines, custom fields, widget privado)
- n8n (Docker, VPS Hostinger KVM2, concurrency limit 15)
- Redis (cache de leads, pipelines, custom fields)
- Postgres (crm.leads, crm.interacoes)
- WhatsApp WABA via integração oficial Kommo

## Arquivos do projeto
- CONTEXT.md → estado atual, em andamento, decisões recentes — LER SEMPRE PRIMEIRO
- kommo/ → salesbots, widget, campos e pipelines
- n8n/ → todos os workflows em JSON
- prompts/ → prompts por agente (julia/ e gustavo/)
- hoteis/ → contexto e configurações por hotel
- centrais/ → contexto e configurações por central
- bugs-e-melhorias/ → backlog ativo e changelog

## Regras críticas
- Webhook n8n SEMPRE com Respond Immediately (sem isso Kommo retorna 404)
- Campo jul.ia_ativa (ID: 1055196): SOMENTE booleano true/false, nunca 1/0
- Separador de buffer: §|§
- Emojis: apenas Unicode básico — testar antes de usar na API Kommo
- Widget: incrementar version no manifest.json a cada update; desinstalar e reinstalar após deploy
- bind_actions com salesbot:callback não funciona em integrações privadas

## Atenção ao escopo
- Mudanças nos robôs globais afetam TODOS os pipelines — sempre sinalizar
- Sempre confirmar qual hotel/central está em escopo antes de alterar pipelines
- Ao expandir para novo hotel: usar hoteis/_template.md
- Ao expandir para nova central: usar centrais/_template.md
