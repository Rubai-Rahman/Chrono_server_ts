import express from 'express';
import { NewsController } from './news.controller';

const router = express.Router();

// Public routes - no authentication required
router.get('/', NewsController.getAllNews);
router.get('/:id', NewsController.getNewsById);

export const NewsRoutes = router;
