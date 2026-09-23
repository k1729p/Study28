# Delete Department Sequence Diagram

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
Note over CTRL, PSQL: Process: Delete department by ID (PostgreSQL Flow)

API_CLI ->>+ CTRL: DELETE<br>/departments/:id?repositoryType=POSTGRESQL

CTRL ->>+ SERV: deleteDepartment(<br>repositoryType, id)
SERV ->>+ REPO: deleteDepartment(<br>id)
REPO ->>+ POOL: connect()
POOL -->>- REPO: client
REPO ->>+ PSQL: client.query(BEGIN)
PSQL -->>- REPO: ok
REPO ->>+ PSQL: client.query(<br>CALL_DELETE_DEPARTMENT_AND_EMPLOYEES_SQL, [id])
Note right of PSQL: Stored procedure deletes employees<br>of the department, then the department row
PSQL -->>- REPO: ok
REPO ->>+ PSQL: client.query(COMMIT)
PSQL -->>- REPO: ok

REPO -->>- SERV: void
SERV -->>- CTRL: void
CTRL -->> API_CLI: 204 No Content (JSON Response)
deactivate CTRL
```

## Process Logic

1. **API Client**: Sends the Request (for example **curl**).
1. **Controller**: Receives the Request, extracts the _repositoryType_ from the query string and the _id_ from the route parameter, validating that it is a numeric value (otherwise **400 Bad Request** is returned).
1. **Service**: Acts as an orchestrator, delegating to _postgreSQLDepartmentRepository.deleteDepartment_ based on the passed type, after validating that the _id_ is an integer within the allowed range.
1. **Repository**: Uses the PostgreSQL Pool to acquire a client and, within a transaction, calls the `delete_department_and_employees` stored procedure via `CALL_DELETE_DEPARTMENT_AND_EMPLOYEES_SQL`. The procedure first deletes every employee referencing the department, then deletes the department row itself, and the transaction is committed. No row-count check is performed, so the call succeeds whether or not a department with that _id_ existed.
1. **Database**: Executes the deletes inside the stored procedure.
1. **Controller**: Returns **204 No Content** unconditionally once the repository call completes without error.

---
