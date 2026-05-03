import { z } from 'zod';

export const aquariumCreateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Max 100 characters'),
  liters: z.coerce
    .number({ invalid_type_error: 'Must be a number' })
    .int('Must be a whole number')
    .min(1, 'Minimum 1 liter'),
  type: z.enum(['REEF', 'FISH_ONLY', 'MIXED']),
});

export type AquariumCreateFormValues = z.infer<typeof aquariumCreateSchema>;
