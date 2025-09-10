import { model, Schema } from 'mongoose';
import { AddressModel, TAddress } from './address.interface';

const AddressSchema = new Schema<TAddress>(
  {
    userId: { type: String, required: true },
    name: { type: String, required: true },
    line1: { type: String, required: true },
    line2: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const Address = model<TAddress, AddressModel>('Address', AddressSchema);
