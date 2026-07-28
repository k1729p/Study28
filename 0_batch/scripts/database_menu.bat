@echo off
set KEY=
cls
echo %LABEL%
echo Select database:
echo - - - - - - - - - - - - - - -
echo [A] Cassandra
echo [B] Chroma
echo [C] Elasticsearch
echo - - - - - - - - - - - - - - -
echo [D] Neo4j
echo [E] MongoDB
echo [F] MySQL
echo [G] Oracle
echo - - - - - - - - - - - - - - -
echo [H] PostgreSQL
echo [I] Redis
echo [J] SQL Server
echo - - - - - - - - - - - - - - -
echo Press any other key to quit
set /P KEY="Select the key: "
if /i "%KEY:~0,1%"=="A" (
  set REPO_TYPE=cassandra
) else if /i "%KEY%"=="B" (
  set REPO_TYPE=chroma
) else if /i "%KEY%"=="C" (
  set REPO_TYPE=elasticsearch
) else if /i "%KEY%"=="D" (
  set REPO_TYPE=neo4j
) else if /i "%KEY%"=="E" (
  set REPO_TYPE=mongodb
) else if /i "%KEY%"=="F" (
  set REPO_TYPE=mysql
) else if /i "%KEY%"=="G" (
  set REPO_TYPE=oracle
) else if /i "%KEY%"=="H" (
  set REPO_TYPE=postgresql
) else if /i "%KEY%"=="I" (
  set REPO_TYPE=redis
) else if /i "%KEY%"=="J" (
  set REPO_TYPE=sqlserver
) else (
  set REPO_TYPE=
)
cls