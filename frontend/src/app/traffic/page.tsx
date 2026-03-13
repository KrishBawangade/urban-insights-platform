"use client";

import { useEffect, useState } from "react";
import { Activity, AlertOctagon, Car, Navigation } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import ChartCard from "@/components/dashboard/ChartCard";
import StatCard from "@/components/dashboard/StatCard";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

const NAGPUR_JUNCTION_NAMES: Record<number, string> = {
  1: "Sitabuldi Junction",
  2: "Munjey Square",
  3: "Wardha Road Corridor",
  4: "Airport Square",
};

interface PredictionItem {
  junction: number;
  predicted_vehicles: number;
}

interface JunctionAnalysisItem {
  junction: number;
  vehicles: number;
}

interface TrafficOverview {
  congestion_index: number;
  average_speed: number;
  active_hotspots: number;
  vehicles_per_minute: number;
}

interface HourlyTrendItem {
  hour: number;
  today: number;
  yesterday: number;
}

function formatJunctionName(junction: number) {
  return NAGPUR_JUNCTION_NAMES[junction] ?? `Nagpur Junction ${junction}`;
}

function formatHour(hour: number) {
  return `${hour.toString().padStart(2, "0")}:00`;
}

function convertToKmh(speedMph: number) {
  return (speedMph * 1.609).toFixed(1);
}

export default function TrafficPage() {
  const [predictions, setPredictions] = useState<Array<{ junction: string; predicted_vehicles: number }>>([]);
  const [trafficTrend, setTrafficTrend] = useState<Array<{ time: string; today: number; yesterday: number }>>([]);
  const [junctionAnalysis, setJunctionAnalysis] = useState<Array<{ junction: string; vehicles: number }>>([]);
  const [trafficOverview, setTrafficOverview] = useState<TrafficOverview>({
    congestion_index: 0,
    average_speed: 0,
    active_hotspots: 0,
    vehicles_per_minute: 0,
  });
  const [aiInsight, setAiInsight] = useState<string>("Analyzing Nagpur traffic patterns...");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrafficData = async () => {
      try {
        const [predictRes, overviewRes, insightRes, trendRes, junctionRes] = await Promise.all([
          fetch(`${API_BASE_URL}/traffic/predict`),
          fetch(`${API_BASE_URL}/traffic/overview`),
          fetch(`${API_BASE_URL}/traffic/ai-insights`),
          fetch(`${API_BASE_URL}/traffic/hourly-trend`),
          fetch(`${API_BASE_URL}/traffic/junction-analysis`),
        ]);

        if (!predictRes.ok || !overviewRes.ok || !insightRes.ok || !trendRes.ok || !junctionRes.ok) {
          throw new Error("Traffic request failed.");
        }

        const predictData: PredictionItem[] = await predictRes.json();
        const overviewData: TrafficOverview = await overviewRes.json();
        const insightData = await insightRes.json();
        const trendData: HourlyTrendItem[] = await trendRes.json();
        const junctionData: JunctionAnalysisItem[] = await junctionRes.json();

        setPredictions(
          predictData.map((item) => ({
            junction: formatJunctionName(item.junction),
            predicted_vehicles: item.predicted_vehicles,
          })),
        );
        setTrafficOverview(overviewData);
        setAiInsight(insightData.recommendation);
        setTrafficTrend(
          trendData.map((item) => ({
            time: formatHour(item.hour),
            today: item.today,
            yesterday: item.yesterday,
          })),
        );
        setJunctionAnalysis(
          junctionData.map((item) => ({
            junction: formatJunctionName(item.junction),
            vehicles: item.vehicles,
          })),
        );
        setErrorMessage(null);
      } catch (error) {
        console.error("Error fetching traffic data:", error);
        setAiInsight(
          "Traffic load is high across Nagpur corridors. Monitoring key junctions and recommending adaptive signal control."
        );
        setErrorMessage("Live Nagpur traffic analytics unavailable");
      }
    };

    fetchTrafficData();
  }, []);

  const peakPrediction = predictions.reduce<(typeof predictions)[number] | null>((highest, item) => {
    if (!highest || item.predicted_vehicles > highest.predicted_vehicles) {
      return item;
    }

    return highest;
  }, null);

  const busiestJunction = junctionAnalysis.reduce<(typeof junctionAnalysis)[number] | null>((highest, item) => {
    if (!highest || item.vehicles > highest.vehicles) {
      return item;
    }

    return highest;
  }, null);
  const peakTrafficPoint = trafficTrend.reduce<(typeof trafficTrend)[number] | null>((highest, item) => {
    if (!highest || item.today > highest.today) {
      return item;
    }

    return highest;
  }, null);
  const averageTodayTraffic =
    trafficTrend.length > 0
      ? (trafficTrend.reduce((sum, item) => sum + item.today, 0) / trafficTrend.length).toFixed(1)
      : null;
  const peakTrafficDelta = peakTrafficPoint ? peakTrafficPoint.today - peakTrafficPoint.yesterday : null;

  return (
    <div className="space-y-6">
      <header className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Nagpur Traffic Analysis</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Live congestion, junction load, and adaptive traffic guidance for Nagpur city corridors.
          </p>
        </div>

        <div className="hidden w-fit items-center gap-2 rounded-md border border-border bg-white px-3 py-1.5 text-sm text-muted-foreground shadow-sm sm:flex">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-success"></span>
          </span>
          Nagpur Live Sync Active
        </div>
      </header>

      <div className="flex flex-wrap items-center gap-3 text-sm">
        <span className="rounded-full border border-border bg-card px-3 py-1.5 text-muted-foreground">
          City Scenario: Nagpur
        </span>
        <span className="rounded-full border border-border bg-card px-3 py-1.5 text-muted-foreground">
          Traffic Layer: Junction load + congestion model
        </span>
        {errorMessage && (
          <span className="rounded-full border border-danger/20 bg-danger/10 px-3 py-1.5 text-danger">
            {errorMessage}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Congestion Index"
          value={`${trafficOverview.congestion_index}%`}
          trend={trafficOverview.congestion_index > 70 ? "High pressure" : "Managed flow"}
          isPositive={false}
          icon={<Car className="w-5 h-5" />}
          accentColor="bg-alert"
          showTrendArrow={false}
          trendClassName="bg-alert/10 text-alert"
        />

        <StatCard
          title="Average Speed"
          value={`${convertToKmh(trafficOverview.average_speed)} km/h`}
          trend="Corridor average"
          isPositive={true}
          icon={<Activity className="w-5 h-5" />}
          accentColor="bg-traffic"
          showTrendArrow={false}
          trendClassName="bg-traffic/10 text-traffic"
        />

        <StatCard
          title="Active Hotspots"
          value={trafficOverview.active_hotspots.toString()}
          trend={busiestJunction ? busiestJunction.junction : "Monitoring"}
          isPositive={false}
          icon={<AlertOctagon className="w-5 h-5" />}
          accentColor="bg-pollution"
          showTrendArrow={false}
          trendClassName="bg-pollution/10 text-pollution"
        />

        <StatCard
          title="Vehicles / Minute"
          value={trafficOverview.vehicles_per_minute.toString()}
          trend={peakPrediction ? `Peak next: ${peakPrediction.junction}` : "Forecast loading"}
          isPositive={false}
          icon={<Navigation className="w-5 h-5" />}
          accentColor="bg-primary"
          showTrendArrow={false}
          trendClassName="bg-primary/10 text-primary"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <ChartCard
          title="Real-Time vs Historical Density"
          subtitle="Today's Nagpur corridor load compared with the same hours yesterday."
          className="lg:col-span-2"
        >
          <div className="flex h-full flex-col gap-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-border bg-muted/30 px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Peak Today</p>
                <p className="mt-1 text-xl font-semibold text-foreground">
                  {peakTrafficPoint ? peakTrafficPoint.today.toFixed(1) : "--"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {peakTrafficPoint ? `Observed at ${peakTrafficPoint.time}` : "Waiting for hourly data"}
                </p>
              </div>
              <div className="rounded-lg border border-border bg-muted/30 px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Average Today</p>
                <p className="mt-1 text-xl font-semibold text-foreground">{averageTodayTraffic ?? "--"}</p>
                <p className="text-sm text-muted-foreground">Across the last 24 hourly points</p>
              </div>
              <div className="rounded-lg border border-border bg-muted/30 px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Vs Yesterday</p>
                <p className="mt-1 text-xl font-semibold text-foreground">
                  {peakTrafficDelta !== null ? `${peakTrafficDelta >= 0 ? "+" : ""}${peakTrafficDelta.toFixed(1)}` : "--"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {peakTrafficPoint ? `Difference at ${peakTrafficPoint.time}` : "Waiting for hourly data"}
                </p>
              </div>
            </div>
            <div className="min-h-0 flex-1">
              {trafficTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trafficTrend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis
                      dataKey="time"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#6B7280", fontSize: 12 }}
                      ticks={trafficTrend.filter((_, index) => index % 3 === 0).map((item) => item.time)}
                      dy={10}
                    />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "#6B7280", fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                      formatter={(value: number, name: string) => [value.toFixed(1), name === "today" ? "Today" : "Yesterday"]}
                      labelFormatter={(label) => `Hour: ${label}`}
                    />
                    <Legend verticalAlign="top" height={36} iconType="circle" />
                    <Line
                      type="monotone"
                      dataKey="today"
                      name="Today"
                      stroke="#2563EB"
                      strokeWidth={3}
                      dot={{ r: 2 }}
                      activeDot={{ r: 5 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="yesterday"
                      name="Yesterday"
                      stroke="#94A3B8"
                      strokeWidth={2}
                      strokeDasharray="5 4"
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-border bg-muted/20 text-sm text-muted-foreground">
                  Hourly traffic comparison will appear here once live trend data is available.
                </div>
              )}
            </div>
          </div>
        </ChartCard>

        <ChartCard
          title="Busiest Junctions"
          subtitle="Average vehicle volume across monitored Nagpur junctions."
        >
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart layout="vertical" data={junctionAnalysis}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
              <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "#6B7280", fontSize: 12 }} />
              <YAxis dataKey="junction" type="category" axisLine={false} tickLine={false} tick={{ fill: "#6B7280", fontSize: 12 }} width={120} />
              <Tooltip
                cursor={{ fill: "#F5F7FB" }}
                contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                formatter={(value: number) => [value.toFixed(1), "Avg Vehicles"]}
              />
              <Legend verticalAlign="top" height={36} iconType="circle" />
              <Bar dataKey="vehicles" name="Avg Vehicles" fill="#F59E0B" radius={[0, 4, 4, 0]} barSize={24} />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <ChartCard
        title="Predicted Traffic (Next Hour)"
        subtitle="Forecast vehicle volume for each major Nagpur junction."
      >
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={predictions}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="junction" axisLine={false} tickLine={false} tick={{ fill: "#6B7280", fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "#6B7280", fontSize: 12 }} />
              <Tooltip
                contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                formatter={(value: number) => [value, "Predicted Vehicles"]}
              />

              <Bar
                dataKey="predicted_vehicles"
                name="Predicted Vehicles"
                fill="#8B5CF6"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <div className="rounded-lg border border-indigo-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
        <div className="flex items-start gap-4">
          <div className="rounded-full border border-indigo-100 bg-white p-3 shadow-sm">
            <Car className="w-6 h-6 text-indigo-600" />
          </div>

          <div>
            <h3 className="mb-1 text-lg font-semibold text-slate-900">Nagpur AI Logistics Recommendation</h3>

            <p className="max-w-4xl leading-relaxed text-slate-700">{aiInsight}</p>

            <div className="mt-4 flex gap-3">
              <button className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
                Initiate Corridor Response
              </button>

              <button className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                View Predictive Simulation
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
