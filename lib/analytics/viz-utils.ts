import type { LiveOpsSnapshot, IncidentFeedItem } from '../realtime/mock-pipeline';

export type TimeSeriesPoint = {
  date: string;
  timestamp: number;
  magnitude: number;
  count: number;
  severity: 'low' | 'moderate' | 'high' | 'severe' | 'critical';
};

export type CorrelationMatrix = {
  labels: string[];
  data: number[][];
  max: number;
  min: number;
};

export type GeoPoint = {
  lat: number;
  lng: number;
  value: number;
  label: string;
  type: string;
};

export type NetworkNode = {
  id: string;
  label: string;
  value: number;
  type: string;
  color: string;
};

export type NetworkLink = {
  source: string;
  target: string;
  value: number;
  type: string;
};

export type SankeyNode = {
  name: string;
};

export type SankeyLink = {
  source: number;
  target: number;
  value: number;
};

/**
 * Generate mock time-series data for historical visualization
 * In production, would fetch from database
 */
export function generateTimeSeriesData(days: number = 30): TimeSeriesPoint[] {
  const data: TimeSeriesPoint[] = [];
  const now = Date.now();

  for (let i = days; i >= 0; i--) {
    const date = new Date(now - i * 24 * 60 * 60 * 1000);
    const dateStr = date.toISOString().split('T')[0];
    
    // Simulated incident data
    const magnitude = 4.5 + Math.random() * 3.5;
    const count = Math.floor(3 + Math.random() * 12);
    
    let severity: 'low' | 'moderate' | 'high' | 'severe' | 'critical' = 'low';
    if (magnitude >= 7.0) severity = 'critical';
    else if (magnitude >= 6.0) severity = 'severe';
    else if (magnitude >= 5.5) severity = 'high';
    else if (magnitude >= 5.0) severity = 'moderate';

    data.push({
      date: dateStr,
      timestamp: date.getTime(),
      magnitude,
      count,
      severity,
    });
  }

  return data;
}

/**
 * Build correlation matrix from disaster types
 * Shows relationship strength between different disaster indicators
 */
export function buildCorrelationMatrix(): CorrelationMatrix {
  const labels = [
    'Earthquake (Magnitude)',
    'Aftershock Frequency',
    'Flood Depth',
    'Wind Speed (Cyclone)',
    'Wildfire Area',
    'Population Affected',
    'Infrastructure Damage',
  ];

  // Simulated correlation data (0-1 scale)
  const data = [
    [1.0, 0.82, 0.15, 0.08, 0.12, 0.85, 0.88],
    [0.82, 1.0, 0.12, 0.10, 0.14, 0.78, 0.81],
    [0.15, 0.12, 1.0, 0.65, 0.18, 0.72, 0.68],
    [0.08, 0.10, 0.65, 1.0, 0.22, 0.75, 0.70],
    [0.12, 0.14, 0.18, 0.22, 1.0, 0.58, 0.62],
    [0.85, 0.78, 0.72, 0.75, 0.58, 1.0, 0.91],
    [0.88, 0.81, 0.68, 0.70, 0.62, 0.91, 1.0],
  ];

  return {
    labels,
    data,
    max: 1.0,
    min: 0.0,
  };
}

/**
 * Generate geo-spatial distribution points for choropleth/globe visualization
 */
export function generateGeoDistribution(): GeoPoint[] {
  const hotspots: GeoPoint[] = [
    // Ring of Fire - Pacific
    { lat: 35.6762, lng: 139.6503, value: 0.92, label: 'Tokyo, Japan', type: 'earthquake' },
    { lat: -33.8688, lng: 151.2093, value: 0.65, label: 'Sydney, Australia', type: 'earthquake' },
    { lat: 19.076, lng: 72.8777, value: 0.88, label: 'Mumbai, India', type: 'flood' },
    // Atlantic Hurricane Zone
    { lat: 29.7604, lng: -95.3698, value: 0.78, label: 'Houston, USA', type: 'cyclone' },
    { lat: 18.4241, lng: -69.9291, value: 0.82, label: 'Dominican Republic', type: 'cyclone' },
    // Asian Monsoon
    { lat: 23.1291, lng: 113.2644, value: 0.75, label: 'Guangzhou, China', type: 'flood' },
    // Mediterranean
    { lat: 37.7749, lng: 122.4194, value: 0.71, label: 'San Francisco, USA', type: 'wildfire' },
    // Australia Fire Zone
    { lat: -25.2744, lng: 133.7751, value: 0.85, label: 'Central Australia', type: 'wildfire' },
    // Amazon
    { lat: -3.4653, lng: -62.2159, value: 0.79, label: 'Manaus, Brazil', type: 'wildfire' },
    // Mediterranean
    { lat: 39.9526, lng: -3.11, value: 0.68, label: 'Madrid, Spain', type: 'wildfire' },
  ];

  return hotspots;
}

/**
 * Build disaster network graph showing cascading relationships
 * (e.g., earthquake → landslide, cyclone → flood → power outage)
 */
export function buildDisasterNetwork(): { nodes: NetworkNode[]; links: NetworkLink[] } {
  const nodes: NetworkNode[] = [
    { id: 'eq', label: 'Earthquake', value: 4, type: 'primary', color: '#67e8f9' },
    { id: 'aftershock', label: 'Aftershocks', value: 3, type: 'secondary', color: '#06b6d4' },
    { id: 'landslide', label: 'Landslide', value: 3, type: 'cascade', color: '#eab308' },
    { id: 'dam', label: 'Dam Failure', value: 2, type: 'cascade', color: '#f97316' },
    { id: 'flood', label: 'Flood', value: 4, type: 'primary', color: '#3b82f6' },
    { id: 'disease', label: 'Disease', value: 2, type: 'cascade', color: '#f43f5e' },
    { id: 'cyclone', label: 'Cyclone', value: 4, type: 'primary', color: '#0ea5e9' },
    { id: 'storm-surge', label: 'Storm Surge', value: 3, type: 'cascade', color: '#1d4ed8' },
    { id: 'fire', label: 'Wildfire', value: 4, type: 'primary', color: '#fb923c' },
    { id: 'smoke', label: 'Air Quality', value: 2, type: 'cascade', color: '#d4d4d8' },
    { id: 'power', label: 'Power Outage', value: 3, type: 'cascade', color: '#fbbf24' },
  ];

  const links: NetworkLink[] = [
    { source: 'eq', target: 'aftershock', value: 1, type: 'cascade' },
    { source: 'eq', target: 'landslide', value: 1, type: 'cascade' },
    { source: 'eq', target: 'dam', value: 0.8, type: 'cascade' },
    { source: 'dam', target: 'flood', value: 1, type: 'cascade' },
    { source: 'flood', target: 'disease', value: 0.6, type: 'cascade' },
    { source: 'cyclone', target: 'storm-surge', value: 1, type: 'cascade' },
    { source: 'cyclone', target: 'flood', value: 0.9, type: 'cascade' },
    { source: 'cyclone', target: 'power', value: 0.8, type: 'cascade' },
    { source: 'fire', target: 'smoke', value: 1, type: 'cascade' },
    { source: 'fire', target: 'power', value: 0.7, type: 'cascade' },
    { source: 'landslide', target: 'power', value: 0.5, type: 'cascade' },
  ];

  return { nodes, links };
}

/**
 * Build Sankey flow diagram showing incident progression through severity stages
 */
export function buildSankeyFlow(): { nodes: SankeyNode[]; links: SankeyLink[] } {
  const nodes: SankeyNode[] = [
    { name: 'Initial Detection' },
    { name: 'Monitoring' },
    { name: 'Low Risk' },
    { name: 'Moderate Risk' },
    { name: 'High Risk' },
    { name: 'Severe Risk' },
    { name: 'Critical Risk' },
    { name: 'Escalated Response' },
    { name: 'Emergency Declared' },
    { name: 'Full Mobilization' },
    { name: 'Recovery Phase' },
  ];

  const links: SankeyLink[] = [
    { source: 0, target: 1, value: 100 },
    { source: 1, target: 2, value: 45 },
    { source: 1, target: 3, value: 35 },
    { source: 1, target: 4, value: 12 },
    { source: 1, target: 5, value: 6 },
    { source: 1, target: 6, value: 2 },
    { source: 2, target: 10, value: 45 },
    { source: 3, target: 7, value: 25 },
    { source: 3, target: 10, value: 10 },
    { source: 4, target: 7, value: 10 },
    { source: 4, target: 8, value: 2 },
    { source: 5, target: 8, value: 5 },
    { source: 5, target: 9, value: 1 },
    { source: 6, target: 9, value: 2 },
    { source: 7, target: 8, value: 25 },
    { source: 8, target: 9, value: 10 },
    { source: 9, target: 10, value: 12 },
  ];

  return { nodes, links };
}

/**
 * Generate regional distribution statistics
 */
export function generateRegionalStats() {
  return {
    regions: [
      { name: 'Ring of Fire', incidents: 2847, avg_magnitude: 6.2, population_at_risk: 1.2e9 },
      { name: 'Atlantic Basin', incidents: 423, avg_magnitude: 5.8, population_at_risk: 280e6 },
      { name: 'Indian Ocean', incidents: 589, avg_magnitude: 5.9, population_at_risk: 2.1e9 },
      { name: 'Mediterranean', incidents: 312, avg_magnitude: 5.4, population_at_risk: 450e6 },
      { name: 'Australian Region', incidents: 234, avg_magnitude: 5.6, population_at_risk: 26e6 },
    ],
  };
}

/**
 * Prepare data for export (CSV, JSON)
 */
export function exportAnalyticsData(format: 'csv' | 'json' = 'json') {
  const timeSeries = generateTimeSeriesData(30);
  const correlation = buildCorrelationMatrix();
  const geoDistribution = generateGeoDistribution();
  const { nodes: netNodes, links: netLinks } = buildDisasterNetwork();
  const { nodes: sankeyNodes, links: sankeyLinks } = buildSankeyFlow();
  const regional = generateRegionalStats();

  if (format === 'json') {
    return JSON.stringify(
      {
        export_date: new Date().toISOString(),
        time_series: timeSeries,
        correlation_matrix: correlation,
        geo_distribution: geoDistribution,
        network: { nodes: netNodes, links: netLinks },
        sankey_flow: { nodes: sankeyNodes, links: sankeyLinks },
        regional_statistics: regional,
      },
      null,
      2,
    );
  }

  // CSV export
  let csv = 'Analytics Export - ' + new Date().toISOString() + '\n\n';
  csv += '# Time Series Data\n';
  csv += 'Date,Timestamp,Magnitude,Count,Severity\n';
  timeSeries.forEach(row => {
    csv += `${row.date},${row.timestamp},${row.magnitude.toFixed(2)},${row.count},${row.severity}\n`;
  });

  csv += '\n# Regional Statistics\n';
  csv += 'Region,Incidents,Avg Magnitude,Population at Risk\n';
  regional.regions.forEach(row => {
    csv += `"${row.name}",${row.incidents},${row.avg_magnitude.toFixed(2)},${row.population_at_risk.toExponential(1)}\n`;
  });

  return csv;
}
