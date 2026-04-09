import { describe, expect, it } from "vitest";

import { buildRecentActivity, buildSpeciesMix, buildSummary } from "./analytics";

const catches = [
  {
    catch_id: "1",
    timestamp: "2026-04-09T10:00:00Z",
    lat: 52.0,
    lon: 4.0,
    species: "Sea Trout",
    technique: "Spinning",
    notes: null,
  },
  {
    catch_id: "2",
    timestamp: "2026-04-08T10:00:00Z",
    lat: 52.1,
    lon: 4.1,
    species: "Sea Bass",
    technique: "Fly",
    notes: null,
  },
  {
    catch_id: "3",
    timestamp: "2026-04-09T12:00:00Z",
    lat: 52.2,
    lon: 4.2,
    species: "Sea Trout",
    technique: "Spinning",
    notes: null,
  },
];

describe("analytics builders", () => {
  it("builds dashboard summary", () => {
    const summary = buildSummary(catches);

    expect(summary.totalCatches).toBe(3);
    expect(summary.uniqueSpecies).toBe(2);
    expect(summary.techniquesTracked).toBe(2);
    expect(summary.latestCatchAt).toBe("2026-04-09T12:00:00Z");
  });

  it("groups species distribution", () => {
    const speciesMix = buildSpeciesMix(catches);

    expect(speciesMix[0]).toEqual({ label: "Sea Trout", value: 2 });
  });

  it("creates a seven-day activity series", () => {
    const activity = buildRecentActivity(catches);

    expect(activity).toHaveLength(7);
    expect(activity.some((entry) => entry.catches > 0)).toBe(true);
  });
});
