import { Schema, model } from 'mongoose';
import {
  IOrder,
  IOrderItem,
  IShippingAddress,
  IPaymentResult,
  IOrderModel,
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
} from './order.interface'; // adjust the path if needed

// Schema for individual order items
const orderItemSchema = new Schema<IOrderItem>(
  {
    productId: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
  },
  { _id: false }, 
);

// Schema for shipping address
const shippingAddressSchema = new Schema<IShippingAddress>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
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
    shippingAddress: { type: shippingAddressSchema, required: true },
    orderSummary: {
      subtotal: { type: Number, required: true },
      shipping: { type: Number, required: true },
      tax: { type: Number, required: true },
      total: { type: Number, required: true },
    },
    paymentMethod: {
      type: String,
      enum: ['credit_card', 'paypal', 'cash_on_delivery'],
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
