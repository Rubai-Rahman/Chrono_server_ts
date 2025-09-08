import { Request, Response } from 'express';
import { UserServices } from './user.service';
import httpStatus from 'http-status';
import ms from 'ms';

const signUp = async (req: Request, res: Response) => {
  const payload = await UserServices.signUp(req.body);
  const maxAge = process.env.REFRESH_TOKEN_EXPIRES
    ? ms(process.env.REFRESH_TOKEN_EXPIRES as ms.StringValue)
    : 7 * 24 * 60 * 60 * 1000;

  res.status(httpStatus.CREATED).json({
    success: true,
    message: 'User created successfully',
    payload: {
      accessToken: payload.accessToken,
      refreshToken: payload.refreshToken,
      maxAge: maxAge,
      user: {
        name: payload.user.name,
        email: payload.user.email,
        role: payload.user.role,
      },
    },
  });
};

const logIn = async (req: Request, res: Response) => {
  const payload = await UserServices.logIn(req.body);

  const maxAge = process.env.REFRESH_TOKEN_EXPIRES
    ? ms(process.env.REFRESH_TOKEN_EXPIRES as ms.StringValue)
    : 7 * 24 * 60 * 60 * 1000;

  res.status(httpStatus.CREATED).json({
    success: true,
    message: 'User logged in successfully',
    payload: {
      accessToken: payload.accessToken,
      refreshToken: payload.refreshToken,
      maxAge: maxAge,
      user: {
        name: payload.user.name,
        email: payload.user.email,
        role: payload.user.role,
      },
    },
  });
  console.log('checkRes===', res);
};

const changePassword = async (req: Request, res: Response) => {
  const payload = await UserServices.changePassword(req.body);
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

const resetPassword = async (req: Request, res: Response) => {
  const payload = await UserServices.resetPassword(req.body);
  res.status(httpStatus.CREATED).json({
    success: true,
    message: 'Password reset successfully',
    payload: payload,
  });
};
const logout = async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.refreshToken;
  if (!refreshToken) {
    res.status(400).json({ success: false, message: 'No refresh token' });
    return;
  }
  const payload = await UserServices.logout(refreshToken);
  res.status(httpStatus.CREATED).json({
    success: true,
    message: 'User logged out successfully',
    payload: payload,
  });
};

const refresh = async (req: Request, res: Response): Promise<void> => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    console.log('refreshToken===', req);
    if (!refreshToken) {
      res.status(401).json({ success: false, message: 'No refresh token' });
      return;
    }

    const payload = await UserServices.refresh(refreshToken);

    // If refresh token was rotated, re-set cookie
    if (payload.refreshToken) {
      res.cookie('refreshToken', payload.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: ms(
          (process.env.REFRESH_TOKEN_EXPIRES as ms.StringValue) ?? '7d',
        ),
      });
    }

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      payload,
    });
  } catch (err) {
    console.error('refresh error:', err);
    res.status(403).json({ success: false, message: 'Invalid refresh token' });
  }
};

const googleSignIn = async (req: Request, res: Response) => {
  try {
    const { idToken, rememberMe } = req.body;
    if (!idToken) {
      return res
        .status(400)
        .json({ success: false, message: 'Missing idToken' });
    }

    const payload = await UserServices.googleSignIn({
      idToken,
      rememberMe,
      ip: req.ip,
      ua: req.get('user-agent') ?? undefined,
    });

    // set refresh token cookie (HttpOnly)
    res.cookie('refreshToken', payload.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', // or 'none' if cross-site (see notes)
      maxAge: payload.refreshTtl,
    });

    res.status(httpStatus.OK).json({
      success: true,
      message: 'User logged in with Google',
      payload: {
        accessToken: payload.accessToken,
        user: {
          name: payload.user.name,
          email: payload.user.email,
          role: payload.user.role,
          avatar: payload.user.avatar,
        },
      },
    });
  } catch (err: any) {
    console.error('googleSignIn error', err);
    res.status(400).json({
      success: false,
      message: err.message || 'Google sign-in failed',
    });
  }
};

export const userController = {
  signUp,
  logIn,
  resetPassword,
  changePassword,
  forgotPassword,
  logout,
  refresh,
  googleSignIn,
};
