import { z } from 'zod';

// Schema for TUser
const UserValidationSchema = z.object({
  name: z.string({ message: 'User name must be string' }),
  email: z.string().email({ message: 'Email is required' }),
  isActive: z.boolean().optional().default(true),
  photoUrl: z.string().optional(),
  rememberMe: z.boolean().optional().default(false),
  role: z.enum(['admin', 'user']).optional().default('user'),
});

export { UserValidationSchema };
