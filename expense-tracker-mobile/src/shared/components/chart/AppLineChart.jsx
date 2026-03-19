import React from "react";
import { LineChart, Line, CartesianGrid, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { ChartEmptyState } from "./ChartEmptyState";
import { CHART_HEIGHTS, AXIS_CONFIG, CHART_ANIMATION } from "@/config/chartConfig";
import { cn } from "@/lib/utils";

export function AppLineChart({
  data,
  config,
  dataKeys = [],
  xAxisKey = "date",
  height = CHART_HEIGHTS.default,
  className,
  showTooltip = true,
  showLegend = false,
  showDots = false,
  curved = true,
  children,
}) {
  if (!data?.length) return <ChartEmptyState />;

  return (
    <ChartContainer config={config} className={cn("w-full", className)} style={{ height }}>
      <LineChart data={data} accessibilityLayer>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey={xAxisKey} {...AXIS_CONFIG} />
        <YAxis {...AXIS_CONFIG} tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v} />
        {showTooltip && <ChartTooltip content={<ChartTooltipContent />} />}
        {showLegend && <ChartLegend content={<ChartLegendContent />} />}
        {dataKeys.map((key) => (
          <Line
            key={key}
            dataKey={key}
            type={curved ? "monotone" : "linear"}
            stroke={`var(--color-${key})`}
            strokeWidth={2}
            dot={showDots}
            activeDot={{ r: 5 }}
            animationDuration={CHART_ANIMATION.duration}
          />
        ))}
        {children}
      </LineChart>
    </ChartContainer>
  );
}
