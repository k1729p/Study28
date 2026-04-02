@echo off
set CURL=curl -g -i -H "Accept: application/json" -H "Content-Type: application/json"
set PORT=8128
set PGHOST=localhost
cd ..
::goto req:

rmdir /S/Q dist > nul 2>&1
call tsc -p tsconfig.json
start "Study 28" /MAX node dist/server.js
pause
:req
%CURL% "http://localhost:8128/api/aaa/"
::pause