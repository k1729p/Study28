# Read Employee Sequence Diagram

```mermaid
sequenceDiagram
box aliceblue Client Layer
  participant API_CLI@{ "type": "actor" } as API Client
end
box honeydew Controller Layer
  participant CTRL@{ "type": "boundary" } as EmployeeController
end
box cornsilk Service Layer
  participant SERV@{ "type": "control" } as EmployeeService
end
box bisque Repository Layer
  participant REPO as PostgreSQLEmployeeRepository
  participant POOL as Pool<br>(postgresql.pool.js)
end
box mistyrose Database Layer
  participant PSQL@{ "type" : "database" } as PostgreSQL
end

autonumber 1
Note over CTRL, PSQL: Process: Read employee by ID (PostgreSQL Flow)

API_CLI ->>+ CTRL: GET<br>/employees/:id?repositoryType=POSTGRESQL

CTRL ->>+ SERV: getEmployee(<br>repositoryType, id)
SERV ->>+ REPO: getEmployee(<br>id)
REPO ->>+ POOL: connect()
POOL -->>- REPO: client
REPO ->>+ PSQL: client.query(<br>SELECT_EMPLOYEE_SQL, [id])

PSQL -->>- REPO: result (rows)
REPO -->>- SERV: Employee | undefined
SERV -->>- CTRL: Employee | undefined

alt employee found
    CTRL -->> API_CLI: 200 OK (JSON Response)
else employee not found
    CTRL -->> API_CLI: 404 Not Found (JSON Response)
end
deactivate CTRL
```

## Process Logic

1. **API Client**: Sends the Request.
1. **Controller**: Receives the Request, extracts the _repositoryType_ from the query string and the _id_ from the route parameter, validating that it is a numeric value.
1. **Service**: Acts as an orchestrator, specifically calling _postgreSQLEmployeeRepository.getEmployee_ based on the passed type, after validating that the _id_ is an integer within the allowed range.
1. **Repository**: Uses the PostgreSQL Pool to acquire a client and executes the parameterized SQL query, mapping the result row to an Employee object.
1. **Database**: Returns the query result rows from PostgreSQL database to the repository.
1. **Controller**: Returns **200 OK** with the employee JSON if found, otherwise **404 Not Found**.

---
