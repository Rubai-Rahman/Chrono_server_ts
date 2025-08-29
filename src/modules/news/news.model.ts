import mongoose, { Document, Schema, Model, Types } from 'mongoose';
import { IComment, INews } from './news.interface';
import { ApiError } from '../../utils/ApiError';
import httpStatus from 'http-status';

// Comment Schema
const commentSchema = new Schema<IComment>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 1000,
    },
    likes: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: [],
    }],
    dislikes: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: [],
    }],
    replies: [{
      type: Schema.Types.ObjectId,
      ref: 'Comment',
      default: [],
    }],
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

// Comment Schema is already defined above

// News Schema
const newsSchema = new Schema<INews>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [5, 'Title must be at least 5 characters long'],
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
      minlength: [10, 'Content must be at least 10 characters long'],
    },
    excerpt: {
      type: String,
      maxlength: [500, 'Excerpt cannot exceed 500 characters'],
    },
    image: {
      type: String,
      required: [true, 'Image URL is required'],
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author is required'],
    },
    categories: [{
      type: String,
      trim: true,
    }],
    tags: [{
      type: String,
      trim: true,
      lowercase: true,
    }],
    comments: [{
      type: commentSchema,
      default: [],
    }],
    viewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    publishedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

// Text index for search
newsSchema.index({ 
  title: 'text', 
  content: 'text', 
  excerpt: 'text',
  categories: 'text',
  tags: 'text'
}, {
  weights: {
    title: 10,
    content: 5,
    excerpt: 3,
    categories: 2,
    tags: 1
  },
  name: 'text_search'
});

// Indexes for better query performance
newsSchema.index({ author: 1 });
newsSchema.index({ isPublished: 1, publishedAt: -1 });
newsSchema.index({ slug: 1 }, { unique: true });

/**
 * Pre-save hook to generate slug from title
 */
newsSchema.pre<INews>('save', function (next) {
  if (this.isModified('title') && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

/**
 * Pre-save hook to set publishedAt when article is published
 */
newsSchema.pre<INews>('save', function (next) {
  if (this.isModified('isPublished') && this.isPublished && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

// Virtual for comment count
newsSchema.virtual('commentCount').get(function (this: INews) {
  return this.comments?.length || 0;
});

/**
 * Check if user has liked a comment
 */
commentSchema.methods.hasLiked = function (this: IComment, userId: string): boolean {
  return this.likes.some((id: Types.ObjectId) => id.toString() === userId);
};

/**
 * Check if user has disliked a comment
 */
commentSchema.methods.hasDisliked = function (this: IComment, userId: string): boolean {
  return this.dislikes.some((id: Types.ObjectId) => id.toString() === userId);
};

/**
 * Add a reply to a comment
 */
commentSchema.methods.addReply = function (this: IComment, reply: IComment): void {
  this.replies.push(reply);
};

// Interface for News Model
interface INewsModel extends Model<INews> {
  findBySlug(slug: string): Promise<INews | null>;
  incrementViewCount(id: string): Promise<INews | null>;
  findByCategory(category: string, limit?: number): Promise<INews[]>;
  search(query: string, limit?: number, page?: number): Promise<{ data: INews[]; total: number }>;
}

/**
 * Find news article by slug
 */
newsSchema.statics.findBySlug = async function (this: INewsModel, slug: string): Promise<INews | null> {
  return this.findOne({ slug })
    .populate('author', 'name email')
    .populate('comments.user', 'name email')
    .lean();
};

/**
 * Increment view count for a news article
 */
newsSchema.statics.incrementViewCount = async function (this: INewsModel, id: string): Promise<INews | null> {
  if (!Types.ObjectId.isValid(id)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid news ID');
  }
  
  return this.findByIdAndUpdate(
    id,
    { $inc: { viewCount: 1 } },
    { new: true }
  );
};

/**
 * Find news articles by category
 */
newsSchema.statics.findByCategory = async function (
  this: INewsModel,
  category: string,
  limit: number = 10
): Promise<INews[]> {
  return this.find({ 
    categories: { $in: [category] },
    isPublished: true 
  })
  .sort({ publishedAt: -1 })
  .limit(limit)
  .populate('author', 'name email')
  .lean();
};

/**
 * Search news articles
 */
newsSchema.statics.search = async function (
  this: INewsModel,
  query: string,
  limit: number = 10,
  page: number = 1
): Promise<{ data: INews[]; total: number }> {
  const skip = (page - 1) * limit;
  
  const [data, total] = await Promise.all([
    this.find(
      { $text: { $search: query } },
      { score: { $meta: 'textScore' } }
    )
    .sort({ score: { $meta: 'textScore' } })
    .skip(skip)
    .limit(limit)
    .populate('author', 'name email')
    .lean(),
    
    this.countDocuments({ $text: { $search: query } })
  ]);
  
  return { data, total };
};

// Create and export the model
export const News = mongoose.model<INews, INewsModel>('News', newsSchema);

export default News;
