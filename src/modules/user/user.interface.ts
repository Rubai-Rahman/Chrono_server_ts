import { Model, Document } from 'mongoose';

export type TUser = {
  id: unknown | Document['_id'];
  name: string;
  displayName?: string;
  password: string;
  email: string;
  role: 'admin' | 'user';
  photoUrl?: string;
  isActive?: boolean;
  resetToken?: string | null;
  resetTokenExpiry?: Date | null;
  rememberMe?: boolean;
};

interface UserMethods {
  comparePassword(candidatePassword: string): Promise<boolean>;
  isEmailUserNameExists(name: string, email: string): Promise<TUser | null>;
}

export type UserDocument = Document<unknown, {}, TUser> & TUser & UserMethods;

export interface userModel extends Model<TUser, {}, UserMethods> {
  isEmailUserNameExists(name: string, email: string): Promise<TUser | null>;
}
