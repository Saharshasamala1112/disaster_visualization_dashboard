export type DisasterSlug = "overview" | "flood" | "earthquake" | "cyclone" | "wildfire" | "landslide" | "heatwave";

export type DisasterRoute = {
  id: DisasterSlug;
  label: string;
  icon: string;
  path: string;
};

export type DisasterStat = {
  label: string;
  value: string;
  detail: string;
  icon: string;
  titleClassName: string;
  detailClassName: string;
  valueClassName?: string;
};

export type DisasterSignal = {
  title: string;
  value: string;
  detail: string;
};

export type DisasterAction = {
  title: string;
  owner: string;
  eta: string;
};

export type DisasterFeature = {
  title: string;
  description: string;
};

export type DisasterConfig = {
  id: DisasterSlug;
  routeLabel: string;
  pageTitle: string;
  subtitle: string;
  mapTitle: string;
  mapHint: string;
  liveLabel: string;
  liveSubLabel: string;
  location: [number, number];
  marker: [number, number];
  markerPopup: string;
  stats: DisasterStat[];
  signals: DisasterSignal[];
  actions: DisasterAction[];
  blindspots: string[];
  features: DisasterFeature[];
};

export const disasterRoutes: DisasterRoute[] = [
  { id: "overview", label: "Overview", icon: "🌍", path: "/" },
  { id: "flood", label: "Flood", icon: "🌊", path: "/flood" },
  { id: "earthquake", label: "Earthquake", icon: "🫨", path: "/earthquake" },
  { id: "cyclone", label: "Cyclone", icon: "🌀", path: "/cyclone" },
  { id: "wildfire", label: "Wildfire", icon: "🔥", path: "/wildfire" },
  { id: "landslide", label: "Landslide", icon: "⛰️", path: "/landslide" },
  { id: "heatwave", label: "Heatwave", icon: "🌡️", path: "/heatwave" },
];

export const disasterConfigBySlug: Record<DisasterSlug, DisasterConfig> = {
  overview: {
    id: "overview",
    routeLabel: "Overview",
    pageTitle: "National disaster command center",
    subtitle:
      "A unified operations surface that combines hazard monitoring, field readiness, resource pressure, and public impact without forcing teams to jump across siloed dashboards.",
    mapTitle: "Live disaster map - India",
    mapHint: "Weather, seismic, relief, and shelter layers coordinated in one view",
    liveLabel: "Multi-hazard operations mesh",
    liveSubLabel: "Relief corridors, shelter strain, and field verification updated live",
    location: [22.6, 79.0],
    marker: [19.076, 72.8777],
    markerPopup: "<b>Flood alert</b><br>Mumbai region under compound-risk watch",
    stats: [
      { label: "Active incidents", value: "47", detail: "+12 in the last hour", icon: "🚨", titleClassName: "text-orange-400", detailClassName: "text-emerald-400" },
      { label: "Affected people", value: "1.24M", detail: "312 districts in elevated risk bands", icon: "👥", titleClassName: "text-sky-400", detailClassName: "text-rose-400" },
      { label: "Response teams", value: "128", detail: "91 already deployed on ground", icon: "🛡️", titleClassName: "text-emerald-400", detailClassName: "text-emerald-400" },
      { label: "Risk posture", value: "HIGH", detail: "Western and coastal belts", icon: "⚠️", titleClassName: "text-violet-400", detailClassName: "text-zinc-400", valueClassName: "text-amber-400" },
    ],
    signals: [
      { title: "Prediction confidence", value: "92%", detail: "Cross-source anomaly confirmation across weather, seismic, and field feeds" },
      { title: "Response load", value: "1.8x", detail: "Resource demand is outpacing standard weekday capacity in three regions" },
      { title: "Citizen pulse", value: "14.2k", detail: "Validated public reports triaged into the incident graph in the last 6 hours" },
    ],
    actions: [
      { title: "Rebalance rescue boats toward Konkan corridor", owner: "National flood desk", eta: "18 min" },
      { title: "Pre-stage trauma logistics near north seismic cluster", owner: "Medical operations", eta: "32 min" },
      { title: "Push multilingual evacuation briefing to coastal districts", owner: "Public warning cell", eta: "11 min" },
    ],
    blindspots: [
      "Shelter occupancy usually lags by hours in other systems; this surface flags strain before official capacity reports arrive.",
      "Compound-risk chains are tracked here, so heavy rain, road blockage, and hospital saturation are shown together instead of in separate tools.",
      "Field verification confidence is surfaced beside each incident, reducing the false urgency created by unverified social reports.",
    ],
    features: [
      { title: "Impact corridor scoring", description: "Ranks districts by cascading risk across transport, water, hospitals, and evacuation friction instead of showing raw incident counts alone." },
      { title: "Operational bottleneck radar", description: "Highlights where rescue assets are available on paper but unusable in practice because roads, power, or comms are degraded." },
      { title: "Citizen signal fusion", description: "Blends public reports with official telemetry and only promotes patterns once confidence thresholds are met." },
    ],
  },
  flood: {
    id: "flood",
    routeLabel: "Flood",
    pageTitle: "Flood response and inundation command",
    subtitle:
      "Focused on river overflow, urban drainage failure, shelter pressure, and access route survivability so teams can act before water levels translate into trapped populations.",
    mapTitle: "Flood spread and corridor survivability",
    mapHint: "River basins, rainfall bursts, shelter reachability, and boat staging overlays",
    liveLabel: "Hydrology and rescue posture",
    liveSubLabel: "Rainfall intensity, water rise, and rescue lane viability tracked together",
    location: [20.9, 73.8],
    marker: [19.2183, 72.9781],
    markerPopup: "<b>Critical overflow band</b><br>Thane creek and downstream settlements",
    stats: [
      { label: "High-water alerts", value: "18", detail: "6 basins crossing critical thresholds", icon: "🌊", titleClassName: "text-cyan-400", detailClassName: "text-cyan-300" },
      { label: "People at relocation risk", value: "420k", detail: "Dense low-lying urban pockets most exposed", icon: "🏘️", titleClassName: "text-sky-400", detailClassName: "text-amber-300" },
      { label: "Boat teams available", value: "64", detail: "12 need redeployment within 30 min", icon: "🚤", titleClassName: "text-emerald-400", detailClassName: "text-emerald-400" },
      { label: "Access reliability", value: "62%", detail: "Road washout risk growing", icon: "🛣️", titleClassName: "text-violet-400", detailClassName: "text-zinc-400", valueClassName: "text-amber-400" },
    ],
    signals: [
      { title: "Drainage saturation", value: "88%", detail: "Urban catchments near failure in the Mumbai-Thane belt" },
      { title: "Shelter pressure", value: "74%", detail: "Western shelters approaching soft capacity before formal overflow" },
      { title: "Road survivability", value: "41 routes", detail: "Routes likely to fail within 90 minutes if current rainfall persists" },
    ],
    actions: [
      { title: "Shift inflatable rescue units to eastern access pockets", owner: "Water rescue command", eta: "14 min" },
      { title: "Open overflow shelter pair near Navi Mumbai", owner: "District shelter desk", eta: "22 min" },
      { title: "Issue neighborhood-level evacuation sequencing", owner: "Public warning cell", eta: "9 min" },
    ],
    blindspots: [
      "Most flood tools show water, but not whether rescue vehicles can still reach the people under threat.",
      "This board tracks shelter soft limits before hard capacity is breached, which gives field teams time to redirect evacuees.",
      "Drainage and river overflow are fused so urban flash flood risk is not hidden behind basin-level averages.",
    ],
    features: [
      { title: "Access-first flood mapping", description: "Prioritizes rescue reachability over raw flood depth, exposing where trapped populations are forming fastest." },
      { title: "Shelter diversion logic", description: "Suggests where to redirect evacuees before bottlenecks form at the nearest shelter cluster." },
      { title: "Road-failure anticipation", description: "Flags likely washout windows so logistics can move before routes close." },
    ],
  },
  earthquake: {
    id: "earthquake",
    routeLabel: "Earthquake",
    pageTitle: "Earthquake impact and structural triage",
    subtitle:
      "Designed for rapid post-shock coordination with structural uncertainty, medical load forecasting, aftershock risk, and priority search sectors surfaced in one command layer.",
    mapTitle: "Seismic impact and aftershock map",
    mapHint: "Epicenter rings, structural triage zones, trauma corridor coverage, and aftershock probabilities",
    liveLabel: "Seismic triage network",
    liveSubLabel: "Structural uncertainty and trauma response synchronized in one surface",
    location: [30.3, 79.4],
    marker: [30.3165, 78.0322],
    markerPopup: "<b>Aftershock watch</b><br>High exposure around Uttarakhand urban edges",
    stats: [
      { label: "Priority sectors", value: "9", detail: "Search and rescue priority grid activated", icon: "🫨", titleClassName: "text-amber-300", detailClassName: "text-zinc-300" },
      { label: "Potentially unstable buildings", value: "1,860", detail: "Model-based triage before full inspection", icon: "🏚️", titleClassName: "text-rose-400", detailClassName: "text-rose-300" },
      { label: "Trauma teams", value: "37", detail: "6 need corridor deconfliction", icon: "🚑", titleClassName: "text-emerald-400", detailClassName: "text-emerald-400" },
      { label: "Aftershock risk", value: "SEVERE", detail: "2-hour elevated window", icon: "📳", titleClassName: "text-violet-400", detailClassName: "text-zinc-400", valueClassName: "text-orange-400" },
    ],
    signals: [
      { title: "Hospital surge forecast", value: "+29%", detail: "Expected trauma intake over baseline for the next 4 hours" },
      { title: "Inspection backlog", value: "640", detail: "Buildings awaiting rapid structural screening" },
      { title: "Communications resilience", value: "71%", detail: "Regional signal integrity after relay degradation" },
    ],
    actions: [
      { title: "Shift heavy rescue to priority grid E-4", owner: "Urban search and rescue", eta: "16 min" },
      { title: "Restrict civilian ingress in aftershock band", owner: "District command", eta: "7 min" },
      { title: "Open trauma overflow routing to Dehradun ring", owner: "Medical coordination", eta: "20 min" },
    ],
    blindspots: [
      "Existing tools often separate structural assessment from medical load; this view links them so triage follows collapse probability and casualty demand together.",
      "Aftershock risk is shown against active team deployment to reduce exposure of responders during repeat events.",
      "Communications degradation is operationalized, so teams see which sectors may look quiet only because reporting paths are down.",
    ],
    features: [
      { title: "Structural confidence bands", description: "Marks where building-status certainty is low, preventing false reassurance from incomplete inspection data." },
      { title: "Responder exposure guardrails", description: "Shows whether team positioning is safe under projected aftershock windows." },
      { title: "Medical cascade forecasting", description: "Predicts downstream hospital strain from building-collapse patterns rather than waiting for ambulance arrivals." },
    ],
  },
  cyclone: {
    id: "cyclone",
    routeLabel: "Cyclone",
    pageTitle: "Cyclone landfall and coastal protection grid",
    subtitle:
      "Built for coastal commanders balancing landfall timing, wind-field damage, shelter loading, power disruption, and last-mile warning coverage under severe time pressure.",
    mapTitle: "Cyclone path, surge, and evacuation readiness",
    mapHint: "Landfall cone, surge bands, shelter occupancy, and power restoration priorities",
    liveLabel: "Coastal protection mesh",
    liveSubLabel: "Landfall probability, evacuation readiness, and power restoration pressure linked live",
    location: [16.3, 82.6],
    marker: [15.9129, 80.657],
    markerPopup: "<b>Storm surge escalation</b><br>Coastal Andhra districts under accelerated warning",
    stats: [
      { label: "Landfall window", value: "11h", detail: "Confidence narrowing fast", icon: "🌀", titleClassName: "text-sky-300", detailClassName: "text-sky-300" },
      { label: "Evacuation demand", value: "680k", detail: "High-exposure coastline and estuaries", icon: "🚌", titleClassName: "text-amber-300", detailClassName: "text-amber-300" },
      { label: "Shelters online", value: "412", detail: "57 on generator fallback", icon: "🏟️", titleClassName: "text-emerald-400", detailClassName: "text-emerald-400" },
      { label: "Grid fragility", value: "HIGH", detail: "Eastern feeder chains exposed", icon: "🔌", titleClassName: "text-violet-400", detailClassName: "text-zinc-400", valueClassName: "text-orange-400" },
    ],
    signals: [
      { title: "Warning completion", value: "83%", detail: "Household-level message penetration in evacuation blocks" },
      { title: "Surge corridor risk", value: "6 sectors", detail: "Low-lying sectors with evacuation friction above threshold" },
      { title: "Power restoration lag", value: "19 crews", detail: "Crews staged but constrained by access and safety windows" },
    ],
    actions: [
      { title: "Close late civilian movement on sector C coast road", owner: "Traffic and police ops", eta: "8 min" },
      { title: "Elevate generator support for shelter clusters 12-15", owner: "Relief logistics", eta: "27 min" },
      { title: "Push final-mile fishing harbor alert package", owner: "Public warning cell", eta: "6 min" },
    ],
    blindspots: [
      "Landfall tracking alone does not solve last-mile execution; this dashboard ties warning completion to evacuation friction and shelter readiness.",
      "Power restoration is treated as an emergency response dependency, not a post-event utility issue.",
      "Surge exposure is layered with mobility constraints so commanders can see where evacuation orders are unlikely to convert into movement.",
    ],
    features: [
      { title: "Last-mile warning coverage", description: "Shows whether warnings have actually reached vulnerable blocks, not just whether alerts were issued." },
      { title: "Surge-aware shelter planning", description: "Matches evacuees to shelters outside likely inundation and generator-failure zones." },
      { title: "Recovery dependency view", description: "Prioritizes restoration work that unlocks medical, shelter, and communications capability first." },
    ],
  },
  wildfire: {
    id: "wildfire",
    routeLabel: "Wildfire",
    pageTitle: "Wildfire spread, smoke, and evacuation control",
    subtitle:
      "Optimized for fast-moving fire events where containment lines, smoke exposure, water access, crew fatigue, and community evacuation all compete for attention.",
    mapTitle: "Fireline expansion and smoke exposure",
    mapHint: "Spread vectors, wind shifts, water access, crew staging, and smoke-health overlays",
    liveLabel: "Fire spread intelligence",
    liveSubLabel: "Containment pressure, smoke drift, and community exposure monitored together",
    location: [23.6, 81.3],
    marker: [22.7196, 75.8577],
    markerPopup: "<b>Rapid spread vector</b><br>Dry corridor with wind-assisted expansion risk",
    stats: [
      { label: "Active firelines", value: "13", detail: "4 showing accelerated spread", icon: "🔥", titleClassName: "text-orange-400", detailClassName: "text-orange-300" },
      { label: "Smoke exposure", value: "2.1M", detail: "Air quality impact beyond burn zone", icon: "🌫️", titleClassName: "text-slate-300", detailClassName: "text-rose-300" },
      { label: "Ground crews", value: "54", detail: "Crew fatigue threshold near for 11 units", icon: "🧑‍🚒", titleClassName: "text-emerald-400", detailClassName: "text-emerald-400" },
      { label: "Containment outlook", value: "UNSTABLE", detail: "Wind shift expected after sunset", icon: "💨", titleClassName: "text-violet-400", detailClassName: "text-zinc-400", valueClassName: "text-orange-400" },
    ],
    signals: [
      { title: "Spread acceleration", value: "1.6x", detail: "Heat, slope, and wind alignment above baseline" },
      { title: "Water access resilience", value: "68%", detail: "Some refill corridors at risk of closure" },
      { title: "Evacuation friction", value: "23 zones", detail: "Communities where smoke reduces visibility before flames arrive" },
    ],
    actions: [
      { title: "Rotate fatigue-risk crews out of northern line", owner: "Wildland operations", eta: "24 min" },
      { title: "Stage smoke-health shelters near urban fringe", owner: "Health and relief", eta: "31 min" },
      { title: "Advance evacuation for ridge communities ahead of wind shift", owner: "District command", eta: "13 min" },
    ],
    blindspots: [
      "Traditional fire maps stop at the burn edge; this one extends into smoke-health exposure and evacuation visibility loss.",
      "Crew fatigue is surfaced as an operational risk, not buried in separate scheduling systems.",
      "Water access is treated as a dynamic dependency, helping commanders avoid containment plans that look viable but cannot be sustained.",
    ],
    features: [
      { title: "Smoke-first public risk", description: "Captures the health and mobility impact of smoke before flames reach population centers." },
      { title: "Crew fatigue visibility", description: "Surfaces human endurance as a planning constraint, reducing preventable responder exposure." },
      { title: "Sustainable containment planning", description: "Balances fireline ambition against refill access, wind shift timing, and crew rotation needs." },
    ],
  },
  landslide: {
    id: "landslide",
    routeLabel: "Landslide",
    pageTitle: "Landslide slope-failure and corridor protection grid",
    subtitle:
      "Designed for hill-region operations where intense rainfall, slope instability, blocked roads, and village isolation can escalate rapidly without early intervention.",
    mapTitle: "Slope-failure probability and rescue access",
    mapHint: "Rainfall loading, terrain fragility, road choke points, and village access overlays",
    liveLabel: "Slope stability operations mesh",
    liveSubLabel: "Failure probability, corridor blockage, and rescue access tracked in one layer",
    location: [30.5, 78.7],
    marker: [30.3165, 78.0322],
    markerPopup: "<b>Slope-failure watch</b><br>High-risk cut-slope corridors under heavy rainfall",
    stats: [
      { label: "Critical slope sectors", value: "11", detail: "4 sectors nearing failure threshold", icon: "⛰️", titleClassName: "text-amber-300", detailClassName: "text-amber-300" },
      { label: "Villages at isolation risk", value: "126", detail: "Road blockage can sever access within hours", icon: "🏘️", titleClassName: "text-sky-400", detailClassName: "text-rose-300" },
      { label: "Debris-clearance teams", value: "39", detail: "8 teams pending machinery support", icon: "🚜", titleClassName: "text-emerald-400", detailClassName: "text-emerald-400" },
      { label: "Road viability", value: "TENSE", detail: "Mountain corridors under stress", icon: "🛣️", titleClassName: "text-violet-400", detailClassName: "text-zinc-400", valueClassName: "text-orange-400" },
    ],
    signals: [
      { title: "Slope saturation", value: "86%", detail: "Rainfall infiltration remains above safe slope-load baseline" },
      { title: "Corridor blockage risk", value: "14 routes", detail: "Road segments likely to be blocked by debris in the next 3 hours" },
      { title: "Relief reachability", value: "72%", detail: "Current access reliability for high-altitude settlements" },
    ],
    actions: [
      { title: "Pre-stage excavators near priority ridge corridors", owner: "Mountain response cell", eta: "18 min" },
      { title: "Issue village-level pre-evacuation advisory", owner: "District warning unit", eta: "10 min" },
      { title: "Activate alternate relief route to upper valley blocks", owner: "Logistics command", eta: "26 min" },
    ],
    blindspots: [
      "Most landslide tools show terrain risk without showing whether blocked roads will isolate entire communities.",
      "This command view links slope instability with corridor survivability so teams can prioritize where delays become life-threatening.",
      "Debris-clearance capacity is tracked in the same view, avoiding plans that assume machinery can arrive where roads are already compromised.",
    ],
    features: [
      { title: "Isolation-first triage", description: "Prioritizes settlements most likely to be cut off rather than only areas with highest slope-failure probability." },
      { title: "Route resilience scoring", description: "Scores mountain corridors by blockage probability and recovery time under current rain load." },
      { title: "Machinery-aware dispatch", description: "Aligns clearance assignments to excavator reach, fuel support, and expected debris volume." },
    ],
  },
  heatwave: {
    id: "heatwave",
    routeLabel: "Heatwave",
    pageTitle: "Heatwave health-risk and cooling response command",
    subtitle:
      "Built for extreme-heat operations where public health exposure, power-grid stress, water demand, and cooling-center readiness must be coordinated in real time.",
    mapTitle: "Heat stress exposure and cooling coverage",
    mapHint: "Temperature anomalies, humidity stress, vulnerable populations, and cooling shelter capacity",
    liveLabel: "Extreme-heat resilience mesh",
    liveSubLabel: "Heat index, health burden, and cooling access monitored continuously",
    location: [23.2, 77.4],
    marker: [28.6139, 77.209],
    markerPopup: "<b>Severe heat pocket</b><br>Urban heat island stress with limited cooling coverage",
    stats: [
      { label: "Heat index peak", value: "47°C", detail: "Severe physiological stress threshold exceeded", icon: "🌡️", titleClassName: "text-rose-400", detailClassName: "text-rose-300" },
      { label: "At-risk population", value: "2.8M", detail: "High exposure among elderly and outdoor workers", icon: "👥", titleClassName: "text-amber-300", detailClassName: "text-amber-300" },
      { label: "Cooling centers active", value: "186", detail: "24 require generator backup", icon: "🏫", titleClassName: "text-emerald-400", detailClassName: "text-emerald-400" },
      { label: "Grid stress", value: "HIGH", detail: "Peak demand near failure margin", icon: "⚡", titleClassName: "text-violet-400", detailClassName: "text-zinc-400", valueClassName: "text-orange-400" },
    ],
    signals: [
      { title: "Heat-health admissions", value: "+34%", detail: "Emergency visits above weekday baseline" },
      { title: "Cooling coverage gap", value: "22 zones", detail: "Neighborhoods beyond safe travel distance to cooling points" },
      { title: "Water demand pressure", value: "1.5x", detail: "Demand surge straining distribution in high-density wards" },
    ],
    actions: [
      { title: "Extend cooling center hours in priority wards", owner: "Public health desk", eta: "12 min" },
      { title: "Push heat-alert advisories in regional languages", owner: "Warning and outreach", eta: "7 min" },
      { title: "Pre-stage emergency water tankers for high-risk zones", owner: "Utility coordination", eta: "21 min" },
    ],
    blindspots: [
      "Heatwave dashboards often track temperature but miss travel-time access to cooling and hydration support.",
      "This view links health burden with power and water reliability so interventions target where mortality risk rises first.",
      "Cooling-center counts are adjusted for real operational availability, not just nominal capacity.",
    ],
    features: [
      { title: "Heat equity prioritization", description: "Highlights communities with high exposure and low cooling access for targeted intervention." },
      { title: "Grid-health coupling", description: "Connects power stress to cooling-center uptime and hospital surge risk." },
      { title: "Hydration logistics planner", description: "Forecasts tanker and refill demand under sustained extreme heat conditions." },
    ],
  },
};
