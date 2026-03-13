import { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  trend?: string;
  isPositive?: boolean;
  icon: ReactNode;
  accentColor?: string;
  trendClassName?: string;
  showTrendArrow?: boolean;
}

export default function StatCard({
  title,
  value,
  trend,
  isPositive = true,
  icon,
  accentColor = "bg-primary",
  trendClassName,
  showTrendArrow = true,
}: StatCardProps) {
  const defaultTrendClassName = isPositive ? "bg-success/10 text-success" : "bg-danger/10 text-danger";

  return (
    <div className="bg-card p-6 rounded-lg border border-border shadow-sm flex flex-col relative overflow-hidden">
      <div className={`absolute top-0 left-0 right-0 h-1 ${accentColor}`} />

      <div className="flex justify-between items-start mb-4">
        <h3 className="text-muted-foreground font-medium text-sm">{title}</h3>
        <div className={`p-2 rounded-md ${accentColor}/10 text-${accentColor.replace("bg-", "")}`}>
          {icon}
        </div>
      </div>

      <div className="flex items-baseline gap-2">
        <h2 className="text-3xl font-bold text-foreground">{value}</h2>
        {trend && (
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${trendClassName ?? defaultTrendClassName}`}>
            {showTrendArrow ? (isPositive ? "+" : "↓") : ""}
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}
