import { describe, expect, it } from "vitest";

import { catchFormSchema } from "./catch-form-schema";

describe("catchFormSchema", () => {
  it("accepts valid coordinates and optional metadata", () => {
    const result = catchFormSchema.safeParse({
      lat: 52.37,
      lon: 4.9,
      species: "Sea trout",
      technique: "Spinning",
      notes: "Wind pushing bait into the bank",
    });

    expect(result.success).toBe(true);
  });

  it("rejects invalid latitude", () => {
    const result = catchFormSchema.safeParse({
      lat: 120,
      lon: 4.9,
    });

    expect(result.success).toBe(false);
  });

  it("turns empty number fields into required errors instead of NaN errors", () => {
    const result = catchFormSchema.safeParse({
      lat: "",
      lon: "",
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.flatten().fieldErrors.lat).toContain("Latitude is required");
      expect(result.error.flatten().fieldErrors.lon).toContain("Longitude is required");
    }
  });

  it("accepts decimal commas from locale-formatted input", () => {
    const result = catchFormSchema.safeParse({
      lat: "52,3676",
      lon: "4,9041",
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.lat).toBeCloseTo(52.3676);
      expect(result.data.lon).toBeCloseTo(4.9041);
    }
  });
});
