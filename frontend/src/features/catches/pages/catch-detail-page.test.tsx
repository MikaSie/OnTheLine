import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CatchDetailPage } from "./catch-detail-page";

const mockNavigate = vi.fn();
const mockUseParams = vi.fn(() => ({ catchId: "catch-123" }));
const mockPushToast = vi.fn();
const mockUseCatch = vi.fn();
const mockDeleteMutate = vi.fn();
const mockCatchMap = vi.fn(
  ({
    catches,
    selectedPoint,
    className,
  }: {
    catches?: { catch_id: string }[];
    selectedPoint?: { lat: number; lon: number } | null;
    className?: string;
  }) => (
    <div data-testid="detail-map">
      {className}|{catches?.length ?? 0}|{selectedPoint ? `${selectedPoint.lat},${selectedPoint.lon}` : "none"}
    </div>
  ),
);

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>(
    "react-router-dom",
  );

  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => mockUseParams(),
  };
});

vi.mock("../../../components/ui/toaster", () => ({
  useToast: () => ({ pushToast: mockPushToast }),
}));

vi.mock("../../maps/components/catch-map", () => ({
  CatchMap: (props: {
    catches?: { catch_id: string }[];
    selectedPoint?: { lat: number; lon: number } | null;
    className?: string;
  }) => mockCatchMap(props),
}));

vi.mock("../hooks/use-catches", () => ({
  useCatch: (...args: unknown[]) => mockUseCatch(...args),
  useDeleteCatch: (options?: { onSuccess?: () => void }) => ({
    isPending: false,
    mutate: (catchId: string) => {
      mockDeleteMutate(catchId);
      options?.onSuccess?.();
    },
  }),
}));

describe("CatchDetailPage", () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    mockPushToast.mockReset();
    mockUseParams.mockReset();
    mockUseCatch.mockReset();
    mockDeleteMutate.mockReset();
    mockCatchMap.mockClear();

    mockUseParams.mockReturnValue({ catchId: "catch-123" });
    mockUseCatch.mockReturnValue({
      isLoading: false,
      isError: false,
      data: {
        catch_id: "catch-123",
        timestamp: "2026-04-09T10:00:00Z",
        lat: 52.3676,
        lon: 4.9041,
        species: "Sea Trout",
        technique: "Spinning",
        notes: "Near the jetty",
      },
    });
  });

  it("prioritizes the overview and renders the map underneath it", () => {
    render(
      <MemoryRouter>
        <CatchDetailPage />
      </MemoryRouter>,
    );

    expect(screen.getByText("Record overview")).toBeInTheDocument();
    expect(screen.getByText("Catch map")).toBeInTheDocument();
    expect(screen.queryByText("Record actions")).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Open editor" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Edit" })).toHaveAttribute(
      "href",
      "/catches/catch-123/edit",
    );
    expect(screen.getByRole("button", { name: "Delete catch" })).toBeInTheDocument();
    expect(screen.getByTestId("detail-map")).toHaveTextContent(
      "h-[360px]|1|52.3676,4.9041",
    );
  });

  it("shows the empty state when the catch cannot be loaded", () => {
    mockUseCatch.mockReturnValue({
      isLoading: false,
      isError: true,
      data: undefined,
    });

    render(
      <MemoryRouter>
        <CatchDetailPage />
      </MemoryRouter>,
    );

    expect(screen.getByText("Catch not found")).toBeInTheDocument();
  });
});
