import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import { CommentServices } from './comments.service';

export const getCommentsByNewsId = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const comments = await CommentServices.getCommentsByNewsId(id);
    res.status(httpStatus.OK).json(comments);
  } catch (error) {
    next(error);
  }
};

export const CommentController = {
  getCommentsByNewsId,
};
