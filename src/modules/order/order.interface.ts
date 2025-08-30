import { Model, Document } from 'mongoose';

// Define the order item interface
export interface IOrderItem {
  productId: string;
  quantity: number;
  price: number;
}

// Define the shipping address interface
export interface IShippingAddress {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
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
export type PaymentMethod = 'credit_card' | 'paypal' | 'cash_on_delivery';

// Define the main order interface
export interface IOrder {
  orderItems: IOrderItem[];
  shippingAddress: IShippingAddress;
  orderSummary: {
    subtotal: number;
    shipping: number;
    tax: number;
    total: number;
  };
  paymentMethod: PaymentMethod;
  paymentResult?: IPaymentResult;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

// Extend Mongoose Document
export interface IOrderDocument extends IOrder, Document {}

// Create the model type
export interface IOrderModel extends Model<IOrderDocument> {}
