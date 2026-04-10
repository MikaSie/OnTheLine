import { subDays } from "./date";
import type {
  ActivityDatum,
  Catch,
  DashboardSummary,
  DistributionDatum,
  InsightStat,
} from "../../../lib/types";
import { titleCase } from "../../../lib/utils";
import { buildCatchAreaBuckets } from "../../../lib/catch-areas";
import { formatShortDate } from "../../../lib/formatters";

export function buildSummary(catches: Catch[]): DashboardSummary {
  const uniqueSpecies = new Set(
    catches.map((entry) => entry.species.trim()).filter(Boolean),
  ).size;

  const uniqueTechniques = new Set(
    catches.map((entry) => entry.technique_detail?.trim()).filter(Boolean),
  ).size;

  const latest = [...catches]
    .sort((a, b) => new Date(b.caught_at).getTime() - new Date(a.caught_at).getTime())
    .at(0);

  return {
    totalCatches: catches.length,
    uniqueSpecies,
    techniquesTracked: uniqueTechniques,
    latestCatchAt: latest?.caught_at ?? null,
  };
}

function groupCounts(
  catches: Catch[],
  getLabel: (entry: Catch) => string | null | undefined,
): DistributionDatum[] {
  const counts = new Map<string, number>();

  catches.forEach((entry) => {
    const raw = getLabel(entry)?.trim();
    const key = raw ? titleCase(raw) : "Unspecified";
    counts.set(key, (counts.get(key) ?? 0) + 1);
  });

  return [...counts.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);
}

export function buildSpeciesMix(catches: Catch[]) {
  return groupCounts(catches, (entry) => entry.species);
}

export function buildTechniqueMix(catches: Catch[]) {
  return groupCounts(catches, (entry) => entry.technique_detail);
}

export function buildRecentActivity(catches: Catch[]): ActivityDatum[] {
  const today = new Date();
  const series = Array.from({ length: 7 }, (_, index) => {
    const day = subDays(today, 6 - index);
    const key = day.toISOString().slice(0, 10);

    return { date: key, catches: 0 };
  });

  const byDate = new Map(series.map((entry) => [entry.date, 0]));

  catches.forEach((entry) => {
    const key = new Date(entry.caught_at).toISOString().slice(0, 10);
    if (byDate.has(key)) {
      byDate.set(key, (byDate.get(key) ?? 0) + 1);
    }
  });

  return series.map((entry) => ({
    ...entry,
    catches: byDate.get(entry.date) ?? 0,
  }));
}

export function buildActionableInsights(catches: Catch[]): InsightStat[] {
  return [
    buildTopSpeciesLatelyInsight(catches),
    buildTechniqueLeaderInsight(catches),
    buildBestRecentWindowInsight(catches),
    buildHotspotPreviewInsight(catches),
  ];
}

export function buildTopSpeciesLatelyInsight(catches: Catch[]): InsightStat {
  const speciesMix = buildSpeciesMix(catches);
  const leader = speciesMix[0];

  if (!leader) {
    return {
      label: "Top species lately",
      value: "No trend yet",
      detail: "Log a few catches to see which species is surfacing most often in recent records.",
    };
  }

  return {
    label: "Top species lately",
    value: leader.label,
    detail: `${leader.value} catches recorded in your recent log history.`,
  };
}

export function buildTechniqueLeaderInsight(catches: Catch[]): InsightStat {
  const techniqueMix = buildTechniqueMix(catches);
  const leader = techniqueMix[0];

  if (!leader) {
    return {
      label: "Most used technique",
      value: "No pattern yet",
      detail: "Add technique notes to catch records to see which approach shows up most often.",
    };
  }

  return {
    label: "Most used technique",
    value: leader.label,
    detail: `${leader.value} catches logged with this method so far.`,
  };
}

export function buildBestRecentWindowInsight(catches: Catch[]): InsightStat {
  const activity = buildRecentActivity(catches);
  const bestDay = [...activity]
    .sort((a, b) => b.catches - a.catches)
    .find((entry) => entry.catches > 0);

  if (!bestDay) {
    return {
      label: "Best recent window",
      value: "Still forming",
      detail: "Once catches land in the last seven days, this card will highlight your busiest recent window.",
    };
  }

  const dayLabel = formatShortDate(bestDay.date);
  const catchLabel = bestDay.catches === 1 ? "catch" : "catches";

  return {
    label: "Best recent window",
    value: dayLabel,
    detail: `${bestDay.catches} ${catchLabel} landed on this day based on your recent logs.`,
  };
}

export function buildHotspotPreviewInsight(catches: Catch[]): InsightStat {
  const hotspot = buildCatchAreaBuckets(catches)[0];

  if (!hotspot) {
    return {
      label: "Hotspot preview",
      value: "No hotspot yet",
      detail: "Repeated locations will surface here once multiple catches cluster in the same area.",
    };
  }

  const catchLabel = hotspot.count === 1 ? "entry" : "entries";

  return {
    label: "Hotspot preview",
    value: hotspot.label,
    detail: `${hotspot.count} ${catchLabel} cluster around this area in your current log.`,
  };
}
