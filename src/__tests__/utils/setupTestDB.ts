import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer: MongoMemoryServer;

// Set up test environment variables
process.env.NODE_ENV = 'test';
process.env.MONGO_URI = 'mongodb://localhost:27017/testdb';
process.env.JWT_SECRET = 'test-secret';
process.env.JWT_EXPIRES_IN = '1d';

/**
 * Connect to the in-memory database.
 */
export const connectDB = async (): Promise<void> => {
  mongoServer = await MongoMemoryServer.create({
    instance: {
      dbName: 'testdb',
      port: 27017,
      dbPath: './test/data/db',
      storageEngine: 'wiredTiger',
    },
  });

  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
};

/**
 * Drop database, close the connection and stop mongod.
 */
export const closeDatabase = async (): Promise<void> => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  }
  
  if (mongoServer) {
    await mongoServer.stop();
  }
};

/**
 * Remove all the data for all db collections.
 */
export const clearDatabase = async (): Promise<void> => {
  const collections = mongoose.connection.collections;

  for (const key in collections) {
    try {
      const collection = collections[key];
      await collection.deleteMany({});
    } catch (error) {
      console.error(`Error clearing collection ${key}:`, error);
    }
  }
};

/**
 * Setup test database before any tests run
 */
export const setupTestDB = (): void => {
  // Set timeout for beforeAll to 30 seconds
  jest.setTimeout(30000);

  // Connect to the in-memory database before tests run
  beforeAll(async () => {
    try {
      await connectDB();
    } catch (error) {
      console.error('Error connecting to test database:', error);
      throw error;
    }
  });

  // Clear all test data after each test
  afterEach(async () => {
    try {
      await clearDatabase();
    } catch (error) {
      console.error('Error clearing test database:', error);
    }
  });

  // Remove and close the db and server after all tests
  afterAll(async () => {
    try {
      await closeDatabase();
    } catch (error) {
      console.error('Error closing test database:', error);
    }
  });
};

export default setupTestDB;
