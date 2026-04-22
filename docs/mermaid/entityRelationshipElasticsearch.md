# Elasticsearch Logical Schema Diagram

```mermaid
erDiagram
direction LR
%% Entities
    DEP["index: departments"] {
        integer id "ID"
        text name "name"
        date startDate "start date"
        date endDate "end date"
        text notes "notes"
        text_array keywords "keywords"
        text image "image"
    }
    EMP["index: employees"] {
        integer id "ID"
        integer departmentId "department ID"
        text firstName "first name"
        text lastName "last name"
        text title "title"
        text phone "phone"
        text mail "mail"
        text streetName "street name"
        text houseNumber "house number"
        text postalCode "postal code"
        text locality "locality"
        text province "province"
        text country "country"
    }
%% Relationships 
    DEP ||--o{ EMP: employs
%%  Styles
    style DEP stroke:orange
```

> [!NOTE]
> Elasticsearch stores documents in indices.
