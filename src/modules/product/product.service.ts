import { Product } from './product.model';
import { IProduct } from './product.interface';

interface GetProductsParams {
  page?: string;
  size?: string;
  isFeatured?: string;
  sort?: string;
  limit?: string;
  category?: string;
  brand?: string;
}

export const getProductsFromDB = async (params: GetProductsParams) => {
  const { page, size, isFeatured, sort, limit, category, brand } = params;
  const query: any = {};

  if (isFeatured === 'true') {
    query.isFeatured = true;
  }

  if (category) {
    query.category = category;
  }

  if (brand) {
    query.brand = brand;
  }

  // Build sort options
  let sortOptions: any = { createdAt: -1 }; // Default sort

  if (sort === 'price_asc') {
    sortOptions = { price: 1 };
  } else if (sort === 'price_desc') {
    sortOptions = { price: -1 };
  } else if (sort === 'createdAt_asc') {
    sortOptions = { createdAt: 1 };
  } else if (sort === 'createdAt_desc') {
    sortOptions = { createdAt: -1 };
  }

  // Build query options
  let queryOptions: any = { sort: sortOptions };

  // Apply limit if provided
  if (limit) {
    queryOptions.limit = parseInt(limit, 10);
  }

  // Apply pagination if both page and size are provided
  if (page && size) {
    const pageNum = parseInt(page, 10);
    const sizeNum = parseInt(size, 10);
    queryOptions.skip = (pageNum - 1) * sizeNum;
    queryOptions.limit = sizeNum;
  }

  // Execute query
  const [products, total] = await Promise.all([
    Product.find(query, null, queryOptions).lean(),
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
