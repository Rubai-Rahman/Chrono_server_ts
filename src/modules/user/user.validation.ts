import { z } from 'zod';

// Schema for TUserName
const TUserNameSchema = z.object({
  firstName: z
    .string()
    .min(3, { message: 'FirstName must be more than 3 character' })
    .max(20, { message: 'FirsName can not be more that 20 characters' }),
  lastName: z
    .string()
    .min(3, { message: 'LastName must be more than 3 character' })
    .max(20, { message: 'LastName can not be more that 20 characters' }),
});

// Schema for TUserAddress
const TUserAddressSchema = z.object({
  street: z.string({ message: 'Street is required' }),
  city: z.string({ message: 'Street is required' }),
  country: z.string({ message: 'Street is required' }),
});

// Schema for TOrders
const TOrdersSchema = z.object({
  productName: z.string({ message: 'Street is required' }),
  price: z.number().nonnegative({ message: 'Price is required' }),
  quantity: z.number().nonnegative({ message: 'Quantity must be positive ' }),
});

// Schema for TUser
const UserValidationSchema = z.object({
  userId: z.number().nonnegative({ message: 'Id must be positve number' }),
  username: z.string({ message: 'User name must be string' }),
  password: z.string(),
  fullName: TUserNameSchema,
  age: z.number().nonnegative({ message: 'Age must be a positive number' }),
  email: z.string().email(),
  isActive: z.boolean(),
  hobbies: z
    .array(
      z
        .string()
        .min(4, { message: 'Hobby must be at least 4 character' })
        .max(20, { message: 'Hobby can not be more than 20 character' }),
    )
    .min(1, { message: 'Hobby field can not be emty' }),
  address: TUserAddressSchema,
  orders: z.array(TOrdersSchema).optional(),
});

export { UserValidationSchema };
