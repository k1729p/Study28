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
echo - - - - - - - - - - - - - - -
echo [A] container ps
echo [B] compose ps
echo - - - - - - - - - - - - - - -
echo [C] volume
echo [D] images
echo - - - - - - - - - - - - - - -
echo [E] compose images
echo [F] compose ls
echo - - - - - - - - - - - - - - -
echo [G] network
echo [H] Express logs
echo - - - - - - - - - - - - - - -
echo [I] Express statistics
echo [J] databases statistics
echo - - - - - - - - - - - - - - -
echo Press any other key to quit
set /P KEY="Select an option: "
if /i "%KEY:~0,1%"=="A" (
  set LABEL=[A] container ps
  call :ContainerPs
) else if /i "%KEY:~0,1%"=="B" (
  set LABEL=[B] compose ps
  call :ComposePs
) else if /i "%KEY:~0,1%"=="C" (
  set LABEL=[C] volume
  call :Volume
) else if /i "%KEY:~0,1%"=="D" (
  set LABEL=[D] images
  call :Images
) else if /i "%KEY:~0,1%"=="E" (
  set LABEL=[E] compose images
  call :ComposeImages
) else if /i "%KEY:~0,1%"=="F" (
  set LABEL=[F] compose ls
  call :ComposeLs
) else if /i "%KEY:~0,1%"=="G" (
  set LABEL=[G] inspect network
  call :InspectNetwork
) else if /i "%KEY:~0,1%"=="H" (
  set LABEL=[H] Express logs
  call :ExpressLogs
) else if /i "%KEY:~0,1%"=="I" (
  set LABEL=[I] Express statistics
  call :ExpressStatistics
) else if /i "%KEY:~0,1%"=="J" (
  set LABEL=[J] databases statistics
  call :DatabasesStatistics
) else (
  goto :eof
)
goto menu
:: =================================================================================================================================================
:ContainerPs
cls
start "Container Health" /MAX 0_batch\scripts\showContainerHealth.bat
goto :eof
:: =================================================================================================================================================
:ComposePs
cls
echo --- Study28 ---
docker compose -f %COMPOSE_FILE% -p %PROJECT% ps
echo --- Databases ---
docker compose -f %COMPOSE_DATABASES_FILE% -p %PROJECT_DATABASES% ps
call :RedLabelAndPause
cls
goto :eof
:: =================================================================================================================================================
:Volume
cls
docker volume ls
call :RedLabelAndPause
cls
goto :eof
:: =================================================================================================================================================
:Images
cls
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.ID}}\t{{.Size}}\t{{.CreatedSince}}\t{{.CreatedAt}}"
call :RedLabelAndPause
cls
goto :eof
:: =================================================================================================================================================
:ComposeImages
cls
docker compose -f %COMPOSE_FILE% -p %PROJECT% images
echo ------------------------------------------------------------------------------------------
docker compose -f %COMPOSE_DATABASES_FILE% -p %PROJECT_DATABASES% images
call :RedLabelAndPause
cls
goto :eof
:: =================================================================================================================================================
:ComposeLs
cls
docker compose ls
call :RedLabelAndPause
cls
goto :eof
:: =================================================================================================================================================
:InspectNetwork
cls
docker network inspect net
call :RedLabelAndPause
cls
goto :eof
:: =================================================================================================================================================
:ExpressLogs
cls
docker compose -f %COMPOSE_FILE% -p %PROJECT% logs
call :RedLabelAndPause
cls
goto :eof
:: =================================================================================================================================================
:ExpressStatistics
start "Express statistics" /MAX docker compose -f %COMPOSE_FILE% -p %PROJECT% stats
cls
goto :eof
:: =================================================================================================================================================
:DatabasesStatistics
start "Databases statistics" /MAX docker compose -f %COMPOSE_DATABASES_FILE% -p %PROJECT_DATABASES% stats
cls
goto :eof
:: =================================================================================================================================================
:RedLabelAndPause
powershell -Command Write-Host "FINISH %LABEL%" -foreground "Red"
pause
goto :eof
:: =================================================================================================================================================
:quit
echo.&pause
