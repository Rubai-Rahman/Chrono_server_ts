import { Response } from 'express';

interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data?: T;
  error?: string;
}

export const sendSuccess = <T>(res: Response, statusCode: number, message: string, data?: T): Response => {
  const response: ApiResponse<T> = {
    statusCode,
    message,
    data,
  };
  return res.status(statusCode).json(response);
};

export const sendError = (res: Response, statusCode: number, message: string, error?: string): Response => {
  const response: ApiResponse<null> = {
    statusCode,
    message,
    error,
  };
  return res.status(statusCode).json(response);
};
