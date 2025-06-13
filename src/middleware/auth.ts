import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

// In-memory storage for invalidated tokens
// In production, this would be Redis or similar
const invalidatedTokens = new Set<string>();

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'No token provided' });
    return;
  }

  const token = authHeader.substring(7);

  if (invalidatedTokens.has(token)) {
    res.status(401).json({ error: 'Token has been invalidated' });
    return;
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as {
      userId: string;
      email: string;
    };

    req.user = {
      userId: decoded.userId,
      email: decoded.email
    };

    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

export const invalidateToken = (token: string): void => {
  invalidatedTokens.add(token);
};

export const isTokenInvalidated = (token: string): boolean => {
  return invalidatedTokens.has(token);
};

export const clearInvalidatedTokens = (): void => {
  invalidatedTokens.clear();
};