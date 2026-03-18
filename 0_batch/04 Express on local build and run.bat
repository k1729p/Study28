@echo off
set PORT=8128
set PGHOST=localhost
if [%1] == [] (
    cd ..
)
rmdir /S/Q dist > nul 2>&1
call tsc -p tsconfig.json
node dist/server.js
pause

::start "Study 28" /MAX node dist/server.js