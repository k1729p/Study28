# Chroma Logical Schema Diagram

```mermaid
erDiagram
direction LR
%% Entities
    DEP["collection: departments"] {
        string id "ID (Document ID)"
        string name "name"
        string startDate "start date (ISO string)"
        string endDate "end date (ISO string)"
        string notes "notes"
        string keywords "keywords (comma-separated)"
        string image "image"
    }
    EMP["collection: employees"] {
        string id "ID (Document ID)"
        int departmentId "departmentId"
        string firstName "firstName"
        string lastName "lastName"
        string title "title (enum string)"
        string phone "phone"
        string mail "mail"
        string streetName "streetName"
        string houseNumber "houseNumber"
        string postalCode "postalCode"
        string locality "locality"
        string province "province"
        string country "country"
    }
%% Relationships 
    DEP ||--o{ EMP: employs
%%  Styles
    style DEP stroke:orange