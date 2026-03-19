import React from "react";
import { AreaChart, Area, CartesianGrid, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { MaskedChartTooltipContent } from "./MaskedChartTooltip";
import { ChartEmptyState } from "./ChartEmptyState";
import { CHART_HEIGHTS, AXIS_CONFIG, CHART_ANIMATION } from "@/config/chartConfig";
import { cn } from "@/lib/utils";

export function AppAreaChart({
  data,
  config,
  dataKeys = [],
  xAxisKey = "date",
  height = CHART_HEIGHTS.default,
  className,
  showTooltip = true,
  showLegend = false,
  gradientFill = true,
  stacked = false,
  children,
}) {
  if (!data?.length) return <ChartEmptyState />;

  return (
    <ChartContainer config={config} className={cn("w-full", className)} style={{ height }}>
      <AreaChart data={data} accessibilityLayer>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey={xAxisKey} {...AXIS_CONFIG} tickFormatter={(v) => typeof v === "string" && v.length > 5 ? v.slice(5) : v} />
        <YAxis {...AXIS_CONFIG} tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v} />
        {showTooltip && <ChartTooltip content={<MaskedChartTooltipContent indicator="line" />} />}
        {showLegend && <ChartLegend content={<ChartLegendContent />} />}
        {gradientFill && (
          <defs>
            {dataKeys.map((key) => (
              <linearGradient key={`grad-${key}`} id={`fill-${key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={`var(--color-${key})`} stopOpacity={0.3} />
                <stop offset="95%" stopColor={`var(--color-${key})`} stopOpacity={0.05} />
              </linearGradient>
            ))}
          </defs>
        )}
        {dataKeys.map((key) => (
          <Area
            key={key}
            dataKey={key}
            type="monotone"
            fill={gradientFill ? `url(#fill-${key})` : `var(--color-${key})`}
            stroke={`var(--color-${key})`}
            strokeWidth={2}
            stackId={stacked ? "stack" : undefined}
            animationDuration={CHART_ANIMATION.duration}
          />
        ))}
        {children}
      </AreaChart>
    </ChartContainer>
  );
}
