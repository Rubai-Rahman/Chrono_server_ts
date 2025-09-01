import express from 'express';
import { CommentController } from './comments.controller';
import { authMiddleware } from '@middleware/auth.middleware';
import { commentMutationSchema } from './comments.validation';
import { validateRequest } from '@middleware/validateRequest';

const router = express.Router();

router.get('/:id', CommentController.getCommentsByNewsId);

// Using type assertion to handle the type mismatch
router.post(
  '/:newsId',
  authMiddleware as express.RequestHandler,
  validateRequest(commentMutationSchema) as express.RequestHandler,
  CommentController.postComment as unknown as express.RequestHandler
);

export const CommentRoutes = router;
