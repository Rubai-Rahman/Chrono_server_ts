// src/middleware/notFound.middleware.ts
import AppError from '@utils/AppError';
import { Request, Response, NextFunction } from 'express';

export const notFound = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const error = new AppError(`Route ${req.originalUrl} not found`, 404);
  next(error);
};
