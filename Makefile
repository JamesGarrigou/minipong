DOCKER_COMPOSE_FILE	= docker-compose.yml
ENV_FILE			= .env

all: up

up:
	@if [ -e $(ENV_FILE) ]; then \
		echo "docker compose up"; \
		docker compose -f $(DOCKER_COMPOSE_FILE) --env-file $(ENV_FILE) up --build; \
	else \
		echo "docker compose up"; \
		docker compose -f $(DOCKER_COMPOSE_FILE) up --build; \
	fi

down:
	docker-compose -f $(DOCKER_COMPOSE_FILE) down

clean: down

fclean: clean
	@ echo "Stoping all dockers"
	@ if [ -n "$$(docker ps -aq)" ]; then docker stop $$(docker ps -aq); fi
	@ echo "Removing all dockers"
	@ if [ -n "$$(docker ps -aq)" ]; then docker rm $$(docker ps -aq); fi
	@ echo "Removing all images"
	@ if [ -n "$$(docker images -aq)" ]; then docker rmi $$(docker images -aq); fi
	@ echo "Removing all volumes"
	@ if [ -n "$$(docker volume ls -q)" ]; then docker volume rm $$(docker volume ls -q); fi

re: fclean all

.PHONY: all up down clean fclean re
