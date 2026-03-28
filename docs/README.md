# Study28 README Contents

![wip](images/WORK-IN-PROGRESS.png)

[![Color scheme for Study28 project](images/ColorScheme.png)](https://github.com/k1729p/Study28/tree/main/docs "View Study28 docs on GitHub")

## Research on Express web framework and databases

Project sections:

1. [Business Logic](#-business-logic)
2. [Docker Build and Test](#-docker-build-and-test)
3. [Local Build and Test](#-local-build-and-test)

---

## ❶ Business Logic

![flowchart](images/ScreenshotFlowchartBusinessLogic.jpg)

![greenCircle](images/greenCircle.png) 1.1. Links to diagrams.

- [Sequence diagram](https://github.com/k1729p/Study28/blob/main/docs/mermaid/sequenceDiagram.md)
  for "Create Department" process with PostgreSQL Database.
- [Class diagram](https://github.com/k1729p/Study28/blob/main/docs/mermaid/classDiagram.md)
  for  models: Department, Employee, and Title.

![greenCircle](images/greenCircle.png) 1.2. The **Node.js** **Express** server.

![greenCircle](images/greenCircle.png) 1.3. The data stores.

- PostgreSQL
- MongoDB

![greenCircle](images/greenCircle.png) 1.4. The TypeScript sources are located in the directory [src](https://github.com/k1729p/Study28/blob/main/src).

![aquaHR](images/aquaHR-500.png)

- [server.ts](https://github.com/k1729p/Study28/blob/main/src/server.ts)

<details>
<summary>'Controllers' section:</summary>

- directory [controllers](https://github.com/k1729p/Study28/blob/main/src/controllers)
  - DepartmentController
    [department.controller.ts](https://github.com/k1729p/Study28/blob/main/src/controllers/department.controller.ts)
  - EmployeeController
    [employee.controller.ts](https://github.com/k1729p/Study28/blob/main/src/controllers/employee.controller.ts)
  - InitializationController
    [initialization.controller.ts](https://github.com/k1729p/Study28/blob/main/src/controllers/initialization.controller.ts)
  - TransferController
    [transfer.controller.ts](https://github.com/k1729p/Study28/blob/main/src/controllers/transfer.controller.ts)

</details>
<details>
<summary>'Models' section:</summary>

- directory [models](https://github.com/k1729p/Study28/blob/main/src/models)
  - Department
    [department.ts](https://github.com/k1729p/Study28/blob/main/src/models/department.ts)
  - Employee
    [employee.ts](https://github.com/k1729p/Study28/blob/main/src/models/employee.ts)
  - Title
    [title.ts](https://github.com/k1729p/Study28/blob/main/src/models/title.ts)

</details>
<details>
<summary>'Services' section:</summary>

- directory [services](https://github.com/k1729p/Study28/blob/main/src/services)
  - DepartmentService
    [department.service.ts](https://github.com/k1729p/Study28/blob/main/src/services/department.service.ts)
  - EmployeeService
    [employee.service.ts](https://github.com/k1729p/Study28/blob/main/src/services/employee.service.ts)
  - InitializationService
    [initialization.service.ts](https://github.com/k1729p/Study28/blob/main/src/services/initialization.service.ts)
  - TransferService
    [transfer.service.ts](https://github.com/k1729p/Study28/blob/main/src/services/transfer.service.ts)

</details>
<details>
<summary>'Repositories' section:</summary>

- directory [repositories/mongodb](https://github.com/k1729p/Study28/blob/main/src/repositories/mongodb)
  - MongoDbDepartmentRepository
    [mongodb.department.repository.ts](https://github.com/k1729p/Study28/blob/main/src/repositories/mongodb/mongodb.department.repository.ts)
  - MongoDbEmployeeRepository
    [mongodb.employee.repository.ts](https://github.com/k1729p/Study28/blob/main/src/repositories/mongodb/mongodb.employee.repository.ts)
- directory [repositories/postgresql](https://github.com/k1729p/Study28/blob/main/src/repositories/postgresql)
  - PostgreSQLDepartmentRepository
    [postgresql.department.repository.ts](https://github.com/k1729p/Study28/blob/main/src/repositories/postgresql/postgresql.department.repository.ts)
  - PostgreSQLEmployeeRepository
    [postgresql.employee.repository.ts](https://github.com/k1729p/Study28/blob/main/src/repositories/postgresql/postgresql.employee.repository.ts)

</details>

![aquaHR](images/aquaHR-500.png)

[Back to the top of the page](#study28-readme-contents)

---

## ❷ Docker Build and Test

Action: \
 ![orangeHR](images/orangeHR-500.png) \
 ![orangeSqr](images/orangeSquare.png) 1. Use
  ["01 Express on Docker build and run.bat"](https://github.com/k1729p/Study28/blob/main/0_batch/01%20Express%20on%20Docker%20build%20and%20run.bat)
  to build the images and start the containers. \
 ![orangeSqr](images/orangeSquare.png) 2. Use
  ["02 CURL on Docker init DB.bat"](https://github.com/k1729p/Study28/blob/main/0_batch/02%20CURL%20on%20Docker%20init%20DB.bat)
  to initialize database. \
 ![orangeSqr](images/orangeSquare.png) 3. Use
  ["03 CURL on Docker CRUD.bat"](https://github.com/k1729p/Study28/blob/main/0_batch/03%20CURL%20on%20Docker%20CRUD.bat)
  to create, read, update, and delete departments and employees. \
 ![orangeHR](images/orangeHR-500.png)

![greenCircle](images/greenCircle.png) 2.1. **Docker** images are built using the following files:

- [Dockerfile](https://github.com/k1729p/Study28/blob/main/docker-config/Dockerfile)
- [compose.yaml](https://github.com/k1729p/Study28/blob/main/docker-config/compose.yaml)

![greenCircle](images/greenCircle.png) 2.2. The [screenshot](images/ScreenshotCurlOnDockerInitDB.png)
of the console log from the run of the batch file "**02 CURL on Docker init DB.bat**" with **PostgreSQL** selected.

![greenCircle](images/greenCircle.png) 2.3. The [screenshot](images/ScreenshotCurlOnDockerCRUD.png)
of the console log from the run of the batch file "**03 CURL on Docker CRUD.bat**" with **PostgreSQL** selected.

[Back to the top of the page](#study28-readme-contents)

---

## ❸ Local Build and Test

Action: \
 ![orangeHR](images/orangeHR-500.png) \
 ![orangeSqr](images/orangeSquare.png) 1. Use
  ["04 Express on local build and run.bat"](https://github.com/k1729p/Study28/blob/main/0_batch/04%20Express%20on%20local%20build%20and%20run.bat)
  to build and start the local application. \
 ![orangeSqr](images/orangeSquare.png) 2. Use
  ["05 CURL on local init DB.bat"](https://github.com/k1729p/Study28/blob/main/0_batch/05%20CURL%20on%20local%20init%20DB.bat)
  to initialize database. \
 ![orangeSqr](images/orangeSquare.png) 3. Use
  ["06 CURL on local CRUD.bat"](https://github.com/k1729p/Study28/blob/main/0_batch/06%20CURL%20on%20local%20CRUD.bat)
  to create, read, update, and delete departments and employees. \
 ![orangeHR](images/orangeHR-500.png)

![greenCircle](images/greenCircle.png) 3.1. See the screenshots showing the results of the cURL tests.

[Back to the top of the page](#study28-readme-contents)

---

## Data Stores

| Name | Type | Storage Abstraction | Query Language |
| :--- | :--- | :--- | :--- |
| ✔️PostgreSQL | Relational | Table | SQL |
| ❌MySQL | Relational | Table | SQL |
| ❌SQL Server | Relational | Table | T-SQL |
| ❌Oracle | Relational | Table | PL/SQL |
| ✔️MongoDB | Document Store | Collection | MQL (MongoDB Query Language) |
| ❌Redis | Key-Value / Cache | Hash / String | RESP (Redis Serialization Protocol) |
| ❌Cassandra | Columnar | Table | CQL (Cassandra Query Language) |
| ❌Neo4j | Graph Database | Node / Relationship | Cypher |
| ❌Chroma | Vector Database | Collection | Chroma API (Python/JS Client) |

## Links

| Resource | Description |
| :--- | :--- |
| [Node.js](https://nodejs.org/en/) | JavaScript runtime environment |
| [Express](https://expressjs.com/) | Web framework for Node.js |
| [PostgreSQL](https://www.postgresql.org/) | Relational database |
| [MongoDB Atlas](https://www.mongodb.com/products/platform/atlas-database) | Document-oriented database |

---

## Acronyms

| Acronym | Meaning |
| :--- | :--- |

[Back to the top of the page](#study28-readme-contents)

---
