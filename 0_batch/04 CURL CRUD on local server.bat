@echo on
@set SITE=http://localhost:8028/api
@set CURL=curl -g -i -H "Accept: application/json" -H "Content-Type: application/json"
@set HR_YELLOW=@powershell -Command Write-Host "----------------------------------------------------------------------" -foreground "Yellow"
@set HR_RED=@powershell    -Command Write-Host "----------------------------------------------------------------------" -foreground "Red"
@set QUERY_DIR=../docker-config/tests/queries
@set DEP_ID=12345
@set EMP_ID=67890

:create
%HR_YELLOW%
@powershell -Command Write-Host "CREATE department" -foreground "Green"
%CURL% -d @%QUERY_DIR%/created_department.json -X POST "%SITE%/departments"
@echo.
@powershell -Command Write-Host "CREATE employee" -foreground "Green"
%CURL% -d @%QUERY_DIR%/created_employee.json -X POST "%SITE%/employees"
@echo.

:read-created
%HR_YELLOW%
@powershell -Command Write-Host "READ department by id - after CREATE" -foreground "Green"
%CURL% "%SITE%/departments/%DEP_ID%"
@echo.
@powershell -Command Write-Host "READ employee by id - after CREATE" -foreground "Green"
%CURL% "%SITE%/employees/%EMP_ID%"
@echo.&pause

:update
%HR_YELLOW%
@powershell -Command Write-Host "UPDATE department by id" -foreground "Green"
%CURL% -d @%QUERY_DIR%/updated_department.json -X PATCH "%SITE%/departments/%DEP_ID%"
@echo.
@powershell -Command Write-Host "UPDATE employee by id" -foreground "Green"
%CURL% -d @%QUERY_DIR%/updated_employee.json -X PATCH "%SITE%/employees/%EMP_ID%"
@echo.

:read-updated
%HR_YELLOW%
@powershell -Command Write-Host "READ department by id - after UPDATE" -foreground "Green"
%CURL% "%SITE%/departments/%DEP_ID%"
@echo.&pause

:delete
%HR_YELLOW%
@powershell -Command Write-Host "DELETE employee by id" -foreground "Green"
%CURL% -X DELETE "%SITE%/employees/%EMP_ID%"
@echo.
@powershell -Command Write-Host "DELETE department by id" -foreground "Green"
%CURL% -X DELETE "%SITE%/departments/%DEP_ID%"
@echo.

:read-deleted
%HR_YELLOW%
@powershell -Command Write-Host "READ department by id - not found after DELETE" -foreground "Green"
%CURL% "%SITE%/departments/%DEP_ID%"
@echo.
@powershell -Command Write-Host "READ employee by id - not found after DELETE" -foreground "Green"
%CURL% "%SITE%/employees/%EMP_ID%"
@echo.

:finish
%HR_RED%
@powershell -Command Write-Host "FINISH" -foreground "Red"
pause