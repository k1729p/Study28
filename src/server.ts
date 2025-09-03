import express, { Request, Response, NextFunction, Router } from 'express';
import cors from 'cors';
import { config } from "./configuration/configuration.js";
import { pool } from "./repositories/postgresql/postgresql.pool.js";
import { DepartmentController } from './controllers/department.controller.js';
import { EmployeeController } from './controllers/employee.controller.js';
import { InitializationController } from './controllers/initialization.controller.js';
import { TransferController } from './controllers/transfer.controller.js';
import { RED_BRIGHT, RESET } from "./colors.js";

main();

/**
 * This is the main entry point of the application.
 */
function main() {
    const app = express();
    app.use(express.json());
    app.use(cors());
    app.use('/api/', createRouting());
    app.use(errorHandler);
    const server = app.listen(config.port, () => {
        console.log(`
╭────────────────────────────╮
│ ▀▄▀▄▀▄▀▄▀▄ Study 28 ▀▄▀▄▀▄▀▄▀▄ │
╰────────────────────────────╯`);
        console.log('main(): server is running on port[%s%d%s]', RED_BRIGHT, config.port, RESET);
    });
    const shutdown = async () => {
        server.close(async () => {
            try {
                await pool.end();
                console.log("main(): PostgreSQL pool closed");
                console.log("main(): shutdown completed");
                process.exit(0);
            } catch (err) {
                console.error("main(): error during shutdown:", err);
                process.exit(1);
            }
        });
    };
    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
}
/**
 * This function creates a new Router instance and sets up a basic route.
 * @returns Router
 */
function createRouting(): Router {
    const router = Router();
    const initializationController = new InitializationController();
    router.post('/load/', initializationController.loadInitialData);

    const departmentController = new DepartmentController();
    router.post('/departments/', departmentController.createDepartment);
    router.get('/departments/', departmentController.getDepartments);
    router.get('/departments/:id', departmentController.getDepartmentById);
    router.patch('/departments/:id', departmentController.updateDepartment);
    router.delete('/departments/:id', departmentController.deleteDepartment);

    const employeeController = new EmployeeController();
    router.post('/employees/', employeeController.createEmployee);
    router.get('/employees/', employeeController.getEmployees);
    router.get('/employees/:id', employeeController.getEmployeeById);
    router.patch('/employees/:id', employeeController.updateEmployee);
    router.delete('/employees/:id', employeeController.deleteEmployee);

    const transferController = new TransferController();
    router.post('/transfers/', transferController.transferEmployees);
    return router;
}
/**
 * Error handling middleware.
 * @param err - The error object.
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next middleware function.
 */
function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
    res.status(500).json('Internal Server Error');
    next(err);
    console.error("errorHandler():", err);
}
