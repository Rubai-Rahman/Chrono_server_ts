import { Model } from 'mongoose';

export interface IReviewType {
  _id: string;
  name: string;
  comment: string;
  img: string;
  location?: string;
  verified?: boolean;
  rating?: number;
}

export interface ReviewModel extends Model<IReviewType> {}
