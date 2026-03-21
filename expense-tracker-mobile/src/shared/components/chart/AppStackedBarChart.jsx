import React from "react";
import { BarChart, Bar, CartesianGrid, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { MaskedChartTooltipContent } from "./MaskedChartTooltip";
import { ChartEmptyState } from "./ChartEmptyState";
import { CHART_HEIGHTS, AXIS_CONFIG, CHART_ANIMATION } from "@/config/chart/chartConfig";
import { cn } from "@/lib/utils";

export function AppStackedBarChart({
  data,
  config,
  dataKeys = [],
  xAxisKey = "label",
  height = CHART_HEIGHTS.default,
  className,
  showTooltip = true,
  showLegend = true,
  barRadius = 4,
  children,
}) {
  if (!data?.length) return <ChartEmptyState height={height} className={className} />;

  return (
    <ChartContainer config={config} className={cn("w-full", className)} style={{ height }}>
      <BarChart data={data} accessibilityLayer>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey={xAxisKey} {...AXIS_CONFIG} />
        <YAxis {...AXIS_CONFIG} tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v} />
        {showTooltip && <ChartTooltip content={<MaskedChartTooltipContent />} />}
        {showLegend && <ChartLegend content={<ChartLegendContent />} />}
        {dataKeys.map((key, i) => (
          <Bar
            key={key}
            dataKey={key}
            fill={`var(--color-${key})`}
            stackId="stack"
            radius={i === dataKeys.length - 1 ? [barRadius, barRadius, 0, 0] : 0}
            animationDuration={CHART_ANIMATION.duration}
          />
        ))}
        {children}
      </BarChart>
    </ChartContainer>
  );
}
