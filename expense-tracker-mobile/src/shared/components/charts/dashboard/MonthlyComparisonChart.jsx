import React, { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, ReferenceLine, XAxis, YAxis } from "recharts";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/shared/components/app-shadcn";
import { Card, CardContent, CardDescription, CardTitle } from "@/shared/components/app-shadcn";
import { Button } from "@/shared/components/app-shadcn";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function buildMonthGrid(data, year) {
  const lookup = {};
  data.forEach((row) => {
    const key = row.label || row._sortKey || "";
    if (key.startsWith(String(year))) {
      lookup[key] = row;
    }
  });

  return MONTH_LABELS.map((month, idx) => {
    const key = `${year}-${String(idx + 1).padStart(2, "0")}`;
    const match = lookup[key];
    return {
      month,
      total: match?.total ?? 0,
      average: match?.average ?? 0,
    };
  });
}

function getAvailableYears(data) {
  const years = new Set();
  data.forEach((row) => {
    const key = row.label || row._sortKey || "";
    const year = parseInt(key.slice(0, 4), 10);
    if (!isNaN(year)) years.add(year);
  });
  return Array.from(years).sort();
}

const chartConfig = {
  total: { label: "Total", color: "hsl(var(--primary))" },
  average: { label: "Average", color: "hsl(var(--muted-foreground))" },
};

export function MonthlyComparisonChart({ data }) {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  const availableYears = useMemo(() => getAvailableYears(data), [data]);

  const [selectedYear, setSelectedYear] = useState(() => {
    if (availableYears.includes(currentYear)) return currentYear;
    return availableYears.length > 0 ? availableYears[availableYears.length - 1] : currentYear;
  });

  const chartData = useMemo(() => buildMonthGrid(data, selectedYear), [data, selectedYear]);

  const avgValue = useMemo(() => {
    const withData = chartData.filter((d) => d.total > 0);
    if (withData.length === 0) return 0;
    return Math.round(withData.reduce((s, d) => s + d.total, 0) / withData.length);
  }, [chartData]);

  const canGoPrev = availableYears.length > 0 && selectedYear > availableYears[0];
  const canGoNext =
    availableYears.length > 0 && selectedYear < availableYears[availableYears.length - 1];

  return (
    <Card className="flex h-full min-h-0 flex-col">
      <div className="flex items-center justify-between p-4 pb-2 md:p-6 md:pb-2">
        <div className="min-w-0">
          <CardTitle className="text-base">{t("dashboard.monthlyComparison")}</CardTitle>
          <CardDescription>{t("dashboard.monthlyTotalsVsAverage")}</CardDescription>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7 cursor-pointer"
            disabled={!canGoPrev}
            onClick={() => setSelectedYear((y) => y - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="min-w-[3.5rem] text-center text-sm font-semibold tabular-nums">
            {selectedYear}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7 cursor-pointer"
            disabled={!canGoNext}
            onClick={() => setSelectedYear((y) => y + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <CardContent className="flex min-h-0 flex-1 flex-col px-2 pb-4 pt-0 md:px-4">
        <ChartContainer config={chartConfig} className="aspect-auto h-[420px] w-full">
          <BarChart
            data={chartData}
            margin={{ top: 8, right: 8, left: -12, bottom: 0 }}
            accessibilityLayer
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/40" />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              className="text-xs"
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={4}
              tickFormatter={(v) => (v >= 1000 ? `${Math.round(v / 1000)}k` : String(v))}
              className="text-xs"
            />
            <ChartTooltip
              cursor={{ fill: "hsl(var(--muted))", radius: 4 }}
              content={<ChartTooltipContent />}
            />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            {avgValue > 0 && (
              <ReferenceLine
                y={avgValue}
                stroke="hsl(var(--muted-foreground))"
                strokeDasharray="4 4"
                strokeWidth={2}
                label={{
                  value: `Avg`,
                  position: "insideTopRight",
                  className: "fill-muted-foreground text-[10px]",
                }}
              />
            )}
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
