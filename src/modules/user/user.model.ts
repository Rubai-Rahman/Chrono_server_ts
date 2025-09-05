import mongoose from 'mongoose';
import { TUser, userModel, UserDocument } from './user.interface';
import bcrypt from 'bcrypt';
import { config } from '@config/env';

const { Schema, model } = mongoose;

const userSchema = new Schema<TUser, userModel, UserDocument>(
  {
    name: { type: String, required: [true, 'Name is required'] },
    password: { type: String, required: [true, 'Password is required'] },
    displayName: {
      type: String,
      required: [false, 'Display name is required'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
    },
    isActive: { type: Boolean, default: true },
    photoUrl: { type: String, required: [false, 'Photo URL is required'] },
    role: { type: String, enum: ['admin', 'user'], default: 'user' },
    resetToken: { type: String, default: null },
    resetTokenExpiry: { type: Date, default: null },
  },
  {
    timestamps: true,
  },
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(Number(config.bcrypt_salt_rounds));
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function (
  candidatePassword: string,
): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Static method to check if email or username exists
userSchema.statics.isEmailUserNameExists = async function (
  name: string,
  email: string,
): Promise<TUser | null> {
  return await this.findOne({
    $or: [{ name }, { email }],
  });
};

export const User = model<TUser, userModel>('User', userSchema);
