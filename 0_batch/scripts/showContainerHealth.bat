@echo off

:loop
docker container ps --format "table {{.Names}}\t{{.Status}}"
timeout /t 20
cls
goto loop
