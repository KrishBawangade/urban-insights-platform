"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Bus, Car, Wind, Zap } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import ChartCard from "@/components/dashboard/ChartCard";
import InsightPanel from "@/components/dashboard/InsightPanel";
import StatCard from "@/components/dashboard/StatCard";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

type TrafficOverview = {
  congestion_index: number;
  average_speed: number;
  active_hotspots: number;
  vehicles_per_minute: number;
};

type TrafficTrendPoint = {
  hour: number;
  today: number;
  yesterday: number;
};

type AirQualitySnapshot = {
  aqi: number;
  aqi_label: string;
  dominant_pollutant?: string;
};

type AirQualityForecast = {
  forecast: Array<{
    time: number;
    aqi: number;
  }>;
};

type TransportOverview = {
  total_ridership: number;
  active_agencies: number;
  average_daily_ridership: number;
  ridership_growth_percent: number;
};

type TrafficInsightResponse = {
  recommendation: string;
};

function formatCompactNumber(value: number) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function getAqiAccent(aqi?: number) {
  if (aqi === undefined) return "bg-pollution";
  if (aqi <= 50) return "bg-emerald-500";
  if (aqi <= 100) return "bg-yellow-400";
  if (aqi <= 150) return "bg-orange-500";
  if (aqi <= 200) return "bg-red-500";
  if (aqi <= 300) return "bg-fuchsia-600";
  return "bg-slate-700";
}

function formatHour(hour: number) {
  return `${hour.toString().padStart(2, "0")}:00`;
}

function formatForecastDay(unixTimestamp: number) {
  return new Date(unixTimestamp * 1000).toLocaleDateString([], {
    weekday: "short",
    day: "numeric",
  });
}

export default function DashboardPage() {
  const [trafficOverview, setTrafficOverview] = useState<TrafficOverview>({
    congestion_index: 0,
    average_speed: 0,
    active_hotspots: 0,
    vehicles_per_minute: 0,
  });
  const [trafficTrendData, setTrafficTrendData] = useState<Array<{ time: string; today: number; yesterday: number }>>([]);
  const [airQuality, setAirQuality] = useState<AirQualitySnapshot | null>(null);
  const [airForecast, setAirForecast] = useState<Array<{ day: string; aqi: number }>>([]);
  const [transportOverview, setTransportOverview] = useState<TransportOverview | null>(null);
  const [trafficInsight, setTrafficInsight] = useState<string>(
    "Nagpur command insight is loading from the traffic and transport APIs.",
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [trafficOverviewRes, trafficTrendRes, trafficInsightRes, airCurrentRes, airForecastRes, transportOverviewRes] =
          await Promise.all([
            fetch(`${API_BASE_URL}/traffic/overview`),
            fetch(`${API_BASE_URL}/traffic/hourly-trend`),
            fetch(`${API_BASE_URL}/traffic/ai-insights`),
            fetch(`${API_BASE_URL}/air-quality/current`),
            fetch(`${API_BASE_URL}/air-quality/forecast?hours=7`),
            fetch(`${API_BASE_URL}/transport/overview`),
          ]);

        if (
          !trafficOverviewRes.ok ||
          !trafficTrendRes.ok ||
          !trafficInsightRes.ok ||
          !airCurrentRes.ok ||
          !airForecastRes.ok ||
          !transportOverviewRes.ok
        ) {
          throw new Error("Dashboard request failed.");
        }

        const trafficOverviewPayload: TrafficOverview = await trafficOverviewRes.json();
        const trafficTrendPayload: TrafficTrendPoint[] = await trafficTrendRes.json();
        const trafficInsightPayload: TrafficInsightResponse = await trafficInsightRes.json();
        const airCurrentPayload: AirQualitySnapshot = await airCurrentRes.json();
        const airForecastPayload: AirQualityForecast = await airForecastRes.json();
        const transportOverviewPayload: TransportOverview = await transportOverviewRes.json();

        setTrafficOverview(trafficOverviewPayload);
        setTrafficTrendData(
          trafficTrendPayload.map((item) => ({
            time: formatHour(item.hour),
            today: item.today,
            yesterday: item.yesterday,
          })),
        );
        setTrafficInsight(trafficInsightPayload.recommendation);
        setAirQuality(airCurrentPayload);
        setAirForecast(
          airForecastPayload.forecast.map((entry) => ({
            day: formatForecastDay(entry.time),
            aqi: entry.aqi,
          })),
        );
        setTransportOverview(transportOverviewPayload);
        setErrorMessage(null);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        setErrorMessage("Live Nagpur dashboard data unavailable");
      }
    };

    fetchDashboardData();
  }, []);

  const activeAlerts = trafficOverview.active_hotspots + (airQuality && airQuality.aqi > 100 ? 1 : 0);
  const insightActions = [
    "Retune Sitabuldi corridor signals",
    "Boost feeder buses near metro stations",
    "Monitor AQI at Wardha Road",
  ];

  return (
    <div className="space-y-6">
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Nagpur City Overview</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Mocked real-time mobility, AQI, and operations insights for the Nagpur smart city control dashboard.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-3 text-sm">
        <span className="rounded-full border border-border bg-card px-3 py-1.5 text-muted-foreground">
          City Scenario: Nagpur
        </span>
        <span className="rounded-full border border-border bg-card px-3 py-1.5 text-muted-foreground">
          Transport: Mocked Nagpur mobility model
        </span>
        <span className="rounded-full border border-border bg-card px-3 py-1.5 text-muted-foreground">
          AQI: EPA-style interpolation on live pollutants
        </span>
        {errorMessage && (
          <span className="rounded-full border border-danger/20 bg-danger/10 px-3 py-1.5 text-danger">
            {errorMessage}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
        <StatCard
          title="Traffic Congestion"
          value={`${trafficOverview.congestion_index}%`}
          trend={`${trafficOverview.average_speed} km/h avg`}
          isPositive={false}
          icon={<Car className="w-5 h-5" />}
          accentColor="bg-traffic"
          showTrendArrow={false}
          trendClassName="bg-traffic/10 text-traffic"
        />
        <StatCard
          title="Air Quality Index"
          value={airQuality ? airQuality.aqi : "--"}
          trend={airQuality?.aqi_label}
          isPositive={false}
          icon={<Wind className="w-5 h-5" />}
          accentColor={getAqiAccent(airQuality?.aqi)}
          showTrendArrow={false}
          trendClassName="bg-pollution/10 text-pollution"
        />
        <StatCard
          title="Transit Ridership"
          value={transportOverview ? formatCompactNumber(transportOverview.average_daily_ridership) : "--"}
          trend={transportOverview ? `${transportOverview.ridership_growth_percent}%` : undefined}
          isPositive={Boolean(transportOverview && transportOverview.ridership_growth_percent >= 0)}
          icon={<Bus className="w-5 h-5" />}
          accentColor="bg-transport"
        />
        <StatCard
          title="Vehicles / Minute"
          value={trafficOverview.vehicles_per_minute}
          trend={`${trafficOverview.active_hotspots} hotspots`}
          isPositive={false}
          icon={<Zap className="w-5 h-5" />}
          accentColor="bg-amber-500"
          showTrendArrow={false}
          trendClassName="bg-amber-500/10 text-amber-600"
        />
        <StatCard
          title="Active Alerts"
          value={activeAlerts}
          trend={airQuality?.dominant_pollutant ? `AQI lead: ${airQuality.dominant_pollutant.toUpperCase()}` : "Monitoring"}
          isPositive={false}
          icon={<AlertTriangle className="w-5 h-5" />}
          accentColor="bg-alert"
          showTrendArrow={false}
          trendClassName="bg-alert/10 text-alert"
        />
      </div>

      <InsightPanel
        title="Nagpur Priority Insight"
        badgeLabel="Command Feed"
        summary={trafficInsight}
        actions={insightActions}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard
          title="Traffic Congestion Tracker"
          subtitle="Today versus yesterday across Nagpur arterial corridors."
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trafficTrendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: "#6B7280", fontSize: 12 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "#6B7280", fontSize: 12 }} />
              <Tooltip
                contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
              />
              <Legend verticalAlign="top" height={36} iconType="circle" />
              <Line type="monotone" dataKey="today" name="Today" stroke="#3B82F6" strokeWidth={3} dot={false} />
              <Line type="monotone" dataKey="yesterday" name="Yesterday" stroke="#94A3B8" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Nagpur AQI Outlook"
          subtitle="Next 7 forecast points from the live air-quality service."
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={airForecast} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#6B7280", fontSize: 12 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "#6B7280", fontSize: 12 }} />
              <Tooltip
                cursor={{ fill: "#F5F7FB" }}
                contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
              />
              <Bar dataKey="aqi" fill="#F59E0B" radius={[4, 4, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}
