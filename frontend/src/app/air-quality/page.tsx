"use client";

import StatCard from "@/components/dashboard/StatCard";
import ChartCard from "@/components/dashboard/ChartCard";
import { Wind, Thermometer, Droplets, AlertTriangle } from "lucide-react";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  AreaChart, Area, ComposedChart, Bar
} from 'recharts';

const aqiTrendsData = [
  { time: '06:00', aqi: 45, pm25: 12, no2: 15 },
  { time: '08:00', aqi: 82, pm25: 35, no2: 42 },
  { time: '10:00', aqi: 95, pm25: 45, no2: 50 },
  { time: '12:00', aqi: 88, pm25: 38, no2: 46 },
  { time: '14:00', aqi: 110, pm25: 55, no2: 60 },
  { time: '16:00', aqi: 125, pm25: 65, no2: 70 },
  { time: '18:00', aqi: 105, pm25: 50, no2: 55 },
  { time: '20:00', aqi: 75, pm25: 25, no2: 30 },
];

const pollutantBreakdown = [
  { name: 'PM2.5', value: 45, threshold: 35 },
  { name: 'PM10', value: 65, threshold: 50 },
  { name: 'O3', value: 80, threshold: 100 },
  { name: 'NO2', value: 55, threshold: 40 },
  { name: 'SO2', value: 15, threshold: 20 },
];

export default function AirQualityPage() {
  return (
    <div className="space-y-6">
      <header className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Environmental & Air Quality</h1>
          <p className="text-muted-foreground mt-1 text-sm">Real-time monitoring of pollutants, temperature, and atmospheric conditions.</p>
        </div>
        <div className="flex items-center gap-2 text-sm font-medium text-success bg-success/10 border border-success/20 px-3 py-1.5 rounded-full shadow-sm w-fit">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-success"></span>
          </span>
          <span>42/42 Sensors Online</span>
        </div>
      </header>

      {/* Primary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Air Quality Index (AQI)" 
          value="110" 
          trend="15" 
          isPositive={false}
          icon={<Wind className="w-5 h-5" />}
          accentColor="bg-pollution"
        />
        <StatCard 
          title="PM2.5 Level" 
          value="55 µg/m³" 
          trend="12 µg/m³" 
          isPositive={false}
          icon={<AlertTriangle className="w-5 h-5" />}
          accentColor="bg-alert"
        />
        <StatCard 
          title="Average Temperature" 
          value="72°F" 
          trend="2°F" 
          isPositive={true}
          icon={<Thermometer className="w-5 h-5" />}
          accentColor="bg-traffic"
        />
        <StatCard 
          title="Humidity" 
          value="45%" 
          trend="5%" 
          isPositive={true}
          icon={<Droplets className="w-5 h-5" />}
          accentColor="bg-primary"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartCard 
          title="Today's AQI & Pollutant Trends" 
          subtitle="Hourly progression of overall AQI compared to key pollutants."
          className="lg:col-span-2"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={aqiTrendsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Legend verticalAlign="top" height={36} iconType="circle" />
              <Line type="monotone" dataKey="aqi" name="Overall AQI" stroke="#F59E0B" strokeWidth={3} dot={{r:4}} activeDot={{r:6}} />
              <Line type="monotone" dataKey="pm25" name="PM 2.5" stroke="#EF4444" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="no2" name="NO2" stroke="#8B5CF6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard 
          title="Current Pollutants vs Safe Limits" 
          subtitle="Real-time levels compared to WHO thresholds."
          className="lg:col-span-1"
        >
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart layout="vertical" data={pollutantBreakdown} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
              <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} />
              <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} />
              <Tooltip 
                cursor={{fill: '#F5F7FB'}}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Legend verticalAlign="top" height={36} iconType="circle" />
              <Bar dataKey="value" name="Current Level" fill="#3B82F6" radius={[0, 4, 4, 0]} barSize={20} />
              <Line dataKey="threshold" name="Safe Limit" stroke="#EF4444" strokeWidth={0} dot={{ r: 4, fill: '#EF4444', strokeWidth: 2, stroke: '#FFFFFF' }} activeDot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Environmental Specific Insight Panel */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <div className="bg-white p-3 rounded-full shadow-sm border border-amber-200">
            <Wind className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-slate-900 mb-1">Environmental Warning: Industrial Sector Active</h3>
            <p className="text-slate-700 leading-relaxed max-w-4xl">
              PM 2.5 Levels in the East Industrial Zone have exceeded the safe threshold by <strong className="text-amber-600">55%</strong> over the last 3 hours. Due to current wind patterns heading West towards residential areas, an <strong className="text-red-600">elevated health advisory</strong> is recommended for vulnerable groups.
            </p>
            <div className="mt-4 flex gap-3">
              <button className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-md font-medium text-sm transition-colors shadow-sm">
                Issue Public Advisory
              </button>
              <button className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-4 py-2 rounded-md font-medium text-sm transition-colors shadow-sm">
                Contact Facilities
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
