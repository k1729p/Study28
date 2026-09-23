# Update Department Sequence Diagram

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
Note over CTRL, PSQL: Process: Update department by ID (PostgreSQL Flow)

API_CLI ->>+ CTRL: PATCH<br>/departments/:id?repositoryType=POSTGRESQL<br>Body: Department (JSON)

CTRL ->>+ SERV: updateDepartment(<br>repositoryType, department)
SERV ->>+ REPO: updateDepartment(<br>department)
REPO ->>+ POOL: connect()
POOL -->>- REPO: client
REPO ->>+ PSQL: client.query(BEGIN)
PSQL -->>- REPO: ok
REPO ->>+ PSQL: client.query(<br>UPDATE_DEPARTMENT_SQL, [name, startDate,<br>endDate, notes, keywords, image, id])
PSQL -->>- REPO: result (rowCount)

alt department found (rowCount > 0)
    REPO ->>+ PSQL: client.query(COMMIT)
    PSQL -->>- REPO: ok

    loop for each employee in department.employees
        REPO ->>+ POOL: connect()
        POOL -->>- REPO: client
        REPO ->>+ PSQL: client.query(BEGIN)
        PSQL -->>- REPO: ok
        REPO ->>+ PSQL: client.query(<br>UPDATE_EMPLOYEE_DEPARTMENT_SQL,<br>[employee.departmentId, employee.id])
        PSQL -->>- REPO: result (rowCount)
        alt employee updated (rowCount > 0)
            REPO ->>+ PSQL: client.query(COMMIT)
            PSQL -->>- REPO: ok
        else employee not updated (rowCount = 0)
            REPO ->>+ PSQL: client.query(ROLLBACK)
            PSQL -->>- REPO: ok
        end
    end
else department not found (rowCount = 0)
    REPO ->>+ PSQL: client.query(ROLLBACK)
    PSQL -->>- REPO: ok
end

REPO -->>- SERV: void
SERV -->>- CTRL: void
CTRL -->> API_CLI: 204 No Content (JSON Response)
deactivate CTRL
```

## Process Logic

1. **API Client**: Sends the Request (for example **curl**) with a JSON body containing the department's _id_ and the fields to be updated.
1. **Controller**: Receives the Request, extracts the _repositoryType_ from the query string, and maps the request body to a Department via _bodyToDepartment_, validating that it contains an _id_ (otherwise **400 Bad Request** is returned).
1. **Service**: Acts as an orchestrator, delegating to _postgreSQLDepartmentRepository.updateDepartment_ based on the passed type. Unlike the read/delete flows, no numeric range validation of the _id_ is performed here, since the _id_ originates from the validated request body.
1. **Repository**: Uses the PostgreSQL Pool to acquire a client and, within a transaction, executes the parameterized `UPDATE_DEPARTMENT_SQL` statement.
   - If no row matches the _id_ (`rowCount = 0`), the transaction is rolled back and the method returns without touching any employees.
   - If the department row is updated (`rowCount > 0`), the transaction is committed, and then, for each employee currently on the Department object, a **separate** transaction is opened to execute `UPDATE_EMPLOYEE_DEPARTMENT_SQL`, re-assigning that employee's _departmentId_, committing or rolling back per employee independently.
1. **Database**: Executes the statements and returns the affected row counts to the repository.
1. **Controller**: Returns **204 No Content** in all cases where a well-formed body was supplied — the repository does not surface a "not found" condition, so the response does not differ based on whether the department actually existed.

---
