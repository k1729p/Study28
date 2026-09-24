# Create Employee Sequence Diagram

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
Note over CTRL, PSQL: Process: Create employee (PostgreSQL Flow)

API_CLI ->>+ CTRL: POST<br>/employees?repositoryType=POSTGRESQL<br>Body: Employee (JSON)

CTRL ->>+ SERV: createEmployee(<br>repositoryType, employee)
SERV ->>+ REPO: createEmployee(<br>employee)
REPO ->>+ POOL: connect()
POOL -->>- REPO: client
REPO ->>+ PSQL: client.query(BEGIN)
PSQL -->>- REPO: ok
REPO ->>+ PSQL: client.query(<br>INSERT_EMPLOYEE_SQL, [id, departmentId, firstName,<br>lastName, title, phone, mail, streetName,<br>houseNumber, postalCode, locality, province, country])
PSQL -->>- REPO: result (rowCount)

alt employee created (rowCount > 0)
    REPO ->>+ PSQL: client.query(COMMIT)
    PSQL -->>- REPO: ok
else employee not created (rowCount = 0)
    REPO ->>+ PSQL: client.query(ROLLBACK)
    PSQL -->>- REPO: ok
end

REPO -->>- SERV: void
SERV -->>- CTRL: void
CTRL -->> API_CLI: 201 Created (JSON Response)
deactivate CTRL
```

## Process Logic

1. **API Client**: Sends the Request with a JSON body containing the new employee's fields, including its _id_.
1. **Controller**: Receives the Request, extracts the _repositoryType_ from the query string, and maps the request body to an Employee via _bodyToEmployee_, validating that it contains an _id_ (otherwise **400 Bad Request** is returned).
1. **Service**: Acts as an orchestrator, delegating to _postgreSQLEmployeeRepository.createEmployee_ based on the passed type. No numeric range validation of the _id_ is performed here, since the _id_ originates from the validated request body.
1. **Repository**: Uses the PostgreSQL Pool to acquire a client and, within a transaction, executes the parameterized `INSERT_EMPLOYEE_SQL` statement.
   - If the insert affects a row (`rowCount > 0`), the transaction is committed.
   - If no row is inserted (`rowCount = 0`, e.g. a conflicting _id_), the transaction is rolled back and the method returns without throwing.
   - Any database error (for example a constraint violation, such as a missing _departmentId_) is caught, the transaction is rolled back, and a `RepositoryException` is thrown, which the Controller forwards to the error-handling middleware via `next(error)`.
1. **Database**: Executes the `INSERT` statement and returns the affected row count to the repository.
1. **Controller**: Returns **201 Created** once the repository call completes without throwing — as with the update flow, the repository does not surface a "not created" condition, so the response does not differ based on whether a row was actually inserted.

---
