import { Request, Response, NextFunction } from 'express';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

export function createRateLimiter(
  windowMs: number = 15 * 60 * 1000, // 15 minutes
  maxRequests: number = 5
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const key = `${req.ip}:${req.path}`;
    const now = Date.now();
    
    const entry = rateLimitStore.get(key);
    
    if (!entry || entry.resetTime < now) {
      rateLimitStore.set(key, {
        count: 1,
        resetTime: now + windowMs
      });
      next();
      return;
    }
    
    if (entry.count >= maxRequests) {
      res.status(429).json({
        error: 'Too many requests, please try again later'
      });
      return;
    }
    
    entry.count++;
    next();
  };
}

// Clean up old entries periodically
let cleanupInterval: NodeJS.Timeout | null = null;

if (process.env.NODE_ENV !== 'test') {
  cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
      if (entry.resetTime < now) {
        rateLimitStore.delete(key);
      }
    }
  }, 60 * 1000); // Clean up every minute
}

export function clearRateLimitStore(): void {
  rateLimitStore.clear();
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
    cleanupInterval = null;
  }
}