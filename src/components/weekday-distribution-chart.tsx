"use client";

import React, { useMemo } from "react";
import { TimelineDataPoint } from "./trend-line-graph";
import { Calendar, Flame, Zap } from "lucide-react";

interface WeekdayDistributionChartProps {
  timeline: TimelineDataPoint[];
  unit?: string;
  color?: string;
  title?: string;
  subtitle?: string;
}

export function WeekdayDistributionChart({
  timeline = [],
  unit = "mins",
  color = "#10B981",
  title = "Day-of-Week Focus Distribution",
  subtitle = "Historical productivity aggregated by day of the week",
}: WeekdayDistributionChartProps) {
  // Aggregate data by day of week (0 = Sunday, 1 = Monday ... 6 = Saturday)
  const daysSummary = useMemo(() => {
    const days = [
      { name: "Mon", full: "Monday", index: 1, total: 0, count: 0 },
      { name: "Tue", full: "Tuesday", index: 2, total: 0, count: 0 },
      { name: "Wed", full: "Wednesday", index: 3, total: 0, count: 0 },
      { name: "Thu", full: "Thursday", index: 4, total: 0, count: 0 },
      { name: "Fri", full: "Friday", index: 5, total: 0, count: 0 },
      { name: "Sat", full: "Saturday", index: 6, total: 0, count: 0 },
      { name: "Sun", full: "Sunday", index: 0, total: 0, count: 0 },
    ];

    const dayMap = new Map<number, (typeof days)[0]>();
    days.forEach((d) => dayMap.set(d.index, d));

    timeline.forEach((item) => {
      const parts = item.date.split("-").map(Number);
      const d = new Date(Date.UTC(parts[0] || 1970, (parts[1] || 1) - 1, parts[2] || 1));
      const dayIndex = d.getUTCDay();
      const target = dayMap.get(dayIndex);
      if (target && item.value > 0) {
        target.total += item.value;
        target.count += 1;
      }
    });

    const maxTotal = Math.max(...days.map((d) => d.total), 1);
    const overallTotal = days.reduce((acc, d) => acc + d.total, 0);

    const peakDay = days.reduce((prev, current) => (prev.total > current.total ? prev : current), days[0]!);

    return {
      days,
      maxTotal,
      overallTotal,
      peakDay,
    };
  }, [timeline]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h4 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-500" />
            {title}
          </h4>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">{subtitle}</p>
        </div>

        {daysSummary.overallTotal > 0 && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-zinc-400">Peak Day:</span>
            <span className="px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
              🔥 {daysSummary.peakDay.full} ({daysSummary.peakDay.total.toLocaleString()} {unit})
            </span>
          </div>
        )}
      </div>

      {/* Weekday Column Bars Grid */}
      <div className="grid grid-cols-7 gap-2 sm:gap-3 pt-2">
        {daysSummary.days.map((d) => {
          const percentage = daysSummary.maxTotal > 0 ? Math.round((d.total / daysSummary.maxTotal) * 100) : 0;
          const isPeak = d.name === daysSummary.peakDay.name && d.total > 0;

          return (
            <div
              key={d.name}
              className="flex flex-col items-center gap-2 p-2.5 sm:p-3 rounded-2xl bg-zinc-50/80 dark:bg-[#151926] border border-zinc-200/60 dark:border-white/[0.06] hover:border-emerald-500/40 transition-all text-center group cursor-pointer"
            >
              {/* Day Name */}
              <span
                className={`text-[11px] font-bold uppercase tracking-wider ${
                  isPeak ? "text-emerald-500 dark:text-emerald-400" : "text-zinc-500 dark:text-zinc-400"
                }`}
              >
                {d.name}
              </span>

              {/* Vertical Progress Bar Track */}
              <div className="w-full h-24 bg-zinc-200/60 dark:bg-white/[0.04] rounded-xl flex flex-col justify-end p-1 overflow-hidden">
                <div
                  className={`w-full rounded-lg transition-all duration-500 ${
                    isPeak
                      ? "bg-gradient-to-t from-emerald-500 to-teal-400 shadow-sm shadow-emerald-500/30"
                      : "bg-gradient-to-t from-blue-500/80 to-cyan-400/80"
                  }`}
                  style={{ height: `${Math.max(percentage, d.total > 0 ? 8 : 0)}%` }}
                />
              </div>

              {/* Day Total Value */}
              <div className="text-center min-w-0 w-full">
                <div className="text-xs font-black text-zinc-900 dark:text-white truncate">
                  {d.total > 0 ? d.total.toLocaleString() : "-"}
                </div>
                <div className="text-[10px] text-zinc-400 truncate">
                  {d.total > 0 ? unit : "no logs"}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
