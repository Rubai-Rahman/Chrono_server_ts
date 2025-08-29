import mongoose from 'mongoose';
import { TUser, userModel } from './user.interface';

const { Schema, model } = mongoose;

const userSchema = new Schema<TUser>({
  name: { type: String, required: [true, 'Name is required'] },
  displayName: { type: String, required: [false, 'Display name is required'] },
  email: { type: String, required: [true, 'Email is required'], unique: true },
  isActive: { type: Boolean, default: true },
  photoUrl: { type: String, required: [false, 'Photo URL is required'] },
  rememberMe: { type: Boolean, default: false },
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
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
