import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { EmptyState } from "../../../components/common/empty-state";
import { SectionHeader } from "../../../components/common/section-header";
import { Button } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";
import { Skeleton } from "../../../components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import { useCatches } from "../hooks/use-catches";
import { CatchCard } from "../components/catch-card";
import { CatchFilters } from "../components/catch-filters";
import { CatchTable } from "../components/catch-table";

export function CatchLogPage() {
  const catchesQuery = useCatches();
  const [search, setSearch] = useState("");
  const [technique, setTechnique] = useState("all");

  const catches = catchesQuery.data ?? [];

  const filtered = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return catches.filter((entry) => {
      const matchesSearch =
        !normalizedSearch ||
        entry.species.toLowerCase().includes(normalizedSearch) ||
        entry.notes?.toLowerCase().includes(normalizedSearch) ||
        entry.technique?.toLowerCase().includes(normalizedSearch);

      const matchesTechnique =
        technique === "all" ||
        (entry.technique ?? "Unspecified").toLowerCase() === technique.toLowerCase();

      return matchesSearch && matchesTechnique;
    });
  }, [catches, search, technique]);

  const techniques = [...new Set(catches.map((entry) => entry.technique).filter(Boolean))] as string[];

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
          title="Start building your analytical logbook"
          description="Your catch log will show premium cards, searchable data, and future-ready insights as soon as you record the first catch."
          action={
            <Button asChild>
              <Link to="/catches/new">Log your first catch</Link>
            </Button>
          }
        />
      ) : (
        <Card>
          <CardContent className="p-6">
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
