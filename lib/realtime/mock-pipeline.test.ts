import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { ingestGeoSensorSignal, ingestWeatherSignal, parseFirmsConfidenceFromCsv } from '@/lib/realtime/mock-pipeline';

describe('parseFirmsConfidenceFromCsv', () => {
  it('parses letter confidence values', () => {
    const csv = 'latitude,longitude,confidence\n19.1,72.8,h';
    expect(parseFirmsConfidenceFromCsv(csv)).toBe(90);
  });

  it('parses numeric confidence values', () => {
    const csv = 'latitude,longitude,confidence\n19.1,72.8,81';
    expect(parseFirmsConfidenceFromCsv(csv)).toBe(81);
  });

  it('falls back to brightness-derived confidence', () => {
    const csv = 'latitude,longitude,bright_ti4\n19.1,72.8,400';
    expect(parseFirmsConfidenceFromCsv(csv)).toBe(96);
  });

  it('returns null for invalid input', () => {
    const csv = 'latitude,longitude\n19.1,72.8';
    expect(parseFirmsConfidenceFromCsv(csv)).toBeNull();
  });
});

describe('pipeline ingestion fallbacks', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('uses OpenWeather live feed for cyclone when API key and fetch succeed', async () => {
    vi.stubEnv('OPENWEATHER_API_KEY', 'demo-key');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ wind: { speed: 20 } }),
    }));

    const result = await ingestWeatherSignal('cyclone');

    expect(result.provider).toBe('openweather-live');
    expect(result.value).toBe('72 km/h');
  });

  it('falls back for cyclone weather when API key is missing', async () => {
    vi.stubEnv('OPENWEATHER_API_KEY', '');

    const result = await ingestWeatherSignal('cyclone');

    expect(result.provider).toBe('mock-weather-fallback');
    expect(result.value).toMatch(/km\/h$/);
  });

  it('uses NASA FIRMS live feed for wildfire when API key and CSV are valid', async () => {
    vi.stubEnv('FIRMS_API_KEY', 'demo-key');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      text: async () => 'latitude,longitude,confidence\n-3.1,-60.2,n',
    }));

    const result = await ingestGeoSensorSignal('wildfire');

    expect(result.provider).toBe('nasa-firms-live');
    expect(result.value).toBe('75%');
  });

  it('falls back for wildfire when FIRMS request fails', async () => {
    vi.stubEnv('FIRMS_API_KEY', 'demo-key');
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network')));

    const result = await ingestGeoSensorSignal('wildfire');

    expect(result.provider).toBe('nasa-firms-fallback');
    expect(result.value).toMatch(/%$/);
  });
});
