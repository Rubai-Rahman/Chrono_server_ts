import { Request, Response } from 'express';
import { User } from './user.model';
import ms from 'ms'; // optional for parsing durations
import { generateRandomToken, hashToken, signAccessToken } from '@utils/token';
import { RefreshToken } from './refreshToken';
import { config } from '@config/env';
import mongoose from 'mongoose';
import { UserServices } from './user.service';
import httpStatus from 'http-status';

const SignUP = async (req: Request, res: Response) => {
  const payload = await UserServices.signUpUser(req.body);
  res.status(httpStatus.CREATED).json({
    success: true,
    message: 'User created successfully',
    payload: {
      accessToken: signAccessToken({ userId: payload._id.toString() }),
      userId: payload._id.toString(),
      role: payload.role,
    },
  });
};

async function createRefreshToken(
  userId: string,
  ip?: string,
  ua?: string,
  expiresIn?: string,
) {
  const raw = generateRandomToken(64);
  const tokenHash = hashToken(raw);
  const ttl = expiresIn
    ? ms(expiresIn as ms.StringValue)
    : ms((config.REFRESH_TOKEN_EXPIRES as ms.StringValue) || '7d');
  const doc = await RefreshToken.create({
    user: userId,
    tokenHash,
    expiresAt: new Date(Date.now() + ttl),
  });
  return { raw, doc };
}

const login = async (req: Request, res: Response) => {
  const { email, password, rememberMe } = req.body;

  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const accessToken = signAccessToken({
    userId: user._id.toString(),
    role: user.role,
  });
  const refreshExpiry = rememberMe
    ? config.REMEMBER_ME_REFRESH_EXPIRES || '30d'
    : config.REFRESH_TOKEN_EXPIRES || '7d';
  const { raw: refreshRaw, doc } = await createRefreshToken(
    user._id.toString(),
    req.ip,
    req.headers['user-agent'] as string,
    refreshExpiry,
  );

  // set HttpOnly cookie (refresh token)
  res.cookie('refreshToken', refreshRaw, {
    httpOnly: true,
    secure: config.NODE_ENV === 'production',
    sameSite: 'lax', // consider 'strict' if you don't need cross-site navigation
    maxAge: parseInt(String(ms(refreshExpiry as ms.StringValue))),
    path: '/api/refresh-token',
  });

  res.json({ accessToken, userId: user._id.toString(), role: user.role });
};

const refresh = async (req: Request, res: Response) => {
  const raw = req.cookies.refreshToken;
  if (!raw) return res.status(401).json({ message: 'No refresh token' });

  const tokenHash = hashToken(raw);
  const tokenDoc = await RefreshToken.findOne({ tokenHash });

  if (!tokenDoc || tokenDoc.revoked || tokenDoc.expiresAt < new Date()) {
    if (tokenDoc) {
      tokenDoc.revoked = true;
      await tokenDoc.save();
    }
    res.clearCookie('refreshToken');
    return res.status(403).json({ message: 'Invalid refresh token' });
  }

  // rotate: issue new refresh token
  const { raw: newRaw, doc: newDoc } = await createRefreshToken(
    tokenDoc.user.toString(),
    req.ip,
    req.headers['user-agent'] as string,
  );
  tokenDoc.revoked = true;
  tokenDoc.replacedBy = newDoc._id as mongoose.Types.ObjectId;
  await tokenDoc.save();

  const accessToken = signAccessToken({ userId: tokenDoc.user.toString() });
  res.cookie('refreshToken', newRaw, {
    httpOnly: true,
    secure: config.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: parseInt(
      String(ms((config.REFRESH_TOKEN_EXPIRES as ms.StringValue) || '7d')),
    ),
    path: '/api/refresh-token',
  });

  res.json({ accessToken });
};

const logout = async (req: Request, res: Response) => {
  const raw = req.cookies.refreshToken;
  if (raw) {
    const tokenHash = hashToken(raw);
    await RefreshToken.findOneAndUpdate({ tokenHash }, { revoked: true });
  }
  res.clearCookie('refreshToken');
  res.json({ message: 'Logged out' });
};

export const userController = {
  SignUP,
  login,
  refresh,
  logout,
};
