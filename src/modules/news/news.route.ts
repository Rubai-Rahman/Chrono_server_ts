import express from 'express';
import { NewsController } from './news.controller';

const router = express.Router();

// Public routes - no authentication required
router.get('/', NewsController.getAllNews);

export const NewsRoutes = router;
