import express from 'express';
import { ProductController } from './product.controller';

const router = express.Router();

// Product routes
router.get('/', ProductController.getProducts);
router.get('/:id', ProductController.getProductById);
router.post('/', ProductController.createProduct);
router.put('/:id', ProductController.updateProduct);
router.delete('/:id', ProductController.deleteProduct);

export const ProductRoutes = router;
