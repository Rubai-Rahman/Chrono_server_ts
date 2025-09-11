import { z } from 'zod';

// Order item schema
export const orderItemSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.number().int().positive('Quantity must be greater than 0'),
});

// Shipping address schema
export const orederInfoSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(5, 'Phone number is required'),
  address: z.string().min(1, 'Address is required'),
  paymentMethod: z.string().min(1, 'Payment method is required'),
  shippingMethod: z.string().min(1, 'Shipping method is required'),
});

export const orderSchema = z.object({
  orderItems: z
    .array(orderItemSchema)
    .min(1, 'At least one order item is required'),
  orderInfo: orederInfoSchema,
});

// ✅ Export inferred type (if you want type-safe validation results)
export type OrderInput = z.infer<typeof orderSchema>;
