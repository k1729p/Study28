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
echo [B] compose ps study28
echo [C] compose ps databases
echo - - - - - - - - - - - - - - -
echo [D] volume
echo [E] image
echo [F] compose images
echo - - - - - - - - - - - - - - -
echo [G] compose ls
echo [H] network
echo [I] Express statistics
echo - - - - - - - - - - - - - - -
echo [J] databases statistics
echo [K] Express logs
echo - - - - - - - - - - - - - - -
echo Press any other key to quit
set /P KEY="Select an option: "
if /i "%KEY:~0,1%"=="A" (
  set LABEL=[A] container ps
  call :ContainerPs
) else if /i "%KEY:~0,1%"=="B" (
  set LABEL=[B] compose ps study28
  call :composePsStudy28
) else if /i "%KEY:~0,1%"=="C" (
  set LABEL=[C] compose ps databases
  call :composePsDatabases
) else if /i "%KEY:~0,1%"=="D" (
  set LABEL=[D] volume
  call :Volume
) else if /i "%KEY:~0,1%"=="E" (
  set LABEL=[E] image
  call :Image
) else if /i "%KEY:~0,1%"=="F" (
  set LABEL=[F] compose images
  call :composeImages
) else if /i "%KEY:~0,1%"=="G" (
  set LABEL=[G] compose ls
  call :composeLs
) else if /i "%KEY:~0,1%"=="H" (
  set LABEL=[H] inspect network
  call :InspectNetwork
) else if /i "%KEY:~0,1%"=="I" (
  set LABEL=[I] Express statistics
  call :ExpressStatistics
) else if /i "%KEY:~0,1%"=="J" (
  set LABEL=[J] databases statistics
  call :DatabasesStatistics
) else if /i "%KEY:~0,1%"=="K" (
  set LABEL=[K] Express logs
  call :ExpressLogs
) else (
  goto :eof
)
goto menu
:: =================================================================================================================================================
:ContainerPs
cls
docker container ps --format "table {{.Names}}\t{{.Status}}"
call :RedLabelAndPause
cls
goto :eof
:: =================================================================================================================================================
:composePsStudy28
cls
docker compose -f %COMPOSE_FILE% -p %PROJECT% ps
call :RedLabelAndPause
cls
goto :eof
:: =================================================================================================================================================
:composePsDatabases
cls
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
:Image
cls
docker image ls
call :RedLabelAndPause
cls
goto :eof
:: =================================================================================================================================================
:composeImages
cls
docker compose -f %COMPOSE_FILE% -p %PROJECT% images
echo ------------------------------------------------------------------------------------------
docker compose -f %COMPOSE_DATABASES_FILE% -p %PROJECT_DATABASES% images
call :RedLabelAndPause
cls
goto :eof
:: =================================================================================================================================================
:composeLs
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
:ExpressStatistics
start "Express statistics" /MAX docker compose -f %COMPOSE_FILE% -p %PROJECT% stats
cls
goto :eof
:: =================================================================================================================================================
:DatabasesStatistics
cls
start "Databases statistics" /MAX docker compose -f %COMPOSE_DATABASES_FILE% -p %PROJECT_DATABASES% stats
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
:RedLabelAndPause
powershell -Command Write-Host "FINISH %LABEL%" -foreground "Red"
pause
goto :eof
:: =================================================================================================================================================
:quit
echo.&pause
