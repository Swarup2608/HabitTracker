'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Icons from 'lucide-react';
import { useAchievementQueue, type UnlockedAchievement } from '@/stores/achievements';

interface IconProps {
  className?: string;
}

const iconMap: Record<string, React.ComponentType<IconProps>> = {
  Sparkles: Icons.Sparkles,
  Flame: Icons.Flame,
  Fire: Icons.Flame,
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

interface AchievementPopupProps {
  achievement?: UnlockedAchievement | null;
  onDismiss?: () => void;
}

export function AchievementPopup({ achievement: propAchievement, onDismiss: propOnDismiss }: AchievementPopupProps = {}) {
  const queue = useAchievementQueue((s) => s.queue);
  const shift = useAchievementQueue((s) => s.shift);

  // Controlled mode wins; otherwise consume the head of the queue.
  const achievement: UnlockedAchievement | null =
    propAchievement !== undefined ? propAchievement : queue[0] ?? null;
  const onDismiss = propOnDismiss ?? shift;

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (achievement) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onDismiss, 300);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [achievement, onDismiss]);

  const IconComponent = achievement ? (iconMap[achievement.icon] || Icons.Star) : null;

  return (
    <AnimatePresence>
      {isVisible && achievement && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -20 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-50"
        >
          <div className="bg-gradient-to-br from-primary via-primary/90 to-primary/80 rounded-2xl shadow-2xl overflow-hidden max-w-sm">
            {/* Animated background */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full blur-3xl -mr-20 -mt-20" />
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-white rounded-full blur-3xl -ml-20 -mb-20" />
            </div>

            {/* Content */}
            <div className="relative p-8 text-center">
              {/* Celebration animation */}
              <motion.div
                animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                transition={{ duration: 0.8, repeat: 1 }}
                className="flex justify-center mb-4"
              >
                {IconComponent && (
                  <div className="relative">
                    <div className="absolute inset-0 bg-white/20 rounded-full blur-2xl animate-pulse" />
                    <IconComponent className="w-16 h-16 text-white relative z-10" />
                  </div>
                )}
              </motion.div>

              {/* Text */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <h3 className="text-2xl font-bold text-white mb-2">{achievement.title}</h3>
                <p className="text-primary-100 text-sm mb-4">{achievement.description}</p>
              </motion.div>

              {/* Encouraging message */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex items-center justify-center gap-2 text-white/80 text-sm"
              >
                <span>✨ Keep up the momentum! ✨</span>
              </motion.div>

              {/* Progress indicator */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.2, duration: 3.5 }}
                className="absolute bottom-0 left-0 right-0 h-1 bg-white/30 origin-left"
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
