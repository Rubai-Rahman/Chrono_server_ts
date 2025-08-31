import mongoose, { Schema, Document } from 'mongoose';

export interface ICommentReaction extends Document {
  commentId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  reaction: 'like' | 'dislike';
  createdAt?: Date;
  updatedAt?: Date;
}

const CommentReactionSchema = new Schema<ICommentReaction>(
  {
    commentId: {
      type: Schema.Types.ObjectId,
      ref: 'Comment',
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reaction: {
      type: String,
      enum: ['like', 'dislike'],
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// Create a compound index to ensure one reaction per user per comment
CommentReactionSchema.index({ commentId: 1, userId: 1 }, { unique: true });

export const CommentReaction = mongoose.model<ICommentReaction>(
  'CommentReaction',
  CommentReactionSchema,
);
