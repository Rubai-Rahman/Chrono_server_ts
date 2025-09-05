import jwt, { SignOptions } from 'jsonwebtoken';
import crypto from 'crypto';
import { config } from '@config/env';

export const signAccessToken = (
  payload: object,
  expiresIn: jwt.SignOptions['expiresIn'] = config.ACCESS_TOKEN_EXPIRES as jwt.SignOptions['expiresIn'],
) => {
  const options: SignOptions = { expiresIn };
  return jwt.sign(payload, config.ACCESS_TOKEN_SECRET, options);
};

export const verifyAccessToken = (token: string) =>
  jwt.verify(token, config.ACCESS_TOKEN_SECRET!);

export const generateRandomToken = (size = 48) =>
  crypto.randomBytes(size).toString('hex');

export const hashToken = (token: string) =>
  crypto.createHash('sha256').update(token).digest('hex');
