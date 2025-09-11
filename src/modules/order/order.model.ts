import { Schema, model } from 'mongoose';
import {
  IOrder,
  IOrderItem,
  IPaymentResult,
  IOrderModel,
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
  IOrderInfo,
} from './order.interface'; // adjust the path if needed

// Schema for individual order items
const orderItemSchema = new Schema<IOrderItem>({
  productId: { type: String, required: true },
  quantity: { type: Number, required: true },
});

// Schema for shipping address
const orderInfoSchema = new Schema<IOrderInfo>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    paymentMethod: { type: String, required: true },
    shippingMethod: { type: String, required: true },
  },
  { _id: false },
);

// Schema for payment result
const paymentResultSchema = new Schema<IPaymentResult>(
  {
    id: { type: String, required: true },
    status: { type: String, required: true },
    update_time: { type: String, required: true },
    email_address: { type: String, required: true },
  },
  { _id: false },
);

// Main order schema
const orderSchema = new Schema<IOrder>(
  {
    orderItems: { type: [orderItemSchema], required: true },
    orderInfo: { type: orderInfoSchema, required: true },
    paymentMethod: {
      type: String,
      enum: ['sslcommerz', 'cash_on_delivery'],
      required: true,
    } as unknown as PaymentMethod,
    paymentResult: { type: paymentResultSchema, required: false },
    status: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    } as unknown as OrderStatus,
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
    } as unknown as PaymentStatus,
  },
  { timestamps: true },
);

export const Order = model<IOrder, IOrderModel>('orders', orderSchema);
