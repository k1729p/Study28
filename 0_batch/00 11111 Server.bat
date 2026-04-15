@echo off
set PORT=8128
set CASSANDRA_HOST=localhost
set ELASTICSEARCH_HOST=localhost
set MONGODB_HOST=localhost
set MY_SQL_HOST=localhost
set NEO4J_HOST=localhost
set ORACLE_HOST=localhost
set POSTGRESQL_HOST=localhost
set REDIS_HOST=localhost
set SQL_SERVER_HOST=localhost
cd ..
rmdir /S/Q dist > nul 2>&1
call tsc -p tsconfig.json
if not exist "dist\" (
  echo.
  echo #=#=#=#=##=#=#=#=# COMPILATION ERROR ERROR ERROR #=#=#=#=##=#=#=#=#
  pause
  exit /b
)
::start "Study 28" /MAX node dist/server.js
node dist/server.js
pause