import request from 'supertest';
import mongoose, { Types } from 'mongoose';
import { News,} from '../news.model';
import { IComment, INews } from '../news.interface';
import { setupTestDB } from '../../../__tests__/utils/setupTestDB';
import {
  createTestUser,
  createTestNews as createTestNewsUtil,
  IUser
} from '../../../__tests__/utils/testUtils';
import app from '../../../app';

// Mock the auth middleware
jest.mock('../../../middleware/auth', () => ({
  auth: jest.fn((req, res, next) => {
    req.user = { _id: 'test-user-id', role: 'user' };
    next();
  }),
  authorizeRoles: (...roles: string[]) => {
    return (req: any, res: any, next: any) => {
      if (roles.includes(req.user.role)) {
        next();
      } else {
        res.status(403).json({ success: false, message: 'Not authorized' });
      }
    };
  },
}));

describe('News Controller', () => {
  let testUser: IUser;
  let testNews: INews & { _id: Types.ObjectId };
  let authToken: string;

  beforeAll(async () => {
    // Setup test database
    await setupTestDB();

    // Create a test user
    testUser = createTestUser({ role: 'admin' });
    await mongoose.connection.collection('users').insertOne(testUser);

    // Mock token
    authToken = 'test-auth-token';
  });

  beforeEach(async () => {
    // Create a test news article before each test
    const newsData = createTestNewsUtil(testUser._id);
    testNews = await News.create(newsData);
  });

  afterEach(async () => {
    await News.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  describe('GET /api/v1/news', () => {
    it('should return all news articles', async () => {
      // Create multiple test news articles
      const newsData = [
        createTestNewsUtil(testUser._id, { title: 'News 1' }),
        createTestNewsUtil(testUser._id, { title: 'News 2' }),
      ];
      await News.insertMany(newsData);

      const res = await request(app)
        .get('/api/v1/news')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBe(3); // 2 new + 1 from beforeEach
    });
  });

  describe('GET /api/v1/news/:id', () => {
    it('should get a single news article by id', async () => {
      // Ensure testNews is created and has an _id
      if (!testNews || !testNews._id) {
        throw new Error('Test news not properly initialized');
      }

      const res = await request(app)
        .get(`/api/v1/news/${testNews._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe(testNews.title);
    });

    it('should return 404 if news not found', async () => {
      const nonExistentId = new Types.ObjectId();
      const res = await request(app)
        .get(`/api/v1/news/${nonExistentId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/news/:id/comments', () => {
    it('should add a comment to a news article', async () => {
      const commentData = {
        text: 'Test comment',
      };

      const res = await request(app)
        .post(`/api/v1/news/${testNews._id}/comments`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(commentData);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify the comment was added by fetching the news again
      const updatedNews = await News.findById(testNews._id).populate('comments');
      expect(updatedNews?.comments).toHaveLength(1);
      
      // Access the comment directly from the populated comments array
      const comment = updatedNews?.comments[0];
      if (comment && typeof comment === 'object' && 'text' in comment) {
        expect(comment.text).toBe(commentData.text);
      } else {
        fail('Comment not found or invalid format');
      }
    });

    it('should return 404 if news article not found', async () => {
      const nonExistentId = new Types.ObjectId();
      const commentData = {
        text: 'Test comment',
      };

      const res = await request(app)
        .post(`/api/v1/news/${nonExistentId}/comments`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(commentData);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/news/:id/react/:reactionType', () => {
    it('should add a like to a news article', async () => {
      // First, add a comment to react to
      const news = await News.findById(testNews._id);
      if (!news) throw new Error('Test news not found');
      
      // Create a comment object that matches the expected schema
      const comment = {
        user: testUser._id,
        text: 'Test comment',
        _id: new Types.ObjectId()
      };
      
      // Push the comment and save
      news.comments.push(comment as any);
      await news.save();
      
      // Get the saved comment ID
      const updatedNews = await News.findById(news._id).orFail(new Error('Failed to find updated news'));
      if (!updatedNews.comments || updatedNews.comments.length === 0) {
        throw new Error('No comments found after saving');
      }
      const commentId = (updatedNews.comments[0] as any)._id;
      
      const res = await request(app)
        .post(`/api/v1/news/comments/${commentId.toString()}/react/like`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.likes).toContain(testUser._id.toString());
    });
  });
});
