import { NextFunction, Request, Response } from 'express';
import { OrderServices } from './order.service';
import { CreateOrderDto, UpdateOrderDto, UpdateOrderStatusDto } from './order.validation';
import { IOrder } from './order.interface';
import httpStatus from 'http-status';

const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orderData: CreateOrderDto = req.body;
    const result = await OrderServices.createOrderIntoDB(orderData);
    
    res.status(httpStatus.CREATED).json({
      success: true,
      message: 'Order created successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

const getAllOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Add filters from query params if needed
    const filters = { ...req.query };
    const result = await OrderServices.getAllOrdersFromDB(filters);
    
    res.status(httpStatus.OK).json({
      success: true,
      message: 'Orders retrieved successfully',
      data: result,
      count: result.length
    });
  } catch (error) {
    next(error);
  }
};

const getOrderById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await OrderServices.getOrderByIdFromDB(id);
    
    if (!result) {
      return res.status(httpStatus.NOT_FOUND).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    res.status(httpStatus.OK).json({
      success: true,
      message: 'Order retrieved successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

const updateOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const updateData: UpdateOrderDto = req.body;
    
    const result = await OrderServices.updateOrderInDB(id, updateData);
    
    if (!result) {
      return res.status(httpStatus.NOT_FOUND).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    res.status(httpStatus.OK).json({
      success: true,
      message: 'Order updated successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

const updateOrderStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const statusData: UpdateOrderStatusDto = req.body;
    
    const result = await OrderServices.updateOrderStatusInDB(id, statusData);
    
    if (!result) {
      return res.status(httpStatus.NOT_FOUND).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    res.status(httpStatus.OK).json({
      success: true,
      message: 'Order status updated successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

const deleteOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await OrderServices.deleteOrderFromDB(id);
    
    if (!result) {
      return res.status(httpStatus.NOT_FOUND).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    res.status(httpStatus.OK).json({
      success: true,
      message: 'Order deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

const getOrdersByUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;
    const result = await OrderServices.getOrdersByUserId(userId);
    
    res.status(httpStatus.OK).json({
      success: true,
      message: 'User orders retrieved successfully',
      data: result,
      count: result.length
    });
  } catch (error) {
    next(error);
  }
};

export const OrderController = {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrder,
  updateOrderStatus,
  deleteOrder,
  getOrdersByUser,
};
