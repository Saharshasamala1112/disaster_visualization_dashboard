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
    <div className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 p-1">
      <button
        onClick={() => onModeChange('operations')}
        className={cn(
          'flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all',
          mode === 'operations'
            ? 'bg-white/10 text-white shadow-lg'
            : 'text-zinc-400 hover:text-zinc-300'
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
            ? 'bg-white/10 text-white shadow-lg'
            : 'text-zinc-400 hover:text-zinc-300'
        )}
      >
        <Zap className="h-4 w-4" />
        Analytics
      </button>
    </div>
  );
}
