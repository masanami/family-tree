import { Router } from 'express';

const router = Router();

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

export default router;