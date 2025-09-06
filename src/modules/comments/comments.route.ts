import express from 'express';
import { CommentController } from './comments.controller';
import {
  commentMutationSchema,
  commentReactionSchema,
  commentUpdateSchema,
} from './comments.validation';
import { validateRequest } from '@middleware/validateRequest';

const router = express.Router();

router.get('/:id', CommentController.getCommentsByNewsId);

// Using type assertion to handle the type mismatch
router.post(
  '/:newsId',
  // authMiddleware as express.RequestHandler,
  validateRequest(commentMutationSchema) as express.RequestHandler,
  CommentController.postComment as unknown as express.RequestHandler,
);
router.put(
  '/:commentId',
  // authMiddleware as express.RequestHandler,
  validateRequest(commentUpdateSchema) as express.RequestHandler,
  CommentController.updateComment as unknown as express.RequestHandler,
);

router.delete(
  '/:commentId',
  // authMiddleware as express.RequestHandler,
  CommentController.deleteComment as unknown as express.RequestHandler,
);
router.post(
  '/:commentId/react',
  // authMiddleware as express.RequestHandler,
  validateRequest(commentReactionSchema) as express.RequestHandler,
  CommentController.commentReaction as unknown as express.RequestHandler,
);

export const CommentRoutes = router;
