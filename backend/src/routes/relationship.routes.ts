import { Router } from 'express';
import { RelationshipController } from '../controllers/relationship.controller';
import { RelationshipService } from '../services/relationship.service';
import { validate } from '../middleware/validation';

const router = Router();
const relationshipService = new RelationshipService();
const relationshipController = new RelationshipController(relationshipService);

// GET /api/v1/relationships
router.get('/', (_req, res) => {
  res.status(501).json({ error: { message: 'Not implemented', status: 501 } });
});

// POST /api/v1/relationships
router.post('/', (_req, res) => {
  res.status(501).json({ error: { message: 'Not implemented', status: 501 } });
});

// GET /api/v1/relationships/:id
router.get('/:id', (_req, res) => {
  res.status(501).json({ error: { message: 'Not implemented', status: 501 } });
});

// PUT /api/v1/relationships/:id
router.put('/:id',
  validate({
    params: {
      id: { required: true, type: 'string' }
    },
    body: {
      person1Id: { required: false, type: 'string' },
      person2Id: { required: false, type: 'string' },
      relationshipType: { required: false, type: 'string', minLength: 1 }
    }
  }),
  (req, res, next) => relationshipController.updateRelationship(req, res, next)
);

// DELETE /api/v1/relationships/:id
router.delete('/:id',
  validate({
    params: {
      id: { required: true, type: 'string' }
    }
  }),
  (req, res, next) => relationshipController.deleteRelationship(req, res, next)
);

export default router;