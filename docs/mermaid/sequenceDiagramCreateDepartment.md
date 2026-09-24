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
Note over CTRL, PSQL: Process: Create department (PostgreSQL Flow)

API_CLI ->>+ CTRL: POST<br>/departments?repositoryType=POSTGRESQL<br>Body: Department (JSON)

CTRL ->>+ SERV: createDepartment(<br>repositoryType, department)
SERV ->>+ REPO: createDepartment(<br>department)
REPO ->>+ POOL: connect()
POOL -->>- REPO: client
REPO ->>+ PSQL: client.query(BEGIN)
PSQL -->>- REPO: ok
REPO ->>+ PSQL: client.query(<br>INSERT_DEPARTMENT_SQL, [id, name, startDate,<br>endDate, notes, keywords, image])
PSQL -->>- REPO: result (rowCount)

alt department created (rowCount > 0)
    REPO ->>+ PSQL: client.query(COMMIT)
    PSQL -->>- REPO: ok
else department not created (rowCount = 0)
    REPO ->>+ PSQL: client.query(ROLLBACK)
    PSQL -->>- REPO: ok
end

REPO -->>- SERV: void
SERV -->>- CTRL: void
CTRL -->> API_CLI: 201 Created (JSON Response)
deactivate CTRL
```

## Process Logic

1. **API Client**: Sends the Request with a JSON body containing the new department's fields, including its _id_.
1. **Controller**: Receives the Request, extracts the _repositoryType_ from the query string, and maps the request body to a Department via _bodyToDepartment_, validating that it contains an _id_ (otherwise **400 Bad Request** is returned).
1. **Service**: Acts as an orchestrator, delegating to _postgreSQLDepartmentRepository.createDepartment_ based on the passed type. No numeric range validation of the _id_ is performed here, since the _id_ originates from the validated request body.
1. **Repository**: Uses the PostgreSQL Pool to acquire a client and, within a transaction, executes the parameterized `INSERT_DEPARTMENT_SQL` statement.
   - If the insert affects a row (`rowCount > 0`), the transaction is committed.
   - If no row is inserted (`rowCount = 0`, e.g. a conflicting _id_), the transaction is rolled back and the method returns without throwing.
   - Any database error (for example a constraint violation) is caught, the transaction is rolled back, and a `RepositoryException` is thrown, which the Controller forwards to the error-handling middleware via `next(error)`.
1. **Database**: Executes the `INSERT` statement and returns the affected row count to the repository.
1. **Controller**: Returns **201 Created** once the repository call completes without throwing — as with the update flow, the repository does not surface a "not created" condition, so the response does not differ based on whether a row was actually inserted.

---
