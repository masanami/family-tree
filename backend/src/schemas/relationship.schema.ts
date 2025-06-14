import { z } from 'zod';

export const createRelationshipSchema = z.object({
  person1Id: z.string().min(1, 'person1Id is required'),
  person2Id: z.string().min(1, 'person2Id is required'),
  relationshipType: z.string().min(1, 'relationshipType is required')
});

export const relationshipParamsSchema = z.object({
  treeId: z.string().min(1, 'treeId is required')
});

export const relationshipQuerySchema = z.object({
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional()
});