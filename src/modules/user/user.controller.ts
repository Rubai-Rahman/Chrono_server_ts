import { NextFunction, Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { UserServices } from './user.service';

const getUserProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const user = req.user;
  const userId = user.id;
  try {
    const result = await UserServices.getUserProfile(userId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const UserController = {
  getUserProfile,
};
