import express, { Request, Response, NextFunction, RequestHandler } from 'express';
import { OrderController } from './order.controller';
import { authMiddleware, AuthRequest } from '../../middleware/auth.middleware';
import { validateRequest } from '../../middleware/validateRequest';
import {
  OrderValidationSchema,
  UpdateOrderValidationSchema,
  UpdateOrderStatusValidationSchema,
  OrderIdSchema,
  OrderUserIdSchema
} from './order.validation';

const router = express.Router();

// Public routes (if any)

// Apply auth middleware to all routes
router.use((req: Request, res: Response, next: NextFunction) => {
  return authMiddleware(req as AuthRequest, res, next);
});

// Create a new order
router.post(
  '/',
  validateRequest(OrderValidationSchema),
  OrderController.createOrder
);

// Get all orders (admin only)
router.get(
  '/',
  // Add admin check middleware if needed
  OrderController.getAllOrders
);

// Get order by ID
router.get(
  '/:id',
  validateRequest(OrderIdSchema),
  OrderController.getOrderById
);

// Update order
router.put(
  '/:id',
  validateRequest(UpdateOrderValidationSchema),
  OrderController.updateOrder
);

// Update order status
router.patch(
  '/:id/status',
  validateRequest(UpdateOrderStatusValidationSchema),
  OrderController.updateOrderStatus
);

// Delete order
router.delete(
  '/:id',
  validateRequest(OrderIdSchema),
  OrderController.deleteOrder
);

// Get orders by user ID
router.get(
  '/user/:userId',
  validateRequest(OrderUserIdSchema),
  OrderController.getOrdersByUser
);

export const OrderRoutes = router;
