import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
} from "@tanstack/react-query";

import { api } from "../../../lib/api";
import type { Catch, CreateCatchInput, UpdateCatchInput } from "../../../lib/types";

export const catchKeys = {
  all: ["catches"] as const,
  detail: (catchId: string) => ["catches", catchId] as const,
  speciesOptions: ["reference-data", "species"] as const,
  methodCategories: ["reference-data", "method-categories"] as const,
};

export function useCatches() {
  return useQuery({
    queryKey: catchKeys.all,
    queryFn: api.listCatches,
  });
}

export function useCatch(catchId: string) {
  return useQuery({
    queryKey: catchKeys.detail(catchId),
    queryFn: () => api.getCatch(catchId),
    enabled: Boolean(catchId),
  });
}

export function useSpeciesOptions() {
  return useQuery({
    queryKey: catchKeys.speciesOptions,
    queryFn: api.getSpeciesOptions,
    staleTime: Infinity,
  });
}

export function useMethodCategories() {
  return useQuery({
    queryKey: catchKeys.methodCategories,
    queryFn: api.getMethodCategories,
    staleTime: Infinity,
  });
}

export function useCreateCatch(
  options?: UseMutationOptions<Catch, Error, CreateCatchInput, unknown>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.createCatch,
    ...options,
    onSuccess: async (data, variables, onMutateResult, context) => {
      await queryClient.invalidateQueries({ queryKey: catchKeys.all });
      await options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

export function useUpdateCatch(
  catchId: string,
  options?: UseMutationOptions<Catch, Error, UpdateCatchInput, unknown>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateCatchInput) => api.updateCatch(catchId, payload),
    ...options,
    onSuccess: async (data, variables, onMutateResult, context) => {
      queryClient.setQueryData(catchKeys.detail(catchId), data);
      await queryClient.invalidateQueries({ queryKey: catchKeys.all });
      await options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

export function useDeleteCatch(
  options?: UseMutationOptions<{ success: boolean }, Error, string, unknown>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.deleteCatch,
    ...options,
    onSuccess: async (data, variables, onMutateResult, context) => {
      await queryClient.invalidateQueries({ queryKey: catchKeys.all });
      await options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}
