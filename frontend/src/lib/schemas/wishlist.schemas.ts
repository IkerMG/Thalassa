import { z } from 'zod';

export const wishlistAddSchema = z.object({
  productName: z.string().min(1, 'Nombre requerido').max(200, 'Máximo 200 caracteres'),
  price: z.coerce
    .number({ invalid_type_error: 'Debe ser un número' })
    .min(0, 'Mínimo 0')
    .default(0),
  productUrl: z.string().max(500).optional().or(z.literal('')),
  storeName: z.string().max(100).optional().or(z.literal('')),
  category: z.enum(['EQUIPMENT', 'LIVESTOCK', 'SUPPLEMENT', 'OTHER']).nullable().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM'),
  notes: z.string().max(500, 'Máximo 500 caracteres').optional().or(z.literal('')),
});

export type WishlistAddFormValues = z.infer<typeof wishlistAddSchema>;

export const wishlistEditSchema = z.object({
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM'),
  notes: z.string().max(500, 'Máximo 500 caracteres').optional().or(z.literal('')),
});

export type WishlistEditFormValues = z.infer<typeof wishlistEditSchema>;
