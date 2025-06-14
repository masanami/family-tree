import { Request, Response, NextFunction } from 'express';
import { RelationshipService } from '../services/relationship.service';

export class RelationshipController {
  constructor(private relationshipService: RelationshipService) {}

  async getRelationshipsByFamilyTree(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { treeId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await this.relationshipService.getByFamilyTree(treeId, page, limit);
      
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async createRelationship(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { treeId } = req.params;
      const relationshipData = req.body;

      const created = await this.relationshipService.create(treeId, relationshipData);
      
      res.status(201).json({ data: created });
    } catch (error) {
      next(error);
    }
  }

  async updateRelationship(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const updated = await this.relationshipService.update(id, updateData);
      
      res.status(200).json({ data: updated });
    } catch (error) {
      next(error);
    }
  }

  async deleteRelationship(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      await this.relationshipService.delete(id);
      
      res.sendStatus(204);
    } catch (error) {
      next(error);
    }
  }
}