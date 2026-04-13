@echo off
set PORT=8128
set CASSANDRA_HOST=localhost
set MONGODB_URI=mongodb://admin:secret@localhost:27017/?authSource=admin
set MY_SQL_HOST=localhost
set POSTGRESQL_HOST=localhost
set ORACLE_CONNECT_STRING=localhost:1521/FREEPDB1
set REDIS_URL=redis://localhost:6379
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