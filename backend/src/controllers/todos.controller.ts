import type { Request, Response } from 'express';
import { Todo } from '../models/Todo';
import { ApiError } from '../utils/ApiError';
import { dayKey, dayjs } from '../utils/date';

export async function list(req: Request, res: Response) {
  const today = dayKey();
  const { year, month } = req.query as { year?: string; month?: string };

  let from: string;
  let to: string;
  if (year && month) {
    const y = Number(year);
    const m = Number(month);
    if (!Number.isFinite(y) || !Number.isFinite(m) || m < 1 || m > 12) {
      from = dayjs.utc().subtract(5, 'day').format('YYYY-MM-DD');
      to = dayjs.utc().add(60, 'day').format('YYYY-MM-DD');
    } else {
      const start = dayjs.utc(`${y}-${String(m).padStart(2, '0')}-01`).startOf('month');
      from = start.format('YYYY-MM-DD');
      to = start.endOf('month').format('YYYY-MM-DD');
    }
  } else {
    from = dayjs.utc().subtract(5, 'day').format('YYYY-MM-DD');
    to = dayjs.utc().add(60, 'day').format('YYYY-MM-DD');
  }

  const todos = await Todo.find({
    user: req.user!.sub,
    dayKey: { $gte: from, $lte: to },
  })
    .sort({ dayKey: -1, order: 1, createdAt: 1 })
    .lean();

  const grouped: Record<string, typeof todos> = {};
  for (const t of todos) {
    grouped[t.dayKey] = grouped[t.dayKey] || [];
    grouped[t.dayKey].push(t);
  }
  res.json({ today, grouped, range: { from, to } });
}

export async function create(req: Request, res: Response) {
  const { dayKey: requestedDay, ...rest } = req.body ?? {};
  const todo = await Todo.create({
    ...rest,
    user: req.user!.sub,
    dayKey: requestedDay || dayKey(),
  });
  res.status(201).json({ todo });
}

export async function update(req: Request, res: Response) {
  const patch: Record<string, unknown> = { ...req.body };
  if (typeof patch.completed === 'boolean') {
    patch.completedAt = patch.completed ? new Date() : null;
  }
  const todo = await Todo.findOneAndUpdate(
    { _id: req.params.id, user: req.user!.sub },
    { $set: patch },
    { new: true }
  );
  if (!todo) throw new ApiError(404, 'Todo not found');
  res.json({ todo });
}

export async function remove(req: Request, res: Response) {
  const todo = await Todo.findOneAndDelete({ _id: req.params.id, user: req.user!.sub });
  if (!todo) throw new ApiError(404, 'Todo not found');
  res.json({ ok: true });
}

export async function reorder(req: Request, res: Response) {
  const { ids } = req.body as { ids: string[] };
  if (!Array.isArray(ids)) throw new ApiError(400, 'ids must be an array');
  await Promise.all(
    ids.map((id, idx) =>
      Todo.updateOne({ _id: id, user: req.user!.sub }, { $set: { order: idx } })
    )
  );
  res.json({ ok: true });
}
