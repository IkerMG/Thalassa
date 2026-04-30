import { z } from 'zod';

/** Same regex as backend RegisterRequest / ResetPasswordRequest */
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
const PASSWORD_MSG = 'Min. 8 characters, at least one letter and one number';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  username: z.string().min(1, 'Username is required').max(50, 'Max 50 characters'),
  email: z.string().email('Invalid email address').max(100, 'Max 100 characters'),
  password: z.string().regex(PASSWORD_REGEX, PASSWORD_MSG),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const resetPasswordSchema = z
  .object({
    newPassword: z.string().regex(PASSWORD_REGEX, PASSWORD_MSG),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
