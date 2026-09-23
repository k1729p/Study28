# Read Department Sequence Diagram

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
Note over CTRL, PSQL: Process: Read department by ID (PostgreSQL Flow)

API_CLI ->>+ CTRL: GET<br>/departments/:id?repositoryType=POSTGRESQL

CTRL ->>+ SERV: getDepartment(<br>repositoryType, id)
SERV ->>+ REPO: getDepartment(<br>id)
REPO ->>+ POOL: connect()
POOL -->>- REPO: client
REPO ->>+ PSQL: client.query(<br>SELECT_DEPARTMENT_SQL, [id])

PSQL -->>- REPO: result (rows)
REPO -->>- SERV: Department | undefined
SERV -->>- CTRL: Department | undefined

alt department found
    CTRL -->> API_CLI: 200 OK (JSON Response)
else department not found
    CTRL -->> API_CLI: 404 Not Found (JSON Response)
end
deactivate CTRL
```

## Process Logic

1. **API Client**: Sends the Request.
1. **Controller**: Receives the Request, extracts the _repositoryType_ from the query string and the _id_ from the route parameter, validating that it is a numeric value.
1. **Service**: Acts as an orchestrator, specifically calling _postgreSQLDepartmentRepository.getDepartment_ based on the passed type, after validating that the _id_ is an integer within the allowed range.
1. **Repository**: Uses the PostgreSQL Pool to acquire a client and executes the parameterized SQL query, mapping the result rows (department joined with its employees) to a Department object.
1. **Database**: Returns the query result rows from PostgreSQL database to the repository.
1. **Controller**: Returns **200 OK** with the department JSON if found, otherwise **404 Not Found**.

---
