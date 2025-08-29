import { Document, Types } from 'mongoose';
import { z } from 'zod';

export interface IUserRef extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
}

export interface IComment extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId | IUserRef;
  text: string;
  likes: Types.ObjectId[] | IUserRef[];
  dislikes: Types.ObjectId[] | IUserRef[];
  replies: Types.ObjectId[] | IComment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface INews extends Document {
  _id: Types.ObjectId;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  image: string;
  author: Types.ObjectId;
  categories: string[];
  tags: string[];
  comments: IComment[] | Types.ObjectId[];
  viewCount: number;
  isPublished: boolean;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateNewsDto {
  title: string;
  content: string;
  excerpt?: string;
  image: string;
  categories?: string[];
  tags?: string[];
  isPublished?: boolean;
  publishedAt?: Date;
}

export interface UpdateNewsDto extends Partial<CreateNewsDto> {}

export interface CommentDto {
  text: string;
  parentCommentId?: string;
}

export interface ReactionDto {
  reaction: 'like' | 'dislike';
}

export interface GetNewsQuery {
  page?: string;
  limit?: string;
  category?: string;
  tag?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
