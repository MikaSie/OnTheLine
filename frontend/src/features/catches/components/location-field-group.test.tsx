import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { LocationFieldGroup } from "./location-field-group";

const mockCatchMap = vi.fn(
  ({
    onSelectLocation,
    pendingPoint,
    selectedPoint,
  }: {
    onSelectLocation?: (point: { lat: number; lon: number }) => void;
    pendingPoint?: { lat: number; lon: number } | null;
    selectedPoint?: { lat: number; lon: number } | null;
  }) => (
    <div>
      <div data-testid="catch-map-selected">
        {selectedPoint ? `${selectedPoint.lat},${selectedPoint.lon}` : "none"}
      </div>
      <div data-testid="catch-map-pending">
        {pendingPoint ? `${pendingPoint.lat},${pendingPoint.lon}` : "none"}
      </div>
      <button
        type="button"
        onClick={() => onSelectLocation?.({ lat: 53.123456, lon: 6.654321 })}
      >
        Stage map location
      </button>
    </div>
  ),
);

vi.mock("../../maps/components/catch-map", () => ({
  CatchMap: (props: {
    onSelectLocation?: (point: { lat: number; lon: number }) => void;
    pendingPoint?: { lat: number; lon: number } | null;
    selectedPoint?: { lat: number; lon: number } | null;
  }) => mockCatchMap(props),
}));

function createRegister() {
  return ((name: string) => ({ name, onChange: vi.fn(), onBlur: vi.fn(), ref: vi.fn() })) as never;
}

describe("LocationFieldGroup", () => {
  it("shows the selected point and no pending change by default", () => {
    render(
      <LocationFieldGroup
        register={createRegister()}
        errors={{}}
        selectedPoint={{ lat: 52.3676, lon: 4.9041 }}
        setValue={vi.fn()}
      />,
    );

    expect(screen.getByText("Coordinates and map picker")).toBeInTheDocument();
    expect(screen.getByTestId("catch-map-selected")).toHaveTextContent("52.3676,4.9041");
    expect(screen.getByTestId("catch-map-pending")).toHaveTextContent("none");
    expect(screen.queryByRole("button", { name: "Confirm new location" })).not.toBeInTheDocument();
  });

  it("stages a new point and confirms it through setValue", async () => {
    const user = userEvent.setup();
    const setValue = vi.fn();

    render(
      <LocationFieldGroup
        register={createRegister()}
        errors={{}}
        selectedPoint={{ lat: 52.3676, lon: 4.9041 }}
        setValue={setValue}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Stage map location" }));

    expect(screen.getByRole("button", { name: "Confirm new location" })).toBeInTheDocument();
    expect(screen.getByTestId("catch-map-selected")).toHaveTextContent("52.3676,4.9041");
    expect(screen.getByTestId("catch-map-pending")).toHaveTextContent("53.123456,6.654321");
    expect(
      screen.getByText("52.3676° N / 4.9041° E"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("53.1235° N / 6.6543° E"),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Confirm new location" }));

    expect(setValue).toHaveBeenNthCalledWith(1, "lat", 53.123456, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
    expect(setValue).toHaveBeenNthCalledWith(2, "lon", 6.654321, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  });

  it("allows canceling a pending point without updating form values", async () => {
    const user = userEvent.setup();
    const setValue = vi.fn();

    render(
      <LocationFieldGroup
        register={createRegister()}
        errors={{}}
        selectedPoint={{ lat: 52.3676, lon: 4.9041 }}
        setValue={setValue}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Stage map location" }));
    await user.click(screen.getByRole("button", { name: "Keep current location" }));

    expect(setValue).not.toHaveBeenCalled();
    expect(screen.queryByText("Pending change")).not.toBeInTheDocument();
    expect(screen.getByTestId("catch-map-pending")).toHaveTextContent("none");
  });

  it("shows validation messages for both coordinate inputs", () => {
    render(
      <LocationFieldGroup
        register={createRegister()}
        errors={{
          lat: { type: "manual", message: "Latitude is required" },
          lon: { type: "manual", message: "Longitude is required" },
        }}
        selectedPoint={null}
        setValue={vi.fn()}
      />,
    );

    expect(screen.getByText("Latitude is required")).toBeInTheDocument();
    expect(screen.getByText("Longitude is required")).toBeInTheDocument();
    expect(screen.getByText("No confirmed location yet.")).toBeInTheDocument();
    expect(screen.getByText("Click the map to preview a new location.")).toBeInTheDocument();
  });
});
