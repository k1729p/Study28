@echo off
set SITE=http://localhost:%PORT%/api
set REPO_TYPE=%1
set CURL=curl -g -i -H "Accept: application/json" -H "Content-Type: application/json"
set HR_YELLOW=@powershell -Command Write-Host "----------------------------------------------------------------------" -foreground "Yellow"
set HR_RED=@powershell    -Command Write-Host "----------------------------------------------------------------------" -foreground "Red"
set QUERY_DIR=../docker-config/tests/queries
set LABEL=Create, read, update, delete
set DEP_ID=12345
set EMP_ID=67890
@echo on

:create
%HR_YELLOW%
@powershell -Command Write-Host "%REPO_TYPE% CREATE department" -foreground "Green"
%CURL% -d @%QUERY_DIR%/created_department.json -X POST "%SITE%/departments?repositoryType=%REPO_TYPE%"
@echo.
@powershell -Command Write-Host "%REPO_TYPE% CREATE employee" -foreground "Green"
%CURL% -d @%QUERY_DIR%/created_employee.json -X POST "%SITE%/employees?repositoryType=%REPO_TYPE%"
@echo.

:read-created
%HR_YELLOW%
@powershell -Command Write-Host "%REPO_TYPE% READ department by id - after CREATE" -foreground "Green"
%CURL% "%SITE%/departments/%DEP_ID%?repositoryType=%REPO_TYPE%"
@echo.
@powershell -Command Write-Host "%REPO_TYPE% READ employee by id - after CREATE" -foreground "Green"
%CURL% "%SITE%/employees/%EMP_ID%?repositoryType=%REPO_TYPE%"
@echo.

:update
%HR_YELLOW%
@powershell -Command Write-Host "%REPO_TYPE% UPDATE department by id" -foreground "Green"
%CURL% -d @%QUERY_DIR%/updated_department.json -X PATCH "%SITE%/departments/%DEP_ID%?repositoryType=%REPO_TYPE%"
@echo.
@powershell -Command Write-Host "%REPO_TYPE% UPDATE employee by id" -foreground "Green"
%CURL% -d @%QUERY_DIR%/updated_employee.json -X PATCH "%SITE%/employees/%EMP_ID%?repositoryType=%REPO_TYPE%"
@echo.

:read-updated
%HR_YELLOW%
@powershell -Command Write-Host "%REPO_TYPE% READ department by id - after UPDATE" -foreground "Green"
%CURL% "%SITE%/departments/%DEP_ID%?repositoryType=%REPO_TYPE%"
@echo.
@powershell -Command Write-Host "%REPO_TYPE% READ employee by id - after UPDATE" -foreground "Green"
%CURL% "%SITE%/employees/%EMP_ID%?repositoryType=%REPO_TYPE%"
@echo.

:delete
%HR_YELLOW%
@powershell -Command Write-Host "%REPO_TYPE% DELETE employee by id" -foreground "Green"
%CURL% -X DELETE "%SITE%/employees/%EMP_ID%?repositoryType=%REPO_TYPE%"
@echo.
@powershell -Command Write-Host "%REPO_TYPE% DELETE department by id" -foreground "Green"
%CURL% -X DELETE "%SITE%/departments/%DEP_ID%?repositoryType=%REPO_TYPE%"
@echo.

:read-deleted
%HR_YELLOW%
@powershell -Command Write-Host "%REPO_TYPE% READ department by id - not found after DELETE" -foreground "Green"
%CURL% "%SITE%/departments/%DEP_ID%?repositoryType=%REPO_TYPE%"
@echo.
@powershell -Command Write-Host "%REPO_TYPE% READ employee by id - not found after DELETE" -foreground "Green"
%CURL% "%SITE%/employees/%EMP_ID%?repositoryType=%REPO_TYPE%"
@echo.

:finish
%HR_RED%
@powershell -Command Write-Host "%REPO_TYPE% FINISH" -foreground "Red"
@echo off