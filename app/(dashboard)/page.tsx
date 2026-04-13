'use client';

import { useState } from 'react';
import { DisasterCommandCenter } from '@/components/dashboard/DisasterCommandCenter';
import { AnalyticsDashboard } from '@/components/dashboard/AnalyticsDashboard';
import { DashboardModeToggle, type DashboardMode } from '@/components/dashboard/ModeToggle';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function DashboardHomePage() {
  const [mode, setMode] = useState<DashboardMode>('operations');

  return (
    <div className="space-y-6">
      {/* Mode Toggle */}
      <div className="sticky top-0 z-40 flex flex-col gap-3 rounded-2xl border border-zinc-200/70 bg-white/80 px-4 py-4 backdrop-blur-md sm:flex-row sm:items-center sm:justify-between sm:px-6 dark:border-white/10 dark:bg-zinc-900/90">
        <div>
          <h1 className="text-lg font-bold text-zinc-900 sm:text-xl dark:text-white">
            {mode === 'operations' ? 'Disaster Operations Center' : 'Analytics & Visualization'}
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {mode === 'operations'
              ? 'Real-time monitoring, response coordination, and situational awareness'
              : 'Historical trends, correlations, and geospatial distribution analysis'}
          </p>
        </div>
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <ThemeToggle />
          <DashboardModeToggle mode={mode} onModeChange={setMode} />
        </div>
      </div>

      {/* Conditional Rendering */}
      {mode === 'operations' ? (
        <DisasterCommandCenter slug="earthquake" />
      ) : (
        <AnalyticsDashboard />
      )}
    </div>
  );
}
