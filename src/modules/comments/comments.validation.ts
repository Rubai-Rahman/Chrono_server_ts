import { z } from 'zod';

// First, create a base schema without the recursive part
const BaseCommentSchema = z.object({
  _id: z.string().optional(),
  newsId: z.string().min(1, 'News ID is required'),
  user: z.string().min(1, 'User is required'),
  message: z.string().min(1, 'Message is required'),
  date: z.string().optional(),
  parentId: z.string().optional(),
  replyCount: z.number().optional(),
  likes: z.number().optional(),
  dislikes: z.number().optional(),
  userReaction: z.enum(['like', 'dislike', 'remove']).optional(),
  isDeleted: z.boolean().optional(),
  updatedAt: z.string().optional(),
  isEdited: z.boolean().optional(),
});

// Then create the full schema with the recursive type
type CommentType = z.infer<typeof BaseCommentSchema> & {
  replies?: CommentType[];
};

// Finally, create the schema with the proper type
export const CommentSchema: z.ZodType<CommentType> = BaseCommentSchema.extend({
  replies: z.lazy(() => z.array(CommentSchema)).optional(),
});

export const commentMutationSchema = z.object({
  message: z.string().min(1, 'Message is required'),
  parentId: z.string().nullable().optional(),
});

export const commentUpdateSchema = z.object({
  message: z.string().min(1, 'Message is required'),
});

export const commentReactionSchema = z.object({
  reaction: z.enum(['like', 'dislike', 'remove']),
});
