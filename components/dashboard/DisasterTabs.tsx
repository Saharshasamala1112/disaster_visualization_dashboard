'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { disasterRoutes } from '@/lib/disaster-data';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function DisasterTabs() {
  const pathname = usePathname();
  const current = pathname === '/' ? 'overview' : pathname.split('/')[1] || 'overview';

  return (
    <Tabs value={current} className="border-b border-zinc-200/80 bg-white/85 backdrop-blur-md dark:border-white/10 dark:bg-zinc-950/90">
      <TabsList variant="line" className="h-16 w-max min-w-full gap-2 overflow-x-auto px-3 sm:px-6 md:px-8">
        {disasterRoutes.map((route) => (
          <TabsTrigger
            key={route.id}
            value={route.id}
            asChild
            className="rounded-2xl border border-transparent px-3 py-2 text-xs uppercase tracking-[0.14em] text-zinc-600 data-[state=active]:border-sky-300/45 data-[state=active]:bg-sky-50 data-[state=active]:text-zinc-900 dark:text-zinc-400 dark:data-[state=active]:border-white/10 dark:data-[state=active]:bg-white/5 dark:data-[state=active]:text-white md:px-5 md:text-sm md:tracking-[0.16em]"
          >
            <Link href={route.path}>
              <span className="mr-2">{route.icon}</span>
              {route.label}
            </Link>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
