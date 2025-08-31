import { Request, Response, NextFunction, RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { User } from '../modules/user/user.model';

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
  const jwtSecret = process.env.JWT_SECRET || 'your_jwt_secret';

  // Get token from header
  const token = req.header('Authorization')?.replace('Bearer ', '');
  console.log('token', token);
  if (!token) {
    res
      .status(401)
      .json({ success: false, error: 'No token, authorization denied' });
    return;
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, jwtSecret) as { id: string };

    // Get user from the token
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      res.status(401).json({
        success: false,
        error: 'User not found',
      });
      return;
    }

    // Add user to request object
    authReq.user = user;
    authReq.token = token;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({
      success: false,
      error: 'Token is not valid',
    });
  }
};

// Admin middleware
export const adminMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({
      success: false,
      error: 'Not authorized as an admin',
    });
  }
};
