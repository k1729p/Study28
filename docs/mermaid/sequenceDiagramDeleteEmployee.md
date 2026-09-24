# Delete Employee Sequence Diagram

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
Note over CTRL, PSQL: Process: Delete employee by ID (PostgreSQL Flow)

API_CLI ->>+ CTRL: DELETE<br>/employees/:id?repositoryType=POSTGRESQL

CTRL ->>+ SERV: deleteEmployee(<br>repositoryType, id)
SERV ->>+ REPO: deleteEmployee(<br>id)
REPO ->>+ POOL: connect()
POOL -->>- REPO: client
REPO ->>+ PSQL: client.query(BEGIN)
PSQL -->>- REPO: ok
REPO ->>+ PSQL: client.query(<br>DELETE_EMPLOYEE_SQL, [id])
PSQL -->>- REPO: ok
REPO ->>+ PSQL: client.query(COMMIT)
PSQL -->>- REPO: ok

REPO -->>- SERV: void
SERV -->>- CTRL: void
CTRL -->> API_CLI: 204 No Content (JSON Response)
deactivate CTRL
```

## Process Logic

1. **API Client**: Sends the Request.
1. **Controller**: Receives the Request, extracts the _repositoryType_ from the query string and the _id_ from the route parameter, validating that it is a numeric value (otherwise **400 Bad Request** is returned).
1. **Service**: Acts as an orchestrator, delegating to _postgreSQLEmployeeRepository.deleteEmployee_ based on the passed type, after validating that the _id_ is an integer within the allowed range.
1. **Repository**: Uses the PostgreSQL Pool to acquire a client and, within a transaction, executes the parameterized `DELETE_EMPLOYEE_SQL` statement directly (unlike the department flow, no stored procedure is involved, since deleting an employee has no cascading effect on other rows), and the transaction is committed. No row-count check is performed, so the call succeeds whether or not an employee with that _id_ existed.
1. **Database**: Executes the `DELETE` statement.
1. **Controller**: Returns **204 No Content** unconditionally once the repository call completes without error.

---
