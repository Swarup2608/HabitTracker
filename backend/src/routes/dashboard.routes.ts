import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { requireAuth } from '../middleware/auth';
import * as dashboard from '../controllers/dashboard.controller';

const router = Router();
router.use(requireAuth);

router.get('/', asyncHandler(dashboard.summary));

export default router;
