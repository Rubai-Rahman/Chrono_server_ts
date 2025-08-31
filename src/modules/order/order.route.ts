import express from 'express';
import { OrderController } from './order.controller';
import { authMiddleware } from '@middleware/auth.middleware';

const router = express.Router();

router.post('/', authMiddleware, OrderController.postOrder);

export const OrderRoutes = router;
