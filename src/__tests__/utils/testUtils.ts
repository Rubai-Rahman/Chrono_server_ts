import { Types } from 'mongoose';

export interface IUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: string;
  isEmailVerified?: boolean;
  [key: string]: any;
}

export const createTestUser = (overrides: Partial<IUser> = {}): IUser => {
  const id = overrides._id || new Types.ObjectId();
  return {
    _id: id,
    name: 'Test User',
    email: `test-${id}@example.com`,
    password: 'password123',
    role: 'user',
    isEmailVerified: true,
    ...overrides,
  };
};

export interface ITestNews {
  _id?: Types.ObjectId;
  title: string;
  content: string;
  author: Types.ObjectId | string;
  tags?: string[];
  isPublished?: boolean;
  comments?: Array<{
    _id: Types.ObjectId;
    user: Types.ObjectId | string;
    text: string;
    likes: Types.ObjectId[];
    dislikes: Types.ObjectId[];
    createdAt?: Date;
    updatedAt?: Date;
  }>;
  [key: string]: any;
}

export const createTestNews = (authorId: string | Types.ObjectId, overrides: Partial<ITestNews> = {}): ITestNews => ({
  title: 'Test News Article',
  content: 'This is a test news article content.',
  author: authorId,
  tags: ['test', 'news'],
  isPublished: true,
  comments: [],
  ...overrides,
});

export interface ITestComment {
  _id?: Types.ObjectId;
  text: string;
  user: Types.ObjectId | string;
  likes: Types.ObjectId[];
  dislikes: Types.ObjectId[];
  createdAt?: Date;
  updatedAt?: Date;
  [key: string]: any;
}

export const createTestComment = (userId: string | Types.ObjectId, overrides: Partial<ITestComment> = {}): ITestComment => {
  const id = new Types.ObjectId();
  return {
    _id: id,
    text: 'This is a test comment',
    user: userId,
    likes: [],
    dislikes: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
};
