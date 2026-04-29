# Transfer Controller Class Diagram

```mermaid
classDiagram
class TransferController {
  +transferService: TransferService
  +transferEmployees(req: Request, res: Response, next: NextFunction) Promise~void~
}
```

---
