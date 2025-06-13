import { Router, Request, Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import { RelationshipService } from '../services/relationshipService';

const router = Router();
const relationshipService = new RelationshipService();

// Validation middleware
const handleValidationErrors = (req: Request, res: Response, next: Function): Response | void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// GET /api/relationships - Get all relationships
router.get('/', async (_req: Request, res: Response): Promise<Response | void> => {
  try {
    const relationships = await relationshipService.getAllRelationships();
    res.json(relationships);
  } catch (error) {
    console.error('Error fetching relationships:', error);
    res.status(500).json({ error: 'Failed to fetch relationships' });
  }
});

// GET /api/relationships/:id - Get relationship by ID
router.get('/:id',
  param('id').isUUID().withMessage('Invalid relationship ID'),
  handleValidationErrors,
  async (req: Request, res: Response): Promise<Response | void> => {
    try {
      const relationship = await relationshipService.getRelationshipById(req.params.id);
      if (!relationship) {
        return res.status(404).json({ error: 'Relationship not found' });
      }
      res.json(relationship);
    } catch (error) {
      console.error('Error fetching relationship:', error);
      res.status(500).json({ error: 'Failed to fetch relationship' });
    }
  }
);

// GET /api/relationships/person/:personId - Get all relationships for a person
router.get('/person/:personId',
  param('personId').isUUID().withMessage('Invalid person ID'),
  handleValidationErrors,
  async (req: Request, res: Response): Promise<Response | void> => {
    try {
      const relationships = await relationshipService.getPersonRelationships(req.params.personId);
      res.json(relationships);
    } catch (error) {
      console.error('Error fetching person relationships:', error);
      res.status(500).json({ error: 'Failed to fetch person relationships' });
    }
  }
);

// GET /api/relationships/person/:personId/children - Get children of a person
router.get('/person/:personId/children',
  param('personId').isUUID().withMessage('Invalid person ID'),
  handleValidationErrors,
  async (req: Request, res: Response): Promise<Response | void> => {
    try {
      const children = await relationshipService.getChildren(req.params.personId);
      res.json({ children });
    } catch (error) {
      console.error('Error fetching children:', error);
      res.status(500).json({ error: 'Failed to fetch children' });
    }
  }
);

// GET /api/relationships/person/:personId/parents - Get parents of a person
router.get('/person/:personId/parents',
  param('personId').isUUID().withMessage('Invalid person ID'),
  handleValidationErrors,
  async (req: Request, res: Response): Promise<Response | void> => {
    try {
      const parents = await relationshipService.getParents(req.params.personId);
      res.json({ parents });
    } catch (error) {
      console.error('Error fetching parents:', error);
      res.status(500).json({ error: 'Failed to fetch parents' });
    }
  }
);

// GET /api/relationships/person/:personId/siblings - Get siblings of a person
router.get('/person/:personId/siblings',
  param('personId').isUUID().withMessage('Invalid person ID'),
  handleValidationErrors,
  async (req: Request, res: Response): Promise<Response | void> => {
    try {
      const siblings = await relationshipService.getSiblings(req.params.personId);
      res.json({ siblings });
    } catch (error) {
      console.error('Error fetching siblings:', error);
      res.status(500).json({ error: 'Failed to fetch siblings' });
    }
  }
);

// GET /api/relationships/person/:personId/spouses - Get spouses of a person
router.get('/person/:personId/spouses',
  param('personId').isUUID().withMessage('Invalid person ID'),
  handleValidationErrors,
  async (req: Request, res: Response): Promise<Response | void> => {
    try {
      const spouses = await relationshipService.getSpouses(req.params.personId);
      res.json({ spouses });
    } catch (error) {
      console.error('Error fetching spouses:', error);
      res.status(500).json({ error: 'Failed to fetch spouses' });
    }
  }
);

// POST /api/relationships - Create new relationship
router.post('/',
  body('person1_id').isUUID().withMessage('Invalid person1_id'),
  body('person2_id').isUUID().withMessage('Invalid person2_id'),
  body('relationship_type').isIn(['parent-child', 'spouse', 'sibling'])
    .withMessage('Invalid relationship type'),
  body('start_date').optional().isISO8601().toDate(),
  body('end_date').optional().isISO8601().toDate(),
  body().custom((value) => {
    if (value.person1_id === value.person2_id) {
      throw new Error('Cannot create relationship between the same person');
    }
    return true;
  }),
  handleValidationErrors,
  async (req: Request, res: Response): Promise<Response | void> => {
    try {
      const relationship = await relationshipService.createRelationship(req.body);
      res.status(201).json(relationship);
    } catch (error: any) {
      console.error('Error creating relationship:', error);
      if (error.message === 'One or both persons do not exist') {
        return res.status(400).json({ error: error.message });
      }
      if (error.message === 'This relationship already exists') {
        return res.status(409).json({ error: error.message });
      }
      res.status(500).json({ error: 'Failed to create relationship' });
    }
  }
);

// PUT /api/relationships/:id - Update relationship (only dates)
router.put('/:id',
  param('id').isUUID().withMessage('Invalid relationship ID'),
  body('start_date').optional().isISO8601().toDate(),
  body('end_date').optional().isISO8601().toDate(),
  handleValidationErrors,
  async (req: Request, res: Response): Promise<Response | void> => {
    try {
      const relationship = await relationshipService.updateRelationship(
        req.params.id,
        req.body
      );
      if (!relationship) {
        return res.status(404).json({ error: 'Relationship not found' });
      }
      res.json(relationship);
    } catch (error) {
      console.error('Error updating relationship:', error);
      res.status(500).json({ error: 'Failed to update relationship' });
    }
  }
);

// DELETE /api/relationships/:id - Delete relationship
router.delete('/:id',
  param('id').isUUID().withMessage('Invalid relationship ID'),
  handleValidationErrors,
  async (req: Request, res: Response): Promise<Response | void> => {
    try {
      const deleted = await relationshipService.deleteRelationship(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: 'Relationship not found' });
      }
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting relationship:', error);
      res.status(500).json({ error: 'Failed to delete relationship' });
    }
  }
);

export default router;