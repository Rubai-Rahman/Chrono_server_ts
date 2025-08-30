import { Schema, model } from 'mongoose';
import { IProduct, ProductModel } from './product.interface';

const ProductSchema = new Schema<IProduct>({
  id: { type: String, required: true, unique: true }, // unique product id
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  img: { type: [String], required: true }, // array of image URLs
  brand: { type: String },
  category: { type: String },
  rating: { type: Number, default: 0 },
  reviews: { type: Number, default: 0 },
  inStock: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  quantity: { type: Number, default: 0 },
});

export const Product = model<IProduct, ProductModel>('products', ProductSchema);
