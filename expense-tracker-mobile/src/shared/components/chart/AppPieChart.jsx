import React from "react";
import { PieChart, Pie, Cell } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { ChartEmptyState } from "./ChartEmptyState";
import { CHART_HEIGHTS, CHART_ANIMATION } from "@/config/chartConfig";
import { cn } from "@/lib/utils";

export function AppPieChart({
  data,
  config,
  dataKey = "value",
  nameKey = "name",
  height = CHART_HEIGHTS.default,
  className,
  showTooltip = true,
  showLegend = true,
  donut = false,
  innerRadius,
  outerRadius,
  label = false,
  children,
}) {
  if (!data?.length) return <ChartEmptyState />;

  const computedInner = donut ? (innerRadius || 60) : (innerRadius || 0);
  const computedOuter = outerRadius || 100;

  return (
    <ChartContainer config={config} className={cn("w-full", className)} style={{ height }}>
      <PieChart accessibilityLayer>
        {showTooltip && <ChartTooltip content={<ChartTooltipContent nameKey={nameKey} hideLabel />} />}
        {showLegend && <ChartLegend content={<ChartLegendContent nameKey={nameKey} />} />}
        <Pie
          data={data}
          dataKey={dataKey}
          nameKey={nameKey}
          innerRadius={computedInner}
          outerRadius={computedOuter}
          paddingAngle={2}
          label={label}
          animationDuration={CHART_ANIMATION.duration}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill || `var(--color-${entry[nameKey]})`} />
          ))}
        </Pie>
        {children}
      </PieChart>
    </ChartContainer>
  );
}
