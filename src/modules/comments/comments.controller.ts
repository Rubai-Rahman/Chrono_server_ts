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

    const { message, parentId } = req.body;

    // Use the user's name as the username
    const comment = await CommentServices.postComment(newsId, {
      userId: req.user._id,
      username: req.user.name,
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
