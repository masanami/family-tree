import { Router } from 'express';
import { RelationshipController } from '../controllers/relationship.controller';
import { RelationshipService } from '../services/relationship.service';
import { validate } from '../middleware/validation';

const router = Router();
const relationshipService = new RelationshipService();
const relationshipController = new RelationshipController(relationshipService);

// GET /api/v1/family-trees
router.get('/', (_req, res) => {
  res.status(501).json({ error: { message: 'Not implemented', status: 501 } });
});

// POST /api/v1/family-trees
router.post('/', (_req, res) => {
  res.status(501).json({ error: { message: 'Not implemented', status: 501 } });
});

// GET /api/v1/family-trees/:id
router.get('/:id', (_req, res) => {
  res.status(501).json({ error: { message: 'Not implemented', status: 501 } });
});

// PUT /api/v1/family-trees/:id
router.put('/:id', (_req, res) => {
  res.status(501).json({ error: { message: 'Not implemented', status: 501 } });
});

// DELETE /api/v1/family-trees/:id
router.delete('/:id', (_req, res) => {
  res.status(501).json({ error: { message: 'Not implemented', status: 501 } });
});

// GET /api/v1/family-trees/:treeId/relationships
router.get('/:treeId/relationships', 
  validate({
    params: {
      treeId: { required: true, type: 'string' }
    },
    query: {
      page: { required: false, type: 'number', min: 1 },
      limit: { required: false, type: 'number', min: 1, max: 100 }
    }
  }),
  (req, res, next) => relationshipController.getRelationshipsByFamilyTree(req, res, next)
);

// POST /api/v1/family-trees/:treeId/relationships
router.post('/:treeId/relationships',
  validate({
    params: {
      treeId: { required: true, type: 'string' }
    },
    body: {
      person1Id: { required: true, type: 'string' },
      person2Id: { required: true, type: 'string' },
      relationshipType: { required: true, type: 'string', minLength: 1 }
    }
  }),
  (req, res, next) => relationshipController.createRelationship(req, res, next)
);

export default router;