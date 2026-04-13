import { NextResponse } from "next/server";

import { buildLiveOpsSnapshot } from "@/lib/realtime/mock-pipeline";
import { type DisasterSlug } from "@/lib/disaster-data";

const allowedSlugs: DisasterSlug[] = ["overview", "flood", "earthquake", "cyclone", "wildfire", "landslide", "heatwave"];
const SNAPSHOT_TTL_MS = 6_000;

const snapshotCache = new Map<
  DisasterSlug,
  {
    cachedAt: number;
    snapshot: Awaited<ReturnType<typeof buildLiveOpsSnapshot>>;
  }
>();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawSlug = searchParams.get("slug") ?? "overview";
  const slug = (allowedSlugs.includes(rawSlug as DisasterSlug) ? rawSlug : "overview") as DisasterSlug;

  const now = Date.now();
  const cached = snapshotCache.get(slug);
  const snapshot =
    cached && now - cached.cachedAt < SNAPSHOT_TTL_MS
      ? cached.snapshot
      : await buildLiveOpsSnapshot(slug);

  if (!cached || now - cached.cachedAt >= SNAPSHOT_TTL_MS) {
    snapshotCache.set(slug, { cachedAt: now, snapshot });
  }

  return NextResponse.json(
    {
      ok: true,
      slug,
      snapshot,
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}
