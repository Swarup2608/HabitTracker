import type { Request, Response } from 'express';
import { User, hashPassword } from '../models/User';
import { ApiError } from '../utils/ApiError';
import { revokeAllRefresh } from '../services/token.service';

export async function me(req: Request, res: Response) {
  const user = await User.findById(req.user!.sub);
  if (!user) throw new ApiError(404, 'User not found');
  res.json({ user: user.toJSON() });
}

export async function updateMe(req: Request, res: Response) {
  const user = await User.findByIdAndUpdate(req.user!.sub, { $set: req.body }, { new: true });
  if (!user) throw new ApiError(404, 'User not found');
  res.json({ user: user.toJSON() });
}

export async function changePassword(req: Request, res: Response) {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user!.sub);
  if (!user) throw new ApiError(404, 'User not found');
  const ok = await user.comparePassword(currentPassword);
  if (!ok) throw new ApiError(400, 'Current password is incorrect');
  user.passwordHash = await hashPassword(newPassword);
  await user.save();
  await revokeAllRefresh(user._id.toString());
  res.json({ ok: true });
}
