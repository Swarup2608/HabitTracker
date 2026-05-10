import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../utils/asyncHandler';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { todoCreateSchema, todoUpdateSchema } from '../validators/todo.schema';
import * as todos from '../controllers/todos.controller';

const router = Router();
router.use(requireAuth);

router.get('/', asyncHandler(todos.list));
router.post('/', validate(todoCreateSchema), asyncHandler(todos.create));
router.patch('/:id', validate(todoUpdateSchema), asyncHandler(todos.update));
router.delete('/:id', asyncHandler(todos.remove));
router.post(
  '/reorder',
  validate(z.object({ ids: z.array(z.string()) })),
  asyncHandler(todos.reorder)
);

export default router;
