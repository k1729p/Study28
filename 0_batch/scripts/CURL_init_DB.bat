@echo off
set SITE=http://localhost:%PORT%/api
set REPO_TYPE=%1
set CURL=curl -g -i -H "Accept: application/json" -H "Content-Type: application/json"
set HR_YELLOW=@powershell -Command Write-Host "----------------------------------------------------------------------" -foreground "Yellow"
set HR_RED=@powershell    -Command Write-Host "----------------------------------------------------------------------" -foreground "Red"
set QUERY_DIR=../docker-config/tests/queries
set LABEL=Initialize database
set DEP_ID=1
set EMP_ID=1
@echo on

%HR_YELLOW%
@powershell -Command Write-Host "%REPO_TYPE% Load initial data" -foreground "Green"
%CURL% -X POST "%SITE%/load?repositoryType=%REPO_TYPE%"
@echo.

:find-departments
%HR_YELLOW%
@powershell -Command Write-Host "%REPO_TYPE% Find all departments" -foreground "Green"
%CURL% "%SITE%/departments?repositoryType=%REPO_TYPE%"
@echo.

:find-department
%HR_YELLOW%
@powershell -Command Write-Host "%REPO_TYPE% Find department by id" -foreground "Green"
%CURL% "%SITE%/departments/%DEP_ID%?repositoryType=%REPO_TYPE%"
@echo.

:find-employees
%HR_YELLOW%
@powershell -Command Write-Host "%REPO_TYPE% Find all employees" -foreground "Green"
%CURL% "%SITE%/employees?repositoryType=%REPO_TYPE%"
@echo.

:find-employee
%HR_YELLOW%
@powershell -Command Write-Host "%REPO_TYPE% Find employee by id" -foreground "Green"
%CURL% "%SITE%/employees/%EMP_ID%?repositoryType=%REPO_TYPE%"
@echo.

:finish
%HR_RED%
@powershell -Command Write-Host "%REPO_TYPE% FINISH" -foreground "Red"
@echo off