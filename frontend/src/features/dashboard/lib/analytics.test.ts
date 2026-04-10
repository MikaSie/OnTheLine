import { describe, expect, it } from "vitest";

import {
  buildActionableInsights,
  buildHotspotPreviewInsight,
  buildRecentActivity,
  buildSpeciesMix,
  buildSummary,
} from "./analytics";

const catches = [
  {
    catch_id: "1",
    caught_at: "2026-04-09T10:00:00Z",
    lat: 52.0,
    lon: 4.0,
    species: "Sea Trout",
    technique_detail: "Spinning",
    notes: null,
  },
  {
    catch_id: "2",
    caught_at: "2026-04-08T10:00:00Z",
    lat: 52.1,
    lon: 4.1,
    species: "Sea Bass",
    technique_detail: "Fly",
    notes: null,
  },
  {
    catch_id: "3",
    caught_at: "2026-04-09T12:00:00Z",
    lat: 52.02,
    lon: 4.03,
    species: "Sea Trout",
    technique_detail: "Spinning",
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

  it("builds actionable insight cards", () => {
    const insights = buildActionableInsights(catches);

    expect(insights).toHaveLength(4);
    expect(insights[0]?.value).toBe("Sea Trout");
    expect(insights[1]?.value).toBe("Spinning");
  });

  it("summarizes the strongest hotspot", () => {
    const hotspot = buildHotspotPreviewInsight(catches);

    expect(hotspot.label).toBe("Hotspot preview");
    expect(hotspot.value).toContain("area");
    expect(hotspot.detail).toContain("2 entries");
  });
});
