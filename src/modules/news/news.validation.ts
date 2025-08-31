import { z } from 'zod';
import { ObjectId } from 'mongodb';
import httpStatus from 'http-status';
import AppError from '../../utils/AppError';

// Helper function to validate MongoDB ObjectId
const objectId = (value: string, msg: string) => {
  if (!ObjectId.isValid(value)) {
    throw new AppError(msg, httpStatus.BAD_REQUEST);
  }
  return value;
};

// Base news schema
const newsBaseSchema = {
  title: z.string().min(5).max(200),
  content: z.string().min(10),
  excerpt: z.string().max(500).optional(),
  img: z.string().url('Image must be a valid URL'),
  categories: z.array(z.string().min(1)).default([]),
  tags: z.array(z.string().min(1)).default([]),
  isPublished: z.boolean().default(false),
  publishedAt: z.date().optional(),
};

// Create news schema
export const createNewsSchema = z.object({
  body: z.object({
    ...newsBaseSchema,
    title: newsBaseSchema.title.refine(
      (val) => val.trim().length > 0,
      'Title cannot be empty',
    ),
  }),
});

// Update news schema
export const updateNewsSchema = z.object({
  body: z.object({
    title: z.string().min(5).max(200).optional(),
    content: z.string().min(10).optional(),
    excerpt: z.string().max(500).optional(),
    image: z.string().url('Image must be a valid URL').optional(),
    categories: z.array(z.string().min(1)).optional(),
    tags: z.array(z.string().min(1)).optional(),
    isPublished: z.boolean().optional(),
    publishedAt: z.date().optional(),
  }),
});

// Comment schema
export const commentSchema = z.object({
  body: z.object({
    text: z.string().min(1, 'Comment text is required'),
    parentCommentId: z
      .string()
      .refine(
        (val) => !val || ObjectId.isValid(val),
        'Invalid parent comment ID',
      )
      .optional(),
  }),
});

// Reaction schema
export const reactionSchema = z.object({
  body: z.object({
    reaction: z.enum(['like', 'dislike']),
  }),
});

// News query params schema
export const newsQuerySchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/, 'Page must be a number').default('1'),
    limit: z.string().regex(/^\d+$/, 'Limit must be a number').default('10'),
    category: z.string().optional(),
    tag: z.string().optional(),
    search: z.string().optional(),
    sortBy: z.string().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
  }),
});

// News params schema
export const newsParamsSchema = z.object({
  params: z.object({
    id: z.string().refine((val) => ObjectId.isValid(val), {
      message: 'Invalid news ID',
    }),
  }),
});

// Comment params schema
export const commentParamsSchema = z.object({
  params: z.object({
    commentId: z.string().refine((val) => ObjectId.isValid(val), {
      message: 'Invalid comment ID',
    }),
  }),
});

export type CreateNewsInput = z.infer<typeof createNewsSchema>;
export type UpdateNewsInput = z.infer<typeof updateNewsSchema>;
export type CommentInput = z.infer<typeof commentSchema>;
export type ReactionInput = z.infer<typeof reactionSchema>;
export type NewsQuery = z.infer<typeof newsQuerySchema>['query'];
