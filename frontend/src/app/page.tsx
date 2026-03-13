"use client";

import StatCard from "@/components/dashboard/StatCard";
import ChartCard from "@/components/dashboard/ChartCard";
import InsightPanel from "@/components/dashboard/InsightPanel";
import { Car, Wind, Users, AlertTriangle } from "lucide-react";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend
} from 'recharts';

const trafficData = [
  { time: '06:00', density: 30 },
  { time: '08:00', density: 85 },
  { time: '10:00', density: 65 },
  { time: '12:00', density: 70 },
  { time: '14:00', density: 60 },
  { time: '16:00', density: 80 },
  { time: '18:00', density: 95 },
  { time: '20:00', density: 50 },
];

const pollutionData = [
  { day: 'Mon', aqi: 45 },
  { day: 'Tue', aqi: 52 },
  { day: 'Wed', aqi: 88 },
  { day: 'Thu', aqi: 105 },
  { day: 'Fri', aqi: 140 },
  { day: 'Sat', aqi: 90 },
  { day: 'Sun', aqi: 65 },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">City Overview</h1>
        <p className="text-muted-foreground mt-1 text-sm">Real-time data and AI-driven insights for urban planning.</p>
      </header>

      {/* Primary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Avg. Traffic Density" 
          value="72%" 
          trend="5.2%" 
          isPositive={false}
          icon={<Car className="w-5 h-5" />}
          accentColor="bg-traffic"
        />
        <StatCard 
          title="Air Quality Index (AQI)" 
          value="88" 
          trend="12" 
          isPositive={false}
          icon={<Wind className="w-5 h-5" />}
          accentColor="bg-pollution"
        />
        <StatCard 
          title="Public Transit Ridership" 
          value="142.5k" 
          trend="3.1%" 
          isPositive={true}
          icon={<Users className="w-5 h-5" />}
          accentColor="bg-transport"
        />
        <StatCard 
          title="Active Alerts" 
          value="4" 
          trend="2" 
          isPositive={false}
          icon={<AlertTriangle className="w-5 h-5" />}
          accentColor="bg-alert"
        />
      </div>

      {/* AI Intelligence Panel */}
      <InsightPanel />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard 
          title="Traffic Congestion Tracker" 
          subtitle="Real-time density across main arteries starting from 6 AM."
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trafficData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Line 
                type="monotone" 
                dataKey="density" 
                stroke="#3B82F6" 
                strokeWidth={3}
                dot={{ r: 4, fill: '#3B82F6', strokeWidth: 0 }}
                activeDot={{ r: 6, fill: '#2563EB' }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard 
          title="7-Day Air Quality Forecast" 
          subtitle="Predicted AQI levels based on historical data & ML models."
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={pollutionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} />
              <Tooltip 
                cursor={{fill: '#F5F7FB'}}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Bar 
                dataKey="aqi" 
                fill="#F59E0B" 
                radius={[4, 4, 0, 0]} 
                maxBarSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}
