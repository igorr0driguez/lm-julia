# n8n — Contexto específico

## Infra
- VPS Hostinger KVM2 (2 vCPUs, 8GB RAM)
- n8n em Docker
- N8N_CONCURRENCY_PRODUCTION_LIMIT=15
- Redis: credencial "Redis Account", container Docker na VPS
- Usar nodes nativos do n8n para Redis — evitar customCommand

## Regra crítica
- Todo webhook DEVE ter Respond Immediately ativado
- Sem isso: Kommo exibe erro 404 no chat do lead

## Redis — chaves e TTL
- lead_{lead_id} → dados do lead (TTL 36h)
- pipelines_cache → mapeamento pipelines (atualizado 1x/dia, madrugada)
- custom_fields → todos os custom fields indexados (atualizado a cada 3 dias)

## Buffer/Debounce
- Separador: §|§
- buffer=true: n8n busca buffer via API do Kommo
- buffer=false: n8n usa dados do Redis (sem chamada API extra)
- Debounce via Redis não funciona — Kommo não dispara webhooks em sequência rápida
- Buffer de 60s fica inteiramente no Kommo

## Timer humanizado
- Custo fixo do fluxo: ~55s (30s salesbot + 25s n8n)
- Wait entre 65s e 95s → tempo total percebido: 2min a 2min30s
- Math.floor(Math.random() * (max - min + 1)) + min

## Workflows
- handler_jul.ia.json → entrada, payload, cache, buffer, first_contact
- backend_jul.ia.json → chamada IA, banco, resposta ao lead
- agente_jul.ia.json → geração de resposta pela IA
- criamemoria.json → gestão de contexto por pipeline via Redis
- handoff_jul.ia.json → desativa IA, cria tarefa, move etapa
- cache_custom_fields.json → atualiza cache a cada 3 dias
- cache_pipelines.json → atualiza cache diário, madrugada

## Handoff
Recebe lead_id e lead_name → busca JUL.IA DESATIVADA no pipeline via Redis
→ PATCH jul.ia_ativa=false → cria tarefa para responsável do plantão
→ move lead para etapa JUL.IA DESATIVADA
