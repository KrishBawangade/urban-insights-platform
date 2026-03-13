"use client";

import { BrainCircuit } from "lucide-react";

interface InsightPanelProps {
  title?: string;
  badgeLabel?: string;
  summary: string;
  actions?: string[];
}

export default function InsightPanel({
  title = "AI Priority Insight",
  badgeLabel = "Live Analysis",
  summary,
  actions = [],
}: InsightPanelProps) {
  return (
    <div className="bg-insight/10 border border-insight/30 rounded-lg p-6 relative overflow-hidden">
      <div className="flex gap-4">
        <div className="hidden sm:flex bg-insight/20 p-3 rounded-xl h-fit items-center justify-center">
          <BrainCircuit className="w-6 h-6 text-insight" />
        </div>

        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-lg text-foreground">{title}</h3>
            <span className="bg-insight text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">
              {badgeLabel}
            </span>
          </div>

          <p className="text-foreground leading-relaxed">{summary}</p>

          {actions.length > 0 && (
            <div className="mt-4 pt-4 border-t border-insight/20 flex flex-col sm:flex-row gap-3">
              <span className="text-sm text-muted-foreground font-medium">Recommended Actions:</span>
              <div className="flex flex-wrap gap-2 text-sm">
                {actions.map((action) => (
                  <span key={action} className="bg-card border border-border px-3 py-1 rounded-full text-foreground shadow-sm">
                    {action}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="absolute -top-12 -right-12 w-32 h-32 bg-insight/20 blur-3xl rounded-full pointer-events-none" />
    </div>
  );
}
