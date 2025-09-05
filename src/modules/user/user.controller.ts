import { Request, Response } from 'express';
import { UserServices } from './user.service';
import httpStatus from 'http-status';

const signUp = async (req: Request, res: Response) => {
  const payload = await UserServices.signUp(req.body);
  res.status(httpStatus.CREATED).json({
    success: true,
    message: 'User created successfully',
    payload: {
      accessToken: payload.accessToken,
      user: payload.user,
    },
  });
};

const logIn = async (req: Request, res: Response) => {
  const payload = await UserServices.logIn(req.body);
  res.status(httpStatus.CREATED).json({
    success: true,
    message: 'User logged in successfully',
    payload: {
      accessToken: payload.accessToken,
      user: payload.user,
    },
  });
};

const resetPassword = async (req: Request, res: Response) => {
  const payload = await UserServices.resetPassword(req.body);
  res.status(httpStatus.CREATED).json({
    success: true,
    message: 'Password reset successfully',
    payload: payload,
  });
};

const forgotPassword = async (req: Request, res: Response) => {
  const payload = await UserServices.forgotPassword(req.body);
  res.status(httpStatus.CREATED).json({
    success: true,
    message: 'Password reset successfully',
    payload: payload,
  });
};

const logout = async (req: Request, res: Response) => {
  const payload = await UserServices.logout(req.body);
  res.status(httpStatus.CREATED).json({
    success: true,
    message: 'User logged out successfully',
    payload: payload,
  });
};

const refresh = async (req: Request, res: Response) => {
  const payload = await UserServices.refresh(req.body);
  res.status(httpStatus.CREATED).json({
    success: true,
    message: 'User logged out successfully',
    payload: payload,
  });
};

export const userController = {
  signUp,
  logIn,
  resetPassword,
  forgotPassword,
  logout,
  refresh,
};
