import React from "react";
import { ComposedChart, Bar, Line, Area, CartesianGrid, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { MaskedChartTooltipContent } from "./MaskedChartTooltip";
import { ChartEmptyState } from "./ChartEmptyState";
import { CHART_HEIGHTS, AXIS_CONFIG, CHART_ANIMATION } from "@/config/chartConfig";
import { cn } from "@/lib/utils";

export function AppComposedChart({
  data,
  config,
  bars = [],
  lines = [],
  areas = [],
  xAxisKey = "label",
  height = CHART_HEIGHTS.default,
  className,
  showTooltip = true,
  showLegend = false,
  children,
}) {
  if (!data?.length) return <ChartEmptyState height={height} className={className} />;

  return (
    <ChartContainer config={config} className={cn("w-full !aspect-auto", className)} style={{ height }}>
      <ComposedChart data={data} accessibilityLayer>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey={xAxisKey} {...AXIS_CONFIG} />
        <YAxis {...AXIS_CONFIG} tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v} />
        {showTooltip && <ChartTooltip content={<MaskedChartTooltipContent />} />}
        {showLegend && <ChartLegend content={<ChartLegendContent />} />}
        {areas.map((key) => (
          <Area key={key} dataKey={key} type="monotone" fill={`var(--color-${key})`} stroke={`var(--color-${key})`} fillOpacity={0.2} animationDuration={CHART_ANIMATION.duration} />
        ))}
        {bars.map((key) => (
          <Bar key={key} dataKey={key} fill={`var(--color-${key})`} radius={4} animationDuration={CHART_ANIMATION.duration} />
        ))}
        {lines.map((key) => (
          <Line key={key} dataKey={key} type="monotone" stroke={`var(--color-${key})`} strokeWidth={2} dot={false} strokeDasharray="5 5" animationDuration={CHART_ANIMATION.duration} />
        ))}
        {children}
      </ComposedChart>
    </ChartContainer>
  );
}
