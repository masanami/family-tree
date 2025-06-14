import { z } from 'zod';

export const familyTreeSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  description: z.string().optional(),
  createdBy: z.string().optional()
});