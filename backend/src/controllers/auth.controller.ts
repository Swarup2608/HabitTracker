import type { Request, Response } from 'express';
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
const ACCESS_COOKIE = 'tracker_at';

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

function setAccessCookie(res: Response, token: string) {
  // Access token cookie: httpOnly, Secure, SameSite=Lax
  // Expires after 15 minutes (matches JWT expiry)
  res.cookie(ACCESS_COOKIE, token, {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: 'lax',
    domain: env.COOKIE_DOMAIN || undefined,
    path: '/',
    maxAge: 15 * 60 * 1000, // 15 minutes
  });
}

function clearAuthCookies(res: Response) {
  res.clearCookie(REFRESH_COOKIE, { path: '/' });
  res.clearCookie(ACCESS_COOKIE, { path: '/' });
}

export async function register(req: Request, res: Response) {
  const { email, username, password } = req.body;
  const exists = await User.findOne({ $or: [{ email }, { username }] }).lean();
  if (exists) throw new ApiError(409, 'Email or username already in use');

  const passwordHash = await hashPassword(password);

  const user = await User.create({
    email,
    username,
    passwordHash,
    failedLoginAttempts: 0,
  });

  // Auto-login user after registration
  const access = signAccess({ sub: user._id.toString(), username: user.username });
  const refresh = await issueRefresh(user._id.toString());
  setRefreshCookie(res, refresh);
  setAccessCookie(res, access);

  res.status(201).json({
    user: user.toJSON(),
    message: 'Account created successfully!',
  });
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
  setAccessCookie(res, access);

  res.json({ user: user.toJSON() });
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
  setAccessCookie(res, access);

  res.json({ user: user.toJSON() });
}

export async function logout(req: Request, res: Response) {
  const token = req.cookies?.[REFRESH_COOKIE];
  if (token) {
    try {
      const payload = verifyRefresh(token);
      await revokeRefresh(payload.sub, payload.jti);
    } catch {
      /* Ignore invalid/expired token */
    }
  }
  clearAuthCookies(res);
  res.json({ ok: true });
}
