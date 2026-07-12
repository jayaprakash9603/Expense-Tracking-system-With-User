import React from "react";
import { PieChart, Pie, Cell, Legend } from "recharts";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { MaskedChartTooltipContent } from "./MaskedChartTooltip";
import { ChartEmptyState } from "./ChartEmptyState";
import { CHART_HEIGHTS, CHART_ANIMATION } from "@/config/chart/chartConfig";
import { cn } from "@/lib/utils";

function PieLegend({ payload }) {
  if (!payload?.length) return null;
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 px-2 pt-2">
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-1.5 text-xs">
          <span
            className="inline-block h-2.5 w-2.5 shrink-0 rounded-[2px]"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-muted-foreground whitespace-nowrap">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

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
  if (!data?.length) return <ChartEmptyState height={height} className={className} />;

  const computedInner = donut ? (innerRadius || 60) : (innerRadius || 0);
  const computedOuter = outerRadius || 100;

  return (
    <ChartContainer
      config={config}
      className={cn("w-full !aspect-auto", className)}
      style={{ height }}
    >
      <PieChart>
        {showTooltip && (
          <ChartTooltip content={<MaskedChartTooltipContent nameKey={nameKey} hideLabel />} />
        )}
        <Pie
          data={data}
          dataKey={dataKey}
          nameKey={nameKey}
          cx="50%"
          cy="45%"
          innerRadius={computedInner}
          outerRadius={computedOuter}
          paddingAngle={2}
          label={label}
          animationDuration={CHART_ANIMATION.duration}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Pie>
        {showLegend && (
          <Legend
            content={<PieLegend />}
            verticalAlign="bottom"
            wrapperStyle={{ paddingTop: 8 }}
          />
        )}
        {children}
      </PieChart>
    </ChartContainer>
  );
}
