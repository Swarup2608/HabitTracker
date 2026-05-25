import type { Request, Response } from 'express';
import crypto from 'crypto';
import { User, hashPassword } from '../models/User';
import { ApiError } from '../utils/ApiError';
import {
  signAccess,
  issueRefresh,
  verifyRefresh,
  isRefreshActive,
  rotateRefresh,
  revokeRefresh,
} from '../services/token.service';
import { sendVerificationEmail, sendPasswordResetEmail, initializeEmailTransport } from '../services/email.service';
import { env } from '../config/env';

const REFRESH_COOKIE = 'tracker_rt';

function setRefreshCookie(res: Response, token: string) {
  res.cookie(REFRESH_COOKIE, token, {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: 'lax',
    domain: env.COOKIE_DOMAIN || undefined,
    path: '/',
    maxAge: env.JWT_REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000,
  });
}

export async function register(req: Request, res: Response) {
  const { email, username, password } = req.body;
  const exists = await User.findOne({ $or: [{ email }, { username }] }).lean();
  if (exists) throw new ApiError(409, 'Email or username already in use');

  const passwordHash = await hashPassword(password);
  const isDev = process.env.NODE_ENV !== 'production';

  // Skip email verification in development mode
  const user = await User.create({
    email,
    username,
    passwordHash,
    emailVerified: isDev, // Auto-verify in dev
    emailVerificationToken: isDev ? undefined : crypto.createHash('sha256').update(crypto.randomBytes(32).toString('hex')).digest('hex'),
    emailVerificationExpiresAt: isDev ? undefined : new Date(Date.now() + 24 * 60 * 60 * 1000),
    failedLoginAttempts: 0,
  });

  // Send verification email only in production
  if (!isDev) {
    const verificationToken = crypto.randomBytes(32).toString('hex');
    await sendVerificationEmail(email, verificationToken);
  }

  // Auto-login user after registration
  const access = signAccess({ sub: user._id.toString(), username: user.username });
  const refresh = await issueRefresh(user._id.toString());
  setRefreshCookie(res, refresh);

  res.status(201).json({
    user: user.toJSON(),
    accessToken: access,
    message: isDev ? 'Account created! You are now logged in.' : 'Account created! Please check your email to verify your account.',
  });
}

export async function verifyEmail(req: Request, res: Response) {
  const { token } = req.body;
  if (!token) throw new ApiError(400, 'Verification token is required');

  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOneAndUpdate(
    {
      emailVerificationToken: tokenHash,
      emailVerificationExpiresAt: { $gt: new Date() },
    },
    {
      $set: {
        emailVerified: true,
        emailVerificationToken: undefined,
        emailVerificationExpiresAt: undefined,
      },
    },
    { new: true }
  );

  if (!user) throw new ApiError(400, 'Invalid or expired verification token');

  res.json({ ok: true, message: 'Email verified successfully!' });
}

export async function resendVerificationEmail(req: Request, res: Response) {
  const { email } = req.body;
  if (!email) throw new ApiError(400, 'Email is required');

  const user = await User.findOne({ email });

  if (!user) {
    // Don't reveal if email exists to prevent user enumeration
    return res.json({ ok: true });
  }

  if (user.emailVerified) {
    return res.json({ ok: true, message: 'Email already verified' });
  }

  const verificationToken = crypto.randomBytes(32).toString('hex');
  const verificationHash = crypto.createHash('sha256').update(verificationToken).digest('hex');

  await User.updateOne(
    { _id: user._id },
    {
      emailVerificationToken: verificationHash,
      emailVerificationExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    }
  );

  await sendVerificationEmail(email, verificationToken);
  res.json({ ok: true });
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user) throw new ApiError(401, 'Invalid credentials');

  // Check if account is locked
  if (user.lockedUntil && user.lockedUntil > new Date()) {
    const minutesLeft = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
    throw new ApiError(429, `Account is locked. Try again in ${minutesLeft} minutes.`);
  }

  // Check email verification (skip in development mode for testing)
  if (!user.emailVerified && process.env.NODE_ENV === 'production') {
    throw new ApiError(403, 'Please verify your email before logging in');
  }

  const ok = await user.comparePassword(password);

  if (!ok) {
    // Increment failed attempts
    user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;

    if (user.failedLoginAttempts >= 5) {
      // Lock account for 30 minutes
      user.lockedUntil = new Date(Date.now() + 30 * 60 * 1000);
    }

    await user.save();
    throw new ApiError(401, 'Invalid credentials');
  }

  // Reset failed attempts on successful login
  user.failedLoginAttempts = 0;
  user.lockedUntil = undefined;
  await user.save();

  const access = signAccess({ sub: user._id.toString(), username: user.username });
  const refresh = await issueRefresh(user._id.toString());
  setRefreshCookie(res, refresh);

  res.json({ user: user.toJSON(), accessToken: access });
}

export async function refresh(req: Request, res: Response) {
  const token = req.cookies?.[REFRESH_COOKIE];
  if (!token) throw new ApiError(401, 'No refresh token');

  let payload;
  try {
    payload = verifyRefresh(token);
  } catch {
    throw new ApiError(401, 'Invalid refresh token');
  }

  const active = await isRefreshActive(payload.sub, payload.jti);
  if (!active) throw new ApiError(401, 'Refresh token revoked');

  const user = await User.findById(payload.sub);
  if (!user) throw new ApiError(401, 'User not found');

  const newRefresh = await rotateRefresh(payload.sub, payload.jti);
  const access = signAccess({ sub: user._id.toString(), username: user.username });
  setRefreshCookie(res, newRefresh);

  res.json({ accessToken: access, user: user.toJSON() });
}

export async function logout(req: Request, res: Response) {
  const token = req.cookies?.[REFRESH_COOKIE];
  if (token) {
    try {
      const payload = verifyRefresh(token);
      await revokeRefresh(payload.sub, payload.jti);
    } catch {
      /* ignore */
    }
  }
  res.clearCookie(REFRESH_COOKIE, { path: '/' });
  res.json({ ok: true });
}

export async function forgotPassword(req: Request, res: Response) {
  const { email } = req.body;
  const user = await User.findOne({ email });

  // Always return 200 to prevent user enumeration
  if (!user) {
    return res.json({ ok: true });
  }

  const raw = crypto.randomBytes(32).toString('hex');
  user.resetTokenHash = crypto.createHash('sha256').update(raw).digest('hex');
  user.resetTokenExpiresAt = new Date(Date.now() + 30 * 60 * 1000);
  await user.save();

  // Send password reset email
  await sendPasswordResetEmail(email, raw);

  res.json({ ok: true });
}

export async function resetPassword(req: Request, res: Response) {
  const { token, password } = req.body;
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const user = await User.findOne({
    resetTokenHash: tokenHash,
    resetTokenExpiresAt: { $gt: new Date() },
  });
  if (!user) throw new ApiError(400, 'Invalid or expired reset token');
  user.passwordHash = await hashPassword(password);
  user.resetTokenHash = undefined;
  user.resetTokenExpiresAt = undefined;
  // Reset failed login attempts when password is reset
  user.failedLoginAttempts = 0;
  user.lockedUntil = undefined;
  await user.save();
  res.json({ ok: true });
}
