import mongoose, { Schema as MongooseSchema } from 'mongoose';
import { TCommentType, commentModel } from './comments.interface';

const { Schema, model } = mongoose;

const CommentSchema = new Schema<TCommentType>({
  newsId: {
    type: MongooseSchema.Types.ObjectId,
    ref: 'News',
    required: true,
  },
  user: {
    type: String,
    ref: 'User',
    required: true,
  },
  message: {
    type: String,
    required: true,
    trim: true,
  },
  date: {
    type: Date,
    default: () => new Date(),
  },
  parentId: {
    type: MongooseSchema.Types.ObjectId,
    ref: 'Comment',
    default: null,
  },
  replyCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  replies: [
    {
      type: MongooseSchema.Types.ObjectId,
      ref: 'Comment',
    },
  ],
  likes: {
    type: Number,
    default: 0,
    min: 0,
  },
  dislikes: {
    type: Number,
    default: 0,
    min: 0,
  },
  userReaction: {
    type: String,
    enum: ['like', 'dislike', null],
    default: null as 'like' | 'dislike' | null,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  updatedAt: {
    type: Date,
  },
  isEdited: {
    type: Boolean,
    default: false,
  },
});

// Optional: auto-update `updatedAt` on save
CommentSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

// Create and export the model
export const Comment = model<TCommentType, commentModel>(
  'comment',
  CommentSchema,
);
