@echo off
set PROJECT=study28
set PROJECT_DATABASES=databases
set DOCKER_FILE=docker-config\Dockerfile
set COMPOSE_FILE=docker-config\docker-compose.yaml
set COMPOSE_DATABASES_FILE=docker-config\docker-compose-databases.yaml
cd ..
:menu
set KEY=
set LABEL=
echo --- Docker Reports ---
echo - - - - - - - - - - - - - - -
echo [A] Database Containers Health
echo [B] Statistics
echo [C] Containers
echo - - - - - - - - - - - - - - -
echo [D] Images and Volumes
echo [E] Network Inspect
echo [F] Express Server Logs
echo - - - - - - - - - - - - - - -
echo Press any other key to quit
set /P KEY="Select an option: "
if /i "%KEY:~0,1%"=="A" (
  set LABEL=[A] container health
  call :container_health
) else if /i "%KEY:~0,1%"=="B" (
  set LABEL=[B] statistics
  call :statistics
) else if /i "%KEY:~0,1%"=="C" (
  set LABEL=[C] containers
  call :containers
) else if /i "%KEY:~0,1%"=="D" (
  set LABEL=[D] images and volumes
  call :images_and_volumes
) else if /i "%KEY:~0,1%"=="E" (
  set LABEL=[E] network inspect
  call :network_inspect
) else if /i "%KEY:~0,1%"=="F" (
  set LABEL=[F] Express server logs
  call :express_logs
) else (
  goto :eof
)
goto menu
@REM #################################################################################################################################################
:container_health
start "Container Health" /MAX 0_batch\scripts\showContainerHealth.bat
cls
goto :eof
@REM #################################################################################################################################################
:statistics
start "Express statistics" /MAX docker compose -f %COMPOSE_FILE% -p %PROJECT% stats
start "Databases statistics" /MAX docker compose -f %COMPOSE_DATABASES_FILE% -p %PROJECT_DATABASES% stats
cls
goto :eof
@REM #################################################################################################################################################
:containers
cls
docker compose -f %COMPOSE_DATABASES_FILE% -p %PROJECT_DATABASES% ps
echo ------------------------------------------------------------------------------------------
docker compose -f %COMPOSE_FILE% -p %PROJECT% ps
echo ------------------------------------------------------------------------------------------
echo --- List Running Compose Projects ---
docker compose ls
call :RedLabelAndPause
goto :eof
@REM #################################################################################################################################################
:images_and_volumes
cls
docker compose -f %COMPOSE_FILE% -p %PROJECT% images
echo ------------------------------------------------------------------------------------------
docker compose -f %COMPOSE_DATABASES_FILE% -p %PROJECT_DATABASES% images
echo ------------------------------------------------------------------------------------------
echo --- Volumes ---
docker volume ls
call :RedLabelAndPause
goto :eof
@REM #################################################################################################################################################
:network_inspect
cls
docker network inspect net
call :RedLabelAndPause
goto :eof
@REM #################################################################################################################################################
:express_logs
cls
docker compose -f %COMPOSE_FILE% -p %PROJECT% logs
call :RedLabelAndPause
goto :eof
@REM #################################################################################################################################################
:RedLabelAndPause
powershell -Command Write-Host "FINISH %LABEL%" -foreground "Red"
pause
cls
goto :eof
