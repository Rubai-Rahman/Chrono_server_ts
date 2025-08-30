import { Schema, model } from 'mongoose';
import { IReviewType, ReviewModel } from './reviews.interface';

const ReviewSchema = new Schema<IReviewType>(
  {
    name: { type: String, required: true },
    comment: { type: String, required: true },
    img: { type: String, required: true }, // user profile image
    location: { type: String },
    verified: { type: Boolean, default: false },
    rating: { type: Number, min: 1, max: 5 }, // optional rating 1–5
  },
  {
    collection: 'review', // Using 'review' collection instead of 'reviews'
    timestamps: true, // adds createdAt & updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

export const Review = model<IReviewType, ReviewModel>('Review', ReviewSchema);
