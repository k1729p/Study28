# Load Initial Data Sequence Diagram

```mermaid
sequenceDiagram
box aliceblue Client Layer
  participant API_CLI@{ "type": "actor" } as API Client
end
box honeydew Controller Layer
  participant CTRL@{ "type": "boundary" } as InitializationController
end
box cornsilk Service Layer
  participant SERV@{ "type": "control" } as InitializationService
end
box bisque Repository Layer
  participant REPO as PostgreSqlInitialization
  participant POOL as Pool<br>(postgresql.pool.js)
end
box mistyrose Database Layer
  participant PSQL@{ "type" : "database" } as PostgreSQL
end

autonumber 1
Note over CTRL, PSQL: Process: Load initial data (PostgreSQL Flow)

API_CLI ->>+ CTRL: POST<br>/load/?repositoryType=POSTGRESQL<br>Body: {departments: Department[]} (JSON, optional)

CTRL ->>+ SERV: loadInitialData(<br>repositoryType, departments)
Note right of SERV: dataToLoad = departments.length ? departments<br>: INITIAL_DATA (built-in seed data constant)
SERV ->>+ REPO: loadInitialData(dataToLoad)
Note right of REPO: types.setTypeParser(1082, ...) — DATE[] columns<br>are returned as raw strings, avoiding timezone shift
REPO ->>+ POOL: connect()
POOL -->>- REPO: client
REPO ->>+ PSQL: client.query(BEGIN)
PSQL -->>- REPO: ok

REPO ->>+ PSQL: client.query(<br>DROP_PROCEDURE_TRANSFER_EMPLOYEES_SQL)
PSQL -->>- REPO: ok
REPO ->>+ PSQL: client.query(<br>DROP_PROCEDURE_DELETE_DEPARTMENT_AND_EMPLOYEES_SQL)
PSQL -->>- REPO: ok
REPO ->>+ PSQL: client.query(<br>DROP_TABLE_EMPLOYEES_SQL)
PSQL -->>- REPO: ok
REPO ->>+ PSQL: client.query(<br>DROP_TABLE_DEPARTMENTS_SQL)
PSQL -->>- REPO: ok
REPO ->>+ PSQL: client.query(<br>CREATE_TABLE_DEPARTMENTS_SQL)
PSQL -->>- REPO: ok
REPO ->>+ PSQL: client.query(<br>CREATE_TABLE_EMPLOYEES_SQL)
PSQL -->>- REPO: ok
REPO ->>+ PSQL: client.query(<br>CREATE_PROCEDURE_TRANSFER_EMPLOYEES_SQL)
PSQL -->>- REPO: ok
REPO ->>+ PSQL: client.query(<br>CREATE_PROCEDURE_DELETE_DEPARTMENT_AND_EMPLOYEES_SQL)
PSQL -->>- REPO: ok
Note right of PSQL: Schema reset: existing procedures and tables are<br>dropped, then departments/employees tables and the<br>transfer_employees / delete_department_and_employees<br>procedures are recreated

alt departments.length > 0
    REPO ->>+ REPO: insertDepartments(<br>client, departments)
    REPO ->>+ PSQL: client.query(<br>INSERT_DEPARTMENTS_SQL_PREFIX + VALUES,<br>[id, name, startDate, endDate, notes,<br>keywords, image] per department)
    PSQL -->>- REPO: result
    REPO -->>- REPO: void
    REPO ->>+ REPO: insertEmployees(<br>client, departments)
    Note right of REPO: Flattens every department.employees array into<br>one list, tagging each employee with its<br>parent departmentId
    REPO ->>+ PSQL: client.query(<br>INSERT_EMPLOYEES_SQL_PREFIX + VALUES,<br>[id, departmentId, firstName, lastName, title,<br>phone, mail, streetName, houseNumber, postalCode,<br>locality, province, country] per employee)
    PSQL -->>- REPO: result
    REPO -->>- REPO: void
else departments.length = 0
    Note right of REPO: No departments to insert (warning logged);<br>insertEmployees() is not called either
end

REPO ->>+ PSQL: client.query(COMMIT)
PSQL -->>- REPO: ok

REPO -->>- SERV: void
SERV -->>- CTRL: void
CTRL -->> API_CLI: 204 No Content (JSON Response)
deactivate CTRL
```

## Process Logic

1. **API Client**: Sends the Request, optionally with a JSON body containing a _departments_ array (each with nested _employees_) to seed the database with; the body may be omitted or empty.
1. **Controller**: Receives the Request, maps the _repositoryType_ query parameter via _toRepositoryType_ (falling back to `PostgreSQL` if missing or unrecognized), and maps _req.body.departments_ (defaulting to an empty array) to a `Department[]` via _bodyToDepartments_. No validation is performed here — malformed entries simply map to default/empty field values.
1. **Service**: Acts as an orchestrator, resolving the strategy for the given _repositoryType_ (throwing a `ReferenceError` if not implemented). If the supplied _departmentArray_ is non-empty it is used as-is; otherwise the Service falls back to the built-in `INITIAL_DATA` seed constant. It then delegates to _postgreSqlInitialization.loadInitialData_.
1. **Repository**: First configures the `pg` driver so PostgreSQL `DATE` columns are returned as raw strings rather than being shifted by the local timezone. It then uses the PostgreSQL Pool to acquire a client and, within a single transaction:
   - Drops the `transfer_employees` and `delete_department_and_employees` stored procedures, then drops the `employees` and `departments` tables (in that dependency order).
   - Recreates the `departments` and `employees` tables, then recreates both stored procedures — effectively resetting the schema on every call.
   - If _departments_ is non-empty, calls the private _insertDepartments_ helper, which builds a single multi-row parameterized `INSERT` (`INSERT_DEPARTMENTS_SQL_PREFIX` + value placeholders) and executes it; then calls the private _insertEmployees_ helper, which flattens every department's _employees_ array (tagging each with its parent _departmentId_) and executes a single multi-row parameterized `INSERT` (`INSERT_EMPLOYEES_SQL_PREFIX` + value placeholders). If there are no departments, both helpers are skipped and a warning is logged.
   - Commits the transaction once all statements succeed.
   - Any database error at any step is caught, the transaction is rolled back, and a `RepositoryException` is thrown (wrapping a more specific `RepositoryException` if the failure occurred inside _insertDepartments_ or _insertEmployees_), which the Controller forwards to the error-handling middleware via `next(error)`.
1. **Database**: Executes the DDL statements (drops/creates) and the bulk `INSERT` statements inside the transaction.
1. **Controller**: Returns **204 No Content** once the repository call completes without throwing.

---
