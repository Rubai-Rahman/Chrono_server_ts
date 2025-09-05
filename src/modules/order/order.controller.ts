import { NextFunction, Request, Response } from 'express';
import { OrderServices } from './order.service';

export const postOrder = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const orderData = req.body;
    const newOrder = await OrderServices.createOrderIntoDB(orderData);
    res.status(201).json({
      success: true,
      order: newOrder,
    });
  } catch (err: any) {
    next(err);
  }
};

export const OrderController = {
  postOrder,
};
