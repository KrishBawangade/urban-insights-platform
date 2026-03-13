"use client";

import StatCard from "@/components/dashboard/StatCard";
import ChartCard from "@/components/dashboard/ChartCard";
import InsightPanel from "@/components/dashboard/InsightPanel";
import { Car, Wind, Users, AlertTriangle, Zap } from "lucide-react";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend
} from 'recharts';
import { useState, useEffect } from 'react';

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
  const [trafficOverview, setTrafficOverview] = useState({
    congestion_index: 0,
    average_speed: 0,
    active_hotspots: 0,
    vehicles_per_minute: 0
  });
  
  const [trafficTrendData, setTrafficTrendData] = useState(trafficData);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [overviewRes, trendRes] = await Promise.all([
          fetch('http://127.0.0.1:8000/traffic/overview'),
          fetch('http://127.0.0.1:8000/traffic/hourly-trend')
        ]);
        
        if (overviewRes.ok) {
          const overviewData = await overviewRes.json();
          setTrafficOverview(overviewData);
        }
        
        if (trendRes.ok) {
          const trendData = await trendRes.json();
          // Format from { hour: 6, vehicles: 120 } to { time: '06:00', density: 120 }
          const formattedTrendData = trendData.map((item: {hour: number, vehicles: number}) => ({
            time: `${item.hour.toString().padStart(2, '0')}:00`,
            density: item.vehicles
          }));
          setTrafficTrendData(formattedTrendData);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-6">
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">City Overview</h1>
        <p className="text-muted-foreground mt-1 text-sm">Real-time data and AI-driven insights for urban planning.</p>
      </header>

      {/* Primary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard 
          title="Avg. Traffic Density" 
          value={`${trafficOverview.congestion_index}%`} 
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
          title="City Grid Load" 
          value="84%" 
          trend="1.2%" 
          isPositive={false}
          icon={<Zap className="w-5 h-5" />}
          accentColor="bg-amber-500"
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
            <LineChart data={trafficTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
