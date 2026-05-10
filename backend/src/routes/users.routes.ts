import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { userUpdateSchema, passwordChangeSchema } from '../validators/user.schema';
import * as users from '../controllers/users.controller';

const router = Router();
router.use(requireAuth);

router.get('/me', asyncHandler(users.me));
router.patch('/me', validate(userUpdateSchema), asyncHandler(users.updateMe));
router.post('/me/password', validate(passwordChangeSchema), asyncHandler(users.changePassword));

export default router;
