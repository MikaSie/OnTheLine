import { Fish, Radar, Sparkles, Waves } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, LineChart, Line, CartesianGrid } from "recharts";
import { Link } from "react-router-dom";

import { SectionHeader } from "../../../components/common/section-header";
import { Button } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";
import { Skeleton } from "../../../components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import { formatDateTime, formatShortDate } from "../../../lib/formatters";
import { buildCatchAreaBuckets } from "../../../lib/catch-areas";
import { useCatches } from "../../catches/hooks/use-catches";
import { QuickActionPanel } from "../../catches/components/quick-action-panel";
import { ActivityTimeline } from "../components/activity-timeline";
import { DecisionSupportCard } from "../components/decision-support-card";
import { DashboardMapCard } from "../components/dashboard-map-card";
import { InsightChartCard } from "../components/insight-chart-card";
import { MetricCard } from "../components/metric-card";
import { WeatherPreviewCard } from "../components/weather-preview-card";
import { buildActionableInsights, buildRecentActivity, buildSpeciesMix, buildSummary, buildTechniqueMix } from "../lib/analytics";

const chartColors = ["#c11e31", "#f97316", "#64748b", "#0f766e", "#a855f7"];

export function DashboardPage() {
  const catchesQuery = useCatches();

  if (catchesQuery.isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48 w-full" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-40 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (catchesQuery.isError) {
    return (
      <Card>
        <CardContent className="p-8">
          <p className="text-kicker">Connection issue</p>
          <h2 className="mt-3 font-display text-3xl font-semibold">
            Dashboard data is unavailable
          </h2>
          <p className="mt-3 max-w-xl text-sm text-muted-foreground">
            The frontend is ready, but the API could not be reached. Start the
            Flask backend and reload to populate the dashboard.
          </p>
        </CardContent>
      </Card>
    );
  }

  const catches = catchesQuery.data ?? [];
  const summary = buildSummary(catches);
  const speciesMix = buildSpeciesMix(catches);
  const techniqueMix = buildTechniqueMix(catches);
  const recentActivity = buildRecentActivity(catches);
  const actionableInsights = buildActionableInsights(catches);
  const hotspotArea = buildCatchAreaBuckets(catches)[0] ?? null;

  return (
    <div className="space-y-10">
      <Card className="panel-grid overflow-hidden bg-hero-mesh">
        <CardContent className="grid gap-8 p-8 pt-10 xl:grid-cols-[1.3fr_0.8fr] xl:items-center">
          <div className="space-y-6">
            <div className="space-y-4">
              <h1 className="max-w-[15ch] font-display text-[2.85rem] font-semibold leading-[1.02] tracking-[-0.03em] md:text-[3.7rem] xl:text-[4.3rem]">
                Premium catch intelligence for anglers who want a sharper edge.
              </h1>
              <p className="max-w-[40rem] text-lg leading-8 text-slate-200/72">
                Track every catch, read your patterns, and build a cleaner
                understanding of what is working on the water.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/catches/new">Log a catch</Link>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <Link to="/catches">Open catch log</Link>
              </Button>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-black/20 px-5 py-4">
                <p className="text-xs uppercase tracking-[0.26em] text-muted-foreground">
                  Latest log
                </p>
                <p className="mt-2 font-medium">
                  {summary.latestCatchAt
                    ? formatDateTime(summary.latestCatchAt)
                    : "Awaiting first catch"}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 px-5 py-4">
                <p className="text-xs uppercase tracking-[0.26em] text-muted-foreground">
                  Species recorded
                </p>
                <p className="mt-2 font-medium">{summary.uniqueSpecies}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 px-5 py-4">
                <p className="text-xs uppercase tracking-[0.26em] text-muted-foreground">
                  Techniques tracked
                </p>
                <p className="mt-2 font-medium">{summary.techniquesTracked}</p>
              </div>
            </div>
          </div>
          <div className="xl:pl-3">
            <QuickActionPanel />
          </div>
        </CardContent>
      </Card>

      <SectionHeader
        kicker="Overview"
        title="Current performance snapshot"
        description="These cards turn the current catch log into the first analytical layer of the product."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Total catches"
          value={String(summary.totalCatches)}
          detail="All logged entries currently in the system."
          icon={<Fish className="h-5 w-5" />}
        />
        <MetricCard
          label="Species mix"
          value={String(summary.uniqueSpecies)}
          detail="Distinct species represented in your log."
          icon={<Sparkles className="h-5 w-5" />}
        />
        <MetricCard
          label="Technique coverage"
          value={String(summary.techniquesTracked)}
          detail="Different methods already tracked in your data."
          icon={<Waves className="h-5 w-5" />}
        />
        <MetricCard
          label="Insight readiness"
          value={summary.totalCatches > 0 ? "Live" : "Standby"}
          detail="Analytics update automatically as new catches are logged."
          icon={<Radar className="h-5 w-5" />}
        />
      </div>

      <WeatherPreviewCard targetArea={hotspotArea} />

      <DecisionSupportCard insights={actionableInsights} />

      <DashboardMapCard catches={catches} />

      <Tabs defaultValue="insights" className="space-y-7">
        <TabsList>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="activity">Recent activity</TabsTrigger>
        </TabsList>
        <TabsContent value="insights" className="grid gap-6 xl:grid-cols-[1.1fr_1.1fr_0.8fr]">
          <InsightChartCard
            title="Species distribution"
            description="Top logged species from the current catch book."
          >
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={speciesMix}
                    dataKey="value"
                    nameKey="label"
                    innerRadius={60}
                    outerRadius={92}
                    paddingAngle={4}
                  >
                    {speciesMix.map((entry, index) => (
                      <Cell key={entry.label} fill={chartColors[index % chartColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </InsightChartCard>

          <InsightChartCard
            title="Activity pulse"
            description="Daily catch counts over the last seven days."
          >
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={recentActivity}>
                  <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickFormatter={formatShortDate}
                    stroke="rgba(255,255,255,0.4)"
                  />
                  <YAxis allowDecimals={false} stroke="rgba(255,255,255,0.4)" />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="catches"
                    stroke="#c11e31"
                    strokeWidth={3}
                    dot={{ fill: "#c11e31", strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </InsightChartCard>

          <InsightChartCard
            title="Technique mix"
            description="Most used methods across the current entries."
          >
            <div className="space-y-4">
              {techniqueMix.length > 0 ? (
                techniqueMix.map((entry, index) => (
                  <div key={entry.label} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>{entry.label}</span>
                      <span className="text-muted-foreground">{entry.value}</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/5">
                      <div
                        className="h-2 rounded-full"
                        style={{
                          width: `${(entry.value / techniqueMix[0].value) * 100}%`,
                          backgroundColor: chartColors[index % chartColors.length],
                        }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  Technique analytics will appear as soon as catches are logged.
                </p>
              )}
            </div>
          </InsightChartCard>
        </TabsContent>
        <TabsContent value="activity">
          <Card>
            <CardContent className="grid gap-6 p-6 xl:grid-cols-[1fr_0.8fr]">
              <div className="space-y-4">
                <p className="text-kicker">Recent movements</p>
                <h2 className="font-display text-2xl font-semibold">
                  Latest catch activity
                </h2>
                <p className="text-sm text-muted-foreground">
                  Review the most recent entries as they move through the log.
                </p>
                <ActivityTimeline catches={catches} />
              </div>
              <QuickActionPanel />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
