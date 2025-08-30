import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import { NewsServices } from './news.service';

export const getAllNews = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await NewsServices.getAllNews();
    res.status(httpStatus.OK).json(result);
  } catch (error) {
    next(error);
  }
};

export const NewsController = {
  getAllNews,
};
