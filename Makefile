.PHONY: setup install dev build test test-ui docker-build docker-up stop clean start

# ==========================================
# 🚀 O COMANDO MÁGICO (One-Click Setup)
# ==========================================
# Rode 'make start' recém-clonado do Git e ele faz tudo.
start: setup docker-build docker-up

# ==========================================
# GESTÃO DE AMBIENTE
# ==========================================
setup:
	@if [ ! -f .env ]; then cp .env.example .env; echo "✅ Arquivo .env criado automaticamente."; fi

install:
	npm ci

dev:
	npm run dev

build: setup
	npm run build

# ==========================================
# TESTES E2E (CYPRESS)
# ==========================================
test:
	npx cypress run

test-ui:
	npx cypress open

# ==========================================
# INFRAESTRUTURA (DOCKER)
# ==========================================
docker-build: setup
	docker build -t travel-front .

docker-up: stop
	docker run -d -p 3000:80 --name travel-front travel-front
	@echo "🚀 Front-end rodando liso em: http://localhost:3000"

stop:
	@docker rm -f travel-front 2>/dev/null || true

clean: stop
	rm -rf dist node_modules
	@docker rmi travel-front 2>/dev/null || true
	@echo "🧹 Ambiente totalmente limpo."