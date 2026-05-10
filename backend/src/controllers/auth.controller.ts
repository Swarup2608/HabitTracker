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
  const user = await User.create({ email, username, passwordHash });

  const access = signAccess({ sub: user._id.toString(), username: user.username });
  const refresh = await issueRefresh(user._id.toString());
  setRefreshCookie(res, refresh);

  res.status(201).json({ user: user.toJSON(), accessToken: access });
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) throw new ApiError(401, 'Invalid credentials');
  const ok = await user.comparePassword(password);
  if (!ok) throw new ApiError(401, 'Invalid credentials');

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
  // Always 200 to avoid user enumeration
  if (user) {
    const raw = crypto.randomBytes(32).toString('hex');
    user.resetTokenHash = crypto.createHash('sha256').update(raw).digest('hex');
    user.resetTokenExpiresAt = new Date(Date.now() + 30 * 60 * 1000);
    await user.save();
    // In real app, email this. For demo we surface it (DEV ONLY).
    return res.json({ ok: true, devToken: env.NODE_ENV !== 'production' ? raw : undefined });
  }
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
  await user.save();
  res.json({ ok: true });
}
