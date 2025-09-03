import mongoose from 'mongoose';

export type TAddress = {
  _id: string;
  name: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
};

export interface AddressModel extends mongoose.Model<TAddress> {}
