import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';

/**
 * A minimal replica of the application's global error-handling middleware (see server.ts).
 * Registered, in controller tests, after the route(s) under test so that an error thrown by a
 * mocked service - and forwarded via `next(error)` from within the controller - results in the
 * same response the real Express application would produce.
 * @param err the error object
 * @param req the request object
 * @param res the response object
 * @param next the next middleware function
 */
export function testErrorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json('Internal Server Error');
}
