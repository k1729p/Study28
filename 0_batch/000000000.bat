@echo off
set CURL=curl -g -i -H "Accept: application/json" -H "Content-Type: application/json"
set PORT=8128
set MONGODB_URI=mongodb://admin:secret@localhost:27017/?authSource=admin
set MY_SQL_HOST=localhost
set POSTGRESQL_HOST=localhost
set ORACLE_CONNECT_STRING=localhost:1521/FREEPDB1
set REDIS_URL=redis://localhost:6379
set SQL_SERVER_HOST=localhost

cd ..
::goto req:

rmdir /S/Q dist > nul 2>&1
call tsc -p tsconfig.json
start "Study 28" /MAX node dist/server.js
pause
:req
%CURL% "http://localhost:8128/api/aaa/"
::pause