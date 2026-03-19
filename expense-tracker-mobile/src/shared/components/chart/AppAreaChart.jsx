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
  customTooltip,
  showLegend = false,
  gradientFill = true,
  stacked = false,
  connectNulls = true,
  children,
}) {
  if (!data?.length) return <ChartEmptyState />;

  return (
    <ChartContainer config={config} className={cn("w-full !aspect-auto", className)} style={{ height }}>
      <AreaChart data={data} accessibilityLayer>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey={xAxisKey}
          {...AXIS_CONFIG}
          tickFormatter={(v) => {
            if (typeof v !== "string") return v;
            if (v.length === 10) return v.slice(5);
            if (v.length === 7) return v.slice(2);
            return v;
          }}
        />
        <YAxis {...AXIS_CONFIG} tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v} />
        {showTooltip && (
          <ChartTooltip
            content={customTooltip || <MaskedChartTooltipContent indicator="line" />}
            allowEscapeViewBox={{ x: true, y: true }}
            wrapperStyle={{ zIndex: 9999, pointerEvents: "none", overflow: "visible" }}
          />
        )}
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
            connectNulls={connectNulls}
            dot={{ r: 3, fill: `var(--color-${key})`, strokeWidth: 0 }}
            activeDot={{ r: 5, strokeWidth: 2, stroke: "hsl(var(--background))" }}
            animationDuration={CHART_ANIMATION.duration}
          />
        ))}
        {children}
      </AreaChart>
    </ChartContainer>
  );
}
