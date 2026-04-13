import { disasterConfigBySlug, type DisasterAction, type DisasterSignal, type DisasterSlug } from "@/lib/disaster-data";

export type IncidentFeedItem = {
  id: string;
  title: string;
  location: string;
  summary: string;
  sentiment: "critical" | "warning" | "stable";
  confidence: number;
  source: "official" | "community" | "sensor";
  media: "text" | "image" | "video" | "audio";
  timestamp: string;
};

export type LiveOpsSnapshot = {
  updatedAt: string;
  statValues: Record<string, string>;
  signals: DisasterSignal[];
  actions: DisasterAction[];
  incidents: IncidentFeedItem[];
};

const locationBySlug: Record<DisasterSlug, string[]> = {
  overview: ["Mumbai", "Hyderabad", "Visakhapatnam", "Kolkata", "Pune"],
  flood: ["Thane", "Navi Mumbai", "Kolhapur", "Patna", "Guwahati"],
  earthquake: ["Dehradun", "Gangtok", "Imphal", "Guwahati", "Srinagar"],
  cyclone: ["Kakinada", "Machilipatnam", "Puri", "Paradip", "Srikakulam"],
  wildfire: ["Indore", "Nagpur", "Bhopal", "Raipur", "Udaipur"],
};

function jitter(base: number, spread: number) {
  return Math.max(0, Math.round(base + (Math.random() * 2 - 1) * spread));
}

function pick<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function computeDynamicStatValues(slug: DisasterSlug): Record<string, string> {
  if (slug === "flood") {
    return {
      "High-water alerts": String(jitter(18, 3)),
      "People at relocation risk": `${jitter(420, 30)}k`,
      "Boat teams available": String(jitter(64, 5)),
      "Access reliability": `${jitter(62, 8)}%`,
    };
  }

  if (slug === "earthquake") {
    return {
      "Priority sectors": String(jitter(9, 2)),
      "Potentially unstable buildings": jitter(1860, 140).toLocaleString("en-IN"),
      "Trauma teams": String(jitter(37, 4)),
      "Aftershock risk": pick(["HIGH", "SEVERE", "ELEVATED"]),
    };
  }

  if (slug === "cyclone") {
    return {
      "Landfall window": `${jitter(11, 2)}h`,
      "Evacuation demand": `${jitter(680, 55)}k`,
      "Shelters online": String(jitter(412, 20)),
      "Grid fragility": pick(["HIGH", "SEVERE", "ELEVATED"]),
    };
  }

  if (slug === "wildfire") {
    return {
      "Active firelines": String(jitter(13, 3)),
      "Smoke exposure": `${(jitter(210, 20) / 100).toFixed(1)}M`,
      "Ground crews": String(jitter(54, 6)),
      "Containment outlook": pick(["UNSTABLE", "TENSE", "VOLATILE"]),
    };
  }

  return {
    "Active incidents": String(jitter(47, 5)),
    "Affected people": `${(jitter(124, 10) / 100).toFixed(2)}M`,
    "Response teams": String(jitter(128, 12)),
    "Risk posture": pick(["HIGH", "SEVERE", "ELEVATED"]),
  };
}

function buildSignals(baseSignals: DisasterSignal[]) {
  return baseSignals.map((signal) => {
    if (signal.value.includes("%")) {
      return {
        ...signal,
        value: `${jitter(parseInt(signal.value, 10) || 70, 6)}%`,
      };
    }

    if (signal.value.includes("x")) {
      const next = Math.max(1.1, 1.2 + Math.random() * 1.1);
      return {
        ...signal,
        value: `${next.toFixed(1)}x`,
      };
    }

    if (/\d/.test(signal.value)) {
      const digits = parseInt(signal.value.replace(/[^0-9]/g, ""), 10) || 20;
      return {
        ...signal,
        value: jitter(digits, Math.max(3, Math.floor(digits * 0.1))).toLocaleString("en-IN"),
      };
    }

    return signal;
  });
}

function buildIncidents(slug: DisasterSlug): IncidentFeedItem[] {
  const locations = locationBySlug[slug];
  const now = Date.now();
  const sources: IncidentFeedItem["source"][] = ["official", "community", "sensor"];
  const media: IncidentFeedItem["media"][] = ["text", "image", "video", "audio"];
  const sentiments: IncidentFeedItem["sentiment"][] = ["critical", "warning", "stable"];

  return Array.from({ length: 6 }).map((_, index) => {
    const sentiment = pick(sentiments);
    const confidence = jitter(sentiment === "critical" ? 88 : 78, 12);

    return {
      id: `${slug}-${now}-${index}`,
      title: `${slug.toUpperCase()} field report ${index + 1}`,
      location: pick(locations),
      summary:
        sentiment === "critical"
          ? "Urgent escalation detected. Resource demand is increasing faster than current response throughput."
          : sentiment === "warning"
            ? "Conditions are degrading and may cross alert thresholds within the next operational window."
            : "Situation stable after latest checks, but continuous monitoring remains active.",
      sentiment,
      confidence,
      source: pick(sources),
      media: pick(media),
      timestamp: new Date(now - index * 1000 * 60 * 3).toISOString(),
    };
  });
}

type UsgsFeature = {
  properties?: {
    mag?: number;
    place?: string;
  };
};

type UsgsResponse = {
  features?: UsgsFeature[];
};

type OpenWeatherResponse = {
  wind?: {
    speed?: number;
  };
  weather?: Array<{
    description?: string;
  }>;
};

type OpenMeteoFloodResponse = {
  daily?: {
    river_discharge?: number[];
  };
};

export function parseFirmsConfidenceFromCsv(csv: string): number | null {
  const lines = csv.trim().split(/\r?\n/);
  if (lines.length < 2) return null;

  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const sample = lines[1].split(",");
  if (sample.length !== headers.length) return null;

  const confidenceIndex = headers.indexOf("confidence");
  const brightIndex = headers.indexOf("bright_ti4");

  if (confidenceIndex >= 0) {
    const raw = sample[confidenceIndex]?.trim();
    const mapped = raw === "h" ? 90 : raw === "n" ? 75 : raw === "l" ? 55 : Number(raw);
    if (!Number.isNaN(mapped) && mapped > 0) {
      return Math.min(100, Math.max(1, Math.round(mapped)));
    }
  }

  if (brightIndex >= 0) {
    const brightness = Number(sample[brightIndex]);
    if (!Number.isNaN(brightness) && brightness > 0) {
      // Approximate confidence from thermal brightness range.
      return Math.min(100, Math.max(35, Math.round((brightness - 280) * 0.8)));
    }
  }

  return null;
}

async function fetchJsonWithTimeout<T>(url: string, timeoutMs: number): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      cache: "no-store",
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }

    return (await response.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}

async function fetchTextWithTimeout(url: string, timeoutMs: number): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      cache: "no-store",
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }

    return await response.text();
  } finally {
    clearTimeout(timer);
  }
}

export async function ingestWeatherSignal(slug: DisasterSlug) {
  if (slug === "cyclone") {
    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (apiKey) {
      try {
        // Odisha coast sample point for cyclone-risk wind observations.
        const openWeather = await fetchJsonWithTimeout<OpenWeatherResponse>(
          `https://api.openweathermap.org/data/2.5/weather?lat=19.8&lon=85.8&appid=${apiKey}&units=metric`,
          3000
        );

        const windMs = openWeather.wind?.speed;
        if (typeof windMs === "number") {
          const windKmh = Math.round(windMs * 3.6);
          return {
            provider: "openweather-live",
            value: `${windKmh} km/h`,
          };
        }
      } catch {
        // Keep fallback path stable for command center availability.
      }
    }

    return {
      provider: "mock-weather-fallback",
      value: `${jitter(110, 20)} km/h`,
    };
  }

  const value = `${jitter(64, 15)} mm/hr`;
  return {
    provider: "mock-weather-api",
    value,
  };
}

export async function ingestGeoSensorSignal(slug: DisasterSlug) {
  if (slug === "flood") {
    try {
      // Open-Meteo Flood API — free, no key required. River discharge for Mumbai coast.
      const floodData = await fetchJsonWithTimeout<OpenMeteoFloodResponse>(
        "https://flood-api.open-meteo.com/v1/flood?latitude=19.07&longitude=72.88&daily=river_discharge&forecast_days=1",
        3500
      );
      const discharge = floodData.daily?.river_discharge?.[0];
      if (typeof discharge === "number") {
        return {
          provider: "open-meteo-flood-live",
          value: `${Math.round(discharge)} m³/s`,
        };
      }
    } catch {
      // Continue to fallback.
    }
  }

  if (slug === "earthquake") {
    try {
      const usgs = await fetchJsonWithTimeout<UsgsResponse>(
        "https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&orderby=time&minmagnitude=4&limit=1",
        3000
      );

      const latest = usgs.features?.[0]?.properties;
      if (typeof latest?.mag === "number") {
        return {
          provider: "usgs-live",
          value: `${latest.mag.toFixed(1)} Mw`,
        };
      }
    } catch {
      // Fall through to mock fallback to keep response shape stable.
    }
  }

  if (slug === "wildfire") {
    const firmsKey = process.env.FIRMS_API_KEY;
    if (firmsKey) {
      try {
        const csv = await fetchTextWithTimeout(
          `https://firms.modaps.eosdis.nasa.gov/api/area/csv/${firmsKey}/VIIRS_SNPP_NRT/world/1`,
          3500
        );

        const confidence = parseFirmsConfidenceFromCsv(csv);
        if (confidence !== null) {
          return {
            provider: "nasa-firms-live",
            value: `${confidence}%`,
          };
        }
      } catch {
        // Continue to fallback to preserve dashboard uptime.
      }
    }
  }

  const value = slug === "earthquake" ? `${(4.4 + Math.random() * 1.6).toFixed(1)} Mw` : `${jitter(72, 10)}%`;
  return {
    provider:
      slug === "earthquake"
        ? "usgs-fallback"
        : slug === "wildfire"
          ? "nasa-firms-fallback"
          : "mock-geo-sensors",
    value,
  };
}

export async function ingestCommunitySignal(slug: DisasterSlug) {
  return {
    provider: "mock-community-feed",
    value: `${jitter(1200, 250)} reports/hr`,
    sentiment: pick(["anxious", "mixed", "stable"]),
  };
}

export async function buildLiveOpsSnapshot(slug: DisasterSlug): Promise<LiveOpsSnapshot> {
  const base = disasterConfigBySlug[slug];
  const [weather, geo, community] = await Promise.all([
    ingestWeatherSignal(slug),
    ingestGeoSensorSignal(slug),
    ingestCommunitySignal(slug),
  ]);

  const statValues = computeDynamicStatValues(slug);
  const signals = buildSignals(base.signals).map((signal, idx) => {
    if (idx === 0) {
      return { ...signal, detail: `${signal.detail} | Weather: ${weather.value}` };
    }
    if (idx === 1) {
      return { ...signal, detail: `${signal.detail} | Sensors: ${geo.value}` };
    }
    return { ...signal, detail: `${signal.detail} | Community: ${community.value}` };
  });

  const actions = base.actions.map((action, index) => ({
    ...action,
    eta: `${jitter(6 + index * 7, 5)} min`,
  }));

  return {
    updatedAt: new Date().toISOString(),
    statValues,
    signals,
    actions,
    incidents: buildIncidents(slug),
  };
}
