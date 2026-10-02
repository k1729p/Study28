# Transfer Employees Sequence Diagram

```mermaid
sequenceDiagram
box aliceblue Client Layer
  participant API_CLI@{ "type": "actor" } as API Client
end
box honeydew Controller Layer
  participant CTRL@{ "type": "boundary" } as TransferController
end
box cornsilk Service Layer
  participant SERV@{ "type": "control" } as TransferService
end
box bisque Repository Layer
  participant REPO as PostgreSqlTransfer
  participant POOL as Pool<br>(postgresql.pool.js)
end
box mistyrose Database Layer
  participant PSQL@{ "type" : "database" } as PostgreSQL
end

autonumber 1
Note over CTRL, PSQL: Process: Transfer employees (PostgreSQL Flow)

API_CLI ->>+ CTRL: POST<br>/transfers/?repositoryType=POSTGRESQL<br>Body: {sourceDepartmentId, targetDepartmentId,<br>employeeIds} (JSON)

CTRL ->>+ SERV: transferEmployees(<br>repositoryType, sourceDepartmentId,<br>targetDepartmentId, employeeIds)
SERV ->>+ REPO: transferEmployees(<br>sourceDepartmentId, targetDepartmentId, employeeIds)
REPO ->>+ POOL: connect()
POOL -->>- REPO: client
REPO ->>+ PSQL: client.query(BEGIN)
PSQL -->>- REPO: ok
REPO ->>+ PSQL: client.query(<br>CALL_TRANSFER_EMPLOYEES_SQL,<br>[sourceDepartmentId, targetDepartmentId, employeeIds])
Note right of PSQL: Stored procedure transfer_employees updates<br>department_id to targetDepartmentId for every<br>employee whose id = ANY(employeeIds) AND whose<br>current department_id = sourceDepartmentId
PSQL -->>- REPO: ok
REPO ->>+ PSQL: client.query(COMMIT)
PSQL -->>- REPO: ok

REPO -->>- SERV: void
SERV -->>- CTRL: void
CTRL -->> API_CLI: 204 No Content (JSON Response)
deactivate CTRL
```

## Process Logic

1. **API Client**: Sends the Request with a JSON body containing _sourceDepartmentId_, _targetDepartmentId_, and an _employeeIds_ array.
1. **Controller**: Receives the Request, extracts the _repositoryType_ from the query string (defaulting to `PostgreSQL`), and reads _sourceDepartmentId_, _targetDepartmentId_, and _employeeIds_ from the body, validating that both department ids are truthy and that _employeeIds_ is a non-empty array (otherwise **400 Bad Request** is returned for whichever check fails first).
1. **Service**: Acts as an orchestrator. It resolves the strategy for the given _repositoryType_, throwing a `ReferenceError` if none is implemented. It then validates that both _sourceDepartmentId_ and _targetDepartmentId_ are integers between 1 and `MAX_INT_32`, and that the size of _employeeIds_ does not exceed `MAX_BATCH_EMPLOYEE_IDS` (otherwise a `RangeError` is thrown). If _employeeIds_ is empty, or _sourceDepartmentId_ equals _targetDepartmentId_, the Service logs a warning and returns immediately without calling the repository — there is nothing to transfer. Otherwise it delegates to _postgreSqlTransfer.transferEmployees_.
1. **Repository**: Uses the PostgreSQL Pool to acquire a client and, within a transaction, calls the `transfer_employees` stored procedure via the parameterized `CALL_TRANSFER_EMPLOYEES_SQL` statement, passing _sourceDepartmentId_, _targetDepartmentId_, and _employeeIds_. The transaction is then committed.
   - No row-count check is performed, so the call succeeds whether or not any employee actually matched the source department and id list.
   - Any database error (for example a constraint violation) is caught, the transaction is rolled back, and a `RepositoryException` is thrown, which the Controller forwards to the error-handling middleware via `next(error)`.
1. **Database**: Executes the stored procedure call, re-assigning matching employees to the target department, inside the transaction.
1. **Controller**: Returns **204 No Content** once the repository call completes without throwing. This also covers the Service's "nothing to transfer" short-circuit cases (empty _employeeIds_, or source and target department being the same), which resolve silently without reaching the Repository.

---
