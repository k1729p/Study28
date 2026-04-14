@echo off
set PORT=8128
set CASSANDRA_HOST=localhost
set ELASTICSEARCH_HOST=localhost
set MONGODB_HOST=localhost
set MY_SQL_HOST=localhost
set POSTGRESQL_HOST=localhost
set ORACLE_HOST=localhost
set REDIS_HOST=localhost
set SQL_SERVER_HOST=localhost

if [%1] == [] (
    cd ..
)
rmdir /S/Q dist > nul 2>&1
call tsc -p tsconfig.json
node dist/server.js
pause

::start "Study 28" /MAX node dist/server.js