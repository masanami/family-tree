import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import { Server } from 'http';
import { errorHandler } from './middleware/error-handler';
import { DatabaseConnection } from './utils/database';
import familyTreeRoutes from './routes/family-tree.routes';
import personRoutes from './routes/person.routes';
import relationshipRoutes from './routes/relationship.routes';

export class App {
  private app: Application;
  private server: Server | undefined;
  private database: DatabaseConnection;
  private port: number;

  constructor() {
    this.app = express();
    this.port = parseInt(process.env.PORT || '3000', 10);
    this.database = new DatabaseConnection();
    
    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddleware(): void {
    // CORS configuration
    this.app.use(cors({
      origin: process.env.CORS_ORIGIN || '*',
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    }));

    // Body parsing middleware
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
  }

  private initializeRoutes(): void {
    const apiPrefix = process.env.API_PREFIX || '/api/v1';

    // Health check endpoint
    this.app.get(`${apiPrefix}/health`, (_req: Request, res: Response) => {
      res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      });
    });

    // API routes
    this.app.use(`${apiPrefix}/family-trees`, familyTreeRoutes);
    this.app.use(`${apiPrefix}/persons`, personRoutes);
    this.app.use(`${apiPrefix}/relationships`, relationshipRoutes);

    // 404 handler for undefined routes
    this.app.use((_req: Request, res: Response) => {
      res.status(404).json({
        error: {
          message: 'Route not found',
          status: 404
        }
      });
    });
  }

  private initializeErrorHandling(): void {
    this.app.use(errorHandler);
  }

  public async start(): Promise<void> {
    try {
      await this.database.connect();
      
      this.server = this.app.listen(this.port, () => {
        console.log(`Server is running on port ${this.port}`);
      });
    } catch (error) {
      console.error('Failed to start server:', error);
      throw error;
    }
  }

  public async stop(): Promise<void> {
    if (this.server) {
      await new Promise<void>((resolve) => {
        this.server!.close(() => resolve());
      });
    }
    
    await this.database.disconnect();
  }

  public getApp(): Application {
    return this.app;
  }

  public getServer(): Server {
    if (!this.server) {
      this.server = this.app.listen(0); // Listen on random port for testing
    }
    return this.server;
  }
}