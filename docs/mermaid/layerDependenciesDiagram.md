# Layers Dependencies

``` mermaid
flowchart LR
RTNG[Routing\n Layer]:::mistyroseBox
CTRL[Controller\n Layer]:::honeydewBox
SERV[Service\n Layer]:::lightcyanBox
REPO[Repository\n Layer]:::cornsilkBox
POOL[Pool\n Layer]:::bisqueBox

RTNG --> CTRL --> SERV --> REPO --> POOL

%% Style Definitions
classDef mistyroseBox fill: mistyrose, stroke: black
classDef honeydewBox fill: honeydew, stroke: black
classDef lightcyanBox fill: lightcyan, stroke: black
classDef cornsilkBox fill: cornsilk, stroke: black
classDef bisqueBox  fill: bisque, stroke: black
```
