import React from "react";
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, ReferenceLine } from "recharts";
import { ChartContainer, ChartTooltip, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { MaskedChartTooltipContent } from "./MaskedChartTooltip";
import { ChartEmptyState } from "./ChartEmptyState";
import { CHART_HEIGHTS, AXIS_CONFIG, CHART_ANIMATION } from "@/config/chartConfig";
import { cn } from "@/lib/utils";

export function AppBarChart({
  data,
  config,
  dataKeys = [],
  xAxisKey = "label",
  height = CHART_HEIGHTS.default,
  className,
  showTooltip = true,
  showLegend = false,
  stacked = false,
  horizontal = false,
  barRadius = 4,
  referenceLine,
  chartMargin,
  xAxisProps,
  yAxisProps,
  children,
}) {
  if (!data?.length) return <ChartEmptyState height={height} className={className} />;

  const layout = horizontal ? "vertical" : "horizontal";

  return (
    <ChartContainer config={config} className={cn("w-full !aspect-auto", className)} style={{ height }}>
      <BarChart data={data} layout={layout} margin={chartMargin} accessibilityLayer>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        {horizontal ? (
          <>
            <YAxis dataKey={xAxisKey} type="category" {...AXIS_CONFIG} width={80} {...yAxisProps} />
            <XAxis type="number" {...AXIS_CONFIG} tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v} {...xAxisProps} />
          </>
        ) : (
          <>
            <XAxis dataKey={xAxisKey} {...AXIS_CONFIG} {...xAxisProps} />
            <YAxis {...AXIS_CONFIG} tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v} {...yAxisProps} />
          </>
        )}
        {showTooltip && <ChartTooltip content={<MaskedChartTooltipContent />} />}
        {showLegend && <ChartLegend content={<ChartLegendContent />} />}
        {referenceLine && (
          <ReferenceLine y={referenceLine.value} stroke={referenceLine.color || "hsl(var(--muted-foreground))"} strokeDasharray="3 3" label={referenceLine.label} />
        )}
        {dataKeys.map((key) => (
          <Bar
            key={key}
            dataKey={key}
            fill={`var(--color-${key})`}
            radius={barRadius}
            stackId={stacked ? "stack" : undefined}
            animationDuration={CHART_ANIMATION.duration}
          />
        ))}
        {children}
      </BarChart>
    </ChartContainer>
  );
}
