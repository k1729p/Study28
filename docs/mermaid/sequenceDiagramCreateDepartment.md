# Create Department Sequence Diagram

```mermaid
sequenceDiagram
box aliceblue Client Layer
  participant API_CLI@{ "type": "actor" } as API Client
end
box honeydew Controller Layer
  participant CTRL@{ "type": "boundary" } as DepartmentController
end
box cornsilk Service Layer
  participant SERV@{ "type": "control" } as DepartmentService
end
box bisque Repository Layer
  participant REPO as PostgreSQLDepartmentRepository
  participant POOL as Pool<br>(postgresql.pool.js)
end
box mistyrose Database Layer
  participant PSQL@{ "type" : "database" } as PostgreSQL
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

## Process Logic

1. **API Client**: Sends the Request (for example **curl**).
1. **Controller**: Receives the Request and extracts the _repositoryType_ from the query string and the department from the body.
1. **Service**: Acts as an orchestrator, specifically calling _postgreSQLDepartmentRepository.createDepartment_ based on the passed type.
1. **Repository**: Uses the PostgreSQL Pool to acquire a client and executes the parameterized SQL query.
1. **Database**: Returns the execution result from PostgreSQL database to the repository.

---
