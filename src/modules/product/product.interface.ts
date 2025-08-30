import { Model } from 'mongoose';

export interface IProduct {
  _id: string;
  id: string;
  name: string;
  description?: string;
  price: number;
  img: string[];
  brand?: string;
  category?: string;
  rating?: number;
  reviews?: number;
  inStock?: boolean;
  isFeatured?: boolean;
  quantity?: number;
}

export interface ProductModel extends Model<IProduct> {}
