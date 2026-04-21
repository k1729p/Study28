@echo off
::set PORT=8028
set PORT=8128
set CURL=curl -g -H "Accept: application/json" -H "Content-Type: application/json"
%CURL% "http://localhost:%PORT%/api/initialize"
echo.
pause
