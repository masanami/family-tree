import { Router, Request, Response } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { PersonService } from '../services/personService';

const router = Router();
const personService = new PersonService();

// Validation middleware
const handleValidationErrors = (req: Request, res: Response, next: Function): Response | void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// GET /api/persons - Get all persons
router.get('/', async (_req: Request, res: Response): Promise<Response | void> => {
  try {
    const persons = await personService.getAllPersons();
    res.json(persons);
  } catch (error) {
    console.error('Error fetching persons:', error);
    res.status(500).json({ error: 'Failed to fetch persons' });
  }
});

// GET /api/persons/search - Search persons
router.get('/search',
  query('q').notEmpty().withMessage('Search query is required'),
  handleValidationErrors,
  async (req: Request, res: Response): Promise<Response | void> => {
    try {
      const searchTerm = req.query.q as string;
      const persons = await personService.searchPersons(searchTerm);
      res.json(persons);
    } catch (error) {
      console.error('Error searching persons:', error);
      res.status(500).json({ error: 'Failed to search persons' });
    }
  }
);

// GET /api/persons/:id - Get person by ID
router.get('/:id',
  param('id').isUUID().withMessage('Invalid person ID'),
  handleValidationErrors,
  async (req: Request, res: Response): Promise<Response | void> => {
    try {
      const person = await personService.getPersonById(req.params.id);
      if (!person) {
        return res.status(404).json({ error: 'Person not found' });
      }
      res.json(person);
    } catch (error) {
      console.error('Error fetching person:', error);
      res.status(500).json({ error: 'Failed to fetch person' });
    }
  }
);

// POST /api/persons - Create new person
router.post('/',
  body('first_name').notEmpty().trim().withMessage('First name is required'),
  body('last_name').notEmpty().trim().withMessage('Last name is required'),
  body('middle_name').optional().trim(),
  body('birth_date').optional().isISO8601().toDate(),
  body('death_date').optional().isISO8601().toDate(),
  body('gender').optional().trim(),
  body('birth_place').optional().trim(),
  body('death_place').optional().trim(),
  body('occupation').optional().trim(),
  body('biography').optional().trim(),
  handleValidationErrors,
  async (req: Request, res: Response): Promise<Response | void> => {
    try {
      const person = await personService.createPerson(req.body);
      res.status(201).json(person);
    } catch (error) {
      console.error('Error creating person:', error);
      res.status(500).json({ error: 'Failed to create person' });
    }
  }
);

// PUT /api/persons/:id - Update person
router.put('/:id',
  param('id').isUUID().withMessage('Invalid person ID'),
  body('first_name').optional().notEmpty().trim(),
  body('last_name').optional().notEmpty().trim(),
  body('middle_name').optional().trim(),
  body('birth_date').optional().isISO8601().toDate(),
  body('death_date').optional().isISO8601().toDate(),
  body('gender').optional().trim(),
  body('birth_place').optional().trim(),
  body('death_place').optional().trim(),
  body('occupation').optional().trim(),
  body('biography').optional().trim(),
  handleValidationErrors,
  async (req: Request, res: Response): Promise<Response | void> => {
    try {
      const person = await personService.updatePerson(req.params.id, req.body);
      if (!person) {
        return res.status(404).json({ error: 'Person not found' });
      }
      res.json(person);
    } catch (error) {
      console.error('Error updating person:', error);
      res.status(500).json({ error: 'Failed to update person' });
    }
  }
);

// DELETE /api/persons/:id - Delete person
router.delete('/:id',
  param('id').isUUID().withMessage('Invalid person ID'),
  handleValidationErrors,
  async (req: Request, res: Response): Promise<Response | void> => {
    try {
      const deleted = await personService.deletePerson(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: 'Person not found' });
      }
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting person:', error);
      res.status(500).json({ error: 'Failed to delete person' });
    }
  }
);

export default router;