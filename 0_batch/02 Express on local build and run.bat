@echo off
if [%1] == [] (
    cd ..
)
rmdir /S/Q dist > nul 2>&1
call tsc -p tsconfig.json
::node dist/server.js 8028
node dist/server.js
pause

::start "Study 28" /MAX node dist/server.js