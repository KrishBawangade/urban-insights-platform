"use client";

import StatCard from "@/components/dashboard/StatCard";
import ChartCard from "@/components/dashboard/ChartCard";
import { Car, Navigation, AlertOctagon, Activity } from "lucide-react";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  AreaChart, Area, ComposedChart, Bar
} from 'recharts';

const trafficComparisonData = [
  { time: '06:00', today: 30, yesterday: 25 },
  { time: '08:00', today: 85, yesterday: 80 },
  { time: '10:00', today: 65, yesterday: 75 },
  { time: '12:00', today: 70, yesterday: 65 },
  { time: '14:00', today: 60, yesterday: 55 },
  { time: '16:00', today: 80, yesterday: 85 },
  { time: '18:00', today: 95, yesterday: 90 },
  { time: '20:00', today: 50, yesterday: 60 },
];

const incidentData = [
  { zone: 'North', accidents: 2, construction: 5, events: 0 },
  { zone: 'South', accidents: 1, construction: 2, events: 1 },
  { zone: 'East', accidents: 4, construction: 0, events: 2 },
  { zone: 'West', accidents: 0, construction: 3, events: 0 },
  { zone: 'Downtown', accidents: 5, construction: 8, events: 3 },
];

export default function TrafficPage() {
  return (
    <div className="space-y-6">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Traffic Analysis</h1>
          <p className="text-muted-foreground mt-1 text-sm">Deep dive into city congestion, speed limits, and ongoing incidents.</p>
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
          value="82%" 
          trend="4%" 
          isPositive={false}
          icon={<Car className="w-5 h-5" />}
          accentColor="bg-alert"
        />
        <StatCard 
          title="Average Speed" 
          value="24 mph" 
          trend="2 mph" 
          isPositive={true}
          icon={<Activity className="w-5 h-5" />}
          accentColor="bg-traffic"
        />
        <StatCard 
          title="Active Hotspots" 
          value="12" 
          trend="3" 
          isPositive={false}
          icon={<AlertOctagon className="w-5 h-5" />}
          accentColor="bg-pollution"
        />
        <StatCard 
          title="Vehicles / Minute" 
          value="1,450" 
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
            <AreaChart data={trafficComparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorToday" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorYesterday" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#9CA3AF" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#9CA3AF" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Legend verticalAlign="top" height={36} iconType="circle" />
              <Area type="monotone" dataKey="yesterday" name="Yesterday Baseline" stroke="#9CA3AF" strokeWidth={2} fillOpacity={1} fill="url(#colorYesterday)" />
              <Area type="monotone" dataKey="today" name="Today" stroke="#2563EB" strokeWidth={3} fillOpacity={1} fill="url(#colorToday)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard 
          title="Active Incidents by Zone" 
          subtitle="Breakdown of roadblocks causing delays."
          className="lg:col-span-1"
        >
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart layout="vertical" data={incidentData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
              <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} />
              <YAxis dataKey="zone" type="category" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} />
              <Tooltip 
                cursor={{fill: '#F5F7FB'}}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Legend verticalAlign="top" height={36} iconType="circle" />
              <Bar dataKey="accidents" name="Accidents" stackId="a" fill="#EF4444" radius={[0, 0, 0, 0]} />
              <Bar dataKey="construction" name="Construction" stackId="a" fill="#F59E0B" radius={[0, 0, 0, 0]} />
              <Bar dataKey="events" name="Events" stackId="a" fill="#8B5CF6" radius={[0, 4, 4, 0]} />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Traffic Specific Insight Panel */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-indigo-100 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <div className="bg-white p-3 rounded-full shadow-sm border border-indigo-100">
            <Car className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-slate-900 mb-1">AI Logistics Recommendation</h3>
            <p className="text-slate-700 leading-relaxed max-w-4xl">
              Based on the current trajectory of the Downtown congestion (growing at 14% per hour), we suggest enabling the <strong className="text-indigo-600">Dynamic Lane Reversal</strong> on Highway 101 Southbound for the next 2 hours. This is predicted to relieve congestion by 22% and improve average speeds by 8 mph.
            </p>
            <div className="mt-4 flex gap-3">
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium text-sm transition-colors shadow-sm">
                Initiate Lane Reversal
              </button>
              <button className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-4 py-2 rounded-md font-medium text-sm transition-colors shadow-sm">
                View Predictive Simulation
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
