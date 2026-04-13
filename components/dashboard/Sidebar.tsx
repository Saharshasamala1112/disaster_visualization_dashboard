'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart3, Bell, MapPin, Settings, ShieldAlert } from 'lucide-react';

import { disasterRoutes } from '@/lib/disaster-data';
import { cn } from '@/lib/utils';

const supportLinks = [
  { icon: MapPin, label: 'Geo layers', detail: 'Population, logistics, shelters', panel: 'map' },
  { icon: BarChart3, label: 'Decision analytics', detail: 'Prediction and capacity pressure', panel: 'signals' },
  { icon: Bell, label: 'Public warning', detail: 'Message reach and escalation', panel: 'incidents' },
  { icon: Settings, label: 'Ops settings', detail: 'Teams, thresholds, integrations', panel: 'features' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-80 shrink-0 border-r border-zinc-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(240,249,255,0.82))] p-6 text-zinc-900 lg:flex lg:flex-col dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(9,9,11,0.98),rgba(12,12,20,0.95))] dark:text-white">
      <div className="rounded-[1.75rem] border border-zinc-200/80 bg-white/80 p-5 shadow-[0_20px_50px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-white/5 dark:shadow-[0_20px_50px_rgba(0,0,0,0.25)]">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#38bdf8,#10b981)] text-xl shadow-[0_12px_30px_rgba(16,185,129,0.25)]">
            🧭
          </div>
          <div>
            <div className="text-sm uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-500">Command mesh</div>
            <div className="mt-1 text-lg font-semibold">ResilientGuard</div>
          </div>
        </div>
        <p className="mt-4 text-sm leading-6 text-zinc-600 dark:text-zinc-400">A multi-hazard control room designed around field friction, confidence gaps, and response dependencies.</p>
      </div>

      <div className="mt-8">
        <div className="mb-3 text-xs uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-500">Disaster views</div>
        <nav className="space-y-2">
          {disasterRoutes.map((route) => {
            const active = route.path === '/' ? pathname === '/' : pathname.startsWith(route.path);
            return (
              <Link
                key={route.id}
                href={route.path}
                className={cn(
                  'flex items-center justify-between rounded-2xl border px-4 py-3 transition-all',
                  active
                    ? 'border-sky-300/40 bg-sky-50 text-zinc-900 shadow-[0_12px_24px_rgba(14,165,233,0.16)] dark:border-white/10 dark:bg-white/8 dark:text-white dark:shadow-[0_12px_24px_rgba(0,0,0,0.18)]'
                    : 'border-transparent bg-transparent text-zinc-600 hover:border-zinc-300/70 hover:bg-white/70 hover:text-zinc-900 dark:text-zinc-400 dark:hover:border-white/8 dark:hover:bg-white/4 dark:hover:text-white'
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{route.icon}</span>
                  <span className="font-medium">{route.label}</span>
                </div>
                {active && <ShieldAlert className="size-4 text-emerald-500 dark:text-emerald-300" />}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-8">
        <div className="mb-3 text-xs uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-500">System modules</div>
        <div className="space-y-2">
          {supportLinks.map((item) => (
            <Link
              key={item.label}
              href={`${pathname}?panel=${item.panel}`}
              className="block rounded-2xl border border-zinc-200/80 bg-white/65 p-4 transition-all hover:-translate-y-0.5 hover:border-sky-300/45 hover:bg-sky-50/90 hover:shadow-[0_12px_24px_rgba(56,189,248,0.16)] dark:border-white/8 dark:bg-white/[0.03] dark:hover:border-sky-300/30 dark:hover:bg-white/[0.06] dark:hover:shadow-[0_12px_24px_rgba(56,189,248,0.15)]"
            >
              <div className="flex items-center gap-3 text-zinc-900 dark:text-white">
                <item.icon className="size-4 text-sky-300" />
                <span className="text-sm font-medium">{item.label}</span>
              </div>
              <p className="mt-2 text-xs leading-5 text-zinc-600 dark:text-zinc-500">{item.detail}</p>
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-auto rounded-[1.75rem] border border-emerald-500/25 bg-emerald-500/10 p-5">
        <div className="text-xs uppercase tracking-[0.24em] text-emerald-700 dark:text-emerald-300/70">Operational promise</div>
        <p className="mt-3 text-sm leading-6 text-zinc-700 dark:text-zinc-300">Reduce dashboard fragmentation by keeping alerts, public impact, logistics pressure, and field execution in one decision surface.</p>
      </div>
    </aside>
  );
}
