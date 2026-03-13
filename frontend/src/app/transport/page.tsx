"use client";

import StatCard from "@/components/dashboard/StatCard";
import ChartCard from "@/components/dashboard/ChartCard";
import { Bus, Train, Clock, Users } from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  LineChart, Line
} from 'recharts';

const ridershipData = [
  { time: '06:00', bus: 12000, subway: 25000 },
  { time: '08:00', bus: 45000, subway: 85000 },
  { time: '10:00', bus: 28000, subway: 45000 },
  { time: '12:00', bus: 32000, subway: 50000 },
  { time: '14:00', bus: 30000, subway: 48000 },
  { time: '16:00', bus: 42000, subway: 75000 },
  { time: '18:00', bus: 55000, subway: 95000 },
  { time: '20:00', bus: 20000, subway: 35000 },
];

const delayData = [
  { line: 'Red Line', delay: 12 },
  { line: 'Blue Line', delay: 4 },
  { line: 'Green Line', delay: 2 },
  { line: 'Bus Route 14', delay: 18 },
  { line: 'Bus Route 22', delay: 5 },
];

export default function TransportPage() {
  return (
    <div className="space-y-6">
      <header className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Public Transport Network</h1>
          <p className="text-muted-foreground mt-1 text-sm">Monitor subway and bus ridership, network delays, and fleet status.</p>
        </div>
        <div className="flex items-center gap-2 text-sm font-medium text-primary bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-full shadow-sm w-fit">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
          </span>
          <span>Live Transit Sync</span>
        </div>
      </header>

      {/* Primary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Daily Ridership" 
          value="845.2K" 
          trend="4.2%" 
          isPositive={true}
          icon={<Users className="w-5 h-5" />}
          accentColor="bg-transport"
        />
        <StatCard 
          title="Active Bus Fleet" 
          value="1,240" 
          trend="12" 
          isPositive={true}
          icon={<Bus className="w-5 h-5" />}
          accentColor="bg-traffic"
        />
        <StatCard 
          title="Active Subway Trains" 
          value="142" 
          trend="0" 
          isPositive={true}
          icon={<Train className="w-5 h-5" />}
          accentColor="bg-primary"
        />
        <StatCard 
          title="System-Wide Avg Delay" 
          value="4.2 min" 
          trend="1.5 min" 
          isPositive={false}
          icon={<Clock className="w-5 h-5" />}
          accentColor="bg-alert"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartCard 
          title="Ridership by Mode" 
          subtitle="Hourly comparison of subway versus bus network utilization."
          className="lg:col-span-2"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={ridershipData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} tickFormatter={(value) => `${value / 1000}k`} />
              <Tooltip 
                cursor={{fill: '#F5F7FB'}}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                formatter={(value: number) => [value.toLocaleString(), undefined]}
              />
              <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ paddingTop: "20px" }} />
              <Bar dataKey="subway" name="Subway Network" fill="#2563EB" radius={[4, 4, 0, 0]} stackId="a" maxBarSize={50} />
              <Bar dataKey="bus" name="Bus Network" fill="#10B981" radius={[4, 4, 0, 0]} stackId="a" maxBarSize={50} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard 
          title="Live Network Delays" 
          subtitle="Current average delay (minutes) across major transit lines."
          className="lg:col-span-1"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart layout="vertical" data={delayData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
              <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} />
              <YAxis dataKey="line" type="category" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} width={80} />
              <Tooltip 
                cursor={{fill: '#F5F7FB'}}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                formatter={(value: number) => [`${value} min`, 'Current Delay']}
              />
              <Bar dataKey="delay" fill="#EF4444" radius={[0, 4, 4, 0]} barSize={24}>
                {
                  delayData.map((entry, index) => (
                    <cell key={`cell-${index}`} fill={entry.delay > 10 ? '#EF4444' : entry.delay > 5 ? '#F59E0B' : '#10B981'} />
                  ))
                }
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Transport Specific Insight Panel */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <div className="bg-white p-3 rounded-full shadow-sm border border-emerald-200">
            <Train className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-slate-900 mb-1">Transit Optimization Alert</h3>
            <p className="text-slate-700 leading-relaxed max-w-4xl">
              Spike in ridership detected at <strong className="text-emerald-700">Central Station (Red Line)</strong>. Current platform capacity is at 94%. We recommend <strong className="text-emerald-700">dispatching 2 standby trains</strong> from the downtown depot to alleviate the growing rush-hour load.
            </p>
            <div className="mt-4 flex gap-3">
              <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md font-medium text-sm transition-colors shadow-sm">
                Dispatch Standby Trains
              </button>
              <button className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-4 py-2 rounded-md font-medium text-sm transition-colors shadow-sm">
                Notify Station Security
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
