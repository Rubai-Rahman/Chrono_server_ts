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
    const comments = await CommentServices.getCommentsWithReactions(id);
    res.status(httpStatus.OK).json(comments);
    return; // Explicitly return void
  } catch (error) {
    next(error);
  }
};

interface AuthenticatedRequest extends Request {
  user?: {
    _id: string;
    username?: string;
    [key: string]: any;
  };
  body: {
    message: string;
    parentId?: string;
  };
}

export const postComment = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { newsId } = req.params;

    if (!req.user?._id) {
      res
        .status(httpStatus.UNAUTHORIZED)
        .json({ error: 'User not authenticated' });
      return;
    }

    // The validated body is directly available at req.body
    const { message, parentId } = req.body;

    if (!req.user.username) {
      res
        .status(httpStatus.BAD_REQUEST)
        .json({ error: 'Username is required' });
      return;
    }

    const comment = await CommentServices.postComment(newsId, {
      userId: req.user._id,
      username: req.user.username,
      message,
      parentId,
    });

    // Don't return the response, just send it
    res.status(httpStatus.CREATED).json(comment);
  } catch (error) {
    next(error);
  }
};

export const CommentController = {
  getCommentsByNewsId,
  postComment,
};
