import { NextFunction, Request, Response } from 'express';
import { OrderServices } from './order.service';
import { AuthRequest } from '@middleware/auth.middleware';

export const postOrder = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const orderData = req.body;
    const { userId } = req.user!;

    const newOrder = await OrderServices.createOrderIntoDB(orderData, userId);
    if (!newOrder) {
      return res
        .status(400)
        .json({ success: false, message: 'Failed to create order' });
    }

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: newOrder,
    });
  } catch (err: any) {
    next(err);
  }
};

export const getOrders = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { userId } = req.user!;

    const orders = await OrderServices.getOrderFromDB(userId);

    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (err: any) {
    next(err);
  }
};

export const OrderController = {
  postOrder,
  getOrders,
};
