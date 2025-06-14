import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

export const validate = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: {
            message: 'Validation failed',
            status: 400,
            details: error.errors
          }
        });
        return;
      }
      
      res.status(500).json({
        error: {
          message: 'Internal server error',
          status: 500
        }
      });
    }
  };
};