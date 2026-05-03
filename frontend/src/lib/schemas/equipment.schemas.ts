import { z } from 'zod';

export const equipmentSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Max 100 characters'),
  powerWatts: z.coerce
    .number({ invalid_type_error: 'Must be a number' })
    .int('Must be a whole number')
    .min(1, 'Minimum 1 W'),
  hoursPerDay: z.coerce
    .number({ invalid_type_error: 'Must be a number' })
    .min(0.1, 'Minimum 0.1 hours')
    .max(24, 'Maximum 24 hours'),
  category: z.enum(['LIGHT', 'PUMP', 'SKIMMER', 'HEATER', 'OTHER']).optional(),
});

export type EquipmentFormValues = z.infer<typeof equipmentSchema>;
