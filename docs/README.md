<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
</head>

<body>
  <img alt="" src="images/WORK-IN-PROGRESS.png" />

  <a href="https://github.com/k1729p/Study28/tree/main/docs" title="View Study28 docs on GitHub">
    <img alt="Color scheme for Study28 project" src="images/ColorScheme.png" height="25" width="800" />
  </a>
  <h2 id="contents">Study28 README Contents</h2>
  <hr>
  <pre>
Work-In-Progress temporary notes, fixes, and todos:

#################################################################################

Express: https://expressjs.com/

Start application in Visual Studio Code TERMINAL tab:
  npm run build ;npm run start
#################################################################################
JSON:API specification. Updating Resources: https://jsonapi.org/format/#crud-updating

'PATCH' Request – Updating Part of a Resource
	Used when you want to update only a subset of fields in a resource.
	Used when you want to improve the performance by minimizing the data payload.

'PUT'   Request – Replacing an Entire Resource
	Used when the resource’s identity is clear, and its data needs to be fully refreshed.
#################################################################################
 DATABASES DATABASES DATABASES DATABASES DATABASES DATABASES DATABASES DATABASES
#################################################################################
===  Cassandra DATABASE  ===
https://en.wikipedia.org/wiki/Apache_Cassandra
Docker compose: https://github.com/kayvansol/Cassandra

In Docker container "cassandra-1", in "Exec" tab:
  cqlsh
Commands to execute in 'cqlsh' console:
  create keyspace if not exists company with replication = { 'class' : 'SimpleStrategy', 'replication_factor' : '1' };
  create table if not exists company.departments (
        id int primary key, name text, last_update_timestamp timestamp);
  insert into company.departments
      (id, name, last_update_timestamp) values (1, 'abc', totimestamp(now()));
  insert into company.departments
      (id, name, last_update_timestamp) values (2, 'xyz', totimestamp(now()));
  select id, name, last_update_timestamp from company.departments;
  exit;
#################################################################################
===  MongoDB DATABASE  ===

In Docker container "mongodb", in "Exec" tab:
  mongosh mongodb://docker:mongopw@mongodb
Commands to execute in 'mongosh' console:
  use kp_database
  db.departments.insertOne( {id:1, name:'abc'} )
  db.departments.find( {id:1} )
  db.employees.insertMany( [ {id:1, name:'klm'},{id:2, name:'xyz'}] )
  db.employees.find()
  db.departments.deleteMany({})
  db.employees.deleteMany({})
  exit
#################################################################################
===  MySQL DATABASE (ORACLE) ===
https://www.baeldung.com/ops/docker-mysql-container

In Docker container "postgresql", in "Exec" tab:
  mysql --host=mysql --user=root --password='mikimiki' --execute='select 12345 from dual;'
#################################################################################
===  MS SQLServer DATABASE  ===
https://learn.microsoft.com/en-us/sql/linux/quickstart-install-connect-docker?view=sql-server-ver17&tabs=cli&pivots=cs1-cmd

In Docker container "postgresql", in "Exec" tab:
  /opt/mssql-tools18/bin/sqlcmd -S mssql -No -U sa -P ABab1234 -Q "select 12345"
#################################################################################
===  PostgreSQL DATABASE  ===
https://node-postgres.com/ <----- node.js modules for interfacing with PostgreSQL database

https://www.docker.com/blog/how-to-use-the-postgres-docker-official-image/
https://www.npmjs.com/package/pg
https://dopebase.com/blog/angular-postgresql-building-full-stack-app
https://www.tembo.io/docs/getting-started/postgres_guides/connecting-to-postgres-with-nodejs

In Docker container "postgresql", in "Exec" tab:
  export PGPASSWORD='mikimiki'; psql --host=postgresql --username=postgres --command='select 12345'
#################################################################################
===  Redis DATABASE  ===
https://redis.io/docs/latest/develop/tools/cli/

In Docker container "redis", in "Exec" tab:
  redis-cli
Commands to execute in 'redis-cli' console:
  INCR mycounter
#################################################################################
#################################################################################
#################################################################################
CockroachDB versus Apache Cassandra:
  https://hackernoon.com/cockroachdb-vs-apache-cassandra-choosing-the-right-distributed-database-for-your-use-case

#################################################################################
Neo4j is the world's leading graph database, with native graph storage and processing. 
https://hub.docker.com/_/neo4j
#################################################################################

Installing 'node-postgres' - PostgreSQL client for Node.js:
   ??? npm install --save-dev pg
   ??? npm i --save-dev @types/express
   ??? npm i --save-dev @types/pg

#################################################################################
Docker compose - in compose.yaml file   
#### database management tool written in PHP
adminer:
  container_name: adminer
  image: adminer
  ports:
    - 8080:8080 ??????????
  networks:
    - app-net
  restart: always
#################################################################################
  </pre>
  <hr>
</body>

</html>
