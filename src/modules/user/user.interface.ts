import { Model } from 'mongoose';

export type TUser = {
  name: string;
  displayName?: string;
  email: string;
  role: 'admin' | 'user';
  photoUrl?: string;
  isActive?: boolean;
};

interface UserMethods {
  // eslint-disable-next-line no-unused-vars
  isEmailUserNameExists(name: string, email: string): Promise<TUser | null>;
}

export interface userModel extends Model<TUser>, UserMethods {}
