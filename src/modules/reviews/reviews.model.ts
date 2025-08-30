import { Schema, model } from 'mongoose';
import { ReviewType, ReviewModel } from './review.interface';

const ReviewSchema = new Schema<ReviewType, ReviewModel>(
  {
    name: { type: String, required: true },
    comment: { type: String, required: true },
    img: { type: String, required: true }, // user profile image
    location: { type: String },
    verified: { type: Boolean, default: false },
    rating: { type: Number, min: 1, max: 5 }, // optional rating 1–5
  },
  {
    timestamps: true, // adds createdAt & updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Example virtual: firstName extracted from name
ReviewSchema.virtual('firstName').get(function (this: ReviewType) {
  return this.name?.split(' ')[0] ?? '';
});

export const Review = model<ReviewType, ReviewModel>('Review', ReviewSchema);
