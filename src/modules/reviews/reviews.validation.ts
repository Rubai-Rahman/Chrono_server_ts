import { z } from 'zod';

export const reviewBaseSchema = {
  name: z.string().min(3).max(100),
  comment: z.string().min(10).max(1000),
  img: z.string().url(),
  location: z.string().optional(),
  verified: z.boolean().optional(),
  rating: z.number().min(1).max(5).optional(),
};
