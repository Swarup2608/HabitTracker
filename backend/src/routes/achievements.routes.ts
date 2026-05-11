import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { requireAuth } from '../middleware/auth';
import * as achievements from '../controllers/achievements.controller';

const router = Router();
router.use(requireAuth);

// Achievements
router.get('/list', asyncHandler(achievements.getAchievements));
router.post('/check', asyncHandler(achievements.checkAchievements));

// Monthly Challenges
router.get('/challenges/current', asyncHandler(achievements.getMonthlyChallenge));
router.post('/challenges/complete', asyncHandler(achievements.completeMonthlyTask));
router.get('/challenges/history', asyncHandler(achievements.getMonthlyHistory));

export default router;
