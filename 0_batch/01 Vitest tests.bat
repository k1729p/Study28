@echo off
set CASSANDRA_HOST=localhost
set CHROMA_HOST=localhost
set ELASTICSEARCH_HOST=localhost
set MONGODB_HOST=localhost
set MY_SQL_HOST=localhost
set NEO4J_HOST=localhost
set ORACLE_HOST=localhost
set POSTGRESQL_HOST=localhost
set REDIS_HOST=localhost
set SQL_SERVER_HOST=localhost
set CLI_ARGS=
set CLI_ARGS=%CLI_ARGS% --reporter=tree

set SHOW_LOGS=Y
if "%SHOW_LOGS%"=="Y" (
  set CLI_ARGS=%CLI_ARGS% --disableConsoleIntercept
) else (
  set CLI_ARGS=%CLI_ARGS% --silent=true
)
::set CLI_ARGS=%CLI_ARGS% --no-color
cd ..
powershell npx vitest %CLI_ARGS% run
pause