import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

import { CatchMap } from "./catch-map";

const mapState = {
  handlers: {} as Record<string, ((event: { latlng: { lat: number; lng: number } }) => void) | undefined>,
};

vi.mock("react-leaflet", () => ({
  MapContainer: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <div data-testid="leaflet-map" className={className}>
      {children}
    </div>
  ),
  TileLayer: () => <div data-testid="tile-layer" />,
  CircleMarker: ({
    children,
    center,
  }: {
    children?: React.ReactNode;
    center: [number, number];
  }) => (
    <div data-testid="circle-marker">
      {center[0]},{center[1]}
      {children}
    </div>
  ),
  Popup: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useMap: () => ({
    fitBounds: vi.fn(),
    setView: vi.fn(),
  }),
  useMapEvents: (handlers: Record<string, (event: { latlng: { lat: number; lng: number } }) => void>) => {
    mapState.handlers = handlers;
    return {};
  },
}));

const catches = [
  {
    catch_id: "catch-1",
    timestamp: "2026-04-09T10:00:00Z",
    lat: 52.3676,
    lon: 4.9041,
    species: "Sea Trout",
    technique: "Spinning",
    notes: "Near structure",
  },
];

describe("CatchMap", () => {
  it("renders popup content for plotted catches", () => {
    render(
      <MemoryRouter>
        <CatchMap catches={catches} />
      </MemoryRouter>,
    );

    expect(screen.getByText("Sea Trout")).toBeInTheDocument();
    expect(screen.getByText("Spinning")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Open catch" })).toHaveAttribute(
      "href",
      "/catches/catch-1",
    );
  });

  it("shows the empty overlay when no catches are available", () => {
    render(
      <MemoryRouter>
        <CatchMap emptyMessage="No catches yet" />
      </MemoryRouter>,
    );

    expect(screen.getByText("No catches yet")).toBeInTheDocument();
  });

  it("emits clicked coordinates through the selection callback", () => {
    const onSelectLocation = vi.fn();

    render(
      <MemoryRouter>
        <CatchMap onSelectLocation={onSelectLocation} />
      </MemoryRouter>,
    );

    mapState.handlers.click?.({ latlng: { lat: 52.1111111, lng: 4.2222222 } });

    expect(onSelectLocation).toHaveBeenCalledWith({
      lat: 52.111111,
      lon: 4.222222,
    });
  });
});
