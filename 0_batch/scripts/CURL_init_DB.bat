@echo on
@set SITE=http://localhost:%1/api
@set CURL=curl -g -i -H "Accept: application/json" -H "Content-Type: application/json"
@set HR_YELLOW=@powershell -Command Write-Host "----------------------------------------------------------------------" -foreground "Yellow"
@set HR_RED=@powershell    -Command Write-Host "----------------------------------------------------------------------" -foreground "Red"
@set QUERY_DIR=../docker-config/tests/queries
@set REPO_TYPE=repositoryType=postgresql
@set DEP_ID=1
@set EMP_ID=1


%HR_YELLOW%
@powershell -Command Write-Host "Load initial data into the database PostgreSQL" -foreground "Green"
%CURL% -d @%QUERY_DIR%/initial_data.json -X POST "%SITE%/load?%REPO_TYPE%"
@echo.

:find-departments
%HR_YELLOW%
@powershell -Command Write-Host "Find all departments" -foreground "Green"
%CURL% "%SITE%/departments?%REPO_TYPE%"
@echo.

:find-department
%HR_YELLOW%
@powershell -Command Write-Host "Find department by id" -foreground "Green"
%CURL% "%SITE%/departments/%DEP_ID%?%REPO_TYPE%"
@echo.

:find-employees
%HR_YELLOW%
@powershell -Command Write-Host "Find all employees" -foreground "Green"
%CURL% "%SITE%/employees?%REPO_TYPE%"
@echo.

:find-employee
%HR_YELLOW%
@powershell -Command Write-Host "Find employee by id" -foreground "Green"
%CURL% "%SITE%/employees/%EMP_ID%?%REPO_TYPE%"
@echo.

:finish
%HR_RED%
@powershell -Command Write-Host "FINISH" -foreground "Red"
pause