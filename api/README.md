# api/

FastAPI backend for Vita.

## Run locally

```bash
cd api
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

## Endpoints

- `GET /` basic service check
- `GET /health` health check
- `POST /events` event ingestion contract

## Planned responsibilities
- Activity event ingestion
- Analytics computation
- Goals/focus APIs
- User data privacy operations
