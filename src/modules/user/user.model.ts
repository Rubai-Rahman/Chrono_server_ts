import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import {
  TOrders,
  TUser,
  TUserAddress,
  TUserName,
  userModel,
} from './user.interface';
import { config } from '@config/env';

const { Schema, model } = mongoose;

// Define the sub-schema for fullName
const fullNameSchema = new Schema<TUserName>({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxLength: [20, 'Name can not be more that 20 characters'],
  },
  lastName: { type: String, required: [true, 'Last name is required'] },
});

// Define the sub-schema for address
const addressSchema = new Schema<TUserAddress>({
  street: { type: String, required: [true, 'Street is required'] },
  city: { type: String, required: [true, 'City is required'] },
  country: { type: String, required: [true, 'Country is required'] },
});

// Define the sub-schema for orders
const orderSchema = new Schema<TOrders>({
  productName: { type: String, required: [true, 'Product name is required'] },
  price: { type: Number, required: [true, 'Price is required'] },
  quantity: { type: Number, required: [true, 'Quantity is required'] },
});

const userSchema = new Schema<TUser>({
  userId: { type: Number, required: [true, 'ID is required'], unique: true },
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    maxLength: [20, 'Password can not be more than 20 characters'],
    default: undefined,
  },
  fullName: fullNameSchema,
  age: { type: Number, required: [true, 'Age is required'] },
  email: { type: String, required: [true, 'Email is required'], unique: true },
  isActive: { type: Boolean, default: true },
  hobbies: { type: [String], required: [true, 'Hobbies are required'] },
  address: addressSchema,
  orders: { type: [orderSchema], default: [] },
});
//pre hook
userSchema.pre('save', async function (next) {
  this.password = (await bcrypt.hash(
    this.password as string,
    Number(config.bycrypt_salt_rounds),
  )) as string;
  next();
});

//post hook to make password empty
userSchema.post('save', function (doc, next) {
  doc.password = '';
  next();
});

//custom static methods
userSchema.statics.isUserExists = async function (
  userId: number,
): Promise<TUser | null> {
  const existingUser = await this.findOne({ userId });
  return existingUser;
};

userSchema.statics.isEmailUserNameExists = async function (
  username: string,
  email: string,
): Promise<TUser | null> {
  const filter = { $or: [{ username }, { email }] };
  const existingUser = await this.findOne(filter);
  return existingUser as TUser | null;
};

export const User = model<TUser, userModel>('User', userSchema);
