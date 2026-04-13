@echo off
set CURL=curl -g -H "Accept: application/json" -H "Content-Type: application/json"
%CURL% "http://localhost:8128/api/initialize"
echo.
pause
