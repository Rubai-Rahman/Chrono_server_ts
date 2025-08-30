import express from 'express';
import { reviewsController } from './reviews.controller';

const router = express.Router();

router.get('/', reviewsController.getAllReviews);

export const ReviewRoutes = router;
