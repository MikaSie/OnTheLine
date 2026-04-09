import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import type { Catch } from "../../../lib/types";
import { toMapPoint } from "../../maps/lib/map-utils";
import { catchFormSchema, type CatchFormValues } from "../lib/catch-form-schema";
import { LocationFieldGroup } from "./location-field-group";

interface CatchFormProps {
  mode: "create" | "edit";
  initialValues?: Catch;
  isSubmitting: boolean;
  onSubmit: (values: CatchFormValues) => void;
}

export function CatchForm({
  mode,
  initialValues,
  isSubmitting,
  onSubmit,
}: CatchFormProps) {
  const form = useForm<CatchFormValues>({
    resolver: zodResolver(catchFormSchema),
    defaultValues: {
      lat: initialValues?.lat,
      lon: initialValues?.lon,
      species: initialValues?.species ?? "",
      technique: initialValues?.technique ?? "",
      notes: initialValues?.notes ?? "",
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = form;

  const selectedPoint = toMapPoint(watch("lat"), watch("lon"));

  useEffect(() => {
    reset({
      lat: initialValues?.lat,
      lon: initialValues?.lon,
      species: initialValues?.species ?? "",
      technique: initialValues?.technique ?? "",
      notes: initialValues?.notes ?? "",
    });
  }, [initialValues, reset]);

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>
          {mode === "create" ? "Log a new catch" : "Edit catch record"}
        </CardTitle>
        <CardDescription>
          Capture location, species, method, and notes with clean validation and
          room for detailed observations.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <LocationFieldGroup
            errors={errors}
            register={register}
            selectedPoint={selectedPoint}
            setValue={setValue}
          />

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="species">Species</Label>
              <Input id="species" placeholder="Sea trout" {...register("species")} />
              {errors.species ? (
                <p className="text-sm text-destructive">{errors.species.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="technique">Technique</Label>
              <Input
                id="technique"
                placeholder="Spinning, jigging, fly..."
                {...register("technique")}
              />
              {errors.technique ? (
                <p className="text-sm text-destructive">
                  {errors.technique.message}
                </p>
              ) : null}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Water clarity, wind, structure, retrieve pattern, time of day..."
              {...register("notes")}
            />
            {errors.notes ? (
              <p className="text-sm text-destructive">{errors.notes.message}</p>
            ) : null}
          </div>

          <div className="flex justify-end">
            <Button type="submit" size="lg" disabled={isSubmitting}>
              {isSubmitting
                ? "Saving..."
                : mode === "create"
                  ? "Log catch"
                  : "Save changes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
