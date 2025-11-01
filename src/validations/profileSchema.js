import * as z from 'zod';

// Helper function to validate YYYY-MM-DD
const isValidDate = (dateString) => {
  if (!dateString) return true; // Cho phép rỗng/null
  if (
    typeof dateString !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}$/.test(dateString)
  ) {
    return false;
  }
  const date = new Date(dateString);
  // Kiểm tra ngày hợp lệ (vd: 2025-02-30 là sai)
  return !isNaN(date.getTime()) && date.toISOString().startsWith(dateString);
};

// SỬA LỖI: Export schema với tên đúng và logic đúng
export const profileSchema = z
  .object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email('Invalid email format').min(1, 'Email is required'),
    dob: z
      .string()
      .refine(isValidDate, { message: 'Invalid date format' })
      .nullable(),
    city: z.string().nullable(),
    // Logic upload mới: avatarUrl là một string (URL) và có thể null
    avatarUrl: z.string().url('Invalid URL').nullable(),
    password: z
      .string()
      .min(6, 'Password must be at least 6 characters')
      .optional()
      .or(z.literal('')), // Cho phép chuỗi rỗng
    confirmPassword: z
      .string()
      .min(6, 'Password must be at least 6 characters')
      .optional()
      .or(z.literal(''))
  })
  .refine(
    (data) => {
      // Nếu nhập password, thì confirmPassword phải khớp
      if (data.password) {
        return data.password === data.confirmPassword;
      }
      return true; // Bỏ qua nếu không nhập password
    },
    {
      message: 'Passwords do not match',
      path: ['confirmPassword'] // Lỗi sẽ hiển thị ở trường confirmPassword
    }
  );

// Giữ lại các schema cũ của bạn
export const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required')
});

export const registerSchema = z
  .object({
    username: z.string().min(4, 'Username must be at least 4 characters'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z
      .string()
      .min(6, 'Confirm Password must be at least 6 characters'),
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email('Invalid email format'),
    dob: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date of birth must be in YYYY-MM-DD format')
      .refine(isValidDate, { message: 'Invalid date provided' }),
    city: z.string().optional()
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword']
  });