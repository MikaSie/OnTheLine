import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { DashboardMapCard } from "./dashboard-map-card";

const mockCatchMap = vi.fn(
  ({
    catches,
    className,
    emptyMessage,
  }: {
    catches: { catch_id: string }[];
    className?: string;
    emptyMessage?: string;
  }) => (
    <div data-testid="dashboard-map-props">
      {className}|{emptyMessage}|{catches.length}
    </div>
  ),
);

vi.mock("../../maps/components/catch-map", () => ({
  CatchMap: (props: {
    catches: { catch_id: string }[];
    className?: string;
    emptyMessage?: string;
  }) => mockCatchMap(props),
}));

describe("DashboardMapCard", () => {
  it("renders the map wrapper copy and passes catches through to the shared map", () => {
    render(
      <DashboardMapCard
        catches={[
          {
            catch_id: "catch-1",
            timestamp: "2026-04-09T10:00:00Z",
            lat: 52.3,
            lon: 4.9,
            species: "Sea Trout",
            technique: "Spinning",
            notes: null,
          },
        ]}
      />,
    );

    expect(screen.getByText("Catch positions")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Every logged catch plotted on an OpenStreetMap layer for quick spatial context.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByTestId("dashboard-map-props")).toHaveTextContent(
      "h-[360px]|No catches have been plotted yet. Log a catch to place your first marker.|1",
    );
  });
});
