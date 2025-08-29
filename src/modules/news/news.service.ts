import { Types } from 'mongoose';
import httpStatus from 'http-status';
import { startSession } from 'mongoose';
import { News } from './news.model';
import { 
  IComment,
  INews,
  CreateNewsInput, 
  UpdateNewsInput, 
  CommentInput, 
  ReactionInput, 
  NewsQuery
} from './news.interface';
import { ApiError } from '../../utils/ApiError';
import { IUser } from '../user/user.interface';

interface GetNewsQuery {
  page?: string;
  limit?: string;
  category?: string;
  tag?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
}

export const getAllNews = async (query: NewsQuery): Promise<{ 
  data: INews[]; 
  meta: { 
    total: number; 
    page: number; 
    limit: number; 
    totalPages: number;
  } 
}> => {
  const { 
    page = 1, 
    limit = 10, 
    category, 
    tag, 
    search, 
    sortBy = 'publishedAt', 
    sortOrder = 'desc' 
  } = query;

  const filter: any = { isPublished: true };

  if (category) filter.categories = category;
  if (tag) filter.tags = tag;
  if (search) filter.$text = { $search: search };

  const skip = (page - 1) * limit;
  const sort: any = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

  const [data, total] = await Promise.all([
    News.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('author', 'name email')
      .populate('comments.user', 'name email')
      .lean(),
    
    News.countDocuments(filter)
  ]);

  const totalPages = Math.ceil(total / limit);

  return { 
    data, 
    meta: { 
      total, 
      page, 
      limit, 
      totalPages 
    } 
  };
};

export const getNewsById = async (id: string): Promise<INews> => {
  if (!Types.ObjectId.isValid(id)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid news ID');
  }

  try {
    const news = await News.findById(id)
      .populate('author', 'name email')
      .populate('comments.user', 'name email')
      .populate('comments.replies.user', 'name email')
      .lean();

    if (!news) {
      throw new ApiError(httpStatus.NOT_FOUND, 'News article not found');
    }

    // Increment view count (fire and forget)
    News.findByIdAndUpdate(id, { $inc: { viewCount: 1 } }).exec();

    return news as INews;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Failed to fetch news article'
    );
  }
};

export const createNews = async (
  newsData: CreateNewsInput['body'],
  userId: string
): Promise<INews> => {
  // Check if news with same title already exists
  const existingNews = await News.findOne({ title: newsData.title });
  if (existingNews) {
    throw new ApiError(
      httpStatus.BAD_REQUEST, 
      'News with this title already exists'
    );
  }

  const news = await News.create({
    ...newsData,
    author: userId,
  });

  return news;
};

export const updateNews = async (id: string, updateData: UpdateNewsInput): Promise<INews> => {
  if (!Types.ObjectId.isValid(id)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid news ID');
  }

  try {
    const news = await News.findByIdAndUpdate(
      id, 
      { 
        ...updateData,
        ...(updateData.isPublished ? { publishedAt: new Date() } : {})
      }, 
      { new: true, runValidators: true }
    ).lean();
    
    if (!news) {
      throw new ApiError(httpStatus.NOT_FOUND, 'News article not found');
    }
    
    return news as INews;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error.code === 11000) {
      throw new ApiError(httpStatus.CONFLICT, 'News article with this title already exists');
    }
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Failed to update news article'
    );
  }
};

export const deleteNews = async (id: string): Promise<void> => {
  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid news ID format');
  }

  const result = await News.findByIdAndDelete(id);
  
  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'News article not found');
  }
};

export const addComment = async (newsId: string, commentData: CommentInput, userId: string) => {
  if (!Types.ObjectId.isValid(newsId)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid news ID');
  }

  try {
    const news = await News.findById(newsId);
    
    if (!news) {
      throw new ApiError(httpStatus.NOT_FOUND, 'News article not found');
    }

    const comment: IComment = {
      user: new Types.ObjectId(userId),
      text: commentData.text,
      likes: [],
      dislikes: [],
      replies: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // If it's a reply to a comment
    if (commentData.parentCommentId) {
      if (!Types.ObjectId.isValid(commentData.parentCommentId)) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid parent comment ID');
      }
      
      const parentComment = news.comments.id(commentData.parentCommentId);
      if (!parentComment) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Parent comment not found');
      }
      
      parentComment.replies.push(comment as any);
    } else {
      // It's a top-level comment
      news.comments.push(comment as any);
    }
    
    await news.save();
    return comment;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Failed to add comment'
    );
  }
};

export const reactToComment = async (
  commentId: string,
  userId: string,
  reaction: 'like' | 'dislike',
): Promise<{ likes: string[]; dislikes: string[] }> => {
  if (!commentId.match(/^[0-9a-fA-F]{24}$/)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid comment ID format');
  }

  const session = await startSession();
  session.startTransaction();

  try {
    // Find the news article containing the comment
    const news = await News.findOne(
      { 'comments._id': commentId },
      { 'comments.$': 1 },
      { session }
    );

    if (!news) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Comment not found');
    }

    const comment = news.comments[0];
    const userIdObj = new Types.ObjectId(userId);
    
    // Prepare update operations
    const update: any = {};
    
    if (reaction === 'like') {
      if (comment.likes.some(id => id.equals(userIdObj))) {
        // Remove like if already liked
        update.$pull = { 'comments.$.likes': userIdObj };
      } else {
        // Add like and remove from dislikes if present
        update.$addToSet = { 'comments.$.likes': userIdObj };
        update.$pull = { 'comments.$.dislikes': userIdObj };
      }
    } else {
      if (comment.dislikes.some(id => id.equals(userIdObj))) {
        // Remove dislike if already disliked
        update.$pull = { 'comments.$.dislikes': userIdObj };
      } else {
        // Add dislike and remove from likes if present
        update.$addToSet = { 'comments.$.dislikes': userIdObj };
        update.$pull = { 'comments.$.likes': userIdObj };
      }
    }

    // Apply the update
    const updatedNews = await News.findOneAndUpdate(
      { 'comments._id': commentId },
      update,
      { new: true, session }
    )
      .select('comments.$')
      .lean();

    if (!updatedNews) {
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to update reaction');
    }

    await session.commitTransaction();
    
    const commentDoc = updatedNews.comments[0] as any; // Type assertion for the document
    const updatedComment: IComment = {
      ...commentDoc,
      _id: commentDoc._id,
      user: commentDoc.user,
      text: commentDoc.text,
      likes: commentDoc.likes || [],
      dislikes: commentDoc.dislikes || [],
      replies: commentDoc.replies || [],
      createdAt: commentDoc.createdAt,
      updatedAt: commentDoc.updatedAt
    };
    return {
      likes: updatedComment.likes.map((id: Types.ObjectId) => id.toString()),
      dislikes: updatedComment.dislikes.map((id: Types.ObjectId) => id.toString())
    };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

export const NewsServices = {
  createNews,
  getAllNews,
  getNewsById,
  updateNews,
  deleteNews,
  addComment,
  reactToComment,
};
