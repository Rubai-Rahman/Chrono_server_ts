import { Model } from 'mongoose';

export interface ReviewType {
  _id: string;
  name: string;
  comment: string;
  img: string;
  location?: string;
  verified?: boolean;
  rating?: number;
}

export interface ReviewModel extends Model<ReviewType> {}
