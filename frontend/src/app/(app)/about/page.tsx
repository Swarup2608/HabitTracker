'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAchievements, useMonthlyChallenge } from '@/hooks/useAchievements';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import * as Icons from 'lucide-react';

interface IconProps {
  className?: string;
}

const iconMap: Record<string, React.ComponentType<IconProps>> = {
  Sparkles: Icons.Sparkles,
  Flame: Icons.Flame,
  Fire: Icons.Fire,
  Zap: Icons.Zap,
  Crown: Icons.Crown,
  Star: Icons.Star,
  Trophy: Icons.Trophy,
  Stack: Icons.Layers,
  Calendar: Icons.Calendar,
  Check: Icons.Check,
  RotateCcw: Icons.RotateCcw,
  Target: Icons.Target,
  CheckSquare: Icons.CheckSquare2,
  Sun: Icons.Sun,
  Moon: Icons.Moon,
  Leaf: Icons.Leaf,
  Gift: Icons.Gift,
  Medal: Icons.Medal,
};

export default function AchievementsPage() {
  const { achievements, loading: achievementsLoading } = useAchievements();
  const { challenge } = useMonthlyChallenge();
  const [activeTab, setActiveTab] = useState<'achievements' | 'challenges'>('achievements');

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <motion.header initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl font-bold">Achievements</h1>
        <p className="text-sm text-muted-foreground">Unlock badges and complete monthly challenges to reach new heights.</p>
      </motion.header>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-border/60">
        <button
          onClick={() => setActiveTab('achievements')}
          className={`pb-3 px-1 text-sm font-medium transition-colors ${
            activeTab === 'achievements'
              ? 'text-foreground border-b-2 border-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Badges
        </button>
        <button
          onClick={() => setActiveTab('challenges')}
          className={`pb-3 px-1 text-sm font-medium transition-colors ${
            activeTab === 'challenges'
              ? 'text-foreground border-b-2 border-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Monthly Challenges
        </button>
      </div>

      {/* Achievements Tab */}
      {activeTab === 'achievements' && (
        <div className="space-y-6">
          {achievementsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(9)].map((_, i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
          ) : achievements ? (
            <>
              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-medium text-muted-foreground">Total Badges</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{achievements.total}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-medium text-muted-foreground">Unlocked</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-primary">{achievements.unlocked}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-medium text-muted-foreground">Progress</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {Math.round((achievements.unlocked / achievements.total) * 100)}%
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Achievements Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {achievements.achievements.map((achievement) => {
                  const IconComponent = iconMap[achievement.icon] || Icons.Star;
                  return (
                    <Card
                      key={achievement.code}
                      className={`transition-all ${achievement.unlocked ? 'ring-1 ring-primary/30' : 'opacity-60'}`}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-base">{achievement.title}</CardTitle>
                            <CardDescription className="text-xs mt-1">
                              {achievement.description}
                            </CardDescription>
                          </div>
                          <IconComponent
                            className={`w-6 h-6 ml-2 flex-shrink-0 ${
                              achievement.unlocked ? 'text-primary' : 'text-muted-foreground'
                            }`}
                          />
                        </div>
                      </CardHeader>
                      <CardContent>
                        {achievement.unlocked ? (
                          <Badge className="text-xs">
                            ✓ Unlocked
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">
                            Locked
                          </Badge>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </>
          ) : null}
        </div>
      )}

      {/* Challenges Tab */}
      {activeTab === 'challenges' && (
        <div className="space-y-6">
          {challenge ? (
            <>
              {/* Overall Progress */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h2 className="text-lg font-semibold">
                      {challenge.currentMonth} {challenge.currentYear} Challenge
                    </h2>
                    <p className="text-sm text-muted-foreground">Complete all tasks to earn monthly badge</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">
                      {challenge.progress.percentComplete}%
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {challenge.progress.tasksCompleted}/{challenge.progress.totalTasks}
                    </div>
                  </div>
                </div>
                <Progress value={challenge.progress.percentComplete} className="h-2" />
              </div>

              {/* Challenge Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {challenge.monthlyTasks.map((task) => {
                  const isCompleted = challenge.userChallenge.completedTasks.includes(task.id);
                  const IconComponent = iconMap[task.icon] || Icons.Star;

                  const difficultyAccent = {
                    easy: 'before:bg-primary/40',
                    medium: 'before:bg-primary/70',
                    hard: 'before:bg-primary',
                  }[task.difficulty];

                  return (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <Card
                        className={`relative h-full overflow-hidden transition-all before:absolute before:inset-y-0 before:left-0 before:w-1 ${difficultyAccent} ${
                          isCompleted ? 'ring-1 ring-primary/40 bg-primary/5' : ''
                        }`}
                      >
                        <CardHeader>
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                  <IconComponent className="w-4 h-4" />
                                </span>
                              </div>
                              <CardTitle className="text-base">{task.title}</CardTitle>
                            </div>
                            {isCompleted && (
                              <Icons.CheckCircle2 className="w-5 h-5 text-primary" />
                            )}
                          </div>
                          <div className="mt-2">
                            <Badge variant="outline" className="text-xs capitalize">
                              {task.difficulty}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div>
                            <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
                            <div className="text-sm p-2 rounded-lg bg-muted/50 border border-border/40">
                              <span className="font-medium">Goal:</span> {task.objective}
                            </div>
                          </div>

                          <div className="pt-2 border-t border-border/40">
                            <div className="text-xs font-medium text-muted-foreground mb-1">Reward</div>
                            <div className="text-sm font-semibold text-foreground">{task.reward}</div>
                          </div>

                          <div className="text-[11px] text-muted-foreground italic">
                            {isCompleted ? 'Completed automatically' : 'Tracks automatically from your activity'}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>

              {/* Completion Celebration */}
              {challenge.progress.percentComplete === 100 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 rounded-lg bg-gradient-to-r from-primary/20 to-primary/10 border border-primary/30 text-center"
                >
                  <div className="text-3xl mb-2">🎉</div>
                  <p className="font-semibold text-foreground">Challenge Complete!</p>
                  <p className="text-sm text-muted-foreground">You've earned the monthly badge!</p>
                </motion.div>
              )}
            </>
          ) : (
            <div className="grid place-items-center rounded-xl border border-dashed border-border/60 bg-card/30 py-20 text-center">
              <p className="text-sm text-muted-foreground">Loading challenges...</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
