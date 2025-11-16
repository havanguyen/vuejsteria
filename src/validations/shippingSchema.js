import * as z from 'zod';

export const shippingSchema = z.object({
  stress: z.string().min(1, 'Street address is required'),
  commune: z.string().min(1, 'District/Ward is required'),
  city: z.string().min(1, 'City/Province is required'),
  phone: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .regex(/^[0-9]+$/, 'Phone number must contain only digits'),
  note: z.string().optional()
});