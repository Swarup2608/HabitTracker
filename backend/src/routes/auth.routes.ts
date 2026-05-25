import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { validate } from '../middleware/validate';
import { rateLimit } from '../middleware/rateLimit';
import { env } from '../config/env';
import {
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  resendVerificationSchema,
  forgotSchema,
  resetSchema,
} from '../validators/auth.schema';
import * as auth from '../controllers/auth.controller';

const router = Router();

const rateWindowSec = env.RATE_LIMIT_WINDOW_SEC;
const registerLimiter = rateLimit({ windowSec: rateWindowSec, max: env.RATE_LIMIT_AUTH_REGISTER_MAX, keyPrefix: 'auth-register', includeMethodInKey: true });
const loginLimiter = rateLimit({ windowSec: rateWindowSec, max: env.RATE_LIMIT_AUTH_LOGIN_MAX, keyPrefix: 'auth-login', includeMethodInKey: true });
const verifyLimiter = rateLimit({ windowSec: rateWindowSec, max: env.RATE_LIMIT_AUTH_VERIFY_MAX, keyPrefix: 'auth-verify', includeMethodInKey: true });
const forgotLimiter = rateLimit({ windowSec: rateWindowSec, max: env.RATE_LIMIT_AUTH_FORGOT_MAX, keyPrefix: 'auth-forgot', includeMethodInKey: true });
const resetLimiter = rateLimit({ windowSec: rateWindowSec, max: env.RATE_LIMIT_AUTH_RESET_MAX, keyPrefix: 'auth-reset', includeMethodInKey: true });

router.post('/register', registerLimiter, validate(registerSchema), asyncHandler(auth.register));
router.post('/login', loginLimiter, validate(loginSchema), asyncHandler(auth.login));
router.post('/verify-email', verifyLimiter, validate(verifyEmailSchema), asyncHandler(auth.verifyEmail));
router.post('/resend-verification', verifyLimiter, validate(resendVerificationSchema), asyncHandler(auth.resendVerificationEmail));
router.post('/refresh', asyncHandler(auth.refresh));
router.post('/logout', asyncHandler(auth.logout));
router.post('/forgot-password', forgotLimiter, validate(forgotSchema), asyncHandler(auth.forgotPassword));
router.post('/reset-password', resetLimiter, validate(resetSchema), asyncHandler(auth.resetPassword));

export default router;
