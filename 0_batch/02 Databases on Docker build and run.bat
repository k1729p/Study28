@echo off
set PROJECT_DATABASES=databases
set COMPOSE_DATABASES_FILE=docker-config\docker-compose-databases.yaml
cd ..

set KEY=N
set /P KEY="Recreate network? Y [N]"
if /i "%KEY:~0,1%"=="Y" (
   docker network rm --force app-net
   docker network create app-net
)
echo ---------------------------------------------------------------------------------- compose down
docker compose -f %COMPOSE_DATABASES_FILE% -p %PROJECT_DATABASES% down -v
echo ---------------------------------------------------------------------------------- compose up
docker compose -f %COMPOSE_DATABASES_FILE% -p %PROJECT_DATABASES% up --detach --wait --wait-timeout 600
@powershell -Command Write-Host "----------------------------------------------------------------------" -foreground "Yellow"
@powershell -Command Write-Host "HEALTHY DATABASES STATUS" -foreground "Green"
@powershell -Command Write-Host "----------------------------------------------------------------------" -foreground "Red"
pause
