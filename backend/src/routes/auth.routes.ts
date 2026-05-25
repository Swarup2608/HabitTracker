import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { validate } from '../middleware/validate';
import { rateLimit } from '../middleware/rateLimit';
import { env } from '../config/env';
import {
  registerSchema,
  loginSchema,
} from '../validators/auth.schema';
import * as auth from '../controllers/auth.controller';

const router = Router();

const rateWindowSec = env.RATE_LIMIT_WINDOW_SEC;
const registerLimiter = rateLimit({ windowSec: rateWindowSec, max: env.RATE_LIMIT_AUTH_REGISTER_MAX, keyPrefix: 'auth-register', includeMethodInKey: true });
const loginLimiter = rateLimit({ windowSec: rateWindowSec, max: env.RATE_LIMIT_AUTH_LOGIN_MAX, keyPrefix: 'auth-login', includeMethodInKey: true });

router.post('/register', registerLimiter, validate(registerSchema), asyncHandler(auth.register));
router.post('/login', loginLimiter, validate(loginSchema), asyncHandler(auth.login));
router.post('/refresh', asyncHandler(auth.refresh));
router.post('/logout', asyncHandler(auth.logout));

export default router;
