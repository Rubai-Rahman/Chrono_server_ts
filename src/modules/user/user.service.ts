import { generateRandomToken, hashToken, signAccessToken } from '@utils/token';
import { User } from './user.model';
import ms from 'ms'; // optional for parsing durations
import { RefreshToken } from './refreshToken';
import crypto from 'crypto';
import { TUser } from './user.interface';

async function createRefreshToken(
  userId: string,
  rememberMe?: boolean,
  ip?: string,
  ua?: string,
) {
  const raw = generateRandomToken(64);
  const tokenHash = hashToken(raw);
  const ttl = rememberMe
    ? ms((process.env.REMEMBER_ME_REFRESH_EXPIRES as ms.StringValue) || '30d')
    : ms((process.env.REFRESH_TOKEN_EXPIRES as ms.StringValue) || '7d');

  const doc = await RefreshToken.create({
    user: userId,
    tokenHash,
    expiresAt: new Date(Date.now() + ttl),
  });

  return { raw, doc, ttl };
}

const refresh = async (rawToken: string) => {
  if (!rawToken) throw new Error('No token');

  const tokenHash = hashToken(rawToken);
  const existing = await RefreshToken.findOne({ tokenHash });
  if (!existing || existing.revoked || existing.expiresAt < new Date()) {
    if (existing) ((existing.revoked = true), await existing.save());
    throw new Error('Invalid refresh token');
  }

  const { raw, ttl, doc } = await createRefreshToken(
    existing.user.toString(),
    false,
    undefined,
    undefined,
  );
  existing.revoked = true;
  existing.replacedBy = doc._id;
  await existing.save();

  const accessToken = signAccessToken({ userId: existing.user.toString() });
  return { accessToken, refreshToken: raw, refreshTtl: ttl };
};

const signUp = async (userData: TUser) => {
  const { email, password, role, name } = userData;

  if (await User.isEmailUserNameExists(email, name)) {
    throw new Error('User already exists');
  }

  const user = await User.create(userData);
  const accessToken = signAccessToken({ userId: user._id.toString() });

  return { user, accessToken };
};

//login service

const logIn = async (dto: TUser, ip?: string, ua?: string) => {
  const { email, password, rememberMe } = dto;
  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password)))
    throw new Error('Invalid credentials');

  const accessToken = signAccessToken({
    userId: user._id.toString(),
    role: user.role,
  });
  const { raw, ttl } = await createRefreshToken(
    user._id.toString(),
    rememberMe,
    ip,
    ua,
  );

  return { user, accessToken, refreshToken: raw, refreshTtl: ttl };
};

const logout = async (rawToken: string) => {
  if (!rawToken) return;
  const tokenHash = hashToken(rawToken);
  await RefreshToken.findOneAndUpdate({ tokenHash }, { revoked: true });
};

const forgotPassword = async (email: string) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error('User not found');
  }
  const rawToken = crypto.randomBytes(6).toString('hex');
  user.resetToken = rawToken;
  user.resetTokenExpiry = new Date(
    Date.now() + ms(process.env.PASSWORD_RESET_EXPIRES as ms.StringValue),
  );
  await user.save();
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${rawToken}`;
  const message = `<p>Click <a href=${resetUrl}>here</a> to reset your password</p>`;

  const transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: 'Reset Password',
    html: message,
  });
};

const resetPassword = async (data: TUser) => {
 const found = await User.findOne({
      _id: data.id,
      resetToken: hashToken(data.token),
      resetTokenExpiry: { $gt: new Date() },
    });
    if (!found) throw new Error("Invalid or expired token");

    found.password = data.password;
    found.resetToken = null;
    found.resetTokenExpiry = null;
    await found.save();

    await RefreshToken.updateMany({ user: data.id }, { revoked: true });
};

export const UserServices = {
  signUp,
  createRefreshToken,
  logIn,
  logout,
  refresh,
  forgotPassword,
  resetPassword,
};
