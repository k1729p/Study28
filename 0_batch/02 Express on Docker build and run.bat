@echo off
set PROJECT=study28
set DOCKER_IMAGE=eeengcs/study28:1.0.0-SNAPSHOT
set DOCKER_FILE=docker-config\Dockerfile
set COMPOSE_FILE=docker-config\docker-compose.yaml

pushd %cd%
cd ..
docker compose -f %COMPOSE_FILE% -p %PROJECT% down
echo ------------------------------------------------------------------------------------------
docker build -f %DOCKER_FILE% --tag %DOCKER_IMAGE% --progress=plain .
echo ------------------------------------------------------------------------------------------
docker compose -f %COMPOSE_FILE% -p %PROJECT% up --detach --no-color
echo ------------------------------------------------------------------------------------------
docker compose -f %COMPOSE_FILE% -p %PROJECT% ps
echo ------------------------------------------------------------------------------------------
docker compose -f %COMPOSE_FILE% -p %PROJECT% images
popd
pause
