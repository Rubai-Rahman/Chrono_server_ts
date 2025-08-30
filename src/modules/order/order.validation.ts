import { z } from 'zod';

// Order item schema
export const orderItemSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.number().int().positive('Quantity must be greater than 0'),
  price: z.number().nonnegative('Price must be non-negative'),
});

// Shipping address schema
export const shippingAddressSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(5, 'Phone number is required'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
  country: z.string().min(1, 'Country is required'),
  paymentMethod: z.string().min(1, 'Payment method is required'),
  shippingMethod: z.string().min(1, 'Shipping method is required'),
});

// Payment result schema
export const paymentResultSchema = z.object({
  id: z.string(),
  status: z.string(),
  update_time: z.string(),
  email_address: z.string().email(),
});

// Order summary schema
export const orderSummarySchema = z.object({
  subtotal: z.number().nonnegative(),
  shipping: z.number().nonnegative(),
  tax: z.number().nonnegative(),
  total: z.number().nonnegative(),
});

// Enums for status
export const orderStatusEnum = z.enum([
  'pending',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
]);
export const paymentStatusEnum = z.enum([
  'pending',
  'completed',
  'failed',
  'refunded',
]);
export const paymentMethodEnum = z.enum([
  'credit_card',
  'paypal',
  'cash_on_delivery',
]);

// Full order schema
export const orderSchema = z.object({
  orderItems: z
    .array(orderItemSchema)
    .min(1, 'At least one order item is required'),
  shippingAddress: shippingAddressSchema,
  orderSummary: orderSummarySchema,
  paymentMethod: paymentMethodEnum,
  paymentResult: paymentResultSchema.optional(),
  status: orderStatusEnum.default('pending'),
  paymentStatus: paymentStatusEnum.default('pending'),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

// ✅ Export inferred type (if you want type-safe validation results)
export type OrderInput = z.infer<typeof orderSchema>;
