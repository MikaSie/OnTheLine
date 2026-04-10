import { describe, expect, it } from "vitest";

import { catchFormSchema } from "./catch-form-schema";

describe("catchFormSchema", () => {
  it("accepts valid coordinates and optional metadata", () => {
    const result = catchFormSchema.safeParse({
      lat: 52.37,
      lon: 4.9,
      caughtAt: "2026-04-09T06:30",
      species: "Sea trout",
      lengthCm: 61.5,
      methodCategory: "Spinning",
      depthM: 2.5,
      technique: "Spinning",
      notes: "Wind pushing bait into the bank",
    });

    expect(result.success).toBe(true);
  });

  it("rejects invalid latitude", () => {
    const result = catchFormSchema.safeParse({
      lat: 120,
      lon: 4.9,
      species: "Sea Trout",
      methodCategory: "Spinning",
    });

    expect(result.success).toBe(false);
  });

  it("turns empty number fields into required errors instead of NaN errors", () => {
    const result = catchFormSchema.safeParse({
      lat: "",
      lon: "",
      species: "",
      methodCategory: "",
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
      species: "Sea Trout",
      methodCategory: "Spinning",
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.lat).toBeCloseTo(52.3676);
      expect(result.data.lon).toBeCloseTo(4.9041);
    }
  });

  it("requires a species selection", () => {
    const result = catchFormSchema.safeParse({
      lat: 52.37,
      lon: 4.9,
      species: "",
      methodCategory: "Spinning",
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.flatten().fieldErrors.species).toContain("Species is required");
    }
  });

  it("requires a method category selection", () => {
    const result = catchFormSchema.safeParse({
      lat: 52.37,
      lon: 4.9,
      species: "Sea Trout",
    });

    expect(result.success).toBe(true);
  });

  it("accepts a valid depth in meters", () => {
    const result = catchFormSchema.safeParse({
      lat: 52.37,
      lon: 4.9,
      species: "Sea Trout",
      methodCategory: "Spinning",
      depthM: "3,5",
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.depthM).toBeCloseTo(3.5);
    }
  });

  it("accepts a valid length in centimeters", () => {
    const result = catchFormSchema.safeParse({
      lat: 52.37,
      lon: 4.9,
      species: "Sea Trout",
      methodCategory: "Spinning",
      lengthCm: "61,5",
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.lengthCm).toBeCloseTo(61.5);
    }
  });

  it("rejects non-positive length", () => {
    const result = catchFormSchema.safeParse({
      lat: 52.37,
      lon: 4.9,
      species: "Sea Trout",
      methodCategory: "Spinning",
      lengthCm: 0,
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.flatten().fieldErrors.lengthCm).toContain(
        "Length must be greater than 0",
      );
    }
  });

  it("rejects negative depth", () => {
    const result = catchFormSchema.safeParse({
      lat: 52.37,
      lon: 4.9,
      species: "Sea Trout",
      methodCategory: "Spinning",
      depthM: -1,
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.flatten().fieldErrors.depthM).toContain(
        "Depth must be 0 or greater",
      );
    }
  });
});
