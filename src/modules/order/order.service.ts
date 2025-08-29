import { FilterQuery, Types, Document } from 'mongoose';
import { Order } from './order.model';
import { IOrder, IOrderItem, OrderStatus, PaymentStatus } from './order.interface';
import { CreateOrderDto, UpdateOrderDto, UpdateOrderStatusDto } from './order.validation';
import ApiError from '../../utils/ApiError';
import httpStatus from 'http-status';

export const createOrderIntoDB = async (orderData: CreateOrderDto): Promise<IOrder> => {
  // Calculate prices if not provided
  if (!orderData.itemsPrice) {
    orderData.itemsPrice = orderData.orderItems.reduce((sum: number, item: IOrderItem) => {
      return sum + (item.price * item.quantity);
    }, 0);
  }
  
  // Set default values if not provided
  if (!orderData.taxPrice) {
    orderData.taxPrice = Number((orderData.itemsPrice * 0.1).toFixed(2)); // 10% tax
  }
  
  if (orderData.shippingPrice === undefined) {
    orderData.shippingPrice = orderData.itemsPrice > 100 ? 0 : 10;
  }
  
  if (!orderData.totalPrice) {
    orderData.totalPrice = Number(
      (orderData.itemsPrice + orderData.taxPrice + orderData.shippingPrice).toFixed(2)
    );
  }
  
  
  try {
    const order = await Order.create(orderData);
    return order.toObject();
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Failed to create order');
  }
};

export const getAllOrdersFromDB = async (filter: FilterQuery<IOrder> = {}): Promise<IOrder[]> => {
  try {
    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .lean();
    
    return orders.map(({ __v, ...order }) => order as IOrder);
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to fetch orders');
  }
};

export const getOrderByIdFromDB = async (id: string): Promise<IOrder | null> => {
  if (!Types.ObjectId.isValid(id)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid order ID');
  }
  
  const order = await Order.findById(id).lean();
  if (!order) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Order not found');
  }
  return order;
};

export const updateOrderInDB = async (id: string, updateData: UpdateOrderDto): Promise<IOrder | null> => {
  if (!Types.ObjectId.isValid(id)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid order ID');
  }
  
  try {
    // Recalculate totals if order items were updated
    if (updateData.orderItems && updateData.orderItems.length > 0) {
      const itemsPrice = updateData.orderItems.reduce((sum: number, item: IOrderItem) => {
        return sum + (item.price * item.quantity);
      }, 0);
      
      updateData.itemsPrice = itemsPrice;
      updateData.taxPrice = Number((itemsPrice * 0.1).toFixed(2));
      updateData.shippingPrice = itemsPrice > 100 ? 0 : 10;
      updateData.totalPrice = Number((itemsPrice + updateData.taxPrice + (updateData.shippingPrice || 0)).toFixed(2));
    }
    
    const order = await Order.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).lean();
    
    if (!order) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Order not found');
    }
    
    return order as IOrder;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to update order');
  }
};

export const updateOrderStatusInDB = async (id: string, statusData: UpdateOrderStatusDto): Promise<IOrder | null> => {
  if (!Types.ObjectId.isValid(id)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid order ID');
  }
  
  try {
    const order = await Order.findByIdAndUpdate(
      id,
      { $set: statusData },
      { new: true, runValidators: true }
    ).lean();
    
    if (!order) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Order not found');
    }
    
    return order as IOrder;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to update order status');
  }
};

export const deleteOrderFromDB = async (id: string): Promise<boolean> => {
  if (!Types.ObjectId.isValid(id)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid order ID');
  }
  
  try {
    const result = await Order.findByIdAndDelete(id);
    
    if (!result) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Order not found');
    }
    
    return true;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to delete order');
  }
};

export const getOrdersByUserId = async (userId: string): Promise<IOrder[]> => {
  if (!Types.ObjectId.isValid(userId)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid user ID');
  }
  
  try {
    const orders = await Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .lean();
    
    return orders.map(({ __v, ...order }) => order as IOrder);
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to fetch user orders');
  }
};

export const OrderServices = {
  createOrderIntoDB,
  getAllOrdersFromDB,
  getOrderByIdFromDB,
  updateOrderInDB,
  updateOrderStatusInDB,
  deleteOrderFromDB,
  getOrdersByUserId,
};
