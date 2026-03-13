"use client";

import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Activity, Bus, CalendarDays, Train, Users } from "lucide-react";

import ChartCard from "@/components/dashboard/ChartCard";
import StatCard from "@/components/dashboard/StatCard";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

type TransportOverview = {
  total_ridership: number;
  active_agencies: number;
  average_daily_ridership: number;
  ridership_growth_percent: number;
};

type RidershipTrendPoint = {
  date: string;
  ridership: number;
};

type AgencyUtilizationPoint = {
  agency: string;
  ridership: number;
};

type WeeklyRidershipPoint = {
  week: number;
  ridership: number;
};

type PredictionPoint = {
  date: string;
  predicted_ridership: number;
};

type InsightResponse = {
  insight: string;
};

const NAGPUR_AGENCY_LABELS: Record<string, string> = {
  "New York City MTA Rail": "Nagpur Metro Rail",
  "WMATA Bus and Rail": "Aapli Bus + Metro Feeder",
  "San Francisco BART Rail": "MIHAN Shuttle Rail Link",
};

function formatCompactNumber(value: number) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function formatDateLabel(dateValue: string) {
  return new Date(dateValue).toLocaleDateString([], {
    month: "short",
    day: "numeric",
  });
}

function formatAgencyName(agency: string) {
  return NAGPUR_AGENCY_LABELS[agency] ?? agency;
}

function formatInsightForNagpur(insight: string) {
  return insight
    .replaceAll("New York City MTA Rail", "Nagpur Metro Rail")
    .replaceAll("WMATA Bus and Rail", "Aapli Bus + Metro Feeder")
    .replaceAll("San Francisco BART Rail", "MIHAN Shuttle Rail Link")
    .replaceAll("city transit planners", "Nagpur mobility planners")
    .replaceAll("Transit planners", "Nagpur transit planners");
}

export default function TransportPage() {
  const [overview, setOverview] = useState<TransportOverview | null>(null);
  const [ridershipTrend, setRidershipTrend] = useState<RidershipTrendPoint[]>([]);
  const [agencyUtilization, setAgencyUtilization] = useState<AgencyUtilizationPoint[]>([]);
  const [weeklyRidership, setWeeklyRidership] = useState<WeeklyRidershipPoint[]>([]);
  const [predictionData, setPredictionData] = useState<PredictionPoint[]>([]);
  const [aiInsight, setAiInsight] = useState<string>(
    "Transit intelligence is loading. Live planning guidance will appear here once the backend responds.",
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransportDashboard = async () => {
      try {
        const [overviewResponse, trendResponse, agencyResponse, weeklyResponse, predictionResponse, insightResponse] =
          await Promise.all([
            fetch(`${API_BASE_URL}/transport/overview`),
            fetch(`${API_BASE_URL}/transport/ridership-trend`),
            fetch(`${API_BASE_URL}/transport/agency-utilization`),
            fetch(`${API_BASE_URL}/transport/weekly`),
            fetch(`${API_BASE_URL}/transport/predict?days_ahead=7`),
            fetch(`${API_BASE_URL}/transport/ai-insight`),
          ]);

        if (
          !overviewResponse.ok ||
          !trendResponse.ok ||
          !agencyResponse.ok ||
          !weeklyResponse.ok ||
          !predictionResponse.ok ||
          !insightResponse.ok
        ) {
          throw new Error("Transport request failed.");
        }

        const overviewPayload: TransportOverview = await overviewResponse.json();
        const trendPayload: RidershipTrendPoint[] = await trendResponse.json();
        const agencyPayload: AgencyUtilizationPoint[] = await agencyResponse.json();
        const weeklyPayload: WeeklyRidershipPoint[] = await weeklyResponse.json();
        const predictionPayload: PredictionPoint[] = await predictionResponse.json();
        const insightPayload: InsightResponse = await insightResponse.json();

        setOverview(overviewPayload);
        setRidershipTrend(trendPayload);
        setAgencyUtilization(
          agencyPayload.map((entry) => ({
            ...entry,
            agency: formatAgencyName(entry.agency),
          })),
        );
        setWeeklyRidership(weeklyPayload);
        setPredictionData(predictionPayload);
        setAiInsight(formatInsightForNagpur(insightPayload.insight));
        setErrorMessage(null);
      } catch (error) {
        console.error("Failed to fetch transport dashboard data:", error);
        setErrorMessage("Live transport analytics unavailable");
      }
    };

    fetchTransportDashboard();
  }, []);

  const chartTrendData = [
    ...ridershipTrend.map((entry) => ({
      label: formatDateLabel(entry.date),
      ridership: entry.ridership,
      predictedRidership: null,
    })),
    ...predictionData.map((entry) => ({
      label: formatDateLabel(entry.date),
      ridership: null,
      predictedRidership: entry.predicted_ridership,
    })),
  ];

  const topAgency = agencyUtilization[0];
  const peakWeek = weeklyRidership.reduce<WeeklyRidershipPoint | null>((highest, entry) => {
    if (!highest || entry.ridership > highest.ridership) {
      return entry;
    }

    return highest;
  }, null);

  return (
    <div className="space-y-6">
      <header className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Nagpur Public Transport Command</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Mocked transit analytics for Nagpur Metro, feeder buses, weekly demand shifts, and forecasted city mobility load.
          </p>
        </div>
        <div className="flex w-fit items-center gap-2 rounded-full border border-transport/20 bg-transport/10 px-3 py-1.5 text-sm font-medium text-transport shadow-sm">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-transport opacity-75"></span>
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-transport"></span>
          </span>
          <span>Transport Analytics API</span>
        </div>
      </header>

      <div className="flex flex-wrap items-center gap-3 text-sm">
        <span className="rounded-full border border-border bg-card px-3 py-1.5 text-muted-foreground">
          City Scenario: Nagpur
        </span>
        <span className="rounded-full border border-border bg-card px-3 py-1.5 text-muted-foreground">
          Data Layer: Mocked from public transit ridership patterns
        </span>
        <span className="rounded-full border border-border bg-card px-3 py-1.5 text-muted-foreground">
          Operations Focus: Metro + bus feeder planning
        </span>
        {errorMessage && (
          <span className="rounded-full border border-danger/20 bg-danger/10 px-3 py-1.5 text-danger">
            {errorMessage}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Ridership"
          value={overview ? formatCompactNumber(overview.total_ridership) : "--"}
          trend={overview ? `${overview.ridership_growth_percent}%` : undefined}
          isPositive={Boolean(overview && overview.ridership_growth_percent >= 0)}
          icon={<Users className="w-5 h-5" />}
          accentColor="bg-transport"
        />
        <StatCard
          title="Active Agencies"
          value={overview ? overview.active_agencies : "--"}
          trend={topAgency ? `Top: ${topAgency.agency}` : undefined}
          icon={<Bus className="w-5 h-5" />}
          accentColor="bg-traffic"
          showTrendArrow={false}
          trendClassName="bg-traffic/10 text-traffic"
        />
        <StatCard
          title="Average Daily Ridership"
          value={overview ? formatCompactNumber(overview.average_daily_ridership) : "--"}
          trend="Per recorded day"
          icon={<Train className="w-5 h-5" />}
          accentColor="bg-primary"
          showTrendArrow={false}
          trendClassName="bg-primary/10 text-primary"
        />
        <StatCard
          title="Peak Week"
          value={peakWeek ? `W${peakWeek.week}` : "--"}
          trend={peakWeek ? formatCompactNumber(peakWeek.ridership) : undefined}
          icon={<CalendarDays className="w-5 h-5" />}
          accentColor="bg-alert"
          showTrendArrow={false}
          trendClassName="bg-alert/10 text-alert"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <ChartCard
          title="Ridership Trend and Forecast"
          subtitle="Mocked Nagpur daily ridership with the next 7 forecasted days from the transport prediction service."
          className="lg:col-span-2"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartTrendData} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "#6B7280", fontSize: 12 }} dy={10} />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#6B7280", fontSize: 12 }}
                tickFormatter={(value: number) => formatCompactNumber(value)}
              />
              <Tooltip
                contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                formatter={(value: number | null, name: string) => {
                  if (value === null) {
                    return ["--", name];
                  }

                  return [value.toLocaleString(), name === "predictedRidership" ? "Predicted Ridership" : "Ridership"];
                }}
              />
              <Legend verticalAlign="top" height={36} iconType="circle" />
              <Line type="monotone" dataKey="ridership" name="Historical Ridership" stroke="#10B981" strokeWidth={3} dot={false} />
              <Line
                type="monotone"
                dataKey="predictedRidership"
                name="Predicted Ridership"
                stroke="#2563EB"
                strokeWidth={3}
                strokeDasharray="6 4"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Agency Utilization"
          subtitle="Cumulative ridership by Nagpur transit service."
          className="lg:col-span-1"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={agencyUtilization}
              margin={{ top: 10, right: 20, left: 60, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
              <XAxis
                type="number"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#6B7280", fontSize: 12 }}
                tickFormatter={(value: number) => formatCompactNumber(value)}
              />
              <YAxis dataKey="agency" type="category" axisLine={false} tickLine={false} tick={{ fill: "#6B7280", fontSize: 12 }} width={120} />
              <Tooltip
                cursor={{ fill: "#F5F7FB" }}
                contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                formatter={(value: number) => [value.toLocaleString(), "Ridership"]}
              />
              <Bar dataKey="ridership" name="Ridership" fill="#2563EB" radius={[0, 4, 4, 0]} barSize={26} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <ChartCard
          title="Weekly Ridership"
          subtitle="Aggregated weekly ridership for the Nagpur mobility scenario."
          className="lg:col-span-2"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyRidership} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: "#6B7280", fontSize: 12 }} dy={10} />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#6B7280", fontSize: 12 }}
                tickFormatter={(value: number) => formatCompactNumber(value)}
              />
              <Tooltip
                cursor={{ fill: "#F5F7FB" }}
                contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                formatter={(value: number) => [value.toLocaleString(), "Ridership"]}
              />
              <Legend verticalAlign="top" height={36} iconType="circle" />
              <Bar dataKey="ridership" name="Weekly Ridership" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={42} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Nagpur Operations Snapshot"
          subtitle="Fast-read planning signals derived from the live transport APIs."
          className="lg:col-span-1"
        >
          <div className="flex h-full flex-col gap-4">
            <div className="rounded-lg border border-border bg-muted/30 px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Growth Direction</p>
              <p className="mt-1 text-xl font-semibold text-foreground">
                {overview
                  ? overview.ridership_growth_percent > 0
                    ? "Rising"
                    : overview.ridership_growth_percent < 0
                      ? "Falling"
                      : "Stable"
                  : "--"}
              </p>
              <p className="text-sm text-muted-foreground">Compared with the previous 7-day period</p>
            </div>
            <div className="rounded-lg border border-border bg-muted/30 px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Top Agency</p>
              <p className="mt-1 text-lg font-semibold text-foreground">{topAgency?.agency ?? "--"}</p>
              <p className="text-sm text-muted-foreground">
                {topAgency ? `${formatCompactNumber(topAgency.ridership)} cumulative rides` : "Waiting for agency data"}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-muted/30 px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Forecast Horizon</p>
              <p className="mt-1 text-xl font-semibold text-foreground">{predictionData.length || "--"} days</p>
              <p className="text-sm text-muted-foreground">
                {predictionData[0] ? `Starts ${formatDateLabel(predictionData[0].date)}` : "Waiting for forecast"}
              </p>
            </div>
          </div>
        </ChartCard>
      </div>

      <div className="rounded-lg border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 p-6">
        <div className="flex items-start gap-4">
          <div className="rounded-full border border-emerald-200 bg-white p-3 shadow-sm">
            <Activity className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h3 className="mb-1 text-lg font-semibold text-slate-900">AI Nagpur Transit Insight</h3>
            <p className="max-w-4xl leading-relaxed text-slate-700">{aiInsight}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
