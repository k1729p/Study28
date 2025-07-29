@echo off
cd ..
::goto :serve
goto :build_and_start

ng version
ng lint
goto :eof

:serve
call ng serve
pause
goto :eof

:build_and_start
call ng build
pause
cd dist\study28\browser
start "study28" /MAX http-server . -p 8080
pause
