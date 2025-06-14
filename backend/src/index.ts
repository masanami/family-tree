import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { FamilyTreeRoutes } from './routes/family-tree.routes';
import { PersonRoutes } from './routes/person.routes';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    message: 'Family Tree Backend is running',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (_req: Request, res: Response) => {
  res.json({
    message: 'Welcome to Family Tree API',
    version: '1.0.0'
  });
});

// API Routes
const familyTreeRoutes = new FamilyTreeRoutes();
const personRoutes = new PersonRoutes();

app.use('/api/family-trees', familyTreeRoutes.router);
app.use('/api/family-trees/:treeId/persons', personRoutes.getTreePersonsRouter());
app.use('/api/persons', personRoutes.getPersonRouter());

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Health check available at http://localhost:${PORT}/health`);
});

export default app;