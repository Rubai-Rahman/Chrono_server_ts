import { RefreshToken } from '@modules/user/refreshToken';
import { User } from '@modules/user/user.model';
import { generateRandomToken, hashToken, signAccessToken } from '@utils/token';
import { Request, Response } from 'express';
import mongoose from 'mongoose';

import ms from 'ms'; // optional for readable time parsing

// --- helper to create & store refresh token, returns the raw token
async function createRefreshToken(
  userId: string,
  opts: { ip?: string; ua?: string; expiresIn?: string } = {},
) {
  const raw = generateRandomToken(64);
  const tokenHash = hashToken(raw);
  const expiresMs = opts.expiresIn
    ? ms(opts.expiresIn as ms.StringValue)
    : ms((process.env.REFRESH_TOKEN_EXPIRES || '7d') as ms.StringValue);

  const doc = await RefreshToken.create({
    user: userId,
    tokenHash,
    expiresAt: new Date(Date.now() + expiresMs),
    ip: opts.ip || null,
    userAgent: opts.ua || null,
  });

  return { raw, doc };
}

// LOGIN
export async function login(req: Request, res: Response) {
  const { email, password, rememberMe } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const accessToken = signAccessToken({
    userId: user._id.toString(),
    role: user.role,
  });
  const refreshOpts = {
    ip: req.ip,
    ua: req.headers['user-agent'] as string | undefined,
  };
  const refreshExpiry = rememberMe
    ? process.env.REMEMBER_ME_REFRESH_EXPIRES || '30d'
    : process.env.REFRESH_TOKEN_EXPIRES || '7d';

  const { raw: refreshRaw } = await createRefreshToken(user._id.toString(), {
    ...refreshOpts,
    expiresIn: refreshExpiry,
  });

  // set cookie: HttpOnly + Secure + SameSite
  res.cookie('refreshToken', refreshRaw, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: rememberMe
      ? ms((process.env.REMEMBER_ME_REFRESH_EXPIRES || '30d') as ms.StringValue)
      : undefined,
  });

  res.json({ accessToken, userId: user._id.toString(), role: user.role });
}

// REFRESH
export async function refresh(req: Request, res: Response) {
  const raw = req.cookies.refreshToken;
  if (!raw) return res.status(401).json({ message: 'No refresh token' });

  const tokenHash = hashToken(raw);
  const tokenDoc = await RefreshToken.findOne({ tokenHash });

  if (!tokenDoc || tokenDoc.revoked || tokenDoc.expiresAt < new Date()) {
    // possible reuse attack — revoke tokens for this user
    if (tokenDoc) {
      tokenDoc.revoked = true;
      await tokenDoc.save();
    }
    res.clearCookie('refreshToken');
    return res.status(403).json({ message: 'Invalid refresh token' });
  }

  if (!tokenDoc.user) {
    res.clearCookie('refreshToken');
    return res.status(403).json({ message: 'Invalid refresh token' });
  }
  const { raw: newRaw, doc: newDoc } = await createRefreshToken(
    tokenDoc.user.toString(),
    {
      ip: req.ip,
      ua: req.headers['user-agent'] as string | undefined,
      expiresIn: process.env.REFRESH_TOKEN_EXPIRES,
    },
  );
  tokenDoc.revoked = true;
  tokenDoc.replacedBy = newDoc._id as mongoose.Types.ObjectId;
  await tokenDoc.save();

  // issue new access token
  const accessToken = signAccessToken({ userId: tokenDoc.user.toString() });

  // set new cookie
  res.cookie('refreshToken', newRaw, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: process.env.REFRESH_TOKEN_EXPIRES
      ? ms(process.env.REFRESH_TOKEN_EXPIRES as ms.StringValue)
      : undefined,
  });

  res.json({ accessToken });
}

// LOGOUT
export async function logout(req: Request, res: Response) {
  const raw = req.cookies.refreshToken;
  if (raw) {
    const tokenHash = hashToken(raw);
    await RefreshToken.findOneAndUpdate({ tokenHash }, { revoked: true });
  }
  res.clearCookie('refreshToken');
  res.json({ message: 'Logged out' });
}
