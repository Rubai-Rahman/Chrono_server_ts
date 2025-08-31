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

  let idToken: string | null = null;
  const rawToken = req.header('Authorization')?.replace('Bearer ', '') ?? null;

  try {
    // if it's JSON, parse it
    const parsed = JSON.parse(rawToken ?? '{}');
    idToken = parsed.idToken || rawToken;
  } catch {
    // if it's already just a string, use as is
    idToken = rawToken;
  }
  console.log('token', idToken);
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
      user = await User.create({
        email: decoded.email,
        name: decoded.name || 'No Name',
        role: 'user', // default role
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
