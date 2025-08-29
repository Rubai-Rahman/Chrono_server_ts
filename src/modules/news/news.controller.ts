import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import { NewsServices } from './news.service';
import { 
  createNewsSchema, 
  updateNewsSchema, 
  commentSchema, 
  reactionSchema, 
  newsQuerySchema,
  newsParamsSchema,
  commentParamsSchema,
  CreateNewsInput,
  UpdateNewsInput,
  CommentInput,
  ReactionInput,
  NewsQuery
} from './news.validation';
import { validateRequest } from '../../middleware/validateRequest';
import { ApiError } from '../../utils/ApiError';

export const getAllNews = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // Validate query parameters
    await validateRequest(newsQuerySchema)(req, res, async () => {
      const { page, limit, category, tag, search, sortBy, sortOrder } = req.query as NewsQuery;
      
      const result = await NewsServices.getAllNews({
        page: parseInt(page, 10) || 1,
        limit: parseInt(limit, 10) || 10,
        category,
        tag,
        search,
        sortBy,
        sortOrder: sortOrder as 'asc' | 'desc'
      });

      res.status(httpStatus.OK).json({
        success: true,
        message: 'News articles retrieved successfully',
        data: result.data,
        meta: result.meta
      });
    });
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
    await validateRequest(newsParamsSchema)(req, res, async () => {
      const { id } = req.params;
      const news = await NewsServices.getNewsById(id);

      res.status(httpStatus.OK).json({
        success: true,
        message: 'News article retrieved successfully',
        data: news,
      });
    });
  } catch (error) {
    next(error);
  }
};

export const createNews = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const newsData = req.body;
    const userId = req.user?._id; // Assuming user is attached by auth middleware

    const result = await NewsServices.createNews({
      ...newsData,
      author: userId,
    });

    res.status(201).json({
      success: true,
      message: 'News created successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const updateNews = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await validateRequest(updateNewsSchema)(req, res, async () => {
      const { id } = req.params;
      const updateData = req.body as UpdateNewsInput['body'];
      
      const news = await NewsServices.updateNews(id, updateData);

      res.status(httpStatus.OK).json({
        success: true,
        message: 'News article updated successfully',
        data: news,
      });
    });
  } catch (error) {
    next(error);
  }
};

export const deleteNews = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    await NewsServices.deleteNews(id);

    res.status(200).json({
      success: true,
      message: 'News deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Comment Controllers
export const addComment = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { newsId } = req.params;
    const { text } = req.body;
    const userId = req.user?._id; // Assuming user is attached by auth middleware

    const result = await NewsServices.addComment(newsId, {
      user: userId,
      text,
    });

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const reactToComment = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?._id;
    
    if (!userId) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'User not authenticated');
    }

    await validateRequest({
      ...commentParamsSchema,
      ...reactionSchema
    })(req, res, async () => {
      const { commentId } = req.params;
      const { reaction } = req.body as ReactionInput['body'];

      const result = await NewsServices.reactToComment(
        commentId, 
        userId.toString(), 
        reaction
      );

      res.status(httpStatus.OK).json({
        success: true,
        message: 'Reaction updated successfully',
        data: result,
      });
    });
  } catch (error) {
    next(error);
  }
};

export const NewsController = {
  getAllNews,
  getNewsById,
  createNews,
  updateNews,
  deleteNews,
  addComment,
  reactToComment,
};
