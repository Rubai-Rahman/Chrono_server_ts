import { Product } from './product.model';
import { IProduct } from './product.interface';

export type SortOption =
  | 'price_asc'
  | 'price_desc'
  | 'createdAt_asc'
  | 'createdAt_desc';

interface GetProductsParams {
  page?: string;
  size?: string;
  isFeatured?: string;
  sort?: SortOption;
  limit?: string;
  category?: string;
  brand?: string;
}

export const getProductsFromDB = async (params: GetProductsParams) => {
  const { page, size, isFeatured, sort, limit, category, brand } = params;

  // Build filter query
  const query: Record<string, unknown> = {};
  if (isFeatured === 'true') query.isFeatured = true;
  if (category) query.category = category;
  if (brand) query.brand = brand;

  // Build sort options
  let sortOptions: Record<string, 1 | -1> = { createdAt: -1 }; // default
  switch (sort) {
    case 'price_asc':
      sortOptions = { price: 1 };
      break;
    case 'price_desc':
      sortOptions = { price: -1 };
      break;
    case 'createdAt_asc':
      sortOptions = { createdAt: 1 };
      break;
    case 'createdAt_desc':
      sortOptions = { createdAt: -1 };
      break;
  }

  // Build query options
  const queryOptions: {
    sort: Record<string, 1 | -1>;
    skip?: number;
    limit?: number;
  } = { sort: sortOptions };

  // Pagination
  if (page && size) {
    const pageNum = Math.max(1, parseInt(page, 10));
    const sizeNum = Math.max(1, parseInt(size, 10));
    queryOptions.skip = (pageNum - 1) * sizeNum;
    queryOptions.limit = sizeNum;
  }

  // Limit (overrides pagination if provided)
  if (limit) {
    queryOptions.limit = parseInt(limit, 10);
  }

  // Execute query
  const [products, total] = await Promise.all([
    Product.find(query, undefined, queryOptions).lean<IProduct[]>(),
    Product.countDocuments(query),
  ]);

  return {
    count: total,
    products,
  };
};

export const getProductByIdFromDB = async (id: string) => {
  const product = await Product.findById(id).lean();

  if (!product) {
    throw new Error('Product not found');
  }

  return product;
};

export const createProductIntoDB = async (productData: any) => {
  const product = new Product(productData);
  return await product.save();
};

export const updateProductInDB = async (id: string, updateData: any) => {
  const product = await Product.findByIdAndUpdate(
    id,
    { $set: updateData },
    { new: true, runValidators: true },
  );

  if (!product) {
    throw new Error('Product not found');
  }

  return product;
};

export const deleteProductFromDB = async (id: string) => {
  const result = await Product.findByIdAndDelete(id);

  if (!result) {
    throw new Error('Product not found');
  }

  return result;
};

export const ProductServices = {
  getProductsFromDB,
  getProductByIdFromDB,
  createProductIntoDB,
  updateProductInDB,
  deleteProductFromDB,
};
