@echo off
set PORT=8128
set MONGODB_URI=mongodb://admin:secret@localhost:27017/?authSource=admin
set MY_SQL_HOST=localhost
set POSTGRESQL_HOST=localhost
set ORACLE_CONNECT_STRING=localhost:1521/FREEPDB1
set REDIS_URL=redis://localhost:6379
set SQL_SERVER_HOST=localhost

if [%1] == [] (
    cd ..
)
rmdir /S/Q dist > nul 2>&1
call tsc -p tsconfig.json
node dist/server.js
pause

::start "Study 28" /MAX node dist/server.js