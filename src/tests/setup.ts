import { connectDB } from '@config/database';
import { config } from '@config/env';
import mongoose from 'mongoose';

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.MONGO_URI = process.env.TEST_MONGO_URI || 'mongodb://localhost:27017/chrono-test';

// Global test setup
beforeAll(async () => {
  // Connect to the test database
  await connectDB();
});

// Global test teardown
afterAll(async () => {
  // Close the database connection
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

// Clean up after each test
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});
