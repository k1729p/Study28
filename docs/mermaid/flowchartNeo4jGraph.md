#  Neo4j Database Graph

```mermaid
flowchart
%% Node Definitions
    D1(Department)
    D2(Department)
    D3(Department)
    E11((Employee))
    E12((Employee))
    E21((Employee))
    E22((Employee))
    E31((Employee))
    E32((Employee))
%% Node Relationships
    E11 -- WORKS_IN --> D1
    E12 -- WORKS_IN --> D1
    E21 -- WORKS_IN --> D2
    E22 -- WORKS_IN --> D2
    E31 -- WORKS_IN --> D3
    E32 -- WORKS_IN --> D3
%% Node Subgraphs    
    subgraph Departments and Employees
        direction LR
        subgraph Front Offices
            direction TB
            dep01[name: 1st Front Office] --- D1
            emp11[firstName: John\n lastName: Doe] --- E11
            emp12[firstName: Brett\n lastName: Boe] --- E12
        end
        subgraph Middle Offices
            direction TB
            dep02[name: 1st Middle Office] --- D2
            emp21[firstName: Vince\n lastName: Voe] --- E21
            emp22[firstName: William\n lastName: Woe] --- E22
        end
        subgraph Back Offices
            direction TB
            dep03[name: 1st Back Office] --- D3
            emp31[firstName: John\n lastName: Noakes] --- E31
            emp32[firstName: Mary\n lastName: Major] --- E32
        end
    end
%% Styling
    style E11 fill: lightpink, stroke: #333, stroke-width: 2px
    style E12 fill: lightpink, stroke: #333, stroke-width: 2px
    style E21 fill: lightgreen, stroke: #333, stroke-width: 2px
    style E22 fill: lightgreen, stroke: #333, stroke-width: 2px
    style E31 fill: lightblue, stroke: #333, stroke-width: 2px
    style E32 fill: lightblue, stroke: #333, stroke-width: 2px
    style D1 fill: #ff6666, stroke: #333, stroke-width: 2px
    style D2 fill: #00ff00, stroke: #333, stroke-width: 2px
    style D3 fill: cyan, stroke: #333, stroke-width: 2px
```

- **Department**
  - node label: Department
  - node property: name
- **Employee**
  - node label: Employee
  - node property: firstName
  - node property: lastName

Relationship type between **Employee** and **Department**: **WORKS_IN**

---
