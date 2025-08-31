import { Types } from 'mongoose';
import { Comment } from './comments.model';
import { CommentReaction } from './commentReaction.model';

interface CommentWithReplies {
  _id: string;
  newsId: string;
  user: string | { _id: string; [key: string]: any };
  message: string;
  date: Date;
  parentId: string | null;
  replyCount?: number;
  likes?: number;
  dislikes?: number;
  replies: CommentWithReplies[];
  userReaction?: string | null;
}

interface PaginationInfo {
  total: number;
  page: number;
  pages: number;
}

interface CommentsResponse {
  comments: CommentWithReplies[];
  pagination: PaginationInfo;
}

export const getCommentsWithReactions = async (
  newsId: string,
  userId: string = 'anonymous',
  page: number = 1,
  limit: number = 50
): Promise<CommentsResponse> => {
  try {
    // 1. Fetch all comments for the news item
    const allComments = await Comment.find({ newsId: new Types.ObjectId(newsId) })
      .sort({ date: -1 })
      .lean();

    if (!allComments.length) {
      return {
        comments: [],
        pagination: {
          total: 0,
          page,
          pages: 0
        }
      };
    }

    // 2. Get all comment IDs for reaction lookup
    const commentIds = allComments.map(comment => comment._id);
    
    // 3. Get user reactions for these comments
    const userReactions = await CommentReaction.aggregate([
      {
        $match: {
          commentId: { $in: commentIds },
          ...(userId && userId !== 'anonymous' && Types.ObjectId.isValid(userId)
            ? { userId: new Types.ObjectId(userId) }
            : { userId: null })
        }
      },
      {
        $group: {
          _id: '$commentId',
          reaction: { $first: '$reaction' }
        }
      }
    ]);

    // 4. Create a map of comment reactions
    const reactionMap = new Map(
      userReactions.map(r => [r._id.toString(), r.reaction])
    );

    // 5. Create a map of all comments
    const commentMap = new Map();
    const topLevelComments: CommentWithReplies[] = [];

    allComments.forEach(comment => {
      const commentId = comment._id.toString();
      const commentWithReplies: CommentWithReplies = {
        ...comment,
        _id: commentId,
        newsId: comment.newsId.toString(),
        parentId: comment.parentId ? comment.parentId.toString() : null,
        user: ((user: any) => {
          if (!user) return 'unknown';
          
          if (typeof user === 'object' && user !== null && '_id' in user) {
            return { 
              _id: user._id.toString(),
              ...(typeof (user as any).toObject === 'function' 
                ? (user as any).toObject() 
                : {})
            };
          }
          
          if (typeof user.toString === 'function') {
            return user.toString();
          }
          
          return 'unknown';
        })(comment.user),
        userReaction: reactionMap.get(commentId) || null,
        replies: [],
        date: comment.date
      };
      commentMap.set(commentId, commentWithReplies);
    });

    // 6. Build the comment hierarchy
    allComments.forEach(comment => {
      const commentObj = commentMap.get(comment._id.toString());
      if (comment.parentId) {
        const parent = commentMap.get(comment.parentId.toString());
        if (parent) {
          parent.replies.push(commentObj);
        }
      } else {
        topLevelComments.push(commentObj);
      }
    });

    // 7. Sort replies by date (oldest first)
    const sortReplies = (comments: CommentWithReplies[]) => {
      comments.forEach(comment => {
        if (comment.replies.length > 0) {
          comment.replies.sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
          );
          sortReplies(comment.replies);
        }
      });
    };
    sortReplies(topLevelComments);

    // 8. Apply pagination to top-level comments
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedComments = topLevelComments.slice(startIndex, endIndex);

    return {
      comments: paginatedComments,
      pagination: {
        total: topLevelComments.length,
        page,
        pages: Math.ceil(topLevelComments.length / limit)
      }
    };
  } catch (error) {
    console.error('Error in getCommentsWithReactions:', error);
    throw error;
  }
};

export const CommentServices = {
  getCommentsWithReactions,
  getCommentsByNewsId: getCommentsWithReactions // For backward compatibility
};
