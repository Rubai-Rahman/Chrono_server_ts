import { Review } from './reviews.model';

export const getAllReviews = async () => {
  try {
    return await Review.find({}).lean();
  } catch (error) {
    console.error('Error in getAllReviews:', error);
    throw error;
  }
};

export const reviewService = {
  getAllReviews,
};
