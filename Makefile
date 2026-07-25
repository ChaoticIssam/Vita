.PHONY: help up up-api up-web down build restart status logs logs-api logs-web dev-api dev-web test-api clean

.DEFAULT_GOAL := help

## help: Display available commands
help:
	@echo "Vita Workspace Commands:"
	@echo ""
	@echo "  --- Docker Services ---"
	@echo "  make up          Start all Docker services (DB, API, Web)"
	@echo "  make up-api      Start API backend & DB containers separately"
	@echo "  make up-web      Start Web frontend container separately"
	@echo "  make down        Stop and remove all containers"
	@echo "  make build       Build or rebuild Docker images"
	@echo "  make restart     Restart all running containers"
	@echo "  make status      Display container status"
	@echo "  make logs        Stream logs from all services"
	@echo "  make logs-api    Stream logs from API backend container"
	@echo "  make logs-web    Stream logs from Web frontend container"
	@echo ""
	@echo "  --- Local Development ---"
	@echo "  make dev-api     Run API backend server locally (port 8000)"
	@echo "  make dev-web     Run Web frontend server locally (port 3000)"
	@echo "  make test-api    Run backend pytest unit test suite"
	@echo "  make clean       Remove temporary build caches and artifacts"
	@echo ""

## Docker Commands
up:
	docker compose up -d

up-api:
	docker compose up -d db api

up-web:
	docker compose up -d web

down:
	docker compose down

build:
	docker compose build

restart:
	docker compose restart

status:
	docker compose ps

logs:
	docker compose logs -f

logs-api:
	docker compose logs -f api

logs-web:
	docker compose logs -f web

## Local Dev Commands
dev-api:
	PYTHONPATH=api .venv/bin/uvicorn app.main:app --reload --port 8000

dev-web:
	npm run dev --prefix web

test-api:
	PYTHONPATH=api .venv/bin/pytest api/tests

clean:
	rm -rf web/.next api/.pytest_cache api/__pycache__ api/app/__pycache__ api/tests/__pycache__
