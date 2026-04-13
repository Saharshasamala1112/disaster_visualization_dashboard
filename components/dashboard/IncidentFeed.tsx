import { AlertTriangle, Camera, Mic, Radio, Video } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type IncidentFeedItem } from "@/lib/realtime/mock-pipeline";
import { cn } from "@/lib/utils";

type DataFreshness = "live" | "stale" | "offline";

function sentimentClass(sentiment: IncidentFeedItem["sentiment"]) {
  if (sentiment === "critical") {
    return "border-rose-400/25 bg-rose-400/10 text-rose-300";
  }
  if (sentiment === "warning") {
    return "border-amber-400/25 bg-amber-400/10 text-amber-300";
  }
  return "border-emerald-400/25 bg-emerald-400/10 text-emerald-300";
}

function mediaIcon(media: IncidentFeedItem["media"]) {
  if (media === "image") {
    return Camera;
  }
  if (media === "video") {
    return Video;
  }
  if (media === "audio") {
    return Mic;
  }
  return Radio;
}

export function IncidentFeed({
  incidents,
  updatedAt,
  freshness,
}: {
  incidents: IncidentFeedItem[];
  updatedAt: string;
  freshness: DataFreshness;
}) {
  const freshnessClassName =
    freshness === "live"
      ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-300"
      : freshness === "stale"
        ? "border-amber-400/25 bg-amber-400/10 text-amber-300"
        : "border-rose-400/25 bg-rose-400/10 text-rose-300";

  const freshnessText = freshness === "live" ? "live" : freshness === "stale" ? "stale" : "offline";

  const updatedText = updatedAt
    ? new Date(updatedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
    : "No sync yet";

  return (
    <Card className="border-white/10 bg-zinc-900/85 text-white transition-all duration-300 hover:-translate-y-0.5 hover:border-violet-300/30 hover:shadow-[0_12px_28px_rgba(167,139,250,0.18)]">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-base uppercase tracking-[0.18em] text-zinc-300">Multimodal incident feed</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-sky-400/25 bg-sky-400/10 text-sky-300">
              Updated {updatedText}
            </Badge>
            <Badge variant="outline" className={cn("uppercase", freshnessClassName)}>
              {freshnessText}
            </Badge>
          </div>
        </div>
        <p className="text-xs text-zinc-400">Verified community signals + official alerts with confidence and sentiment triage.</p>
      </CardHeader>
      <CardContent>
        <div className="max-h-[420px] space-y-3 overflow-y-auto pr-1">
          {incidents.length === 0 && (
            <div className="rounded-2xl border border-dashed border-white/15 bg-black/15 p-4 text-sm text-zinc-400">
              Incident stream unavailable. Waiting for connectivity or next sync.
            </div>
          )}
          {incidents.map((incident) => {
            const MediaIcon = mediaIcon(incident.media);

            return (
              <article key={incident.id} className="rounded-2xl border border-white/10 bg-black/20 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-violet-300/30 hover:shadow-[0_10px_22px_rgba(167,139,250,0.16)]">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-semibold text-white">{incident.title}</h4>
                    <p className="mt-1 text-xs text-zinc-400">
                      {incident.location} · {incident.source}
                    </p>
                  </div>
                  <MediaIcon className="size-4 text-sky-300" />
                </div>

                <p className="mt-3 text-sm leading-6 text-zinc-300">{incident.summary}</p>

                <div className="mt-3 flex items-center justify-between gap-2 text-xs">
                  <Badge variant="outline" className={cn("capitalize", sentimentClass(incident.sentiment))}>
                    {incident.sentiment}
                  </Badge>
                  <div className="flex items-center gap-2 text-zinc-400">
                    <AlertTriangle className="size-3.5" />
                    <span>Confidence {incident.confidence}%</span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
