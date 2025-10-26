import * as z from 'zod';

const isValidDate = (dateString) => {
  if (!dateString) return true;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return false;

  const parts = dateString.split('-');
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);

  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    !isNaN(date.getTime()) &&
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
};


export const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  username: z.string().min(4, 'Username must be at least 4 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Confirm Password must be at least 6 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  dob: z.string()
       .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date of birth must be in YYYY-MM-DD format')
       .refine(isValidDate, { message: 'Invalid date provided' }),
  city: z.string().optional(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});