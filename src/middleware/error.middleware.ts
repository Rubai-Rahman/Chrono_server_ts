// src/middleware/error.middleware.ts
import { config } from '@config/env';
import AppError from '@utils/AppError';
import { logger } from '@utils/logger';
import { Request, Response, NextFunction } from 'express';
import { MongoServerError } from 'mongodb';
import { Error as MongooseError } from 'mongoose';

const sendErrorResponse = (
  res: Response,
  statusCode: number,
  message: string,
  stack?: string,
) => {
  res.status(statusCode).json({
    status: `${statusCode}`.startsWith('4') ? 'fail' : 'error',
    message,
    ...(stack && { stack }),
  });
};

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction, // Added missing NextFunction parameter
): void => {
  let error = { ...err } as AppError;
  error.message = err.message;

  // Log error
  logger.error(error.message, error);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = new AppError(message, 404);
  }

  // Mongoose duplicate key
  if ((err as MongoServerError).code === 11000) {
    const keyValue = (err as MongoServerError).keyValue;
    let message = 'Duplicate field value entered';

    if (keyValue) {
      const duplicateField = Object.keys(keyValue)[0];
      const duplicateValue = keyValue[duplicateField];
      message = `Duplicate field value entered: ${duplicateField} = ${duplicateValue}`;
    }

    error = new AppError(message, 400);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const validationErrors: MongooseError.ValidationError['errors'] = (
      err as MongooseError.ValidationError
    ).errors;
    const message = Object.values(validationErrors).map((val) => val.message);
    error = new AppError(message.join(', '), 400);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = new AppError(message, 401);
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = new AppError(message, 401);
  }

  sendErrorResponse(
    res,
    error.statusCode || 500,
    error.message || 'Internal Server Error',
    config.NODE_ENV === 'development' ? err.stack : undefined,
  );
};
