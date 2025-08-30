import mongoose from 'mongoose';
import { INews, newsModel } from './news.interface';
const { Schema, model } = mongoose;

const NewsSchema = new Schema<INews>(
  {
    slug: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    excerpt: { type: String, required: true },
    details: { type: String, required: true },
    img: { type: String, required: true },
    date: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    author: { type: String, required: true },
    category: { type: String, required: true },
    tags: [{ type: String }],
    readTime: { type: String, required: true },
    featured: { type: Boolean, default: false },
    status: { type: String, default: 'draft' },
    relatedProducts: [{ type: String }],
    likes: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    commentsEnabled: { type: Boolean, default: true },
  },
  { timestamps: true },
);

// Explicitly set the collection name to 'news'
const collectionName = 'news';

// Create the model with the explicit collection name
export const News = model<INews, newsModel>('News', NewsSchema, collectionName);
