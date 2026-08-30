"use client";

import React, { useState, useMemo, useRef, useCallback } from "react";
import { TrendingUp, Award, Flame, Calendar, Clock, Target } from "lucide-react";

export interface TimelineDataPoint {
  date: string;
  value: number;
  target?: number;
  isCompleted?: boolean;
}

interface TrendLineGraphProps {
  data: TimelineDataPoint[];
  unit?: string;
  color?: string;
  targetValue?: number;
  title?: string;
  subtitle?: string;
  height?: number;
  showTimeframes?: boolean;
  emptyMessage?: string;
}

export function TrendLineGraph({
  data = [],
  unit = "units",
  color = "#10B981",
  targetValue = 0,
  title,
  subtitle,
  height = 240,
  showTimeframes = true,
  emptyMessage = "No logs recorded in this timeframe yet",
}: TrendLineGraphProps) {
  const [timeframe, setTimeframe] = useState<"7D" | "14D" | "30D" | "90D" | "ALL">("14D");
  const [hoveredPoint, setHoveredPoint] = useState<{
    x: number;
    y: number;
    point: TimelineDataPoint;
    index: number;
  } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Filter data by timeframe
  const filteredData = useMemo(() => {
    if (!data || data.length === 0) return [];
    if (timeframe === "ALL") return data;

    const daysCount = timeframe === "7D" ? 7 : timeframe === "14D" ? 14 : timeframe === "30D" ? 30 : 90;

    // Generate continuous days leading up to today so the graph doesn't jump
    const result: TimelineDataPoint[] = [];
    const today = new Date();
    const dataMap = new Map<string, TimelineDataPoint>();
    data.forEach((d) => dataMap.set(d.date, d));

    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      if (dataMap.has(iso)) {
        result.push(dataMap.get(iso)!);
      } else {
        result.push({
          date: iso,
          value: 0,
          target: targetValue,
          isCompleted: false,
        });
      }
    }

    return result;
  }, [data, timeframe, targetValue]);

  // Compute metrics
  const { maxValue, avgValue, totalSum, completedDaysCount } = useMemo(() => {
    if (filteredData.length === 0) {
      return { maxValue: 0, avgValue: 0, totalSum: 0, completedDaysCount: 0 };
    }
    const values = filteredData.map((d) => d.value);
    const max = Math.max(...values, targetValue || 0, 5);
    const sum = values.reduce((acc, curr) => acc + curr, 0);
    const activePoints = values.filter((v) => v > 0);
    const avg = activePoints.length > 0 ? Number((sum / activePoints.length).toFixed(1)) : 0;
    const completed = filteredData.filter((d) => d.isCompleted || (targetValue > 0 && d.value >= targetValue)).length;

    return {
      maxValue: max,
      avgValue: avg,
      totalSum: sum,
      completedDaysCount: completed,
    };
  }, [filteredData, targetValue]);

  // SVG Dimensions & Padding
  const width = 800; // virtual canvas width
  const padLeft = 45;
  const padRight = 20;
  const padTop = 30;
  const padBottom = 35;
  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;

  // Scale functions
  const getY = useCallback(
    (val: number) => {
      const max = maxValue > 0 ? maxValue * 1.15 : 10;
      return padTop + chartH - (val / max) * chartH;
    },
    [maxValue, chartH, padTop]
  );

  const getX = useCallback(
    (index: number) => {
      if (filteredData.length <= 1) return padLeft + chartW / 2;
      return padLeft + (index / (filteredData.length - 1)) * chartW;
    },
    [filteredData.length, padLeft, chartW]
  );

  // Generate smooth cubic Bezier spline path
  const { linePath, areaPath, points } = useMemo(() => {
    if (filteredData.length === 0) return { linePath: "", areaPath: "", points: [] };

    const pts = filteredData.map((d, i) => ({
      x: getX(i),
      y: getY(d.value),
      data: d,
      index: i,
    }));

    if (pts.length === 1) {
      const p = pts[0]!;
      return {
        linePath: `M ${p.x} ${p.y}`,
        areaPath: `M ${p.x} ${p.y} L ${p.x} ${padTop + chartH} Z`,
        points: pts,
      };
    }

    // Cubic Bezier curve algorithm
    let dStr = `M ${pts[0]!.x} ${pts[0]!.y}`;

    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = i > 0 ? pts[i - 1]! : pts[i]!;
      const p1 = pts[i]!;
      const p2 = pts[i + 1]!;
      const p3 = i < pts.length - 2 ? pts[i + 2]! : p2;

      // Control points
      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      dStr += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }

    const firstPt = pts[0]!;
    const lastPt = pts[pts.length - 1]!;
    const baseLineY = padTop + chartH;
    const aStr = `${dStr} L ${lastPt.x} ${baseLineY} L ${firstPt.x} ${baseLineY} Z`;

    return {
      linePath: dStr,
      areaPath: aStr,
      points: pts,
    };
  }, [filteredData, getX, getY, padTop, chartH]);

  // Target Baseline Y Coordinate
  const targetY = targetValue > 0 ? getY(targetValue) : null;

  // Mouse hover event handler
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!containerRef.current || points.length === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const ratio = clientX / rect.width;
    const svgX = ratio * width;

    // Find closest data point
    let closest = points[0]!;
    let minDist = Math.abs(svgX - closest.x);

    for (let i = 1; i < points.length; i++) {
      const dist = Math.abs(svgX - points[i]!.x);
      if (dist < minDist) {
        minDist = dist;
        closest = points[i]!;
      }
    }

    setHoveredPoint({
      x: closest.x,
      y: closest.y,
      point: closest.data,
      index: closest.index,
    });
  };

  const handleMouseLeave = () => {
    setHoveredPoint(null);
  };

  const formatShortDate = (iso: string) => {
    const parts = iso.split("-");
    return `${parts[1]}/${parts[2]}`;
  };

  // Generate unique gradient IDs based on color
  const gradientId = useMemo(() => `trend-grad-${Math.random().toString(36).substr(2, 9)}`, []);

  return (
    <div ref={containerRef} className="space-y-4">
      {/* Top Header & Timeframe Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          {title && <h4 className="text-sm font-bold text-zinc-900 dark:text-white">{title}</h4>}
          {subtitle && <p className="text-xs text-zinc-500 dark:text-zinc-400">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-3">
          {/* Quick Stat Highlights */}
          <div className="flex items-center gap-3 text-xs">
            <span className="text-zinc-500 dark:text-zinc-400">
              Avg: <strong className="text-zinc-900 dark:text-white font-bold">{avgValue} {unit}</strong>
            </span>
            <span className="text-zinc-500 dark:text-zinc-400">
              Peak: <strong className="text-zinc-900 dark:text-white font-bold">{maxValue} {unit}</strong>
            </span>
          </div>

          {/* Timeframe Filter Buttons */}
          {showTimeframes && (
            <div className="flex items-center gap-1 bg-zinc-100 dark:bg-white/[0.04] p-0.5 rounded-xl border border-zinc-200/60 dark:border-white/[0.06]">
              {(["7D", "14D", "30D", "90D", "ALL"] as const).map((tf) => (
                <button
                  key={tf}
                  type="button"
                  onClick={() => setTimeframe(tf)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    timeframe === tf
                      ? "bg-white dark:bg-[#1c2234] text-zinc-900 dark:text-white shadow-xs"
                      : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* SVG Canvas Area */}
      <div className="relative w-full overflow-hidden select-none">
        {filteredData.length === 0 ? (
          <div
            style={{ height }}
            className="flex items-center justify-center text-xs text-zinc-400 font-medium"
          >
            {emptyMessage}
          </div>
        ) : (
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-auto overflow-visible cursor-crosshair"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity="0.35" />
                <stop offset="70%" stopColor={color} stopOpacity="0.05" />
                <stop offset="100%" stopColor={color} stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid Lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
              const y = padTop + chartH * (1 - pct);
              const val = Math.round(maxValue * pct);
              return (
                <g key={i}>
                  <line
                    x1={padLeft}
                    y1={y}
                    x2={width - padRight}
                    y2={y}
                    stroke="currentColor"
                    className="text-zinc-200/80 dark:text-white/[0.04]"
                    strokeDasharray={i === 0 ? "" : "3,3"}
                    strokeWidth="1"
                  />
                  <text
                    x={padLeft - 8}
                    y={y + 3}
                    textAnchor="end"
                    className="text-[10px] fill-zinc-400 font-medium"
                  >
                    {val}
                  </text>
                </g>
              );
            })}

            {/* Target Baseline Line */}
            {targetY !== null && targetY >= padTop && targetY <= padTop + chartH && (
              <g>
                <line
                  x1={padLeft}
                  y1={targetY}
                  x2={width - padRight}
                  y2={targetY}
                  stroke="#F59E0B"
                  strokeDasharray="4,4"
                  strokeWidth="1.5"
                  opacity="0.8"
                />
                <text
                  x={width - padRight}
                  y={targetY - 5}
                  textAnchor="end"
                  fill="#F59E0B"
                  className="text-[10px] font-bold"
                >
                  Target ({targetValue} {unit})
                </text>
              </g>
            )}

            {/* Area Fill Gradient Under Curve */}
            {areaPath && <path d={areaPath} fill={`url(#${gradientId})`} />}

            {/* Main Spline Curve Stroke */}
            {linePath && (
              <path
                d={linePath}
                fill="none"
                stroke={color}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Data Points (shown on hover or when few points) */}
            {points.map((p, i) => {
              const isSelected = hoveredPoint?.index === i;
              const isPassed = p.data.isCompleted || (targetValue > 0 && p.data.value >= targetValue);
              return (
                <circle
                  key={i}
                  cx={p.x}
                  cy={p.y}
                  r={isSelected ? 6 : p.data.value > 0 ? 3 : 2}
                  fill={isSelected ? "#FFFFFF" : isPassed ? "#10B981" : color}
                  stroke={isSelected ? color : "transparent"}
                  strokeWidth="2.5"
                  className="transition-all duration-150"
                />
              );
            })}

            {/* Vertical Crosshair Line on Hover */}
            {hoveredPoint && (
              <line
                x1={hoveredPoint.x}
                y1={padTop}
                x2={hoveredPoint.x}
                y2={padTop + chartH}
                stroke="currentColor"
                className="text-zinc-400/80 dark:text-white/30"
                strokeDasharray="2,2"
                strokeWidth="1.5"
              />
            )}

            {/* X-Axis Date Labels */}
            {points.map((p, i) => {
              // Only show every Nth label to prevent overlapping
              const step = points.length > 20 ? 5 : points.length > 10 ? 2 : 1;
              if (i % step !== 0 && i !== points.length - 1) return null;
              return (
                <text
                  key={i}
                  x={p.x}
                  y={padTop + chartH + 18}
                  textAnchor="middle"
                  className="text-[10px] fill-zinc-400 font-medium"
                >
                  {formatShortDate(p.data.date)}
                </text>
              );
            })}
          </svg>
        )}

        {/* Floating High-Contrast Hover Tooltip */}
        {hoveredPoint && (
          <div
            className="pointer-events-none absolute z-30 transition-all duration-75"
            style={{
              left: `${(hoveredPoint.x / width) * 100}%`,
              top: `${(hoveredPoint.y / height) * 100}%`,
              transform: "translate(-50%, -125%)",
            }}
          >
            <div className="rounded-xl bg-[#0f121a]/95 backdrop-blur-xl border border-zinc-700/80 px-3 py-2 text-white shadow-2xl space-y-0.5 text-center min-w-[110px]">
              <div className="text-[10px] text-zinc-400 font-semibold">{hoveredPoint.point.date}</div>
              <div className="text-sm font-black text-white flex items-center justify-center gap-1">
                <span>{hoveredPoint.point.value}</span>
                <span className="text-[11px] font-normal text-zinc-400">{unit}</span>
              </div>
              {targetValue > 0 && (
                <div className="text-[10px] font-bold">
                  {hoveredPoint.point.value >= targetValue ? (
                    <span className="text-emerald-400">✓ Target Reached</span>
                  ) : (
                    <span className="text-amber-400">
                      {targetValue - hoveredPoint.point.value} {unit} to target
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
