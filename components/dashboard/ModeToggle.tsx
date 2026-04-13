'use client';

import { Zap, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

export type DashboardMode = 'operations' | 'analytics';

interface ModeToggleProps {
  mode: DashboardMode;
  onModeChange: (mode: DashboardMode) => void;
}

export function DashboardModeToggle({ mode, onModeChange }: ModeToggleProps) {
  return (
    <div className="inline-flex items-center gap-1 rounded-xl border border-zinc-300/70 bg-white/90 p-1 shadow-sm dark:border-white/10 dark:bg-white/5">
      <button
        onClick={() => onModeChange('operations')}
        className={cn(
          'flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all',
          mode === 'operations'
            ? 'bg-zinc-900 text-white shadow-lg dark:bg-white/10'
            : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
        )}
      >
        <Activity className="h-4 w-4" />
        Operations
      </button>
      <button
        onClick={() => onModeChange('analytics')}
        className={cn(
          'flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all',
          mode === 'analytics'
            ? 'bg-zinc-900 text-white shadow-lg dark:bg-white/10'
            : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
        )}
      >
        <Zap className="h-4 w-4" />
        Analytics
      </button>
    </div>
  );
}
