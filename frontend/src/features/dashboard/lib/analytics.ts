import { subDays } from "./date";
import type {
  ActivityDatum,
  Catch,
  DashboardSummary,
  DistributionDatum,
} from "../../../lib/types";
import { titleCase } from "../../../lib/utils";

export function buildSummary(catches: Catch[]): DashboardSummary {
  const uniqueSpecies = new Set(
    catches.map((entry) => entry.species.trim()).filter(Boolean),
  ).size;

  const uniqueTechniques = new Set(
    catches.map((entry) => entry.technique?.trim()).filter(Boolean),
  ).size;

  const latest = [...catches]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .at(0);

  return {
    totalCatches: catches.length,
    uniqueSpecies,
    techniquesTracked: uniqueTechniques,
    latestCatchAt: latest?.timestamp ?? null,
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
  return groupCounts(catches, (entry) => entry.technique);
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
    const key = new Date(entry.timestamp).toISOString().slice(0, 10);
    if (byDate.has(key)) {
      byDate.set(key, (byDate.get(key) ?? 0) + 1);
    }
  });

  return series.map((entry) => ({
    ...entry,
    catches: byDate.get(entry.date) ?? 0,
  }));
}
