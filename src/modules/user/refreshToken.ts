import mongoose, { Schema, Document, PopulatedDoc } from 'mongoose';

export interface IUser {
  _id?: mongoose.Types.ObjectId;
  role: string;
}

export interface IRefreshToken extends Document {
  user: PopulatedDoc<IUser>;
  tokenHash: string;
  expiresAt: Date;
  createdAt: Date;
  revoked: boolean;
  replacedBy?: mongoose.Types.ObjectId | null;
  ip?: string | null;
  userAgent?: string | null;
}

const RefreshTokenSchema = new Schema<IRefreshToken>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    tokenHash: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
    revoked: { type: Boolean, default: false },
    replacedBy: {
      type: Schema.Types.ObjectId,
      ref: 'RefreshToken',
      default: null,
    },
    ip: { type: String, default: null },
    userAgent: { type: String, default: null },
  },
  { timestamps: true },
);

export const RefreshToken = mongoose.model<IRefreshToken>(
  'RefreshToken',
  RefreshTokenSchema,
);
