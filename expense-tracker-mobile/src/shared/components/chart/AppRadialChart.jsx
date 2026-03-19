import React from "react";
import { RadialBarChart, RadialBar, PolarAngleAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { ChartEmptyState } from "./ChartEmptyState";
import { CHART_HEIGHTS, CHART_ANIMATION } from "@/config/chartConfig";
import { cn } from "@/lib/utils";

export function AppRadialChart({
  data,
  config,
  dataKey = "percentage",
  height = CHART_HEIGHTS.compact,
  className,
  showTooltip = true,
  innerRadius = 80,
  outerRadius = 110,
  startAngle = 90,
  endAngle = -270,
  showLabel = true,
  children,
}) {
  if (!data?.length) return <ChartEmptyState />;

  return (
    <ChartContainer config={config} className={cn("w-full", className)} style={{ height }}>
      <RadialBarChart
        data={data}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        accessibilityLayer
      >
        <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
        {showTooltip && <ChartTooltip content={<ChartTooltipContent />} />}
        <RadialBar
          dataKey={dataKey}
          background
          cornerRadius={10}
          animationDuration={CHART_ANIMATION.duration}
        />
        {showLabel && data[0] && (
          <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="fill-foreground text-2xl font-bold">
            {data[0][dataKey]}%
          </text>
        )}
        {children}
      </RadialBarChart>
    </ChartContainer>
  );
}
