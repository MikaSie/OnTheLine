import { Link, useNavigate, useParams } from "react-router-dom";

import { EmptyState } from "../../../components/common/empty-state";
import { SectionHeader } from "../../../components/common/section-header";
import { Button } from "../../../components/ui/button";
import { Skeleton } from "../../../components/ui/skeleton";
import { useToast } from "../../../components/ui/toaster";
import {
  useCatch,
  useCreateCatch,
  useSpeciesOptions,
  useUpdateCatch,
} from "../hooks/use-catches";
import type { CatchFormValues } from "../lib/catch-form-schema";
import { CatchForm } from "../components/catch-form";

interface CatchFormPageProps {
  mode: "create" | "edit";
}

export function CatchFormPage({ mode }: CatchFormPageProps) {
  const navigate = useNavigate();
  const { catchId = "" } = useParams();
  const { pushToast } = useToast();

  const catchQuery = useCatch(catchId);
  const speciesOptionsQuery = useSpeciesOptions();

  const createMutation = useCreateCatch({
    onSuccess: (entry) => {
      pushToast({
        title: "Catch logged",
        description: "The new record is now part of your catch log.",
      });
      navigate(`/catches/${entry.catch_id}`);
    },
  });

  const updateMutation = useUpdateCatch(catchId, {
    onSuccess: (entry) => {
      pushToast({
        title: "Catch updated",
        description: "The record changes have been saved.",
      });
      navigate(`/catches/${entry.catch_id}`);
    },
  });

  function handleSubmit(values: CatchFormValues) {
    const payload = {
      lat: values.lat,
      lon: values.lon,
      species: values.species.trim(),
      technique_detail: values.technique?.trim() || null,
      notes: values.notes?.trim() || null,
    };

    if (mode === "create") {
      createMutation.mutate(payload);
      return;
    }

    updateMutation.mutate(payload);
  }

  if (mode === "edit" && catchQuery.isLoading) {
    return <Skeleton className="h-[560px] w-full" />;
  }

  if (speciesOptionsQuery.isLoading) {
    return <Skeleton className="h-[560px] w-full" />;
  }

  if (mode === "edit" && (catchQuery.isError || !catchQuery.data)) {
    return (
      <EmptyState
        title="Catch not found"
        description="This record could not be loaded for editing."
        action={
          <Button asChild>
            <Link to="/catches">Back to catch log</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        kicker={mode === "create" ? "Create record" : "Update record"}
        title={mode === "create" ? "Log catch" : "Edit catch"}
        description={
          mode === "create"
            ? "Add a new catch with premium, calm data entry designed for speed and clarity."
            : "Refine this record without losing control over the analytical structure of the log."
        }
      />
      <CatchForm
        mode={mode}
        initialValues={mode === "edit" ? catchQuery.data : undefined}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
        speciesOptions={speciesOptionsQuery.data ?? []}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
