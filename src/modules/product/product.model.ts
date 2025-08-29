import mongoose, { Document, Schema } from 'mongoose';

// Define the product variant interface
interface IVariant {
  name: string;
  options: string[];
}

// Define the product schema interface
interface IProduct extends Document {
  name: string;
  slug: string;
  description: string;
  price: number;
  category: string;
  subCategory?: string;
  brand: string;
  images: string[];
  stock: number;
  rating?: number;
  numReviews?: number;
  isFeatured: boolean;
  variants?: IVariant[];
  specifications?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

// Create the product schema
const variantSchema = new Schema<IVariant>({
  name: { type: String, required: true },
  options: [{ type: String, required: true }]
});

const productSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: String,
      required: true,
    },
    subCategory: {
      type: String,
    },
    brand: {
      type: String,
      required: true,
    },
    images: [
      {
        type: String,
        required: true,
      },
    ],
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    variants: [variantSchema],
    specifications: {
      type: Map,
      of: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Create text index for search
productSchema.index({ name: 'text', description: 'text', category: 'text', brand: 'text' });

// Add pre-save hook to generate slug
productSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

// Create and export the model
export const Product = mongoose.model<IProduct>('Product', productSchema);
