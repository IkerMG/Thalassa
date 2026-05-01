import { z } from 'zod';

const optionalPositiveFloat = z.preprocess(
  (v) => (v === '' || v == null ? undefined : v),
  z.coerce.number({ invalid_type_error: 'Must be a number' }).min(0, 'Must be 0 or greater').optional()
);

export const measurementLogSchema = z.object({
  temperature: optionalPositiveFloat,
  salinity: optionalPositiveFloat,
  ph: optionalPositiveFloat,
  alkalinityDKH: optionalPositiveFloat,
  calciumPPM: optionalPositiveFloat,
  magnesiumPPM: optionalPositiveFloat,
  nitratesPPM: optionalPositiveFloat,
  phosphatesPPM: optionalPositiveFloat,
});

export type MeasurementLogFormValues = z.infer<typeof measurementLogSchema>;
