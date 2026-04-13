import { NextResponse } from "next/server";

import { buildLiveOpsSnapshot } from "@/lib/realtime/mock-pipeline";
import { type DisasterSlug } from "@/lib/disaster-data";

const allowedSlugs: DisasterSlug[] = ["overview", "flood", "earthquake", "cyclone", "wildfire"];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawSlug = searchParams.get("slug") ?? "overview";
  const slug = (allowedSlugs.includes(rawSlug as DisasterSlug) ? rawSlug : "overview") as DisasterSlug;

  const snapshot = await buildLiveOpsSnapshot(slug);

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
