import { Model } from 'mongoose';

export type TUserName = {
  firstName: string;
  lastName: string;
};
export type TUserAddress = {
  street: string;
  city: string;
  country: string;
};

export type TOrders = {
  productName: string;
  price: number;
  quantity: number;
};

export type TUser = {
  userId: number;
  username: string;
  password?: string | undefined;
  fullName: TUserName;
  age: number;
  email: string;
  isActive: boolean;
  hobbies: string[];
  address: TUserAddress;
  orders?: TOrders[];
};

interface UserMethods {
  // eslint-disable-next-line no-unused-vars
  isUserExists(userId: number): Promise<TUser | null>;
  // eslint-disable-next-line no-unused-vars
  isEmailUserNameExists(username: string, email: string): Promise<TUser | null>;
}

export interface userModel extends Model<TUser>, UserMethods {}
