import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { validate } from '../middleware/validate';
import { rateLimit } from '../middleware/rateLimit';
import {
  registerSchema,
  loginSchema,
  forgotSchema,
  resetSchema,
} from '../validators/auth.schema';
import * as auth from '../controllers/auth.controller';

const router = Router();

const authLimiter = rateLimit({ windowSec: 60, max: 10, keyPrefix: 'auth' });

router.post('/register', authLimiter, validate(registerSchema), asyncHandler(auth.register));
router.post('/login', authLimiter, validate(loginSchema), asyncHandler(auth.login));
router.post('/refresh', asyncHandler(auth.refresh));
router.post('/logout', asyncHandler(auth.logout));
router.post('/forgot-password', authLimiter, validate(forgotSchema), asyncHandler(auth.forgotPassword));
router.post('/reset-password', authLimiter, validate(resetSchema), asyncHandler(auth.resetPassword));

export default router;
