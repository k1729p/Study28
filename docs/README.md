# Study28 README Contents

![wip](images/WORK-IN-PROGRESS.png)

[![Color scheme for Study28 project](images/ColorScheme.png)](https://github.com/k1729p/Study28/tree/main/docs "View Study28 docs on GitHub")

## Research on server and databases

Project sections:

1. [Business Logic](#-business-logic)
2. [Docker Build](#-docker-build-and-test)
3. [Local Build and Test](#-local-build-and-test)

---

## ❶ Business Logic

![greenCircle](images/greenCircle.png) 1.1. Links to diagrams.

![greenCircle](images/greenCircle.png) 1.2. The **Node.js** **Express** server.

Databases:

- **PostgreSQL** database
- **MongoDB** database

| :--- | :--- | :--- |
| PostgreSQL tables | departments | employees |
| MongoDB collections | departments | employees |


![greenCircle](images/greenCircle.png) 1.3. The TypeScript, HTML, and CSS sources are located in the directory [src/app](https://github.com/k1729p/Study28/blob/main/src/app).

![aquaHR](images/aquaHR-500.png)

<details>
<summary>'App' section:</summary>

- AppComponent
  [app.component.ts](https://github.com/k1729p/Study28/blob/main/src/app/app.component.ts)
- Routes
  [app.routes.ts](https://github.com/k1729p/Study28/blob/main/src/app/app.routes.ts)

</details>

![aquaHR](images/aquaHR-500.png)

[Back to the top of the page](#Study28-readme-contents)

---

## ❷ Docker Build and Test

Action: \
 ![orangeHR](images/orangeHR-500.png) \
 ![orangeSqr](images/orangeSquare.png) 1. Use the batch file ["01 Express on Docker build and run.bat"](https://github.com/k1729p/Study28/blob/main/0_batch/01 Express%20on%20Docker%20build%20and%20run.bat) 
to build the images and start the containers. \
 ![orangeSqr](images/orangeSquare.png) 2. Use "02 CURL on Docker init DB.bat". \
 ![orangeSqr](images/orangeSquare.png) 3. Use "03 CURL on Docker CRUD.bat". \
 ![orangeHR](images/orangeHR-500.png)

![greenCircle](images/greenCircle.png) 2.1. **Docker** images are built using the following files:

- [Dockerfile](https://github.com/k1729p/Study28/blob/main/docker-config/Dockerfile)
- [compose.yaml](https://github.com/k1729p/Study28/blob/main/docker-config/compose.yaml)

[Back to the top of the page](#Study28-readme-contents)

---

## ❸ Local Build and Test

Action: \
 ![orangeHR](images/orangeHR-500.png) \
 ![orangeSqr](images/orangeSquare.png) 1. Use the batch file ["02 Angular on local build and run.bat"](https://github.com/k1729p/Study28/blob/main/0_batch/02%20Angular%20on%20local%20build%20and%20run.bat)
to build and start the local application. \
 ![orangeSqr](images/orangeSquare.png) 2. Use "05 CURL on local init DB.bat". \
 ![orangeSqr](images/orangeSquare.png) 3. Use "06 CURL on local CRUD.bat". \
 ![orangeHR](images/orangeHR-500.png)

![greenCircle](images/greenCircle.png) 3.1. See the screenshots showing the results of the CURL tests.

[Back to the top of the page](#Study28-readme-contents)

---

## Links

| Resource | Description |
| :--- | :--- |
| [Express](https://expressjs.com/) | Server. |

---

## Acronyms

| Acronym | Meaning |
| :--- | :--- |

[Back to the top of the page](#Study28-readme-contents)

---
