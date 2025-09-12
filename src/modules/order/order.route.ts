import express from 'express';
import { OrderController } from './order.controller';
import { authMiddleware } from '@middleware/auth.middleware';
import { orderSchema } from './order.validation';
import { validateRequest } from '@middleware/validateRequest';

const router = express.Router();

router.post(
  '/create',
  authMiddleware,
  validateRequest(orderSchema) as express.RequestHandler,
  OrderController.postOrder,
);

router.get('/all', authMiddleware, OrderController.getOrders);

export const OrderRoutes = router;
