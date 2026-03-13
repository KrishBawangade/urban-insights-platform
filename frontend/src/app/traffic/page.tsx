"use client";

import StatCard from "@/components/dashboard/StatCard";
import ChartCard from "@/components/dashboard/ChartCard";
import { Car, Navigation, AlertOctagon, Activity } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area,
  ComposedChart,
  Bar,
  BarChart,
} from "recharts";
import { useState, useEffect } from "react";

const trafficComparisonData = [
  { time: "06:00", today: 30, yesterday: 25 },
  { time: "08:00", today: 85, yesterday: 80 },
  { time: "10:00", today: 65, yesterday: 75 },
  { time: "12:00", today: 70, yesterday: 65 },
  { time: "14:00", today: 60, yesterday: 55 },
  { time: "16:00", today: 80, yesterday: 85 },
  { time: "18:00", today: 95, yesterday: 90 },
  { time: "20:00", today: 50, yesterday: 60 },
];

const incidentData = [
  { zone: "North", accidents: 2, construction: 5, events: 0 },
  { zone: "South", accidents: 1, construction: 2, events: 1 },
  { zone: "East", accidents: 4, construction: 0, events: 2 },
  { zone: "West", accidents: 0, construction: 3, events: 0 },
  { zone: "Downtown", accidents: 5, construction: 8, events: 3 },
];

interface PredictionItem {
  junction: number;
  predicted_vehicles: number;
}

interface TrafficOverview {
  congestion_index: number;
  average_speed: number;
  active_hotspots: number;
  vehicles_per_minute: number;
}

export default function TrafficPage() {
  const [predictions, setPredictions] = useState<
    Array<{ junction: string; predicted_vehicles: number }>
  >([]);

  const [trafficOverview, setTrafficOverview] = useState<TrafficOverview>({
    congestion_index: 0,
    average_speed: 0,
    active_hotspots: 0,
    vehicles_per_minute: 0,
  });

  const [aiInsight, setAiInsight] = useState<string>(
    "Analyzing traffic patterns..."
  );

  useEffect(() => {
    const fetchTrafficData = async () => {
      try {
        const [predictRes, overviewRes, insightRes] = await Promise.all([
          fetch("http://127.0.0.1:8000/traffic/predict"),
          fetch("http://127.0.0.1:8000/traffic/overview"),
          fetch("http://127.0.0.1:8000/traffic/ai-insights"),
        ]);

        // Predictions
        if (predictRes.ok) {
          const predictData = await predictRes.json();

          const formattedData = predictData.map((item: PredictionItem) => ({
            junction: `Junction ${item.junction}`,
            predicted_vehicles: item.predicted_vehicles,
          }));

          setPredictions(formattedData);
        }

        // Overview Metrics
        if (overviewRes.ok) {
          const overviewData: TrafficOverview = await overviewRes.json();
          setTrafficOverview(overviewData);
        }

        // AI Insight
        if (insightRes.ok) {
          const insightData = await insightRes.json();
          setAiInsight(insightData.insight);
        }
      } catch (error) {
        console.error("Error fetching traffic data:", error);
        setAiInsight(
          "Traffic load is high. Monitoring major junctions and recommending adaptive signal control."
        );
      }
    };

    fetchTrafficData();
  }, []);

  return (
    <div className="space-y-6">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Traffic Analysis
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Deep dive into city congestion, speed limits, and ongoing incidents.
          </p>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground bg-white border border-border px-3 py-1.5 rounded-md shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
          </span>
          Live Sync Active
        </div>
      </header>

      {/* Primary Traffic Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Congestion Index"
          value={`${trafficOverview.congestion_index}%`}
          trend="4%"
          isPositive={false}
          icon={<Car className="w-5 h-5" />}
          accentColor="bg-alert"
        />

        <StatCard
          title="Average Speed"
          value={`${trafficOverview.average_speed} mph`}
          trend="2 mph"
          isPositive={true}
          icon={<Activity className="w-5 h-5" />}
          accentColor="bg-traffic"
        />

        <StatCard
          title="Active Hotspots"
          value={trafficOverview.active_hotspots.toString()}
          trend="3"
          isPositive={false}
          icon={<AlertOctagon className="w-5 h-5" />}
          accentColor="bg-pollution"
        />

        <StatCard
          title="Vehicles / Minute"
          value={trafficOverview.vehicles_per_minute.toString()}
          trend="120"
          isPositive={false}
          icon={<Navigation className="w-5 h-5" />}
          accentColor="bg-primary"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartCard
          title="Real-Time vs Historical Density"
          subtitle="Comparing today's congestion levels with yesterday's baseline."
          className="lg:col-span-2"
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trafficComparisonData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />

              <Area
                type="monotone"
                dataKey="yesterday"
                stroke="#9CA3AF"
                fill="#E5E7EB"
              />

              <Area
                type="monotone"
                dataKey="today"
                stroke="#2563EB"
                fill="#BFDBFE"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Active Incidents by Zone"
          subtitle="Breakdown of roadblocks causing delays."
        >
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart layout="vertical" data={incidentData}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" />
              <YAxis dataKey="zone" type="category" />
              <Tooltip />
              <Legend />

              <Bar dataKey="accidents" stackId="a" fill="#EF4444" />
              <Bar dataKey="construction" stackId="a" fill="#F59E0B" />
              <Bar dataKey="events" stackId="a" fill="#8B5CF6" />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Prediction Chart */}
      <ChartCard
        title="Predicted Traffic (Next Hour)"
        subtitle="AI-driven forecast of vehicle volume for each main junction."
      >
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={predictions}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="junction" />
              <YAxis />
              <Tooltip />

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

      {/* AI Recommendation Panel */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-indigo-100 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <div className="bg-white p-3 rounded-full shadow-sm border border-indigo-100">
            <Car className="w-6 h-6 text-indigo-600" />
          </div>

          <div>
            <h3 className="font-semibold text-lg text-slate-900 mb-1">
              AI Logistics Recommendation
            </h3>

            <p className="text-slate-700 leading-relaxed max-w-4xl">
              {aiInsight}
            </p>

            <div className="mt-4 flex gap-3">
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium text-sm">
                Initiate Lane Reversal
              </button>

              <button className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-4 py-2 rounded-md font-medium text-sm">
                View Predictive Simulation
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}