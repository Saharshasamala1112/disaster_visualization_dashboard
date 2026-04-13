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
      <div className="sticky top-0 z-40 flex items-center justify-between rounded-2xl border border-white/10 bg-zinc-900/95 px-6 py-4 backdrop-blur-md">
        <div>
          <h1 className="text-xl font-bold text-white">
            {mode === 'operations' ? 'Disaster Operations Center' : 'Analytics & Visualization'}
          </h1>
          <p className="text-sm text-zinc-400">
            {mode === 'operations'
              ? 'Real-time monitoring, response coordination, and situational awareness'
              : 'Historical trends, correlations, and geospatial distribution analysis'}
          </p>
        </div>
        <div className="flex items-center gap-3">
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
