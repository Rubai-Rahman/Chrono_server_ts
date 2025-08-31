import { Request, Response, NextFunction } from 'express';
import { User } from '../modules/user/user.model';
import admin from '@config/firebase';

export interface AuthRequest extends Request {
  user?: any;
  token?: string;
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const authReq = req as AuthRequest;

  const token = req.header('Authorization')?.replace('Bearer ', '');
  console.log('token', token);
  if (!token) {
    res
      .status(401)
      .json({ success: false, error: 'No token, authorization denied' });
    return;
  }

  try {
    // ✅ Verify with Firebase Admin
    const decoded = await admin.auth().verifyIdToken(token);

    // Find or create user in your DB
    let user = await User.findOne({ email: decoded.email });
    if (!user) {
      user = await User.create({
        email: decoded.email,
        name: decoded.name || 'No Name',
        role: 'user', // default role
      });
    }

    authReq.user = user;
    authReq.token = token;
    next();
  } catch (error) {
    console.error('Firebase Auth error:', error);
    res.status(401).json({ success: false, error: 'Invalid Firebase token' });
  }
};
