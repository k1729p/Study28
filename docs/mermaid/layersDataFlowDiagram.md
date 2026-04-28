# Layers Data Flow

``` mermaid
sequenceDiagram
box mistyrose
participant RTNG as Routing<br>Layer
end
box honeydew
participant CTRL as Controller<br>Layer
end
box lightcyan
participant SERV as Service<br>Layer
end
box cornsilk
participant REPO as Repository<br>Layer
end
box bisque
participant POOL as Pool<br>Layer
end

RTNG ->> CTRL: Routes<br>Request
CTRL ->> SERV: Validates &<br>Delegates
SERV ->> REPO: Business Logic /<br>DB Choice
REPO ->> POOL: Executes<br>Query
POOL -->> REPO: Returns<br>Data
REPO -->> SERV: Returns<br>Entity/Result
SERV -->> CTRL: Returns<br>Processed Data
CTRL -->> RTNG: Returns<br>JSON Response
```
