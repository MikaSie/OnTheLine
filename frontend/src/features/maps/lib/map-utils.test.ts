import { describe, expect, it } from "vitest";

import { toMapPoint } from "./map-utils";

describe("toMapPoint", () => {
  it("normalizes numeric coordinates", () => {
    expect(toMapPoint(52.3676123, 4.9041234)).toEqual({
      lat: 52.367612,
      lon: 4.904123,
    });
  });

  it("accepts strings with whitespace and decimal commas", () => {
    expect(toMapPoint(" 52,3676 ", " 4,9041 ")).toEqual({
      lat: 52.3676,
      lon: 4.9041,
    });
  });

  it("returns null when either coordinate is missing or blank", () => {
    expect(toMapPoint("", "4.9")).toBeNull();
    expect(toMapPoint("52.3", undefined)).toBeNull();
    expect(toMapPoint(null, "4.9")).toBeNull();
  });

  it("returns null when coordinates are not finite numbers", () => {
    expect(toMapPoint(Number.NaN, 4.9)).toBeNull();
    expect(toMapPoint("north", "4.9")).toBeNull();
    expect(toMapPoint(52.3, Number.POSITIVE_INFINITY)).toBeNull();
  });

  it("returns null when coordinates are outside valid ranges", () => {
    expect(toMapPoint(-90.1, 4.9)).toBeNull();
    expect(toMapPoint(90.1, 4.9)).toBeNull();
    expect(toMapPoint(52.3, -180.1)).toBeNull();
    expect(toMapPoint(52.3, 180.1)).toBeNull();
  });

  it("accepts boundary values", () => {
    expect(toMapPoint(-90, -180)).toEqual({
      lat: -90,
      lon: -180,
    });
    expect(toMapPoint(90, 180)).toEqual({
      lat: 90,
      lon: 180,
    });
  });
});
