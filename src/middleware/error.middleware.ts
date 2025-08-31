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

  // Firebase Auth errors
  if (err.name === 'FirebaseAuthError') {
    const firebaseError = err as any;
    let message = 'Authentication error';
    let statusCode = 401;

    switch (firebaseError.code) {
      case 'auth/id-token-expired':
        message = 'Firebase ID token has expired';
        statusCode = 401;
        break;
      case 'auth/id-token-revoked':
        message = 'Firebase ID token has been revoked';
        statusCode = 401;
        break;
      case 'auth/argument-error':
      case 'auth/invalid-id-token':
        message = 'Invalid Firebase ID token';
        statusCode = 401;
        break;
      case 'auth/insufficient-permission':
        message = 'Insufficient permissions';
        statusCode = 403;
        break;
      // Add more Firebase error codes as needed
      default:
        message = firebaseError.message || 'Authentication failed';
    }
    
    error = new AppError(message, statusCode);
  }
  
  // Handle other authentication errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    const message = 'Invalid or expired authentication token';
    error = new AppError(message, 401);
  }

  sendErrorResponse(
    res,
    error.statusCode || 500,
    error.message || 'Internal Server Error',
    config.NODE_ENV === 'development' ? err.stack : undefined,
  );
};
