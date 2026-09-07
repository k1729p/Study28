/**
 * Thee repository exception options.
 */
export interface RepositoryExceptionOptions {
  cause?: unknown;
  operation?: string;
}
/**
 * The repository exception.
 */
export class RepositoryException extends Error {
  public readonly operation?: string;
  /**
   * The repository exception constructor.
   * 
   * @param message the message
   * @param options the repository exception options
   */
  constructor(message: string, options?: RepositoryExceptionOptions) {
    super(message, { cause: options?.cause }); // native ES2022 `cause` support
    this.name = 'RepositoryException';
    this.operation = options?.operation;
    Object.setPrototypeOf(this, RepositoryException.prototype);
  }
}