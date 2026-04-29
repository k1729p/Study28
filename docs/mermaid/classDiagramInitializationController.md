# Initialization Controller Class Diagram

```mermaid

classDiagram
  class InitializationController {
    +InitializationService initializationService
    +loadInitialData(req: Request, res: Response, next: NextFunction) Promise~void~
  }
```

---
