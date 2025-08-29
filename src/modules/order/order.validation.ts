import { z } from 'zod';

// Define the order item schema
const orderItemSchema = z.object({
  product: z.string({
    required_error: 'Product ID is required',
    invalid_type_error: 'Product ID must be a string',
  }),
  name: z.string({
    required_error: 'Product name is required',
    invalid_type_error: 'Product name must be a string',
  }),
  image: z.string({
    required_error: 'Product image is required',
    invalid_type_error: 'Product image must be a string',
  }),
  price: z.number({
    required_error: 'Price is required',
    invalid_type_error: 'Price must be a number',
  }).min(0, { message: 'Price must be a positive number' }),
  quantity: z.number({
    required_error: 'Quantity is required',
    invalid_type_error: 'Quantity must be a number',
  }).int().min(1, { message: 'Quantity must be at least 1' }),
});

// Define the shipping address schema
const shippingAddressSchema = z.object({
  address: z.string({
    required_error: 'Address is required',
    invalid_type_error: 'Address must be a string',
  }),
  city: z.string({
    required_error: 'City is required',
    invalid_type_error: 'City must be a string',
  }),
  postalCode: z.string({
    required_error: 'Postal code is required',
    invalid_type_error: 'Postal code must be a string',
  }),
  country: z.string({
    required_error: 'Country is required',
    invalid_type_error: 'Country must be a string',
  }),
  phone: z.string({
    required_error: 'Phone number is required',
    invalid_type_error: 'Phone number must be a string',
  }),
});

// Define the payment result schema
const paymentResultSchema = z.object({
  id: z.string(),
  status: z.string(),
  update_time: z.string(),
  email_address: z.string().email(),
}).partial();

// Define the order schema
const OrderValidationSchema = z.object({
  user: z.string({
    required_error: 'User ID is required',
    invalid_type_error: 'User ID must be a string',
  }),
  orderItems: z.array(orderItemSchema).min(1, { message: 'At least one order item is required' }),
  shippingAddress: shippingAddressSchema,
  paymentMethod: z.enum(['credit_card', 'paypal', 'cash_on_delivery'], {
    required_error: 'Payment method is required',
    invalid_type_error: 'Payment method must be either credit_card, paypal, or cash_on_delivery',
  }),
  paymentResult: paymentResultSchema.optional(),
  itemsPrice: z.number({
    required_error: 'Items price is required',
    invalid_type_error: 'Items price must be a number',
  }).min(0, { message: 'Items price must be a positive number' }),
  taxPrice: z.number({
    required_error: 'Tax price is required',
    invalid_type_error: 'Tax price must be a number',
  }).min(0, { message: 'Tax price must be a positive number' }),
  shippingPrice: z.number({
    required_error: 'Shipping price is required',
    invalid_type_error: 'Shipping price must be a number',
  }).min(0, { message: 'Shipping price must be a positive number' }),
  totalPrice: z.number({
    required_error: 'Total price is required',
    invalid_type_error: 'Total price must be a number',
  }).min(0, { message: 'Total price must be a positive number' }),
  isPaid: z.boolean().default(false),
  paidAt: z.date().optional(),
  isDelivered: z.boolean().default(false),
  deliveredAt: z.date().optional(),
  status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled']).default('pending'),
  paymentStatus: z.enum(['pending', 'completed', 'failed', 'refunded']).default('pending'),
});

// Schema for updating an order status
const UpdateOrderStatusValidationSchema = z.object({
  status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled']).optional(),
  paymentStatus: z.enum(['pending', 'completed', 'failed', 'refunded']).optional(),
});

// Schema for updating an order (all fields optional)
const UpdateOrderValidationSchema = OrderValidationSchema.partial();

// Schema for order ID validation
const OrderIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid order ID format'),
  }),
});

// Schema for user ID validation
const OrderUserIdSchema = z.object({
  params: z.object({
    userId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID format'),
  }),
});

// Export all validation schemas
export const OrderValidation = {
  OrderValidationSchema: OrderValidationSchema,
  UpdateOrderStatusValidationSchema: UpdateOrderStatusValidationSchema,
  UpdateOrderValidationSchema: UpdateOrderValidationSchema,
  OrderIdSchema: OrderIdSchema,
  OrderUserIdSchema: OrderUserIdSchema,
};

// Export types
export type CreateOrderDto = z.infer<typeof OrderValidationSchema>;
export type UpdateOrderDto = z.infer<typeof UpdateOrderValidationSchema>;
export type UpdateOrderStatusDto = z.infer<typeof UpdateOrderStatusValidationSchema>;

export type OrderIdDto = {
  id: string;
};
