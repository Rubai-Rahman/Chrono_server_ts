import { Model } from 'mongoose';

export interface INews {
  _id: string;
  slug: string;
  name: string;
  excerpt: string;
  details: string;
  img: string;
  date: Date;
  updatedAt: Date;
  author: string;
  category: string;
  tags: string[];
  readTime: string;
  featured: boolean;
  status: string;
  relatedProducts: string[];
  likes: number;
  views: number;
  commentsEnabled: boolean;
}

export interface newsModel extends Model<INews> {}
