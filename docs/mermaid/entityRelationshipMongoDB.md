# MongoDB Logical Schema Diagram

```mermaid
erDiagram
direction LR
%% Entities
    DEP["collection: departments"] {
        int id "ID"
        string name "name"
        date startDate "start date"
        date endDate "end date"
        string notes "notes"
        string_array keywords "keywords"
        string image "image"
    }
    EMP["collection: employees"] {
        int id "ID"
        int departmentId "department ID"
        string firstName "first name"
        string lastName "last name"
        string title "title"
        string phone "phone"
        string mail "mail"
        string streetName "street name"
        string houseNumber "house number"
        string postalCode "postal code"
        string locality "locality"
        string province "province"
        string country "country"
    }
%% Relationships 
    DEP ||--o{ EMP: employs
%%  Styles
    style DEP stroke:orange
```

> [!NOTE]
> MongoDB collections store BSON documents.
> Even though it is schema-less, the diagram represents the logical structure of the `departments` and `employees` collections.
