import { z } from 'zod';

export const livestockSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Max 100 characters'),
  category: z.enum(['FISH', 'CORAL', 'INVERTEBRATE']),
  reefSafe: z.boolean(),
  quantity: z.coerce
    .number({ invalid_type_error: 'Must be a number' })
    .int('Must be a whole number')
    .min(1, 'Minimum 1'),
  speciesCatalogId: z.number().nullable().optional(),
});

export type LivestockFormValues = z.infer<typeof livestockSchema>;
