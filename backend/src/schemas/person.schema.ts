import { z } from 'zod';

export const personSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().max(100).optional(),
  birthDate: z.string().optional(),
  deathDate: z.string().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  bio: z.string().optional()
});