"use client";

import StatCard from "@/components/dashboard/StatCard";
import ChartCard from "@/components/dashboard/ChartCard";
import { Zap, Battery, Power, AlertCircle } from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell
} from 'recharts';

const powerDrawData = [
  { time: '00:00', draw: 420, capacity: 800 },
  { time: '04:00', draw: 380, capacity: 800 },
  { time: '08:00', draw: 650, capacity: 800 },
  { time: '12:00', draw: 740, capacity: 800 },
  { time: '16:00', draw: 780, capacity: 800 },
  { time: '20:00', draw: 690, capacity: 800 },
];

const sourceBreakdown = [
  { name: 'Solar', value: 35 },
  { name: 'Wind', value: 25 },
  { name: 'Hydro', value: 15 },
  { name: 'Natural Gas', value: 20 },
  { name: 'Coal', value: 5 },
];

const COLORS = ['#F59E0B', '#10B981', '#3B82F6', '#64748B', '#1E293B'];

export default function EnergyPage() {
  return (
    <div className="space-y-6">
      <header className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Energy & Grid Management</h1>
          <p className="text-muted-foreground mt-1 text-sm">Monitor city-wide power consumption, load balancing, and renewable sources.</p>
        </div>
        <div className="flex items-center gap-2 text-sm font-medium text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full shadow-sm w-fit">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
          </span>
          <span>Grid Active & Syncing</span>
        </div>
      </header>

      {/* Primary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Current Grid Load" 
          value="84%" 
          trend="1.2%" 
          isPositive={false}
          icon={<Zap className="w-5 h-5" />}
          accentColor="bg-amber-500"
        />
        <StatCard 
          title="Renewable Output" 
          value="75%" 
          trend="4.5%" 
          isPositive={true}
          icon={<Power className="w-5 h-5" />}
          accentColor="bg-success"
        />
        <StatCard 
          title="Battery Reserves" 
          value="92%" 
          trend="0.5%" 
          isPositive={true}
          icon={<Battery className="w-5 h-5" />}
          accentColor="bg-primary"
        />
        <StatCard 
          title="Active Outages" 
          value="2" 
          trend="1" 
          isPositive={false}
          icon={<AlertCircle className="w-5 h-5" />}
          accentColor="bg-alert"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartCard 
          title="24h Power Draw vs Capacity" 
          subtitle="Hourly demand (MW) against total grid generation capacity."
          className="lg:col-span-2"
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={powerDrawData} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
              <defs>
                <linearGradient id="colorDraw" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                formatter={(value: number) => [`${value} MW`, undefined]}
              />
              <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ paddingTop: "20px" }} />
              <Area type="monotone" dataKey="capacity" name="Total Capacity (MW)" stroke="#9CA3AF" strokeWidth={2} strokeDasharray="5 5" fill="none" />
              <Area type="monotone" dataKey="draw" name="Actual Draw (MW)" stroke="#F59E0B" strokeWidth={3} fillOpacity={1} fill="url(#colorDraw)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard 
          title="Energy Mix Breakdown" 
          subtitle="Current distribution of generation sources."
          className="lg:col-span-1"
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 10, right: 10, bottom: 20, left: 10 }}>
              <Pie
                data={sourceBreakdown}
                cx="50%"
                cy="45%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {sourceBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                formatter={(value: number) => [`${value}%`, undefined]}
              />
              <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ paddingTop: "20px" }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Energy Specific Insight Panel */}
      <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-amber-200 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <div className="bg-white p-3 rounded-full shadow-sm border border-amber-200">
            <Zap className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-slate-900 mb-1">Peak Load AI Prediction</h3>
            <p className="text-slate-700 leading-relaxed max-w-4xl">
              Grid ML-models predict a <strong>Critical Load event at 17:00</strong> due to residential EV charging spikes combined with a heatwave. Recommendation: <strong className="text-amber-700">Pre-cool municipal buildings</strong> now to reduce overall load by 4%, and schedule battery storage discharge to begin at 16:30.
            </p>
            <div className="mt-4 flex gap-3">
              <button className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-md font-medium text-sm transition-colors shadow-sm">
                Activate Demand Response
              </button>
              <button className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-4 py-2 rounded-md font-medium text-sm transition-colors shadow-sm">
                View Load Balancer
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
