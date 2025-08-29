import request from 'supertest';
import { app } from '../app';
import { Product } from '@modules/product/product.model';

const testProduct = {
  name: 'Test Product',
  description: 'Test Description',
  price: 99.99,
  category: 'Test Category',
  stock: 10,
  images: ['image1.jpg', 'image2.jpg'],
  brand: 'Test Brand',
  rating: 0,
  numReviews: 0,
};

describe('Product API', () => {
  describe('GET /api/products', () => {
    it('should return all products', async () => {
      // Create test products
      await Product.create([
        { ...testProduct, name: 'Product 1' },
        { ...testProduct, name: 'Product 2' },
      ]);

      const res = await request(app).get('/api/products');
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(2);
    });

    it('should filter products by category', async () => {
      // Create test products with different categories
      await Product.create([
        { ...testProduct, name: 'Electronics 1', category: 'Electronics' },
        { ...testProduct, name: 'Clothing 1', category: 'Clothing' },
      ]);

      const res = await request(app).get('/api/products?category=Electronics');
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].category).toBe('Electronics');
    });
  });

  describe('GET /api/products/:id', () => {
    it('should return a single product by ID', async () => {
      const product = await Product.create(testProduct);
      
      const res = await request(app).get(`/api/products/${product._id}`);
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe(testProduct.name);
    });

    it('should return 404 if product not found', async () => {
      const nonExistentId = '507f1f77bcf86cd799439011'; // Valid ObjectId but doesn't exist
      
      const res = await request(app).get(`/api/products/${nonExistentId}`);
      
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  // Add more test cases for other endpoints (POST, PUT, DELETE)
  // Note: You'll need to implement authentication for protected routes
});
