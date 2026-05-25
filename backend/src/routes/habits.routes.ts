import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  habitCreateSchema,
  habitUpdateSchema,
  habitCompleteSchema,
  logsQuerySchema,
  calendarQuerySchema,
  logUpdateSchema,
} from '../validators/habit.schema';
import * as habits from '../controllers/habits.controller';

const router = Router();
router.use(requireAuth);

router.get('/', asyncHandler(habits.list));
router.post('/', validate(habitCreateSchema), asyncHandler(habits.create));
router.get('/:id', asyncHandler(habits.get));
router.patch('/:id', validate(habitUpdateSchema), asyncHandler(habits.update));
router.delete('/:id', asyncHandler(habits.remove));
router.post('/:id/complete', validate(habitCompleteSchema), asyncHandler(habits.complete));
router.get('/:id/calendar', validate(calendarQuerySchema, 'query'), asyncHandler(habits.calendar));
router.get('/:id/logs', validate(logsQuerySchema, 'query'), asyncHandler(habits.logs));
router.patch('/:id/logs/:logId', validate(logUpdateSchema), asyncHandler(habits.updateLog));
router.delete('/:id/logs/:logId', asyncHandler(habits.deleteLog));

export default router;
