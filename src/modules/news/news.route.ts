import express from 'express';
import { NewsController } from './news.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { 
  createNewsSchema, 
  updateNewsSchema, 
  commentSchema, 
  reactionSchema, 
  newsParamsSchema,
  commentParamsSchema
} from './news.validation';
import { validateRequest } from '../../middleware/validateRequest';

const router = express.Router();

// Public routes - no authentication required
router.get('/', NewsController.getAllNews);
router.get(
  '/:id',
  validateRequest(newsParamsSchema),
  NewsController.getNewsById
);

// Protected routes - require authentication
router.post(
  '/',
  authMiddleware,
  validateRequest(createNewsSchema),
  NewsController.createNews
);

router.put(
  '/:id',
  authMiddleware,
  validateRequest(updateNewsSchema),
  validateRequest(newsParamsSchema),
  NewsController.updateNews
);

router.delete(
  '/:id',
  authMiddleware,
  validateRequest(newsParamsSchema),
  NewsController.deleteNews
);

// Comment routes
router.post(
  '/:newsId/comments',
  authMiddleware,
  validateRequest(newsParamsSchema),
  validateRequest(commentSchema),
  NewsController.addComment
);

router.post(
  '/comments/:commentId/react',
  authMiddleware,
  validateRequest(commentParamsSchema),
  validateRequest(reactionSchema),
  NewsController.reactToComment
);

export const NewsRoutes = router;
