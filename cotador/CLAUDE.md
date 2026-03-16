# Cotador — Price Engine HAI+

## O que é
API REST que busca e compara preços dos hotéis diretamente nos sistemas de reserva.
Integra com a Jul.IA para fornecer cotações em tempo real durante o atendimento.

## Base URL (produção)
http://jeab-chat.theworkpc.com:8000

## Documentação completa
Ver api_docs.md para endpoints, exemplos e troubleshooting.

## Hotéis suportados e scrapers
- Silbeck: hotel_internacional, cabanas, park_hotel, termas_gravatal, termas_do_lago
- Desbravador: ita_thermas, tirolesa (DESATIVADO temporariamente)
- Omnibees: lagos_de_jurema, jardins_de_jurema, machadinho_thermas, aguas_de_palmas
- Fazzenda: fazzenda
- Recanto: recanto_cataratas_resort

## Hotéis do projeto SEM cobertura no Cotador
(não têm scraper implementado — cotação manual ou indisponível)
- dona_francisca
- vivaz_cataratas
- mabu_thermas
- central_gravatal, central_jurema, central_piratuba, central_resorts, central_gramado

## Regras críticas
- Apenas hotéis Silbeck precisam de proxy (bloqueiam IPs de datacenter)
- Os demais 8 hotéis funcionam sem proxy
- Crianças com idade >= 18 são convertidas automaticamente para adultos
- Cada hotel Silbeck tem faixas etárias próprias em config/hotels.json

## Ambientes
- .env.local → desenvolvimento local (sem proxy, gratuito)
- .env.vps → VPS + ProxyCaseiro (requer PC ligado)
- .env.brightdata → produção recomendada (500MB grátis, depois pago por GB)

## Endpoint principal para a Julia usar
GET /api/v1/precos?hotel={hotel_resort}&checkin=YYYY-MM-DD&checkout=YYYY-MM-DD&adultos=2&criancas_idades=3,11
