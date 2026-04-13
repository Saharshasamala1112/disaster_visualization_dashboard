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

export async function ingestWeatherSignal(slug: DisasterSlug) {
  const value = slug === "cyclone" ? `${jitter(110, 20)} km/h` : `${jitter(64, 15)} mm/hr`;
  return {
    provider: "mock-weather-api",
    value,
  };
}

export async function ingestGeoSensorSignal(slug: DisasterSlug) {
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

  const value = slug === "earthquake" ? `${(4.4 + Math.random() * 1.6).toFixed(1)} Mw` : `${jitter(72, 10)}%`;
  return {
    provider: slug === "earthquake" ? "usgs-fallback" : "mock-geo-sensors",
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
