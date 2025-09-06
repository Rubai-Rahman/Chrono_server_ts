import { Request, Response } from 'express';
import { UserServices } from './user.service';
import httpStatus from 'http-status';
import ms from 'ms';

const signUp = async (req: Request, res: Response) => {
  const payload = await UserServices.signUp(req.body);
  const maxAge = process.env.REFRESH_TOKEN_EXPIRES
    ? ms(process.env.REFRESH_TOKEN_EXPIRES as ms.StringValue)
    : 7 * 24 * 60 * 60 * 1000;
  res.cookie('refreshToken', payload.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: maxAge,
  });
  res.status(httpStatus.CREATED).json({
    success: true,
    message: 'User created successfully',
    payload: {
      accessToken: payload.accessToken,
      user: {
        name: payload.user.name,
        email: payload.user.email,
        role: payload.user.role,
        userId: payload.user._id,
      },
    },
  });
};

const logIn = async (req: Request, res: Response) => {
  const payload = await UserServices.logIn(req.body);
  const maxAge = process.env.REFRESH_TOKEN_EXPIRES
    ? ms(process.env.REFRESH_TOKEN_EXPIRES as ms.StringValue)
    : 7 * 24 * 60 * 60 * 1000;
  res.cookie('refreshToken', payload.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: maxAge,
  });
  res.status(httpStatus.CREATED).json({
    success: true,
    message: 'User logged in successfully',
    payload: {
      accessToken: payload.accessToken,
      user: {
        name: payload.user.name,
        email: payload.user.email,
        role: payload.user.role,
        userId: payload.user._id,
      },
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
