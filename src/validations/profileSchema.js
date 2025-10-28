import * as z from 'zod';
import { isValid as isDateValid, parseISO } from 'date-fns';

const isValidDateFn = (dateString) => {
  if (!dateString) return true;
  if (typeof dateString !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return false;
  const date = parseISO(dateString);
  return isDateValid(date);
};

export const profileUpdateSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email format').optional().nullable().or(z.literal('')),
  dob: z.string()
       .nullable()
       .optional()
       .refine(val => !val || /^\d{4}-\d{2}-\d{2}$/.test(val), { message: 'Date must be in YYYY-MM-DD format or empty' })
       .refine(val => !val || isValidDateFn(val), { message: 'Invalid date provided' }),
  city: z.string().optional().nullable().or(z.literal('')),
  password: z.string().min(6, 'Password must be at least 6 characters').or(z.literal('')).optional().nullable(),
});

export const profileUpdateWithPasswordSchema = profileUpdateSchema.extend({
  confirmPassword: z.string().optional().nullable().or(z.literal('')),
}).refine(data => {
  if (data.password && data.password.length > 0) {
    return data.password === data.confirmPassword;
  }
  return true;
}, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export const activeProfileSchema = profileUpdateWithPasswordSchema;