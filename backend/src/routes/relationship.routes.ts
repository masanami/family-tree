import { Router } from 'express';

const router = Router();

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
router.put('/:id', (_req, res) => {
  res.status(501).json({ error: { message: 'Not implemented', status: 501 } });
});

// DELETE /api/v1/relationships/:id
router.delete('/:id', (_req, res) => {
  res.status(501).json({ error: { message: 'Not implemented', status: 501 } });
});

export default router;