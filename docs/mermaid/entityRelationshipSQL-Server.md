# SQL Server Entity Relationship Diagram

```mermaid
erDiagram
direction LR
%% Entities
  DEP[departments] {
    int id PK "ID"
    nvarchar(40) name "name"
    date start_date "start date"
    date end_date "end date"
    nvarchar(MAX) notes "notes"
    nvarchar(MAX) keywords "keywords"
    nvarchar(255) image "image"
  }
  EMP[employees] {
    int id PK "ID"
    int department_id FK "department ID"
    nvarchar(40) first_name "first name"
    nvarchar(40) last_name "last name"
    nvarchar(40) title "title"
    nvarchar(30) phone "phone"
    nvarchar(80) mail "mail"
    nvarchar(80) street_name "street name"
    nvarchar(20) house_number "house number"
    nvarchar(20) postal_code "postal code"
    nvarchar(40) locality "locality"
    nvarchar(40) province "province"
    nvarchar(40) country "country"
  }
%% Relationships 
  DEP ||--o{ EMP: employs
%%  Styles
  style DEP stroke:orange
```
