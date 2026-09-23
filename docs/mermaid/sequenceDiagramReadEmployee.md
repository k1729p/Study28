# Read Employee Sequence Diagram

```mermaid
sequenceDiagram
    autonumber
    actor Client
    participant Express as Express Router
    participant Controller as EmployeeController
    participant Service as EmployeeService
    participant Repo as PostgreSqlEmployeeRepository
    participant DB as PostgreSQL Database

    Client->>Express: GET /api/employees/:id
    Express->>Controller: getEmployeeById(req, res, next)
    
    Controller->>Service: getEmployeeById(id)
    Service->>Repo: findById(id)
    Repo->>DB: query(SELECT * FROM employee WHERE id = $1, [id])
    
    alt Employee Found
        DB-->>Repo: QueryResult (1 row)
        Repo-->>Service: Employee
        Service-->>Controller: Employee
        Controller->>Controller: mapToEmployeeResponseDto(employee)
        Controller-->>Express: HTTP 200 OK (EmployeeResponseDto)
        Express-->>Client: HTTP 200 OK JSON
    else Employee Not Found
        DB-->>Repo: QueryResult (0 rows)
        Repo-->>Service: null / undefined
        Service-->>Controller: throws NotFoundError ("Employee not found")
        Controller-->>Express: next(error)
        Express-->>Client: HTTP 404 Not Found JSON
    end
```
