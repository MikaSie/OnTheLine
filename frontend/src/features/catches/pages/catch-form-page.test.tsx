import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi, beforeEach } from "vitest";

import { CatchFormPage } from "./catch-form-page";

const mockNavigate = vi.fn();
const mockPushToast = vi.fn();
const mockCreateMutate = vi.fn();
const mockUpdateMutate = vi.fn();
const mockUseParams = vi.fn(() => ({}));
const mockUseCatch = vi.fn();
const mockUseSpeciesOptions = vi.fn();
const mockUseMethodCategories = vi.fn();

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

vi.mock("../hooks/use-catches", () => ({
  useCatch: (...args: unknown[]) => mockUseCatch(...args),
  useSpeciesOptions: (...args: unknown[]) => mockUseSpeciesOptions(...args),
  useMethodCategories: (...args: unknown[]) => mockUseMethodCategories(...args),
  useCreateCatch: (options?: { onSuccess?: (entry: { catch_id: string }) => void }) => ({
    isPending: false,
    mutate: (payload: unknown) => {
      mockCreateMutate(payload);
      options?.onSuccess?.({ catch_id: "new-catch" });
    },
  }),
  useUpdateCatch: (
    catchId: string,
    options?: { onSuccess?: (entry: { catch_id: string }) => void },
  ) => ({
    isPending: false,
    mutate: (payload: unknown) => {
      mockUpdateMutate({ catchId, payload });
      options?.onSuccess?.({ catch_id: catchId });
    },
  }),
}));

vi.mock("../components/catch-form", () => ({
  CatchForm: ({
    onSubmit,
    mode,
    initialValues,
  }: {
    onSubmit: (values: {
      lat: number;
      lon: number;
      species?: string;
      methodCategory?: string;
      technique?: string;
      notes?: string;
    }) => void;
    mode: string;
    initialValues?: { species?: string };
  }) => (
    <div>
      <div data-testid="form-mode">{mode}</div>
      <div data-testid="initial-species">{initialValues?.species ?? "none"}</div>
      <button
        type="button"
        onClick={() =>
        onSubmit({
          lat: 52.3676,
          lon: 4.9041,
          species: "  Sea Trout  ",
          methodCategory: "  Spinning  ",
          technique: "  Spinning  ",
          notes: "  Near the rocks  ",
        })
        }
      >
        Submit mock form
      </button>
    </div>
  ),
}));

describe("CatchFormPage", () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    mockPushToast.mockReset();
    mockCreateMutate.mockReset();
    mockUpdateMutate.mockReset();
    mockUseParams.mockReset();
    mockUseCatch.mockReset();
    mockUseSpeciesOptions.mockReset();
    mockUseMethodCategories.mockReset();
    mockUseParams.mockReturnValue({});
    mockUseCatch.mockReturnValue({
      isLoading: false,
      isError: false,
      data: undefined,
    });
    mockUseSpeciesOptions.mockReturnValue({
      isLoading: false,
      data: ["Perch", "Pike", "Sea Bass", "Sea Trout"],
    });
    mockUseMethodCategories.mockReturnValue({
      isLoading: false,
      data: ["Spinning", "Fly Fishing", "Other"],
    });
  });

  it("submits trimmed payload in create mode and navigates to the new detail page", () => {
    render(
      <MemoryRouter>
        <CatchFormPage mode="create" />
      </MemoryRouter>,
    );

    screen.getByRole("button", { name: "Submit mock form" }).click();

    expect(mockCreateMutate).toHaveBeenCalledWith({
      lat: 52.3676,
      lon: 4.9041,
      species: "Sea Trout",
      method_category: "Spinning",
      technique_detail: "Spinning",
      notes: "Near the rocks",
    });
    expect(mockPushToast).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Catch logged" }),
    );
    expect(mockNavigate).toHaveBeenCalledWith("/catches/new-catch");
  });

  it("uses loaded catch data in edit mode and submits the update mutation", () => {
    mockUseParams.mockReturnValue({ catchId: "catch-123" });
    mockUseCatch.mockReturnValue({
      isLoading: false,
      isError: false,
      data: {
        catch_id: "catch-123",
        caught_at: "2026-04-09T10:00:00Z",
        lat: 52.1,
        lon: 4.1,
        species: "Sea Bass",
        method_category: "Spinning",
        technique_detail: "Fly",
        notes: "Initial",
      },
    });

    render(
      <MemoryRouter>
        <CatchFormPage mode="edit" />
      </MemoryRouter>,
    );

    expect(screen.getByTestId("form-mode")).toHaveTextContent("edit");
    expect(screen.getByTestId("initial-species")).toHaveTextContent("Sea Bass");

    screen.getByRole("button", { name: "Submit mock form" }).click();

    expect(mockUpdateMutate).toHaveBeenCalledWith({
      catchId: "catch-123",
      payload: {
        lat: 52.3676,
        lon: 4.9041,
        species: "Sea Trout",
        method_category: "Spinning",
        technique_detail: "Spinning",
        notes: "Near the rocks",
      },
    });
    expect(mockNavigate).toHaveBeenCalledWith("/catches/catch-123");
  });

  it("shows a fallback state when edit mode cannot load a catch", () => {
    mockUseParams.mockReturnValue({ catchId: "missing" });
    mockUseCatch.mockReturnValue({
      isLoading: false,
      isError: true,
      data: undefined,
    });

    render(
      <MemoryRouter>
        <CatchFormPage mode="edit" />
      </MemoryRouter>,
    );

    expect(screen.getByText("Catch not found")).toBeInTheDocument();
  });
});
