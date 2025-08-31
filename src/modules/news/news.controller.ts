import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import { NewsServices } from './news.service';

// Explicitly define the allowed sort values
type SortOption = 'createdAt_asc' | 'createdAt_desc';

export const getAllNews = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { page, size, sort } = req.query;

    // Validate sort
    const validSort: SortOption | undefined =
      sort === 'createdAt_asc' || sort === 'createdAt_desc'
        ? (sort as SortOption)
        : undefined;

    const result = await NewsServices.getAllNews({
      page: page as string,
      size: size as string,
      sort: validSort,
    });

    res.status(httpStatus.OK).json(result);
  } catch (error) {
    next(error);
  }
};

export const getNewsById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const result = await NewsServices.getNewsById(id);
    res.status(httpStatus.OK).json(result);
  } catch (error) {
    next(error);
  }
};

export const NewsController = {
  getAllNews,
  getNewsById,
};
