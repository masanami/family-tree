import { Router, Request, Response } from 'express';
import { validate } from '../middleware/validation';
import { personSchema } from '../schemas/person.schema';

export class PersonRoutes {
  private treePersonsRouter: Router;
  private personRouter: Router;
  
  constructor() {
    this.treePersonsRouter = Router({ mergeParams: true });
    this.personRouter = Router();
    this.initializeRoutes();
  }
  
  private initializeRoutes(): void {
    // Routes for /api/family-trees/:treeId/persons
    this.treePersonsRouter.get('/', this.getPersonsByTreeId);
    this.treePersonsRouter.post('/', validate(personSchema), this.createPerson);
    
    // Routes for /api/persons
    this.personRouter.get('/:id', this.getPersonById);
    this.personRouter.put('/:id', validate(personSchema), this.updatePerson);
    this.personRouter.delete('/:id', this.deletePerson);
  }
  
  public getTreePersonsRouter(): Router {
    return this.treePersonsRouter;
  }
  
  public getPersonRouter(): Router {
    return this.personRouter;
  }
  
  private getPersonsByTreeId = async (req: Request, res: Response): Promise<void> => {
    try {
      const { treeId } = req.params;
      
      // TODO: Check if family tree exists
      if (treeId === '999') {
        res.status(404).json({
          error: {
            message: 'Family tree not found',
            status: 404
          }
        });
        return;
      }
      
      // TODO: Implement database query
      const persons: any[] = [];
      
      res.status(200).json({
        data: persons,
        total: persons.length
      });
    } catch (error) {
      res.status(500).json({
        error: {
          message: 'Failed to fetch persons',
          status: 500
        }
      });
    }
  };
  
  private createPerson = async (req: Request, res: Response): Promise<void> => {
    try {
      const { treeId } = req.params;
      const { firstName, lastName, birthDate, gender } = req.body;
      
      // TODO: Check if family tree exists
      if (treeId === '999') {
        res.status(404).json({
          error: {
            message: 'Family tree not found',
            status: 404
          }
        });
        return;
      }
      
      // TODO: Implement database insert
      const newPerson = {
        id: Date.now().toString(),
        familyTreeId: treeId,
        firstName,
        lastName,
        birthDate,
        gender,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      res.status(201).json({
        data: newPerson
      });
    } catch (error) {
      res.status(500).json({
        error: {
          message: 'Failed to create person',
          status: 500
        }
      });
    }
  };
  
  private getPersonById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      // TODO: Implement database query
      if (id === '999') {
        res.status(404).json({
          error: {
            message: 'Person not found',
            status: 404
          }
        });
        return;
      }
      
      const person = {
        id,
        familyTreeId: '1',
        firstName: 'John',
        lastName: 'Doe',
        birthDate: '1990-01-01',
        gender: 'male',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      res.status(200).json({
        data: person
      });
    } catch (error) {
      res.status(500).json({
        error: {
          message: 'Failed to fetch person',
          status: 500
        }
      });
    }
  };
  
  private updatePerson = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { firstName, lastName, birthDate } = req.body;
      
      // TODO: Implement database update
      if (id === '999') {
        res.status(404).json({
          error: {
            message: 'Person not found',
            status: 404
          }
        });
        return;
      }
      
      const updatedPerson = {
        id,
        firstName,
        lastName,
        birthDate,
        updatedAt: new Date().toISOString()
      };
      
      res.status(200).json({
        data: updatedPerson
      });
    } catch (error) {
      res.status(500).json({
        error: {
          message: 'Failed to update person',
          status: 500
        }
      });
    }
  };
  
  private deletePerson = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      // TODO: Implement database delete
      if (id === '999') {
        res.status(404).json({
          error: {
            message: 'Person not found',
            status: 404
          }
        });
        return;
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({
        error: {
          message: 'Failed to delete person',
          status: 500
        }
      });
    }
  };
}

export default new PersonRoutes();