'use client';

import { useEffect, useState } from 'react';
import { ImageIcon, Link as LinkIcon, MapPin, Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateTodo } from '@/hooks/useTodos';

interface Props {
  defaultDayKey?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
}

export function CreateTodoDialog({ defaultDayKey, open: controlledOpen, onOpenChange, trigger }: Props) {
  const create = useCreateTodo();
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [dayKey, setDayKey] = useState(defaultDayKey ?? new Date().toISOString().slice(0, 10));
  const [imageUrl, setImageUrl] = useState('');
  const [link, setLink] = useState('');
  const [location, setLocation] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setDayKey(defaultDayKey ?? new Date().toISOString().slice(0, 10));
      setError(null);
    }
  }, [open, defaultDayKey]);

  const reset = () => {
    setTitle('');
    setNotes('');
    setPriority('medium');
    setImageUrl('');
    setLink('');
    setLocation('');
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    try {
      await create.mutateAsync({
        title: title.trim(),
        priority,
        notes: notes.trim() || undefined,
        dayKey,
        imageUrl: imageUrl.trim() || undefined,
        link: link.trim() || undefined,
        location: location.trim() || undefined,
      });
      reset();
      setOpen(false);
    } catch (err) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to create todo';
      setError(msg);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New todo</DialogTitle>
          <DialogDescription>Schedule it for any day this month.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="todo-title">Title</Label>
            <Input
              id="todo-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs doing?"
              autoFocus
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="todo-date">Date</Label>
              <Input
                id="todo-date"
                type="date"
                value={dayKey}
                onChange={(e) => setDayKey(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as typeof priority)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="todo-notes">Notes</Label>
            <Textarea
              id="todo-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional details…"
              rows={2}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="todo-image" className="flex items-center gap-1.5">
              <ImageIcon className="h-3.5 w-3.5" /> Image URL
            </Label>
            <Input
              id="todo-image"
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://…"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="todo-link" className="flex items-center gap-1.5">
              <LinkIcon className="h-3.5 w-3.5" /> Link
            </Label>
            <Input
              id="todo-link"
              type="url"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://…"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="todo-location" className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" /> Location
            </Label>
            <Input
              id="todo-location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Place, address, or room"
            />
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <Button type="submit" className="w-full" variant="glow" loading={create.isPending}>
            <Plus className="h-4 w-4" /> Add todo
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
