.PHONY: up down logs build scan

up:
\tdocker-compose up -d

down:
\tdocker-compose down -v

logs:
\tdocker-compose logs -f --tail=200

build:
\tdocker-compose build

scan:
\ttrivy image $(DOCKER_USER)/ecomm-server:latest || true
