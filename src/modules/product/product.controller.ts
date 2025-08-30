import { NextFunction, Request, Response } from 'express';
import { ProductServices } from './product.service';
import httpStatus from 'http-status';
export const getProducts = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { page, size, isFeatured, sort, limit, category, brand } = req.query;

    const result = await ProductServices.getProductsFromDB({
      page: page as string,
      size: size as string,
      isFeatured: isFeatured as string,
      sort: sort as string,
      limit: limit as string,
      category: category as string,
      brand: brand as string,
    });
    res.status(httpStatus.OK).json(result);
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const result = await ProductServices.getProductByIdFromDB(id);

    res.status(httpStatus.OK).json(result);
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const productData = req.body;
    const result = await ProductServices.createProductIntoDB(productData);

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const productData = req.body;

    const result = await ProductServices.updateProductInDB(id, productData);

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    await ProductServices.deleteProductFromDB(id);

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const ProductController = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
