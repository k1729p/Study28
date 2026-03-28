# Create Department Sequence Diagram

```mermaid
sequenceDiagram
participant API_CLI as API Client
box honeydew Backend Repository Server 'Study28'<br>(Express on Node.js)
    participant CTRL as DepartmentController
    participant SERV as DepartmentService
    participant REPO as PostgreSQLDepartmentRepository
    participant POOL as Pool<br>(postgresql.pool.js)
end
box mistyrose Database
    participant PSQL as PostgreSQL
end

autonumber 1
Note over CTRL, PSQL: Process: Create Department (PostgreSQL Flow)

API_CLI ->>+ CTRL: POST<br>/departments?repositoryType=POSTGRESQL

CTRL ->>+ SERV: createDepartment(<br>repositoryType, department)
SERV ->>+ REPO: createDepartment(<br>department)
REPO ->>+ POOL: connect()
POOL -->>- REPO: client
REPO ->>+ PSQL: client.query(<br>CREATE_DEPARTMENT_SQL, [values])

PSQL -->>- REPO: result (CommandComplete)
REPO -->>- SERV: void / success
SERV -->>- CTRL: void / success
CTRL -->>- API_CLI: 201 Created (JSON Response)
```

API Client - for example **cURL**.

## Process Logic

1. **Controller**: Receives the Request and extracts the _repositoryType_ from the query string and the department from the body.
2. **Service**: Acts as an orchestrator, specifically calling _postgreSQLDepartmentRepository.createDepartment_ based on the passed type.
3. **Repository**: Uses the PostgreSQL Pool to acquire a client and executes the parameterized SQL query.
4. **Database**: Returns the execution result to the repository.

---
