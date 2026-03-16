# Price Engine HAI+

API REST para buscar e comparar preços de hotéis em múltiplas plataformas de reserva.

##########################
####### Tecnologias ######
##########################

- **FastAPI** + **Uvicorn** — framework e servidor web
- **BeautifulSoup4** + **Requests** — scraping e HTTP
- **Pydantic** — validação de dados

## Estrutura do Projeto

```
├── app/
│   ├── main.py          # Aplicação principal
│   ├── routes.py        # Rotas e endpoints
│   ├── models.py        # Modelos Pydantic
│   └── utils.py         # Funções auxiliares
├── scrapers/
│   ├── base_scraper.py
│   ├── silbeck_scraper.py
│   ├── desbravador_scraper.py
│   ├── omnibees_scraper.py
│   ├── fazzenda_scraper.py
│   └── recanto_scraper.py
├── config/
│   ├── hotels.json      # Config de hotéis (faixas etárias, campos, etc.)
│   └── settings.py
└── storage/
    └── data/            # Histórico de buscas (JSON local)
```

---

## Hotéis Suportados

### Silbeck

| Hotel | Código |
| --- | --- |
| Hotel Internacional Gravatal | `internacionalgravatal` |
| Cabanas Termas Hotel | `cabanashotel` |
| Termas Park Hotel | `termaspark` |
| Hotel Termas | `hoteltermas` |
| Hotel Termas do Lago | `hoteltermasdolago` |

### Desbravador

| Hotel | Código |
| --- | --- |
| Itá Thermas Resort e Spa | `ita-thermas-resort-e-spa` |
| Hotel Tirolesa | `hotel-tirolesa` |

### Omnibees

| Hotel | Código |
| --- | --- |
| Lagos de Jurema | `5586` |
| Jardins de Jurema | `8595` |
| Machadinho Thermas Resort SPA | `7583` |
| Águas de Palmas Resort e Hotel | `7824` |

### Fazzenda

| Hotel | Código |
| --- | --- |
| Fazzenda Park Resort | `HOTEL_OMNI_3532` |

### Recanto

| Hotel | Código |
| --- | --- |
| Recanto Cataratas | `HOTEL_OMNI_1118` |

---

## Endpoints

### Health Check

```http
GET /api/v1/health
```

### Listar Hotéis

```http
GET /api/v1/hoteis
```

### Buscar Preços

```http
GET /api/v1/precos?hotel=hotel_internacional&checkin=2026-05-07&checkout=2026-05-14&adultos=2&criancas_idades=3,11
```

**Parâmetros:**

- `hotel` (obrigatório): Código do hotel
- `checkin` / `checkout` (obrigatório): Formato `YYYY-MM-DD`
- `adultos` (opcional): Padrão `2`
- `criancas_idades` (opcional): Idades separadas por vírgula, ex: `3,11,8`

> Crianças com idade ≥ 18 são convertidas automaticamente para adultos.
> Cada hotel Silbeck tem suas próprias faixas etárias configuradas em `config/hotels.json`.

### Buscar Comparativo

```http
POST /api/v1/precos/comparar
Content-Type: application/json

{
  "hoteis": ["hotel_internacional", "cabanas", "park_hotel"],
  "checkin": "2026-05-07",
  "checkout": "2026-05-14",
  "hospedes": {
    "adultos": 2,
    "criancas_idades": "3,11"
  }
}
```

### Histórico

```http
GET /api/v1/historico?hotel=hotel_internacional&limit=10
GET /api/v1/historico/estatisticas
```

### Endpoints dedicados por hotel

Cada hotel tem seu próprio endpoint:

```http
GET /api/v1/precos/hotel_internacional
GET /api/v1/precos/cabanas
GET /api/v1/precos/park_hotel
GET /api/v1/precos/termas_gravatal
GET /api/v1/precos/termas_do_lago
GET /api/v1/precos/ita_thermas
GET /api/v1/precos/tirolesa
GET /api/v1/precos/lagos_de_jurema
GET /api/v1/precos/jardins_de_jurema
GET /api/v1/precos/machadinho_thermas
GET /api/v1/precos/aguas_de_palmas
GET /api/v1/precos/fazzenda
GET /api/v1/precos/recanto_cataratas_resort
```

Documentação interativa: `http://localhost:8000/docs`

---

## Instalação e Execução

### Local (desenvolvimento)

```bash
pip install -r requirements.txt
cp .env.local .env
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Docker (produção)

```bash
# Subir pela primeira vez
docker-compose up -d

# Atualizar código e rebuildar
git pull
docker-compose up -d --build

# Ver logs em tempo real
docker-compose logs -f api

# Parar
docker-compose down
```

> Sempre use `--build` após `git pull` para aplicar as mudanças na imagem.

### Comandos Docker úteis

```bash
# Ver status dos containers
docker-compose ps

# Entrar no container (debug)
docker exec -it priceenginehai_api_1 bash

# Reconstruir forçando (se der problema)
docker-compose build --no-cache && docker-compose up -d
```

---

## Configurações

### Ambientes (.env)

Existem 3 arquivos `.env` pré-configurados para diferentes cenários:

| Arquivo | Proxy | Custo | Quando usar |
| --- | --- | --- | --- |
| `.env.local` | Não | Grátis | Desenvolvimento no PC |
| `.env.vps` | ProxyCaseiro | Grátis | VPS + PC ligado como proxy |
| `.env.brightdata` | Bright Data | Pago (500MB free) | VPS em produção |

Para trocar de ambiente:

```bash
cp .env.local .env          # desenvolvimento
cp .env.vps .env            # VPS com ProxyCaseiro
cp .env.brightdata .env     # VPS com Bright Data
sudo systemctl restart priceengine  # se em produção
```

### Por que proxy?

Apenas os **5 hotéis Silbeck** precisam de proxy (bloqueiam IPs de datacenter). Os outros 8 hotéis funcionam direto.

### Bright Data (recomendado para produção)

```bash
cp .env.brightdata .env
sudo systemctl restart priceengine
```

- Sempre disponível (24/7)
- 500MB grátis, depois pago por GB

### ProxyCaseiro (grátis, requer PC ligado)

```bash
# No PC local (Windows):
cd C:\dev\JeabAI\ProxyCaseiro
python proxy.py --port 8888 --auth admin:hikari2108

# Na VPS:
cp .env.vps .env
sudo systemctl restart priceengine
```

### Verificações úteis

```bash
# Ver qual ambiente está ativo
grep PROXY_ENABLED .env
grep PROXY_TYPE .env

# Logs de proxy
tail -f logs/app.log | grep "Bright Data"
tail -f logs/app.log | grep "ProxyCaseiro"
```

---

## Exemplos de Endpoints

> Substitua as datas conforme necessário. Parâmetro `criancas_idades` é opcional.

---

### Silbeck

**Hotel Internacional Gravatal**
Site: https://sbreserva.silbeck.com.br/internacionalgravatal/pt-br/

```
http://jeab-chat.theworkpc.com:8000/api/v1/precos/hotel_internacional?checkin=2026-05-15&checkout=2026-05-17&adultos=2&criancas_idades=3,11
```

**Cabanas Termas Hotel**
Site: https://sbreserva.silbeck.com.br/cabanashotel/pt-br/

```
http://jeab-chat.theworkpc.com:8000/api/v1/precos/cabanas?checkin=2026-05-15&checkout=2026-05-17&adultos=2&criancas_idades=3,11
```

**Termas Park Hotel**
Site: https://sbreserva.silbeck.com.br/termaspark/pt-br/

```
http://jeab-chat.theworkpc.com:8000/api/v1/precos/park_hotel?checkin=2026-05-15&checkout=2026-05-17&adultos=2&criancas_idades=3,11
```

**Hotel Termas**
Site: https://sbreserva.silbeck.com.br/hoteltermas/pt-br/

```
http://jeab-chat.theworkpc.com:8000/api/v1/precos/termas_gravatal?checkin=2026-05-15&checkout=2026-05-17&adultos=2&criancas_idades=3,11
```

**Hotel Termas do Lago**
Site: https://sbreserva.silbeck.com.br/hoteltermasdolago/pt-br/

```
http://jeab-chat.theworkpc.com:8000/api/v1/precos/termas_do_lago?checkin=2026-05-15&checkout=2026-05-17&adultos=2&criancas_idades=3,11
```

---

### Omnibees

**Lagos de Jurema**
Site: https://book.omnibees.com/hotel/5586

```
http://jeab-chat.theworkpc.com:8000/api/v1/precos/lagos_de_jurema?checkin=2026-05-15&checkout=2026-05-17&adultos=2&criancas_idades=3,11
```

**Jardins de Jurema**
Site: https://book.omnibees.com/hotel/8595

```
http://jeab-chat.theworkpc.com:8000/api/v1/precos/jardins_de_jurema?checkin=2026-05-15&checkout=2026-05-17&adultos=2&criancas_idades=3,11
```

**Machadinho Thermas Resort SPA**
Site: https://book.omnibees.com/hotel/7583

```
http://jeab-chat.theworkpc.com:8000/api/v1/precos/machadinho_thermas?checkin=2026-05-15&checkout=2026-05-17&adultos=2&criancas_idades=3,11
```

**Águas de Palmas Resort e Hotel**
Site: https://book.omnibees.com/hotel/7824

```
http://jeab-chat.theworkpc.com:8000/api/v1/precos/aguas_de_palmas?checkin=2026-05-15&checkout=2026-05-17&adultos=2&criancas_idades=3,11
```

---

### Fazzenda

**Fazzenda Park Resort**
Site: https://reservar.fazzenda.com.br

```
http://jeab-chat.theworkpc.com:8000/api/v1/precos/fazzenda?checkin=2026-05-15&checkout=2026-05-17&adultos=2&criancas_idades=3,11
```

---

### Recanto

**Recanto Cataratas**
Site: https://reservas.recantocataratasresort.com.br

```
http://jeab-chat.theworkpc.com:8000/api/v1/precos/recanto_cataratas_resort?checkin=2026-05-15&checkout=2026-05-17&adultos=2&criancas_idades=3,11
```

---

### Desbravador ❌ Desativado temporariamente

**Itá Thermas Resort e Spa**
Site: https://reservas.desbravador.com.br

```
http://jeab-chat.theworkpc.com:8000/api/v1/precos/ita_thermas?checkin=2026-05-15&checkout=2026-05-17&adultos=2
```

**Hotel Tirolesa**
Site: https://reservas.desbravador.com.br

```
http://jeab-chat.theworkpc.com:8000/api/v1/precos/tirolesa?checkin=2026-05-15&checkout=2026-05-17&adultos=2
```

---

## Troubleshooting

**"Hotel não encontrado"** → Verifique o código em `config/hotels.json`

**Timeout nas requisições** → Aumente `SCRAPING_TIMEOUT` no `.env`

**Storage corrompido** → Delete `storage/data/precos_historico.json` (recriado automaticamente)
