@echo off
set CURL=curl -g -H "Accept: application/json" -H "Content-Type: application/json"
%CURL% "http://localhost:8128/api/read/
echo.
pause
::%CURL% "http://localhost:8128/api/departments?repositoryType=postgresql"