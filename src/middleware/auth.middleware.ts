import { Request, Response, NextFunction } from 'express';
import { User } from '../modules/user/user.model';
import admin from '@config/firebase';
import * as cookie from 'cookie';

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
  let idToken: string | null = null;
  const authHeader = req.header('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    idToken = authHeader.split(' ')[1];
  }

  // If no header, try cookie
  if (!idToken && req.headers.cookie) {
    const cookies = cookie.parse(req.headers.cookie);
    if (cookies.token) {
      idToken = cookies.token;
    }
  }

  if (!idToken) {
    res
      .status(401)
      .json({ success: false, error: 'No token, authorization denied' });
    return;
  }

  try {
    const decoded = await admin.auth().verifyIdToken(idToken);

    // Find or create user in your DB
    let user = await User.findOne({ email: decoded.email });
    if (!user) {
      // Create a username from email if name is not available
      const username = decoded.name.toLowerCase().replace(/\s+/g, '_');

      user = await User.create({
        email: decoded.email,
        name: decoded.name || 'User',
        displayName: decoded.name || 'User',
        role: 'user',
        photoUrl: decoded.picture || '',
      });
    }

    authReq.user = user;
    authReq.token = idToken;
    next();
  } catch (error) {
    console.error('Firebase Auth error:', error);
    res.status(401).json({ success: false, error: 'Invalid Firebase token' });
  }
};
