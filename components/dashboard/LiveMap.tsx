'use client';

import { useEffect, useRef, useState } from 'react';
import type { LayerGroup, Map as LeafletMap } from 'leaflet';
import 'leaflet/dist/leaflet.css';

export type HeatPoint = {
  lat: number;
  lng: number;
  intensity: number;
  radiusKm?: number;
  label?: string;
};

type LiveMapProps = {
  center?: [number, number];
  marker?: [number, number];
  popupHtml?: string;
  title?: string;
  subTitle?: string;
  heatPoints?: HeatPoint[];
  pulseEnabled?: boolean;
  onLocationSelect?: (coords: { lat: number; lng: number }) => void;
};

type RiskBand = {
  color: string;
  tier: string;
  description: string;
  pct: string;
  ringOpacities: [number, number, number, number, number];
};

// Deliberately separated hues for map readability: blue → green → yellow → orange → red.
function riskBand(intensity: number): RiskBand {
  if (intensity >= 0.85) {
    return {
      color: '#dc2626',
      tier: 'Critical',
      description: 'Extreme risk, immediate action',
      pct: '85–100%',
      ringOpacities: [0.10, 0.17, 0.28, 0.40, 0.56],
    };
  }
  if (intensity >= 0.70) {
    return {
      color: '#f97316',
      tier: 'Severe',
      description: 'High impact, urgent',
      pct: '70–84%',
      ringOpacities: [0.09, 0.15, 0.24, 0.34, 0.48],
    };
  }
  if (intensity >= 0.52) {
    return {
      color: '#facc15',
      tier: 'High',
      description: 'Moderate impact, monitor',
      pct: '52–69%',
      ringOpacities: [0.08, 0.13, 0.21, 0.30, 0.42],
    };
  }
  if (intensity >= 0.33) {
    return {
      color: '#22c55e',
      tier: 'Moderate',
      description: 'Low impact, track',
      pct: '33–51%',
      ringOpacities: [0.07, 0.11, 0.17, 0.24, 0.34],
    };
  }
  return {
    color: '#0ea5e9',
    tier: 'Low',
    description: 'Baseline, informational',
    pct: '0–32%',
    ringOpacities: [0.06, 0.09, 0.14, 0.20, 0.28],
  };
}

function pulseDurationMs(intensity: number) {
  if (intensity >= 0.8) return 900;
  if (intensity >= 0.6) return 1200;
  if (intensity >= 0.45) return 1500;
  return 1800;
}

export default function LiveMap({
  center = [21.59, 78.96],
  marker = [19.076, 72.8777],
  popupHtml = '<b>Flood Alert</b><br>Mumbai Region - High Risk',
  title = 'Real-time Disaster Monitoring',
  subTitle = 'Updated just now • OpenStreetMap',
  heatPoints = [],
  pulseEnabled = true,
  onLocationSelect,
}: LiveMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<LeafletMap | null>(null);
  const overlays = useRef<LayerGroup | null>(null);
  const [isCompactViewport, setIsCompactViewport] = useState(false);
  const [legendCollapsed, setLegendCollapsed] = useState(false);
  const legendManuallyToggledRef = useRef(false);
  const onLocationSelectRef = useRef(onLocationSelect);

  useEffect(() => {
    onLocationSelectRef.current = onLocationSelect;
  }, [onLocationSelect]);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      setIsCompactViewport(false);
      setLegendCollapsed(false);
      return;
    }

    const mediaQuery = window.matchMedia('(max-width: 480px)');

    const syncCompactMode = (event: MediaQueryList | MediaQueryListEvent) => {
      const compact = event.matches;
      setIsCompactViewport(compact);
      // Respect explicit user choice after manual toggle.
      if (!legendManuallyToggledRef.current) {
        setLegendCollapsed(compact);
      }
    };

    syncCompactMode(mediaQuery);
    const handler = (event: MediaQueryListEvent) => syncCompactMode(event);

    mediaQuery.addEventListener('change', handler);
    return () => {
      mediaQuery.removeEventListener('change', handler);
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    let cancelled = false;
    const handleResize = () => {
      mapInstance.current?.invalidateSize({ animate: false });
    };

    const initMap = async () => {
      const L = await import('leaflet');
      if (cancelled || !mapRef.current) return;

      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });

      if (!mapInstance.current) {
        mapInstance.current = L.map(mapRef.current, {
          center,
          zoom: 5.5,
          zoomControl: false,
          dragging: true,
          touchZoom: true,
          doubleClickZoom: true,
          boxZoom: false,
          keyboard: false,
        });

        L.control.zoom({ position: 'bottomright' }).addTo(mapInstance.current);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
          maxZoom: 19,
        }).addTo(mapInstance.current);

        mapInstance.current.on('click', (event) => {
          onLocationSelectRef.current?.({
            lat: event.latlng.lat,
            lng: event.latlng.lng,
          });
        });
      }

      overlays.current = L.layerGroup().addTo(mapInstance.current);

      setTimeout(handleResize, 120);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    void initMap();

    return () => {
      cancelled = true;
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      overlays.current?.clearLayers();
      mapInstance.current?.remove();
      overlays.current = null;
      mapInstance.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapInstance.current || !overlays.current) return;

    let cancelled = false;

    const syncOverlays = async () => {
      const L = await import('leaflet');
      if (cancelled || !mapInstance.current || !overlays.current) return;
      const layerGroup = overlays.current;

      layerGroup.clearLayers();

      const pointSet = heatPoints.length > 0 ? heatPoints : [{ lat: marker[0], lng: marker[1], intensity: 0.7, radiusKm: 55 }];

      const bounds = L.latLngBounds(pointSet.map((point) => [point.lat, point.lng] as [number, number]));
      bounds.extend(marker);
      mapInstance.current.fitBounds(bounds.pad(0.28), { animate: true, duration: 0.7, maxZoom: 6 });

      pointSet.forEach((point) => {
        const radiusMeters = (point.radiusKm ?? 50) * 1000;
        const risk = riskBand(point.intensity);
        const color = risk.color;
        const pulseDuration = pulseDurationMs(point.intensity);
        const pulseSize = Math.round(11 + point.intensity * 26); // scaled for professional appearance

        // 5 concentric rings with professional exponential gradient falloff
        const ringMultipliers = [1, 0.72, 0.48, 0.28, 0.12];
        const ringOpacities = risk.ringOpacities;

        ringMultipliers.forEach((multiplier, index) => {
          L.circle([point.lat, point.lng], {
            radius: Math.round(radiusMeters * multiplier),
            color: index === 0 ? color : 'transparent',
            weight: index === 0 ? 2.4 : 0,
            opacity: index === 0 ? 0.92 : 0,
            fillColor: color,
            fillOpacity: ringOpacities[index],
            lineCap: 'round',
          }).addTo(layerGroup);
        });

        // Critical hotspots get a dashed outer ring to improve distinction for color-blind users.
        if (risk.tier === 'Critical') {
          L.circle([point.lat, point.lng], {
            radius: Math.round(radiusMeters * 1.08),
            color,
            weight: 3,
            opacity: 0.98,
            fillOpacity: 0,
            dashArray: '10 8',
            lineCap: 'round',
          }).addTo(layerGroup);
        }

        L.marker([point.lat, point.lng], {
          icon: L.divIcon({
            className: 'risk-pulse-anchor',
            iconSize: [pulseSize + 4, pulseSize + 4],
            iconAnchor: [Math.round((pulseSize + 4) / 2), Math.round((pulseSize + 4) / 2)],
            html: `<span class="risk-pulse ${pulseEnabled ? '' : 'risk-pulse-paused'}" style="--pulse-color:${color}; --pulse-duration:${pulseDuration}ms; --pulse-size:${pulseSize}px;"></span>`,
          }),
        })
          .bindPopup(
            `<div style="min-width:210px;line-height:1.45;">
              <div style="font-weight:700;margin-bottom:2px;">${point.label ?? 'Risk hotspot'}</div>
              <div style="font-size:12px;color:#475569;margin-bottom:8px;">${risk.description}</div>
              <div><b>Tier:</b> ${risk.tier}</div>
              <div><b>Intensity:</b> ${(point.intensity * 100).toFixed(0)}%</div>
              <div><b>Estimated confidence:</b> ${Math.round(62 + point.intensity * 34)}%</div>
              <div><b>Suggested action:</b> ${point.intensity >= 0.7 ? 'Dispatch field verification' : 'Continue active monitoring'}</div>
            </div>`
          )
          .addTo(layerGroup);
      });

      L.marker(marker).addTo(layerGroup).bindPopup(popupHtml).openPopup();
    };

    void syncOverlays();

    return () => {
      cancelled = true;
    };
  }, [center, heatPoints, marker, popupHtml, pulseEnabled]);

  return (
    <div className="relative h-full w-full overflow-hidden bg-zinc-950 shadow-2xl">
      <div ref={mapRef} className="absolute inset-0 cursor-crosshair" />

      <div className="pointer-events-none absolute left-3 top-3 z-[1000] max-w-[78%] space-y-1 rounded-2xl border border-white/10 bg-gradient-to-br from-zinc-900 to-zinc-950 px-4 py-3 shadow-lg backdrop-blur-md sm:left-6 sm:top-6 sm:max-w-sm sm:px-5 sm:py-3.5">
        <div className="flex items-center gap-2">
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400">
            <span className="absolute inline-flex h-full w-full animate-pulse rounded-full bg-emerald-400 opacity-75" />
          </span>
          <div className="font-semibold text-white tracking-tight">{title}</div>
        </div>
        <div className="text-xs text-zinc-400 font-medium">{subTitle}</div>
      </div>

      <div className="pointer-events-none absolute bottom-4 right-3 z-[1000] sm:bottom-5 sm:right-5">
        {legendCollapsed ? (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              legendManuallyToggledRef.current = true;
              setLegendCollapsed(false);
            }}
            className="pointer-events-auto rounded-full border border-white/20 bg-zinc-900/90 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-100 shadow-lg backdrop-blur-md"
          >
            Show risk scale
          </button>
        ) : (
          <div className="pointer-events-auto w-44 rounded-2xl border border-white/10 bg-gradient-to-br from-zinc-900 to-zinc-950 px-3 py-2.5 shadow-lg backdrop-blur-md sm:w-56">
            <div className="mb-2 flex items-center justify-between">
              <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-300">Risk Scale</div>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  legendManuallyToggledRef.current = true;
                  setLegendCollapsed(true);
                }}
                className="rounded border border-white/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-zinc-200"
              >
                Hide
              </button>
            </div>
            <div className="space-y-1.5">
              {([
                riskBand(0.15),
                riskBand(0.4),
                riskBand(0.58),
                riskBand(0.75),
                riskBand(0.9),
              ] as const).map(({ color, tier, pct, description }) => (
                <div key={tier} className="rounded-md border border-white/5 bg-white/3 p-1.5">
                  <div className="flex items-center gap-2">
                    <div className="relative flex h-5 w-10 flex-shrink-0 overflow-hidden rounded border border-white/10 shadow-inner">
                      <div className="flex-1" style={{ background: color }} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[11px] font-semibold text-white">{tier}</div>
                      <div className="truncate text-[9px] text-zinc-400">{description}</div>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <div className="text-[9px] font-mono text-zinc-400">{pct}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-2 border-t border-white/10 pt-1.5 text-[9px] font-medium text-zinc-400">
              <span className="text-emerald-300">●</span> Pulse speed = urgency
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        .risk-pulse-anchor {
          background: transparent;
          border: none;
        }

        .risk-pulse {
          position: relative;
          display: block;
          width: var(--pulse-size);
          height: var(--pulse-size);
          border-radius: 999px;
          background: color-mix(in srgb, var(--pulse-color) 85%, white 15%);
          box-shadow: 
            0 0 0 0 color-mix(in srgb, var(--pulse-color) 80%, transparent 20%),
            inset 0 1px 3px rgba(255, 255, 255, 0.15);
          animation: riskPulse var(--pulse-duration) cubic-bezier(0.34, 1.56, 0.64, 1) infinite;
          opacity: 0.98;
          filter: drop-shadow(0 0 4px color-mix(in srgb, var(--pulse-color) 60%, transparent 40%));
        }

        .risk-pulse::after {
          content: '';
          position: absolute;
          inset: 28%;
          border-radius: 999px;
          background: radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.5) 100%);
          opacity: 0.9;
          box-shadow: inset 0 -1px 3px rgba(0, 0, 0, 0.2);
        }

        .risk-pulse-paused {
          animation-play-state: paused;
          box-shadow: 0 0 0 0 transparent;
          opacity: 0.85;
        }

        @keyframes riskPulse {
          0% {
            transform: scale(0.88);
            box-shadow: 
              0 0 0 0 color-mix(in srgb, var(--pulse-color) 85%, transparent 15%),
              inset 0 1px 3px rgba(255, 255, 255, 0.15);
          }
          45% {
            transform: scale(1.12);
            box-shadow: 
              0 0 0 24px color-mix(in srgb, var(--pulse-color) 0%, transparent 100%),
              inset 0 1px 3px rgba(255, 255, 255, 0.08);
          }
          100% {
            transform: scale(0.92);
            box-shadow: 
              0 0 0 0 color-mix(in srgb, var(--pulse-color) 0%, transparent 100%),
              inset 0 1px 3px rgba(255, 255, 255, 0.15);
          }
        }

        .leaflet-container {
          touch-action: pan-x pan-y;
          -webkit-tap-highlight-color: transparent;
        }
      `}</style>
    </div>
  );
}
