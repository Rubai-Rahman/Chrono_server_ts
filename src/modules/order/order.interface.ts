import { Model, Document, Types } from 'mongoose';

// Define the order item interface
export interface IOrderItem {
  productId: Types.ObjectId;
  quantity: number;
}

// Define the shipping address interface
export interface IOrderInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: Types.ObjectId;
  paymentMethod: string;
  shippingMethod: string;
}

// Define the payment result interface
export interface IPaymentResult {
  id: string;
  status: string;
  update_time: string;
  email_address: string;
}

// Define the order status type
export type OrderStatus =
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';
export type PaymentMethod = 'sslcommerz' | 'cash_on_delivery';

// Define the main order interface
export interface IOrder {
  orderItems: IOrderItem[];
  orderInfo: IOrderInfo;
  paymentMethod: PaymentMethod;
  paymentResult?: IPaymentResult;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  orderCode: string;
  createdAt?: Date;
  updatedAt?: Date;
  subtotal: Number;
  shipping: Number;
  tax: Number;
  total: Number;
}

// Extend Mongoose Document
export interface IOrderDocument extends IOrder, Document {}

// Create the model type
export interface IOrderModel extends Model<IOrderDocument> {}
