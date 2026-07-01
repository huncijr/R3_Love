// Custom error class for operational errors with an HTTP status code
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}
// Logs the error with context and rethrows it for upstream handling
export function errorHandler(error: unknown): never {
  if (error instanceof AppError) {
    console.error(`[OPERATIONAL ERROR ${error.statusCode}] ${error.message}`);
  } else if (error instanceof Error) {
    console.error(`[UNEXPECTED ERROR] ${error.message}`);
  } else {
    console.error("[UNKNOWN ERROR", error);
  }
  throw error;
}
