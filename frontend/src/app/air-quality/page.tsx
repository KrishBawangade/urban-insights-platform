"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Droplets, Thermometer, Wind } from "lucide-react";
import {
  Bar,
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

type WeatherSnapshot = {
  city: string;
  lat: string;
  lon: string;
  temperature: number;
  humidity: number;
  source: string;
};

type AirQualitySnapshot = {
  lat: string;
  lon: string;
  aqi: number;
  aqi_label: string;
  dominant_pollutant?: string;
  sub_indices?: Record<string, number>;
  components: {
    pm2_5?: number;
    pm10?: number;
    no2?: number;
    o3?: number;
    so2?: number;
    co?: number;
  };
  pollutant_breakdown: Array<{
    name: string;
    value: number;
    threshold: number;
  }>;
  source: string;
};

type AirQualityForecast = {
  forecast: Array<{
    time: number;
    aqi: number;
    aqi_label: string;
    dominant_pollutant: string;
    pm25: number;
    pm10: number;
    no2: number;
  }>;
};

function getAqiTheme(aqi?: number) {
  if (aqi === undefined) {
    return {
      accentColor: "bg-pollution",
      badgeClassName: "bg-muted/40 text-muted-foreground",
      panelClassName: "border-border bg-card",
      iconShellClassName: "border-border bg-white",
      iconClassName: "text-pollution",
      headlineClassName: "text-foreground",
      emphasisClassName: "text-pollution",
    };
  }

  if (aqi <= 50) {
    return {
      accentColor: "bg-emerald-500",
      badgeClassName: "bg-emerald-100 text-emerald-700",
      panelClassName: "border-emerald-200 bg-gradient-to-r from-emerald-50 to-lime-50",
      iconShellClassName: "border-emerald-200 bg-white",
      iconClassName: "text-emerald-600",
      headlineClassName: "text-emerald-900",
      emphasisClassName: "text-emerald-700",
    };
  }

  if (aqi <= 100) {
    return {
      accentColor: "bg-yellow-400",
      badgeClassName: "bg-yellow-100 text-yellow-800",
      panelClassName: "border-yellow-200 bg-gradient-to-r from-yellow-50 to-amber-50",
      iconShellClassName: "border-yellow-200 bg-white",
      iconClassName: "text-yellow-700",
      headlineClassName: "text-yellow-900",
      emphasisClassName: "text-yellow-700",
    };
  }

  if (aqi <= 150) {
    return {
      accentColor: "bg-orange-500",
      badgeClassName: "bg-orange-100 text-orange-700",
      panelClassName: "border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50",
      iconShellClassName: "border-orange-200 bg-white",
      iconClassName: "text-orange-600",
      headlineClassName: "text-orange-900",
      emphasisClassName: "text-orange-700",
    };
  }

  if (aqi <= 200) {
    return {
      accentColor: "bg-red-500",
      badgeClassName: "bg-red-100 text-red-700",
      panelClassName: "border-red-200 bg-gradient-to-r from-red-50 to-orange-50",
      iconShellClassName: "border-red-200 bg-white",
      iconClassName: "text-red-600",
      headlineClassName: "text-red-900",
      emphasisClassName: "text-red-700",
    };
  }

  if (aqi <= 300) {
    return {
      accentColor: "bg-fuchsia-600",
      badgeClassName: "bg-fuchsia-100 text-fuchsia-700",
      panelClassName: "border-fuchsia-200 bg-gradient-to-r from-fuchsia-50 to-rose-50",
      iconShellClassName: "border-fuchsia-200 bg-white",
      iconClassName: "text-fuchsia-600",
      headlineClassName: "text-fuchsia-900",
      emphasisClassName: "text-fuchsia-700",
    };
  }

  return {
    accentColor: "bg-slate-700",
    badgeClassName: "bg-slate-200 text-slate-800",
    panelClassName: "border-slate-300 bg-gradient-to-r from-slate-100 to-stone-200",
    iconShellClassName: "border-slate-300 bg-white",
    iconClassName: "text-slate-700",
    headlineClassName: "text-slate-900",
    emphasisClassName: "text-slate-800",
  };
}

function formatPollutantName(pollutant?: string) {
  if (!pollutant) return "Unknown";

  const labels: Record<string, string> = {
    pm2_5: "PM2.5",
    pm10: "PM10",
    no2: "NO2",
    so2: "SO2",
    co: "CO",
    o3: "O3",
  };

  return labels[pollutant] ?? pollutant.toUpperCase();
}

function formatForecastTime(unixTimestamp: number) {
  return new Date(unixTimestamp * 1000).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatForecastDate(unixTimestamp: number) {
  return new Date(unixTimestamp * 1000).toLocaleDateString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export default function AirQualityPage() {
  const [weatherData, setWeatherData] = useState<WeatherSnapshot | null>(null);
  const [airQualityData, setAirQualityData] = useState<AirQualitySnapshot | null>(null);
  const [forecastData, setForecastData] = useState<
    Array<{ time: string; date: string; aqi: number; aqiLabel: string; dominantPollutant: string; pm25: number; pm10: number; no2: number }>
  >([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchAirQualityDashboard = async () => {
      try {
        const [weatherResponse, airQualityResponse, forecastResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/air-quality/weather`),
          fetch(`${API_BASE_URL}/air-quality/current`),
          fetch(`${API_BASE_URL}/air-quality/forecast?hours=8`),
        ]);

        if (!weatherResponse.ok || !airQualityResponse.ok || !forecastResponse.ok) {
          throw new Error("Air quality request failed.");
        }

        const weatherPayload: WeatherSnapshot = await weatherResponse.json();
        const airQualityPayload: AirQualitySnapshot = await airQualityResponse.json();
        const forecastPayload: AirQualityForecast = await forecastResponse.json();

        setWeatherData(weatherPayload);
        setAirQualityData(airQualityPayload);
        setForecastData(
          forecastPayload.forecast.map((entry) => ({
            time: formatForecastTime(entry.time),
            date: formatForecastDate(entry.time),
            aqi: entry.aqi,
            aqiLabel: entry.aqi_label,
            dominantPollutant: entry.dominant_pollutant,
            pm25: Number(entry.pm25.toFixed(1)),
            pm10: Number(entry.pm10.toFixed(1)),
            no2: Number(entry.no2.toFixed(1)),
          })),
        );
        setErrorMessage(null);
      } catch (error) {
        console.error("Failed to fetch air quality dashboard data:", error);
        setErrorMessage("Live weather or AQI data unavailable");
      }
    };

    fetchAirQualityDashboard();
  }, []);

  const pollutantBreakdown = airQualityData?.pollutant_breakdown ?? [];
  const pm25Value = airQualityData?.components.pm2_5 ?? 0;
  const peakForecastPoint = forecastData.reduce<(typeof forecastData)[number] | null>(
    (highest, entry) => {
      if (!highest || entry.aqi > highest.aqi) {
        return entry;
      }

      return highest;
    },
    null,
  );
  const averageForecastAqi =
    forecastData.length > 0
      ? (forecastData.reduce((sum, entry) => sum + entry.aqi, 0) / forecastData.length).toFixed(1)
      : null;
  const currentAqiTheme = getAqiTheme(airQualityData?.aqi);

  return (
    <div className="space-y-6">
      <header className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Environmental & Air Quality</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Real-time monitoring of pollutants, temperature, and atmospheric conditions.
          </p>
        </div>
        <div className="flex w-fit items-center gap-2 rounded-full border border-success/20 bg-success/10 px-3 py-1.5 text-sm font-medium text-success shadow-sm">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75"></span>
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-success"></span>
          </span>
          <span>OpenWeather Live Feed</span>
        </div>
      </header>

      <div className="flex flex-wrap items-center gap-3 text-sm">
        <span className="rounded-full border border-border bg-card px-3 py-1.5 text-muted-foreground">
          Weather Source: {weatherData?.source ?? "OpenWeather Live Data"}
        </span>
        <span className="rounded-full border border-border bg-card px-3 py-1.5 text-muted-foreground">
          AQI Source: {airQualityData?.source ?? "OpenWeather Air Pollution API"}
        </span>
        <span className="rounded-full border border-border bg-card px-3 py-1.5 text-muted-foreground">
          City: {weatherData?.city ?? "Nagpur"}
        </span>
        <span className="rounded-full border border-border bg-card px-3 py-1.5 text-muted-foreground">
          Coordinates: {weatherData ? `${weatherData.lat}, ${weatherData.lon}` : "21.1458, 79.0882"}
        </span>
        {errorMessage && (
          <span className="rounded-full border border-danger/20 bg-danger/10 px-3 py-1.5 text-danger">
            {errorMessage}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Air Quality Index (AQI)"
          value={airQualityData ? airQualityData.aqi : "--"}
          trend={airQualityData?.aqi_label}
          isPositive={false}
          icon={<Wind className="h-5 w-5" />}
          accentColor={currentAqiTheme.accentColor}
          trendClassName={currentAqiTheme.badgeClassName}
          showTrendArrow={false}
        />
        <StatCard
          title="PM2.5 Level"
          value={airQualityData ? `${pm25Value.toFixed(1)} ug/m3` : "--"}
          trend={airQualityData ? airQualityData.aqi_label : undefined}
          isPositive={false}
          icon={<AlertTriangle className="h-5 w-5" />}
          accentColor="bg-alert"
        />
        <StatCard
          title="Average Temperature"
          value={weatherData ? `${weatherData.temperature.toFixed(1)} C` : "--"}
          isPositive={true}
          icon={<Thermometer className="h-5 w-5" />}
          accentColor="bg-traffic"
        />
        <StatCard
          title="Humidity"
          value={weatherData ? `${weatherData.humidity}%` : "--"}
          isPositive={true}
          icon={<Droplets className="h-5 w-5" />}
          accentColor="bg-primary"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <ChartCard
          title="AQI Forecast"
          subtitle="Hourly forecast using interpolated pollutant sub-indices for the next 8 hours."
          className="lg:col-span-2"
        >
          <div className="flex h-full flex-col gap-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-border bg-muted/30 px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Peak AQI</p>
                <p className="mt-1 text-xl font-semibold text-foreground">
                  {peakForecastPoint ? peakForecastPoint.aqi : "--"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {peakForecastPoint
                    ? `${peakForecastPoint.aqiLabel} on ${peakForecastPoint.date} at ${peakForecastPoint.time}`
                    : "Waiting for forecast"}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {peakForecastPoint
                    ? `Driven mainly by ${formatPollutantName(peakForecastPoint.dominantPollutant)}`
                    : "Dominant pollutant will appear here"}
                </p>
              </div>
              <div className="rounded-lg border border-border bg-muted/30 px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Average AQI</p>
                <p className="mt-1 text-xl font-semibold text-foreground">{averageForecastAqi ?? "--"}</p>
                <p className="text-sm text-muted-foreground">Across the next 8 hourly forecast points</p>
              </div>
              <div className="rounded-lg border border-border bg-muted/30 px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Peak PM2.5</p>
                <p className="mt-1 text-xl font-semibold text-foreground">
                  {peakForecastPoint ? `${peakForecastPoint.pm25.toFixed(1)} ug/m3` : "--"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {peakForecastPoint ? `Expected around ${peakForecastPoint.time}` : "Waiting for forecast"}
                </p>
              </div>
            </div>
            <div className="min-h-0 flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={forecastData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: "#6B7280", fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "#6B7280", fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                  <Line type="monotone" dataKey="aqi" name="AQI" stroke="#F59E0B" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="pm25" name="PM 2.5" stroke="#EF4444" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="pm10" name="PM10" stroke="#0EA5E9" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="no2" name="NO2" stroke="#8B5CF6" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </ChartCard>

        <ChartCard
          title="Current Pollutants vs Safe Limits"
          subtitle="Live pollutant concentrations compared to safe reference thresholds."
          className="lg:col-span-1"
        >
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart layout="vertical" data={pollutantBreakdown} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
              <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "#6B7280", fontSize: 12 }} />
              <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: "#6B7280", fontSize: 12 }} />
              <Tooltip
                cursor={{ fill: "#F5F7FB" }}
                contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
              />
              <Legend verticalAlign="top" height={36} iconType="circle" />
              <Bar dataKey="value" name="Current Level" fill="#3B82F6" radius={[0, 4, 4, 0]} barSize={20} />
              <Line
                dataKey="threshold"
                name="Safe Limit"
                stroke="#EF4444"
                strokeWidth={0}
                dot={{ r: 4, fill: "#EF4444", strokeWidth: 2, stroke: "#FFFFFF" }}
                activeDot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className={`rounded-lg border p-6 ${currentAqiTheme.panelClassName}`}>
        <div className="flex items-start gap-4">
          <div className={`rounded-full border p-3 shadow-sm ${currentAqiTheme.iconShellClassName}`}>
            <Wind className={`h-6 w-6 ${currentAqiTheme.iconClassName}`} />
          </div>
          <div>
            <div className={`mb-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${currentAqiTheme.badgeClassName}`}>
              {airQualityData?.aqi_label ?? "Waiting for live data"}
            </div>
            <h3 className={`mb-1 text-lg font-semibold ${currentAqiTheme.headlineClassName}`}>
              Air Quality Status: {airQualityData?.aqi_label ?? "Waiting for live data"}
            </h3>
            <p className="max-w-4xl leading-relaxed text-slate-700">
              Current PM2.5 is <strong className={currentAqiTheme.emphasisClassName}>{airQualityData ? `${pm25Value.toFixed(1)} ug/m3` : "--"}</strong> and AQI is <strong className={currentAqiTheme.emphasisClassName}>{airQualityData?.aqi ?? "--"}</strong>. {airQualityData?.dominant_pollutant ? `${formatPollutantName(airQualityData.dominant_pollutant)} is the dominant pollutant contributing most to current AQI levels.` : "This panel is waiting for the dominant pollutant calculation."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
