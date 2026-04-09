import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { EmptyState } from "../../../components/common/empty-state";
import { SectionHeader } from "../../../components/common/section-header";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";
import { Skeleton } from "../../../components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import { buildCatchAreaBuckets } from "../../../lib/catch-areas";
import { useCatches } from "../hooks/use-catches";
import { CatchCard } from "../components/catch-card";
import { CatchFilters } from "../components/catch-filters";
import { CatchTable } from "../components/catch-table";

export function CatchLogPage() {
  const catchesQuery = useCatches();
  const [search, setSearch] = useState("");
  const [technique, setTechnique] = useState("all");
  const [area, setArea] = useState("all");
  const [sort, setSort] = useState("newest");

  const catches = catchesQuery.data ?? [];
  const areas = useMemo(() => buildCatchAreaBuckets(catches), [catches]);

  const filtered = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    const visible = catches.filter((entry) => {
      const matchesSearch =
        !normalizedSearch ||
        entry.species.toLowerCase().includes(normalizedSearch) ||
        entry.notes?.toLowerCase().includes(normalizedSearch) ||
        entry.technique?.toLowerCase().includes(normalizedSearch);

      const matchesTechnique =
        technique === "all" ||
        (entry.technique ?? "Unspecified").toLowerCase() === technique.toLowerCase();

      const entryArea = areas.find((bucket) =>
        entry.lat >= bucket.centerLat - 0.051 &&
        entry.lat <= bucket.centerLat + 0.051 &&
        entry.lon >= bucket.centerLon - 0.051 &&
        entry.lon <= bucket.centerLon + 0.051,
      );

      const matchesArea = area === "all" || entryArea?.key === area;

      return matchesSearch && matchesTechnique && matchesArea;
    });

    return [...visible].sort((left, right) => {
      if (sort === "oldest") {
        return new Date(left.timestamp).getTime() - new Date(right.timestamp).getTime();
      }

      if (sort === "species") {
        return left.species.localeCompare(right.species);
      }

      return new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime();
    });
  }, [area, areas, catches, search, sort, technique]);

  const techniques = [...new Set(catches.map((entry) => entry.technique).filter(Boolean))] as string[];
  const selectedArea = areas.find((entry) => entry.key === area);
  const activeFilters = [
    search.trim() ? `Search: ${search.trim()}` : null,
    technique !== "all" ? `Technique: ${technique}` : null,
    selectedArea ? `Area: ${selectedArea.label}` : null,
  ].filter(Boolean) as string[];

  function clearFilters() {
    setSearch("");
    setTechnique("all");
    setArea("all");
    setSort("newest");
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        kicker="Catch log"
        title="Structured records, clean review"
        description="Search, filter, and inspect every logged catch through a premium data-first view."
        action={
          <Button asChild>
            <Link to="/catches/new">Log Catch</Link>
          </Button>
        }
      />

      <CatchFilters
        search={search}
        onSearchChange={setSearch}
        technique={technique}
        onTechniqueChange={setTechnique}
        techniques={techniques}
        area={area}
        onAreaChange={setArea}
        areas={areas}
        sort={sort}
        onSortChange={setSort}
      />

      {catchesQuery.isError ? (
        <EmptyState
          title="Catch log is offline"
          description="The UI is ready, but the API could not be reached. Start the Flask server to load or edit records."
          action={
            <Button asChild>
              <Link to="/">Return to dashboard</Link>
            </Button>
          }
        />
      ) : catchesQuery.isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-72 w-full" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title={
            catches.length === 0
              ? "Start building your analytical logbook"
              : "No catches match these filters"
          }
          description={
            catches.length === 0
              ? "Your catch log will show premium cards, searchable data, and future-ready insights as soon as you record the first catch."
              : "Try widening the search, clearing filters, or switching the area view to bring more records back into focus."
          }
          action={
            catches.length === 0 ? (
              <Button asChild>
                <Link to="/catches/new">Log your first catch</Link>
              </Button>
            ) : (
              <Button variant="secondary" onClick={clearFilters}>
                Clear filters
              </Button>
            )
          }
        />
      ) : (
        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <div className="mb-6 flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-white/10 bg-black/10 p-5">
              <div className="space-y-2">
                <p className="text-kicker">Visible records</p>
                <h2 className="font-display text-2xl font-semibold">
                  {filtered.length} of {catches.length} catches in view
                </h2>
                <p className="text-sm text-muted-foreground">
                  Sort by {sort === "species" ? "species A-Z" : sort === "oldest" ? "oldest first" : "newest first"} and
                  refine by technique, area, or text search.
                </p>
              </div>
              {activeFilters.length > 0 ? (
                <div className="flex max-w-xl flex-wrap items-center justify-end gap-2">
                  {activeFilters.map((entry) => (
                    <Badge key={entry}>{entry}</Badge>
                  ))}
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear all
                  </Button>
                </div>
              ) : (
                <Badge>No active filters</Badge>
              )}
            </div>
            <Tabs defaultValue="cards" className="space-y-6">
              <TabsList>
                <TabsTrigger value="cards">Card view</TabsTrigger>
                <TabsTrigger value="table">Table view</TabsTrigger>
              </TabsList>
              <TabsContent value="cards">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {filtered.map((entry) => (
                    <CatchCard key={entry.catch_id} catchEntry={entry} />
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="table">
                <CatchTable catches={filtered} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
