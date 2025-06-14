import { Request, Response, NextFunction } from 'express';

export class ApiError extends Error {
  public status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
    
    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  error: Error | ApiError | any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let status = 500;
  let message = 'Internal Server Error';
  let stack: string | undefined;

  if (error instanceof ApiError) {
    status = error.status;
    message = error.message;
  } else if (error instanceof Error) {
    message = error.message;
  }

  // Include stack trace in development mode
  if (process.env.NODE_ENV === 'development' && error instanceof Error) {
    stack = error.stack;
  }

  const errorResponse: any = {
    error: {
      message,
      status
    }
  };

  if (stack) {
    errorResponse.error.stack = stack;
  }

  res.status(status).json(errorResponse);
};