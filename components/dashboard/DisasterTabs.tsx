'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { disasterRoutes } from '@/lib/disaster-data';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function DisasterTabs() {
  const pathname = usePathname();
  const current = pathname === '/' ? 'overview' : pathname.split('/')[1] || 'overview';

  return (
    <Tabs value={current} className="border-b border-white/10 bg-zinc-950/90 backdrop-blur-md">
      <TabsList variant="line" className="h-16 gap-2 px-6 md:px-8">
        {disasterRoutes.map((route) => (
          <TabsTrigger
            key={route.id}
            value={route.id}
            asChild
            className="rounded-2xl border border-transparent px-4 py-2 text-sm uppercase tracking-[0.16em] text-zinc-400 data-[state=active]:border-white/10 data-[state=active]:bg-white/5 data-[state=active]:text-white md:px-5"
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
