@echo off
:menu
set KEY=
cls
echo TIME[%TIME%]
echo 'Initialize database' CURL requests [%CURL_INIT_DB%]
echo 'CRUD' CURL requests [%CURL_CRUD%]
echo.
echo Select database:
echo - - - - - - - - - - - - - - -
echo [A] All databases
echo - - - - - - - - - - - - - - -
echo [B] Cassandra
echo [C] Chroma
echo [D] Elasticsearch
echo - - - - - - - - - - - - - - -
echo [E] MongoDB
echo [F] MySQL
echo [G] Neo4j
echo [H] Oracle
echo - - - - - - - - - - - - - - -
echo [I] PostgreSQL
echo [J] Redis
echo [K] SQL Server
echo - - - - - - - - - - - - - - -
echo [Z] Switch CURL between 'Initialize Database' and 'CRUD'
echo - - - - - - - - - - - - - - -
echo Press any other key to quit
set /P KEY="Select the key: "
if /i "%KEY%"=="A" (
  set REPOSITORY_TYPES=cassandra chroma elasticsearch mongodb mysql neo4j oracle postgresql redis sqlserver
  call :RunCurl
) else if /i "%KEY%"=="B" (
  set REPOSITORY_TYPES=cassandra
  call :RunCurl
) else if /i "%KEY%"=="C" (
  set REPOSITORY_TYPES=chroma
  call :RunCurl
) else if /i "%KEY%"=="D" (
  set REPOSITORY_TYPES=elasticsearch
  call :RunCurl
) else if /i "%KEY%"=="E" (
  set REPOSITORY_TYPES=mongodb
  call :RunCurl
) else if /i "%KEY%"=="F" (
  set REPOSITORY_TYPES=mysql
  call :RunCurl
) else if /i "%KEY%"=="G" (
  set REPOSITORY_TYPES=neo4j
  call :RunCurl
) else if /i "%KEY%"=="H" (
  set REPOSITORY_TYPES=oracle
  call :RunCurl
) else if /i "%KEY%"=="I" (
  set REPOSITORY_TYPES=postgresql
  call :RunCurl
) else if /i "%KEY%"=="J" (
  set REPOSITORY_TYPES=redis
  call :RunCurl
) else if /i "%KEY%"=="K" (
  set REPOSITORY_TYPES=sqlserver
  call :RunCurl
) else if /i "%KEY%"=="Z" (
  call :CurlSwitching
) else (
  goto :eof
)
cls
goto menu
:: =================================================================================================================================================
:RunCurl
cls
for %%R in (%REPOSITORY_TYPES%) do (
  if "%CURL_INIT_DB%"=="ON" (
    call scripts\CURL_init_DB.bat %%R
  ) else (
    call scripts\CURL_CRUD.bat %%R
  )
)
pause
cls
goto :eof
:: =================================================================================================================================================
:CurlSwitching
if "%CURL_INIT_DB%"=="ON" (
  set CURL_INIT_DB=OFF
  set CURL_CRUD=ON
) else (
  set CURL_INIT_DB=ON
  set CURL_CRUD=OFF
)
cls
goto :eof
:: =================================================================================================================================================