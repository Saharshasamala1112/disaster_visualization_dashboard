"use client";

import { useMemo, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { Activity, ArrowUpRight, LayoutDashboard, ListChecks, Map, ShieldCheck, Siren, Waves, Zap } from "lucide-react";
import { usePathname } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { disasterConfigBySlug, type DisasterSlug } from "@/lib/disaster-data";
import { type LiveOpsSnapshot } from "@/lib/realtime/mock-pipeline";
import { cn } from "@/lib/utils";

import { DisasterTabs } from "./DisasterTabs";
import { IncidentFeed } from "./IncidentFeed";
import LiveMap, { type HeatPoint } from "./LiveMapDynamic";

const signalIcons = [Activity, Siren, ShieldCheck];
const featureIcons = [ArrowUpRight, Waves, Zap];
type DataFreshness = "live" | "stale" | "offline";
type OpsPanel = "overview" | "map" | "signals" | "actions" | "incidents" | "features";

const panelMotionProfiles: Record<
  OpsPanel,
  {
    initial: { opacity: number; x: number; y?: number; scale?: number };
    animate: { opacity: number; x: number; y?: number; scale?: number };
    exit: { opacity: number; x: number; y?: number; scale?: number };
    transition: { duration: number; ease: [number, number, number, number] };
  }
> = {
  overview: {
    initial: { opacity: 0, x: 16, scale: 0.998 },
    animate: { opacity: 1, x: 0, scale: 1 },
    exit: { opacity: 0, x: -14, scale: 0.998 },
    transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] },
  },
  map: {
    initial: { opacity: 0, x: 40, y: 6, scale: 0.992 },
    animate: { opacity: 1, x: 0, y: 0, scale: 1 },
    exit: { opacity: 0, x: -30, y: -4, scale: 0.992 },
    transition: { duration: 0.52, ease: [0.16, 1, 0.3, 1] },
  },
  signals: {
    initial: { opacity: 0, x: 12 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -10 },
    transition: { duration: 0.22, ease: [0.2, 0.8, 0.2, 1] },
  },
  actions: {
    initial: { opacity: 0, x: 10 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -8 },
    transition: { duration: 0.2, ease: [0.2, 0.8, 0.2, 1] },
  },
  incidents: {
    initial: { opacity: 0, x: 18, scale: 0.996 },
    animate: { opacity: 1, x: 0, scale: 1 },
    exit: { opacity: 0, x: -14, scale: 0.996 },
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
  },
  features: {
    initial: { opacity: 0, y: 14, scale: 0.995, x: 0 },
    animate: { opacity: 1, y: 0, scale: 1, x: 0 },
    exit: { opacity: 0, y: -10, scale: 0.995, x: 0 },
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
};

const panelStaggerProfiles: Record<OpsPanel, { staggerChildren: number; delayChildren: number; itemDuration: number }> = {
  overview: { staggerChildren: 0.07, delayChildren: 0.04, itemDuration: 0.26 },
  map: { staggerChildren: 0.1, delayChildren: 0.08, itemDuration: 0.35 },
  signals: { staggerChildren: 0.05, delayChildren: 0.02, itemDuration: 0.18 },
  actions: { staggerChildren: 0.04, delayChildren: 0.02, itemDuration: 0.17 },
  incidents: { staggerChildren: 0.05, delayChildren: 0.03, itemDuration: 0.2 },
  features: { staggerChildren: 0.08, delayChildren: 0.05, itemDuration: 0.28 },
};

const panelHoverToneClass: Record<OpsPanel, string> = {
  overview: "hover:-translate-y-0.5 hover:border-sky-300/25 hover:shadow-[0_12px_28px_rgba(56,189,248,0.2)]",
  map: "hover:-translate-y-0.5 hover:border-cyan-300/30 hover:shadow-[0_14px_32px_rgba(34,211,238,0.22)]",
  signals: "hover:-translate-y-0.5 hover:border-emerald-300/30 hover:shadow-[0_12px_28px_rgba(16,185,129,0.2)]",
  actions: "hover:-translate-y-0.5 hover:border-amber-300/30 hover:shadow-[0_12px_28px_rgba(245,158,11,0.18)]",
  incidents: "hover:-translate-y-0.5 hover:border-violet-300/30 hover:shadow-[0_12px_28px_rgba(167,139,250,0.22)]",
  features: "hover:-translate-y-0.5 hover:border-rose-300/30 hover:shadow-[0_12px_28px_rgba(251,113,133,0.2)]",
};

const riskHeatPointsBySlug: Record<DisasterSlug, HeatPoint[]> = {
  overview: [
    { lat: 19.07, lng: 72.88, intensity: 0.84, radiusKm: 58, label: "Coastal compound risk" },
    { lat: 13.08, lng: 80.27, intensity: 0.68, radiusKm: 52, label: "Cyclone surge corridor" },
    { lat: 26.85, lng: 80.95, intensity: 0.46, radiusKm: 44, label: "Floodplain pressure" },
  ],
  flood: [
    { lat: 19.15, lng: 73.0, intensity: 0.88, radiusKm: 56, label: "Drainage saturation hotspot" },
    { lat: 25.6, lng: 85.1, intensity: 0.62, radiusKm: 48, label: "River overflow risk" },
    { lat: 26.15, lng: 91.74, intensity: 0.58, radiusKm: 45, label: "Rapid inundation zone" },
  ],
  earthquake: [
    { lat: 30.32, lng: 78.03, intensity: 0.82, radiusKm: 42, label: "Aftershock exposure" },
    { lat: 27.33, lng: 88.62, intensity: 0.66, radiusKm: 36, label: "Structural uncertainty band" },
    { lat: 34.08, lng: 74.79, intensity: 0.54, radiusKm: 34, label: "Rescue access risk" },
  ],
  cyclone: [
    { lat: 15.9, lng: 80.66, intensity: 0.9, radiusKm: 62, label: "Landfall surge core" },
    { lat: 19.3, lng: 84.8, intensity: 0.72, radiusKm: 54, label: "Coastal evacuation friction" },
    { lat: 17.7, lng: 83.3, intensity: 0.55, radiusKm: 46, label: "Power fragility corridor" },
  ],
  wildfire: [
    { lat: 22.72, lng: 75.86, intensity: 0.78, radiusKm: 50, label: "Fireline acceleration" },
    { lat: 21.15, lng: 79.09, intensity: 0.64, radiusKm: 44, label: "Smoke health plume" },
    { lat: 23.26, lng: 77.41, intensity: 0.49, radiusKm: 38, label: "Water access instability" },
  ],
  landslide: [
    { lat: 30.32, lng: 78.03, intensity: 0.86, radiusKm: 45, label: "Slope-failure acceleration" },
    { lat: 27.1, lng: 88.6, intensity: 0.69, radiusKm: 39, label: "Hill-road blockage corridor" },
    { lat: 31.1, lng: 77.2, intensity: 0.57, radiusKm: 34, label: "Debris choke-point risk" },
  ],
  heatwave: [
    { lat: 28.61, lng: 77.21, intensity: 0.91, radiusKm: 63, label: "Urban heat island core" },
    { lat: 26.85, lng: 80.95, intensity: 0.74, radiusKm: 55, label: "Cooling gap cluster" },
    { lat: 23.26, lng: 77.41, intensity: 0.6, radiusKm: 47, label: "Grid stress and heat exposure" },
  ],
};

const uniqueRiskMapPoints = [
  "Existing models usually map hazard intensity only. This map blends hazard + infrastructure fragility + response access in one risk surface.",
  "Confidence-aware layering reduces false positives from noisy social media by weighting verified field and sensor evidence.",
  "Actionability is built in: heat pockets align to likely logistics failure zones, not just where the hazard is strongest.",
];

function freshnessBadgeClassName(freshness: DataFreshness) {
  if (freshness === "live") {
    return "border-emerald-400/30 bg-emerald-400/10 text-emerald-300";
  }
  if (freshness === "stale") {
    return "border-amber-400/30 bg-amber-400/10 text-amber-300";
  }
  return "border-rose-400/30 bg-rose-400/10 text-rose-300";
}

export function DisasterCommandCenter({ slug }: { slug: DisasterSlug }) {
  const pathname = usePathname();
  const config = disasterConfigBySlug[slug];
  const [activePanel, setActivePanel] = useState<OpsPanel>("overview");
  const [pulseEnabled, setPulseEnabled] = useState(true);

  const cacheKey = `live-ops-cache:${slug}`;

  const readCache = (): { snapshot?: LiveOpsSnapshot } | undefined => {
    if (typeof window === "undefined") return undefined;
    try {
      const cached = window.localStorage.getItem(cacheKey);
      if (!cached) return undefined;
      return JSON.parse(cached) as { snapshot?: LiveOpsSnapshot };
    } catch {
      return undefined;
    }
  };

  const { data, isFetching, isError, dataUpdatedAt } = useQuery({
    queryKey: ["live-ops", slug],
    queryFn: async () => {
      const response = await fetch(`/api/live-ops?slug=${slug}`, { cache: "no-store" });
      if (!response.ok) throw new Error(`Live ops fetch failed: ${response.status}`);
      const json = (await response.json()) as { snapshot?: LiveOpsSnapshot };
      if (json.snapshot && typeof window !== "undefined") {
        window.localStorage.setItem(cacheKey, JSON.stringify({ snapshot: json.snapshot, cachedAt: Date.now() }));
      }
      return json;
    },
    initialData: readCache,
    initialDataUpdatedAt: 0,
    refetchInterval: 6_000,
    staleTime: 5_000,
    gcTime: 30_000,
    retry: 1,
  });

  const live = data?.snapshot ?? null;
  const freshness: DataFreshness = isError
    ? live
      ? "stale"
      : "offline"
    : isFetching && !live
      ? "offline"
      : live
        ? "live"
        : "offline";

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) setPulseEnabled(false);
  }, []);

  useEffect(() => {
    const validPanels: OpsPanel[] = ["overview", "map", "signals", "actions", "incidents", "features"];

    const syncPanelFromUrl = () => {
      const params = new URLSearchParams(window.location.search);
      const queryPanel = params.get("panel");
      if (queryPanel && validPanels.includes(queryPanel as OpsPanel)) {
        setActivePanel(queryPanel as OpsPanel);
      }
    };

    syncPanelFromUrl();
    window.addEventListener("popstate", syncPanelFromUrl);

    return () => {
      window.removeEventListener("popstate", syncPanelFromUrl);
    };
  }, []);

  const handlePanelChange = (panel: OpsPanel) => {
    setActivePanel(panel);
    const next = new URLSearchParams(window.location.search);
    next.set("panel", panel);
    window.history.replaceState(null, "", `${pathname}?${next.toString()}`);
  };

  const stats = useMemo(
    () =>
      config.stats.map((stat) => ({
        ...stat,
        value: live?.statValues[stat.label] ?? stat.value,
      })),
    [config.stats, live?.statValues]
  );

  const signals = live?.signals ?? config.signals;
  const actions = live?.actions ?? config.actions;
  const incidents = live?.incidents ?? [];
  const updatedAt = live?.updatedAt ?? "";
  const motionProfile = panelMotionProfiles[activePanel];
  const staggerProfile = panelStaggerProfiles[activePanel];
  const hoverToneClass = panelHoverToneClass[activePanel];
  const riskHeatPoints = riskHeatPointsBySlug[slug];
  const childContainerVariants: Variants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: staggerProfile.staggerChildren,
        delayChildren: staggerProfile.delayChildren,
      },
    },
  };
  const childItemVariants: Variants = {
    hidden: { opacity: 0, y: 12, scale: 0.995 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: staggerProfile.itemDuration,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };
  const panelButtons: { id: OpsPanel; label: string; hint: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: "overview", label: "Overview", hint: "Mission snapshot", icon: LayoutDashboard },
    { id: "map", label: "Geo map", hint: "Live spatial layer", icon: Map },
    { id: "signals", label: "Signals", hint: "Decision indicators", icon: Activity },
    { id: "actions", label: "Action queue", hint: "Execution priorities", icon: ListChecks },
    { id: "incidents", label: "Incident feed", hint: "Stories + sentiment", icon: Siren },
    { id: "features", label: "Differentiators", hint: "What makes this unique", icon: Zap },
  ];
  const activePanelMeta = panelButtons.find((panel) => panel.id === activePanel) ?? panelButtons[0];

  const renderPanelContent = () => {
    if (activePanel === "map") {
      return (
        <motion.div variants={childContainerVariants} initial="hidden" animate="show" className="space-y-4">
          <motion.div variants={childItemVariants} className={cn("overflow-hidden rounded-[1.4rem] border border-white/10 bg-zinc-900 shadow-[0_20px_60px_rgba(0,0,0,0.3)] transition-all duration-300", hoverToneClass)}>
            <div className="flex flex-col gap-2 border-b border-white/10 px-5 py-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-lg font-medium text-white">{config.mapTitle}</div>
                <p className="text-sm text-zinc-400">{config.mapHint}</p>
              </div>
              <Badge variant="outline" className="border-sky-400/25 bg-sky-400/10 text-sky-300">
                Unified geospatial layer
              </Badge>
            </div>
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-3 text-xs text-zinc-400">
              <span>Pulse speed = urgency. Disable for accessibility or low-power mode.</span>
              <button
                type="button"
                onClick={() => setPulseEnabled((value) => !value)}
                className={cn(
                  "rounded-full border px-3 py-1.5 font-medium uppercase tracking-[0.12em] transition-all",
                  pulseEnabled
                    ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                    : "border-zinc-600/80 bg-zinc-800/70 text-zinc-300"
                )}
              >
                Pulse {pulseEnabled ? "On" : "Off"}
              </button>
            </div>
            <div className="h-[360px] sm:h-[430px] md:h-[500px] lg:h-[560px]">
              <LiveMap
                center={config.location}
                marker={config.marker}
                popupHtml={config.markerPopup}
                title={config.liveLabel}
                subTitle={config.liveSubLabel}
                heatPoints={riskHeatPoints}
                pulseEnabled={pulseEnabled}
              />
            </div>
          </motion.div>

          <motion.div variants={childItemVariants} className={cn("rounded-2xl border border-white/10 bg-zinc-900/85 p-5 text-white transition-all duration-300", hoverToneClass)}>
            <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-300">Why this risk heatmap is unique vs existing models</h3>
            <div className="mt-4 space-y-3">
              {uniqueRiskMapPoints.map((point) => (
                <div key={point} className="rounded-xl border border-white/8 bg-black/20 p-3 text-sm leading-6 text-zinc-300">
                  {point}
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      );
    }

    if (activePanel === "signals") {
      return (
        <Card className={cn("border-white/10 bg-zinc-900/85 text-white transition-all duration-300", hoverToneClass)}>
          <CardHeader>
            <CardTitle className="text-base uppercase tracking-[0.18em] text-zinc-300">Live decision signals</CardTitle>
          </CardHeader>
          <CardContent>
            <motion.div variants={childContainerVariants} initial="hidden" animate="show" className="space-y-4">
            {signals.map((signal, index) => {
              const Icon = signalIcons[index % signalIcons.length];
              return (
                <motion.div variants={childItemVariants} key={signal.title} className={cn("rounded-2xl border border-white/8 bg-black/20 p-4 transition-all duration-300", hoverToneClass)}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl bg-white/5 p-2 text-sky-300">
                        <Icon className="size-4" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">{signal.title}</div>
                        <p className="mt-1 text-xs leading-5 text-zinc-400">{signal.detail}</p>
                      </div>
                    </div>
                    <div className="text-right text-lg font-semibold text-white">{signal.value}</div>
                  </div>
                </motion.div>
              );
            })}
            </motion.div>
          </CardContent>
        </Card>
      );
    }

    if (activePanel === "actions") {
      return (
        <Card className={cn("border-white/10 bg-zinc-900/85 text-white transition-all duration-300", hoverToneClass)}>
          <CardHeader>
            <CardTitle className="text-base uppercase tracking-[0.18em] text-zinc-300">Immediate action queue</CardTitle>
          </CardHeader>
          <CardContent>
            <motion.div variants={childContainerVariants} initial="hidden" animate="show" className="space-y-3">
            {actions.map((action) => (
              <motion.div variants={childItemVariants} key={action.title} className={cn("rounded-2xl border border-white/8 bg-black/20 p-4 transition-all duration-300", hoverToneClass)}>
                <div className="text-sm font-medium text-white">{action.title}</div>
                <div className="mt-2 flex items-center justify-between text-xs text-zinc-400">
                  <span>{action.owner}</span>
                  <span>{action.eta}</span>
                </div>
              </motion.div>
            ))}
            </motion.div>
          </CardContent>
        </Card>
      );
    }

    if (activePanel === "incidents") {
      return (
        <motion.div variants={childContainerVariants} initial="hidden" animate="show">
          <motion.div variants={childItemVariants}>
            <IncidentFeed incidents={incidents} updatedAt={updatedAt} freshness={freshness} />
          </motion.div>
        </motion.div>
      );
    }

    if (activePanel === "features") {
      return (
        <motion.div variants={childContainerVariants} initial="hidden" animate="show" className="grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <motion.div variants={childItemVariants}>
            <Card className={cn("border-white/10 bg-zinc-900/85 text-white transition-all duration-300", hoverToneClass)}>
              <CardHeader>
                <CardTitle className="text-base uppercase tracking-[0.18em] text-zinc-300">Unique features that address current dashboard gaps</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-3">
                {config.features.map((feature, index) => {
                  const Icon = featureIcons[index % featureIcons.length];
                  return (
                    <motion.div variants={childItemVariants} key={feature.title} className={cn("rounded-2xl border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01))] p-5 transition-all duration-300", hoverToneClass)}>
                      <div className="mb-4 inline-flex rounded-2xl bg-white/5 p-2 text-emerald-300">
                        <Icon className="size-4" />
                      </div>
                      <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-white">{feature.title}</h3>
                      <p className="mt-3 text-sm leading-6 text-zinc-400">{feature.description}</p>
                    </motion.div>
                  );
                })}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={childItemVariants}>
            <Card className={cn("border-white/10 bg-zinc-900/85 text-white transition-all duration-300", hoverToneClass)}>
              <CardHeader>
                <CardTitle className="text-base uppercase tracking-[0.18em] text-zinc-300">How this overcomes existing limitations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {config.blindspots.map((blindspot) => (
                  <motion.div variants={childItemVariants} key={blindspot} className={cn("rounded-2xl border border-white/8 bg-black/20 p-4 text-sm leading-6 text-zinc-300 transition-all duration-300", hoverToneClass)}>
                    {blindspot}
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      );
    }

    return (
      <motion.div variants={childContainerVariants} initial="hidden" animate="show" className="grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <motion.div variants={childItemVariants}>
          <Card className={cn("border-white/10 bg-zinc-900/85 text-white transition-all duration-300", hoverToneClass)}>
            <CardHeader>
              <CardTitle className="text-base uppercase tracking-[0.18em] text-zinc-300">Operational synopsis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <motion.div variants={childItemVariants} className={cn("rounded-2xl border border-white/8 bg-black/20 p-4 text-sm leading-6 text-zinc-300 transition-all duration-300", hoverToneClass)}>
                {config.subtitle}
              </motion.div>
              <motion.div variants={childContainerVariants} className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {signals.slice(0, 2).map((signal) => (
                  <motion.div variants={childItemVariants} key={signal.title} className={cn("rounded-2xl border border-white/8 bg-black/20 p-4 transition-all duration-300", hoverToneClass)}>
                    <div className="text-xs uppercase tracking-[0.12em] text-zinc-500">{signal.title}</div>
                    <div className="mt-1 text-xl font-semibold text-white">{signal.value}</div>
                  </motion.div>
                ))}
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={childItemVariants}>
          <IncidentFeed incidents={incidents.slice(0, 3)} updatedAt={updatedAt} freshness={freshness} />
        </motion.div>
      </motion.div>
    );
  };

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 sm:gap-6 lg:gap-8">
      <section className="relative overflow-hidden rounded-[2rem] border border-zinc-200/80 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.18),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(16,185,129,0.14),_transparent_32%),linear-gradient(180deg,_rgba(248,250,252,0.98),_rgba(241,245,249,0.96))] p-5 shadow-[0_30px_70px_rgba(15,23,42,0.12)] sm:p-8 dark:border-white/10 dark:bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.22),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(16,185,129,0.18),_transparent_32%),linear-gradient(180deg,_rgba(24,24,27,0.98),_rgba(9,9,11,0.96))] dark:shadow-[0_30px_90px_rgba(0,0,0,0.45)]">
        <div className="absolute inset-0 bg-[linear-gradient(120deg,transparent_0%,rgba(255,255,255,0.04)_45%,transparent_100%)]" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-emerald-300">
                LIVE OPS LAYER
              </Badge>
              <Badge variant="outline" className={cn("px-3 py-1 uppercase tracking-[0.12em]", freshnessBadgeClassName(freshness))}>
                {freshness === "live" ? "Live sync" : freshness === "stale" ? "Stale cache" : "Offline fallback"}
              </Badge>
            </div>
            <div className="space-y-3">
              <h2 className="max-w-2xl text-3xl font-semibold tracking-tight text-zinc-900 lg:text-5xl dark:text-white">{config.pageTitle}</h2>
              <p className="max-w-2xl text-base leading-7 text-zinc-600 lg:text-lg dark:text-zinc-300">{config.subtitle}</p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:w-[360px] lg:grid-cols-1">
            <div className="rounded-2xl border border-zinc-200/70 bg-white/65 p-4 backdrop-blur-sm dark:border-white/10 dark:bg-black/25">
              <div className="text-xs uppercase tracking-[0.28em] text-zinc-500 dark:text-zinc-500">Why This Is Different</div>
              <p className="mt-2 text-sm leading-6 text-zinc-700 dark:text-zinc-300">The dashboard prioritizes operational bottlenecks, confidence gaps, and cross-system dependencies instead of isolated charts.</p>
            </div>
            <div className="rounded-2xl border border-zinc-200/70 bg-white/65 p-4 backdrop-blur-sm dark:border-white/10 dark:bg-black/25">
              <div className="flex items-center gap-2 text-emerald-300">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_20px_rgba(74,222,128,0.75)]" />
                <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">{config.liveLabel}</span>
              </div>
              <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">{config.liveSubLabel}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => (
          <Card key={item.label} className="border-white/10 bg-zinc-900/85 text-white shadow-[0_20px_60px_rgba(0,0,0,0.25)] backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className={cn("flex items-center gap-2 text-sm uppercase tracking-[0.18em]", item.titleClassName)}>
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                key={`${item.label}-${item.value}-${dataUpdatedAt}`}
                className={cn(
                  "text-5xl font-semibold tracking-tight transition-all duration-500",
                  item.valueClassName ?? "text-white",
                  "animate-in fade-in slide-in-from-bottom-1"
                )}
              >
                {item.value}
              </div>
              <p className={cn("mt-2 text-sm", item.detailClassName)}>{item.detail}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="rounded-[1.8rem] border border-zinc-200/80 bg-[linear-gradient(180deg,rgba(248,250,252,0.92),rgba(241,245,249,0.9))] p-4 dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(24,24,27,0.92),rgba(9,9,11,0.9))]">
          <div className="mb-3 px-2 text-xs uppercase tracking-[0.22em] text-zinc-500">Control panels</div>
          <div className="space-y-2">
            {panelButtons.map((panel) => {
              const Icon = panel.icon;
              const active = activePanel === panel.id;

              return (
                <button
                  key={panel.id}
                  type="button"
                  onClick={() => handlePanelChange(panel.id)}
                  className={cn(
                    "w-full rounded-2xl border px-4 py-3 text-left transition-all",
                    active
                      ? "border-emerald-500/35 bg-emerald-500/10 text-zinc-900 shadow-[0_10px_28px_rgba(16,185,129,0.16)] dark:border-emerald-400/30 dark:text-white"
                      : "border-zinc-200/70 bg-white/70 text-zinc-700 hover:border-zinc-300 hover:bg-white dark:border-white/8 dark:bg-black/10 dark:text-zinc-300 dark:hover:border-white/20 dark:hover:bg-white/5"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn("rounded-xl p-2", active ? "bg-emerald-400/15 text-emerald-600 dark:text-emerald-300" : "bg-zinc-100 text-zinc-500 dark:bg-white/5 dark:text-zinc-400")}>
                      <Icon className="size-4" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">{panel.label}</div>
                      <div className="mt-1 text-xs text-zinc-500">{panel.hint}</div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        <div className="min-w-0 space-y-4">
          <div className="rounded-[1.4rem] border border-zinc-200/80 bg-white/75 p-3 backdrop-blur-sm dark:border-white/10 dark:bg-zinc-900/70">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-200/70 bg-white/80 px-4 py-3 dark:border-white/8 dark:bg-black/20">
              <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">Current panel</div>
              <div className="flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1.5 text-xs font-medium uppercase tracking-[0.14em] text-emerald-700 dark:text-emerald-300">
                <activePanelMeta.icon className="size-3" />
                <span>{activePanelMeta.label}</span>
              </div>
            </div>
            <div className="mt-3 overflow-x-auto rounded-xl border border-zinc-200/70 dark:border-white/10">
              <DisasterTabs />
            </div>
          </div>
          <div className="min-w-0 rounded-[1.4rem] border border-zinc-200/80 bg-white/65 p-2 shadow-[0_16px_40px_rgba(15,23,42,0.07)] dark:border-white/10 dark:bg-zinc-900/35 dark:shadow-none">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={activePanel}
                initial={motionProfile.initial}
                animate={motionProfile.animate}
                exit={motionProfile.exit}
                transition={motionProfile.transition}
              >
                {renderPanelContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>
    </div>
  );
}
