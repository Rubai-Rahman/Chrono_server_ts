import { Model, Types } from 'mongoose';

export interface TCommentType {
  _id: Types.ObjectId;
  newsId: Types.ObjectId;
  user: Types.ObjectId;
  message: string;
  date: Date;
  parentId?: Types.ObjectId | null;
  replyCount?: number;
  replies?: Types.ObjectId[] | TCommentType[];
  likes?: number;
  dislikes?: number;
  userReaction?: 'like' | 'dislike' | null;
  isDeleted?: boolean;
  updatedAt?: Date;
  isEdited?: boolean;
}

export interface CommentDocument extends TCommentType, Document {}

export interface commentModel extends Model<CommentDocument> {}
