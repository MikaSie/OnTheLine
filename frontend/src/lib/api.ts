import type { Catch, CreateCatchInput, UpdateCatchInput } from "./types";

const API_BASE = "/api";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => null)) as
      | { error?: string }
      | null;
    throw new Error(errorBody?.error ?? "Request failed");
  }

  return (await response.json()) as T;
}

export const api = {
  getHealth() {
    return request<{ message: string }>("/");
  },
  getSpeciesOptions() {
    return request<string[]>("/reference-data/species");
  },
  listCatches() {
    return request<Catch[]>("/catches");
  },
  getCatch(catchId: string) {
    return request<Catch>(`/catches/${catchId}`);
  },
  createCatch(payload: CreateCatchInput) {
    return request<Catch>("/catches", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  updateCatch(catchId: string, payload: UpdateCatchInput) {
    return request<Catch>(`/catches/${catchId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },
  deleteCatch(catchId: string) {
    return request<{ success: boolean }>(`/catches/${catchId}`, {
      method: "DELETE",
    });
  },
};
