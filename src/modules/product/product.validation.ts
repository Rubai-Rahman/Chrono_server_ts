import { z } from 'zod';

// Schema for Product
export const ProductValidationSchema = z.object({
  name: z
    .string({
      required_error: 'Product name is required',
      invalid_type_error: 'Product name must be a string',
    })
    .min(2, { message: 'Product name must be at least 2 characters' }),

  price: z
    .number({
      required_error: 'Price is required',
      invalid_type_error: 'Price must be a number',
    })
    .positive({ message: 'Price must be a positive number' }),

  description: z
    .string({
      required_error: 'Description is required',
      invalid_type_error: 'Description must be a string',
    })
    .min(10, { message: 'Description must be at least 10 characters' }),

  category: z.string({
    required_error: 'Category is required',
    invalid_type_error: 'Category must be a string',
  }),

  brand: z.string({
    required_error: 'Brand is required',
    invalid_type_error: 'Brand must be a string',
  }),

  images: z
    .string({
      required_error: 'Image URL is required',
      invalid_type_error: 'Image URL must be a string',
    })
    .url({ message: 'Image must be a valid URL' })
    .min(1, { message: 'At least one image is required' }),

  stock: z
    .number({
      required_error: 'Stock is required',
      invalid_type_error: 'Stock must be a number',
    })
    .int()
    .nonnegative({ message: 'Stock must be a non-negative integer' }),

  isFeatured: z.boolean().optional().default(false),
  rating: z.number().min(0).max(5).optional(),
  quantity: z
    .number()
    .int()
    .nonnegative({ message: 'Quantity must be a non-negative integer' })
    .optional(),
});

// Schema for updating product (all fields optional)
export const UpdateProductValidationSchema = ProductValidationSchema.partial();

export type CreateProductDto = z.infer<typeof ProductValidationSchema>;
export type UpdateProductDto = z.infer<typeof UpdateProductValidationSchema>;
