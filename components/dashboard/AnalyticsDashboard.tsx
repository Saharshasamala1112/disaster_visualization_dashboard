'use client';

import { useState, useMemo } from 'react';
import { Download, BarChart3, Globe, Network, Zap, TrendingUp } from 'lucide-react';
import {
  generateTimeSeriesData,
  buildCorrelationMatrix,
  generateGeoDistribution,
  generateRegionalStats,
  exportAnalyticsData,
  type TimeSeriesPoint,
  type CorrelationMatrix,
} from '@/lib/analytics/viz-utils';

export function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState(30);
  const [hoveredCell, setHoveredCell] = useState<[number, number] | null>(null);

  const timeSeries = useMemo(() => generateTimeSeriesData(timeRange), [timeRange]);
  const correlation = useMemo(() => buildCorrelationMatrix(), []);
  const geoData = useMemo(() => generateGeoDistribution(), []);
  const regionalStats = useMemo(() => generateRegionalStats(), []);

  const handleExport = (format: 'csv' | 'json') => {
    const data = exportAnalyticsData(format);
    const blob = new Blob([data], {
      type: format === 'json' ? 'application/json' : 'text/csv',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `disaster-analytics-${new Date().toISOString().split('T')[0]}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen space-y-6 bg-zinc-950 p-6">
      {/* Header with controls */}
      <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-gradient-to-br from-zinc-900 to-zinc-950 px-6 py-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Analytics & Visualization</h1>
          <p className="text-sm text-zinc-400">Historical trends, correlations, and geospatial distribution</p>
        </div>
        <div className="flex gap-3">
          <select
            value={timeRange}
            onChange={e => setTimeRange(Number(e.target.value))}
            className="rounded-lg border border-white/10 bg-zinc-900 px-4 py-2 text-sm text-white hover:border-white/20"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
            <option value={365}>Last year</option>
          </select>
          <button
            onClick={() => handleExport('json')}
            className="flex items-center gap-2 rounded-lg border border-white/10 bg-zinc-900 px-4 py-2 text-sm text-white transition hover:border-emerald-400/50 hover:bg-zinc-800"
          >
            <Download className="h-4 w-4" />
            JSON
          </button>
          <button
            onClick={() => handleExport('csv')}
            className="flex items-center gap-2 rounded-lg border border-white/10 bg-zinc-900 px-4 py-2 text-sm text-white transition hover:border-emerald-400/50 hover:bg-zinc-800"
          >
            <Download className="h-4 w-4" />
            CSV
          </button>
        </div>
      </div>

      {/* Time Series Summary */}
      <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-zinc-900 to-zinc-950 p-6">
        <div className="mb-4 flex items-center gap-3">
          <TrendingUp className="h-5 w-5 text-emerald-400" />
          <h2 className="text-lg font-semibold text-white">Incident Timeline</h2>
        </div>
        <div className="space-y-3">
          <div className="grid grid-cols-4 gap-4">
            {timeSeries
              .filter((_, i) => i % Math.max(1, Math.floor(timeSeries.length / 4)) === 0)
              .map(point => (
                <div
                  key={point.timestamp}
                  className="rounded-lg border border-white/10 bg-white/5 p-3 hover:border-white/20 hover:bg-white/10"
                >
                  <div className="text-xs text-zinc-500">{point.date}</div>
                  <div className="text-xl font-bold text-white">{point.magnitude.toFixed(1)}</div>
                  <div className="text-xs text-zinc-400">{point.count} incidents</div>
                  <div className={`mt-1 inline-block rounded px-2 py-1 text-[10px] font-semibold uppercase tracking-wide ${
                    point.severity === 'critical' ? 'bg-rose-500/20 text-rose-300' :
                    point.severity === 'severe' ? 'bg-orange-500/20 text-orange-300' :
                    point.severity === 'high' ? 'bg-yellow-500/20 text-yellow-300' :
                    point.severity === 'moderate' ? 'bg-green-500/20 text-green-300' :
                    'bg-cyan-500/20 text-cyan-300'
                  }`}>
                    {point.severity}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Correlation Heatmap */}
      <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-zinc-900 to-zinc-950 p-6">
        <div className="mb-4 flex items-center gap-3">
          <BarChart3 className="h-5 w-5 text-blue-400" />
          <h2 className="text-lg font-semibold text-white">Correlation Matrix</h2>
          <span className="ml-auto text-xs text-zinc-500">Hover cells for values</span>
        </div>
        <div className="overflow-x-auto">
          <CorrelationHeatmap
            data={correlation}
            hoveredCell={hoveredCell}
            setHoveredCell={setHoveredCell}
          />
        </div>
      </div>

      {/* Regional Statistics */}
      <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-zinc-900 to-zinc-950 p-6">
        <div className="mb-4 flex items-center gap-3">
          <Globe className="h-5 w-5 text-cyan-400" />
          <h2 className="text-lg font-semibold text-white">Regional Distribution</h2>
        </div>
        <div className="overflow-x-auto">
          <RegionalTable data={regionalStats} />
        </div>
      </div>

      {/* Geographic Hotspots */}
      <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-zinc-900 to-zinc-950 p-6">
        <div className="mb-4 flex items-center gap-3">
          <Network className="h-5 w-5 text-purple-400" />
          <h2 className="text-lg font-semibold text-white">Global Hotspots</h2>
        </div>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
          {geoData.map(point => (
            <div
              key={`${point.lat}-${point.lng}`}
              className="rounded-lg border border-white/10 bg-white/5 p-3 hover:border-white/20 hover:bg-white/10"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-semibold text-white">{point.label}</span>
                <span className="text-xs text-zinc-500">{(point.value * 100).toFixed(0)}%</span>
              </div>
              <div className="mb-2 h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className={`h-full ${
                    point.type === 'earthquake' ? 'bg-cyan-400' :
                    point.type === 'flood' ? 'bg-blue-400' :
                    point.type === 'cyclone' ? 'bg-sky-400' :
                    'bg-orange-400'
                  }`}
                  style={{ width: `${point.value * 100}%` }}
                />
              </div>
              <div className="text-xs text-zinc-500 uppercase tracking-wider">{point.type}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary Statistics Card */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Incidents" value={timeSeries.reduce((sum, p) => sum + p.count, 0)} icon="📊" />
        <StatCard label="Avg Magnitude" value={(timeSeries.reduce((sum, p) => sum + p.magnitude, 0) / timeSeries.length).toFixed(2)} icon="📈" />
        <StatCard label="Critical Events" value={timeSeries.filter(p => p.severity === 'critical').length} icon="🚨" />
        <StatCard label="Regional Focus" value={regionalStats.regions.length} icon="🌍" />
      </div>
    </div>
  );
}

function CorrelationHeatmap({
  data,
  hoveredCell,
  setHoveredCell,
}: {
  data: CorrelationMatrix;
  hoveredCell: [number, number] | null;
  setHoveredCell: (cell: [number, number] | null) => void;
}) {
  const cellSize = 60;

  return (
    <div className="inline-block">
      <div className="flex">
        {/* Row labels */}
        <div className="flex flex-col">
          <div style={{ width: 200, height: cellSize }} />
          {data.labels.map(label => (
            <div
              key={label}
              style={{ width: 200, height: cellSize }}
              className="flex items-center border-r border-t border-white/10 px-3 text-xs text-zinc-400"
            >
              {label}
            </div>
          ))}
        </div>

        {/* Heatmap grid */}
        <div>
          {/* Column labels */}
          <div className="flex border-b border-white/10">
            {data.labels.map(label => (
              <div
                key={label}
                style={{ width: cellSize, height: cellSize }}
                className="flex items-center justify-center border-r border-white/10 text-[10px] text-zinc-500"
              >
                {label.slice(0, 3)}
              </div>
            ))}
          </div>

          {/* Data cells */}
          {data.data.map((row, i) => (
            <div key={i} className="flex border-b border-white/10">
              {row.map((value, j) => {
                const isHovered = hoveredCell && hoveredCell[0] === i && hoveredCell[1] === j;
                const intensity = value / data.max;
                const color =
                  intensity > 0.8 ? 'rgba(34, 197, 94, 0.4)' :
                  intensity > 0.6 ? 'rgba(34, 197, 94, 0.3)' :
                  intensity > 0.4 ? 'rgba(168, 85, 247, 0.3)' :
                  'rgba(107, 114, 128, 0.2)';

                return (
                  <div
                    key={`${i}-${j}`}
                    style={{
                      width: cellSize,
                      height: cellSize,
                      backgroundColor: color,
                      borderRight: '1px solid rgba(255,255,255,0.1)',
                    }}
                    className={`flex items-center justify-center transition ${
                      isHovered ? 'ring-2 ring-white/30' : ''
                    } cursor-pointer hover:ring-2 hover:ring-white/20`}
                    onMouseEnter={() => setHoveredCell([i, j])}
                    onMouseLeave={() => setHoveredCell(null)}
                    title={`${data.labels[i]} vs ${data.labels[j]}: ${value.toFixed(2)}`}
                  >
                    <span className="text-xs font-semibold text-white">{value.toFixed(2)}</span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function RegionalTable({ data }: { data: ReturnType<typeof generateRegionalStats> }) {
  return (
    <table className="w-full text-sm">
      <thead className="border-b border-white/10">
        <tr>
          <th className="pb-3 text-left font-semibold text-zinc-300">Region</th>
          <th className="pb-3 text-right font-semibold text-zinc-300">Incidents</th>
          <th className="pb-3 text-right font-semibold text-zinc-300">Avg Magnitude</th>
          <th className="pb-3 text-right font-semibold text-zinc-300">Population at Risk</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-white/10">
        {data.regions.map(region => (
          <tr key={region.name} className="hover:bg-white/5">
            <td className="py-3 text-white">{region.name}</td>
            <td className="py-3 text-right text-zinc-300">{region.incidents.toLocaleString()}</td>
            <td className="py-3 text-right text-zinc-300">{region.avg_magnitude.toFixed(2)}</td>
            <td className="py-3 text-right text-zinc-300">{(region.population_at_risk / 1e6).toFixed(0)}M</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string | number; icon: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-gradient-to-br from-zinc-900 to-zinc-950 p-4 hover:border-white/20">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm text-zinc-400">{label}</span>
        <span className="text-xl">{icon}</span>
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
    </div>
  );
}
