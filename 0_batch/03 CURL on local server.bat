@echo on
@set SITE=http://localhost:8028/api
@set CURL=curl -g -i -H "Accept: application/json" -H "Content-Type: application/json"
@set HR_YELLOW=@powershell -Command Write-Host "----------------------------------------------------------------------" -foreground "Yellow"
@set HR_RED=@powershell    -Command Write-Host "----------------------------------------------------------------------" -foreground "Red"
@set QUERY_DIR=../docker-config/tests/queries

%HR_YELLOW%
@powershell -Command Write-Host "Load initial data into the database" -foreground "Green"
%CURL% -d @%QUERY_DIR%/initial_data.json -X POST "%SITE%/load"
@echo.&pause

:find-departments
%HR_YELLOW%
@powershell -Command Write-Host "Find all departments" -foreground "Green"
%CURL% "%SITE%/departments"
@echo.

:find-department
%HR_YELLOW%
@powershell -Command Write-Host "Find department by id" -foreground "Green"
%CURL% "%SITE%/departments/1"
@echo.&pause

:find-employees
%HR_YELLOW%
@powershell -Command Write-Host "Find all employees" -foreground "Green"
%CURL% "%SITE%/employees"
@echo.

:find-employee
%HR_YELLOW%
@powershell -Command Write-Host "Find employee by id" -foreground "Green"
%CURL% "%SITE%/employees/1"
@echo.

:finish
%HR_RED%
@powershell -Command Write-Host "FINISH" -foreground "Red"
pause