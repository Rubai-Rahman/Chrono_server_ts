import { Document, Model, Types } from 'mongoose';

// Define the order item interface
export interface IOrderItem {
  product: Types.ObjectId;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

// Define the shipping address interface
export interface IShippingAddress {
  address: string;
  city: string;
  postalCode: string;
  country: string;
  phone: string;
}

// Define the payment result interface
export interface IPaymentResult {
  id: string;
  status: string;
  update_time: string;
  email_address: string;
}

// Define the order status type
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';
export type PaymentMethod = 'credit_card' | 'paypal' | 'cash_on_delivery';

// Define the order interface
export interface IOrder extends Document {
  user: Types.ObjectId;
  orderItems: IOrderItem[];
  shippingAddress: IShippingAddress;
  paymentMethod: PaymentMethod;
  paymentResult?: IPaymentResult;
  itemsPrice: number;
  taxPrice: number;
  shippingPrice: number;
  totalPrice: number;
  isPaid: boolean;
  paidAt?: Date;
  isDelivered: boolean;
  deliveredAt?: Date;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  createdAt: Date;
  updatedAt: Date;
}

// Add custom methods to the model
export interface IOrderMethods {
  // Add any custom methods here if needed
}

// Create the model type that includes the custom methods
export interface IOrderModel extends Model<IOrder, {}, IOrderMethods> {
  // Add any static methods here if needed
}
