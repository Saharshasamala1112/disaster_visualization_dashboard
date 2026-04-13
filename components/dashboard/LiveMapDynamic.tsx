/**
 * SSR-safe Leaflet map wrapper.
 * Leaflet relies on `window` / DOM APIs unavailable on the server,
 * so we disable pre-rendering entirely via next/dynamic { ssr: false }.
 */
import dynamic from 'next/dynamic';

export type { HeatPoint } from './LiveMap';

const LiveMapDynamic = dynamic(() => import('./LiveMap'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-zinc-900/60 text-zinc-400 text-sm">
      Loading map…
    </div>
  ),
});

export default LiveMapDynamic;
