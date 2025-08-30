import { NextFunction } from 'express';
import httpStatus from 'http-status';
import { Request, Response } from 'express';
import { reviewService } from './review.service';

export const getAllReviews = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await reviewService.getAllReviews();
    res.status(httpStatus.OK).json(result);
  } catch (error) {
    next(error);
  }
};

export const reviewsController = {
  getAllReviews,
};
